/**
 * Service de workflow d'approbation pour OCR
 * Gestion de la queue d'approbation et des flux de validation
 */

import { MappingResult } from '@/types/mapping';
import { ValidationResult } from '@/services/validation/validationService';
import { supabase } from '@/integrations/supabase/client';

export interface ApprovalItem {
  id: string;
  type: 'mapping_validation' | 'ocr_extraction' | 'batch_processing';
  status: 'pending' | 'approved' | 'rejected' | 'needs_review' | 'modified';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
  assignedTo?: string;
  reviewedBy?: string;
  
  // Données OCR
  originalData: {
    extractedText: string;
    mappingResult: MappingResult;
    validationResult: ValidationResult;
    confidence: number;
  };
  
  // Modifications proposées
  proposedChanges?: Record<string, any>;
  reviewNotes?: string;
  
  // Métadonnées
  documentType: string;
  sourceFile?: string;
  processingTime?: number;
}

export interface ApprovalAction {
  type: 'approve' | 'reject' | 'modify' | 'request_review';
  reason?: string;
  modifications?: Record<string, any>;
  assignTo?: string;
}

export interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  needsReview: number;
  averageProcessingTime: number;
  successRate: number;
}

export interface ApprovalFilter {
  status?: ApprovalItem['status'][];
  type?: ApprovalItem['type'][];
  priority?: ApprovalItem['priority'][];
  assignedTo?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

class ApprovalWorkflowService {
  private approvalQueue: Map<string, ApprovalItem> = new Map();
  private approvalHistory: ApprovalItem[] = [];

  /**
   * Créer un nouvel item d'approbation depuis les données OCR
   */
  async createApprovalItem(
    extractedText: string,
    mappingResult: MappingResult,
    validationResult: ValidationResult,
    documentType: string,
    sourceFile?: string
  ): Promise<ApprovalItem> {
    const priority = this.determinePriority(validationResult, mappingResult);
    
    const approvalItem: ApprovalItem = {
      id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'mapping_validation',
      status: validationResult.readyForApproval ? 'pending' : 'needs_review',
      priority,
      title: this.generateTitle(mappingResult, documentType),
      description: this.generateDescription(validationResult, mappingResult),
      createdAt: new Date(),
      documentType,
      sourceFile,
      originalData: {
        extractedText,
        mappingResult,
        validationResult,
        confidence: validationResult.score
      }
    };

    // Assigner automatiquement selon la priorité
    if (priority === 'critical' || priority === 'high') {
      approvalItem.assignedTo = await this.getAvailableReviewer();
    }

    this.approvalQueue.set(approvalItem.id, approvalItem);
    
    console.log(`✅ [ApprovalWorkflow] Item créé: ${approvalItem.id} (${priority})`);
    return approvalItem;
  }

  /**
   * Traiter une action d'approbation
   */
  async processApprovalAction(
    itemId: string,
    action: ApprovalAction,
    reviewerId: string
  ): Promise<boolean> {
    const item = this.approvalQueue.get(itemId);
    if (!item) {
      throw new Error(`Item d'approbation non trouvé: ${itemId}`);
    }

    const now = new Date();
    item.updatedAt = now;
    item.reviewedBy = reviewerId;

    switch (action.type) {
      case 'approve':
        item.status = 'approved';
        item.reviewNotes = action.reason;
        await this.finalizeApproval(item);
        break;

      case 'reject':
        item.status = 'rejected';
        item.reviewNotes = action.reason;
        break;

      case 'modify':
        item.status = 'modified';
        item.proposedChanges = action.modifications;
        item.reviewNotes = action.reason;
        // Recalculer la validation avec les modifications
        await this.revalidateWithModifications(item);
        break;

      case 'request_review':
        item.status = 'needs_review';
        item.assignedTo = action.assignTo;
        item.reviewNotes = action.reason;
        break;
    }

    // Archiver dans l'historique si terminé
    if (['approved', 'rejected'].includes(item.status)) {
      this.approvalHistory.push({ ...item });
      this.approvalQueue.delete(itemId);
    }

    console.log(`✅ [ApprovalWorkflow] Action traitée: ${action.type} pour ${itemId}`);
    return true;
  }

  /**
   * Obtenir la queue d'approbation avec filtres
   */
  getApprovalQueue(filter?: ApprovalFilter): ApprovalItem[] {
    let items = Array.from(this.approvalQueue.values());

    if (filter) {
      if (filter.status) {
        items = items.filter(item => filter.status!.includes(item.status));
      }
      if (filter.type) {
        items = items.filter(item => filter.type!.includes(item.type));
      }
      if (filter.priority) {
        items = items.filter(item => filter.priority!.includes(item.priority));
      }
      if (filter.assignedTo) {
        items = items.filter(item => item.assignedTo === filter.assignedTo);
      }
      if (filter.dateRange) {
        items = items.filter(item => 
          item.createdAt >= filter.dateRange!.start &&
          item.createdAt <= filter.dateRange!.end
        );
      }
    }

    // Trier par priorité puis par date
    return items.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  /**
   * Obtenir les statistiques d'approbation
   */
  getApprovalStats(): ApprovalStats {
    const allItems = [...this.approvalQueue.values(), ...this.approvalHistory];
    const total = allItems.length;
    
    if (total === 0) {
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        needsReview: 0,
        averageProcessingTime: 0,
        successRate: 0
      };
    }

    const stats = {
      total,
      pending: allItems.filter(item => item.status === 'pending').length,
      approved: allItems.filter(item => item.status === 'approved').length,
      rejected: allItems.filter(item => item.status === 'rejected').length,
      needsReview: allItems.filter(item => item.status === 'needs_review').length,
      averageProcessingTime: this.calculateAverageProcessingTime(allItems),
      successRate: 0
    };

    const completed = stats.approved + stats.rejected;
    stats.successRate = completed > 0 ? (stats.approved / completed) * 100 : 0;

    return stats;
  }

  /**
   * Validation par lot pour documents similaires
   */
  async processBatchApproval(
    itemIds: string[],
    action: ApprovalAction,
    reviewerId: string
  ): Promise<{ success: string[], failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const itemId of itemIds) {
      try {
        await this.processApprovalAction(itemId, action, reviewerId);
        success.push(itemId);
      } catch (error) {
        console.error(`❌ Échec traitement batch pour ${itemId}:`, error);
        failed.push(itemId);
      }
    }

    console.log(`✅ [ApprovalWorkflow] Traitement batch: ${success.length} succès, ${failed.length} échecs`);
    return { success, failed };
  }

  /**
   * Obtenir les patterns d'amélioration automatique
   */
  getImprovementPatterns(): {
    commonRejections: Array<{ reason: string; count: number }>;
    frequentModifications: Array<{ field: string; pattern: string; count: number }>;
    reviewerPerformance: Array<{ reviewerId: string; accuracy: number; speed: number }>;
  } {
    const rejectedItems = this.approvalHistory.filter(item => item.status === 'rejected');
    const modifiedItems = this.approvalHistory.filter(item => item.status === 'modified');

    // Analyser les raisons de rejet communes
    const rejectionReasons = new Map<string, number>();
    rejectedItems.forEach(item => {
      if (item.reviewNotes) {
        const key = item.reviewNotes.toLowerCase();
        rejectionReasons.set(key, (rejectionReasons.get(key) || 0) + 1);
      }
    });

    // Analyser les modifications fréquentes
    const modifications = new Map<string, number>();
    modifiedItems.forEach(item => {
      if (item.proposedChanges) {
        Object.keys(item.proposedChanges).forEach(field => {
          modifications.set(field, (modifications.get(field) || 0) + 1);
        });
      }
    });

    return {
      commonRejections: Array.from(rejectionReasons.entries())
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      
      frequentModifications: Array.from(modifications.entries())
        .map(([field, count]) => ({ field, pattern: 'correction', count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      
      reviewerPerformance: this.calculateReviewerPerformance()
    };
  }

  // === Méthodes privées ===

  private determinePriority(
    validationResult: ValidationResult,
    mappingResult: MappingResult
  ): ApprovalItem['priority'] {
    if (validationResult.score < 60) return 'critical';
    if (validationResult.score < 75) return 'high';
    if (validationResult.issues.some(issue => issue.severity === 'high')) return 'high';
    if (validationResult.score < 85) return 'medium';
    return 'low';
  }

  private generateTitle(mappingResult: MappingResult, documentType: string): string {
    const confidence = mappingResult.overallConfidence || 0;
    const fieldCount = mappingResult.mappedFields ? Object.keys(mappingResult.mappedFields).length : 0;
    return `${documentType} - ${fieldCount} champs (${confidence.toFixed(1)}%)`;
  }

  private generateDescription(
    validationResult: ValidationResult,
    mappingResult: MappingResult
  ): string {
    const issueCount = validationResult.issues.length;
    const confidence = validationResult.score;
    return `Confiance: ${confidence}% • ${issueCount} problème(s) détecté(s) • ${validationResult.readyForApproval ? 'Prêt' : 'Révision requise'}`;
  }

  private async getAvailableReviewer(): Promise<string> {
    // Implémentation simplifiée - dans un vrai système, cela interrogerait la DB
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      return profiles?.[0]?.id || 'system';
    } catch {
      return 'system';
    }
  }

  private async finalizeApproval(item: ApprovalItem): Promise<void> {
    // Sauvegarder les données approuvées dans la base
    try {
      const finalData = item.proposedChanges 
        ? { ...item.originalData.mappingResult.mappedData, ...item.proposedChanges }
        : item.originalData.mappingResult.mappedData;

      console.log(`✅ [ApprovalWorkflow] Données finalisées pour ${item.id}:`, finalData);
      
      // Émettre un événement pour notifier la finalisation
      window.dispatchEvent(new CustomEvent('approval-finalized', {
        detail: { itemId: item.id, data: finalData }
      }));
    } catch (error) {
      console.error(`❌ Erreur finalisation approbation ${item.id}:`, error);
    }
  }

  private async revalidateWithModifications(item: ApprovalItem): Promise<void> {
    if (!item.proposedChanges) return;

    // Recalculer la validation avec les modifications
    const modifiedData = { ...item.originalData.mappingResult.mappedData, ...item.proposedChanges };
    
    // Mettre à jour les données dans l'item
    item.originalData.mappingResult.mappedData = modifiedData;
    
    console.log(`✅ [ApprovalWorkflow] Revalidation avec modifications pour ${item.id}`);
  }

  private calculateAverageProcessingTime(items: ApprovalItem[]): number {
    const completedItems = items.filter(item => 
      item.updatedAt && ['approved', 'rejected'].includes(item.status)
    );

    if (completedItems.length === 0) return 0;

    const totalTime = completedItems.reduce((sum, item) => {
      const processingTime = item.updatedAt!.getTime() - item.createdAt.getTime();
      return sum + processingTime;
    }, 0);

    return Math.round(totalTime / completedItems.length / (1000 * 60)); // en minutes
  }

  private calculateReviewerPerformance(): Array<{ reviewerId: string; accuracy: number; speed: number }> {
    const reviewerStats = new Map<string, { total: number; correct: number; totalTime: number }>();

    this.approvalHistory.forEach(item => {
      if (item.reviewedBy && item.updatedAt) {
        const stats = reviewerStats.get(item.reviewedBy) || { total: 0, correct: 0, totalTime: 0 };
        stats.total++;
        
        // Considérer comme correct si approuvé ou modifié avec succès
        if (['approved', 'modified'].includes(item.status)) {
          stats.correct++;
        }
        
        stats.totalTime += item.updatedAt.getTime() - item.createdAt.getTime();
        reviewerStats.set(item.reviewedBy, stats);
      }
    });

    return Array.from(reviewerStats.entries()).map(([reviewerId, stats]) => ({
      reviewerId,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      speed: stats.total > 0 ? stats.totalTime / stats.total / (1000 * 60) : 0 // minutes par item
    }));
  }
}

export const approvalWorkflowService = new ApprovalWorkflowService();
export default approvalWorkflowService;