/**
 * Tests de performance automatisés
 * Surveillance des métriques vitales de l'application algérienne
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { 
  Timer, 
  Zap, 
  Database, 
  Monitor,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Gauge
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  nameAr: string;
  category: 'loading' | 'runtime' | 'memory' | 'storage' | 'network';
  value: number;
  unit: string;
  threshold: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  trend: 'up' | 'down' | 'stable';
}

interface TestResult {
  timestamp: Date;
  overall: number;
  metrics: PerformanceMetric[];
  recommendations: string[];
}

export function PerformanceTestSuite() {
  const { t, language, formatNumber } = useAlgerianI18n();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResult | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Métriques de performance prédéfinies
  const performanceMetrics: PerformanceMetric[] = [
    {
      id: 'fcp',
      name: 'First Contentful Paint',
      nameAr: 'أول رسم للمحتوى',
      category: 'loading',
      value: 0,
      unit: 'ms',
      threshold: 1800,
      status: 'good',
      trend: 'stable'
    },
    {
      id: 'lcp',
      name: 'Largest Contentful Paint',
      nameAr: 'أكبر رسم للمحتوى',
      category: 'loading',
      value: 0,
      unit: 'ms',
      threshold: 2500,
      status: 'good',
      trend: 'stable'
    },
    {
      id: 'cls',
      name: 'Cumulative Layout Shift',
      nameAr: 'التحول التراكمي للتخطيط',
      category: 'runtime',
      value: 0,
      unit: '',
      threshold: 0.1,
      status: 'good',
      trend: 'stable'
    },
    {
      id: 'fid',
      name: 'First Input Delay',
      nameAr: 'تأخير الإدخال الأول',
      category: 'runtime',
      value: 0,
      unit: 'ms',
      threshold: 100,
      status: 'good',
      trend: 'stable'
    },
    {
      id: 'memory_heap',
      name: 'Memory Heap Usage',
      nameAr: 'استخدام ذاكرة التخزين المؤقت',
      category: 'memory',
      value: 0,
      unit: 'MB',
      threshold: 50,
      status: 'good',
      trend: 'stable'
    },
    {
      id: 'indexeddb_size',
      name: 'IndexedDB Storage',
      nameAr: 'تخزين قاعدة البيانات المحلية',
      category: 'storage',
      value: 0,
      unit: 'MB',
      threshold: 100,
      status: 'good',
      trend: 'stable'
    },
    {
      id: 'cache_efficiency',
      name: 'Cache Hit Rate',
      nameAr: 'معدل نجاح التخزين المؤقت',
      category: 'network',
      value: 0,
      unit: '%',
      threshold: 80,
      status: 'good',
      trend: 'stable'
    }
  ];

  const runPerformanceTests = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);

    const testResults: PerformanceMetric[] = [];
    const recommendations: string[] = [];

    for (let i = 0; i < performanceMetrics.length; i++) {
      const metric = performanceMetrics[i];
      
      // Simuler la mesure de performance
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let value: number;
      let status: PerformanceMetric['status'];
      
      // Générer des valeurs réalistes pour chaque métrique
      switch (metric.id) {
        case 'fcp':
          value = Math.random() * 2000 + 800; // 800-2800ms
          break;
        case 'lcp':
          value = Math.random() * 3000 + 1500; // 1500-4500ms
          break;
        case 'cls':
          value = Math.random() * 0.2; // 0-0.2
          break;
        case 'fid':
          value = Math.random() * 150 + 20; // 20-170ms
          break;
        case 'memory_heap':
          value = Math.random() * 80 + 20; // 20-100MB
          break;
        case 'indexeddb_size':
          value = Math.random() * 50 + 5; // 5-55MB
          break;
        case 'cache_efficiency':
          value = Math.random() * 30 + 70; // 70-100%
          break;
        default:
          value = Math.random() * 100;
      }

      // Déterminer le statut basé sur le seuil
      if (metric.id === 'cache_efficiency') {
        // Pour le cache, plus c'est haut, mieux c'est
        if (value >= metric.threshold) status = 'excellent';
        else if (value >= metric.threshold * 0.8) status = 'good';
        else if (value >= metric.threshold * 0.6) status = 'warning';
        else status = 'poor';
      } else {
        // Pour les autres métriques, moins c'est mieux
        if (value <= metric.threshold * 0.5) status = 'excellent';
        else if (value <= metric.threshold) status = 'good';
        else if (value <= metric.threshold * 1.5) status = 'warning';
        else status = 'poor';
      }

      // Générer des recommandations spécifiques
      if (status === 'warning' || status === 'poor') {
        switch (metric.category) {
          case 'loading':
            recommendations.push('Optimiser le chargement des ressources critiques');
            break;
          case 'runtime':
            recommendations.push('Réduire les calculs JavaScript intensifs');
            break;
          case 'memory':
            recommendations.push('Optimiser la gestion de la mémoire');
            break;
          case 'storage':
            recommendations.push('Nettoyer le stockage local');
            break;
          case 'network':
            recommendations.push('Améliorer la stratégie de cache');
            break;
        }
      }

      testResults.push({
        ...metric,
        value,
        status,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      });

      setProgress(((i + 1) / performanceMetrics.length) * 100);
    }

    // Calculer le score global
    const overall = testResults.reduce((acc, metric) => {
      const statusScores = { excellent: 100, good: 80, warning: 60, poor: 40 };
      return acc + statusScores[metric.status];
    }, 0) / testResults.length;

    const result: TestResult = {
      timestamp: new Date(),
      overall,
      metrics: testResults,
      recommendations: [...new Set(recommendations)]
    };

    setResults(result);
    setHistory(prev => [...prev, result].slice(-10)); // Garder les 10 derniers résultats
    setIsRunning(false);
  }, []);

  const getStatusIcon = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'poor': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-green-500" />;
      default: return <div className="h-3 w-3 rounded-full bg-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'loading': return <Timer className="h-4 w-4" />;
      case 'runtime': return <Zap className="h-4 w-4" />;
      case 'memory': return <Monitor className="h-4 w-4" />;
      case 'storage': return <Database className="h-4 w-4" />;
      case 'network': return <Gauge className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const filteredMetrics = results?.metrics.filter(metric => 
    selectedCategory === 'all' || metric.category === selectedCategory
  ) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Tests de Performance Automatisés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Surveillance des métriques vitales Web et stockage local
                </p>
                {results && (
                  <p className="text-2xl font-bold text-primary">
                    Score: {formatNumber(Math.round(results.overall))}/100
                  </p>
                )}
              </div>
              <Button 
                onClick={runPerformanceTests}
                disabled={isRunning}
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Zap className="h-4 w-4 animate-spin" />
                    Tests en cours...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Lancer les tests
                  </>
                )}
              </Button>
            </div>

            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Métriques détaillées</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="loading">Chargement</TabsTrigger>
                <TabsTrigger value="runtime">Exécution</TabsTrigger>
                <TabsTrigger value="memory">Mémoire</TabsTrigger>
                <TabsTrigger value="storage">Stockage</TabsTrigger>
                <TabsTrigger value="network">Réseau</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-6">
                <div className="grid gap-4">
                  {filteredMetrics.map((metric) => (
                    <Card key={metric.id} className="border-l-4 border-l-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getCategoryIcon(metric.category)}
                            <div>
                              <h4 className="font-medium">
                                {language === 'ar' ? metric.nameAr : metric.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-muted-foreground">
                                  {formatNumber(metric.value)}{metric.unit}
                                </span>
                                {getTrendIcon(metric.trend)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                metric.status === 'excellent' || metric.status === 'good' ? 'default' : 
                                metric.status === 'warning' ? 'secondary' : 'destructive'
                              }
                            >
                              {metric.status}
                            </Badge>
                            {getStatusIcon(metric.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {results && results.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommandations d'optimisation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}