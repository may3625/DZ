
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File, X } from 'lucide-react';
import { advancedSanitizeInput, validator } from '@/utils/enhancedSecurity';
import { RESPONSIVE_SPACING, RESPONSIVE_BUTTONS } from '@/utils/responsiveUtils';

interface FileUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accept?: string;
}

export function FileUploadField({ 
  label, 
  value, 
  onChange, 
  accept = "*" 
}: FileUploadFieldProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation sécurisée du fichier
      const validation = validator.validateSecureFile(file);
      
      if (!validation.isValid) {
        console.error('Fichier invalide:', validation.error);
        return;
      }
      
      // Utilisation du nom sanitisé
      const sanitizedName = validation.sanitizedName || file.name;
      const cleanName = advancedSanitizeInput(sanitizedName, 'text');
      
      onChange(cleanName);
    }
  };

  const clearFile = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      
      {value ? (
        <div className="flex items-center gap-2 p-3 sm:p-4 border border-border rounded-md bg-muted/50">
          <File className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <span className="flex-1 text-sm sm:text-base text-foreground break-all">{value}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFile}
            className={`${RESPONSIVE_BUTTONS.iconSmall} text-destructive hover:bg-destructive/10`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className={`flex items-center justify-center ${RESPONSIVE_SPACING.card} border-2 border-dashed border-border rounded-md hover:border-primary/50 transition-colors bg-background`}>
            <div className="text-center">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm sm:text-base text-foreground">
                Cliquer pour télécharger ou glisser-déposer
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Formats supportés: PDF, DOC, DOCX, Images (max 100MB)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
