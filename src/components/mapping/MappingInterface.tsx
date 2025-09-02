import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import SourceTextPanel from './SourceTextPanel';
import TargetFieldsPanel from './TargetFieldsPanel';
import { MappingResult, MappedField } from '@/types/mapping';
import { StructuredPublication } from '@/services/enhanced/algerianLegalRegexService';
import intelligentMappingService from '@/services/enhanced/intelligentMappingService';
import { RefreshCw, Download, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MappingInterfaceProps {
  structuredPublication: StructuredPublication | null;
  onMappingComplete?: (result: MappingResult) => void;
  className?: string;
}

const MappingInterface: React.FC<MappingInterfaceProps> = ({
  structuredPublication,
  onMappingComplete,
  className
}) => {
  const { toast } = useToast();
  const [selectedFormType, setSelectedFormType] = useState<string>('');
  const [mappingResult, setMappingResult] = useState<MappingResult | null>(null);
  const [mappedFields, setMappedFields] = useState<MappedField[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Schémas disponibles
  const availableSchemas = intelligentMappingService.getAvailableFormSchemas();

  // Mapping automatique au changement
  useEffect(() => {
    if (structuredPublication && selectedFormType) {
      performMapping();
    }
  }, [structuredPublication, selectedFormType]);

  const performMapping = async () => {
    if (!structuredPublication || !selectedFormType) return;

    setIsLoading(true);
    try {
      const result = await intelligentMappingService.mapExtractedDataToForm(
        structuredPublication,
        selectedFormType
      );
      setMappingResult(result);
      setMappedFields(result.mappedFields);
      
      toast({
        title: "Mapping effectué",
        description: `${result.mappedCount}/${result.totalFields} champs mappés avec ${result.overallConfidence}% de confiance`
      });
    } catch (error) {
      toast({
        title: "Erreur de mapping",
        description: "Impossible d'effectuer le mapping automatique",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = (fieldName: string) => {
    const updatedFields = intelligentMappingService.acceptSuggestion(fieldName, mappedFields);
    if (updatedFields) {
      setMappedFields(updatedFields);
      updateMappingResult(updatedFields);
    }
  };

  const handleEdit = (fieldName: string, newValue: string) => {
    const updatedFields = intelligentMappingService.editFieldValue(fieldName, newValue, mappedFields);
    if (updatedFields) {
      setMappedFields(updatedFields);
      updateMappingResult(updatedFields);
    }
  };

  const handleReject = (fieldName: string) => {
    const updatedFields = intelligentMappingService.rejectSuggestion(fieldName, mappedFields);
    if (updatedFields) {
      setMappedFields(updatedFields);
      updateMappingResult(updatedFields);
    }
  };

  const handleSearch = (query: string) => {
    if (!structuredPublication?.content) return [];
    return intelligentMappingService.searchInSource(query);
  };

  const updateMappingResult = (fields: MappedField[]) => {
    if (!mappingResult) return;
    
    const newConfidence = intelligentMappingService.recalculateConfidence(fields);
    const updatedResult = {
      ...mappingResult,
      mappedFields: fields,
      overallConfidence: newConfidence,
      mappedCount: fields.filter(f => f.mappedValue).length
    };
    
    setMappingResult(updatedResult);
    onMappingComplete?.(updatedResult);
  };

  return (
    <div className={className}>
      {/* En-tête de contrôle */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedFormType} onValueChange={setSelectedFormType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type de formulaire" />
                </SelectTrigger>
                <SelectContent>
                  {availableSchemas.map(schema => (
                    <SelectItem key={schema.type} value={schema.type}>
                      {schema.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={performMapping} 
              disabled={!selectedFormType || !structuredPublication || isLoading}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Remapper
            </Button>

            {mappingResult && (
              <Badge variant="outline">
                {mappingResult.overallConfidence}% confiance
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interface principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
        {/* Panneau source */}
        <SourceTextPanel
          sourceText={structuredPublication?.content || ''}
          entities={structuredPublication?.entities || []}
          mappedFields={mappedFields.map(f => f.fieldName)}
          onSearch={handleSearch}
          className="border rounded-lg"
        />

        {/* Panneau destination */}
        <TargetFieldsPanel
          mappedFields={mappedFields}
          unmappedFields={mappingResult?.unmappedFields || []}
          overallConfidence={mappingResult?.overallConfidence || 0}
          onAccept={handleAccept}
          onEdit={handleEdit}
          onReject={handleReject}
          onSearch={handleSearch}
          className="border rounded-lg"
        />
      </div>
    </div>
  );
};

export default MappingInterface;