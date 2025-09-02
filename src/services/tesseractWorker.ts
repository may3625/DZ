/**
 * Service worker Tesseract.js simplifié pour éviter les requêtes externes
 * Version locale sans dépendances CDN
 */

import { logger } from '@/utils/logger';
import { getErrorMessage } from '@/utils/safeError';

export interface SimpleTesseractResult {
  data: {
    text: string;
    confidence: number;
    words: Array<{
      text: string;
      confidence: number;
      bbox: { x0: number; y0: number; x1: number; y1: number };
    }>;
  };
}

class TesseractWorkerService {
  private isInitialized = false;

  /**
   * Compatibilité avec l'ancien code
   */
  async getStatus() {
    return { status: this.isInitialized ? 'ready' : 'initializing' };
  }

  constructor() {
    logger.info('OCR', '🔧 Service Tesseract local initialisé (mode hors ligne)');
  }

  /**
   * Service OCR 100% ALGÉRIEN - Bilingue Arabe/Français - Local
   */
  async getTesseractWorker(): Promise<any> {
    if (!this.isInitialized) {
      await this.performInitialization();
    }

    try {
      // Import dynamique de Tesseract.js
      const { createWorker } = await import('tesseract.js');
      
      logger.info('OCR', '🇩🇿 [TESSERACT-ALGÉRIE] Initialisation OCR bilingue (عربي/français)');
      
      // Configuration OCR OPTIMISÉE POUR L'ALGÉRIE - Bilingue ara+fra
      const worker = await createWorker('ara+fra', 1, {
        logger: (m: any) => {
          // Messages bilingues pour debug
          if (m.status === 'initializing') {
            logger.info('OCR', '🔄 [DZ-OCR] تهيئة المحرك البصري / Initialisation moteur OCR');
          } else if (m.status === 'loading language') {
            logger.info('OCR', '📥 [DZ-OCR] تحميل اللغة / Chargement langue:', m.progress || 0);
          } else {
            logger.info('OCR', '🔍 [DZ-OCR]', m);
          }
        },
        errorHandler: (err: any) => {
          logger.warn('OCR', '⚠️ [DZ-OCR] تحذير / Avertissement:', err);
        }
      });

      logger.info('OCR', '🌍 [DZ-OCR] لغات محملة / Langues chargées: ara+fra');

      // ÉTAPE 3: Configuration OCR OPTIMISÉE POUR L'ALGÉRIE
      logger.info('OCR', '⚙️ [DZ-OCR] ضبط المعاملات الجزائرية / Configuration paramètres algériens');
      await worker.setParameters({
        // Mode segmentation adapté aux documents officiels algériens
        tessedit_pageseg_mode: '1' as any, // Auto OSD - détection automatique orientation/script
        
        // Moteur LSTM pour meilleure précision sur l'arabe
        tessedit_ocr_engine_mode: '2' as any, // LSTM uniquement
        
        // Paramètres optimisés pour textes bilingues algériens
        preserve_interword_spaces: '1', // Préserver espaces (important pour l'arabe)
        textord_arabic_numerals: '1',   // Support chiffres arabes
        
        // Dictionnaires activés pour meilleure précision
        load_system_dawg: '1',
        load_freq_dawg: '1', 
        load_unambig_dawg: '1',
        load_punc_dawg: '1',
        load_number_dawg: '1',
        
        // Paramètres spécifiques algériens
        tessedit_char_blacklist: '|§©®™€£¥', // Caractères parasites fréquents
        textord_noise_rejection: '1' // Réduction bruit pour docs scannés
      });

      return {
        recognize: async (file: File | Blob): Promise<SimpleTesseractResult> => {
          const fileName = file instanceof File ? file.name : 'blob';
          logger.info('OCR', '📖 [DZ-OCR] بدء المعالجة / Début traitement:', fileName);

          try {
            // Traitement OCR avec support bilingue algérien
            const result = await worker.recognize(file);
            
            const extractedText = result.data.text || '';
            const confidence = result.data.confidence || 0;
            
            // Détection automatique de la langue principale
            const arabicChars = (extractedText.match(/[\u0600-\u06FF]/g) || []).length;
            const frenchChars = (extractedText.match(/[A-Za-zÀ-ÿ]/g) || []).length;
            const totalChars = arabicChars + frenchChars;
            
            let detectedLang = '';
            if (totalChars > 0) {
              const arabicRatio = arabicChars / totalChars;
              if (arabicRatio > 0.6) {
                detectedLang = 'عربي غالب / Majoritairement arabe';
              } else if (arabicRatio > 0.2) {
                detectedLang = 'مختلط / Bilingue';
              } else {
                detectedLang = 'فرنسي غالب / Majoritairement français';
              }
            }
            
            logger.info('OCR', `✅ [DZ-OCR] انتهاء المعالجة / Traitement terminé: ${extractedText.length} caractères, confiance: ${confidence.toFixed(1)}%, langue: ${detectedLang}`);
            
            return {
              data: {
                text: extractedText,
                confidence: confidence,
                words: (result.data as any).words || []
              }
            };
          } catch (error) {
            logger.error('OCR', '❌ [DZ-OCR] خطأ في الاستخراج / Erreur extraction', { error });
            const msg = getErrorMessage(error);
            throw new Error(`فشل استخراج OCR / Extraction OCR échouée: ${msg}`);
          }
        },
        setParameters: async (params: any) => {
          logger.info('OCR', '⚙️ [DZ-OCR] ضبط المعاملات / Configuration paramètres', params);
          return worker.setParameters(params);
        },
        terminate: async () => {
          logger.info('OCR', '🔌 [DZ-OCR] إيقاف المحرك / Arrêt worker');
          return worker.terminate();
        }
      };
      
    } catch (error) {
      logger.error('OCR', 'Erreur création worker Tesseract', { error });
      
      // ERREUR CRITIQUE - Ne pas masquer avec fallback silencieux
      logger.error('OCR', '🚨 [DZ-OCR] فشل حرج في التهيئة / Échec critique initialisation');
      throw new Error(`🇩🇿 [OCR-ALGÉRIE] فشل في تهيئة محرك الـ OCR / Échec initialisation moteur OCR: ${getErrorMessage(error)}`);
    }
  }

  private async performInitialization(): Promise<void> {
    logger.info('OCR', '🇩🇿 [DZ-OCR] بدء التهيئة للجزائر / Initialisation pour l\'Algérie...');
    
    try {
      // Validation que Tesseract.js est disponible
      const tesseract = await import('tesseract.js');
      if (!tesseract.createWorker) {
        throw new Error('Tesseract.js غير متوفر / non disponible');
      }
      
      logger.info('OCR', '📚 [DZ-OCR] Tesseract.js متوفر / disponible - Support ara+fra activé');
      
      this.isInitialized = true;
      logger.info('OCR', '✅ [DZ-OCR] جاهز للاستخدام / Prêt pour utilisation bilingue');
      
    } catch (error) {
      logger.error('OCR', '❌ [DZ-OCR] فشل التهيئة / Erreur initialisation', { error });
      throw new Error(`Échec initialisation OCR Algérie: ${getErrorMessage(error)}`);
    }
  }

  async cleanup(): Promise<void> {
    logger.info('OCR', '🧹 Nettoyage service Tesseract');
    this.isInitialized = false;
  }
}

export const tesseractWorkerService = new TesseractWorkerService();
export default tesseractWorkerService;