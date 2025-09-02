import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Activity, 
  Server, 
  Globe, 
  Home, 
  Settings, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  HardDrive,
  Network,
  Gauge,
  Bell,
  Clock,
  BarChart3,
  Shield
} from 'lucide-react';

export default function SourcesPage() {
  const [connectionStatus, setConnectionStatus] = useState({
    external: { status: 'connected', latency: 45, uptime: 99.9 },
    local: { status: 'disconnected', latency: 0, uptime: 0 }
  });

  const [mode, setMode] = useState<'external' | 'local'>('external');
  const [alerts] = useState([
    { id: 1, type: 'warning', message: 'Base externe: Pic de trafic détecté', time: '14:32' },
    { id: 2, type: 'info', message: 'Synchronisation programmée dans 2h', time: '14:15' },
    { id: 3, type: 'success', message: 'Sauvegarde automatique terminée', time: '14:00' }
  ]);

  const [stats] = useState({
    documents: 45672,
    sources: 12,
    users: 156,
    storage: 78
  });

  const refreshMetrics = useCallback(() => {
    // Simulate metrics refresh
    setConnectionStatus(prev => ({
      ...prev,
      external: {
        ...prev.external,
        latency: Math.floor(Math.random() * 100) + 20
      }
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshMetrics, 5000);
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Sources (Supabase)
            </h1>
            <p className="text-gray-600 mt-2">
              Gestion stratégique de la base de données et monitoring en temps réel
            </p>
          </div>
          <Button onClick={refreshMetrics} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>

        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Stratégie
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Actions
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertes
            </TabsTrigger>
          </TabsList>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Base Externe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="bg-green-100 text-green-800">Connectée</Badge>
                    <p className="text-xs text-green-600">Latence: {connectionStatus.external.latency}ms</p>
                    <p className="text-xs text-green-600">Uptime: {connectionStatus.external.uptime}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-red-700 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Base Locale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="destructive">Déconnectée</Badge>
                    <p className="text-xs text-red-600">En attente d'initialisation</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Trafic Réseau
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="bg-blue-100 text-blue-800">Normal</Badge>
                    <p className="text-xs text-blue-600">↓ 2.3 MB/s ↑ 0.8 MB/s</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-700 flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="bg-purple-100 text-purple-800">Opérationnels</Badge>
                    <p className="text-xs text-purple-600">API • Auth • Storage</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Metrics en temps réel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-blue-600" />
                  Métriques en temps réel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>34%</span>
                    </div>
                    <Progress value={34} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>RAM Usage</span>
                      <span>68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Vue d'ensemble de la Stratégie Supabase
                </CardTitle>
                <CardDescription>
                  Stratégie hybride : développement avec base externe → production 100% locale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      Mode Développement (EXTERNE)
                    </h4>
                    <ul className="text-sm space-y-2 text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Accès aux données de la base externe
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Collecte continue de nouvelles données
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Tests avec données réelles et complètes
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Home className="h-4 w-4 text-green-500" />
                      Mode Production (LOCAL)
                    </h4>
                    <ul className="text-sm space-y-2 text-gray-600">
                      <li className="flex items-center gap-2">
                        <XCircle className="w-3 h-3 text-red-500" />
                        Base de données 100% locale
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="w-3 h-3 text-red-500" />
                        Aucune connexion externe
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="w-3 h-3 text-red-500" />
                        Respect total du CSP
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mode Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Contrôle du Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Mode actuel: 
                      <Badge className="ml-2" variant={mode === 'external' ? 'default' : 'secondary'}>
                        {mode === 'external' ? 'EXTERNE' : 'LOCAL'}
                      </Badge>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {mode === 'external' 
                        ? 'Connecté à la base Supabase externe pour développement'
                        : 'Mode local activé - Aucune connexion externe'
                      }
                    </p>
                  </div>
                  <Button 
                    onClick={() => setMode(mode === 'external' ? 'local' : 'external')}
                    variant="outline"
                    className="gap-2"
                  >
                    {mode === 'external' ? <Home className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    Basculer vers {mode === 'external' ? 'LOCAL' : 'EXTERNE'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-blue-600">
                    <Database className="w-5 h-5" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.documents.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total documents</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-green-600">
                    <Globe className="w-5 h-5" />
                    Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.sources}</p>
                  <p className="text-sm text-gray-600">Sources actives</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-purple-600">
                    <Users className="w-5 h-5" />
                    Utilisateurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.users}</p>
                  <p className="text-sm text-gray-600">Utilisateurs connectés</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-orange-600">
                    <HardDrive className="w-5 h-5" />
                    Stockage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.storage}%</p>
                  <p className="text-sm text-gray-600">Espace utilisé</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-4">
                <Download className="h-8 w-8 text-blue-600" />
                <div className="text-center">
                  <div className="font-semibold">Télécharger Base</div>
                  <div className="text-xs text-gray-500">Export complet de la base externe</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-4">
                <Upload className="h-8 w-8 text-green-600" />
                <div className="text-center">
                  <div className="font-semibold">Importer Local</div>
                  <div className="text-xs text-gray-500">Import vers Supabase local</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-4">
                <RefreshCw className="h-8 w-8 text-purple-600" />
                <div className="text-center">
                  <div className="font-semibold">Synchroniser</div>
                  <div className="text-xs text-gray-500">Sync bidirectionnelle</div>
                </div>
              </Button>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  Alertes Système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <Alert key={alert.id} className={
                      alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      alert.type === 'success' ? 'border-green-200 bg-green-50' :
                      'border-blue-200 bg-blue-50'
                    }>
                      <div className="flex items-center gap-3">
                        {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                        {alert.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {alert.type === 'info' && <Clock className="w-4 h-4 text-blue-600" />}
                        <AlertDescription className="flex-1">
                          {alert.message}
                        </AlertDescription>
                        <span className="text-xs text-gray-500">{alert.time}</span>
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}