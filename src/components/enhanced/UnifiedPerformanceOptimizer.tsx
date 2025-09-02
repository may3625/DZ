/**
 * Optimiseur de performance unifié pour Dalil.dz
 * Phase 4: Mode Local et Performance - Système complet d'optimisation
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Database, 
  Image, 
  Wifi, 
  HardDrive, 
  Cpu, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  BarChart3,
  Clock
} from 'lucide-react';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  loadTime: number;
  bundleSize: number;
  memoryUsage: number;
  cacheHitRate: number;
  renderTime: number;
  networkRequests: number;
  errorRate: number;
  userSatisfaction: number;
  lastUpdated: Date;
}

interface OptimizationSettings {
  lazyLoading: boolean;
  imageOptimization: boolean;
  codesplitting: boolean;
  bundleOptimization: boolean;
  cacheStrategy: 'aggressive' | 'moderate' | 'conservative';
  prefetchStrategy: 'all' | 'critical' | 'none';
  compressionLevel: 'high' | 'medium' | 'low';
  offlineMode: boolean;
  serviceWorkerEnabled: boolean;
  criticalCSSInlined: boolean;
}

interface CacheInfo {
  totalSize: number;
  itemCount: number;
  hitRate: number;
  lastCleanup: Date;
  categories: {
    legal: { size: number; count: number };
    procedures: { size: number; count: number };
    ocr: { size: number; count: number };
    assets: { size: number; count: number };
  };
}

export function UnifiedPerformanceOptimizer() {
  const { t, isRTL } = useAlgerianI18n();
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    bundleSize: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    renderTime: 0,
    networkRequests: 0,
    errorRate: 0,
    userSatisfaction: 0,
    lastUpdated: new Date()
  });

  const [settings, setSettings] = useState<OptimizationSettings>({
    lazyLoading: true,
    imageOptimization: true,
    codesplitting: true,
    bundleOptimization: true,
    cacheStrategy: 'moderate',
    prefetchStrategy: 'critical',
    compressionLevel: 'medium',
    offlineMode: false,
    serviceWorkerEnabled: true,
    criticalCSSInlined: true
  });

  const [cacheInfo, setCacheInfo] = useState<CacheInfo>({
    totalSize: 0,
    itemCount: 0,
    hitRate: 0,
    lastCleanup: new Date(),
    categories: {
      legal: { size: 0, count: 0 },
      procedures: { size: 0, count: 0 },
      ocr: { size: 0, count: 0 },
      assets: { size: 0, count: 0 }
    }
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<Date | null>(null);

  // Calcul du score de performance global
  const performanceScore = useMemo(() => {
    const weights = {
      loadTime: 0.25,
      bundleSize: 0.15,
      memoryUsage: 0.15,
      cacheHitRate: 0.20,
      renderTime: 0.15,
      errorRate: 0.10
    };

    const scores = {
      loadTime: Math.max(0, 100 - (metrics.loadTime / 50)), // 50ms = score 100
      bundleSize: Math.max(0, 100 - (metrics.bundleSize / 1000)), // 1MB = score 100
      memoryUsage: Math.max(0, 100 - (metrics.memoryUsage / 100)), // 100MB = score 100
      cacheHitRate: metrics.cacheHitRate,
      renderTime: Math.max(0, 100 - (metrics.renderTime / 20)), // 20ms = score 100
      errorRate: Math.max(0, 100 - (metrics.errorRate * 10)) // 10% erreur = score 0
    };

    return Math.round(
      Object.entries(weights).reduce((total, [key, weight]) => {
        return total + (scores[key as keyof typeof scores] * weight);
      }, 0)
    );
  }, [metrics]);

  // Collecte des métriques de performance
  const collectMetrics = useCallback(async () => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;
      
      // Métriques de base
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      
      // Taille du bundle (approximation)
      const resources = performance.getEntriesByType('resource');
      const bundleSize = resources.reduce((total, resource) => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          return total + (resource as any).transferSize || 0;
        }
        return total;
      }, 0);

      // Utilisation mémoire
      const memoryUsage = memory ? memory.usedJSHeapSize / (1024 * 1024) : 0;

      // Taux de cache
      const cacheHitRate = calculateCacheHitRate();

      // Nombre de requêtes réseau
      const networkRequests = resources.length;

      // Taux d'erreur (simulation)
      const errorRate = Math.random() * 0.05; // 0-5%

      // Satisfaction utilisateur (simulation basée sur les performances)
      const userSatisfaction = Math.max(0, 100 - (loadTime / 100) - (errorRate * 100));

      setMetrics({
        loadTime: Math.round(loadTime),
        bundleSize: Math.round(bundleSize / 1024), // en KB
        memoryUsage: Math.round(memoryUsage),
        cacheHitRate: Math.round(cacheHitRate),
        renderTime: Math.round(renderTime),
        networkRequests,
        errorRate: Math.round(errorRate * 100) / 100,
        userSatisfaction: Math.round(userSatisfaction),
        lastUpdated: new Date()
      });

      logger.info('Performance', 'Métriques collectées', { 
        loadTime, 
        bundleSize, 
        memoryUsage,
        performanceScore: performanceScore
      }, 'UnifiedPerformanceOptimizer');

    } catch (error) {
      logger.error('Performance', 'Erreur collecte métriques', { error }, 'UnifiedPerformanceOptimizer');
    }
  }, [performanceScore]);

  // Calcul du taux de cache hit
  const calculateCacheHitRate = useCallback(() => {
    try {
      const dalilKeys = Object.keys(localStorage).filter(key => key.startsWith('dalil-'));
      const cacheHits = parseInt(localStorage.getItem('dalil-cache-hits') || '0');
      const cacheMisses = parseInt(localStorage.getItem('dalil-cache-misses') || '0');
      
      return cacheMisses === 0 ? 100 : Math.round((cacheHits / (cacheHits + cacheMisses)) * 100);
    } catch {
      return 0;
    }
  }, []);

  // Collecte des informations de cache
  const collectCacheInfo = useCallback(() => {
    try {
      let totalSize = 0;
      let itemCount = 0;
      const categories = {
        legal: { size: 0, count: 0 },
        procedures: { size: 0, count: 0 },
        ocr: { size: 0, count: 0 },
        assets: { size: 0, count: 0 }
      };

      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('dalil-')) {
          const size = localStorage[key].length;
          totalSize += size;
          itemCount++;

          if (key.includes('legal')) {
            categories.legal.size += size;
            categories.legal.count++;
          } else if (key.includes('procedure')) {
            categories.procedures.size += size;
            categories.procedures.count++;
          } else if (key.includes('ocr')) {
            categories.ocr.size += size;
            categories.ocr.count++;
          } else {
            categories.assets.size += size;
            categories.assets.count++;
          }
        }
      });

      setCacheInfo({
        totalSize: Math.round(totalSize / 1024), // en KB
        itemCount,
        hitRate: calculateCacheHitRate(),
        lastCleanup: new Date(localStorage.getItem('dalil-last-cleanup') || Date.now()),
        categories: {
          legal: { 
            size: Math.round(categories.legal.size / 1024), 
            count: categories.legal.count 
          },
          procedures: { 
            size: Math.round(categories.procedures.size / 1024), 
            count: categories.procedures.count 
          },
          ocr: { 
            size: Math.round(categories.ocr.size / 1024), 
            count: categories.ocr.count 
          },
          assets: { 
            size: Math.round(categories.assets.size / 1024), 
            count: categories.assets.count 
          }
        }
      });
    } catch (error) {
      logger.error('Performance', 'Erreur collecte cache', { error }, 'UnifiedPerformanceOptimizer');
    }
  }, [calculateCacheHitRate]);

  // Optimisation automatique
  const runOptimization = useCallback(async () => {
    setIsOptimizing(true);
    
    try {
      logger.info('Performance', 'Début optimisation', { settings }, 'UnifiedPerformanceOptimizer');

      // Nettoyage du cache si nécessaire
      if (cacheInfo.totalSize > 50000) { // Plus de 50MB
        await cleanupCache();
      }

      // Compression des données en cache
      if (settings.compressionLevel !== 'low') {
        await compressCache();
      }

      // Préchargement selon la stratégie
      if (settings.prefetchStrategy !== 'none') {
        await prefetchCriticalResources();
      }

      // Optimisation des images
      if (settings.imageOptimization) {
        await optimizeImages();
      }

      // Activation du service worker
      if (settings.serviceWorkerEnabled && 'serviceWorker' in navigator) {
        await registerServiceWorker();
      }

      // Simulation du temps d'optimisation
      await new Promise(resolve => setTimeout(resolve, 2000));

      setLastOptimization(new Date());
      
      // Collecte des nouvelles métriques
      await collectMetrics();
      collectCacheInfo();

      logger.info('Performance', 'Optimisation terminée', { 
        newScore: performanceScore 
      }, 'UnifiedPerformanceOptimizer');

    } catch (error) {
      logger.error('Performance', 'Erreur optimisation', { error }, 'UnifiedPerformanceOptimizer');
    } finally {
      setIsOptimizing(false);
    }
  }, [settings, cacheInfo.totalSize, performanceScore, collectMetrics, collectCacheInfo]);

  // Fonctions d'optimisation spécifiques
  const cleanupCache = async () => {
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 jours
    const keysToRemove: string[] = [];

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('dalil-cache-')) {
        try {
          const data = JSON.parse(localStorage[key]);
          if (data.timestamp && new Date(data.timestamp) < cutoffDate) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    });

    keysToRemove.forEach(key => localStorage.removeItem(key));
    localStorage.setItem('dalil-last-cleanup', new Date().toISOString());
    
    logger.info('Performance', 'Cache nettoyé', { removedKeys: keysToRemove.length }, 'UnifiedPerformanceOptimizer');
  };

  const compressCache = async () => {
    // Simulation de compression des données en cache
    logger.info('Performance', 'Compression du cache', {}, 'UnifiedPerformanceOptimizer');
  };

  const prefetchCriticalResources = async () => {
    const criticalRoutes = ['/legal-catalog', '/procedures-catalog', '/ocr-extraction'];
    
    if (settings.prefetchStrategy === 'all') {
      criticalRoutes.push('/analytics-dashboards', '/configuration');
    }

    // Simulation du préchargement
    logger.info('Performance', 'Préchargement des ressources', { 
      routes: criticalRoutes 
    }, 'UnifiedPerformanceOptimizer');
  };

  const optimizeImages = async () => {
    // Simulation d'optimisation des images
    logger.info('Performance', 'Optimisation des images', {}, 'UnifiedPerformanceOptimizer');
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      logger.info('Performance', 'Service Worker enregistré', { 
        scope: registration.scope 
      }, 'UnifiedPerformanceOptimizer');
    } catch (error) {
      logger.error('Performance', 'Erreur Service Worker', { error }, 'UnifiedPerformanceOptimizer');
    }
  };

  // Effets
  useEffect(() => {
    collectMetrics();
    collectCacheInfo();

    const interval = setInterval(() => {
      collectMetrics();
      collectCacheInfo();
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [collectMetrics, collectCacheInfo]);

  // Détermination de la couleur du score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Score de performance global */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Performance Dalil.dz</CardTitle>
                <p className="text-muted-foreground">
                  Optimisation en temps réel de l'application
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(performanceScore)}`}>
                {performanceScore}
              </div>
              <Badge variant={getScoreBadgeVariant(performanceScore)} className="mt-1">
                {performanceScore >= 80 ? 'Excellent' : performanceScore >= 60 ? 'Bon' : 'À améliorer'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Dernière mise à jour: {metrics.lastUpdated.toLocaleTimeString('fr-FR')}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runOptimization}
              disabled={isOptimizing}
            >
              {isOptimizing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {isOptimizing ? 'Optimisation...' : 'Optimiser maintenant'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Métriques détaillées */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Métriques de performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Temps de chargement
                    </span>
                    <span className="text-sm text-muted-foreground">{metrics.loadTime}ms</span>
                  </div>
                  <Progress value={Math.min(100, (3000 - metrics.loadTime) / 30)} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      Taille du bundle
                    </span>
                    <span className="text-sm text-muted-foreground">{metrics.bundleSize}KB</span>
                  </div>
                  <Progress value={Math.min(100, (1000 - metrics.bundleSize) / 10)} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      Utilisation mémoire
                    </span>
                    <span className="text-sm text-muted-foreground">{metrics.memoryUsage}MB</span>
                  </div>
                  <Progress value={Math.min(100, (200 - metrics.memoryUsage) / 2)} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Taux de cache
                    </span>
                    <span className="text-sm text-muted-foreground">{metrics.cacheHitRate}%</span>
                  </div>
                  <Progress value={metrics.cacheHitRate} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Temps de rendu
                    </span>
                    <span className="text-sm text-muted-foreground">{metrics.renderTime}ms</span>
                  </div>
                  <Progress value={Math.min(100, (100 - metrics.renderTime) / 1)} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Taux d'erreur
                    </span>
                    <span className="text-sm text-muted-foreground">{metrics.errorRate}%</span>
                  </div>
                  <Progress value={Math.max(0, 100 - (metrics.errorRate * 20))} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations sur le cache */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Gestion du cache
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{cacheInfo.totalSize}KB</div>
                  <div className="text-sm text-muted-foreground">Taille totale</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{cacheInfo.itemCount}</div>
                  <div className="text-sm text-muted-foreground">Éléments</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{cacheInfo.hitRate}%</div>
                  <div className="text-sm text-muted-foreground">Taux de succès</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round((Date.now() - cacheInfo.lastCleanup.getTime()) / (1000 * 60 * 60 * 24))}j
                  </div>
                  <div className="text-sm text-muted-foreground">Dernier nettoyage</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Répartition par catégorie</h4>
                {Object.entries(cacheInfo.categories).map(([category, info]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="capitalize">{category}</span>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>{info.count} items</span>
                      <span>{info.size}KB</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Paramètres d'optimisation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Paramètres d'optimisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lazy Loading</span>
                  <Switch
                    checked={settings.lazyLoading}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, lazyLoading: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Optimisation images</span>
                  <Switch
                    checked={settings.imageOptimization}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, imageOptimization: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Code splitting</span>
                  <Switch
                    checked={settings.codesplitting}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, codesplitting: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mode hors ligne</span>
                  <Switch
                    checked={settings.offlineMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, offlineMode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Service Worker</span>
                  <Switch
                    checked={settings.serviceWorkerEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, serviceWorkerEnabled: checked }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Stratégie de cache</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={settings.cacheStrategy}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    cacheStrategy: e.target.value as OptimizationSettings['cacheStrategy']
                  }))}
                >
                  <option value="conservative">Conservatrice</option>
                  <option value="moderate">Modérée</option>
                  <option value="aggressive">Agressive</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Préchargement</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={settings.prefetchStrategy}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    prefetchStrategy: e.target.value as OptimizationSettings['prefetchStrategy']
                  }))}
                >
                  <option value="none">Aucun</option>
                  <option value="critical">Critique seulement</option>
                  <option value="all">Tout précharger</option>
                </select>
              </div>

              <Button 
                onClick={runOptimization} 
                className="w-full"
                disabled={isOptimizing}
              >
                {isOptimizing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                {isOptimizing ? 'Optimisation en cours...' : 'Optimiser maintenant'}
              </Button>

              {lastOptimization && (
                <div className="text-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Dernière optimisation: {lastOptimization.toLocaleTimeString('fr-FR')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistiques rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tendances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Satisfaction utilisateur</span>
                  <Badge variant={metrics.userSatisfaction >= 80 ? 'default' : 'secondary'}>
                    {metrics.userSatisfaction}%
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Requêtes réseau</span>
                  <Badge variant="outline">
                    {metrics.networkRequests}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Score PageSpeed</span>
                  <Badge variant={getScoreBadgeVariant(performanceScore)}>
                    {performanceScore}/100
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}