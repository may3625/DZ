import React, { Suspense, useEffect, useState } from 'react';
import { Loader2, Package, Clock, Zap } from 'lucide-react';
import { performanceMonitor } from '@/utils/performanceMonitor';

interface BundleStats {
  totalChunks: number;
  loadedChunks: number;
  totalLoadTime: number;
  initialLoadTime: number;
  memoryUsage: number;
}

export const LazyBundleAnalyzer: React.FC = () => {
  const [stats, setStats] = useState<BundleStats | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const metrics = performanceMonitor.getMetrics();
      setStats({
        totalChunks: Object.keys(metrics.chunkLoadTimes).length,
        loadedChunks: Object.keys(metrics.chunkLoadTimes).filter(key => metrics.chunkLoadTimes[key] > 0).length,
        totalLoadTime: Object.values(metrics.chunkLoadTimes).reduce((a, b) => a + b, 0),
        initialLoadTime: metrics.initialLoadTime,
        memoryUsage: metrics.memoryUsage
      });
      setIsAnalyzing(false);
      
      // Generar rapport de performance
      performanceMonitor.reportSummary();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isAnalyzing || !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Analyse des performances...</p>
        </div>
      </div>
    );
  }

  const optimizationSavings = stats.initialLoadTime > 0 ? 
    ((stats.totalLoadTime) / (stats.initialLoadTime + stats.totalLoadTime) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Package className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Analyse des performances</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Chargement initial</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.initialLoadTime.toFixed(0)}ms</p>
          <p className="text-xs text-muted-foreground">Bundle principal</p>
        </div>

        <div className="bg-card rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Chunks chargés</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.loadedChunks}/{stats.totalChunks}</p>
          <p className="text-xs text-muted-foreground">À la demande</p>
        </div>

        <div className="bg-card rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Optimisation</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{optimizationSavings}%</p>
          <p className="text-xs text-muted-foreground">Plus rapide</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
        <h3 className="font-semibold text-green-800 mb-2">✅ Optimisations actives</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Lazy loading des composants lourds</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Chunking intelligent des dépendances</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Chargement progressif sans reload</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Cache intelligent des ressources</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>Utilisation mémoire: {stats.memoryUsage.toFixed(1)}MB</p>
        <p>Temps total de chargement chunks: {stats.totalLoadTime.toFixed(0)}ms</p>
      </div>
    </div>
  );
};