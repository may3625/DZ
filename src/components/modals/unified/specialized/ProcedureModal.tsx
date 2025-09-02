import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  ClipboardList, 
  Calendar, 
  User, 
  MapPin, 
  Clock,
  Edit3,
  Eye,
  Save,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Download,
  Share2,
  Bookmark,
  History,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Procedure {
  id: string;
  title: string;
  description: string;
  steps: ProcedureStep[];
  category: string;
  reference: string;
  creationDate: Date;
  lastModified: Date;
  author: string;
  department: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  estimatedDuration: number; // en minutes
  complexity: 'low' | 'medium' | 'high';
  tags: string[];
  metadata?: Record<string, any>;
}

export interface ProcedureStep {
  id: string;
  title: string;
  description: string;
  order: number;
  isRequired: boolean;
  estimatedTime: number; // en minutes
  responsibleRole?: string;
  documents?: string[];
  validationRequired: boolean;
}

export interface ProcedureModalProps {
  title: string;
  description?: string;
  procedure?: Procedure;
  mode: 'view' | 'edit' | 'create' | 'execute';
  onSave?: (procedure: Procedure) => void;
  onExecute?: (procedure: Procedure, data: any) => void;
  onComplete?: (procedure: Procedure, result: any) => void;
  size?: 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

const complexityConfig = {
  low: {
    label: 'Faible',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  medium: {
    label: 'Moyenne',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  high: {
    label: 'Élevée',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
};

const statusConfig = {
  draft: {
    label: 'Brouillon',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  active: {
    label: 'Active',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  inactive: {
    label: 'Inactive',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  archived: {
    label: 'Archivée',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
};

export const ProcedureModal: React.FC<ProcedureModalProps> = ({
  title,
  description,
  procedure,
  mode,
  onSave,
  onExecute,
  onComplete,
  size = 'lg',
  className,
}) => {
  const [formData, setFormData] = useState<Partial<Procedure>>(
    procedure || {
      title: '',
      description: '',
      steps: [],
      category: '',
      reference: '',
      creationDate: new Date(),
      lastModified: new Date(),
      author: '',
      department: '',
      status: 'draft',
      estimatedDuration: 30,
      complexity: 'medium',
      tags: [],
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionData, setExecutionData] = useState<Record<string, any>>({});

  const handleInputChange = useCallback((field: keyof Procedure, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleStepChange = useCallback((stepId: string, field: keyof ProcedureStep, value: any) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps?.map(step => 
        step.id === stepId ? { ...step, [field]: value } : step
      ) || []
    }));
  }, []);

  const addStep = useCallback(() => {
    const newStep: ProcedureStep = {
      id: `step_${Date.now()}`,
      title: '',
      description: '',
      order: (formData.steps?.length || 0) + 1,
      isRequired: true,
      estimatedTime: 5,
      validationRequired: false,
    };
    
    setFormData(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }));
  }, [formData.steps?.length]);

  const removeStep = useCallback((stepId: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps?.filter(step => step.id !== stepId) || []
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.title || !formData.description) {
      setError('Le titre et la description sont obligatoires');
      return;
    }

    if (!formData.steps || formData.steps.length === 0) {
      setError('Au moins une étape est requise');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const procedureToSave: Procedure = {
        id: procedure?.id || `proc_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        steps: formData.steps || [],
        category: formData.category || '',
        reference: formData.reference || '',
        creationDate: formData.creationDate || new Date(),
        lastModified: new Date(),
        author: formData.author || '',
        department: formData.department || '',
        status: formData.status || 'draft',
        estimatedDuration: formData.estimatedDuration || 30,
        complexity: formData.complexity || 'medium',
        tags: formData.tags || [],
        metadata: formData.metadata,
      };

      if (onSave) {
        await onSave(procedureToSave);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  }, [formData, procedure, onSave]);

  const handleExecute = useCallback(async () => {
    if (!procedure) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (onExecute) {
        await onExecute(procedure, executionData);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'exécution');
    } finally {
      setLoading(false);
    }
  }, [procedure, executionData, onExecute]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const renderViewMode = () => (
    <div className="space-y-4">
      {/* Procedure Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="p-2 rounded-full bg-blue-50">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{procedure?.title}</h3>
                  <p className="text-sm text-gray-600">{procedure?.reference}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  {procedure?.creationDate && formatDate(procedure.creationDate)}
                </span>
                <span className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  {procedure?.author}
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  {procedure?.department}
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  {procedure?.estimatedDuration && formatDuration(procedure.estimatedDuration)}
                </span>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              {procedure && statusConfig[procedure.status] && (
                <Badge
                  variant="outline"
                  className={cn(
                    statusConfig[procedure.status].bgColor,
                    statusConfig[procedure.status].borderColor,
                    statusConfig[procedure.status].color
                  )}
                >
                  {statusConfig[procedure.status].label}
                </Badge>
              )}
              {procedure && complexityConfig[procedure.complexity] && (
                <Badge variant="outline">
                  {complexityConfig[procedure.complexity].label}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-gray-600">{procedure?.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Catégorie</h4>
              <p className="text-sm text-gray-600">{procedure?.category}</p>
            </div>
            
            {procedure?.tags && procedure.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {procedure.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      {procedure?.steps && procedure.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Étapes de la procédure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {procedure.steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {step.order}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-medium">{step.title}</h5>
                      {step.isRequired && (
                        <Badge variant="outline" className="text-xs">Requis</Badge>
                      )}
                      {step.validationRequired && (
                        <Badge variant="outline" className="text-xs">Validation</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(step.estimatedTime)}
                      </span>
                      {step.responsibleRole && (
                        <span>{step.responsibleRole}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Télécharger
        </Button>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Partager
        </Button>
        <Button variant="outline">
          <Bookmark className="w-4 h-4 mr-2" />
          Favoris
        </Button>
        {mode === 'execute' && (
          <Button onClick={handleExecute} disabled={loading}>
            <Play className="w-4 h-4 mr-2" />
            Exécuter
          </Button>
        )}
      </div>
    </div>
  );

  const renderEditMode = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Titre *
          </label>
          <Input
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Titre de la procédure"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Référence
          </label>
          <Input
            value={formData.reference || ''}
            onChange={(e) => handleInputChange('reference', e.target.value)}
            placeholder="Référence de la procédure"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Catégorie
          </label>
          <Input
            value={formData.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            placeholder="Catégorie"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Département
          </label>
          <Input
            value={formData.department || ''}
            onChange={(e) => handleInputChange('department', e.target.value)}
            placeholder="Département"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Durée estimée (minutes)
          </label>
          <Input
            type="number"
            value={formData.estimatedDuration || 30}
            onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value) || 30)}
            min="1"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Complexité
          </label>
          <select
            value={formData.complexity || 'medium'}
            onChange={(e) => handleInputChange('complexity', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {Object.entries(complexityConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Description *
        </label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Description de la procédure"
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Steps Management */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Étapes de la procédure</h4>
          <Button variant="outline" size="sm" onClick={addStep}>
            <Plus className="w-4 h-4 mr-1" />
            Ajouter une étape
          </Button>
        </div>
        
        <div className="space-y-3">
          {formData.steps?.map((step, index) => (
            <Card key={step.id}>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Titre de l'étape
                    </label>
                    <Input
                      value={step.title}
                      onChange={(e) => handleStepChange(step.id, 'title', e.target.value)}
                      placeholder="Titre de l'étape"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Durée (minutes)
                    </label>
                    <Input
                      type="number"
                      value={step.estimatedTime}
                      onChange={(e) => handleStepChange(step.id, 'estimatedTime', parseInt(e.target.value) || 5)}
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Description
                  </label>
                  <Textarea
                    value={step.description}
                    onChange={(e) => handleStepChange(step.id, 'description', e.target.value)}
                    placeholder="Description de l'étape"
                    rows={2}
                    className="resize-none"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={step.isRequired}
                        onChange={(e) => handleStepChange(step.id, 'isRequired', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Étape requise</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={step.validationRequired}
                        onChange={(e) => handleStepChange(step.id, 'validationRequired', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Validation requise</span>
                    </label>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeStep(step.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Tags (séparés par des virgules)
        </label>
        <Input
          value={formData.tags?.join(', ') || ''}
          onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          placeholder="tag1, tag2, tag3"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (mode) {
      case 'view':
        return renderViewMode();
      case 'edit':
      case 'create':
        return renderEditMode();
      case 'execute':
        return renderViewMode();
      default:
        return renderViewMode();
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
          
          <div className="flex items-center space-x-2">
            {mode === 'view' && (
              <Button variant="ghost" size="sm">
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <History className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 flex-1 overflow-y-auto max-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
};

// Composants manquants
const Plus: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("w-4 h-4", className)}>
    <div className="w-4 h-4 border-2 border-current rounded flex items-center justify-center">
      <div className="w-2 h-0.5 bg-current"></div>
      <div className="w-0.5 h-2 bg-current absolute"></div>
    </div>
  </div>
);

const X: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("w-4 h-4", className)}>
    <div className="w-4 h-4 relative">
      <div className="w-4 h-0.5 bg-current absolute top-1/2 left-0 transform -translate-y-1/2 rotate-45"></div>
      <div className="w-4 h-0.5 bg-current absolute top-1/2 left-0 transform -translate-y-1/2 -rotate-45"></div>
    </div>
  </div>
);