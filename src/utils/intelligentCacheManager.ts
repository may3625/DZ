import { logger } from './logger';

interface CacheConfig {
  maxSize: number;
  ttl: number;
  enableCompression: boolean;
  enableEncryption: boolean;
  enableOfflineSync: boolean;
}

interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  ttl: number;
  size: number;
  compressed: boolean;
  encrypted: boolean;
  accessCount: number;
  lastAccessed: number;
}

export class IntelligentCacheManager {
  private static instance: IntelligentCacheManager;
  private config: CacheConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private offlineQueue: Array<{ action: string; data: any; timestamp: number }> = [];
  private syncInProgress: boolean = false;

  static getInstance(): IntelligentCacheManager {
    if (!IntelligentCacheManager.instance) {
      IntelligentCacheManager.instance = new IntelligentCacheManager();
    }
    return IntelligentCacheManager.instance;
  }

  constructor() {
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB
      ttl: 24 * 60 * 60 * 1000, // 24 heures
      enableCompression: true,
      enableEncryption: true,
      enableOfflineSync: true
    };

    this.initializeCache();
  }

  private initializeCache() {
    logger.info('CACHE', 'Initialisation du système de cache intelligent', {}, 'IntelligentCacheManager');
    
    // Charger le cache depuis le stockage local
    this.loadFromStorage();
    
    // Nettoyer les entrées expirées
    this.cleanExpiredEntries();
    
    // Configurer la synchronisation hors ligne
    if (this.config.enableOfflineSync) {
      this.initializeOfflineSync();
    }
    
    // Nettoyer automatiquement toutes les heures
    setInterval(() => this.cleanExpiredEntries(), 60 * 60 * 1000);
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('dalil_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cache = new Map(parsed);
        logger.info('CACHE', 'Cache chargé depuis le stockage', { entries: this.cache.size }, 'IntelligentCacheManager');
      }
    } catch (error) {
      logger.warn('CACHE', 'Erreur lors du chargement du cache', { error }, 'IntelligentCacheManager');
    }
  }

  private saveToStorage() {
    try {
      const toSave = Array.from(this.cache.entries());
      localStorage.setItem('dalil_cache', JSON.stringify(toSave));
    } catch (error) {
      logger.warn('CACHE', 'Erreur lors de la sauvegarde du cache', { error }, 'IntelligentCacheManager');
    }
  }

  private async evictLeastUsed() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
    
    const toRemove = Math.ceil(entries.length * 0.2); // Supprimer 20%
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    logger.info('CACHE', 'Éviction des entrées les moins utilisées', { removed: toRemove }, 'IntelligentCacheManager');
  }

  private cleanExpiredEntries() {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      logger.info('CACHE', 'Nettoyage des entrées expirées', { expiredCount }, 'IntelligentCacheManager');
    }
  }

  private initializeOfflineSync() {
    // Écouter les changements de connectivité
    window.addEventListener('online', () => {
      this.syncOfflineQueue();
    });

    // Synchroniser au démarrage si en ligne
    if (navigator.onLine) {
      this.syncOfflineQueue();
    }
  }

  private async syncOfflineQueue() {
    if (this.syncInProgress || this.offlineQueue.length === 0) return;

    this.syncInProgress = true;
    logger.info('CACHE', 'Début de la synchronisation hors ligne', { queueSize: this.offlineQueue.length }, 'IntelligentCacheManager');

    try {
      for (const item of this.offlineQueue) {
        await this.processOfflineAction(item);
      }
      
      this.offlineQueue = [];
      logger.info('CACHE', 'Synchronisation hors ligne terminée', {}, 'IntelligentCacheManager');
    } catch (error) {
      logger.error('CACHE', 'Erreur lors de la synchronisation hors ligne', { error }, 'IntelligentCacheManager');
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processOfflineAction(item: { action: string; data: any; timestamp: number }) {
    // Traiter les actions en attente
    switch (item.action) {
      case 'update':
        // Synchroniser les mises à jour
        break;
      case 'delete':
        // Synchroniser les suppressions
        break;
      default:
        break;
    }
  }

  private async compressData(data: any): Promise<string> {
    // Compression simple avec JSON.stringify pour l'instant
    return JSON.stringify(data);
  }

  private async decompressData(data: string): Promise<any> {
    // Décompression
    return JSON.parse(data);
  }

  private async encryptData(data: string): Promise<string> {
    // Chiffrement simple pour l'instant (à améliorer avec Web Crypto API)
    return btoa(data);
  }

  private async decryptData(data: string): Promise<string> {
    // Déchiffrement
    return atob(data);
  }

  public async set(key: string, value: any, customTTL?: number): Promise<void> {
    try {
      let processedValue = value;
      let size = JSON.stringify(value).length;
      let compressed = false;
      let encrypted = false;

      // Compression si activée et valeur importante
      if (this.config.enableCompression && size > 1024) {
        processedValue = await this.compressData(value);
        size = processedValue.length;
        compressed = true;
      }

      // Chiffrement si activé
      if (this.config.enableEncryption) {
        processedValue = await this.encryptData(typeof processedValue === 'string' ? processedValue : JSON.stringify(processedValue));
        encrypted = true;
      }

      const entry: CacheEntry = {
        key,
        value: processedValue,
        timestamp: Date.now(),
        ttl: customTTL || this.config.ttl,
        size,
        compressed,
        encrypted,
        accessCount: 0,
        lastAccessed: Date.now()
      };

      // Vérifier la taille du cache
      const currentSize = Array.from(this.cache.values()).reduce((sum, e) => sum + e.size, 0);
      if (currentSize + size > this.config.maxSize) {
        await this.evictLeastUsed();
      }

      this.cache.set(key, entry);
      this.saveToStorage();

      logger.info('CACHE', 'Entrée ajoutée au cache', { key, size, compressed, encrypted }, 'IntelligentCacheManager');
    } catch (error) {
      logger.error('CACHE', 'Erreur lors de l\'ajout au cache', { key, error }, 'IntelligentCacheManager');
      throw error;
    }
  }

  public async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Vérifier l'expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    try {
      entry.accessCount++;
      entry.lastAccessed = Date.now();

      let value = entry.value;

      if (entry.encrypted) {
        value = await this.decryptData(value);
      }

      if (entry.compressed) {
        value = await this.decompressData(value);
      }

      this.saveToStorage();
      return value;
    } catch (error) {
      logger.error('CACHE', 'Erreur lors de la récupération du cache', { key, error }, 'IntelligentCacheManager');
      return null;
    }
  }

  public async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.saveToStorage();
      logger.info('CACHE', 'Entrée supprimée du cache', { key }, 'IntelligentCacheManager');
    }
    return deleted;
  }

  public async clear(): Promise<void> {
    this.cache.clear();
    this.saveToStorage();
    logger.info('CACHE', 'Cache vidé', {}, 'IntelligentCacheManager');
  }

  public async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Vérifier l'expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.saveToStorage();
      return false;
    }
    
    return true;
  }

  public getStats() {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const compressedCount = entries.filter(e => e.compressed).length;
    const encryptedCount = entries.filter(e => e.encrypted).length;
    
    return {
      totalEntries: this.cache.size,
      totalSize,
      compressedEntries: compressedCount,
      encryptedEntries: encryptedCount,
      offlineQueueSize: this.offlineQueue.length,
      maxSize: this.config.maxSize,
      usagePercentage: (totalSize / this.config.maxSize) * 100
    };
  }

  public updateConfig(newConfig: Partial<CacheConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public async addToOfflineQueue(action: string, data: any): Promise<void> {
    this.offlineQueue.push({
      action,
      data,
      timestamp: Date.now()
    });

    logger.info('CACHE', 'Action ajoutée à la file d\'attente hors ligne', { action, queueSize: this.offlineQueue.length }, 'IntelligentCacheManager');
  }

  public getOfflineQueueSize(): number {
    return this.offlineQueue.length;
  }

  public async preload(keys: string[]): Promise<void> {
    logger.info('CACHE', 'Préchargement du cache', { keysCount: keys.length }, 'IntelligentCacheManager');
    
    // Simulation de préchargement
    for (const key of keys) {
      if (!(await this.has(key))) {
        // Charger depuis la source si disponible
        // await this.loadFromSource(key);
      }
    }
  }

  public async invalidatePattern(pattern: RegExp): Promise<number> {
    let invalidatedCount = 0;
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      await this.delete(key);
      invalidatedCount++;
    }
    
    logger.info('CACHE', 'Invalidation par pattern', { pattern: pattern.source, invalidatedCount }, 'IntelligentCacheManager');
    return invalidatedCount;
  }
}

export const cacheManager = IntelligentCacheManager.getInstance();