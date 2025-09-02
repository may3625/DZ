import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  HardDrive, 
  Trash2, 
  RefreshCw, 
  Activity,
  Clock,
  FileText,
  Zap
} from 'lucide-react';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { AlgerianText } from '@/components/algerian/AlgerianText';

interface CacheEntry {
  key: string;
  size: number;
  lastAccessed: Date;
  type: 'legal' | 'procedure' | 'ocr' | 'user';
  hitCount: number;
}

interface CacheStats {
  totalSize: number;
  totalEntries: number;
  hitRate: number;
  types: Record<string, number>;
}

/**
 * Phase 4 du plan d'action - Gestionnaire de cache intelligent
 * Cache optimisé pour le mode local avec métriques de performance
 */
export function IntelligentCacheManager() {
  const { t, isRTL, formatNumber } = useAlgerianI18n();
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [stats, setStats] = useState<CacheStats>({
    totalSize: 0,
    totalEntries: 0,
    hitRate: 0,
    types: {}
  });
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    loadCacheData();
  }, []);

  const loadCacheData = async () => {
    try {
      // Simuler le chargement des données de cache
      const mockEntries: CacheEntry[] = [
        {
          key: 'legal_texts_search_results',
          size: 1024 * 150,
          lastAccessed: new Date(Date.now() - 1000 * 60 * 30),
          type: 'legal',
          hitCount: 45
        },
        {
          key: 'procedure_forms_templates',
          size: 1024 * 200,
          lastAccessed: new Date(Date.now() - 1000 * 60 * 10),
          type: 'procedure',
          hitCount: 78
        },
        {
          key: 'ocr_extracted_data',
          size: 1024 * 300,
          lastAccessed: new Date(Date.now() - 1000 * 60 * 5),
          type: 'ocr',
          hitCount: 23
        },
        {
          key: 'user_preferences',
          size: 1024 * 5,
          lastAccessed: new Date(Date.now() - 1000 * 60 * 1),
          type: 'user',
          hitCount: 156
        }
      ];

      setCacheEntries(mockEntries);

      const totalSize = mockEntries.reduce((sum, entry) => sum + entry.size, 0);
      const totalHits = mockEntries.reduce((sum, entry) => sum + entry.hitCount, 0);
      const types = mockEntries.reduce((acc, entry) => {
        acc[entry.type] = (acc[entry.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setStats({
        totalSize,
        totalEntries: mockEntries.length,
        hitRate: totalHits > 0 ? (totalHits / (totalHits + 20)) * 100 : 0,
        types
      });
    } catch (error) {
      console.error('Erreur chargement cache:', error);
    }
  };

  const optimizeCache = async () => {
    setIsOptimizing(true);
    try {
      // Simuler l'optimisation du cache
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Supprimer les entrées anciennes et peu utilisées
      const optimizedEntries = cacheEntries.filter(entry => 
        entry.hitCount > 10 && 
        (Date.now() - entry.lastAccessed.getTime()) < 24 * 60 * 60 * 1000
      );
      
      setCacheEntries(optimizedEntries);
      await loadCacheData();
    } finally {
      setIsOptimizing(false);
    }
  };

  const clearCacheByType = async (type: string) => {
    const filtered = cacheEntries.filter(entry => entry.type !== type);
    setCacheEntries(filtered);
    await loadCacheData();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'legal': return 'bg-blue-500';
      case 'procedure': return 'bg-green-500';
      case 'ocr': return 'bg-purple-500';
      case 'user': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'legal': return t('legal.title') || 'Juridique';
      case 'procedure': return t('procedures.title') || 'Procédures';
      case 'ocr': return t('ocr.title') || 'OCR';
      case 'user': return 'Utilisateur';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AlgerianText variant="heading" className="text-2xl font-bold">
          {t('cache.title') || 'Gestionnaire de Cache Intelligent'}
        </AlgerianText>
        <Button 
          onClick={optimizeCache}
          disabled={isOptimizing}
          className="gap-2"
        >
          {isOptimizing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {isOptimizing ? 'Optimisation...' : 'Optimiser'}
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Taille totale</p>
                <p className="text-lg font-semibold">{formatBytes(stats.totalSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Entrées</p>
                <p className="text-lg font-semibold">{formatNumber(stats.totalEntries)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Taux de succès</p>
                <p className="text-lg font-semibold">{stats.hitRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <HardDrive className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Utilisation</p>
                <Progress value={(stats.totalSize / (10 * 1024 * 1024)) * 100} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Répartition par type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.types).map(([type, count]) => (
              <div key={type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{getTypeLabel(type)}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getTypeColor(type)}`} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearCacheByType(type)}
                    className="text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Vider
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste détaillée des entrées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Entrées de cache détaillées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cacheEntries.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getTypeColor(entry.type)}`} />
                  <div>
                    <p className="font-medium">{entry.key}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatBytes(entry.size)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {entry.lastAccessed.toLocaleTimeString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {entry.hitCount} accès
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline">{getTypeLabel(entry.type)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}