import { OCRMetrics, OCRLogEntry } from '@/hooks/useOCRMetrics';

// Service de gestion des métriques OCR

// Stockage local des métriques (en production, cela serait dans une base de données)
let metricsStorage: OCRMetrics = {
  totalDocuments: 1247,
  successRate: 94.2,
  averageConfidence: 89.5,
  averageProcessingTime: 2.4,
  documentTypes: {
    'PDF': 562,
    'Image': 374,
    'Word': 187,
    'Excel': 87,
    'PowerPoint': 23,
    'Text': 14
  },
  dailyStats: [
    { date: '2025-01-14', processed: 156, success: 147, failed: 9 },
    { date: '2025-01-13', processed: 203, success: 192, failed: 11 },
    { date: '2025-01-12', processed: 178, success: 169, failed: 9 },
    { date: '2025-01-11', processed: 145, success: 138, failed: 7 },
    { date: '2025-01-10', processed: 189, success: 181, failed: 8 }
  ]
};

let logsStorage: OCRLogEntry[] = [
  {
    id: '1',
    timestamp: new Date(),
    level: 'info',
    message: 'Document PDF traité avec succès - confiance: 94%',
    metadata: { fileName: 'contrat_bail.pdf', confidence: 0.94, processingTime: 2300 }
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 60000),
    level: 'info',
    message: 'Extraction d\'entités réussie - 12 entités détectées',
    metadata: { entitiesCount: 12, types: ['PERSON', 'DATE', 'ORGANIZATION'] }
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 120000),
    level: 'warn',
    message: 'Confiance OCR faible détectée (65%) - vérification recommandée',
    metadata: { fileName: 'scan_flou.jpg', confidence: 0.65, threshold: 0.7 }
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 180000),
    level: 'info',
    message: 'Mapping automatique réussi - 8 champs mappés',
    metadata: { mappedFields: 8, formType: 'legal_document' }
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 240000),
    level: 'error',
    message: 'Échec du traitement - fichier corrompu ou format non supporté',
    metadata: { fileName: 'document_corrompu.pdf', error: 'Invalid PDF structure', fileSize: 0 }
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 300000),
    level: 'debug',
    message: 'Préprocessing image appliqué - amélioration contraste et résolution',
    metadata: { originalResolution: '150dpi', enhancedResolution: '300dpi', contrastBoost: 15 }
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 360000),
    level: 'info',
    message: 'Document Excel traité - extraction des tableaux réussie',
    metadata: { fileName: 'rapport_financier.xlsx', tablesExtracted: 3, rowsProcessed: 247 }
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 420000),
    level: 'warn',
    message: 'Temps de traitement élevé détecté (8.2s) - optimisation recommandée',
    metadata: { fileName: 'gros_document.pdf', processingTime: 8200, pages: 45 }
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 480000),
    level: 'info',
    message: 'Initialisation du moteur OCR - version 2.1.0',
    metadata: { version: '2.1.0', engine: 'Tesseract.js', languages: ['fra', 'ara'] }
  },
  {
    id: '10',
    timestamp: new Date(Date.now() - 540000),
    level: 'info',
    message: 'Configuration mise à jour - nouveaux paramètres de qualité appliqués',
    metadata: { confidenceThreshold: 0.7, maxProcessingTime: 10000, enableEntityExtraction: true }
  }
];

export const getOCRMetrics = async (): Promise<OCRMetrics> => {
  // Simulation d'un appel API
  await new Promise(resolve => setTimeout(resolve, 500));
  return { ...metricsStorage };
};

export const updateOCRMetrics = async (data: any): Promise<void> => {
  // Mise à jour des métriques basée sur les nouvelles données
  const fileExtension = data.fileName?.split('.').pop()?.toLowerCase() || 'unknown';
  const documentType = getDocumentType(fileExtension);
  
  // Mise à jour du nombre total de documents
  metricsStorage.totalDocuments += 1;
  
  // Mise à jour du taux de succès
  const totalSuccess = Math.round(metricsStorage.successRate / 100 * (metricsStorage.totalDocuments - 1));
  const newSuccessCount = data.success ? totalSuccess + 1 : totalSuccess;
  metricsStorage.successRate = (newSuccessCount / metricsStorage.totalDocuments) * 100;
  
  // Mise à jour de la confiance moyenne
  if (data.confidence) {
    const totalConfidence = metricsStorage.averageConfidence * (metricsStorage.totalDocuments - 1);
    metricsStorage.averageConfidence = (totalConfidence + data.confidence * 100) / metricsStorage.totalDocuments;
  }
  
  // Mise à jour du temps de traitement moyen
  if (data.processingTime) {
    const totalTime = metricsStorage.averageProcessingTime * (metricsStorage.totalDocuments - 1);
    metricsStorage.averageProcessingTime = (totalTime + data.processingTime / 1000) / metricsStorage.totalDocuments;
  }
  
  // Mise à jour des types de documents
  if (documentType) {
    metricsStorage.documentTypes[documentType] = (metricsStorage.documentTypes[documentType] || 0) + 1;
  }
  
  // Mise à jour des statistiques quotidiennes
  const today = new Date().toISOString().split('T')[0];
  const todayStats = metricsStorage.dailyStats.find(stat => stat.date === today);
  
  if (todayStats) {
    todayStats.processed += 1;
    if (data.success) {
      todayStats.success += 1;
    } else {
      todayStats.failed += 1;
    }
  } else {
    metricsStorage.dailyStats.unshift({
      date: today,
      processed: 1,
      success: data.success ? 1 : 0,
      failed: data.success ? 0 : 1
    });
    
    // Garder seulement les 30 derniers jours
    if (metricsStorage.dailyStats.length > 30) {
      metricsStorage.dailyStats = metricsStorage.dailyStats.slice(0, 30);
    }
  }
};

export const getOCRLogs = async (limit: number = 50): Promise<OCRLogEntry[]> => {
  // Simulation d'un appel API pour récupérer les logs
  await new Promise(resolve => setTimeout(resolve, 300));
  return logsStorage.slice(0, limit);
};

export const addOCRLog = async (log: Omit<OCRLogEntry, 'id' | 'timestamp'>): Promise<void> => {
  const newLog: OCRLogEntry = {
    ...log,
    id: Date.now().toString(),
    timestamp: new Date()
  };
  
  logsStorage.unshift(newLog);
  
  // Garder seulement les 1000 derniers logs
  if (logsStorage.length > 1000) {
    logsStorage = logsStorage.slice(0, 1000);
  }
};

export const getPerformanceReport = async (): Promise<any> => {
  // Génération d'un rapport de performance détaillé
  const last7Days = metricsStorage.dailyStats.slice(0, 7);
  const totalProcessed = last7Days.reduce((sum, day) => sum + day.processed, 0);
  const totalSuccess = last7Days.reduce((sum, day) => sum + day.success, 0);
  const totalFailed = last7Days.reduce((sum, day) => sum + day.failed, 0);
  
  return {
    summary: {
      totalDocuments: metricsStorage.totalDocuments,
      weeklyProcessed: totalProcessed,
      weeklySuccessRate: totalProcessed > 0 ? (totalSuccess / totalProcessed) * 100 : 0,
      averageConfidence: metricsStorage.averageConfidence,
      averageProcessingTime: metricsStorage.averageProcessingTime
    },
    documentTypes: metricsStorage.documentTypes,
    dailyBreakdown: last7Days,
    trends: {
      processingVolume: calculateTrend(last7Days.map(d => d.processed)),
      successRate: calculateTrend(last7Days.map(d => d.processed > 0 ? (d.success / d.processed) * 100 : 0)),
      errorRate: calculateTrend(last7Days.map(d => d.processed > 0 ? (d.failed / d.processed) * 100 : 0))
    },
    recommendations: generateRecommendations()
  };
};

export const exportMetricsToCSV = async (): Promise<string> => {
  const headers = ['Date', 'Documents Traités', 'Succès', 'Échecs', 'Taux de Succès'];
  const rows = metricsStorage.dailyStats.map(stat => [
    stat.date,
    stat.processed.toString(),
    stat.success.toString(),
    stat.failed.toString(),
    `${((stat.success / stat.processed) * 100).toFixed(2)}%`
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
  
  return csvContent;
};

// Fonctions utilitaires
function getDocumentType(extension: string): string {
  const typeMap: Record<string, string> = {
    'pdf': 'PDF',
    'jpg': 'Image',
    'jpeg': 'Image',
    'png': 'Image',
    'gif': 'Image',
    'bmp': 'Image',
    'tiff': 'Image',
    'docx': 'Word',
    'doc': 'Word',
    'xlsx': 'Excel',
    'xls': 'Excel',
    'pptx': 'PowerPoint',
    'ppt': 'PowerPoint',
    'txt': 'Text',
    'rtf': 'Text'
  };
  
  return typeMap[extension] || 'Autre';
}

function calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const recent = values.slice(0, Math.ceil(values.length / 2));
  const older = values.slice(Math.ceil(values.length / 2));
  
  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
  
  const threshold = 0.05; // 5% de différence minimum pour considérer une tendance
  
  if (recentAvg > olderAvg * (1 + threshold)) return 'up';
  if (recentAvg < olderAvg * (1 - threshold)) return 'down';
  return 'stable';
}

function generateRecommendations(): Array<{
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
}> {
  const recommendations = [];
  
  // Analyse du taux de succès
  if (metricsStorage.successRate < 90) {
    recommendations.push({
      category: 'quality',
      priority: 'high' as const,
      title: 'Amélioration du taux de succès',
      description: `Le taux de succès actuel (${metricsStorage.successRate.toFixed(1)}%) est en dessous de l'objectif de 90%.`,
      actionItems: [
        'Analyser les types de fichiers qui échouent le plus',
        'Améliorer les algorithmes de préprocessing',
        'Mettre à jour les modèles OCR'
      ]
    });
  }
  
  // Analyse du temps de traitement
  if (metricsStorage.averageProcessingTime > 5) {
    recommendations.push({
      category: 'performance',
      priority: 'medium' as const,
      title: 'Optimisation des performances',
      description: `Le temps de traitement moyen (${metricsStorage.averageProcessingTime.toFixed(1)}s) peut être optimisé.`,
      actionItems: [
        'Implémenter le traitement parallèle',
        'Optimiser les algorithmes de reconnaissance',
        'Ajouter la mise en cache des résultats'
      ]
    });
  }
  
  // Analyse de la confiance
  if (metricsStorage.averageConfidence < 85) {
    recommendations.push({
      category: 'quality',
      priority: 'medium' as const,
      title: 'Amélioration de la confiance OCR',
      description: `La confiance moyenne (${metricsStorage.averageConfidence.toFixed(1)}%) peut être améliorée.`,
      actionItems: [
        'Améliorer les filtres de préprocessing',
        'Ajouter des modèles de langue spécialisés',
        'Implémenter la correction post-OCR'
      ]
    });
  }
  
  return recommendations;
}