/**
 * Service d'extraction spécialisé pour les documents juridiques algériens
 * Intègre le service OCR de base avec des traitements spécifiques à l'Algérie
 */

import { RealOCRResult, processDocumentOCR } from './realOcrService';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface AlgerianTextRegion {
  text: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  language: 'ar' | 'fr' | 'mixed';
  entityType?: 'date' | 'number' | 'institution' | 'reference' | 'text';
}

export interface AlgerianExtractionResult {
  id: string;
  originalFilename: string;
  fileType: string;
  totalPages: number;
  extractedText: string;
  textRegions: AlgerianTextRegion[][];
  metadata: {
    processingTime: number;
    averageConfidence: number;
    languageDistribution: { ar: number; fr: number; mixed: number };
    detectedEntities: Record<string, any[]>;
    isMixedLanguage: boolean;
    documentType?: string;
    processingDate: string;
  };
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  confidenceScore: number;
  languageDetected: string;
  isMixedLanguage: boolean;
}

/**
 * Détecte la langue d'un texte (arabe, français ou mixte)
 */
function detectLanguage(text: string): 'ar' | 'fr' | 'mixed' {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const frenchPattern = /[a-zA-ZÀ-ÿ]/;
  
  const hasArabic = arabicPattern.test(text);
  const hasFrench = frenchPattern.test(text);
  
  if (hasArabic && hasFrench) return 'mixed';
  if (hasArabic) return 'ar';
  if (hasFrench) return 'fr';
  return 'fr'; // par défaut
}

/**
 * Détecte les entités juridiques algériennes
 */
function detectAlgerianEntities(text: string, language: 'ar' | 'fr' | 'mixed') {
  const entities: Record<string, any[]> = {
    dates: [],
    numbers: [],
    institutions: [],
    references: []
  };

  // Patterns pour les dates
  const datePatterns = [
    /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
    /\b\d{1,2}-\d{1,2}-\d{4}\b/g,
    /\b\d{4}\/\d{1,2}\/\d{1,2}\b/g,
    /\b\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}\b/gi
  ];

  // Patterns pour les numéros officiels algériens
  const numberPatterns = [
    /\bN°\s*\d+[-\/]\d+/gi,
    /\b\d{2}-\d{3}\b/g, // Format numéro wilaya
    /\bDZ\d{8,12}\b/gi // Numéros d'identification algériens
  ];

  // Institutions algériennes
  const institutionPatterns = [
    /\b(Ministère|Ministre|Wali|Wilaya|APC|APW|DJS|Direction|Inspection)\b/gi,
    /\b(وزارة|وزير|والي|ولاية|بلدية|مجلس)\b/g
  ];

  // Références juridiques
  const referencePatterns = [
    /\b(Loi|Décret|Arrêté|Ordonnance|Instruction)\s+n°?\s*\d+[-\/]\d+/gi,
    /\bJORA\s+n°?\s*\d+/gi,
    /\b(قانون|مرسوم|قرار|تعليمة)\s+رقم\s*\d+/g
  ];

  // Extraction des entités
  datePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      entities.dates.push(...matches.map(match => ({ value: match, confidence: 0.8 })));
    }
  });

  numberPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      entities.numbers.push(...matches.map(match => ({ value: match, confidence: 0.9 })));
    }
  });

  institutionPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      entities.institutions.push(...matches.map(match => ({ value: match, confidence: 0.85 })));
    }
  });

  referencePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      entities.references.push(...matches.map(match => ({ value: match, confidence: 0.9 })));
    }
  });

  return entities;
}

/**
 * Traite un document avec le service OCR de base et ajoute les traitements algériens
 */
export async function processAlgerianDocument(file: File): Promise<AlgerianExtractionResult> {
  const startTime = Date.now();
  
  try {
    logger.info('OCR', 'Début du traitement algérien', { filename: file.name });
    
    // Traitement OCR de base
    const baseResult = await processDocumentOCR(file);
    
    // Agrégation complète du texte de toutes les pages avec gestion intelligente
    const extractedText = aggregateTextFromPages(baseResult.pages);
    
    // Conversion des régions de texte avec détection de langue
    const textRegions: AlgerianTextRegion[][] = baseResult.pages.map(page => {
      const pageText = page.text || '';
      const textBlocks = pageText.split('\n').filter(text => text.trim());
      
      return textBlocks.map((text, index) => {
        const language = detectLanguage(text);
        return {
          text,
          confidence: 0.85, // Confidence par défaut
          bbox: {
            x: index * 100,
            y: 0,
            width: 100,
            height: 20
          },
          language,
          entityType: 'text'
        };
      });
    });
    
    // Détection de la langue globale
    const globalLanguage = detectLanguage(extractedText);
    const isMixedLanguage = globalLanguage === 'mixed';
    
    // Distribution des langues
    const languageDistribution = { ar: 0, fr: 0, mixed: 0 };
    textRegions.flat().forEach(region => {
      languageDistribution[region.language]++;
    });
    
    // Détection des entités juridiques
    const detectedEntities = detectAlgerianEntities(extractedText, globalLanguage);
    
    // Calcul de la confiance moyenne
    const averageConfidence = textRegions.flat()
      .reduce((sum, region) => sum + region.confidence, 0) / textRegions.flat().length;
    
    const processingTime = Date.now() - startTime;
    
    // Création du résultat
    const result: AlgerianExtractionResult = {
      id: crypto.randomUUID(),
      originalFilename: file.name,
      fileType: file.type,
      totalPages: baseResult.pages.length,
      extractedText,
      textRegions,
      metadata: {
        processingTime,
        averageConfidence,
        languageDistribution,
        detectedEntities,
        isMixedLanguage,
        documentType: determineDocumentType(extractedText),
        processingDate: new Date().toISOString()
      },
      processingStatus: 'completed',
      confidenceScore: averageConfidence,
      languageDetected: globalLanguage,
      isMixedLanguage
    };
    
    // Sauvegarde en base de données
    await saveExtractionResult(result);
    
    logger.info('OCR', 'Traitement algérien terminé', { 
      filename: file.name,
      processingTime,
      pages: baseResult.pages.length,
      language: globalLanguage
    });
    
    return result;
    
  } catch (error) {
    logger.error('OCR', 'Erreur lors du traitement algérien', error);
    throw error;
  }
}

/**
 * Détermine le type de document basé sur le contenu
 */
function determineDocumentType(text: string): string {
  if (text.match(/\b(Loi|قانون)\b/i)) return 'Loi';
  if (text.match(/\b(Décret|مرسوم)\b/i)) return 'Décret';
  if (text.match(/\b(Arrêté|قرار)\b/i)) return 'Arrêté';
  if (text.match(/\b(Ordonnance|أمر)\b/i)) return 'Ordonnance';
  if (text.match(/\b(Instruction|تعليمة)\b/i)) return 'Instruction';
  if (text.match(/\b(Circulaire|منشور)\b/i)) return 'Circulaire';
  return 'Document';
}

/**
 * Agrégation intelligente du texte avec préservation de la structure
 */
function aggregateTextFromPages(pages: Array<{ pageNumber: number; text: string; confidence: number }>): string {
  const aggregatedSections: string[] = [];
  
  for (const page of pages) {
    // Préfixe pour identifier la page
    const pageHeader = `\n--- Page ${page.pageNumber} ---\n`;
    
    // Le texte de la page est déjà dans page.text
    const pageText = page.text?.trim() || '';
    
    if (pageText.length > 0) {
      aggregatedSections.push(pageHeader + pageText);
    }
  }
  
  // Jointure finale avec séparation claire entre pages
  return aggregatedSections.join('\n\n').trim();
}

/**
 * Sauvegarde le résultat d'extraction en base de données
 */
async function saveExtractionResult(result: AlgerianExtractionResult): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn('OCR', 'Utilisateur non connecté, sauvegarde ignorée');
      return;
    }

    const { error } = await supabase
      .from('ocr_extractions')
      .insert({
        user_id: user.id,
        original_filename: result.originalFilename,
        file_type: result.fileType,
        total_pages: result.totalPages,
        extracted_text: result.extractedText,
        text_regions: result.textRegions as any,
        metadata: result.metadata as any,
        processing_status: result.processingStatus,
        confidence_score: result.confidenceScore,
        language_detected: result.languageDetected,
        is_mixed_language: result.isMixedLanguage
      });

    if (error) {
      logger.error('OCR', 'Erreur sauvegarde extraction', error);
    } else {
      logger.info('OCR', 'Extraction sauvegardée', { id: result.id });
    }
  } catch (error) {
    logger.error('OCR', 'Erreur lors de la sauvegarde', error);
  }
}

/**
 * Récupère les extractions d'un utilisateur
 */
export async function getUserExtractions(): Promise<AlgerianExtractionResult[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('ocr_extractions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('OCR', 'Erreur récupération extractions', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      originalFilename: item.original_filename,
      fileType: item.file_type,
      totalPages: item.total_pages || 1,
      extractedText: item.extracted_text || '',
      textRegions: (item.text_regions as any) || [],
      metadata: (item.metadata as any) || {},
      processingStatus: item.processing_status as any,
      confidenceScore: parseFloat(String(item.confidence_score || 0)),
      languageDetected: item.language_detected || 'fr',
      isMixedLanguage: item.is_mixed_language || false
    }));
  } catch (error) {
    logger.error('OCR', 'Erreur lors de la récupération', error);
    return [];
  }
}