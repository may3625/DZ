import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProcessingMetric {
  id: string;
  timestamp: Date;
  duration: number;
  fileType: string;
  fileSize: number;
  success: boolean;
  errorMessage?: string;
  entitiesExtracted: number;
  confidence: number;
}

interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  component: string;
  details?: Record<string, any>;
}

export const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState<ProcessingMetric[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Pagination pour les métriques
  const {
    currentData: paginatedMetrics,
    currentPage: metricsCurrentPage,
    totalPages: metricsTotalPages,
    itemsPerPage: metricsItemsPerPage,
    totalItems: metricsTotalItems,
    setCurrentPage: setMetricsCurrentPage,
    setItemsPerPage: setMetricsItemsPerPage
  } = usePagination({
    data: metrics,
    itemsPerPage: 5
  });

  // Pagination pour les logs
  const {
    currentData: paginatedLogs,
    currentPage: logsCurrentPage,
    totalPages: logsTotalPages,
    itemsPerPage: logsItemsPerPage,
    totalItems: logsTotalItems,
    setCurrentPage: setLogsCurrentPage,
    setItemsPerPage: setLogsItemsPerPage
  } = usePagination({
    data: logs,
    itemsPerPage: 5
  });

  // Simulation de métriques
  useEffect(() => {
    const generateMockMetrics = (): ProcessingMetric[] => {
      const fileTypes = ['PDF', 'Image', 'Word', 'Text'];
      const mockMetrics: ProcessingMetric[] = [];
      
      for (let i = 0; i < 20; i++) {
        const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
        mockMetrics.push({
          id: `metric-${i}`,
          timestamp,
          duration: Math.random() * 5000 + 1000, // 1-6 secondes
          fileType: fileTypes[Math.floor(Math.random() * fileTypes.length)],
          fileSize: Math.random() * 5000000 + 100000, // 100KB-5MB
          success: Math.random() > 0.15, // 85% de réussite
          entitiesExtracted: Math.floor(Math.random() * 20),
          confidence: Math.random() * 0.4 + 0.6, // 60-100%
          errorMessage: Math.random() > 0.85 ? 'Erreur de traitement OCR' : undefined
        });
      }
      
      return mockMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    };

    const generateMockLogs = (): SystemLog[] => {
      const components = ['OCR Engine', 'File Parser', 'Entity Extractor', 'Export System'];
      const messages = [
        'Traitement document initié',
        'Extraction entités terminée',
        'Export généré avec succès',
        'Erreur de connexion base de données',
        'Cache mis à jour',
        'Validation document échouée'
      ];
      
      const mockLogs: SystemLog[] = [];
      
      for (let i = 0; i < 50; i++) {
        const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
        const isError = Math.random() < 0.1;
        const isWarning = Math.random() < 0.2;
        
        mockLogs.push({
          id: `log-${i}`,
          timestamp,
          level: isError ? 'error' : isWarning ? 'warning' : 'info',
          message: messages[Math.floor(Math.random() * messages.length)],
          component: components[Math.floor(Math.random() * components.length)],
          details: Math.random() > 0.7 ? { 
            duration: Math.random() * 1000,
            memoryUsage: Math.random() * 100 
          } : undefined
        });
      }
      
      return mockLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    };

    setMetrics(generateMockMetrics());
    setLogs(generateMockLogs());
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    
    // Simulation d'un refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsRefreshing(false);
    toast({
      title: "Données actualisées",
      description: "Les métriques ont été mises à jour"
    });
  };

  const calculateStats = () => {
    const last24h = metrics.filter(m => 
      Date.now() - m.timestamp.getTime() < 24 * 60 * 60 * 1000
    );
    
    const successRate = last24h.length > 0 
      ? (last24h.filter(m => m.success).length / last24h.length) * 100 
      : 0;
    
    const avgDuration = last24h.length > 0
      ? last24h.reduce((sum, m) => sum + m.duration, 0) / last24h.length
      : 0;
    
    const avgConfidence = last24h.length > 0
      ? last24h.reduce((sum, m) => sum + m.confidence, 0) / last24h.length
      : 0;

    const totalEntities = last24h.reduce((sum, m) => sum + m.entitiesExtracted, 0);

    return {
      totalProcessed: last24h.length,
      successRate,
      avgDuration,
      avgConfidence,
      totalEntities,
      errors: last24h.filter(m => !m.success).length
    };
  };

  const stats = calculateStats();

  const getLogIcon = (level: SystemLog['level']) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getLogBadge = (level: SystemLog['level']) => {
    const variants = {
      error: 'destructive',
      warning: 'secondary',
      info: 'outline'
    } as const;

    return <Badge variant={variants[level]}>{level.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monitoring et Performance
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualisation...' : 'Actualiser'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Métriques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <div className="text-sm font-medium">Documents traités</div>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.totalProcessed}</div>
            <div className="text-xs text-muted-foreground">Dernières 24h</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="text-sm font-medium">Taux de réussite</div>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.successRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              {stats.errors} erreurs
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div className="text-sm font-medium">Temps moyen</div>
            </div>
            <div className="text-2xl font-bold mt-1">
              {(stats.avgDuration / 1000).toFixed(1)}s
            </div>
            <div className="text-xs text-muted-foreground">Par document</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div className="text-sm font-medium">Confiance moyenne</div>
            </div>
            <div className="text-2xl font-bold mt-1">
              {(stats.avgConfidence * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.totalEntities} entités
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Métriques de Performance</TabsTrigger>
          <TabsTrigger value="logs">Logs Système</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Traitements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  {paginatedMetrics.map((metric) => (
                    <div key={metric.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {metric.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium">{metric.fileType}</span>
                          <Badge variant="outline">
                            {(metric.fileSize / 1024 / 1024).toFixed(1)} MB
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {metric.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Durée</div>
                          <div>{(metric.duration / 1000).toFixed(1)}s</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Confiance</div>
                          <div>{(metric.confidence * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Entités</div>
                          <div>{metric.entitiesExtracted}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Statut</div>
                          <div className={metric.success ? 'text-green-500' : 'text-red-500'}>
                            {metric.success ? 'Succès' : 'Erreur'}
                          </div>
                        </div>
                      </div>
                      
                      {metric.errorMessage && (
                        <div className="mt-2 text-sm text-red-500">
                          Erreur: {metric.errorMessage}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Pagination pour les métriques */}
                {metricsTotalPages > 1 && (
                  <Pagination
                    currentPage={metricsCurrentPage}
                    totalPages={metricsTotalPages}
                    totalItems={metricsTotalItems}
                    itemsPerPage={metricsItemsPerPage}
                    onPageChange={setMetricsCurrentPage}
                    onItemsPerPageChange={setMetricsItemsPerPage}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs Système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  {paginatedLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getLogIcon(log.level)}
                          <span className="font-medium text-sm">{log.component}</span>
                          {getLogBadge(log.level)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.timestamp.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-sm mb-2">{log.message}</div>
                      
                      {log.details && (
                        <div className="text-xs text-muted-foreground">
                          <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Pagination pour les logs */}
                {logsTotalPages > 1 && (
                  <Pagination
                    currentPage={logsCurrentPage}
                    totalPages={logsTotalPages}
                    totalItems={logsTotalItems}
                    itemsPerPage={logsItemsPerPage}
                    onPageChange={setLogsCurrentPage}
                    onItemsPerPageChange={setLogsItemsPerPage}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Type de Fichier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['PDF', 'Image', 'Word', 'Text'].map(type => {
                    const count = metrics.filter(m => m.fileType === type).length;
                    const percentage = metrics.length > 0 ? (count / metrics.length) * 100 : 0;
                    
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          <span className="text-sm">{type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Temps de traitement moyen</span>
                      <span>{(stats.avgDuration / 1000).toFixed(1)}s</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.min((stats.avgDuration / 5000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taux de réussite</span>
                      <span>{stats.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${stats.successRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confiance moyenne</span>
                      <span>{(stats.avgConfidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${stats.avgConfidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};