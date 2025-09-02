/**
 * Service de Workflow d'Approbation pour l'OCR-IA
 * Phase 3 - Validation et Workflow d'Approbation
 * Gère la validation, l'approbation et le workflow des documents traités
 */

import { MappingResult, MappedField } from './intelligentMappingService';
import { AlgerianExtractionResult } from './algerianDocumentExtractionService';

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  reviewers: string[];
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  metadata: {
    documentType: string;
    source: string;
    version: string;
    tags: string[];
  };
}

export interface ApprovalItem {
  id: string;
  workflowId: string;
  documentId: string;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  mappedData: MappedFormData;
  extractedText: string;
  confidence: number;
  validationIssues: ValidationIssue[];
  approvalHistory: ApprovalAction[];
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface MappedFormData {
  formId: string;
  formName: string;
  mappedFields: MappedField[];
  overallConfidence: number;
  validationStatus: 'valid' | 'partial' | 'invalid';
  processingDate: Date;
}

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  fieldId?: string;
  fieldName?: string;
  message: string;
  suggestion?: string;
  code: string;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface ApprovalAction {
  id: string;
  action: 'approve' | 'reject' | 'modify' | 'request_changes' | 'escalate';
  status: 'pending' | 'completed' | 'cancelled';
  actor: string;
  role: 'reviewer' | 'approver' | 'admin';
  timestamp: Date;
  comments?: string;
  changes?: FieldChange[];
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  };
}

export interface FieldChange {
  fieldId: string;
  fieldName: string;
  oldValue: any;
  newValue: any;
  reason: string;
  timestamp: Date;
  approved: boolean;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  rules: WorkflowRule[];
  isActive: boolean;
  version: string;
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  order: number;
  type: 'validation' | 'review' | 'approval' | 'notification';
  assigneeType: 'user' | 'role' | 'group' | 'auto';
  assignees: string[];
  required: boolean;
  timeout?: number;
  actions: StepAction[];
  conditions: StepCondition[];
}

export interface StepAction {
  id: string;
  name: string;
  type: 'approve' | 'reject' | 'modify' | 'escalate' | 'notify';
  parameters: Record<string, any>;
  conditions: ActionCondition[];
}

export interface StepCondition {
  id: string;
  type: 'field_value' | 'confidence_threshold' | 'validation_status' | 'time_based';
  parameters: Record<string, any>;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
}

export interface ActionCondition {
  id: string;
  type: 'field_validation' | 'confidence_check' | 'user_permission' | 'business_rule';
  parameters: Record<string, any>;
  operator: 'and' | 'or' | 'not';
}

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  type: 'routing' | 'assignment' | 'escalation' | 'notification';
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  isActive: boolean;
}

export interface RuleCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface RuleAction {
  id: string;
  type: 'assign' | 'notify' | 'escalate' | 'route' | 'set_status';
  parameters: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  overallScore: number;
  fieldScores: Record<string, number>;
  recommendations: string[];
  canProceed: boolean;
  nextSteps: string[];
}

export interface ApprovalStatistics {
  totalItems: number;
  pendingItems: number;
  approvedItems: number;
  rejectedItems: number;
  modifiedItems: number;
  averageProcessingTime: number;
  averageConfidence: number;
  topIssues: ValidationIssue[];
  performanceMetrics: {
    throughput: number;
    accuracy: number;
    userSatisfaction: number;
  };
}

export interface SmartApprovalEngine {
  // Méthodes principales
  createApprovalWorkflow(
    mappingResult: MappingResult,
    extractedData: AlgerianExtractionResult,
    template?: string
  ): Promise<ApprovalWorkflow>;
  
  validateApprovalItem(item: ApprovalItem): Promise<ValidationResult>;
  
  processApprovalAction(
    itemId: string,
    action: ApprovalAction
  ): Promise<ApprovalItem>;
  
  // Méthodes de workflow
  getNextWorkflowStep(workflow: ApprovalWorkflow): WorkflowStep | null;
  
  assignWorkflowStep(step: WorkflowStep, assignee: string): Promise<void>;
  
  escalateWorkflow(workflow: ApprovalWorkflow, reason: string): Promise<void>;
  
  // Méthodes d'analyse
  generateApprovalStatistics(): Promise<ApprovalStatistics>;
  
  analyzeWorkflowPerformance(workflowId: string): Promise<any>;
  
  // Méthodes de configuration
  configureWorkflowTemplate(template: WorkflowTemplate): Promise<void>;
  
  updateWorkflowRules(rules: WorkflowRule[]): Promise<void>;
}

export class ApprovalWorkflowService implements SmartApprovalEngine {
  private workflows: Map<string, ApprovalWorkflow> = new Map();
  private approvalItems: Map<string, ApprovalItem> = new Map();
  private workflowTemplates: Map<string, WorkflowTemplate> = new Map();
  private workflowRules: Map<string, WorkflowRule[]> = new Map();

  /**
   * Crée un nouvel élément d'approbation
   */
  async createApprovalItem(data: any): Promise<any> {
    const item = {
      id: `approval_${Date.now()}`,
      legal_text_id: data.legal_text_id,
      item_type: data.type || 'document',
      title: data.title || 'Document sans titre',
      description: data.description || '',
      data: data,
      status: 'pending',
      priority: data.priority || 'medium',
      submitted_by: data.submittedBy || 'anonymous',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      overallConfidence: data.confidence || 0,
      mappedFields: data.mappedFields || []
    };
    
    // Store with type casting for compatibility
    this.approvalItems.set(item.id, item as any);
    return item as any;
  }

  /**
   * Approuve un élément
   */
  async approveItem(itemId: string, reviewerId: string, comments?: string): Promise<void> {
    const item = this.approvalItems.get(itemId);
    if (item) {
      item.status = 'approved';
      // Handle additional properties safely
      (item as any).reviewedBy = reviewerId;
      (item as any).reviewedAt = new Date();
      if (comments) {
        (item as any).comments = (item as any).comments || [];
        (item as any).comments.push({
          id: `comment_${Date.now()}`,
          content: comments,
          author: reviewerId,
          timestamp: new Date()
        });
      }
    }
  }

  /**
   * Rejette un élément
   */
  async rejectItem(itemId: string, reviewerId: string, reason: string): Promise<void> {
    const item = this.approvalItems.get(itemId);
    if (item) {
      item.status = 'rejected';
      // Handle additional properties safely
      (item as any).reviewedBy = reviewerId;
      (item as any).reviewedAt = new Date();
      (item as any).comments = (item as any).comments || [];
      (item as any).comments.push({
        id: `comment_${Date.now()}`,
        content: reason,
        author: reviewerId,
        timestamp: new Date()
      });
    }
  }

  /**
   * Récupère les éléments de la queue et retourne une Promise résolue
   */
  async getQueueItems(): Promise<any[]> {
    const items = Array.from(this.approvalItems.values())
      .filter((item: any) => item.status === 'pending')
      .sort((a: any, b: any) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    return Promise.resolve(items);
  }

  /**
   * Méthodes additionnelles pour compatibilité
   */
  async getApprovalStatsExtended(): Promise<any> {
    const items = Array.from(this.approvalItems.values());
    return {
      total: items.length,
      pending: items.filter((i: any) => i.status === 'pending').length,
      approved: items.filter((i: any) => i.status === 'approved').length,
      rejected: items.filter((i: any) => i.status === 'rejected').length,
      underReview: items.filter((i: any) => i.status === 'under_review').length,
      needsCorrection: items.filter((i: any) => i.status === 'modified').length,
      autoApprovalRate: 85.0,
      averageReviewTime: 2.5
    };
  }

  async processReviewAction(itemId: string, action: string, reviewerId: string): Promise<void> {
    const item = this.approvalItems.get(itemId);
    if (item) {
      item.status = action === 'approve' ? 'approved' : 'rejected';
      // Handle additional properties safely
      (item as any).reviewedBy = reviewerId;
      (item as any).reviewedAt = new Date();
    }
  }

  async batchApprove(itemIds: string[], reviewerId: string): Promise<void> {
    for (const itemId of itemIds) {
      await this.processReviewAction(itemId, 'approve', reviewerId);
    }
  }

  constructor() {
    this.initializeDefaultTemplates();
    this.initializeDefaultRules();
  }

  /**
   * Créer un workflow d'approbation
   */
  async createApprovalWorkflow(
    mappingResult: MappingResult,
    extractedData: AlgerianExtractionResult,
    template?: string
  ): Promise<ApprovalWorkflow> {
    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Créer l'item d'approbation
    const approvalItem: ApprovalItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      documentId: (extractedData as any).documentId || `doc_${Date.now()}`,
      documentType: this.detectDocumentType(extractedData),
      status: 'pending',
      mappedData: {
        formId: mappingResult.formId || 'unknown',
        formName: mappingResult.formType || 'Unknown Form',
        mappedFields: mappingResult.mappedFields || [],
        overallConfidence: mappingResult.overallConfidence || 0,
        validationStatus: 'valid',
        processingDate: new Date()
      },
      extractedText: this.extractTextContent(extractedData),
      confidence: mappingResult.confidence,
      validationIssues: [],
      approvalHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: this.calculatePriority(mappingResult, extractedData)
    };

    // Sauvegarder l'item
    this.approvalItems.set(approvalItem.id, approvalItem);

    // Créer le workflow
    const workflowTemplate = template ? 
      this.workflowTemplates.get(template) : 
      this.getDefaultWorkflowTemplate();

    const workflow: ApprovalWorkflow = {
      id: workflowId,
      name: `Workflow ${workflowTemplate?.name || 'Standard'}`,
      description: `Workflow d'approbation pour ${approvalItem.documentType}`,
      status: 'draft',
      priority: approvalItem.priority,
      reviewers: this.getDefaultReviewers(approvalItem.documentType),
      createdAt: new Date(),
      updatedAt: new Date(),
      deadline: approvalItem.deadline,
      metadata: {
        documentType: approvalItem.documentType,
        source: 'OCR-IA',
        version: '3.0.0',
        tags: ['approval', 'workflow', approvalItem.documentType]
      }
    };

    // Sauvegarder le workflow
    this.workflows.set(workflowId, workflow);

    // Appliquer les règles de workflow
    await this.applyWorkflowRules(workflow, approvalItem);

    return workflow;
  }

  /**
   * Valider un item d'approbation
   */
  async validateApprovalItem(item: ApprovalItem): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const fieldScores: Record<string, number> = {};

    // Validation des champs mappés
    for (const field of item.mappedData.mappedFields) {
      const fieldValidation = this.validateField(field);
      fieldScores[field.fieldId] = fieldValidation.score;
      
      if (fieldValidation.issues.length > 0) {
        issues.push(...fieldValidation.issues);
      }
    }

    // Validation globale
    const globalValidation = this.validateGlobalConstraints(item);
    issues.push(...globalValidation.issues);

    // Calcul du score global
    const overallScore = this.calculateOverallScore(fieldScores, issues);

    // Déterminer si on peut procéder
    const canProceed = overallScore >= 0.7 && 
                      issues.filter(i => i.severity === 'critical').length === 0;

    // Générer les recommandations
    const recommendations = this.generateRecommendations(issues, fieldScores);

    // Définir les prochaines étapes
    const nextSteps = this.determineNextSteps(item, issues, overallScore);

    return {
      isValid: canProceed,
      issues,
      overallScore,
      fieldScores,
      recommendations,
      canProceed,
      nextSteps
    };
  }

  /**
   * Traiter une action d'approbation
   */
  async processApprovalAction(
    itemId: string,
    action: ApprovalAction
  ): Promise<ApprovalItem> {
    const item = this.approvalItems.get(itemId);
    if (!item) {
      throw new Error(`Item d'approbation non trouvé: ${itemId}`);
    }

    // Ajouter l'action à l'historique
    item.approvalHistory.push(action);
    item.updatedAt = new Date();

    // Traiter l'action selon son type
    switch (action.action) {
      case 'approve':
        item.status = 'approved';
        break;
      
      case 'reject':
        item.status = 'rejected';
        break;
      
      case 'modify':
        item.status = 'modified';
        if (action.changes) {
          this.applyFieldChanges(item, action.changes);
        }
        break;
      
      case 'request_changes':
        item.status = 'pending';
        break;
      
      case 'escalate':
        await this.escalateWorkflow(
          this.workflows.get(item.workflowId)!,
          action.comments || 'Escalade automatique'
        );
        break;
    }

    // Mettre à jour le workflow
    const workflow = this.workflows.get(item.workflowId);
    if (workflow) {
      workflow.status = this.determineWorkflowStatus(item);
      workflow.updatedAt = new Date();
    }

    // Sauvegarder les modifications
    this.approvalItems.set(itemId, item);
    if (workflow) {
      this.workflows.set(item.workflowId, workflow);
    }

    return item;
  }

  /**
   * Obtenir la prochaine étape du workflow
   */
  getNextWorkflowStep(workflow: ApprovalWorkflow): WorkflowStep | null {
    const template = this.workflowTemplates.get(workflow.id);
    if (!template) return null;

    const currentStep = this.getCurrentWorkflowStep(workflow);
    if (!currentStep) return template.steps[0];

    const nextStepIndex = currentStep.order;
    return template.steps[nextStepIndex] || null;
  }

  /**
   * Assigner une étape du workflow
   */
  async assignWorkflowStep(step: WorkflowStep, assignee: string): Promise<void> {
    // Logique d'assignation
    step.assignees = [assignee];
  }

  /**
   * Escalader un workflow
   */
  async escalateWorkflow(workflow: ApprovalWorkflow, reason: string): Promise<void> {
    workflow.status = 'in_review';
    workflow.priority = 'urgent';
    workflow.updatedAt = new Date();
    
    // Notifier les superviseurs
    await this.notifySupervisors(workflow, reason);
  }

  /**
   * Générer les statistiques d'approbation
   */
  async generateApprovalStatistics(): Promise<ApprovalStatistics> {
    const items = Array.from(this.approvalItems.values());
    
    const totalItems = items.length;
    const pendingItems = items.filter(i => i.status === 'pending').length;
    const approvedItems = items.filter(i => i.status === 'approved').length;
    const rejectedItems = items.filter(i => i.status === 'rejected').length;
    const modifiedItems = items.filter(i => i.status === 'modified').length;

    const averageProcessingTime = this.calculateAverageProcessingTime(items);
    const averageConfidence = this.calculateAverageConfidence(items);
    const topIssues = this.getTopIssues(items);

    const performanceMetrics = {
      throughput: this.calculateThroughput(items),
      accuracy: this.calculateAccuracy(items),
      userSatisfaction: 0.85 // À calculer à partir du feedback
    };

    return {
      totalItems,
      pendingItems,
      approvedItems,
      rejectedItems,
      modifiedItems,
      averageProcessingTime,
      averageConfidence,
      topIssues,
      performanceMetrics
    };
  }

  /**
   * Analyser la performance d'un workflow
   */
  async analyzeWorkflowPerformance(workflowId: string): Promise<any> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow non trouvé: ${workflowId}`);
    }

    const items = Array.from(this.approvalItems.values())
      .filter(item => item.workflowId === workflowId);

    return {
      workflowId,
      totalItems: items.length,
      averageProcessingTime: this.calculateAverageProcessingTime(items),
      statusDistribution: this.getStatusDistribution(items),
      performanceTrends: this.calculatePerformanceTrends(items)
    };
  }

  /**
   * Configurer un template de workflow
   */
  async configureWorkflowTemplate(template: WorkflowTemplate): Promise<void> {
    this.workflowTemplates.set(template.id, template);
  }

  /**
   * Mettre à jour les règles de workflow
   */
  async updateWorkflowRules(rules: WorkflowRule[]): Promise<void> {
    for (const rule of rules) {
      const workflowRules = this.workflowRules.get(rule.id) || [];
      workflowRules.push(rule);
      this.workflowRules.set(rule.id, workflowRules);
    }
  }

  // Méthodes privées utilitaires

  private detectDocumentType(data: AlgerianExtractionResult): string {
    if (data.metadata?.documentType) {
      return data.metadata.documentType;
    }
    
    const content = this.extractTextContent(data);
    
    if (content.includes('arrêté') || content.includes('décret')) {
      return 'legal';
    } else if (content.includes('facture') || content.includes('devis')) {
      return 'commercial';
    } else if (content.includes('demande') || content.includes('formulaire')) {
      return 'administrative';
    }
    
    return 'unknown';
  }

  private extractTextContent(data: AlgerianExtractionResult): string {
    if ((data as any).pagesText && Array.isArray((data as any).pagesText)) {
      return (data as any).pagesText.join(' ');
    }
    
    if (data.extractedText) {
      return data.extractedText;
    }
    
    return '';
  }

  private calculatePriority(
    mappingResult: MappingResult,
    extractedData: AlgerianExtractionResult
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (mappingResult.confidence < 0.5) return 'high';
    if (mappingResult.confidence < 0.7) return 'medium';
    return 'low';
  }

  private calculateDeadline(
    mappingResult: MappingResult,
    extractedData: AlgerianExtractionResult
  ): Date {
    const now = new Date();
    const daysToAdd = mappingResult.confidence < 0.7 ? 2 : 5;
    now.setDate(now.getDate() + daysToAdd);
    return now;
  }

  private getDefaultWorkflowTemplate(): WorkflowTemplate | undefined {
    return Array.from(this.workflowTemplates.values())
      .find(t => t.isActive);
  }

  private getDefaultReviewers(documentType: string): string[] {
    // Logique pour déterminer les reviewers par défaut
    switch (documentType) {
      case 'legal':
        return ['legal_reviewer', 'senior_approver'];
      case 'commercial':
        return ['commercial_reviewer', 'finance_approver'];
      default:
        return ['general_reviewer'];
    }
  }

  private async applyWorkflowRules(
    workflow: ApprovalWorkflow,
    item: ApprovalItem
  ): Promise<void> {
    const rules = Array.from(this.workflowRules.values()).flat();
    
    for (const rule of rules) {
      if (this.evaluateRuleCondition(rule, workflow, item)) {
        await this.executeRuleAction(rule, workflow, item);
      }
    }
  }

  private evaluateRuleCondition(
    rule: WorkflowRule,
    workflow: ApprovalWorkflow,
    item: ApprovalItem
  ): boolean {
    // Logique d'évaluation des conditions
    return true; // Simplifié pour l'exemple
  }

  private async executeRuleAction(
    rule: WorkflowRule,
    workflow: ApprovalWorkflow,
    item: ApprovalItem
  ): Promise<void> {
    // Logique d'exécution des actions
  }

  private validateField(field: MappedField): {
    score: number;
    issues: ValidationIssue[];
  } {
    const issues: ValidationIssue[] = [];
    let score = field.confidence;

    // Validation de la confiance
    if (field.confidence < 0.5) {
      issues.push({
        id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'warning',
        severity: 'medium',
        fieldId: field.fieldId,
        fieldName: field.fieldName,
        message: `Confiance faible pour le champ ${field.fieldName}`,
        suggestion: 'Vérifier manuellement la valeur extraite',
        code: 'LOW_CONFIDENCE',
        timestamp: new Date(),
        resolved: false
      });
      score *= 0.8;
    }

    // Validation de la valeur
    if (!field.value || String(field.value).trim() === '') {
      issues.push({
        id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'error',
        severity: 'high',
        fieldId: field.fieldId,
        fieldName: field.fieldName,
        message: `Valeur manquante pour le champ ${field.fieldName}`,
        suggestion: 'Extraire ou saisir manuellement la valeur',
        code: 'MISSING_VALUE',
        timestamp: new Date(),
        resolved: false
      });
      score *= 0.5;
    }

    return { score, issues };
  }

  private validateGlobalConstraints(item: ApprovalItem): {
    issues: ValidationIssue[];
  } {
    const issues: ValidationIssue[] = [];

    // Validation de la confiance globale
    const confidence = (item as any).data?.confidence || 0;
    if (confidence < 0.6) {
      issues.push({
        id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'warning',
        severity: 'high',
        message: 'Confiance globale faible pour le document',
        suggestion: 'Revoir l\'extraction ou demander une validation manuelle',
        code: 'LOW_GLOBAL_CONFIDENCE',
        timestamp: new Date(),
        resolved: false
      });
    }

    // Validation des champs requis
    const mappedFields = (item as any).data?.mappedData?.mappedFields || [];
    const requiredFields = mappedFields.filter((f: any) => 
      f.validationStatus === 'error'
    );
    
    if (requiredFields.length > 0) {
      issues.push({
        id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'error',
        severity: 'critical',
        message: `${requiredFields.length} champ(s) requis non validés`,
        suggestion: 'Corriger les erreurs de validation avant approbation',
        code: 'REQUIRED_FIELDS_INVALID',
        timestamp: new Date(),
        resolved: false
      });
    }

    return { issues };
  }

  private calculateOverallScore(
    fieldScores: Record<string, number>,
    issues: ValidationIssue[]
  ): number {
    if (Object.keys(fieldScores).length === 0) return 0;

    const averageFieldScore = Object.values(fieldScores).reduce((a, b) => a + b, 0) / 
                             Object.values(fieldScores).length;

    // Pénaliser les issues critiques
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;

    const penalty = (criticalIssues * 0.3) + (highIssues * 0.2) + (mediumIssues * 0.1);

    return Math.max(0, averageFieldScore - penalty);
  }

  private generateRecommendations(
    issues: ValidationIssue[],
    fieldScores: Record<string, number>
  ): string[] {
    const recommendations: string[] = [];

    // Recommandations basées sur les issues
    if (issues.some(i => i.severity === 'critical')) {
      recommendations.push('Corriger les erreurs critiques avant approbation');
    }

    if (issues.some(i => i.severity === 'high')) {
      recommendations.push('Revoir les champs à forte criticité');
    }

    // Recommandations basées sur les scores
    const lowScoreFields = Object.entries(fieldScores)
      .filter(([_, score]) => score < 0.6)
      .map(([fieldId, _]) => fieldId);

    if (lowScoreFields.length > 0) {
      recommendations.push(`Vérifier manuellement les champs: ${lowScoreFields.join(', ')}`);
    }

    return recommendations;
  }

  private determineNextSteps(
    item: ApprovalItem,
    issues: ValidationIssue[],
    overallScore: number
  ): string[] {
    const nextSteps: string[] = [];

    if (overallScore < 0.7) {
      nextSteps.push('Améliorer la qualité de l\'extraction');
    }

    if (issues.some(i => i.severity === 'critical')) {
      nextSteps.push('Corriger les erreurs critiques');
    }

    if (overallScore >= 0.8 && issues.length === 0) {
      nextSteps.push('Procéder à l\'approbation');
    }

    return nextSteps;
  }

  private applyFieldChanges(item: ApprovalItem, changes: FieldChange[]): void {
    for (const change of changes) {
      const field = item.mappedData.mappedFields.find(f => f.fieldId === change.fieldId);
      if (field) {
        field.value = change.newValue;
        field.mappingMethod = 'manual';
        field.confidence = Math.min(field.confidence + 0.1, 1.0);
      }
    }
  }

  private determineWorkflowStatus(item: ApprovalItem): ApprovalWorkflow['status'] {
    switch (item.status) {
      case 'approved':
        return 'completed';
      case 'rejected':
        return 'completed';
      case 'modified':
        return 'in_review';
      default:
        return 'pending';
    }
  }

  private getCurrentWorkflowStep(workflow: ApprovalWorkflow): WorkflowStep | null {
    // Logique pour déterminer l'étape actuelle
    return null;
  }

  private async notifySupervisors(workflow: ApprovalWorkflow, reason: string): Promise<void> {
    // Logique de notification
  }

  private calculateAverageProcessingTime(items: ApprovalItem[]): number {
    if (items.length === 0) return 0;
    
    const processingTimes = items
      .filter(item => item.status === 'approved' || item.status === 'rejected')
      .map(item => {
        const completedAction = item.approvalHistory
          .find(action => action.action === 'approve' || action.action === 'reject');
        if (completedAction) {
          return new Date(completedAction.timestamp).getTime() - new Date((item as any).created_at).getTime();
        }
        return 0;
      })
      .filter(time => time > 0);

    if (processingTimes.length === 0) return 0;
    
    return processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
  }

  private calculateAverageConfidence(items: ApprovalItem[]): number {
    if (items.length === 0) return 0;
    
    const totalConfidence = items.reduce((sum, item) => sum + ((item as any).data?.confidence || 0), 0);
    return totalConfidence / items.length;
  }

  private getTopIssues(items: ApprovalItem[]): ValidationIssue[] {
    const allIssues = items.flatMap(item => (item as any).validation_errors || []);
    const issueCounts = new Map<string, { issue: ValidationIssue; count: number }>();

    for (const issue of allIssues) {
      const key = `${issue.code}_${issue.severity}`;
      const existing = issueCounts.get(key);
      
      if (existing) {
        existing.count++;
      } else {
        issueCounts.set(key, { issue, count: 1 });
      }
    }

    return Array.from(issueCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(({ issue }) => issue);
  }

  private calculateThroughput(items: ApprovalItem[]): number {
    const now = Date.now();
    const last24Hours = items.filter(item => 
      now - new Date((item as any).created_at).getTime() < 24 * 60 * 60 * 1000
    );
    
    return last24Hours.length;
  }

  private calculateAccuracy(items: ApprovalItem[]): number {
    const completedItems = items.filter(item => 
      item.status === 'approved' || item.status === 'rejected'
    );
    
    if (completedItems.length === 0) return 0;
    
    const approvedItems = completedItems.filter(item => item.status === 'approved');
    return approvedItems.length / completedItems.length;
  }

  private getStatusDistribution(items: ApprovalItem[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    for (const item of items) {
      distribution[item.status] = (distribution[item.status] || 0) + 1;
    }
    
    return distribution;
  }

  private calculatePerformanceTrends(items: ApprovalItem[]): any {
    // Logique pour calculer les tendances de performance
    return {
      trend: 'stable',
      change: 0
    };
  }

  private initializeDefaultTemplates(): void {
    // Template de workflow standard
    const standardTemplate: WorkflowTemplate = {
      id: 'standard_workflow',
      name: 'Workflow Standard',
      description: 'Workflow d\'approbation standard pour l\'OCR-IA',
      steps: [
        {
          id: 'validation',
          name: 'Validation',
          description: 'Validation automatique des données extraites',
          order: 1,
          type: 'validation',
          assigneeType: 'auto',
          assignees: [],
          required: true,
          actions: [],
          conditions: []
        },
        {
          id: 'review',
          name: 'Révision',
          description: 'Révision manuelle par un expert',
          order: 2,
          type: 'review',
          assigneeType: 'role',
          assignees: ['reviewer'],
          required: true,
          actions: [],
          conditions: []
        },
        {
          id: 'approval',
          name: 'Approbation',
          description: 'Approbation finale',
          order: 3,
          type: 'approval',
          assigneeType: 'role',
          assignees: ['approver'],
          required: true,
          actions: [],
          conditions: []
        }
      ],
      rules: [],
      isActive: true,
      version: '1.0.0',
      createdBy: 'system',
      createdAt: new Date(),
      lastModified: new Date()
    };

    this.workflowTemplates.set(standardTemplate.id, standardTemplate);
  }

  private initializeDefaultRules(): void {
    // Règles par défaut
    const defaultRules: WorkflowRule[] = [
      {
        id: 'auto_assign_reviewer',
        name: 'Assignation automatique du reviewer',
        description: 'Assigne automatiquement un reviewer pour les documents à faible confiance',
        type: 'assignment',
        conditions: [
          {
            id: 'low_confidence',
            field: 'confidence',
            operator: 'less_than',
            value: 0.7
          }
        ],
        actions: [
          {
            id: 'assign_reviewer',
            type: 'assign',
            parameters: { role: 'reviewer' }
          }
        ],
        priority: 1,
        isActive: true
      }
    ];

    for (const rule of defaultRules) {
      this.workflowRules.set(rule.id, [rule]);
    }
  }
}

// Export de la classe et des interfaces additionnelles
export interface ApprovalSettings {
  autoApprove: boolean;
  threshold: number;
  notifications: boolean;
}

// Instance exportée
export const approvalWorkflowService = new ApprovalWorkflowService();
export default approvalWorkflowService;