// Types pour le système de validation et workflow d'approbation

export type ValidationStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'requires_modification' | 'modified' | 'under_review';

export type ValidationErrorType = 'format' | 'content' | 'metadata' | 'duplicate' | 'classification' | 'legal_compliance';

export type ApprovalPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ValidationError {
  id: string;
  approval_item_id: string;
  error_type: ValidationErrorType;
  severity: ErrorSeverity;
  field_path?: string;
  error_code: string;
  error_message: string;
  suggested_fix?: string;
  is_resolved: boolean;
  created_at: string;
}

export interface ApprovalItem {
  id: string;
  legal_text_id?: string;
  item_type: string;
  title: string;
  description?: string;
  data: any;
  original_data?: any;
  status: 'pending' | 'approved' | 'rejected' | 'modified' | 'under_review';
  priority: ApprovalPriority;
  submitted_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  modification_notes?: string;
  validation_errors?: ValidationError[];
  // Additional properties for compatibility
  overallConfidence?: number;
  mappedFields?: any[];
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  originalDocument?: any;
  mappingResults?: any;
  processingMetadata?: any;
  createdAt?: string;
  comments?: Array<{
    id: string;
    content: string;
    author: string;
    timestamp: Date;
  }>;
}

export interface ApprovalHistory {
  id: string;
  approval_item_id: string;
  action: string;
  actor_id?: string;
  previous_status?: ValidationStatus;
  new_status?: ValidationStatus;
  comment?: string;
  metadata?: any;
  created_at: string;
}

export interface ValidationDiagnostic {
  totalItems: number;
  pendingItems: number;
  inReviewItems: number;
  approvedItems: number;
  rejectedItems: number;
  criticalErrors: number;
  highPriorityItems: number;
  overdueItems: number;
  averageProcessingTime: number;
}

export interface ApprovalWorkflowConfig {
  autoAssignment: boolean;
  requireDualApproval: boolean;
  maxProcessingDays: number;
  escalationEnabled: boolean;
  notificationEnabled: boolean;
}