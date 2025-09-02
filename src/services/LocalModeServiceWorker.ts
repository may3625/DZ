/**
 * Service Worker pour le mode local avancé
 * Cache intelligent et synchronisation différée
 */

// Types pour le cache
interface CacheEntry {
  data: any;
  timestamp: number;
  version: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

interface SyncJob {
  id: string;
  type: 'upload' | 'download' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

class LocalModeServiceWorker {
  private version = '1.0.0';
  private caches = {
    static: 'dalil-static-v1',
    dynamic: 'dalil-dynamic-v1',
    api: 'dalil-api-v1',
    ocr: 'dalil-ocr-v1'
  };
  
  private syncQueue: SyncJob[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.init();
  }

  private async init() {
    // Installer le service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw-dalil.js');
        console.log('✅ Service Worker enregistré:', registration);
        
        // Écouter les messages du service worker
        navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));
        
        // Surveiller les changements de connectivité
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
      } catch (error) {
        console.error('❌ Erreur Service Worker:', error);
      }
    }
  }

  private handleSWMessage(event: MessageEvent) {
    const { type, data } = event.data;
    
    switch (type) {
      case 'cache-updated':
        this.notifyCacheUpdate(data);
        break;
      case 'sync-required':
        this.addToSyncQueue(data);
        break;
      case 'error':
        console.error('SW Error:', data);
        break;
    }
  }

  private handleOnline() {
    this.isOnline = true;
    console.log('🌐 Connexion restaurée - Synchronisation...');
    this.processSyncQueue();
    this.notifyConnectionStatus(true);
  }

  private handleOffline() {
    this.isOnline = false;
    console.log('📴 Mode hors ligne activé');
    this.notifyConnectionStatus(false);
  }

  // Cache intelligent avec priorités
  async cacheData(key: string, data: any, options: {
    priority?: 'high' | 'medium' | 'low';
    tags?: string[];
    ttl?: number; // Time to live en ms
  } = {}) {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      version: this.version,
      priority: options.priority || 'medium',
      tags: options.tags || []
    };

    try {
      // Stocker dans IndexedDB pour les gros volumes
      if (this.isLargeData(data)) {
        await this.storeInIndexedDB(key, entry);
      } else {
        // Stocker dans localStorage pour les petites données
        localStorage.setItem(`dalil-cache-${key}`, JSON.stringify(entry));
      }

      // TTL management
      if (options.ttl) {
        setTimeout(() => {
          this.removeFromCache(key);
        }, options.ttl);
      }

      console.log(`📦 Données cachées: ${key}`);
    } catch (error) {
      console.error('❌ Erreur cache:', error);
    }
  }

  async getCachedData(key: string): Promise<any | null> {
    try {
      // Essayer IndexedDB d'abord
      let entry = await this.getFromIndexedDB(key);
      
      // Fallback vers localStorage
      if (!entry) {
        const stored = localStorage.getItem(`dalil-cache-${key}`);
        if (stored) {
          entry = JSON.parse(stored);
        }
      }

      if (entry && this.isCacheValid(entry)) {
        return entry.data;
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur lecture cache:', error);
      return null;
    }
  }

  private isLargeData(data: any): boolean {
    return JSON.stringify(data).length > 50000; // 50KB
  }

  private isCacheValid(entry: CacheEntry): boolean {
    // Vérifier la version
    if (entry.version !== this.version) {
      return false;
    }

    // Cache haute priorité : valide 1 heure
    if (entry.priority === 'high') {
      return (Date.now() - entry.timestamp) < 3600000;
    }

    // Cache moyenne priorité : valide 30 minutes
    if (entry.priority === 'medium') {
      return (Date.now() - entry.timestamp) < 1800000;
    }

    // Cache basse priorité : valide 10 minutes
    return (Date.now() - entry.timestamp) < 600000;
  }

  // IndexedDB pour gros volumes
  private async storeInIndexedDB(key: string, entry: CacheEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DalilCache', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        
        store.put({ key, ...entry });
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  private async getFromIndexedDB(key: string): Promise<CacheEntry | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DalilCache', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const getRequest = store.get(key);
        
        getRequest.onsuccess = () => {
          const result = getRequest.result;
          resolve(result ? { ...result } : null);
        };
        
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }

  // Gestion de la queue de synchronisation
  addToSyncQueue(job: Omit<SyncJob, 'id' | 'timestamp' | 'retries'>) {
    const syncJob: SyncJob = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3,
      ...job
    };

    this.syncQueue.push(syncJob);
    this.saveSyncQueue();

    // Essayer de synchroniser immédiatement si en ligne
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  private async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    console.log(`🔄 Traitement queue sync: ${this.syncQueue.length} jobs`);

    const failedJobs: SyncJob[] = [];

    for (const job of this.syncQueue) {
      try {
        await this.executeSyncJob(job);
        console.log(`✅ Sync réussi: ${job.id}`);
      } catch (error) {
        console.error(`❌ Sync échoué: ${job.id}`, error);
        
        job.retries++;
        if (job.retries < job.maxRetries) {
          failedJobs.push(job);
        } else {
          console.error(`🚫 Sync abandonné: ${job.id} (max retries)`);
        }
      }
    }

    this.syncQueue = failedJobs;
    this.saveSyncQueue();
  }

  private async executeSyncJob(job: SyncJob): Promise<void> {
    switch (job.type) {
      case 'upload':
        // Simuler upload vers Supabase
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
        
      case 'download':
        // Simuler download depuis Supabase
        await new Promise(resolve => setTimeout(resolve, 500));
        break;
        
      case 'delete':
        // Simuler suppression
        await new Promise(resolve => setTimeout(resolve, 200));
        break;
    }
  }

  private saveSyncQueue() {
    try {
      localStorage.setItem('dalil-sync-queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('❌ Erreur sauvegarde queue:', error);
    }
  }

  private loadSyncQueue() {
    try {
      const stored = localStorage.getItem('dalil-sync-queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ Erreur chargement queue:', error);
      this.syncQueue = [];
    }
  }

  // Nettoyage du cache
  async cleanupCache() {
    console.log('🧹 Nettoyage du cache...');
    
    // Nettoyer localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('dalil-cache-')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const entry: CacheEntry = JSON.parse(stored);
            if (!this.isCacheValid(entry)) {
              keysToRemove.push(key);
            }
          } catch (error) {
            keysToRemove.push(key);
          }
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Nettoyer IndexedDB
    await this.cleanupIndexedDB();
    
    console.log(`🧹 Cache nettoyé: ${keysToRemove.length} entrées supprimées`);
  }

  private async cleanupIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DalilCache', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        
        store.getAll().onsuccess = (event) => {
          const entries = (event.target as IDBRequest).result;
          const toDelete: string[] = [];
          
          entries.forEach((entry: any) => {
            if (!this.isCacheValid(entry)) {
              toDelete.push(entry.key);
            }
          });
          
          toDelete.forEach(key => store.delete(key));
        };
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Notifications
  private notifyCacheUpdate(data: any) {
    window.dispatchEvent(new CustomEvent('cache-updated', { detail: data }));
  }

  private notifyConnectionStatus(isOnline: boolean) {
    window.dispatchEvent(new CustomEvent('connection-status', { 
      detail: { isOnline, syncQueueLength: this.syncQueue.length } 
    }));
  }

  async removeFromCache(key: string) {
    // Supprimer de localStorage
    localStorage.removeItem(`dalil-cache-${key}`);
    
    // Supprimer d'IndexedDB
    try {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('DalilCache', 1);
        
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          
          store.delete(key);
          
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ Erreur suppression cache IndexedDB:', error);
    }
  }

  // Préchargement des données essentielles
  async preloadEssentialData() {
    const essentialData = [
      { key: 'wilayas', url: '/api/wilayas', priority: 'high' as const },
      { key: 'legal-categories', url: '/api/legal/categories', priority: 'high' as const },
      { key: 'procedure-templates', url: '/api/procedures/templates', priority: 'medium' as const },
      { key: 'translations', url: '/api/i18n/all', priority: 'high' as const }
    ];

    for (const item of essentialData) {
      try {
        // Simuler le chargement des données
        const mockData = this.generateMockData(item.key);
        await this.cacheData(item.key, mockData, { 
          priority: item.priority,
          tags: ['essential', 'preload'],
          ttl: 3600000 // 1 heure
        });
        
        console.log(`📦 Données préchargées: ${item.key}`);
      } catch (error) {
        console.error(`❌ Erreur préchargement ${item.key}:`, error);
      }
    }
  }

  private generateMockData(key: string): any {
    switch (key) {
      case 'wilayas':
        return Array.from({ length: 58 }, (_, i) => ({
          id: i + 1,
          name: `Wilaya ${i + 1}`,
          code: `${i + 1}`.padStart(2, '0')
        }));
        
      case 'legal-categories':
        return ['Droit Civil', 'Droit Pénal', 'Droit Commercial', 'Droit Administratif'];
        
      case 'procedure-templates':
        return ['Demande CNI', 'Demande Passeport', 'Certificat Résidence'];
        
      case 'translations':
        return { fr: {}, ar: {}, en: {} };
        
      default:
        return {};
    }
  }

  // Statistiques du cache
  async getCacheStats() {
    const localStorageSize = new Blob([JSON.stringify(localStorage)]).size;
    
    // Calculer la taille IndexedDB
    let indexedDBSize = 0;
    try {
      indexedDBSize = await this.getIndexedDBSize();
    } catch (error) {
      console.error('❌ Erreur calcul taille IndexedDB:', error);
    }

    return {
      localStorageSize: Math.round(localStorageSize / 1024), // KB
      indexedDBSize: Math.round(indexedDBSize / 1024), // KB
      totalSize: Math.round((localStorageSize + indexedDBSize) / 1024), // KB
      syncQueueLength: this.syncQueue.length,
      isOnline: this.isOnline,
      version: this.version
    };
  }

  private async getIndexedDBSize(): Promise<number> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DalilCache', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        
        store.getAll().onsuccess = (event) => {
          const entries = (event.target as IDBRequest).result;
          const size = new Blob([JSON.stringify(entries)]).size;
          resolve(size);
        };
        
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

// Instance globale
export const localModeServiceWorker = new LocalModeServiceWorker();