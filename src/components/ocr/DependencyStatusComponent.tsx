/**
 * Composant de gestion des dépendances entre composants
 * Affiche l'état des composants et permet leur gestion
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  Play,
  Pause,
  Settings,
  Activity,
  Zap,
  Target,
  BarChart3,
  FolderOpen
} from 'lucide-react';
import { componentDependencyService, ComponentDependency } from '@/services/enhanced/componentDependencyService';

interface ComponentInfo {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  icon: React.ReactNode;
}

const componentInfo: ComponentInfo[] = [
  {
    id: 'batch-processing',
    name: 'Traitement par Lot',
    description: 'Traitement en lot de plusieurs documents',
    priority: 'high',
    estimatedTime: 3000,
    icon: <FolderOpen className="w-5 h-5" />
  },
  {
    id: 'approval-workflow',
    name: 'Workflow d\'Approbation',
    description: 'Gestion des approbations avec workflow complet',
    priority: 'high',
    estimatedTime: 2500,
    icon: <CheckCircle className="w-5 h-5" />
  },
  {
    id: 'ocr-analytics',
    name: 'Analytics OCR',
    description: 'Analytics avancées et métriques détaillées',
    priority: 'medium',
    estimatedTime: 2000,
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    id: 'ocr-quality-dashboard',
    name: 'Diagnostic OCR',
    description: 'Diagnostic de la qualité OCR et analyse',
    priority: 'medium',
    estimatedTime: 2000,
    icon: <Activity className="w-5 h-5" />
  },
  {
    id: 'advanced-algorithms',
    name: 'Algorithmes Avancés',
    description: 'Test des algorithmes avancés de traitement',
    priority: 'low',
    estimatedTime: 1800,
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 'algorithm-performance-monitoring',
    name: 'Monitoring Performance',
    description: 'Monitoring en temps réel des performances',
    priority: 'low',
    estimatedTime: 1200,
    icon: <Target className="w-5 h-5" />
  }
];

export const DependencyStatusComponent: React.FC = () => {
  const [dependencies, setDependencies] = useState<{ [key: string]: ComponentDependency }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const updateDependencies = () => {
      setDependencies(componentDependencyService.getDependencyStatus());
    };

    updateDependencies();
    const interval = setInterval(updateDependencies, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simuler un refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDependencies(componentDependencyService.getDependencyStatus());
    setIsRefreshing(false);
  };

  const handleResetDependencies = () => {
    componentDependencyService.resetDependencies();
    setDependencies(componentDependencyService.getDependencyStatus());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'loading':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default" className="bg-green-100 text-green-800">Prêt</Badge>;
      case 'loading':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Chargement</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      default:
        return <Badge variant="outline">Non disponible</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Haute</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Moyenne</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Basse</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Inconnue</Badge>;
    }
  };

  const canUseComponent = (componentId: string) => {
    return componentDependencyService.canUseComponent(componentId);
  };

  const readyComponents = componentInfo.filter(info => canUseComponent(info.id));
  const errorComponents = componentInfo.filter(info => dependencies[info.id]?.status === 'error');
  const loadingComponents = componentInfo.filter(info => dependencies[info.id]?.status === 'loading');

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              État des Dépendances
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button
                onClick={handleResetDependencies}
                variant="outline"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{readyComponents.length}</div>
              <div className="text-xs text-gray-500">Prêts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{errorComponents.length}</div>
              <div className="text-xs text-gray-500">Erreurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{loadingComponents.length}</div>
              <div className="text-xs text-gray-500">Chargement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{componentInfo.length}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Composants avec erreurs */}
      {errorComponents.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Composants en erreur ({errorComponents.length})</div>
            <div className="text-sm">
              {errorComponents.map(info => (
                <div key={info.id} className="flex items-center gap-2 mb-1">
                  {info.icon}
                  <span>{info.name}</span>
                  {getPriorityBadge(info.priority)}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des composants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {componentInfo.map(info => {
          const dependency = dependencies[info.id];
          const isReady = canUseComponent(info.id);
          const hasDependencies = dependency?.dependencies && dependency.dependencies.length > 0;

          return (
            <Card key={info.id} className={`${isReady ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {info.icon}
                    <span>{info.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(dependency?.status || 'not_available')}
                    {getStatusBadge(dependency?.status || 'not_available')}
                    {getPriorityBadge(info.priority)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">{info.description}</p>
                  
                  {hasDependencies && (
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Dépendances:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dependency.dependencies.map(depId => {
                          const depInfo = componentInfo.find(info => info.id === depId);
                          const depStatus = dependencies[depId]?.status;
                          return (
                            <Badge 
                              key={depId} 
                              variant="outline" 
                              className={`text-xs ${depStatus === 'ready' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            >
                              {depInfo?.name || depId}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Temps estimé: {info.estimatedTime}ms</span>
                    <span>Dernière vérification: {dependency?.lastCheck ? new Date(dependency.lastCheck).toLocaleTimeString() : 'N/A'}</span>
                  </div>

                  {!isReady && dependency?.dependencies && dependency.dependencies.length > 0 && (
                    <Alert variant="destructive" className="py-2">
                      <AlertTriangle className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        Dépendances non satisfaites
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions globales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Actions Globales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                componentInfo.forEach(info => {
                  componentDependencyService.markComponentReady(info.id);
                });
                setDependencies(componentDependencyService.getDependencyStatus());
              }}
              variant="outline"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Marquer tous comme prêts
            </Button>
            <Button
              onClick={() => {
                componentInfo.forEach(info => {
                  componentDependencyService.markComponentError(info.id);
                });
                setDependencies(componentDependencyService.getDependencyStatus());
              }}
              variant="outline"
              size="sm"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Marquer tous en erreur
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};