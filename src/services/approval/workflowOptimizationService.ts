import { ApprovalItem } from './approvalItemService';
import { ValidationResult, ValidationIssue } from '@/services/validation/validationService';

export interface WorkflowPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  improvementSuggestion: string;
  autoFixRules: AutoFixRule[];
}

export interface AutoFixRule {
  issueType: string;
  condition: string;
  action: string;
  confidence: number;
}

export interface LearningData {
  correctionType: string;
  originalValue: string;
  correctedValue: string;
  frequency: number;
  documentType: string;
  fieldName: string;
}

export interface WorkflowMetrics {
  totalProcessed: number;
  averageProcessingTime: number;
  approvalRate: number;
  rejectionRate: number;
  autoFixSuccessRate: number;
  commonIssues: Array<{
    type: string;
    frequency: number;
    severity: string;
  }>;
  improvementRecommendations: string[];
}

class WorkflowOptimizationService {
  private patterns: Map<string, WorkflowPattern> = new Map();
  private learningData: LearningData[] = [];
  private metrics: WorkflowMetrics = {
    totalProcessed: 0,
    averageProcessingTime: 0,
    approvalRate: 0,
    rejectionRate: 0,
    autoFixSuccessRate: 0,
    commonIssues: [],
    improvementRecommendations: []
  };

  /**
   * Apprentissage basé sur l'historique des corrections
   */
  learnFromCorrection(
    originalValue: string,
    correctedValue: string,
    fieldName: string,
    documentType: string,
    correctionType: string
  ): void {
    // Vérifier si cette correction existe déjà
    const existingIndex = this.learningData.findIndex(data => 
      data.originalValue === originalValue &&
      data.correctedValue === correctedValue &&
      data.fieldName === fieldName &&
      data.documentType === documentType &&
      data.correctionType === correctionType
    );

    if (existingIndex !== -1) {
      // Augmenter la fréquence
      this.learningData[existingIndex].frequency++;
    } else {
      // Ajouter une nouvelle correction
      this.learningData.push({
        correctionType,
        originalValue,
        correctedValue,
        frequency: 1,
        documentType,
        fieldName
      });
    }

    // Mise à jour des patterns automatiques
    this.updateAutoFixPatterns();
  }

  /**
   * Suggestion de corrections automatiques basées sur l'apprentissage
   */
  suggestAutoCorrections(item: ApprovalItem): Array<{
    fieldName: string;
    originalValue: string;
    suggestedValue: string;
    confidence: number;
    reason: string;
  }> {
    const suggestions: Array<{
      fieldName: string;
      originalValue: string;
      suggestedValue: string;
      confidence: number;
      reason: string;
    }> = [];

    item.mappingResult.mappedFields.forEach(field => {
      if (field.mappedValue) {
        // Rechercher des patterns d'apprentissage similaires
        const learningMatches = this.learningData.filter(data =>
          data.fieldName === field.fieldName &&
          data.documentType === item.mappingResult.formType &&
          data.originalValue.toLowerCase().includes(field.mappedValue!.toLowerCase())
        );

        if (learningMatches.length > 0) {
          // Trouver la correction la plus fréquente
          const bestMatch = learningMatches.reduce((best, current) =>
            current.frequency > best.frequency ? current : best
          );

          if (bestMatch.frequency >= 3) { // Seuil de confiance
            const confidence = Math.min(90, bestMatch.frequency * 10);
            suggestions.push({
              fieldName: field.fieldName,
              originalValue: field.mappedValue!,
              suggestedValue: bestMatch.correctedValue,
              confidence,
              reason: `Correction appliquée ${bestMatch.frequency} fois pour des documents similaires`
            });
          }
        }
      }
    });

    return suggestions;
  }

  /**
   * Détection des patterns récurrents dans les erreurs
   */
  detectRecurringPatterns(items: ApprovalItem[]): WorkflowPattern[] {
    const patterns: WorkflowPattern[] = [];
    const issueFrequency = new Map<string, number>();

    // Analyser les problèmes récurrents
    items.forEach(item => {
      item.validationResult.issues.forEach(issue => {
        const key = `${issue.type}:${issue.fieldName || 'global'}`;
        issueFrequency.set(key, (issueFrequency.get(key) || 0) + 1);
      });
    });

    // Créer des patterns pour les problèmes fréquents
    issueFrequency.forEach((frequency, key) => {
      if (frequency >= 5) { // Seuil pour considérer un pattern
        const [type, fieldName] = key.split(':');
        patterns.push({
          id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `Problème récurrent: ${type}`,
          description: `Problème "${type}" détecté ${frequency} fois${fieldName !== 'global' ? ` sur le champ "${fieldName}"` : ''}`,
          frequency,
          improvementSuggestion: this.generateImprovementSuggestion(type, fieldName),
          autoFixRules: this.createAutoFixRules(type, fieldName)
        });
      }
    });

    return patterns;
  }

  /**
   * Optimisation automatique des règles de validation
   */
  optimizeValidationRules(items: ApprovalItem[]): Array<{
    rule: string;
    modification: string;
    reasoning: string;
    impact: string;
  }> {
    const optimizations: Array<{
      rule: string;
      modification: string;
      reasoning: string;
      impact: string;
    }> = [];

    // Analyser les patterns d'approbation/rejet
    const approvedItems = items.filter(item => item.status === 'approved');
    const rejectedItems = items.filter(item => item.status === 'rejected');

    // Règle de confiance
    if (approvedItems.length > 0) {
      const approvedConfidences = approvedItems.map(item => item.confidence);
      const minApprovedConfidence = Math.min(...approvedConfidences);
      const avgApprovedConfidence = approvedConfidences.reduce((a, b) => a + b, 0) / approvedConfidences.length;

      if (minApprovedConfidence < 70 && avgApprovedConfidence > 80) {
        optimizations.push({
          rule: 'Seuil de confiance automatique',
          modification: `Réduire de 70% à ${Math.round(minApprovedConfidence + 5)}%`,
          reasoning: 'Des documents avec confiance plus faible ont été approuvés manuellement',
          impact: 'Réduction du temps de traitement de ~15%'
        });
      }
    }

    // Règles de champs obligatoires
    const fieldsAnalysis = this.analyzeFieldRequirements(items);
    fieldsAnalysis.forEach(analysis => {
      if (analysis.missingSeverity === 'critical' && analysis.approvalRate > 0.8) {
        optimizations.push({
          rule: `Champ obligatoire: ${analysis.fieldName}`,
          modification: 'Réduire la sévérité de "critique" à "avertissement"',
          reasoning: `${Math.round(analysis.approvalRate * 100)}% des documents sans ce champ ont été approuvés`,
          impact: 'Augmentation du taux d\'approbation automatique'
        });
      }
    });

    return optimizations;
  }

  /**
   * Calcul des métriques de performance du workflow
   */
  calculateWorkflowMetrics(items: ApprovalItem[]): WorkflowMetrics {
    const totalItems = items.length;
    if (totalItems === 0) return this.metrics;

    const approvedCount = items.filter(item => item.status === 'approved').length;
    const rejectedCount = items.filter(item => item.status === 'rejected').length;
    
    // Calcul du temps moyen (simulation basée sur estimatedReviewTime)
    const avgTime = items.reduce((sum, item) => sum + item.estimatedReviewTime, 0) / totalItems;

    // Analyse des problèmes communs
    const issueFrequency = new Map<string, { count: number; severity: string }>();
    items.forEach(item => {
      item.validationResult.issues.forEach(issue => {
        const current = issueFrequency.get(issue.type) || { count: 0, severity: issue.severity };
        issueFrequency.set(issue.type, {
          count: current.count + 1,
          severity: issue.severity
        });
      });
    });

    const commonIssues = Array.from(issueFrequency.entries())
      .map(([type, data]) => ({
        type,
        frequency: Math.round((data.count / totalItems) * 100),
        severity: data.severity
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Recommandations d'amélioration
    const recommendations = this.generateImprovementRecommendations(items, commonIssues);

    this.metrics = {
      totalProcessed: totalItems,
      averageProcessingTime: avgTime,
      approvalRate: (approvedCount / totalItems) * 100,
      rejectionRate: (rejectedCount / totalItems) * 100,
      autoFixSuccessRate: 75, // Valeur simulée
      commonIssues,
      improvementRecommendations: recommendations
    };

    return this.metrics;
  }

  /**
   * Recommandations d'amélioration automatiques
   */
  private generateImprovementRecommendations(
    items: ApprovalItem[],
    commonIssues: Array<{ type: string; frequency: number; severity: string }>
  ): string[] {
    const recommendations: string[] = [];

    // Recommandations basées sur les problèmes communs
    commonIssues.forEach(issue => {
      if (issue.frequency > 30) {
        switch (issue.type) {
          case 'low_confidence':
            recommendations.push('Améliorer la qualité des documents sources ou ajuster les paramètres OCR');
            break;
          case 'missing_field':
            recommendations.push('Réviser les règles d\'extraction pour mieux détecter les champs manquants');
            break;
          case 'invalid_format':
            recommendations.push('Ajouter des règles de normalisation automatique des formats');
            break;
        }
      }
    });

    // Recommandations basées sur les métriques
    if (this.metrics.approvalRate < 70) {
      recommendations.push('Considérer un assouplissement des critères de validation automatique');
    }

    if (this.metrics.averageProcessingTime > 15) {
      recommendations.push('Optimiser le workflow pour réduire le temps de traitement par document');
    }

    return [...new Set(recommendations)]; // Supprimer les doublons
  }

  /**
   * Mise à jour des patterns de correction automatique
   */
  private updateAutoFixPatterns(): void {
    // Analyser les données d'apprentissage pour créer de nouveaux patterns
    const frequentCorrections = this.learningData.filter(data => data.frequency >= 5);
    
    frequentCorrections.forEach(correction => {
      const patternId = `autofix_${correction.fieldName}_${correction.correctionType}`;
      
      if (!this.patterns.has(patternId)) {
        this.patterns.set(patternId, {
          id: patternId,
          name: `Correction automatique: ${correction.fieldName}`,
          description: `Correction automatique pour le champ "${correction.fieldName}"`,
          frequency: correction.frequency,
          improvementSuggestion: 'Application automatique de cette correction',
          autoFixRules: [{
            issueType: correction.correctionType,
            condition: `field.mappedValue === "${correction.originalValue}"`,
            action: `replace_with("${correction.correctedValue}")`,
            confidence: Math.min(95, correction.frequency * 10)
          }]
        });
      }
    });
  }

  private generateImprovementSuggestion(type: string, fieldName: string): string {
    switch (type) {
      case 'low_confidence':
        return `Améliorer la détection OCR pour le champ "${fieldName}"`;
      case 'missing_field':
        return `Ajouter des règles d'extraction spécifiques pour "${fieldName}"`;
      case 'invalid_format':
        return `Implémenter une normalisation automatique pour "${fieldName}"`;
      default:
        return 'Réviser les règles de validation pour ce type de problème';
    }
  }

  private createAutoFixRules(type: string, fieldName: string): AutoFixRule[] {
    const rules: AutoFixRule[] = [];

    switch (type) {
      case 'invalid_format':
        if (fieldName.includes('date')) {
          rules.push({
            issueType: type,
            condition: 'field.mappedValue.match(/\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}/)',
            action: 'normalize_date_format(field.mappedValue)',
            confidence: 85
          });
        }
        break;
      case 'low_confidence':
        rules.push({
          issueType: type,
          condition: 'field.confidence < 70 && field.mappedValue.length > 3',
          action: 'suggest_manual_review(field)',
          confidence: 60
        });
        break;
    }

    return rules;
  }

  private analyzeFieldRequirements(items: ApprovalItem[]): Array<{
    fieldName: string;
    missingSeverity: string;
    approvalRate: number;
  }> {
    const analysis: Array<{
      fieldName: string;
      missingSeverity: string;
      approvalRate: number;
    }> = [];

    const fieldNames = new Set<string>();
    items.forEach(item => {
      item.validationResult.issues.forEach(issue => {
        if (issue.fieldName && issue.type === 'missing_field') {
          fieldNames.add(issue.fieldName);
        }
      });
    });

    fieldNames.forEach(fieldName => {
      const itemsWithMissingField = items.filter(item =>
        item.validationResult.issues.some(issue =>
          issue.fieldName === fieldName && issue.type === 'missing_field'
        )
      );

      if (itemsWithMissingField.length > 0) {
        const approvedCount = itemsWithMissingField.filter(item => item.status === 'approved').length;
        const severity = itemsWithMissingField[0].validationResult.issues.find(issue =>
          issue.fieldName === fieldName && issue.type === 'missing_field'
        )?.severity || 'warning';

        analysis.push({
          fieldName,
          missingSeverity: severity,
          approvalRate: approvedCount / itemsWithMissingField.length
        });
      }
    });

    return analysis;
  }

  /**
   * Export des données d'apprentissage pour analyse
   */
  exportLearningData(): {
    patterns: WorkflowPattern[];
    learningData: LearningData[];
    metrics: WorkflowMetrics;
  } {
    return {
      patterns: Array.from(this.patterns.values()),
      learningData: this.learningData,
      metrics: this.metrics
    };
  }

  /**
   * Reset des données d'apprentissage
   */
  resetLearningData(): void {
    this.learningData = [];
    this.patterns.clear();
    this.metrics = {
      totalProcessed: 0,
      averageProcessingTime: 0,
      approvalRate: 0,
      rejectionRate: 0,
      autoFixSuccessRate: 0,
      commonIssues: [],
      improvementRecommendations: []
    };
  }
}

export const workflowOptimizationService = new WorkflowOptimizationService();
export default workflowOptimizationService;