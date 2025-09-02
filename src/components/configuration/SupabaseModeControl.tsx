import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Database, 
  Globe, 
  Home, 
  Download, 
  Upload, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw
} from 'lucide-react';

/**
 * Composant de contrôle du mode Supabase
 * Permet de basculer entre mode externe (développement) et mode local (production)
 */
export const SupabaseModeControl: React.FC = () => {
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    // Détecter le mode actuel depuis localStorage
    const localOnly = localStorage.getItem('LOCAL_ONLY') === 'true';
    setIsLocalMode(localOnly);
    
    // Vérifier s'il y a eu une synchronisation récente
    const lastSyncData = localStorage.getItem('supabase_last_sync');
    if (lastSyncData) {
      setLastSync(lastSyncData);
    }
  }, []);

  const toggleMode = async () => {
    setIsLoading(true);
    
    try {
      const newMode = !isLocalMode;
      
      if (newMode) {
        // Activation du mode local
        localStorage.setItem('LOCAL_ONLY', 'true');
        toast.success('Mode local activé - Aucune connexion externe ne sera établie');
      } else {
        // Activation du mode externe  
        localStorage.removeItem('LOCAL_ONLY');
        toast.success('Mode externe activé - Connexion à Supabase externe autorisée');
      }
      
      setIsLocalMode(newMode);
      
      // Recharger la page pour appliquer les changements du client Supabase
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Erreur lors du changement de mode:', error);
      toast.error('Erreur lors du changement de mode');
    } finally {
      setIsLoading(false);
    }
  };

  const forceRefresh = () => {
    toast.info('Rechargement de l\'application...');
    window.location.reload();
  };

  const clearCache = () => {
    try {
      // Nettoyer le cache localStorage
      const keysToKeep = ['LOCAL_ONLY', 'supabase_last_sync'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      toast.success('Cache nettoyé avec succès');
      
      // Recharger après le nettoyage
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Erreur lors du nettoyage du cache');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Contrôle du Mode Supabase
        </CardTitle>
        <CardDescription>
          Basculez entre mode local (100% offline) et mode externe (développement avec Supabase)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Statut actuel */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {isLocalMode ? (
              <Home className="h-6 w-6 text-green-500" />
            ) : (
              <Globe className="h-6 w-6 text-blue-500" />
            )}
            <div>
              <h3 className="font-semibold">Mode actuel</h3>
              <p className="text-sm text-gray-600">
                {isLocalMode
                  ? 'Mode local - Aucune connexion externe'
                  : 'Mode externe - Connexion à Supabase autorisée'
                }
              </p>
            </div>
          </div>
          <Badge variant={isLocalMode ? 'secondary' : 'default'}>
            {isLocalMode ? 'LOCAL' : 'EXTERNE'}
          </Badge>
        </div>

        {/* Contrôle principal */}
        <div className="flex items-center justify-between p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white shadow-sm">
              {isLocalMode ? (
                <Home className="h-5 w-5 text-green-600" />
              ) : (
                <Globe className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <Label htmlFor="mode-switch" className="font-semibold text-base">
                {isLocalMode ? 'Mode Local Actif' : 'Mode Externe Actif'}
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                {isLocalMode 
                  ? 'Application 100% locale - Pas de connexions externes'
                  : 'Connexions externes autorisées - Développement'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Switch
              id="mode-switch"
              checked={isLocalMode}
              onCheckedChange={toggleMode}
              disabled={isLoading}
            />
            {isLoading && <Settings className="h-4 w-4 animate-spin text-gray-500" />}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={forceRefresh}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser l'application
          </Button>
          
          <Button
            onClick={clearCache}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Nettoyer le cache
          </Button>
        </div>

        {lastSync && (
          <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
            <strong>Dernière synchronisation :</strong> {new Date(lastSync).toLocaleString('fr-FR')}
          </div>
        )}

        {/* Guide d'utilisation */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Mode Local :</strong> Toutes les données sont traitées localement, aucune connexion externe n'est établie. Recommandé pour la production.
            <br />
            <strong>Mode Externe :</strong> Connexion à Supabase autorisée pour le développement et les tests.
          </AlertDescription>
        </Alert>

        {/* Informations techniques */}
        <div className="p-4 bg-gray-50 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">Informations techniques :</h4>
          <ul className="space-y-1 text-gray-600">
            <li>• <strong>LOCAL_ONLY:</strong> {isLocalMode ? 'true' : 'false'}</li>
            <li>• <strong>Client Supabase:</strong> {isLocalMode ? 'Mock (sans connexions)' : 'Réel (avec connexions)'}</li>
            <li>• <strong>Sécurité:</strong> {isLocalMode ? 'Maximum (offline)' : 'Standard (online)'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};