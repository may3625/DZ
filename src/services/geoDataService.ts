import { useState, useCallback } from 'react';

/**
 * Service pour la gestion optimisée des données géographiques
 * Permet le chargement à la demande et la mise en cache des données
 */

interface WilayaData {
  id: string;
  name: string;
  geometry: any;
  properties: any;
}

class GeoDataService {
  private cache = new Map<string, any>();
  private simplifiedData: any = null;
  private fullData: any = null;

  /**
   * Charge les données géographiques simplifiées (version légère)
   */
  async loadSimplifiedData(): Promise<any> {
    if (this.simplifiedData) {
      return this.simplifiedData;
    }

    try {
      const response = await fetch('/algeria-wilayas-simplified.geo.json');
      this.simplifiedData = await response.json();
      return this.simplifiedData;
    } catch (error) {
      console.error('Erreur lors du chargement des données géographiques simplifiées:', error);
      throw error;
    }
  }

  /**
   * Charge les données géographiques complètes (version détaillée)
   */
  async loadFullData(): Promise<any> {
    if (this.fullData) {
      return this.fullData;
    }

    try {
      const response = await fetch('/algeria-wilayas-boundaries.geo.json');
      this.fullData = await response.json();
      return this.fullData;
    } catch (error) {
      console.error('Erreur lors du chargement des données géographiques complètes:', error);
      throw error;
    }
  }

  /**
   * Charge les données d'une wilaya spécifique
   */
  async loadWilayaData(wilayaId: string, useSimplified: boolean = true): Promise<WilayaData | null> {
    const cacheKey = `${wilayaId}-${useSimplified}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const data = useSimplified ? await this.loadSimplifiedData() : await this.loadFullData();
      const wilaya = data.features.find((feature: any) => 
        feature.properties.id === wilayaId || 
        feature.properties.name === wilayaId ||
        feature.properties.code === wilayaId
      );

      if (wilaya) {
        const wilayaData: WilayaData = {
          id: wilaya.properties.id || wilaya.properties.code,
          name: wilaya.properties.name,
          geometry: wilaya.geometry,
          properties: wilaya.properties
        };

        this.cache.set(cacheKey, wilayaData);
        return wilayaData;
      }

      return null;
    } catch (error) {
      console.error(`Erreur lors du chargement des données pour la wilaya ${wilayaId}:`, error);
      return null;
    }
  }

  /**
   * Charge plusieurs wilayas en parallèle
   */
  async loadMultipleWilayas(wilayaIds: string[], useSimplified: boolean = true): Promise<WilayaData[]> {
    const promises = wilayaIds.map(id => this.loadWilayaData(id, useSimplified));
    const results = await Promise.all(promises);
    return results.filter((result): result is WilayaData => result !== null);
  }

  /**
   * Précache les données pour une meilleure performance
   */
  async preloadData(useSimplified: boolean = true): Promise<void> {
    try {
      if (useSimplified) {
        await this.loadSimplifiedData();
      } else {
        await this.loadFullData();
      }
    } catch (error) {
      console.error('Erreur lors du préchargement des données:', error);
    }
  }

  /**
   * Nettoie le cache pour libérer la mémoire
   */
  clearCache(): void {
    this.cache.clear();
    this.simplifiedData = null;
    this.fullData = null;
  }

  /**
   * Obtient la taille du cache
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Vérifie si les données sont déjà chargées
   */
  isDataLoaded(useSimplified: boolean = true): boolean {
    return useSimplified ? !!this.simplifiedData : !!this.fullData;
  }
}

// Instance singleton
export const geoDataService = new GeoDataService();

// Hook React pour utiliser le service
export const useGeoData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWilaya = useCallback(async (wilayaId: string, useSimplified: boolean = true) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await geoDataService.loadWilayaData(wilayaId, useSimplified);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setLoading(false);
      return null;
    }
  }, []);

  const preloadData = useCallback(async (useSimplified: boolean = true) => {
    setLoading(true);
    setError(null);
    
    try {
      await geoDataService.preloadData(useSimplified);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setLoading(false);
    }
  }, []);

  return {
    loadWilaya,
    preloadData,
    loading,
    error,
    isDataLoaded: geoDataService.isDataLoaded.bind(geoDataService),
    clearCache: geoDataService.clearCache.bind(geoDataService)
  };
};

export default geoDataService;