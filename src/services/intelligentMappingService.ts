/**
 * Service de mapping intelligent pour convertir les données extraites
 * vers des formulaires structurés
 */

import { StructuredPublication } from './algerianLegalRegexService';
import { AlgerianExtractionResult } from './algerianDocumentExtractionService';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface MappingResult {
  id: string;
  extractionId: string;
  formType: string;
  mappedData: Record<string, any>;
  mappedFields: MappedField[];
  unmappedFields: string[];
  overallConfidence: number;
  validationErrors: ValidationError[];
  suggestions: MappingSuggestion[];
}

export interface MappedField {
  fieldName: string;
  sourceText: string;
  mappedValue: any;
  confidence: number;
  source: 'extraction' | 'regex' | 'inference' | 'manual';
  position?: { start: number; end: number };
  alternatives?: Alternative[];
}

export interface Alternative {
  value: any;
  confidence: number;
  source: string;
}

export interface ValidationError {
  field: string;
  error: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
}

export interface MappingSuggestion {
  field: string;
  suggestion: string;
  confidence: number;
  reasoning: string;
}

/**
 * Schémas de formulaires supportés
 */
const FORM_SCHEMAS = {
  'legal': {
    title: { required: true, type: 'string' },
    number: { required: true, type: 'string' },
    date: { required: true, type: 'date' },
    type: { required: true, type: 'enum', values: ['loi', 'decret', 'arrete', 'ordonnance', 'instruction', 'circulaire'] },
    institution: { required: true, type: 'string' },
    wilaya: { required: false, type: 'string' },
    sector: { required: false, type: 'string' },
    description: { required: false, type: 'text' },
    content: { required: true, type: 'text' },
    language: { required: true, type: 'enum', values: ['ar', 'fr', 'mixed'] },
    status: { required: false, type: 'enum', values: ['draft', 'published', 'archived'] }
  },
  'legal-text': {
    title: { required: true, type: 'string' },
    number: { required: true, type: 'string' },
    date: { required: true, type: 'date' },
    type: { required: true, type: 'enum', values: ['loi', 'decret', 'arrete', 'ordonnance', 'instruction', 'circulaire'] },
    institution: { required: true, type: 'string' },
    wilaya: { required: false, type: 'string' },
    sector: { required: false, type: 'string' },
    description: { required: false, type: 'text' },
    content: { required: true, type: 'text' },
    language: { required: true, type: 'enum', values: ['ar', 'fr', 'mixed'] },
    status: { required: false, type: 'enum', values: ['draft', 'published', 'archived'] }
  },
  'administrative-procedure': {
    title: { required: true, type: 'string' },
    description: { required: true, type: 'text' },
    institution: { required: true, type: 'string' },
    category: { required: true, type: 'string' },
    duration: { required: false, type: 'string' },
    cost: { required: false, type: 'string' },
    difficulty: { required: false, type: 'enum', values: ['facile', 'moyen', 'difficile'] },
    required_documents: { required: false, type: 'array' },
    steps: { required: true, type: 'array' },
    tags: { required: false, type: 'array' }
  }
};

/**
 * Mappe les données extraites vers un formulaire spécifique
 */
export async function mapExtractedDataToForm(
  extractionResult: AlgerianExtractionResult,
  structuredPublication: StructuredPublication,
  selectedFormType: keyof typeof FORM_SCHEMAS
): Promise<MappingResult> {
  logger.info('OCR', 'Début du mapping intelligent', { 
    formType: selectedFormType,
    extractionId: extractionResult.id 
  });

  const schema = FORM_SCHEMAS[selectedFormType];
  if (!schema) {
    logger.warn('OCR', `Schéma de formulaire non trouvé: ${selectedFormType}. Utilisation du schéma par défaut.`);
    // Utiliser le premier schéma disponible comme fallback
    const availableSchemas = Object.keys(FORM_SCHEMAS);
    if (availableSchemas.length === 0) {
      throw new Error('Aucun schéma de formulaire disponible');
    }
    const fallbackSchema = FORM_SCHEMAS[availableSchemas[0] as keyof typeof FORM_SCHEMAS];
    
    return mapExtractedDataToForm(extractionResult, structuredPublication, availableSchemas[0] as keyof typeof FORM_SCHEMAS);
  }

  const mappedFields: MappedField[] = [];
  const unmappedFields: string[] = [];
  const validationErrors: ValidationError[] = [];
  const suggestions: MappingSuggestion[] = [];
  const mappedData: Record<string, any> = {};

  // Mapper chaque champ du schéma
  for (const [fieldName, fieldConfig] of Object.entries(schema)) {
    const mappingResult = await mapField(
      fieldName,
      fieldConfig,
      extractionResult,
      structuredPublication
    );

    if (mappingResult.success) {
      mappedFields.push(mappingResult.field);
      mappedData[fieldName] = mappingResult.field.mappedValue;
    } else {
      unmappedFields.push(fieldName);
      
      if (fieldConfig.required) {
        validationErrors.push({
          field: fieldName,
          error: `Champ requis non mappé: ${fieldName}`,
          severity: 'high',
          suggestion: mappingResult.suggestion
        });
      }
    }

    // Ajouter les suggestions de mapping
    if (mappingResult.suggestions) {
      suggestions.push(...mappingResult.suggestions);
    }
  }

  // Validation des données mappées
  const additionalErrors = validateMappedData(mappedData, schema);
  validationErrors.push(...additionalErrors);

  // Calcul de la confiance globale
  const overallConfidence = calculateOverallConfidence(mappedFields, unmappedFields.length);

  const result: MappingResult = {
    id: crypto.randomUUID(),
    extractionId: extractionResult.id,
    formType: selectedFormType,
    mappedData,
    mappedFields,
    unmappedFields,
    overallConfidence,
    validationErrors,
    suggestions
  };

  // Sauvegarder le résultat de mapping
  await saveMappingResult(result);

  logger.info('OCR', 'Mapping terminé', {
    mappedFields: mappedFields.length,
    unmappedFields: unmappedFields.length,
    confidence: overallConfidence
  });

  return result;
}

/**
 * Mappe un champ spécifique
 */
async function mapField(
  fieldName: string,
  fieldConfig: any,
  extractionResult: AlgerianExtractionResult,
  structuredPublication: StructuredPublication
): Promise<{
  success: boolean;
  field?: MappedField;
  suggestion?: string;
  suggestions?: MappingSuggestion[];
}> {
  const suggestions: MappingSuggestion[] = [];

  switch (fieldName) {
    case 'title':
      return mapTitle(structuredPublication, extractionResult);
    
    case 'number':
      return mapNumber(structuredPublication, extractionResult);
    
    case 'date':
      return mapDate(structuredPublication, extractionResult);
    
    case 'type':
      return mapType(structuredPublication, extractionResult);
    
    case 'institution':
      return mapInstitution(structuredPublication, extractionResult);
    
    case 'wilaya':
      return mapWilaya(structuredPublication, extractionResult);
    
    case 'sector':
      return mapSector(structuredPublication, extractionResult);
    
    case 'content':
      return mapContent(extractionResult);
    
    case 'language':
      return mapLanguage(extractionResult);
    
    case 'description':
      return mapDescription(structuredPublication, extractionResult);
    
    default:
      // Mapping générique basé sur les entités détectées
      return mapGenericField(fieldName, fieldConfig, extractionResult, structuredPublication);
  }
}

/**
 * Mappe le titre du document
 */
function mapTitle(structured: StructuredPublication, extraction: AlgerianExtractionResult): any {
  if (structured.title && structured.title !== 'Document sans titre') {
    return {
      success: true,
      field: {
        fieldName: 'title',
        sourceText: structured.title,
        mappedValue: structured.title,
        confidence: 0.9,
        source: 'regex' as const
      }
    };
  }

  // Fallback sur les premières lignes du texte extrait
  const lines = extraction.extractedText.split('\n').filter(line => line.trim().length > 10);
  if (lines.length > 0) {
    return {
      success: true,
      field: {
        fieldName: 'title',
        sourceText: lines[0],
        mappedValue: lines[0].trim(),
        confidence: 0.6,
        source: 'extraction' as const
      }
    };
  }

  return {
    success: false,
    suggestion: 'Titre non détecté automatiquement'
  };
}

/**
 * Mappe le numéro du document
 */
function mapNumber(structured: StructuredPublication, extraction: AlgerianExtractionResult): any {
  if (structured.number) {
    return {
      success: true,
      field: {
        fieldName: 'number',
        sourceText: structured.number,
        mappedValue: structured.number,
        confidence: 0.9,
        source: 'regex' as const
      }
    };
  }

  // Recherche de patterns de numéros dans le texte
  const numberPattern = /n°?\s*(\d+[-\/]\d+)/i;
  const match = extraction.extractedText.match(numberPattern);
  if (match) {
    return {
      success: true,
      field: {
        fieldName: 'number',
        sourceText: match[0],
        mappedValue: match[1],
        confidence: 0.7,
        source: 'extraction' as const
      }
    };
  }

  return {
    success: false,
    suggestion: 'Numéro non détecté automatiquement'
  };
}

/**
 * Mappe la date du document
 */
function mapDate(structured: StructuredPublication, extraction: AlgerianExtractionResult): any {
  if (structured.date && structured.date !== new Date().toISOString().split('T')[0]) {
    return {
      success: true,
      field: {
        fieldName: 'date',
        sourceText: structured.date,
        mappedValue: structured.date,
        confidence: 0.8,
        source: 'regex' as const
      }
    };
  }

  return {
    success: false,
    suggestion: 'Date non détectée automatiquement'
  };
}

/**
 * Mappe le type de document
 */
function mapType(structured: StructuredPublication, extraction: AlgerianExtractionResult): any {
  if (structured.type && structured.type !== 'autre') {
    return {
      success: true,
      field: {
        fieldName: 'type',
        sourceText: structured.type,
        mappedValue: structured.type,
        confidence: 0.9,
        source: 'regex' as const
      }
    };
  }

  return {
    success: false,
    suggestion: 'Type de document non détecté automatiquement'
  };
}

/**
 * Mappe l'institution
 */
function mapInstitution(structured: StructuredPublication, extraction: AlgerianExtractionResult): any {
  if (structured.institution && structured.institution !== 'Institution non identifiée') {
    return {
      success: true,
      field: {
        fieldName: 'institution',
        sourceText: structured.institution,
        mappedValue: structured.institution,
        confidence: 0.8,
        source: 'regex' as const
      }
    };
  }

  return {
    success: false,
    suggestion: 'Institution non détectée automatiquement'
  };
}

/**
 * Mappe la wilaya
 */
function mapWilaya(structured: StructuredPublication, extraction: AlgerianExtractionResult): any {
  if (structured.wilaya) {
    return {
      success: true,
      field: {
        fieldName: 'wilaya',
        sourceText: structured.wilaya,
        mappedValue: structured.wilaya,
        confidence: 0.7,
        source: 'regex' as const
      }
    };
  }

  return { success: false };
}

/**
 * Mappe le secteur
 */
function mapSector(structured: StructuredPublication, extraction: AlgerianExtractionResult): any {
  if (structured.sector) {
    return {
      success: true,
      field: {
        fieldName: 'sector',
        sourceText: structured.sector,
        mappedValue: structured.sector,
        confidence: 0.7,
        source: 'regex' as const
      }
    };
  }

  return { success: false };
}

/**
 * Mappe le contenu
 */
function mapContent(extraction: AlgerianExtractionResult): any {
  return {
    success: true,
    field: {
      fieldName: 'content',
      sourceText: extraction.extractedText,
      mappedValue: extraction.extractedText,
      confidence: 1.0,
      source: 'extraction' as const
    }
  };
}

/**
 * Mappe la langue
 */
function mapLanguage(extraction: AlgerianExtractionResult): any {
  return {
    success: true,
    field: {
      fieldName: 'language',
      sourceText: extraction.languageDetected,
      mappedValue: extraction.languageDetected,
      confidence: 0.9,
      source: 'extraction' as const
    }
  };
}

/**
 * Mappe la description
 */
function mapDescription(structured: StructuredPublication, extraction: AlgerianExtractionResult): any {
  // Utiliser les premiers 200 caractères comme description
  const description = extraction.extractedText.substring(0, 200).trim() + '...';
  
  return {
    success: true,
    field: {
      fieldName: 'description',
      sourceText: description,
      mappedValue: description,
      confidence: 0.6,
      source: 'inference' as const
    }
  };
}

/**
 * Mapping générique pour les champs non spécialisés
 */
function mapGenericField(
  fieldName: string,
  fieldConfig: any,
  extraction: AlgerianExtractionResult,
  structured: StructuredPublication
): any {
  // Recherche dans les entités détectées
  const entities = structured.metadata.entities;
  
  for (const entity of entities) {
    if (entity.type === fieldName || entity.value.toLowerCase().includes(fieldName.toLowerCase())) {
      return {
        success: true,
        field: {
          fieldName,
          sourceText: entity.value,
          mappedValue: entity.value,
          confidence: entity.confidence,
          source: 'extraction' as const
        }
      };
    }
  }

  return { success: false };
}

/**
 * Valide les données mappées
 */
function validateMappedData(mappedData: Record<string, any>, schema: any): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [fieldName, fieldConfig] of Object.entries(schema)) {
    const value = mappedData[fieldName];

    // Vérification des champs requis
    if ((fieldConfig as any).required && (!value || value === '')) {
      errors.push({
        field: fieldName,
        error: `Champ requis manquant`,
        severity: 'high'
      });
    }

    // Validation du type
    if (value && (fieldConfig as any).type) {
      const typeError = validateFieldType(fieldName, value, fieldConfig);
      if (typeError) {
        errors.push(typeError);
      }
    }
  }

  return errors;
}

/**
 * Valide le type d'un champ
 */
function validateFieldType(fieldName: string, value: any, config: any): ValidationError | null {
  switch (config.type) {
    case 'date':
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return {
          field: fieldName,
          error: 'Format de date invalide (attendu: YYYY-MM-DD)',
          severity: 'medium'
        };
      }
      break;
    
    case 'enum':
      if (config.values && !config.values.includes(value)) {
        return {
          field: fieldName,
          error: `Valeur non autorisée. Valeurs possibles: ${config.values.join(', ')}`,
          severity: 'medium'
        };
      }
      break;
  }

  return null;
}

/**
 * Calcule la confiance globale du mapping
 */
function calculateOverallConfidence(mappedFields: MappedField[], unmappedFieldsCount: number): number {
  if (mappedFields.length === 0) return 0;

  const avgConfidence = mappedFields.reduce((sum, field) => sum + field.confidence, 0) / mappedFields.length;
  const completionRate = mappedFields.length / (mappedFields.length + unmappedFieldsCount);
  
  return avgConfidence * 0.7 + completionRate * 0.3;
}

/**
 * Sauvegarde le résultat de mapping
 */
async function saveMappingResult(result: MappingResult): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn('OCR', 'Utilisateur non connecté, sauvegarde ignorée');
      return;
    }

    const { error } = await supabase
      .from('ocr_mappings')
      .insert({
        id: result.id,
        extraction_id: result.extractionId,
        form_type: result.formType,
        mapped_data: result.mappedData as any,
        mapped_fields: result.mappedFields as any,
        unmapped_fields: result.unmappedFields as any,
        confidence_scores: { overall: result.overallConfidence } as any,
        validation_errors: result.validationErrors as any,
        mapping_status: result.validationErrors.some(e => e.severity === 'high') ? 'draft' : 'validated'
      });

    if (error) {
      logger.error('MAPPING', 'Erreur sauvegarde mapping', error);
    } else {
      logger.info('MAPPING', 'Mapping sauvegardé', { id: result.id });
    }
  } catch (error) {
    logger.error('MAPPING', 'Erreur lors de la sauvegarde', error);
  }
}

/**
 * Récupère les mappings d'un utilisateur
 */
export async function getUserMappings(): Promise<MappingResult[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('ocr_mappings')
      .select(`
        *,
        ocr_extractions!inner(user_id)
      `)
      .eq('ocr_extractions.user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('MAPPING', 'Erreur récupération mappings', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      extractionId: item.extraction_id,
      formType: item.form_type,
      mappedData: (item.mapped_data as unknown as Record<string, any>) || {},
      mappedFields: (item.mapped_fields as unknown as any[]) || [],
      unmappedFields: (item.unmapped_fields as unknown as string[]) || [],
      overallConfidence: (item.confidence_scores as any)?.overall || 0,
      validationErrors: (item.validation_errors as unknown as any[]) || [],
      suggestions: []
    }));
  } catch (error) {
    logger.error('MAPPING', 'Erreur lors de la récupération', error);
    return [];
  }
}