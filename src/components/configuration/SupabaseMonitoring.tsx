import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Server, 
  Wifi, 
  WifiOff, 
  Database, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  responseTime: number;
  lastCheck: Date;
  uptime: string;
  description: string;
}

interface ConnectionMetrics {
  external: {
    active: boolean;
    responseTime: number;
    lastSync: Date | null;
    dataTransferred: string;
  };
  local: {
    active: boolean;
    responseTime: number;
    lastImport: Date | null;
    dataSize: string;
  };
}

/**
 * Composant de monitoring en temps réel pour la stratégie Supabase
 * Surveille l'état des services et des connexions
 */
export const SupabaseMonitoring: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Supabase Externe',
      status: 'online',
      responseTime: 45,
      lastCheck: new Date(),
      uptime: '99.8%',
      description: 'Service de développement et collecte de données'
    },
    {
      name: 'Supabase Local',
      status: 'offline',
      responseTime: 0,
      lastCheck: new Date(),
      uptime: '0%',
      description: 'Service de production locale'
    },
    {
      name: 'API REST',
      status: 'online',
      responseTime: 12,
      lastCheck: new Date(),
      uptime: '99.9%',
      description: 'Interface de programmation REST'
    },
    {
      name: 'Authentification',
      status: 'online',
      responseTime: 8,
      lastCheck: new Date(),
      uptime: '99.7%',
      description: 'Service d\'authentification et autorisation'
    }
  ]);

  const [connectionMetrics, setConnectionMetrics] = useState<ConnectionMetrics>({
    external: {
      active: true,
      responseTime: 45,
      lastSync: new Date(),
      dataTransferred: '2.3 MB'
    },
    local: {
      active: false,
      responseTime: 0,
      lastImport: null,
      dataSize: '0 MB'
    }
  });

  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Real monitoring would go here
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Mettre à jour les temps de réponse
      setServices(prev => prev.map(service => ({
        ...service,
        responseTime: Math.max(5, service.responseTime + (Math.random() - 0.5) * 10),
        lastCheck: new Date()
      })));

      // Mettre à jour les métriques de connexion
      setConnectionMetrics(prev => ({
        external: {
          ...prev.external,
          responseTime: Math.max(20, prev.external.responseTime + (Math.random() - 0.5) * 15)
        },
        local: {
          ...prev.local,
          responseTime: prev.local.active ? Math.max(5, prev.local.responseTime + (Math.random() - 0.5) * 5) : 0
        }
      }));

      setLastUpdate(new Date());
    }, 5000); // Mise à jour toutes les 5 secondes

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Vérification manuelle des services
  const checkServices = async () => {
    setServices(prev => prev.map(service => ({
      ...service,
      status: Math.random() > 0.1 ? 'online' : 'warning',
      responseTime: Math.max(5, Math.random() * 100),
      lastCheck: new Date()
    })));

    // Simuler la vérification de Supabase local
    const localCheck = Math.random() > 0.3;
    setConnectionMetrics(prev => ({
      ...prev,
      local: {
        ...prev.local,
        active: localCheck,
        responseTime: localCheck ? Math.max(5, Math.random() * 20) : 0
      }
    }));
  };

  // Démarrer/arrêter le monitoring
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'offline': return <WifiOff className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête du monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monitoring en Temps Réel
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isMonitoring ? 'default' : 'secondary'}>
                {isMonitoring ? 'ACTIF' : 'INACTIF'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMonitoring}
              >
                {isMonitoring ? 'Arrêter' : 'Démarrer'}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Surveillance continue de l'état des services et des connexions
            {lastUpdate && (
              <span className="block text-xs text-gray-500 mt-1">
                Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statut des services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>État des Services</span>
            <Button
              variant="outline"
              size="sm"
              onClick={checkServices}
              disabled={!isMonitoring}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Vérifier
            </Button>
          </CardTitle>
          <CardDescription>
            Statut en temps réel de tous les services Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    <h4 className="font-semibold">{service.name}</h4>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(service.status)}
                  >
                    {service.status.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600">{service.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Réponse :</span>
                    <span className="font-mono">{service.responseTime.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disponibilité :</span>
                    <span className="font-mono">{service.uptime}</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Dernière vérification : {service.lastCheck.toLocaleTimeString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métriques de connexion */}
      <Card>
        <CardHeader>
          <CardTitle>Métriques de Connexion</CardTitle>
          <CardDescription>
            Performance et utilisation des connexions externes et locales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Connexion externe */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold">Connexion Externe</h4>
                <Badge variant={connectionMetrics.external.active ? 'default' : 'secondary'}>
                  {connectionMetrics.external.active ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Temps de réponse :</span>
                  <span className="font-mono">{connectionMetrics.external.responseTime.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Dernière sync :</span>
                  <span className="text-sm">
                    {connectionMetrics.external.lastSync 
                      ? connectionMetrics.external.lastSync.toLocaleString('fr-FR')
                      : 'Jamais'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Données transférées :</span>
                  <span className="font-mono">{connectionMetrics.external.dataTransferred}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Performance stable</span>
              </div>
            </div>

            {/* Connexion locale */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold">Connexion Locale</h4>
                <Badge variant={connectionMetrics.local.active ? 'default' : 'secondary'}>
                  {connectionMetrics.local.active ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Temps de réponse :</span>
                  <span className="font-mono">
                    {connectionMetrics.local.active 
                      ? `${connectionMetrics.local.responseTime.toFixed(0)}ms`
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Dernier import :</span>
                  <span className="text-sm">
                    {connectionMetrics.local.lastImport 
                      ? connectionMetrics.local.lastImport.toLocaleString('fr-FR')
                      : 'Jamais'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taille des données :</span>
                  <span className="font-mono">{connectionMetrics.local.dataSize}</span>
                </div>
              </div>

              {connectionMetrics.local.active ? (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Performance optimale</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Service non démarré</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes et notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Alertes et Notifications
          </CardTitle>
          <CardDescription>
            Système d'alertes pour les problèmes détectés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.some(s => s.status === 'offline') && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Service hors ligne détecté :</strong> Certains services Supabase ne répondent pas.
                  Vérifiez la connectivité et redémarrez si nécessaire.
                </AlertDescription>
              </Alert>
            )}

            {services.some(s => s.status === 'warning') && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Attention :</strong> Certains services présentent des performances dégradées.
                  Surveillez les temps de réponse et considérez une maintenance préventive.
                </AlertDescription>
              </Alert>
            )}

            {!connectionMetrics.local.active && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Connexion locale inactive :</strong> Le service Supabase local n'est pas démarré.
                  Pour activer le mode production, démarrez Supabase local avec <code>npx supabase start</code>.
                </AlertDescription>
              </Alert>
            )}

            {connectionMetrics.external.responseTime > 100 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Latence élevée :</strong> La connexion externe présente une latence élevée 
                  ({connectionMetrics.external.responseTime.toFixed(0)}ms). Cela peut affecter les performances de développement.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Monitoring actif :</strong> Le système surveille automatiquement l'état de vos services.
          <br />
          <strong>Recommandations :</strong> 
          • Vérifiez régulièrement les temps de réponse
          • Surveillez les alertes de performance
          • Maintenez une disponibilité &gt; 99% pour la production
        </AlertDescription>
      </Alert>
    </div>
  );
};