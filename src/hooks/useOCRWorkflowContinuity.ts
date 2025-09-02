/**
 * Hook pour la gestion de la continuité des données OCR entre les onglets
 * Intègre avec Supabase pour la persistance des données réelles
 */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ApprovalWorkflowService } from '@/services/approvalWorkflowService';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export interface OCRWorkflowData {
  // Extraction data
  extractionId?: string;
  selectedFile?: File;
  extractedText?: {
    content: string;
    confidence: number;
    language: string;
    pages: number;
  };
  extractedDocument?: any;
  
  // Mapping data
  mappingId?: string;
  mappedData?: any;
  mappingResult?: any;
  
  // Validation data
  approvalItem?: any;
  validationResults?: any;
  validationErrors?: string[];
  
  // Analytics data
  analyticsData?: any;
}

export interface OCRWorkflowState {
  data: OCRWorkflowData;
  isLoading: boolean;
  error: string | null;
  activeTab: string;
  completedTabs: Record<string, boolean>;
}

export const useOCRWorkflowContinuity = () => {
  const [state, setState] = useState<OCRWorkflowState>({
    data: {},
    isLoading: false,
    error: null,
    activeTab: 'extraction',
    completedTabs: {
      extraction: false,
      mapping: false,
      validation: false,
      results: false
    }
  });

  // Charger les données existantes de l'utilisateur
  const loadUserData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('OCR', 'Utilisateur non connecté - mode hors ligne');
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Charger la dernière extraction en cours
      const { data: extractions, error: extractionError } = await supabase
        .from('ocr_extractions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (extractionError) {
        throw extractionError;
      }

      if (extractions && extractions.length > 0) {
        const latest = extractions[0];
        
        // Charger le mapping associé s'il existe
        const { data: mappings } = await supabase
          .from('ocr_mappings')
          .select('*')
          .eq('extraction_id', latest.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Charger les items d'approbation associés s'ils existent
        const { data: approvals } = await supabase
          .from('ocr_approval_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const loadedData: OCRWorkflowData = {
          extractionId: latest.id,
          extractedText: {
            content: latest.extracted_text || '',
            confidence: parseFloat(String(latest.confidence_score || 0)),
            language: latest.language_detected || 'fr',
            pages: latest.total_pages || 1
          },
          extractedDocument: {
            id: latest.id,
            originalFilename: latest.original_filename,
            fileType: latest.file_type,
            totalPages: latest.total_pages,
            extractedText: latest.extracted_text,
            textRegions: latest.text_regions,
            metadata: latest.metadata,
            confidence: parseFloat(String(latest.confidence_score || 0)),
            processingStatus: latest.processing_status
          }
        };

        // Ajouter les données de mapping si disponibles
        if (mappings && mappings.length > 0) {
          const mapping = mappings[0];
          loadedData.mappingId = mapping.id;
          loadedData.mappedData = mapping.mapped_data;
          loadedData.mappingResult = {
            id: mapping.id,
            extractionId: mapping.extraction_id,
            formType: mapping.form_type,
            mappedData: mapping.mapped_data,
            mappedFields: mapping.mapped_fields,
            unmappedFields: mapping.unmapped_fields,
            overallConfidence: (mapping.confidence_scores as any)?.overall || 0,
            validationErrors: mapping.validation_errors || []
          };
        }

        // Ajouter les données d'approbation si disponibles
        if (approvals && approvals.length > 0) {
          const approval = approvals[0];
          loadedData.approvalItem = {
            id: approval.id,
            status: approval.status,
            content: approval.content,
            reviewNotes: approval.review_notes,
            priority: approval.priority
          };
        }

        setState(prev => ({
          ...prev,
          data: loadedData,
          completedTabs: {
            extraction: true,
            mapping: !!mappings?.length,
            validation: !!approvals?.length,
            results: false
          },
          isLoading: false
        }));

        logger.info('OCR', 'Données utilisateur chargées', { 
          extractionId: latest.id,
          hasMappings: !!mappings?.length,
          hasApprovals: !!approvals?.length
        });
      }
      
    } catch (error) {
      logger.error('OCR', 'Erreur lors du chargement des données', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Erreur lors du chargement des données utilisateur',
        isLoading: false 
      }));
    }
  }, []);

  // Sauvegarder les données d'extraction
  const saveExtractionData = useCallback(async (extractionData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Mode hors ligne - sauvegarder localement
        setState(prev => ({
          ...prev,
          data: {
            ...prev.data,
            extractionId: 'offline-' + Date.now(),
            extractedDocument: extractionData,
            extractedText: {
              content: extractionData.extractedText || '',
              confidence: extractionData.confidence || 0,
              language: extractionData.languageDetected || 'fr',
              pages: extractionData.totalPages || 1
            }
          },
          completedTabs: {
            ...prev.completedTabs,
            extraction: true
          }
        }));
        
        toast.success('Données d\'extraction sauvegardées (mode hors ligne)');
        logger.info('OCR', 'Extraction sauvegardée hors ligne');
        return 'offline-' + Date.now();
      }

      const { data, error } = await supabase
        .from('ocr_extractions')
        .insert({
          user_id: user.id,
          original_filename: extractionData.originalFilename,
          file_type: extractionData.fileType,
          total_pages: extractionData.totalPages,
          extracted_text: extractionData.extractedText,
          text_regions: extractionData.textRegions,
          metadata: extractionData.metadata,
          processing_status: 'completed',
          confidence_score: extractionData.confidence,
          language_detected: extractionData.languageDetected || 'fr',
          is_mixed_language: extractionData.isMixedLanguage || false
        })
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          extractionId: data.id,
          extractedDocument: extractionData
        },
        completedTabs: {
          ...prev.completedTabs,
          extraction: true
        }
      }));

      toast.success('Données d\'extraction sauvegardées');
      logger.info('OCR', 'Extraction sauvegardée', { id: data.id });
      
      return data.id;
    } catch (error) {
      logger.error('OCR', 'Erreur sauvegarde extraction - fallback hors ligne', error);
      // Fallback hors ligne: marquer l'extraction comme complétée localement
      const offlineId = 'offline-' + Date.now();
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          extractionId: offlineId,
          extractedDocument: extractionData,
          extractedText: {
            content: extractionData.extractedText || '',
            confidence: extractionData.confidence || 0,
            language: extractionData.languageDetected || 'fr',
            pages: extractionData.totalPages || 1
          }
        },
        completedTabs: {
          ...prev.completedTabs,
          extraction: true
        }
      }));
      toast.warning('Sauvegarde distante indisponible - données conservées en local');
      return offlineId;
    }
  }, []);

  // Sauvegarder les données de mapping
  const saveMappingData = useCallback(async (mappingData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !state.data.extractionId) {
        // Mode hors ligne
        if (!state.data.extractionId) {
          throw new Error('Données d\'extraction manquantes');
        }
        
        setState(prev => ({
          ...prev,
          data: {
            ...prev.data,
            mappingId: 'offline-mapping-' + Date.now(),
            mappedData: mappingData.mappedData,
            mappingResult: mappingData
          },
          completedTabs: {
            ...prev.completedTabs,
            mapping: true
          }
        }));

        toast.success('Données de mapping sauvegardées (mode hors ligne)');
        logger.info('OCR', 'Mapping sauvegardé hors ligne');
        return 'offline-mapping-' + Date.now();
      }

      const { data, error } = await supabase
        .from('ocr_mappings')
        .insert({
          extraction_id: state.data.extractionId,
          form_type: mappingData.formType || 'legal-text',
          mapped_data: mappingData.mappedData,
          mapped_fields: mappingData.mappedFields,
          unmapped_fields: mappingData.unmappedFields,
          confidence_scores: { overall: mappingData.overallConfidence },
          validation_errors: mappingData.validationErrors,
          mapping_status: 'validated'
        })
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          mappingId: data.id,
          mappedData: mappingData.mappedData,
          mappingResult: mappingData
        },
        completedTabs: {
          ...prev.completedTabs,
          mapping: true
        }
      }));

      toast.success('Données de mapping sauvegardées');
      logger.info('OCR', 'Mapping sauvegardé', { id: data.id });
      
      return data.id;
    } catch (error) {
      logger.error('OCR', 'Erreur sauvegarde mapping - fallback hors ligne', error);
      const offlineId = 'offline-mapping-' + Date.now();
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          mappingId: offlineId,
          mappedData: mappingData.mappedData,
          mappingResult: mappingData
        },
        completedTabs: {
          ...prev.completedTabs,
          mapping: true
        }
      }));
      toast.warning('Sauvegarde du mapping en local (mode hors ligne)');
      return offlineId;
    }
  }, [state.data.extractionId]);

  // Sauvegarder les données de validation
  const saveValidationData = useCallback(async (validationData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !state.data.mappingId) {
        // Mode hors ligne
        if (!state.data.mappingId) {
          throw new Error('Données de mapping manquantes');
        }
        
        setState(prev => ({
          ...prev,
          data: {
            ...prev.data,
            approvalItem: validationData,
            validationResults: validationData
          },
          completedTabs: {
            ...prev.completedTabs,
            validation: true
          }
        }));

        toast.success('Données de validation sauvegardées (mode hors ligne)');
        logger.info('OCR', 'Validation sauvegardée hors ligne');
        return 'offline-validation-' + Date.now();
      }

      // Unifier via le service d'approbation central (table approval_items)
      const approvalItem = await ApprovalWorkflowService.submitForApproval(
        'mapping_result',
        'Résultat de mapping',
        'Résultat de mapping pour validation',
        validationData?.content || state.data.mappingResult?.mappedData || {},
        state.data.mappingResult || {},
        'medium'
      );

      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          approvalItem: approvalItem,
          validationResults: approvalItem
        },
        completedTabs: {
          ...prev.completedTabs,
          validation: true
        }
      }));

      toast.success('Données de validation sauvegardées');
      logger.info('OCR', 'Validation sauvegardée');
      
      return approvalItem?.id || 'approval-item-created';
    } catch (error) {
      logger.error('OCR', 'Erreur sauvegarde validation - fallback hors ligne', error);
      const offlineId = 'offline-validation-' + Date.now();
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          approvalItem: validationData,
          validationResults: validationData
        },
        completedTabs: {
          ...prev.completedTabs,
          validation: true
        }
      }));
      toast.warning('Validation conservée en local (mode hors ligne)');
      return offlineId;
    }
  }, [state.data.mappingId, state.data.extractedText]);

  // Mettre à jour l'onglet actif
  const setActiveTab = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // Mettre à jour les données localement
  const updateWorkflowData = useCallback((updates: Partial<OCRWorkflowData>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates }
    }));
  }, []);

  // Compléter le mapping et passer à la validation
  const completeMapping = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeTab: 'validation',
      completedTabs: {
        ...prev.completedTabs,
        mapping: true
      }
    }));
  }, []);

  // Compléter la validation et passer aux résultats
  const completeValidation = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeTab: 'results',
      completedTabs: {
        ...prev.completedTabs,
        validation: true
      }
    }));
  }, []);

  // Effacer les données (nouveau workflow)
  const clearWorkflowData = useCallback(() => {
    setState({
      data: {},
      isLoading: false,
      error: null,
      activeTab: 'extraction',
      completedTabs: {
        extraction: false,
        mapping: false,
        validation: false,
        results: false
      }
    });
  }, []);

  // Charger les données au montage
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    ...state,
    loadUserData,
    saveExtractionData,
    saveMappingData,
    saveValidationData,
    setActiveTab,
    updateWorkflowData,
    clearWorkflowData,
    completeMapping,
    completeValidation
  };
};