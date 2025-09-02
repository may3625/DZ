import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useEnrichedFormLibrary } from '@/hooks/useEnrichedFormLibrary';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { ALL_LEGAL_TYPES, ALL_PROCEDURE_CATEGORIES } from '@/data/nomenclatureData';

interface FormListSelectorProps {
  selectedFormType: string;
  selectedFormList: string;
  onFormListChange: (value: string) => void;
  disabled?: boolean;
}

export function FormListSelector({ 
  selectedFormType, 
  selectedFormList, 
  onFormListChange,
  disabled = false 
}: FormListSelectorProps) {
  const { language, t } = useAlgerianI18n();
  const { getFormsByType, getLegalTextTypes, getProcedureCategories } = useEnrichedFormLibrary();

  // Obtenir les formulaires disponibles pour le type sélectionné
  const availableForms = React.useMemo(() => {
    if (!selectedFormType) return [];
    
    if (selectedFormType === 'textes_juridiques') {
      // Utiliser les données complètes de nomenclature (40 éléments)
      return ALL_LEGAL_TYPES.map((type, index) => ({
        id: `legal_${type.code.toLowerCase()}_${index}`,
        name: type.name,
        description: type.description,
        category: 'Textes Juridiques',
        count: type.count,
        status: type.status,
        fields: [] // Les champs seront générés dynamiquement si nécessaire
      }));
    } else if (selectedFormType === 'procedures_administratives') {
      // Utiliser les données complètes de nomenclature (16 éléments)
      return ALL_PROCEDURE_CATEGORIES.map((cat, index) => ({
        id: `procedure_${cat.code.toLowerCase()}_${index}`,
        name: cat.name,
        description: cat.description,
        category: 'Procédures Administratives',
        count: cat.count,
        status: cat.status,
        fields: [] // Les champs seront générés dynamiquement si nécessaire
      }));
    }
    
    // Pour les autres types, utiliser le système enrichi existant
    return getFormsByType(selectedFormType);
  }, [selectedFormType, getFormsByType]);

  const getFormTypeLabel = (type: string) => {
    const labels = {
      'textes_juridiques': t('Types de Textes'),
      'procedures_administratives': t('Catégories Procédures')
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (!selectedFormType || availableForms.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Liste des formulaires *
        </Label>
        <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500 text-center">
            {!selectedFormType 
              ? t('Veuillez d\'abord sélectionner un type de formulaire')
              : t('Aucun formulaire disponible pour ce type')
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="form-list" className="text-sm font-medium text-gray-700">
          Liste des formulaires *
        </Label>
        <Badge variant="secondary" className="text-xs">
          {availableForms.length} {t('formulaires disponibles')}
        </Badge>
      </div>
      
      <Select 
        value={selectedFormList} 
        onValueChange={onFormListChange}
        disabled={disabled}
      >
        <SelectTrigger className="border-gray-200 focus:border-blue-500 h-auto min-h-[40px]">
          <SelectValue placeholder={t('Sélectionnez un formulaire spécifique...')} className="text-left whitespace-normal" />
        </SelectTrigger>
        <SelectContent className="max-h-80 z-50 bg-white">
          <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b bg-gray-50">
            {getFormTypeLabel(selectedFormType)}
          </div>
          {availableForms.map((form) => (
            <SelectItem key={form.id} value={form.id} className="cursor-pointer whitespace-normal">
              <div className="font-medium text-gray-900 text-left w-full">{form.name}</div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}