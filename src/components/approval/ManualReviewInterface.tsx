/**
 * Interface de révision manuelle des mappings incertains
 * Phase 3 - Interface de Workflow d'Approbation - Finalisation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Search,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApprovalItem } from '@/types/approval';
import { MappingResult, MappedField } from '@/types/mapping';

interface ManualReviewInterfaceProps {
  approvalItem: ApprovalItem;
  onFieldUpdate: (fieldName: string, newValue: string, confidence: number) => void;
  onApprove: (comments?: string) => void;
  onReject: (reason: string) => void;
  onRequestChanges: (changes: Array<{ field: string; suggestion: string; reason: string }>) => void;
  isLoading?: boolean;
}

interface FieldReviewState {
  originalValue: string;
  currentValue: string;
  confidence: number;
  isEdited: boolean;
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'modified';
  reviewComments: string;
}

const ManualReviewInterface: React.FC<ManualReviewInterfaceProps> = ({
  approvalItem,
  onFieldUpdate,
  onApprove,
  onReject,
  onRequestChanges,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('fields');
  const [searchQuery, setSearchQuery] = useState('');
  const [fieldStates, setFieldStates] = useState<Record<string, FieldReviewState>>({});
  const [globalComments, setGlobalComments] = useState('');
  const [reviewDecision, setReviewDecision] = useState<'pending' | 'approve' | 'reject' | 'changes'>('pending');

  // Extraction des données de mapping
  const mappingResult: MappingResult = approvalItem.data?.mappingResult || approvalItem.mappingResults;
  const extractedText: string = approvalItem.data?.extractedText || '';
  const validationErrors = approvalItem.validation_errors || [];

  // Initialisation des états des champs
  useEffect(() => {
    if (mappingResult?.mappedFields) {
      const initialStates: Record<string, FieldReviewState> = {};
      
      mappingResult.mappedFields.forEach(field => {
        initialStates[field.fieldName] = {
          originalValue: field.mappedValue || '',
          currentValue: field.mappedValue || '',
          confidence: field.confidence || 0,
          isEdited: false,
          reviewStatus: 'pending',
          reviewComments: ''
        };
      });
      
      setFieldStates(initialStates);
    }
  }, [mappingResult]);

  /**
   * Mise à jour d'un champ
   */
  const handleFieldUpdate = (fieldName: string, newValue: string) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        currentValue: newValue,
        isEdited: newValue !== prev[fieldName].originalValue,
        reviewStatus: 'modified'
      }
    }));

    // Recalculate real confidence
    const newConfidence = newValue.trim().length > 0 ? 
      Math.min(fieldStates[fieldName]?.confidence + 0.2, 1.0) : 0;

    onFieldUpdate(fieldName, newValue, newConfidence);
  };

  /**
   * Approbation d'un champ individuel
   */
  const handleFieldApprove = (fieldName: string) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        reviewStatus: 'approved'
      }
    }));

    toast({
      title: "Champ approuvé",
      description: `Le champ "${fieldName}" a été approuvé`,
    });
  };

  /**
   * Rejet d'un champ individuel
   */
  const handleFieldReject = (fieldName: string, reason: string) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        reviewStatus: 'rejected',
        reviewComments: reason
      }
    }));

    toast({
      title: "Champ rejeté",
      description: `Le champ "${fieldName}" a été rejeté`,
      variant: "destructive"
    });
  };

  /**
   * Recherche dans le texte source
   */
  const handleSearchInSource = (query: string) => {
    setSearchQuery(query);
    // La mise en surbrillance sera gérée par le composant parent
  };

  /**
   * Validation et soumission de la révision
   */
  const handleSubmitReview = () => {
    switch (reviewDecision) {
      case 'approve': {
        onApprove(globalComments);
        break;
      }
      case 'reject': {
        if (!globalComments.trim()) {
          toast({
            title: "Raison requise",
            description: "Veuillez fournir une raison pour le rejet",
            variant: "destructive"
          });
          return;
        }
        onReject(globalComments);
        break;
      }
      case 'changes': {
        const changes = Object.entries(fieldStates)
          .filter(([_, state]) => state.reviewStatus === 'modified' || state.reviewComments)
          .map(([fieldName, state]) => ({
            field: fieldName,
            suggestion: state.currentValue,
            reason: state.reviewComments || 'Modification suggérée'
          }));
        
        if (changes.length === 0) {
          toast({
            title: "Aucune modification",
            description: "Aucune modification à soumettre",
            variant: "destructive"
          });
          return;
        }
        
        onRequestChanges(changes);
        break;
      }
    }
  };

  /**
   * Calcul des statistiques de révision
   */
  const getReviewStats = () => {
    const totalFields = Object.keys(fieldStates).length;
    const approvedFields = Object.values(fieldStates).filter(s => s.reviewStatus === 'approved').length;
    const modifiedFields = Object.values(fieldStates).filter(s => s.isEdited).length;
    const rejectedFields = Object.values(fieldStates).filter(s => s.reviewStatus === 'rejected').length;

    return { totalFields, approvedFields, modifiedFields, rejectedFields };
  };

  const stats = getReviewStats();

  /**
   * Filtrage des champs selon la recherche
   */
  const filteredFields = mappingResult?.mappedFields?.filter(field =>
    !searchQuery || 
    field.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    field.fieldLabel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(field.mappedValue).toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  /**
   * Rendu d'un champ pour révision
   */
  const renderFieldReview = (field: MappedField) => {
    const fieldState = fieldStates[field.fieldName];
    if (!fieldState) return null;

    const getStatusBadge = (status: string) => {
      const variants = {
        pending: 'outline',
        approved: 'default',
        rejected: 'destructive',
        modified: 'secondary'
      } as const;
      
      const icons = {
        pending: <AlertTriangle className="h-3 w-3" />,
        approved: <CheckCircle2 className="h-3 w-3" />,
        rejected: <XCircle className="h-3 w-3" />,
        modified: <Edit className="h-3 w-3" />
      };

      return (
        <Badge variant={variants[status as keyof typeof variants]} className="flex items-center gap-1">
          {icons[status as keyof typeof icons]}
          {status}
        </Badge>
      );
    };

    return (
      <Card key={field.fieldName} className={`mb-4 ${fieldState.isEdited ? 'border-orange-300' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {field.fieldLabel || field.fieldName}
            </CardTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge(fieldState.reviewStatus)}
              <Badge variant="outline">{Math.round(fieldState.confidence * 100)}%</Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Valeur originale */}
          <div>
            <Label className="text-xs text-muted-foreground">Valeur extraite</Label>
            <div className="mt-1 p-2 bg-muted rounded text-sm">
              {fieldState.originalValue || '(vide)'}
            </div>
          </div>

          {/* Valeur modifiée */}
          <div>
            <Label htmlFor={`field-${field.fieldName}`}>Valeur révisée</Label>
            <Input
              id={`field-${field.fieldName}`}
              value={fieldState.currentValue}
              onChange={(e) => handleFieldUpdate(field.fieldName, e.target.value)}
              placeholder="Entrer la valeur correcte..."
              className="mt-1"
            />
          </div>

          {/* Commentaires de révision */}
          <div>
            <Label htmlFor={`comments-${field.fieldName}`} className="text-xs">
              Commentaires (optionnel)
            </Label>
            <Textarea
              id={`comments-${field.fieldName}`}
              value={fieldState.reviewComments}
              onChange={(e) => setFieldStates(prev => ({
                ...prev,
                [field.fieldName]: {
                  ...prev[field.fieldName],
                  reviewComments: e.target.value
                }
              }))}
              placeholder="Ajouter des commentaires..."
              className="mt-1 min-h-[60px]"
            />
          </div>

          {/* Actions sur le champ */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFieldApprove(field.fieldName)}
              disabled={fieldState.reviewStatus === 'approved'}
              className="flex items-center gap-1"
            >
              <ThumbsUp className="h-3 w-3" />
              Approuver
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const reason = prompt(`Raison du rejet pour "${field.fieldLabel || field.fieldName}" :`);
                if (reason) handleFieldReject(field.fieldName, reason);
              }}
              disabled={fieldState.reviewStatus === 'rejected'}
              className="flex items-center gap-1"
            >
              <ThumbsDown className="h-3 w-3" />
              Rejeter
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleSearchInSource(fieldState.originalValue)}
              className="flex items-center gap-1"
            >
              <Search className="h-3 w-3" />
              Rechercher
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Révision Manuelle - {approvalItem.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalFields}</div>
              <div className="text-sm text-muted-foreground">Total champs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approvedFields}</div>
              <div className="text-sm text-muted-foreground">Approuvés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.modifiedFields}</div>
              <div className="text-sm text-muted-foreground">Modifiés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejectedFields}</div>
              <div className="text-sm text-muted-foreground">Rejetés</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fields">Révision des champs ({stats.totalFields})</TabsTrigger>
          <TabsTrigger value="errors">Erreurs ({validationErrors.length})</TabsTrigger>
          <TabsTrigger value="decision">Décision finale</TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="space-y-4">
          {/* Barre de recherche */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les champs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Liste des champs */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredFields.map(field => renderFieldReview(field))}
              
              {filteredFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4" />
                  <p>Aucun champ trouvé pour "{searchQuery}"</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {validationErrors.map((error, index) => (
                <Card key={index} className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{error.error_message}</div>
                        {error.field_path && (
                          <div className="text-sm text-muted-foreground">
                            Champ: {error.field_path}
                          </div>
                        )}
                        {error.suggested_fix && (
                          <div className="text-sm text-blue-600 mt-1">
                            Suggestion: {error.suggested_fix}
                          </div>
                        )}
                      </div>
                      <Badge variant={error.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {error.severity}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {validationErrors.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Aucune erreur de validation détectée</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="decision" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Décision de révision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sélection de la décision */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={reviewDecision === 'approve' ? 'default' : 'outline'}
                  onClick={() => setReviewDecision('approve')}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approuver
                </Button>
                
                <Button
                  variant={reviewDecision === 'changes' ? 'default' : 'outline'}
                  onClick={() => setReviewDecision('changes')}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Demander modifications
                </Button>
                
                <Button
                  variant={reviewDecision === 'reject' ? 'destructive' : 'outline'}
                  onClick={() => setReviewDecision('reject')}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Rejeter
                </Button>
              </div>

              {/* Commentaires globaux */}
              <div>
                <Label htmlFor="global-comments">
                  Commentaires {reviewDecision === 'reject' ? '(requis)' : '(optionnel)'}
                </Label>
                <Textarea
                  id="global-comments"
                  value={globalComments}
                  onChange={(e) => setGlobalComments(e.target.value)}
                  placeholder={
                    reviewDecision === 'reject' 
                      ? "Expliquer les raisons du rejet..."
                      : "Ajouter des commentaires généraux..."
                  }
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <Separator />

              {/* Bouton de soumission */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitReview}
                  disabled={isLoading || reviewDecision === 'pending'}
                  className="min-w-[150px]"
                >
                  {isLoading ? 'Traitement...' : 'Soumettre la révision'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManualReviewInterface;