import { MappingResult } from '@/types/mapping';
import { ValidationResult } from '@/services/validation/validationService';

export interface ApprovalItem {
  id: string;
  type: 'mapping_validation' | 'ocr_extraction' | 'batch_processing';
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt?: Date;
  
  // Contenu principal
  title: string;
  description: string;
  extractedText: string;
  mappingResult: MappingResult;
  validationResult: ValidationResult;
  
  // Métadonnées pour l'approbation
  confidence: number;
  issuesCount: number;
  criticalIssuesCount: number;
  estimatedReviewTime: number; // en minutes
  
  // Historique et modifications
  modifications?: ApprovalModification[];
  reviewComments?: string[];
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  
  // Format compact pour l'approbation
  compactData: ApprovalCompactData;
}

export interface ApprovalModification {
  fieldName: string;
  originalValue: string;
  newValue: string;
  reason: string;
  timestamp: Date;
  modifiedBy: string;
}

export interface ApprovalCompactData {
  documentType: string;
  keyFields: Record<string, string>;
  summary: string;
  confidence: number;
  issues: string[];
  previewText: string;
}

export interface BatchApprovalGroup {
  id: string;
  name: string;
  items: ApprovalItem[];
  similarity: number;
  commonPattern: string;
  batchActions: BatchAction[];
}

export interface BatchAction {
  type: 'approve_all' | 'reject_all' | 'apply_corrections';
  description: string;
  applicable: boolean;
  estimatedTime: number;
}

class ApprovalItemService {
  private items: Map<string, ApprovalItem> = new Map();
  private approvalQueue: string[] = [];

  /**
   * Création d'approvalItem réel depuis mappedData + extractedText
   */
  createApprovalItem(
    mappingResult: MappingResult,
    validationResult: ValidationResult,
    extractedText: string
  ): ApprovalItem {
    const itemId = this.generateItemId();
    
    // Calcul de la priorité basée sur les problèmes critiques
    const priority = this.calculatePriority(validationResult);
    
    // Estimation du temps de révision
    const estimatedReviewTime = this.estimateReviewTime(mappingResult, validationResult);
    
    // Création du format compact
    const compactData = this.createCompactData(mappingResult, validationResult, extractedText);
    
    const approvalItem: ApprovalItem = {
      id: itemId,
      type: 'mapping_validation',
      status: 'pending',
      priority,
      createdAt: new Date(),
      
      title: this.generateTitle(mappingResult),
      description: this.generateDescription(mappingResult, validationResult),
      extractedText,
      mappingResult,
      validationResult,
      
      confidence: validationResult.score,
      issuesCount: validationResult.issues.length,
      criticalIssuesCount: validationResult.issues.filter(i => i.severity === 'critical').length,
      estimatedReviewTime,
      
      modifications: [],
      reviewComments: [],
      compactData
    };

    // Ajout à la queue
    this.items.set(itemId, approvalItem);
    this.approvalQueue.push(itemId);
    
    return approvalItem;
  }

  /**
   * Format JSON compact pour l'approbation
   */
  private createCompactData(
    mappingResult: MappingResult,
    validationResult: ValidationResult,
    extractedText: string
  ): ApprovalCompactData {
    // Extraction des champs clés
    const keyFields: Record<string, string> = {};
    const importantFields = ['title', 'date', 'institution', 'type', 'number'];
    
    mappingResult.mappedFields.forEach(field => {
      if (importantFields.some(key => field.fieldName.includes(key)) && field.mappedValue) {
        keyFields[field.fieldLabel] = field.mappedValue;
      }
    });

    // Génération du résumé
    const summary = this.generateSummary(keyFields, validationResult);
    
    // Preview du texte (premiers 200 caractères)
    const previewText = extractedText.substring(0, 200) + (extractedText.length > 200 ? '...' : '');
    
    return {
      documentType: mappingResult.formType,
      keyFields,
      summary,
      confidence: validationResult.score,
      issues: validationResult.issues.map(i => i.message),
      previewText
    };
  }

  /**
   * Récupération de la queue d'approbation
   */
  getApprovalQueue(): ApprovalItem[] {
    return this.approvalQueue
      .map(id => this.items.get(id))
      .filter((item): item is ApprovalItem => item !== undefined)
      .sort((a, b) => {
        // Tri par priorité puis par date
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }

  /**
   * Approbation d'un item
   */
  approveItem(itemId: string, approvedBy: string, comments?: string): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    item.status = 'approved';
    item.approvedBy = approvedBy;
    item.updatedAt = new Date();
    
    if (comments) {
      item.reviewComments = item.reviewComments || [];
      item.reviewComments.push(comments);
    }

    // Retrait de la queue
    this.approvalQueue = this.approvalQueue.filter(id => id !== itemId);
    
    return true;
  }

  /**
   * Rejet d'un item
   */
  rejectItem(itemId: string, rejectedBy: string, reason: string): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    item.status = 'rejected';
    item.rejectedBy = rejectedBy;
    item.rejectionReason = reason;
    item.updatedAt = new Date();

    // Retrait de la queue
    this.approvalQueue = this.approvalQueue.filter(id => id !== itemId);
    
    return true;
  }

  /**
   * Modification d'un item
   */
  modifyItem(
    itemId: string,
    fieldName: string,
    newValue: string,
    reason: string,
    modifiedBy: string
  ): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    // Recherche du champ à modifier
    const fieldIndex = item.mappingResult.mappedFields.findIndex(f => f.fieldName === fieldName);
    if (fieldIndex === -1) return false;

    const field = item.mappingResult.mappedFields[fieldIndex];
    const originalValue = field.mappedValue || '';

    // Enregistrement de la modification
    const modification: ApprovalModification = {
      fieldName,
      originalValue,
      newValue,
      reason,
      timestamp: new Date(),
      modifiedBy
    };

    item.modifications = item.modifications || [];
    item.modifications.push(modification);

    // Application de la modification
    item.mappingResult.mappedFields[fieldIndex] = {
      ...field,
      mappedValue: newValue,
      isEdited: true,
      originalValue
    };

    item.updatedAt = new Date();
    item.status = 'needs_review';

    return true;
  }

  /**
   * Groupement pour validation par lot
   */
  createBatchGroups(): BatchApprovalGroup[] {
    const pendingItems = this.getApprovalQueue().filter(item => item.status === 'pending');
    const groups: BatchApprovalGroup[] = [];

    // Groupement par type de document
    const typeGroups = pendingItems.reduce((acc, item) => {
      const type = item.mappingResult.formType;
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    }, {} as Record<string, ApprovalItem[]>);

    Object.entries(typeGroups).forEach(([type, items]) => {
      if (items.length > 1) {
        const similarity = this.calculateSimilarity(items);
        if (similarity > 0.7) {
          groups.push({
            id: `batch_${type}_${Date.now()}`,
            name: `Documents de type "${type}"`,
            items,
            similarity,
            commonPattern: this.extractCommonPattern(items),
            batchActions: this.generateBatchActions(items)
          });
        }
      }
    });

    return groups;
  }

  /**
   * Utilitaires privés
   */
  private generateItemId(): string {
    return `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculatePriority(validationResult: ValidationResult): 'low' | 'medium' | 'high' | 'critical' {
    if (validationResult.issues.some(i => i.severity === 'critical')) return 'critical';
    if (validationResult.score < 60) return 'high';
    if (validationResult.score < 80) return 'medium';
    return 'low';
  }

  private estimateReviewTime(mappingResult: MappingResult, validationResult: ValidationResult): number {
    let baseTime = 5; // 5 minutes de base
    
    // Temps supplémentaire selon les problèmes
    baseTime += validationResult.issues.length * 2;
    baseTime += validationResult.issues.filter(i => i.severity === 'critical').length * 5;
    
    // Temps supplémentaire selon le nombre de champs
    baseTime += Math.ceil(mappingResult.mappedFields.length / 5);
    
    return Math.min(baseTime, 60); // Maximum 60 minutes
  }

  private generateTitle(mappingResult: MappingResult): string {
    const titleField = mappingResult.mappedFields.find(f => 
      f.fieldName.includes('title') || f.fieldName.includes('titre')
    );
    
    if (titleField?.mappedValue) {
      return titleField.mappedValue.substring(0, 100);
    }
    
    return `Document ${mappingResult.formType} - ${new Date().toLocaleDateString()}`;
  }

  private generateDescription(mappingResult: MappingResult, validationResult: ValidationResult): string {
    const parts = [
      `Type: ${mappingResult.formType}`,
      `Champs mappés: ${mappingResult.mappedCount}/${mappingResult.totalFields}`,
      `Confiance: ${validationResult.score}%`
    ];

    if (validationResult.issues.length > 0) {
      parts.push(`Problèmes: ${validationResult.issues.length}`);
    }

    return parts.join(' | ');
  }

  private generateSummary(keyFields: Record<string, string>, validationResult: ValidationResult): string {
    const fieldList = Object.entries(keyFields)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    const issues = validationResult.issues.length > 0 
      ? ` (${validationResult.issues.length} problèmes détectés)`
      : '';
    
    return `${fieldList}${issues}`;
  }

  private calculateSimilarity(items: ApprovalItem[]): number {
    if (items.length < 2) return 1;
    
    // Calcul basé sur les champs communs et les types d'erreurs
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < items.length - 1; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const similarity = this.compareTwoItems(items[i], items[j]);
        totalSimilarity += similarity;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  private compareTwoItems(item1: ApprovalItem, item2: ApprovalItem): number {
    let score = 0;
    
    // Même type de document
    if (item1.mappingResult.formType === item2.mappingResult.formType) score += 0.3;
    
    // Problèmes similaires
    const issues1 = item1.validationResult.issues.map(i => i.type);
    const issues2 = item2.validationResult.issues.map(i => i.type);
    const commonIssues = issues1.filter(i => issues2.includes(i));
    score += (commonIssues.length / Math.max(issues1.length, issues2.length, 1)) * 0.4;
    
    // Confiance similaire
    const confidenceDiff = Math.abs(item1.confidence - item2.confidence);
    score += (1 - confidenceDiff / 100) * 0.3;
    
    return score;
  }

  private extractCommonPattern(items: ApprovalItem[]): string {
    if (items.length === 0) return '';
    
    const firstItem = items[0];
    const commonIssues = firstItem.validationResult.issues
      .filter(issue => 
        items.every(item => 
          item.validationResult.issues.some(i => i.type === issue.type)
        )
      );
    
    if (commonIssues.length > 0) {
      return `Problèmes communs: ${commonIssues.map(i => i.type).join(', ')}`;
    }
    
    return `Documents de type ${firstItem.mappingResult.formType}`;
  }

  private generateBatchActions(items: ApprovalItem[]): BatchAction[] {
    const actions: BatchAction[] = [];
    
    // Action d'approbation en lot si tous les items ont une confiance élevée
    const allHighConfidence = items.every(item => item.confidence > 80);
    actions.push({
      type: 'approve_all',
      description: `Approuver tous les ${items.length} documents`,
      applicable: allHighConfidence && items.every(item => item.criticalIssuesCount === 0),
      estimatedTime: 2
    });
    
    // Action de rejet en lot si tous ont des problèmes critiques
    const allHaveCriticalIssues = items.every(item => item.criticalIssuesCount > 0);
    actions.push({
      type: 'reject_all',
      description: `Rejeter tous les ${items.length} documents`,
      applicable: allHaveCriticalIssues,
      estimatedTime: 1
    });
    
    // Action de correction en lot
    actions.push({
      type: 'apply_corrections',
      description: 'Appliquer les corrections automatiques',
      applicable: items.some(item => 
        item.validationResult.issues.some(issue => issue.autoFixable)
      ),
      estimatedTime: 5
    });
    
    return actions;
  }
}

export const approvalItemService = new ApprovalItemService();
export default approvalItemService;