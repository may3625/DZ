import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Database, 
  HardDrive, 
  Wifi, 
  WifiOff,
  Trash2,
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';

interface CacheItem {
  id: string;
  type: 'legal-text' | 'procedure' | 'translation' | 'image' | 'document';
  name: string;
  size: number;
  lastAccessed: Date;
  frequency: number;
  critical: boolean;
}

interface CacheStats {
  totalSize: number;
  availableSpace: number;
  itemCount: number;
  hitRate: number;
  lastSync: Date;
}

interface CacheSettings {
  autoCache: boolean;
  maxSize: number; // MB
  retentionDays: number;
  syncOnWifi: boolean;
  compressData: boolean;
  preloadCritical: boolean;
}

export function IntelligentCacheManager() {
  const { t, language, isRTL } = useAlgerianI18n();
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheItems, setCacheItems] = useState<CacheItem[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalSize: 45.7,
    availableSpace: 154.3,
    itemCount: 127,
    hitRate: 89.2,
    lastSync: new Date()
  });
  
  const [settings, setSettings] = useState<CacheSettings>({
    autoCache: true,
    maxSize: 200,
    retentionDays: 30,
    syncOnWifi: true,
    compressData: true,
    preloadCritical: true
  });

  const [isManaging, setIsManaging] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const translations = {
    fr: {
      title: "Gestionnaire de Cache Intelligent",
      description: "Optimisation automatique et gestion hors ligne",
      cacheStats: "Statistiques du cache",
      settings: "Paramètres",
      items: "Éléments",
      management: "Gestion",
      totalSize: "Taille totale",
      availableSpace: "Espace disponible", 
      itemCount: "Nombre d'éléments",
      hitRate: "Taux de succès",
      lastSync: "Dernière synchro",
      autoCache: "Cache automatique",
      maxSize: "Taille maximale",
      retentionDays: "Jours de rétention",
      syncOnWifi: "Sync sur WiFi seulement",
      compressData: "Compresser les données",
      preloadCritical: "Précharger éléments critiques",
      clearCache: "Vider le cache",
      syncNow: "Synchroniser",
      preloadData: "Précharger",
      managing: "Gestion en cours...",
      online: "En ligne",
      offline: "Hors ligne",
      critical: "Critique",
      recent: "Récent"
    },
    ar: {
      title: "مدير التخزين المؤقت الذكي",
      description: "التحسين التلقائي والإدارة بدون اتصال",
      cacheStats: "إحصائيات التخزين المؤقت",
      settings: "الإعدادات",
      items: "العناصر",
      management: "الإدارة",
      totalSize: "الحجم الإجمالي",
      availableSpace: "المساحة المتاحة",
      itemCount: "عدد العناصر",
      hitRate: "معدل النجاح",
      lastSync: "آخر مزامنة",
      autoCache: "التخزين المؤقت التلقائي",
      maxSize: "الحد الأقصى للحجم",
      retentionDays: "أيام الاحتفاظ",
      syncOnWifi: "المزامنة على WiFi فقط",
      compressData: "ضغط البيانات",
      preloadCritical: "تحميل مسبق للعناصر الحرجة",
      clearCache: "مسح التخزين المؤقت",
      syncNow: "مزامنة",
      preloadData: "تحميل مسبق",
      managing: "جاري الإدارة...",
      online: "متصل",
      offline: "غير متصل",
      critical: "حرج",
      recent: "حديث"
    },
    en: {
      title: "Intelligent Cache Manager",
      description: "Automatic optimization and offline management",
      cacheStats: "Cache Statistics",
      settings: "Settings",
      items: "Items",
      management: "Management",
      totalSize: "Total Size",
      availableSpace: "Available Space",
      itemCount: "Item Count",
      hitRate: "Hit Rate",
      lastSync: "Last Sync",
      autoCache: "Auto Cache",
      maxSize: "Max Size",
      retentionDays: "Retention Days",
      syncOnWifi: "Sync on WiFi Only",
      compressData: "Compress Data",
      preloadCritical: "Preload Critical Items",
      clearCache: "Clear Cache",
      syncNow: "Sync Now",
      preloadData: "Preload",
      managing: "Managing...",
      online: "Online",
      offline: "Offline",
      critical: "Critical",
      recent: "Recent"
    }
  };

  const texts = translations[language as keyof typeof translations] || translations.fr;

  // Surveiller l'état de connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialiser les éléments de cache
  useEffect(() => {
    const mockItems: CacheItem[] = [
      {
        id: '1',
        type: 'legal-text',
        name: 'Code Civil Algérien',
        size: 2.3,
        lastAccessed: new Date(Date.now() - 1000 * 60 * 30),
        frequency: 45,
        critical: true
      },
      {
        id: '2',
        type: 'procedure',
        name: 'Demande passeport biométrique',
        size: 0.8,
        lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 2),
        frequency: 23,
        critical: true
      },
      {
        id: '3',
        type: 'translation',
        name: 'Traductions juridiques FR->AR',
        size: 1.2,
        lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 6),
        frequency: 67,
        critical: false
      },
      {
        id: '4',
        type: 'document',
        name: 'Formulaires administratifs',
        size: 3.1,
        lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 12),
        frequency: 12,
        critical: false
      },
      {
        id: '5',
        type: 'image',
        name: 'Logos institutionnels',
        size: 0.5,
        lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24),
        frequency: 8,
        critical: false
      }
    ];
    
    setCacheItems(mockItems);
  }, []);

  const formatSize = (sizeInMB: number) => {
    if (sizeInMB >= 1000) {
      return `${(sizeInMB / 1000).toFixed(1)} GB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat(language === 'ar' ? 'ar' : 'fr').format(
      Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60)),
      'hour'
    );
  };

  const getTypeIcon = (type: CacheItem['type']) => {
    switch (type) {
      case 'legal-text':
        return '📚';
      case 'procedure':
        return '📋';
      case 'translation':
        return '🌐';
      case 'document':
        return '📄';
      case 'image':
        return '🖼️';
    }
  };

  const clearCache = useCallback(async () => {
    setIsManaging(true);
    
    // Simuler la suppression
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCacheItems([]);
    setCacheStats(prev => ({
      ...prev,
      totalSize: 0,
      itemCount: 0,
      availableSpace: prev.availableSpace + prev.totalSize
    }));
    
    setIsManaging(false);
  }, []);

  const syncData = useCallback(async () => {
    if (!isOnline) return;
    
    setIsManaging(true);
    setSyncProgress(0);
    
    // Simuler la synchronisation
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setSyncProgress(i);
    }
    
    setCacheStats(prev => ({
      ...prev,
      lastSync: new Date(),
      hitRate: Math.min(100, prev.hitRate + Math.random() * 5)
    }));
    
    setIsManaging(false);
    setSyncProgress(0);
  }, [isOnline]);

  const preloadCriticalData = useCallback(async () => {
    setIsManaging(true);
    
    // Simuler le préchargement
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newItems: CacheItem[] = [
      {
        id: `new-${Date.now()}`,
        type: 'legal-text',
        name: 'Textes juridiques essentiels',
        size: 5.2,
        lastAccessed: new Date(),
        frequency: 1,
        critical: true
      }
    ];
    
    setCacheItems(prev => [...prev, ...newItems]);
    setCacheStats(prev => ({
      ...prev,
      totalSize: prev.totalSize + newItems.reduce((sum, item) => sum + item.size, 0),
      itemCount: prev.itemCount + newItems.length
    }));
    
    setIsManaging(false);
  }, []);

  const usagePercentage = (cacheStats.totalSize / settings.maxSize) * 100;

  return (
    <div className="space-y-6">
      {/* Statut de connexion */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">{texts.online}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-600" />
                  <span className="text-red-600 font-medium">{texts.offline}</span>
                </>
              )}
            </div>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? "Synchronisé" : "Mode local"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques du cache */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            {texts.cacheStats}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <HardDrive className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {formatSize(cacheStats.totalSize)}
              </div>
              <div className="text-sm text-gray-600">{texts.totalSize}</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {cacheStats.itemCount}
              </div>
              <div className="text-sm text-gray-600">{texts.itemCount}</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {cacheStats.hitRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">{texts.hitRate}</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {formatDate(cacheStats.lastSync)}
              </div>
              <div className="text-sm text-gray-600">{texts.lastSync}</div>
            </div>
          </div>
          
          {/* Utilisation de l'espace */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Utilisation de l'espace</span>
              <span className="text-sm text-gray-600">
                {formatSize(cacheStats.totalSize)} / {formatSize(settings.maxSize)}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-3" />
            {usagePercentage > 90 && (
              <div className="flex items-center gap-1 mt-2 text-orange-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Espace de stockage presque plein</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gestion du cache */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={clearCache} 
          disabled={isManaging}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {isManaging ? texts.managing : texts.clearCache}
        </Button>
        
        <Button 
          onClick={syncData} 
          disabled={isManaging || !isOnline}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {syncProgress > 0 ? `${syncProgress}%` : texts.syncNow}
        </Button>
        
        <Button 
          onClick={preloadCriticalData} 
          disabled={isManaging}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isManaging ? texts.managing : texts.preloadData}
        </Button>
      </div>

      {/* Paramètres */}
      <Card>
        <CardHeader>
          <CardTitle>{texts.settings}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-cache">{texts.autoCache}</Label>
              <Switch
                id="auto-cache"
                checked={settings.autoCache}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, autoCache: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="sync-wifi">{texts.syncOnWifi}</Label>
              <Switch
                id="sync-wifi"
                checked={settings.syncOnWifi}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, syncOnWifi: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="compress">{texts.compressData}</Label>
              <Switch
                id="compress"
                checked={settings.compressData}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, compressData: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="preload">{texts.preloadCritical}</Label>
              <Switch
                id="preload"
                checked={settings.preloadCritical}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, preloadCritical: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des éléments en cache */}
      <Card>
        <CardHeader>
          <CardTitle>{texts.items}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cacheItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="text-2xl">{getTypeIcon(item.type)}</div>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    {formatSize(item.size)} • {formatDate(item.lastAccessed)} • {item.frequency} accès
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.critical && (
                    <Badge variant="destructive" className="text-xs">{texts.critical}</Badge>
                  )}
                  {Date.now() - item.lastAccessed.getTime() < 1000 * 60 * 60 && (
                    <Badge variant="secondary" className="text-xs">{texts.recent}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}