import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Languages, Save, Copy, ArrowLeft, CheckCircle } from 'lucide-react';
import { FormField } from './types';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { useToast } from '@/hooks/use-toast';

interface TranslationTabProps {
  fields: FormField[];
  onTranslationsUpdate: (translations: Record<string, Record<string, any>>) => void;
  onGoBack: () => void;
  onContinue: () => void;
}

interface FieldTranslation {
  label: string;
  placeholder: string;
  options?: string[];
}

const SUPPORTED_LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇩🇿' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

export function TranslationTab({ 
  fields, 
  onTranslationsUpdate, 
  onGoBack, 
  onContinue 
}: TranslationTabProps) {
  const [translations, setTranslations] = useState<Record<string, Record<string, FieldTranslation>>>({});
  const [selectedLanguage, setSelectedLanguage] = useState('ar');
  const [completionStatus, setCompletionStatus] = useState<Record<string, number>>({});
  const { t } = useAlgerianI18n();
  const { toast } = useToast();

  // Initialiser les traductions avec les valeurs par défaut
  useEffect(() => {
    const initialTranslations: Record<string, Record<string, FieldTranslation>> = {};
    
    SUPPORTED_LANGUAGES.forEach(lang => {
      initialTranslations[lang.code] = {};
      fields.forEach(field => {
        initialTranslations[lang.code][field.id] = {
          label: lang.code === 'fr' ? field.label : '',
          placeholder: lang.code === 'fr' ? field.placeholder || '' : '',
          options: field.options ? (lang.code === 'fr' ? field.options : []) : undefined
        };
      });
    });
    
    setTranslations(initialTranslations);
  }, [fields]);

  // Calculer le taux de completion pour chaque langue
  useEffect(() => {
    const status: Record<string, number> = {};
    
    SUPPORTED_LANGUAGES.forEach(lang => {
      if (lang.code === 'fr') {
        status[lang.code] = 100; // Français est toujours à 100%
        return;
      }
      
      const langTranslations = translations[lang.code] || {};
      const totalFields = fields.length;
      let completedFields = 0;
      
      fields.forEach(field => {
        const fieldTranslation = langTranslations[field.id];
        if (fieldTranslation && fieldTranslation.label.trim()) {
          completedFields++;
        }
      });
      
      status[lang.code] = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    });
    
    setCompletionStatus(status);
  }, [translations, fields]);

  const handleFieldTranslationChange = (
    fieldId: string, 
    property: keyof FieldTranslation, 
    value: string | string[]
  ) => {
    setTranslations(prev => ({
      ...prev,
      [selectedLanguage]: {
        ...prev[selectedLanguage],
        [fieldId]: {
          ...prev[selectedLanguage]?.[fieldId],
          [property]: value
        }
      }
    }));
  };

  const handleCopyFromFrench = (fieldId: string) => {
    const frenchTranslation = translations['fr']?.[fieldId];
    if (frenchTranslation && selectedLanguage !== 'fr') {
      setTranslations(prev => ({
        ...prev,
        [selectedLanguage]: {
          ...prev[selectedLanguage],
          [fieldId]: { ...frenchTranslation }
        }
      }));
      
      toast({
        title: "Texte copié",
        description: "Le texte français a été copié pour traduction.",
      });
    }
  };

  const handleAutoTranslate = (fieldId: string) => {
    // Simulation d'auto-traduction (ici on pourrait intégrer un service de traduction)
    const frenchText = translations['fr']?.[fieldId]?.label || '';
    if (frenchText && selectedLanguage === 'ar') {
      // Exemples de traductions automatiques simples
      const simpleTranslations: Record<string, string> = {
        'Titre': 'العنوان',
        'Description': 'الوصف',
        'Numéro': 'الرقم',
        'Date': 'التاريخ',
        'Organisation': 'المنظمة',
        'Type': 'النوع',
        'Catégorie': 'الفئة',
        'Statut': 'الحالة',
        'Contenu': 'المحتوى'
      };
      
      const translated = simpleTranslations[frenchText] || frenchText;
      
      setTranslations(prev => ({
        ...prev,
        [selectedLanguage]: {
          ...prev[selectedLanguage],
          [fieldId]: {
            ...prev[selectedLanguage]?.[fieldId],
            label: translated
          }
        }
      }));
      
      toast({
        title: "Traduction automatique",
        description: "Traduction automatique appliquée. Veuillez vérifier et ajuster si nécessaire.",
      });
    }
  };

  const handleSaveTranslations = () => {
    onTranslationsUpdate(translations);
    toast({
      title: "Traductions sauvegardées",
      description: "Les traductions ont été sauvegardées avec succès.",
    });
  };

  const handleContinue = () => {
    handleSaveTranslations();
    onContinue();
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage === 100) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const selectedLangData = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Languages className="w-6 h-6 text-blue-600" />
          Traduction des Champs
        </h3>
        <p className="text-gray-600">
          Traduisez les champs de votre formulaire dans les langues officielles
        </p>
      </div>

      {/* Sélection de langue et statut */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Langues Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Card 
                key={lang.code} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedLanguage === lang.code ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedLanguage(lang.code)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{lang.flag}</div>
                  <div className="font-medium">{lang.name}</div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className={`text-sm font-medium ${getCompletionColor(completionStatus[lang.code] || 0)}`}>
                      {completionStatus[lang.code] || 0}%
                    </div>
                    {completionStatus[lang.code] === 100 && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interface de traduction */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedLangData?.flag}</span>
              Traduction en {selectedLangData?.name}
            </CardTitle>
            <Badge variant="outline">
              {fields.length} champs à traduire
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.map((field) => {
            const currentTranslation = translations[selectedLanguage]?.[field.id] || {
              label: '',
              placeholder: '',
              options: []
            };
            const frenchTranslation = translations['fr']?.[field.id] || {
              label: '',
              placeholder: '',
              options: []
            };
            
            return (
              <Card key={field.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Texte original (français) */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-600">
                        🇫🇷 Texte original (Français)
                      </Label>
                      <div className="space-y-2">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-800">{frenchTranslation.label}</div>
                          {frenchTranslation.placeholder && (
                            <div className="text-sm text-gray-600 mt-1">
                              Placeholder: {frenchTranslation.placeholder}
                            </div>
                          )}
                          {frenchTranslation.options && frenchTranslation.options.length > 0 && (
                            <div className="text-sm text-gray-600 mt-1">
                              Options: {frenchTranslation.options.join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCopyFromFrench(field.id)}
                            disabled={selectedLanguage === 'fr'}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copier
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAutoTranslate(field.id)}
                            disabled={selectedLanguage === 'fr' || selectedLanguage === 'en'}
                          >
                            <Languages className="w-3 h-3 mr-1" />
                            Auto-traduire
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Traduction */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-600">
                        {selectedLangData?.flag} Traduction en {selectedLangData?.name}
                      </Label>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`label-${field.id}`} className="text-xs text-gray-500">
                            Label du champ *
                          </Label>
                          <Input
                            id={`label-${field.id}`}
                            value={currentTranslation.label || ''}
                            onChange={(e) => handleFieldTranslationChange(field.id, 'label', e.target.value)}
                            placeholder={`Traduire "${frenchTranslation.label}"`}
                            disabled={selectedLanguage === 'fr'}
                            className="mt-1"
                          />
                        </div>
                        
                        {frenchTranslation.placeholder && (
                          <div>
                            <Label htmlFor={`placeholder-${field.id}`} className="text-xs text-gray-500">
                              Placeholder
                            </Label>
                            <Input
                              id={`placeholder-${field.id}`}
                              value={currentTranslation.placeholder || ''}
                              onChange={(e) => handleFieldTranslationChange(field.id, 'placeholder', e.target.value)}
                              placeholder={`Traduire "${frenchTranslation.placeholder}"`}
                              disabled={selectedLanguage === 'fr'}
                              className="mt-1"
                            />
                          </div>
                        )}
                        
                        {frenchTranslation.options && frenchTranslation.options.length > 0 && (
                          <div>
                            <Label htmlFor={`options-${field.id}`} className="text-xs text-gray-500">
                              Options (séparées par des virgules)
                            </Label>
                            <Input
                              id={`options-${field.id}`}
                              value={currentTranslation.options?.join(', ') || ''}
                              onChange={(e) => handleFieldTranslationChange(
                                field.id, 
                                'options', 
                                e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt)
                              )}
                              placeholder={`Traduire: ${frenchTranslation.options.join(', ')}`}
                              disabled={selectedLanguage === 'fr'}
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onGoBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la Prévisualisation
        </Button>
        
        <div className="space-x-3">
          <Button variant="outline" onClick={handleSaveTranslations}>
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder les Traductions
          </Button>
          <Button onClick={handleContinue}>
            Continuer vers la Bibliothèque
          </Button>
        </div>
      </div>
    </div>
  );
}