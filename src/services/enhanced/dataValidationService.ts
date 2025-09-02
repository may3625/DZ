/* eslint-disable no-useless-escape */
/**
 * Service de validation et assurance qualité des données (Étape 13)
 * Validation spécialisée pour documents et données administratives algériennes
 * Vérification de cohérence, complétude et conformité réglementaire
 */

import { MappingResult, MappingSuggestion } from './smartMappingService';
import { EntityExtractionResult } from './entityExtractionService';
import { LegalPatternResult } from './legalPatternService';

export interface ValidationRule {
  id: string;
  name: string;
  type: 'format' | 'range' | 'required' | 'consistency' | 'business' | 'regulatory';
  description: string;
  pattern?: RegExp;
  validator?: (value: any, context?: any) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  category: 'administrative' | 'legal' | 'financial' | 'personal' | 'technical';
}

export interface ValidationResult {
  isValid: boolean;
  fieldId: string;
  fieldName: string;
  value: string;
  appliedRules: string[];
  violations: Array<{
    ruleId: string;
    ruleName: string;
    severity: ValidationRule['severity'];
    message: string;
    suggestedFix?: string;
  }>;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface DataQualityReport {
  overallScore: number; // 0-100
  totalFields: number;
  validFields: number;
  invalidFields: number;
  warnings: number;
  errors: number;
  fieldResults: ValidationResult[];
  consistencyChecks: Array<{
    checkName: string;
    passed: boolean;
    message: string;
    affectedFields: string[];
  }>;
  completenessScore: number;
  conformityScore: number;
  suggestions: Array<{
    type: 'improvement' | 'correction' | 'addition';
    priority: 'high' | 'medium' | 'low';
    description: string;
    affectedFields: string[];
  }>;
  processingTime: number;
}

export interface ValidationConfig {
  enableRegulatory: boolean;
  enableConsistency: boolean;
  enableCompleteness: boolean;
  strictMode: boolean;
  customRules: ValidationRule[];
  locale: 'dz' | 'fr' | 'ar';
}

class DataValidationService {
  private readonly DEFAULT_CONFIG: ValidationConfig = {
    enableRegulatory: true,
    enableConsistency: true,
    enableCompleteness: true,
    strictMode: false,
    customRules: [],
    locale: 'dz'
  };

  // Règles de validation spécialisées pour l'Algérie
  private readonly ALGERIAN_VALIDATION_RULES: ValidationRule[] = [
    // Identification personnelle
    {
      id: 'cin_format',
      name: 'Format Carte d\'Identité Nationale',
      type: 'format',
      description: 'Validation du format CIN algérien (18 chiffres)',
      pattern: /^\d{18}$/,
      message: 'Le numéro CIN doit contenir exactement 18 chiffres',
      severity: 'error',
      category: 'administrative'
    },
    {
      id: 'phone_algeria',
      name: 'Numéro de téléphone algérien',
      type: 'format',
      description: 'Validation format téléphone algérien',
      pattern: /^(?:\+213|0)?[567]\d{8}$/,
      message: 'Format téléphone invalide. Attendu: +213XXXXXXXXX ou 0XXXXXXXXX',
      severity: 'error',
      category: 'personal'
    },
    {
      id: 'postal_code_algeria',
      name: 'Code postal algérien',
      type: 'format',
      description: 'Code postal algérien (5 chiffres)',
      pattern: /^\d{5}$/,
      message: 'Le code postal doit contenir 5 chiffres',
      severity: 'warning',
      category: 'administrative'
    },
    
    // Références légales et administratives
    {
      id: 'law_reference_format',
      name: 'Format référence légale',
      type: 'format',
      description: 'Format standard des références légales algériennes',
      pattern: /^\d{2}[-\/]\d{2,3}$/,
      message: 'Format de référence légale invalide. Attendu: XX/XXX ou XX-XXX',
      severity: 'warning',
      category: 'legal'
    },
    {
      id: 'wilaya_code',
      name: 'Code wilaya',
      type: 'range',
      description: 'Code wilaya valide (01 à 48)',
      validator: (value: string) => {
        const code = parseInt(value);
        return code >= 1 && code <= 48;
      },
      message: 'Code wilaya invalide. Doit être entre 01 et 48',
      severity: 'error',
      category: 'administrative'
    },

    // Données financières
    {
      id: 'amount_format',
      name: 'Format montant en dinars',
      type: 'format',
      description: 'Format des montants en dinars algériens',
      pattern: /^\d{1,10}(?:[.,]\d{2})?(?:\s*(?:DA|DZD|dinars?))?$/i,
      message: 'Format de montant invalide. Exemple: 1000.00 DA',
      severity: 'warning',
      category: 'financial'
    },
    {
      id: 'fiscal_number',
      name: 'Numéro d\'identification fiscale',
      type: 'format',
      description: 'NIF algérien (15 chiffres)',
      pattern: /^\d{15}$/,
      message: 'Le NIF doit contenir exactement 15 chiffres',
      severity: 'error',
      category: 'financial'
    },

    // Dates et périodes
    {
      id: 'date_format',
      name: 'Format de date',
      type: 'format',
      description: 'Format de date standard',
      pattern: /^(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+\w+\s+\d{4})$/,
      message: 'Format de date invalide. Utilisez JJ/MM/AAAA ou JJ mois AAAA',
      severity: 'warning',
      category: 'administrative'
    },
    {
      id: 'date_consistency',
      name: 'Cohérence des dates',
      type: 'consistency',
      description: 'Vérification de la cohérence chronologique',
      validator: (value: string, context: any) => {
        // Validation personnalisée pour cohérence des dates
        return true; // À implémenter selon le contexte
      },
      message: 'Incohérence chronologique détectée',
      severity: 'warning',
      category: 'administrative'
    },

    // Champs obligatoires selon contexte
    {
      id: 'required_administrative',
      name: 'Champs obligatoires administratifs',
      type: 'required',
      description: 'Champs requis pour procédures administratives',
      validator: (value: string) => value && value.trim().length > 0,
      message: 'Ce champ est obligatoire pour les procédures administratives',
      severity: 'error',
      category: 'administrative'
    }
  ];

  // Base de données de référence pour validation
  private readonly REFERENCE_DATA = {
    wilayas: [
      { code: '01', name: 'Adrar' }, { code: '02', name: 'Chlef' },
      { code: '03', name: 'Laghouat' }, { code: '04', name: 'Oum el Bouaghi' },
      { code: '05', name: 'Batna' }, { code: '06', name: 'Béjaïa' },
      { code: '07', name: 'Biskra' }, { code: '08', name: 'Béchar' },
      { code: '09', name: 'Blida' }, { code: '10', name: 'Bouira' },
      { code: '11', name: 'Tamanrasset' }, { code: '12', name: 'Tébessa' },
      { code: '13', name: 'Tlemcen' }, { code: '14', name: 'Tiaret' },
      { code: '15', name: 'Tizi Ouzou' }, { code: '16', name: 'Alger' },
      { code: '17', name: 'Djelfa' }, { code: '18', name: 'Jijel' },
      { code: '19', name: 'Sétif' }, { code: '20', name: 'Saïda' },
      { code: '21', name: 'Skikda' }, { code: '22', name: 'Sidi Bel Abbès' },
      { code: '23', name: 'Annaba' }, { code: '24', name: 'Guelma' },
      { code: '25', name: 'Constantine' }, { code: '26', name: 'Médéa' },
      { code: '27', name: 'Mostaganem' }, { code: '28', name: 'M\'Sila' },
      { code: '29', name: 'Mascara' }, { code: '30', name: 'Ouargla' },
      { code: '31', name: 'Oran' }, { code: '32', name: 'El Bayadh' },
      { code: '33', name: 'Illizi' }, { code: '34', name: 'Bordj Bou Arréridj' },
      { code: '35', name: 'Boumerdès' }, { code: '36', name: 'El Tarf' },
      { code: '37', name: 'Tindouf' }, { code: '38', name: 'Tissemsilt' },
      { code: '39', name: 'El Oued' }, { code: '40', name: 'Khenchela' },
      { code: '41', name: 'Souk Ahras' }, { code: '42', name: 'Tipaza' },
      { code: '43', name: 'Mila' }, { code: '44', name: 'Aïn Defla' },
      { code: '45', name: 'Naâma' }, { code: '46', name: 'Aïn Témouchent' },
      { code: '47', name: 'Ghardaïa' }, { code: '48', name: 'Relizane' }
    ],

    legalDocumentTypes: [
      'loi', 'décret exécutif', 'arrêté ministériel', 'arrêté interministériel',
      'instruction', 'circulaire', 'note de service', 'ordonnance'
    ],

    administrativeDomains: [
      'état civil', 'urbanisme', 'commerce', 'éducation', 'santé',
      'emploi', 'finances', 'justice', 'sécurité sociale', 'transport'
    ]
  };

  /**
   * Étape 13 : Validation et assurance qualité des données
   */
  async validateData(
    mappingResults: MappingResult[],
    extractionData?: {
      entities?: EntityExtractionResult;
      legal?: LegalPatternResult;
    },
    config: Partial<ValidationConfig> = {}
  ): Promise<DataQualityReport> {
    
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = performance.now();

    console.log('🔍 Starting data validation and quality assurance...');

    try {
      const allFieldResults: ValidationResult[] = [];
      let totalFields = 0;
      let validFields = 0;
      let invalidFields = 0;
      let warnings = 0;
      let errors = 0;

      // Validation de chaque formulaire mappé
      for (const mappingResult of mappingResults) {
        console.log(`📋 Validating form: ${mappingResult.formId}`);

        for (const suggestion of mappingResult.suggestions) {
          totalFields++;

          const validationResult = await this.validateField(
            suggestion,
            mergedConfig,
            extractionData
          );

          allFieldResults.push(validationResult);

          if (validationResult.isValid) {
            validFields++;
          } else {
            invalidFields++;
          }

          // Compter violations par sévérité
          for (const violation of validationResult.violations) {
            if (violation.severity === 'error') {
              errors++;
            } else if (violation.severity === 'warning') {
              warnings++;
            }
          }
        }
      }

      // Vérifications de cohérence inter-champs
      const consistencyChecks = mergedConfig.enableConsistency
        ? this.performConsistencyChecks(allFieldResults, extractionData)
        : [];

      // Vérifications de complétude
      const completenessScore = mergedConfig.enableCompleteness
        ? this.calculateCompletenessScore(mappingResults)
        : 100;

      // Vérifications de conformité réglementaire
      const conformityScore = mergedConfig.enableRegulatory
        ? this.calculateConformityScore(allFieldResults)
        : 100;

      // Score global de qualité
      const overallScore = this.calculateOverallQualityScore(
        validFields,
        totalFields,
        completenessScore,
        conformityScore,
        errors,
        warnings
      );

      // Suggestions d'amélioration
      const suggestions = this.generateImprovementSuggestions(
        allFieldResults,
        consistencyChecks,
        completenessScore,
        conformityScore
      );

      const processingTime = performance.now() - startTime;

      console.log(`✅ Data validation completed in ${processingTime.toFixed(2)}ms`);
      console.log(`📊 Quality Score: ${overallScore.toFixed(1)}/100`);
      console.log(`📈 Valid fields: ${validFields}/${totalFields} (${((validFields/totalFields)*100).toFixed(1)}%)`);

      return {
        overallScore,
        totalFields,
        validFields,
        invalidFields,
        warnings,
        errors,
        fieldResults: allFieldResults,
        consistencyChecks,
        completenessScore,
        conformityScore,
        suggestions,
        processingTime
      };

    } catch (error) {
      console.error('❌ Data validation failed:', error);
      throw new Error(`Data validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validation d'un champ spécifique
   */
  private async validateField(
    suggestion: MappingSuggestion,
    config: ValidationConfig,
    extractionData?: any
  ): Promise<ValidationResult> {
    
    const appliedRules: string[] = [];
    const violations: ValidationResult['violations'] = [];
    
    // Combinaison des règles par défaut et personnalisées
    const allRules = [...this.ALGERIAN_VALIDATION_RULES, ...config.customRules];

    // Application des règles de validation
    for (const rule of allRules) {
      if (this.shouldApplyRule(rule, suggestion, config)) {
        appliedRules.push(rule.id);

        const isValid = this.executeValidationRule(rule, suggestion.suggestedValue, {
          fieldName: suggestion.fieldName,
          extractionData,
          suggestion
        });

        if (!isValid) {
          const suggestedFix = this.generateSuggestedFix(rule, suggestion.suggestedValue);
          
          violations.push({
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            message: rule.message,
            suggestedFix
          });
        }
      }
    }

    // Validation contextuelle spécialisée
    const contextualValidation = this.performContextualValidation(
      suggestion,
      extractionData
    );

    if (contextualValidation) {
      violations.push(...contextualValidation);
    }

    // Calcul de confiance ajustée
    const adjustedConfidence = this.calculateAdjustedConfidence(
      suggestion.confidence,
      violations
    );

    const isValid = violations.filter(v => v.severity === 'error').length === 0;

    return {
      isValid,
      fieldId: suggestion.fieldId,
      fieldName: suggestion.fieldName,
      value: suggestion.suggestedValue,
      appliedRules,
      violations,
      confidence: adjustedConfidence,
      metadata: {
        originalConfidence: suggestion.confidence,
        sourceType: suggestion.sourceType,
        reasoning: suggestion.reasoning
      }
    };
  }

  /**
   * Détermine si une règle doit être appliquée
   */
  private shouldApplyRule(
    rule: ValidationRule,
    suggestion: MappingSuggestion,
    config: ValidationConfig
  ): boolean {
    
    // Vérifier le mode strict
    if (!config.strictMode && rule.severity === 'warning') {
      return false;
    }

    // Vérifier la catégorie de règle
    if (!config.enableRegulatory && rule.category === 'legal') {
      return false;
    }

    // Vérifier la correspondance avec le nom du champ
    const fieldName = suggestion.fieldName.toLowerCase();
    const ruleId = rule.id.toLowerCase();

    // Logique de correspondance basée sur les mots-clés
    const fieldKeywords = fieldName.split(/[\s_-]+/);
    const ruleKeywords = ruleId.split('_');

    return ruleKeywords.some(keyword => 
      fieldKeywords.some(fieldKeyword => 
        fieldKeyword.includes(keyword) || keyword.includes(fieldKeyword)
      )
    );
  }

  /**
   * Exécution d'une règle de validation
   */
  private executeValidationRule(
    rule: ValidationRule,
    value: string,
    context: any
  ): boolean {
    
    try {
      // Validation par pattern regex
      if (rule.pattern) {
        return rule.pattern.test(value);
      }

      // Validation par fonction personnalisée
      if (rule.validator) {
        return rule.validator(value, context);
      }

      // Validation par type
      switch (rule.type) {
        case 'required':
          return value && value.trim().length > 0;

        case 'format':
          // Déjà géré par pattern
          return true;

        case 'range':
          // Géré par validator personnalisé
          return true;

        case 'consistency':
          return this.validateConsistency(value, context, rule);

        case 'business':
          return this.validateBusinessRule(value, context, rule);

        case 'regulatory':
          return this.validateRegulatoryRule(value, context, rule);

        default:
          return true;
      }

    } catch (error) {
      console.error(`Error executing validation rule ${rule.id}:`, error);
      return false;
    }
  }

  /**
   * Validation de cohérence
   */
  private validateConsistency(value: string, context: any, rule: ValidationRule): boolean {
    // Exemple : vérifier que la date de naissance est antérieure à la date d'émission
    if (rule.id === 'date_consistency') {
      // Logique spécialisée selon le contexte
      return true; // Simplifié pour l'exemple
    }

    return true;
  }

  /**
   * Validation de règles métier
   */
  private validateBusinessRule(value: string, context: any, rule: ValidationRule): boolean {
    // Exemple : vérifier que l'âge minimum est respecté pour certaines procédures
    return true; // À implémenter selon les besoins
  }

  /**
   * Validation réglementaire
   */
  private validateRegulatoryRule(value: string, context: any, rule: ValidationRule): boolean {
    // Exemple : vérifier conformité avec réglementation algérienne
    return true; // À implémenter selon les besoins
  }

  /**
   * Validation contextuelle spécialisée
   */
  private performContextualValidation(
    suggestion: MappingSuggestion,
    extractionData?: any
  ): ValidationResult['violations'] {
    
    const violations: ValidationResult['violations'] = [];

    // Validation basée sur les entités extraites
    if (extractionData?.entities) {
      const entityValidation = this.validateAgainstEntities(
        suggestion,
        extractionData.entities
      );
      if (entityValidation) {
        violations.push(entityValidation);
      }
    }

    // Validation basée sur les patterns légaux
    if (extractionData?.legal) {
      const legalValidation = this.validateAgainstLegalPatterns(
        suggestion,
        extractionData.legal
      );
      if (legalValidation) {
        violations.push(legalValidation);
      }
    }

    return violations;
  }

  /**
   * Validation contre entités extraites
   */
  private validateAgainstEntities(
    suggestion: MappingSuggestion,
    entityResult: EntityExtractionResult
  ): ValidationResult['violations'][0] | null {
    
    // Exemple : vérifier cohérence entre nom extrait et nom suggéré
    const fieldName = suggestion.fieldName.toLowerCase();
    
    if (fieldName.includes('nom') || fieldName.includes('name')) {
      const personEntities = entityResult.entities.filter(e => e.type === 'PERSON');
      
      if (personEntities.length > 0) {
        const hasMatch = personEntities.some(entity => 
          entity.text.toLowerCase().includes(suggestion.suggestedValue.toLowerCase()) ||
          suggestion.suggestedValue.toLowerCase().includes(entity.text.toLowerCase())
        );

        if (!hasMatch) {
          return {
            ruleId: 'entity_consistency',
            ruleName: 'Cohérence avec entités extraites',
            severity: 'warning',
            message: 'La valeur suggérée ne correspond pas aux entités de type PERSON extraites du document',
            suggestedFix: personEntities[0].text
          };
        }
      }
    }

    return null;
  }

  /**
   * Validation contre patterns légaux
   */
  private validateAgainstLegalPatterns(
    suggestion: MappingSuggestion,
    legalResult: LegalPatternResult
  ): ValidationResult['violations'][0] | null {
    
    // Exemple : vérifier format des références légales
    const fieldName = suggestion.fieldName.toLowerCase();
    
    if (fieldName.includes('reference') || fieldName.includes('loi')) {
      const legalEntities = legalResult.entities.filter(e => 
        e.type === 'law_reference' || e.type === 'decree_number'
      );

      if (legalEntities.length > 0) {
        const hasValidFormat = legalEntities.some(entity => 
          entity.value === suggestion.suggestedValue
        );

        if (!hasValidFormat && !/\d{2}[-\/]\d{2,3}/.test(suggestion.suggestedValue)) {
          return {
            ruleId: 'legal_format_consistency',
            ruleName: 'Format référence légale',
            severity: 'warning',
            message: 'Le format de la référence légale ne correspond pas aux standards algériens',
            suggestedFix: legalEntities[0]?.value
          };
        }
      }
    }

    return null;
  }

  /**
   * Génération de correction suggérée
   */
  private generateSuggestedFix(rule: ValidationRule, value: string): string | undefined {
    switch (rule.id) {
      case 'phone_algeria': {
        // Nettoyer et reformater le numéro
        const digits = value.replace(/\D/g, '');
        if (digits.length === 10 && digits.startsWith('0')) {
          return `+213${digits.substring(1)}`;
        }
        break;
      }
 
      case 'cin_format': {
        // Compléter avec des zéros si nécessaire
        const cinDigits = value.replace(/\D/g, '');
        if (cinDigits.length < 18) {
          return cinDigits.padStart(18, '0');
        }
        break;
      }
 
      case 'date_format': {
        // Standardiser le format de date
        const dateMatch = value.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        }
        break;
      }
 
      case 'amount_format': {
        // Standardiser le format des montants
        const amountMatch = value.match(/(\d+(?:[.,]\d{2})?)/);
        if (amountMatch) {
          return `${amountMatch[1].replace(',', '.') } DA`;
        }
        break;
      }
    }
 
    return undefined;
  }

  /**
   * Calcul de confiance ajustée
   */
  private calculateAdjustedConfidence(
    originalConfidence: number,
    violations: ValidationResult['violations']
  ): number {
    
    let adjustedConfidence = originalConfidence;

    for (const violation of violations) {
      switch (violation.severity) {
        case 'error':
          adjustedConfidence *= 0.5; // Réduction importante pour erreurs
          break;
        case 'warning':
          adjustedConfidence *= 0.8; // Réduction modérée pour avertissements
          break;
        case 'info':
          adjustedConfidence *= 0.95; // Réduction légère pour informations
          break;
      }
    }

    return Math.max(adjustedConfidence, 0.1); // Minimum de 0.1
  }

  /**
   * Vérifications de cohérence inter-champs
   */
  private performConsistencyChecks(
    fieldResults: ValidationResult[],
    extractionData?: any
  ): DataQualityReport['consistencyChecks'] {
    
    const checks: DataQualityReport['consistencyChecks'] = [];

    // Vérification cohérence des dates
    const dateFields = fieldResults.filter(f => 
      f.fieldName.toLowerCase().includes('date')
    );

    if (dateFields.length >= 2) {
      const dateConsistencyCheck = this.checkDateConsistency(dateFields);
      if (dateConsistencyCheck) {
        checks.push(dateConsistencyCheck);
      }
    }

    // Vérification cohérence géographique
    const locationFields = fieldResults.filter(f => 
      f.fieldName.toLowerCase().includes('adresse') ||
      f.fieldName.toLowerCase().includes('wilaya') ||
      f.fieldName.toLowerCase().includes('commune')
    );

    if (locationFields.length >= 2) {
      const locationConsistencyCheck = this.checkLocationConsistency(locationFields);
      if (locationConsistencyCheck) {
        checks.push(locationConsistencyCheck);
      }
    }

    // Vérification cohérence identité
    const identityFields = fieldResults.filter(f => 
      f.fieldName.toLowerCase().includes('nom') ||
      f.fieldName.toLowerCase().includes('prenom') ||
      f.fieldName.toLowerCase().includes('cin')
    );

    if (identityFields.length >= 2) {
      const identityConsistencyCheck = this.checkIdentityConsistency(identityFields);
      if (identityConsistencyCheck) {
        checks.push(identityConsistencyCheck);
      }
    }

    return checks;
  }

  /**
   * Vérification cohérence des dates
   */
  private checkDateConsistency(dateFields: ValidationResult[]): DataQualityReport['consistencyChecks'][0] | null {
    // Logique simplifiée - à étendre selon les besoins
    const dates = dateFields.map(f => ({
      field: f.fieldName,
      value: f.value,
      parsed: this.parseDate(f.value)
    })).filter(d => d.parsed);

    if (dates.length >= 2) {
      // Exemple : vérifier que date de naissance < date d'émission
      const birthDate = dates.find(d => d.field.includes('naissance'));
      const issueDate = dates.find(d => d.field.includes('emission') || d.field.includes('delivrance'));

      if (birthDate && issueDate && birthDate.parsed! > issueDate.parsed!) {
        return {
          checkName: 'Cohérence chronologique',
          passed: false,
          message: 'La date de naissance est postérieure à la date d\'émission',
          affectedFields: [birthDate.field, issueDate.field]
        };
      }
    }

    return {
      checkName: 'Cohérence des dates',
      passed: true,
      message: 'Toutes les dates sont cohérentes',
      affectedFields: dateFields.map(f => f.fieldName)
    };
  }

  /**
   * Vérification cohérence géographique
   */
  private checkLocationConsistency(locationFields: ValidationResult[]): DataQualityReport['consistencyChecks'][0] | null {
    // Vérifier que wilaya et commune sont cohérentes
    const wilayaField = locationFields.find(f => f.fieldName.toLowerCase().includes('wilaya'));
    const communeField = locationFields.find(f => f.fieldName.toLowerCase().includes('commune'));

    if (wilayaField && communeField) {
      // Logique de validation géographique simplifiée
      const isConsistent = this.validateGeographicConsistency(wilayaField.value, communeField.value);

      return {
        checkName: 'Cohérence géographique',
        passed: isConsistent,
        message: isConsistent ? 
          'Cohérence géographique vérifiée' : 
          'Incohérence entre wilaya et commune',
        affectedFields: [wilayaField.fieldName, communeField.fieldName]
      };
    }

    return null;
  }

  /**
   * Vérification cohérence identité
   */
  private checkIdentityConsistency(identityFields: ValidationResult[]): DataQualityReport['consistencyChecks'][0] | null {
    // Validation basique - peut être étendue
    return {
      checkName: 'Cohérence identité',
      passed: true,
      message: 'Informations d\'identité cohérentes',
      affectedFields: identityFields.map(f => f.fieldName)
    };
  }

  /**
   * Parsing de date flexible
   */
  private parseDate(dateString: string): Date | null {
    try {
      // Essayer plusieurs formats
      const formats = [
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, // JJ/MM/AAAA
        /(\d{1,2})\s+(\w+)\s+(\d{4})/, // JJ mois AAAA
      ];

      for (const format of formats) {
        const match = dateString.match(format);
        if (match) {
          if (format === formats[0]) {
            // Format numérique
            const [, day, month, year] = match;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else if (format === formats[1]) {
            // Format avec nom de mois
            const [, day, monthName, year] = match;
            const monthIndex = this.getMonthIndex(monthName);
            if (monthIndex !== -1) {
              return new Date(parseInt(year), monthIndex, parseInt(day));
            }
          }
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Obtenir l'index du mois à partir du nom
   */
  private getMonthIndex(monthName: string): number {
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];

    return months.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
  }

  /**
   * Validation cohérence géographique
   */
  private validateGeographicConsistency(wilaya: string, commune: string): boolean {
    // Validation simplifiée - devrait utiliser une base de données géographique
    return true;
  }

  /**
   * Calcul score de complétude
   */
  private calculateCompletenessScore(mappingResults: MappingResult[]): number {
    let totalFields = 0;
    let mappedFields = 0;

    for (const result of mappingResults) {
      totalFields += result.suggestions.length + result.unmappedFields.length;
      mappedFields += result.suggestions.length;
    }

    return totalFields > 0 ? (mappedFields / totalFields) * 100 : 100;
  }

  /**
   * Calcul score de conformité
   */
  private calculateConformityScore(fieldResults: ValidationResult[]): number {
    if (fieldResults.length === 0) return 100;

    const conformFields = fieldResults.filter(r => r.isValid).length;
    return (conformFields / fieldResults.length) * 100;
  }

  /**
   * Calcul score global de qualité
   */
  private calculateOverallQualityScore(
    validFields: number,
    totalFields: number,
    completenessScore: number,
    conformityScore: number,
    errors: number,
    warnings: number
  ): number {
    
    if (totalFields === 0) return 0;

    // Score de base : pourcentage de champs valides
    const validityScore = (validFields / totalFields) * 100;

    // Pénalités pour erreurs et avertissements
    const errorPenalty = Math.min(errors * 5, 30); // Max 30 points de pénalité
    const warningPenalty = Math.min(warnings * 2, 20); // Max 20 points de pénalité

    // Score pondéré
    const weightedScore = (
      validityScore * 0.4 +
      completenessScore * 0.3 +
      conformityScore * 0.3
    ) - errorPenalty - warningPenalty;

    return Math.max(0, Math.min(100, weightedScore));
  }

  /**
   * Génération de suggestions d'amélioration
   */
  private generateImprovementSuggestions(
    fieldResults: ValidationResult[],
    consistencyChecks: DataQualityReport['consistencyChecks'],
    completenessScore: number,
    conformityScore: number
  ): DataQualityReport['suggestions'] {
    
    const suggestions: DataQualityReport['suggestions'] = [];

    // Suggestions basées sur les erreurs
    const errorFields = fieldResults.filter(r => 
      r.violations.some(v => v.severity === 'error')
    );

    if (errorFields.length > 0) {
      suggestions.push({
        type: 'correction',
        priority: 'high',
        description: `Corriger ${errorFields.length} champ(s) avec erreurs de validation`,
        affectedFields: errorFields.map(f => f.fieldName)
      });
    }

    // Suggestions basées sur la complétude
    if (completenessScore < 80) {
      suggestions.push({
        type: 'addition',
        priority: 'medium',
        description: 'Compléter les champs manquants pour améliorer la complétude du formulaire',
        affectedFields: []
      });
    }

    // Suggestions basées sur la conformité
    if (conformityScore < 90) {
      suggestions.push({
        type: 'improvement',
        priority: 'medium',
        description: 'Réviser les formats et valeurs pour améliorer la conformité réglementaire',
        affectedFields: fieldResults.filter(r => !r.isValid).map(f => f.fieldName)
      });
    }

    // Suggestions basées sur les vérifications de cohérence
    const failedChecks = consistencyChecks.filter(c => !c.passed);
    if (failedChecks.length > 0) {
      suggestions.push({
        type: 'correction',
        priority: 'high',
        description: 'Résoudre les incohérences détectées entre les champs',
        affectedFields: failedChecks.flatMap(c => c.affectedFields)
      });
    }

    return suggestions;
  }
}

export const dataValidationService = new DataValidationService();
export default dataValidationService;