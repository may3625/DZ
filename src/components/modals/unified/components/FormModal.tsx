/**
 * Modal de formulaire générique
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormModalConfig } from '../types';
import { Loader2 } from 'lucide-react';

interface FormModalProps {
  config: FormModalConfig;
  onClose: () => void;
}

export const FormModal: React.FC<FormModalProps> = ({ config, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({});

  const handleSubmit = async (data: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await config.onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (config.onCancel) {
      config.onCancel();
    }
    onClose();
  };

  const FormComponent = config.formComponent;

  return (
    <div className="p-6">
      <div className="mb-6">
        <FormComponent
          {...config.formProps}
          onSubmit={handleSubmit}
          onChange={setFormData}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          {config.cancelText || 'Annuler'}
        </Button>
        <Button
          onClick={() => handleSubmit(formData)}
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {config.submitText || 'Enregistrer'}
        </Button>
      </div>
    </div>
  );
};