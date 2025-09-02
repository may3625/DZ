/**
 * Service OCR unifié 100% RÉEL - Plus aucune simulation
 * Remplace tous les services qui utilisent de la simulation
 */

import { createWorker } from 'tesseract.js';
import { logger } from '@/utils/logger';
import { getErrorMessage } from '@/utils/safeError';

export interface RealOCRResult {
  text: string;
  confidence: number;
  language: string;
  pages?: number;
  processingTime: number;
}

class RealUnifiedOCRService {
  private worker: any = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    console.log('🔧 Service OCR Unifié Réel - 100% sans simulation');
  }

  /**
   * Initialisation du worker Tesseract.js - RÉEL UNIQUEMENT
   */
  private async performInitialization(): Promise<void> {
    try {
      console.log('🔧 [RÉEL] Initialisation Tesseract.js...');
      
      // CRITIQUE: Arabe EN PRIORITÉ pour documents algériens
      console.log('🇩🇿 [UNIFIÉ] ARABE PRIORITAIRE - Mode optimisé RTL');
      this.worker = await createWorker(['ara', 'fra'], 1, {
        logger: (m: any) => console.log('🔍 [TESSERACT-ARABE-UNIFIÉ]', m),
        errorHandler: (err: any) => console.warn('⚠️ Tesseract warning (unifié):', err)
      });

      // Configuration OCR CRITIQUE pour documents algériens
      const { getAlgerianArabicWhitelist, ARABIC_OCR_PARAMETERS } = await import('@/config/arabicCharacterSets');
      
      await this.worker.setParameters({
        // Caractères arabes algériens prioritaires
        tessedit_char_whitelist: getAlgerianArabicWhitelist(true),
        
        // CRITIQUE: PSM Mode 1 pour arabe RTL avec OSD
        tessedit_pageseg_mode: '1', // Auto OSD - ESSENTIEL pour RTL
        
        // CRITIQUE: OCR Engine 3 pour arabe algérien optimal  
        tessedit_ocr_engine_mode: '3', // Legacy + LSTM - meilleur pour arabe
        
        // Paramètres RTL essentiels
        preserve_interword_spaces: '1',
        textord_arabic_numerals: '1', 
        textord_heavy_nr: '1',
        textord_min_linesize: '2.5',
        
        // Désactiver dictionnaires français qui interfèrent
        load_system_dawg: '0',
        load_freq_dawg: '0',
        load_unambig_dawg: '0', 
        load_punc_dawg: '0',
        load_number_dawg: '0',
        
        // Optimisations RTL
        textord_tabfind_show_vlines: '0',
        textord_use_cjk_fp_model: '0',
        classify_enable_learning: '0',
        classify_enable_adaptive_matcher: '0',
        
        // Segmentation arabe améliorée
        chop_enable: '1',
        wordrec_num_seg_states: '40',
        
        // Espaces arabes
        tosp_enough_space_samples_for_median: '2',
        tosp_old_to_method: '0',
        
        // Paramètres avancés arabe
        ...ARABIC_OCR_PARAMETERS
      });

      this.isInitialized = true;
      console.log('✅ [RÉEL] Tesseract.js initialisé avec succès');
      
    } catch (error) {
      console.error('❌ [RÉEL] Erreur initialisation Tesseract:', error);
      this.isInitialized = false;
      const msg = getErrorMessage(error);
      throw new Error(`Échec initialisation OCR: ${msg}`);
    }
  }

  /**
   * Initialise le service - OBLIGATOIRE avant utilisation
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  /**
   * Extrait le texte d'une image ou d'un ImageData - 100% RÉEL
   */
  async extractText(input: File | HTMLCanvasElement | ImageData | Blob): Promise<RealOCRResult> {
    const startTime = Date.now();
    
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('Worker OCR non initialisé - extraction impossible');
    }

    try {
      console.log('🔄 [RÉEL] Traitement de l\'image...');
      
      // Si c'est ImageData, créer un canvas temporaire pour Tesseract
      let processedInput = input;
      if (input instanceof ImageData) {
        console.log('🔄 [RÉEL] Conversion ImageData vers Canvas...');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Impossible de créer le contexte canvas');
        }
        
        canvas.width = input.width;
        canvas.height = input.height;
        ctx.putImageData(input, 0, 0);
        processedInput = canvas;
      }
      
      const result = await this.worker.recognize(processedInput);
      const processingTime = Date.now() - startTime;
      
      if (!result || !result.data) {
        throw new Error('Résultat OCR invalide');
      }

      const extractedText = result.data.text || '';
      const confidence = (result.data.confidence || 0) / 100;
      
      // CORRECTION MAJEURE: Application des corrections OCR arabes avancées
      let processedText = extractedText;
      const arabicCharsRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
      const arabicMatches = extractedText.match(arabicCharsRegex) || [];
      
      if (arabicMatches.length > 0) {
        console.log('🔄 [UNIFIÉ-CORRECTION] Application corrections OCR arabe...');
        const { correctArabicOCR } = await import('@/utils/arabicOCRCorrections');
        const correctionResult = correctArabicOCR(extractedText);
        processedText = correctionResult.correctedText;
        
        console.log(`✨ [UNIFIÉ-CORRECTION] ${correctionResult.corrections.length} corrections appliquées:`, correctionResult.corrections);
        console.log(`📝 ${correctionResult.wordsSeparated} mots séparés, ${correctionResult.ligaturesFixed} liaisons corrigées`);
      }
      
      // Détection de langue CRITIQUE améliorée
      const frenchCharsRegex = /[A-Za-zÀ-ÿ]/g;
      
      const frenchMatches = processedText.match(frenchCharsRegex) || [];
      const processedArabicMatches = processedText.match(arabicCharsRegex) || [];
      
      // Calculer ratio plus précis
      const totalLetters = processedArabicMatches.length + frenchMatches.length;
      const arabicRatio = totalLetters > 0 ? processedArabicMatches.length / totalLetters : 0;
      
      // Détection langue améliorée avec seuils
      let language: string;
      if (arabicRatio > 0.7) {
        language = 'ara';  // Majoritairement arabe
      } else if (arabicRatio > 0.2) {
        language = 'mixed'; // Bilingue significatif
      } else {
        language = 'fra';   // Majoritairement français
      }
      
      console.log(`🔍 [UNIFIÉ-DÉTECTION] Arabe: ${processedArabicMatches.length}, Français: ${frenchMatches.length}, Ratio arabe: ${Math.round(arabicRatio * 100)}%, Langue: ${language}`);

      console.log(`✅ [RÉEL] OCR terminé: ${processedText.length} caractères, confiance: ${(confidence * 100).toFixed(1)}%`);
      
      return {
        text: processedText,
        confidence,
        language,
        pages: 1,
        processingTime
      };
      
    } catch (error) {
      console.error('❌ [RÉEL] Erreur lors de l\'extraction OCR:', error);
      const msg = getErrorMessage(error);
      throw new Error(`Extraction OCR échouée: ${msg}`);
    }
  }

  /**
   * Extrait le texte d'un PDF - 100% RÉEL
   */
  async extractFromPDF(pdfFile: File): Promise<RealOCRResult> {
    const startTime = Date.now();
    
    try {
      console.log('📄 [RÉEL] Début extraction PDF...');
      
      // Import dynamique de PDF.js
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let allText = '';
      let totalConfidence = 0;
      let pageCount = 0;
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`📄 [RÉEL] Traitement page ${pageNum}/${pdf.numPages}...`);
        
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
        await page.render({
          canvasContext: context,
          viewport: viewport
        } as any).promise;
        
        // Extraire le texte avec OCR
        const pageResult = await this.extractText(canvas);
        
        allText += pageResult.text + '\n\n--- PAGE SUIVANTE ---\n\n';
        totalConfidence += pageResult.confidence;
        pageCount++;
        
        console.log(`✅ [RÉEL] Page ${pageNum} traitée - ${pageResult.text.length} caractères`);
      }
      
      const avgConfidence = pageCount > 0 ? totalConfidence / pageCount : 0;
      const processingTime = Date.now() - startTime;
      
      // Détection de langue globale
      const hasArabic = /[\u0600-\u06FF]/.test(allText);
      const hasFrench = /[a-zA-ZÀ-ÿ]/.test(allText);
      const language = hasArabic && hasFrench ? 'mixed' : hasArabic ? 'ara' : 'fra';
      
      console.log(`✅ [RÉEL] PDF traité: ${pageCount} pages, ${allText.length} caractères totaux`);
      
      return {
        text: allText,
        confidence: avgConfidence,
        language,
        pages: pageCount,
        processingTime
      };
      
    } catch (error) {
      console.error('❌ [RÉEL] Erreur extraction PDF:', error);
      const msg = getErrorMessage(error);
      throw new Error(`Extraction PDF échouée: ${msg}`);
    }
  }

  /**
   * Vérifie si le service est prêt
   */
  isReady(): boolean {
    return this.isInitialized && !!this.worker;
  }

  /**
   * Nettoie les ressources
   */
  async cleanup(): Promise<void> {
    if (this.worker) {
      try {
        await this.worker.terminate();
        this.worker = null;
        this.isInitialized = false;
        this.initPromise = null;
        console.log('🧹 [RÉEL] Service OCR nettoyé');
      } catch (error) {
        console.error('❌ [RÉEL] Erreur lors du nettoyage:', error);
      }
    }
  }
}

// Instance singleton
export const realUnifiedOCRService = new RealUnifiedOCRService();

// Export par défaut
export default realUnifiedOCRService;