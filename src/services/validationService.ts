// Service de validation avec diagnostic et détection d'erreurs

import { ApprovalItem, ValidationError, ValidationDiagnostic, ValidationErrorType, ErrorSeverity } from '@/types/approval';
import { supabase } from '@/integrations/supabase/client';
import { secureLog } from '@/utils/basicSecurity';

export class ValidationService {
  
  /**
   * Effectue un diagnostic complet du système de validation
   */
  static async runDiagnostic(): Promise<ValidationDiagnostic> {
    try {
      // Récupérer les statistiques des éléments d'approbation
      const { data: items, error: itemsError } = await supabase
        .from('approval_items')
        .select('status, priority, created_at, due_date, approved_at');

      if (itemsError) throw itemsError;

      // Récupérer les erreurs critiques
      const { data: errors, error: errorsError } = await supabase
        .from('validation_errors')
        .select('severity')
        .eq('is_resolved', false);

      if (errorsError) throw errorsError;

      const now = new Date();
      const totalItems = items?.length || 0;
      const pendingItems = items?.filter(item => item.status === 'pending').length || 0;
      const inReviewItems = items?.filter(item => item.status === 'in_review').length || 0;
      const approvedItems = items?.filter(item => item.status === 'approved').length || 0;
      const rejectedItems = items?.filter(item => item.status === 'rejected').length || 0;
      const criticalErrors = errors?.filter(error => error.severity === 'critical').length || 0;
      const highPriorityItems = items?.filter(item => item.priority === 'high' || item.priority === 'urgent').length || 0;
      
      // Calcul des éléments en retard
      const overdueItems = items?.filter(item => {
        if (!item.due_date || item.status === 'approved' || item.status === 'rejected') return false;
        return new Date(item.due_date) < now;
      }).length || 0;

      // Calcul du temps de traitement moyen
      const processedItems = items?.filter(item => item.approved_at && item.status === 'approved') || [];
      const averageProcessingTime = processedItems.length > 0 
        ? processedItems.reduce((acc, item) => {
            const created = new Date(item.created_at);
            const approved = new Date(item.approved_at!);
            return acc + (approved.getTime() - created.getTime());
          }, 0) / processedItems.length / (1000 * 60 * 60 * 24) // en jours
        : 0;

      const diagnostic: ValidationDiagnostic = {
        totalItems,
        pendingItems,
        inReviewItems,
        approvedItems,
        rejectedItems,
        criticalErrors,
        highPriorityItems,
        overdueItems,
        averageProcessingTime: Math.round(averageProcessingTime * 10) / 10
      };

      secureLog.info('Diagnostic de validation effectué', diagnostic);
      return diagnostic;

    } catch (error) {
      secureLog.error('Erreur lors du diagnostic de validation', error);
      throw error;
    }
  }

  /**
   * Valide un élément et détecte les erreurs
   */
  static async validateItem(item: ApprovalItem): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    try {
      // Validation du format
      const formatErrors = await this.validateFormat(item);
      errors.push(...formatErrors);

      // Validation du contenu
      const contentErrors = await this.validateContent(item);
      errors.push(...contentErrors);

      // Validation des métadonnées
      const metadataErrors = await this.validateMetadata(item);
      errors.push(...metadataErrors);

      // Détection de doublons
      const duplicateErrors = await this.detectDuplicates(item);
      errors.push(...duplicateErrors);

      // Validation de la classification
      const classificationErrors = await this.validateClassification(item);
      errors.push(...classificationErrors);

      // Validation de la conformité légale
      const legalComplianceErrors = await this.validateLegalCompliance(item);
      errors.push(...legalComplianceErrors);

      // Enregistrer les erreurs en base
      if (errors.length > 0) {
        await this.saveValidationErrors(item.id, errors);
      }

      secureLog.info('Validation terminée', { itemId: item.id, errorsCount: errors.length });
      return errors;

    } catch (error) {
      secureLog.error('Erreur lors de la validation', error);
      throw error;
    }
  }

  /**
   * Validation du format
   */
  private static async validateFormat(item: ApprovalItem): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Vérifier les champs obligatoires
    if (!item.title || item.title.trim().length === 0) {
      errors.push({
        id: crypto.randomUUID(),
        approval_item_id: item.id,
        error_type: 'format',
        severity: 'high',
        field_path: 'title',
        error_code: 'MISSING_TITLE',
        error_message: 'Le titre est obligatoire',
        suggested_fix: 'Veuillez ajouter un titre descriptif',
        is_resolved: false,
        created_at: new Date().toISOString()
      });
    }

    // Vérifier la structure des données
    if (!item.data || Object.keys(item.data).length === 0) {
      errors.push({
        id: crypto.randomUUID(),
        approval_item_id: item.id,
        error_type: 'format',
        severity: 'critical',
        field_path: 'data',
        error_code: 'EMPTY_DATA',
        error_message: 'Les données sont vides ou manquantes',
        suggested_fix: 'Veuillez fournir les données à approuver',
        is_resolved: false,
        created_at: new Date().toISOString()
      });
    }

    return errors;
  }

  /**
   * Validation du contenu
   */
  private static async validateContent(item: ApprovalItem): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Vérifier la longueur du contenu
    if (item.data.content && typeof item.data.content === 'string') {
      if (item.data.content.length < 10) {
        errors.push({
          id: crypto.randomUUID(),
          approval_item_id: item.id,
          error_type: 'content',
          severity: 'medium',
          field_path: 'data.content',
          error_code: 'CONTENT_TOO_SHORT',
          error_message: 'Le contenu est trop court',
          suggested_fix: 'Veuillez fournir un contenu plus détaillé',
          is_resolved: false,
          created_at: new Date().toISOString()
        });
      }

      // Vérifier la présence de caractères suspects
      const suspiciousChars = /[<>{}]/g;
      if (suspiciousChars.test(item.data.content)) {
        errors.push({
          id: crypto.randomUUID(),
          approval_item_id: item.id,
          error_type: 'content',
          severity: 'medium',
          field_path: 'data.content',
          error_code: 'SUSPICIOUS_CHARACTERS',
          error_message: 'Le contenu contient des caractères suspects',
          suggested_fix: 'Veuillez vérifier et nettoyer le contenu',
          is_resolved: false,
          created_at: new Date().toISOString()
        });
      }
    }

    return errors;
  }

  /**
   * Validation des métadonnées
   */
  private static async validateMetadata(item: ApprovalItem): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Vérifier les dates
    if (item.data.date) {
      const date = new Date(item.data.date);
      const now = new Date();
      
      if (isNaN(date.getTime())) {
        errors.push({
          id: crypto.randomUUID(),
          approval_item_id: item.id,
          error_type: 'metadata',
          severity: 'high',
          field_path: 'data.date',
          error_code: 'INVALID_DATE',
          error_message: 'Format de date invalide',
          suggested_fix: 'Veuillez utiliser un format de date valide (YYYY-MM-DD)',
          is_resolved: false,
          created_at: new Date().toISOString()
        });
      } else if (date > now) {
        errors.push({
          id: crypto.randomUUID(),
          approval_item_id: item.id,
          error_type: 'metadata',
          severity: 'medium',
          field_path: 'data.date',
          error_code: 'FUTURE_DATE',
          error_message: 'La date ne peut pas être dans le futur',
          suggested_fix: 'Veuillez vérifier la date du document',
          is_resolved: false,
          created_at: new Date().toISOString()
        });
      }
    }

    // Vérifier la wilaya
    if (item.data.wilaya_code && typeof item.data.wilaya_code === 'string') {
      const { data: wilaya } = await supabase
        .from('wilayas')
        .select('code')
        .eq('code', item.data.wilaya_code)
        .maybeSingle();

      if (!wilaya) {
        errors.push({
          id: crypto.randomUUID(),
          approval_item_id: item.id,
          error_type: 'metadata',
          severity: 'high',
          field_path: 'data.wilaya_code',
          error_code: 'INVALID_WILAYA',
          error_message: 'Code wilaya invalide',
          suggested_fix: 'Veuillez sélectionner une wilaya valide',
          is_resolved: false,
          created_at: new Date().toISOString()
        });
      }
    }

    return errors;
  }

  /**
   * Détection de doublons
   */
  private static async detectDuplicates(item: ApprovalItem): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    if (item.data.title && item.data.date) {
      const { data: duplicates } = await supabase
        .from('legal_texts')
        .select('id, title')
        .eq('title', item.data.title)
        .eq('date', item.data.date)
        .neq('id', item.legal_text_id || '00000000-0000-0000-0000-000000000000');

      if (duplicates && duplicates.length > 0) {
        errors.push({
          id: crypto.randomUUID(),
          approval_item_id: item.id,
          error_type: 'duplicate',
          severity: 'high',
          field_path: 'data.title',
          error_code: 'DUPLICATE_DOCUMENT',
          error_message: `Document potentiellement dupliqué trouvé: ${duplicates[0].title}`,
          suggested_fix: 'Veuillez vérifier s\'il ne s\'agit pas d\'un doublon',
          is_resolved: false,
          created_at: new Date().toISOString()
        });
      }
    }

    return errors;
  }

  /**
   * Validation de la classification
   */
  private static async validateClassification(item: ApprovalItem): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Vérifier la cohérence de la classification
    if (item.data.sector && item.data.category) {
      // Vérifications de cohérence secteur/catégorie
      const inconsistentCombinations = [
        { sector: 'santé', category: 'transport' },
        { sector: 'éducation', category: 'environnement' }
        // Ajouter d'autres combinaisons incohérentes
      ];

      const isInconsistent = inconsistentCombinations.some(combo => 
        item.data.sector?.toLowerCase().includes(combo.sector) && 
        item.data.category?.toLowerCase().includes(combo.category)
      );

      if (isInconsistent) {
        errors.push({
          id: crypto.randomUUID(),
          approval_item_id: item.id,
          error_type: 'classification',
          severity: 'medium',
          field_path: 'data.classification',
          error_code: 'INCONSISTENT_CLASSIFICATION',
          error_message: 'Classification incohérente entre secteur et catégorie',
          suggested_fix: 'Veuillez vérifier la classification du document',
          is_resolved: false,
          created_at: new Date().toISOString()
        });
      }
    }

    return errors;
  }

  /**
   * Validation de la conformité légale
   */
  private static async validateLegalCompliance(item: ApprovalItem): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Vérifier les références légales
    if (item.data.content && typeof item.data.content === 'string') {
      const legalReferences = item.data.content.match(/loi\s+n°?\s*\d+/gi) || [];
      
      // Vérifier le format des références
      for (const ref of legalReferences) {
        if (!/loi\s+n°?\s*\d{2}-\d{2}/i.test(ref)) {
          errors.push({
            id: crypto.randomUUID(),
            approval_item_id: item.id,
            error_type: 'legal_compliance',
            severity: 'medium',
            field_path: 'data.content',
            error_code: 'INVALID_LEGAL_REFERENCE',
            error_message: `Référence légale mal formatée: ${ref}`,
            suggested_fix: 'Veuillez vérifier le format des références légales (ex: Loi n° 20-01)',
            is_resolved: false,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    return errors;
  }

  /**
   * Enregistre les erreurs de validation en base
   */
  private static async saveValidationErrors(approvalItemId: string, errors: ValidationError[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('validation_errors')
        .insert(errors.map(error => ({
          approval_item_id: approvalItemId,
          error_type: error.error_type,
          severity: error.severity,
          field_path: error.field_path,
          error_code: error.error_code,
          error_message: error.error_message,
          suggested_fix: error.suggested_fix,
          is_resolved: false
        })));

      if (error) throw error;

    } catch (error) {
      secureLog.error('Erreur lors de l\'enregistrement des erreurs de validation', error);
      throw error;
    }
  }

  /**
   * Marque une erreur comme résolue
   */
  static async resolveError(errorId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('validation_errors')
        .update({ is_resolved: true })
        .eq('id', errorId);

      if (error) throw error;

      secureLog.info('Erreur de validation résolue', { errorId });

    } catch (error) {
      secureLog.error('Erreur lors de la résolution de l\'erreur', error);
      throw error;
    }
  }
}