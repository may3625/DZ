
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { advancedSanitizeInput } from '@/utils/enhancedSecurity';
import { RESPONSIVE_BUTTONS, RESPONSIVE_SPACING } from '@/utils/responsiveUtils';

interface DynamicFieldListProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  type?: 'input' | 'textarea';
}

export function DynamicFieldList({ 
  label, 
  values, 
  onChange, 
  placeholder = '', 
  type = 'input' 
}: DynamicFieldListProps) {
  const addField = () => {
    onChange([...values, '']);
  };

  const removeField = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  const updateField = (index: number, value: string) => {
    // Sanitisation sécurisée de l'entrée
    const sanitizedValue = advancedSanitizeInput(value, 'text');
    const newValues = [...values];
    newValues[index] = sanitizedValue;
    onChange(newValues);
  };

  // Ensure we always have at least one field
  const displayValues = values.length === 0 ? [''] : values;

  return (
    <div className="space-y-3 sm:space-y-4">
      <Label className="text-sm sm:text-base font-medium text-foreground">{label}</Label>
      {displayValues.map((value, index) => (
        <div key={index} className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
          {type === 'textarea' ? (
            <Textarea
              value={value}
              onChange={(e) => updateField(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 border-border focus:border-primary focus:ring-primary"
              rows={3}
              maxLength={1000}
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => updateField(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 border-border focus:border-primary focus:ring-primary"
              maxLength={500}
            />
          )}
          {displayValues.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeField(index)}
              className={`${RESPONSIVE_BUTTONS.iconSmall} text-destructive border-destructive/20 hover:bg-destructive/10 shrink-0`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={addField}
        className={`${RESPONSIVE_BUTTONS.default} flex items-center gap-2 text-primary border-primary/20 hover:bg-primary/10`}
        disabled={displayValues.length >= 10} // Limite de sécurité
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Ajouter {label.toLowerCase()}</span>
        <span className="sm:hidden">Ajouter</span>
      </Button>
    </div>
  );
}
