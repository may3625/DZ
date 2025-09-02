/**
 * Gestionnaire de synchronisation différée
 * Phase 4.1 - Synchronisation hors ligne avancée
 */

import { indexedDBManager } from './IndexedDBManager';
import { logger } from '@/utils/logger';

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
}

interface SyncConfig {
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  syncInterval: number;
}

export class OfflineSyncManager {
  private syncQueue: SyncOperation[] = [];
  private isOnline = navigator.onLine;
  private isSyncing = false;
  private config: SyncConfig;
  private syncTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<SyncConfig>) {
    this.config = {
      maxRetries: 3,
      retryDelay: 5000,
      batchSize: 10,
      syncInterval: 30000,
      ...config
    };

    this.initializeEventListeners();
    this.loadPendingOperations();
    this.startSyncTimer();
  }

  private initializeEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info('OFFLINE', 'Connexion rétablie, démarrage de la synchronisation');
      this.startSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.info('OFFLINE', 'Connexion perdue, mode hors ligne activé');
    });
  }

  private async loadPendingOperations(): Promise<void> {
    try {
      const operations = await indexedDBManager.get<SyncOperation[]>('userData', 'pending_sync');
      if (operations) {
        this.syncQueue = operations;
        logger.info('OFFLINE', `${operations.length} opérations en attente chargées`);
      }
    } catch (error) {
      logger.error('OFFLINE', 'Erreur lors du chargement des opérations', error);
    }
  }

  private async savePendingOperations(): Promise<void> {
    try {
      await indexedDBManager.store('userData', {
        id: 'pending_sync',
        data: this.syncQueue,
        timestamp: Date.now(),
        size: JSON.stringify(this.syncQueue).length,
        type: 'user_data'
      });
    } catch (error) {
      logger.error('SYNC', 'Erreur lors de la sauvegarde des opérations', error);
    }
  }

  async addOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const syncOperation: SyncOperation = {
      ...operation,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.syncQueue.push(syncOperation);
    await this.savePendingOperations();

    logger.info('SYNC', 'Opération ajoutée à la queue de synchronisation', { 
      type: operation.type, 
      table: operation.table,
      priority: operation.priority 
    });

    // Tentative de synchronisation immédiate si en ligne
    if (this.isOnline && !this.isSyncing) {
      this.startSync();
    }
  }

  private startSyncTimer(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      if (this.isOnline && !this.isSyncing && this.syncQueue.length > 0) {
        this.startSync();
      }
    }, this.config.syncInterval);
  }

  private async startSync(): Promise<void> {
    if (this.isSyncing || !this.isOnline) return;

    this.isSyncing = true;
    logger.info('SYNC', 'Démarrage de la synchronisation');

    try {
      // Trier par priorité et timestamp
      const sortedQueue = [...this.syncQueue].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return a.timestamp - b.timestamp;
      });

      // Traiter par batch
      const batches = this.createBatches(sortedQueue, this.config.batchSize);
      
      for (const batch of batches) {
        await this.processBatch(batch);
        
        // Pause entre les batches pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      logger.info('SYNC', 'Synchronisation terminée');
    } catch (error) {
      logger.error('SYNC', 'Erreur lors de la synchronisation', error);
    } finally {
      this.isSyncing = false;
      await this.savePendingOperations();
    }
  }

  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  private async processBatch(batch: SyncOperation[]): Promise<void> {
    const promises = batch.map(operation => this.processOperation(operation));
    await Promise.allSettled(promises);
  }

  private async processOperation(operation: SyncOperation): Promise<void> {
    try {
      // Simuler l'appel API - à remplacer par la vraie logique Supabase
      const success = await this.simulateAPICall(operation);
      
      if (success) {
        // Supprimer de la queue
        this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
        logger.debug('SYNC', 'Opération synchronisée avec succès', { id: operation.id });
      } else {
        throw new Error('Échec de la synchronisation');
      }
    } catch (error) {
      operation.retryCount++;
      
      if (operation.retryCount >= this.config.maxRetries) {
        // Supprimer après épuisement des tentatives
        this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
        logger.error('SYNC', 'Opération abandonnée après épuisement des tentatives', { 
          id: operation.id, 
          retries: operation.retryCount 
        });
      } else {
        logger.warn('SYNC', 'Échec de synchronisation, nouvelle tentative programmée', { 
          id: operation.id, 
          retries: operation.retryCount 
        });
        
        // Programmer une nouvelle tentative avec délai exponentiel
        setTimeout(() => {
          if (this.isOnline) {
            this.startSync();
          }
        }, this.config.retryDelay * Math.pow(2, operation.retryCount - 1));
      }
    }
  }

  private async simulateAPICall(operation: SyncOperation): Promise<boolean> {
    // Simulation - à remplacer par les vraies API Supabase
    return new Promise(resolve => {
      setTimeout(() => {
        // 90% de chance de succès pour la simulation
        resolve(Math.random() > 0.1);
      }, Math.random() * 1000 + 500);
    });
  }

  getStatus(): {
    isOnline: boolean;
    isSyncing: boolean;
    queueLength: number;
    pendingOperations: {
      high: number;
      medium: number;
      low: number;
    };
  } {
    const pendingOperations = this.syncQueue.reduce(
      (acc, op) => {
        acc[op.priority]++;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );

    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      queueLength: this.syncQueue.length,
      pendingOperations
    };
  }

  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.startSync();
    } else {
      throw new Error('Synchronisation impossible hors ligne');
    }
  }

  clearQueue(): void {
    this.syncQueue = [];
    this.savePendingOperations();
    logger.info('SYNC', 'Queue de synchronisation vidée');
  }
}

export const offlineSyncManager = new OfflineSyncManager();