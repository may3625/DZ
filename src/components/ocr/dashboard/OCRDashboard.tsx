import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  FileText,
  Clock,
  Zap,
  Target,
  Lightbulb,
  Download,
  Settings
} from 'lucide-react';
import { useOCRMetrics } from '@/hooks/useOCRMetrics';

export function OCRDashboard() {
  const { metrics, logs, recommendations, refreshMetrics } = useOCRMetrics();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Données pour les graphiques
  const documentTypeData = [
    { name: 'PDF', value: 45, color: '#8884d8' },
    { name: 'Images', value: 30, color: '#82ca9d' },
    { name: 'Word', value: 15, color: '#ffc658' },
    { name: 'Excel', value: 7, color: '#ff7300' },
    { name: 'Autres', value: 3, color: '#00ff88' }
  ];

  const performanceData = [
    { name: 'Lun', success: 95, failed: 5, avgTime: 2.3 },
    { name: 'Mar', success: 92, failed: 8, avgTime: 2.8 },
    { name: 'Mer', success: 97, failed: 3, avgTime: 2.1 },
    { name: 'Jeu', success: 89, failed: 11, avgTime: 3.2 },
    { name: 'Ven', success: 94, failed: 6, avgTime: 2.5 },
    { name: 'Sam', success: 96, failed: 4, avgTime: 2.2 },
    { name: 'Dim', success: 93, failed: 7, avgTime: 2.7 }
  ];

  const confidenceData = [
    { time: '00:00', confidence: 85 },
    { time: '04:00', confidence: 87 },
    { time: '08:00', confidence: 92 },
    { time: '12:00', confidence: 89 },
    { time: '16:00', confidence: 94 },
    { time: '20:00', confidence: 91 }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshMetrics();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Statistiques globales
  const globalStats = {
    totalDocuments: 1247,
    successRate: 94.2,
    averageConfidence: 89.5,
    averageProcessingTime: 2.4,
    todayProcessed: 156,
    weeklyGrowth: 12.5
  };

  // Recommandations automatiques
  const autoRecommendations = [
    {
      type: 'performance',
      priority: 'high',
      title: 'Optimisation du temps de traitement',
      description: 'Les documents de plus de 10 pages prennent 40% plus de temps. Considérez un traitement par lots.',
      action: 'Implémenter le traitement parallèle'
    },
    {
      type: 'quality',
      priority: 'medium',
      title: 'Amélioration de la confiance OCR',
      description: 'Les images avec une résolution inférieure à 300 DPI ont une confiance réduite de 15%.',
      action: 'Ajouter un pré-processeur d\'amélioration d\'image'
    },
    {
      type: 'usage',
      priority: 'low',
      title: 'Pattern d\'utilisation',
      description: 'Pic d\'utilisation entre 14h-16h. Considérez une mise à l\'échelle automatique.',
      action: 'Configurer l\'auto-scaling'
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête du tableau de bord */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord OCR</h1>
          <p className="text-muted-foreground">Vue d'ensemble des performances et statistiques</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Actualiser
        </Button>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{globalStats.totalDocuments.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total documents</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{globalStats.successRate}%</div>
            <div className="text-xs text-muted-foreground">Taux de succès</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{globalStats.averageConfidence}%</div>
            <div className="text-xs text-muted-foreground">Confiance moyenne</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{globalStats.averageProcessingTime}s</div>
            <div className="text-xs text-muted-foreground">Temps moyen</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
            <div className="text-2xl font-bold">{globalStats.todayProcessed}</div>
            <div className="text-xs text-muted-foreground">Aujourd'hui</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">+{globalStats.weeklyGrowth}%</div>
            <div className="text-xs text-muted-foreground">Croissance</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Répartition par type de document */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Type de Document</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={documentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {documentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Évolution de la confiance */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution de la Confiance OCR</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={confidenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Hebdomadaire</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="success" fill="#82ca9d" name="Succès" />
                  <Bar dataKey="failed" fill="#ff7300" name="Échecs" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance CPU</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Utilisation moyenne</span>
                    <span>73%</span>
                  </div>
                  <Progress value={73} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mémoire</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Utilisation RAM</span>
                    <span>2.1 GB</span>
                  </div>
                  <Progress value={68} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Temps de réponse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>P95</span>
                    <span>4.2s</span>
                  </div>
                  <Progress value={84} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs Détaillés</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex gap-4">
                    <span className="text-muted-foreground">2025-01-14 16:09:21</span>
                    <Badge variant="default">INFO</Badge>
                    <span>Document PDF traité avec succès - confiance: 94%</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-muted-foreground">2025-01-14 16:09:18</span>
                    <Badge variant="secondary">DEBUG</Badge>
                    <span>Initialisation moteur OCR - version 2.1.0</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-muted-foreground">2025-01-14 16:09:15</span>
                    <Badge variant="destructive">ERROR</Badge>
                    <span>Échec traitement image.jpg - résolution trop faible</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-muted-foreground">2025-01-14 16:09:12</span>
                    <Badge variant="default">INFO</Badge>
                    <span>Mapping automatique réussi - 12 champs détectés</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-muted-foreground">2025-01-14 16:09:08</span>
                    <Badge variant="secondary">DEBUG</Badge>
                    <span>Préprocessing image - amélioration contraste appliquée</span>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {autoRecommendations.map((rec, index) => (
              <Alert key={index} className={
                rec.priority === 'high' ? 'border-red-200 bg-red-50' :
                rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }>
                <div className="flex items-start gap-3">
                  <Lightbulb className={`h-5 w-5 mt-0.5 ${
                    rec.priority === 'high' ? 'text-red-500' :
                    rec.priority === 'medium' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <Badge variant={
                        rec.priority === 'high' ? 'destructive' :
                        rec.priority === 'medium' ? 'secondary' :
                        'default'
                      }>
                        {rec.priority}
                      </Badge>
                    </div>
                    <AlertDescription className="mb-2">
                      {rec.description}
                    </AlertDescription>
                    <Button size="sm" variant="outline">
                      {rec.action}
                    </Button>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="exports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapports et Exports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  Rapport Performance PDF
                </Button>
                
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  Export Métriques CSV
                </Button>
                
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  Logs Complets JSON
                </Button>
                
                <Button variant="outline" className="h-20 flex-col">
                  <Settings className="w-6 h-6 mb-2" />
                  Configuration Système
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}