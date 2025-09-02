import { LegalEntity } from '@/services/enhanced/algerianLegalRegexService';

export interface MappedField {
  fieldId?: string;
  fieldName: string;
  fieldLabel: string;
  mappedValue: string | null;
  suggestedValue: string | null;
  value: string | null; // Added for backward compatibility
  confidence: number;
  sourceEntities: LegalEntity[];
  isAccepted: boolean;
  isEdited: boolean;
  originalValue?: string;
  status?: 'valid' | 'invalid' | 'pending' | 'approved' | 'mapped';
  // Additional properties for service compatibility
  validationStatus: 'valid' | 'invalid' | 'pending' | 'warning';
  validationErrors: string[];
  mappingSource: 'automatic' | 'manual' | 'suggested';
  source: string;
  mappingMethod: 'manual' | 'suggested';
  suggestions?: string[];
}

export interface MappingResult {
  formId?: string;
  formType: string;
  mappedFields: MappedField[];
  unmappedFields: string[];
  overallConfidence: number;
  totalFields: number;
  mappedCount: number;
  processingTime?: number;
  suggestedMappings?: MappedField[];
  mappedData?: Record<string, MappedField>; // Added for backward compatibility
  confidence: number; // Added for backward compatibility
  documentType?: string;
  metadata: {
    processingTime: number;
    entitiesUsed: number;
    manualInterventions: number;
    documentType?: string;
  };
  // Optional fields used by some enhanced flows
  completeness?: number;
  suggestions?: { fieldName: string; suggestions: string[]; reason: string }[];
}

export interface FormFieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select' | 'textarea';
  required: boolean;
  pattern?: string; // Changed from RegExp to string
  options?: string[];
  mappingHints: string[];
}

export interface FormSchema {
  type: string;
  label: string;
  fields: FormFieldDefinition[];
}

export interface EntityHighlight {
  entity: LegalEntity;
  startIndex: number;
  endIndex: number;
  isUsed: boolean;
  mappedToField?: string;
}

export interface MappingAction {
  type: 'accept' | 'edit' | 'reject' | 'search';
  fieldName: string;
  value?: string;
  timestamp: number;
}