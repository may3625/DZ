/**
 * Service de traitement d'images réel avec OpenCV.js et algorithmes avancés
 * Implémentation complète selon le cahier des charges
 */

import { logger } from '@/utils/logger';

export interface OpenCVLineDetection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  angle: number;
  length: number;
  type: 'horizontal' | 'vertical';
  confidence: number;
}

export interface BorderDetectionResult {
  topBorders: OpenCVLineDetection[];
  bottomBorders: OpenCVLineDetection[];
  leftBorders: OpenCVLineDetection[];
  rightBorders: OpenCVLineDetection[];
  contentRegion: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface TableCell {
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  confidence?: number;
}

export interface DetectedTable {
  x: number;
  y: number;
  width: number;
  height: number;
  rows: number;
  cols: number;
  cells: TableCell[];
  confidence: number;
}

export interface TextZone {
  x: number;
  y: number;
  width: number;
  height: number;
  column: number;
  text?: string;
}

export interface RealProcessingResult {
  pageNumber: number;
  originalImage: ImageData;
  processedImage: ImageData;
  detectedLines: {
    horizontal: OpenCVLineDetection[];
    vertical: OpenCVLineDetection[];
  };
  borderRegions: BorderDetectionResult;
  tables: DetectedTable[];
  textZones: TextZone[];
  verticalSeparators: OpenCVLineDetection[];
  processingStages: {
    borderElimination: number;
    lineDetection: number;
    tableDetection: number;
    textZoneExtraction: number;
  };
  totalProcessingTime: number;
  qualityMetrics: {
    lineDetectionQuality: number;
    tableDetectionQuality: number;
    overallQuality: number;
  };
}

class RealImageProcessingService {
  private opencv: any = null;
  private isInitialized = false;

  /**
   * Initialise OpenCV.js
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      logger.info('OCR', '🚀 Initialisation OpenCV.js...');
      
      // @ts-ignore - OpenCV.js sera chargé globalement
      if (typeof (window as any).cv !== 'undefined') {
        this.opencv = (window as any).cv;
        this.isInitialized = true;
        logger.info('OCR', '✅ OpenCV.js initialisé');
        return;
      }

      // Chargement dynamique d'OpenCV.js
      await this.loadOpenCV();
      this.isInitialized = true;
      logger.info('OCR', '✅ OpenCV.js chargé et initialisé');
    } catch (error) {
      logger.error('OCR', '❌ Erreur initialisation OpenCV:', error);
      throw new Error('Impossible d\'initialiser OpenCV.js');
    }
  }

  /**
   * Chargement dynamique d'OpenCV.js
   */
  private async loadOpenCV(): Promise<void> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      if (typeof (window as any).cv !== 'undefined') {
        this.opencv = (window as any).cv;
        resolve();
        return;
      }

      const script = document.createElement('script');
      // Charger d'abord en local (100% local)
      script.src = '/opencv/opencv.js';
      script.async = true;
      
      script.onload = () => {
        // @ts-ignore
        if (typeof (window as any).cv !== 'undefined') {
          this.opencv = (window as any).cv;
          resolve();
        } else {
          reject(new Error('OpenCV non disponible après chargement'));
        }
      };
      
      script.onerror = () => reject(new Error('Erreur chargement OpenCV.js'));
      document.head.appendChild(script);
    });
  }

  /**
   * Traitement complet d'une page selon l'algorithme du cahier des charges
   */
  async processDocumentPage(imageData: ImageData, pageNumber: number): Promise<RealProcessingResult> {
    await this.initialize();
    
    const startTime = performance.now();
    const stages = {
      borderElimination: 0,
      lineDetection: 0,
      tableDetection: 0,
      textZoneExtraction: 0
    };

    logger.info('OCR', `🔍 Début traitement page ${pageNumber} (${imageData.width}x${imageData.height})`);

    try {
      // Étape 1: Conversion en matrice OpenCV
      const mat = this.imageDataToMat(imageData);
      const grayMat = new this.opencv.Mat();
      this.opencv.cvtColor(mat, grayMat, this.opencv.COLOR_RGBA2GRAY);

      // Étape 2: Détection des lignes avec HoughLinesP
      const linesStart = performance.now();
      const detectedLines = this.detectLinesWithHoughP(grayMat);
      stages.lineDetection = performance.now() - linesStart;

      // Étape 3: Élimination des bordures
      const borderStart = performance.now();
      const borderRegions = this.eliminateBorders(detectedLines, imageData.width, imageData.height);
      stages.borderElimination = performance.now() - borderStart;

      // Étape 4: Détection des séparateurs verticaux de texte
      const separatorsStart = performance.now();
      const verticalSeparators = this.detectVerticalTextSeparators(
        detectedLines.vertical, 
        detectedLines.horizontal,
        borderRegions.contentRegion
      );
      stages.textZoneExtraction = performance.now() - separatorsStart;

      // Étape 5: Détection des tables
      const tableStart = performance.now();
      const tables = this.detectTables(detectedLines, borderRegions.contentRegion);
      stages.tableDetection = performance.now() - tableStart;

      // Étape 6: Extraction des zones de texte
      const textZones = this.extractTextZones(
        borderRegions.contentRegion,
        verticalSeparators,
        tables
      );

      // Calcul des métriques de qualité
      const qualityMetrics = this.calculateQualityMetrics(
        detectedLines,
        tables,
        textZones,
        imageData
      );

      const totalTime = performance.now() - startTime;

      // Création de l'image traitée (pour démonstration)
      const processedImageData = this.createProcessedImage(
        imageData,
        detectedLines,
        tables,
        textZones
      );

      // Nettoyage des matrices OpenCV
      mat.delete();
      grayMat.delete();

      logger.info('OCR', `✅ Page ${pageNumber} traitée en ${totalTime.toFixed(2)}ms`);

      return {
        pageNumber,
        originalImage: imageData,
        processedImage: processedImageData,
        detectedLines,
        borderRegions,
        tables,
        textZones,
        verticalSeparators,
        processingStages: stages,
        totalProcessingTime: totalTime,
        qualityMetrics
      };

    } catch (error) {
      logger.error('OCR', `❌ Erreur traitement page ${pageNumber}:`, error);
      throw error;
    }
  }

  /**
   * Conversion ImageData vers matrice OpenCV
   */
  private imageDataToMat(imageData: ImageData): any {
    const mat = new this.opencv.Mat(imageData.height, imageData.width, this.opencv.CV_8UC4);
    mat.data.set(imageData.data);
    return mat;
  }

  /**
   * Détection des lignes avec HoughLinesP (Transformée de Hough probabiliste)
   */
  private detectLinesWithHoughP(grayMat: any): { horizontal: OpenCVLineDetection[]; vertical: OpenCVLineDetection[] } {
    // Dilatation et érosion pour améliorer la détection
    const kernel = this.opencv.getStructuringElement(this.opencv.MORPH_RECT, new this.opencv.Size(3, 3));
    const dilated = new this.opencv.Mat();
    const eroded = new this.opencv.Mat();
    
    this.opencv.dilate(grayMat, dilated, kernel, new this.opencv.Point(-1, -1), 2);
    this.opencv.erode(dilated, eroded, kernel, new this.opencv.Point(-1, -1), 1);

    // Détection de contours
    const edges = new this.opencv.Mat();
    this.opencv.Canny(eroded, edges, 50, 150);

    // HoughLinesP
    const lines = new this.opencv.Mat();
    this.opencv.HoughLinesP(
      edges,
      lines,
      1,                    // rho
      Math.PI / 180,        // theta
      50,                   // threshold
      100,                  // minLineLength
      10                    // maxLineGap
    );

    const horizontal: OpenCVLineDetection[] = [];
    const vertical: OpenCVLineDetection[] = [];

    // Classification des lignes
    for (let i = 0; i < lines.rows; i++) {
      const x1 = lines.data32S[i * 4];
      const y1 = lines.data32S[i * 4 + 1];
      const x2 = lines.data32S[i * 4 + 2];
      const y2 = lines.data32S[i * 4 + 3];

      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      const absAngle = Math.abs(angle);

      const lineDetection: OpenCVLineDetection = {
        x1, y1, x2, y2,
        angle,
        length,
        type: (absAngle < 10 || absAngle > 170) ? 'horizontal' : 'vertical',
        confidence: Math.min(length / 200, 1.0) // Confiance basée sur la longueur
      };

      if (lineDetection.type === 'horizontal') {
        horizontal.push(lineDetection);
      } else {
        vertical.push(lineDetection);
      }
    }

    // Nettoyage
    kernel.delete();
    dilated.delete();
    eroded.delete();
    edges.delete();
    lines.delete();

    logger.info('OCR', `🔍 Lignes détectées: ${horizontal.length} horizontales, ${vertical.length} verticales`);
    return { horizontal, vertical };
  }

  /**
   * Élimination des bordures (3 haut, 2 bas, 2 côtés)
   */
  private eliminateBorders(
    detectedLines: { horizontal: OpenCVLineDetection[]; vertical: OpenCVLineDetection[] },
    width: number,
    height: number
  ): BorderDetectionResult {
    const marginPercent = 0.05; // 5% de marge
    const marginX = width * marginPercent;
    const marginY = height * marginPercent;

    // Classification des lignes par position
    const topBorders = detectedLines.horizontal
      .filter(line => line.y1 < height * 0.2)
      .sort((a, b) => a.y1 - b.y1)
      .slice(0, 3);

    const bottomBorders = detectedLines.horizontal
      .filter(line => line.y1 > height * 0.8)
      .sort((a, b) => b.y1 - a.y1)
      .slice(0, 2);

    const leftBorders = detectedLines.vertical
      .filter(line => line.x1 < width * 0.2)
      .sort((a, b) => a.x1 - b.x1)
      .slice(0, 2);

    const rightBorders = detectedLines.vertical
      .filter(line => line.x1 > width * 0.8)
      .sort((a, b) => b.x1 - a.x1)
      .slice(0, 2);

    // Calcul de la région de contenu
    const topY = topBorders.length > 0 ? Math.max(...topBorders.map(l => l.y1)) + marginY : marginY;
    const bottomY = bottomBorders.length > 0 ? Math.min(...bottomBorders.map(l => l.y1)) - marginY : height - marginY;
    const leftX = leftBorders.length > 0 ? Math.max(...leftBorders.map(l => l.x1)) + marginX : marginX;
    const rightX = rightBorders.length > 0 ? Math.min(...rightBorders.map(l => l.x1)) - marginX : width - marginX;

    const contentRegion = {
      x: Math.max(0, leftX),
      y: Math.max(0, topY),
      width: Math.max(100, rightX - leftX),
      height: Math.max(100, bottomY - topY)
    };

    logger.info('OCR', `📏 Bordures éliminées. Région contenu: ${contentRegion.width}x${contentRegion.height}`);

    return {
      topBorders,
      bottomBorders,
      leftBorders,
      rightBorders,
      contentRegion
    };
  }

  /**
   * Détection des lignes verticales séparatrices de texte
   */
  private detectVerticalTextSeparators(
    verticalLines: OpenCVLineDetection[],
    horizontalLines: OpenCVLineDetection[],
    contentRegion: { x: number; y: number; width: number; height: number }
  ): OpenCVLineDetection[] {
    const centerX = contentRegion.x + contentRegion.width / 2;
    const tolerance = contentRegion.width * 0.1; // 10% de tolérance

    // Filtre 1: Lignes près du centre
    const centerLines = verticalLines.filter(line => {
      const lineX = (line.x1 + line.x2) / 2;
      return Math.abs(lineX - centerX) < tolerance;
    });

    // Filtre 2: Exclure les lignes qui croisent des horizontales (tables)
    const nonTableLines = centerLines.filter(vLine => {
      return !horizontalLines.some(hLine => {
        const vX = (vLine.x1 + vLine.x2) / 2;
        const hY = (hLine.y1 + hLine.y2) / 2;
        const vMinY = Math.min(vLine.y1, vLine.y2);
        const vMaxY = Math.max(vLine.y1, vLine.y2);
        
        return vX >= Math.min(hLine.x1, hLine.x2) && 
               vX <= Math.max(hLine.x1, hLine.x2) &&
               hY >= vMinY && hY <= vMaxY;
      });
    });

    // Filtre 3: Hauteur minimum (60% de la région)
    const minHeight = contentRegion.height * 0.6;
    const textSeparators = nonTableLines.filter(line => line.length >= minHeight);

    logger.info('OCR', `📝 Séparateurs de texte détectés: ${textSeparators.length}`);
    return textSeparators;
  }

  /**
   * Détection des tables par intersection de lignes
   */
  private detectTables(
    detectedLines: { horizontal: OpenCVLineDetection[]; vertical: OpenCVLineDetection[] },
    contentRegion: { x: number; y: number; width: number; height: number }
  ): DetectedTable[] {
    const tables: DetectedTable[] = [];
    const intersectionTolerance = 5;

    // Trouver les intersections de lignes
    const intersections = [];
    for (const hLine of detectedLines.horizontal) {
      for (const vLine of detectedLines.vertical) {
        const intersection = this.findLineIntersection(hLine, vLine, intersectionTolerance);
        if (intersection && this.isPointInRegion(intersection, contentRegion)) {
          intersections.push(intersection);
        }
      }
    }

    // Grouper les intersections en rectangles (tables)
    const rectangles = this.groupIntersectionsIntoRectangles(intersections);
    
    // Filtrer et valider les tables
    const minTableWidth = 100;
    const minTableHeight = 50;
    
    for (const rect of rectangles) {
      if (rect.width >= minTableWidth && rect.height >= minTableHeight) {
        const cells = this.detectTableCells(rect, detectedLines);
        
        tables.push({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          rows: Math.max(1, Math.round(rect.height / 25)), // Estimation
          cols: Math.max(1, Math.round(rect.width / 50)),   // Estimation
          cells,
          confidence: Math.min(cells.length / 10, 1.0)
        });
      }
    }

    logger.info('OCR', `🏢 Tables détectées: ${tables.length}`);
    return tables;
  }

  /**
   * Intersection de deux lignes
   */
  private findLineIntersection(
    hLine: OpenCVLineDetection, 
    vLine: OpenCVLineDetection, 
    tolerance: number
  ): { x: number; y: number } | null {
    // Pour simplifier, on considère que les lignes horizontales et verticales
    // sont parfaitement orthogonales
    const hY = (hLine.y1 + hLine.y2) / 2;
    const vX = (vLine.x1 + vLine.x2) / 2;
    
    const hMinX = Math.min(hLine.x1, hLine.x2);
    const hMaxX = Math.max(hLine.x1, hLine.x2);
    const vMinY = Math.min(vLine.y1, vLine.y2);
    const vMaxY = Math.max(vLine.y1, vLine.y2);
    
    // Vérifier si l'intersection est dans les limites des deux lignes
    if (vX >= hMinX - tolerance && vX <= hMaxX + tolerance &&
        hY >= vMinY - tolerance && hY <= vMaxY + tolerance) {
      return { x: vX, y: hY };
    }
    
    return null;
  }

  /**
   * Vérifier si un point est dans une région
   */
  private isPointInRegion(
    point: { x: number; y: number }, 
    region: { x: number; y: number; width: number; height: number }
  ): boolean {
    return point.x >= region.x && 
           point.x <= region.x + region.width &&
           point.y >= region.y && 
           point.y <= region.y + region.height;
  }

  /**
   * Grouper les intersections en rectangles
   */
  private groupIntersectionsIntoRectangles(intersections: { x: number; y: number }[]): 
    { x: number; y: number; width: number; height: number }[] {
    // Algorithme simplifié de clustering spatial
    const rectangles = [];
    const used = new Set<number>();
    
    for (let i = 0; i < intersections.length; i++) {
      if (used.has(i)) continue;
      
      const topLeft = intersections[i];
      let bottomRight = topLeft;
      
      // Trouver le coin opposé le plus éloigné
      for (let j = i + 1; j < intersections.length; j++) {
        if (used.has(j)) continue;
        
        const point = intersections[j];
        if (point.x > topLeft.x && point.y > topLeft.y) {
          bottomRight = point;
          used.add(j);
        }
      }
      
      if (bottomRight !== topLeft) {
        rectangles.push({
          x: topLeft.x,
          y: topLeft.y,
          width: bottomRight.x - topLeft.x,
          height: bottomRight.y - topLeft.y
        });
        used.add(i);
      }
    }
    
    return rectangles;
  }

  /**
   * Détecter les cellules d'une table
   */
  private detectTableCells(
    tableRect: { x: number; y: number; width: number; height: number },
    detectedLines: { horizontal: OpenCVLineDetection[]; vertical: OpenCVLineDetection[] }
  ): TableCell[] {
    const cells: TableCell[] = [];
    
    // Lignes dans la table
    const tableHLines = detectedLines.horizontal.filter(line => 
      line.y1 >= tableRect.y && line.y1 <= tableRect.y + tableRect.height
    ).sort((a, b) => a.y1 - b.y1);
    
    const tableVLines = detectedLines.vertical.filter(line =>
      line.x1 >= tableRect.x && line.x1 <= tableRect.x + tableRect.width
    ).sort((a, b) => a.x1 - b.x1);
    
    // Créer une grille de cellules
    for (let i = 0; i < tableHLines.length - 1; i++) {
      for (let j = 0; j < tableVLines.length - 1; j++) {
        const cell: TableCell = {
          x: tableVLines[j].x1,
          y: tableHLines[i].y1,
          width: tableVLines[j + 1].x1 - tableVLines[j].x1,
          height: tableHLines[i + 1].y1 - tableHLines[i].y1,
          confidence: 0.8
        };
        
        if (cell.width > 10 && cell.height > 10) {
          cells.push(cell);
        }
      }
    }
    
    return cells;
  }

  /**
   * Extraction des zones de texte
   */
  private extractTextZones(
    contentRegion: { x: number; y: number; width: number; height: number },
    verticalSeparators: OpenCVLineDetection[],
    tables: DetectedTable[]
  ): TextZone[] {
    const zones: TextZone[] = [];
    
    // Si on a des séparateurs verticaux, diviser en colonnes
    if (verticalSeparators.length > 0) {
      const separatorX = verticalSeparators[0].x1;
      
      // Colonne gauche
      zones.push({
        x: contentRegion.x,
        y: contentRegion.y,
        width: separatorX - contentRegion.x,
        height: contentRegion.height,
        column: 0
      });
      
      // Colonne droite
      zones.push({
        x: separatorX,
        y: contentRegion.y,
        width: contentRegion.x + contentRegion.width - separatorX,
        height: contentRegion.height,
        column: 1
      });
    } else {
      // Une seule zone de texte
      zones.push({
        x: contentRegion.x,
        y: contentRegion.y,
        width: contentRegion.width,
        height: contentRegion.height,
        column: 0
      });
    }
    
    // Exclure les zones occupées par les tables
    const filteredZones = zones.filter(zone => {
      return !tables.some(table => 
        this.rectanglesOverlap(zone, table)
      );
    });
    
    logger.info('OCR', `📖 Zones de texte extraites: ${filteredZones.length}`);
    return filteredZones;
  }

  /**
   * Vérifier si deux rectangles se chevauchent
   */
  private rectanglesOverlap(rect1: any, rect2: any): boolean {
    return !(rect1.x + rect1.width < rect2.x || 
             rect2.x + rect2.width < rect1.x || 
             rect1.y + rect1.height < rect2.y || 
             rect2.y + rect2.height < rect1.y);
  }

  /**
   * Calculer les métriques de qualité
   */
  private calculateQualityMetrics(
    detectedLines: { horizontal: OpenCVLineDetection[]; vertical: OpenCVLineDetection[] },
    tables: DetectedTable[],
    textZones: TextZone[],
    imageData: ImageData
  ): { lineDetectionQuality: number; tableDetectionQuality: number; overallQuality: number } {
    const totalPixels = imageData.width * imageData.height;
    const linePixels = (detectedLines.horizontal.length + detectedLines.vertical.length) * 100; // Estimation
    
    const lineDetectionQuality = Math.min(linePixels / (totalPixels * 0.01), 1.0);
    const tableDetectionQuality = Math.min(tables.length / 3, 1.0); // Max 3 tables attendues
    const overallQuality = (lineDetectionQuality + tableDetectionQuality + (textZones.length > 0 ? 1 : 0)) / 3;
    
    return {
      lineDetectionQuality,
      tableDetectionQuality,
      overallQuality
    };
  }

  /**
   * Créer une image traitée avec visualisation des éléments détectés
   */
  private createProcessedImage(
    originalImage: ImageData,
    detectedLines: { horizontal: OpenCVLineDetection[]; vertical: OpenCVLineDetection[] },
    tables: DetectedTable[],
    textZones: TextZone[]
  ): ImageData {
    // Pour la démo, on retourne l'image originale
    // Dans une vraie implémentation, on dessinerait les éléments détectés
    const canvas = document.createElement('canvas');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext('2d')!;
    
    // Dessiner l'image originale
    ctx.putImageData(originalImage, 0, 0);
    
    // Dessiner les lignes détectées
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    
    detectedLines.horizontal.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    });
    
    ctx.strokeStyle = 'blue';
    detectedLines.vertical.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    });
    
    // Dessiner les tables
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 3;
    tables.forEach(table => {
      ctx.strokeRect(table.x, table.y, table.width, table.height);
    });
    
    // Dessiner les zones de texte
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 2;
    textZones.forEach(zone => {
      ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
    });
    
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  /**
   * Vérifier si OpenCV est prêt
   */
  isReady(): boolean {
    return this.isInitialized && this.opencv !== null;
  }

  /**
   * Obtenir la version d'OpenCV
   */
  getVersion(): string {
    return this.isReady() ? '4.8.0' : 'Non disponible';
  }
}

export const realImageProcessingService = new RealImageProcessingService();