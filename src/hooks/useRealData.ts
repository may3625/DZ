import { useState, useEffect, useCallback } from 'react';
import { 
  SavedSearchService, 
  AnalyticsService,
  SavedSearch
} from '@/services/dataService';
import { RealOCRDataService, RealOCRExtraction } from '@/services/realOCRDataService';
import { RealOCRResult } from '@/services/realOcrService';

// Hook pour les recherches sauvegardées
export function useSavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSearches = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SavedSearchService.getAllSavedSearches();
      setSearches(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSearch = useCallback(async (searchData: {
    title: string;
    query: string;
    category: string;
    filters: string[];
    description: string;
    results_count: number;
  }) => {
    try {
      const newSearch = await SavedSearchService.saveSearch(searchData);
      if (newSearch) {
        setSearches(prev => [newSearch, ...prev]);
        return newSearch;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde');
      return null;
    }
  }, []);

  const deleteSearch = useCallback(async (searchId: string) => {
    try {
      const success = await SavedSearchService.deleteSearch(searchId);
      if (success) {
        setSearches(prev => prev.filter(s => s.id !== searchId));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de suppression');
      return false;
    }
  }, []);

  const updateLastAccessed = useCallback(async (searchId: string) => {
    try {
      await SavedSearchService.updateLastAccessed(searchId);
      // Mettre à jour localement
      setSearches(prev => prev.map(s => 
        s.id === searchId 
          ? { ...s, lastAccessed: 'Maintenant' }
          : s
      ));
    } catch (err) {
      console.error('Erreur mise à jour accès:', err);
    }
  }, []);

  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  return {
    searches,
    loading,
    error,
    saveSearch,
    deleteSearch,
    updateLastAccessed,
    reload: loadSearches
  };
}

// Hook pour les extractions OCR réelles
export function useOCRExtractions() {
  const [extractions, setExtractions] = useState<RealOCRExtraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExtractions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await RealOCRDataService.getAllOCRExtractions();
      setExtractions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveOCRResult = useCallback(async (filename: string, ocrResult: RealOCRResult) => {
    try {
      const savedExtraction = await RealOCRDataService.saveOCRExtraction(filename, ocrResult);
      if (savedExtraction) {
        setExtractions(prev => [savedExtraction, ...prev]);
        return savedExtraction;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde OCR');
      return null;
    }
  }, []);

  const searchExtractions = useCallback(async (query: string) => {
    try {
      const results = await RealOCRDataService.searchOCRExtractions(query);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de recherche');
      return [];
    }
  }, []);

  const deleteExtraction = useCallback(async (extractionId: string) => {
    try {
      const success = await RealOCRDataService.deleteOCRExtraction(extractionId);
      if (success) {
        setExtractions(prev => prev.filter(e => e.id !== extractionId));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de suppression');
      return false;
    }
  }, []);

  const getExtractionById = useCallback(async (id: string) => {
    try {
      return await RealOCRDataService.getOCRExtractionById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de récupération');
      return null;
    }
  }, []);

  useEffect(() => {
    loadExtractions();
  }, [loadExtractions]);

  return {
    extractions,
    loading,
    error,
    saveOCRResult,
    searchExtractions,
    deleteExtraction,
    getExtractionById,
    reload: loadExtractions
  };
}

// Hook pour les statistiques
export function useAnalytics() {
  const [stats, setStats] = useState({
    general: {
      savedSearches: 0,
      ocrExtractions: 0,
      legalTexts: 0,
      procedures: 0
    },
    ocr: {
      averageConfidence: 0,
      averageProcessingTime: 0,
      languageDistribution: {},
      documentTypeDistribution: {},
      totalProcessed: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const [generalStats, ocrStats] = await Promise.all([
        AnalyticsService.getGeneralStats(),
        RealOCRDataService.getRealOCRStats()
      ]);

      setStats({
        general: generalStats,
        ocr: ocrStats
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    reload: loadStats
  };
}

// Hook combiné pour toutes les données réelles
export function useRealData() {
  const savedSearches = useSavedSearches();
  const ocrExtractions = useOCRExtractions();
  const analytics = useAnalytics();

  const isLoading = savedSearches.loading || ocrExtractions.loading || analytics.loading;
  const hasError = savedSearches.error || ocrExtractions.error || analytics.error;

  const reloadAll = useCallback(async () => {
    await Promise.all([
      savedSearches.reload(),
      ocrExtractions.reload(),
      analytics.reload()
    ]);
  }, [savedSearches, ocrExtractions, analytics]);

  return {
    savedSearches,
    ocrExtractions,
    analytics,
    isLoading,
    hasError,
    reloadAll
  };
}