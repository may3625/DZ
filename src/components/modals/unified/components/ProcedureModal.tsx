/**
 * Modal spécialisée pour les procédures administratives algériennes
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Save, 
  Play, 
  CheckCircle, 
  Clock,
  Plus,
  Trash2,
  ArrowRight,
  Building,
  Users,
  Calendar
} from 'lucide-react';
import { ProcedureModalConfig } from '../types';

interface ProcedureModalProps {
  config: ProcedureModalConfig;
  onClose: () => void;
}

interface ProcedureStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  required: boolean;
  documents: string[];
  responsible: string;
}

export const ProcedureModal: React.FC<ProcedureModalProps> = ({ config, onClose }) => {
  const [procedure, setProcedure] = useState(config.procedure || {
    title: '',
    description: '',
    category: '',
    institution: '',
    duration: '',
    cost: '',
    requirements: [],
    steps: [],
    status: 'draft'
  });

  const [executionData, setExecutionData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [newStep, setNewStep] = useState<ProcedureStep>({
    id: '',
    title: '',
    description: '',
    duration: '',
    required: true,
    documents: [],
    responsible: ''
  });
  const [newRequirement, setNewRequirement] = useState('');
  const [newDocument, setNewDocument] = useState('');

  const procedureCategories = [
    'État civil',
    'Citoyenneté',
    'Logement',
    'Emploi',
    'Éducation',
    'Santé',
    'Justice',
    'Finances',
    'Commerce',
    'Transport',
    'Environnement',
    'Social',
    'Fiscalité',
    'Douanes'
  ];

  const institutions = [
    'Wilaya',
    'Daïra',
    'Commune',
    'Tribunal',
    'Centre des impôts',
    'CNAS',
    'CASNOS',
    'ANEM',
    'ANDI',
    'Banque d\'Algérie',
    'Douanes',
    'Police',
    'Gendarmerie'
  ];

  const responsibles = [
    'Agent d\'accueil',
    'Secrétaire',
    'Chef de service',
    'Directeur',
    'Juge',
    'Greffier',
    'Inspecteur',
    'Contrôleur'
  ];

  const handleSave = () => {
    if (config.onSave) {
      config.onSave(procedure);
    }
    onClose();
  };

  const handleExecute = () => {
    if (config.onExecute) {
      config.onExecute(procedure, executionData);
    }
    if (config.onComplete) {
      config.onComplete(procedure, executionData);
    }
    onClose();
  };

  const addStep = () => {
    if (newStep.title.trim()) {
      const step: ProcedureStep = {
        ...newStep,
        id: `step_${Date.now()}`
      };
      
      setProcedure(prev => ({
        ...prev,
        steps: [...prev.steps, step]
      }));
      
      setNewStep({
        id: '',
        title: '',
        description: '',
        duration: '',
        required: true,
        documents: [],
        responsible: ''
      });
    }
  };

  const removeStep = (stepId: string) => {
    setProcedure(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !procedure.requirements.includes(newRequirement.trim())) {
      setProcedure(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirement: string) => {
    setProcedure(prev => ({
      ...prev,
      requirements: prev.requirements.filter(r => r !== requirement)
    }));
  };

  const addDocumentToStep = () => {
    if (newDocument.trim()) {
      setNewStep(prev => ({
        ...prev,
        documents: [...prev.documents, newDocument.trim()]
      }));
      setNewDocument('');
    }
  };

  const renderViewMode = () => (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Titre</label>
              <p className="text-sm text-muted-foreground">{procedure.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Catégorie</label>
              <p className="text-sm text-muted-foreground">{procedure.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Institution</label>
              <p className="text-sm text-muted-foreground">{procedure.institution}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Durée estimée</label>
              <p className="text-sm text-muted-foreground">{procedure.duration}</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <p className="text-sm text-muted-foreground">{procedure.description}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium">Coût</label>
              <p className="text-sm text-muted-foreground">{procedure.cost || 'Gratuit'}</p>
            </div>
            <Badge variant={procedure.status === 'active' ? 'default' : 'secondary'}>
              {procedure.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {procedure.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prérequis</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {procedure.requirements.map((req, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {req}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {procedure.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Étapes de la procédure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {procedure.steps.map((step, index) => (
                <div key={step.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{step.title}</h4>
                      {step.required && (
                        <Badge variant="destructive" className="text-xs">
                          Obligatoire
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {step.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {step.responsible}
                      </span>
                    </div>
                    {step.documents.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium">Documents requis:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {step.documents.map((doc, docIndex) => (
                            <Badge key={docIndex} variant="outline" className="text-xs">
                              {doc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderEditMode = () => (
    <div className="p-6">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="requirements">Prérequis</TabsTrigger>
          <TabsTrigger value="steps">Étapes</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Titre *</label>
              <Input
                value={procedure.title}
                onChange={(e) => setProcedure(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de la procédure"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Catégorie *</label>
              <Select
                value={procedure.category}
                onValueChange={(value) => setProcedure(prev => ({ ...prev, category: value }))}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Institution responsable *</label>
              <Select
                value={procedure.institution}
                onValueChange={(value) => setProcedure(prev => ({ ...prev, institution: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une institution" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((institution) => (
                    <SelectItem key={institution} value={institution}>
                      {institution}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Durée estimée</label>
              <Input
                value={procedure.duration}
                onChange={(e) => setProcedure(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="Ex: 2-3 jours ouvrables"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Coût</label>
              <Input
                value={procedure.cost}
                onChange={(e) => setProcedure(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="Ex: 1000 DA ou Gratuit"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={procedure.description}
              onChange={(e) => setProcedure(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description détaillée de la procédure..."
              rows={4}
            />
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prérequis et conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Ajouter un prérequis..."
                  onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                />
                <Button onClick={addRequirement} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {procedure.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{requirement}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeRequirement(requirement)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ajouter une étape</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={newStep.title}
                  onChange={(e) => setNewStep(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de l'étape"
                />
                <Input
                  value={newStep.duration}
                  onChange={(e) => setNewStep(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="Durée (ex: 1 jour)"
                />
              </div>
              
              <Textarea
                value={newStep.description}
                onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de l'étape..."
                rows={3}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={newStep.responsible}
                  onValueChange={(value) => setNewStep(prev => ({ ...prev, responsible: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {responsibles.map((responsible) => (
                      <SelectItem key={responsible} value={responsible}>
                        {responsible}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="required"
                    checked={newStep.required}
                    onCheckedChange={(checked) => setNewStep(prev => ({ ...prev, required: !!checked }))}
                  />
                  <label htmlFor="required" className="text-sm">
                    Étape obligatoire
                  </label>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newDocument}
                  onChange={(e) => setNewDocument(e.target.value)}
                  placeholder="Document requis..."
                  onKeyPress={(e) => e.key === 'Enter' && addDocumentToStep()}
                />
                <Button onClick={addDocumentToStep} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {newStep.documents.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newStep.documents.map((doc, index) => (
                    <Badge key={index} variant="secondary">
                      {doc}
                    </Badge>
                  ))}
                </div>
              )}
              
              <Button onClick={addStep} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter l'étape
              </Button>
            </CardContent>
          </Card>

          {procedure.steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Étapes configurées ({procedure.steps.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {procedure.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 p-3 border rounded">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <div className="flex-1">
                        <p className="font-medium">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeStep(step.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderExecuteMode = () => (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Exécution de la procédure: {procedure.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {procedure.steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              
              return (
                <div key={step.id} className={`flex gap-4 p-4 border rounded-lg ${
                  isCompleted ? 'bg-green-50 border-green-200' : 
                  isActive ? 'bg-blue-50 border-blue-200' : 
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted ? 'bg-green-600 text-white' :
                      isActive ? 'bg-blue-600 text-white' :
                      'bg-gray-400 text-white'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    {step.documents.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs font-medium">Documents requis:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {step.documents.map((doc, docIndex) => (
                            <Badge key={docIndex} variant="outline" className="text-xs">
                              {doc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {isActive && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          onClick={() => setCurrentStep(currentStep + 1)}
                        >
                          Marquer comme terminé
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getContent = () => {
    switch (config.mode) {
      case 'view':
        return renderViewMode();
      case 'edit':
      case 'create':
        return renderEditMode();
      case 'execute':
        return renderExecuteMode();
      default:
        return renderViewMode();
    }
  };

  const getActions = () => {
    switch (config.mode) {
      case 'edit':
      case 'create':
        return (
          <div className="flex justify-end gap-3 p-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              {config.mode === 'create' ? 'Créer' : 'Enregistrer'}
            </Button>
          </div>
        );
      case 'execute':
        return (
          <div className="flex justify-end gap-3 p-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleExecute} disabled={currentStep < procedure.steps.length}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Terminer la procédure
            </Button>
          </div>
        );
      default:
        return (
          <div className="flex justify-end gap-3 p-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-h-[90vh] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {getContent()}
      </div>
      {getActions()}
    </div>
  );
};