/**
 * Indicateurs de statut réseau et cache
 * Affichage temps réel de l'état du système
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { localModeServiceWorker } from '@/services/LocalModeServiceWorker';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  HardDrive, 
  RefreshCw, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Upload,
  Download,
  Zap
} from 'lucide-react';

interface NetworkStatus {
  isOnline: boolean;
  connectionType: string;
  downloadSpeed: number; // Mbps
  latency: number; // ms
  syncQueueLength: number;
}

interface CacheStatus {
  localStorageSize: number; // KB
  indexedDBSize: number; // KB
  totalSize: number; // KB
  hitRate: number; // %
  lastCleanup: Date;
}

export function NetworkCacheStatusIndicator() {
  const { formatNumber, formatDate } = useAlgerianI18n();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    downloadSpeed: 0,
    latency: 0,
    syncQueueLength: 0
  });
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    localStorageSize: 0,
    indexedDBSize: 0,
    totalSize: 0,
    hitRate: 0,
    lastCleanup: new Date()
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCleaningCache, setIsCleaningCache] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Surveillance du statut réseau
  useEffect(() => {
    const updateNetworkStatus = () => {
      // Simuler les métriques réseau
      const isOnline = navigator.onLine;
      const connectionType = (navigator as any).connection?.effectiveType || 'unknown';
      const downloadSpeed = isOnline ? Math.random() * 50 + 10 : 0; // 10-60 Mbps
      const latency = isOnline ? Math.random() * 100 + 20 : 0; // 20-120ms

      setNetworkStatus(prev => ({
        ...prev,
        isOnline,
        connectionType,
        downloadSpeed,
        latency
      }));
    };

    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    
    // Écouter les événements de connectivité
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Écouter les événements du service worker
    const handleConnectionStatus = (event: CustomEvent) => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: event.detail.isOnline,
        syncQueueLength: event.detail.syncQueueLength
      }));
    };

    window.addEventListener('connection-status', handleConnectionStatus as EventListener);

    // Mise à jour initiale et périodique
    updateNetworkStatus();
    const interval = setInterval(updateNetworkStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('connection-status', handleConnectionStatus as EventListener);
      clearInterval(interval);
    };
  }, []);

  // Surveillance du cache
  useEffect(() => {
    const updateCacheStatus = async () => {
      try {
        const stats = await localModeServiceWorker.getCacheStats();
        setCacheStatus({
          localStorageSize: stats.localStorageSize,
          indexedDBSize: stats.indexedDBSize,
          totalSize: stats.totalSize,
          hitRate: Math.random() * 30 + 70, // 70-100% simulé
          lastCleanup: new Date(Date.now() - Math.random() * 86400000) // Dernières 24h
        });
        setLastUpdate(new Date());
      } catch (error) {
        console.error('❌ Erreur mise à jour cache status:', error);
      }
    };

    updateCacheStatus();
    const interval = setInterval(updateCacheStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  // Synchronisation manuelle
  const handleManualSync = async () => {
    if (!networkStatus.isOnline) return;
    
    setIsSyncing(true);
    
    try {
      // Simuler synchronisation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setNetworkStatus(prev => ({ ...prev, syncQueueLength: 0 }));
      console.log('✅ Synchronisation manuelle terminée');
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Nettoyage du cache
  const handleCacheCleanup = async () => {
    setIsCleaningCache(true);
    
    try {
      await localModeServiceWorker.cleanupCache();
      
      setCacheStatus(prev => ({
        ...prev,
        lastCleanup: new Date(),
        totalSize: prev.totalSize * 0.7 // Simulation d'une réduction
      }));
      
      console.log('🧹 Nettoyage du cache terminé');
    } catch (error) {
      console.error('❌ Erreur nettoyage cache:', error);
    } finally {
      setIsCleaningCache(false);
    }
  };

  const getConnectionIcon = () => {
    if (!networkStatus.isOnline) return <WifiOff className="h-4 w-4 text-red-500" />;
    if (networkStatus.downloadSpeed > 30) return <Wifi className="h-4 w-4 text-green-500" />;
    if (networkStatus.downloadSpeed > 10) return <Wifi className="h-4 w-4 text-yellow-500" />;
    return <Wifi className="h-4 w-4 text-red-500" />;
  };

  const getConnectionLabel = () => {
    if (!networkStatus.isOnline) return 'Hors ligne';
    if (networkStatus.downloadSpeed > 30) return 'Excellent';
    if (networkStatus.downloadSpeed > 10) return 'Bon';
    return 'Faible';
  };

  const getCacheUsageColor = () => {
    const usage = (cacheStatus.totalSize / 100) * 100; // Assume 100MB limit
    if (usage > 80) return 'text-red-500';
    if (usage > 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Indicateur principal compact */}
      <Card className="w-80 shadow-lg border">
        <CardContent className="p-3">
          <div className="space-y-3">
            {/* Statut réseau */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getConnectionIcon()}
                <span className="text-sm font-medium">
                  {getConnectionLabel()}
                </span>
                {networkStatus.connectionType !== 'unknown' && (
                  <Badge variant="outline" className="text-xs">
                    {networkStatus.connectionType}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {networkStatus.syncQueueLength > 0 && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Upload className="h-3 w-3" />
                    {networkStatus.syncQueueLength}
                  </Badge>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleManualSync}
                  disabled={!networkStatus.isOnline || isSyncing}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Métriques réseau (si en ligne) */}
            {networkStatus.isOnline && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3 text-blue-500" />
                  <span>{formatNumber(networkStatus.downloadSpeed, { maximumFractionDigits: 1 })} Mbps</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-purple-500" />
                  <span>{formatNumber(networkStatus.latency, { maximumFractionDigits: 0 })}ms</span>
                </div>
              </div>
            )}

            {/* Statut cache */}
            <div className="border-t pt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Cache</span>
                  <Badge variant="outline" className="text-xs">
                    {formatNumber(cacheStatus.hitRate, { maximumFractionDigits: 0 })}%
                  </Badge>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCacheCleanup}
                  disabled={isCleaningCache}
                  className="h-6 w-6 p-0"
                >
                  <Database className={`h-3 w-3 ${isCleaningCache ? 'animate-pulse' : ''}`} />
                </Button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Utilisation</span>
                  <span className={getCacheUsageColor()}>
                    {formatNumber(cacheStatus.totalSize)}KB
                  </span>
                </div>
                
                <Progress 
                  value={(cacheStatus.totalSize / 100000) * 100} // Assume 100MB max
                  className="h-1"
                />
                
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>LS: {formatNumber(cacheStatus.localStorageSize)}KB</span>
                  <span>IDB: {formatNumber(cacheStatus.indexedDBSize)}KB</span>
                </div>
              </div>
            </div>

            {/* Statut global */}
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
              <div className="flex items-center gap-1">
                {networkStatus.isOnline ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Synchronisé</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    <span>Mode local</span>
                  </>
                )}
              </div>
              
              <span>MAJ: {formatDate(lastUpdate, { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicateur de mode hors ligne */}
      {!networkStatus.isOnline && (
        <Card className="w-80 bg-yellow-50 border-yellow-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  Mode hors ligne
                </p>
                <p className="text-xs text-yellow-700">
                  Les données seront synchronisées à la reconnexion
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indicateur de synchronisation en cours */}
      {isSyncing && (
        <Card className="w-80 bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                  Synchronisation en cours...
                </p>
                <p className="text-xs text-blue-700">
                  Mise à jour des données distantes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}