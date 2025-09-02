/**
 * Service d'amélioration de l'agrégation automatique - Phase 1 complétée
 * Intégration complète avec le workflow OCR existant
 */

import { AlgerianTextRegion } from '@/services/algerianDocumentExtractionService';
import { textAggregationService, AggregationResult } from '@/components/ocr/TextAggregationService';
import { logger } from '@/utils/logger';

export interface EnhancedAggregationResult extends AggregationResult {
  qualityMetrics: {
    coherenceScore: number;
    readabilityScore: number;
    completenessScore: number;
    overallScore: number;
  };
  recommendations: string[];
  autoCorrections: {
    applied: number;
    suggestions: string[];
  };
}

export class EnhancedTextAggregationService {
  /**
   * Agrégation automatique complète des textRegions
   * Correction automatique de la Phase 1
   */
  async aggregateWithQualityAnalysis(
    pages: Array<{ textRegions: AlgerianTextRegion[] }>
  ): Promise<EnhancedAggregationResult> {
    const startTime = Date.now();
    
    try {
      logger.info('PROCESSING', 'Début de l\'agrégation automatique complète');
      
      // Extraction des textRegions de toutes les pages
      const textRegions = pages.map(page => page.textRegions || []);
      
      // Agrégation de base
      const baseResult = textAggregationService.aggregateTextRegions(textRegions);
      
      // Analyse de qualité
      const qualityMetrics = this.analyzeTextQuality(baseResult.aggregatedText);
      
      // Auto-corrections
      const correctedText = this.applyAutoCorrections(baseResult.aggregatedText);
      const autoCorrections = this.getAppliedCorrections(baseResult.aggregatedText, correctedText);
      
      // Recommandations
      const recommendations = this.generateRecommendations(qualityMetrics, baseResult);
      
      const processingTime = Date.now() - startTime;
      
      logger.info('PROCESSING', `Agrégation complétée en ${processingTime}ms`, {
        pages: pages.length,
        totalRegions: baseResult.metadata.totalRegions,
        qualityScore: qualityMetrics.overallScore
      });
      
      return {
        ...baseResult,
        aggregatedText: correctedText,
        qualityMetrics,
        recommendations,
        autoCorrections,
        metadata: {
          ...baseResult.metadata,
          processingTime
        }
      };
      
    } catch (error) {
      logger.error('PROCESSING', 'Erreur lors de l\'agrégation', error);
      throw error;
    }
  }
  
  /**
   * Analyse de la qualité du texte agrégé
   */
  private analyzeTextQuality(text: string): EnhancedAggregationResult['qualityMetrics'] {
    const coherenceScore = this.calculateCoherenceScore(text);
    const readabilityScore = this.calculateReadabilityScore(text);
    const completenessScore = this.calculateCompletenessScore(text);
    
    const overallScore = (coherenceScore + readabilityScore + completenessScore) / 3;
    
    return {
      coherenceScore,
      readabilityScore,
      completenessScore,
      overallScore
    };
  }
  
  /**
   * Score de cohérence (structure et continuité)
   */
  private calculateCoherenceScore(text: string): number {
    let score = 0.5; // Score de base
    
    // Présence de marqueurs structurels
    if (text.includes('Article') || text.includes('Chapitre')) score += 0.2;
    if (text.includes('=== PAGE')) score += 0.1;
    
    // Continuité des phrases
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    
    if (avgSentenceLength > 20 && avgSentenceLength < 200) score += 0.2;
    
    return Math.min(1, score);
  }
  
  /**
   * Score de lisibilité
   */
  private calculateReadabilityScore(text: string): number {
    let score = 0.5;
    
    // Présence de caractères spéciaux problématiques
    const specialCharsRatio = (text.match(/[^\w\s\u0600-\u06FF.,;:!?()-]/g) || []).length / text.length;
    if (specialCharsRatio < 0.05) score += 0.3;
    
    // Équilibre des langues
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const latinChars = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
    
    if (arabicChars > 0 && latinChars > 0) score += 0.2;
    
    return Math.min(1, score);
  }
  
  /**
   * Score de complétude
   */
  private calculateCompletenessScore(text: string): number {
    let score = 0.3;
    
    // Longueur minimale
    if (text.length > 100) score += 0.2;
    if (text.length > 1000) score += 0.2;
    
    // Présence d'éléments juridiques typiques
    const legalPatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/g, // Dates
      /(Article|Chapitre|Section)\s+\d+/gi, // Numérotation
      /(République\s+Algérienne|Ministère)/gi, // Institutions
      /(Vu|Considérant|Décide)/gi // Formules juridiques
    ];
    
    legalPatterns.forEach(pattern => {
      if (pattern.test(text)) score += 0.075;
    });
    
    return Math.min(1, score);
  }
  
  /**
   * Application des corrections automatiques
   */
  private applyAutoCorrections(text: string): string {
    let corrected = text;
    
    // Correction des espaces multiples
    corrected = corrected.replace(/\s{3,}/g, '  ');
    
    // Correction de la ponctuation
    corrected = corrected.replace(/([.!?])\s*([A-ZÀÂÄÇÉÈÊËÏÎÔÙÛÜŸÑÆŒ])/g, '$1 $2');
    
    // Correction des sauts de ligne excessifs
    corrected = corrected.replace(/\n{4,}/g, '\n\n\n');
    
    // Correction des caractères problématiques
    corrected = corrected.replace(/[^\w\s\u0600-\u06FF.,;:!?()[\]{}«»"'-]/g, '');
    
    return corrected.trim();
  }
  
  /**
   * Calcul des corrections appliquées
   */
  private getAppliedCorrections(original: string, corrected: string): EnhancedAggregationResult['autoCorrections'] {
    const suggestions: string[] = [];
    let applied = 0;
    
    if (original.length !== corrected.length) {
      applied++;
      suggestions.push('Normalisation des espaces et caractères');
    }
    
    if ((original.match(/\s{3,}/g) || []).length > 0) {
      applied++;
      suggestions.push('Correction des espaces multiples');
    }
    
    if ((original.match(/\n{4,}/g) || []).length > 0) {
      applied++;
      suggestions.push('Normalisation des sauts de ligne');
    }
    
    return { applied, suggestions };
  }
  
  /**
   * Génération de recommandations d'amélioration
   */
  private generateRecommendations(
    qualityMetrics: EnhancedAggregationResult['qualityMetrics'],
    baseResult: AggregationResult
  ): string[] {
    const recommendations: string[] = [];
    
    if (qualityMetrics.coherenceScore < 0.7) {
      recommendations.push('Vérifier la structure du document et l\'ordre des pages');
    }
    
    if (qualityMetrics.readabilityScore < 0.7) {
      recommendations.push('Améliorer la qualité OCR - présence de caractères non reconnus');
    }
    
    if (qualityMetrics.completenessScore < 0.7) {
      recommendations.push('Document possiblement incomplet - vérifier toutes les pages');
    }
    
    if (baseResult.metadata.averageConfidence < 0.8) {
      recommendations.push('Confiance OCR faible - considérer un retraitement');
    }
    
    const mixedPages = baseResult.pageBreakdowns.filter(p => p.language === 'mixed').length;
    if (mixedPages > baseResult.pageBreakdowns.length * 0.5) {
      recommendations.push('Document majoritairement mixte - vérifier la détection de langue');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Qualité d\'agrégation excellente - aucune amélioration nécessaire');
    }
    
    return recommendations;
  }
  
  /**
   * Agrégation simplifiée pour compatibilité
   */
  simpleAggregation(pages: Array<{ textRegions: AlgerianTextRegion[] }>): string {
    return pages
      .flatMap((page, pageIndex) => {
        const pageText = (page.textRegions || [])
          .map(region => region.text)
          .filter(Boolean)
          .join('\n');
        
        return pageText ? `=== PAGE ${pageIndex + 1} ===\n${pageText}` : '';
      })
      .filter(Boolean)
      .join('\n\n');
  }
}

export const enhancedTextAggregationService = new EnhancedTextAggregationService();
export default enhancedTextAggregationService;