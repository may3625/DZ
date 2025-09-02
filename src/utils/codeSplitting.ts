/**
 * Code Splitting par section pour l'application algérienne
 * Chargement optimisé des composants selon les besoins utilisateur
 */

import { lazy, ComponentType } from 'react';

// Types pour les sections de l'application
export type AppSection = 
  | 'home'
  | 'legal-texts'
  | 'ocr'
  | 'analytics'
  | 'admin'
  | 'profile'
  | 'settings'
  | 'tests'
  | 'help';

interface SectionConfig {
  component: () => Promise<{ default: ComponentType<any> }>;
  preload?: boolean;
  dependencies?: AppSection[];
  priority: 'high' | 'medium' | 'low';
  estimatedSize: 'small' | 'medium' | 'large';
}

// Configuration des sections avec lazy loading
const SECTION_CONFIGS: Record<AppSection, SectionConfig> = {
  home: {
    component: () => import('@/components/sections/HomeSection'),
    preload: true,
    priority: 'high',
    estimatedSize: 'medium'
  },
  
  'legal-texts': {
    component: () => import('@/components/sections/LegalTextsSection'),
    priority: 'high',
    estimatedSize: 'large',
    dependencies: ['analytics']
  },
  
  ocr: {
    component: () => import('@/components/sections/OCRSection'),
    priority: 'medium',
    estimatedSize: 'large'
  },
  
  analytics: {
    component: () => import('@/components/sections/AnalyticsSection'),
    priority: 'medium',
    estimatedSize: 'medium'
  },
  
  admin: {
    component: () => import('@/components/admin/AdminDashboard'),
    priority: 'low',
    estimatedSize: 'large'
  },
  
  profile: {
    component: () => import('@/components/profile/UserProfile'),
    priority: 'medium',
    estimatedSize: 'small'
  },
  
  settings: {
    component: () => import('@/components/settings/SettingsPanel'),
    priority: 'medium',
    estimatedSize: 'medium'
  },
  
  tests: {
    component: () => import('@/components/tests/TestingSuite'),
    priority: 'low',
    estimatedSize: 'medium'
  },
  
  help: {
    component: () => import('@/components/help/HelpCenter'),
    priority: 'low',
    estimatedSize: 'small'
  }
};

// Cache des composants chargés
const componentCache = new Map<AppSection, ComponentType<any>>();
const loadingPromises = new Map<AppSection, Promise<ComponentType<any>>>();

class CodeSplittingManager {
  private preloadedSections = new Set<AppSection>();
  private loadingQueue: AppSection[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.initializePreloading();
    this.setupIntersectionObserver();
  }

  private initializePreloading(): void {
    // Précharger les sections prioritaires
    Object.entries(SECTION_CONFIGS).forEach(([section, config]) => {
      if (config.preload) {
        this.preloadSection(section as AppSection);
      }
    });
  }

  private setupIntersectionObserver(): void {
    // Observer pour le préchargement intelligent basé sur la navigation
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const section = entry.target.getAttribute('data-section') as AppSection;
              if (section && !this.preloadedSections.has(section)) {
                this.preloadSection(section);
              }
            }
          });
        },
        { rootMargin: '100px' }
      );

      // Observer les éléments de navigation
      setTimeout(() => {
        document.querySelectorAll('[data-section]').forEach((el) => {
          observer.observe(el);
        });
      }, 1000);
    }
  }

  async loadSection(section: AppSection): Promise<ComponentType<any>> {
    // Vérifier le cache
    const cached = componentCache.get(section);
    if (cached) {
      return cached;
    }

    // Vérifier si déjà en cours de chargement
    const existingPromise = loadingPromises.get(section);
    if (existingPromise) {
      return existingPromise;
    }

    // Charger les dépendances d'abord
    const config = SECTION_CONFIGS[section];
    if (config.dependencies) {
      await Promise.all(
        config.dependencies.map(dep => this.loadSection(dep))
      );
    }

    // Charger le composant
    const promise = this.loadComponent(section);
    loadingPromises.set(section, promise);

    try {
      const component = await promise;
      componentCache.set(section, component);
      loadingPromises.delete(section);
      return component;
    } catch (error) {
      loadingPromises.delete(section);
      throw error;
    }
  }

  private async loadComponent(section: AppSection): Promise<ComponentType<any>> {
    const config = SECTION_CONFIGS[section];
    
    try {
      console.log(`[CodeSplitting] Chargement de la section: ${section}`);
      const start = performance.now();
      
      const module = await config.component();
      
      const loadTime = performance.now() - start;
      console.log(`[CodeSplitting] Section ${section} chargée en ${loadTime.toFixed(2)}ms`);
      
      return module.default;
    } catch (error) {
      console.error(`[CodeSplitting] Erreur lors du chargement de ${section}:`, error);
      throw new Error(`Impossible de charger la section ${section}`);
    }
  }

  preloadSection(section: AppSection): void {
    if (this.preloadedSections.has(section)) {
      return;
    }

    this.preloadedSections.add(section);
    this.loadingQueue.push(section);
    
    if (!this.isProcessingQueue) {
      this.processPreloadQueue();
    }
  }

  private async processPreloadQueue(): Promise<void> {
    if (this.isProcessingQueue || this.loadingQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    // Trier par priorité
    this.loadingQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const configA = SECTION_CONFIGS[a];
      const configB = SECTION_CONFIGS[b];
      return priorityOrder[configB.priority] - priorityOrder[configA.priority];
    });

    while (this.loadingQueue.length > 0) {
      const section = this.loadingQueue.shift()!;
      
      try {
        // Attendre que le navigateur soit inactif
        if ('requestIdleCallback' in window) {
          await new Promise(resolve => 
            (window as any).requestIdleCallback(resolve, { timeout: 2000 })
          );
        } else {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        await this.loadSection(section);
        console.log(`[CodeSplitting] Section ${section} préchargée`);

      } catch (error) {
        console.error(`[CodeSplitting] Erreur de préchargement pour ${section}:`, error);
      }
    }

    this.isProcessingQueue = false;
  }

  // Précharger les sections liées à la section actuelle
  preloadRelatedSections(currentSection: AppSection): void {
    const config = SECTION_CONFIGS[currentSection];
    
    // Précharger les dépendances
    if (config.dependencies) {
      config.dependencies.forEach(dep => this.preloadSection(dep));
    }

    // Précharger les sections souvent utilisées ensemble
    const relatedSections = this.getRelatedSections(currentSection);
    relatedSections.forEach(section => this.preloadSection(section));
  }

  private getRelatedSections(section: AppSection): AppSection[] {
    const relationships: Record<AppSection, AppSection[]> = {
      'legal-texts': ['analytics', 'ocr'],
      'ocr': ['legal-texts'],
      'analytics': ['legal-texts'],
      'admin': ['settings', 'tests'],
      'profile': ['settings'],
      'settings': ['help'],
      'home': ['legal-texts', 'analytics'],
      'tests': ['admin'],
      'help': []
    };

    return relationships[section] || [];
  }

  // Créer un composant lazy avec fallback
  createLazyComponent(section: AppSection) {
    return lazy(async () => {
      const component = await this.loadSection(section);
      return { default: component };
    });
  }

  // Obtenir des statistiques de performance
  getPerformanceStats(): {
    loadedSections: number;
    cachedSections: AppSection[];
    preloadedSections: AppSection[];
    queueLength: number;
  } {
    return {
      loadedSections: componentCache.size,
      cachedSections: Array.from(componentCache.keys()),
      preloadedSections: Array.from(this.preloadedSections),
      queueLength: this.loadingQueue.length
    };
  }

  // Nettoyer le cache pour libérer la mémoire
  clearCache(sections?: AppSection[]): void {
    if (sections) {
      sections.forEach(section => {
        componentCache.delete(section);
        this.preloadedSections.delete(section);
      });
    } else {
      componentCache.clear();
      this.preloadedSections.clear();
    }
  }
}

// Instance globale du gestionnaire
export const codeSplittingManager = new CodeSplittingManager();

// Hook pour utiliser le code splitting
export function useLazySection(section: AppSection) {
  return codeSplittingManager.createLazyComponent(section);
}

// Utilitaire pour précharger manuellement
export function preloadSection(section: AppSection): void {
  codeSplittingManager.preloadSection(section);
}

// Utilitaire pour précharger les sections liées
export function preloadRelatedSections(currentSection: AppSection): void {
  codeSplittingManager.preloadRelatedSections(currentSection);
}