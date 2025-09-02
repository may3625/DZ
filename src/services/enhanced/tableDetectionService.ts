/**
 * Service de détection des tables (Étape 6 de l'algorithme)
 * Identifie les rectangles formés par l'intersection des lignes horizontales et verticales
 * Sélectionne les plus grands rectangles représentant les tables potentielles
 */

import { DetectedLine, TableRegion, CellRegion } from '../imageProcessingService';
import { ContentRegion } from './borderRemovalService';

export interface TableDetectionConfig {
  minTableWidth: number;     // Largeur minimale d'une table (pixels)
  minTableHeight: number;    // Hauteur minimale d'une table (pixels)
  minCellWidth: number;      // Largeur minimale d'une cellule (pixels)
  minCellHeight: number;     // Hauteur minimale d'une cellule (pixels)
  intersectionTolerance: number; // Tolérance pour détecter intersections
  confidenceThreshold: number;   // Seuil de confiance minimum
}

export interface LineIntersection {
  x: number;
  y: number;
  horizontalLine: DetectedLine;
  verticalLine: DetectedLine;
  confidence: number;
}

export interface TableCandidate {
  bounds: { x: number, y: number, width: number, height: number };
  intersections: LineIntersection[];
  horizontalLines: DetectedLine[];
  verticalLines: DetectedLine[];
  confidence: number;
  cellCount: { rows: number, cols: number };
}

export interface TableDetectionResult {
  detectedTables: TableRegion[];
  candidates: TableCandidate[];
  intersections: LineIntersection[];
  processingTime: number;
  confidence: number;
}

class TableDetectionService {
  private readonly DEFAULT_CONFIG: TableDetectionConfig = {
    minTableWidth: 100,
    minTableHeight: 50,
    minCellWidth: 30,
    minCellHeight: 20,
    intersectionTolerance: 5,
    confidenceThreshold: 0.6
  };

  /**
   * Étape 6 : Détecter les tables par intersection des lignes
   * Forme des rectangles représentant les contours des tables
   */
  detectTables(
    horizontalLines: DetectedLine[],
    verticalLines: DetectedLine[],
    contentRegion: ContentRegion,
    config: Partial<TableDetectionConfig> = {}
  ): TableDetectionResult {
    
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = performance.now();

    console.log('📊 Starting table detection...');
    console.log(`📐 Lines to analyze: ${horizontalLines.length} horizontal, ${verticalLines.length} vertical`);

    try {
      // Étape 1 : Trouver toutes les intersections entre lignes
      console.log('🔍 Finding line intersections...');
      const intersections = this.findLineIntersections(
        horizontalLines, 
        verticalLines, 
        contentRegion, 
        mergedConfig
      );

      // Étape 2 : Grouper les intersections pour former des rectangles de tables
      console.log('📦 Grouping intersections into table candidates...');
      const candidates = this.groupIntersectionsIntoTables(
        intersections, 
        horizontalLines, 
        verticalLines, 
        contentRegion, 
        mergedConfig
      );

      // Étape 3 : Sélectionner les meilleurs candidats (plus grands rectangles)
      console.log('🎯 Selecting best table candidates...');
      const selectedTables = this.selectBestTableCandidates(candidates, mergedConfig);

      // Étape 4 : Créer les structures TableRegion finales
      const detectedTables = this.createTableRegions(selectedTables, mergedConfig);

      const processingTime = performance.now() - startTime;

      console.log(`✅ Table detection completed: ${detectedTables.length} tables found in ${processingTime.toFixed(2)}ms`);

      return {
        detectedTables,
        candidates,
        intersections,
        processingTime,
        confidence: this.calculateDetectionConfidence(detectedTables, candidates)
      };

    } catch (error) {
      console.error('❌ Table detection failed:', error);
      throw new Error(`Table detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Trouve toutes les intersections entre lignes horizontales et verticales
   */
  private findLineIntersections(
    horizontalLines: DetectedLine[],
    verticalLines: DetectedLine[],
    contentRegion: ContentRegion,
    config: TableDetectionConfig
  ): LineIntersection[] {
    
    const intersections: LineIntersection[] = [];
    const tolerance = config.intersectionTolerance;

    for (const hLine of horizontalLines) {
      for (const vLine of verticalLines) {
        const intersection = this.calculateIntersection(hLine, vLine, tolerance);
        
        if (intersection && this.isIntersectionInContentRegion(intersection, contentRegion)) {
          intersections.push({
            x: intersection.x,
            y: intersection.y,
            horizontalLine: hLine,
            verticalLine: vLine,
            confidence: this.calculateIntersectionConfidence(hLine, vLine, intersection)
          });
        }
      }
    }

    console.log(`🔗 Found ${intersections.length} valid line intersections`);
    return intersections;
  }

  /**
   * Calcule l'intersection entre une ligne horizontale et une ligne verticale
   */
  private calculateIntersection(
    hLine: DetectedLine,
    vLine: DetectedLine,
    tolerance: number
  ): { x: number, y: number } | null {
    
    // Vérifier si les lignes se croisent réellement
    const hLineY = hLine.y1;
    const vLineX = vLine.x1;

    // Vérifier si la ligne horizontale passe dans la zone Y de la verticale
    const vLineInHRange = 
      vLine.y1 <= hLineY + tolerance && 
      vLine.y2 >= hLineY - tolerance;

    // Vérifier si la ligne verticale passe dans la zone X de l'horizontale
    const hLineInVRange = 
      hLine.x1 <= vLineX + tolerance && 
      hLine.x2 >= vLineX - tolerance;

    if (vLineInHRange && hLineInVRange) {
      return { x: vLineX, y: hLineY };
    }

    return null;
  }

  /**
   * Vérifie si une intersection est dans la région de contenu
   */
  private isIntersectionInContentRegion(
    intersection: { x: number, y: number },
    contentRegion: ContentRegion
  ): boolean {
    return intersection.x >= contentRegion.contentX &&
           intersection.x <= contentRegion.contentX + contentRegion.contentWidth &&
           intersection.y >= contentRegion.contentY &&
           intersection.y <= contentRegion.contentY + contentRegion.contentHeight;
  }

  /**
   * Groupe les intersections pour former des candidats de tables
   */
  private groupIntersectionsIntoTables(
    intersections: LineIntersection[],
    horizontalLines: DetectedLine[],
    verticalLines: DetectedLine[],
    contentRegion: ContentRegion,
    config: TableDetectionConfig
  ): TableCandidate[] {
    
    const candidates: TableCandidate[] = [];

    // Grouper les intersections par proximité
    const clusters = this.clusterIntersections(intersections, config);

    for (const cluster of clusters) {
      const candidate = this.createTableCandidateFromCluster(
        cluster, 
        horizontalLines, 
        verticalLines, 
        config
      );

      if (candidate && this.isValidTableCandidate(candidate, config)) {
        candidates.push(candidate);
      }
    }

    console.log(`📋 Created ${candidates.length} table candidates from ${intersections.length} intersections`);
    return candidates;
  }

  /**
   * Regroupe les intersections proches en clusters
   */
  private clusterIntersections(
    intersections: LineIntersection[],
    config: TableDetectionConfig
  ): LineIntersection[][] {
    
    const clusters: LineIntersection[][] = [];
    const processed = new Set<number>();
    const clusterDistance = Math.max(config.minCellWidth, config.minCellHeight);

    for (let i = 0; i < intersections.length; i++) {
      if (processed.has(i)) continue;

      const cluster = [intersections[i]];
      processed.add(i);

      // Trouver toutes les intersections proches
      for (let j = i + 1; j < intersections.length; j++) {
        if (processed.has(j)) continue;

        const distance = this.calculateDistance(intersections[i], intersections[j]);
        if (distance <= clusterDistance * 3) { // Cluster si dans une zone raisonnable
          cluster.push(intersections[j]);
          processed.add(j);
        }
      }

      if (cluster.length >= 4) { // Au minimum 4 points pour former un rectangle
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  /**
   * Crée un candidat de table à partir d'un cluster d'intersections
   */
  private createTableCandidateFromCluster(
    cluster: LineIntersection[],
    horizontalLines: DetectedLine[],
    verticalLines: DetectedLine[],
    config: TableDetectionConfig
  ): TableCandidate | null {
    
    if (cluster.length < 4) return null;

    // Calculer les bornes du rectangle englobant
    const minX = Math.min(...cluster.map(i => i.x));
    const maxX = Math.max(...cluster.map(i => i.x));
    const minY = Math.min(...cluster.map(i => i.y));
    const maxY = Math.max(...cluster.map(i => i.y));

    const bounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };

    // Identifier les lignes qui composent cette table
    const tableHorizontalLines = this.getTableLines(horizontalLines, bounds, 'horizontal');
    const tableVerticalLines = this.getTableLines(verticalLines, bounds, 'vertical');

    // Calculer le nombre de cellules approximatif
    const cellCount = {
      rows: tableHorizontalLines.length > 1 ? tableHorizontalLines.length - 1 : 1,
      cols: tableVerticalLines.length > 1 ? tableVerticalLines.length - 1 : 1
    };

    // Calculer la confiance
    const confidence = this.calculateTableConfidence(
      cluster, 
      tableHorizontalLines, 
      tableVerticalLines, 
      bounds
    );

    return {
      bounds,
      intersections: cluster,
      horizontalLines: tableHorizontalLines,
      verticalLines: tableVerticalLines,
      confidence,
      cellCount
    };
  }

  /**
   * Sélectionne les meilleurs candidats de tables
   */
  private selectBestTableCandidates(
    candidates: TableCandidate[],
    config: TableDetectionConfig
  ): TableCandidate[] {
    
    // Filtrer par taille minimale et confiance
    const validCandidates = candidates.filter(candidate => 
      candidate.bounds.width >= config.minTableWidth &&
      candidate.bounds.height >= config.minTableHeight &&
      candidate.confidence >= config.confidenceThreshold
    );

    // Trier par confiance et taille (favoriser les plus grandes tables)
    const sortedCandidates = validCandidates.sort((a, b) => {
      const aScore = a.confidence * 0.6 + (a.bounds.width * a.bounds.height / 10000) * 0.4;
      const bScore = b.confidence * 0.6 + (b.bounds.width * b.bounds.height / 10000) * 0.4;
      return bScore - aScore;
    });

    // Éviter les chevauchements importants
    const selected = this.removeOverlappingTables(sortedCandidates);

    console.log(`🎯 Selected ${selected.length} best table candidates from ${candidates.length} total`);
    return selected;
  }

  /**
   * Crée les structures TableRegion finales avec détection des cellules
   */
  private createTableRegions(
    candidates: TableCandidate[],
    config: TableDetectionConfig
  ): TableRegion[] {
    
    const tables: TableRegion[] = [];

    for (const candidate of candidates) {
      console.log(`🔧 Creating table region: ${candidate.bounds.width}x${candidate.bounds.height}`);

      // Détecter les cellules individuelles
      const cells = this.detectTableCells(candidate, config);

      const table: TableRegion = {
        x: candidate.bounds.x,
        y: candidate.bounds.y,
        width: candidate.bounds.width,
        height: candidate.bounds.height,
        rows: cells.length,
        cols: cells[0]?.length || 0,
        type: 'table',
        confidence: candidate.confidence,
        cells
      };

      tables.push(table);
    }

    return tables;
  }

  /**
   * Détecte les cellules individuelles dans une table
   */
  private detectTableCells(
    candidate: TableCandidate,
    config: TableDetectionConfig
  ): CellRegion[][] {
    
    const cells: CellRegion[][] = [];

    // Trier les lignes par position
    const sortedHLines = candidate.horizontalLines.sort((a, b) => a.y1 - b.y1);
    const sortedVLines = candidate.verticalLines.sort((a, b) => a.x1 - b.x1);

    // Créer la grille de cellules
    for (let row = 0; row < sortedHLines.length - 1; row++) {
      const cellRow: CellRegion[] = [];
      
      for (let col = 0; col < sortedVLines.length - 1; col++) {
        const cell: CellRegion = {
          x: sortedVLines[col].x1,
          y: sortedHLines[row].y1,
          width: sortedVLines[col + 1].x1 - sortedVLines[col].x1,
          height: sortedHLines[row + 1].y1 - sortedHLines[row].y1,
          row: row,
          col: col,
          colspan: 1,
          rowspan: 1
        };

        // Filtrer les cellules trop petites
        if (cell.width >= config.minCellWidth && cell.height >= config.minCellHeight) {
          cellRow.push(cell);
        }
      }
      
      if (cellRow.length > 0) {
        cells.push(cellRow);
      }
    }

    console.log(`📋 Detected ${cells.length} rows with ${cells[0]?.length || 0} columns average`);
    return cells;
  }

  // Méthodes utilitaires

  private calculateDistance(
    point1: { x: number, y: number },
    point2: { x: number, y: number }
  ): number {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }

  private calculateIntersectionConfidence(
    hLine: DetectedLine,
    vLine: DetectedLine,
    intersection: { x: number, y: number }
  ): number {
    // Confiance basée sur la confiance des lignes et la précision de l'intersection
    const lineConfidence = (hLine.confidence + vLine.confidence) / 2;
    return lineConfidence;
  }

  private getTableLines(
    lines: DetectedLine[],
    bounds: { x: number, y: number, width: number, height: number },
    type: 'horizontal' | 'vertical'
  ): DetectedLine[] {
    return lines.filter(line => {
      if (type === 'horizontal') {
        return line.y1 >= bounds.y && 
               line.y1 <= bounds.y + bounds.height &&
               line.x1 <= bounds.x + bounds.width &&
               line.x2 >= bounds.x;
      } else {
        return line.x1 >= bounds.x && 
               line.x1 <= bounds.x + bounds.width &&
               line.y1 <= bounds.y + bounds.height &&
               line.y2 >= bounds.y;
      }
    });
  }

  private calculateTableConfidence(
    intersections: LineIntersection[],
    hLines: DetectedLine[],
    vLines: DetectedLine[],
    bounds: { x: number, y: number, width: number, height: number }
  ): number {
    // Confiance basée sur le nombre d'intersections et la régularité de la grille
    const intersectionDensity = intersections.length / ((bounds.width / 50) * (bounds.height / 50));
    const avgIntersectionConfidence = intersections.reduce((sum, i) => sum + i.confidence, 0) / intersections.length;
    const gridRegularity = this.calculateGridRegularity(hLines, vLines);
    
    return (intersectionDensity * 0.3 + avgIntersectionConfidence * 0.4 + gridRegularity * 0.3);
  }

  private calculateGridRegularity(hLines: DetectedLine[], vLines: DetectedLine[]): number {
    // Calculer la régularité de l'espacement des lignes
    // Implémentation simplifiée
    return 0.8;
  }

  private isValidTableCandidate(candidate: TableCandidate, config: TableDetectionConfig): boolean {
    return candidate.bounds.width >= config.minTableWidth &&
           candidate.bounds.height >= config.minTableHeight &&
           candidate.cellCount.rows >= 2 &&
           candidate.cellCount.cols >= 2;
  }

  private removeOverlappingTables(candidates: TableCandidate[]): TableCandidate[] {
    const selected: TableCandidate[] = [];
    
    for (const candidate of candidates) {
      const hasOverlap = selected.some(existing => 
        this.calculateOverlapRatio(candidate.bounds, existing.bounds) > 0.5
      );
      
      if (!hasOverlap) {
        selected.push(candidate);
      }
    }
    
    return selected;
  }

  private calculateOverlapRatio(
    rect1: { x: number, y: number, width: number, height: number },
    rect2: { x: number, y: number, width: number, height: number }
  ): number {
    const overlapX = Math.max(0, Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - Math.max(rect1.x, rect2.x));
    const overlapY = Math.max(0, Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - Math.max(rect1.y, rect2.y));
    const overlapArea = overlapX * overlapY;
    const area1 = rect1.width * rect1.height;
    const area2 = rect2.width * rect2.height;
    const unionArea = area1 + area2 - overlapArea;
    
    return unionArea > 0 ? overlapArea / unionArea : 0;
  }

  private calculateDetectionConfidence(
    detectedTables: TableRegion[],
    candidates: TableCandidate[]
  ): number {
    if (candidates.length === 0) return 0;
    
    const avgCandidateConfidence = candidates.reduce((sum, c) => sum + c.confidence, 0) / candidates.length;
    const selectionRatio = detectedTables.length / candidates.length;
    
    return (avgCandidateConfidence * 0.7) + (selectionRatio * 0.3);
  }
}

export const tableDetectionService = new TableDetectionService();
export default tableDetectionService;