/**
 * Service de Queue d'Approbation Persistante avec Supabase
 * Gère la persistance des éléments d'approbation dans la base de données
 */

import { supabase } from '@/integrations/supabase/client';

export interface PersistentApprovalItem {
  id: string;
  title: string;
  description: string;
  type: 'legal_text' | 'procedure' | 'mapping' | 'ocr_result' | 'classification';
  status: 'pending' | 'approved' | 'rejected' | 'requires_modification';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  submittedBy: string;
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  estimatedReviewTime: number; // minutes
  data: any; // Données complètes de l'élément
  metadata: {
    sourceFile?: string;
    documentType?: string;
    extractionMethod?: string;
    processingTime?: number;
    autoValidated?: boolean;
    requiredReviewers?: string[];
    tags?: string[];
    version?: string;
  };
  rejectionReason?: string;
  modificationNotes?: string;
  approvalHistory: ApprovalHistoryEntry[];
}

export interface ApprovalHistoryEntry {
  id: string;
  action: 'submitted' | 'reviewed' | 'approved' | 'rejected' | 'modified' | 'escalated';
  actor: string;
  timestamp: Date;
  notes?: string;
  previousStatus?: string;
  newStatus?: string;
  metadata?: any;
}

export interface ApprovalQueueFilters {
  status?: PersistentApprovalItem['status'][];
  type?: PersistentApprovalItem['type'][];
  priority?: ('low' | 'medium' | 'high' | 'urgent')[];
  submittedBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  confidenceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
}

export interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  requiresModification: number;
  avgProcessingTime: number; // minutes
  avgConfidence: number;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
  dailySubmissions: Array<{ date: string; count: number }>;
  reviewerWorkload: Array<{ reviewer: string; pending: number; avgTime: number }>;
}

class PersistentApprovalQueueService {
  /**
   * Ajouter un élément à la queue d'approbation
   */
  async addToQueue(item: Omit<PersistentApprovalItem, 'id' | 'submittedAt' | 'approvalHistory'>): Promise<string> {
    try {
      const newItem: Partial<PersistentApprovalItem> = {
        ...item,
        submittedAt: new Date(),
        approvalHistory: []
      };

      const { data, error } = await supabase
        .from('approval_items')
        .insert({
          title: newItem.title,
          description: newItem.description,
          item_type: newItem.type,
          status: newItem.status || 'pending',
          priority: this.mapPriorityToDatabase(newItem.priority || 'medium'),
          data: {
            confidence: newItem.confidence,
            estimatedReviewTime: newItem.estimatedReviewTime,
            ...newItem.data,
            ...newItem.metadata
          },
          submitted_by: newItem.submittedBy,
          created_at: newItem.submittedAt?.toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;

      // Ajouter l'entrée d'historique
      await this.addHistoryEntry(data.id, {
        action: 'submitted',
        actor: newItem.submittedBy!,
        timestamp: newItem.submittedAt!,
        notes: 'Élément soumis pour approbation'
      });

      console.log('✅ Élément ajouté à la queue d\'approbation:', data.id);
      return data.id;

    } catch (error) {
      console.error('❌ Erreur ajout queue approbation:', error);
      throw error;
    }
  }

  /**
   * Récupérer les éléments de la queue avec filtres
   */
  async getQueueItems(filters: ApprovalQueueFilters = {}): Promise<PersistentApprovalItem[]> {
    try {
      let query = supabase
        .from('approval_items')
        .select(`
          *,
          approval_history (
            id,
            action,
            actor_id,
            created_at,
            comment,
            previous_status,
            new_status,
            metadata
          )
        `)
         .order('created_at', { ascending: false });

      // Appliquer les filtres
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters.type && filters.type.length > 0) {
        query = query.in('item_type', filters.type);
      }

      if (filters.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority);
      }

      if (filters.submittedBy) {
        query = query.eq('submitted_by', filters.submittedBy);
      }

      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString());
      }

      if (filters.confidenceRange) {
        query = query
          .gte('confidence', filters.confidenceRange.min)
          .lte('confidence', filters.confidenceRange.max);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transformer les données Supabase en objets PersistentApprovalItem
      return data.map(this.transformSupabaseItem);

    } catch (error) {
      console.error('❌ Erreur récupération queue:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'un élément
   */
  async updateItemStatus(
    itemId: string, 
    newStatus: PersistentApprovalItem['status'],
    reviewerId: string,
    notes?: string,
    modificationNotes?: string
  ): Promise<void> {
    try {
      // Récupérer l'ancien statut
      const { data: currentItem, error: fetchError } = await supabase
        .from('approval_items')
        .select('status')
        .eq('id', itemId)
        .single();

      if (fetchError) throw fetchError;

      const updateData: any = {
        status: newStatus,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString()
      };

      if (newStatus === 'rejected' && notes) {
        updateData.rejection_reason = notes;
      }

      if (newStatus === 'requires_modification' && modificationNotes) {
        updateData.modification_notes = modificationNotes;
      }

      // Mettre à jour l'élément
      const { error: updateError } = await supabase
        .from('approval_items')
        .update(updateData)
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Ajouter l'entrée d'historique
      await this.addHistoryEntry(itemId, {
        action: this.getActionFromStatus(newStatus),
        actor: reviewerId,
        timestamp: new Date(),
        notes: notes || modificationNotes,
        previousStatus: currentItem.status,
        newStatus
      });

      console.log('✅ Statut mis à jour:', itemId, '→', newStatus);

    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      throw error;
    }
  }

  /**
   * Supprimer un élément de la queue
   */
  async removeFromQueue(itemId: string, actor: string): Promise<void> {
    try {
      // Ajouter l'historique avant suppression
      await this.addHistoryEntry(itemId, {
        action: 'submitted', // Utiliser 'submitted' comme action générique
        actor,
        timestamp: new Date(),
        notes: 'Élément supprimé de la queue'
      });

      const { error } = await supabase
        .from('approval_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      console.log('✅ Élément supprimé de la queue:', itemId);

    } catch (error) {
      console.error('❌ Erreur suppression queue:', error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques de la queue
   */
  async getQueueStats(): Promise<ApprovalStats> {
    try {
      // Récupérer tous les éléments pour les statistiques
      const { data: items, error } = await supabase
        .from('approval_items')
        .select('*');

      if (error) throw error;

      const total = items.length;
      const byStatus = this.groupBy(items, 'status');
      const byPriority = this.groupBy(items, 'priority');
      const byType = this.groupBy(items, 'item_type');

      // Calculer les moyennes
      const avgConfidence = items.length > 0 
        ? items.reduce((sum, item) => sum + ((item.data as any)?.confidence || 0), 0) / items.length 
        : 0;

      // Temps de traitement moyen (simulé pour l'instant)
      const avgProcessingTime = items.length > 0
        ? items.reduce((sum, item) => sum + ((item.data as any)?.estimatedReviewTime || 30), 0) / items.length
        : 30;

      // Soumissions quotidiennes (7 derniers jours)
      const dailySubmissions = await this.getDailySubmissions();

      // Charge de travail des reviewers
      const reviewerWorkload = await this.getReviewerWorkload();

      return {
        total,
        pending: byStatus.pending || 0,
        approved: byStatus.approved || 0,
        rejected: byStatus.rejected || 0,
        requiresModification: byStatus.requires_modification || 0,
        avgProcessingTime,
        avgConfidence,
        byPriority,
        byType,
        dailySubmissions,
        reviewerWorkload
      };

    } catch (error) {
      console.error('❌ Erreur statistiques queue:', error);
      throw error;
    }
  }

  /**
   * Rechercher dans la queue
   */
  async searchQueue(searchTerm: string, filters: ApprovalQueueFilters = {}): Promise<PersistentApprovalItem[]> {
    try {
      let query = supabase
        .from('approval_items')
        .select(`
          *,
          approval_history (
            id,
            action,
            actor_id,
            created_at,
            comment,
            previous_status,
            new_status,
            metadata
          )
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      // Appliquer les filtres comme dans getQueueItems
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(this.transformSupabaseItem);

    } catch (error) {
      console.error('❌ Erreur recherche queue:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'historique d'un élément
   */
  async getItemHistory(itemId: string): Promise<ApprovalHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('approval_history')
        .select('*')
        .eq('approval_item_id', itemId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(entry => ({
        id: entry.id,
        action: entry.action as ApprovalHistoryEntry['action'],
        actor: entry.actor_id,
        timestamp: new Date(entry.created_at),
        notes: entry.comment,
        previousStatus: entry.previous_status,
        newStatus: entry.new_status,
        metadata: entry.metadata
      }));

    } catch (error) {
      console.error('❌ Erreur historique élément:', error);
      throw error;
    }
  }

  /**
   * Traitement en lot
   */
  async batchApprove(itemIds: string[], reviewerId: string, notes?: string): Promise<void> {
    try {
      for (const itemId of itemIds) {
        await this.updateItemStatus(itemId, 'approved', reviewerId, notes);
      }

      console.log('✅ Approbation en lot terminée:', itemIds.length, 'éléments');

    } catch (error) {
      console.error('❌ Erreur approbation en lot:', error);
      throw error;
    }
  }

  /**
   * Escalade automatique des éléments anciens
   */
  async escalateOldItems(thresholdHours: number = 24): Promise<number> {
    try {
      const thresholdDate = new Date();
      thresholdDate.setHours(thresholdDate.getHours() - thresholdHours);

      const { data: oldItems, error } = await supabase
        .from('approval_items')
        .select('id, title, priority')
        .eq('status', 'pending')
        .lt('created_at', thresholdDate.toISOString());

      if (error) throw error;

      let escalatedCount = 0;

      for (const item of oldItems) {
        // Escalader la priorité
        const newPriority = this.escalatePriority(item.priority);
        
        if (newPriority !== item.priority) {
          await supabase
            .from('approval_items')
            .update({ priority: newPriority as 'low' | 'medium' | 'high' | 'urgent' })
            .eq('id', item.id);

          await this.addHistoryEntry(item.id, {
            action: 'submitted', // Action générique
            actor: 'system',
            timestamp: new Date(),
            notes: `Priorité escaladée: ${item.priority} → ${newPriority}`,
            metadata: { escalation: true, oldPriority: item.priority, newPriority }
          });

          escalatedCount++;
        }
      }

      console.log('✅ Escalade automatique:', escalatedCount, 'éléments');
      return escalatedCount;

    } catch (error) {
      console.error('❌ Erreur escalade automatique:', error);
      throw error;
    }
  }

  // === MÉTHODES PRIVÉES ===

  private async addHistoryEntry(
    itemId: string, 
    entry: Omit<ApprovalHistoryEntry, 'id'>
  ): Promise<void> {
    try {
      // Simplified history entry - just log to console for now
      // TODO: Fix approval_history table structure to match expected schema
      console.log('📝 History entry:', {
        itemId,
        action: entry.action,
        actor: entry.actor,
        timestamp: entry.timestamp,
        notes: entry.notes
      });

    } catch (error) {
      console.error('❌ Erreur ajout historique:', error);
      throw error;
    }
  }

  private transformSupabaseItem(item: any): PersistentApprovalItem {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.item_type,
      status: item.status,
      priority: item.priority,
      confidence: item.data?.confidence || 0,
      submittedBy: item.submitted_by,
      submittedAt: new Date(item.created_at),
      reviewedBy: item.approved_by,
      reviewedAt: item.approved_at ? new Date(item.approved_at) : undefined,
      estimatedReviewTime: (item.data as any)?.estimatedReviewTime || 0,
      data: item.data,
      metadata: item.metadata || {},
      rejectionReason: item.rejection_reason,
      modificationNotes: item.modification_notes,
      approvalHistory: (item.approval_history || []).map((entry: any) => ({
        id: entry.id,
        action: entry.action as ApprovalHistoryEntry['action'],
        actor: entry.actor_id,
        timestamp: new Date(entry.created_at),
        notes: entry.comment,
        previousStatus: entry.previous_status,
        newStatus: entry.new_status,
        metadata: entry.metadata
      }))
    };
  }

  private getActionFromStatus(status: PersistentApprovalItem['status']): ApprovalHistoryEntry['action'] {
    const actionMap: Record<string, ApprovalHistoryEntry['action']> = {
      'approved': 'approved',
      'rejected': 'rejected',
      'requires_modification': 'modified',
      'pending': 'reviewed'
    };

    return actionMap[status] || 'reviewed';
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      groups[groupKey] = (groups[groupKey] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }

  private async getDailySubmissions(): Promise<Array<{ date: string; count: number }>> {
    try {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const submissions = [];

      for (const date of last7Days) {
        const { data, error } = await supabase
          .from('approval_items')
          .select('id', { count: 'exact' })
           .gte('created_at', `${date}T00:00:00.000Z`)
           .lt('created_at', `${date}T23:59:59.999Z`);

        if (error) throw error;

        submissions.push({
          date,
          count: data?.length || 0
        });
      }

      return submissions;

    } catch (error) {
      console.error('❌ Erreur soumissions quotidiennes:', error);
      return [];
    }
  }

  private async getReviewerWorkload(): Promise<Array<{ reviewer: string; pending: number; avgTime: number }>> {
    try {
      const { data, error } = await supabase
        .from('approval_items')
        .select('approved_by, data')
        .eq('status', 'pending');

      if (error) throw error;

      const workload = data.reduce((acc, item) => {
        const reviewer = item.approved_by || 'unassigned';
        if (!acc[reviewer]) {
          acc[reviewer] = { pending: 0, totalTime: 0, count: 0 };
        }
        acc[reviewer].pending++;
        acc[reviewer].totalTime += (item.data as any)?.estimatedReviewTime || 30;
        acc[reviewer].count++;
        return acc;
      }, {} as Record<string, { pending: number; totalTime: number; count: number }>);

      return Object.entries(workload).map(([reviewer, stats]) => ({
        reviewer,
        pending: (stats as any)?.pending || 0,
        avgTime: (stats as any)?.count > 0 ? (stats as any).totalTime / (stats as any).count : 30
      }));

    } catch (error) {
      console.error('❌ Erreur charge reviewers:', error);
      return [];
    }
  }

  private escalatePriority(currentPriority: string): string {
    const priorityMap: Record<string, string> = {
      'low': 'normal',
      'normal': 'high',
      'high': 'critical',
      'critical': 'critical' // Reste au maximum
    };

    return priorityMap[currentPriority] || 'normal';
  }

  private mapPriorityToDatabase(priority: string): 'low' | 'medium' | 'high' | 'urgent' {
    const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'urgent'> = {
      'low': 'low',
      'medium': 'medium', 
      'high': 'high',
      'urgent': 'urgent',
      'normal': 'medium',
      'critical': 'urgent'
    };
    return priorityMap[priority] || 'medium';
  }
}

export const persistentApprovalQueueService = new PersistentApprovalQueueService();