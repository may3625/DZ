/**
 * Adaptateur pour migration legacy UnifiedModalSystem vers le nouveau système unifié
 * Évite la duplication des modales
 */

import React from 'react';
import { useModal } from './unified/ModalContext';
import type { ModalConfig as LegacyModalConfig } from './UnifiedModalSystem';

interface UnifiedModalSystemProps {
  modal: LegacyModalConfig | null;
  onClose: () => void;
}

// Composant adaptateur qui utilise le nouveau système unifié
export function UnifiedModalSystem({ modal, onClose }: UnifiedModalSystemProps) {
  const { openModal, closeModal, isOpen } = useModal();
  const modalId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (modal && !modalId.current) {
      // Convertir le config legacy vers le nouveau format
      const baseConfig = {
        id: `legacy_${Date.now()}`,
        type: modal.type as any,
        title: modal.title,
        description: modal.description,
        size: (modal.size || 'md') as any,
        onClose: onClose
      };

      // Ajouter les propriétés spécifiques selon le type
      let newConfig: any = { ...baseConfig };
      
      if (modal.type === 'analytics') {
        newConfig = {
          ...baseConfig,
          chartType: modal.chartType || 'bar',
          data: modal.data || [],
          ...modal
        };
      } else if (modal.type === 'form') {
        newConfig = {
          ...baseConfig,
          formComponent: () => React.createElement('div', {}, modal.content || 'Formulaire'),
          onSubmit: modal.onSave || (() => {}),
          ...modal
        };
      } else if (modal.type === 'display' || modal.type === 'viewer') {
        newConfig = {
          ...baseConfig,
          type: 'display',
          content: modal.content || modal.data || 'Contenu',
          ...modal
        };
      } else {
        newConfig = { ...baseConfig, ...modal };
      }

      modalId.current = newConfig.id;
      openModal(newConfig);
    } else if (!modal && modalId.current) {
      // Fermer la modal si elle n'existe plus
      closeModal(modalId.current);
      modalId.current = null;
    }
  }, [modal, openModal, closeModal, onClose]);

  // Nettoyer au démontage
  React.useEffect(() => {
    return () => {
      if (modalId.current) {
        closeModal(modalId.current);
      }
    };
  }, [closeModal]);

  // Ce composant ne rend rien - la modal est gérée par le ModalRenderer global
  return null;
}

export default UnifiedModalSystem;