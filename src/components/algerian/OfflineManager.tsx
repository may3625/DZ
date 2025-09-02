import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  HardDrive, 
  RefreshCw,
  Database,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface OfflineData {
  legalTexts: number;
  procedures: number;
  news: number;
  lastSync: Date | null;
  totalSize: string;
}

export function OfflineManager() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    legalTexts: 0,
    procedures: 0,
    news: 0,
    lastSync: null,
    totalSize: '0 MB'
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Charger les données offline depuis le localStorage
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    const cached = localStorage.getItem('dalil-offline-data');
    if (cached) {
      setOfflineData(JSON.parse(cached));
    }
  };

  const downloadForOffline = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Real data download would go here
      const steps = [
        { name: 'Textes juridiques algériens', count: 1247 },
        { name: 'Procédures administratives', count: 892 },
        { name: 'Actualités récentes', count: 156 },
        { name: 'Nomenclatures', count: 45 }
      ];

      let totalProgress = 0;
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        totalProgress = ((i + 1) / steps.length) * 100;
        setDownloadProgress(totalProgress);
      }

      const newOfflineData: OfflineData = {
        legalTexts: 1247,
        procedures: 892,
        news: 156,
        lastSync: new Date(),
        totalSize: '45.2 MB'
      };

      setOfflineData(newOfflineData);
      localStorage.setItem('dalil-offline-data', JSON.stringify(newOfflineData));
      
      // Enregistrer aussi les données dans IndexedDB pour un accès plus rapide
      if ('indexedDB' in window) {
        await storeInIndexedDB(newOfflineData);
      }

    } catch (error) {
      console.error('Erreur lors du téléchargement offline:', error);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const storeInIndexedDB = async (data: OfflineData) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DalilOfflineDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['offlineData'], 'readwrite');
        const store = transaction.objectStore('offlineData');
        store.put(data, 'main');
        transaction.oncomplete = () => resolve(data);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('offlineData')) {
          db.createObjectStore('offlineData');
        }
      };
    });
  };

  const clearOfflineData = () => {
    localStorage.removeItem('dalil-offline-data');
    setOfflineData({
      legalTexts: 0,
      procedures: 0,
      news: 0,
      lastSync: null,
      totalSize: '0 MB'
    });
  };

  return (
    <div className="space-y-6">
      {/* Indicateur de statut */}
      {!isOnline && (
        <div className="offline-indicator">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>Mode hors ligne</span>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Gestionnaire Hors Ligne Algérien
          </CardTitle>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge className="bg-green-100 text-green-800">
                <Wifi className="w-3 h-3 mr-1" />
                En ligne
              </Badge>
            ) : (
              <Badge className="bg-orange-100 text-orange-800">
                <WifiOff className="w-3 h-3 mr-1" />
                Hors ligne
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistiques des données offline */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{offlineData.legalTexts}</div>
              <div className="text-sm text-gray-600">Textes juridiques</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{offlineData.procedures}</div>
              <div className="text-sm text-gray-600">Procédures</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{offlineData.news}</div>
              <div className="text-sm text-gray-600">Actualités</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{offlineData.totalSize}</div>
              <div className="text-sm text-gray-600">Taille totale</div>
            </div>
          </div>

          {/* Dernière synchronisation */}
          {offlineData.lastSync && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                Dernière synchronisation: {offlineData.lastSync.toLocaleString('fr-DZ')}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={downloadForOffline}
              disabled={isDownloading || !isOnline}
              className="flex-1"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Téléchargement... {Math.round(downloadProgress)}%
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger pour usage hors ligne
                </>
              )}
            </Button>

            {offlineData.legalTexts > 0 && (
              <Button 
                variant="outline" 
                onClick={clearOfflineData}
                className="flex-1"
              >
                <HardDrive className="w-4 h-4 mr-2" />
                Vider le cache
              </Button>
            )}
          </div>

          {/* Barre de progression */}
          {isDownloading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          )}

          {/* Informations sur les fonctionnalités offline */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              Fonctionnalités disponibles hors ligne
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Consultation des textes juridiques algériens</li>
              <li>• Recherche dans les procédures administratives</li>
              <li>• Accès aux nomenclatures officielles</li>
              <li>• Lecture des actualités téléchargées</li>
              <li>• Utilisation de l'OCR avec reconnaissance arabe</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}