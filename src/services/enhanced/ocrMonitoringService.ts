/**
 * Service de monitoring et statistiques pour l'OCR
 * Collecte et analyse les métriques de performance
 */

import { logger } from '@/utils/logger';

export interface OCRStatistics {
  totalDocuments: number;
  successfulExtractions: number;
  failedExtractions: number;
  averageProcessingTime: number;
  averageConfidence: number;
  documentTypes: Record<string, number>;
  languageDistribution: Record<string, number>;
  qualityDistribution: {
    excellent: number; // >90%
    good: number;      // 70-90%
    poor: number;      // <70%
  };
  timeStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface ProcessingMetrics {
  documentId: string;
  fileName: string;
  fileSize: number;
  documentType: string;
  pageCount: number;
  processingTime: number;
  confidence: number;
  language: string;
  extractionDate: Date;
  success: boolean;
  errorMessage?: string;
  algorithmUsed: string;
  stages: {
    extraction: number;
    regex: number;
    mapping: number;
    validation: number;
  };
}

export interface QualityAlert {
  id: string;
  type: 'low_confidence' | 'processing_error' | 'validation_failure' | 'performance_degradation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  documentId: string;
  timestamp: Date;
  metrics: Partial<ProcessingMetrics>;
  suggestions: string[];
}

export interface PerformanceTrend {
  date: string;
  documentsProcessed: number;
  averageConfidence: number;
  averageProcessingTime: number;
  errorRate: number;
}

class OCRMonitoringService {
  private metrics: ProcessingMetrics[] = [];
  private alerts: QualityAlert[] = [];
  private readonly MAX_METRICS_HISTORY = 1000;
  private readonly MAX_ALERTS_HISTORY = 100;

  // Enregistrer une nouvelle métrique
  recordProcessing(metrics: ProcessingMetrics): void {
    this.metrics.push(metrics);
    
    // Limiter l'historique
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS_HISTORY);
    }
    
    // Analyser pour alertes
    this.analyzeForAlerts(metrics);
    
    logger.info('OCR_MONITORING', 'Métriques enregistrées', {
      documentId: metrics.documentId,
      success: metrics.success,
      confidence: metrics.confidence,
      processingTime: metrics.processingTime
    });
  }

  // Obtenir les statistiques globales
  getStatistics(): OCRStatistics {
    if (this.metrics.length === 0) {
      return this.getEmptyStatistics();
    }

    const successful = this.metrics.filter(m => m.success);
    const failed = this.metrics.filter(m => !m.success);
    
    const documentTypes: Record<string, number> = {};
    const languageDistribution: Record<string, number> = {};
    
    this.metrics.forEach(metric => {
      documentTypes[metric.documentType] = (documentTypes[metric.documentType] || 0) + 1;
      languageDistribution[metric.language] = (languageDistribution[metric.language] || 0) + 1;
    });

    const confidences = successful.map(m => m.confidence);
    const processingTimes = successful.map(m => m.processingTime);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      totalDocuments: this.metrics.length,
      successfulExtractions: successful.length,
      failedExtractions: failed.length,
      averageProcessingTime: processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length || 0,
      averageConfidence: confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length || 0,
      documentTypes,
      languageDistribution,
      qualityDistribution: {
        excellent: confidences.filter(c => c >= 0.9).length,
        good: confidences.filter(c => c >= 0.7 && c < 0.9).length,
        poor: confidences.filter(c => c < 0.7).length
      },
      timeStats: {
        today: this.metrics.filter(m => m.extractionDate >= today).length,
        thisWeek: this.metrics.filter(m => m.extractionDate >= thisWeek).length,
        thisMonth: this.metrics.filter(m => m.extractionDate >= thisMonth).length
      }
    };
  }

  // Obtenir les alertes actives
  getActiveAlerts(): QualityAlert[] {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.alerts.filter(alert => alert.timestamp >= oneDayAgo);
  }

  // Obtenir les tendances de performance
  getPerformanceTrends(days: number = 7): PerformanceTrend[] {
    const trends: PerformanceTrend[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayMetrics = this.metrics.filter(m => 
        m.extractionDate >= dayStart && m.extractionDate < dayEnd
      );
      
      const successful = dayMetrics.filter(m => m.success);
      const confidences = successful.map(m => m.confidence);
      const processingTimes = successful.map(m => m.processingTime);
      
      trends.push({
        date: dateStr,
        documentsProcessed: dayMetrics.length,
        averageConfidence: confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length || 0,
        averageProcessingTime: processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length || 0,
        errorRate: dayMetrics.length > 0 ? (dayMetrics.length - successful.length) / dayMetrics.length : 0
      });
    }
    
    return trends;
  }

  // Analyser les métriques pour détecter les problèmes
  private analyzeForAlerts(metrics: ProcessingMetrics): void {
    const alerts: QualityAlert[] = [];
    
    // Alerte confiance faible
    if (metrics.success && metrics.confidence < 0.6) {
      alerts.push({
        id: `low_conf_${Date.now()}`,
        type: 'low_confidence',
        severity: metrics.confidence < 0.4 ? 'high' : 'medium',
        message: `Confiance OCR faible (${Math.round(metrics.confidence * 100)}%) pour ${metrics.fileName}`,
        documentId: metrics.documentId,
        timestamp: new Date(),
        metrics,
        suggestions: [
          'Vérifiez la qualité du document source',
          'Ajustez les paramètres de prétraitement',
          'Considérez un scan de meilleure résolution'
        ]
      });
    }
    
    // Alerte temps de traitement élevé
    if (metrics.processingTime > 30000) { // > 30 secondes
      alerts.push({
        id: `slow_proc_${Date.now()}`,
        type: 'performance_degradation',
        severity: metrics.processingTime > 60000 ? 'high' : 'medium',
        message: `Temps de traitement élevé (${Math.round(metrics.processingTime / 1000)}s) pour ${metrics.fileName}`,
        documentId: metrics.documentId,
        timestamp: new Date(),
        metrics,
        suggestions: [
          'Vérifiez la taille du document',
          'Optimisez les paramètres d\'algorithme',
          'Considérez un traitement par batch'
        ]
      });
    }
    
    // Alerte échec de traitement
    if (!metrics.success) {
      alerts.push({
        id: `proc_error_${Date.now()}`,
        type: 'processing_error',
        severity: 'high',
        message: `Échec du traitement pour ${metrics.fileName}: ${metrics.errorMessage || 'Erreur inconnue'}`,
        documentId: metrics.documentId,
        timestamp: new Date(),
        metrics,
        suggestions: [
          'Vérifiez le format du document',
          'Consultez les logs détaillés',
          'Tentez avec des paramètres différents'
        ]
      });
    }
    
    // Ajouter les alertes
    this.alerts.push(...alerts);
    
    // Limiter l'historique des alertes
    if (this.alerts.length > this.MAX_ALERTS_HISTORY) {
      this.alerts = this.alerts.slice(-this.MAX_ALERTS_HISTORY);
    }
  }

  // Obtenir des recommandations d'amélioration
  getRecommendations(): string[] {
    const stats = this.getStatistics();
    const recommendations: string[] = [];
    
    if (stats.averageConfidence < 0.7) {
      recommendations.push('Améliorer la qualité des documents sources pour augmenter la confiance OCR');
    }
    
    if (stats.averageProcessingTime > 15000) {
      recommendations.push('Optimiser les paramètres d\'algorithme pour réduire le temps de traitement');
    }
    
    if (stats.failedExtractions / stats.totalDocuments > 0.1) {
      recommendations.push('Investiguer les causes d\'échec récurrentes et améliorer la robustesse');
    }
    
    const poorQualityRate = stats.qualityDistribution.poor / stats.totalDocuments;
    if (poorQualityRate > 0.2) {
      recommendations.push('Mettre en place un prétraitement plus robuste pour les documents de faible qualité');
    }
    
    return recommendations;
  }

  // Nettoyer les anciennes métriques
  cleanupOldMetrics(daysToKeep: number = 30): void {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.extractionDate >= cutoffDate);
    this.alerts = this.alerts.filter(a => a.timestamp >= cutoffDate);
    
    logger.info('OCR_MONITORING', `Nettoyage effectué: conservé ${this.metrics.length} métriques et ${this.alerts.length} alertes`);
  }

  // Exporter les métriques
  exportMetrics(): string {
    return JSON.stringify({
      statistics: this.getStatistics(),
      trends: this.getPerformanceTrends(30),
      alerts: this.getActiveAlerts(),
      recommendations: this.getRecommendations(),
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  private getEmptyStatistics(): OCRStatistics {
    return {
      totalDocuments: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      averageProcessingTime: 0,
      averageConfidence: 0,
      documentTypes: {},
      languageDistribution: {},
      qualityDistribution: { excellent: 0, good: 0, poor: 0 },
      timeStats: { today: 0, thisWeek: 0, thisMonth: 0 }
    };
  }
}

export const ocrMonitoringService = new OCRMonitoringService();
export default ocrMonitoringService;