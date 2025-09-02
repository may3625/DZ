/**
 * Contexte pour le système de modales unifié
 * Gestion centralisée et optimisée
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ModalConfig, ModalContextType, ModalProviderProps } from './types';
import { logger } from '@/utils/logger';

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<ModalProviderProps> = ({ 
  children, 
  maxConcurrentModals = 3 
}) => {
  const [modals, setModals] = useState<ModalConfig[]>([]);

  const openModal = useCallback((config: ModalConfig) => {
    logger.info('UI', 'Modal ouverture demandée', { 
      modalId: config.id, 
      type: config.type,
      title: config.title 
    }, 'ModalProvider');

    setModals(prevModals => {
      // Vérifier si la modale existe déjà
      const existingIndex = prevModals.findIndex(modal => modal.id === config.id);
      
      if (existingIndex !== -1) {
        // Mettre à jour la modale existante
        const updatedModals = [...prevModals];
        updatedModals[existingIndex] = config;
        logger.info('UI', 'Modal mise à jour', { modalId: config.id }, 'ModalProvider');
        return updatedModals;
      }

      // Limiter le nombre de modales concurrentes
      if (prevModals.length >= maxConcurrentModals) {
        logger.warn('UI', 'Limite de modales atteinte, fermeture de la plus ancienne', 
          { limit: maxConcurrentModals, currentCount: prevModals.length }, 'ModalProvider');
        return [...prevModals.slice(1), config];
      }

      logger.info('UI', 'Nouvelle modal ajoutée', { 
        modalId: config.id, 
        totalModals: prevModals.length + 1 
      }, 'ModalProvider');
      
      return [...prevModals, config];
    });
  }, [maxConcurrentModals]);

  // Écouter les événements globaux de modal pour l'interopérabilité
  React.useEffect(() => {
    const handleGlobalModalEvent = (event: CustomEvent) => {
      const config = event.detail;
      if (config && config.id && config.type && config.title) {
        openModal(config);
      }
    };

    window.addEventListener('open-unified-modal', handleGlobalModalEvent);
    
    return () => {
      window.removeEventListener('open-unified-modal', handleGlobalModalEvent);
    };
  }, [openModal]);

  const closeModal = useCallback((id: string) => {
    logger.info('UI', 'Modal fermeture demandée', { modalId: id }, 'ModalProvider');
    
    setModals(prevModals => {
      const modal = prevModals.find(m => m.id === id);
      if (modal && modal.onClose) {
        try {
          modal.onClose();
        } catch (error) {
          logger.error('UI', 'Erreur lors de la fermeture de modal', { 
            modalId: id, 
            error: error instanceof Error ? error.message : 'Erreur inconnue' 
          }, 'ModalProvider');
        }
      }
      
      const filteredModals = prevModals.filter(modal => modal.id !== id);
      logger.info('UI', 'Modal fermée', { 
        modalId: id, 
        remainingModals: filteredModals.length 
      }, 'ModalProvider');
      
      return filteredModals;
    });
  }, []);

  const closeAllModals = useCallback(() => {
    logger.info('UI', 'Fermeture de toutes les modales', { 
      count: modals.length 
    }, 'ModalProvider');
    
    // Appeler onClose pour chaque modale
    modals.forEach(modal => {
      if (modal.onClose) {
        try {
          modal.onClose();
        } catch (error) {
          logger.error('UI', 'Erreur lors de la fermeture de modal', { 
            modalId: modal.id, 
            error: error instanceof Error ? error.message : 'Erreur inconnue' 
          }, 'ModalProvider');
        }
      }
    });
    
    setModals([]);
  }, [modals]);

  const updateModal = useCallback((id: string, updates: Partial<ModalConfig>) => {
    logger.debug('UI', 'Modal mise à jour', { modalId: id, updates }, 'ModalProvider');
    
    setModals(prevModals => {
      const modalIndex = prevModals.findIndex(modal => modal.id === id);
      
      if (modalIndex === -1) {
        logger.warn('UI', 'Tentative de mise à jour d\'une modal inexistante', { modalId: id }, 'ModalProvider');
        return prevModals;
      }

      const updatedModals = [...prevModals];
      updatedModals[modalIndex] = { 
        ...updatedModals[modalIndex], 
        ...updates 
      } as ModalConfig;
      
      return updatedModals;
    });
  }, []);

  const isOpen = useCallback((id: string) => {
    return modals.some(modal => modal.id === id);
  }, [modals]);

  const value: ModalContextType = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
    isOpen
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

// Hooks utilitaires spécialisés
export const useConfirmationModal = () => {
  const { openModal } = useModal();
  
  return useCallback((
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      confirmText?: string;
      cancelText?: string;
      variant?: 'default' | 'destructive';
    }
  ) => {
    const modalId = `confirmation_${Date.now()}`;
    
    openModal({
      id: modalId,
      type: 'confirmation',
      title,
      message,
      confirmText: options?.confirmText || 'Confirmer',
      cancelText: options?.cancelText || 'Annuler',
      variant: options?.variant || 'default',
      onConfirm,
      size: 'md'
    });
    
    return modalId;
  }, [openModal]);
};

export const useFormModal = () => {
  const { openModal } = useModal();
  
  return useCallback((
    title: string,
    FormComponent: React.ComponentType<any>,
    onSubmit: (data: any) => void | Promise<void>,
    options?: {
      size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
      formProps?: Record<string, any>;
      submitText?: string;
      cancelText?: string;
    }
  ) => {
    const modalId = `form_${Date.now()}`;
    
    openModal({
      id: modalId,
      type: 'form',
      title,
      formComponent: FormComponent,
      formProps: options?.formProps || {},
      submitText: options?.submitText || 'Enregistrer',
      cancelText: options?.cancelText || 'Annuler',
      onSubmit,
      size: options?.size || 'lg'
    });
    
    return modalId;
  }, [openModal]);
};

export const useDisplayModal = () => {
  const { openModal } = useModal();
  
  return useCallback((
    title: string,
    content: ReactNode,
    options?: {
      size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
      description?: string;
      scrollable?: boolean;
      actions?: any[];
    }
  ) => {
    const modalId = `display_${Date.now()}`;
    
    openModal({
      id: modalId,
      type: 'display',
      title,
      description: options?.description,
      content,
      scrollable: options?.scrollable ?? true,
      footerActions: options?.actions,
      size: options?.size || 'lg'
    });
    
    return modalId;
  }, [openModal]);
};