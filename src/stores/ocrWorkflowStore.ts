import { create } from 'zustand';
import { RealOCRResult } from '@/services/realOcrService';

export interface OCRExtractionData {
  file: File;
  fileName: string;
  fileSize: number;
  fileType: string;
  ocrResult: RealOCRResult;
  extractedAt: Date;
}

export interface MappingData {
  mappedFields: Record<string, any>;
  unmappedFields: string[];
  confidence: number;
  formType: 'legal' | 'procedure';
  mappingCompleted: boolean;
}

export interface ValidationData {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  reviewedAt: Date;
  reviewer?: string;
}

export interface WorkflowData {
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  approvedBy?: string;
  approvedAt?: Date;
  comments?: string;
  finalData: Record<string, any>;
}

interface OCRWorkflowState {
  // État global du workflow
  currentStep: 'extraction' | 'mapping' | 'validation' | 'workflow' | 'completed';
  completedSteps: string[];
  
  // Données de chaque étape
  extractionData: OCRExtractionData | null;
  mappingData: MappingData | null;
  validationData: ValidationData | null;
  workflowData: WorkflowData | null;
  
  // Actions
  setExtractionData: (data: OCRExtractionData) => void;
  setMappingData: (data: MappingData) => void;
  setValidationData: (data: ValidationData) => void;
  setWorkflowData: (data: WorkflowData) => void;
  
  // Navigation
  goToStep: (step: 'extraction' | 'mapping' | 'validation' | 'workflow') => void;
  markStepCompleted: (step: string) => void;
  resetWorkflow: () => void;
  
  // Validation des étapes
  canAccessStep: (step: string) => boolean;
  isStepCompleted: (step: string) => boolean;
}

export const useOCRWorkflowStore = create<OCRWorkflowState>((set, get) => ({
  // État initial
  currentStep: 'extraction',
  completedSteps: [],
  extractionData: null,
  mappingData: null,
  validationData: null,
  workflowData: null,
  
  // Setters pour les données
  setExtractionData: (data) => {
    set({ extractionData: data });
    get().markStepCompleted('extraction');
    get().goToStep('mapping');
  },
  
  setMappingData: (data) => {
    set({ mappingData: data });
    get().markStepCompleted('mapping');
    get().goToStep('validation');
  },
  
  setValidationData: (data) => {
    set({ validationData: data });
    get().markStepCompleted('validation');
    get().goToStep('workflow');
  },
  
  setWorkflowData: (data) => {
    set({ workflowData: data, currentStep: 'completed' });
    get().markStepCompleted('workflow');
  },
  
  // Navigation
  goToStep: (step) => set({ currentStep: step }),
  
  markStepCompleted: (step) => {
    const { completedSteps } = get();
    if (!completedSteps.includes(step)) {
      set({ completedSteps: [...completedSteps, step] });
    }
  },
  
  resetWorkflow: () => set({
    currentStep: 'extraction',
    completedSteps: [],
    extractionData: null,
    mappingData: null,
    validationData: null,
    workflowData: null,
  }),
  
  // Validation d'accès aux étapes
  canAccessStep: (step) => {
    const { completedSteps, currentStep } = get();
    const stepOrder = ['extraction', 'mapping', 'validation', 'workflow'];
    const stepIndex = stepOrder.indexOf(step);
    const currentIndex = stepOrder.indexOf(currentStep);
    
    // Peut accéder si l'étape est complétée ou si c'est l'étape suivante logique
    return completedSteps.includes(step) || stepIndex <= currentIndex;
  },
  
  isStepCompleted: (step) => {
    const { completedSteps } = get();
    return completedSteps.includes(step);
  },
}));