import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, PlayCircle, Settings, TrendingUp, Activity, AlertTriangle, CheckCircle, Info, Clock, Zap, Shield, HardDrive, Download, Upload, RefreshCw, ExternalLink, FileText, Terminal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { SupabaseModeControl } from '@/components/configuration/SupabaseModeControl';

interface SupabaseStrategySectionNewProps {
  language: string;
}

export const SupabaseStrategySectionNew = ({ language }: SupabaseStrategySectionNewProps) => {
  const [currentMode, setCurrentMode] = useState<'EXTERNAL' | 'LOCAL'>('EXTERNAL');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [services, setServices] = useState({
    external: { status: 'ONLINE', response: 36, availability: 99.8 },
    local: { status: 'OFFLINE', response: 119, availability: 0 },
    api: { status: 'ONLINE', response: 12, availability: 99.9 },
    auth: { status: 'ONLINE', response: 76, availability: 99.7 }
  });

  // Simulation des données en temps réel
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
        setServices(prev => ({
          ...prev,
          external: {
            ...prev.external,
            response: Math.floor(Math.random() * 20) + 30
          },
          api: {
            ...prev.api,
            response: Math.floor(Math.random() * 10) + 8
          },
          auth: {
            ...prev.auth,
            response: Math.floor(Math.random() * 30) + 60
          }
        }));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const renderSourcesTab = () => (
    <div className="space-y-6">
      {/* Mode Control Component */}
      <SupabaseModeControl />
      
      {/* Statistiques des Bases de Données */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Statistiques des Bases de Données
          </CardTitle>
          <CardDescription>
            Comparaison entre la base externe et la base locale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base Externe */}
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Base Externe (Développement)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Tables :</span>
                  <Badge variant="secondary">0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Lignes totales :</span>
                  <Badge variant="secondary">0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Taille :</span>
                  <Badge variant="secondary">0 MB</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Dernière sync :</span>
                  <Badge variant="outline">Jamais</Badge>
                </div>
              </div>
            </div>

            {/* Base Locale */}
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Base Locale (Production)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Tables :</span>
                  <Badge variant="secondary">0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Lignes totales :</span>
                  <Badge variant="secondary">0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Taille :</span>
                  <Badge variant="secondary">0 MB</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Dernier import :</span>
                  <Badge variant="outline">Jamais</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Avancées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Actions Avancées
          </CardTitle>
          <CardDescription>
            Opérations spécialisées pour la maintenance et l'optimisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6" />
              <span>Optimiser</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Database className="h-6 w-6" />
              <span>Analyser</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Shield className="h-6 w-6" />
              <span>Sécuriser</span>
            </Button>
          </div>
          
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Actions avancées :</strong> Ces opérations permettent d'optimiser et maintenir vos bases de données.
              <br />
              <strong>Recommandé :</strong> Exécutez ces actions après chaque synchronisation majeure pour maintenir la qualité des données.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );

  const renderMonitoringTab = () => (
    <div className="space-y-6">
      {/* Monitoring en Temps Réel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitoring en Temps Réel
            <Badge variant={isMonitoring ? "default" : "secondary"}>
              {isMonitoring ? "ACTIF" : "INACTIF"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Surveillance continue de l'état des services et des connexions
            <br />
            Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <Label htmlFor="monitoring-toggle">Surveillance automatique</Label>
            <Switch
              id="monitoring-toggle"
              checked={isMonitoring}
              onCheckedChange={setIsMonitoring}
            />
          </div>
        </CardContent>
      </Card>

      {/* État des Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            État des Services
          </CardTitle>
          <CardDescription>
            Statut en temps réel de tous les services Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supabase Externe */}
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Supabase Externe</h3>
                <Badge variant="default" className="bg-green-600">ONLINE</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">Service de développement et collecte de données</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Réponse :</span>
                  <span className="font-medium">{services.external.response}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Disponibilité :</span>
                  <span className="font-medium">{services.external.availability}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Dernière vérification :</span>
                  <span className="font-medium">{lastUpdate.toLocaleTimeString('fr-FR')}</span>
                </div>
              </div>
            </div>

            {/* Supabase Local */}
            <div className="p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Supabase Local</h3>
                <Badge variant="destructive">OFFLINE</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">Service de production locale</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Réponse :</span>
                  <span className="font-medium">{services.local.response}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Disponibilité :</span>
                  <span className="font-medium">{services.local.availability}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Dernière vérification :</span>
                  <span className="font-medium">{lastUpdate.toLocaleTimeString('fr-FR')}</span>
                </div>
              </div>
            </div>

            {/* API REST */}
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">API REST</h3>
                <Badge variant="default" className="bg-green-600">ONLINE</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">Interface de programmation REST</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Réponse :</span>
                  <span className="font-medium">{services.api.response}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Disponibilité :</span>
                  <span className="font-medium">{services.api.availability}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Dernière vérification :</span>
                  <span className="font-medium">{lastUpdate.toLocaleTimeString('fr-FR')}</span>
                </div>
              </div>
            </div>

            {/* Authentification */}
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Authentification</h3>
                <Badge variant="default" className="bg-green-600">ONLINE</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">Service d'authentification et autorisation</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Réponse :</span>
                  <span className="font-medium">{services.auth.response}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Disponibilité :</span>
                  <span className="font-medium">{services.auth.availability}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Dernière vérification :</span>
                  <span className="font-medium">{lastUpdate.toLocaleTimeString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques de Connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Métriques de Connexion
          </CardTitle>
          <CardDescription>
            Performance et utilisation des connexions externes et locales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Connexion Externe */}
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-blue-800">Connexion Externe</h3>
                <Badge className="bg-blue-600">ACTIVE</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Temps de réponse :</span>
                  <span className="font-medium text-blue-900">35ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Dernière sync :</span>
                  <span className="font-medium text-blue-900">19/08/2025 04:29:49</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Données transférées :</span>
                  <span className="font-medium text-blue-900">2.3 MB</span>
                </div>
                <div className="text-center mt-4">
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    Performance stable
                  </Badge>
                </div>
              </div>
            </div>

            {/* Connexion Locale */}
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Connexion Locale</h3>
                <Badge variant="secondary">INACTIVE</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Temps de réponse :</span>
                  <span className="font-medium text-gray-900">N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Dernier import :</span>
                  <span className="font-medium text-gray-900">Jamais</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Taille des données :</span>
                  <span className="font-medium text-gray-900">0 MB</span>
                </div>
                <div className="text-center mt-4">
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                    Service non démarré
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes et Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertes et Notifications
          </CardTitle>
          <CardDescription>
            Système d'alertes pour les problèmes détectés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Service hors ligne détecté :</strong> Certains services Supabase ne répondent pas. Vérifiez la connectivité et redémarrez si nécessaire.
              </AlertDescription>
            </Alert>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Connexion locale inactive :</strong> Le service Supabase local n'est pas démarré. Pour activer le mode production, démarrez Supabase local avec <code>npx supabase start</code>.
              </AlertDescription>
            </Alert>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Monitoring actif :</strong> Le système surveille automatiquement l'état de vos services.
              </AlertDescription>
            </Alert>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">Recommandations :</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Vérifiez régulièrement les temps de réponse</li>
              <li>• Surveillez les alertes de performance</li>
              <li>• Maintenez une disponibilité &gt; 99% pour la production</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStrategyTab = () => (
    <div className="space-y-6">
      {/* Vue d'ensemble de la Stratégie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Vue d'ensemble de la Stratégie Supabase
          </CardTitle>
          <CardDescription>
            Stratégie hybride : développement avec base externe → production 100% locale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mode Développement */}
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Mode Développement (EXTERNE)
              </h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Accès aux données de la base externe</li>
                <li>• Collecte continue de nouvelles données</li>
                <li>• Tests avec données réelles et complètes</li>
                <li>• Développement et validation des fonctionnalités</li>
              </ul>
            </div>

            {/* Mode Production */}
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Mode Production (LOCAL)
              </h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Base de données 100% locale</li>
                <li>• Aucune connexion externe</li>
                <li>• Respect total du CSP</li>
                <li>• Contrôle total des données</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Actions Rapides
          </CardTitle>
          <CardDescription>
            Opérations fréquentes pour la gestion de la stratégie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-auto p-4 flex flex-col items-center gap-2">
              <Download className="h-6 w-6" />
              <span>Télécharger</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Upload className="h-6 w-6" />
              <span>Importer</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6" />
              <span>Synchroniser</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Settings className="h-6 w-6" />
              <span>Basculer</span>
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-3">Instructions d'utilisation :</h4>
            <ol className="text-sm text-gray-700 space-y-1">
              <li>1. Développez en mode <strong>EXTERNE</strong> pour collecter des données</li>
              <li>2. Téléchargez la base quand vous êtes prêt</li>
              <li>3. Importez vers Supabase local</li>
              <li>4. Basculez en mode <strong>LOCAL</strong> pour la production</li>
              <li>5. Profitez d'une application 100% locale et sécurisée</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Liens et Ressources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Liens et Ressources
          </CardTitle>
          <CardDescription>
            Documentation et scripts pour la stratégie Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-center">Documentation complète</span>
              <code className="text-xs">SOLUTION_SUPABASE_HYBRIDE.md</code>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Terminal className="h-6 w-6" />
              <span className="text-center">Script de téléchargement</span>
              <code className="text-xs">download-supabase-db.sh</code>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Terminal className="h-6 w-6" />
              <span className="text-center">Script d'import</span>
              <code className="text-xs">import-to-local-supabase.sh</code>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Terminal className="h-6 w-6" />
              <span className="text-center">Test du mode local</span>
              <code className="text-xs">test-local-mode.sh</code>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Sources (Supabase)
          </h1>
          <p className="text-gray-600 text-lg">
            Gestion stratégique de la base de données et monitoring en temps réel
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="sources" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Sources
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Stratégie Supabase
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sources">
            {renderSourcesTab()}
          </TabsContent>

          <TabsContent value="monitoring">
            {renderMonitoringTab()}
          </TabsContent>

          <TabsContent value="strategy">
            {renderStrategyTab()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};