/**
 * Interface Analytics - Phase 4
 * Gère l'analyse des performances et des métriques du système OCR-IA
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Zap,
  Database,
  FileText,
  Settings,
  RefreshCw,
  Info,
  Eye,
  Download,
  Calendar
} from "lucide-react";

export const AnalyticsInterface: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  const timeRanges = [
    { value: '1d', label: '24h' },
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '90 jours' }
  ];

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    // Simulation du chargement des données
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Données simulées
    const data = {
      overview: {
        totalDocuments: 1247,
        processedToday: 23,
        successRate: 94.2,
        averageProcessingTime: 2.3
      },
      performance: {
        accuracy: 91.5,
        throughput: 156,
        errorRate: 2.1,
        uptime: 99.8
      },
      trends: {
        dailyGrowth: 12.5,
        weeklyGrowth: 8.3,
        monthlyGrowth: 15.7
      },
      topMetrics: [
        { name: 'Documents Traités', value: '1,247', change: '+12.5%', trend: 'up' },
        { name: 'Taux de Succès', value: '94.2%', change: '+2.1%', trend: 'up' },
        { name: 'Temps Moyen', value: '2.3s', change: '-0.5s', trend: 'down' },
        { name: 'Précision', value: '91.5%', change: '+1.8%', trend: 'up' }
      ]
    };
    
    setAnalyticsData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Analytics & Métriques - Phase 4
            <Badge variant="outline" className="bg-purple-50">
              🇩🇿 Phase 4 - Analytics & Métriques
            </Badge>
          </CardTitle>
          <CardDescription>
            Tableau de bord complet des performances et métriques du système OCR-IA.
            Analyse en temps réel et tendances pour optimiser les performances.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {timeRanges.map(range => (
                <Button
                  key={range.value}
                  variant={selectedTimeRange === range.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeRange(range.value)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
            <Button onClick={loadAnalyticsData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {analyticsData && (
        <>
          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analyticsData.topMetrics.map((metric: any, index: number) => (
              <Card key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">{metric.name}</p>
                      <p className="text-2xl font-bold text-blue-900">{metric.value}</p>
                    </div>
                    <div className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Vue d'ensemble */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Vue d'Ensemble
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">Documents</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total traité</span>
                      <span className="font-semibold">{analyticsData.overview.totalDocuments.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Aujourd'hui</span>
                      <span className="font-semibold text-green-600">{analyticsData.overview.processedToday}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taux de succès</span>
                      <span className="font-semibold text-green-600">{analyticsData.overview.successRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Précision</span>
                      <span className="font-semibold text-blue-600">{analyticsData.performance.accuracy}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Débit</span>
                      <span className="font-semibold text-purple-600">{analyticsData.performance.throughput}/h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Temps moyen</span>
                      <span className="font-semibold text-orange-600">{analyticsData.overview.averageProcessingTime}s</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tendances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Tendances & Croissance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    +{analyticsData.trends.dailyGrowth}%
                  </div>
                  <div className="text-sm text-green-700">Croissance Quotidienne</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">
                    +{analyticsData.trends.weeklyGrowth}%
                  </div>
                  <div className="text-sm text-blue-700">Croissance Hebdomadaire</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">
                    +{analyticsData.trends.monthlyGrowth}%
                  </div>
                  <div className="text-sm text-purple-700">Croissance Mensuelle</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter Rapport
                </Button>
                <Button variant="outline" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Vue Détaillée
                </Button>
                <Button variant="outline" className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Planifier Rapport
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="font-semibold mb-2">📊 Fonctionnalités Analytics</div>
          <div className="text-sm space-y-1">
            <div>• <strong>Métriques en temps réel</strong> des performances OCR</div>
            <div>• <strong>Analyse des tendances</strong> et croissance</div>
            <div>• <strong>Tableaux de bord</strong> personnalisables</div>
            <div>• <strong>Rapports automatisés</strong> et exportables</div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};