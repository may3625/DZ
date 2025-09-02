import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Edit2, 
  X, 
  Save, 
  RotateCcw,
  Search,
  AlertCircle
} from 'lucide-react';
import { MappedField } from '@/types/mapping';
import { cn } from '@/lib/utils';

interface MappingActionsProps {
  field: MappedField;
  onAccept: (fieldName: string) => void;
  onEdit: (fieldName: string, newValue: string) => void;
  onReject: (fieldName: string) => void;
  onSearch: (query: string) => void;
  className?: string;
}

const MappingActions: React.FC<MappingActionsProps> = ({
  field,
  onAccept,
  onEdit,
  onReject,
  onSearch,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(field.mappedValue || '');

  const handleSaveEdit = () => {
    onEdit(field.fieldName, editValue);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(field.mappedValue || '');
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditValue(field.mappedValue || field.suggestedValue || '');
    setIsEditing(true);
  };

  const handleSearchSuggestion = () => {
    const searchTerm = field.suggestedValue || field.fieldLabel;
    onSearch(searchTerm);
  };

  const getConfidenceVariant = (confidence: number) => {
    if (confidence >= 80) return 'default';
    if (confidence >= 60) return 'secondary';
    return 'destructive';
  };

  const getStatusBadge = () => {
    if (field.isEdited) {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          <Edit2 className="h-3 w-3 mr-1" />
          Modifié
        </Badge>
      );
    }
    
    if (field.isAccepted) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Check className="h-3 w-3 mr-1" />
          Accepté
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-orange-600 border-orange-600">
        <AlertCircle className="h-3 w-3 mr-1" />
        En attente
      </Badge>
    );
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Statut et confiance */}
      <div className="flex items-center justify-between">
        {getStatusBadge()}
        <Badge variant={getConfidenceVariant(field.confidence)}>
          {field.confidence}% confiance
        </Badge>
      </div>

      {/* Valeur actuelle/suggestion */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          {field.isAccepted ? 'Valeur acceptée:' : 'Suggestion:'}
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Entrer une valeur..."
              className="w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editValue.trim()}
              >
                <Save className="h-3 w-3 mr-1" />
                Sauvegarder
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
              >
                <X className="h-3 w-3 mr-1" />
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3 border rounded-md bg-muted/50">
            <div className="text-sm">
              {field.mappedValue || field.suggestedValue || (
                <span className="text-muted-foreground italic">Aucune suggestion</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions principales */}
      {!isEditing && (
        <div className="grid grid-cols-2 gap-2">
          {!field.isAccepted && field.suggestedValue && (
            <Button
              size="sm"
              onClick={() => onAccept(field.fieldName)}
              className="w-full"
            >
              <Check className="h-3 w-3 mr-1" />
              Accepter
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleStartEdit}
            className="w-full"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Éditer
          </Button>
          
          {field.suggestedValue && !field.isAccepted && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(field.fieldName)}
              className="w-full"
            >
              <X className="h-3 w-3 mr-1" />
              Rejeter
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSearchSuggestion}
            className="w-full"
          >
            <Search className="h-3 w-3 mr-1" />
            Rechercher
          </Button>
        </div>
      )}

      {/* Informations supplémentaires */}
      {field.originalValue && field.isEdited && (
        <div className="text-xs text-muted-foreground border-t pt-2">
          <div>Valeur originale: {field.originalValue}</div>
        </div>
      )}

      {/* Entités sources */}
      {field.sourceEntities.length > 0 && (
        <div className="text-xs text-muted-foreground border-t pt-2">
          <div className="font-medium mb-1">Basé sur:</div>
          <div className="space-y-1">
            {field.sourceEntities.map((entity, index) => (
              <div key={index} className="flex justify-between">
                <span>• {entity.value}</span>
                <span>({Math.round(entity.confidence)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset pour les champs modifiés */}
      {field.isEdited && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const originalValue = field.originalValue || field.suggestedValue || '';
            onEdit(field.fieldName, originalValue);
          }}
          className="w-full text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Restaurer suggestion
        </Button>
      )}
    </div>
  );
};

export default MappingActions;