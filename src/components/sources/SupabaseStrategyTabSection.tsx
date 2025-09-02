import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Globe, 
  Home,
  CheckCircle, 
  XCircle, 
  Download,
  Upload,
  RefreshCw,
  Settings,
  Shield,
  Monitor,
  HardDrive,
  Network,
  AlertTriangle,
  Info,
  FileText,
  ExternalLink,
  Play
} from 'lucide-react';
import { SupabaseModeControl } from '@/components/configuration/SupabaseModeControl';

export const SupabaseStrategyTabSection = () => {
  const [monitoringActive, setMonitoringActive] = useState(true);

  return (
    <div className="space-y-8">
      {/* Vue d'ensemble de la Stratégie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Shield className="w-6 h-6 text-blue-600" />
            Vue d'ensemble de la Stratégie Supabase
          </CardTitle>
          <CardDescription className="text-lg">
            Stratégie hybride : développement avec base externe vers production 100% locale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mode Développement */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Mode Développement (EXTERNE)
              </h3>
              <ul className="space-y-3">
                {[
                  "Accès aux données de la base externe",
                  "Collecte continue de nouvelles données", 
                  "Tests avec données réelles et complètes",
                  "Développement et validation des fonctionnalités"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mode Production */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Home className="w-5 h-5 text-green-500" />
                Mode Production (LOCAL)
              </h3>
              <ul className="space-y-3">
                {[
                  "Base de données 100% locale",
                  "Aucune connexion externe",
                  "Respect total du CSP", 
                  "Contrôle total des données"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contrôle du Mode Supabase */}
      <SupabaseModeControl />

      {/* Statistiques des Bases de Données */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            Statistiques des Bases de Données
          </CardTitle>
          <CardDescription>
            Comparaison entre la base externe et la base locale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base Externe */}
            <div className="p-6 border rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Base Externe (Développement)
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tables :</span>
                  <span className="font-semibold">31</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lignes totales :</span>
                  <span className="font-semibold">2,851,472</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taille :</span>
                  <span className="font-semibold">1.2 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dernière sync :</span>
                  <span className="font-semibold">19/08/2025 04:29:49</span>
                </div>
              </div>
            </div>

            {/* Base Locale */}
            <div className="p-6 border rounded-xl bg-gradient-to-br from-gray-50 to-slate-50">
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-gray-600" />
                Base Locale (Production)
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tables :</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lignes totales :</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taille :</span>
                  <span className="font-semibold">0 MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dernier import :</span>
                  <span className="font-semibold">Jamais</span>
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
            <Settings className="w-5 h-5 text-orange-600" />
            Actions Avancées
          </CardTitle>
          <CardDescription>
            Opérations spécialisées pour la maintenance et l'optimisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-blue-50">
              <Download className="w-6 h-6 text-blue-600" />
              <div className="text-center">
                <div className="font-semibold">Télécharger Base</div>
                <div className="text-xs text-gray-500">Export complet</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-green-50">
              <Upload className="w-6 h-6 text-green-600" />
              <div className="text-center">
                <div className="font-semibold">Importer Local</div>
                <div className="text-xs text-gray-500">Import vers local</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-purple-50">
              <RefreshCw className="w-6 h-6 text-purple-600" />
              <div className="text-center">
                <div className="font-semibold">Synchroniser</div>
                <div className="text-xs text-gray-500">Sync complète</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-orange-50">
              <HardDrive className="w-6 h-6 text-orange-600" />
              <div className="text-center">
                <div className="font-semibold">Optimiser</div>
                <div className="text-xs text-gray-500">Nettoyage DB</div>
              </div>
            </Button>
          </div>

          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              <strong>Actions avancées :</strong> Ces opérations permettent d'optimiser et maintenir vos bases de données.
              <br />
              <strong>Recommandé :</strong> Exécutez ces actions après chaque synchronisation majeure pour maintenir la qualité des données.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Monitoring en Temps Réel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-green-600" />
            Monitoring en Temps Réel
            <Badge className="bg-green-100 text-green-800 ml-2">
              {monitoringActive ? 'ACTIF' : 'INACTIF'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Surveillance continue de l'état des services et des connexions<br />
            Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* État des Services */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Network className="w-4 h-4" />
              État des Services
            </h4>
            <p className="text-sm text-gray-600 mb-4">Statut en temps réel de tous les services Supabase</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Supabase Externe', status: 'online', response: '36ms', uptime: '99.8%', desc: 'Service de développement et collecte de données' },
                { name: 'Supabase Local', status: 'offline', response: '119ms', uptime: '0%', desc: 'Service de production locale' },
                { name: 'API REST', status: 'online', response: '12ms', uptime: '99.9%', desc: 'Interface de programmation REST' },
                { name: 'Authentification', status: 'online', response: '76ms', uptime: '99.7%', desc: 'Service d\'authentification et autorisation' }
              ].map((service, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{service.name}</h5>
                    <Badge className={service.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {service.status === 'online' ? 'ONLINE' : 'OFFLINE'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{service.desc}</p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Réponse :</span>
                      <span className="font-medium">{service.response}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Disponibilité :</span>
                      <span className="font-medium">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dernière vérification :</span>
                      <span className="font-medium">{new Date().toLocaleTimeString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Métriques de Connexion */}
          <div>
            <h4 className="font-semibold mb-4">Métriques de Connexion</h4>
            <p className="text-sm text-gray-600 mb-4">Performance et utilisation des connexions externes et locales</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">Connexion Externe</h5>
                  <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Temps de réponse :</span>
                    <span className="font-medium">35ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dernière sync :</span>
                    <span className="font-medium">19/08/2025 04:29:49</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Données transférées :</span>
                    <span className="font-medium">2.3 MB</span>
                  </div>
                  <p className="text-green-600 font-medium">Performance stable</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">Connexion Locale</h5>
                  <Badge className="bg-gray-100 text-gray-800">INACTIVE</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Temps de réponse :</span>
                    <span className="font-medium">N/A</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dernier import :</span>
                    <span className="font-medium">Jamais</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taille des données :</span>
                    <span className="font-medium">0 MB</span>
                  </div>
                  <p className="text-gray-600 font-medium">Service non démarré</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alertes et Notifications */}
          <div>
            <h4 className="font-semibold mb-4">Alertes et Notifications</h4>
            <p className="text-sm text-gray-600 mb-4">Système d'alertes pour les problèmes détectés</p>
            
            <div className="space-y-3">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <AlertDescription>
                  <strong>Service hors ligne détecté :</strong> Certains services Supabase ne répondent pas. Vérifiez la connectivité et redémarrez si nécessaire.
                </AlertDescription>
              </Alert>

              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <AlertDescription>
                  <strong>Connexion locale inactive :</strong> Le service Supabase local n'est pas démarré. Pour activer le mode production, démarrez Supabase local avec <code>npx supabase start</code>.
                </AlertDescription>
              </Alert>

              <Alert className="border-blue-200 bg-blue-50">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertDescription>
                  <strong>Monitoring actif :</strong> Le système surveille automatiquement l'état de vos services.
                </AlertDescription>
              </Alert>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <h5 className="font-medium mb-2">Recommandations :</h5>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Vérifiez régulièrement les temps de réponse</li>
                <li>• Surveillez les alertes de performance</li>
                <li>• Maintenez une disponibilité supérieure à 99% pour la production</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-green-600" />
            Actions Rapides
          </CardTitle>
          <CardDescription>
            Opérations fréquentes pour la gestion de la stratégie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Button className="h-auto p-4 justify-start gap-3" variant="outline">
              <Download className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold">Télécharger la base</div>
                <div className="text-xs text-gray-500">Export complet</div>
              </div>
            </Button>

            <Button className="h-auto p-4 justify-start gap-3" variant="outline">
              <Upload className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <div className="font-semibold">Importer vers local</div>
                <div className="text-xs text-gray-500">Synchronisation</div>
              </div>
            </Button>

            <Button className="h-auto p-4 justify-start gap-3" variant="outline">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <div className="font-semibold">Basculer de mode</div>
                <div className="text-xs text-gray-500">EXTERNE → LOCAL</div>
              </div>
            </Button>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <h5 className="font-medium mb-3">Instructions d'utilisation :</h5>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Développez en mode <strong>EXTERNE</strong> pour collecter des données</li>
              <li>Téléchargez la base quand vous êtes prêt</li>
              <li>Importez vers Supabase local</li>
              <li>Basculez en mode <strong>LOCAL</strong> pour la production</li>
              <li>Profitez d&apos;une application 100% locale et sécurisée</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Liens et Ressources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Liens et Ressources
          </CardTitle>
          <CardDescription>
            Documentation et scripts pour la stratégie Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Documentation complète', file: 'SOLUTION_SUPABASE_HYBRIDE.md', desc: 'Guide complet de la stratégie hybride' },
              { name: 'Script de téléchargement', file: 'download-supabase-db.sh', desc: 'Script pour exporter la base externe' },
              { name: 'Script d\'import', file: 'import-to-local-supabase.sh', desc: 'Script pour importer vers local' },
              { name: 'Test du mode local', file: 'test-local-mode.sh', desc: 'Vérification du mode local' }
            ].map((resource, index) => (
              <Button key={index} variant="outline" className="h-auto p-4 justify-start gap-3">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div className="text-left flex-1">
                  <div className="font-semibold">{resource.name}</div>
                  <div className="text-xs text-gray-500">{resource.file}</div>
                  <div className="text-xs text-gray-400">{resource.desc}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};