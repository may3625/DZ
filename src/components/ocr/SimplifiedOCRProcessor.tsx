/**
 * Composant OCR simplifié - 100% RÉEL - AUCUNE SIMULATION
 * Remplace tous les services de simulation par le service final réel
 */

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Eye,
  Download,
  Languages,
  FileCheck,
  Activity,
  Settings2
} from "lucide-react";
import { finalRealOCRService, FinalRealOCRResult } from '@/services/finalRealOCRService';
import { extractionStatus } from '@/services/extractionStatusService';
import { useToast } from "@/hooks/use-toast";
import { OCRTextDisplay } from '@/components/common/OCRTextDisplay';
import { correctArabicOCR } from '@/utils/arabicOCRCorrections';

interface SimplifiedOCRProcessorProps {
  language?: string;
}

interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: any;
  error?: string;
}

export function SimplifiedOCRProcessor({ language = "fr" }: SimplifiedOCRProcessorProps) {
  // États du composant
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<FinalRealOCRResult | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Références
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialiser les étapes de traitement
  const initializeSteps = () => {
    const steps: ProcessingStep[] = [
      {
        id: 'upload',
        name: '1. Validation du fichier',
        status: 'pending',
        progress: 0
      },
      {
        id: 'init',
        name: '2. Initialisation OCR',
        status: 'pending',
        progress: 0
      },
      {
        id: 'extraction',
        name: '3. Extraction de texte',
        status: 'pending',
        progress: 0
      },
      {
        id: 'entities',
        name: '4. Détection d\'entités',
        status: 'pending',
        progress: 0
      },
      {
        id: 'complete',
        name: '5. Finalisation',
        status: 'pending',
        progress: 0
      }
    ];
    setProcessingSteps(steps);
    return steps;
  };

  // Mettre à jour une étape
  const updateStep = (stepId: string, status: ProcessingStep['status'], progress: number, result?: any, error?: string) => {
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, progress, result, error }
        : step
    ));
  };

  // Gestion drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      setSelectedFile(file);
      await processFile(file);
    }
  }, []);

  // Gestion de l'upload de fichier
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    await processFile(file);
  }, []);

  // Fonction principale de traitement
  const processFile = async (file: File) => {
    console.log('🔥 [SIMPLIFIÉ] Début traitement 100% RÉEL:', file.name);
    
    setError(null);
    setOcrResult(null);
    setIsProcessing(true);
    setProgress(0);
    
    const steps = initializeSteps();
    let currentProgress = 0;

    try {
      // Étape 1: Validation du fichier
      updateStep('upload', 'processing', 0);
      currentProgress = 20;
      setProgress(currentProgress);
      
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        throw new Error('Type de fichier non supporté. Utilisez des images (PNG, JPG, etc.) ou des PDF.');
      }
      
      updateStep('upload', 'completed', 100, { fileType: file.type, fileSize: file.size });
      console.log('✅ [SIMPLIFIÉ] Fichier validé');

      // Étape 2: Initialisation OCR
      updateStep('init', 'processing', 0);
      currentProgress = 40;
      setProgress(currentProgress);
      
      console.log('🔧 [SIMPLIFIÉ] Initialisation du service OCR...');
      await finalRealOCRService.initialize();
      
      updateStep('init', 'completed', 100, { status: 'Service OCR prêt' });
      console.log('✅ [SIMPLIFIÉ] Service OCR initialisé');

      // Étape 3: Extraction de texte
      updateStep('extraction', 'processing', 0);
      currentProgress = 60;
      setProgress(currentProgress);
      
      console.log('🔄 [SIMPLIFIÉ] Début extraction réelle...');
      let result: FinalRealOCRResult;
      
      if (file.type === 'application/pdf') {
        result = await finalRealOCRService.extractFromPDF(file);
      } else {
        result = await finalRealOCRService.extractFromImage(file);
      }
      
      updateStep('extraction', 'completed', 100, { 
        textLength: result.text.length,
        confidence: result.confidence,
        language: result.language
      });
      console.log('✅ [SIMPLIFIÉ] Extraction terminée');

      // Étape 4: Détection d'entités
      updateStep('entities', 'processing', 0);
      currentProgress = 80;
      setProgress(currentProgress);
      
      const entitiesCount = Object.values(result.entities).filter(val => 
        val && (typeof val === 'string' ? val.length > 0 : Array.isArray(val) ? val.length > 0 : false)
      ).length;
      
      updateStep('entities', 'completed', 100, { entitiesFound: entitiesCount });
      console.log('✅ [SIMPLIFIÉ] Entités détectées:', entitiesCount);

      // Étape 5: Finalisation
      updateStep('complete', 'processing', 0);
      currentProgress = 100;
      setProgress(currentProgress);
      
      setOcrResult(result);
      
      // Log du statut réel
      extractionStatus.logRealExtraction(
        file.type === 'application/pdf' ? 'PDF' : 'OCR',
        file.name,
        true,
        `${result.text.length} caractères, confiance: ${(result.confidence * 100).toFixed(1)}%`
      );
      
      updateStep('complete', 'completed', 100, { status: 'Traitement terminé' });
      
      toast({
        title: "✅ Extraction terminée",
        description: `${result.text.length} caractères extraits avec ${(result.confidence * 100).toFixed(1)}% de confiance`,
      });
      
      console.log('🎉 [SIMPLIFIÉ] Traitement 100% RÉEL terminé avec succès');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ [SIMPLIFIÉ] Erreur:', errorMessage);
      
      setError(errorMessage);
      
      // Marquer l'étape actuelle comme erreur
      const currentStep = steps.find(step => step.status === 'processing');
      if (currentStep) {
        updateStep(currentStep.id, 'error', 0, null, errorMessage);
      }
      
      // Log de l'erreur
      extractionStatus.logRealExtraction(
        file.type === 'application/pdf' ? 'PDF' : 'OCR',
        file.name,
        false,
        errorMessage
      );
      
      toast({
        variant: "destructive",
        title: "❌ Erreur d'extraction",
        description: errorMessage,
      });
      
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction pour télécharger le résultat
  const downloadResult = () => {
    if (!ocrResult) return;
    
    const data = {
      filename: selectedFile?.name,
      extractionDate: new Date().toISOString(),
      extractedText: ocrResult.text,
      confidence: ocrResult.confidence,
      language: ocrResult.language,
      documentType: ocrResult.documentType,
      entities: ocrResult.entities,
      metadata: ocrResult.metadata
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-result-${selectedFile?.name || 'document'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Interface utilisateur
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            OCR 100% Réel - Aucune Simulation
            <Badge variant="destructive">EXTRACTION RÉELLE</Badge>
          </CardTitle>
          <CardDescription>
            Service d'extraction OCR utilisant uniquement Tesseract.js avec fichiers locaux.
            Support français et arabe pour documents algériens.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Zone d'upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? 'border-primary bg-primary/10' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <FileCheck className="h-12 w-12 mx-auto text-green-500" />
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB - {selectedFile.type}
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  Changer de fichier
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium">Glissez un fichier ici</p>
                  <p className="text-gray-500">ou cliquez pour sélectionner</p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Sélectionner un fichier
                </Button>
                <p className="text-xs text-gray-500">
                  Formats supportés: PDF, PNG, JPG, JPEG, TIFF, BMP
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progression du traitement */}
      {(isProcessing || processingSteps.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              Traitement OCR Réel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="w-full" />
            
            <div className="space-y-2">
              {processingSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg border">
                  {step.status === 'pending' && (
                    <div className="w-4 h-4 rounded-full bg-gray-200" />
                  )}
                  {step.status === 'processing' && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  )}
                  {step.status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {step.status === 'error' && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  
                  <span className={`flex-1 ${
                    step.status === 'completed' ? 'text-green-700' : 
                    step.status === 'error' ? 'text-red-700' : ''
                  }`}>
                    {step.name}
                  </span>
                  
                  {step.status === 'processing' && (
                    <Badge variant="secondary">En cours...</Badge>
                  )}
                  {step.status === 'completed' && (
                    <Badge variant="default">✓</Badge>
                  )}
                  {step.status === 'error' && (
                    <Badge variant="destructive">Erreur</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Résultats de l'extraction */}
      {ocrResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Résultats d'Extraction
              <Badge variant="outline">100% Réel</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Métriques */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-3 rounded-lg border">
                <div className="text-2xl font-bold">{ocrResult.text.length}</div>
                <div className="text-sm text-gray-500">Caractères</div>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="text-2xl font-bold">{(ocrResult.confidence * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Confiance</div>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="text-xl font-bold flex items-center gap-1">
                  {ocrResult.language === 'ara' && <span>🇩🇿 العربية</span>}
                  {ocrResult.language === 'fra' && <span>🇫🇷 Français-Fr</span>}
                  {ocrResult.language === 'mixed' && <span>🇩🇿🇫🇷 Mixte AR-FR</span>}
                </div>
                <div className="text-sm text-gray-500">Langue détectée</div>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="text-sm font-bold">
                  {ocrResult.language === 'ara' || ocrResult.language === 'mixed' ? 'Standard arabe' : 'Standard français'}
                </div>
                <div className="text-sm text-gray-500">Préprocessing</div>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="text-2xl font-bold">{ocrResult.pages}</div>
                <div className="text-sm text-gray-500">Pages</div>
              </div>
            </div>

            {/* Type de document */}
            <div>
              <h4 className="font-medium mb-2">Type de Document</h4>
              <Badge variant="secondary">{ocrResult.documentType}</Badge>
            </div>

            {/* Entités détectées */}
            {Object.keys(ocrResult.entities).length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Entités Détectées</h4>
                <div className="space-y-2">
                  {Object.entries(ocrResult.entities).map(([key, value]) => {
                    if (!value || (Array.isArray(value) && value.length === 0)) return null;
                    return (
                      <div key={key} className="flex gap-2">
                        <Badge variant="outline">{key}</Badge>
                        <span className="text-sm">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Texte extrait avec OCRTextDisplay pour meilleur support RTL et corrections arabes */}
            <OCRTextDisplay 
              originalText={ocrResult.text}
              showProcessing={true}
              className="mt-4"
            />

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={downloadResult} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Télécharger le résultat
              </Button>
              <Button 
                onClick={() => navigator.clipboard.writeText(ocrResult.text)}
                variant="outline"
              >
                Copier le texte
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statut du service */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Statut du Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Mode d'extraction:</span>
              <Badge variant="destructive">100% RÉEL</Badge>
            </div>
            <div className="flex justify-between">
              <span>Service OCR:</span>
              <Badge variant={finalRealOCRService.isReady() ? "default" : "secondary"}>
                {finalRealOCRService.isReady() ? "Prêt" : "Non initialisé"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Langues supportées:</span>
              <span className="text-sm">Français, Arabe</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}