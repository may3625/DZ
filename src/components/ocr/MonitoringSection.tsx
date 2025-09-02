import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Monitor, 
  Cpu, 
  HardDrive, 
  Zap, 
  Clock, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity,
  Settings
} from 'lucide-react';

interface SystemMetric {
  id: string;
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  processedDocuments: number;
  queueLength: number;
  avgProcessingTime: number;
  errors: number;
  status: 'optimal' | 'warning' | 'critical';
}

interface ActiveProcess {
  id: string;
  documentName: string;
  processType: string;
  startTime: string;
  progress: number;
  estimatedCompletion: string;
  status: 'processing' | 'queue' | 'completed' | 'error';
}

export function MonitoringSection() {
  const systemMetrics: SystemMetric[] = [
    {
      id: '1',
      timestamp: '2024-01-15 14:30:00',
      cpuUsage: 75,
      memoryUsage: 68,
      diskUsage: 45,
      processedDocuments: 1247,
      queueLength: 5,
      avgProcessingTime: 3.2,
      errors: 2,
      status: 'optimal'
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:25:00',
      cpuUsage: 82,
      memoryUsage: 71,
      diskUsage: 45,
      processedDocuments: 1242,
      queueLength: 8,
      avgProcessingTime: 3.8,
      errors: 1,
      status: 'warning'
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:20:00',
      cpuUsage: 69,
      memoryUsage: 64,
      diskUsage: 44,
      processedDocuments: 1238,
      queueLength: 3,
      avgProcessingTime: 2.9,
      errors: 0,
      status: 'optimal'
    },
    {
      id: '4',
      timestamp: '2024-01-15 14:15:00',
      cpuUsage: 91,
      memoryUsage: 85,
      diskUsage: 44,
      processedDocuments: 1235,
      queueLength: 12,
      avgProcessingTime: 4.5,
      errors: 3,
      status: 'critical'
    },
    {
      id: '5',
      timestamp: '2024-01-15 14:10:00',
      cpuUsage: 73,
      memoryUsage: 67,
      diskUsage: 43,
      processedDocuments: 1229,
      queueLength: 6,
      avgProcessingTime: 3.1,
      errors: 1,
      status: 'optimal'
    },
    {
      id: '6',
      timestamp: '2024-01-15 14:05:00',
      cpuUsage: 78,
      memoryUsage: 72,
      diskUsage: 43,
      processedDocuments: 1224,
      queueLength: 9,
      avgProcessingTime: 3.6,
      errors: 2,
      status: 'warning'
    }
  ];

  const activeProcesses: ActiveProcess[] = [
    {
      id: '1',
      documentName: 'Contrat_Commercial_2024.pdf',
      processType: 'OCR + Analyse',
      startTime: '14:28:15',
      progress: 75,
      estimatedCompletion: '14:31:20',
      status: 'processing'
    },
    {
      id: '2',
      documentName: 'Procedure_Administrative.pdf',
      processType: 'Classification',
      startTime: '14:29:30',
      progress: 45,
      estimatedCompletion: '14:32:10',
      status: 'processing'
    },
    {
      id: '3',
      documentName: 'Document_Identite.jpg',
      processType: 'OCR Simple',
      startTime: '-',
      progress: 0,
      estimatedCompletion: '14:33:00',
      status: 'queue'
    },
    {
      id: '4',
      documentName: 'Certificat_Medical.pdf',
      processType: 'OCR + Validation',
      startTime: '14:25:45',
      progress: 100,
      estimatedCompletion: '14:30:15',
      status: 'completed'
    },
    {
      id: '5',
      documentName: 'Facture_Erreur.pdf',
      processType: 'OCR + Analyse',
      startTime: '14:27:20',
      progress: 25,
      estimatedCompletion: 'Erreur',
      status: 'error'
    }
  ];

  // Pagination pour les métriques
  const {
    currentData: paginatedMetrics,
    currentPage: metricsPage,
    totalPages: metricsTotalPages,
    itemsPerPage: metricsItemsPerPage,
    totalItems: metricsTotalItems,
    setCurrentPage: setMetricsPage,
    setItemsPerPage: setMetricsItemsPerPage
  } = usePagination({
    data: systemMetrics,
    itemsPerPage: 5
  });

  // Pagination pour les processus
  const {
    currentData: paginatedProcesses,
    currentPage: processesPage,
    totalPages: processesTotalPages,
    itemsPerPage: processesItemsPerPage,
    totalItems: processesTotalItems,
    setCurrentPage: setProcessesPage,
    setItemsPerPage: setProcessesItemsPerPage
  } = usePagination({
    data: activeProcesses,
    itemsPerPage: 5
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProcessStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'queue':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Métriques actuelles (dernier enregistrement)
  const currentMetrics = systemMetrics[0];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-green-600" />
            Monitoring Système OCR-IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Surveillance en temps réel des performances et de la charge système
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Settings className="w-4 h-4" />
                Alertes
              </Button>
              <Badge className={getStatusColor(currentMetrics.status)}>
                {currentMetrics.status === 'optimal' ? 'Optimal' : 
                 currentMetrics.status === 'warning' ? 'Attention' : 'Critique'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques système actuelles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">CPU</span>
              </div>
              <span className="text-sm">{currentMetrics.cpuUsage}%</span>
            </div>
            <Progress value={currentMetrics.cpuUsage} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Mémoire</span>
              </div>
              <span className="text-sm">{currentMetrics.memoryUsage}%</span>
            </div>
            <Progress value={currentMetrics.memoryUsage} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Disque</span>
              </div>
              <span className="text-sm">{currentMetrics.diskUsage}%</span>
            </div>
            <Progress value={currentMetrics.diskUsage} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Processus actifs */}
      <Card>
        <CardHeader>
          <CardTitle>Processus Actifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedProcesses.map((process) => (
              <div key={process.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium">{process.documentName}</div>
                    <div className="text-sm text-gray-600">{process.processType}</div>
                  </div>
                  <Badge className={getProcessStatusColor(process.status)}>
                    {process.status === 'processing' ? 'En cours' :
                     process.status === 'queue' ? 'En attente' :
                     process.status === 'completed' ? 'Terminé' : 'Erreur'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progression</span>
                    <span>{process.progress}%</span>
                  </div>
                  <Progress value={process.progress} className="h-2" />
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Début: {process.startTime}</span>
                    <span>Fin estimée: {process.estimatedCompletion}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Pagination
              currentPage={processesPage}
              totalPages={processesTotalPages}
              totalItems={processesTotalItems}
              itemsPerPage={processesItemsPerPage}
              onPageChange={setProcessesPage}
              onItemsPerPageChange={setProcessesItemsPerPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Historique des métriques */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Performances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedMetrics.map((metric) => (
              <div key={metric.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(metric.status)}
                    <span className="font-medium">{metric.timestamp}</span>
                  </div>
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status === 'optimal' ? 'Optimal' : 
                     metric.status === 'warning' ? 'Attention' : 'Critique'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span>CPU: {metric.cpuUsage}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span>RAM: {metric.memoryUsage}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>Docs: {metric.processedDocuments}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>Queue: {metric.queueLength}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Temps moyen: {metric.avgProcessingTime}s | Erreurs: {metric.errors}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Pagination
              currentPage={metricsPage}
              totalPages={metricsTotalPages}
              totalItems={metricsTotalItems}
              itemsPerPage={metricsItemsPerPage}
              onPageChange={setMetricsPage}
              onItemsPerPageChange={setMetricsItemsPerPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}