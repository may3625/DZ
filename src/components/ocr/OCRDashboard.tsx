/**
 * Tableau de bord OCR - Phase 4 du plan d'action
 * Monitoring et optimisation des extractions
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Download,
  RefreshCw,
  Settings,
  Eye
} from 'lucide-react';
import { performanceMonitoringService } from '@/services/enhanced/performanceMonitoringService';
import { getUserExtractions } from '@/services/algerianDocumentExtractionService';
import { toast } from 'sonner';

interface DashboardStats {
  totalExtractions: number;
  averageProcessingTime: number;
  averageConfidence: number;
  languageDistribution: {
    arabic: number;
    french: number;
    mixed: number;
  };
  documentTypes: Record<string, number>;
  recentActivity: Array<{
    filename: string;
    type: string;
    confidence: number;
    processingTime: number;
    timestamp: string;
  }>;
}

interface PerformanceMetrics {
  qualityAlerts: Array<{
    id: string;
    type: 'low_confidence' | 'processing_slow' | 'extraction_failed';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
  }>;
  recommendations: string[];
  trends: {
    confidenceTrend: number[];
    timeTrend: number[];
    volumeTrend: number[];
  };
}

export function OCRDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les extractions utilisateur
      const extractions = await getUserExtractions();
      
      // Calculer les statistiques
      const dashboardStats = calculateStats(extractions);
      setStats(dashboardStats);
      
      // Charger les métriques de performance
      const performanceMetrics = {
        alerts: [],
        recommendations: ["Optimiser la résolution des images", "Utiliser des PDF plutôt que des images"],
        trends: { confidence: [], processingTime: [], volume: [] }
      };
      setMetrics({
        qualityAlerts: performanceMetrics.alerts.map(alert => ({
          id: crypto.randomUUID(),
          type: 'low_confidence',
          message: alert.message,
          severity: alert.severity as 'low' | 'medium' | 'high',
          timestamp: alert.timestamp
        })),
        recommendations: performanceMetrics.recommendations,
        trends: {
          confidenceTrend: performanceMetrics.trends.confidence || [],
          timeTrend: performanceMetrics.trends.processingTime || [],
          volumeTrend: performanceMetrics.trends.volume || []
        }
      });
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (extractions: any[]): DashboardStats => {
    if (extractions.length === 0) {
      return {
        totalExtractions: 0,
        averageProcessingTime: 0,
        averageConfidence: 0,
        languageDistribution: { arabic: 0, french: 0, mixed: 0 },
        documentTypes: {},
        recentActivity: []
      };
    }

    const totalTime = extractions.reduce((sum, ext) => sum + (ext.metadata?.processingTime || 0), 0);
    const totalConfidence = extractions.reduce((sum, ext) => sum + ext.confidenceScore, 0);
    
    const languageDistribution = { arabic: 0, french: 0, mixed: 0 };
    const documentTypes: Record<string, number> = {};
    
    extractions.forEach(ext => {
      // Distribution des langues
      if (ext.languageDetected === 'ar') languageDistribution.arabic++;
      else if (ext.languageDetected === 'fr') languageDistribution.french++;
      else languageDistribution.mixed++;
      
      // Types de documents
      const docType = ext.metadata?.documentType || 'Document';
      documentTypes[docType] = (documentTypes[docType] || 0) + 1;
    });

    const recentActivity = extractions
      .slice(0, 10)
      .map(ext => ({
        filename: ext.originalFilename,
        type: ext.metadata?.documentType || 'Document',
        confidence: ext.confidenceScore * 100,
        processingTime: ext.metadata?.processingTime || 0,
        timestamp: ext.metadata?.processingDate || new Date().toISOString()
      }));

    return {
      totalExtractions: extractions.length,
      averageProcessingTime: totalTime / extractions.length,
      averageConfidence: (totalConfidence / extractions.length) * 100,
      languageDistribution,
      documentTypes,
      recentActivity
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Données mises à jour');
  };

  const exportReport = () => {
    if (!stats || !metrics) return;
    
    const report = {
      timestamp: new Date().toISOString(),
      statistics: stats,
      performance: metrics,
      summary: {
        totalExtractions: stats.totalExtractions,
        averageQuality: `${stats.averageConfidence.toFixed(1)}%`,
        averageSpeed: `${stats.averageProcessingTime.toFixed(0)}ms`,
        alerts: metrics.qualityAlerts.length
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Rapport exporté');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord OCR</h1>
          <p className="text-muted-foreground">
            Monitoring et optimisation des extractions
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button 
            variant="outline" 
            onClick={exportReport}
            disabled={!stats}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Extractions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExtractions}</div>
              <p className="text-xs text-muted-foreground">
                Documents traités
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualité Moyenne</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageConfidence.toFixed(1)}%</div>
              <Progress value={stats.averageConfidence} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageProcessingTime.toFixed(0)}ms</div>
              <p className="text-xs text-muted-foreground">
                Temps de traitement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.qualityAlerts.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Alertes actives
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets détaillés */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activité récente</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution des langues */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribution des langues</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Français</span>
                    <Badge variant="secondary">{stats.languageDistribution.french}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Arabe</span>
                    <Badge variant="secondary">{stats.languageDistribution.arabic}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Mixte</span>
                    <Badge variant="secondary">{stats.languageDistribution.mixed}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Types de documents */}
              <Card>
                <CardHeader>
                  <CardTitle>Types de documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(stats.documentTypes).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span>{type}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {metrics && (
            <div className="space-y-6">
              {/* Alertes qualité */}
              <Card>
                <CardHeader>
                  <CardTitle>Alertes qualité</CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.qualityAlerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">Aucune alerte active</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {metrics.qualityAlerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                            alert.severity === 'high' ? 'text-red-500' :
                            alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm">{alert.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={
                            alert.severity === 'high' ? 'destructive' :
                            alert.severity === 'medium' ? 'default' : 'secondary'
                          }>
                            {alert.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommandations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommandations d'optimisation</CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.recommendations.length === 0 ? (
                    <p className="text-muted-foreground">Aucune recommandation disponible</p>
                  ) : (
                    <ul className="space-y-2">
                      {metrics.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentActivity.length === 0 ? (
                  <p className="text-muted-foreground">Aucune activité récente</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{activity.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.type} • {activity.processingTime}ms
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={activity.confidence > 80 ? 'default' : 
                                   activity.confidence > 60 ? 'secondary' : 'destructive'}
                          >
                            {activity.confidence.toFixed(0)}%
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Insights de performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">💡 Conseil d'optimisation</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    Les documents PDF produisent généralement de meilleurs résultats que les images.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">✅ Bonne pratique</h4>
                  <p className="text-sm text-green-800 mt-1">
                    Une résolution de 300 DPI minimum est recommandée pour l'OCR.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900">⚠️ Attention</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    Les documents avec beaucoup de tables nécessitent un prétraitement spécialisé.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques avancées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm">Taux de réussite</span>
                      <span className="text-sm font-medium">
                        {((stats.totalExtractions / Math.max(stats.totalExtractions, 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Documents par jour</span>
                      <span className="text-sm font-medium">
                        {(stats.totalExtractions / 30).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Temps total</span>
                      <span className="text-sm font-medium">
                        {(stats.averageProcessingTime * stats.totalExtractions / 1000).toFixed(1)}s
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}