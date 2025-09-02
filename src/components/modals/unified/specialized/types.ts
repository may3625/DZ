// Specialized modal types
export interface SpecializedModalConfig {
  id: string;
  type: string;
  title: string;
  content?: any;
}

// Workflow types
export interface ApprovalStep {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer?: string;
  comment?: string;
  date?: Date;
}

export interface ApprovalHistoryEntry {
  id: string;
  action: string;
  user: string;
  date: Date;
  comment?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignee?: string;
  dueDate?: Date;
}