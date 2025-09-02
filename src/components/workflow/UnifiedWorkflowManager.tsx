import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Workflow, 
  Play, 
  Pause, 
  Square,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  BarChart,
  FileText,
  Zap
} from 'lucide-react';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { AlgerianText } from '@/components/algerian/AlgerianText';
import { useOCRWorkflow } from '@/hooks/useOCRWorkflow';
import { unifiedOCRWorkflowService } from '@/services/unifiedOCRWorkflowService';

interface WorkflowInstance {
  id: string;
  type: 'legal' | 'procedure' | 'ocr' | 'validation';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  startTime: Date;
  estimatedCompletion?: Date;
  data?: any;
}

interface WorkflowMetrics {
  totalProcessed: number;
  successRate: number;
  averageTime: number;
  activeWorkflows: number;
}

/**
 * Phase 2 et 3 du plan d'action - Gestionnaire de workflow unifié
 * Coordonne tous les workflows (juridique, procédures, OCR)
 */
export function UnifiedWorkflowManager() {
  const { t, isRTL, formatNumber, formatDate } = useAlgerianI18n();
  const { openOCRWorkflow } = useOCRWorkflow();
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics>({
    totalProcessed: 0,
    successRate: 0,
    averageTime: 0,
    activeWorkflows: 0
  });
  const [selectedTab, setSelectedTab] = useState('active');

  useEffect(() => {
    loadWorkflows();
    const interval = setInterval(loadWorkflows, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadWorkflows = async () => {
    try {
      // Simuler le chargement des workflows
      const mockWorkflows: WorkflowInstance[] = [
        {
          id: 'wf_ocr_001',
          type: 'ocr',
          status: 'running',
          progress: 65,
          startTime: new Date(Date.now() - 1000 * 60 * 5),
          estimatedCompletion: new Date(Date.now() + 1000 * 60 * 3)
        },
        {
          id: 'wf_legal_002',
          type: 'legal',
          status: 'completed',
          progress: 100,
          startTime: new Date(Date.now() - 1000 * 60 * 15),
          data: { documentsProcessed: 25 }
        },
        {
          id: 'wf_proc_003',
          type: 'procedure',
          status: 'pending',
          progress: 0,
          startTime: new Date()
        },
        {
          id: 'wf_val_004',
          type: 'validation',
          status: 'failed',
          progress: 30,
          startTime: new Date(Date.now() - 1000 * 60 * 10)
        }
      ];

      setWorkflows(mockWorkflows);

      // Calculer les métriques
      const stats = unifiedOCRWorkflowService.getWorkflowStatistics();
      setMetrics({
        totalProcessed: stats.totalProcessed + mockWorkflows.filter(w => w.status === 'completed').length,
        successRate: stats.successRate * 100,
        averageTime: stats.averageProcessingTime || 120000,
        activeWorkflows: mockWorkflows.filter(w => w.status === 'running' || w.status === 'pending').length
      });
    } catch (error) {
      console.error('Erreur chargement workflows:', error);
    }
  };

  const startWorkflow = async (type: WorkflowInstance['type']) => {
    const newWorkflow: WorkflowInstance = {
      id: `wf_${type}_${Date.now()}`,
      type,
      status: 'pending',
      progress: 0,
      startTime: new Date()
    };

    setWorkflows(prev => [...prev, newWorkflow]);

    // Simuler le démarrage du workflow
    setTimeout(() => {
      updateWorkflowStatus(newWorkflow.id, 'running');
    }, 1000);
  };

  const updateWorkflowStatus = (id: string, status: WorkflowInstance['status'], progress?: number) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === id 
        ? { ...workflow, status, progress: progress ?? workflow.progress }
        : workflow
    ));
  };

  const pauseWorkflow = (id: string) => {
    updateWorkflowStatus(id, 'paused');
  };

  const resumeWorkflow = (id: string) => {
    updateWorkflowStatus(id, 'running');
  };

  const stopWorkflow = (id: string) => {
    updateWorkflowStatus(id, 'failed');
  };

  const getStatusColor = (status: WorkflowInstance['status']) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: WorkflowInstance['status']) => {
    switch (status) {
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: WorkflowInstance['type']) => {
    switch (type) {
      case 'legal': return t('legal.title') || 'Juridique';
      case 'procedure': return t('procedures.title') || 'Procédures';
      case 'ocr': return t('ocr.title') || 'OCR';
      case 'validation': return 'Validation';
      default: return type;
    }
  };

  const filterWorkflows = (status: string) => {
    switch (status) {
      case 'active':
        return workflows.filter(w => w.status === 'running' || w.status === 'pending');
      case 'completed':
        return workflows.filter(w => w.status === 'completed');
      case 'failed':
        return workflows.filter(w => w.status === 'failed');
      default:
        return workflows;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AlgerianText variant="heading" className="text-2xl font-bold">
          {t('workflow.title') || 'Gestionnaire de Workflows'}
        </AlgerianText>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => startWorkflow('legal')}>
            <FileText className="w-4 h-4 mr-2" />
            Workflow Juridique
          </Button>
          <Button variant="outline" onClick={() => startWorkflow('procedure')}>
            <Settings className="w-4 h-4 mr-2" />
            Workflow Procédure
          </Button>
          <Button onClick={() => openOCRWorkflow()}>
            <Zap className="w-4 h-4 mr-2" />
            Workflow OCR
          </Button>
        </div>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total traités</p>
                <p className="text-lg font-semibold">{formatNumber(metrics.totalProcessed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Taux de succès</p>
                <p className="text-lg font-semibold">{metrics.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Temps moyen</p>
                <p className="text-lg font-semibold">{Math.round(metrics.averageTime / 1000)}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Workflow className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-lg font-semibold">{metrics.activeWorkflows}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active">Actifs</TabsTrigger>
              <TabsTrigger value="completed">Terminés</TabsTrigger>
              <TabsTrigger value="failed">Échecs</TabsTrigger>
              <TabsTrigger value="all">Tous</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-4">
              <div className="space-y-3">
                {filterWorkflows(selectedTab).map((workflow) => (
                  <div key={workflow.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(workflow.status)}`} />
                        <span className="font-medium">{workflow.id}</span>
                        <Badge variant="outline">{getTypeLabel(workflow.type)}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(workflow.status)}
                        <span className="text-sm font-medium capitalize">{workflow.status}</span>
                      </div>
                    </div>

                    {workflow.status === 'running' && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progression</span>
                          <span>{workflow.progress}%</span>
                        </div>
                        <Progress value={workflow.progress} />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <span>Démarré: {formatDate(workflow.startTime, { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                        {workflow.estimatedCompletion && (
                          <span className="ml-4">
                            Fin estimée: {formatDate(workflow.estimatedCompletion, { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {workflow.status === 'running' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => pauseWorkflow(workflow.id)}
                            >
                              <Pause className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => stopWorkflow(workflow.id)}
                            >
                              <Square className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        {workflow.status === 'paused' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resumeWorkflow(workflow.id)}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filterWorkflows(selectedTab).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun workflow dans cette catégorie</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}