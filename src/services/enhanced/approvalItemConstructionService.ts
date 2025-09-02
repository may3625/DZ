/**
 * Service de construction d'items d'approbation
 * Phase 3 - Construction des Items d'Approbation - Finalisation
 */

import { MappingResult } from '@/types/mapping';
import { ValidationResult } from '@/services/validation/validationService';
import { ApprovalItem } from '@/types/approval';

export interface ApprovalItemConstructionConfig {
  enableCompactFormat: boolean;
  includeOriginalData: boolean;
  enablePreviewGeneration: boolean;
  priorityCalculationMethod: 'confidence' | 'errors' | 'hybrid';
}

export interface CompactApprovalFormat {
  id: string;
  title: string;
  summary: {
    fieldsCount: number;
    mappedCount: number;
    confidence: number;
    criticalIssues: number;
  };
  preview: {
    keyFields: Array<{
      name: string;
      value: string;
      confidence: number;
    }>;
    content: string;
  };
  metadata: {
    formType: string;
    documentType: string;
    extractionMethod: string;
    processingDate: string;
  };
}

class ApprovalItemConstructionService {
  private config: ApprovalItemConstructionConfig = {
    enableCompactFormat: true,
    includeOriginalData: true,
    enablePreviewGeneration: true,
    priorityCalculationMethod: 'hybrid'
  };

  /**
   * Construction complète d'un item d'approbation
   */
  createApprovalItem(
    mappingResult: MappingResult,
    validationResult: ValidationResult,
    extractedText: string,
    originalDocument?: any
  ): ApprovalItem {
    console.log('🏗️ Construction d\'un item d\'approbation');

    const id = this.generateUniqueId();
    const title = this.generateTitle(mappingResult);
    const priority = this.calculatePriority(mappingResult, validationResult);
    
    // Format JSON compact pour l'approbation
    const compactFormat = this.generateCompactFormat(
      mappingResult,
      validationResult,
      extractedText
    );
    
    // Génération du contenu d'aperçu
    const previewContent = this.generatePreviewContent(
      mappingResult,
      extractedText
    );

    const approvalItem: ApprovalItem = {
      id,
      legal_text_id: mappingResult.formId,
      item_type: 'mapping_result',
      title,
      description: this.generateDescription(mappingResult, validationResult),
      data: {
        mappingResult,
        validationResult,
        extractedText: this.config.includeOriginalData ? extractedText : null,
        compactFormat,
        previewContent,
        originalDocument: this.config.includeOriginalData ? originalDocument : null
      },
      original_data: originalDocument,
      status: 'pending',
      priority,
      submitted_by: 'ocr_system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: this.calculateDueDate(priority),
      validation_errors: this.convertValidationIssues(validationResult.issues),
      
      // Propriétés de compatibilité
      overallConfidence: mappingResult.overallConfidence,
      mappedFields: mappingResult.mappedFields,
      submittedAt: new Date(),
      originalDocument,
      mappingResults: mappingResult,
      processingMetadata: {
        extractionMethod: 'intelligent_mapping',
        processingTime: Date.now(),
        qualityScore: validationResult.score,
        automaticMapping: true
      },
      createdAt: new Date().toISOString(),
      comments: []
    };

    console.log(`✅ Item d'approbation créé: ${title} (priorité: ${priority})`);
    
    return approvalItem;
  }

  /**
   * Génération du format JSON compact
   */
  private generateCompactFormat(
    mappingResult: MappingResult,
    validationResult: ValidationResult,
    extractedText: string
  ): CompactApprovalFormat {
    
    const keyFields = this.extractKeyFields(mappingResult);
    const preview = this.generateContentPreview(extractedText, mappingResult);
    
    return {
      id: this.generateUniqueId(),
      title: this.generateTitle(mappingResult),
      summary: {
        fieldsCount: mappingResult.totalFields,
        mappedCount: mappingResult.mappedCount,
        confidence: Math.round(mappingResult.overallConfidence),
        criticalIssues: validationResult.issues.filter(i => i.severity === 'critical').length
      },
      preview: {
        keyFields,
        content: preview
      },
      metadata: {
        formType: mappingResult.formType,
        documentType: this.detectDocumentType(extractedText),
        extractionMethod: 'intelligent_ocr_mapping',
        processingDate: new Date().toISOString()
      }
    };
  }

  /**
   * Extraction des champs clés pour l'aperçu
   */
  private extractKeyFields(mappingResult: MappingResult): Array<{
    name: string;
    value: string;
    confidence: number;
  }> {
    
    // Champs prioritaires à afficher
    const priorityFields = [
      'title', 'titre', 'nom', 'name',
      'date', 'numero', 'number', 'reference',
      'type', 'statut', 'status'
    ];
    
    const keyFields = [];
    
    // Extraire d'abord les champs prioritaires
    for (const priority of priorityFields) {
      const field = mappingResult.mappedFields.find(f => 
        f.fieldName.toLowerCase().includes(priority) && f.mappedValue
      );
      
      if (field && keyFields.length < 5) {
        keyFields.push({
          name: field.fieldLabel || field.fieldName,
          value: String(field.mappedValue).substring(0, 50),
          confidence: Math.round(field.confidence * 100)
        });
      }
    }
    
    // Compléter avec d'autres champs si nécessaire
    if (keyFields.length < 3) {
      const otherFields = mappingResult.mappedFields
        .filter(f => f.mappedValue && !keyFields.some(kf => kf.name === f.fieldLabel))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3 - keyFields.length);
      
      for (const field of otherFields) {
        keyFields.push({
          name: field.fieldLabel || field.fieldName,
          value: String(field.mappedValue).substring(0, 50),
          confidence: Math.round(field.confidence * 100)
        });
      }
    }
    
    return keyFields;
  }

  /**
   * Génération de l'aperçu du contenu
   */
  private generateContentPreview(extractedText: string, mappingResult: MappingResult): string {
    // Extraire les premières lignes significatives
    const lines = extractedText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 10);
    
    let preview = lines.slice(0, 3).join('\n');
    
    // Ajouter des informations de mapping
    const mappedInfo = `\n\n📊 Mapping: ${mappingResult.mappedCount}/${mappingResult.totalFields} champs (${Math.round(mappingResult.overallConfidence)}% confiance)`;
    
    // Limiter la longueur
    const maxLength = 300;
    if (preview.length > maxLength) {
      preview = preview.substring(0, maxLength) + '...';
    }
    
    return preview + mappedInfo;
  }

  /**
   * Génération du contenu d'aperçu pour l'affichage
   */
  private generatePreviewContent(
    mappingResult: MappingResult,
    extractedText: string
  ): string {
    
    const sections = [];
    
    // Section résumé
    sections.push(`📋 RÉSUMÉ DU DOCUMENT`);
    sections.push(`Type: ${mappingResult.formType}`);
    sections.push(`Champs mappés: ${mappingResult.mappedCount}/${mappingResult.totalFields}`);
    sections.push(`Confiance globale: ${Math.round(mappingResult.overallConfidence)}%`);
    sections.push('');
    
    // Section champs clés
    const keyFields = this.extractKeyFields(mappingResult);
    if (keyFields.length > 0) {
      sections.push(`🔑 CHAMPS CLÉS`);
      for (const field of keyFields) {
        sections.push(`• ${field.name}: ${field.value} (${field.confidence}%)`);
      }
      sections.push('');
    }
    
    // Section aperçu du texte
    sections.push(`📄 APERÇU DU CONTENU`);
    const textPreview = extractedText.substring(0, 200);
    sections.push(textPreview + (extractedText.length > 200 ? '...' : ''));
    
    return sections.join('\n');
  }

  /**
   * Calcul de la priorité basé sur la méthode configurée
   */
  private calculatePriority(
    mappingResult: MappingResult,
    validationResult: ValidationResult
  ): 'low' | 'medium' | 'high' | 'urgent' {
    
    switch (this.config.priorityCalculationMethod) {
      case 'confidence':
        return this.calculatePriorityByConfidence(mappingResult.overallConfidence);
      
      case 'errors':
        return this.calculatePriorityByErrors(validationResult);
      
      case 'hybrid':
      default:
        return this.calculatePriorityHybrid(mappingResult, validationResult);
    }
  }

  /**
   * Calcul de priorité basé sur la confiance
   */
  private calculatePriorityByConfidence(confidence: number): 'low' | 'medium' | 'high' | 'urgent' {
    if (confidence >= 85) return 'low';
    if (confidence >= 70) return 'medium';
    if (confidence >= 50) return 'high';
    return 'urgent';
  }

  /**
   * Calcul de priorité basé sur les erreurs
   */
  private calculatePriorityByErrors(validationResult: ValidationResult): 'low' | 'medium' | 'high' | 'urgent' {
    const criticalErrors = validationResult.issues.filter(i => i.severity === 'critical').length;
    const highErrors = validationResult.issues.filter(i => i.severity === 'high').length;
    
    if (criticalErrors > 0) return 'urgent';
    if (highErrors > 2) return 'high';
    if (validationResult.issues.length > 3) return 'medium';
    return 'low';
  }

  /**
   * Calcul de priorité hybride
   */
  private calculatePriorityHybrid(
    mappingResult: MappingResult,
    validationResult: ValidationResult
  ): 'low' | 'medium' | 'high' | 'urgent' {
    
    const confidencePriority = this.calculatePriorityByConfidence(mappingResult.overallConfidence);
    const errorsPriority = this.calculatePriorityByErrors(validationResult);
    
    // Prendre la priorité la plus élevée
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const maxPriorityIndex = Math.max(
      priorities.indexOf(confidencePriority),
      priorities.indexOf(errorsPriority)
    );
    
    return priorities[maxPriorityIndex] as 'low' | 'medium' | 'high' | 'urgent';
  }

  /**
   * Génération d'un titre descriptif
   */
  private generateTitle(mappingResult: MappingResult): string {
    // Rechercher un champ titre dans les données mappées
    const titleField = mappingResult.mappedFields.find(f => 
      ['title', 'titre', 'nom', 'name'].some(key => 
        f.fieldName.toLowerCase().includes(key)
      ) && f.mappedValue
    );
    
    if (titleField && titleField.mappedValue) {
      const title = String(titleField.mappedValue).substring(0, 80);
      return title || `Document ${mappingResult.formType}`;
    }
    
    // Titre par défaut basé sur le type
    const formTypeLabel = this.getFormTypeLabel(mappingResult.formType);
    return `${formTypeLabel} - ${new Date().toLocaleDateString()}`;
  }

  /**
   * Génération d'une description
   */
  private generateDescription(
    mappingResult: MappingResult,
    validationResult: ValidationResult
  ): string {
    
    const elements = [];
    
    elements.push(`Document de type "${mappingResult.formType}"`);
    elements.push(`${mappingResult.mappedCount} champs extraits sur ${mappingResult.totalFields}`);
    
    if (validationResult.issues.length > 0) {
      const criticalCount = validationResult.issues.filter(i => i.severity === 'critical').length;
      if (criticalCount > 0) {
        elements.push(`⚠️ ${criticalCount} problème(s) critique(s) détecté(s)`);
      }
    }
    
    elements.push(`Confiance: ${Math.round(mappingResult.overallConfidence)}%`);
    
    return elements.join(' • ');
  }

  /**
   * Calcul de la date d'échéance
   */
  private calculateDueDate(priority: string): string {
    const now = new Date();
    let daysToAdd = 7; // Par défaut
    
    switch (priority) {
      case 'urgent':
        daysToAdd = 1;
        break;
      case 'high':
        daysToAdd = 3;
        break;
      case 'medium':
        daysToAdd = 5;
        break;
      case 'low':
        daysToAdd = 10;
        break;
    }
    
    now.setDate(now.getDate() + daysToAdd);
    return now.toISOString();
  }

  /**
   * Conversion des issues de validation
   */
  private convertValidationIssues(issues: any[]): any[] {
    return issues.map(issue => ({
      id: this.generateUniqueId(),
      approval_item_id: '', // Sera défini plus tard
      error_type: this.mapValidationTypeToErrorType(issue.type),
      severity: this.mapSeverityLevel(issue.severity),
      field_path: issue.fieldName || issue.field,
      error_code: issue.type.toUpperCase(),
      error_message: issue.message,
      suggested_fix: Array.isArray(issue.suggestions) ? issue.suggestions[0] : issue.suggestion,
      is_resolved: false,
      created_at: new Date().toISOString()
    }));
  }

  /**
   * Détection du type de document
   */
  private detectDocumentType(extractedText: string): string {
    const text = extractedText.toLowerCase();
    
    if (text.includes('arrêté') || text.includes('décret')) return 'legal_document';
    if (text.includes('facture') || text.includes('devis')) return 'commercial_document';
    if (text.includes('demande') || text.includes('formulaire')) return 'form';
    if (text.includes('rapport') || text.includes('compte rendu')) return 'report';
    
    return 'general_document';
  }

  /**
   * Utilitaires privés
   */
  private generateUniqueId(): string {
    return `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getFormTypeLabel(formType: string): string {
    const labels: Record<string, string> = {
      'loi': 'Loi',
      'decret': 'Décret',
      'arrete': 'Arrêté',
      'circulaire': 'Circulaire',
      'instruction': 'Instruction',
      'decision': 'Décision'
    };
    
    return labels[formType] || formType;
  }

  private mapValidationTypeToErrorType(type: string): string {
    const mapping: Record<string, string> = {
      'low_confidence': 'content',
      'missing_field': 'metadata',
      'invalid_format': 'format',
      'incomplete_mapping': 'content',
      'inconsistency': 'content'
    };
    
    return mapping[type] || 'content';
  }

  private mapSeverityLevel(severity: string): string {
    const mapping: Record<string, string> = {
      'critical': 'critical',
      'warning': 'medium',
      'info': 'low',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    };
    
    return mapping[severity] || 'medium';
  }

  /**
   * Configuration du service
   */
  updateConfig(config: Partial<ApprovalItemConstructionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): ApprovalItemConstructionConfig {
    return { ...this.config };
  }
}

export const approvalItemConstructionService = new ApprovalItemConstructionService();
export default approvalItemConstructionService;