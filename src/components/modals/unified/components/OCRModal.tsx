/**
 * Modal OCR unifiée pour documents algériens
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Scan, 
  FileText, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Camera,
  Languages,
  Loader2
} from 'lucide-react';
import { OCRModalConfig } from '../types';

interface OCRModalProps {
  config: OCRModalConfig;
  onClose: () => void;
}

export const OCRModal: React.FC<OCRModalProps> = ({ config, onClose }) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'extract' | 'validate' | 'complete'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(config.file || null);
  const [extractedData, setExtractedData] = useState(config.extractedData || null);
  const [extractionProgress, setExtractionProgress] = useState(config.extractionProgress || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResults, setValidationResults] = useState(config.validationResults || null);
  const [language, setLanguage] = useState<'fr' | 'ar' | 'both'>('both');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentStep('extract');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const startExtraction = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setExtractionProgress(0);

    try {
      // Simulation de l'extraction OCR
      const steps = [
        'Préparation du document...',
        'Détection de la langue...',
        'Extraction du texte français...',
        'Extraction du texte arabe...',
        'Analyse de la structure...',
        'Validation des données...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setExtractionProgress(((i + 1) / steps.length) * 100);
      }

      // Données extraites simulées
      const mockExtractedData = {
        metadata: {
          documentType: 'legal',
          language: language,
          confidence: 0.92,
          pageCount: 1
        },
        content: {
          title: 'Décret exécutif n° 24-01 du 15 janvier 2024',
          numero: '24-01',
          date: '2024-01-15',
          source: 'Présidence de la République',
          content: 'Contenu du texte juridique extrait...',
          keywords: ['droit administratif', 'procédure', 'algérie'],
          references: ['Loi n° 08-09', 'Décret n° 15-247']
        },
        rawText: 'Texte brut extrait du document...',
        boundingBoxes: [],
        processingTime: 4.2
      };

      setExtractedData(mockExtractedData);
      
      if (config.onExtract) {
        config.onExtract(mockExtractedData);
      }

      setCurrentStep('validate');

    } catch (error) {
      console.error('Erreur lors de l\'extraction OCR:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidation = async () => {
    if (!extractedData) return;

    const validation = {
      isValid: true,
      confidence: extractedData.metadata.confidence,
      issues: [],
      suggestions: [
        'Vérifier la date de publication',
        'Valider le numéro de référence'
      ]
    };

    setValidationResults(validation);
    
    if (config.onValidate) {
      config.onValidate(validation);
    }

    setCurrentStep('complete');
  };

  const handleSave = () => {
    if (config.onSave && extractedData) {
      config.onSave(extractedData);
    }
    
    if (config.onComplete) {
      config.onComplete({
        file: selectedFile,
        extractedData,
        validationResults
      });
    }
    
    onClose();
  };

  const renderUploadStep = () => (
    <div className="p-6">
      <div className="text-center">
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 cursor-pointer hover:border-primary/50 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            Sélectionner un document
          </h3>
          <p className="text-muted-foreground mb-4">
            Glissez-déposez un fichier ou cliquez pour parcourir
          </p>
          <p className="text-sm text-muted-foreground">
            Formats supportés: PDF, PNG, JPG, TIFF
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.tiff"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />

        <div className="mt-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Languages className="w-4 h-4" />
            <span className="text-sm font-medium">Langue de traitement:</span>
          </div>
          <div className="flex justify-center gap-2">
            <Button
              variant={language === 'fr' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('fr')}
            >
              Français
            </Button>
            <Button
              variant={language === 'ar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('ar')}
            >
              العربية
            </Button>
            <Button
              variant={language === 'both' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('both')}
            >
              Bilingue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExtractionStep = () => (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <Scan className="w-12 h-12 text-primary" />
            {isProcessing && (
              <div className="absolute inset-0 animate-ping">
                <Scan className="w-12 h-12 text-primary/30" />
              </div>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          {selectedFile?.name}
        </h3>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="outline">
            {(selectedFile?.size || 0) > 1024 * 1024 
              ? `${((selectedFile?.size || 0) / (1024 * 1024)).toFixed(1)} MB`
              : `${((selectedFile?.size || 0) / 1024).toFixed(0)} KB`}
          </Badge>
          <Badge variant="outline">
            {language === 'both' ? 'Français + العربية' : language === 'fr' ? 'Français' : 'العربية'}
          </Badge>
        </div>
        
        {isProcessing ? (
          <div className="space-y-4">
            <Progress value={extractionProgress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Extraction en cours... {extractionProgress.toFixed(0)}%
            </p>
          </div>
        ) : (
          <Button onClick={startExtraction} size="lg" className="mt-4">
            <Scan className="w-4 h-4 mr-2" />
            Démarrer l'extraction
          </Button>
        )}
      </div>
    </div>
  );

  const renderValidationStep = () => (
    <div className="p-6">
      <Tabs defaultValue="extracted" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="extracted">Données extraites</TabsTrigger>
          <TabsTrigger value="raw">Texte brut</TabsTrigger>
        </TabsList>

        <TabsContent value="extracted" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Métadonnées détectées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {extractedData && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <strong>Titre:</strong> {extractedData.content.title}
                  </div>
                  <div>
                    <strong>Numéro:</strong> {extractedData.content.numero}
                  </div>
                  <div>
                    <strong>Date:</strong> {extractedData.content.date}
                  </div>
                  <div>
                    <strong>Source:</strong> {extractedData.content.source}
                  </div>
                  <div className="col-span-2">
                    <strong>Confiance:</strong>{' '}
                    <Badge variant={extractedData.metadata.confidence > 0.8 ? 'default' : 'secondary'}>
                      {(extractedData.metadata.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raw">
          <Card>
            <CardHeader>
              <CardTitle>Texte brut extrait</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                {extractedData?.rawText || 'Aucun texte extrait'}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => setCurrentStep('upload')}>
          Recommencer
        </Button>
        <Button onClick={handleValidation}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Valider les données
        </Button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="p-6 text-center">
      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        Extraction terminée avec succès
      </h3>
      <p className="text-muted-foreground mb-6">
        Les données ont été extraites et validées
      </p>
      
      {validationResults && (
        <Card className="text-left mb-6">
          <CardHeader>
            <CardTitle className="text-base">Résumé de la validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Validation réussie</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Confiance: {(validationResults.confidence * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={handleSave}>
          <FileText className="w-4 h-4 mr-2" />
          Enregistrer les données
        </Button>
      </div>
    </div>
  );

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 'upload': return renderUploadStep();
      case 'extract': return renderExtractionStep();
      case 'validate': return renderValidationStep();
      case 'complete': return renderCompleteStep();
      default: return renderUploadStep();
    }
  };

  return (
    <div className="w-full">
      {/* Indicateur d'étapes */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          {[
            { id: 'upload', label: 'Document', icon: Upload },
            { id: 'extract', label: 'Extraction', icon: Scan },
            { id: 'validate', label: 'Validation', icon: Eye },
            { id: 'complete', label: 'Terminé', icon: CheckCircle }
          ].map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = ['upload', 'extract', 'validate', 'complete'].indexOf(currentStep) > index;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                  isActive 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : isCompleted 
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-muted-foreground/30 text-muted-foreground'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
                {index < 3 && (
                  <div className={`mx-4 h-0.5 w-8 ${
                    isCompleted ? 'bg-green-600' : 'bg-muted-foreground/30'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {getCurrentStepContent()}
    </div>
  );
};