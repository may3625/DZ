/**
 * 🇩🇿 Moteur OCR arabe avancé pour l'Algérie
 * Corrections spécialisées pour textes juridiques algériens
 * - Séparation mots collés (رئاسيرقم → رقم رئاسي)
 * - Direction RTL native
 * - Nettoyage marqueurs parasites
 * - Liaisons caractères arabes améliorées
 */

import { tesseractWorkerService } from './tesseractWorker';
import { ArabicTextProcessor } from '@/utils/arabicTextProcessor';

export interface AdvancedArabicOCRResult {
  text: string;
  originalText: string;
  confidence: number;
  language: 'ara' | 'fra' | 'mixed';
  arabicRatio: number;
  processingTime: number;
  wordCount: number;
  corrections: {
    wordsSeparated: number;
    ligaturesCorrected: number;
    rtlMarkersCleaned: number;
    directionCorrected: boolean;
    legalTermsNormalized: number;
  };
  qualityMetrics: {
    textCoherence: number;
    arabicStructureIntegrity: number;
    legalTermAccuracy: number;
  };
}

export interface ArabicOCRConfig {
  enableAdvancedPreprocessing: boolean;
  enableWordSeparation: boolean;
  enableRTLCorrection: boolean;
  enableLegalTermCorrection: boolean;
  confidenceThreshold: number;
  maxProcessingTime: number;
}

class AdvancedArabicOCREngine {
  private config: ArabicOCRConfig = {
    enableAdvancedPreprocessing: true,
    enableWordSeparation: true,
    enableRTLCorrection: true,
    enableLegalTermCorrection: true,
    confidenceThreshold: 0.6,
    maxProcessingTime: 30000 // 30 secondes max
  };

  constructor() {
    console.log('🇩🇿 [AVANCÉ] Moteur OCR arabe nouvelle génération initialisé');
  }

  /**
   * Configuration du moteur OCR
   */
  configure(config: Partial<ArabicOCRConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('⚙️ [AVANCÉ] Configuration mise à jour:', this.config);
  }

  /**
   * Extraction OCR avec traitement avancé
   */
  async extractText(file: File): Promise<AdvancedArabicOCRResult> {
    const startTime = performance.now();
    console.log(`🚀 [AVANCÉ] Début extraction améliorée: ${file.name}`);

    try {
      // 1. Configuration Tesseract optimisée pour l'arabe
      const worker = await this.getOptimizedTesseractWorker();
      
      // 2. Préprocessing intelligent de l'image
      const preprocessedFile = this.config.enableAdvancedPreprocessing 
        ? await this.preprocessImageForArabic(file)
        : file;

      // 3. Extraction OCR avec paramètres optimisés
      const result = await worker.recognize(preprocessedFile);
      const rawText = result.data.text;
      
      // 4. Analyse du contenu
      const { language, arabicRatio } = this.analyzeTextLanguage(rawText);
      
      // 5. Post-traitement avancé
      const processedResult = this.config.enableAdvancedPreprocessing
        ? ArabicTextProcessor.processArabicText(rawText)
        : {
            originalText: rawText,
            processedText: rawText,
            corrections: [],
            arabicRatio,
            language: language as 'ar' | 'fr' | 'mixed',
            preprocessing: 'Aucun',
            wordsSeparated: 0,
            ligaturesCorrected: 0
          };

      // 6. Métriques qualité
      const qualityMetrics = this.calculateQualityMetrics(
        processedResult.processedText, 
        arabicRatio
      );

      const processingTime = performance.now() - startTime;
      const wordCount = processedResult.processedText.trim()
        .split(/\s+/).filter(word => word.length > 0).length;

      console.log(`✅ [AVANCÉ] Extraction terminée: ${processingTime.toFixed(0)}ms`);
      console.log(`📊 [AVANCÉ] Qualité: Cohérence ${qualityMetrics.textCoherence.toFixed(2)}`);

      return {
        text: processedResult.processedText,
        originalText: rawText,
        confidence: result.data.confidence / 100,
        language: language as 'ara' | 'fra' | 'mixed',
        arabicRatio,
        processingTime,
        wordCount,
        corrections: {
          wordsSeparated: processedResult.wordsSeparated,
          ligaturesCorrected: processedResult.ligaturesCorrected,
          rtlMarkersCleaned: this.countRTLMarkersRemoved(rawText, processedResult.processedText),
          directionCorrected: processedResult.corrections.includes('Correction de la direction RTL'),
          legalTermsNormalized: this.countLegalTermsNormalized(processedResult.corrections)
        },
        qualityMetrics
      };

    } catch (error) {
      console.error('❌ [AVANCÉ] Erreur extraction:', error);
      throw new Error(`Erreur OCR arabe avancé: ${error.message}`);
    }
  }

  /**
   * Configuration Tesseract optimisée pour l'arabe RTL
   */
  private async getOptimizedTesseractWorker() {
    const worker = await tesseractWorkerService.getTesseractWorker();
    
    // Configuration avancée pour l'arabe
    await worker.setParameters({
      tessedit_pageseg_mode: '6', // Bloc de texte uniforme
      tessedit_ocr_engine_mode: '1', // LSTM uniquement pour meilleure précision
      preserve_interword_spaces: '1', // Préserver espaces entre mots
      tessedit_char_whitelist: this.getArabicCharacterSet(),
      tessedit_enable_dict_correction: '1',
      textord_really_old_xheight: '1', // Meilleure gestion hauteur caractères arabes
      textord_min_linesize: '2.5', // Adaptation lignes arabes
      enable_new_segsearch: '0', // Désactiver recherche segments (problème RTL)
      classify_enable_learning: '0', // Stable pour production
      classify_enable_adaptive_matcher: '1' // Adaptation dynamique
    });

    return worker;
  }

  /**
   * Jeu de caractères étendu pour l'arabe algérien
   */
  private getArabicCharacterSet(): string {
    return [
      // Caractères arabes de base
      'ابتثجحخدذرزسشصضطظعغفقكلمنهويءآأؤإئ',
      // Voyelles et diacritiques
      'َُِّْ',
      // Chiffres arabes
      '٠١٢٣٤٥٦٧٨٩',
      // Chiffres latins
      '0123456789',
      // Ponctuation arabe
      '؟،؛»«',
      // Ponctuation latine
      '.,!?;:()',
      // Lettres françaises
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      'àáâäèéêëìíîïòóôöùúûüÿçÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜŸÇ',
      // Espaces et symboles
      ' \n\t-/'
    ].join('');
  }

  /**
   * Préprocessing intelligent pour images contenant de l'arabe
   */
  private async preprocessImageForArabic(file: File): Promise<File> {
    // Pour l'instant, retourne le fichier original
    // Une implémentation future pourrait inclure :
    // - Amélioration contraste pour texte arabe
    // - Détection et correction orientation
    // - Nettoyage bruit spécifique aux documents arabes
    return file;
  }

  /**
   * Analyse de langue avec heuristiques améliorées
   */
  private analyzeTextLanguage(text: string): { language: 'ara' | 'fra' | 'mixed'; arabicRatio: number } {
    const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
    const frenchChars = (text.match(/[a-zA-ZàáâäèéêëìíîïòóôöùúûüÿçÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜŸÇ]/g) || []).length;
    
    const totalChars = arabicChars + frenchChars;
    const arabicRatio = totalChars > 0 ? arabicChars / totalChars : 0;
    
    let language: 'ara' | 'fra' | 'mixed' = 'fra';
    if (arabicRatio > 0.7) {
      language = 'ara';
    } else if (arabicRatio > 0.2) {
      language = 'mixed';
    }
    
    console.log(`📊 [AVANCÉ] Analyse langue: ${Math.round(arabicRatio * 100)}% arabe → ${language}`);
    return { language, arabicRatio };
  }

  /**
   * Calcul métriques qualité du texte extrait
   */
  private calculateQualityMetrics(text: string, arabicRatio: number): { 
    textCoherence: number; 
    arabicStructureIntegrity: number; 
    legalTermAccuracy: number; 
  } {
    // Cohérence du texte (ratio mots valides)
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const validWords = words.filter(w => 
      /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-ZàáâäèéêëìíîïòóôöùúûüÿçÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜŸÇ0-9٠-٩]+$/.test(w)
    );
    const textCoherence = words.length > 0 ? validWords.length / words.length : 0;

    // Intégrité structure arabe
    const arabicWords = words.filter(w => /[\u0600-\u06FF]/.test(w));
    const wellFormedArabicWords = arabicWords.filter(w => 
      // Vérifier que les mots arabes ont une structure cohérente
      !/[ا-ي]{10,}/.test(w) && // Pas de mots trop longs (probable erreur)
      !/^[ا-ي]$/.test(w) // Pas de lettres isolées
    );
    const arabicStructureIntegrity = arabicWords.length > 0 
      ? wellFormedArabicWords.length / arabicWords.length 
      : 1;

    // Précision termes juridiques (présence termes courants)
    const legalTerms = [
      'مرسوم', 'رئاسي', 'تنفيذي', 'قانون', 'الجمهورية', 'الجزائرية',
      'المؤرخ', 'الموافق', 'رقم', 'المادة', 'الفصل'
    ];
    const foundLegalTerms = legalTerms.filter(term => text.includes(term));
    const legalTermAccuracy = legalTerms.length > 0 
      ? foundLegalTerms.length / legalTerms.length 
      : 0.5; // Neutre si pas de termes juridiques

    return {
      textCoherence,
      arabicStructureIntegrity,
      legalTermAccuracy
    };
  }

  /**
   * Compte les marqueurs RTL/LTR supprimés
   */
  private countRTLMarkersRemoved(originalText: string, processedText: string): number {
    const rtlMarkers = /[\u200E\u200F\u202A\u202B\u202C\u202D\u202E\u2066-\u2069]/g;
    const originalMarkers = (originalText.match(rtlMarkers) || []).length;
    const processedMarkers = (processedText.match(rtlMarkers) || []).length;
    return originalMarkers - processedMarkers;
  }

  /**
   * Compte les termes juridiques normalisés
   */
  private countLegalTermsNormalized(corrections: string[]): number {
    return corrections.filter(correction => 
      correction.includes('officiel') || 
      correction.includes('décret') || 
      correction.includes('juridique')
    ).length;
  }

  /**
   * Validation et test du moteur
   */
  async testEngine(testFile: File): Promise<{
    success: boolean;
    metrics: AdvancedArabicOCRResult;
    recommendations: string[];
  }> {
    try {
      const result = await this.extractText(testFile);
      const recommendations: string[] = [];

      // Analyser les résultats et donner des recommandations
      if (result.confidence < 0.7) {
        recommendations.push('Qualité image faible - essayer un scan de meilleure résolution');
      }
      
      if (result.qualityMetrics.textCoherence < 0.8) {
        recommendations.push('Texte fragmenté - vérifier orientation et éclairage');
      }

      if (result.corrections.wordsSeparated > 10) {
        recommendations.push('Nombreux mots collés détectés - document très dégradé');
      }

      return {
        success: true,
        metrics: result,
        recommendations
      };

    } catch (error) {
      return {
        success: false,
        metrics: null as any,
        recommendations: [`Erreur test: ${error.message}`]
      };
    }
  }

  /**
   * Nettoyage ressources
   */
  async cleanup(): Promise<void> {
    console.log('🧹 [AVANCÉ] Nettoyage moteur OCR arabe avancé');
    // Délégation au service unifié
  }
}

// Export singleton
export const advancedArabicOCREngine = new AdvancedArabicOCREngine();
export default advancedArabicOCREngine;