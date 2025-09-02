import { LineDetectionResult } from './imageProcessingService';

// Types pour l'extraction de tables avancée
export interface TableCell {
  id: string;
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
  content: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isHeader: boolean;
  isMerged: boolean;
  mergedWith?: string[]; // IDs des cellules avec lesquelles cette cellule est fusionnée
}

export interface TableStructure {
  id: string;
  rows: number;
  cols: number;
  cells: TableCell[];
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  hasHeader: boolean;
  hasMergedCells: boolean;
}

export interface TableExtractionResult {
  tables: TableStructure[];
  totalTables: number;
  extractionTime: number;
  success: boolean;
  errors: string[];
}

export interface TableExtractionOptions {
  minCellWidth: number;
  minCellHeight: number;
  maxMergedCells: number;
  detectHeaders: boolean;
  reconstructMerged: boolean;
  minTableSize: number;
  confidenceThreshold: number;
}

class AdvancedTableExtractionService {
  private readonly defaultOptions: TableExtractionOptions = {
    minCellWidth: 20,
    minCellHeight: 15,
    maxMergedCells: 10,
    detectHeaders: true,
    reconstructMerged: true,
    minTableSize: 4, // Au moins 2x2
    confidenceThreshold: 0.7
  };

  /**
   * Extrait les tables avec gestion des cellules fusionnées
   */
  async extractTables(
    imageData: ImageData,
    lines: LineDetectionResult,
    ocrResults: any[] = [],
    options: Partial<TableExtractionOptions> = {}
  ): Promise<TableExtractionResult> {
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };
    
    console.log('🔄 Début de l\'extraction de tables avancée');

    try {
      const errors: string[] = [];
      
      // 1. Détection des grilles de table candidates
      const tableGrids = this.detectTableGrids(lines, opts);
      console.log(`Détecté ${tableGrids.length} grilles de table candidates`);

      // 2. Reconstruction des cellules fusionnées
      const tables: TableStructure[] = [];
      
      for (const grid of tableGrids) {
        try {
          const table = await this.reconstructTable(grid, imageData, ocrResults, opts);
          if (table && table.confidence >= opts.confidenceThreshold) {
            tables.push(table);
          }
        } catch (error) {
          errors.push(`Erreur lors de la reconstruction d'une table: ${error}`);
          console.warn('Erreur reconstruction table:', error);
        }
      }

      // 3. Validation et nettoyage
      const validTables = this.validateTables(tables, opts);
      console.log(`${validTables.length} tables valides extraites`);

      const extractionTime = Date.now() - startTime;

      return {
        tables: validTables,
        totalTables: validTables.length,
        extractionTime,
        success: validTables.length > 0,
        errors
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction de tables:', error);
      return {
        tables: [],
        totalTables: 0,
        extractionTime: Date.now() - startTime,
        success: false,
        errors: [`Erreur critique: ${error}`]
      };
    }
  }

  /**
   * Détecte les grilles de table à partir des lignes
   */
  private detectTableGrids(lines: LineDetectionResult, options: TableExtractionOptions): Array<{
    horizontalLines: typeof lines.horizontalLines;
    verticalLines: typeof lines.verticalLines;
    intersections: typeof lines.intersections;
    boundingBox: { x: number; y: number; width: number; height: number };
  }> {
    const grids = [];
    
    // Grouper les lignes qui forment des structures rectangulaires
    const horizontalGroups = this.groupParallelLines(lines.horizontalLines, 'horizontal');
    const verticalGroups = this.groupParallelLines(lines.verticalLines, 'vertical');

    for (const hGroup of horizontalGroups) {
      for (const vGroup of verticalGroups) {
        // Vérifier si ces groupes forment une grille
        const grid = this.checkGridFormation(hGroup, vGroup, lines.intersections);
        
        if (grid && this.isValidGrid(grid, options)) {
          grids.push(grid);
        }
      }
    }

    return grids;
  }

  /**
   * Groupe les lignes parallèles
   */
  private groupParallelLines(
    lines: Array<{ start: { x: number; y: number }; end: { x: number; y: number } }>,
    direction: 'horizontal' | 'vertical'
  ): Array<Array<typeof lines[0]>> {
    const groups = [];
    const processed = new Set<number>();

    for (let i = 0; i < lines.length; i++) {
      if (processed.has(i)) continue;

      const group = [lines[i]];
      processed.add(i);

      const referenceCoord = direction === 'horizontal' ? lines[i].start.y : lines[i].start.x;

      for (let j = i + 1; j < lines.length; j++) {
        if (processed.has(j)) continue;

        const currentCoord = direction === 'horizontal' ? lines[j].start.y : lines[j].start.x;
        
        // Grouper les lignes qui sont proches (tolérance de 5 pixels)
        if (Math.abs(referenceCoord - currentCoord) <= 5) {
          group.push(lines[j]);
          processed.add(j);
        }
      }

      if (group.length >= 2) { // Au moins 2 lignes pour former une structure
        groups.push(group);
      }
    }

    return groups;
  }

  /**
   * Vérifie si des groupes de lignes forment une grille
   */
  private checkGridFormation(
    horizontalGroup: any[],
    verticalGroup: any[],
    intersections: LineDetectionResult['intersections']
  ): any {
    // Calculer la boîte englobante de la grille potentielle
    const hLines = horizontalGroup.flat();
    const vLines = verticalGroup.flat();
    
    const minX = Math.min(...vLines.map(l => l.start.x));
    const maxX = Math.max(...vLines.map(l => l.start.x));
    const minY = Math.min(...hLines.map(l => l.start.y));
    const maxY = Math.max(...hLines.map(l => l.start.y));

    // Compter les intersections dans cette zone
    const relevantIntersections = intersections.filter(i =>
      i.x >= minX && i.x <= maxX && i.y >= minY && i.y <= maxY
    );

    // Une grille valide doit avoir au moins 4 intersections (2x2)
    if (relevantIntersections.length < 4) return null;

    return {
      horizontalLines: hLines,
      verticalLines: vLines,
      intersections: relevantIntersections,
      boundingBox: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      }
    };
  }

  /**
   * Vérifie si une grille est valide
   */
  private isValidGrid(grid: any, options: TableExtractionOptions): boolean {
    // Vérifications de base
    if (grid.boundingBox.width < options.minCellWidth * 2) return false;
    if (grid.boundingBox.height < options.minCellHeight * 2) return false;
    
    // Vérifier le nombre minimum de lignes
    if (grid.horizontalLines.length < 2 || grid.verticalLines.length < 2) return false;

    return true;
  }

  /**
   * Reconstruit une table à partir d'une grille détectée
   */
  private async reconstructTable(
    grid: any,
    imageData: ImageData,
    ocrResults: any[],
    options: TableExtractionOptions
  ): Promise<TableStructure> {
    // Trier les lignes pour créer une structure ordonnée
    const sortedHLines = grid.horizontalLines.sort((a: any, b: any) => a.start.y - b.start.y);
    const sortedVLines = grid.verticalLines.sort((a: any, b: any) => a.start.x - b.start.x);

    const rows = sortedHLines.length - 1;
    const cols = sortedVLines.length - 1;

    if (rows < 1 || cols < 1) {
      throw new Error('Grille invalide: pas assez de lignes');
    }

    // Créer la matrice des cellules
    const cells: TableCell[] = [];
    const cellMatrix: (TableCell | null)[][] = Array(rows).fill(null).map(() => Array(cols).fill(null));

    // Générer les cellules de base
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = sortedVLines[col].start.x;
        const y = sortedHLines[row].start.y;
        const width = sortedVLines[col + 1].start.x - x;
        const height = sortedHLines[row + 1].start.y - y;

        const cell: TableCell = {
          id: `cell_${row}_${col}`,
          row,
          col,
          rowSpan: 1,
          colSpan: 1,
          content: '',
          confidence: 0.8,
          boundingBox: { x, y, width, height },
          isHeader: row === 0 && options.detectHeaders,
          isMerged: false,
          mergedWith: []
        };

        cells.push(cell);
        cellMatrix[row][col] = cell;
      }
    }

    // Détecter et reconstruire les cellules fusionnées
    if (options.reconstructMerged) {
      this.detectMergedCells(cellMatrix, grid.intersections, options);
    }

    // Extraire le contenu des cellules via OCR
    await this.extractCellContent(cells, ocrResults, imageData);

    // Calculer la confiance globale
    const avgConfidence = cells.reduce((sum, cell) => sum + cell.confidence, 0) / cells.length;

    const table: TableStructure = {
      id: `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rows,
      cols,
      cells: cells.filter(cell => cell !== null),
      boundingBox: grid.boundingBox,
      confidence: avgConfidence,
      hasHeader: options.detectHeaders && cells.some(cell => cell.isHeader),
      hasMergedCells: cells.some(cell => cell.isMerged)
    };

    console.log(`Table reconstruite: ${rows}x${cols}, ${cells.length} cellules, confiance: ${avgConfidence.toFixed(2)}`);
    return table;
  }

  /**
   * Détecte les cellules fusionnées en analysant les intersections manquantes
   */
  private detectMergedCells(
    cellMatrix: (TableCell | null)[][],
    intersections: LineDetectionResult['intersections'],
    options: TableExtractionOptions
  ): void {
    const rows = cellMatrix.length;
    const cols = cellMatrix[0].length;

    // Créer une carte des intersections
    const intersectionMap = new Set<string>();
    intersections.forEach(i => {
      intersectionMap.add(`${Math.round(i.x)},${Math.round(i.y)}`);
    });

    // Détecter les zones sans intersections (cellules fusionnées)
    for (let row = 0; row < rows - 1; row++) {
      for (let col = 0; col < cols - 1; col++) {
        const cell = cellMatrix[row][col];
        if (!cell) continue;

        // Vérifier s'il y a des intersections manquantes qui indiquent une fusion
        const mergeInfo = this.checkForMerge(cell, cellMatrix, intersectionMap, options);
        
        if (mergeInfo.shouldMerge) {
          this.mergeCells(cellMatrix, row, col, mergeInfo.rowSpan, mergeInfo.colSpan);
        }
      }
    }
  }

  /**
   * Vérifie si une cellule doit être fusionnée avec ses voisines
   */
  private checkForMerge(
    cell: TableCell,
    cellMatrix: (TableCell | null)[][],
    intersectionMap: Set<string>,
    options: TableExtractionOptions
  ): { shouldMerge: boolean; rowSpan: number; colSpan: number } {
    const { row, col } = cell;
    const rows = cellMatrix.length;
    const cols = cellMatrix[0].length;

    let maxRowSpan = 1;
    let maxColSpan = 1;

    // Vérifier l'extension horizontale
    for (let c = col + 1; c < Math.min(col + options.maxMergedCells, cols); c++) {
      const rightCell = cellMatrix[row][c];
      if (!rightCell) break;

      const intersectionKey = `${Math.round(rightCell.boundingBox.x)},${Math.round(cell.boundingBox.y)}`;
      if (intersectionMap.has(intersectionKey)) break; // Il y a une intersection, pas de fusion

      maxColSpan++;
    }

    // Vérifier l'extension verticale
    for (let r = row + 1; r < Math.min(row + options.maxMergedCells, rows); r++) {
      const bottomCell = cellMatrix[r][col];
      if (!bottomCell) break;

      const intersectionKey = `${Math.round(cell.boundingBox.x)},${Math.round(bottomCell.boundingBox.y)}`;
      if (intersectionMap.has(intersectionKey)) break;

      maxRowSpan++;
    }

    const shouldMerge = maxRowSpan > 1 || maxColSpan > 1;
    
    return {
      shouldMerge,
      rowSpan: maxRowSpan,
      colSpan: maxColSpan
    };
  }

  /**
   * Fusionne les cellules dans la matrice
   */
  private mergeCells(
    cellMatrix: (TableCell | null)[][],
    startRow: number,
    startCol: number,
    rowSpan: number,
    colSpan: number
  ): void {
    const mainCell = cellMatrix[startRow][startCol];
    if (!mainCell) return;

    const mergedCellIds: string[] = [];

    // Étendre la cellule principale
    mainCell.rowSpan = rowSpan;
    mainCell.colSpan = colSpan;
    mainCell.isMerged = true;

    // Calculer la nouvelle boîte englobante
    let maxX = mainCell.boundingBox.x + mainCell.boundingBox.width;
    let maxY = mainCell.boundingBox.y + mainCell.boundingBox.height;

    // Marquer les cellules fusionnées
    for (let r = startRow; r < startRow + rowSpan; r++) {
      for (let c = startCol; c < startCol + colSpan; c++) {
        if (r === startRow && c === startCol) continue; // Cellule principale

        const cell = cellMatrix[r][c];
        if (cell) {
          mergedCellIds.push(cell.id);
          maxX = Math.max(maxX, cell.boundingBox.x + cell.boundingBox.width);
          maxY = Math.max(maxY, cell.boundingBox.y + cell.boundingBox.height);
          cellMatrix[r][c] = null; // Supprimer la cellule fusionnée
        }
      }
    }

    // Mettre à jour la boîte englobante de la cellule principale
    mainCell.boundingBox.width = maxX - mainCell.boundingBox.x;
    mainCell.boundingBox.height = maxY - mainCell.boundingBox.y;
    mainCell.mergedWith = mergedCellIds;

    console.log(`Cellule ${mainCell.id} fusionnée avec ${mergedCellIds.length} autres cellules (${rowSpan}x${colSpan})`);
  }

  /**
   * Extrait le contenu textuel des cellules
   */
  private async extractCellContent(
    cells: TableCell[],
    ocrResults: any[],
    imageData: ImageData
  ): Promise<void> {
    for (const cell of cells) {
      try {
        // Chercher le texte OCR qui correspond à cette cellule
        const cellContent = this.findTextInBoundingBox(cell.boundingBox, ocrResults);
        
        cell.content = cellContent.text;
        cell.confidence = cellContent.confidence;

        // Si pas de résultat OCR, essayer une extraction directe
        if (!cell.content && imageData) {
          cell.content = await this.extractTextFromImageRegion(imageData, cell.boundingBox);
        }

      } catch (error) {
        console.warn(`Erreur extraction contenu cellule ${cell.id}:`, error);
        cell.content = '';
        cell.confidence = 0;
      }
    }
  }

  /**
   * Trouve le texte OCR dans une boîte englobante
   */
  private findTextInBoundingBox(
    boundingBox: { x: number; y: number; width: number; height: number },
    ocrResults: any[]
  ): { text: string; confidence: number } {
    let bestMatch = { text: '', confidence: 0 };
    
    for (const result of ocrResults) {
      if (result.boundingBox) {
        const overlap = this.calculateBoundingBoxOverlap(boundingBox, result.boundingBox);
        
        if (overlap > 0.5 && result.confidence > bestMatch.confidence) {
          bestMatch = {
            text: result.text || '',
            confidence: result.confidence || 0
          };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Calcule le chevauchement entre deux boîtes englobantes
   */
  private calculateBoundingBoxOverlap(
    box1: { x: number; y: number; width: number; height: number },
    box2: { x: number; y: number; width: number; height: number }
  ): number {
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

    if (x2 <= x1 || y2 <= y1) return 0;

    const overlapArea = (x2 - x1) * (y2 - y1);
    const box1Area = box1.width * box1.height;
    const box2Area = box2.width * box2.height;
    const unionArea = box1Area + box2Area - overlapArea;

    return overlapArea / unionArea;
  }

  /**
   * Extrait le texte directement d'une région d'image
   */
  private async extractTextFromImageRegion(
    imageData: ImageData,
    boundingBox: { x: number; y: number; width: number; height: number }
  ): Promise<string> {
    // Extraction de région simplifiée
    // En production, on utiliserait Tesseract.js ici
    return ''; // Placeholder
  }

  /**
   * Valide les tables extraites
   */
  private validateTables(tables: TableStructure[], options: TableExtractionOptions): TableStructure[] {
    return tables.filter(table => {
      // Vérifier la taille minimale
      if (table.rows * table.cols < options.minTableSize) return false;
      
      // Vérifier la confiance
      if (table.confidence < options.confidenceThreshold) return false;
      
      // Vérifier qu'il y a au moins du contenu
      const hasContent = table.cells.some(cell => cell.content.trim().length > 0);
      if (!hasContent) return false;

      return true;
    });
  }
}

export const advancedTableExtractionService = new AdvancedTableExtractionService();