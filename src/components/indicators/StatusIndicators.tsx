/**
 * Indicateurs de statut pour le mode local
 * Phase 4.1 - Indicateurs de statut complets
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, Database, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { offlineSyncManager } from '@/services/OfflineSyncManager';
import { indexedDBManager } from '@/services/IndexedDBManager';
import { useLocalMode } from '@/hooks/useLocalMode';

interface StatusIndicatorsProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  compact?: boolean;
}

export function StatusIndicators({ position = 'top-right', compact = false }: StatusIndicatorsProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState(offlineSyncManager.getStatus());
  const [dbStats, setDbStats] = useState<any>(null);
  const { isLocalMode } = useLocalMode();

  useEffect(() => {
    // Écouter les changements de statut réseau
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Mettre à jour les statuts périodiquement
    const interval = setInterval(async () => {
      setSyncStatus(offlineSyncManager.getStatus());
      try {
        const stats = await indexedDBManager.getStats();
        setDbStats(stats);
      } catch (error) {
        console.warn('Erreur lors de la récupération des stats DB:', error);
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4'
  };

  if (compact) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50 flex gap-1`}>
        {/* Indicateur de connexion */}
        <div className={`w-3 h-3 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`} title={isOnline ? 'En ligne' : 'Hors ligne'} />
        
        {/* Indicateur de synchronisation */}
        {syncStatus.queueLength > 0 && (
          <div className={`w-3 h-3 rounded-full ${
            syncStatus.isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-yellow-500'
          }`} title={`${syncStatus.queueLength} opérations en attente`} />
        )}
        
        {/* Indicateur de stockage local */}
        {isLocalMode && (
          <div className="w-3 h-3 rounded-full bg-purple-500" title="Mode local actif" />
        )}
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 max-w-xs`}>
      <div className="space-y-2">
        {/* Statut de connexion */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-600" />
          )}
          <span className="text-sm font-medium">
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </span>
        </div>

        {/* Statut de synchronisation */}
        {syncStatus.queueLength > 0 && (
          <div className="flex items-center gap-2">
            {syncStatus.isSyncing ? (
              <Cloud className="w-4 h-4 text-blue-600 animate-spin" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-600" />
            )}
            <span className="text-sm">
              {syncStatus.isSyncing ? 'Synchronisation...' : `${syncStatus.queueLength} en attente`}
            </span>
          </div>
        )}

        {/* Statut du stockage local */}
        {dbStats && (
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-600" />
            <span className="text-sm">
              {Math.round(dbStats.totalSize / 1024 / 1024 * 100) / 100} MB stockés
            </span>
          </div>
        )}

        {/* Mode local */}
        {isLocalMode && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">Mode local</span>
          </div>
        )}

        {/* Alertes */}
        {!isOnline && syncStatus.queueLength > 0 && (
          <div className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">
              Synchronisation différée
            </span>
          </div>
        )}
      </div>
    </div>
  );
}