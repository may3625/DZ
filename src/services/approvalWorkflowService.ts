// Service de gestion du workflow d'approbation et de la queue

import { ApprovalItem, ValidationStatus, ApprovalPriority, ApprovalHistory, ApprovalWorkflowConfig } from '@/types/approval';
import { supabase } from '@/integrations/supabase/client';
import { secureLog } from '@/utils/basicSecurity';
import { ValidationService } from './validationService';

export class ApprovalWorkflowService {
  
  /**
   * Soumet un élément pour approbation
   */
  static async submitForApproval(
    itemType: string,
    title: string,
    description: string,
    data: Record<string, any>,
    originalData?: Record<string, any>,
    priority: ApprovalPriority = 'medium',
    legalTextId?: string
  ): Promise<ApprovalItem> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Créer l'élément d'approbation dans la table approval_items
      const { data: item, error } = await supabase
        .from('approval_items')
        .insert({
          legal_text_id: legalTextId,
          item_type: itemType,
          title,
          description,
          data,
          original_data: originalData,
          priority,
          submitted_by: user.id,
          status: 'pending'
        })
        .select('*')
        .single();

      if (error) throw error;

      // Auto-assignment si configuré
      await this.autoAssignReviewer(item as ApprovalItem);

      secureLog.info('Élément soumis pour approbation', { 
        itemId: item.id, 
        type: itemType, 
        priority 
      });

      return item as ApprovalItem;

    } catch (error) {
      secureLog.error('Erreur lors de la soumission pour approbation', error);
      throw error;
    }
  }

  /**
   * Récupère la queue d'approbation
   */
  static async getApprovalQueue(filters?: {
    status?: ValidationStatus;
    priority?: ApprovalPriority;
    assignedTo?: string;
    submittedBy?: string;
    itemType?: string;
  }): Promise<ApprovalItem[]> {
    try {
      let query = supabase
        .from('approval_items')
        .select(`
          *,
          validation_errors:validation_errors(*)
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      // Appliquer les filtres
      if (filters?.status) {
        const dbStatus = filters.status === 'under_review' ? 'in_review' : 
                        filters.status === 'modified' ? 'requires_modification' : 
                        filters.status;
        query = query.eq('status', dbStatus);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters?.submittedBy) {
        query = query.eq('submitted_by', filters.submittedBy);
      }
      if (filters?.itemType) {
        query = query.eq('item_type', filters.itemType);
      }

      const { data: items, error } = await query;

      if (error) throw error;

      return (items || []).map(item => ({
        ...item,
        status: item.status === 'in_review' ? 'under_review' : 
                item.status === 'requires_modification' ? 'modified' : 
                item.status
      })) as ApprovalItem[];

    } catch (error) {
      secureLog.error('Erreur lors de la récupération de la queue d\'approbation', error);
      throw error;
    }
  }

  /**
   * Approuve un élément
   */
  static async approveItem(itemId: string, comment?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { error } = await supabase
        .from('approval_items')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq('id', itemId);

      if (error) throw error;

      // Ajouter un commentaire à l'historique si fourni
      if (comment) {
        await this.addHistoryEntry(itemId, 'approved', comment);
      }

      // Appliquer les changements au document original
      await this.applyApprovedChanges(itemId);

      secureLog.info('Élément approuvé', { itemId, approvedBy: user.id });

    } catch (error) {
      secureLog.error('Erreur lors de l\'approbation', error);
      throw error;
    }
  }

  /**
   * Rejette un élément
   */
  static async rejectItem(itemId: string, reason: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { error } = await supabase
        .from('approval_items')
        .update({
          status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', itemId);

      if (error) throw error;

      secureLog.info('Élément rejeté', { itemId, rejectedBy: user.id, reason });

    } catch (error) {
      secureLog.error('Erreur lors du rejet', error);
      throw error;
    }
  }

  /**
   * Demande des modifications
   */
  static async requestModifications(itemId: string, notes: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('approval_items')
        .update({
          status: 'requires_modification',
          modification_notes: notes
        })
        .eq('id', itemId);

      if (error) throw error;

      secureLog.info('Modifications demandées', { itemId, notes });

    } catch (error) {
      secureLog.error('Erreur lors de la demande de modification', error);
      throw error;
    }
  }

  /**
   * Assigne un réviseur
   */
  static async assignReviewer(itemId: string, reviewerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('approval_items')
        .update({
          assigned_to: reviewerId,
          status: 'in_review'
        })
        .eq('id', itemId);

      if (error) throw error;

      await this.addHistoryEntry(itemId, 'assigned', `Assigné à ${reviewerId}`);

      secureLog.info('Réviseur assigné', { itemId, reviewerId });

    } catch (error) {
      secureLog.error('Erreur lors de l\'assignation', error);
      throw error;
    }
  }

  /**
   * Auto-assignment d'un réviseur
   */
  private static async autoAssignReviewer(item: ApprovalItem): Promise<void> {
    try {
      // Récupérer les administrateurs disponibles
      const { data: admins, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (error || !admins || admins.length === 0) {
        secureLog.info('Aucun administrateur disponible pour auto-assignation');
        return;
      }

      // Sélectionner l'admin avec le moins d'éléments assignés
      const { data: assignments, error: assignError } = await supabase
        .from('approval_items')
        .select('assigned_to')
        .in('assigned_to', admins.map(admin => admin.user_id))
        .in('status', ['in_review', 'pending']);

      if (assignError) throw assignError;

      // Compter les assignations par admin
      const assignmentCounts = admins.reduce((acc, admin) => {
        acc[admin.user_id] = assignments?.filter(a => a.assigned_to === admin.user_id).length || 0;
        return acc;
      }, {} as Record<string, number>);

      // Trouver l'admin avec le moins d'assignations
      const selectedAdmin = Object.entries(assignmentCounts)
        .sort(([,a], [,b]) => Number(a) - Number(b))[0][0];

      if (selectedAdmin) {
        await this.assignReviewer(item.id, selectedAdmin);
      }

    } catch (error) {
      secureLog.error('Erreur lors de l\'auto-assignation', error);
    }
  }

  /**
   * Applique les changements approuvés
   */
  private static async applyApprovedChanges(itemId: string): Promise<void> {
    try {
      const { data: item, error } = await supabase
        .from('approval_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;

      if (!item.legal_text_id) return;

      // Appliquer les changements selon le type d'item
      switch (item.item_type) {
        case 'legal_text':
          await this.updateLegalText(item.legal_text_id, item.data as Record<string, any>);
          break;
        case 'classification':
          await this.updateClassification(item.legal_text_id, item.data as Record<string, any>);
          break;
        case 'metadata_update':
          await this.updateMetadata(item.legal_text_id, item.data as Record<string, any>);
          break;
        default:
          secureLog.warn('Type d\'item non géré pour l\'application des changements', { itemType: item.item_type });
      }

    } catch (error) {
      secureLog.error('Erreur lors de l\'application des changements', error);
      throw error;
    }
  }

  /**
   * Met à jour un texte légal
   */
  private static async updateLegalText(legalTextId: string, data: Record<string, any>): Promise<void> {
    const { error } = await supabase
      .from('legal_texts')
      .update(data)
      .eq('id', legalTextId);

    if (error) throw error;
  }

  /**
   * Met à jour la classification
   */
  private static async updateClassification(legalTextId: string, data: Record<string, any>): Promise<void> {
    const { error } = await supabase
      .from('classifications')
      .upsert({
        legal_text_id: legalTextId,
        ...data
      });

    if (error) throw error;
  }

  /**
   * Met à jour les métadonnées
   */
  private static async updateMetadata(legalTextId: string, data: Record<string, any>): Promise<void> {
    const { error } = await supabase
      .from('legal_texts')
      .update({ metadata: data })
      .eq('id', legalTextId);

    if (error) throw error;
  }

  /**
   * Ajoute une entrée à l'historique
   */
  private static async addHistoryEntry(
    approvalItemId: string, 
    action: string, 
    comment?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('approval_history')
        .insert({
          approval_item_id: approvalItemId,
          action,
          actor_id: user?.id,
          comment,
          metadata
        });

      if (error) throw error;

    } catch (error) {
      secureLog.error('Erreur lors de l\'ajout à l\'historique', error);
    }
  }

  /**
   * Récupère l'historique d'un élément
   */
  static async getItemHistory(itemId: string): Promise<ApprovalHistory[]> {
    try {
      const { data: history, error } = await supabase
        .from('approval_history')
        .select('*')
        .eq('approval_item_id', itemId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return history || [];

    } catch (error) {
      secureLog.error('Erreur lors de la récupération de l\'historique', error);
      throw error;
    }
  }

  /**
   * Récupère les éléments en retard
   */
  static async getOverdueItems(): Promise<ApprovalItem[]> {
    try {
      const now = new Date().toISOString();

      const { data: items, error } = await supabase
        .from('approval_items')
        .select('*')
        .lt('due_date', now)
        .not('status', 'in', '(approved,rejected)');

      if (error) throw error;

      return (items || []).map(item => ({
        ...item,
        status: item.status === 'in_review' ? 'under_review' : 
                item.status === 'requires_modification' ? 'modified' : 
                item.status
      })) as ApprovalItem[];

    } catch (error) {
      secureLog.error('Erreur lors de la récupération des éléments en retard', error);
      throw error;
    }
  }

  /**
   * Configure le workflow d'approbation
   */
  static async configureWorkflow(config: ApprovalWorkflowConfig): Promise<void> {
    try {
      // Enregistrer la configuration (à implémenter selon les besoins)
      secureLog.info('Configuration du workflow mise à jour', config);

    } catch (error) {
      secureLog.error('Erreur lors de la configuration du workflow', error);
      throw error;
    }
  }
}