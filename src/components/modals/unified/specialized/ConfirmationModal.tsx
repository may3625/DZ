import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmationModalProps {
  title: string;
  message: string;
  variant?: 'default' | 'destructive' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantConfig = {
  default: {
    icon: Info,
    iconColor: 'text-blue-600',
    confirmVariant: 'default' as const,
  },
  destructive: {
    icon: XCircle,
    iconColor: 'text-red-600',
    confirmVariant: 'destructive' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    confirmVariant: 'default' as const,
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    confirmVariant: 'default' as const,
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    confirmVariant: 'default' as const,
  },
};

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  variant = 'default',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  loading = false,
  size = 'md',
}) => {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
    }
  };

  return (
    <div className={cn('p-6', sizeClasses[size])}>
      <div className="flex items-start space-x-3">
        <div className={cn('flex-shrink-0', config.iconColor)}>
          <IconComponent className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {message}
          </p>
          
          <div className="flex justify-end space-x-3">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="min-w-20"
              >
                {cancelText}
              </Button>
            )}
            
            <Button
              variant={config.confirmVariant}
              onClick={handleConfirm}
              disabled={loading}
              className="min-w-20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Chargement...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};