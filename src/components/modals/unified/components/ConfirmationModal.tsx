/**
 * Modal de confirmation standard
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info } from 'lucide-react';
import { ConfirmationModalConfig } from '../types';

interface ConfirmationModalProps {
  config: ConfirmationModalConfig;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ config, onClose }) => {
  const handleConfirm = async () => {
    try {
      await config.onConfirm();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
    }
  };

  const handleCancel = () => {
    if (config.onCancel) {
      config.onCancel();
    }
    onClose();
  };

  const getIcon = () => {
    if (config.variant === 'destructive') {
      return <AlertTriangle className="w-6 h-6 text-destructive" />;
    }
    return <Info className="w-6 h-6 text-primary" />;
  };

  return (
    <div className="p-6">
      <div className="flex items-start gap-4 mb-6">
        {getIcon()}
        <div className="flex-1">
          <p className="text-base">{config.message}</p>
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleCancel}
        >
          {config.cancelText || 'Annuler'}
        </Button>
        <Button
          variant={config.variant === 'destructive' ? 'destructive' : 'default'}
          onClick={handleConfirm}
        >
          {config.confirmText || 'Confirmer'}
        </Button>
      </div>
    </div>
  );
};