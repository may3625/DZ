import { createWorker } from 'tesseract.js';
import { TESSERACT_CONFIG, checkTesseractAvailability, getTesseractConfig } from '../config/tesseract';
import { getErrorMessage } from '@/utils/safeError';

/**
 * Service OCR unifié qui gère les problèmes CSP et utilise les fichiers locaux
 */
export class UnifiedOCRService {
  private worker: any = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialise le service OCR avec gestion des erreurs CSP
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log('🔧 [OCR] Initialisation du service OCR unifié...');
      
      // Vérifier la disponibilité des fichiers locaux
      const isLocalAvailable = await checkTesseractAvailability();
      console.log('📁 [OCR] Fichiers locaux disponibles:', isLocalAvailable);
      
      // Obtenir la configuration strictement locale
      const config = getTesseractConfig();
      console.log('⚙️ [OCR] Configuration utilisée:', config);
      
      // Créer le worker avec la configuration appropriée pour français ET arabe
      this.worker = await createWorker(config.defaultLanguage, 1, {
        ...config.workerOptions
        // Utiliser les CDN par défaut de Tesseract.js
      });

      // Configurer les paramètres OCR
      await this.worker.setParameters(config.parameters);
      
      this.isInitialized = true;
      console.log('✅ [OCR] Service OCR initialisé avec succès');
      
    } catch (error) {
      console.error('❌ [OCR] Erreur lors de l\'initialisation:', error);
      
      // AUCUN fallback réseau: échouer explicitement en mode local strict
      throw new Error('Ressources Tesseract locales indisponibles');
    }
  }

  /**
   * Extrait le texte d'une image avec gestion des erreurs
   */
  async extractText(image: File | HTMLCanvasElement | ImageData): Promise<{
    text: string;
    confidence: number;
    language: string;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('🔍 [OCR] Début de l\'extraction de texte...');
      
      const result = await this.worker.recognize(image);
      
      console.log('✅ [OCR] Extraction terminée avec succès');
      
      // Détecter la langue du texte extrait
      const hasArabic = /[\u0600-\u06FF]/.test(result.data.text);
      const hasFrench = /[a-zA-ZÀ-ÿ]/.test(result.data.text);
      const detectedLanguage = hasArabic && hasFrench ? 'mixed' : hasArabic ? 'ara' : 'fra';
      
      return {
        text: result.data.text,
        confidence: result.data.confidence / 100,
        language: detectedLanguage
      };
      
    } catch (error) {
      console.error('❌ [OCR] Erreur lors de l\'extraction:', error);
      
      // Si c'est une erreur CSP, essayer de réinitialiser avec une configuration différente
      const msg = getErrorMessage(error);
      if (msg.includes('CSP') || msg.includes('importScripts')) {
        console.log('🔄 [OCR] Erreur CSP détectée, tentative de réinitialisation...');
        this.isInitialized = false;
        this.worker = null;
        await this.initialize();
        return this.extractText(image);
      }
      
      throw new Error(`Erreur OCR: ${msg}`);
    }
  }

  /**
   * Extrait le texte d'un PDF en le convertissant d'abord en images
   */
  async extractFromPDF(pdfFile: File): Promise<{
    text: string;
    pages: Array<{ text: string; confidence: number; pageNumber: number }>;
    totalConfidence: number;
  }> {
    try {
      console.log('📄 [OCR] Début de l\'extraction PDF RÉELLE...');
      
      // Import dynamique de PDF.js pour éviter les erreurs CSP
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      const pages: Array<{ text: string; confidence: number; pageNumber: number }> = [];
      let allText = '';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`📄 [OCR] Traitement page ${pageNum}/${pdf.numPages}...`);
        
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        
        // Créer un canvas pour la page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Impossible de créer le contexte canvas');
        }
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Rendre la page sur le canvas  
        const renderContext: any = {
          canvasContext: context,
          viewport: viewport
        };
        await page.render(renderContext).promise;
        
        // Convertir le canvas en blob pour l'OCR
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Impossible de convertir le canvas en blob'));
          }, 'image/png');
        });
        
        // Créer un fichier image pour l'OCR
        const imageFile = new File([blob], `page-${pageNum}.png`, { type: 'image/png' });
        
        // Extraire le texte avec OCR
        const ocrResult = await this.extractText(imageFile);
        
        const pageResult = {
          text: ocrResult.text,
          confidence: ocrResult.confidence,
          pageNumber: pageNum
        };
        
        pages.push(pageResult);
        allText += ocrResult.text + '\n';
        
        console.log(`✅ [OCR] Page ${pageNum} traitée - Confiance: ${(ocrResult.confidence * 100).toFixed(1)}%`);
      }
      
      const totalConfidence = pages.reduce((sum, page) => sum + page.confidence, 0) / pages.length;
      
      console.log(`✅ [OCR] Extraction PDF RÉELLE terminée - ${pages.length} pages - Confiance moyenne: ${(totalConfidence * 100).toFixed(1)}%`);
      
      return {
        text: allText,
        pages,
        totalConfidence
      };
      
    } catch (error) {
      console.error('❌ [OCR] Erreur lors de l\'extraction PDF RÉELLE:', error);
      const msg = getErrorMessage(error);
      throw new Error(`Erreur extraction PDF: ${msg}`);
    }
  }

  /**
   * Nettoie et libère les ressources
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      try {
        await this.worker.terminate();
        this.worker = null;
        this.isInitialized = false;
        console.log('🧹 [OCR] Service OCR terminé et nettoyé');
      } catch (error) {
        console.error('❌ [OCR] Erreur lors de la terminaison:', error);
      }
    }
  }

  /**
   * Vérifie l'état du service
   */
  getStatus(): {
    isInitialized: boolean;
    workerAvailable: boolean;
    localFilesAvailable: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      workerAvailable: !!this.worker,
      localFilesAvailable: false // Sera mis à jour lors de l'initialisation
    };
  }
}

// Instance singleton
export const unifiedOCRService = new UnifiedOCRService();