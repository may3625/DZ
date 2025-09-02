import { logger } from '@/utils/logger';

export interface PerformanceMetric {
  id: string;
  timestamp: Date;
  operation: string;
  duration: number;
  memoryUsage: number;
  quality: number;
  documentType: string;
  fileSize: number;
  success: boolean;
  errorMessage?: string;
}

export interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  openCVStatus: 'ready' | 'loading' | 'error';
  algorithmStatus: 'optimal' | 'degraded' | 'critical';
  lastUpdate: Date;
}

export interface AlertConfig {
  processingTimeThreshold: number; // ms
  qualityThreshold: number; // 0-1
  errorRateThreshold: number; // 0-1
  memoryThreshold: number; // MB
}

export interface PerformanceAlert {
  id: string;
  type: 'performance' | 'quality' | 'error' | 'memory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

const DEFAULT_ALERT_CONFIG: AlertConfig = {
  processingTimeThreshold: 10000, // 10 secondes
  qualityThreshold: 0.7, // 70%
  errorRateThreshold: 0.1, // 10%
  memoryThreshold: 512 // 512 MB
};

export class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private alertConfig: AlertConfig;
  private systemHealth: SystemHealth;
  private performanceCheckInterval?: NodeJS.Timeout;

  constructor(alertConfig: Partial<AlertConfig> = {}) {
    this.alertConfig = { ...DEFAULT_ALERT_CONFIG, ...alertConfig };
    this.systemHealth = {
      cpuUsage: 0,
      memoryUsage: 0,
      openCVStatus: 'loading',
      algorithmStatus: 'optimal',
      lastUpdate: new Date()
    };

    this.initializeMonitoring();
  }

  /**
   * Enregistrer une métrique de performance
   */
  recordMetric(
    operation: string,
    duration: number,
    quality: number,
    documentType: string,
    fileSize: number,
    success: boolean,
    errorMessage?: string
  ): void {
    const metric: PerformanceMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      operation,
      duration,
      memoryUsage: this.getCurrentMemoryUsage(),
      quality,
      documentType,
      fileSize,
      success,
      errorMessage
    };

    this.metrics.push(metric);
    
    // Limiter à 1000 métriques pour éviter la surcharge mémoire
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }

    // Vérifier les alertes
    this.checkForAlerts(metric);

    logger.info('PerformanceMonitoring', 'Métrique enregistrée', {
      operation,
      duration,
      quality,
      success
    });
  }

  /**
   * Obtenir les statistiques de performance
   */
  getPerformanceStats(timeRange: 'hour' | 'day' | 'week' = 'hour'): {
    totalOperations: number;
    averageDuration: number;
    averageQuality: number;
    successRate: number;
    errorRate: number;
    operationsByType: Record<string, number>;
    qualityTrend: Array<{ timestamp: Date; quality: number }>;
    performanceTrend: Array<{ timestamp: Date; duration: number }>;
  } {
    const now = new Date();
    const timeRangeMs = this.getTimeRangeMs(timeRange);
    const cutoffTime = new Date(now.getTime() - timeRangeMs);

    const relevantMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime);

    if (relevantMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        averageQuality: 0,
        successRate: 0,
        errorRate: 0,
        operationsByType: {},
        qualityTrend: [],
        performanceTrend: []
      };
    }

    const totalOperations = relevantMetrics.length;
    const averageDuration = relevantMetrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations;
    const averageQuality = relevantMetrics.reduce((sum, m) => sum + m.quality, 0) / totalOperations;
    const successCount = relevantMetrics.filter(m => m.success).length;
    const successRate = successCount / totalOperations;
    const errorRate = 1 - successRate;

    // Opérations par type
    const operationsByType: Record<string, number> = {};
    relevantMetrics.forEach(m => {
      operationsByType[m.operation] = (operationsByType[m.operation] || 0) + 1;
    });

    // Tendances (échantillonnage par tranches de temps)
    const trendBuckets = this.createTrendBuckets(relevantMetrics, timeRange);
    const qualityTrend = trendBuckets.map(bucket => ({
      timestamp: bucket.timestamp,
      quality: bucket.metrics.reduce((sum, m) => sum + m.quality, 0) / bucket.metrics.length
    }));

    const performanceTrend = trendBuckets.map(bucket => ({
      timestamp: bucket.timestamp,
      duration: bucket.metrics.reduce((sum, m) => sum + m.duration, 0) / bucket.metrics.length
    }));

    return {
      totalOperations,
      averageDuration,
      averageQuality,
      successRate,
      errorRate,
      operationsByType,
      qualityTrend,
      performanceTrend
    };
  }

  /**
   * Obtenir l'état de santé du système
   */
  getSystemHealth(): SystemHealth {
    return { ...this.systemHealth };
  }

  /**
   * Obtenir les métriques récentes
   */
  getMetrics(limit: number = 100): PerformanceMetric[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Obtenir les alertes actives
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Obtenir toutes les alertes
   */
  getAllAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Résoudre une alerte
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      logger.info('PerformanceMonitoring', 'Alerte résolue', { alertId });
    }
  }

  /**
   * Obtenir des recommandations d'optimisation
   */
  getOptimizationRecommendations(): Array<{
    category: 'performance' | 'quality' | 'memory' | 'configuration';
    severity: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    action: string;
  }> {
    const recommendations = [];
    const stats = this.getPerformanceStats('day');

    // Recommandations de performance
    if (stats.averageDuration > this.alertConfig.processingTimeThreshold) {
      recommendations.push({
        category: 'performance' as const,
        severity: 'high' as const,
        title: 'Temps de traitement élevé',
        description: `Le temps moyen de traitement (${Math.round(stats.averageDuration)}ms) dépasse le seuil recommandé`,
        action: 'Optimiser les paramètres OpenCV ou réduire la résolution des images'
      });
    }

    // Recommandations de qualité
    if (stats.averageQuality < this.alertConfig.qualityThreshold) {
      recommendations.push({
        category: 'quality' as const,
        severity: 'medium' as const,
        title: 'Qualité d\'extraction faible',
        description: `La qualité moyenne (${Math.round(stats.averageQuality * 100)}%) est en dessous du seuil recommandé`,
        action: 'Ajuster le calibrage des algorithmes ou améliorer la qualité des documents source'
      });
    }

    // Recommandations de mémoire
    if (this.systemHealth.memoryUsage > this.alertConfig.memoryThreshold) {
      recommendations.push({
        category: 'memory' as const,
        severity: 'high' as const,
        title: 'Utilisation mémoire élevée',
        description: `L'utilisation mémoire (${this.systemHealth.memoryUsage}MB) approche les limites`,
        action: 'Traiter les documents par lots plus petits ou optimiser la gestion mémoire'
      });
    }

    // Recommandations de configuration
    if (stats.errorRate > this.alertConfig.errorRateThreshold) {
      recommendations.push({
        category: 'configuration' as const,
        severity: 'medium' as const,
        title: 'Taux d\'erreur élevé',
        description: `Le taux d'erreur (${Math.round(stats.errorRate * 100)}%) nécessite une attention`,
        action: 'Revoir la configuration des algorithmes ou la validation des entrées'
      });
    }

    return recommendations;
  }

  /**
   * Exporter les métriques pour analyse externe
   */
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'operation', 'duration', 'quality', 'documentType', 'fileSize', 'success', 'memoryUsage'];
      const csvRows = [
        headers.join(','),
        ...this.metrics.map(m => [
          m.timestamp.toISOString(),
          m.operation,
          m.duration,
          m.quality,
          m.documentType,
          m.fileSize,
          m.success,
          m.memoryUsage
        ].join(','))
      ];
      return csvRows.join('\n');
    }

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      metrics: this.metrics,
      systemHealth: this.systemHealth,
      alertConfig: this.alertConfig
    }, null, 2);
  }

  private initializeMonitoring(): void {
    // Démarrer le monitoring système
    this.performanceCheckInterval = setInterval(() => {
      this.updateSystemHealth();
    }, 5000); // Toutes les 5 secondes

    logger.info('PerformanceMonitoring', 'Service de monitoring initialisé');
  }

  private updateSystemHealth(): void {
    // Simuler les métriques système (en production, utiliser des APIs réelles)
    this.systemHealth = {
      cpuUsage: 0, // Sera mis à jour avec les vraies données
      memoryUsage: this.getCurrentMemoryUsage(),
      openCVStatus: this.checkOpenCVStatus(),
      algorithmStatus: this.assessAlgorithmStatus(),
      lastUpdate: new Date()
    };
  }

  private getCurrentMemoryUsage(): number {
    // Simulation de l'utilisation mémoire
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0; // Sera mis à jour avec les vraies données
  }

  private checkOpenCVStatus(): SystemHealth['openCVStatus'] {
    try {
      if (typeof window !== 'undefined' && (window as any).cv) {
        return 'ready';
      }
      return 'loading';
    } catch {
      return 'error';
    }
  }

  private assessAlgorithmStatus(): SystemHealth['algorithmStatus'] {
    const recentMetrics = this.metrics.slice(-10);
    if (recentMetrics.length === 0) return 'optimal';

    const avgQuality = recentMetrics.reduce((sum, m) => sum + m.quality, 0) / recentMetrics.length;
    const avgDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;

    if (avgQuality < 0.5 || avgDuration > this.alertConfig.processingTimeThreshold * 2) {
      return 'critical';
    } else if (avgQuality < 0.7 || avgDuration > this.alertConfig.processingTimeThreshold) {
      return 'degraded';
    }

    return 'optimal';
  }

  private checkForAlerts(metric: PerformanceMetric): void {
    const alerts: PerformanceAlert[] = [];

    // Alerte de performance
    if (metric.duration > this.alertConfig.processingTimeThreshold) {
      alerts.push({
        id: `alert_${Date.now()}_performance`,
        type: 'performance',
        severity: metric.duration > this.alertConfig.processingTimeThreshold * 2 ? 'critical' : 'high',
        message: `Temps de traitement élevé: ${metric.duration}ms pour ${metric.operation}`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Alerte de qualité
    if (metric.quality < this.alertConfig.qualityThreshold) {
      alerts.push({
        id: `alert_${Date.now()}_quality`,
        type: 'quality',
        severity: metric.quality < 0.5 ? 'high' : 'medium',
        message: `Qualité faible: ${Math.round(metric.quality * 100)}% pour ${metric.operation}`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Alerte d'erreur
    if (!metric.success) {
      alerts.push({
        id: `alert_${Date.now()}_error`,
        type: 'error',
        severity: 'high',
        message: `Erreur dans ${metric.operation}: ${metric.errorMessage || 'Erreur inconnue'}`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Alerte mémoire
    if (metric.memoryUsage > this.alertConfig.memoryThreshold) {
      alerts.push({
        id: `alert_${Date.now()}_memory`,
        type: 'memory',
        severity: metric.memoryUsage > this.alertConfig.memoryThreshold * 1.5 ? 'critical' : 'high',
        message: `Utilisation mémoire élevée: ${metric.memoryUsage}MB`,
        timestamp: new Date(),
        resolved: false
      });
    }

    this.alerts.push(...alerts);

    // Limiter le nombre d'alertes
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-50);
    }
  }

  private getTimeRangeMs(timeRange: 'hour' | 'day' | 'week'): number {
    switch (timeRange) {
      case 'hour': return 60 * 60 * 1000;
      case 'day': return 24 * 60 * 60 * 1000;
      case 'week': return 7 * 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000;
    }
  }

  private createTrendBuckets(metrics: PerformanceMetric[], timeRange: 'hour' | 'day' | 'week'): Array<{
    timestamp: Date;
    metrics: PerformanceMetric[];
  }> {
    const bucketSize = this.getBucketSize(timeRange);
    const buckets: Map<number, PerformanceMetric[]> = new Map();

    metrics.forEach(metric => {
      const bucketKey = Math.floor(metric.timestamp.getTime() / bucketSize) * bucketSize;
      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, []);
      }
      buckets.get(bucketKey)!.push(metric);
    });

    return Array.from(buckets.entries()).map(([timestamp, bucketMetrics]) => ({
      timestamp: new Date(timestamp),
      metrics: bucketMetrics
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private getBucketSize(timeRange: 'hour' | 'day' | 'week'): number {
    switch (timeRange) {
      case 'hour': return 5 * 60 * 1000; // 5 minutes
      case 'day': return 60 * 60 * 1000; // 1 heure
      case 'week': return 6 * 60 * 60 * 1000; // 6 heures
      default: return 5 * 60 * 1000;
    }
  }

  /**
   * Nettoyer les ressources
   */
  destroy(): void {
    if (this.performanceCheckInterval) {
      clearInterval(this.performanceCheckInterval);
    }
    logger.info('PerformanceMonitoring', 'Service de monitoring arrêté');
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService();
export default performanceMonitoringService;