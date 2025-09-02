import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Scale, 
  Calendar, 
  User, 
  MapPin, 
  Tag,
  Edit3,
  Eye,
  Save,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Download,
  Share2,
  Bookmark,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LegalDocument {
  id: string;
  title: string;
  content: string;
  type: 'law' | 'decree' | 'order' | 'circular' | 'decision' | 'other';
  category: string;
  reference: string;
  publicationDate: Date;
  effectiveDate?: Date;
  authority: string;
  jurisdiction: string;
  status: 'active' | 'inactive' | 'pending' | 'repealed';
  tags: string[];
  metadata?: Record<string, any>;
}

export interface LegalModalProps {
  title: string;
  description?: string;
  document?: LegalDocument;
  mode: 'view' | 'edit' | 'create' | 'approve';
  onSave?: (document: LegalDocument) => void;
  onApprove?: (document: LegalDocument) => void;
  onReject?: (document: LegalDocument, reason: string) => void;
  size?: 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

const documentTypeConfig = {
  law: {
    label: 'Loi',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: Scale,
  },
  decree: {
    label: 'Décret',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: FileText,
  },
  order: {
    label: 'Arrêté',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    icon: FileText,
  },
  circular: {
    label: 'Circulaire',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    icon: FileText,
  },
  decision: {
    label: 'Décision',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: FileText,
  },
  other: {
    label: 'Autre',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    icon: FileText,
  },
};

const statusConfig = {
  active: {
    label: 'Actif',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  inactive: {
    label: 'Inactif',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  pending: {
    label: 'En attente',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  repealed: {
    label: 'Abrogé',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

export const LegalModal: React.FC<LegalModalProps> = ({
  title,
  description,
  document,
  mode,
  onSave,
  onApprove,
  onReject,
  size = 'lg',
  className,
}) => {
  const [formData, setFormData] = useState<Partial<LegalDocument>>(
    document || {
      title: '',
      content: '',
      type: 'other',
      category: '',
      reference: '',
      publicationDate: new Date(),
      authority: '',
      jurisdiction: '',
      status: 'pending',
      tags: [],
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleInputChange = useCallback((field: keyof LegalDocument, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.title || !formData.content) {
      setError('Le titre et le contenu sont obligatoires');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const documentToSave: LegalDocument = {
        id: document?.id || `doc_${Date.now()}`,
        title: formData.title,
        content: formData.content,
        type: formData.type || 'other',
        category: formData.category || '',
        reference: formData.reference || '',
        publicationDate: formData.publicationDate || new Date(),
        effectiveDate: formData.effectiveDate,
        authority: formData.authority || '',
        jurisdiction: formData.jurisdiction || '',
        status: formData.status || 'pending',
        tags: formData.tags || [],
        metadata: formData.metadata,
      };

      if (onSave) {
        await onSave(documentToSave);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  }, [formData, document, onSave]);

  const handleApprove = useCallback(async () => {
    if (!document) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (onApprove) {
        await onApprove(document);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'approbation');
    } finally {
      setLoading(false);
    }
  }, [document, onApprove]);

  const handleReject = useCallback(async () => {
    if (!document || !rejectionReason.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (onReject) {
        await onReject(document, rejectionReason);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors du rejet');
    } finally {
      setLoading(false);
    }
  }, [document, rejectionReason, onReject]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const renderViewMode = () => (
    <div className="space-y-4">
      {/* Document Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {document && documentTypeConfig[document.type] && (
                  <div className={cn(
                    "p-2 rounded-full",
                    documentTypeConfig[document.type].bgColor
                  )}>
                    <div className={documentTypeConfig[document.type].color}>
                      {React.createElement(documentTypeConfig[document.type].icon, { className: "w-4 h-4" })}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{document?.title}</h3>
                  <p className="text-sm text-gray-600">{document?.reference}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  {document?.publicationDate && formatDate(document.publicationDate)}
                </span>
                <span className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  {document?.authority}
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  {document?.jurisdiction}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              {document && statusConfig[document.status] && (
                <Badge
                  variant="outline"
                  className={cn(
                    "mb-2",
                    statusConfig[document.status].bgColor,
                    statusConfig[document.status].borderColor,
                    statusConfig[document.status].color
                  )}
                >
                  {statusConfig[document.status].label}
                </Badge>
              )}
              <Badge variant="outline">
                {document && documentTypeConfig[document.type]?.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Catégorie</h4>
              <p className="text-sm text-gray-600">{document?.category}</p>
            </div>
            
            {document?.tags && document.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {document.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="font-medium mb-2">Contenu</h4>
              <div className="max-h-64 overflow-y-auto p-3 bg-gray-50 rounded text-sm">
                {document?.content}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            placeholder="Titre du document"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Référence
          </label>
          <Input
            value={formData.reference || ''}
            onChange={(e) => handleInputChange('reference', e.target.value)}
            placeholder="Référence du document"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Type de document
          </label>
          <select
            value={formData.type || 'other'}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {Object.entries(documentTypeConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
        
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Autorité
          </label>
          <Input
            value={formData.authority || ''}
            onChange={(e) => handleInputChange('authority', e.target.value)}
            placeholder="Autorité émettrice"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Juridiction
          </label>
          <Input
            value={formData.jurisdiction || ''}
            onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
            placeholder="Juridiction"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Contenu *
        </label>
        <Textarea
          value={formData.content || ''}
          onChange={(e) => handleInputChange('content', e.target.value)}
          placeholder="Contenu du document"
          rows={8}
          className="resize-none"
        />
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

  const renderApproveMode = () => (
    <div className="space-y-4">
      {document && renderViewMode()}
      
      <Separator />
      
      <div className="space-y-4">
        <h4 className="font-medium">Actions d'approbation</h4>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleApprove}
            disabled={loading}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approuver
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setRejectionReason('')}
            disabled={loading}
            className="flex-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rejeter
          </Button>
        </div>
        
        {rejectionReason !== '' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Raison du rejet *
            </label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Expliquer la raison du rejet..."
              rows={3}
            />
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading || !rejectionReason.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejet en cours...
                </>
              ) : (
                'Confirmer le rejet'
              )}
            </Button>
          </div>
        )}
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
      case 'approve':
        return renderApproveMode();
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