/**
 * Types pour le système de modales unifié
 * Architecture 100% locale et algérienne
 */

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ModalType = 
  | 'confirmation' 
  | 'form' 
  | 'display' 
  | 'workflow' 
  | 'approval' 
  | 'ocr' 
  | 'search'
  | 'legal'
  | 'procedure'
  | 'analytics'
  | 'viewer'
  | 'settings'
  | 'import'
  | 'export';

export type ModalAction = {
  id: string;
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: React.ComponentType<any>;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
};

export interface BaseModalConfig {
  id: string;
  type: ModalType;
  title: string;
  description?: string;
  size?: ModalSize;
  actions?: ModalAction[];
  closable?: boolean;
  onClose?: () => void;
  className?: string;
  metadata?: Record<string, any>;
}

export interface ConfirmationModalConfig extends BaseModalConfig {
  type: 'confirmation';
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface FormModalConfig extends BaseModalConfig {
  type: 'form';
  formComponent: React.ComponentType<any>;
  formProps?: Record<string, any>;
  submitText?: string;
  cancelText?: string;
  onSubmit: (data: any) => void | Promise<void>;
  onCancel?: () => void;
  validation?: boolean;
}

export interface DisplayModalConfig extends BaseModalConfig {
  type: 'display';
  content: React.ReactNode;
  scrollable?: boolean;
  footerActions?: ModalAction[];
}

export interface WorkflowModalConfig extends BaseModalConfig {
  type: 'workflow';
  steps: WorkflowStep[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: (data: any) => void;
  canNavigate?: boolean;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  validation?: (data: any) => boolean | Promise<boolean>;
  isComplete?: boolean;
}

export interface ApprovalModalConfig extends BaseModalConfig {
  type: 'approval';
  item: any;
  approvalSteps: ApprovalStep[];
  currentStep?: number;
  onApprove: (item: any, comment?: string) => void | Promise<void>;
  onReject: (item: any, reason?: string) => void | Promise<void>;
  onRequestChanges?: (item: any, changes: string) => void | Promise<void>;
  history?: ApprovalHistoryEntry[];
}

export interface ApprovalStep {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  validator?: (item: any) => boolean | Promise<boolean>;
  isComplete?: boolean;
}

export interface ApprovalHistoryEntry {
  id: string;
  action: 'approved' | 'rejected' | 'requested_changes' | 'submitted';
  user: string;
  timestamp: Date;
  comment?: string;
  changes?: string[];
}

export interface OCRModalConfig extends BaseModalConfig {
  type: 'ocr';
  mode: 'workflow' | 'simple';
  file?: File;
  extractedData?: any;
  validationResults?: any;
  onExtract?: (data: any) => void;
  onValidate?: (data: any) => void;
  onSave?: (data: any) => void;
  onComplete?: (result: any) => void;
  extractionProgress?: number;
}

export interface SearchModalConfig extends BaseModalConfig {
  type: 'search';
  initialQuery?: string;
  filters?: Record<string, any>;
  results?: any[];
  onSearch: (query: string, filters?: Record<string, any>) => void;
  onSelect?: (item: any) => void;
  searchCategory?: 'legal' | 'procedures' | 'news' | 'library' | 'all';
}

export interface LegalModalConfig extends BaseModalConfig {
  type: 'legal';
  document?: any;
  mode: 'view' | 'edit' | 'create' | 'approve';
  onSave?: (document: any) => void;
  onApprove?: (document: any) => void;
  onReject?: (document: any, reason: string) => void;
}

export interface ProcedureModalConfig extends BaseModalConfig {
  type: 'procedure';
  procedure?: any;
  mode: 'view' | 'edit' | 'create' | 'execute';
  onSave?: (procedure: any) => void;
  onExecute?: (procedure: any, data: any) => void;
  onComplete?: (procedure: any, result: any) => void;
}

export interface AnalyticsModalConfig extends BaseModalConfig {
  type: 'analytics';
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'table';
  data: any[];
  title: string;
  period?: 'day' | 'week' | 'month' | 'year';
  filters?: Record<string, any>;
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
}

export type ModalConfig = 
  | ConfirmationModalConfig
  | FormModalConfig
  | DisplayModalConfig
  | WorkflowModalConfig
  | ApprovalModalConfig
  | OCRModalConfig
  | SearchModalConfig
  | LegalModalConfig
  | ProcedureModalConfig
  | AnalyticsModalConfig;

export interface ModalContextType {
  modals: ModalConfig[];
  openModal: (config: ModalConfig) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  updateModal: (id: string, updates: Partial<ModalConfig>) => void;
  isOpen: (id: string) => boolean;
}

export interface ModalProviderProps {
  children: React.ReactNode;
  maxConcurrentModals?: number;
}