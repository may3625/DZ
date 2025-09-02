import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOCRWorkflowStore } from '@/stores/ocrWorkflowStore';
import { useOCRExtraction } from '@/hooks/useOCRExtraction';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  MapPin, 
  CheckCircle, 
  Workflow, 
  Eye, 
  Download,
  AlertCircle,
  Clock,
  Zap,
  Brain,
  Target,
  Settings
} from 'lucide-react';

export function OCRWorkflowManager() {
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();
  
  const {
    currentStep,
    extractionData,
    mappingData,
    validationData,
    workflowData,
    setExtractionData,
    setMappingData,
    setValidationData,
    setWorkflowData,
    resetWorkflow,
    canAccessStep,
    isStepCompleted
  } = useOCRWorkflowStore();

  const {
    isExtracting,
    extractionProgress,
    extractDocument
  } = useOCRExtraction();

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const file = files[0];
    if (!file) return;

    // Vérifications de fichier
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Veuillez utiliser un fichier PDF, JPEG, PNG ou TIFF",
        variant: "destructive"
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "Fichier trop volumineux", 
        description: "La taille maximale autorisée est de 10MB",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Extraction en cours",
        description: "L'analyse OCR du document a commencé..."
      });

      const result = await extractDocument(file);
      
      const extractionData = {
        file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ocrResult: {
          text: result.text,
          confidence: result.confidence,
          language: (result.language as 'ara' | 'fra' | 'mixed') || 'mixed',
          processingTime: 0,
          documentType: 'document',
          metadata: result.metadata,
          entities: result.metadata.entities || {},
          pages: [] // Add missing pages property
        },
        extractedAt: new Date()
      };

      setExtractionData(extractionData);
      
      toast({
        title: "Extraction réussie",
        description: `Document traité avec ${result.confidence}% de confiance`
      });

    } catch (error) {
      console.error('Erreur lors de l\'extraction:', error);
      toast({
        title: "Erreur d'extraction",
        description: error instanceof Error ? error.message : "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    }
  }, [extractDocument, setExtractionData, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleMapping = useCallback(() => {
    if (!extractionData) return;

    // Simuler le mapping intelligent des champs
    const mockMapping = {
      mappedFields: {
        titre: extractionData.ocrResult.entities.decretNumber || '',
        institution: extractionData.ocrResult.entities.institution || '',
        dateHijri: extractionData.ocrResult.entities.dateHijri || '',
        dateGregorian: extractionData.ocrResult.entities.dateGregorian || '',
        articles: extractionData.ocrResult.entities.articles || [],
        signataires: extractionData.ocrResult.entities.signatories || []
      },
      unmappedFields: ['annexes', 'references_externes'],
      confidence: extractionData.ocrResult.confidence,
      formType: 'legal' as const,
      mappingCompleted: true
    };

    setMappingData(mockMapping);
    
    toast({
      title: "Mapping terminé",
      description: "Les champs ont été mappés automatiquement"
    });
  }, [extractionData, setMappingData, toast]);

  const handleValidation = useCallback(() => {
    if (!mappingData) return;

    const validation = {
      isValid: mappingData.confidence > 70,
      warnings: mappingData.confidence < 85 ? ["Confiance OCR modérée"] : [],
      errors: mappingData.unmappedFields.length > 0 ? ["Champs non mappés détectés"] : [],
      reviewedAt: new Date(),
      reviewer: 'Système automatique'
    };

    setValidationData(validation);
    
    toast({
      title: "Validation terminée",
      description: validation.isValid ? "Document validé avec succès" : "Des corrections sont nécessaires"
    });
  }, [mappingData, setValidationData, toast]);

  const handleWorkflowFinalization = useCallback(() => {
    if (!validationData || !extractionData || !mappingData) return;

    const workflow = {
      status: validationData.isValid ? 'approved' as const : 'needs_review' as const,
      approvedBy: 'Système OCR',
      approvedAt: new Date(),
      comments: `Document traité automatiquement avec ${extractionData.ocrResult.confidence}% de confiance`,
      finalData: {
        ...mappingData.mappedFields,
        metadata: {
          fileName: extractionData.fileName,
          extractionDate: extractionData.extractedAt,
          ocrConfidence: extractionData.ocrResult.confidence,
          documentType: extractionData.ocrResult.documentType
        }
      }
    };

    setWorkflowData(workflow);
    
    toast({
      title: "Workflow terminé",
      description: "Le document a été traité avec succès"
    });
  }, [validationData, extractionData, mappingData, setWorkflowData, toast]);

  const stepComponents = {
    extraction: (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Extraction OCR
          </CardTitle>
          <CardDescription>
            Téléchargez un document pour extraire le texte automatiquement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!extractionData ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Déposez votre document ici</h3>
              <p className="text-gray-600 mb-4">
                Formats acceptés: PDF, JPEG, PNG, TIFF (max 10MB)
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.tiff"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
              <Button onClick={() => document.getElementById('file-upload')?.click()}>
                Choisir un fichier
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-medium">Extraction terminée</h4>
                  <p className="text-sm text-gray-600">
                    {extractionData.fileName} - {Math.round(extractionData.fileSize / 1024)} KB
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Confiance OCR</span>
                  <div className="flex items-center gap-2">
                    <Progress value={extractionData.ocrResult.confidence} className="flex-1" />
                    <span className="text-sm font-medium">{extractionData.ocrResult.confidence}%</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Langue détectée</span>
                  <p className="font-medium">{extractionData.ocrResult.language}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                <h5 className="font-medium mb-2">Extrait du texte:</h5>
                <p className="text-sm text-gray-700">
                  {extractionData.ocrResult.text.substring(0, 200)}...
                </p>
              </div>
            </div>
          )}

          {isExtracting && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                <span className="text-sm">Extraction en cours...</span>
              </div>
              <Progress value={extractionProgress} />
            </div>
          )}
        </CardContent>
      </Card>
    ),

    mapping: (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Mapping Intelligent
          </CardTitle>
          <CardDescription>
            Association automatique des données extraites aux champs structurés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!mappingData ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Mapping en attente</h3>
              <p className="text-gray-600 mb-4">
                Cliquez pour démarrer l'association automatique des champs
              </p>
              <Button 
                onClick={handleMapping}
                disabled={!extractionData}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Démarrer le mapping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-medium">Mapping terminé</h4>
                  <p className="text-sm text-gray-600">
                    {Object.keys(mappingData.mappedFields).length} champs mappés
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-3 text-green-700">Champs mappés</h5>
                  <div className="space-y-2">
                    {Object.entries(mappingData.mappedFields).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium truncate ml-2">
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {mappingData.unmappedFields.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-3 text-orange-700">Champs non mappés</h5>
                    <div className="space-y-1">
                      {mappingData.unmappedFields.map((field) => (
                        <Badge key={field} variant="outline" className="mr-1">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Confiance du mapping:</span>
                <Progress value={mappingData.confidence} className="flex-1 max-w-32" />
                <span className="text-sm font-medium">{mappingData.confidence}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    ),

    validation: (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Validation & Contrôle
          </CardTitle>
          <CardDescription>
            Vérification de la qualité et correction des données extraites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!validationData ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Validation en attente</h3>
              <p className="text-gray-600 mb-4">
                Lancer la validation automatique des données mappées
              </p>
              <Button 
                onClick={handleValidation}
                disabled={!mappingData}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Valider les données
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                validationData.isValid ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                <CheckCircle className={`w-6 h-6 ${
                  validationData.isValid ? 'text-green-600' : 'text-yellow-600'
                }`} />
                <div>
                  <h4 className="font-medium">
                    {validationData.isValid ? 'Validation réussie' : 'Validation avec réserves'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Validé le {validationData.reviewedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {validationData.warnings.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h5 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Avertissements
                  </h5>
                  <ul className="list-disc list-inside text-sm text-yellow-700">
                    {validationData.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validationData.errors.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <h5 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Erreurs à corriger
                  </h5>
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {validationData.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    ),

    workflow: (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            Finalisation du Workflow
          </CardTitle>
          <CardDescription>
            Approbation finale et export des données structurées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!workflowData ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Finalisation en attente</h3>
              <p className="text-gray-600 mb-4">
                Approuver et finaliser le traitement du document
              </p>
              <Button 
                onClick={handleWorkflowFinalization}
                disabled={!validationData}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Finaliser le workflow
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                workflowData.status === 'approved' ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                <CheckCircle className={`w-6 h-6 ${
                  workflowData.status === 'approved' ? 'text-green-600' : 'text-yellow-600'
                }`} />
                <div>
                  <h4 className="font-medium">
                    {workflowData.status === 'approved' ? 'Document approuvé' : 'Révision nécessaire'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {workflowData.comments}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger JSON
                </Button>
                <Button variant="outline" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Aperçu final
                </Button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium mb-2">Résumé du traitement:</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Extraction: {extractionData?.ocrResult.confidence}% de confiance</p>
                  <p>• Mapping: {Object.keys(workflowData.finalData).length} champs structurés</p>
                  <p>• Validation: {validationData?.isValid ? 'Réussie' : 'Avec réserves'}</p>
                  <p>• Statut final: {workflowData.status}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workflow OCR Unifié</h1>
            <p className="text-gray-600">
              Traitement automatisé de documents algériens avec OCR, mapping et validation
            </p>
          </div>
          <Button variant="outline" onClick={resetWorkflow}>
            Nouveau document
          </Button>
        </div>

        {/* Indicateur de progression */}
        <div className="flex items-center gap-4 mb-6">
          {['extraction', 'mapping', 'validation', 'workflow'].map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isStepCompleted(step) 
                  ? 'bg-green-100 text-green-700'
                  : currentStep === step
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {index + 1}
              </div>
              <span className={`text-sm ${
                currentStep === step ? 'font-medium text-gray-900' : 'text-gray-500'
              }`}>
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </span>
              {index < 3 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      <Tabs value={currentStep} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger 
            value="extraction" 
            disabled={!canAccessStep('extraction')}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Extraction
          </TabsTrigger>
          <TabsTrigger 
            value="mapping" 
            disabled={!canAccessStep('mapping')}
            className="flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Mapping
          </TabsTrigger>
          <TabsTrigger 
            value="validation" 
            disabled={!canAccessStep('validation')}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Validation
          </TabsTrigger>
          <TabsTrigger 
            value="workflow" 
            disabled={!canAccessStep('workflow')}
            className="flex items-center gap-2"
          >
            <Workflow className="w-4 h-4" />
            Workflow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="extraction" className="mt-6">
          {stepComponents.extraction}
        </TabsContent>

        <TabsContent value="mapping" className="mt-6">
          {stepComponents.mapping}
        </TabsContent>

        <TabsContent value="validation" className="mt-6">
          {stepComponents.validation}
        </TabsContent>

        <TabsContent value="workflow" className="mt-6">
          {stepComponents.workflow}
        </TabsContent>
      </Tabs>
    </div>
  );
}