/**
 * Service de traitement PDF avec PDF.js local
 * Service PDF local utilisant PDF.js pour éviter les problèmes de CSP
 */

import { getDocument, GlobalWorkerOptions, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { logger } from '@/utils/logger';
import type { PDFProcessingConfig, PDFProcessingResult, PDFPageResult, LogCategory } from '@/types/ocr';

// Configuration du worker PDF.js (local)
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export interface PageImageData {
  pageNumber: number;
  imageData: ImageData;
  text: string;
  width: number;
  height: number;
}

class PDFProcessingService {
  private isInitialized = false;
  private workerPath: string = '/pdf.worker.js';

  /**
   * Initialise le service PDF
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Vérifier que PDF.js est disponible
      if (typeof getDocument === 'function') {
        this.isInitialized = true;
        logger.info('SYSTEM', '✅ Service PDF initialisé avec PDF.js local');
      } else {
        throw new Error('PDF.js non disponible');
      }
    } catch (error) {
      logger.error('SYSTEM', '❌ Erreur d\'initialisation PDF:', error);
      throw error;
    }
  }

  /**
   * Traite un fichier PDF et le convertit en images
   */
  async processPDF(
    pdfFile: File,
    config: Partial<PDFProcessingConfig> = {}
  ): Promise<PDFProcessingResult> {
    const startTime = performance.now();
    
    try {
      await this.initialize();
      
      const finalConfig: PDFProcessingConfig = {
        scale: 2.0,
        quality: 0.8,
        maxPages: 10,
        ...config
      };

      logger.info('SYSTEM', '🚀 Début du traitement PDF avec PDF.js local', {
        fileName: pdfFile.name,
        fileSize: pdfFile.size,
        config: finalConfig
      });

      // Convertir le fichier en ArrayBuffer
      const arrayBuffer = await pdfFile.arrayBuffer();
      
      // Charger le document PDF
      const pdfDoc = await getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false
      }).promise;

      const pageCount = Math.min(pdfDoc.numPages, finalConfig.maxPages || pdfDoc.numPages);
      const pages: PDFPageResult[] = [];
      let allText = '';

      // Traiter chaque page
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        if (finalConfig.pageRange && !finalConfig.pageRange.includes(pageNum)) {
          continue;
        }

        logger.info('SYSTEM', `📄 Traitement de la page ${pageNum}/${pageCount}`);

        // Charger la page
        const page = await pdfDoc.getPage(pageNum);
        
        // Extraire le texte de la page
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        allText += `\n--- Page ${pageNum} ---\n${pageText}\n`;

        // Convertir la page en image
        const imageData = await this.convertPageToImage(page, finalConfig);
        const pageResult: PDFPageResult = {
          pageNumber: pageNum,
          imageData,
          width: imageData.width,
          height: imageData.height,
          text: pageText
        };
        pages.push(pageResult);
      }

      const processingTime = performance.now() - startTime;

      logger.info('SYSTEM', '✅ Traitement PDF terminé avec succès', {
        pagesProcessed: pages.length,
        processingTime: processingTime.toFixed(2) + 'ms'
      });

      return {
        pages,
        text: allText,
        metadata: {
          pageCount: pdfDoc.numPages,
          title: (pdfDoc as any).info?.Title,
          author: (pdfDoc as any).info?.Author,
          subject: (pdfDoc as any).info?.Subject,
          creator: (pdfDoc as any).info?.Creator,
          producer: (pdfDoc as any).info?.Producer,
          creationDate: (pdfDoc as any).info?.CreationDate,
          modificationDate: (pdfDoc as any).info?.ModDate
        },
        processingTime
      };

    } catch (error) {
      const processingTime = performance.now() - startTime;
      logger.error('SYSTEM', '❌ Erreur lors du traitement PDF:', error);
      throw new Error(`Erreur PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Convertit une page PDF en ImageData
   */
  private async convertPageToImage(
    page: PDFPageProxy,
    config: PDFProcessingConfig
  ): Promise<ImageData> {
    const viewport = page.getViewport({ scale: config.scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Rendu de la page sur le canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas
    }).promise;

    // Conversion en ImageData
    return context.getImageData(0, 0, canvas.width, canvas.height);
  }

  /**
   * Extrait uniquement le texte d'un PDF
   */
  async extractText(pdfFile: File): Promise<string> {
    try {
      await this.initialize();
      
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false
      }).promise;

      let allText = '';
      
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        allText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
      }

      return allText;

    } catch (error) {
      logger.error('SYSTEM', '❌ Erreur lors de l\'extraction de texte:', error);
      throw new Error(`Erreur extraction texte: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Vérifie si le service est disponible
   */
  isAvailable(): boolean {
    return this.isInitialized && typeof getDocument === 'function';
  }

  /**
   * Obtient les informations du service
   */
  getServiceInfo(): {
    name: string;
    version: string;
    available: boolean;
    workerPath: string;
  } {
    return {
      name: 'PDF.js Local',
      version: '3.0+',
      available: this.isAvailable(),
      workerPath: this.workerPath
    };
  }
}

// Instance singleton
export const pdfProcessingService = new PDFProcessingService();