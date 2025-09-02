import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Bell,
  Settings,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { performanceMonitoringService } from '@/services/enhanced/performanceMonitoringService';

interface QualityAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  documentId?: string;
  confidence?: number;
}

interface QualityRecommendation {
  id: string;
  category: 'performance' | 'accuracy' | 'processing';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  implemented: boolean;
}

export const OCRQualityDashboard = () => {
  const { toast } = useToast();
  const [qualityAlerts, setQualityAlerts] = useState<QualityAlert[]>([]);
  const [recommendations, setRecommendations] = useState<QualityRecommendation[]>([]);
  const [qualityTrends, setQualityTrends] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemHealth, setSystemHealth] = useState<any>({});

  useEffect(() => {
    loadQualityData();
    const interval = setInterval(loadQualityData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadQualityData = async () => {
    setIsRefreshing(true);
    try {
      // Charger les données de performance
      const metrics = performanceMonitoringService.getMetrics(100);
      const health = performanceMonitoringService.getSystemHealth();
      const alerts = performanceMonitoringService.getActiveAlerts();

      setSystemHealth(health);
      
      // Convertir les alertes de performance en alertes qualité
      const qualityAlerts: QualityAlert[] = alerts.map(alert => ({
        id: alert.id,
        type: alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info',
        title: alert.message,
        description: `Alerte ${alert.type} détectée`,
        timestamp: alert.timestamp,
        resolved: alert.resolved
      }));

      // Ajouter des alertes qualité spécifiques
      if (metrics.length > 0) {
        const recentMetrics = metrics.slice(-20);
        const avgConfidence = recentMetrics.reduce((sum, m) => sum + m.quality, 0) / recentMetrics.length;
        const lowConfidenceCount = recentMetrics.filter(m => m.quality < 0.7).length;

        if (avgConfidence < 0.75) {
          qualityAlerts.push({
            id: 'low_avg_confidence',
            type: 'warning',
            title: 'Confiance moyenne faible',
            description: `Confiance moyenne: ${Math.round(avgConfidence * 100)}% (recommandé: >75%)`,
            timestamp: new Date(),
            resolved: false,
            confidence: avgConfidence
          });
        }

        if (lowConfidenceCount > 5) {
          qualityAlerts.push({
            id: 'frequent_low_confidence',
            type: 'error',
            title: 'Confiance fréquemment faible',
            description: `${lowConfidenceCount} documents avec confiance <70% dans les 20 derniers`,
            timestamp: new Date(),
            resolved: false
          });
        }
      }

      setQualityAlerts(qualityAlerts);

      // Générer des recommandations d'amélioration
      const newRecommendations = generateRecommendations(metrics, health);
      setRecommendations(newRecommendations);

      // Calculer les tendances qualité
      const trends = calculateQualityTrends(metrics);
      setQualityTrends(trends);

    } catch (error) {
      console.error('Erreur lors du chargement des données qualité:', error);
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de charger les données de qualité.',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const generateRecommendations = (metrics: any[], health: any): QualityRecommendation[] => {
    const recommendations: QualityRecommendation[] = [];

    if (metrics.length > 0) {
      const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
      const avgQuality = metrics.reduce((sum, m) => sum + m.quality, 0) / metrics.length;

      if (avgDuration > 5000) {
        recommendations.push({
          id: 'optimize_performance',
          category: 'performance',
          title: 'Optimiser les performances de traitement',
          description: `Temps moyen: ${Math.round(avgDuration)}ms. Considérer l'optimisation des algorithmes.`,
          impact: 'high',
          effort: 'medium',
          implemented: false
        });
      }

      if (avgQuality < 0.8) {
        recommendations.push({
          id: 'improve_accuracy',
          category: 'accuracy',
          title: 'Améliorer la précision OCR',
          description: `Qualité moyenne: ${Math.round(avgQuality * 100)}%. Ajuster les paramètres de reconnaissance.`,
          impact: 'high',
          effort: 'high',
          implemented: false
        });
      }

      const errorRate = metrics.filter(m => !m.success).length / metrics.length;
      if (errorRate > 0.1) {
        recommendations.push({
          id: 'reduce_errors',
          category: 'processing',
          title: 'Réduire le taux d\'erreur',
          description: `Taux d'erreur: ${Math.round(errorRate * 100)}%. Améliorer la validation d'entrée.`,
          impact: 'medium',
          effort: 'low',
          implemented: false
        });
      }
    }

    if (health.memoryUsage > 80) {
      recommendations.push({
        id: 'optimize_memory',
        category: 'performance',
        title: 'Optimiser l\'utilisation mémoire',
        description: `Utilisation mémoire: ${health.memoryUsage}%. Implémenter le nettoyage automatique.`,
        impact: 'medium',
        effort: 'medium',
        implemented: false
      });
    }

    return recommendations;
  };

  const calculateQualityTrends = (metrics: any[]) => {
    if (metrics.length < 10) return [];

    const recent = metrics.slice(-20);
    const previous = metrics.slice(-40, -20);

    const recentAvgQuality = recent.reduce((sum, m) => sum + m.quality, 0) / recent.length;
    const previousAvgQuality = previous.length > 0 
      ? previous.reduce((sum, m) => sum + m.quality, 0) / previous.length
      : recentAvgQuality;

    const qualityTrend = recentAvgQuality - previousAvgQuality;

    const recentAvgDuration = recent.reduce((sum, m) => sum + m.duration, 0) / recent.length;
    const previousAvgDuration = previous.length > 0
      ? previous.reduce((sum, m) => sum + m.duration, 0) / previous.length
      : recentAvgDuration;

    const performanceTrend = previousAvgDuration - recentAvgDuration; // Positive = improvement

    return [
      {
        metric: 'Qualité',
        current: recentAvgQuality,
        trend: qualityTrend,
        isImproving: qualityTrend > 0
      },
      {
        metric: 'Performance',
        current: recentAvgDuration,
        trend: performanceTrend,
        isImproving: performanceTrend > 0
      }
    ];
  };

  const resolveAlert = (alertId: string) => {
    setQualityAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    toast({
      title: 'Alerte résolue',
      description: 'L\'alerte a été marquée comme résolue.'
    });
  };

  const implementRecommendation = (recommendationId: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId ? { ...rec, implemented: true } : rec
    ));
    toast({
      title: 'Recommandation implémentée',
      description: 'La recommandation a été marquée comme implémentée.'
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const activeAlerts = qualityAlerts.filter(alert => !alert.resolved);
  const overallHealthScore = Math.round(
    ((systemHealth.cpuUsage ? (100 - systemHealth.cpuUsage) : 80) +
     (systemHealth.memoryUsage ? (100 - systemHealth.memoryUsage) : 80) +
     (activeAlerts.length === 0 ? 100 : Math.max(0, 100 - activeAlerts.length * 20))) / 3
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord Qualité OCR</h1>
          <p className="text-muted-foreground">Monitoring et optimisation de la qualité d'extraction</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={overallHealthScore > 80 ? "default" : overallHealthScore > 60 ? "secondary" : "destructive"}>
            Santé: {overallHealthScore}%
          </Badge>
          <Button
            onClick={loadQualityData}
            disabled={isRefreshing}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Vue d'ensemble de la santé */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Santé globale</p>
                <p className="text-2xl font-bold">{overallHealthScore}%</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <Progress value={overallHealthScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertes actives</p>
                <p className="text-2xl font-bold">{activeAlerts.length}</p>
              </div>
              <Bell className={`w-8 h-8 ${activeAlerts.length > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPU</p>
                <p className="text-2xl font-bold">{systemHealth.cpuUsage || 0}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <Progress value={systemHealth.cpuUsage || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mémoire</p>
                <p className="text-2xl font-bold">{systemHealth.memoryUsage || 0}%</p>
              </div>
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <Progress value={systemHealth.memoryUsage || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">
            Alertes qualité ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alertes qualité en temps réel
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeAlerts.length > 0 ? (
                <div className="space-y-3">
                  {activeAlerts.map((alert) => (
                    <Alert key={alert.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getAlertIcon(alert.type)}
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <AlertDescription>{alert.description}</AlertDescription>
                          <p className="text-xs text-muted-foreground mt-1">
                            {alert.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Résoudre
                      </Button>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-medium">Aucune alerte active</p>
                  <p className="text-muted-foreground">Le système fonctionne normalement</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tendances de qualité
              </CardTitle>
            </CardHeader>
            <CardContent>
              {qualityTrends.length > 0 ? (
                <div className="space-y-4">
                  {qualityTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{trend.metric}</h4>
                        <p className="text-sm text-muted-foreground">
                          Valeur actuelle: {
                            trend.metric === 'Qualité' 
                              ? `${Math.round(trend.current * 100)}%`
                              : `${Math.round(trend.current)}ms`
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {trend.isImproving ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                        <span className={trend.isImproving ? 'text-green-600' : 'text-red-600'}>
                          {trend.isImproving ? 'Amélioration' : 'Dégradation'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Pas assez de données pour calculer les tendances.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Recommandations d'amélioration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.filter(rec => !rec.implemented).map((recommendation) => (
                    <div key={recommendation.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{recommendation.title}</h4>
                            <Badge className={getImpactColor(recommendation.impact)}>
                              Impact {recommendation.impact}
                            </Badge>
                            <Badge variant="outline">
                              Effort {recommendation.effort}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {recommendation.description}
                          </p>
                          <Badge variant="secondary" className="capitalize">
                            {recommendation.category}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => implementRecommendation(recommendation.id)}
                        >
                          Implémenter
                        </Button>
                      </div>
                    </div>
                  ))}

                  {recommendations.filter(rec => rec.implemented).length > 0 && (
                    <div>
                      <h5 className="font-medium text-green-600 mb-2">Recommandations implémentées</h5>
                      <div className="space-y-2">
                        {recommendations.filter(rec => rec.implemented).map((rec) => (
                          <div key={rec.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-medium text-green-800">{rec.title}</p>
                            <CheckCircle className="w-4 h-4 text-green-600 inline" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-medium">Aucune recommandation</p>
                  <p className="text-muted-foreground">Le système est optimisé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration des alertes qualité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Seuil de confiance minimum</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      defaultValue="0.7"
                      className="w-full mt-1 p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Temps de traitement maximum (ms)</label>
                    <input 
                      type="number" 
                      min="1000" 
                      max="30000" 
                      step="1000" 
                      defaultValue="10000"
                      className="w-full mt-1 p-2 border rounded"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Utilisation CPU maximum (%)</label>
                    <input 
                      type="number" 
                      min="50" 
                      max="100" 
                      step="5" 
                      defaultValue="80"
                      className="w-full mt-1 p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Utilisation mémoire maximum (%)</label>
                    <input 
                      type="number" 
                      min="50" 
                      max="100" 
                      step="5" 
                      defaultValue="85"
                      className="w-full mt-1 p-2 border rounded"
                    />
                  </div>
                </div>

                <Button>Sauvegarder la configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};