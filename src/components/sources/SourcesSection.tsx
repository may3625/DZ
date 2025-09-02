import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Database, 
  History, 
  Settings, 
  Plus, 
  Monitor, 
  Activity, 
  Wifi, 
  WifiOff,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  Upload,
  RefreshCw,
  FileText,
  BarChart3,
  Wrench,
  Clock
} from 'lucide-react';
import { SectionHeader } from '@/components/common/SectionHeader';

interface SourcesSectionProps {
  language: string;
}

export function SourcesSection({ language }: SourcesSectionProps) {
  console.log("🚀 SourcesSection component is rendering with language:", language);
  
  const [activeTab, setActiveTab] = useState("sources");
  const [externalMode, setExternalMode] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <SectionHeader
            icon={Database}
            title="Gestion des sources"
            description="Configuration et administration des sources d'alimentation et stratégie Supabase."
            iconColor="text-teal-600"
          />
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-3 w-full max-w-2xl bg-white/50 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="sources" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Sources
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Jobs
              </TabsTrigger>
              <TabsTrigger value="strategy" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Stratégie Supabase
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Gestion des sources
                </CardTitle>
                <CardDescription>
                  Configuration et administration des sources d'alimentation et stratégie Supabase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Add Source Form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Input placeholder="Nom" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jo">JO</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="rss">RSS</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="URL" />
                  <Input placeholder="Cron" />
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>

                {/* Sources List */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Sources</h3>
                  <p className="text-gray-600">Aucune source pour le moment.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Historique des jobs
                </CardTitle>
                <CardDescription>
                  Suivi des traitements d'ingestion et de leurs statuts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Aucun job.</p>
                <p className="text-sm text-gray-500">Affichage de 0 élément</p>
                <div className="flex justify-end mt-4">
                  <Select>
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-500 ml-2 self-center">Éléments par page :</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="space-y-6">
            {/* Vue d'ensemble de la Stratégie */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Vue d'ensemble de la Stratégie Supabase
                </CardTitle>
                <CardDescription>
                  Stratégie hybride : développement avec base externe → production 100% locale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mode Développement */}
                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Wifi className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-blue-800">Mode Développement (EXTERNE)</h3>
                    </div>
                    <ul className="space-y-2 text-blue-700">
                      <li>• Accès aux données de la base externe</li>
                      <li>• Collecte continue de nouvelles données</li>
                      <li>• Tests avec données réelles et complètes</li>
                      <li>• Développement et validation des fonctionnalités</li>
                    </ul>
                  </div>

                  {/* Mode Production */}
                  <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <WifiOff className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-green-800">Mode Production (LOCAL)</h3>
                    </div>
                    <ul className="space-y-2 text-green-700">
                      <li>• Base de données 100% locale</li>
                      <li>• Aucune connexion externe</li>
                      <li>• Respect total du CSP</li>
                      <li>• Contrôle total des données</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contrôle du Mode Supabase */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Contrôle du Mode Supabase
                </CardTitle>
                <CardDescription>
                  Gérez le mode de connexion Supabase : externe pour le développement, local pour la production
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mode actuel */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wifi className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Mode actuel</h3>
                        <p className="text-sm text-gray-600">Connexion à la base externe (développement)</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-blue-600">EXTERNE</Badge>
                  </div>
                </div>

                {/* Configuration du mode */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configuration du mode</h3>
                  
                  {/* Mode externe */}
                  <div className="flex items-center justify-between p-4 border rounded-xl bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-3">
                      <Wifi className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">Mode externe (développement)</p>
                        <p className="text-sm text-blue-600">Connexion à la base Supabase externe pour la collecte de données</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                    </div>
                  </div>

                  {/* Mode local */}
                  <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50 border-gray-200">
                    <div className="flex items-center gap-3">
                      <WifiOff className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">Mode local (production)</p>
                        <p className="text-sm text-gray-600">Utilisation de la base locale sans connexions externes</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                    </div>
                  </div>
                </div>

                {/* Synchronisation des données */}
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Synchronisation des données</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Télécharger la base externe
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2" disabled>
                      <Upload className="w-4 h-4" />
                      Importer vers le local
                    </Button>
                  </div>
                </div>

                {/* Instructions d'utilisation */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4">Instructions d'utilisation :</h4>
                  <ol className="space-y-2 text-blue-700">
                    <li>1. Développez en <strong>mode externe</strong> pour collecter des données</li>
                    <li>2. Utilisez le bouton "Télécharger" pour exporter la base</li>
                    <li>3. Basculez en <strong>mode local</strong> pour la production</li>
                    <li>4. Importez les données téléchargées dans votre base locale</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques des Bases de Données */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Statistiques des Bases de Données
                </CardTitle>
                <CardDescription>
                  Comparaison entre la base externe et la base locale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Base Externe */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Wifi className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-blue-800">Base Externe (Développement)</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Tables :</span>
                        <span className="font-semibold text-blue-800">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Lignes totales :</span>
                        <span className="font-semibold text-blue-800">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Taille :</span>
                        <span className="font-semibold text-blue-800">0 MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Dernière sync :</span>
                        <span className="font-semibold text-blue-800">Jamais</span>
                      </div>
                    </div>
                  </div>

                  {/* Base Locale */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <WifiOff className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-green-800">Base Locale (Production)</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-green-700">Tables :</span>
                        <span className="font-semibold text-green-800">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Lignes totales :</span>
                        <span className="font-semibold text-green-800">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Taille :</span>
                        <span className="font-semibold text-green-800">0 MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Dernier import :</span>
                        <span className="font-semibold text-green-800">Jamais</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <Button variant="outline" className="flex items-center gap-2 mx-auto">
                    <RefreshCw className="w-4 h-4" />
                    Actualiser les statistiques
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions Avancées */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Actions Avancées
                </CardTitle>
                <CardDescription>
                  Opérations spécialisées pour la maintenance et l'optimisation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-6 bg-gray-50 rounded-xl border hover:bg-gray-100 transition-colors cursor-pointer">
                    <CheckCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-800">Valider Intégrité</h4>
                    <p className="text-xs text-gray-600 mt-1">Vérification des contraintes et relations</p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-xl border hover:bg-gray-100 transition-colors cursor-pointer">
                    <Activity className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-800">Optimiser Performance</h4>
                    <p className="text-xs text-gray-600 mt-1">Amélioration des index et requêtes</p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-xl border hover:bg-gray-100 transition-colors cursor-pointer">
                    <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-800">Nettoyer Données</h4>
                    <p className="text-xs text-gray-600 mt-1">Suppression des données obsolètes</p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-xl border hover:bg-gray-100 transition-colors cursor-pointer">
                    <BarChart3 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-800">Générer Rapport</h4>
                    <p className="text-xs text-gray-600 mt-1">Rapport détaillé de l'état des bases</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>Actions avancées :</strong> Ces opérations permettent d'optimiser et maintenir vos bases de données.
                  </p>
                  <p className="text-sm text-blue-600">
                    <strong>Recommandé :</strong> Exécutez ces actions après chaque synchronisation majeure pour maintenir la qualité des données.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Monitoring en Temps Réel */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Monitoring en Temps Réel
                  <Badge variant="default" className="bg-green-600 ml-2">ACTIF</Badge>
                </CardTitle>
                <CardDescription>
                  Surveillance continue de l'état des services et des connexions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* État des Services */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    État des Services
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Statut en temps réel de tous les services Supabase</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Supabase Externe */}
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-green-800">Supabase Externe</h4>
                        </div>
                        <Badge className="bg-green-600">ONLINE</Badge>
                      </div>
                      <p className="text-sm text-green-700 mb-3">Service de développement et collecte de données</p>
                      <div className="space-y-1 text-xs text-green-600">
                        <div className="flex justify-between">
                          <span>Réponse :</span>
                          <span>36ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Disponibilité :</span>
                          <span>99.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dernière vérification :</span>
                          <span>04:55:26</span>
                        </div>
                      </div>
                    </div>

                    {/* Supabase Local */}
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <h4 className="font-semibold text-red-800">Supabase Local</h4>
                        </div>
                        <Badge variant="destructive">OFFLINE</Badge>
                      </div>
                      <p className="text-sm text-red-700 mb-3">Service de production locale</p>
                      <div className="space-y-1 text-xs text-red-600">
                        <div className="flex justify-between">
                          <span>Réponse :</span>
                          <span>119ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Disponibilité :</span>
                          <span>0%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dernière vérification :</span>
                          <span>04:55:26</span>
                        </div>
                      </div>
                    </div>

                    {/* API REST */}
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-green-800">API REST</h4>
                        </div>
                        <Badge className="bg-green-600">ONLINE</Badge>
                      </div>
                      <p className="text-sm text-green-700 mb-3">Interface de programmation REST</p>
                      <div className="space-y-1 text-xs text-green-600">
                        <div className="flex justify-between">
                          <span>Réponse :</span>
                          <span>12ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Disponibilité :</span>
                          <span>99.9%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dernière vérification :</span>
                          <span>04:55:26</span>
                        </div>
                      </div>
                    </div>

                    {/* Authentification */}
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-green-800">Authentification</h4>
                        </div>
                        <Badge className="bg-green-600">ONLINE</Badge>
                      </div>
                      <p className="text-sm text-green-700 mb-3">Service d'authentification et autorisation</p>
                      <div className="space-y-1 text-xs text-green-600">
                        <div className="flex justify-between">
                          <span>Réponse :</span>
                          <span>76ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Disponibilité :</span>
                          <span>99.7%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dernière vérification :</span>
                          <span>04:55:26</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Métriques de Connexion */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Métriques de Connexion</h3>
                  <p className="text-sm text-gray-600 mb-4">Performance et utilisation des connexions externes et locales</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Connexion Externe */}
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Wifi className="w-5 h-5 text-green-600" />
                        <div>
                          <h4 className="font-semibold text-green-800">Connexion Externe</h4>
                          <Badge className="bg-green-600 text-xs">ACTIVE</Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Temps de réponse :</span>
                          <span className="font-semibold">35ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Dernière sync :</span>
                          <span className="font-semibold">19/08/2025 04:29:49</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Données transférées :</span>
                          <span className="font-semibold">2.3 MB</span>
                        </div>
                        <div className="text-xs text-green-600 mt-3">
                          <Activity className="w-3 h-3 inline mr-1" />
                          Performance stable
                        </div>
                      </div>
                    </div>

                    {/* Connexion Locale */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <WifiOff className="w-5 h-5 text-gray-600" />
                        <div>
                          <h4 className="font-semibold text-gray-800">Connexion Locale</h4>
                          <Badge variant="secondary" className="text-xs">INACTIVE</Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Temps de réponse :</span>
                          <span className="font-semibold">N/A</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Dernier import :</span>
                          <span className="font-semibold">Jamais</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Taille des données :</span>
                          <span className="font-semibold">0 MB</span>
                        </div>
                        <div className="text-xs text-red-600 mt-3">
                          <XCircle className="w-3 h-3 inline mr-1" />
                          Service non démarré
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alertes et Notifications */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Alertes et Notifications</h3>
                  <p className="text-sm text-gray-600 mb-4">Système d'alertes pour les problèmes détectés</p>
                  
                  <div className="space-y-3">
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="font-semibold text-red-800">Service hors ligne détecté :</span>
                      </div>
                      <p className="text-sm text-red-700">
                        Certains services Supabase ne répondent pas. Vérifiez la connectivité et redémarrez si nécessaire.
                      </p>
                    </div>

                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="font-semibold text-yellow-800">Connexion locale inactive :</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Le service Supabase local n'est pas démarré. Pour activer le mode production, démarrez Supabase local avec <code className="bg-yellow-100 px-1 rounded">npx supabase start</code>.
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-800">Monitoring actif :</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Le système surveille automatiquement l'état de vos services.
                      </p>
                      <p className="text-sm text-blue-600 mt-2">
                        <strong>Recommandations :</strong> • Vérifiez régulièrement les temps de réponse • Surveillez les alertes de performance • Maintenez une disponibilité &gt; 99% pour la production
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Rapides */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Actions Rapides</h3>
                  <p className="text-sm text-gray-600 mb-4">Opérations fréquentes pour la gestion de la stratégie</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Button variant="outline" className="h-auto p-4">
                      <div className="text-center">
                        <Download className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <h4 className="font-medium mb-1">Télécharger Base</h4>
                        <p className="text-xs text-gray-500">Export complet de la base externe</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4">
                      <div className="text-center">
                        <Upload className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <h4 className="font-medium mb-1">Importer Local</h4>
                        <p className="text-xs text-gray-500">Import vers Supabase local</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4">
                      <div className="text-center">
                        <RefreshCw className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                        <h4 className="font-medium mb-1">Vérifier Statut</h4>
                        <p className="text-xs text-gray-500">Contrôle de l'état des services</p>
                      </div>
                    </Button>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3">Instructions d'utilisation :</h4>
                    <ol className="space-y-1 text-sm text-green-700">
                      <li>1. Développez en mode <strong>EXTERNE</strong> pour collecter des données</li>
                      <li>2. Téléchargez la base quand vous êtes prêt</li>
                      <li>3. Importez vers Supabase local</li>
                      <li>4. Basculez en mode <strong>LOCAL</strong> pour la production</li>
                      <li>5. Profitez d'une application 100% locale et sécurisée</li>
                    </ol>
                  </div>
                </div>

                {/* Liens et Ressources */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Liens et Ressources</h3>
                  <p className="text-sm text-gray-600 mb-4">Documentation et scripts pour la stratégie Supabase</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                      <span className="font-medium">Documentation complète</span>
                      <code className="text-sm bg-gray-200 px-2 py-1 rounded">SOLUTION_SUPABASE_HYBRIDE.md</code>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                      <span className="font-medium">Script de téléchargement</span>
                      <code className="text-sm bg-gray-200 px-2 py-1 rounded">download-supabase-db.sh</code>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                      <span className="font-medium">Script d'import</span>
                      <code className="text-sm bg-gray-200 px-2 py-1 rounded">import-to-local-supabase.sh</code>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                      <span className="font-medium">Test du mode local</span>
                      <code className="text-sm bg-gray-200 px-2 py-1 rounded">test-local-mode.sh</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}