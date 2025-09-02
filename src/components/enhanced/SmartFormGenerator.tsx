/**
 * Générateur de formulaires intelligent pour Dalil.dz
 * Phase 2: Fonctionnalités Métier Frontend - Générateur de procédures
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  X, 
  Save, 
  Eye, 
  Wand2, 
  Type, 
  Hash, 
  Calendar, 
  ToggleLeft,
  FileText,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2
} from 'lucide-react';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { logger } from '@/utils/logger';

interface FormField {
  id: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'file';
  label: string;
  labelAr?: string;
  required: boolean;
  placeholder?: string;
  placeholderAr?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  description?: string;
  descriptionAr?: string;
  defaultValue?: string;
  order: number;
}

interface SmartForm {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  category: string;
  institution: string;
  fields: FormField[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SmartFormGeneratorProps {
  initialForm?: SmartForm;
  onSave: (form: SmartForm) => void;
  onPreview: (form: SmartForm) => void;
  onClose: () => void;
}

export function SmartFormGenerator({ initialForm, onSave, onPreview, onClose }: SmartFormGeneratorProps) {
  const { t, isRTL } = useAlgerianI18n();
  const [form, setForm] = useState<SmartForm>(
    initialForm || {
      id: `form_${Date.now()}`,
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      category: '',
      institution: '',
      fields: [],
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  );

  const fieldTypes = [
    { value: 'text', label: 'Texte', icon: Type },
    { value: 'number', label: 'Nombre', icon: Hash },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'select', label: 'Liste déroulante', icon: ToggleLeft },
    { value: 'checkbox', label: 'Case à cocher', icon: ToggleLeft },
    { value: 'textarea', label: 'Zone de texte', icon: FileText },
    { value: 'file', label: 'Fichier', icon: FileText }
  ];

  const algerianInstitutions = [
    'Wilaya',
    'APC (Assemblée Populaire Communale)',
    'APW (Assemblée Populaire de Wilaya)',
    'Ministère de l\'Intérieur',
    'Ministère de la Justice',
    'Ministère des Finances',
    'Ministère du Commerce',
    'Direction de l\'État Civil',
    'CNRC (Centre National du Registre de Commerce)',
    'CNAS (Caisse Nationale des Assurances Sociales)',
    'Autres'
  ];

  const procedureCategories = [
    'État Civil',
    'Commerce et Industrie',
    'Urbanisme et Construction',
    'Transport',
    'Santé',
    'Éducation',
    'Justice',
    'Finances et Fiscalité',
    'Travail et Emploi',
    'Agriculture',
    'Environnement',
    'Autres'
  ];

  const addField = useCallback(() => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: '',
      required: false,
      order: form.fields.length
    };

    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
      updatedAt: new Date()
    }));

    logger.info('Forms', 'Nouveau champ ajouté', { fieldId: newField.id }, 'SmartFormGenerator');
  }, [form.fields.length]);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      ),
      updatedAt: new Date()
    }));
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId),
      updatedAt: new Date()
    }));

    logger.info('Forms', 'Champ supprimé', { fieldId }, 'SmartFormGenerator');
  }, []);

  const moveField = useCallback((fieldId: string, direction: 'up' | 'down') => {
    setForm(prev => {
      const fields = [...prev.fields];
      const index = fields.findIndex(f => f.id === fieldId);
      
      if (direction === 'up' && index > 0) {
        [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]];
      } else if (direction === 'down' && index < fields.length - 1) {
        [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
      }

      // Réorganiser les ordres
      fields.forEach((field, idx) => {
        field.order = idx;
      });

      return {
        ...prev,
        fields,
        updatedAt: new Date()
      };
    });
  }, []);

  const duplicateField = useCallback((fieldId: string) => {
    const field = form.fields.find(f => f.id === fieldId);
    if (field) {
      const duplicatedField: FormField = {
        ...field,
        id: `field_${Date.now()}`,
        label: `${field.label} (copie)`,
        order: form.fields.length
      };

      setForm(prev => ({
        ...prev,
        fields: [...prev.fields, duplicatedField],
        updatedAt: new Date()
      }));

      logger.info('Forms', 'Champ dupliqué', { originalId: fieldId, newId: duplicatedField.id }, 'SmartFormGenerator');
    }
  }, [form.fields]);

  const generateSmartFields = useCallback(() => {
    // Génération intelligente basée sur la catégorie et l'institution
    const smartFields: FormField[] = [];
    let order = 0;

    // Champs communs à toutes les procédures
    smartFields.push({
      id: `field_${Date.now()}_${order++}`,
      type: 'text',
      label: 'Nom complet du demandeur',
      labelAr: 'الاسم الكامل للطالب',
      required: true,
      order
    });

    smartFields.push({
      id: `field_${Date.now()}_${order++}`,
      type: 'date',
      label: 'Date de naissance',
      labelAr: 'تاريخ الميلاد',
      required: true,
      order
    });

    // Champs spécifiques selon la catégorie
    if (form.category === 'État Civil') {
      smartFields.push({
        id: `field_${Date.now()}_${order++}`,
        type: 'text',
        label: 'Lieu de naissance',
        labelAr: 'مكان الميلاد',
        required: true,
        order
      });

      smartFields.push({
        id: `field_${Date.now()}_${order++}`,
        type: 'select',
        label: 'Type de document demandé',
        labelAr: 'نوع الوثيقة المطلوبة',
        required: true,
        options: [
          'Acte de naissance',
          'Acte de mariage',
          'Acte de décès',
          'Certificat de nationalité',
          'Livret de famille'
        ],
        order
      });
    } else if (form.category === 'Commerce et Industrie') {
      smartFields.push({
        id: `field_${Date.now()}_${order++}`,
        type: 'text',
        label: 'Dénomination sociale',
        labelAr: 'التسمية الاجتماعية',
        required: true,
        order
      });

      smartFields.push({
        id: `field_${Date.now()}_${order++}`,
        type: 'select',
        label: 'Forme juridique',
        labelAr: 'الشكل القانوني',
        required: true,
        options: [
          'SARL',
          'SPA',
          'EURL',
          'SNC',
          'Entreprise individuelle'
        ],
        order
      });
    }

    // Champs de clôture communs
    smartFields.push({
      id: `field_${Date.now()}_${order++}`,
      type: 'file',
      label: 'Pièces justificatives',
      labelAr: 'الوثائق المبررة',
      required: false,
      description: 'Joindre tous les documents requis (format PDF, max 10MB)',
      descriptionAr: 'إرفاق جميع الوثائق المطلوبة (صيغة PDF، حد أقصى 10 ميجابايت)',
      order
    });

    setForm(prev => ({
      ...prev,
      fields: smartFields,
      updatedAt: new Date()
    }));

    logger.info('Forms', 'Champs intelligents générés', { 
      category: form.category, 
      fieldsCount: smartFields.length 
    }, 'SmartFormGenerator');
  }, [form.category]);

  const handleSave = useCallback(() => {
    if (!form.title.trim() || !form.category || !form.institution) {
      logger.warn('Forms', 'Formulaire incomplet', { 
        hasTitle: !!form.title.trim(),
        hasCategory: !!form.category,
        hasInstitution: !!form.institution
      }, 'SmartFormGenerator');
      return;
    }

    const updatedForm = {
      ...form,
      updatedAt: new Date()
    };

    onSave(updatedForm);
    logger.info('Forms', 'Formulaire sauvegardé', { 
      formId: form.id,
      fieldsCount: form.fields.length
    }, 'SmartFormGenerator');
  }, [form, onSave]);

  const handlePreview = useCallback(() => {
    onPreview(form);
    logger.info('Forms', 'Aperçu du formulaire', { formId: form.id }, 'SmartFormGenerator');
  }, [form, onPreview]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl">Générateur de Formulaires Intelligent</CardTitle>
            <p className="text-muted-foreground mt-1">
              Créez des formulaires de procédures administratives adaptés au contexte algérien
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview} disabled={form.fields.length === 0}>
              <Eye className="w-4 h-4 mr-2" />
              Aperçu
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Fermer
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration du formulaire */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration générale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titre du formulaire</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Demande d'acte de naissance"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Titre en arabe</label>
                <Input
                  value={form.titleAr || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, titleAr: e.target.value }))}
                  placeholder="مثال: طلب شهادة ميلاد"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de la procédure..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Institution</label>
                <Select 
                  value={form.institution} 
                  onValueChange={(value) => setForm(prev => ({ ...prev, institution: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {algerianInstitutions.map((institution) => (
                      <SelectItem key={institution} value={institution}>
                        {institution}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <Select 
                  value={form.category} 
                  onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {procedureCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Formulaire publié</label>
                <Switch
                  checked={form.isPublished}
                  onCheckedChange={(checked) => setForm(prev => ({ ...prev, isPublished: checked }))}
                />
              </div>

              <Button 
                onClick={generateSmartFields} 
                className="w-full" 
                variant="outline"
                disabled={!form.category || !form.institution}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Générer des champs intelligents
              </Button>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Nombre de champs:</span>
                  <Badge>{form.fields.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Champs requis:</span>
                  <Badge variant="secondary">
                    {form.fields.filter(f => f.required).length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Créé le:</span>
                  <span className="text-muted-foreground">
                    {form.createdAt.toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Modifié le:</span>
                  <span className="text-muted-foreground">
                    {form.updatedAt.toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Éditeur de champs */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Champs du formulaire</CardTitle>
              <Button onClick={addField}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un champ
              </Button>
            </CardHeader>
            <CardContent>
              {form.fields.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun champ défini</p>
                  <p className="text-sm">Cliquez sur "Ajouter un champ" ou "Générer des champs intelligents"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.fields
                    .sort((a, b) => a.order - b.order)
                    .map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="space-y-4">
                        {/* En-tête du champ */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <Select
                              value={field.type}
                              onValueChange={(value) => updateField(field.id, { type: value as FormField['type'] })}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                      <type.icon className="w-4 h-4" />
                                      {type.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moveField(field.id, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moveField(field.id, 'down')}
                              disabled={index === form.fields.length - 1}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => duplicateField(field.id)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeField(field.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Configuration du champ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Libellé</label>
                            <Input
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              placeholder="Libellé du champ"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Libellé en arabe</label>
                            <Input
                              value={field.labelAr || ''}
                              onChange={(e) => updateField(field.id, { labelAr: e.target.value })}
                              placeholder="تسمية الحقل"
                              dir="rtl"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium">Placeholder</label>
                            <Input
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                              placeholder="Texte d'aide"
                            />
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                              />
                              <label className="text-sm font-medium">Requis</label>
                            </div>
                          </div>
                        </div>

                        {/* Options pour les champs select */}
                        {field.type === 'select' && (
                          <div>
                            <label className="text-sm font-medium">Options (une par ligne)</label>
                            <Textarea
                              value={field.options?.join('\n') || ''}
                              onChange={(e) => updateField(field.id, { 
                                options: e.target.value.split('\n').filter(o => o.trim())
                              })}
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                              rows={3}
                            />
                          </div>
                        )}

                        {/* Description */}
                        <div>
                          <label className="text-sm font-medium">Description d'aide</label>
                          <Textarea
                            value={field.description || ''}
                            onChange={(e) => updateField(field.id, { description: e.target.value })}
                            placeholder="Texte d'aide pour ce champ..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}