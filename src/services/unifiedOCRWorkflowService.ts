/**
 * Service d'intégration complète du workflow OCR unifié
 * Finalise l'implémentation du plan d'action OCR complet
 */

import { algerianDocumentExtractionService, ExtractedDocument } from '@/services/enhanced/algerianDocumentExtractionService';
import { algerianLegalRegexService, StructuredPublication } from '@/services/enhanced/algerianLegalRegexService';
import intelligentMappingService from '@/services/enhanced/intelligentMappingService';
import { MappingResult } from '@/types/mapping';
import { approvalWorkflowService, ApprovalItem } from '@/services/enhanced/approvalWorkflowService';
import { enhancedTextAggregationService, EnhancedAggregationResult } from '@/services/enhancedTextAggregationService';
import { ocrConfigurationService } from '@/services/ocrConfigurationService';
import { performanceMonitoringService } from '@/services/enhanced/performanceMonitoringService';
import { advancedAlgorithmIntegrationService } from '@/services/enhanced/advancedAlgorithmIntegrationService';
import { logger } from '@/utils/logger';

export interface CompleteWorkflowResult {
  extraction: ExtractedDocument;
  aggregation: EnhancedAggregationResult;
  structured: StructuredPublication;
  mapping: MappingResult;
  approval: ApprovalItem;
  performance: {
    totalTime: number;
    extractionTime: number;
    aggregationTime: number;
    mappingTime: number;
    validationTime: number;
  };
  quality: {
    overallScore: number;
    extractionConfidence: number;
    mappingConfidence: number;
    recommendations: string[];
  };
}

export interface WorkflowOptions {
  useAdvancedAlgorithms: boolean;
  autoApprove: boolean;
  formType: string;
  customConfig?: Partial<any>;
  enablePerformanceMonitoring: boolean;
}

export class UnifiedOCRWorkflowService {
  /**
   * Exécution complète du workflow OCR unifié
   * Toutes les phases du plan d'action en une seule opération
   */
  async executeCompleteWorkflow(
    file: File, 
    options: WorkflowOptions
  ): Promise<CompleteWorkflowResult> {
    const startTime = Date.now();
    let extractionTime = 0;
    let aggregationTime = 0;
    let mappingTime = 0;
    let validationTime = 0;

    try {
      logger.info('PROCESSING', 'Début du workflow OCR unifié complet', {
        fileName: file.name,
        fileSize: file.size,
        options
      });

      // Configuration optimisée
      const config = options.customConfig 
        ? ocrConfigurationService.getConfiguration() 
        : ocrConfigurationService.getOptimizedConfigForDocumentType(options.formType);

      // Phase 1: Extraction avec algorithmes avancés (si activés)
      const extractionStart = Date.now();
      const extractedDocument = options.useAdvancedAlgorithms
        ? await advancedAlgorithmIntegrationService.extractDocumentWithAdvancedAlgorithms(file)
        : await algerianDocumentExtractionService.extractDocumentFromFile(file);
      extractionTime = Date.now() - extractionStart;

      // Phase 1 (suite): Agrégation automatique complète
      const aggregationStart = Date.now();
      const aggregationResult = await enhancedTextAggregationService.aggregateWithQualityAnalysis(
        extractedDocument.pages as any // Type assertion to handle interface mismatch
      );
      aggregationTime = Date.now() - aggregationStart;

      // Phase 1 (suite): Extraction des entités juridiques
      const structuredPublication = await algerianLegalRegexService.processText(
        aggregationResult.aggregatedText
      );

      // Phase 2: Mapping intelligent automatique
      const mappingStart = Date.now();
      const mappingResult = await intelligentMappingService.mapExtractedDataToForm(
        structuredPublication,
        options.formType
      );
      mappingTime = Date.now() - mappingStart;

      // Phase 3: Validation et workflow d'approbation
      const validationStart = Date.now();
      let approvalItem: ApprovalItem;

      if (options.autoApprove && mappingResult.overallConfidence > 0.85) {
        // Auto-approbation pour haute confiance
        approvalItem = await approvalWorkflowService.createApprovalItem(
          mappingResult
        );
        await approvalWorkflowService.approveItem(approvalItem.id, 'Auto-approuvé - haute confiance');
      } else {
        // Création d'un item d'approbation standard
        approvalItem = await approvalWorkflowService.createApprovalItem(
          mappingResult
        );
      }
      validationTime = Date.now() - validationStart;

      const totalTime = Date.now() - startTime;

      // Calcul des métriques de qualité
      const quality = this.calculateOverallQuality(
        extractedDocument as any, // Type assertion to handle interface mismatch
        aggregationResult,
        mappingResult
      );

      // Enregistrement des performances (si activé)
      if (options.enablePerformanceMonitoring) {
        try {
          performanceMonitoringService.recordMetric(
            'complete_workflow',
            totalTime,
            quality.overallScore,
            options.formType,
            file.size,
            true // Success flag instead of metadata object
          );
        } catch (error) {
          logger.warn('PROCESSING', 'Impossible d\'enregistrer la métrique de performance', error);
        }
      }

      const result: CompleteWorkflowResult = {
        extraction: extractedDocument as any, // Type assertion to handle interface mismatch
        aggregation: aggregationResult,
        structured: structuredPublication,
        mapping: mappingResult,
        approval: approvalItem,
        performance: {
          totalTime,
          extractionTime,
          aggregationTime,
          mappingTime,
          validationTime
        },
        quality
      };

      logger.info('PROCESSING', 'Workflow OCR unifié terminé avec succès', {
        totalTime: `${totalTime}ms`,
        overallScore: quality.overallScore,
        autoApproved: options.autoApprove && mappingResult.overallConfidence > 0.85
      });

      return result;

    } catch (error) {
      logger.error('PROCESSING', 'Erreur dans le workflow OCR unifié', error);
      
      // Enregistrement de l'erreur pour monitoring
      if (options.enablePerformanceMonitoring) {
        try {
          performanceMonitoringService.recordMetric(
            'complete_workflow_error',
            0,
            0,
            options.formType,
            file.size,
            false,
            error instanceof Error ? error.message : 'Erreur inconnue'
          );
        } catch (monitoringError) {
          logger.warn('PROCESSING', 'Impossible d\'enregistrer la métrique d\'erreur', monitoringError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Workflow partiel - seulement extraction et agrégation
   */
  async executeExtractionWorkflow(file: File, useAdvanced = false): Promise<{
    extraction: ExtractedDocument;
    aggregation: EnhancedAggregationResult;
  }> {
    const config = ocrConfigurationService.getConfiguration();
    
    const extractedDocument = useAdvanced
      ? await advancedAlgorithmIntegrationService.extractDocumentWithAdvancedAlgorithms(file)
      : await algerianDocumentExtractionService.extractDocumentFromFile(file);

    const aggregationResult = await enhancedTextAggregationService.aggregateWithQualityAnalysis(
      extractedDocument.pages as any // Type assertion to handle interface mismatch
    );

    return {
      extraction: extractedDocument as any, // Type assertion to handle interface mismatch
      aggregation: aggregationResult
    };
  }

  /**
   * Workflow de mapping uniquement (à partir de texte structuré)
   */
  async executeMappingWorkflow(
    structuredPublication: StructuredPublication,
    formType: string
  ): Promise<MappingResult> {
    return await intelligentMappingService.mapExtractedDataToForm(
      structuredPublication,
      formType
    );
  }

  /**
   * Test de performance du workflow complet
   */
  async performWorkflowBenchmark(testFiles: File[]): Promise<{
    averageTime: number;
    successRate: number;
    qualityScores: number[];
    recommendations: string[];
  }> {
    const results: { time: number; success: boolean; quality: number }[] = [];
    
    for (const file of testFiles) {
      try {
        const startTime = Date.now();
        const result = await this.executeCompleteWorkflow(file, {
          useAdvancedAlgorithms: true,
          autoApprove: false,
          formType: 'loi',
          enablePerformanceMonitoring: false
        });
        
        const time = Date.now() - startTime;
        results.push({
          time,
          success: true,
          quality: result.quality.overallScore
        });
      } catch (error) {
        results.push({
          time: 0,
          success: false,
          quality: 0
        });
      }
    }

    const successfulResults = results.filter(r => r.success);
    const averageTime = successfulResults.reduce((sum, r) => sum + r.time, 0) / successfulResults.length;
    const successRate = successfulResults.length / results.length;
    const qualityScores = successfulResults.map(r => r.quality);

    const recommendations = this.generateBenchmarkRecommendations(
      averageTime,
      successRate,
      qualityScores
    );

    return {
      averageTime,
      successRate,
      qualityScores,
      recommendations
    };
  }

  /**
   * Calcul de la qualité globale
   */
  private calculateOverallQuality(
    extraction: ExtractedDocument,
    aggregation: EnhancedAggregationResult,
    mapping: MappingResult
  ): CompleteWorkflowResult['quality'] {
    const extractionConfidence = extraction.averageConfidence;
    const aggregationScore = aggregation.qualityMetrics.overallScore;
    const mappingConfidence = mapping.overallConfidence;

    const overallScore = (extractionConfidence + aggregationScore + mappingConfidence) / 3;

    const recommendations: string[] = [];

    if (extractionConfidence < 0.8) {
      recommendations.push('Qualité d\'extraction faible - considérer l\'utilisation d\'algorithmes avancés');
    }

    if (aggregationScore < 0.7) {
      recommendations.push('Agrégation de texte de qualité moyenne - vérifier l\'ordre des pages');
    }

    if (mappingConfidence < 0.75) {
      recommendations.push('Mapping de champs incertain - révision manuelle recommandée');
    }

    if (overallScore > 0.85) {
      recommendations.push('Qualité excellente - workflow optimal');
    }

    // Ajout des recommandations d'agrégation
    recommendations.push(...aggregation.recommendations);

    return {
      overallScore,
      extractionConfidence,
      mappingConfidence,
      recommendations: [...new Set(recommendations)] // Suppression des doublons
    };
  }

  /**
   * Génération de recommandations basées sur les benchmarks
   */
  private generateBenchmarkRecommendations(
    averageTime: number,
    successRate: number,
    qualityScores: number[]
  ): string[] {
    const recommendations: string[] = [];

    if (averageTime > 60000) { // Plus d'une minute
      recommendations.push('Temps de traitement élevé - optimiser la configuration ou réduire la qualité d\'image');
    }

    if (successRate < 0.9) {
      recommendations.push('Taux de succès faible - vérifier la qualité des documents d\'entrée');
    }

    const avgQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
    if (avgQuality < 0.7) {
      recommendations.push('Qualité moyenne faible - considérer l\'amélioration des algorithmes d\'extraction');
    }

    const qualityVariance = qualityScores.reduce((sum, score) => sum + Math.pow(score - avgQuality, 2), 0) / qualityScores.length;
    if (qualityVariance > 0.1) {
      recommendations.push('Qualité inconsistante - standardiser les types de documents ou améliorer la détection');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance excellente - workflow optimisé');
    }

    return recommendations;
  }

  /**
   * Obtenir les statistiques actuelles du workflow
   */
  getWorkflowStatistics(): {
    totalProcessed: number;
    averageProcessingTime: number;
    successRate: number;
    commonIssues: string[];
  } {
    // Cette méthode utiliserait des données stockées localement ou dans Supabase
    // Pour l'instant, retourne des valeurs par défaut
    return {
      totalProcessed: 0,
      averageProcessingTime: 0,
      successRate: 1,
      commonIssues: []
    };
  }
}

export const unifiedOCRWorkflowService = new UnifiedOCRWorkflowService();
export default unifiedOCRWorkflowService;