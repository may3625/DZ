import { MappedField, MappingResult } from '@/types/mapping';
import { StructuredPublication } from './algerianLegalRegexService';

export interface QualityMetrics {
  overallScore: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  confidence: number;
  issues: QualityIssue[];
  recommendations: string[];
}

export interface QualityIssue {
  type: 'missing' | 'inconsistent' | 'low_confidence' | 'format_error';
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
}

export interface QualityThresholds {
  minimum_confidence: number;
  required_fields: string[];
  format_patterns: Record<string, RegExp>;
}

class MappingQualityService {
  private qualityThresholds: Record<string, QualityThresholds> = {
    loi: {
      minimum_confidence: 70,
      required_fields: ['title', 'number', 'date', 'institution'],
      format_patterns: {
        number: /^\d{2,4}[-\/]\d{1,3}$/,
        date: /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$|^\d{1,2}(?:er)?\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}$/i
      }
    },
    decret: {
      minimum_confidence: 70,
      required_fields: ['title', 'number', 'date', 'authority'],
      format_patterns: {
        number: /^\d{2,4}[-\/]\d{1,3}$/,
        date: /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$|^\d{1,2}(?:er)?\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}$/i
      }
    }
  };

  /**
   * Évalue la qualité d'un mapping
   */
  evaluateMappingQuality(
    mappingResult: MappingResult,
    sourcePublication: StructuredPublication
  ): QualityMetrics {
    const startTime = Date.now();
    
    console.log('🔍 Évaluation de la qualité du mapping...');
    
    const issues: QualityIssue[] = [];
    const recommendations: string[] = [];
    
    // 1. Évaluation de la complétude
    const completeness = this.evaluateCompleteness(mappingResult, issues);
    
    // 2. Évaluation de la précision
    const accuracy = this.evaluateAccuracy(mappingResult, sourcePublication, issues);
    
    // 3. Évaluation de la cohérence
    const consistency = this.evaluateConsistency(mappingResult, issues);
    
    // 4. Évaluation de la confiance
    const confidence = this.evaluateConfidence(mappingResult, issues);
    
    // 5. Génération des recommandations
    this.generateRecommendations(mappingResult, recommendations);
    
    const overallScore = this.calculateOverallScore(completeness, accuracy, consistency, confidence);
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ Évaluation qualité terminée en ${processingTime}ms - Score: ${overallScore}%`);
    
    return {
      overallScore,
      completeness,
      accuracy,
      consistency,
      confidence,
      issues,
      recommendations
    };
  }

  /**
   * Évalue la complétude du mapping
   */
  private evaluateCompleteness(mappingResult: MappingResult, issues: QualityIssue[]): number {
    const thresholds = this.qualityThresholds[mappingResult.formType];
    if (!thresholds) return 100;

    const requiredFields = thresholds.required_fields;
    const mappedRequiredFields = mappingResult.mappedFields.filter(field => 
      requiredFields.includes(field.fieldName) && field.mappedValue
    );

    const completenessScore = (mappedRequiredFields.length / requiredFields.length) * 100;

    // Identifier les champs manquants
    const missingFields = requiredFields.filter(fieldName => 
      !mappingResult.mappedFields.some(field => 
        field.fieldName === fieldName && field.mappedValue
      )
    );

    missingFields.forEach(fieldName => {
      issues.push({
        type: 'missing',
        field: fieldName,
        message: `Champ requis manquant: ${fieldName}`,
        severity: 'high',
        suggestion: `Rechercher manuellement la valeur pour ${fieldName} dans le texte source`
      });
    });

    return Math.round(completenessScore);
  }

  /**
   * Évalue la précision du mapping
   */
  private evaluateAccuracy(
    mappingResult: MappingResult, 
    sourcePublication: StructuredPublication, 
    issues: QualityIssue[]
  ): number {
    let accuracyScore = 100;
    const thresholds = this.qualityThresholds[mappingResult.formType];

    if (!thresholds) return accuracyScore;

    // Vérifier les formats
    mappingResult.mappedFields.forEach(field => {
      if (field.mappedValue && thresholds.format_patterns[field.fieldName]) {
        const pattern = thresholds.format_patterns[field.fieldName];
        if (!pattern.test(field.mappedValue)) {
          accuracyScore -= 15;
          issues.push({
            type: 'format_error',
            field: field.fieldName,
            message: `Format incorrect pour ${field.fieldLabel}: "${field.mappedValue}"`,
            severity: 'medium',
            suggestion: this.getFormatSuggestion(field.fieldName)
          });
        }
      }
    });

    // Vérifier la cohérence avec la source
    const sourceVerification = this.verifyAgainstSource(mappingResult, sourcePublication);
    if (sourceVerification.score < 80) {
      accuracyScore -= (80 - sourceVerification.score);
      issues.push(...sourceVerification.issues);
    }

    return Math.max(Math.round(accuracyScore), 0);
  }

  /**
   * Évalue la cohérence interne
   */
  private evaluateConsistency(mappingResult: MappingResult, issues: QualityIssue[]): number {
    let consistencyScore = 100;

    // Vérifier la cohérence des dates
    const dateFields = mappingResult.mappedFields.filter(field => 
      field.fieldName.includes('date') && field.mappedValue
    );

    if (dateFields.length > 1) {
      const dateConsistency = this.checkDateConsistency(dateFields);
      if (!dateConsistency.isConsistent) {
        consistencyScore -= 20;
        issues.push({
          type: 'inconsistent',
          field: 'dates',
          message: 'Incohérence détectée entre les dates',
          severity: 'medium',
          suggestion: 'Vérifier la chronologie des dates dans le document'
        });
      }
    }

    // Vérifier la cohérence des numéros
    const numberFields = mappingResult.mappedFields.filter(field => 
      field.fieldName.includes('number') && field.mappedValue
    );

    if (numberFields.length > 0) {
      const numberConsistency = this.checkNumberConsistency(numberFields, mappingResult.formType);
      if (!numberConsistency.isConsistent) {
        consistencyScore -= 15;
        issues.push({
          type: 'inconsistent',
          field: 'numbers',
          message: 'Format de numérotation incohérent',
          severity: 'medium'
        });
      }
    }

    return Math.max(Math.round(consistencyScore), 0);
  }

  /**
   * Évalue la confiance globale
   */
  private evaluateConfidence(mappingResult: MappingResult, issues: QualityIssue[]): number {
    const thresholds = this.qualityThresholds[mappingResult.formType];
    const minimumConfidence = thresholds?.minimum_confidence || 70;

    // Champs avec confiance faible
    const lowConfidenceFields = mappingResult.mappedFields.filter(field => 
      field.confidence < minimumConfidence
    );

    lowConfidenceFields.forEach(field => {
      issues.push({
        type: 'low_confidence',
        field: field.fieldName,
        message: `Confiance faible (${field.confidence}%) pour ${field.fieldLabel}`,
        severity: field.confidence < 50 ? 'high' : 'medium',
        suggestion: 'Révision manuelle recommandée'
      });
    });

    // Score basé sur la confiance moyenne et le nombre de champs à faible confiance
    const averageConfidence = mappingResult.overallConfidence || 0;
    const penaltyPerLowConfidence = Math.min(lowConfidenceFields.length * 10, 30);
    
    return Math.max(averageConfidence - penaltyPerLowConfidence, 0);
  }

  /**
   * Calcule le score global
   */
  private calculateOverallScore(
    completeness: number, 
    accuracy: number, 
    consistency: number, 
    confidence: number
  ): number {
    // Pondération des critères
    const weights = {
      completeness: 0.3,
      accuracy: 0.3,
      consistency: 0.2,
      confidence: 0.2
    };

    const weightedScore = 
      (completeness * weights.completeness) +
      (accuracy * weights.accuracy) +
      (consistency * weights.consistency) +
      (confidence * weights.confidence);

    return Math.round(weightedScore);
  }

  /**
   * Vérifie la cohérence des dates
   */
  private checkDateConsistency(dateFields: MappedField[]): { isConsistent: boolean; issues: string[] } {
    // Logique de vérification de cohérence des dates
    const dates: Date[] = [];
    const issues: string[] = [];

    dateFields.forEach(field => {
      const dateValue = this.parseAlgerianDate(field.mappedValue!);
      if (dateValue) {
        dates.push(dateValue);
      } else {
        issues.push(`Format de date non reconnu: ${field.mappedValue}`);
      }
    });

    // Vérifier l'ordre chronologique logique
    const isConsistent = dates.length === 0 || this.isChronologicallyCorrect(dates);

    return { isConsistent, issues };
  }

  /**
   * Vérifie la cohérence des numéros
   */
  private checkNumberConsistency(numberFields: MappedField[], formType: string): { isConsistent: boolean } {
    // Vérifier que tous les numéros suivent le même format
    const formats = numberFields.map(field => this.detectNumberFormat(field.mappedValue!));
    const uniqueFormats = [...new Set(formats)];

    return { isConsistent: uniqueFormats.length <= 1 };
  }

  /**
   * Parse une date algérienne
   */
  private parseAlgerianDate(dateStr: string): Date | null {
    // Logique de parsing des dates algériennes
    const patterns = [
      { regex: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, format: 'DD/MM/YYYY' },
      { regex: /(\d{1,2})(?:er)?\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/i, format: 'textuel' }
    ];

    for (const pattern of patterns) {
      const match = pattern.regex.exec(dateStr);
      if (match) {
        if (pattern.format === 'textuel') {
          const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
          const monthIndex = months.indexOf(match[2].toLowerCase());
          return new Date(parseInt(match[3]), monthIndex, parseInt(match[1]));
        } else {
          return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
        }
      }
    }

    return null;
  }

  /**
   * Vérifie l'ordre chronologique
   */
  private isChronologicallyCorrect(dates: Date[]): boolean {
    if (dates.length <= 1) return true;
    
    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
    return dates.every((date, index) => date.getTime() === sortedDates[index].getTime());
  }

  /**
   * Détecte le format d'un numéro
   */
  private detectNumberFormat(numberStr: string): string {
    if (/^\d{2}-\d{1,3}$/.test(numberStr)) return 'YY-XXX';
    if (/^\d{4}-\d{1,3}$/.test(numberStr)) return 'YYYY-XXX';
    if (/^\d{2}\/\d{1,3}$/.test(numberStr)) return 'YY/XXX';
    if (/^\d{4}\/\d{1,3}$/.test(numberStr)) return 'YYYY/XXX';
    return 'autre';
  }

  /**
   * Vérifie la cohérence avec la source
   */
  private verifyAgainstSource(mappingResult: MappingResult, sourcePublication: StructuredPublication): { score: number; issues: QualityIssue[] } {
    let score = 100;
    const issues: QualityIssue[] = [];
    const sourceText = sourcePublication.content?.toLowerCase() || '';

    // Vérifier que les valeurs mappées existent dans la source
    mappingResult.mappedFields.forEach(field => {
      if (field.mappedValue) {
        const valueInSource = sourceText.includes(field.mappedValue.toLowerCase());
        if (!valueInSource) {
          score -= 10;
          issues.push({
            type: 'inconsistent',
            field: field.fieldName,
            message: `Valeur "${field.mappedValue}" non trouvée dans le texte source`,
            severity: 'medium',
            suggestion: 'Vérifier la correspondance avec le texte original'
          });
        }
      }
    });

    return { score: Math.max(score, 0), issues };
  }

  /**
   * Génère des recommandations d'amélioration
   */
  private generateRecommendations(mappingResult: MappingResult, recommendations: string[]): void {
    const lowConfidenceCount = mappingResult.mappedFields.filter(f => f.confidence < 70).length;
    const missingCount = mappingResult.unmappedFields.length;

    if (lowConfidenceCount > 0) {
      recommendations.push(`Réviser ${lowConfidenceCount} champ(s) avec une confiance faible`);
    }

    if (missingCount > 0) {
      recommendations.push(`Rechercher manuellement ${missingCount} champ(s) non mappé(s)`);
    }

    if (mappingResult.overallConfidence < 70) {
      recommendations.push('Considérer une révision complète du mapping');
    }

    if (mappingResult.mappedFields.some(f => f.isEdited)) {
      recommendations.push('Documenter les modifications manuelles pour améliorer l\'algorithme');
    }
  }

  /**
   * Obtient une suggestion de format
   */
  private getFormatSuggestion(fieldName: string): string {
    const suggestions: Record<string, string> = {
      number: 'Format attendu: YYYY-XXX ou YY/XXX (ex: 2023-045 ou 23/045)',
      date: 'Format attendu: JJ/MM/AAAA ou JJ mois AAAA (ex: 15/03/2023 ou 15 mars 2023)'
    };

    return suggestions[fieldName] || 'Vérifier le format de la valeur';
  }

  /**
   * Obtient les seuils de qualité pour un type de document
   */
  getQualityThresholds(formType: string): QualityThresholds | null {
    return this.qualityThresholds[formType] || null;
  }

  /**
   * Met à jour les seuils de qualité
   */
  updateQualityThresholds(formType: string, thresholds: QualityThresholds): void {
    this.qualityThresholds[formType] = thresholds;
  }
}

export const mappingQualityService = new MappingQualityService();
export default mappingQualityService;