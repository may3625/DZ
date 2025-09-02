/* eslint-disable no-useless-escape */
/**
 * Service de mappage intelligent de formulaires (Étape 12)
 * Mappage automatique des données extraites vers les champs de formulaires
 * IA contextuelle pour suggestions intelligentes avec apprentissage
 */

import { ExtractedContent } from './contentExtractionService';
import { LegalPatternResult } from './legalPatternService';
import { ProcedurePatternResult } from './procedurePatternService';
import { EntityExtractionResult } from './entityExtractionService';

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'email' | 'select' | 'checkbox' | 'textarea';
  label: string;
  required: boolean;
  options?: string[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  metadata?: {
    category?: string;
    synonyms?: string[];
    keywords?: string[];
    context?: string;
  };
}

export interface FormSchema {
  id: string;
  name: string;
  type: 'administrative' | 'legal' | 'financial' | 'personal' | 'business';
  fields: FormField[];
  metadata?: {
    description?: string;
    domain?: string;
    language?: 'fra' | 'ara' | 'mixed';
  };
}

export interface MappingSuggestion {
  fieldId: string;
  fieldName: string;
  suggestedValue: string;
  confidence: number;
  sourceType: 'content' | 'entity' | 'pattern' | 'procedure';
  sourceData: any;
  reasoning: string;
  alternatives?: Array<{
    value: string;
    confidence: number;
    reasoning: string;
  }>;
}

export interface MappingResult {
  formId: string;
  suggestions: MappingSuggestion[];
  completeness: number; // Pourcentage de champs mappés
  overallConfidence: number;
  unmappedFields: string[];
  ambiguousFields: Array<{
    fieldId: string;
    possibleValues: string[];
    needsUserInput: boolean;
  }>;
  processingTime: number;
}

export interface SmartMappingConfig {
  enableContextualMapping: boolean;
  enableMultiSourceMapping: boolean;
  confidenceThreshold: number;
  maxAlternatives: number;
  enableLearning: boolean;
  strictValidation: boolean;
}

export interface MappingHistory {
  formId: string;
  fieldId: string;
  suggestedValue: string;
  actualValue: string;
  userAccepted: boolean;
  timestamp: Date;
  confidence: number;
}

class SmartMappingService {
  private readonly DEFAULT_CONFIG: SmartMappingConfig = {
    enableContextualMapping: true,
    enableMultiSourceMapping: true,
    confidenceThreshold: 0.6,
    maxAlternatives: 3,
    enableLearning: true,
    strictValidation: false
  };

  // Base de connaissances pour mapping algérien
  private readonly MAPPING_KNOWLEDGE = {
    // Synonymes et correspondances pour champs communs
    fieldSynonyms: {
      'nom': ['nom', 'name', 'الاسم', 'dénomination', 'appellation'],
      'prenom': ['prénom', 'first_name', 'الاسم الأول'],
      'date_naissance': ['date de naissance', 'né le', 'birth_date', 'تاريخ الميلاد'],
      'lieu_naissance': ['lieu de naissance', 'né à', 'birth_place', 'مكان الميلاد'],
      'adresse': ['adresse', 'domicile', 'résidence', 'العنوان'],
      'telephone': ['téléphone', 'tel', 'phone', 'portable', 'الهاتف'],
      'email': ['email', 'e-mail', 'courriel', 'البريد الإلكتروني'],
      'profession': ['profession', 'métier', 'emploi', 'المهنة'],
      'numero_identite': ['numéro d\'identité', 'cin', 'carte nationale', 'رقم الهوية'],
      'date': ['date', 'le', 'en date du', 'التاريخ'],
      'montant': ['montant', 'somme', 'total', 'المبلغ'],
      'reference': ['référence', 'numéro', 'numero', 'المرجع']
    },

    // Patterns de validation spécifiques à l'Algérie
    validationPatterns: {
      'numero_identite': /^\d{18}$/,
      'telephone_algerie': /^(?:\+213|0)?[567]\d{8}$/,
      'code_postal_algerie': /^\d{5}$/,
      'wilaya_code': /^[0-4]\d$/,
      'matricule_fiscal': /^\d{15}$/,
      'numero_registre_commerce': /^\d{2}\/\d{6}$/
    },

    // Contextes administratifs algériens
    administrativeContexts: {
      'etat_civil': ['acte de naissance', 'mariage', 'décès', 'famille'],
      'urbanisme': ['permis de construire', 'autorisation', 'zonage'],
      'commerce': ['registre', 'licence', 'patente', 'autorisation commerciale'],
      'education': ['inscription', 'scolarité', 'diplôme', 'établissement'],
      'sante': ['carte chifa', 'assurance', 'soins', 'médical'],
      'emploi': ['travail', 'sécurité sociale', 'cotisation', 'salaire'],
      'finances': ['impôt', 'taxe', 'déclaration', 'revenus']
    }
  };

  // Historique d'apprentissage (en mémoire, peut être persisté)
  private mappingHistory: MappingHistory[] = [];

  /**
   * Étape 12 : Mappage intelligent vers formulaires
   */
  async mapToForms(
    extractionData: {
      content: ExtractedContent;
      legal?: LegalPatternResult;
      procedure?: ProcedurePatternResult;
      entities?: EntityExtractionResult;
    },
    formSchemas: FormSchema[],
    config: Partial<SmartMappingConfig> = {}
  ): Promise<MappingResult[]> {
    
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = performance.now();

    console.log('🤖 Starting intelligent form mapping...');
    console.log(`📋 Processing ${formSchemas.length} form schemas`);

    try {
      const results: MappingResult[] = [];

      for (const formSchema of formSchemas) {
        console.log(`📝 Mapping to form: ${formSchema.name}`);

        const mappingResult = await this.mapToSingleForm(
          extractionData,
          formSchema,
          mergedConfig
        );

        results.push(mappingResult);
      }

      const totalProcessingTime = performance.now() - startTime;

      console.log(`✅ Smart mapping completed in ${totalProcessingTime.toFixed(2)}ms`);
      console.log(`📊 Mapped ${results.length} forms with average confidence: ${this.calculateAverageConfidence(results).toFixed(2)}`);

      return results;

    } catch (error) {
      console.error('❌ Smart mapping failed:', error);
      throw new Error(`Smart mapping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mappage vers un formulaire spécifique
   */
  private async mapToSingleForm(
    extractionData: any,
    formSchema: FormSchema,
    config: SmartMappingConfig
  ): Promise<MappingResult> {
    
    const startTime = performance.now();
    const suggestions: MappingSuggestion[] = [];
    const unmappedFields: string[] = [];
    const ambiguousFields: MappingResult['ambiguousFields'] = [];

    for (const field of formSchema.fields) {
      console.log(`🔍 Mapping field: ${field.name}`);

      const fieldSuggestions = await this.generateFieldSuggestions(
        field,
        extractionData,
        formSchema,
        config
      );

      if (fieldSuggestions.length === 0) {
        unmappedFields.push(field.id);
      } else if (fieldSuggestions.length === 1) {
        if (fieldSuggestions[0].confidence >= config.confidenceThreshold) {
          suggestions.push(fieldSuggestions[0]);
        } else {
          unmappedFields.push(field.id);
        }
      } else {
        // Champ ambigu avec plusieurs suggestions
        const topSuggestion = fieldSuggestions[0];
        if (topSuggestion.confidence >= config.confidenceThreshold) {
          suggestions.push({
            ...topSuggestion,
            alternatives: fieldSuggestions.slice(1, config.maxAlternatives + 1).map(s => ({
              value: s.suggestedValue,
              confidence: s.confidence,
              reasoning: s.reasoning
            }))
          });
        } else {
          ambiguousFields.push({
            fieldId: field.id,
            possibleValues: fieldSuggestions.slice(0, config.maxAlternatives).map(s => s.suggestedValue),
            needsUserInput: true
          });
        }
      }
    }

    // Calcul des métriques
    const completeness = (suggestions.length / formSchema.fields.length) * 100;
    const overallConfidence = suggestions.length > 0
      ? suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length
      : 0;

    const processingTime = performance.now() - startTime;

    return {
      formId: formSchema.id,
      suggestions,
      completeness,
      overallConfidence,
      unmappedFields,
      ambiguousFields,
      processingTime
    };
  }

  /**
   * Génération de suggestions pour un champ
   */
  private async generateFieldSuggestions(
    field: FormField,
    extractionData: any,
    formSchema: FormSchema,
    config: SmartMappingConfig
  ): Promise<MappingSuggestion[]> {
    
    const suggestions: MappingSuggestion[] = [];

    // Stratégie 1 : Mapping direct par nom/synonymes
    const directSuggestions = this.findDirectMatches(field, extractionData);
    suggestions.push(...directSuggestions);

    // Stratégie 2 : Mapping contextuel par entités
    if (config.enableContextualMapping && extractionData.entities) {
      const entitySuggestions = this.findEntityMatches(field, extractionData.entities, formSchema);
      suggestions.push(...entitySuggestions);
    }

    // Stratégie 3 : Mapping par patterns légaux
    if (config.enableMultiSourceMapping && extractionData.legal) {
      const legalSuggestions = this.findLegalPatternMatches(field, extractionData.legal);
      suggestions.push(...legalSuggestions);
    }

    // Stratégie 4 : Mapping par procédures
    if (config.enableMultiSourceMapping && extractionData.procedure) {
      const procedureSuggestions = this.findProcedureMatches(field, extractionData.procedure);
      suggestions.push(...procedureSuggestions);
    }

    // Stratégie 5 : Apprentissage basé sur l'historique
    if (config.enableLearning) {
      const learnedSuggestions = this.findLearnedMatches(field, extractionData);
      suggestions.push(...learnedSuggestions);
    }

    // Déduplication et tri par confiance
    const uniqueSuggestions = this.deduplicateAndRankSuggestions(suggestions);

    // Validation si activée
    if (config.strictValidation) {
      return this.validateSuggestions(uniqueSuggestions, field);
    }

    return uniqueSuggestions;
  }

  /**
   * Recherche de correspondances directes
   */
  private findDirectMatches(field: FormField, extractionData: any): MappingSuggestion[] {
    const suggestions: MappingSuggestion[] = [];
    const fieldName = field.name.toLowerCase();
    
    // Recherche dans les synonymes
    const synonyms = this.MAPPING_KNOWLEDGE.fieldSynonyms[fieldName] || [fieldName];
    
    for (const synonym of synonyms) {
      // Recherche dans le texte extrait
      const textMatch = this.findInText(synonym, extractionData.content.overallText || '');
      if (textMatch) {
        suggestions.push({
          fieldId: field.id,
          fieldName: field.name,
          suggestedValue: textMatch.value,
          confidence: textMatch.confidence,
          sourceType: 'content',
          sourceData: textMatch,
          reasoning: `Correspondance directe avec "${synonym}" dans le texte`
        });
      }
    }

    return suggestions;
  }

  /**
   * Recherche dans le texte avec contexte
   */
  private findInText(searchTerm: string, text: string): { value: string, confidence: number } | null {
    const lines = text.split('\n');
    const regex = new RegExp(`${searchTerm}\\s*[:\-]?\\s*([^\\n]{1,100})`, 'i');
    
    for (const line of lines) {
      const match = regex.exec(line);
      if (match) {
        const value = match[1].trim();
        if (value.length > 0 && value.length < 100) {
          return {
            value,
            confidence: 0.8
          };
        }
      }
    }

    return null;
  }

  /**
   * Recherche par entités nommées
   */
  private findEntityMatches(
    field: FormField, 
    entityResult: EntityExtractionResult,
    formSchema: FormSchema
  ): MappingSuggestion[] {
    
    const suggestions: MappingSuggestion[] = [];
    const fieldName = field.name.toLowerCase();

    // Mapping de types d'entités vers types de champs
    const entityFieldMapping: Record<string, string[]> = {
      'PERSON': ['nom', 'prenom', 'nom_prenom', 'signataire', 'demandeur'],
      'ORG': ['organisme', 'entreprise', 'employeur', 'administration'],
      'LOC': ['adresse', 'lieu', 'ville', 'wilaya', 'commune'],
      'DATE': ['date', 'date_naissance', 'date_emission', 'date_expiration'],
      'MONEY': ['montant', 'prix', 'cout', 'frais', 'salaire'],
      'LAW': ['reference_legale', 'loi', 'decret', 'texte_reference']
    };

    for (const entity of entityResult.entities) {
      const compatibleFields = entityFieldMapping[entity.type] || [];
      
      for (const compatibleField of compatibleFields) {
        if (fieldName.includes(compatibleField) || 
            field.metadata?.synonyms?.some(s => s.toLowerCase().includes(compatibleField))) {
          
          suggestions.push({
            fieldId: field.id,
            fieldName: field.name,
            suggestedValue: entity.normalized || entity.text,
            confidence: entity.confidence * 0.9, // Légèrement réduit pour mapping indirect
            sourceType: 'entity',
            sourceData: entity,
            reasoning: `Entité ${entity.type} correspondant au champ ${field.name}`
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Recherche par patterns légaux
   */
  private findLegalPatternMatches(field: FormField, legalResult: LegalPatternResult): MappingSuggestion[] {
    const suggestions: MappingSuggestion[] = [];
    const fieldName = field.name.toLowerCase();

    for (const entity of legalResult.entities) {
      let isCompatible = false;
      let reasoning = '';

      switch (entity.type) {
        case 'law_reference':
          if (fieldName.includes('reference') || fieldName.includes('loi') || fieldName.includes('texte')) {
            isCompatible = true;
            reasoning = 'Référence légale extraite du document';
          }
          break;

        case 'decree_number':
          if (fieldName.includes('decret') || fieldName.includes('numero') || fieldName.includes('reference')) {
            isCompatible = true;
            reasoning = 'Numéro de décret identifié';
          }
          break;

        case 'date':
          if (fieldName.includes('date')) {
            isCompatible = true;
            reasoning = 'Date extraite du contexte légal';
          }
          break;

        case 'amount':
          if (fieldName.includes('montant') || fieldName.includes('cout') || fieldName.includes('frais')) {
            isCompatible = true;
            reasoning = 'Montant identifié dans le document';
          }
          break;
      }

      if (isCompatible) {
        suggestions.push({
          fieldId: field.id,
          fieldName: field.name,
          suggestedValue: entity.value,
          confidence: entity.confidence * 0.85,
          sourceType: 'pattern',
          sourceData: entity,
          reasoning
        });
      }
    }

    return suggestions;
  }

  /**
   * Recherche par données de procédure
   */
  private findProcedureMatches(field: FormField, procedureResult: ProcedurePatternResult): MappingSuggestion[] {
    const suggestions: MappingSuggestion[] = [];
    const fieldName = field.name.toLowerCase();

    // Mapping des coûts
    if ((fieldName.includes('cout') || fieldName.includes('frais') || fieldName.includes('montant')) && 
        procedureResult.costs.length > 0) {
      
      for (const cost of procedureResult.costs) {
        suggestions.push({
          fieldId: field.id,
          fieldName: field.name,
          suggestedValue: cost.amount || cost.description,
          confidence: cost.confidence * 0.8,
          sourceType: 'procedure',
          sourceData: cost,
          reasoning: `Coût identifié dans la procédure: ${cost.description}`
        });
      }
    }

    // Mapping des délais
    if ((fieldName.includes('delai') || fieldName.includes('duree') || fieldName.includes('temps')) && 
        procedureResult.timeline.length > 0) {
      
      for (const timeElement of procedureResult.timeline) {
        suggestions.push({
          fieldId: field.id,
          fieldName: field.name,
          suggestedValue: `${timeElement.numericValue} ${timeElement.unit}`,
          confidence: timeElement.confidence * 0.8,
          sourceType: 'procedure',
          sourceData: timeElement,
          reasoning: `Délai extrait de la procédure: ${timeElement.context}`
        });
      }
    }

    // Mapping des contacts
    if ((fieldName.includes('contact') || fieldName.includes('telephone') || fieldName.includes('adresse')) && 
        procedureResult.contacts.length > 0) {
      
      for (const contact of procedureResult.contacts) {
        let value = '';
        if (fieldName.includes('telephone') && contact.phone) {
          value = contact.phone;
        } else if (fieldName.includes('adresse') && contact.address) {
          value = contact.address;
        } else if (fieldName.includes('email') && contact.email) {
          value = contact.email;
        }

        if (value) {
          suggestions.push({
            fieldId: field.id,
            fieldName: field.name,
            suggestedValue: value,
            confidence: contact.confidence * 0.8,
            sourceType: 'procedure',
            sourceData: contact,
            reasoning: `Information de contact extraite: ${contact.name}`
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Recherche basée sur l'apprentissage
   */
  private findLearnedMatches(field: FormField, extractionData: any): MappingSuggestion[] {
    const suggestions: MappingSuggestion[] = [];
    
    // Recherche dans l'historique des mappings réussis
    const historicalMatches = this.mappingHistory.filter(h => 
      h.fieldId === field.id && h.userAccepted
    );

    if (historicalMatches.length > 0) {
      // Calcul de confiance basé sur l'historique
      const acceptanceRate = historicalMatches.length / (historicalMatches.length + 
        this.mappingHistory.filter(h => h.fieldId === field.id && !h.userAccepted).length);
      
      const avgConfidence = historicalMatches.reduce((sum, h) => sum + h.confidence, 0) / historicalMatches.length;

      // Recherche de patterns similaires dans les données actuelles
      for (const historical of historicalMatches) {
        const similarity = this.calculateTextSimilarity(
          JSON.stringify(extractionData.content), 
          historical.suggestedValue
        );

        if (similarity > 0.7) {
          suggestions.push({
            fieldId: field.id,
            fieldName: field.name,
            suggestedValue: historical.actualValue,
            confidence: avgConfidence * acceptanceRate * similarity,
            sourceType: 'content',
            sourceData: historical,
            reasoning: `Basé sur l'apprentissage: ${historicalMatches.length} mappings réussis similaires`
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Déduplication et classement des suggestions
   */
  private deduplicateAndRankSuggestions(suggestions: MappingSuggestion[]): MappingSuggestion[] {
    // Grouper par valeur similaire
    const groupedSuggestions: Record<string, MappingSuggestion[]> = {};
    
    for (const suggestion of suggestions) {
      const normalizedValue = suggestion.suggestedValue.toLowerCase().trim();
      if (!groupedSuggestions[normalizedValue]) {
        groupedSuggestions[normalizedValue] = [];
      }
      groupedSuggestions[normalizedValue].push(suggestion);
    }

    // Sélectionner la meilleure suggestion de chaque groupe
    const deduplicated: MappingSuggestion[] = [];
    
    for (const [value, group] of Object.entries(groupedSuggestions)) {
      // Prendre la suggestion avec la plus haute confiance
      const best = group.reduce((max, current) => 
        current.confidence > max.confidence ? current : max
      );
      
      // Combiner les sources pour le reasoning
      const allSources = [...new Set(group.map(s => s.sourceType))];
      best.reasoning += ` (Sources: ${allSources.join(', ')})`;
      
      deduplicated.push(best);
    }

    // Trier par confiance décroissante
    return deduplicated.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Validation des suggestions
   */
  private validateSuggestions(suggestions: MappingSuggestion[], field: FormField): MappingSuggestion[] {
    return suggestions.filter(suggestion => {
      // Validation du type de champ
      if (!this.validateFieldType(suggestion.suggestedValue, field.type)) {
        return false;
      }

      // Validation par pattern si défini
      if (field.validation?.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(suggestion.suggestedValue)) {
          return false;
        }
      }

      // Validation de longueur
      if (field.validation?.minLength && suggestion.suggestedValue.length < field.validation.minLength) {
        return false;
      }

      if (field.validation?.maxLength && suggestion.suggestedValue.length > field.validation.maxLength) {
        return false;
      }

      // Validation spécifique algérienne
      return this.validateAlgerianSpecific(suggestion.suggestedValue, field.name);
    });
  }

  /**
   * Validation du type de champ
   */
  private validateFieldType(value: string, fieldType: FormField['type']): boolean {
    switch (fieldType) {
      case 'number':
        return !isNaN(Number(value));
      
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      
      case 'date':
        return /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(value) || 
               /^\d{1,2}\s+\w+\s+\d{4}$/.test(value);
      
      default:
        return true;
    }
  }

  /**
   * Validation spécifique algérienne
   */
  private validateAlgerianSpecific(value: string, fieldName: string): boolean {
    const fieldNameLower = fieldName.toLowerCase();

    for (const [pattern, regex] of Object.entries(this.MAPPING_KNOWLEDGE.validationPatterns)) {
      if (fieldNameLower.includes(pattern.replace('_', ' ')) || 
          fieldNameLower.includes(pattern.replace('_', ''))) {
        return regex.test(value);
      }
    }

    return true;
  }

  /**
   * Calcul de similarité textuelle simple
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  /**
   * Calcul de confiance moyenne
   */
  private calculateAverageConfidence(results: MappingResult[]): number {
    if (results.length === 0) return 0;
    
    return results.reduce((sum, result) => sum + result.overallConfidence, 0) / results.length;
  }

  /**
   * Enregistrement du feedback utilisateur pour apprentissage
   */
  recordUserFeedback(
    formId: string,
    fieldId: string,
    suggestedValue: string,
    actualValue: string,
    accepted: boolean,
    confidence: number
  ): void {
    
    const historyEntry: MappingHistory = {
      formId,
      fieldId,
      suggestedValue,
      actualValue,
      userAccepted: accepted,
      timestamp: new Date(),
      confidence
    };

    this.mappingHistory.push(historyEntry);

    // Nettoyer l'historique si trop grand (garder les 1000 dernières entrées)
    if (this.mappingHistory.length > 1000) {
      this.mappingHistory = this.mappingHistory.slice(-1000);
    }

    console.log(`📚 Feedback enregistré: ${accepted ? 'Accepté' : 'Rejeté'} - ${fieldId}: "${suggestedValue}" -> "${actualValue}"`);
  }

  /**
   * Export de l'historique d'apprentissage
   */
  exportLearningData(): MappingHistory[] {
    return [...this.mappingHistory];
  }

  /**
   * Import de l'historique d'apprentissage
   */
  importLearningData(history: MappingHistory[]): void {
    this.mappingHistory = [...history];
    console.log(`📥 Historique d'apprentissage importé: ${history.length} entrées`);
  }

  /**
   * Statistiques d'apprentissage
   */
  getLearningStatistics(): {
    totalMappings: number;
    acceptanceRate: number;
    topPerformingFields: Array<{ fieldId: string; acceptanceRate: number; count: number }>;
    averageConfidence: number;
  } {
    
    const total = this.mappingHistory.length;
    const accepted = this.mappingHistory.filter(h => h.userAccepted).length;
    const acceptanceRate = total > 0 ? accepted / total : 0;
    
    // Analyse par champ
    const fieldStats: Record<string, { accepted: number; total: number; totalConfidence: number }> = {};
    
    for (const history of this.mappingHistory) {
      if (!fieldStats[history.fieldId]) {
        fieldStats[history.fieldId] = { accepted: 0, total: 0, totalConfidence: 0 };
      }
      
      fieldStats[history.fieldId].total++;
      fieldStats[history.fieldId].totalConfidence += history.confidence;
      if (history.userAccepted) {
        fieldStats[history.fieldId].accepted++;
      }
    }

    const topPerformingFields = Object.entries(fieldStats)
      .map(([fieldId, stats]) => ({
        fieldId,
        acceptanceRate: stats.accepted / stats.total,
        count: stats.total
      }))
      .sort((a, b) => b.acceptanceRate - a.acceptanceRate)
      .slice(0, 10);

    const averageConfidence = total > 0 
      ? this.mappingHistory.reduce((sum, h) => sum + h.confidence, 0) / total
      : 0;

    return {
      totalMappings: total,
      acceptanceRate,
      topPerformingFields,
      averageConfidence
    };
  }
}

export const smartMappingService = new SmartMappingService();
export default smartMappingService;