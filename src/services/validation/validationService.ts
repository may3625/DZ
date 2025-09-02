import { MappedField, MappingResult } from '@/types/mapping';
import { StructuredPublication } from '@/services/enhanced/algerianLegalRegexService';

export interface ValidationIssue {
  id: string;
  type: 'low_confidence' | 'missing_field' | 'invalid_format' | 'incomplete_mapping' | 'inconsistency' | 'format';
  severity: 'critical' | 'warning' | 'info' | 'high' | 'medium' | 'low'; // Extended for backward compatibility
  fieldName?: string;
  field?: string; // Added for backward compatibility
  message: string;
  suggestions?: string[];
  suggestion?: string; // Added for backward compatibility
  autoFixable: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  recommendations: string[];
  readyForApproval: boolean;
}

class ValidationService {
  private readonly CONFIDENCE_THRESHOLD = 70;
  private readonly CRITICAL_FIELDS = ['title', 'date', 'institution', 'type'];

  /**
   * Diagnostic complet avec liste des avertissements
   */
  validateMappingResult(mappingResult: MappingResult, extractedText: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    const recommendations: string[] = [];

    // Vérification de la confiance globale
    if (mappingResult.overallConfidence < this.CONFIDENCE_THRESHOLD) {
      issues.push({
        id: 'low_overall_confidence',
        type: 'low_confidence',
        severity: 'warning',
        message: `Confiance globale faible (${mappingResult.overallConfidence}%)`,
        suggestions: ['Vérifier manuellement les champs extraits', 'Améliorer la qualité du document source'],
        autoFixable: false
      });
    }

    // Validation des champs individuels
    mappingResult.mappedFields.forEach(field => {
      this.validateField(field, issues);
    });

    // Vérification des champs manquants critiques
    this.checkMissingCriticalFields(mappingResult, issues);

    // Détection de données incohérentes
    this.detectInconsistencies(mappingResult, extractedText, issues);

    // Calcul du score de validation
    const score = this.calculateValidationScore(issues, mappingResult);

    // Génération des recommandations
    this.generateRecommendations(issues, recommendations);

    return {
      isValid: issues.filter(i => i.severity === 'critical').length === 0,
      score,
      issues,
      recommendations,
      readyForApproval: score > 80 && issues.filter(i => i.severity === 'critical').length === 0
    };
  }

  /**
   * Validation d'un champ individuel
   */
  private validateField(field: MappedField, issues: ValidationIssue[]): void {
    // Vérification de la confiance du champ
    if (field.confidence < this.CONFIDENCE_THRESHOLD) {
      issues.push({
        id: `low_confidence_${field.fieldName}`,
        type: 'low_confidence',
        severity: this.CRITICAL_FIELDS.includes(field.fieldName) ? 'critical' : 'warning',
        fieldName: field.fieldName,
        message: `Confiance faible pour "${field.fieldLabel}" (${field.confidence}%)`,
        suggestions: ['Vérifier manuellement la valeur', 'Rechercher dans le texte source'],
        autoFixable: false
      });
    }

    // Vérification de la valeur mappée
    if (!field.mappedValue || field.mappedValue.trim() === '') {
      if (this.CRITICAL_FIELDS.includes(field.fieldName)) {
        issues.push({
          id: `missing_critical_${field.fieldName}`,
          type: 'missing_field',
          severity: 'critical',
          fieldName: field.fieldName,
          message: `Champ critique manquant: "${field.fieldLabel}"`,
          suggestions: ['Rechercher manuellement dans le document', 'Vérifier l\'extraction OCR'],
          autoFixable: false
        });
      }
    }

    // Validation du format selon le type de champ
    this.validateFieldFormat(field, issues);
  }

  /**
   * Validation du format selon le type de champ
   */
  private validateFieldFormat(field: MappedField, issues: ValidationIssue[]): void {
    if (!field.mappedValue) return;

    // Validation des dates
    if (field.fieldName.includes('date') && field.mappedValue) {
      if (!this.isValidDate(field.mappedValue)) {
        issues.push({
          id: `invalid_date_${field.fieldName}`,
          type: 'invalid_format',
          severity: 'warning',
          fieldName: field.fieldName,
          message: `Format de date invalide: "${field.mappedValue}"`,
          suggestions: ['Corriger le format (JJ/MM/AAAA)', 'Vérifier l\'extraction'],
          autoFixable: true
        });
      }
    }

    // Validation des numéros
    if (field.fieldName.includes('number') || field.fieldName.includes('numero')) {
      if (!/^\d+/.test(field.mappedValue)) {
        issues.push({
          id: `invalid_number_${field.fieldName}`,
          type: 'invalid_format',
          severity: 'warning',
          fieldName: field.fieldName,
          message: `Format de numéro invalide: "${field.mappedValue}"`,
          suggestions: ['Extraire uniquement les chiffres', 'Vérifier le contenu'],
          autoFixable: true
        });
      }
    }
  }

  /**
   * Vérification des champs manquants critiques
   */
  private checkMissingCriticalFields(mappingResult: MappingResult, issues: ValidationIssue[]): void {
    const mappedFieldNames = mappingResult.mappedFields.map(f => f.fieldName);
    
    this.CRITICAL_FIELDS.forEach(criticalField => {
      if (!mappedFieldNames.includes(criticalField)) {
        issues.push({
          id: `missing_critical_field_${criticalField}`,
          type: 'missing_field',
          severity: 'critical',
          message: `Champ critique non détecté: ${criticalField}`,
          suggestions: ['Ajouter manuellement', 'Vérifier les règles d\'extraction'],
          autoFixable: false
        });
      }
    });
  }

  /**
   * Détection d'incohérences dans les données
   */
  private detectInconsistencies(mappingResult: MappingResult, extractedText: string, issues: ValidationIssue[]): void {
    // Vérification de la cohérence des dates
    const dateFields = mappingResult.mappedFields.filter(f => 
      f.fieldName.includes('date') && f.mappedValue
    );

    if (dateFields.length > 1) {
      const dates = dateFields.map(f => new Date(f.mappedValue!)).filter(d => !isNaN(d.getTime()));
      if (dates.length > 1) {
        const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
        const span = sortedDates[sortedDates.length - 1].getTime() - sortedDates[0].getTime();
        const daysDiff = span / (1000 * 60 * 60 * 24);
        
        if (daysDiff > 365) {
          issues.push({
            id: 'inconsistent_dates',
            type: 'invalid_format',
            severity: 'warning',
            message: 'Dates incohérentes détectées (écart > 1 an)',
            suggestions: ['Vérifier les dates extraites', 'Corriger manuellement'],
            autoFixable: false
          });
        }
      }
    }
  }

  /**
   * Calcul du score de validation
   */
  private calculateValidationScore(issues: ValidationIssue[], mappingResult: MappingResult): number {
    let score = mappingResult.overallConfidence;

    // Pénalités selon la gravité des problèmes
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'warning':
          score -= 10;
          break;
        case 'info':
          score -= 2;
          break;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Génération des recommandations
   */
  private generateRecommendations(issues: ValidationIssue[], recommendations: string[]): void {
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    if (criticalCount > 0) {
      recommendations.push(`Corriger ${criticalCount} problème(s) critique(s) avant approbation`);
    }

    if (warningCount > 3) {
      recommendations.push('Vérifier la qualité du document source');
      recommendations.push('Considérer une nouvelle extraction OCR');
    }

    if (issues.some(i => i.type === 'low_confidence')) {
      recommendations.push('Réviser manuellement les champs à faible confiance');
    }

    if (issues.some(i => i.autoFixable)) {
      recommendations.push('Utiliser la correction automatique pour les problèmes simples');
    }
  }

  /**
   * Correction automatique des problèmes
   */
  autoFixIssues(mappingResult: MappingResult, issues: ValidationIssue[]): MappingResult {
    const fixableIssues = issues.filter(i => i.autoFixable);
    const updatedFields = [...mappingResult.mappedFields];

    fixableIssues.forEach(issue => {
      if (issue.fieldName) {
        const fieldIndex = updatedFields.findIndex(f => f.fieldName === issue.fieldName);
        if (fieldIndex !== -1) {
          const field = updatedFields[fieldIndex];
          
          // Correction automatique selon le type d'erreur
          if (issue.type === 'invalid_format' && issue.fieldName.includes('date')) {
            const fixedDate = this.fixDateFormat(field.mappedValue || '');
            if (fixedDate) {
              updatedFields[fieldIndex] = {
                ...field,
                mappedValue: fixedDate,
                isEdited: true,
                originalValue: field.mappedValue
              };
            }
          }
        }
      }
    });

    return {
      ...mappingResult,
      mappedFields: updatedFields
    };
  }

  /**
   * Revalidation sans refaire l'OCR
   */
  revalidate(mappingResult: MappingResult, extractedText: string): ValidationResult {
    return this.validateMappingResult(mappingResult, extractedText);
  }

  /**
   * Utilitaires de validation
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.length >= 8;
  }

  private fixDateFormat(dateString: string): string | null {
    // Tentative de correction automatique des formats de date
    const patterns = [
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,
      /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
      /(\d{1,2})\s+(\w+)\s+(\d{4})/
    ];

    for (const pattern of patterns) {
      const match = dateString.match(pattern);
      if (match) {
        // Tentative de création d'une date valide
        try {
          const date = new Date(match[0]);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('fr-FR');
          }
        } catch (e) {
          continue;
        }
      }
    }

    return null;
  }
}

export const validationService = new ValidationService();
export default validationService;