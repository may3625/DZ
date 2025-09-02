/**
 * Gestionnaire IndexedDB optimisé pour le mode local
 * Phase 4.1 - Stockage hors ligne avancé
 */

interface IndexedDBConfig {
  dbName: string;
  version: number;
  stores: {
    name: string;
    keyPath: string;
    indexes?: { name: string; keyPath: string; unique?: boolean }[];
  }[];
}

interface StoredData {
  id: string;
  data: any;
  timestamp: number;
  ttl?: number;
  size: number;
  type: 'legal_text' | 'ocr_result' | 'user_data' | 'cache';
}

export class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private config: IndexedDBConfig;
  private initPromise: Promise<void> | null = null;

  constructor(config?: Partial<IndexedDBConfig>) {
    this.config = {
      dbName: 'DalilDZLocal',
      version: 1,
      stores: [
        {
          name: 'legalTexts',
          keyPath: 'id',
          indexes: [
            { name: 'wilaya', keyPath: 'wilaya' },
            { name: 'type', keyPath: 'type' },
            { name: 'timestamp', keyPath: 'timestamp' }
          ]
        },
        {
          name: 'ocrResults',
          keyPath: 'id',
          indexes: [
            { name: 'hash', keyPath: 'hash', unique: true },
            { name: 'timestamp', keyPath: 'timestamp' }
          ]
        },
        {
          name: 'userData',
          keyPath: 'id',
          indexes: [
            { name: 'userId', keyPath: 'userId' },
            { name: 'type', keyPath: 'type' }
          ]
        },
        {
          name: 'cache',
          keyPath: 'id',
          indexes: [
            { name: 'category', keyPath: 'category' },
            { name: 'timestamp', keyPath: 'timestamp' }
          ]
        }
      ],
      ...config
    };
  }

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB non supporté'));
        return;
      }

      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Créer les stores
        this.config.stores.forEach(storeConfig => {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, {
              keyPath: storeConfig.keyPath
            });

            // Créer les indexes
            storeConfig.indexes?.forEach(index => {
              store.createIndex(index.name, index.keyPath, {
                unique: index.unique || false
              });
            });
          }
        });
      };
    });

    return this.initPromise;
  }

  async store(storeName: string, data: StoredData): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Base de données non initialisée');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, id: string): Promise<T | null> {
    await this.init();
    if (!this.db) throw new Error('Base de données non initialisée');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.get(id);
      request.onsuccess = () => {
        const result = request.result;
        
        // Vérifier l'expiration
        if (result && result.ttl && Date.now() > result.timestamp + result.ttl) {
          this.delete(storeName, id);
          resolve(null);
          return;
        }
        
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    await this.init();
    if (!this.db) throw new Error('Base de données non initialisée');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      
      const request = index.getAll(value);
      request.onsuccess = () => {
        const results = request.result
          .filter(item => !item.ttl || Date.now() <= item.timestamp + item.ttl)
          .map(item => item.data);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Base de données non initialisée');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Base de données non initialisée');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStats(): Promise<{
    totalSize: number;
    itemCount: number;
    storeStats: Record<string, { count: number; size: number }>;
  }> {
    await this.init();
    if (!this.db) throw new Error('Base de données non initialisée');

    const storeStats: Record<string, { count: number; size: number }> = {};
    let totalSize = 0;
    let itemCount = 0;

    for (const storeConfig of this.config.stores) {
      const storeName = storeConfig.name;
      const items = await this.getAllFromStore(storeName);
      
      const storeSize = items.reduce((sum, item) => sum + (item.size || 0), 0);
      const count = items.length;
      
      storeStats[storeName] = { count, size: storeSize };
      totalSize += storeSize;
      itemCount += count;
    }

    return { totalSize, itemCount, storeStats };
  }

  private async getAllFromStore(storeName: string): Promise<StoredData[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async cleanup(): Promise<number> {
    await this.init();
    if (!this.db) throw new Error('Base de données non initialisée');

    let cleaned = 0;
    const now = Date.now();

    for (const storeConfig of this.config.stores) {
      const storeName = storeConfig.name;
      const items = await this.getAllFromStore(storeName);
      
      for (const item of items) {
        if (item.ttl && now > item.timestamp + item.ttl) {
          await this.delete(storeName, item.id);
          cleaned++;
        }
      }
    }

    return cleaned;
  }
}

export const indexedDBManager = new IndexedDBManager();