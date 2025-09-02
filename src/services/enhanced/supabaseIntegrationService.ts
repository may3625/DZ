/**
 * Service d'intégration Supabase pour le système d'approbation
 * Gère la persistance et la synchronisation des données d'approbation
 */

import { supabase } from '@/integrations/supabase/client';
import { ApprovalItem, ApprovalModification } from '../approval/approvalItemService';
import { MappingResult } from './intelligentMappingService';
import { ValidationResult } from '../validation/validationService';
import { logger } from '@/utils/logger';

export interface SupabaseApprovalItem {
  id: string;
  item_type: 'mapping_validation' | 'ocr_extraction' | 'batch_processing';
  title: string;
  description: string;
  data: any; // JSONB contenant le mappingResult
  original_data?: any; // JSONB contenant les données originales
  status: 'pending' | 'approved' | 'rejected' | 'requires_modification';
  priority: 'low' | 'medium' | 'high' | 'critical';
  submitted_by: string; // UUID de l'utilisateur
  assigned_to?: string; // UUID de l'utilisateur assigné
  approved_by?: string;
  approved_at?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  legal_text_id?: string; // Référence vers legal_texts si applicable
  modification_notes?: string;
  rejection_reason?: string;
}

export interface SupabaseValidationError {
  id: string;
  approval_item_id: string;
  error_type: 'validation' | 'mapping' | 'format' | 'business_rule';
  error_code: string;
  error_message: string;
  field_path?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggested_fix?: string;
  is_resolved: boolean;
  created_at: string;
}

class SupabaseIntegrationService {
  
  /**
   * Sauvegarde d'un item d'approbation dans Supabase
   */
  async saveApprovalItem(
    approvalItem: ApprovalItem,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('Supabase', '📤 Sauvegarde item d\'approbation', { itemId: approvalItem.id });

      // Règles métier DZ minimales (sans UI) :
      // - Score de validation minimal
      // - Champs clés présents (titre, type/documentType si disponible)
      // - Rejeter si issues critiques > 0
      const businessErrors: Array<{ code: string; message: string; severity: 'critical' | 'high' | 'medium' | 'low' }> = [];
      const score = approvalItem.validationResult?.score ?? 0;
      if (score < 0.5) {
        businessErrors.push({ code: 'RULE_SCORE_MIN', message: 'Score de validation insuffisant (< 0.5)', severity: 'high' });
      }
      if (!approvalItem.title || approvalItem.title.trim().length < 3) {
        businessErrors.push({ code: 'RULE_TITLE_REQUIRED', message: 'Titre obligatoire', severity: 'medium' });
      }
      const docType = approvalItem.compactData?.documentType || approvalItem.mappingResult?.documentType;
      if (!docType) {
        businessErrors.push({ code: 'RULE_DOC_TYPE_REQUIRED', message: 'Type de document manquant', severity: 'medium' });
      }
      if ((approvalItem.criticalIssuesCount ?? 0) > 0) {
        businessErrors.push({ code: 'RULE_NO_CRITICAL_ISSUES', message: 'Présence d\'erreurs critiques', severity: 'critical' });
      }

      // Si des erreurs critiques/hautes existent, sauvegarder en requires_modification et loguer les erreurs
      const hasBlocking = businessErrors.some(e => e.severity === 'critical' || e.severity === 'high');

      const supabaseItem = {
        id: approvalItem.id,
        item_type: approvalItem.type,
        title: approvalItem.title,
        description: approvalItem.description,
        data: {
          mappingResult: approvalItem.mappingResult,
          extractedText: approvalItem.extractedText,
          metadata: {
            confidence: approvalItem.confidence,
            issuesCount: approvalItem.issuesCount,
            criticalIssuesCount: approvalItem.criticalIssuesCount,
            estimatedReviewTime: approvalItem.estimatedReviewTime,
            compactData: approvalItem.compactData
          }
        } as any,
        original_data: {
          validationResult: approvalItem.validationResult
        } as any,
        status: this.mapStatusToSupabase(approvalItem.status) as 'pending' | 'approved' | 'rejected' | 'requires_modification',
        priority: (approvalItem.priority === 'critical' ? 'urgent' : approvalItem.priority) as 'low' | 'medium' | 'high' | 'urgent',
        submitted_by: userId,
        created_at: approvalItem.createdAt.toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('approval_items')
        .insert({
          ...supabaseItem,
          status: hasBlocking ? 'requires_modification' : supabaseItem.status
        })
        .select()
        .single();

      if (error) {
        logger.error('Supabase', '❌ Erreur sauvegarde item:', error);
        return { success: false, error: error.message };
      }

      // Sauvegarder les erreurs de validation associées
      if (approvalItem.validationResult?.issues?.length > 0) {
        await this.saveValidationErrors(approvalItem.id, approvalItem.validationResult.issues);
      }

      // Sauvegarder aussi les erreurs métier si présentes
      if (businessErrors.length > 0) {
        await this.saveValidationErrors(approvalItem.id, businessErrors.map(e => ({
          type: 'business_rule',
          code: e.code,
          message: e.message,
          severity: e.severity
        })) as any);
      }

      logger.info('Supabase', '✅ Item sauvegardé avec succès', { itemId: data.id });
      return { success: true };

    } catch (error: any) {
      logger.error('Supabase', '❌ Erreur sauvegarde:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupération de la queue d'approbation depuis Supabase
   */
  async getApprovalQueue(
    userId: string,
    filters?: {
      status?: string;
      priority?: string;
      assignedToMe?: boolean;
    }
  ): Promise<{ success: boolean; items?: ApprovalItem[]; error?: string }> {
    try {
      logger.info('Supabase', '📥 Récupération queue d\'approbation');

      let query = supabase
        .from('approval_items')
        .select(`
          *,
          validation_errors (*)
        `);

      // Filtres
      if (filters?.status) {
        query = query.eq('status', filters.status as any);
      }
      
      if (filters?.priority) {
        query = query.eq('priority', filters.priority as any);
      }

      if (filters?.assignedToMe) {
        query = query.eq('assigned_to', userId);
      } else {
        // Voir les items soumis par l'utilisateur ou assignés à lui
        query = query.or(`submitted_by.eq.${userId},assigned_to.eq.${userId}`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        logger.error('Supabase', '❌ Erreur récupération queue:', error);
        return { success: false, error: error.message };
      }

      // Conversion vers le format ApprovalItem
      const approvalItems = data?.map(item => this.mapSupabaseToApprovalItem(item)) || [];

      logger.info('Supabase', '✅ Queue récupérée', { itemsCount: approvalItems.length });
      return { success: true, items: approvalItems };

    } catch (error: any) {
      logger.error('Supabase', '❌ Erreur récupération queue:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mise à jour du statut d'un item d'approbation
   */
  async updateApprovalItemStatus(
    itemId: string,
    status: 'approved' | 'rejected' | 'requires_modification',
    userId: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('Supabase', '🔄 Mise à jour statut item', { itemId, status });

      // En cas d'approbation, revalider brièvement les contraintes bloquantes
      if (status === 'approved') {
        const { data: current, error: curErr } = await supabase
          .from('approval_items')
          .select('data, original_data')
          .eq('id', itemId)
          .maybeSingle();
        if (!curErr && current) {
          const data = current.data as any;
          const originalData = current.original_data as any;
          const crit = data?.metadata?.criticalIssuesCount ?? 0;
          const score = originalData?.validationResult?.score ?? 0;
          if (crit > 0 || score < 0.5) {
            return { success: false, error: 'Règles métier: échec (issues critiques ou score < 0.5)' };
          }
        }
      }

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'approved') {
        updateData.approved_by = userId;
        updateData.approved_at = new Date().toISOString();
      } else if (status === 'rejected') {
        updateData.rejection_reason = notes || '';
      } else if (status === 'requires_modification') {
        updateData.modification_notes = notes || '';
      }

      const { error } = await supabase
        .from('approval_items')
        .update(updateData)
        .eq('id', itemId);

      if (error) {
        logger.error('Supabase', '❌ Erreur mise à jour statut:', error);
        return { success: false, error: error.message };
      }

      logger.info('Supabase', '✅ Statut mis à jour avec succès');
      return { success: true };

    } catch (error: any) {
      logger.error('Supabase', '❌ Erreur mise à jour:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Modification d'un champ dans un item d'approbation
   */
  async modifyApprovalItemField(
    itemId: string,
    fieldName: string,
    newValue: any,
    userId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('Supabase', '✏️ Modification champ item', { itemId, fieldName });

      // Récupérer l'item actuel
      const { data: currentItem, error: fetchError } = await supabase
        .from('approval_items')
        .select('data')
        .eq('id', itemId)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      // Modifier la data
      const updatedData = currentItem.data ? JSON.parse(JSON.stringify(currentItem.data)) : {};
      if (updatedData.mappingResult?.mappedFields) {
        const fieldIndex = updatedData.mappingResult.mappedFields.findIndex(
          (f: any) => f.fieldName === fieldName
        );
        
        if (fieldIndex !== -1) {
          const field = updatedData.mappingResult.mappedFields[fieldIndex];
          updatedData.mappingResult.mappedFields[fieldIndex] = {
            ...field,
            mappedValue: newValue,
            originalValue: field.mappedValue,
            isEdited: true
          };
        }
      }

      // Mise à jour en base
      const { error: updateError } = await supabase
        .from('approval_items')
        .update({
          data: updatedData,
          status: 'requires_modification',
          modification_notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      logger.info('Supabase', '✅ Champ modifié avec succès');
      return { success: true };

    } catch (error: any) {
      logger.error('Supabase', '❌ Erreur modification champ:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sauvegarde des erreurs de validation
   */
  private async saveValidationErrors(
    approvalItemId: string,
    issues: any[]
  ): Promise<void> {
    try {
      const validationErrors = issues.map(issue => ({
        approval_item_id: approvalItemId,
        error_type: issue.type || 'validation',
        error_code: issue.code || 'unknown',
        error_message: issue.message || 'Erreur de validation',
        field_path: issue.field || null,
        severity: this.mapSeverityToSupabase(issue.severity || 'medium'),
        suggested_fix: issue.suggestion || null,
        is_resolved: false,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('validation_errors')
        .insert(validationErrors);

      if (error) {
        logger.error('Supabase', '❌ Erreur sauvegarde erreurs validation:', error);
      }
    } catch (error) {
      logger.error('Supabase', '❌ Erreur sauvegarde erreurs validation:', error);
    }
  }

  /**
   * Mapping du statut vers Supabase
   */
  private mapStatusToSupabase(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'approved': 'approved',
      'rejected': 'rejected',
      'needs_review': 'requires_modification'
    };
    return statusMap[status] || 'pending';
  }

  /**
   * Mapping de la sévérité vers Supabase
   */
  private mapSeverityToSupabase(severity: string): string {
    const severityMap: Record<string, string> = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'critical': 'critical',
      'warning': 'medium',
      'error': 'high'
    };
    return severityMap[severity] || 'medium';
  }

  /**
   * Conversion d'un item Supabase vers ApprovalItem
   */
  private mapSupabaseToApprovalItem(supabaseItem: any): ApprovalItem {
    return {
      id: supabaseItem.id,
      type: supabaseItem.item_type,
      status: this.mapStatusFromSupabase(supabaseItem.status),
      priority: supabaseItem.priority,
      createdAt: new Date(supabaseItem.created_at),
      updatedAt: supabaseItem.updated_at ? new Date(supabaseItem.updated_at) : undefined,
      
      title: supabaseItem.title,
      description: supabaseItem.description,
      extractedText: supabaseItem.data?.extractedText || '',
      mappingResult: supabaseItem.data?.mappingResult || {},
      validationResult: supabaseItem.original_data?.validationResult || { score: 0, issues: [] },
      
      confidence: supabaseItem.data?.metadata?.confidence || 0,
      issuesCount: supabaseItem.data?.metadata?.issuesCount || 0,
      criticalIssuesCount: supabaseItem.data?.metadata?.criticalIssuesCount || 0,
      estimatedReviewTime: supabaseItem.data?.metadata?.estimatedReviewTime || 0,
      
      compactData: supabaseItem.data?.metadata?.compactData || {
        documentType: '',
        keyFields: {},
        summary: '',
        confidence: 0,
        issues: [],
        previewText: ''
      },
      
      modifications: [],
      reviewComments: [],
      approvedBy: supabaseItem.approved_by,
      rejectionReason: supabaseItem.rejection_reason
    };
  }

  /**
   * Mapping du statut depuis Supabase
   */
  private mapStatusFromSupabase(status: string): 'pending' | 'approved' | 'rejected' | 'needs_review' {
    const statusMap: Record<string, any> = {
      'pending': 'pending',
      'approved': 'approved',
      'rejected': 'rejected',
      'requires_modification': 'needs_review'
    };
    return statusMap[status] || 'pending';
  }

  /**
   * Récupération des statistiques d'approbation
   */
  async getApprovalStatistics(userId: string): Promise<{
    success: boolean;
    stats?: {
      pending: number;
      approved: number;
      rejected: number;
      needsReview: number;
      totalProcessingTime: number;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('approval_items')
        .select('status')
        .or(`submitted_by.eq.${userId},assigned_to.eq.${userId}`);

      if (error) {
        return { success: false, error: error.message };
      }

      const stats = data?.reduce((acc, item) => {
        switch (item.status) {
          case 'pending':
            acc.pending++;
            break;
          case 'approved':
            acc.approved++;
            break;
          case 'rejected':
            acc.rejected++;
            break;
          case 'requires_modification':
            acc.needsReview++;
            break;
        }
        return acc;
      }, {
        pending: 0,
        approved: 0,
        rejected: 0,
        needsReview: 0,
        totalProcessingTime: 0
      });

      return { success: true, stats };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const supabaseIntegrationService = new SupabaseIntegrationService();
export default supabaseIntegrationService;