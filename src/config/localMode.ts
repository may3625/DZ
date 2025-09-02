/**
 * Configuration pour le mode 100% local de Dalil.dz
 * Optimisé pour l'usage hors ligne et local
 */

export interface LocalModeConfig {
  // Mode de fonctionnement
  mode: 'local' | 'hybrid' | 'external';
  
  // Base de données locale
  database: {
    type: 'sqlite3' | 'indexeddb' | 'localstorage';
    path: string;
    autoBackup: boolean;
    backupInterval: number; // en heures
  };
  
  // Stockage des fichiers
  storage: {
    type: 'filesystem' | 'indexeddb';
    maxSize: number; // en MB
    compression: boolean;
    encryption: boolean;
  };
  
  // Traitement local
  processing: {
    ocr: 'local' | 'web-worker' | 'disabled';
    pdf: 'local' | 'web-worker' | 'disabled';
    ai: 'local' | 'disabled';
    maxConcurrent: number;
  };
  
  // Synchronisation Supabase
  supabase: {
    enabled: boolean;
    mode: 'sync-only' | 'hybrid' | 'disabled';
    autoSync: boolean;
    syncInterval: number; // en minutes
    dataRetention: number; // en jours
  };
  
  // Cache et performance
  performance: {
    cacheStrategy: 'aggressive' | 'balanced' | 'minimal';
    maxCacheSize: number; // en MB
    preloadData: boolean;
    lazyLoading: boolean;
  };
  
  // Contenu algérien
  algerianContent: {
    wilayas: boolean;
    legalTemplates: boolean;
    forms: boolean;
    institutions: boolean;
    autoUpdate: boolean;
  };
  
  // Support bilingue
  localization: {
    primary: 'ar' | 'fr';
    fallback: 'ar' | 'fr';
    rtlSupport: boolean;
    autoDetect: boolean;
  };
}

/**
 * Configuration par défaut pour le mode local
 */
export const DEFAULT_LOCAL_CONFIG: LocalModeConfig = {
  mode: 'local',
  
  database: {
    type: 'sqlite3',
    path: './data/dalil-dz-local.db',
    autoBackup: true,
    backupInterval: 24, // 24 heures
  },
  
  storage: {
    type: 'filesystem',
    maxSize: 500, // 500 MB
    compression: true,
    encryption: false, // Désactivé pour les performances
  },
  
  processing: {
    ocr: 'web-worker',
    pdf: 'web-worker',
    ai: 'disabled', // Désactivé pour économiser l'espace
    maxConcurrent: 2,
  },
  
  supabase: {
    enabled: false, // Désactivé en mode local
    mode: 'disabled',
    autoSync: false,
    syncInterval: 0,
    dataRetention: 0,
  },
  
  performance: {
    cacheStrategy: 'aggressive',
    maxCacheSize: 100, // 100 MB
    preloadData: true,
    lazyLoading: true,
  },
  
  algerianContent: {
    wilayas: true,
    legalTemplates: true,
    forms: true,
    institutions: true,
    autoUpdate: false, // Mise à jour manuelle
  },
  
  localization: {
    primary: 'ar',
    fallback: 'fr',
    rtlSupport: true,
    autoDetect: true,
  },
};

/**
 * Configuration pour le mode hybride (transition)
 */
export const HYBRID_CONFIG: LocalModeConfig = {
  ...DEFAULT_LOCAL_CONFIG,
  mode: 'hybrid',
  supabase: {
    enabled: true,
    mode: 'sync-only',
    autoSync: true,
    syncInterval: 60, // 1 heure
    dataRetention: 30, // 30 jours
  },
};

/**
 * Configuration pour le mode externe (développement)
 */
export const EXTERNAL_CONFIG: LocalModeConfig = {
  ...DEFAULT_LOCAL_CONFIG,
  mode: 'external',
  supabase: {
    enabled: true,
    mode: 'hybrid',
    autoSync: true,
    syncInterval: 15, // 15 minutes
    dataRetention: 90, // 90 jours
  },
  processing: {
    ...DEFAULT_LOCAL_CONFIG.processing,
    ai: 'local', // Activé en mode externe
  },
};

/**
 * Service de gestion du mode local
 */
export class LocalModeService {
  private config: LocalModeConfig;
  
  constructor(config: LocalModeConfig = DEFAULT_LOCAL_CONFIG) {
    this.config = config;
  }
  
  /**
   * Vérifier si le mode local est activé
   */
  isLocalMode(): boolean {
    return this.config.mode === 'local';
  }
  
  /**
   * Vérifier si Supabase est activé
   */
  isSupabaseEnabled(): boolean {
    return this.config.supabase.enabled;
  }
  
  /**
   * Obtenir la configuration actuelle
   */
  getConfig(): LocalModeConfig {
    return this.config;
  }
  
  /**
   * Mettre à jour la configuration
   */
  updateConfig(newConfig: Partial<LocalModeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * Basculer vers le mode local
   */
  switchToLocalMode(): void {
    this.config = DEFAULT_LOCAL_CONFIG;
  }
  
  /**
   * Basculer vers le mode hybride
   */
  switchToHybridMode(): void {
    this.config = HYBRID_CONFIG;
  }
  
  /**
   * Basculer vers le mode externe
   */
  switchToExternalMode(): void {
    this.config = EXTERNAL_CONFIG;
  }
  
  /**
   * Vérifier la compatibilité du mode local
   */
  checkLocalCompatibility(): {
    compatible: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Vérifier le support des Web Workers
    if (typeof Worker === 'undefined') {
      issues.push('Web Workers non supportés');
      recommendations.push('Utiliser le mode de traitement local');
    }
    
    // Vérifier le support d'IndexedDB
    if (typeof indexedDB === 'undefined') {
      issues.push('IndexedDB non supporté');
      recommendations.push('Utiliser le stockage fichiers');
    }
    
    // Vérifier l'espace disponible
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then((estimate) => {
        const available = (estimate.quota || 0) - (estimate.usage || 0);
        if (available < this.config.storage.maxSize * 1024 * 1024) {
          issues.push('Espace de stockage insuffisant');
          recommendations.push('Réduire la taille du cache ou augmenter l\'espace disponible');
        }
      });
    }
    
    return {
      compatible: issues.length === 0,
      issues,
      recommendations,
    };
  }
}

/**
 * Instance par défaut du service
 */
export const localModeService = new LocalModeService();

/**
 * Hooks React pour le mode local
 */
export const useLocalMode = () => {
  return {
    config: localModeService.getConfig(),
    isLocalMode: localModeService.isLocalMode(),
    isSupabaseEnabled: localModeService.isSupabaseEnabled(),
    switchToLocalMode: () => localModeService.switchToLocalMode(),
    switchToHybridMode: () => localModeService.switchToHybridMode(),
    switchToExternalMode: () => localModeService.switchToExternalMode(),
    checkCompatibility: () => localModeService.checkLocalCompatibility(),
  };
};