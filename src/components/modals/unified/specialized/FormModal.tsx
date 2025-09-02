import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormModalProps<T = any> {
  title: string;
  description?: string;
  FormComponent: React.ComponentType<{
    onSubmit: (data: T) => void | Promise<void>;
    onCancel: () => void;
    initialData?: T;
    loading?: boolean;
  }>;
  initialData?: T;
  onSubmit: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  validation?: (data: T) => boolean | string | Promise<boolean | string>;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const FormModal = <T extends Record<string, any> = any>({
  title,
  description,
  FormComponent,
  initialData,
  onSubmit,
  onCancel,
  submitText = 'Enregistrer',
  cancelText = 'Annuler',
  size = 'lg',
  className,
  validation,
}: FormModalProps<T>) => {
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (data: T) => {
    try {
      setLoading(true);
      setValidationError(null);

      // Validation si fournie
      if (validation) {
        const validationResult = await validation(data);
        if (typeof validationResult === 'string') {
          setValidationError(validationResult);
          return;
        }
        if (!validationResult) {
          setValidationError('Validation échouée');
          return;
        }
      }

      await onSubmit(data);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setValidationError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading && onCancel) {
      onCancel();
    }
  };

  return (
    <div className={cn('p-0 overflow-hidden', sizeClasses[size], className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={loading}
              className="h-8 w-8 p-0 hover:bg-background/50"
              aria-label="Fermer la modal"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 flex-1 overflow-y-auto">
        <FormComponent
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={initialData}
          loading={loading}
        />
        
        {validationError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{validationError}</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-muted/30 border-t">
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="min-w-20"
            >
              {cancelText}
            </Button>
          )}
          
          <Button
            onClick={() => {
              // Déclencher la soumission via le composant de formulaire
              const form = document.querySelector('form');
              if (form) {
                const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                if (submitButton) {
                  submitButton.click();
                }
              }
            }}
            disabled={loading}
            className="min-w-20"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {submitText}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};