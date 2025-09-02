/**
 * Service d'extraction de contenu de tables (Étape 7)
 * Analyse structurée des tables détectées dans les documents
 * Extraction de données tabulaires avec support bilingue
 */

import { DetectedLine } from '../imageProcessingService';
import { PageImage } from './pdfImageExtractor';
import { contentExtractionService } from './contentExtractionService';

export interface TableCell {
  row: number;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  confidence: number;
  isHeader: boolean;
  language?: 'fra' | 'ara' | 'mixed';
}

export interface TableStructure {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rows: number;
  columns: number;
  cells: TableCell[];
  headers: TableCell[];
  confidence: number;
  tableType: 'data' | 'form' | 'schedule' | 'signature';
}

export interface TableExtractionResult {
  pageNumber: number;
  tables: TableStructure[];
  totalTables: number;
  extractedData: Record<string, any>[];
  processingTime: number;
  confidence: number;
}

export interface TableExtractionConfig {
  minimumCellSize: number;
  headerDetectionRatio: number;
  confidenceThreshold: number;
  enableStructuredData: boolean;
  supportMultiLanguage: boolean;
}

class TableExtractionService {
  private readonly DEFAULT_CONFIG: TableExtractionConfig = {
    minimumCellSize: 20,
    headerDetectionRatio: 0.3,
    confidenceThreshold: 0.6,
    enableStructuredData: true,
    supportMultiLanguage: true
  };

  /**
   * Étape 7 : Extraction complète des tables détectées
   */
  async extractTables(
    pageImage: PageImage,
    detectedTables: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      horizontalLines: DetectedLine[];
      verticalLines: DetectedLine[];
      confidence: number;
    }>,
    config: Partial<TableExtractionConfig> = {}
  ): Promise<TableExtractionResult> {
    
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = performance.now();

    console.log('📊 Starting table extraction...');
    console.log(`🔢 Processing ${detectedTables.length} detected tables`);

    try {
      const extractedTables: TableStructure[] = [];
      const allExtractedData: Record<string, any>[] = [];

      for (let i = 0; i < detectedTables.length; i++) {
        const detectedTable = detectedTables[i];
        
        console.log(`📋 Processing table ${i + 1}/${detectedTables.length}`);

        // Analyser la structure de la table
        const tableStructure = await this.analyzeTableStructure(
          pageImage,
          detectedTable,
          i,
          mergedConfig
        );

        if (tableStructure) {
          extractedTables.push(tableStructure);

          // Extraire les données structurées si activé
          if (mergedConfig.enableStructuredData) {
            const structuredData = this.extractStructuredData(tableStructure);
            allExtractedData.push(...structuredData);
          }
        }
      }

      const processingTime = performance.now() - startTime;
      const overallConfidence = this.calculateOverallConfidence(extractedTables);

      console.log(`✅ Table extraction completed: ${extractedTables.length} tables processed in ${processingTime.toFixed(2)}ms`);

      return {
        pageNumber: pageImage.pageNumber,
        tables: extractedTables,
        totalTables: extractedTables.length,
        extractedData: allExtractedData,
        processingTime,
        confidence: overallConfidence
      };

    } catch (error) {
      console.error('❌ Table extraction failed:', error);
      throw new Error(`Table extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyse de la structure d'une table
   */
  private async analyzeTableStructure(
    pageImage: PageImage,
    detectedTable: any,
    tableIndex: number,
    config: TableExtractionConfig
  ): Promise<TableStructure | null> {

    try {
      // Créer la grille de cellules basée sur les lignes
      const cellGrid = this.createCellGrid(
        detectedTable.horizontalLines,
        detectedTable.verticalLines,
        detectedTable,
        config
      );

      if (cellGrid.length === 0) {
        console.log(`⚠️ No valid cells found in table ${tableIndex + 1}`);
        return null;
      }

      // Extraire le contenu de chaque cellule
      const cellsWithContent = await this.extractCellContents(
        pageImage,
        cellGrid,
        config
      );

      // Identifier les en-têtes
      const { headers, dataCells } = this.identifyHeaders(cellsWithContent, config);

      // Déterminer le type de table
      const tableType = this.determineTableType(cellsWithContent);

      const tableStructure: TableStructure = {
        id: `table_${pageImage.pageNumber}_${tableIndex}`,
        x: detectedTable.x,
        y: detectedTable.y,
        width: detectedTable.width,
        height: detectedTable.height,
        rows: this.calculateRows(cellsWithContent),
        columns: this.calculateColumns(cellsWithContent),
        cells: cellsWithContent,
        headers: headers,
        confidence: this.calculateTableConfidence(cellsWithContent),
        tableType
      };

      console.log(`📈 Table ${tableIndex + 1}: ${tableStructure.rows}x${tableStructure.columns} (${tableStructure.cells.length} cells)`);

      return tableStructure;

    } catch (error) {
      console.error(`Error analyzing table ${tableIndex + 1}:`, error);
      return null;
    }
  }

  /**
   * Création de la grille de cellules
   */
  private createCellGrid(
    horizontalLines: DetectedLine[],
    verticalLines: DetectedLine[],
    tableRegion: any,
    config: TableExtractionConfig
  ): Array<{ row: number, column: number, x: number, y: number, width: number, height: number }> {

    // Trier les lignes par position
    const sortedHorizontal = horizontalLines.sort((a, b) => a.y1 - b.y1);
    const sortedVertical = verticalLines.sort((a, b) => a.x1 - b.x1);

    const cells = [];
    const cellId = 0;

    // Créer les cellules aux intersections
    for (let row = 0; row < sortedHorizontal.length - 1; row++) {
      for (let col = 0; col < sortedVertical.length - 1; col++) {
        const x = sortedVertical[col].x1;
        const y = sortedHorizontal[row].y1;
        const width = sortedVertical[col + 1].x1 - x;
        const height = sortedHorizontal[row + 1].y1 - y;

        // Filtrer les cellules trop petites
        if (width >= config.minimumCellSize && height >= config.minimumCellSize) {
          cells.push({
            row,
            column: col,
            x,
            y,
            width,
            height
          });
        }
      }
    }

    return cells;
  }

  /**
   * Extraction du contenu des cellules
   */
  private async extractCellContents(
    pageImage: PageImage,
    cellGrid: Array<{ row: number, column: number, x: number, y: number, width: number, height: number }>,
    config: TableExtractionConfig
  ): Promise<TableCell[]> {

    const cellsWithContent: TableCell[] = [];

    for (const cell of cellGrid) {
      try {
        // Extraire l'image de la cellule
        const cellCanvas = this.extractCellImage(pageImage, cell);

        // OCR sur la cellule
        const ocrResult = await this.performCellOCR(cellCanvas, config);

        const tableCell: TableCell = {
          row: cell.row,
          column: cell.column,
          x: cell.x,
          y: cell.y,
          width: cell.width,
          height: cell.height,
          text: ocrResult.text.trim(),
          confidence: ocrResult.confidence,
          isHeader: false, // Sera déterminé plus tard
          language: config.supportMultiLanguage ? this.detectCellLanguage(ocrResult.text) : 'fra'
        };

        cellsWithContent.push(tableCell);

      } catch (error) {
        console.error(`Error extracting cell content at (${cell.row}, ${cell.column}):`, error);
        
        // Ajouter cellule vide en cas d'erreur
        cellsWithContent.push({
          row: cell.row,
          column: cell.column,
          x: cell.x,
          y: cell.y,
          width: cell.width,
          height: cell.height,
          text: '',
          confidence: 0,
          isHeader: false
        });
      }
    }

    return cellsWithContent;
  }

  /**
   * Extraction d'image de cellule
   */
  private extractCellImage(
    pageImage: PageImage,
    cell: { x: number, y: number, width: number, height: number }
  ): HTMLCanvasElement {
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Cannot get canvas context');
    }

    // Ajuster selon l'échelle
    const scaledX = cell.x * pageImage.scale;
    const scaledY = cell.y * pageImage.scale;
    const scaledWidth = cell.width * pageImage.scale;
    const scaledHeight = cell.height * pageImage.scale;

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // Ajouter du padding pour améliorer l'OCR
    const padding = 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Extraire la cellule
    ctx.drawImage(
      pageImage.canvas,
      scaledX + padding,
      scaledY + padding,
      scaledWidth - (padding * 2),
      scaledHeight - (padding * 2),
      padding,
      padding,
      scaledWidth - (padding * 2),
      scaledHeight - (padding * 2)
    );

    return canvas;
  }

  /**
   * OCR optimisé pour cellules de table
   */
  private async performCellOCR(
    canvas: HTMLCanvasElement,
    config: TableExtractionConfig
  ): Promise<{ text: string, confidence: number }> {
    
    try {
      // Utiliser le service d'extraction de contenu avec configuration spéciale table
      const worker = await contentExtractionService['getOrCreateWorker']('fra+ara');
      
      const { data } = await worker.recognize(canvas, {
        tessedit_pageseg_mode: 8, // Single word
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀ-ÿأ-ي .,;:()/-'
      });

      return {
        text: data.text.replace(/\n/g, ' ').trim(),
        confidence: data.confidence / 100
      };

    } catch (error) {
      console.error('Cell OCR error:', error);
      return { text: '', confidence: 0 };
    }
  }

  /**
   * Identification des en-têtes de table
   */
  private identifyHeaders(
    cells: TableCell[],
    config: TableExtractionConfig
  ): { headers: TableCell[], dataCells: TableCell[] } {
    
    const headers: TableCell[] = [];
    const dataCells: TableCell[] = [];

    // Identifier la première ligne comme en-têtes potentiels
    const firstRowCells = cells.filter(cell => cell.row === 0);
    const otherCells = cells.filter(cell => cell.row > 0);

    // Vérifier si la première ligne contient des en-têtes
    const hasHeaders = firstRowCells.length > 0 && 
      firstRowCells.some(cell => 
        cell.text.length > 0 && 
        this.isLikelyHeader(cell.text)
      );

    if (hasHeaders) {
      firstRowCells.forEach(cell => {
        cell.isHeader = true;
        headers.push(cell);
      });
      dataCells.push(...otherCells);
    } else {
      dataCells.push(...cells);
    }

    return { headers, dataCells };
  }

  /**
   * Vérifier si un texte ressemble à un en-tête
   */
  private isLikelyHeader(text: string): boolean {
    // Caractéristiques d'en-têtes : mots courts, pas de chiffres seuls, mots descriptifs
    const trimmedText = text.trim();
    
    if (trimmedText.length < 2) return false;
    if (/^\d+$/.test(trimmedText)) return false; // Pas juste un chiffre
    
    // Mots communs d'en-têtes en français/arabe
    const headerWords = [
      'nom', 'name', 'date', 'type', 'statut', 'référence', 'numéro', 'montant',
      'designation', 'description', 'quantité', 'prix', 'total', 'observations'
    ];
    
    return headerWords.some(word => 
      trimmedText.toLowerCase().includes(word)
    );
  }

  /**
   * Détection de langue pour cellule
   */
  private detectCellLanguage(text: string): 'fra' | 'ara' | 'mixed' {
    const arabicPattern = /[\u0600-\u06FF]/;
    const frenchPattern = /[a-zA-ZÀ-ÿ]/;
    
    const hasArabic = arabicPattern.test(text);
    const hasFrench = frenchPattern.test(text);
    
    if (hasArabic && hasFrench) return 'mixed';
    if (hasArabic) return 'ara';
    return 'fra';
  }

  /**
   * Détermination du type de table
   */
  private determineTableType(cells: TableCell[]): TableStructure['tableType'] {
    const textContent = cells.map(c => c.text.toLowerCase()).join(' ');
    
    if (textContent.includes('signature') || textContent.includes('tampon')) {
      return 'signature';
    }
    
    if (textContent.includes('horaire') || textContent.includes('planning')) {
      return 'schedule';
    }
    
    if (textContent.includes('formulaire') || textContent.includes('demande')) {
      return 'form';
    }
    
    return 'data';
  }

  /**
   * Calculs de dimensions
   */
  private calculateRows(cells: TableCell[]): number {
    return Math.max(...cells.map(c => c.row)) + 1;
  }

  private calculateColumns(cells: TableCell[]): number {
    return Math.max(...cells.map(c => c.column)) + 1;
  }

  /**
   * Calcul de confiance de table
   */
  private calculateTableConfidence(cells: TableCell[]): number {
    const validCells = cells.filter(c => c.confidence > 0);
    if (validCells.length === 0) return 0;
    
    return validCells.reduce((sum, c) => sum + c.confidence, 0) / validCells.length;
  }

  /**
   * Calcul de confiance globale
   */
  private calculateOverallConfidence(tables: TableStructure[]): number {
    if (tables.length === 0) return 0;
    
    return tables.reduce((sum, t) => sum + t.confidence, 0) / tables.length;
  }

  /**
   * Extraction de données structurées
   */
  private extractStructuredData(table: TableStructure): Record<string, any>[] {
    const structuredData: Record<string, any>[] = [];
    
    if (table.headers.length === 0) {
      return structuredData;
    }

    // Créer des objets basés sur les en-têtes
    const headerNames = table.headers
      .sort((a, b) => a.column - b.column)
      .map(h => h.text.trim() || `col_${h.column}`);

    // Grouper les données par ligne
    const dataRows = this.groupCellsByRow(table.cells.filter(c => !c.isHeader));

    for (const row of dataRows) {
      const rowData: Record<string, any> = {};
      
      row.forEach((cell, index) => {
        const headerName = headerNames[index] || `col_${index}`;
        rowData[headerName] = cell.text.trim();
      });

      // Ajouter seulement les lignes avec du contenu
      if (Object.values(rowData).some(value => value && value.length > 0)) {
        rowData._metadata = {
          tableId: table.id,
          row: row[0]?.row,
          confidence: row.reduce((sum, c) => sum + c.confidence, 0) / row.length
        };
        
        structuredData.push(rowData);
      }
    }

    return structuredData;
  }

  /**
   * Grouper cellules par ligne
   */
  private groupCellsByRow(cells: TableCell[]): TableCell[][] {
    const rows: Record<number, TableCell[]> = {};
    
    cells.forEach(cell => {
      if (!rows[cell.row]) {
        rows[cell.row] = [];
      }
      rows[cell.row].push(cell);
    });

    // Trier chaque ligne par colonne
    return Object.values(rows).map(row => 
      row.sort((a, b) => a.column - b.column)
    );
  }
}

export const tableExtractionService = new TableExtractionService();
export default tableExtractionService;