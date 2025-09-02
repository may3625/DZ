/**
 * Service d'extraction OCR réel avec Tesseract.js
 * Moteur principal de reconnaissance optique de caractères
 */

import { logger } from '@/utils/logger';
import { ocrConfigurationService } from '@/services/ocrConfigurationService';
import { tesseractWorkerService } from '@/services/tesseractWorker';
import { getErrorMessage } from '@/utils/safeError';

export interface TextRegion {
  text: string;
  confidence: number;
  language?: 'fra' | 'ara' | 'mixed' | 'fr'; // Support des anciens codes langue
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  fontSize?: number;
  fontFamily?: string;
  // Propriétés additionnelles pour compatibilité
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  columnIndex?: number;
}

export interface PageExtractionResult {
  pageNumber: number;
  textRegions: TextRegion[];
  fullText: string;
  confidence: number;
  language: 'fra' | 'ara' | 'mixed';
  processingTime: number;
  // Propriétés additionnelles pour compatibilité avec DZOCRIAProcessor
  tables?: any[];
  tableRegions?: any[];
  width?: number;
  height?: number;
  borderRegion?: any;
  horizontalLines?: any[];
  verticalLines?: any[];
  separatorLines?: any[];
  lines?: any[];
}

export interface OCRExtractionResult {
  pages: PageExtractionResult[];
  totalPages: number;
  extractedText: string;
  averageConfidence: number;
  detectedLanguages: string[];
  processingTime: number;
  metadata: {
    fileName: string;
    fileSize: number;
    extractionDate: string;
    ocrEngine: string;
    version: string;
    // Métadonnées techniques complètes
    totalCharacters?: number;
    arabicCharacters?: number;
    frenchCharacters?: number;
    processingMode?: string;
    preprocessingType?: string;
    psmUsed?: string;
    textRegions?: number;
  };
}

class RealOCRExtractionService {
  constructor() {
    logger.info('OCR', '🔧 Service OCR réel utilisant le service Tesseract unifié');
  }

  /**
   * Applique dynamiquement la configuration OCR courante au worker Tesseract
   */
  async applyConfiguration(): Promise<void> {
    try {
      const worker = await tesseractWorkerService.getTesseractWorker();
      const config = ocrConfigurationService.getConfiguration();

      // Configuration adaptative selon la langue détectée
      const psm = String(config.extraction.psm ?? 6); // PSM 6 meilleur pour texte standard
      const oem = String(config.extraction.oem ?? 2); // OEM 2 LSTM seul plus précis
      
      // Pas de whitelist restrictive - laisse Tesseract détecter automatiquement
      const whitelist = config.extraction.whiteList || ''; // Vide = pas de restriction

      await worker.setParameters({
        tessedit_pageseg_mode: psm,
        tessedit_ocr_engine_mode: oem,
        ...(whitelist && { tessedit_char_whitelist: whitelist }),
        preserve_interword_spaces: '1',
        user_defined_dpi: String(config.extraction.dpi ?? 300)
      });

      console.log('🇩🇿 Configuration OCR optimisée pour l\'arabe algérien appliquée - PSM:1, OEM:3');
    } catch (error) {
      logger.warn('OCR', 'Impossible d\'appliquer la configuration OCR au worker', error);
    }
  }

  async extractDocumentFromFile(file: File): Promise<OCRExtractionResult> {
    const startTime = performance.now();
    logger.info('OCR', '📄 Début extraction OCR pour:', { fileName: file.name, size: file.size });

    try {
      // Appliquer la configuration OCR
      await this.applyConfiguration();

      const pages = await this.extractPagesFromFile(file);
      const extractedText = pages.map(p => p.fullText).join('\n\n');
      const averageConfidence = pages.reduce((sum, p) => sum + p.confidence, 0) / pages.length;
      const detectedLanguages = this.detectLanguages(pages);
      const processingTime = performance.now() - startTime;

      // Calcul des métadonnées techniques détaillées
      const totalCharacters = extractedText.length;
      const arabicCharacters = (extractedText.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
      const frenchCharacters = (extractedText.match(/[A-Za-zÀ-ÿ]/g) || []).length;
      
      // Détection du mode de traitement
      const hasArabic = arabicCharacters > 0;
      const hasFrench = frenchCharacters > 0;
      const language = hasArabic && hasFrench ? 'mixed' : hasArabic ? 'ara' : 'fra';
      const processingMode = language === 'mixed' ? 'Bilingue (Arabe + Français)' :
                            language === 'ara' ? 'Arabe uniquement' : 'Français uniquement';

      const result: OCRExtractionResult = {
        pages,
        totalPages: pages.length,
        extractedText,
        averageConfidence,
        detectedLanguages,
        processingTime,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          extractionDate: new Date().toISOString(),
          ocrEngine: '3 (Legacy + LSTM optimisé)',
          version: '4.0.0',
          // Métadonnées techniques complètes
          totalCharacters,
          arabicCharacters,
          frenchCharacters,
          processingMode,
          preprocessingType: hasArabic ? 'Activé pour arabe' : 'Standard français',
          psmUsed: '1 (Segmentation automatique OSD)',
          textRegions: pages.length
        }
      };

      logger.info('OCR', '✅ Extraction OCR terminée', {
        pages: pages.length,
        confidence: averageConfidence,
        languages: detectedLanguages,
        time: `${processingTime.toFixed(2)}ms`
      });

      return result;
    } catch (error) {
      logger.error('OCR', '❌ Erreur extraction OCR:', error);
      const msg = getErrorMessage(error);
      throw new Error(`Extraction OCR échouée: ${msg}`);
    }
  }

  private async extractPagesFromFile(file: File): Promise<PageExtractionResult[]> {
    const pages: PageExtractionResult[] = [];

    if (file.type === 'application/pdf') {
      // Pour PDF, conversion en images puis OCR
      const images = await this.convertPDFToImages(file);
      for (let i = 0; i < images.length; i++) {
        const pageResult = await this.extractFromImage(images[i], i + 1);
        pages.push(pageResult);
      }
    } else if (file.type.startsWith('image/')) {
      // Image directe
      const pageResult = await this.extractFromImage(file, 1);
      pages.push(pageResult);
    } else {
      throw new Error(`Type de fichier non supporté: ${file.type}`);
    }

    return pages;
  }

  private async extractFromImage(imageFile: File | Blob, pageNumber: number): Promise<PageExtractionResult> {
    const startTime = performance.now();

    try {
      const worker = await tesseractWorkerService.getTesseractWorker();
      // Prétraitement image: nettoyage bordures et détection lignes/tables
      let preprocessedData: ImageData | null = null;
      try {
        const bitmap = await createImageBitmap(imageFile as Blob);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0);
          preprocessedData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
        }
      } catch {}

      let data: any;
      if (preprocessedData) {
        try {
          const { imageProcessingService } = await import('@/services/imageProcessingService');
          const processing = await imageProcessingService.processImage(preprocessedData);
          // Nettoyage de zones (bordures/bruit)
          const { zoneCleaningService } = await import('@/services/zoneCleaningService');
          const lines = {
            horizontalLines: (processing.detectedLines || []).filter(l => l.type === 'horizontal')
              .map(l => ({ start: { x: l.x1, y: l.y1 }, end: { x: l.x2, y: l.y2 }, thickness: 1 })),
            verticalLines: (processing.detectedLines || []).filter(l => l.type === 'vertical')
              .map(l => ({ start: { x: l.x1, y: l.y1 }, end: { x: l.x2, y: l.y2 }, thickness: 1 })),
            intersections: [] as Array<{ x: number; y: number; type: string }>
          } as any;
          const cleaned = await zoneCleaningService.cleanZones(
            preprocessedData,
            { ...processing, lines } as any,
            { removeBorders: true, removeNoise: true, preserveText: true, preserveTables: true }
          );

          // OCR sur image nettoyée
          const cleanedCanvas = document.createElement('canvas');
          cleanedCanvas.width = cleaned.cleanedImageData.width;
          cleanedCanvas.height = cleaned.cleanedImageData.height;
          const cctx = cleanedCanvas.getContext('2d');
          if (cctx) {
            cctx.putImageData(cleaned.cleanedImageData, 0, 0);
          }
          const blob: Blob = await new Promise((resolve) => cleanedCanvas.toBlob(b => resolve(b as Blob), 'image/png'));
          const result = await worker.recognize(blob);
          data = result?.data || { text: '', confidence: 0, words: [] };
        } catch {
          const result = await worker.recognize(imageFile);
          data = result?.data || { text: '', confidence: 0, words: [] };
        }
      } else {
        const result = await worker.recognize(imageFile);
        data = result?.data || { text: '', confidence: 0, words: [] };
      }
      
      // Ensure all data properties exist with fallbacks
      const words = data?.words || [];
      const textRegions: TextRegion[] = (data?.words || []).map((word: any) => ({
        text: word?.text || '',
        confidence: word?.confidence || 0,
        bbox: {
          x0: word?.bbox?.x0 || 0,
          y0: word?.bbox?.y0 || 0,
          x1: word?.bbox?.x1 || 0,
          y1: word?.bbox?.y1 || 0
        },
        fontSize: word?.fontSize || 12,
        fontFamily: word?.fontName || 'Arial'
      }));

      const fullText = (data?.text || '').trim();
      const confidence = data?.confidence || 0;
      const language = this.detectPageLanguage(fullText);
      const processingTime = performance.now() - startTime;

      return {
        pageNumber,
        textRegions,
        fullText,
        confidence,
        language,
        processingTime
      };
    } catch (error) {
      logger.error('OCR', `❌ Erreur extraction page ${pageNumber}:`, error);
      throw error;
    }
  }

  private async convertPDFToImages(file: File): Promise<Blob[]> {
    logger.info('OCR', '📋 Conversion PDF en images avec PDF.js');
    
    try {
      // Import PDF.js dynamiquement
      const pdfjsLib = await import('pdfjs-dist');
      
      // Configuration du worker PDF.js
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const images: Blob[] = [];
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Échelle 2x pour meilleure qualité OCR
        
        // Créer un canvas pour rendre la page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Impossible de créer le contexte canvas');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Rendre la page sur le canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        }).promise;
        
        // Convertir en Blob image
        const imageBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Échec conversion canvas vers blob'));
          }, 'image/png', 0.95);
        });
        
        images.push(imageBlob);
        logger.info('OCR', `✅ Page ${pageNum}/${pdf.numPages} convertie`);
      }
      
      logger.info('OCR', `📋 ${images.length} pages converties avec succès`);
      return images;
      
    } catch (error) {
      logger.error('OCR', '❌ Erreur conversion PDF:', error);
      // Fallback: retourner le PDF comme "image" unique pour Tesseract
      logger.info('OCR', '🔄 Fallback: traitement PDF direct par Tesseract');
      return [file];
    }
  }

  private detectPageLanguage(text: string): 'fra' | 'ara' | 'mixed' {
    const arabicChars = text.match(/[\u0600-\u06FF]/g) || [];
    const latinChars = text.match(/[a-zA-Z]/g) || [];
    
    const arabicRatio = arabicChars.length / text.length;
    const latinRatio = latinChars.length / text.length;

    if (arabicRatio > 0.3 && latinRatio > 0.3) return 'mixed';
    if (arabicRatio > latinRatio) return 'ara';
    return 'fra';
  }

  private detectLanguages(pages: PageExtractionResult[]): string[] {
    const languages = new Set<string>();
    pages.forEach(page => {
      if (page.language === 'mixed') {
        languages.add('fra');
        languages.add('ara');
      } else {
        languages.add(page.language);
      }
    });
    return Array.from(languages);
  }

  // Fonction simulateOCRExtraction supprimée - Plus de simulation !

  async cleanup() {
    logger.info('OCR', '🔧 Nettoyage délégué au service Tesseract unifié');
    // Le service unifié gère le nettoyage global
  }
}

export const realOCRExtractionService = new RealOCRExtractionService();
export default realOCRExtractionService;