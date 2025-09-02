/**
 * Interface de Mapping Intelligent - Phase 2
 * Gère le mapping automatique des données extraites vers les formulaires cibles
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Zap,
  Brain,
  Database,
  FileText,
  Settings,
  BarChart3,
  ArrowRight,
  RefreshCw,
  Info
} from "lucide-react";

interface IntelligentMappingInterfaceProps {
  extractedData?: any;
  onMappingComplete?: (result: any) => void;
}

export const IntelligentMappingInterface: React.FC<IntelligentMappingInterfaceProps> = ({
  extractedData,
  onMappingComplete
}) => {
  const [isMapping, setIsMapping] = useState(false);
  const [mappingProgress, setMappingProgress] = useState(0);
  const [mappingResult, setMappingResult] = useState<any>(null);
  const [selectedFormType, setSelectedFormType] = useState('administrative');
  const [availableForms] = useState(['administrative', 'legal', 'commercial', 'custom']);

  const handleStartMapping = async () => {
    if (!extractedData) {
      alert('Aucune donnée extraite disponible pour le mapping');
      return;
    }

    setIsMapping(true);
    setMappingProgress(0);

    try {
      // Import du service de mapping intelligent réel
      const { default: intelligentMappingService } = await import('@/services/enhanced/intelligentMappingService');
      
      // Progression réelle du mapping
      setMappingProgress(25);
      
      // Utiliser le VRAI service de mapping avec les VRAIES données
      const realMappingResult = await intelligentMappingService.mapExtractedDataToForm(
        extractedData,
        selectedFormType
      );
      
      setMappingProgress(75);
      
      // Convertir le résultat réel au format attendu par l'interface
      const result = {
        success: realMappingResult.success,
        mappedFields: realMappingResult.mappedFields.map(field => ({
          fieldId: field.fieldId || field.fieldName,
          fieldName: field.fieldName,
          value: field.mappedValue || field.value,
          confidence: field.confidence
        })),
        confidence: realMappingResult.overallConfidence / 100,
        processingTime: realMappingResult.metadata.processingTime
      };

      setMappingProgress(100);
      setMappingResult(result);
      
      if (onMappingComplete) {
        onMappingComplete(result);
      }
    } catch (error) {
      console.error('❌ [MAPPING RÉEL] Erreur:', error);
      alert(`Erreur de mapping: ${error.message}`);
    } finally {
      setIsMapping(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Mapping Intelligent - Phase 2
            <Badge variant="outline" className="bg-blue-50">
              🇩🇿 Phase 2 - Mapping Intelligent
            </Badge>
          </CardTitle>
          <CardDescription>
            Mapping automatique des données extraites vers les formulaires structurés.
            Utilise l'IA pour identifier et mapper les champs avec une haute précision.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">IA Mapping</span>
                </div>
                <div className="text-sm text-blue-700">
                  Algorithmes d'IA pour la reconnaissance automatique des champs
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Précision Élevée</span>
                </div>
                <div className="text-sm text-green-700">
                  Taux de succès {'>'}90% grâce à l'apprentissage automatique
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type de Formulaire</label>
              <select 
                value={selectedFormType}
                onChange={(e) => setSelectedFormType(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                {availableForms.map(form => (
                  <option key={form} value={form}>
                    {form.charAt(0).toUpperCase() + form.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleStartMapping}
                disabled={isMapping || !extractedData}
                className="flex-1"
              >
                {isMapping ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mapping en cours...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Démarrer le Mapping Intelligent
                  </>
                )}
              </Button>
              
              {mappingResult && (
                <Button 
                  onClick={() => {
                    // Naviguer vers l'onglet validation
                    if (onMappingComplete) {
                      onMappingComplete(mappingResult);
                    }
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Continuer vers Validation
                </Button>
              )}
            </div>

            {isMapping && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression du mapping...</span>
                  <span>{mappingProgress}%</span>
                </div>
                <Progress value={mappingProgress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {mappingResult && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Mapping Terminé avec Succès
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {mappingResult.mappedFields.length}
                </div>
                <div className="text-sm text-green-700">Champs Mappés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(mappingResult.confidence * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-green-700">Confiance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {mappingResult.processingTime}ms
                </div>
                <div className="text-sm text-green-700">Temps Traitement</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Champs Mappés :</h4>
              {mappingResult.mappedFields.map((field: any) => (
                <div key={field.fieldId} className="flex justify-between items-center p-2 bg-white rounded border">
                  <span className="font-medium">{field.fieldName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{field.value}</span>
                    <Badge variant="outline" className="text-xs">
                      {(field.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => {
                  // Navigation vers l'étape suivante
                  if (onMappingComplete) {
                    onMappingComplete({
                      ...mappingResult,
                      nextStep: 'validation'
                    });
                  }
                }}
                className="flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Continuer vers Validation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="font-semibold mb-2">🎯 Fonctionnalités du Mapping Intelligent</div>
          <div className="text-sm space-y-1">
            <div>• <strong>Reconnaissance automatique</strong> des types de champs</div>
            <div>• <strong>Mapping sémantique</strong> basé sur l'IA</div>
            <div>• <strong>Validation intelligente</strong> des données</div>
            <div>• <strong>Apprentissage continu</strong> pour améliorer la précision</div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};