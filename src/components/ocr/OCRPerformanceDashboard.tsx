/**
 * Interface de dashboard de performance OCR - Monitoring et optimisation
 * Complète le plan d'action OCR unifié - Phase 4
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  FileText,
  Zap,
  Target,
  Download,
  RefreshCw
} from 'lucide-react';
import { performanceMonitoringService } from '@/services/enhanced/performanceMonitoringService';
import { unifiedOCRWorkflowService } from '@/services/unifiedOCRWorkflowService';
import { toast } from 'sonner';

interface DashboardStats {
  totalDocuments: number;
  successRate: number;
  averageProcessingTime: number;
  qualityScore: number;
  activeAlerts: number;
  dailyThroughput: number;
}

interface PerformanceChart {
  name: string;
  time: number;
  quality: number;
  success: number;
}

interface QualityDistribution {
  range: string;
  count: number;
  percentage: number;
}

export function OCRPerformanceDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    successRate: 0,
    averageProcessingTime: 0,
    qualityScore: 0,
    activeAlerts: 0,
    dailyThroughput: 0
  });

  const [performanceData, setPerformanceData] = useState<PerformanceChart[]>([]);
  const [qualityDistribution, setQualityDistribution] = useState<QualityDistribution[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Charger les métriques de performance
      const metrics = performanceMonitoringService.getMetrics();
      const systemHealth = performanceMonitoringService.getSystemHealth();
      const activeAlerts = performanceMonitoringService.getActiveAlerts();
      const workflowStats = unifiedOCRWorkflowService.getWorkflowStatistics();

      // Calculer les statistiques
      const successfulMetrics = metrics.filter(m => m.success);
      const avgTime = successfulMetrics.length > 0 
        ? successfulMetrics.reduce((sum, m) => sum + m.duration, 0) / successfulMetrics.length 
        : 0;
      const avgQuality = successfulMetrics.length > 0
        ? successfulMetrics.reduce((sum, m) => sum + m.quality, 0) / successfulMetrics.length
        : 0;

      setStats({
        totalDocuments: metrics.length,
        successRate: metrics.length > 0 ? (successfulMetrics.length / metrics.length) * 100 : 0,
        averageProcessingTime: avgTime,
        qualityScore: avgQuality * 100,
        activeAlerts: activeAlerts.length,
        dailyThroughput: calculateDailyThroughput(metrics)
      });

      // Préparer les données de graphiques
      setPerformanceData(preparePerformanceChart(metrics));
      setQualityDistribution(prepareQualityDistribution(successfulMetrics));
      setAlerts(activeAlerts.slice(0, 5)); // Limiter à 5 alertes
      
      // Générer des recommandations
      const recs = generateRecommendations(systemHealth, avgTime, avgQuality);
      setRecommendations(recs);

      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const calculateDailyThroughput = (metrics: any[]): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMetrics = metrics.filter(m => new Date(m.timestamp) >= today);
    return todayMetrics.length;
  };

  const preparePerformanceChart = (metrics: any[]): PerformanceChart[] => {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMetrics = metrics.filter(m => new Date(m.timestamp) >= last24Hours);
    
    // Grouper par heure
    const hourlyData: { [hour: string]: { time: number; quality: number; success: number; count: number } } = {};
    
    recentMetrics.forEach(metric => {
      const hour = new Date(metric.timestamp).getHours();
      const hourKey = `${hour}h`;
      
      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = { time: 0, quality: 0, success: 0, count: 0 };
      }
      
      hourlyData[hourKey].time += metric.duration;
      hourlyData[hourKey].quality += metric.quality;
      hourlyData[hourKey].success += metric.success ? 1 : 0;
      hourlyData[hourKey].count++;
    });

    return Object.entries(hourlyData).map(([hour, data]) => ({
      name: hour,
      time: Math.round(data.time / data.count),
      quality: Math.round((data.quality / data.count) * 100),
      success: Math.round((data.success / data.count) * 100)
    }));
  };

  const prepareQualityDistribution = (metrics: any[]): QualityDistribution[] => {
    const ranges = [
      { min: 0.9, max: 1.0, label: '90-100%' },
      { min: 0.8, max: 0.9, label: '80-89%' },
      { min: 0.7, max: 0.8, label: '70-79%' },
      { min: 0.6, max: 0.7, label: '60-69%' },
      { min: 0, max: 0.6, label: '<60%' }
    ];

    const total = metrics.length;
    return ranges.map(range => {
      const count = metrics.filter(m => m.quality >= range.min && m.quality < range.max).length;
      return {
        range: range.label,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      };
    });
  };

  const generateRecommendations = (health: any, avgTime: number, avgQuality: number): string[] => {
    const recs: string[] = [];

    if (avgTime > 60000) {
      recs.push('Temps de traitement élevé - optimiser la configuration OCR');
    }

    if (avgQuality < 0.8) {
      recs.push('Qualité moyenne faible - améliorer le prétraitement des images');
    }

    if (health.cpuUsage > 80) {
      recs.push('Usage CPU élevé - considérer la parallélisation');
    }

    if (health.memoryUsage > 80) {
      recs.push('Usage mémoire élevé - réduire la taille des lots');
    }

    if (recs.length === 0) {
      recs.push('Performance optimale - système fonctionnant correctement');
    }

    return recs;
  };

  const handleExportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      stats,
      performanceData,
      qualityDistribution,
      alerts,
      recommendations
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-performance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Rapport de performance exporté');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Dashboard de Performance OCR
          </h2>
          <p className="text-gray-600 mt-1">
            Monitoring et optimisation du workflow d'extraction
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadDashboardData}
            disabled={isLoading}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          <Button 
            onClick={handleExportReport}
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Documents traités</p>
                <p className="text-2xl font-bold">{stats.totalDocuments}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de succès</p>
                <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Temps moyen</p>
                <p className="text-2xl font-bold">{(stats.averageProcessingTime / 1000).toFixed(1)}s</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Qualité moyenne</p>
                <p className="text-2xl font-bold">{stats.qualityScore.toFixed(1)}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes actives */}
      {alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <div className="font-medium mb-2">{alerts.length} alerte(s) active(s) :</div>
            <ul className="list-disc list-inside space-y-1">
              {alerts.map((alert, index) => (
                <li key={index}>{alert.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Graphiques et analyses */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="quality">Qualité</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance par heure (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="time" fill="#8884d8" name="Temps (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribution de la qualité</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={qualityDistribution}
                      dataKey="count"
                      nameKey="range"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {qualityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métriques de qualité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {qualityDistribution.map((dist, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{dist.range}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={dist.percentage} className="w-20" />
                      <span className="text-sm w-12">{dist.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Tendances de performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="quality" stroke="#8884d8" name="Qualité %" />
                  <Line type="monotone" dataKey="success" stroke="#82ca9d" name="Succès %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Recommandations d'optimisation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                    <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}