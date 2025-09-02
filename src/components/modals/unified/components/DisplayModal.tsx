/**
 * Modal d'affichage de contenu
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { DisplayModalConfig } from '../types';

interface DisplayModalProps {
  config: DisplayModalConfig;
  onClose: () => void;
}

export const DisplayModal: React.FC<DisplayModalProps> = ({ config, onClose }) => {
  return (
    <div className="flex flex-col h-full">
      <div className={`flex-1 p-6 ${config.scrollable ? 'overflow-y-auto' : ''}`}>
        {config.content}
      </div>
      
      {config.footerActions && config.footerActions.length > 0 && (
        <div className="p-6 border-t bg-muted/50">
          <div className="flex justify-end gap-3">
            {config.footerActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant={action.variant || 'default'}
                  onClick={action.onClick}
                  disabled={action.disabled || action.loading}
                >
                  {action.loading ? (
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    Icon && <Icon className="w-4 h-4 mr-2" />
                  )}
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};