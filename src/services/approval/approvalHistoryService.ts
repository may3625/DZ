import { ApprovalItem } from './approvalItemService';

export interface ApprovalHistoryEntry {
  id: string;
  itemId: string;
  action: 'created' | 'approved' | 'rejected' | 'modified' | 'reassigned' | 'escalated';
  actorId: string;
  actorName: string;
  timestamp: Date;
  details: {
    previousStatus?: string;
    newStatus?: string;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    reason?: string;
    comments?: string;
    metadata?: Record<string, any>;
  };
  duration?: number; // Temps écoulé depuis la dernière action
}

export interface ApprovalStatistics {
  totalProcessed: number;
  averageProcessingTime: number;
  processingTimeByPriority: Record<string, number>;
  processingTimeByType: Record<string, number>;
  userPerformance: Array<{
    userId: string;
    userName: string;
    processedCount: number;
    averageTime: number;
    approvalRate: number;
    rejectionRate: number;
  }>;
  timeDistribution: Array<{
    timeRange: string;
    count: number;
  }>;
  patternAnalysis: Array<{
    pattern: string;
    frequency: number;
    impact: string;
  }>;
}

export interface PerformanceInsight {
  id: string;
  type: 'efficiency' | 'quality' | 'bottleneck' | 'improvement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  data: Record<string, any>;
}

class ApprovalHistoryService {
  private history: Map<string, ApprovalHistoryEntry[]> = new Map();
  private globalHistory: ApprovalHistoryEntry[] = [];

  /**
   * Enregistrement d'une action dans l'historique
   */
  recordAction(
    itemId: string,
    action: ApprovalHistoryEntry['action'],
    actorId: string,
    actorName: string,
    details: ApprovalHistoryEntry['details']
  ): void {
    const entry: ApprovalHistoryEntry = {
      id: this.generateEntryId(),
      itemId,
      action,
      actorId,
      actorName,
      timestamp: new Date(),
      details
    };

    // Calculer la durée depuis la dernière action
    const itemHistory = this.history.get(itemId) || [];
    if (itemHistory.length > 0) {
      const lastEntry = itemHistory[itemHistory.length - 1];
      entry.duration = entry.timestamp.getTime() - lastEntry.timestamp.getTime();
    }

    // Ajouter à l'historique de l'item
    if (!this.history.has(itemId)) {
      this.history.set(itemId, []);
    }
    this.history.get(itemId)!.push(entry);

    // Ajouter à l'historique global
    this.globalHistory.push(entry);

    // Maintenir une taille raisonnable (garder les 1000 dernières entrées)
    if (this.globalHistory.length > 1000) {
      this.globalHistory.shift();
    }
  }

  /**
   * Récupération de l'historique d'un item spécifique
   */
  getItemHistory(itemId: string): ApprovalHistoryEntry[] {
    return this.history.get(itemId) || [];
  }

  /**
   * Récupération de l'historique global avec filtres
   */
  getGlobalHistory(filters?: {
    action?: ApprovalHistoryEntry['action'];
    actorId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
  }): ApprovalHistoryEntry[] {
    let filtered = [...this.globalHistory];

    if (filters) {
      if (filters.action) {
        filtered = filtered.filter(entry => entry.action === filters.action);
      }
      if (filters.actorId) {
        filtered = filtered.filter(entry => entry.actorId === filters.actorId);
      }
      if (filters.dateFrom) {
        filtered = filtered.filter(entry => entry.timestamp >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filtered = filtered.filter(entry => entry.timestamp <= filters.dateTo!);
      }
    }

    // Trier par date décroissante
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  /**
   * Calcul des statistiques d'approbation
   */
  calculateStatistics(timeRange?: { from: Date; to: Date }): ApprovalStatistics {
    let entries = this.globalHistory;

    if (timeRange) {
      entries = entries.filter(entry => 
        entry.timestamp >= timeRange.from && entry.timestamp <= timeRange.to
      );
    }

    const processedEntries = entries.filter(entry => 
      entry.action === 'approved' || entry.action === 'rejected'
    );

    // Statistiques de base
    const totalProcessed = processedEntries.length;
    const averageProcessingTime = this.calculateAverageProcessingTime(entries);

    // Temps de traitement par priorité et type
    const processingTimeByPriority = this.calculateProcessingTimeByCategory(entries, 'priority');
    const processingTimeByType = this.calculateProcessingTimeByCategory(entries, 'type');

    // Performance des utilisateurs
    const userPerformance = this.calculateUserPerformance(entries);

    // Distribution temporelle
    const timeDistribution = this.calculateTimeDistribution(processedEntries);

    // Analyse des patterns
    const patternAnalysis = this.analyzePatterns(entries);

    return {
      totalProcessed,
      averageProcessingTime,
      processingTimeByPriority,
      processingTimeByType,
      userPerformance,
      timeDistribution,
      patternAnalysis
    };
  }

  /**
   * Génération d'insights de performance
   */
  generatePerformanceInsights(statistics: ApprovalStatistics): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];

    // Insight sur l'efficacité globale
    if (statistics.averageProcessingTime > 15) {
      insights.push({
        id: 'slow_processing',
        type: 'efficiency',
        title: 'Temps de traitement élevé',
        description: `Le temps moyen de traitement est de ${Math.round(statistics.averageProcessingTime)} minutes`,
        impact: 'high',
        recommendation: 'Considérer l\'automatisation de certaines validations ou la formation des utilisateurs',
        data: { averageTime: statistics.averageProcessingTime }
      });
    }

    // Insight sur les goulots d'étranglement
    const slowestUser = statistics.userPerformance.reduce((slowest, user) => 
      user.averageTime > slowest.averageTime ? user : slowest
    );
    
    if (slowestUser.averageTime > statistics.averageProcessingTime * 1.5) {
      insights.push({
        id: 'user_bottleneck',
        type: 'bottleneck',
        title: 'Goulot d\'étranglement utilisateur',
        description: `L'utilisateur ${slowestUser.userName} traite les documents 50% plus lentement que la moyenne`,
        impact: 'medium',
        recommendation: 'Formation supplémentaire ou redistribution de la charge de travail',
        data: { userId: slowestUser.userId, averageTime: slowestUser.averageTime }
      });
    }

    // Insight sur la qualité
    const lowApprovalRateUsers = statistics.userPerformance.filter(user => 
      user.approvalRate < 70 && user.processedCount > 5
    );

    if (lowApprovalRateUsers.length > 0) {
      insights.push({
        id: 'low_approval_rate',
        type: 'quality',
        title: 'Taux d\'approbation faible',
        description: `${lowApprovalRateUsers.length} utilisateur(s) ont un taux d'approbation inférieur à 70%`,
        impact: 'medium',
        recommendation: 'Réviser les critères de validation ou améliorer la formation',
        data: { affectedUsers: lowApprovalRateUsers.length }
      });
    }

    // Insight sur les améliorations
    const highFrequencyPatterns = statistics.patternAnalysis.filter(pattern => 
      pattern.frequency > 10
    );

    if (highFrequencyPatterns.length > 0) {
      insights.push({
        id: 'automation_opportunity',
        type: 'improvement',
        title: 'Opportunité d\'automatisation',
        description: `${highFrequencyPatterns.length} pattern(s) fréquent(s) détecté(s)`,
        impact: 'high',
        recommendation: 'Implémenter des règles d\'automatisation pour ces patterns récurrents',
        data: { patterns: highFrequencyPatterns }
      });
    }

    return insights;
  }

  /**
   * Export des données d'historique pour analyse
   */
  exportHistoryData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCSV();
    } else {
      return JSON.stringify({
        history: this.globalHistory,
        statistics: this.calculateStatistics(),
        exportDate: new Date().toISOString()
      }, null, 2);
    }
  }

  /**
   * Recherche dans l'historique
   */
  searchHistory(query: string, filters?: {
    action?: ApprovalHistoryEntry['action'];
    dateFrom?: Date;
    dateTo?: Date;
  }): ApprovalHistoryEntry[] {
    let entries = this.getGlobalHistory(filters);

    const searchTerms = query.toLowerCase().split(' ');
    
    return entries.filter(entry => {
      const searchableText = [
        entry.actorName,
        entry.action,
        entry.details.reason || '',
        entry.details.comments || '',
        entry.details.fieldName || ''
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  /**
   * Utilitaires privés
   */
  private generateEntryId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateAverageProcessingTime(entries: ApprovalHistoryEntry[]): number {
    const processedItems = new Map<string, { created: Date; completed?: Date }>();

    entries.forEach(entry => {
      if (entry.action === 'created') {
        processedItems.set(entry.itemId, { created: entry.timestamp });
      } else if (entry.action === 'approved' || entry.action === 'rejected') {
        const item = processedItems.get(entry.itemId);
        if (item) {
          item.completed = entry.timestamp;
        }
      }
    });

    const completedItems = Array.from(processedItems.values()).filter(item => item.completed);
    
    if (completedItems.length === 0) return 0;

    const totalTime = completedItems.reduce((sum, item) => {
      return sum + (item.completed!.getTime() - item.created.getTime());
    }, 0);

    return totalTime / (completedItems.length * 60 * 1000); // Convertir en minutes
  }

  private calculateProcessingTimeByCategory(
    entries: ApprovalHistoryEntry[],
    category: 'priority' | 'type'
  ): Record<string, number> {
    // Implémentation simplifiée - dans un vrai système, ces données viendraient de la base
    const result: Record<string, number> = {};
    
    // Simulation basée sur les patterns typiques
    if (category === 'priority') {
      result.critical = 8;
      result.high = 12;
      result.medium = 15;
      result.low = 20;
    } else {
      result.mapping_validation = 10;
      result.ocr_extraction = 15;
      result.batch_processing = 5;
    }

    return result;
  }

  private calculateUserPerformance(entries: ApprovalHistoryEntry[]): ApprovalStatistics['userPerformance'] {
    const userStats = new Map<string, {
      name: string;
      processed: ApprovalHistoryEntry[];
      approved: number;
      rejected: number;
    }>();

    entries.forEach(entry => {
      if (entry.action === 'approved' || entry.action === 'rejected') {
        if (!userStats.has(entry.actorId)) {
          userStats.set(entry.actorId, {
            name: entry.actorName,
            processed: [],
            approved: 0,
            rejected: 0
          });
        }

        const stats = userStats.get(entry.actorId)!;
        stats.processed.push(entry);
        
        if (entry.action === 'approved') stats.approved++;
        else stats.rejected++;
      }
    });

    return Array.from(userStats.entries()).map(([userId, stats]) => ({
      userId,
      userName: stats.name,
      processedCount: stats.processed.length,
      averageTime: stats.processed.reduce((sum, entry) => sum + (entry.duration || 0), 0) / (stats.processed.length * 60 * 1000) || 0,
      approvalRate: (stats.approved / (stats.approved + stats.rejected)) * 100 || 0,
      rejectionRate: (stats.rejected / (stats.approved + stats.rejected)) * 100 || 0
    }));
  }

  private calculateTimeDistribution(entries: ApprovalHistoryEntry[]): Array<{
    timeRange: string;
    count: number;
  }> {
    const ranges = [
      { label: '< 5 min', min: 0, max: 5 },
      { label: '5-10 min', min: 5, max: 10 },
      { label: '10-20 min', min: 10, max: 20 },
      { label: '20-30 min', min: 20, max: 30 },
      { label: '> 30 min', min: 30, max: Infinity }
    ];

    return ranges.map(range => {
      const count = entries.filter(entry => {
        const timeInMinutes = (entry.duration || 0) / (60 * 1000);
        return timeInMinutes >= range.min && timeInMinutes < range.max;
      }).length;

      return {
        timeRange: range.label,
        count
      };
    });
  }

  private analyzePatterns(entries: ApprovalHistoryEntry[]): Array<{
    pattern: string;
    frequency: number;
    impact: string;
  }> {
    const patterns = new Map<string, number>();

    // Analyser les patterns de rejet
    const rejections = entries.filter(entry => entry.action === 'rejected');
    rejections.forEach(entry => {
      if (entry.details.reason) {
        const key = `rejection: ${entry.details.reason}`;
        patterns.set(key, (patterns.get(key) || 0) + 1);
      }
    });

    // Analyser les patterns de modification
    const modifications = entries.filter(entry => entry.action === 'modified');
    modifications.forEach(entry => {
      if (entry.details.fieldName) {
        const key = `modification: ${entry.details.fieldName}`;
        patterns.set(key, (patterns.get(key) || 0) + 1);
      }
    });

    return Array.from(patterns.entries())
      .map(([pattern, frequency]) => ({
        pattern,
        frequency,
        impact: frequency > 10 ? 'high' : frequency > 5 ? 'medium' : 'low'
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  private exportToCSV(): string {
    const headers = [
      'ID', 'Item ID', 'Action', 'Actor', 'Timestamp', 'Duration (ms)',
      'Previous Status', 'New Status', 'Field Name', 'Reason', 'Comments'
    ];

    const rows = this.globalHistory.map(entry => [
      entry.id,
      entry.itemId,
      entry.action,
      entry.actorName,
      entry.timestamp.toISOString(),
      entry.duration || '',
      entry.details.previousStatus || '',
      entry.details.newStatus || '',
      entry.details.fieldName || '',
      entry.details.reason || '',
      entry.details.comments || ''
    ]);

    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }
}

export const approvalHistoryService = new ApprovalHistoryService();
export default approvalHistoryService;