/**
 * Chargeur de composants lazy optimisé
 * Phase 4.2 - Optimisation lazy loading
 */

import React, { Suspense, lazy, ComponentType, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { performanceMonitor } from '@/utils/performanceMonitor';

interface LazyComponentLoaderProps {
  loader: () => Promise<{ default: ComponentType<any> }>;
  componentName: string;
  fallback?: React.ReactNode;
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
  props?: any;
}

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  loadTime: number | null;
}

const DEFAULT_FALLBACK = (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-6 h-6 animate-spin text-primary" />
    <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
  </div>
);

export function LazyComponentLoader({
  loader,
  componentName,
  fallback = DEFAULT_FALLBACK,
  preload = false,
  priority = 'medium',
  props = {}
}: LazyComponentLoaderProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    loadTime: null
  });

  const [LazyComponent, setLazyComponent] = useState<ComponentType<any> | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadComponent = async () => {
      if (LazyComponent) return;

      setLoadingState(prev => ({ ...prev, isLoading: true, error: null }));
      const startTime = performance.now();

      try {
        const module = await loader();
        const loadTime = performance.now() - startTime;

        if (mounted) {
          setLazyComponent(() => module.default);
          setLoadingState({
            isLoading: false,
            error: null,
            loadTime
          });

          // Rapporter les métriques de performance
          performanceMonitor.trackLazyComponentLoad(componentName, loadTime);
        }
      } catch (error) {
        if (mounted) {
          setLoadingState({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Erreur de chargement',
            loadTime: null
          });
        }
      }
    };

    // Préchargement conditionnel
    if (preload) {
      // Délai basé sur la priorité
      const delays = { high: 0, medium: 100, low: 500 };
      setTimeout(loadComponent, delays[priority]);
    }

    return () => {
      mounted = false;
    };
  }, [loader, componentName, preload, priority, LazyComponent]);

  // Chargement à la demande lors du rendu
  useEffect(() => {
    if (!LazyComponent && !loadingState.isLoading && !preload) {
      const loadComponent = async () => {
        setLoadingState(prev => ({ ...prev, isLoading: true, error: null }));
        const startTime = performance.now();

        try {
          const module = await loader();
          const loadTime = performance.now() - startTime;

          setLazyComponent(() => module.default);
          setLoadingState({
            isLoading: false,
            error: null,
            loadTime
          });

          performanceMonitor.trackLazyComponentLoad(componentName, loadTime);
        } catch (error) {
          setLoadingState({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Erreur de chargement',
            loadTime: null
          });
        }
      };

      loadComponent();
    }
  }, [LazyComponent, loadingState.isLoading, preload, loader, componentName]);

  if (loadingState.error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 mb-2">Erreur de chargement</div>
        <div className="text-sm text-muted-foreground mb-4">{loadingState.error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Recharger
        </button>
      </div>
    );
  }

  if (!LazyComponent || loadingState.isLoading) {
    return <>{fallback}</>;
  }

  return <LazyComponent {...props} />;
}

// Hook pour créer des composants lazy avec optimisations
export function useLazyComponent<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  componentName: string,
  options?: {
    preload?: boolean;
    priority?: 'high' | 'medium' | 'low';
  }
) {
  const LazyComponent = lazy(loader);

  const WrappedComponent = React.forwardRef<any, any>((props, ref) => (
    <Suspense fallback={DEFAULT_FALLBACK}>
      <LazyComponentLoader
        loader={loader}
        componentName={componentName}
        preload={options?.preload}
        priority={options?.priority}
        props={{ ...props, ref }}
      />
    </Suspense>
  ));

  WrappedComponent.displayName = `Lazy(${componentName})`;

  return WrappedComponent;
}

// Utilitaires pour le préchargement intelligent
export class PreloadManager {
  private static preloadedComponents = new Set<string>();
  private static preloadQueue: Array<{
    loader: () => Promise<any>;
    componentName: string;
    priority: number;
  }> = [];

  static addToPreloadQueue(
    loader: () => Promise<any>,
    componentName: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) {
    if (this.preloadedComponents.has(componentName)) return;

    const priorityMap = { high: 3, medium: 2, low: 1 };
    this.preloadQueue.push({
      loader,
      componentName,
      priority: priorityMap[priority]
    });

    this.preloadQueue.sort((a, b) => b.priority - a.priority);
    this.processQueue();
  }

  private static async processQueue() {
    if (this.preloadQueue.length === 0) return;

    const { loader, componentName } = this.preloadQueue.shift()!;
    
    try {
      await loader();
      this.preloadedComponents.add(componentName);
    } catch (error) {
      console.warn(`Échec du préchargement de ${componentName}:`, error);
    }

    // Traiter le prochain avec un petit délai
    setTimeout(() => this.processQueue(), 100);
  }

  static preloadByRoute(route: string) {
    const routeComponentMap: Record<string, string[]> = {
      '/': ['Dashboard', 'RecentDocuments'],
      '/legal-texts': ['LegalTextsList', 'LegalTextFilters'],
      '/ocr': ['OCRProcessor', 'DocumentUploader'],
      '/configuration': ['ConfigurationPanel', 'UserSettings']
    };

    const components = routeComponentMap[route] || [];
    components.forEach(componentName => {
      // Logique de mapping des composants à précharger
      // À adapter selon votre architecture
    });
  }
}