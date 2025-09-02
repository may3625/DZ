/**
 * Rendu des modales unifiées
 * Gestionnaire de l'affichage et de la pile de modales
 */

import React from 'react';
import { useModal } from './ModalContext';
import { UnifiedModal } from './UnifiedModal';
import { logger } from '@/utils/logger';

export const ModalRenderer: React.FC = () => {
  const { modals, closeModal } = useModal();

  React.useEffect(() => {
    if (modals.length > 0) {
      logger.debug('UI', 'Modales actives', { count: modals.length }, 'ModalRenderer');
    }
  }, [modals.length]);

  return (
    <>
      {modals.map((config, index) => (
        <UnifiedModal
          key={config.id}
          config={config}
          onClose={() => closeModal(config.id)}
          isOpen={true}
        />
      ))}
    </>
  );
};