import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Eye,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { processAlgerianDocument, AlgerianExtractionResult } from '@/services/algerianDocumentExtractionService';
import { logger } from '@/utils/logger';

interface OcrExtractionInterfaceProps {
  className?: string;
}

export function OcrExtractionInterface({ className }: OcrExtractionInterfaceProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [extractions, setExtractions] = useState<AlgerianExtractionResult[]>([]);
  const [selectedExtraction, setSelectedExtraction] = useState<AlgerianExtractionResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Phase 1: Agrégation automatique complétée
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Type de fichier non supporté. Utilisez PDF, JPEG, PNG ou WebP.');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB
      toast.error('Fichier trop volumineux. Maximum 50MB.');
      return;
    }
    
    try {
      setIsProcessing(true);
      setProgress(0);
      setCurrentStep('Initialisation...');
      
      // Simulation du progrès pour l'interface utilisateur
      const progressSteps = [
        { step: 'Lecture du fichier...', progress: 10 },
        { step: 'Conversion des pages...', progress: 30 },
        { step: 'Extraction OCR...', progress: 50 },
        { step: 'Détection de langue...', progress: 70 },
        { step: 'Agrégation automatique...', progress: 85 },
        { step: 'Finalisation...', progress: 95 }
      ];
      
      for (const { step, progress: stepProgress } of progressSteps) {
        setCurrentStep(step);
        setProgress(stepProgress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Traitement réel avec le service algérien
      const result = await processAlgerianDocument(file);
      
      setProgress(100);
      setCurrentStep('Terminé !');
      
      // Ajouter à la liste des extractions
      setExtractions(prev => [result, ...prev]);
      setSelectedExtraction(result);
      
      toast.success('Extraction terminée avec succès !');
      logger.info('OCR', 'Extraction terminée', { 
        filename: file.name,
        pages: result.totalPages,
        language: result.languageDetected
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'extraction:', error);
      toast.error('Erreur lors de l\'extraction du document');
      logger.error('OCR', 'Erreur extraction', error);
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProgress(0);
        setCurrentStep('');
      }, 2000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const exportExtraction = (extraction: AlgerianExtractionResult, format: 'json' | 'txt') => {
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        content = JSON.stringify(extraction, null, 2);
        filename = `extraction_${extraction.originalFilename}_${Date.now()}.json`;
        mimeType = 'application/json';
      } else {
        content = extraction.extractedText;
        filename = `extraction_${extraction.originalFilename}_${Date.now()}.txt`;
        mimeType = 'text/plain';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Export ${format.toUpperCase()} terminé !`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Extraction OCR Algérienne
          </h2>
          <p className="text-muted-foreground mt-1">
            Phase 1: Services fondamentaux d'extraction avec agrégation automatique
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <CheckCircle className="w-4 h-4 mr-2" />
          100% Complété
        </Badge>
      </div>

      {/* Zone de téléchargement */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              Glissez vos documents ici ou cliquez pour sélectionner
            </h3>
            <p className="text-muted-foreground mb-4">
              Supports: PDF, JPEG, PNG, WebP (max 50MB)
            </p>
            
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
              disabled={isProcessing}
            />
            <Button asChild disabled={isProcessing}>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Sélectionner un fichier
              </label>
            </Button>
          </div>
          
          {/* Barre de progression */}
          {isProcessing && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{currentStep}</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extractions existantes */}
      {extractions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Extractions Récentes ({extractions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">Liste</TabsTrigger>
                <TabsTrigger value="viewer" disabled={!selectedExtraction}>
                  Visualiseur
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="space-y-3">
                {extractions.map((extraction) => (
                  <div
                    key={extraction.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedExtraction?.id === extraction.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedExtraction(extraction)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{extraction.originalFilename}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{extraction.totalPages} pages</span>
                          <span>Langue: {extraction.languageDetected}</span>
                          <span>Confiance: {Math.round(extraction.confidenceScore * 100)}%</span>
                          {extraction.isMixedLanguage && (
                            <Badge variant="secondary" className="text-xs">
                              Bilingue
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportExtraction(extraction, 'txt');
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          TXT
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportExtraction(extraction, 'json');
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          JSON
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="viewer">
                {selectedExtraction && (
                  <div className="space-y-4">
                    {/* Métadonnées */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h5 className="font-medium mb-2">Métadonnées</h5>
                          <div className="space-y-1 text-sm">
                            <div>Type: {selectedExtraction.metadata.documentType}</div>
                            <div>Temps: {selectedExtraction.metadata.processingTime}ms</div>
                            <div>Date: {new Date(selectedExtraction.metadata.processingDate).toLocaleDateString()}</div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h5 className="font-medium mb-2">Langues Détectées</h5>
                          <div className="space-y-1 text-sm">
                            <div>Arabe: {selectedExtraction.metadata.languageDistribution.ar}</div>
                            <div>Français: {selectedExtraction.metadata.languageDistribution.fr}</div>
                            <div>Mixte: {selectedExtraction.metadata.languageDistribution.mixed}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Texte extrait */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Texte Extrait</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto text-sm font-mono whitespace-pre-wrap">
                          {selectedExtraction.extractedText}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Entités détectées */}
                    {Object.keys(selectedExtraction.metadata.detectedEntities).some(key => 
                      selectedExtraction.metadata.detectedEntities[key].length > 0
                    ) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Entités Juridiques Détectées</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(selectedExtraction.metadata.detectedEntities).map(([type, entities]) => (
                              entities.length > 0 && (
                                <div key={type}>
                                  <h6 className="font-medium capitalize mb-2">{type}</h6>
                                  <div className="space-y-1">
                                    {entities.slice(0, 5).map((entity: any, index: number) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {entity.value}
                                      </Badge>
                                    ))}
                                    {entities.length > 5 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{entities.length - 5} autres
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      {/* Alert d'état */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Phase 1 - Services Fondamentaux ✅ 100% Complété</strong>
          <br />
          Extraction OCR, agrégation automatique des pages, métadonnées détectées et interface bilingue opérationnels.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default OcrExtractionInterface;