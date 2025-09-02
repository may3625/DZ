/**
 * Point d'entrée pour le système de modales unifié
 */

export * from './ModalContext';
export * from './UnifiedModal'; 
export * from './ModalRenderer';
export * from './types';

// Composants spécialisés (exports spécifiques pour éviter les conflits)
export type { SpecializedModalConfig } from './specialized/types';