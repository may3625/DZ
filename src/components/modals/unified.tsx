// Re-export from the proper unified modal system
export { ModalProvider, useModal } from './unified/ModalContext';

// Re-export the legacy adapter to avoid duplicates
export { UnifiedModalSystem } from './UnifiedModalLegacyAdapter';

// Create a proper ModalRenderer that renders all open modals
import React from 'react';
import { useModal } from './unified/ModalContext';
import type { ModalConfig as UnifiedModalConfig } from './unified/types';

export const ModalRenderer: React.FC = () => {
  // Le rendu est maintenant géré directement par le ModalRenderer dans unified/ModalRenderer.tsx
  return null;
};