import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, ArrowUp, ArrowDown, Edit, Eye, Save, FileText, Zap } from 'lucide-react';

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number' | 'date' | 'email' | 'tel';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  helpText?: string;
  defaultValue?: any;
  order: number;
}

export interface DynamicForm {
  id: string;
  title: string;
  description: string;
  category: string;
  institution: string;
  fields: FormField[];
  validationRules: any[];
  metadata: {
    version: string;
    created: Date;
    lastModified: Date;
    author: string;
    status: 'draft' | 'published' | 'archived';
  };
}

interface DynamicFormGeneratorProps {
  form?: DynamicForm;
  onSave: (form: DynamicForm) => void;
  onPreview: (form: DynamicForm) => void;
  mode: 'create' | 'edit' | 'preview';
}

export function DynamicFormGenerator({ form, onSave, onPreview, mode }: DynamicFormGeneratorProps) {
  const [currentForm, setCurrentForm] = useState<DynamicForm>(form || {
    id: `form_${Date.now()}`,
    title: '',
    description: '',
    category: '',
    institution: '',
    fields: [],
    validationRules: [],
    metadata: {
      version: '1.0',
      created: new Date(),
      lastModified: new Date(),
      author: 'Utilisateur',
      status: 'draft'
    }
  });

  const [selectedFieldType, setSelectedFieldType] = useState<FormField['type']>('text');
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const fieldTypes = [
    { value: 'text', label: 'Texte simple', icon: '📝' },
    { value: 'textarea', label: 'Texte long', icon: '📄' },
    { value: 'select', label: 'Liste déroulante', icon: '📋' },
    { value: 'checkbox', label: 'Case à cocher', icon: '☑️' },
    { value: 'radio', label: 'Choix unique', icon: '🔘' },
    { value: 'number', label: 'Nombre', icon: '🔢' },
    { value: 'date', label: 'Date', icon: '📅' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'tel', label: 'Téléphone', icon: '📞' }
  ];

  const algerianFormTemplates = [
    {
      name: 'Déclaration de naissance',
      category: 'État civil',
      fields: [
        { type: 'text', label: 'Nom de famille', required: true },
        { type: 'text', label: 'Prénom(s)', required: true },
        { type: 'date', label: 'Date de naissance', required: true },
        { type: 'text', label: 'Lieu de naissance', required: true },
        { type: 'select', label: 'Sexe', options: ['Masculin', 'Féminin'], required: true },
        { type: 'text', label: 'Nom du père', required: true },
        { type: 'text', label: 'Nom de la mère', required: true }
      ]
    },
    {
      name: 'Demande de passeport',
      category: 'Documents officiels',
      fields: [
        { type: 'text', label: 'Numéro CNI', required: true },
        { type: 'text', label: 'Nom complet', required: true },
        { type: 'date', label: 'Date de naissance', required: true },
        { type: 'text', label: 'Lieu de naissance', required: true },
        { type: 'text', label: 'Profession', required: true },
        { type: 'textarea', label: 'Motif du voyage', required: true },
        { type: 'select', label: 'Type de passeport', options: ['Ordinaire', 'Service', 'Diplomatique'], required: true }
      ]
    },
    {
      name: 'Déclaration fiscale',
      category: 'Fiscalité',
      fields: [
        { type: 'text', label: 'NIF (Numéro d\'Identification Fiscale)', required: true },
        { type: 'text', label: 'Raison sociale', required: true },
        { type: 'number', label: 'Chiffre d\'affaires annuel', required: true },
        { type: 'date', label: 'Période fiscale (début)', required: true },
        { type: 'date', label: 'Période fiscale (fin)', required: true },
        { type: 'select', label: 'Régime fiscal', options: ['Réel', 'Forfaitaire', 'Simplifié'], required: true }
      ]
    }
  ];

  const addField = useCallback((type: FormField['type'] = 'text') => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `Nouveau champ ${type}`,
      required: false,
      order: currentForm.fields.length,
      ...(type === 'select' || type === 'radio' ? { options: ['Option 1', 'Option 2'] } : {})
    };

    setCurrentForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  }, [currentForm.fields.length]);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setCurrentForm(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  }, []);

  const deleteField = useCallback((fieldId: string) => {
    setCurrentForm(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
        .map((field, index) => ({ ...field, order: index }))
    }));
  }, []);

  const moveField = useCallback((fieldId: string, direction: 'up' | 'down') => {
    setCurrentForm(prev => {
      const fields = [...prev.fields];
      const fieldIndex = fields.findIndex(f => f.id === fieldId);
      
      if (fieldIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
      
      if (newIndex < 0 || newIndex >= fields.length) return prev;
      
      // Échanger les positions
      [fields[fieldIndex], fields[newIndex]] = [fields[newIndex], fields[fieldIndex]];
      
      // Remettre à jour les ordres
      fields.forEach((field, index) => {
        field.order = index;
      });
      
      return { ...prev, fields };
    });
  }, []);

  const loadTemplate = useCallback((template: any) => {
    const templateFields: FormField[] = template.fields.map((field: any, index: number) => ({
      id: `field_${Date.now()}_${index}`,
      type: field.type,
      label: field.label,
      required: field.required || false,
      options: field.options || undefined,
      order: index
    }));

    setCurrentForm(prev => ({
      ...prev,
      title: template.name,
      category: template.category,
      fields: templateFields
    }));
  }, []);

  const handleSave = useCallback(() => {
    const updatedForm = {
      ...currentForm,
      metadata: {
        ...currentForm.metadata,
        lastModified: new Date()
      }
    };
    onSave(updatedForm);
  }, [currentForm, onSave]);

  const handlePreview = useCallback(() => {
    onPreview(currentForm);
  }, [currentForm, onPreview]);

  const renderFieldEditor = (field: FormField) => (
    <Card key={field.id} className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{fieldTypes.find(t => t.value === field.type)?.label}</Badge>
              <span className="text-sm text-gray-500">#{field.order + 1}</span>
            </div>
            <Input
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="mt-2 font-medium"
              placeholder="Libellé du champ"
            />
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveField(field.id, 'up')}
              disabled={field.order === 0}
            >
              <ArrowUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveField(field.id, 'down')}
              disabled={field.order === currentForm.fields.length - 1}
            >
              <ArrowDown className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteField(field.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Placeholder</Label>
            <Input
              value={field.placeholder || ''}
              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
              placeholder="Texte d'aide"
              className="h-8"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`required-${field.id}`}
              checked={field.required}
              onCheckedChange={(checked) => updateField(field.id, { required: !!checked })}
            />
            <Label htmlFor={`required-${field.id}`} className="text-xs">Obligatoire</Label>
          </div>
        </div>

        {(field.type === 'select' || field.type === 'radio') && (
          <div>
            <Label className="text-xs">Options (une par ligne)</Label>
            <Textarea
              value={field.options?.join('\n') || ''}
              onChange={(e) => updateField(field.id, { 
                options: e.target.value.split('\n').filter(opt => opt.trim()) 
              })}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
              className="h-20 text-sm"
            />
          </div>
        )}

        <div>
          <Label className="text-xs">Texte d'aide</Label>
          <Input
            value={field.helpText || ''}
            onChange={(e) => updateField(field.id, { helpText: e.target.value })}
            placeholder="Information complémentaire"
            className="h-8"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderFieldPreview = (field: FormField) => {
    const commonProps = {
      id: field.id,
      required: field.required,
      placeholder: field.placeholder
    };

    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {field.type === 'text' && <Input {...commonProps} />}
        {field.type === 'textarea' && <Textarea {...commonProps} />}
        {field.type === 'number' && <Input type="number" {...commonProps} />}
        {field.type === 'date' && <Input type="date" {...commonProps} />}
        {field.type === 'email' && <Input type="email" {...commonProps} />}
        {field.type === 'tel' && <Input type="tel" {...commonProps} />}
        
        {field.type === 'select' && (
          <Select>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Sélectionner..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {field.type === 'checkbox' && (
          <div className="flex items-center space-x-2">
            <Checkbox id={`preview-${field.id}`} />
            <Label htmlFor={`preview-${field.id}`}>{field.placeholder || field.label}</Label>
          </div>
        )}
        
        {field.type === 'radio' && (
          <RadioGroup>
            {field.options?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )}
        
        {field.helpText && (
          <p className="text-xs text-gray-500">{field.helpText}</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Tabs defaultValue="design" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Générateur de Formulaires Dynamiques</h1>
            <p className="text-gray-600">Créez des formulaires adaptatifs pour les procédures algériennes</p>
          </div>
          
          <div className="flex gap-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="design">
                <Edit className="w-4 h-4 mr-2" />
                Conception
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="w-4 h-4 mr-2" />
                Aperçu
              </TabsTrigger>
              <TabsTrigger value="templates">
                <FileText className="w-4 h-4 mr-2" />
                Modèles
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="design" className="space-y-6">
          {/* Métadonnées du formulaire */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Configurez les propriétés de base du formulaire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Titre du formulaire</Label>
                  <Input
                    value={currentForm.title}
                    onChange={(e) => setCurrentForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Demande de carte d'identité"
                  />
                </div>
                <div>
                  <Label>Institution</Label>
                  <Input
                    value={currentForm.institution}
                    onChange={(e) => setCurrentForm(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="Ex: Mairie, Wilaya, APC..."
                  />
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={currentForm.description}
                  onChange={(e) => setCurrentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez l'objectif et l'utilisation de ce formulaire"
                />
              </div>
              
              <div>
                <Label>Catégorie</Label>
                <Select 
                  value={currentForm.category} 
                  onValueChange={(value) => setCurrentForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="état-civil">État civil</SelectItem>
                    <SelectItem value="documents-officiels">Documents officiels</SelectItem>
                    <SelectItem value="fiscalité">Fiscalité</SelectItem>
                    <SelectItem value="urbanisme">Urbanisme</SelectItem>
                    <SelectItem value="commerce">Commerce</SelectItem>
                    <SelectItem value="social">Affaires sociales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Ajout de champs */}
          <Card>
            <CardHeader>
              <CardTitle>Ajouter un champ</CardTitle>
              <CardDescription>Sélectionnez le type de champ à ajouter au formulaire</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {fieldTypes.map(type => (
                  <Button
                    key={type.value}
                    variant="outline"
                    className="h-20 flex flex-col gap-1"
                    onClick={() => addField(type.value as FormField['type'])}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-xs">{type.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Liste des champs */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Champs du formulaire ({currentForm.fields.length})</h3>
              <div className="flex gap-2">
                <Button onClick={handlePreview} variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Aperçu
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {currentForm.fields.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun champ ajouté</h3>
                    <p className="text-gray-500 text-center mb-4">
                      Commencez par ajouter des champs à votre formulaire en utilisant les boutons ci-dessus.
                    </p>
                    <Button onClick={() => addField('text')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter le premier champ
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                currentForm.fields
                  .sort((a, b) => a.order - b.order)
                  .map(renderFieldEditor)
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{currentForm.title || 'Formulaire sans titre'}</CardTitle>
              <CardDescription>{currentForm.description}</CardDescription>
              {currentForm.institution && (
                <Badge variant="secondary">{currentForm.institution}</Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {currentForm.fields.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Aucun champ à afficher. Retournez à l'onglet Conception pour ajouter des champs.
                </div>
              ) : (
                currentForm.fields
                  .sort((a, b) => a.order - b.order)
                  .map(renderFieldPreview)
              )}
              
              {currentForm.fields.length > 0 && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button type="submit" className="flex-1">
                    Soumettre la demande
                  </Button>
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Modèles Préconçus Algériens
              </CardTitle>
              <CardDescription>
                Utilisez ces modèles adaptés à l'administration algérienne pour créer rapidement vos formulaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {algerianFormTemplates.map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline">{template.category}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        {template.fields.length} champs préconfigurés
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1 mb-4">
                        {template.fields.slice(0, 3).map((field, idx) => (
                          <li key={idx}>• {field.label}</li>
                        ))}
                        {template.fields.length > 3 && (
                          <li>• +{template.fields.length - 3} autres champs</li>
                        )}
                      </ul>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => loadTemplate(template)}
                      >
                        Utiliser ce modèle
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}