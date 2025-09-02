/**
 * Service de diagnostic avancé pour OCR
 * Analyse complète de la qualité et des problèmes potentiels
 */

import { MappingResult } from '@/types/mapping';
import { ValidationResult, ValidationIssue } from '@/services/validation/validationService';

export interface DiagnosticReport {
  overall: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    confidence: number;
    readyForProduction: boolean;
  };
  
  ocr: {
    textQuality: number;
    characterAccuracy: number;
    layoutDetection: number;
    languageDetection: string[];
    problematicRegions: TextRegion[];
  };
  
  mapping: {
    fieldCoverage: number;
    accuracyScore: number;
    missingCriticalFields: string[];
    lowConfidenceFields: Array<{ field: string; confidence: number }>;
    ambiguousFields: Array<{ field: string; candidates: string[] }>;
  };
  
  validation: {
    passedChecks: number;
    totalChecks: number;
    criticalIssues: ValidationIssue[];
    warnings: ValidationIssue[];
    suggestions: DiagnosticSuggestion[];
  };
  
  performance: {
    processingTime: number;
    memoryUsage: number;
    optimizationTips: string[];
  };
  
  recommendations: {
    immediate: string[];
    improvements: string[];
    alternatives: string[];
  };
}

export interface TextRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  issues: string[];
  suggestedFix: string;
}

export interface DiagnosticSuggestion {
  type: 'correction' | 'improvement' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  field?: string;
  description: string;
  action: string;
  estimatedImpact: number; // 0-100
}

export interface DiagnosticFilter {
  includeOCR: boolean;
  includeMapping: boolean;
  includeValidation: boolean;
  includePerformance: boolean;
  minConfidence: number;
  focusFields?: string[];
}

class DiagnosticService {
  private readonly GRADE_THRESHOLDS = {
    A: 90,
    B: 80,
    C: 70,
    D: 60,
    F: 0
  };

  /**
   * Génère un rapport de diagnostic complet
   */
  generateDiagnosticReport(
    extractedText: string,
    mappingResult: MappingResult,
    validationResult: ValidationResult,
    filter: DiagnosticFilter = this.getDefaultFilter()
  ): DiagnosticReport {
    console.log('🔍 [Diagnostic] Génération du rapport complet...');

    const startTime = Date.now();
    
    const report: DiagnosticReport = {
      overall: this.analyzeOverall(mappingResult, validationResult),
      ocr: filter.includeOCR ? this.analyzeOCR(extractedText) : this.getEmptyOCRAnalysis(),
      mapping: filter.includeMapping ? this.analyzeMapping(mappingResult) : this.getEmptyMappingAnalysis(),
      validation: filter.includeValidation ? this.analyzeValidation(validationResult) : this.getEmptyValidationAnalysis(),
      performance: filter.includePerformance ? this.analyzePerformance(Date.now() - startTime) : this.getEmptyPerformanceAnalysis(),
      recommendations: this.generateRecommendations(mappingResult, validationResult)
    };

    console.log(`✅ [Diagnostic] Rapport généré en ${Date.now() - startTime}ms (grade: ${report.overall.grade})`);
    return report;
  }

  /**
   * Détection de faible confiance OCR et champs manquants
   */
  detectQualityIssues(
    mappingResult: MappingResult,
    validationResult: ValidationResult,
    threshold: number = 70
  ): {
    lowConfidenceFields: Array<{ field: string; confidence: number; impact: string }>;
    missingFields: Array<{ field: string; importance: string; suggestions: string[] }>;
    inconsistencies: Array<{ description: string; affectedFields: string[] }>;
  } {
    const lowConfidenceFields: Array<{ field: string; confidence: number; impact: string }> = [];
    const missingFields: Array<{ field: string; importance: string; suggestions: string[] }> = [];
    const inconsistencies: Array<{ description: string; affectedFields: string[] }> = [];

    // Analyser les champs à faible confiance
    if (mappingResult.mappedFields) {
      Object.entries(mappingResult.mappedFields).forEach(([field, data]) => {
        if (data.confidence && data.confidence < threshold) {
          lowConfidenceFields.push({
            field,
            confidence: data.confidence,
            impact: this.assessFieldImpact(field)
          });
        }
      });
    }

    // Détecter les champs manquants critiques
    const criticalFields = ['title', 'date', 'institution', 'type', 'reference'];
    const mappedFieldNames = Object.keys(mappingResult.mappedFields || {});
    
    criticalFields.forEach(field => {
      if (!mappedFieldNames.includes(field)) {
        missingFields.push({
          field,
          importance: 'critique',
          suggestions: this.suggestFieldSources(field, mappedFieldNames)
        });
      }
    });

    // Détecter les incohérences
    validationResult.issues.forEach(issue => {
      if (issue.severity === 'high' && issue.type === 'inconsistency') {
        inconsistencies.push({
          description: issue.message,
          affectedFields: [issue.field || 'unknown']
        });
      }
    });

    return { lowConfidenceFields, missingFields, inconsistencies };
  }

  /**
   * Correction en ligne des champs mappés
   */
  generateInlineCorrections(
    mappingResult: MappingResult,
    validationResult: ValidationResult
  ): Array<{
    field: string;
    currentValue: any;
    suggestedValue: any;
    confidence: number;
    reason: string;
    autoApplicable: boolean;
  }> {
    const corrections: Array<{
      field: string;
      currentValue: any;
      suggestedValue: any;
      confidence: number;
      reason: string;
      autoApplicable: boolean;
    }> = [];

    // Corrections basées sur les issues de validation
    validationResult.issues.forEach(issue => {
      if (issue.field && issue.suggestion) {
        const currentValue = mappingResult.mappedFields?.[issue.field]?.value;
        
        corrections.push({
          field: issue.field,
          currentValue,
          suggestedValue: issue.suggestion,
          confidence: this.calculateCorrectionConfidence(issue),
          reason: issue.message,
          autoApplicable: issue.severity === 'low' && this.isSafeCorrection(issue)
        });
      }
    });

    // Corrections basées sur des patterns connus
    const patternCorrections = this.detectPatternCorrections(mappingResult);
    corrections.push(...patternCorrections);

    return corrections.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Suggestions d'amélioration par type de problème
   */
  generateImprovementSuggestions(diagnosticReport: DiagnosticReport): DiagnosticSuggestion[] {
    const suggestions: DiagnosticSuggestion[] = [];

    // Suggestions OCR
    if (diagnosticReport.ocr.textQuality < 80) {
      suggestions.push({
        type: 'improvement',
        priority: 'high',
        description: 'Qualité OCR faible détectée',
        action: 'Améliorer la qualité de l\'image source ou utiliser un préprocessing',
        estimatedImpact: 30
      });
    }

    // Suggestions de mapping
    if (diagnosticReport.mapping.fieldCoverage < 70) {
      suggestions.push({
        type: 'improvement',
        priority: 'high',
        description: 'Couverture de champs insuffisante',
        action: 'Revoir les règles de mapping ou enrichir les données sources',
        estimatedImpact: 25
      });
    }

    // Suggestions de validation
    if (diagnosticReport.validation.criticalIssues.length > 0) {
      suggestions.push({
        type: 'correction',
        priority: 'high',
        description: `${diagnosticReport.validation.criticalIssues.length} problème(s) critique(s)`,
        action: 'Corriger les erreurs critiques avant finalisation',
        estimatedImpact: 40
      });
    }

    // Suggestions de performance
    if (diagnosticReport.performance.processingTime > 5000) {
      suggestions.push({
        type: 'optimization',
        priority: 'medium',
        description: 'Temps de traitement élevé',
        action: 'Optimiser les algorithmes ou utiliser un traitement par lot',
        estimatedImpact: 15
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.estimatedImpact - a.estimatedImpact;
    });
  }

  // === Méthodes d'analyse privées ===

  private analyzeOverall(mappingResult: MappingResult, validationResult: ValidationResult) {
    const score = (validationResult.score + (mappingResult.confidence || 0)) / 2;
    const grade = this.calculateGrade(score);
    
    return {
      score: Math.round(score),
      grade,
      confidence: mappingResult.confidence || 0,
      readyForProduction: validationResult.readyForApproval && score >= 80
    };
  }

  private analyzeOCR(extractedText: string) {
    const textQuality = this.assessTextQuality(extractedText);
    const characterAccuracy = this.estimateCharacterAccuracy(extractedText);
    const languageDetection = this.detectLanguages(extractedText);
    
    return {
      textQuality,
      characterAccuracy,
      layoutDetection: 85, // Simulation
      languageDetection,
      problematicRegions: this.identifyProblematicRegions(extractedText)
    };
  }

  private analyzeMapping(mappingResult: MappingResult) {
    const mappedFields = mappingResult.mappedFields || [];
    const totalPossibleFields = 15; // Estimation
    const fieldCoverage = (mappedFields.length / totalPossibleFields) * 100;
    
    const accuracyScores = mappedFields
      .map(field => field.confidence || 0);
    const accuracyScore = accuracyScores.length > 0 
      ? accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length
      : 0;

    const missingCriticalFields = ['title', 'date', 'institution']
      .filter(field => !mappedFields.find(f => f.fieldName === field));

    const lowConfidenceFields = mappedFields
      .filter(field => (field.confidence || 0) < 70)
      .map(field => ({ field: field.fieldName, confidence: field.confidence || 0 }));

    return {
      fieldCoverage: Math.round(fieldCoverage),
      accuracyScore: Math.round(accuracyScore),
      missingCriticalFields,
      lowConfidenceFields,
      ambiguousFields: []
    };
  }

  private analyzeValidation(validationResult: ValidationResult) {
    const criticalIssues = validationResult.issues.filter(issue => issue.severity === 'high');
    const warnings = validationResult.issues.filter(issue => issue.severity === 'medium');
    
    return {
      passedChecks: Math.max(0, 10 - validationResult.issues.length),
      totalChecks: 10,
      criticalIssues,
      warnings,
      suggestions: this.generateImprovementSuggestions({} as DiagnosticReport).slice(0, 3)
    };
  }

  private analyzePerformance(processingTime: number) {
    const optimizationTips: string[] = [];
    
    if (processingTime > 3000) {
      optimizationTips.push('Considérer un traitement asynchrone');
    }
    if (processingTime > 5000) {
      optimizationTips.push('Optimiser les algorithmes de mapping');
    }

    return {
      processingTime,
      memoryUsage: 0, // Simulation
      optimizationTips
    };
  }

  private generateRecommendations(mappingResult: MappingResult, validationResult: ValidationResult) {
    const immediate: string[] = [];
    const improvements: string[] = [];
    const alternatives: string[] = [];

    // Recommandations immédiates
    if (validationResult.issues.some(issue => issue.severity === 'high')) {
      immediate.push('Corriger les erreurs critiques détectées');
    }
    if ((mappingResult.confidence || 0) < 70) {
      immediate.push('Vérifier manuellement les champs à faible confiance');
    }

    // Améliorations
    improvements.push('Enrichir les règles de validation spécifiques au domaine');
    improvements.push('Optimiser les patterns de reconnaissance');

    // Alternatives
    alternatives.push('Utiliser un modèle OCR spécialisé pour ce type de document');
    alternatives.push('Implémenter une validation par lot pour documents similaires');

    return { immediate, improvements, alternatives };
  }

  // === Méthodes utilitaires ===

  private getDefaultFilter(): DiagnosticFilter {
    return {
      includeOCR: true,
      includeMapping: true,
      includeValidation: true,
      includePerformance: true,
      minConfidence: 0
    };
  }

  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= this.GRADE_THRESHOLDS.A) return 'A';
    if (score >= this.GRADE_THRESHOLDS.B) return 'B';
    if (score >= this.GRADE_THRESHOLDS.C) return 'C';
    if (score >= this.GRADE_THRESHOLDS.D) return 'D';
    return 'F';
  }

  private assessTextQuality(text: string): number {
    if (!text) return 0;
    
    // Critères de qualité
    const hasConsistentSpacing = !/\s{3,}/.test(text);
    const hasProperCapitalization = /[A-Z]/.test(text);
    const hasMinimalGarbage = (text.match(/[^\w\s\p{L}\p{N}\p{P}]/gu) || []).length < text.length * 0.05;
    const hasReasonableLength = text.length > 100;
    
    let score = 0;
    if (hasConsistentSpacing) score += 25;
    if (hasProperCapitalization) score += 25;
    if (hasMinimalGarbage) score += 25;
    if (hasReasonableLength) score += 25;
    
    return score;
  }

  private estimateCharacterAccuracy(text: string): number {
    // Simulation d'estimation d'exactitude des caractères
    const suspiciousChars = (text.match(/[^a-zA-ZÀ-ÿ0-9\s.,;:!?()[\]{}'"°%&@#-]/g) || []).length;
    const totalChars = text.length;
    return Math.max(0, 100 - (suspiciousChars / totalChars) * 100);
  }

  private detectLanguages(text: string): string[] {
    const languages: string[] = [];
    
    if (/[a-zA-Z]/.test(text)) languages.push('fr');
    if (/[\u0600-\u06FF]/.test(text)) languages.push('ar');
    if (/\b(article|loi|décret|arrêté)\b/i.test(text)) languages.push('fr-legal');
    
    return languages.length > 0 ? languages : ['unknown'];
  }

  private identifyProblematicRegions(text: string): TextRegion[] {
    // Simulation d'identification de régions problématiques
    const regions: TextRegion[] = [];
    
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      if (line.length > 0 && (line.match(/[^\w\s]/g) || []).length / line.length > 0.3) {
        regions.push({
          x: 0,
          y: index * 20,
          width: line.length * 8,
          height: 20,
          confidence: 30,
          issues: ['Caractères suspects détectés'],
          suggestedFix: 'Vérifier manuellement cette région'
        });
      }
    });
    
    return regions;
  }

  private assessFieldImpact(field: string): string {
    const criticalFields = ['title', 'date', 'institution', 'reference'];
    const importantFields = ['type', 'category', 'description'];
    
    if (criticalFields.includes(field)) return 'critique';
    if (importantFields.includes(field)) return 'important';
    return 'mineur';
  }

  private suggestFieldSources(field: string, availableFields: string[]): string[] {
    const suggestions: string[] = [];
    
    // Suggestions basées sur des patterns de noms de champs
    const fieldPatterns: Record<string, string[]> = {
      title: ['titre', 'nom', 'intitule', 'designation'],
      date: ['date', 'publication', 'signature', 'promulgation'],
      institution: ['autorite', 'ministere', 'organisme', 'emetteur'],
      type: ['nature', 'categorie', 'forme', 'genre']
    };
    
    const patterns = fieldPatterns[field] || [];
    patterns.forEach(pattern => {
      const matches = availableFields.filter(f => 
        f.toLowerCase().includes(pattern.toLowerCase())
      );
      suggestions.push(...matches);
    });
    
    return [...new Set(suggestions)];
  }

  private calculateCorrectionConfidence(issue: ValidationIssue): number {
    let confidence = 50; // Base
    
    if (issue.severity === 'low') confidence += 20;
    if (issue.type === 'format') confidence += 15;
    if (issue.suggestion) confidence += 15;
    
    return Math.min(100, confidence);
  }

  private isSafeCorrection(issue: ValidationIssue): boolean {
    const safeTypes = ['format', 'case', 'spacing'];
    return safeTypes.includes(issue.type);
  }

  private detectPatternCorrections(mappingResult: MappingResult): Array<{
    field: string;
    currentValue: any;
    suggestedValue: any;
    confidence: number;
    reason: string;
    autoApplicable: boolean;
  }> {
    const corrections: any[] = [];
    
    if (!mappingResult.mappedFields) return corrections;
    
    Object.entries(mappingResult.mappedFields).forEach(([field, data]) => {
      const value = data.value;
      
      // Correction des formats de date
      if (field.includes('date') && typeof value === 'string') {
        const dateMatch = value.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
        if (dateMatch) {
          const correctedDate = `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
          corrections.push({
            field,
            currentValue: value,
            suggestedValue: correctedDate,
            confidence: 85,
            reason: 'Normalisation du format de date',
            autoApplicable: true
          });
        }
      }
      
      // Correction de la casse
      if (field === 'title' && typeof value === 'string' && value === value.toUpperCase()) {
        corrections.push({
          field,
          currentValue: value,
          suggestedValue: value.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
          confidence: 70,
          reason: 'Normalisation de la casse du titre',
          autoApplicable: false
        });
      }
    });
    
    return corrections;
  }

  private getEmptyOCRAnalysis() {
    return {
      textQuality: 0,
      characterAccuracy: 0,
      layoutDetection: 0,
      languageDetection: [],
      problematicRegions: []
    };
  }

  private getEmptyMappingAnalysis() {
    return {
      fieldCoverage: 0,
      accuracyScore: 0,
      missingCriticalFields: [],
      lowConfidenceFields: [],
      ambiguousFields: []
    };
  }

  private getEmptyValidationAnalysis() {
    return {
      passedChecks: 0,
      totalChecks: 0,
      criticalIssues: [],
      warnings: [],
      suggestions: []
    };
  }

  private getEmptyPerformanceAnalysis() {
    return {
      processingTime: 0,
      memoryUsage: 0,
      optimizationTips: []
    };
  }
}

export const diagnosticService = new DiagnosticService();
export default diagnosticService;