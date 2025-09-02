import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MappedField } from '@/types/mapping';
import ConfidenceGauge from './ConfidenceGauge';
import MappingActions from './MappingActions';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface TargetFieldsPanelProps {
  mappedFields: MappedField[];
  unmappedFields: string[];
  overallConfidence: number;
  onAccept: (fieldName: string) => void;
  onEdit: (fieldName: string, newValue: string) => void;
  onReject: (fieldName: string) => void;
  onSearch: (query: string) => void;
  className?: string;
}

const TargetFieldsPanel: React.FC<TargetFieldsPanelProps> = ({
  mappedFields,
  unmappedFields,
  overallConfidence,
  onAccept,
  onEdit,
  onReject,
  onSearch,
  className
}) => {
  // Statistiques de mapping
  const totalFields = mappedFields.length + unmappedFields.length;
  const acceptedFields = mappedFields.filter(f => f.isAccepted).length;
  const editedFields = mappedFields.filter(f => f.isEdited).length;

  // Trier les champs par priorité (requis d'abord, puis par confiance)
  const sortedMappedFields = [...mappedFields].sort((a, b) => {
    // Les champs non mappés en premier
    if (!a.mappedValue && b.mappedValue) return 1;
    if (a.mappedValue && !b.mappedValue) return -1;
    
    // Puis par confiance décroissante
    return b.confidence - a.confidence;
  });

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* En-tête avec statistiques */}
      <div className="border-b border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Champs de destination</h3>
          <Badge variant="outline">
            {mappedFields.length}/{totalFields} mappés
          </Badge>
        </div>

        {/* Confiance globale */}
        <ConfidenceGauge 
          confidence={overallConfidence}
          size="md"
          showLabel={true}
        />

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="font-semibold">{acceptedFields}</span>
            </div>
            <div className="text-muted-foreground">Acceptés</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
              <Badge variant="outline" className="h-4 w-4 p-0 border-0">
                ✎
              </Badge>
              <span className="font-semibold">{editedFields}</span>
            </div>
            <div className="text-muted-foreground">Modifiés</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400">
              <Clock className="h-4 w-4" />
              <span className="font-semibold">{mappedFields.length - acceptedFields}</span>
            </div>
            <div className="text-muted-foreground">En attente</div>
          </div>
        </div>
      </div>

      {/* Liste des champs avec scroll */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Champs mappés */}
          {sortedMappedFields.map((field) => (
            <Card 
              key={field.fieldName}
              className={cn(
                'transition-all duration-200',
                field.isAccepted 
                  ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'
                  : field.mappedValue
                  ? 'border-yellow-200 dark:border-yellow-800'
                  : 'border-red-200 dark:border-red-800'
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-medium">
                    {field.fieldLabel}
                    {field.fieldName.includes('required') && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </CardTitle>
                  <ConfidenceGauge 
                    confidence={field.confidence}
                    size="sm"
                    showLabel={false}
                    className="min-w-[80px]"
                  />
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <MappingActions
                  field={field}
                  onAccept={onAccept}
                  onEdit={onEdit}
                  onReject={onReject}
                  onSearch={onSearch}
                />
              </CardContent>
            </Card>
          ))}

          {/* Champs non mappés */}
          {unmappedFields.length > 0 && (
            <>
              <Separator className="my-6" />
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Champs non mappés ({unmappedFields.length})</span>
                </div>
                
                {unmappedFields.map((fieldName) => (
                  <Card key={fieldName} className="border-dashed border-muted-foreground/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{fieldName}</span>
                        <Badge variant="outline" className="text-muted-foreground">
                          Non détecté
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Aucune correspondance trouvée dans le texte source
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Message si aucun champ */}
          {mappedFields.length === 0 && unmappedFields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Aucun champ de destination configuré</p>
              <p className="text-sm">Veuillez sélectionner un type de formulaire</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Actions globales */}
      <div className="border-t border-border p-4">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            {acceptedFields}/{totalFields} champs validés
          </span>
          {overallConfidence >= 80 && acceptedFields === mappedFields.length && (
            <Badge variant="default" className="text-green-600 border-green-600">
              Prêt à soumettre
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default TargetFieldsPanel;