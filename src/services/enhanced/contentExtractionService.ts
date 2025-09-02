/**
 * Service d'Extraction de Contenu des Zones Détectées
 * Extrait le texte des rectangles et cellules détectés par les algorithmes
 */

import { DetectedLine } from '../imageProcessingService';

// Types pour les zones détectées
interface ContentRectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TableRectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  detectedCells: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    row: number;
    col: number;
  }>;
}

export interface ExtractedContent {
  textRegions: ExtractedTextRegion[];
  tableRegions: ExtractedTableRegion[];
  overallText: string;
  confidence: number;
  processingTime: number;
}

export interface ExtractedTextRegion {
  rectangleId: string;
  content: string;
  language: 'fr' | 'ar' | 'mixed';
  confidence: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  detectedLines: DetectedLine[];
}

export interface ExtractedTableRegion {
  rectangleId: string;
  cells: ExtractedTableCell[];
  tableStructure: {
    rows: number;
    columns: number;
  };
  confidence: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ExtractedTableCell {
  row: number;
  column: number;
  content: string;
  confidence: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ContentExtractionConfig {
  minTextLength: number;
  ocrConfidence: number;
  languageDetection: boolean;
  tableCellPadding: number;
}

class ContentExtractionService {
  private readonly DEFAULT_CONFIG: ContentExtractionConfig = {
    minTextLength: 3,
    ocrConfidence: 0.6,
    languageDetection: true,
    tableCellPadding: 5
  };

  /**
   * Extrait le contenu de toutes les zones détectées
   */
  async extractContentFromRegions(
    imageData: ImageData,
    textRegions: ContentRectangle[],
    tableRegions: TableRectangle[],
    config: Partial<ContentExtractionConfig> = {}
  ): Promise<ExtractedContent> {
    const startTime = performance.now();
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };

    console.log('📝 Début extraction de contenu...');
    console.log(`📊 Zones à traiter: ${textRegions.length} textes, ${tableRegions.length} tables`);

    try {
      // Extraire le contenu des zones de texte
      const extractedTextRegions = await this.extractTextFromRegions(
        imageData,
        textRegions,
        mergedConfig
      );

      // Extraire le contenu des tables
      const extractedTableRegions = await this.extractContentFromTables(
        imageData,
        tableRegions,
        mergedConfig
      );

      // Agréger tout le texte
      const overallText = this.aggregateAllText(extractedTextRegions, extractedTableRegions);

      // Calculer la confiance globale
      const confidence = this.calculateOverallConfidence(extractedTextRegions, extractedTableRegions);

      const processingTime = performance.now() - startTime;

      console.log(`✅ Extraction terminée: ${extractedTextRegions.length} zones texte, ${extractedTableRegions.length} tables`);

      return {
        textRegions: extractedTextRegions,
        tableRegions: extractedTableRegions,
        overallText,
        confidence,
        processingTime
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction de contenu:', error);
      throw error;
    }
  }

  /**
   * Extrait le texte des zones de texte détectées
   */
  private async extractTextFromRegions(
    imageData: ImageData,
    textRegions: ContentRectangle[],
    config: ContentExtractionConfig
  ): Promise<ExtractedTextRegion[]> {
    const extractedRegions: ExtractedTextRegion[] = [];

    for (const region of textRegions) {
      try {
        // Extraire la sous-image de la région
        const regionImageData = this.extractRegionFromImage(imageData, region);
        
        // Appliquer l'OCR sur la région
        const ocrResult = await this.performOCR(regionImageData, config);
        
        if (ocrResult.text && ocrResult.text.length >= config.minTextLength) {
          extractedRegions.push({
            rectangleId: region.id,
            content: ocrResult.text,
            language: ocrResult.language,
            confidence: ocrResult.confidence,
            coordinates: {
              x: region.x,
              y: region.y,
              width: region.width,
              height: region.height
            },
            detectedLines: [] // À remplir si nécessaire
          });
        }
      } catch (error) {
        console.warn(`⚠️ Erreur extraction zone ${region.id}:`, error);
      }
    }

    return extractedRegions;
  }

  /**
   * Extrait le contenu des tables détectées
   */
  private async extractContentFromTables(
    imageData: ImageData,
    tableRegions: TableRectangle[],
    config: ContentExtractionConfig
  ): Promise<ExtractedTableRegion[]> {
    const extractedTables: ExtractedTableRegion[] = [];

    for (const table of tableRegions) {
      try {
        const extractedCells: ExtractedTableCell[] = [];

                 // Extraire le contenu de chaque cellule
         for (const cell of table.detectedCells) {
           const cellImageData = this.extractRegionFromImage(imageData, {
             x: cell.x + config.tableCellPadding,
             y: cell.y + config.tableCellPadding,
             width: cell.width - (config.tableCellPadding * 2),
             height: cell.height - (config.tableCellPadding * 2)
           });

          const ocrResult = await this.performOCR(cellImageData, config);

          if (ocrResult.text && ocrResult.text.length >= config.minTextLength) {
            extractedCells.push({
              row: cell.row,
              column: cell.col,
              content: ocrResult.text,
              confidence: ocrResult.confidence,
              coordinates: {
                x: cell.x,
                y: cell.y,
                width: cell.width,
                height: cell.height
              }
            });
          }
        }

        // Déterminer la structure de la table
        const maxRow = Math.max(...extractedCells.map(c => c.row), 0);
        const maxCol = Math.max(...extractedCells.map(c => c.column), 0);

        extractedTables.push({
          rectangleId: table.id,
          cells: extractedCells,
          tableStructure: {
            rows: maxRow + 1,
            columns: maxCol + 1
          },
          confidence: this.calculateTableConfidence(extractedCells),
          coordinates: {
            x: table.x,
            y: table.y,
            width: table.width,
            height: table.height
          }
        });

      } catch (error) {
        console.warn(`⚠️ Erreur extraction table ${table.id}:`, error);
      }
    }

    return extractedTables;
  }

  /**
   * Extrait une région d'une image
   */
  private extractRegionFromImage(
    imageData: ImageData,
    region: { x: number; y: number; width: number; height: number }
  ): ImageData {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = region.width;
    canvas.height = region.height;

    // Créer une image temporaire avec les données originales
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    
    const tempImageData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
    tempCtx.putImageData(tempImageData, 0, 0);

    // Dessiner la région extraite
    ctx.drawImage(
      tempCanvas,
      region.x, region.y, region.width, region.height,
      0, 0, region.width, region.height
    );

    return ctx.getImageData(0, 0, region.width, region.height);
  }

  /**
   * Applique l'OCR sur une région d'image
   */
  private async performOCR(
    imageData: ImageData,
    config: ContentExtractionConfig
  ): Promise<{ text: string; language: 'fr' | 'ar' | 'mixed'; confidence: number }> {
    try {
      // Utiliser Tesseract.js pour l'OCR
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker();

      // Configurer les langues (français et arabe)
      await (worker as any).loadLanguage('fra+ara');
      await (worker as any).initialize('fra+ara');

      // Convertir ImageData en canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      ctx.putImageData(imageData, 0, 0);

      // Convertir canvas en blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      // Effectuer l'OCR
      const result = await worker.recognize(blob);
      await worker.terminate();

      // Détecter la langue
      const language = this.detectLanguage(result.data.text);

      return {
        text: result.data.text.trim(),
        language,
        confidence: result.data.confidence / 100
      };

    } catch (error) {
      console.warn('⚠️ Erreur OCR:', error);
      return {
        text: '',
        language: 'fr',
        confidence: 0
      };
    }
  }

  /**
   * Détecte la langue du texte
   */
  private detectLanguage(text: string): 'fr' | 'ar' | 'mixed' {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const frenchRegex = /[àâäéèêëïîôöùûüÿç]/i;
    
    const hasArabic = arabicRegex.test(text);
    const hasFrench = frenchRegex.test(text);
    
    if (hasArabic && hasFrench) return 'mixed';
    if (hasArabic) return 'ar';
    return 'fr';
  }

  /**
   * Agrège tout le texte extrait
   */
  private aggregateAllText(
    textRegions: ExtractedTextRegion[],
    tableRegions: ExtractedTableRegion[]
  ): string {
    const parts: string[] = [];

    // Ajouter le texte des zones de texte
    for (const region of textRegions) {
      parts.push(region.content);
    }

    // Ajouter le contenu des tables
    for (const table of tableRegions) {
      const tableText = this.formatTableAsText(table);
      parts.push(tableText);
    }

    return parts.join('\n\n');
  }

  /**
   * Formate une table en texte
   */
  private formatTableAsText(table: ExtractedTableRegion): string {
    const { rows, columns } = table.tableStructure;
    const matrix: string[][] = Array(rows).fill(null).map(() => Array(columns).fill(''));

    // Remplir la matrice avec le contenu des cellules
    for (const cell of table.cells) {
      if (cell.row < rows && cell.column < columns) {
        matrix[cell.row][cell.column] = cell.content;
      }
    }

    // Formater en texte
    return matrix.map(row => row.join('\t')).join('\n');
  }

  /**
   * Calcule la confiance globale
   */
  private calculateOverallConfidence(
    textRegions: ExtractedTextRegion[],
    tableRegions: ExtractedTableRegion[]
  ): number {
    const allConfidences = [
      ...textRegions.map(r => r.confidence),
      ...tableRegions.map(t => t.confidence)
    ];

    if (allConfidences.length === 0) return 0;
    return allConfidences.reduce((sum, conf) => sum + conf, 0) / allConfidences.length;
  }

  /**
   * Calcule la confiance d'une table
   */
  private calculateTableConfidence(cells: ExtractedTableCell[]): number {
    if (cells.length === 0) return 0;
    return cells.reduce((sum, cell) => sum + cell.confidence, 0) / cells.length;
  }
}

// Instance singleton
export const contentExtractionService = new ContentExtractionService();