import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  CheckCircle, 
  Edit, 
  Search, 
  Target,
  AlertCircle,
  Zap,
  Loader2,
  RotateCcw,
  AlertTriangle,
  MapPin,
  FileText
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlgerianExtractionResult } from '@/services/enhanced/algerianDocumentExtractionService';
import { MappingResult, MappedField } from '@/types/mapping';
import { intelligentMappingService } from '@/services/enhanced/intelligentMappingService';
import { algerianLegalRegexService } from '@/services/enhanced/algerianLegalRegexService';
import { logger } from '@/utils/logger';
import { useOCRWorkflowContinuity } from '@/hooks/useOCRWorkflowContinuity';

interface MappingTabProps {
  extractedDocument?: AlgerianExtractionResult | null;
  onMappingComplete?: (mappingResult: MappingResult) => void;
  mappingResult?: MappingResult | null;
}

export function MappingTab({ extractedDocument, onMappingComplete, mappingResult }: MappingTabProps) {
  const workflowContinuity = useOCRWorkflowContinuity();
  
  // Utiliser les données réelles du hook au lieu des props
  const realExtractedDocument = workflowContinuity.data?.extractedDocument || extractedDocument;
  const realMappingResult = workflowContinuity.data?.mappingResult || mappingResult;
  const realExtractedText = workflowContinuity.data?.extractedText?.content;
  
  const [isMapping, setIsMapping] = useState(false);
  const [mappingProgress, setMappingProgress] = useState(0);
  const [selectedFormType, setSelectedFormType] = useState<'loi' | 'decret' | 'arrete' | 'circulaire' | 'journal_officiel'>('loi');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editValue, setEditValue] = useState('');
  const [showRealData, setShowRealData] = useState(true);

  // Déclencher le mapping automatiquement quand on a un document extrait
  useEffect(() => {
    console.log('🔄 [MappingTab] useEffect trigger:', {
      hasRealExtractedDocument: !!realExtractedDocument,
      hasRealExtractedText: !!realExtractedText,
      hasRealMappingResult: !!realMappingResult,
      isMapping,
      extractionCompleted: workflowContinuity.completedTabs.extraction
    });
    
    // Déclencher automatiquement le mapping si l'extraction est terminée et qu'aucun résultat n'existe encore
    if (realExtractedText && !realMappingResult && !isMapping && workflowContinuity.completedTabs.extraction) {
      performAutomaticMapping();
    }
  }, [realExtractedDocument, realExtractedText, workflowContinuity.completedTabs.extraction]);

  const performAutomaticMapping = async () => {
    console.log('🎯 [MappingTab] Début du mapping automatique');
    console.log('📋 [MappingTab] realExtractedDocument:', realExtractedDocument);
    console.log('📋 [MappingTab] realExtractedText:', realExtractedText);
    console.log('📋 [MappingTab] workflowContinuity.data:', workflowContinuity.data);
    
    if (!realExtractedDocument && !realExtractedText) {
      console.error('❌ [MappingTab] Aucun document ou texte extrait disponible');
      return;
    }

    setIsMapping(true);
    setMappingProgress(0);

    try {
      console.log('🚀 [MappingTab] Démarrage du mapping...');
      
      const progressInterval = setInterval(() => {
        setMappingProgress(prev => Math.min(prev + 15, 85));
      }, 300);

      // Utiliser le texte extrait depuis le hook de continuité en priorité
      const textToProcess = realExtractedText || 
                           realExtractedDocument?.extractedText || 
                           workflowContinuity.data?.extractedText?.content || 
                           '';
      
      console.log('📄 [MappingTab] Texte à traiter:', textToProcess.substring(0, 100) + '...');

      // Étape 1: Extraire les entités juridiques
      const structuredPublication = await algerianLegalRegexService.processText(textToProcess);

      console.log('🔍 [MappingTab] Entités structurées extraites:', structuredPublication);

      // Étape 2: Mapper vers le formulaire sélectionné
      const result = await intelligentMappingService.mapExtractedDataToForm(
        structuredPublication,
        selectedFormType
      );
      
      console.log('✅ [MappingTab] Résultat du mapping:', result);

      clearInterval(progressInterval);
      setMappingProgress(100);

      // Sauvegarder dans le hook et appeler le callback
      console.log('💾 [MappingTab] Sauvegarde du mapping...');
      const mappingId = await workflowContinuity.saveMappingData(result);
      console.log('✅ [MappingTab] Mapping sauvegardé avec ID:', mappingId);
      
      if (onMappingComplete) {
        onMappingComplete(result);
      }
      
      setTimeout(() => {
        setIsMapping(false);
        console.log('🎉 [MappingTab] Mapping terminé avec succès');
      }, 500);

    } catch (error) {
      console.error('❌ [MappingTab] Erreur mapping:', error);
      setIsMapping(false);
      setMappingProgress(0);
    }
  };

  const handleFieldEdit = (fieldName: string, currentValue: string) => {
    setEditingField(fieldName);
    setEditValue(currentValue);
  };

  const saveFieldEdit = () => {
    if (!realMappingResult || !editingField) return;

    const updatedFields = realMappingResult.mappedFields.map(field => {
      if (field.fieldName === editingField) {
        return {
          ...field,
          mappedValue: editValue,
          isEdited: true,
          isAccepted: true,
          // Recalcul de confiance : légèrement diminuée pour les modifications manuelles
          confidence: Math.max(field.confidence * 0.9, 0.7)
        };
      }
      return field;
    });

    // Recalcul de la confiance globale et du pourcentage d'achèvement
    const overallConfidence = intelligentMappingService.recalculateConfidence(updatedFields);
    const mappedCount = updatedFields.filter(f => f.mappedValue && f.isAccepted).length;

    const updatedResult = {
      ...realMappingResult,
      mappedFields: updatedFields,
      overallConfidence,
      confidence: overallConfidence,
      mappedCount
    };

    workflowContinuity.saveMappingData(updatedResult);
    if (onMappingComplete) {
      onMappingComplete(updatedResult);
    }
    setEditingField(null);
    setEditValue('');
  };

  const acceptSuggestion = (fieldName: string) => {
    if (!realMappingResult) return;

    const updatedFields = realMappingResult.mappedFields.map(field => {
      if (field.fieldName === fieldName) {
        return {
          ...field,
          mappedValue: field.suggestedValue,
          isAccepted: true,
          // Amélioration de confiance pour les acceptations de suggestions
          confidence: Math.min(field.confidence * 1.1, 0.95)
        };
      }
      return field;
    });

    // Recalcul global après acceptation
    const overallConfidence = intelligentMappingService.recalculateConfidence(updatedFields);
    const mappedCount = updatedFields.filter(f => f.mappedValue && f.isAccepted).length;

    const updatedResult = {
      ...realMappingResult,
      mappedFields: updatedFields,
      overallConfidence,
      confidence: overallConfidence,
      mappedCount
    };

    workflowContinuity.saveMappingData(updatedResult);
    if (onMappingComplete) {
      onMappingComplete(updatedResult);
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return <Badge className="bg-green-100 text-green-800">Élevée</Badge>;
    if (confidence >= 0.7) return <Badge className="bg-yellow-100 text-yellow-800">Moyenne</Badge>;
    if (confidence >= 0.5) return <Badge className="bg-orange-100 text-orange-800">Faible</Badge>;
    return <Badge className="bg-red-100 text-red-800">Très faible</Badge>;
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return <mark key={index} className="bg-yellow-200">{part}</mark>;
      }
      return part;
    });
  };

  if (!realExtractedDocument) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Veuillez d'abord extraire un document</p>
        </CardContent>
      </Card>
    );
  }

  if (isMapping) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 animate-pulse" />
            Mapping Intelligent en Cours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={mappingProgress} className="w-full" />
          <p className="text-sm text-gray-600 text-center">
            {mappingProgress < 30 && "Analyse des entités juridiques..."}
            {mappingProgress >= 30 && mappingProgress < 60 && "Mapping des champs..."}
            {mappingProgress >= 60 && mappingProgress < 85 && "Calcul de la confiance..."}
            {mappingProgress >= 85 && "Finalisation du mapping..."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!realMappingResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Phase 2: Mapping Intelligent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p>Sélectionnez le type de formulaire cible</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button
                variant={selectedFormType === 'loi' ? 'default' : 'outline'}
                onClick={() => setSelectedFormType('loi')}
                className="text-sm"
              >
                Loi
              </Button>
              <Button
                variant={selectedFormType === 'decret' ? 'default' : 'outline'}
                onClick={() => setSelectedFormType('decret')}
                className="text-sm"
              >
                Décret
              </Button>
              <Button
                variant={selectedFormType === 'arrete' ? 'default' : 'outline'}
                onClick={() => setSelectedFormType('arrete')}
                className="text-sm"
              >
                Arrêté
              </Button>
              <Button
                variant={selectedFormType === 'circulaire' ? 'default' : 'outline'}
                onClick={() => setSelectedFormType('circulaire')}
                className="text-sm"
              >
                Circulaire
              </Button>
              <Button
                variant={selectedFormType === 'journal_officiel' ? 'default' : 'outline'}
                onClick={() => setSelectedFormType('journal_officiel')}
                className="text-sm"
              >
                Journal Officiel
              </Button>
            </div>
            <Button onClick={performAutomaticMapping} className="mt-4">
              <Zap className="w-4 h-4 mr-2" />
              Démarrer le Mapping
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Panneau d'état des données réelles */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <MapPin className="w-5 h-5" />
            🗺️ Mapping Intelligent (Données Réelles)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className={workflowContinuity.completedTabs.extraction ? "text-green-600" : "text-red-500"}>
                {workflowContinuity.completedTabs.extraction ? "✅" : "❌"}
              </span>
              <span>Extraction {workflowContinuity.completedTabs.extraction ? "OK" : "Pas d'extraction"}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={realMappingResult ? "text-green-600" : "text-orange-500"}>
                {realMappingResult ? "✅" : "🔄"}
              </span>
              <span>Mapping {realMappingResult ? "OK" : "En attente"}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📊</span>
              <span>Confiance: {realMappingResult ? Math.round((realMappingResult.overallConfidence || 0) * 100) : 0}%</span>
            </div>
          </div>
          
          {realExtractedText && (
            <div className="mt-4 p-3 bg-white/70 rounded border">
              <h4 className="font-medium text-sm mb-2">📄 Texte extrait :</h4>
              <p className="text-xs text-muted-foreground">
                {realExtractedText.substring(0, 150)}...
              </p>
              <p className="text-xs mt-2 text-green-600">
                🎯 Confiance: {Math.round((workflowContinuity.data?.extractedText?.confidence || 0) * 100)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sélecteur de type de formulaire */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Configuration du Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type de document juridique :</label>
              <Select value={selectedFormType} onValueChange={(value: any) => setSelectedFormType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loi">Loi</SelectItem>
                  <SelectItem value="decret">Décret</SelectItem>
                  <SelectItem value="arrete">Arrêté</SelectItem>
                  <SelectItem value="circulaire">Circulaire</SelectItem>
                  <SelectItem value="journal_officiel">Journal Officiel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {workflowContinuity.completedTabs.extraction ? (
              <Button 
                onClick={performAutomaticMapping}
                disabled={!realExtractedDocument || isMapping}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isMapping ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mapping en cours... {mappingProgress}%
                  </>
                ) : realMappingResult ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Refaire le mapping intelligent
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Démarrer le mapping intelligent
                  </>
                )}
              </Button>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Données d'extraction requises</span>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  Veuillez d'abord extraire un document dans l'onglet "📥 Extraction & Analyse"
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Résumé du mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Mapping Complété - {realMappingResult.formType}
            </div>
            {getConfidenceBadge(realMappingResult.overallConfidence)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{realMappingResult.mappedCount}</div>
              <div className="text-sm text-gray-600">Champs mappés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{realMappingResult.unmappedFields.length}</div>
              <div className="text-sm text-gray-600">Non mappés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(realMappingResult.overallConfidence * 100)}%</div>
              <div className="text-sm text-gray-600">Confiance globale</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{realMappingResult.totalFields}</div>
              <div className="text-sm text-gray-600">Total champs</div>
            </div>
          </div>
          
          {/* Bouton de navigation vers validation */}
          <div className="flex justify-center pt-4 border-t">
            <Button 
              size="lg" 
              onClick={() => workflowContinuity.completeMapping()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Continuer vers Validation & Approbation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interface de mapping principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne gauche: Texte source avec surlignage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Texte Source
            </CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Rechercher dans le texte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">
                {highlightSearchTerm(realExtractedDocument?.extractedText || '', searchQuery)}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Colonne droite: Champs mappés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Champs Mappés ({realMappingResult.mappedFields.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {realMappingResult.mappedFields.map((field, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">{field.fieldLabel}</Label>
                    <div className="flex items-center gap-2">
                      {getConfidenceBadge(field.confidence)}
                      {field.isAccepted && <CheckCircle className="w-4 h-4 text-green-600" />}
                    </div>
                  </div>
                  
                  {editingField === field.fieldName ? (
                    <div className="space-y-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveFieldEdit}>
                          Sauvegarder
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm bg-white border rounded p-2">
                        {field.mappedValue || field.suggestedValue || 'Aucune valeur'}
                      </div>
                      <div className="flex gap-2">
                        {!field.isAccepted && field.suggestedValue && (
                          <Button 
                            size="sm" 
                            onClick={() => acceptSuggestion(field.fieldName)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Accepter
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleFieldEdit(field.fieldName, field.mappedValue || field.suggestedValue || '')}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Éditer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Champs non mappés */}
      {realMappingResult.unmappedFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Champs Non Mappés ({realMappingResult.unmappedFields.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {realMappingResult.unmappedFields.map((fieldName, index) => (
                <Badge key={index} variant="outline" className="justify-center">
                  {fieldName}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}