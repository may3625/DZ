import { 
  DetectedZone, 
  DetectedLine, 
  ExtractedTable, 
  TableCell 
} from '@/types/imageProcessing';

interface CellBoundary {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export class TableExtractionService {
  
  async extractTablesFromZones(
    zones: DetectedZone[], 
    ocrText?: string
  ): Promise<ExtractedTable[]> {
    const tables: ExtractedTable[] = [];

    for (const zone of zones) {
      if (zone.type === 'table' && zone.lines) {
        const table = await this.processTableZone(zone, ocrText);
        if (table) {
          tables.push(table);
        }
      }
    }

    return tables;
  }

  private async processTableZone(
    zone: DetectedZone, 
    ocrText?: string
  ): Promise<ExtractedTable | null> {
    const horizontalLines = zone.lines!.filter(line => line.type === 'horizontal');
    const verticalLines = zone.lines!.filter(line => line.type === 'vertical');

    // Trier les lignes par position
    horizontalLines.sort((a, b) => (a.y1 + a.y2) / 2 - (b.y1 + b.y2) / 2);
    verticalLines.sort((a, b) => (a.x1 + a.x2) / 2 - (b.x1 + b.x2) / 2);

    // Détecter la grille de cellules
    const cellGrid = this.detectCellGrid(horizontalLines, verticalLines, zone);
    
    if (!cellGrid || cellGrid.length === 0) {
      return null;
    }

    // Gérer les cellules fusionnées
    const processedGrid = this.handleMergedCells(cellGrid);

    // Extraire le texte des cellules si disponible
    if (ocrText) {
      await this.extractCellText(processedGrid, ocrText, zone);
    }

    return {
      id: `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      boundingBox: {
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height
      },
      cells: [],
      rows: [],
      headers: [],
      cols: processedGrid[0]?.length || 0,
      zone: zone,
      confidence: 0.8,
      structure: {
        rows: processedGrid.length,
        cols: processedGrid[0]?.length || 0,
        hasHeader: this.detectHeaders(processedGrid),
        hasFooter: false,
        isRegular: true
      },
      metadata: {
        rowCount: processedGrid.length,
        columnCount: processedGrid[0]?.length || 0,
        hasHeaders: this.detectHeaders(processedGrid),
        extractionMethod: 'line-detection',
        confidence: 0.8,
        quality: 0.8
      }
    };
  }

  private detectCellGrid(
    horizontalLines: DetectedLine[], 
    verticalLines: DetectedLine[], 
    zone: DetectedZone
  ): TableCell[][] | null {
    // Créer les coordonnées des lignes de grille
    const rowBoundaries = this.createRowBoundaries(horizontalLines, zone);
    const colBoundaries = this.createColBoundaries(verticalLines, zone);

    if (rowBoundaries.length < 2 || colBoundaries.length < 2) {
      // Pas assez de lignes pour former une table
      return null;
    }

    const grid: TableCell[][] = [];

    for (let row = 0; row < rowBoundaries.length - 1; row++) {
      const cellRow: TableCell[] = [];
      
      for (let col = 0; col < colBoundaries.length - 1; col++) {
        const cell: TableCell = {
          row,
          col,
          rowspan: 1,
          colspan: 1,
          colSpan: 1,
          rowSpan: 1,
          x: colBoundaries[col],
          y: rowBoundaries[row],
          width: colBoundaries[col + 1] - colBoundaries[col],
          height: rowBoundaries[row + 1] - rowBoundaries[row],
          content: '',
          text: '',
          confidence: 0.8,
          isHeader: false,
          isEmpty: true,
          bounds: {
            x: colBoundaries[col],
            y: rowBoundaries[row],
            width: colBoundaries[col + 1] - colBoundaries[col],
            height: rowBoundaries[row + 1] - rowBoundaries[row]
          },
          borders: {
            top: false,
            right: false,
            bottom: false,
            left: false
          },
          formatting: {
            bold: false,
            italic: false,
            fontSize: 12
          },
          alignment: 'left'
        };
        
        cellRow.push(cell);
      }
      
      grid.push(cellRow);
    }

    return grid;
  }

  private createRowBoundaries(horizontalLines: DetectedLine[], zone: DetectedZone): number[] {
    const boundaries = [zone.y]; // Début de la zone
    
    for (const line of horizontalLines) {
      const y = (line.start.y + line.end.y) / 2;
      if (y > zone.y && y < zone.y + zone.height) {
        boundaries.push(y);
      }
    }
    
    boundaries.push(zone.y + zone.height); // Fin de la zone
    
    // Supprimer les doublons et trier
    return [...new Set(boundaries)].sort((a, b) => a - b);
  }

  private createColBoundaries(verticalLines: DetectedLine[], zone: DetectedZone): number[] {
    const boundaries = [zone.x]; // Début de la zone
    
    for (const line of verticalLines) {
      const x = (line.start.x + line.end.x) / 2;
      if (x > zone.x && x < zone.x + zone.width) {
        boundaries.push(x);
      }
    }
    
    boundaries.push(zone.x + zone.width); // Fin de la zone
    
    // Supprimer les doublons et trier
    return [...new Set(boundaries)].sort((a, b) => a - b);
  }

  private handleMergedCells(grid: TableCell[][]): TableCell[][] {
    // Détecter les cellules fusionnées en analysant les espaces vides
    // et les lignes manquantes
    
    const processedGrid = grid.map(row => [...row]);
    
    for (let row = 0; row < processedGrid.length; row++) {
      for (let col = 0; col < processedGrid[row].length; col++) {
        const cell = processedGrid[row][col];
        
        // Vérifier la fusion horizontale
        const horizontalSpan = this.detectHorizontalSpan(processedGrid, row, col);
        if (horizontalSpan > 1) {
          cell.colSpan = horizontalSpan;
          // Marquer les cellules fusionnées
          for (let c = col + 1; c < col + horizontalSpan; c++) {
            if (processedGrid[row][c]) {
              processedGrid[row][c].colSpan = 0; // Marquer comme fusionnée
            }
          }
        }
        
        // Vérifier la fusion verticale
        const verticalSpan = this.detectVerticalSpan(processedGrid, row, col);
        if (verticalSpan > 1) {
          cell.rowSpan = verticalSpan;
          // Marquer les cellules fusionnées
          for (let r = row + 1; r < row + verticalSpan; r++) {
            if (processedGrid[r] && processedGrid[r][col]) {
              processedGrid[r][col].rowSpan = 0; // Marquer comme fusionnée
            }
          }
        }
      }
    }
    
    return processedGrid;
  }

  private detectHorizontalSpan(grid: TableCell[][], row: number, col: number): number {
    let span = 1;
    const currentCell = grid[row][col];
    
    // Vérifier s'il y a des lignes verticales manquantes
    for (let c = col + 1; c < grid[row].length; c++) {
      const nextCell = grid[row][c];
      
      // Si les cellules ont la même hauteur et sont alignées,
      // et qu'il n'y a pas de ligne verticale entre elles
      if (Math.abs(currentCell.height - nextCell.height) < 5 &&
          Math.abs(currentCell.y - nextCell.y) < 5) {
        
        // Vérifier s'il manque une ligne verticale
        const expectedX = currentCell.x + currentCell.width;
        if (Math.abs(nextCell.x - expectedX) < 10) {
          span++;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    
    return span;
  }

  private detectVerticalSpan(grid: TableCell[][], row: number, col: number): number {
    let span = 1;
    const currentCell = grid[row][col];
    
    // Vérifier s'il y a des lignes horizontales manquantes
    for (let r = row + 1; r < grid.length; r++) {
      if (!grid[r] || !grid[r][col]) break;
      
      const nextCell = grid[r][col];
      
      // Si les cellules ont la même largeur et sont alignées,
      // et qu'il n'y a pas de ligne horizontale entre elles
      if (Math.abs(currentCell.width - nextCell.width) < 5 &&
          Math.abs(currentCell.x - nextCell.x) < 5) {
        
        // Vérifier s'il manque une ligne horizontale
        const expectedY = currentCell.y + currentCell.height;
        if (Math.abs(nextCell.y - expectedY) < 10) {
          span++;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    
    return span;
  }

  private async extractCellText(
    grid: TableCell[][], 
    ocrText: string, 
    zone: DetectedZone
  ): Promise<void> {
    // Cette méthode devrait être intégrée avec un service OCR
    // Pour l'instant, on simule l'extraction de texte
    
    const words = ocrText.split(/\s+/);
    let wordIndex = 0;
    
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cell = grid[row][col];
        
        if (cell.colSpan === 0 || cell.rowSpan === 0) {
          // Cellule fusionnée, ignorer
          continue;
        }
        
        // Assigner des mots aléatoires pour la démonstration
        // Dans un vrai système, on utiliserait les coordonnées pour mapper le texte
        if (wordIndex < words.length) {
          const cellWords = words.slice(wordIndex, wordIndex + Math.min(3, words.length - wordIndex));
          cell.text = cellWords.join(' ');
          wordIndex += cellWords.length;
          cell.confidence = 0.7 + Math.random() * 0.3;
        }
      }
    }
  }

  private detectHeaders(grid: TableCell[][]): boolean {
    if (grid.length === 0) return false;
    
    // Heuristique simple: si la première ligne a un style différent
    // ou contient des mots-clés typiques d'en-têtes
    const firstRow = grid[0];
    const headerKeywords = ['nom', 'date', 'numéro', 'type', 'référence', 'article'];
    
    for (const cell of firstRow) {
      if (cell.text) {
        const text = cell.text.toLowerCase();
        if (headerKeywords.some(keyword => text.includes(keyword))) {
          return true;
        }
      }
    }
    
    return false;
  }

  private detectBorderStyle(
    horizontalLines: DetectedLine[], 
    verticalLines: DetectedLine[]
  ): 'explicit' | 'implicit' | 'mixed' {
    const totalLines = horizontalLines.length + verticalLines.length;
    
    if (totalLines === 0) {
      return 'implicit';
    }
    
    // Analyser la confiance moyenne des lignes
    const avgConfidence = [...horizontalLines, ...verticalLines]
      .reduce((sum, line) => sum + line.confidence, 0) / totalLines;
    
    if (avgConfidence > 0.8) {
      return 'explicit';
    } else if (avgConfidence > 0.5) {
      return 'mixed';
    } else {
      return 'implicit';
    }
  }

  private calculateTableQuality(
    grid: TableCell[][], 
    horizontalLines: DetectedLine[], 
    verticalLines: DetectedLine[]
  ): number {
    let quality = 0;
    let factors = 0;
    
    // Facteur 1: Régularité de la grille
    if (grid.length > 0) {
      const expectedCols = grid[0].length;
      const regularRows = grid.filter(row => row.length === expectedCols).length;
      quality += (regularRows / grid.length) * 0.3;
      factors += 0.3;
    }
    
    // Facteur 2: Qualité des lignes détectées
    const totalLines = horizontalLines.length + verticalLines.length;
    if (totalLines > 0) {
      const avgLineConfidence = [...horizontalLines, ...verticalLines]
        .reduce((sum, line) => sum + line.confidence, 0) / totalLines;
      quality += avgLineConfidence * 0.4;
      factors += 0.4;
    }
    
    // Facteur 3: Présence de texte dans les cellules
    let cellsWithText = 0;
    let totalCells = 0;
    
    for (const row of grid) {
      for (const cell of row) {
        if (cell.colSpan > 0 && cell.rowSpan > 0) {
          totalCells++;
          if (cell.text && cell.text.trim().length > 0) {
            cellsWithText++;
          }
        }
      }
    }
    
    if (totalCells > 0) {
      quality += (cellsWithText / totalCells) * 0.3;
      factors += 0.3;
    }
    
    return factors > 0 ? quality / factors : 0;
  }

  // Méthodes utilitaires pour la correspondance et fusion intelligente - Version complète
  async mergeTablesIntelligently(tables: ExtractedTable[]): Promise<ExtractedTable[]> {
    if (tables.length <= 1) return tables;
    
    console.log(`🔄 Fusion intelligente de ${tables.length} tables avec algorithmes avancés`);
    
    // Importation dynamique du service de fusion intelligent
    const { intelligentTableMergeService } = await import('./enhanced/intelligentTableMergeService');
    
    // Utilisation du service de fusion intelligent
    const mergedTables = await intelligentTableMergeService.performIntelligentMerging(tables);
    
    // Post-traitement avec optimisations locales
    const optimizedTables = await this.performLocalOptimizations(mergedTables);
    
    console.log(`✅ Fusion terminée: ${tables.length} → ${optimizedTables.length} tables optimisées`);
    return optimizedTables;
  }

  /**
   * Optimisations locales post-fusion
   */
  private async performLocalOptimizations(tables: ExtractedTable[]): Promise<ExtractedTable[]> {
    const optimized: ExtractedTable[] = [];
    
    for (const table of tables) {
      try {
        // Optimisation de la structure des cellules
        const optimizedCells = this.optimizeCellStructure(table.cells || table.rows || []);
        
        // Reconstruction des en-têtes optimisés
        const optimizedHeaders = this.optimizeHeaders(table.headers || [], optimizedCells);
        
        // Calcul de qualité amélioré
        const improvedQuality = this.calculateAdvancedTableQuality(table, optimizedCells);
        
        const optimizedTable: ExtractedTable = {
          ...table,
          headers: optimizedHeaders,
          cells: optimizedCells,
          rows: optimizedCells,
          metadata: {
            ...table.metadata,
            quality: improvedQuality,
            extractionMethod: table.metadata.extractionMethod + '_optimized',
            confidence: Math.min(table.metadata.confidence * 1.1, 0.95)
          }
        };
        
        optimized.push(optimizedTable);
      } catch (error) {
        console.warn(`⚠️ Erreur optimisation table ${table.id}:`, error);
        optimized.push(table); // Garder la table originale en cas d'erreur
      }
    }
    
    return optimized;
  }

  /**
   * Optimisation de la structure des cellules
   */
  private optimizeCellStructure(cells: any[][]): any[][] {
    if (!cells || cells.length === 0) return [];
    
    const optimized: any[][] = [];
    
    for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
      const row = cells[rowIndex] || [];
      const optimizedRow: any[] = [];
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        
        if (cell && cell.colSpan !== 0 && cell.rowSpan !== 0) {
          // Optimiser le contenu de la cellule
          const optimizedCell = {
            ...cell,
            content: this.cleanCellContent(cell.content || cell.text || ''),
            text: this.cleanCellContent(cell.content || cell.text || ''),
            confidence: this.recalculateCellConfidence(cell),
            alignment: this.detectOptimalAlignment(cell)
          };
          
          optimizedRow.push(optimizedCell);
        }
      }
      
      if (optimizedRow.length > 0) {
        optimized.push(optimizedRow);
      }
    }
    
    return optimized;
  }

  /**
   * Nettoyage du contenu des cellules
   */
  private cleanCellContent(content: string): string {
    if (!content) return '';
    
    return content
      .trim()
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .replace(/[^\w\s\-.,;:()\/]/g, '') // Supprimer caractères bizarres
      .trim();
  }

  /**
   * Recalcul de confiance de cellule
   */
  private recalculateCellConfidence(cell: any): number {
    let confidence = cell.confidence || 0.5;
    
    const content = cell.content || cell.text || '';
    
    // Bonus pour contenu structuré
    if (/^\d+([.,]\d+)?$/.test(content.trim())) {
      confidence += 0.1; // Nombre
    } else if (/^[A-Z][a-z]+/.test(content.trim())) {
      confidence += 0.05; // Mot capitalisé
    }
    
    // Malus pour contenu suspect
    if (content.length === 0) {
      confidence = Math.max(confidence - 0.2, 0.1);
    } else if (content.length === 1) {
      confidence = Math.max(confidence - 0.1, 0.2);
    }
    
    return Math.min(confidence, 0.95);
  }

  /**
   * Détection d'alignement optimal
   */
  private detectOptimalAlignment(cell: any): 'left' | 'center' | 'right' {
    const content = (cell.content || cell.text || '').trim();
    
    // Nombres généralement alignés à droite
    if (/^\d+([.,]\d+)?[%€$]?$/.test(content)) {
      return 'right';
    }
    
    // Titres courts au centre
    if (content.length <= 10 && /^[A-Z\s]+$/.test(content)) {
      return 'center';
    }
    
    // Par défaut à gauche
    return 'left';
  }

  /**
   * Optimisation des en-têtes
   */
  private optimizeHeaders(headers: string[], cells: any[][]): string[] {
    if (!headers || headers.length === 0) {
      // Essayer d'extraire des en-têtes depuis la première ligne
      if (cells.length > 0 && cells[0].length > 0) {
        return cells[0].map((cell: any, index: number) => 
          this.cleanCellContent(cell.content || cell.text || `Col ${index + 1}`)
        );
      }
      return [];
    }
    
    return headers.map(header => this.cleanCellContent(header));
  }

  /**
   * Calcul de qualité avancée
   */
  private calculateAdvancedTableQuality(table: ExtractedTable, cells: any[][]): number {
    let quality = 0;
    let factors = 0;
    
    // Facteur de complétude des données
    if (cells.length > 0) {
      let filledCells = 0;
      let totalCells = 0;
      
      for (const row of cells) {
        for (const cell of row) {
          totalCells++;
          if (cell.content && cell.content.trim().length > 0) {
            filledCells++;
          }
        }
      }
      
      if (totalCells > 0) {
        quality += (filledCells / totalCells) * 0.4;
        factors += 0.4;
      }
    }
    
    // Facteur de confiance moyenne
    if (table.metadata.confidence) {
      quality += table.metadata.confidence * 0.3;
      factors += 0.3;
    }
    
    // Facteur de structure cohérente
    const hasConsistentStructure = this.checkStructureConsistency(cells);
    if (hasConsistentStructure) {
      quality += 0.2;
    }
    factors += 0.2;
    
    // Facteur de présence d'en-têtes valides
    if (table.headers && table.headers.length > 0) {
      const validHeaders = table.headers.filter(h => h && h.trim().length > 0).length;
      quality += (validHeaders / table.headers.length) * 0.1;
    }
    factors += 0.1;
    
    return factors > 0 ? quality / factors : 0.5;
  }

  /**
   * Vérification de cohérence structurelle
   */
  private checkStructureConsistency(cells: any[][]): boolean {
    if (!cells || cells.length <= 1) return false;
    
    const firstRowLength = cells[0]?.length || 0;
    if (firstRowLength === 0) return false;
    
    // Vérifier que toutes les lignes ont une structure similaire
    for (const row of cells) {
      if (Math.abs(row.length - firstRowLength) > 1) {
        return false; // Variation trop importante
      }
    }
    
    return true;
  }

  private shouldMergeTables(table1: ExtractedTable, table2: ExtractedTable): boolean {
    // Logique simplifiée maintenant déléguée au service intelligent
    // Vérifier si les tables sont adjacentes verticalement
    const verticallyAdjacent = Math.abs(
      (table1.boundingBox.y + table1.boundingBox.height) - table2.boundingBox.y
    ) < 20;
    
    // Vérifier si les colonnes correspondent
    const columnsMatch = Math.abs((table1.cols || 0) - (table2.cols || 0)) <= 1;
    
    // Vérifier l'alignement horizontal
    const horizontallyAligned = Math.abs(table1.boundingBox.x - table2.boundingBox.x) < 10;
    
    return verticallyAdjacent && columnsMatch && horizontallyAligned;
  }

  private mergeTables(tables: ExtractedTable[]): ExtractedTable {
    // Prendre la première table comme base
    const baseTable = tables[0];
    const mergedCells: TableCell[][] = [...baseTable.cells];
    
    // Ajouter les cellules des autres tables
    for (let i = 1; i < tables.length; i++) {
      const table = tables[i];
      // Ajuster les indices de ligne pour les nouvelles cellules
      const rowOffset = mergedCells.length;
      
      for (const row of table.cells) {
        const adjustedRow = row.map(cell => ({
          ...cell,
          row: cell.row + rowOffset,
          y: cell.y // Garder les coordonnées originales
        }));
        mergedCells.push(adjustedRow);
      }
    }
    
    // Calculer la nouvelle zone
    const minX = Math.min(...tables.map(t => t.boundingBox.x));
    const minY = Math.min(...tables.map(t => t.boundingBox.y));
    const maxX = Math.max(...tables.map(t => t.boundingBox.x + t.boundingBox.width));
    const maxY = Math.max(...tables.map(t => t.boundingBox.y + t.boundingBox.height));
    
    return {
      ...baseTable,
      cells: [],
      rows: [],
      cols: Math.max(...tables.map(t => t.cols || 0)),
      boundingBox: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      },
      metadata: {
        ...baseTable.metadata,
        hasHeaders: baseTable.metadata.hasHeaders,
        quality: tables.reduce((sum, t) => sum + (t.metadata.quality || 0), 0) / tables.length,
        rowCount: 0,
        columnCount: Math.max(...tables.map(t => t.cols || 0)),
        extractionMethod: 'merged',
        confidence: 0.8
      }
    };
  }
}

export const tableExtractionService = new TableExtractionService();