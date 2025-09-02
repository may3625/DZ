import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  TrendingUp, 
  Brain, 
  BarChart3, 
  Filter, 
  Download, 
  RefreshCw,
  Calendar,
  Activity,
  Zap,
  LineChart,
  Target,
  AlertTriangle,
  TrendingDown,
  Clock,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { TabFormField } from '@/components/common/TabFormField';

export function PredictiveAnalysisAdvanced() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeFilter, setActiveFilter] = useState('all');

  const predictionMetrics = [
    {
      title: 'Prédictions générées',
      value: '1,247',
      change: '+18%',
      trend: 'up',
      icon: Brain,
      color: 'text-purple-600'
    },
    {
      title: 'Précision moyenne',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: Target,
      color: 'text-green-600'
    },
    {
      title: 'Analyses en cours',
      value: '23',
      change: '+5',
      trend: 'up',
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      title: 'Alertes prédictives',
      value: '47',
      change: '+12',
      trend: 'up',
      icon: AlertTriangle,
      color: 'text-orange-600'
    }
  ];

  const predictionTypes = [
    { name: 'Décisions judiciaires', accuracy: '96%', color: 'bg-green-500' },
    { name: 'Évolution législative', accuracy: '89%', color: 'bg-blue-500' },
    { name: 'Risques juridiques', accuracy: '92%', color: 'bg-orange-500' },
    { name: 'Tendances jurisprudentielles', accuracy: '87%', color: 'bg-purple-500' }
  ];

  const periodOptions = [
    { value: 'week', label: '7 derniers jours' },
    { value: 'month', label: '30 derniers jours' },
    { value: 'quarter', label: '3 derniers mois' },
    { value: 'year', label: '12 derniers mois' }
  ];

  // Données pour les tendances prédictives
  const predictiveTrends = [
    {
      id: 1,
      title: "Évolution du télétravail",
      category: "Droit du travail",
      currentTrend: "+45%",
      predictedTrend: "+67%",
      confidence: 92,
      timeframe: "6 mois",
      impact: "Élevé",
      description: "Augmentation continue des litiges liés au télétravail",
      status: "En hausse"
    },
    {
      id: 2,
      title: "Réglementation RGPD",
      category: "Protection des données",
      currentTrend: "+23%",
      predictedTrend: "+38%",
      confidence: 88,
      timeframe: "12 mois",
      impact: "Critique",
      description: "Renforcement des sanctions et nouvelles obligations",
      status: "En hausse"
    },
    {
      id: 3,
      title: "Transition énergétique",
      category: "Droit environnemental",
      currentTrend: "+67%",
      predictedTrend: "+89%",
      confidence: 95,
      timeframe: "18 mois",
      impact: "Moyen",
      description: "Nouvelles normes environnementales pour les entreprises",
      status: "En hausse"
    },
    {
      id: 4,
      title: "Digitalisation des services",
      category: "Droit administratif",
      currentTrend: "+34%",
      predictedTrend: "+52%",
      confidence: 87,
      timeframe: "9 mois",
      impact: "Élevé",
      description: "Transformation numérique des procédures administratives",
      status: "En hausse"
    },
    {
      id: 5,
      title: "Cybersécurité",
      category: "Droit numérique",
      currentTrend: "+56%",
      predictedTrend: "+78%",
      confidence: 91,
      timeframe: "4 mois",
      impact: "Critique",
      description: "Nouvelles obligations de sécurité pour les entreprises",
      status: "En hausse"
    },
    {
      id: 6,
      title: "Commerce électronique",
      category: "Droit commercial",
      currentTrend: "+28%",
      predictedTrend: "+41%",
      confidence: 85,
      timeframe: "8 mois",
      impact: "Moyen",
      description: "Évolution des contrats en ligne et protection consommateur",
      status: "En hausse"
    },
    {
      id: 7,
      title: "Droit de la famille",
      category: "Droit civil",
      currentTrend: "-12%",
      predictedTrend: "-8%",
      confidence: 76,
      timeframe: "12 mois",
      impact: "Faible",
      description: "Stabilisation des contentieux familiaux",
      status: "En baisse"
    },
    {
      id: 8,
      title: "Droit des contrats",
      category: "Droit civil",
      currentTrend: "+18%",
      predictedTrend: "+25%",
      confidence: 82,
      timeframe: "6 mois",
      impact: "Moyen",
      description: "Modernisation du droit des contrats",
      status: "En hausse"
    },
    // Données d'exemple supplémentaires pour forcer la pagination
    {
      id: 9,
      title: "Protection des données",
      category: "Droit numérique",
      currentTrend: "+45%",
      predictedTrend: "+62%",
      confidence: 89,
      timeframe: "10 mois",
      impact: "Élevé",
      description: "Nouvelles réglementations RGPD et protection vie privée",
      status: "En hausse"
    },
    {
      id: 10,
      title: "Droit de la santé",
      category: "Droit médical",
      currentTrend: "+32%",
      predictedTrend: "+48%",
      confidence: 84,
      timeframe: "14 mois",
      impact: "Moyen",
      description: "Évolution des normes sanitaires et médicales",
      status: "En hausse"
    },
    {
      id: 11,
      title: "Droit de l'éducation",
      category: "Droit administratif",
      currentTrend: "+15%",
      predictedTrend: "+28%",
      confidence: 78,
      timeframe: "16 mois",
      impact: "Faible",
      description: "Modernisation du système éducatif",
      status: "En hausse"
    },
    {
      id: 12,
      title: "Droit des transports",
      category: "Droit routier",
      currentTrend: "+22%",
      predictedTrend: "+35%",
      confidence: 81,
      timeframe: "7 mois",
      impact: "Moyen",
      description: "Nouvelles réglementations de sécurité routière",
      status: "En hausse"
    }
  ];

  // Pagination pour les tendances prédictives
  const {
    currentData: paginatedTrends,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: predictiveTrends,
    itemsPerPage: 2
  });

  return (
    <div className="space-y-6">
      <TabFormField
        placeholder="Lancer une nouvelle analyse prédictive..."
        onSearch={(query) => console.log('Analyse prédictive:', query)}
        onAdd={() => console.log('Nouvelle prédiction')}
        onFilter={() => console.log('Filtrer prédictions')}
        onSort={() => console.log('Trier prédictions')}
        onExport={() => console.log('Exporter prédictions')}
        onRefresh={() => console.log('Actualiser prédictions')}
        showActions={true}
      />

      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {predictionMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold mt-2">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-green-600">
                      {metric.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs période précédente</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-gray-50">
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contrôles et filtres */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Tableau de bord prédictif
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {periodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtres avancés
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Onglets détaillés */}
      <Tabs defaultValue="models" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">Modèles prédictifs</TabsTrigger>
          <TabsTrigger value="scenarios">Scénarios</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Performance des modèles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictionTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                      <span className="font-medium">{type.name}</span>
                    </div>
                    <Badge variant="secondary">{type.accuracy}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Scénarios prédictifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Scénario optimiste</h4>
                  <p className="text-sm text-gray-600">Évolution favorable de la jurisprudence</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">85% probabilité</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Scénario pessimiste</h4>
                  <p className="text-sm text-gray-600">Durcissement réglementaire</p>
                  <Badge className="mt-2 bg-red-100 text-red-800">23% probabilité</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-green-600" />
                Tendances prédictives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paginatedTrends.map((trend) => (
                  <div key={trend.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{trend.title}</h4>
                        <Badge variant="outline" className="text-xs mb-2">{trend.category}</Badge>
                        <p className="text-xs text-gray-600">{trend.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {trend.status === "En hausse" ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                          )}
                          <Badge className={`text-xs ${
                            trend.status === "En hausse" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {trend.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">{trend.timeframe}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-xs text-gray-500">Tendance actuelle:</span>
                        <div className="font-medium text-sm">{trend.currentTrend}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Prédiction:</span>
                        <div className="font-medium text-sm">{trend.predictedTrend}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Confiance:</span>
                        <div className="font-medium text-sm">{trend.confidence}%</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Impact:</span>
                        <div className={`font-medium text-sm ${
                          trend.impact === "Critique" ? "text-red-600" :
                          trend.impact === "Élevé" ? "text-orange-600" :
                          "text-yellow-600"
                        }`}>
                          {trend.impact}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>Suivi actif</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Mise à jour: Il y a 2h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination pour les tendances */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                Rapports prédictifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <span>Rapport mensuel - Prédictions juridiques</span>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <span>Analyse prédictive - Évolutions réglementaires</span>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}