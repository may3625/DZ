/**
 * Composant de Workflow d'Alimentation de la Banque de Données Juridiques
 * Interface complète pour l'extraction, validation et stockage des textes juridiques
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Database, 
  Settings, 
  BarChart3,
  History,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

import { 
  legalDatabaseWorkflowService,
  ExtractionSession,
  LegalEntity,
  LegalProcedure,
  FormTemplate,
  WorkflowStep,
  ValidationResult
} from '@/services/enhanced/legalDatabaseWorkflowService';

interface WorkflowState {
  currentSession?: ExtractionSession;
  workflowSteps: WorkflowStep[];
  isProcessing: boolean;
  error?: string;
  statistics?: {
    totalSessions: number;
    completedSessions: number;
    failedSessions: number;
    averageProcessingTime: number;
    successRate: number;
  };
  sessionHistory: ExtractionSession[];
}

export const LegalDatabaseWorkflowComponent: React.FC = () => {
  const [state, setState] = useState<WorkflowState>({
    workflowSteps: [],
    isProcessing: false,
    sessionHistory: []
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('loi');
  const [activeTab, setActiveTab] = useState<string>('workflow');

  // Charger les statistiques au montage
  useEffect(() => {
    loadStatistics();
    loadSessionHistory();
  }, []);

  const loadStatistics = async () => {
    try {
      const stats = await legalDatabaseWorkflowService.getWorkflowStatistics();
      setState(prev => ({ ...prev, statistics: stats }));
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const loadSessionHistory = async () => {
    try {
      const history = await legalDatabaseWorkflowService.getSessionHistory(10);
      setState(prev => ({ ...prev, sessionHistory: history }));
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const startWorkflow = async () => {
    if (!selectedFile) {
      setState(prev => ({ ...prev, error: 'Veuillez sélectionner un fichier' }));
      return;
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isProcessing: true, 
        error: undefined 
      }));

      // Initialiser la session
      const session = await legalDatabaseWorkflowService.initializeExtractionSession(
        selectedFile, 
        documentType
      );

      setState(prev => ({ 
        ...prev, 
        currentSession: session,
        workflowSteps: []
      }));

      // Exécuter le workflow
      const result = await legalDatabaseWorkflowService.executeWorkflow(session, selectedFile);

      setState(prev => ({ 
        ...prev, 
        currentSession: result.session,
        isProcessing: false
      }));

      // Recharger les statistiques
      await loadStatistics();
      await loadSessionHistory();

    } catch (error) {
      console.error('Erreur lors de l\'exécution du workflow:', error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }));
    }
  };

  const getStepIcon = (step: WorkflowStep) => {
    if (step.isCompleted) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (step.id === 'document-upload' && selectedFile) return <FileText className="h-4 w-4 text-blue-500" />;
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getStepStatus = (step: WorkflowStep) => {
    if (step.isCompleted) return 'completed';
    if (state.currentSession?.status === 'processing' && step.order <= (state.currentSession.progress / 12.5)) {
      return 'processing';
    }
    return 'pending';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Terminé</Badge>;
      case 'processing':
        return <Badge variant="secondary">En cours</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échec</Badge>;
      case 'pending':
        return <Badge variant="outline">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Workflow d'Alimentation - Banque de Données Juridiques
          </CardTitle>
          <CardDescription>
            Extraction, validation et stockage automatisé des textes juridiques algériens
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.statistics && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{state.statistics.totalSessions}</div>
                <div className="text-sm text-gray-500">Sessions Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{state.statistics.completedSessions}</div>
                <div className="text-sm text-gray-500">Terminées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{state.statistics.failedSessions}</div>
                <div className="text-sm text-gray-500">Échecs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{state.statistics.averageProcessingTime}min</div>
                <div className="text-sm text-gray-500">Temps Moyen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{state.statistics.successRate}%</div>
                <div className="text-sm text-gray-500">Taux de Succès</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interface principale */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
        </TabsList>

        {/* Onglet Workflow */}
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Étapes du Workflow</CardTitle>
              <CardDescription>
                Processus automatisé d'extraction et d'alimentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sélection de fichier */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Document à traiter</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.tiff"
                    onChange={handleFileSelect}
                    className="flex-1"
                  />
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="loi">Loi</option>
                    <option value="decret">Décret</option>
                    <option value="arrete">Arrêté</option>
                    <option value="ordonnance">Ordonnance</option>
                    <option value="decision">Décision</option>
                    <option value="circulaire">Circulaire</option>
                    <option value="instruction">Instruction</option>
                    <option value="avis">Avis</option>
                    <option value="proclamation">Proclamation</option>
                  </select>
                </div>
              </div>

              {/* Bouton de démarrage */}
              <Button
                onClick={startWorkflow}
                disabled={!selectedFile || state.isProcessing}
                className="w-full"
              >
                {state.isProcessing ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Démarrer le Workflow
                  </>
                )}
              </Button>

              {/* Progression */}
              {state.currentSession && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span>{state.currentSession.progress}%</span>
                  </div>
                  <Progress value={state.currentSession.progress} />
                  <div className="flex items-center gap-2">
                    {getStatusBadge(state.currentSession.status)}
                    <span className="text-sm text-gray-500">
                      {state.currentSession.fileName}
                    </span>
                  </div>
                </div>
              )}

              {/* Étapes du workflow */}
              <div className="space-y-2">
                <h4 className="font-medium">Étapes du Workflow</h4>
                <div className="space-y-2">
                  {[
                    { id: 'document-upload', name: 'Upload du Document', description: 'Sélection et validation du fichier' },
                    { id: 'ocr-extraction', name: 'Extraction OCR-IA', description: 'Extraction automatique avec IA algérienne' },
                    { id: 'content-validation', name: 'Validation du Contenu', description: 'Validation et correction du contenu' },
                    { id: 'nomenclature-mapping', name: 'Mapping Nomenclature', description: 'Association avec nomenclature algérienne' },
                    { id: 'entity-creation', name: 'Création Entité', description: 'Création de l\'entité juridique' },
                    { id: 'procedure-linking', name: 'Liaison Procédures', description: 'Association avec procédures administratives' },
                    { id: 'form-generation', name: 'Génération Formulaires', description: 'Création automatique de formulaires' },
                    { id: 'approval-workflow', name: 'Workflow d\'Approbation', description: 'Validation finale et publication' }
                  ].map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {getStepIcon({ ...step, isCompleted: state.currentSession?.progress >= (index + 1) * 12.5 } as WorkflowStep)}
                        <span className="text-sm font-medium">{step.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 flex-1">{step.description}</span>
                      {state.currentSession?.progress >= (index + 1) * 12.5 && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Validation */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation du Contenu</CardTitle>
              <CardDescription>
                Validation et correction des données extraites
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.currentSession?.validationResults ? (
                <div className="space-y-4">
                  {state.currentSession.validationResults.map((result) => (
                    <div key={result.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{result.field}</span>
                        <Badge variant={result.isValid ? "default" : "destructive"}>
                          {result.isValid ? "Valide" : "À corriger"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-500">Valeur:</span>
                          <span className="ml-2">{result.value}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Confiance:</span>
                          <span className="ml-2">{Math.round(result.confidence * 100)}%</span>
                        </div>
                        {result.errors.length > 0 && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {result.errors.join(', ')}
                            </AlertDescription>
                          </Alert>
                        )}
                        {result.suggestions.length > 0 && (
                          <div className="text-sm text-blue-600">
                            Suggestions: {result.suggestions.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Aucune validation disponible. Démarrez un workflow pour voir les résultats.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Historique */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Sessions</CardTitle>
              <CardDescription>
                Historique des extractions et traitements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {state.sessionHistory.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{session.fileName}</div>
                        <div className="text-sm text-gray-500">
                          {session.documentType} • {session.fileSize} bytes
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(session.status)}
                      <span className="text-sm text-gray-500">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Configuration */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Workflow</CardTitle>
              <CardDescription>
                Paramètres et options de traitement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Paramètres d'Extraction</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      Extraction automatique avec IA
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      Validation automatique du contenu
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      Mapping automatique nomenclature
                    </label>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Paramètres de Validation</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      Validation manuelle obligatoire
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      Workflow d'approbation
                    </label>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Génération Automatique</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      Génération de formulaires
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      Liaison avec procédures
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Messages d'erreur */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};