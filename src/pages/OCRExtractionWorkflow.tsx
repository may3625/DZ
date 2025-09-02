import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { FileText, Brain, CheckCircle, BarChart3, Settings } from 'lucide-react';
import { ExtractionTab } from '@/components/ocr/workflow/ExtractionTab';
import { MappingTab } from '@/components/ocr/workflow/MappingTab';
import { ValidationTab } from '@/components/ocr/workflow/ValidationTab';
import { ResultsTab } from '@/components/ocr/workflow/ResultsTab';
import { AlgorithmTab } from '@/components/ocr/workflow/AlgorithmTab';
import { AlgerianExtractionResult } from '@/services/enhanced/algerianDocumentExtractionService';
import { MappingResult } from '@/types/mapping';
import { advancedAlgorithmIntegrationService } from '@/services/enhanced/advancedAlgorithmIntegrationService';
import { performanceMonitoringService } from '@/services/enhanced/performanceMonitoringService';
import { useOCRWorkflowContinuity } from '@/hooks/useOCRWorkflowContinuity';

interface WorkflowState {
  currentTab: string;
  extractedDocument: AlgerianExtractionResult | null;
  mappingResult: MappingResult | null;
  validationCompleted: boolean;
  approvalPending: boolean;
}

export default function OCRExtractionWorkflow() {
  const workflowContinuity = useOCRWorkflowContinuity();
  
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    currentTab: workflowContinuity.activeTab || 'extraction',
    extractedDocument: null,
    mappingResult: null,
    validationCompleted: false,
    approvalPending: false,
  });

  const [progress, setProgress] = useState(0);

  // Synchroniser l'onglet actif avec le hook
  useEffect(() => {
    if (workflowContinuity.activeTab !== workflowState.currentTab) {
      setWorkflowState(prev => ({ ...prev, currentTab: workflowContinuity.activeTab }));
    }
  }, [workflowContinuity.activeTab]);

  // Calcul automatique du progrès
  useEffect(() => {
    let calculatedProgress = 0;
    
    if (workflowState.extractedDocument) calculatedProgress += 25;
    if (workflowState.mappingResult) calculatedProgress += 25;
    if (workflowState.validationCompleted) calculatedProgress += 25;
    if (workflowState.approvalPending) calculatedProgress += 25;
    
    setProgress(calculatedProgress);
  }, [workflowState]);

  const handleExtractionComplete = (extractedDoc: AlgerianExtractionResult) => {
    // Enregistrer les métriques de performance
    performanceMonitoringService.recordMetric(
      'document_extraction',
      extractedDoc.metadata?.processingTime || 0,
      extractedDoc.metadata?.averageConfidence || 0,
      extractedDoc.metadata.documentType,
      0, // fileSize non disponible ici
      true
    );

    setWorkflowState(prev => ({
      ...prev,
      extractedDocument: extractedDoc,
      currentTab: 'mapping'
    }));
  };

  const handleMappingComplete = (mappingResult: MappingResult) => {
    // Enregistrer les métriques de mapping
    performanceMonitoringService.recordMetric(
      'intelligent_mapping',
      0, // Temps non disponible dans MappingResult
      mappingResult.overallConfidence,
      mappingResult.formType,
      0,
      true
    );

    setWorkflowState(prev => ({
      ...prev,
      mappingResult: mappingResult,
      currentTab: 'validation'
    }));
  };

  const handleValidationComplete = () => {
    setWorkflowState(prev => ({
      ...prev,
      validationCompleted: true,
      approvalPending: true,
      currentTab: 'results'
    }));
  };

  const resetWorkflow = () => {
    setWorkflowState({
      currentTab: 'extraction',
      extractedDocument: null,
      mappingResult: null,
      validationCompleted: false,
      approvalPending: false,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête avec progression */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                Workflow OCR Intelligent - Extraction Avancée
              </CardTitle>
              <Button onClick={resetWorkflow} variant="outline" size="sm">
                Nouveau Document
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progression du workflow</span>
                <span>{progress}% complété</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardHeader>
        </Card>

        {/* Workflow principal avec onglets */}
        <Tabs 
          value={workflowState.currentTab} 
          onValueChange={(tab) => {
            setWorkflowState(prev => ({ ...prev, currentTab: tab }));
            workflowContinuity.setActiveTab(tab);
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="extraction" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Extraction
            </TabsTrigger>
            <TabsTrigger 
              value="mapping" 
              disabled={!workflowState.extractedDocument}
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              Mapping
            </TabsTrigger>
            <TabsTrigger 
              value="validation"
              disabled={!workflowState.mappingResult}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Validation
            </TabsTrigger>
            <TabsTrigger 
              value="results"
              disabled={!workflowState.validationCompleted}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Résultats
            </TabsTrigger>
            <TabsTrigger value="algorithm" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Algorithme
            </TabsTrigger>
          </TabsList>

          {/* Phase 1: Extraction */}
          <TabsContent value="extraction" className="space-y-6">
            <ExtractionTab 
              onExtractionComplete={handleExtractionComplete}
              extractedDocument={workflowState.extractedDocument}
            />
          </TabsContent>

          {/* Phase 2: Mapping */}
          <TabsContent value="mapping" className="space-y-6">
            <MappingTab 
              extractedDocument={workflowState.extractedDocument}
              onMappingComplete={handleMappingComplete}
              mappingResult={workflowState.mappingResult}
            />
          </TabsContent>

          {/* Phase 3: Validation */}
          <TabsContent value="validation" className="space-y-6">
            <ValidationTab 
              extractedDocument={workflowState.extractedDocument}
              mappingResult={workflowState.mappingResult}
              onValidationComplete={handleValidationComplete}
            />
          </TabsContent>

          {/* Phase 4: Résultats */}
          <TabsContent value="results" className="space-y-6">
            <ResultsTab 
              extractedDocument={workflowState.extractedDocument}
              mappingResult={workflowState.mappingResult}
              validationCompleted={workflowState.validationCompleted}
            />
          </TabsContent>

          {/* Phase 5: Algorithmes Avancés */}
          <TabsContent value="algorithm" className="space-y-6">
            <AlgorithmTab extractedDocument={workflowState.extractedDocument} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}