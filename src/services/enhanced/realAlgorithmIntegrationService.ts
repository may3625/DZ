/**
 * Service d'intégration des algorithmes de traitement réel
 * Centralise tous les algorithmes d'analyse et de traitement des documents algériens
 */

import { logger } from '@/utils/logger';
import { algerianDocumentExtractionService, ExtractedDocument, AlgerianExtractionResult } from './algerianDocumentExtractionService';
import { algerianLegalRegexService, StructuredPublication } from './algerianLegalRegexService';

export interface RealProcessingResult {
  extractedDocument: ExtractedDocument;
  structuredPublication: StructuredPublication;
  analysisResult: RealAnalysisResult;
  processingTime: number;
  confidence: number;
  // Compatibilité avec DZOCRIAProcessor
  processingMetadata: {
    totalPages: number;
    averageConfidence: number;
    totalProcessingTime: number;
  };
  detectedLines: any[];
  tableRegions: any[];
  textSeparators: any[];
}

export interface RealAnalysisResult {
  documentType: string;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  metadata: {
    language: 'ar' | 'fr' | 'mixed';
    isOfficial: boolean;
    confidence: number;
  };
  textQuality: {
    clarity: number;
    completeness: number;
    structure: number;
  };
}

class RealAlgorithmIntegrationService {
  constructor() {
    logger.info('OCR', '🔧 Service d\'intégration des algorithmes réels initialisé');
  }

  /**
   * Traite un document avec tous les algorithmes intégrés
   */
  async processDocument(file: File): Promise<RealProcessingResult> {
    return this.processPageWithRealAlgorithms(file);
  }

  /**
   * Alias pour compatibilité avec l'ancien code
   */
  async processPageWithRealAlgorithms(file: File): Promise<RealProcessingResult> {
    const startTime = performance.now();
    
    try {
      logger.info('OCR', '🔄 Début du traitement algorithmique complet', { fileName: file.name });

      // 1. Extraction du document
      const extractedDocument = await algerianDocumentExtractionService.extractDocument(file);
      
      // 2. Analyse structurée du texte
      const structuredPublication = await algerianLegalRegexService.processText(
        extractedDocument.extractedText || ''
      );

      // 3. Analyse complète
      const analysisResult = await this.analyzeDocument(extractedDocument, structuredPublication);

      const processingTime = performance.now() - startTime;
      const confidence = this.calculateOverallConfidence(extractedDocument, structuredPublication, analysisResult);

      const result: RealProcessingResult = {
        extractedDocument,
        structuredPublication,
        analysisResult,
        processingTime,
        confidence,
        // Propriétés de compatibilité
        processingMetadata: {
          totalPages: extractedDocument.totalPages || 1,
          averageConfidence: extractedDocument.averageConfidence || 85,
          totalProcessingTime: processingTime
        },
        detectedLines: extractedDocument.pages?.flatMap(page => page.lines || []) || [],
        tableRegions: extractedDocument.pages?.flatMap(page => page.tableRegions || []) || [],
        textSeparators: extractedDocument.pages?.flatMap(page => page.separatorLines || []) || []
      };

      logger.info('OCR', '✅ Traitement algorithmique terminé', {
        fileName: file.name,
        processingTime: `${processingTime.toFixed(2)}ms`,
        confidence: `${confidence.toFixed(2)}%`
      });

      return result;

    } catch (error) {
      logger.error('OCR', '❌ Erreur traitement algorithmique:', error);
      throw new Error(`Échec du traitement algorithmique: ${error.message}`);
    }
  }

  /**
   * Analyse complète d'un document extrait
   */
  private async analyzeDocument(
    extractedDocument: ExtractedDocument, 
    structuredPublication: StructuredPublication
  ): Promise<RealAnalysisResult> {
    
    const text = extractedDocument.extractedText || '';
    
    // Détection du type de document
    const documentType = this.detectDocumentType(text, structuredPublication);
    
    // Extraction des entités
    const entities = this.extractEntities(text, structuredPublication);
    
    // Analyse de la langue
    const language = this.detectLanguage(text);
    
    // Vérification si document officiel
    const isOfficial = this.isOfficialDocument(text, structuredPublication);
    
    // Calcul de la qualité du texte
    const textQuality = this.assessTextQuality(text, extractedDocument);
    
    return {
      documentType,
      entities,
      metadata: {
        language,
        isOfficial,
        confidence: structuredPublication.metadata.confidence
      },
      textQuality
    };
  }

  /**
   * Détecte le type de document
   */
  private detectDocumentType(text: string, publication: StructuredPublication): string {
    if (publication.type !== 'other') {
      return publication.type;
    }

    // Patterns de détection
    const patterns = {
      'loi': /\b(loi|قانون)\b/i,
      'decret': /\b(décret|مرسوم)\b/i,
      'arrete': /\b(arrêté|قرار)\b/i,
      'circulaire': /\b(circulaire|منشور)\b/i,
      'instruction': /\b(instruction|تعليمة)\b/i,
      'journal_officiel': /\b(journal officiel|الجريدة الرسمية)\b/i
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return type;
      }
    }

    return 'document';
  }

  /**
   * Extrait les entités du texte
   */
  private extractEntities(text: string, publication: StructuredPublication): Array<{
    type: string;
    value: string;
    confidence: number;
  }> {
    const entities = [];

    // Utiliser les entités déjà extraites par le service regex
    if (publication.entities) {
      publication.entities.forEach(entity => {
        entities.push({
          type: entity.type,
          value: entity.value,
          confidence: entity.confidence
        });
      });
    }

    return entities;
  }

  /**
   * Détecte la langue du document
   */
  private detectLanguage(text: string): 'ar' | 'fr' | 'mixed' {
    const arabicChars = text.match(/[\u0600-\u06FF]/g) || [];
    const frenchChars = text.match(/[a-zA-ZÀ-ÿ]/g) || [];
    
    const arabicRatio = arabicChars.length / text.length;
    const frenchRatio = frenchChars.length / text.length;

    if (arabicRatio > 0.2 && frenchRatio > 0.2) return 'mixed';
    if (arabicRatio > frenchRatio) return 'ar';
    return 'fr';
  }

  /**
   * Vérifie si le document est officiel
   */
  private isOfficialDocument(text: string, publication: StructuredPublication): boolean {
    const officialIndicators = [
      /journal\s+officiel/i,
      /الجريدة\s+الرسمية/,
      /république\s+algérienne/i,
      /الجمهورية\s+الجزائرية/,
      /ministère/i,
      /وزارة/,
      /n°\s*\d+/i
    ];

    return officialIndicators.some(pattern => pattern.test(text)) || 
           publication.metadata.isOfficial;
  }

  /**
   * Évalue la qualité du texte extrait
   */
  private assessTextQuality(text: string, extractedDocument: ExtractedDocument): {
    clarity: number;
    completeness: number;
    structure: number;
  } {
    const clarity = Math.min(100, extractedDocument.confidence || 50);
    
    // Complétude basée sur la longueur et la présence d'éléments structurels
    const completeness = Math.min(100, (text.length / 1000) * 50 + 50);
    
    // Structure basée sur la présence de paragraphes, dates, numéros
    const hasStructure = /\n\n/.test(text) || /\d+\./.test(text) || /art(icle)?\s+\d+/i.test(text);
    const structure = hasStructure ? 85 : 60;

    return {
      clarity,
      completeness,
      structure
    };
  }

  /**
   * Calcule la confiance globale
   */
  private calculateOverallConfidence(
    extractedDocument: ExtractedDocument,
    structuredPublication: StructuredPublication,
    analysisResult: RealAnalysisResult
  ): number {
    const extractionConfidence = extractedDocument.confidence || 0;
    const structureConfidence = structuredPublication.metadata.confidence || 0;
    const analysisConfidence = analysisResult.metadata.confidence || 0;
    const qualityScore = (
      analysisResult.textQuality.clarity + 
      analysisResult.textQuality.completeness + 
      analysisResult.textQuality.structure
    ) / 3;

    return (extractionConfidence + structureConfidence + analysisConfidence + qualityScore) / 4;
  }
}

export const realAlgorithmIntegrationService = new RealAlgorithmIntegrationService();
export default realAlgorithmIntegrationService;