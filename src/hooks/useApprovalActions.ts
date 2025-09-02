
import { useState } from 'react';
import { MappingResult } from '@/types/mapping';
import { validationService } from '@/services/validation/validationService';
import { approvalItemService } from '@/services/approval/approvalItemService';
import { useToast } from '@/hooks/use-toast';

export function useApprovalActions() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  /**
   * Examen approfondi d'un élément avec diagnostic complet
   */
  const handleExamine = (itemId: string, itemTitle: string, mappingResult?: MappingResult, extractedText?: string) => {
    console.log('Examen de l\'élément:', itemId, itemTitle);
    
    if (mappingResult && extractedText) {
      // Création d'un item d'approbation avec validation complète
      const validationResult = validationService.validateMappingResult(mappingResult, extractedText);
      const approvalItem = approvalItemService.createApprovalItem(mappingResult, validationResult, extractedText);
      
      // Ouvrir le workflow d'approbation
      const event = new CustomEvent('open-approval-workflow', {
        detail: {
          type: 'detailed_examination',
          title: `Examen détaillé: ${itemTitle}`,
          approvalItem,
          mode: 'examination'
        }
      });
      window.dispatchEvent(event);
    } else {
      // Fallback vers l'ancien comportement
      const event = new CustomEvent('open-modal', {
        detail: {
          type: 'examine',
          title: `Examen: ${itemTitle}`,
          data: { itemId, itemTitle }
        }
      });
      window.dispatchEvent(event);
    }
  };

  /**
   * Approbation avec workflow complet
   */
  const handleApprove = async (itemId: string, itemTitle: string, mappingResult?: MappingResult, extractedText?: string) => {
    console.log('Approbation:', itemId, itemTitle);
    setIsProcessing(true);

    try {
      if (mappingResult && extractedText) {
        // Validation avant approbation
        const validationResult = validationService.validateMappingResult(mappingResult, extractedText);
        
        if (!validationResult.readyForApproval) {
          toast({
            title: "Validation requise",
            description: "Ce document nécessite une validation manuelle avant approbation",
            variant: "destructive"
          });
          
          // Créer un item d'approbation et l'ajouter à la queue
          const approvalItem = approvalItemService.createApprovalItem(mappingResult, validationResult, extractedText);
          
          // Ouvrir le workflow d'approbation
          const event = new CustomEvent('open-approval-workflow', {
            detail: {
              type: 'validation_required',
              title: `Validation requise: ${itemTitle}`,
              approvalItem,
              mode: 'validation'
            }
          });
          window.dispatchEvent(event);
          
          return;
        }

        // Approbation automatique si validation OK
        const approvalItem = approvalItemService.createApprovalItem(mappingResult, validationResult, extractedText);
        const success = approvalItemService.approveItem(approvalItem.id, 'system', 'Approbation automatique - validation passée');
        
        if (success) {
          toast({
            title: "Document approuvé",
            description: `"${itemTitle}" a été approuvé automatiquement`,
          });
        }
      } else {
        // Fallback vers l'ancien comportement
        if (confirm(`Approuver "${itemTitle}" ?`)) {
          setTimeout(() => {
            toast({
              title: "Document approuvé",
              description: `"${itemTitle}" approuvé avec succès`,
            });
          }, 1000);
        }
      }
    } catch (error) {
      toast({
        title: "Erreur d'approbation",
        description: "Une erreur s'est produite lors de l'approbation",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Rejet avec workflow complet
   */
  const handleReject = async (itemId: string, itemTitle: string, mappingResult?: MappingResult, extractedText?: string) => {
    console.log('Rejet:', itemId, itemTitle);
    
    const reason = prompt(`Raison du rejet de "${itemTitle}" :`);
    if (!reason) return;

    setIsProcessing(true);

    try {
      if (mappingResult && extractedText) {
        // Créer un item de rejet avec raison
        const validationResult = validationService.validateMappingResult(mappingResult, extractedText);
        const approvalItem = approvalItemService.createApprovalItem(mappingResult, validationResult, extractedText);
        const success = approvalItemService.rejectItem(approvalItem.id, 'user', reason);
        
        if (success) {
          toast({
            title: "Document rejeté",
            description: `"${itemTitle}" a été rejeté`,
          });
        }
      } else {
        // Fallback vers l'ancien comportement
        setTimeout(() => {
          toast({
            title: "Document rejeté",
            description: `"${itemTitle}" rejeté: ${reason}`,
          });
        }, 1000);
      }
    } catch (error) {
      toast({
        title: "Erreur de rejet",
        description: "Une erreur s'est produite lors du rejet",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Système de favoris amélioré
   */
  const handleLike = (itemId: string, itemTitle: string) => {
    console.log('Like/Favoris:', itemId, itemTitle);
    const liked = localStorage.getItem(`liked_${itemId}`) === 'true';
    localStorage.setItem(`liked_${itemId}`, (!liked).toString());
    
    toast({
      title: liked ? 'Retiré des favoris' : 'Ajouté aux favoris',
      description: `"${itemTitle}" ${liked ? 'retiré des' : 'ajouté aux'} favoris`,
    });
  };

  /**
   * Ouverture du workflow d'approbation global
   */
  const openApprovalWorkflow = () => {
    const event = new CustomEvent('open-approval-workflow', {
      detail: {
        type: 'workflow_interface',
        title: 'File d\'Attente d\'Approbation',
        mode: 'full_workflow'
      }
    });
    window.dispatchEvent(event);
  };

  return {
    handleExamine,
    handleApprove,
    handleReject,
    handleLike,
    openApprovalWorkflow,
    isProcessing
  };
}
