/**
 * Service d'optimisation du workflow OCR
 * Patterns d'amélioration automatique et apprentissage
 */

import { MappingResult } from '@/types/mapping';
import { ValidationResult } from '@/services/validation/validationService';
import { ApprovalItem } from '@/services/approval/approvalWorkflowService';

export interface OptimizationPattern {
  id: string;
  type: 'field_mapping' | 'validation_rule' | 'ocr_preprocessing' | 'approval_flow';
  description: string;
  confidence: number;
  impact: number;
  occurrences: number;
  lastSeen: Date;
  rule: OptimizationRule;
}

export interface OptimizationRule {
  trigger: {
    field?: string;
    condition: string;
    value: any;
  };
  action: {
    type: 'suggest_mapping' | 'auto_correct' | 'flag_review' | 'optimize_path';
    parameters: Record<string, any>;
  };
  metadata: {
    confidence: number;
    applicableDocTypes: string[];
    performance: {
      successRate: number;
      averageImprovement: number;
    };
  };
}

export interface LearningHistory {
  id: string;
  timestamp: Date;
  documentType: string;
  originalData: any;
  corrections: Record<string, any>;
  reviewerFeedback: {
    accuracy: number;
    notes: string;
  };
  applied: boolean;
}

export interface OptimizationSuggestion {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'performance' | 'accuracy' | 'automation' | 'quality';
  title: string;
  description: string;
  estimatedBenefit: {
    timeReduction: number; // en pourcentage
    accuracyImprovement: number; // en pourcentage
    costReduction: number; // en pourcentage
  };
  implementation: {
    complexity: 'low' | 'medium' | 'high';
    estimatedEffort: string;
    requirements: string[];
  };
  autoApplicable: boolean;
}

export interface BatchOptimizationConfig {
  enableAutoCorrection: boolean;
  confidenceThreshold: number;
  maxBatchSize: number;
  allowedDocumentTypes: string[];
  reviewerApprovalRequired: boolean;
}

class WorkflowOptimizationService {
  private patterns: Map<string, OptimizationPattern> = new Map();
  private learningHistory: LearningHistory[] = [];
  private appliedOptimizations: Set<string> = new Set();

  /**
   * Analyser et apprendre des corrections manuelles
   */
  learnFromCorrections(
    originalMapping: MappingResult,
    corrections: Record<string, any>,
    documentType: string,
    reviewerFeedback: { accuracy: number; notes: string }
  ): void {
    const learningEntry: LearningHistory = {
      id: `learning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      documentType,
      originalData: originalMapping.mappedData,
      corrections,
      reviewerFeedback,
      applied: false
    };

    this.learningHistory.push(learningEntry);

    // Analyser pour créer des patterns
    this.analyzeForPatterns(learningEntry);
    
    console.log('✅ [WorkflowOptimization] Apprentissage enregistré:', learningEntry.id);
  }

  /**
   * Détection automatique de patterns d'amélioration
   */
  detectImprovementPatterns(approvalHistory: ApprovalItem[]): OptimizationPattern[] {
    const patterns: OptimizationPattern[] = [];

    // Pattern 1: Corrections récurrentes de champs
    const fieldCorrections = this.analyzeFieldCorrections(approvalHistory);
    patterns.push(...fieldCorrections);

    // Pattern 2: Rejets pour les mêmes raisons
    const rejectionPatterns = this.analyzeRejectionPatterns(approvalHistory);
    patterns.push(...rejectionPatterns);

    // Pattern 3: Optimisations de performance
    const performancePatterns = this.analyzePerformancePatterns(approvalHistory);
    patterns.push(...performancePatterns);

    // Pattern 4: Amélioration de la précision OCR
    const ocrPatterns = this.analyzeOCRPatterns(approvalHistory);
    patterns.push(...ocrPatterns);

    // Stocker les nouveaux patterns
    patterns.forEach(pattern => {
      this.patterns.set(pattern.id, pattern);
    });

    console.log(`✅ [WorkflowOptimization] ${patterns.length} patterns détectés`);
    return patterns;
  }

  /**
   * Générer des suggestions d'optimisation
   */
  generateOptimizationSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Analyser les patterns existants
    Array.from(this.patterns.values()).forEach(pattern => {
      if (pattern.confidence > 70 && pattern.occurrences >= 3) {
        const suggestion = this.createSuggestionFromPattern(pattern);
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    });

    // Suggestions basées sur l'historique d'apprentissage
    const learningSuggestions = this.generateLearningSuggestions();
    suggestions.push(...learningSuggestions);

    // Suggestions de performance générale
    const performanceSuggestions = this.generatePerformanceSuggestions();
    suggestions.push(...performanceSuggestions);

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Trier par bénéfice estimé
      const benefitA = a.estimatedBenefit.timeReduction + a.estimatedBenefit.accuracyImprovement;
      const benefitB = b.estimatedBenefit.timeReduction + b.estimatedBenefit.accuracyImprovement;
      return benefitB - benefitA;
    });
  }

  /**
   * Validation par lot pour documents similaires
   */
  async processBatchOptimization(
    items: ApprovalItem[],
    config: BatchOptimizationConfig
  ): Promise<{
    processed: number;
    autoApproved: number;
    flaggedForReview: number;
    errors: string[];
  }> {
    let processed = 0;
    let autoApproved = 0;
    let flaggedForReview = 0;
    const errors: string[] = [];

    // Grouper par type de document
    const groupedItems = this.groupItemsByDocumentType(items);

    for (const [docType, typeItems] of groupedItems.entries()) {
      if (!config.allowedDocumentTypes.includes(docType)) {
        continue;
      }

      for (const item of typeItems.slice(0, config.maxBatchSize)) {
        try {
          const optimizationResult = await this.optimizeItem(item, config);
          
          if (optimizationResult.confidence >= config.confidenceThreshold) {
            if (config.enableAutoCorrection && optimizationResult.autoApplicable) {
              autoApproved++;
            } else {
              flaggedForReview++;
            }
          } else {
            flaggedForReview++;
          }
          
          processed++;
        } catch (error) {
          errors.push(`Erreur item ${item.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
      }
    }

    console.log(`✅ [WorkflowOptimization] Traitement batch: ${processed} traités, ${autoApproved} auto-approuvés`);
    
    return { processed, autoApproved, flaggedForReview, errors };
  }

  /**
   * Application automatique d'optimisations approuvées
   */
  applyAutomatedOptimizations(
    mappingResult: MappingResult,
    documentType: string
  ): {
    optimizedMapping: MappingResult;
    appliedOptimizations: string[];
    confidence: number;
  } {
    const appliedOptimizations: string[] = [];
    let optimizedMapping = { ...mappingResult };
    let totalConfidence = 0;
    let optimizationCount = 0;

    // Appliquer les patterns appropriés
    Array.from(this.patterns.values()).forEach(pattern => {
      if (this.isPatternApplicable(pattern, documentType, mappingResult)) {
        const result = this.applyPattern(pattern, optimizedMapping);
        if (result.success) {
          optimizedMapping = result.mapping;
          appliedOptimizations.push(pattern.description);
          totalConfidence += pattern.confidence;
          optimizationCount++;
        }
      }
    });

    const confidence = optimizationCount > 0 ? totalConfidence / optimizationCount : 0;

    console.log(`✅ [WorkflowOptimization] ${appliedOptimizations.length} optimisations appliquées (confiance: ${confidence.toFixed(1)}%)`);
    
    return { optimizedMapping, appliedOptimizations, confidence };
  }

  /**
   * Obtenir les métriques d'optimisation
   */
  getOptimizationMetrics(): {
    totalPatterns: number;
    activePatterns: number;
    learningEntries: number;
    successRate: number;
    averageImpact: number;
    topPatterns: Array<{ description: string; impact: number; occurrences: number }>;
  } {
    const activePatterns = Array.from(this.patterns.values()).filter(p => p.confidence > 60);
    const successfulLearning = this.learningHistory.filter(l => l.reviewerFeedback.accuracy > 70);
    
    const topPatterns = Array.from(this.patterns.values())
      .sort((a, b) => b.impact * b.occurrences - a.impact * a.occurrences)
      .slice(0, 5)
      .map(p => ({
        description: p.description,
        impact: p.impact,
        occurrences: p.occurrences
      }));

    return {
      totalPatterns: this.patterns.size,
      activePatterns: activePatterns.length,
      learningEntries: this.learningHistory.length,
      successRate: this.learningHistory.length > 0 ? (successfulLearning.length / this.learningHistory.length) * 100 : 0,
      averageImpact: activePatterns.length > 0 ? activePatterns.reduce((sum, p) => sum + p.impact, 0) / activePatterns.length : 0,
      topPatterns
    };
  }

  // === Méthodes privées d'analyse ===

  private analyzeForPatterns(learningEntry: LearningHistory): void {
    // Analyser les types de corrections
    Object.entries(learningEntry.corrections).forEach(([field, correctedValue]) => {
      const originalValue = learningEntry.originalData[field];
      
      if (originalValue && correctedValue && originalValue !== correctedValue) {
        const patternId = `field_correction_${field}_${learningEntry.documentType}`;
        
        const existingPattern = this.patterns.get(patternId);
        if (existingPattern) {
          existingPattern.occurrences++;
          existingPattern.lastSeen = new Date();
          existingPattern.confidence = Math.min(95, existingPattern.confidence + 5);
        } else {
          const newPattern: OptimizationPattern = {
            id: patternId,
            type: 'field_mapping',
            description: `Correction fréquente du champ ${field} pour ${learningEntry.documentType}`,
            confidence: 60,
            impact: 15,
            occurrences: 1,
            lastSeen: new Date(),
            rule: {
              trigger: {
                field,
                condition: 'equals',
                value: originalValue
              },
              action: {
                type: 'suggest_mapping',
                parameters: { suggestedValue: correctedValue }
              },
              metadata: {
                confidence: 60,
                applicableDocTypes: [learningEntry.documentType],
                performance: {
                  successRate: learningEntry.reviewerFeedback.accuracy,
                  averageImprovement: 15
                }
              }
            }
          };
          
          this.patterns.set(patternId, newPattern);
        }
      }
    });
  }

  private analyzeFieldCorrections(approvalHistory: ApprovalItem[]): OptimizationPattern[] {
    const patterns: OptimizationPattern[] = [];
    const fieldCorrections = new Map<string, { count: number; corrections: any[] }>();

    // Analyser les corrections par champ
    approvalHistory
      .filter(item => item.status === 'modified' && item.proposedChanges)
      .forEach(item => {
        Object.entries(item.proposedChanges!).forEach(([field, value]) => {
          const key = `${field}_${item.documentType}`;
          const existing = fieldCorrections.get(key) || { count: 0, corrections: [] };
          existing.count++;
          existing.corrections.push({ original: item.originalData.mappingResult.mappedData[field], corrected: value });
          fieldCorrections.set(key, existing);
        });
      });

    // Créer des patterns pour les corrections fréquentes
    fieldCorrections.forEach(({ count, corrections }, key) => {
      if (count >= 3) {
        const [field, docType] = key.split('_');
        patterns.push({
          id: `field_pattern_${key}`,
          type: 'field_mapping',
          description: `Correction récurrente: ${field} dans ${docType}`,
          confidence: Math.min(90, 50 + count * 10),
          impact: 20,
          occurrences: count,
          lastSeen: new Date(),
          rule: {
            trigger: { field, condition: 'needs_review', value: null },
            action: { type: 'flag_review', parameters: { reason: 'Pattern de correction détecté' } },
            metadata: {
              confidence: Math.min(90, 50 + count * 10),
              applicableDocTypes: [docType],
              performance: { successRate: 80, averageImprovement: 20 }
            }
          }
        });
      }
    });

    return patterns;
  }

  private analyzeRejectionPatterns(approvalHistory: ApprovalItem[]): OptimizationPattern[] {
    const patterns: OptimizationPattern[] = [];
    const rejectionReasons = new Map<string, number>();

    // Compter les raisons de rejet
    approvalHistory
      .filter(item => item.status === 'rejected' && item.reviewNotes)
      .forEach(item => {
        const reason = item.reviewNotes!.toLowerCase();
        rejectionReasons.set(reason, (rejectionReasons.get(reason) || 0) + 1);
      });

    // Créer des patterns pour les rejets fréquents
    rejectionReasons.forEach((count, reason) => {
      if (count >= 2) {
        patterns.push({
          id: `rejection_pattern_${reason.replace(/\s+/g, '_')}`,
          type: 'validation_rule',
          description: `Rejet fréquent: ${reason}`,
          confidence: Math.min(85, 40 + count * 15),
          impact: 25,
          occurrences: count,
          lastSeen: new Date(),
          rule: {
            trigger: { condition: 'matches_pattern', value: reason },
            action: { type: 'flag_review', parameters: { preReason: reason } },
            metadata: {
              confidence: Math.min(85, 40 + count * 15),
              applicableDocTypes: ['all'],
              performance: { successRate: 70, averageImprovement: 25 }
            }
          }
        });
      }
    });

    return patterns;
  }

  private analyzePerformancePatterns(approvalHistory: ApprovalItem[]): OptimizationPattern[] {
    const patterns: OptimizationPattern[] = [];
    
    // Analyser les temps de traitement
    const avgProcessingTime = approvalHistory.reduce((sum, item) => {
      if (item.updatedAt && item.createdAt) {
        return sum + (item.updatedAt.getTime() - item.createdAt.getTime());
      }
      return sum;
    }, 0) / approvalHistory.length;

    if (avgProcessingTime > 5 * 60 * 1000) { // Plus de 5 minutes
      patterns.push({
        id: 'performance_slow_processing',
        type: 'approval_flow',
        description: 'Temps de traitement élevé détecté',
        confidence: 80,
        impact: 30,
        occurrences: 1,
        lastSeen: new Date(),
        rule: {
          trigger: { condition: 'processing_time_high', value: avgProcessingTime },
          action: { type: 'optimize_path', parameters: { target: 'reduce_review_time' } },
          metadata: {
            confidence: 80,
            applicableDocTypes: ['all'],
            performance: { successRate: 75, averageImprovement: 30 }
          }
        }
      });
    }

    return patterns;
  }

  private analyzeOCRPatterns(approvalHistory: ApprovalItem[]): OptimizationPattern[] {
    const patterns: OptimizationPattern[] = [];
    
    // Analyser la qualité OCR
    const lowConfidenceItems = approvalHistory.filter(item => 
      item.originalData.confidence < 70
    );

    if (lowConfidenceItems.length > approvalHistory.length * 0.3) {
      patterns.push({
        id: 'ocr_low_confidence_pattern',
        type: 'ocr_preprocessing',
        description: 'Taux élevé de faible confiance OCR',
        confidence: 85,
        impact: 35,
        occurrences: lowConfidenceItems.length,
        lastSeen: new Date(),
        rule: {
          trigger: { condition: 'confidence_below', value: 70 },
          action: { type: 'flag_review', parameters: { reason: 'Confiance OCR faible' } },
          metadata: {
            confidence: 85,
            applicableDocTypes: ['all'],
            performance: { successRate: 80, averageImprovement: 35 }
          }
        }
      });
    }

    return patterns;
  }

  private createSuggestionFromPattern(pattern: OptimizationPattern): OptimizationSuggestion | null {
    switch (pattern.type) {
      case 'field_mapping':
        return {
          id: `suggestion_${pattern.id}`,
          priority: pattern.confidence > 85 ? 'high' : 'medium',
          category: 'accuracy',
          title: 'Amélioration du mapping de champs',
          description: pattern.description,
          estimatedBenefit: {
            timeReduction: 15,
            accuracyImprovement: pattern.impact,
            costReduction: 10
          },
          implementation: {
            complexity: 'low',
            estimatedEffort: '1-2 heures',
            requirements: ['Mise à jour des règles de mapping']
          },
          autoApplicable: pattern.confidence > 80
        };
        
      case 'validation_rule':
        return {
          id: `suggestion_${pattern.id}`,
          priority: 'high',
          category: 'quality',
          title: 'Renforcement des règles de validation',
          description: pattern.description,
          estimatedBenefit: {
            timeReduction: 20,
            accuracyImprovement: pattern.impact,
            costReduction: 15
          },
          implementation: {
            complexity: 'medium',
            estimatedEffort: '2-4 heures',
            requirements: ['Mise à jour du service de validation']
          },
          autoApplicable: false
        };
        
      default:
        return null;
    }
  }

  private generateLearningSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    if (this.learningHistory.length > 10) {
      const successfulLearning = this.learningHistory.filter(l => l.reviewerFeedback.accuracy > 80);
      const successRate = (successfulLearning.length / this.learningHistory.length) * 100;
      
      if (successRate < 70) {
        suggestions.push({
          id: 'learning_improvement',
          priority: 'medium',
          category: 'accuracy',
          title: 'Amélioration de l\'apprentissage automatique',
          description: `Taux de succès d'apprentissage: ${successRate.toFixed(1)}%`,
          estimatedBenefit: {
            timeReduction: 10,
            accuracyImprovement: 20,
            costReduction: 8
          },
          implementation: {
            complexity: 'high',
            estimatedEffort: '1-2 jours',
            requirements: ['Révision des algorithmes d\'apprentissage']
          },
          autoApplicable: false
        });
      }
    }
    
    return suggestions;
  }

  private generatePerformanceSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Suggestion générale d'optimisation
    suggestions.push({
      id: 'batch_processing_optimization',
      priority: 'medium',
      category: 'performance',
      title: 'Optimisation du traitement par lot',
      description: 'Implémenter un système de traitement par lot pour les documents similaires',
      estimatedBenefit: {
        timeReduction: 40,
        accuracyImprovement: 5,
        costReduction: 25
      },
      implementation: {
        complexity: 'high',
        estimatedEffort: '3-5 jours',
        requirements: ['Développement d\'algorithmes de groupement', 'Interface de gestion par lot']
      },
      autoApplicable: false
    });
    
    return suggestions;
  }

  // === Méthodes utilitaires ===

  private groupItemsByDocumentType(items: ApprovalItem[]): Map<string, ApprovalItem[]> {
    const groups = new Map<string, ApprovalItem[]>();
    
    items.forEach(item => {
      const existing = groups.get(item.documentType) || [];
      existing.push(item);
      groups.set(item.documentType, existing);
    });
    
    return groups;
  }

  private async optimizeItem(item: ApprovalItem, config: BatchOptimizationConfig): Promise<{
    confidence: number;
    autoApplicable: boolean;
    suggestions: string[];
  }> {
    // Simulation d'optimisation d'item
    const confidence = Math.random() * 100;
    const autoApplicable = confidence > 85 && config.enableAutoCorrection;
    
    return {
      confidence,
      autoApplicable,
      suggestions: confidence > 70 ? ['Mapping optimisé', 'Validation améliorée'] : []
    };
  }

  private isPatternApplicable(
    pattern: OptimizationPattern,
    documentType: string,
    mappingResult: MappingResult
  ): boolean {
    const { rule } = pattern;
    
    // Vérifier le type de document
    if (!rule.metadata.applicableDocTypes.includes('all') && 
        !rule.metadata.applicableDocTypes.includes(documentType)) {
      return false;
    }
    
    // Vérifier la condition du trigger
    if (rule.trigger.field) {
      const fieldValue = mappingResult.mappedData?.[rule.trigger.field];
      return this.evaluateCondition(rule.trigger.condition, fieldValue, rule.trigger.value);
    }
    
    return true;
  }

  private applyPattern(pattern: OptimizationPattern, mappingResult: MappingResult): {
    success: boolean;
    mapping: MappingResult;
  } {
    try {
      const optimizedMapping = { ...mappingResult };
      const { rule } = pattern;
      
      if (rule.action.type === 'suggest_mapping' && rule.trigger.field) {
        const suggestedValue = rule.action.parameters.suggestedValue;
        if (optimizedMapping.mappedData) {
          optimizedMapping.mappedData[rule.trigger.field] = suggestedValue;
        }
      }
      
      return { success: true, mapping: optimizedMapping };
    } catch (error) {
      console.error('❌ Erreur application pattern:', error);
      return { success: false, mapping: mappingResult };
    }
  }

  private evaluateCondition(condition: string, value: any, expectedValue: any): boolean {
    switch (condition) {
      case 'equals':
        return value === expectedValue;
      case 'needs_review':
        return true; // Toujours applicable pour les révisions
      case 'confidence_below':
        return typeof value === 'number' && value < expectedValue;
      case 'processing_time_high':
        return true; // Simulé
      default:
        return false;
    }
  }
}

export const workflowOptimizationService = new WorkflowOptimizationService();
export default workflowOptimizationService;