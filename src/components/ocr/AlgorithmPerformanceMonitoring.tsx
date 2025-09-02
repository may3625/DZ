/**
 * Interface de monitoring de performance des algorithmes avancés
 * Phase 5 - Monitoring et Métriques en Temps Réel
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Cpu,
  HardDrive,
  Gauge,
  Target,
  AlertCircle,
  Info
} from 'lucide-react';

interface AlgorithmStatus {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'error' | 'paused';
  startTime?: number;
  endTime?: number;
  duration: number;
  progress: number;
  quality: number;
  accuracy: number;
  memoryUsage: number;
  cpuUsage: number;
  errorCount: number;
  successCount: number;
  lastError?: string;
  lastSuccess?: string;
}

interface PerformanceMetrics {
  totalProcessingTime: number;
  averageQuality: number;
  averageAccuracy: number;
  totalMemoryUsage: number;
  totalCpuUsage: number;
  totalErrors: number;
  totalSuccesses: number;
  throughput: number; // opérations par minute
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export const AlgorithmPerformanceMonitoring: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [algorithmStatuses, setAlgorithmStatuses] = useState<AlgorithmStatus[]>([
    {
      id: 'line-detection',
      name: '📏 Détection de Lignes (HoughLinesP)',
      status: 'idle',
      duration: 0,
      progress: 0,
      quality: 0,
      accuracy: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      errorCount: 0,
      successCount: 0
    },
    {
      id: 'border-removal',
      name: '🗑️ Élimination des Bordures',
      status: 'idle',
      duration: 0,
      progress: 0,
      quality: 0,
      accuracy: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      errorCount: 0,
      successCount: 0
    },
    {
      id: 'zone-detection',
      name: '📍 Détection des Zones',
      status: 'idle',
      duration: 0,
      progress: 0,
      quality: 0,
      accuracy: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      errorCount: 0,
      successCount: 0
    },
    {
      id: 'table-detection',
      name: '📊 Détection des Tables',
      status: 'idle',
      duration: 0,
      progress: 0,
      quality: 0,
      accuracy: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      errorCount: 0,
      successCount: 0
    },
    {
      id: 'cell-extraction',
      name: '📋 Extraction des Cellules',
      status: 'idle',
      duration: 0,
      progress: 0,
      quality: 0,
      accuracy: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      errorCount: 0,
      successCount: 0
    }
  ]);

  const [globalMetrics, setGlobalMetrics] = useState<PerformanceMetrics>({
    totalProcessingTime: 0,
    averageQuality: 0,
    averageAccuracy: 0,
    totalMemoryUsage: 0,
    totalCpuUsage: 0,
    totalErrors: 0,
    totalSuccesses: 0,
    throughput: 0
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);

  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Démarrer le monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    startTimeRef.current = Date.now();
    
    // Démarrer tous les algorithmes
    setAlgorithmStatuses(prev => prev.map(alg => ({
      ...alg,
      status: 'running',
      startTime: Date.now(),
      progress: 0
    })));

    // Ajouter une alerte de démarrage
    addAlert('success', 'Monitoring démarré - Tous les algorithmes sont actifs');

    // Démarrer l'intervalle de monitoring
    monitoringIntervalRef.current = setInterval(updateMonitoring, 1000);
  }, []);

  // Arrêter le monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    // Arrêter tous les algorithmes
    setAlgorithmStatuses(prev => prev.map(alg => ({
      ...alg,
      status: 'paused',
      endTime: Date.now(),
      duration: alg.startTime ? Date.now() - alg.startTime : alg.duration
    })));

    // Ajouter une alerte d'arrêt
    addAlert('info', 'Monitoring arrêté - Algorithmes en pause');

    // Arrêter l'intervalle
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
  }, []);

  // Réinitialiser le monitoring
  const resetMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    // Réinitialiser tous les algorithmes
    setAlgorithmStatuses(prev => prev.map(alg => ({
      ...alg,
      status: 'idle',
      startTime: undefined,
      endTime: undefined,
      duration: 0,
      progress: 0,
      quality: 0,
      accuracy: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      errorCount: 0,
      successCount: 0,
      lastError: undefined,
      lastSuccess: undefined
    })));

    // Réinitialiser les métriques globales
    setGlobalMetrics({
      totalProcessingTime: 0,
      averageQuality: 0,
      averageAccuracy: 0,
      totalMemoryUsage: 0,
      totalCpuUsage: 0,
      totalErrors: 0,
      totalSuccesses: 0,
      throughput: 0
    });

    // Vider les alertes
    setAlerts([]);

    // Arrêter l'intervalle
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }

    // Réinitialiser le temps de départ
    startTimeRef.current = Date.now();

    addAlert('info', 'Monitoring réinitialisé - Toutes les métriques ont été effacées');
  }, []);

  // Démarrer/arrêter un algorithme spécifique
  const toggleAlgorithm = useCallback((algorithmId: string) => {
    setAlgorithmStatuses(prev => prev.map(alg => {
      if (alg.id === algorithmId) {
        if (alg.status === 'running') {
          return {
            ...alg,
            status: 'paused',
            endTime: Date.now(),
            duration: alg.startTime ? Date.now() - alg.startTime : alg.duration
          };
        } else {
          return {
            ...alg,
            status: 'running',
            startTime: Date.now(),
            endTime: undefined
          };
        }
      }
      return alg;
    }));
  }, []);

  // Réinitialiser un algorithme spécifique
  const resetAlgorithm = useCallback((algorithmId: string) => {
    setAlgorithmStatuses(prev => prev.map(alg => {
      if (alg.id === algorithmId) {
        return {
          ...alg,
          status: 'idle',
          startTime: undefined,
          endTime: undefined,
          duration: 0,
          progress: 0,
          quality: 0,
          accuracy: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          errorCount: 0,
          successCount: 0,
          lastError: undefined,
          lastSuccess: undefined
        };
      }
      return alg;
    }));
  }, []);

  // Ajouter une alerte
  const addAlert = useCallback((type: Alert['type'], message: string) => {
    const newAlert: Alert = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      acknowledged: false
    };
    
    setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Garder max 10 alertes
  }, []);

  // Marquer une alerte comme acquittée
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  // Mettre à jour le monitoring
  const updateMonitoring = useCallback(() => {
    setAlgorithmStatuses(prev => prev.map(alg => {
      if (alg.status === 'running') {
        // Simuler la progression et les métriques
        const newProgress = Math.min(100, alg.progress + Math.random() * 10);
        const newQuality = Math.min(1, alg.quality + (Math.random() - 0.5) * 0.1);
        const newAccuracy = Math.min(1, alg.accuracy + (Math.random() - 0.5) * 0.1);
        const newMemoryUsage = Math.max(0, alg.memoryUsage + (Math.random() - 0.5) * 20);
        const newCpuUsage = Math.max(0, Math.min(100, alg.cpuUsage + (Math.random() - 0.5) * 10));

        // Simuler des erreurs occasionnelles
        if (Math.random() < 0.05 && newProgress < 100) {
          addAlert('error', `Erreur détectée dans ${alg.name}`);
          return {
            ...alg,
            progress: newProgress,
            quality: newQuality,
            accuracy: newAccuracy,
            memoryUsage: newMemoryUsage,
            cpuUsage: newCpuUsage,
            errorCount: alg.errorCount + 1,
            lastError: `Erreur simulée à ${new Date().toLocaleTimeString()}`
          };
        }

        // Simuler des succès
        if (newProgress >= 100) {
          addAlert('success', `${alg.name} terminé avec succès`);
          return {
            ...alg,
            status: 'completed',
            progress: 100,
            quality: newQuality,
            accuracy: newAccuracy,
            memoryUsage: newMemoryUsage,
            cpuUsage: newCpuUsage,
            successCount: alg.successCount + 1,
            lastSuccess: `Terminé à ${new Date().toLocaleTimeString()}`,
            endTime: Date.now(),
            duration: alg.startTime ? Date.now() - alg.startTime : alg.duration
          };
        }

        return {
          ...alg,
          progress: newProgress,
          quality: newQuality,
          accuracy: newAccuracy,
          memoryUsage: newMemoryUsage,
          cpuUsage: newCpuUsage
        };
      }
      return alg;
    }));
  }, [addAlert]);

  // Mettre à jour les métriques globales
  useEffect(() => {
    const activeAlgorithms = algorithmStatuses.filter(alg => alg.status === 'running' || alg.status === 'completed');
    
    if (activeAlgorithms.length > 0) {
      const totalProcessingTime = Date.now() - startTimeRef.current;
      const averageQuality = activeAlgorithms.reduce((sum, alg) => sum + alg.quality, 0) / activeAlgorithms.length;
      const averageAccuracy = activeAlgorithms.reduce((sum, alg) => sum + alg.accuracy, 0) / activeAlgorithms.length;
      const totalMemoryUsage = activeAlgorithms.reduce((sum, alg) => sum + alg.memoryUsage, 0);
      const totalCpuUsage = activeAlgorithms.reduce((sum, alg) => sum + alg.cpuUsage, 0) / activeAlgorithms.length;
      const totalErrors = activeAlgorithms.reduce((sum, alg) => sum + alg.errorCount, 0);
      const totalSuccesses = activeAlgorithms.reduce((sum, alg) => sum + alg.successCount, 0);
      const throughput = (totalSuccesses / (totalProcessingTime / 60000)) || 0; // opérations par minute

      setGlobalMetrics({
        totalProcessingTime,
        averageQuality,
        averageAccuracy,
        totalMemoryUsage,
        totalCpuUsage,
        totalErrors,
        totalSuccesses,
        throughput
      });
    }
  }, [algorithmStatuses]);

  // Nettoyer l'intervalle au démontage
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, []);

  // Vérifier les seuils d'alerte
  useEffect(() => {
    algorithmStatuses.forEach(alg => {
      if (alg.status === 'running') {
        // Alerte si la qualité est trop faible
        if (alg.quality < 0.3) {
          addAlert('warning', `Qualité faible détectée dans ${alg.name}: ${(alg.quality * 100).toFixed(1)}%`);
        }
        
        // Alerte si l'utilisation mémoire est élevée
        if (alg.memoryUsage > 200) {
          addAlert('warning', `Utilisation mémoire élevée dans ${alg.name}: ${alg.memoryUsage.toFixed(1)}MB`);
        }
        
        // Alerte si l'utilisation CPU est élevée
        if (alg.cpuUsage > 80) {
          addAlert('warning', `Utilisation CPU élevée dans ${alg.name}: ${alg.cpuUsage.toFixed(1)}%`);
        }
      }
    });
  }, [algorithmStatuses, addAlert]);

  const selectedAlgorithmData = selectedAlgorithm 
    ? algorithmStatuses.find(alg => alg.id === selectedAlgorithm)
    : null;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Monitoring Performance des Algorithmes
        </h2>
        <p className="text-gray-600">
          Surveillance en temps réel des performances et métriques des algorithmes avancés
        </p>
        <Badge variant="outline" className="mt-2 bg-green-50 text-green-700">
          🇩🇿 Phase 5 - Monitoring Performance
        </Badge>
      </div>

      {/* Contrôles globaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Contrôles Globaux
          </CardTitle>
          <CardDescription>
            Gérer le monitoring de tous les algorithmes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={startMonitoring}
              disabled={isMonitoring}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              Démarrer le Monitoring
            </Button>
            <Button 
              variant="outline" 
              onClick={stopMonitoring}
              disabled={!isMonitoring}
              className="flex-1"
            >
              <Pause className="w-4 h-4 mr-2" />
              Arrêter le Monitoring
            </Button>
            <Button 
              variant="outline" 
              onClick={resetMonitoring}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
          </div>

          {/* Statut global */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium">
                {isMonitoring ? 'Monitoring Actif' : 'Monitoring Inactif'}
              </span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="text-sm text-gray-600">
              Temps écoulé: {Math.floor(globalMetrics.totalProcessingTime / 1000)}s
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="text-sm text-gray-600">
              Algorithmes actifs: {algorithmStatuses.filter(alg => alg.status === 'running').length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques globales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Métriques Globales
          </CardTitle>
          <CardDescription>
            Vue d'ensemble des performances de tous les algorithmes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.floor(globalMetrics.totalProcessingTime / 1000)}s
              </div>
              <div className="text-sm text-blue-700">Temps Total</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {(globalMetrics.averageQuality * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-green-700">Qualité Moyenne</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(globalMetrics.averageAccuracy * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-purple-700">Précision Moyenne</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {globalMetrics.throughput.toFixed(1)}
              </div>
              <div className="text-sm text-orange-700">Opérations/min</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {globalMetrics.totalErrors}
              </div>
              <div className="text-sm text-red-700">Erreurs Total</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {globalMetrics.totalSuccesses}
              </div>
              <div className="text-sm text-green-700">Succès Total</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {globalMetrics.totalMemoryUsage.toFixed(1)}MB
              </div>
              <div className="text-sm text-blue-700">Mémoire Totale</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statut des algorithmes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-600" />
            Statut des Algorithmes
          </CardTitle>
          <CardDescription>
            Vue détaillée de chaque algorithme et ses métriques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {algorithmStatuses.map((algorithm) => (
            <div key={algorithm.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold">{algorithm.name}</h4>
                  <Badge 
                    variant={
                      algorithm.status === 'running' ? 'default' :
                      algorithm.status === 'completed' ? 'secondary' :
                      algorithm.status === 'error' ? 'destructive' :
                      algorithm.status === 'paused' ? 'outline' : 'secondary'
                    }
                  >
                    {algorithm.status === 'running' && <Zap className="w-3 h-3 mr-1 animate-pulse" />}
                    {algorithm.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {algorithm.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {algorithm.status === 'paused' && <Pause className="w-3 h-3 mr-1" />}
                    {algorithm.status === 'idle' && <Clock className="w-3 h-3 mr-1" />}
                    {algorithm.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAlgorithm(algorithm.id)}
                    disabled={algorithm.status === 'completed'}
                  >
                    {algorithm.status === 'running' ? 'Pause' : 'Démarrer'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetAlgorithm(algorithm.id)}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAlgorithm(algorithm.id);
                      setShowDetailedView(true);
                    }}
                  >
                    <BarChart3 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Progression */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progression</span>
                  <span>{algorithm.progress.toFixed(1)}%</span>
                </div>
                <Progress value={algorithm.progress} className="h-2" />
              </div>

              {/* Métriques rapides */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-blue-600">
                    {(algorithm.quality * 100).toFixed(1)}%
                  </div>
                  <div className="text-gray-500">Qualité</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-600">
                    {(algorithm.accuracy * 100).toFixed(1)}%
                  </div>
                  <div className="text-gray-500">Précision</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-purple-600">
                    {algorithm.memoryUsage.toFixed(1)}MB
                  </div>
                  <div className="text-gray-500">Mémoire</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-orange-600">
                    {algorithm.cpuUsage.toFixed(1)}%
                  </div>
                  <div className="text-gray-500">CPU</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-600">
                    {algorithm.duration > 0 ? Math.floor(algorithm.duration / 1000) : 0}s
                  </div>
                  <div className="text-gray-500">Durée</div>
                </div>
              </div>

              {/* Compteurs d'erreurs et succès */}
              <div className="flex gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">{algorithm.successCount}</span>
                  <span className="text-gray-500">succès</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">{algorithm.errorCount}</span>
                  <span className="text-gray-500">erreurs</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Vue détaillée d'un algorithme */}
      {showDetailedView && selectedAlgorithmData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Vue Détaillée: {selectedAlgorithmData.name}
            </CardTitle>
            <CardDescription>
              Métriques détaillées et historique de l'algorithme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Métriques détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📊 Métriques de Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Qualité actuelle:</span>
                    <span className="font-medium">{(selectedAlgorithmData.quality * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Précision actuelle:</span>
                    <span className="font-medium">{(selectedAlgorithmData.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilisation mémoire:</span>
                    <span className="font-medium">{selectedAlgorithmData.memoryUsage.toFixed(1)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilisation CPU:</span>
                    <span className="font-medium">{selectedAlgorithmData.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temps d'exécution:</span>
                    <span className="font-medium">
                      {selectedAlgorithmData.duration > 0 ? Math.floor(selectedAlgorithmData.duration / 1000) : 0}s
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">📈 Statistiques</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Succès total:</span>
                    <span className="font-medium text-green-600">{selectedAlgorithmData.successCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Erreurs total:</span>
                    <span className="font-medium text-red-600">{selectedAlgorithmData.errorCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux de succès:</span>
                    <span className="font-medium">
                      {selectedAlgorithmData.successCount + selectedAlgorithmData.errorCount > 0 
                        ? ((selectedAlgorithmData.successCount / (selectedAlgorithmData.successCount + selectedAlgorithmData.errorCount)) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dernière exécution:</span>
                    <span className="font-medium">
                      {selectedAlgorithmData.lastSuccess || 'Aucune'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dernière erreur:</span>
                    <span className="font-medium">
                      {selectedAlgorithmData.lastError || 'Aucune'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphiques de performance (simulés) */}
            <div>
              <h4 className="font-semibold mb-3">📊 Évolution des Métriques</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">Qualité</div>
                  <div className="text-3xl font-bold text-blue-700">
                    {(selectedAlgorithmData.quality * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-blue-600">Tendance stable</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">Précision</div>
                  <div className="text-3xl font-bold text-green-700">
                    {(selectedAlgorithmData.accuracy * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-green-600">En amélioration</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">Efficacité</div>
                  <div className="text-3xl font-bold text-purple-700">
                    {Math.round((selectedAlgorithmData.quality + selectedAlgorithmData.accuracy) * 50)}%
                  </div>
                  <div className="text-sm text-purple-600">Score global</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDetailedView(false)}
                className="flex-1"
              >
                Fermer la Vue Détaillée
              </Button>
              <Button 
                variant="outline" 
                onClick={() => resetAlgorithm(selectedAlgorithmData.id)}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser cet Algorithme
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Système d'alertes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Système d'Alertes
          </CardTitle>
          <CardDescription>
            Notifications en temps réel des événements et problèmes détectés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Info className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Aucune alerte pour le moment</p>
              <p className="text-sm">Les alertes apparaîtront ici lors du monitoring</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'error' ? 'bg-red-50 border-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  alert.type === 'success' ? 'bg-green-50 border-green-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {alert.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                    {alert.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {alert.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                    <span className="text-sm font-medium">{alert.message}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                    {!alert.acknowledged && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="h-6 px-2 text-xs"
                      >
                        Acquitter
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Informations sur le monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            À Propos du Monitoring
          </CardTitle>
          <CardDescription>
            Détails techniques du système de surveillance des algorithmes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700">🔍 Métriques Surveillées</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Temps d'exécution et progression</li>
                <li>• Qualité et précision des résultats</li>
                <li>• Utilisation mémoire et CPU</li>
                <li>• Compteurs d'erreurs et succès</li>
                <li>• Historique des performances</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700">⚡ Système d'Alertes</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Détection automatique des problèmes</li>
                <li>• Seuils configurables</li>
                <li>• Notifications en temps réel</li>
                <li>• Historique des alertes</li>
                <li>• Système d'acquittement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};