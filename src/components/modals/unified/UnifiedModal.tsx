/**
 * Composant de modal unifié pour l'écosystème algérien
 * Gestion centralisée de tous les types de modales
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ModalConfig } from './types';
import { ConfirmationModal } from './components/ConfirmationModal';
import { FormModal } from './components/FormModal';
import { DisplayModal } from './components/DisplayModal';
import { WorkflowModal } from './components/WorkflowModal';
import { ApprovalModal } from './components/ApprovalModal';
import { OCRModal } from './components/OCRModal';
import { SearchModal } from './components/SearchModal';
import { LegalModal } from './components/LegalModal';
import { ProcedureModal } from './components/ProcedureModal';
import { AnalyticsModal } from './components/AnalyticsModal';

interface UnifiedModalProps {
  config: ModalConfig;
  onClose: () => void;
  isOpen: boolean;
}

export const UnifiedModal: React.FC<UnifiedModalProps> = ({ config, onClose, isOpen }) => {
  const getSizeClass = () => {
    switch (config.size || 'md') {
      case 'sm': return 'sm:max-w-md';
      case 'md': return 'sm:max-w-lg';
      case 'lg': return 'sm:max-w-2xl';
      case 'xl': return 'sm:max-w-4xl';
      case '2xl': return 'sm:max-w-6xl';
      case 'full': return 'sm:max-w-[95vw] max-h-[95vh]';
      default: return 'sm:max-w-lg';
    }
  };

  const renderModalContent = () => {
    switch (config.type) {
      case 'confirmation':
        return <ConfirmationModal config={config} onClose={onClose} />;
      case 'form':
        return <FormModal config={config} onClose={onClose} />;
      case 'display':
        return <DisplayModal config={config} onClose={onClose} />;
      case 'workflow':
        return <WorkflowModal config={config} onClose={onClose} />;
      case 'approval':
        return <ApprovalModal config={config} onClose={onClose} />;
      case 'ocr':
        return <OCRModal config={config} onClose={onClose} />;
      case 'search':
        return <SearchModal config={config} onClose={onClose} />;
      case 'legal':
        return <LegalModal config={config} onClose={onClose} />;
      case 'procedure':
        return <ProcedureModal config={config} onClose={onClose} />;
      case 'analytics':
        return <AnalyticsModal config={config} onClose={onClose} />;
      default:
        console.warn('Type de modal non supporté:', (config as any).type);
        return (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">Type de modal non supporté: {(config as any).type}</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={config.closable !== false ? onClose : undefined}>
      <DialogContent 
        className={`${getSizeClass()} ${config.className || ''}`}
        aria-describedby={config.description ? `modal-description-${config.id}` : undefined}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {config.title}
            </DialogTitle>
            {config.closable !== false && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </Button>
            )}
          </div>
          {config.description && (
            <DialogDescription id={`modal-description-${config.id}`}>
              {config.description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {renderModalContent()}
      </DialogContent>
    </Dialog>
  );
};