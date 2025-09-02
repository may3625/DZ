/**
 * Interface de révision manuelle des mappings incertains
 * Permet aux utilisateurs de réviser et corriger les mappings automatiques
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  AlertTriangle, 
  Search,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Lightbulb
} from 'lucide-react';
import { MappedField } from '@/types/mapping';
import { useToast } from '@/hooks/use-toast';

interface MappingReviewInterfaceProps {
  mappedFields: MappedField[];
  sourceText: string;
  onFieldUpdate: (fieldName: string, newValue: string, confidence: number) => void;
  onReviewComplete: (reviewedFields: MappedField[]) => void;
  className?: string;
}

export const MappingReviewInterface: React.FC<MappingReviewInterfaceProps> = ({
  mappedFields,
  sourceText,
  onFieldUpdate,
  onReviewComplete,
  className
}) => {
  const { toast } = useToast();
  const [reviewFields, setReviewFields] = useState<MappedField[]>([]);
  const [selectedField, setSelectedField] = useState<MappedField | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Identifier les champs incertains (confiance < 80%)
  const uncertainFields = mappedFields.filter(field => field.confidence < 80);
  const lowConfidenceFields = mappedFields.filter(field => field.confidence < 60);
  const criticalFields = mappedFields.filter(field => 
    field.confidence < 40 || !field.mappedValue || field.mappedValue.trim() === ''
  );

  useEffect(() => {
    setReviewFields([...uncertainFields]);
  }, [mappedFields]);

  const handleFieldSelect = (field: MappedField) => {
    setSelectedField(field);
    setEditValue(field.mappedValue || '');
    setIsEditing(false);
  };

  const handleFieldEdit = () => {
    setIsEditing(true);
  };

  const handleFieldSave = () => {
    if (!selectedField) return;

    // Calculer nouvelle confiance basée sur l'édition manuelle
    const newConfidence = Math.min(95, Math.max(selectedField.confidence, 75));
    
    // Mettre à jour le champ
    const updatedField = {
      ...selectedField,
      mappedValue: editValue,
      confidence: newConfidence,
      isEdited: true,
      originalValue: selectedField.mappedValue
    };

    // Mettre à jour la liste des champs
    setReviewFields(prev => 
      prev.map(field => 
        field.fieldName === selectedField.fieldName ? updatedField : field
      )
    );

    setSelectedField(updatedField);
    setIsEditing(false);

    // Notifier le parent
    onFieldUpdate(selectedField.fieldName, editValue, newConfidence);

    toast({
      title: "Champ mis à jour",
      description: `Le champ "${selectedField.fieldLabel}" a été mis à jour`
    });
  };

  const handleFieldApprove = (field: MappedField) => {
    const approvedField = {
      ...field,
      confidence: Math.min(90, field.confidence + 15),
      isApproved: true
    };

    setReviewFields(prev => 
      prev.map(f => f.fieldName === field.fieldName ? approvedField : f)
    );

    onFieldUpdate(field.fieldName, field.mappedValue || '', approvedField.confidence);

    toast({
      title: "Champ approuvé",
      description: `Le champ "${field.fieldLabel}" a été approuvé`
    });
  };

  const handleFieldReject = (field: MappedField) => {
    const rejectedField = {
      ...field,
      mappedValue: '',
      confidence: 0,
      isRejected: true
    };

    setReviewFields(prev => 
      prev.map(f => f.fieldName === field.fieldName ? rejectedField : f)
    );

    onFieldUpdate(field.fieldName, '', 0);

    toast({
      title: "Champ rejeté",
      description: `Le champ "${field.fieldLabel}" a été rejeté`
    });
  };

  const searchInSource = (term: string) => {
    const regex = new RegExp(term, 'gi');
    const matches = sourceText.match(regex);
    return matches ? matches.length : 0;
  };

  const handleCompleteReview = () => {
    const reviewedFields = mappedFields.map(originalField => {
      const reviewedField = reviewFields.find(rf => rf.fieldName === originalField.fieldName);
      return reviewedField || originalField;
    });

    onReviewComplete(reviewedFields);

    toast({
      title: "Révision terminée",
      description: `${reviewFields.length} champs ont été révisés`
    });
  };

  const pendingReviewCount = reviewFields.filter(f => 
    !(f as any).isApproved && !(f as any).isRejected && !f.isEdited
  ).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête de statut */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="w-5 h-5" />
            Interface de Révision des Mappings Incertains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{uncertainFields.length}</div>
              <div className="text-sm text-orange-700">Champs incertains</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{criticalFields.length}</div>
              <div className="text-sm text-red-700">Champs critiques</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pendingReviewCount}</div>
              <div className="text-sm text-blue-700">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {reviewFields.length - pendingReviewCount}
              </div>
              <div className="text-sm text-green-700">Révisés</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des champs à réviser */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Champs à Réviser
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewFields.map((field, index) => (
              <div
                key={field.fieldName}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedField?.fieldName === field.fieldName
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleFieldSelect(field)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{field.fieldLabel}</div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        field.confidence < 40 ? 'destructive' :
                        field.confidence < 60 ? 'secondary' : 'outline'
                      }
                    >
                      {field.confidence}%
                    </Badge>
                    {(field as any).isApproved && <ThumbsUp className="w-4 h-4 text-green-500" />}
                    {(field as any).isRejected && <ThumbsDown className="w-4 h-4 text-red-500" />}
                    {field.isEdited && <Edit3 className="w-4 h-4 text-blue-500" />}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 truncate">
                  {field.mappedValue || <span className="italic">Aucune valeur</span>}
                </div>
                
                {field.suggestions && field.suggestions.length > 0 && (
                  <div className="mt-2 text-xs text-orange-600">
                    Suggestions: {field.suggestions.slice(0, 2).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Panneau de révision détaillée */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Révision Détaillée
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedField ? (
              <>
                <div>
                  <div className="font-medium mb-2">{selectedField.fieldLabel}</div>
                  <div className="text-sm text-gray-600 mb-2">
                    Confiance: {selectedField.confidence}% | 
                    Type: {(selectedField as any).fieldType || 'text'}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    {(selectedField as any).fieldType === 'textarea' ? (
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Saisir la valeur corrigée..."
                        rows={4}
                      />
                    ) : (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Saisir la valeur corrigée..."
                      />
                    )}
                    
                    <div className="flex gap-2">
                      <Button onClick={handleFieldSave} size="sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </Button>
                      <Button 
                        onClick={() => setIsEditing(false)} 
                        variant="outline" 
                        size="sm"
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded border">
                      <div className="text-sm font-medium mb-1">Valeur actuelle:</div>
                      <div className="text-gray-700">
                        {selectedField.mappedValue || (
                          <span className="italic text-gray-500">Aucune valeur détectée</span>
                        )}
                      </div>
                    </div>

                    {/* Suggestions */}
                    {selectedField.suggestions && selectedField.suggestions.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Suggestions:</span>
                        </div>
                        {selectedField.suggestions.map((suggestion, idx) => (
                          <div key={idx} className="text-sm text-blue-700 mb-1">
                            • {suggestion}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recherche dans le texte source */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Rechercher dans le texte source..."
                        />
                        <Button variant="outline" size="sm">
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {searchTerm && (
                        <div className="text-xs text-gray-600">
                          {searchInSource(searchTerm)} occurrence(s) trouvée(s)
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button onClick={handleFieldEdit} size="sm">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Éditer
                      </Button>
                      <Button 
                        onClick={() => handleFieldApprove(selectedField)} 
                        variant="outline" 
                        size="sm"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Approuver
                      </Button>
                      <Button 
                        onClick={() => handleFieldReject(selectedField)} 
                        variant="destructive" 
                        size="sm"
                      >
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Sélectionnez un champ à réviser
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions finales */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {pendingReviewCount} champ(s) en attente de révision
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setReviewFields([...uncertainFields])} 
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
              <Button onClick={handleCompleteReview}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Terminer la Révision
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Conseils pour la révision :</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Vérifiez les champs avec une confiance &lt; 60% en priorité</li>
            <li>• Utilisez la recherche pour localiser les valeurs dans le texte source</li>
            <li>• Les suggestions automatiques peuvent vous aider à identifier les bonnes valeurs</li>
            <li>• N'hésitez pas à rejeter les valeurs incorrectes plutôt que de les corriger approximativement</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};