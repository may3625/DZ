/**
 * Service de synchronisation Supabase pour Dalil.dz
 * Permet de télécharger toutes les données et passer en mode 100% local
 */

import { supabase } from '@/integrations/supabase/client';
import { localModeService, LocalModeConfig } from '@/config/localMode';
import { logger } from '@/utils/logger';

export interface SyncProgress {
  current: number;
  total: number;
  percentage: number;
  currentTable: string;
  status: 'idle' | 'syncing' | 'completed' | 'error';
  error?: string;
}

export interface SyncResult {
  success: boolean;
  tablesSynced: string[];
  totalRecords: number;
  totalSize: number; // en bytes
  duration: number; // en millisecondes
  errors: string[];
}

export interface LocalDataExport {
  timestamp: string;
  version: string;
  tables: {
    name: string;
    recordCount: number;
    size: number;
    data: any[];
  }[];
  metadata: {
    algerianContent: boolean;
    legalTemplates: boolean;
    forms: boolean;
    institutions: boolean;
    lastSync: string;
  };
}

/**
 * Service de synchronisation Supabase vers local
 */
export class SupabaseSyncService {
  private progress: SyncProgress = {
    current: 0,
    total: 0,
    percentage: 0,
    currentTable: '',
    status: 'idle',
  };

  private onProgressCallback?: (progress: SyncProgress) => void;

  constructor() {
    // Vérifier la configuration actuelle
    if (!localModeService.isSupabaseEnabled()) {
      throw new Error('Supabase n\'est pas activé dans la configuration actuelle');
    }
  }

  /**
   * Définir le callback de progression
   */
  setProgressCallback(callback: (progress: SyncProgress) => void): void {
    this.onProgressCallback = callback;
  }

  /**
   * Mettre à jour la progression
   */
  private updateProgress(updates: Partial<SyncProgress>): void {
    this.progress = { ...this.progress, ...updates };
    if (this.onProgressCallback) {
      this.onProgressCallback(this.progress);
    }
  }

  /**
   * Obtenir la progression actuelle
   */
  getProgress(): SyncProgress {
    return { ...this.progress };
  }

  /**
   * Synchroniser toutes les données depuis Supabase
   */
  async syncAllData(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const tablesSynced: string[] = [];
    let totalRecords = 0;
    let totalSize = 0;

    try {
      this.updateProgress({
        status: 'syncing',
        current: 0,
        total: 0,
        percentage: 0,
      });

      // 1. Récupérer la liste des tables
      const tables = await this.getTablesList();
      this.updateProgress({ total: tables.length });

      // 2. Synchroniser chaque table
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        this.updateProgress({
          current: i + 1,
          currentTable: table.name,
          percentage: Math.round(((i + 1) / tables.length) * 100),
        });

        try {
          const result = await this.syncTable(table.name);
          tablesSynced.push(table.name);
          totalRecords += result.recordCount;
          totalSize += result.size;

          logger.info('SupabaseSync', `✅ Table ${table.name} synchronisée`, {
            records: result.recordCount,
            size: result.size,
          });
        } catch (error) {
          const errorMsg = `Erreur lors de la synchronisation de ${table.name}: ${error}`;
          errors.push(errorMsg);
          logger.error('SupabaseSync', errorMsg, { error, table: table.name });
        }
      }

      // 3. Créer l'export local
      const exportData = await this.createLocalExport(tablesSynced, totalRecords, totalSize);
      await this.saveLocalExport(exportData);

      // 4. Basculer vers le mode local
      localModeService.switchToLocalMode();

      const duration = Date.now() - startTime;
      const result: SyncResult = {
        success: errors.length === 0,
        tablesSynced,
        totalRecords,
        totalSize,
        duration,
        errors,
      };

      this.updateProgress({
        status: 'completed',
        percentage: 100,
      });

      logger.info('SupabaseSync', '✅ Synchronisation terminée', result);
      return result;

    } catch (error) {
      const errorMsg = `Erreur générale de synchronisation: ${error}`;
      errors.push(errorMsg);
      logger.error('SupabaseSync', errorMsg, { error });

      this.updateProgress({
        status: 'error',
        error: errorMsg,
      });

      throw new Error(errorMsg);
    }
  }

  /**
   * Obtenir la liste des tables à synchroniser
   */
  private async getTablesList(): Promise<Array<{ name: string; recordCount: number }>> {
    const tables = [
      'legal_texts',
      'procedures',
      'forms',
      'institutions',
      'wilayas',
      'users',
      'approvals',
      'validations',
      'mappings',
      'ocr_results',
      'analysis_reports',
      'collaboration_data',
    ];

    const result = [];
    for (const tableName of tables) {
      try {
        const { count } = await supabase
          .from(tableName as any)
          .select('*', { count: 'exact', head: true });

        result.push({
          name: tableName,
          recordCount: count || 0,
        });
      } catch (error) {
        // Table n'existe pas ou erreur d'accès
        logger.warn('SupabaseSync', `Table ${tableName} non accessible`, { error });
      }
    }

    return result;
  }

  /**
   * Synchroniser une table spécifique
   */
  private async syncTable(tableName: string): Promise<{ recordCount: number; size: number }> {
    const { data, error } = await supabase
      .from(tableName as any)
      .select('*');

    if (error) {
      throw new Error(`Erreur lors de la récupération de ${tableName}: ${error.message}`);
    }

    const recordCount = data?.length || 0;
    const size = JSON.stringify(data).length;

    // Sauvegarder localement
    await this.saveTableDataLocally(tableName, data || []);

    return { recordCount, size };
  }

  /**
   * Sauvegarder les données d'une table localement
   */
  private async saveTableDataLocally(tableName: string, data: any[]): Promise<void> {
    try {
      // Utiliser localStorage pour les petites tables
      if (data.length < 1000) {
        localStorage.setItem(`dalil-dz-${tableName}`, JSON.stringify(data));
      } else {
        // Utiliser IndexedDB pour les grandes tables
        await this.saveToIndexedDB(tableName, data);
      }
    } catch (error) {
      logger.warn('SupabaseSync', `Impossible de sauvegarder ${tableName} localement`, { error });
    }
  }

  /**
   * Sauvegarder dans IndexedDB
   */
  private async saveToIndexedDB(tableName: string, data: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DalilDZLocal', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([tableName], 'readwrite');
        const store = transaction.objectStore(tableName);

        // Vider la store existante
        store.clear();

        // Ajouter les nouvelles données
        data.forEach((record, index) => {
          store.add(record);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(tableName)) {
          db.createObjectStore(tableName, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Créer l'export local des données
   */
  private async createLocalExport(
    tablesSynced: string[],
    totalRecords: number,
    totalSize: number
  ): Promise<LocalDataExport> {
    const exportData: LocalDataExport = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      tables: [],
      metadata: {
        algerianContent: true,
        legalTemplates: true,
        forms: true,
        institutions: true,
        lastSync: new Date().toISOString(),
      },
    };

    // Récupérer les données de chaque table synchronisée
    for (const tableName of tablesSynced) {
      try {
        const data = await this.getLocalTableData(tableName);
        const size = JSON.stringify(data).length;

        exportData.tables.push({
          name: tableName,
          recordCount: data.length,
          size,
          data,
        });
      } catch (error) {
        logger.warn('SupabaseSync', `Impossible de récupérer ${tableName} pour l'export`, { error });
      }
    }

    return exportData;
  }

  /**
   * Récupérer les données locales d'une table
   */
  private async getLocalTableData(tableName: string): Promise<any[]> {
    try {
      // Essayer localStorage d'abord
      const localData = localStorage.getItem(`dalil-dz-${tableName}`);
      if (localData) {
        return JSON.parse(localData);
      }

      // Essayer IndexedDB
      return await this.getFromIndexedDB(tableName);
    } catch (error) {
      logger.warn('SupabaseSync', `Impossible de récupérer ${tableName}`, { error });
      return [];
    }
  }

  /**
   * Récupérer depuis IndexedDB
   */
  private async getFromIndexedDB(tableName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DalilDZLocal', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([tableName], 'readonly');
        const store = transaction.objectStore(tableName);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
    });
  }

  /**
   * Sauvegarder l'export local
   */
  private async saveLocalExport(exportData: LocalDataExport): Promise<void> {
    try {
      // Sauvegarder dans localStorage
      localStorage.setItem('dalil-dz-export', JSON.stringify(exportData));

      // Créer un fichier de sauvegarde téléchargeable
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dalil-dz-local-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logger.info('SupabaseSync', '✅ Export local sauvegardé et téléchargé');
    } catch (error) {
      logger.error('SupabaseSync', 'Erreur lors de la sauvegarde de l\'export', { error });
    }
  }

  /**
   * Vérifier l'état de la synchronisation
   */
  async checkSyncStatus(): Promise<{
    lastSync: string | null;
    tablesCount: number;
    totalRecords: number;
    isComplete: boolean;
  }> {
    try {
      const exportData = localStorage.getItem('dalil-dz-export');
      if (!exportData) {
        return {
          lastSync: null,
          tablesCount: 0,
          totalRecords: 0,
          isComplete: false,
        };
      }

      const data = JSON.parse(exportData);
      const totalRecords = data.tables.reduce((sum: number, table: any) => sum + table.recordCount, 0);

      return {
        lastSync: data.metadata.lastSync,
        tablesCount: data.tables.length,
        totalRecords,
        isComplete: data.tables.length > 0,
      };
    } catch (error) {
      logger.error('SupabaseSync', 'Erreur lors de la vérification du statut', { error });
      return {
        lastSync: null,
        tablesCount: 0,
        totalRecords: 0,
        isComplete: false,
      };
    }
  }

  /**
   * Nettoyer les données locales
   */
  async clearLocalData(): Promise<void> {
    try {
      // Nettoyer localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('dalil-dz-')) {
          localStorage.removeItem(key);
        }
      });

      // Nettoyer IndexedDB
      const request = indexedDB.deleteDatabase('DalilDZLocal');
      request.onsuccess = () => {
        logger.info('SupabaseSync', '✅ Données locales nettoyées');
      };
      request.onerror = () => {
        logger.warn('SupabaseSync', 'Impossible de nettoyer IndexedDB', { error: request.error });
      };
    } catch (error) {
      logger.error('SupabaseSync', 'Erreur lors du nettoyage des données locales', { error });
    }
  }
}

/**
 * Instance du service de synchronisation
 */
export const supabaseSyncService = new SupabaseSyncService();

/**
 * Hook React pour la synchronisation
 */
export const useSupabaseSync = () => {
  return {
    syncAllData: () => supabaseSyncService.syncAllData(),
    getProgress: () => supabaseSyncService.getProgress(),
    setProgressCallback: (callback: (progress: SyncProgress) => void) =>
      supabaseSyncService.setProgressCallback(callback),
    checkSyncStatus: () => supabaseSyncService.checkSyncStatus(),
    clearLocalData: () => supabaseSyncService.clearLocalData(),
  };
};