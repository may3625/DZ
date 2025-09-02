import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Clock, Cpu, HardDrive, Network, Activity, Database } from 'lucide-react';

interface PerformanceMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
}

interface BundleAnalysis {
  name: string;
  size: number;
  gzipSize: number;
  impact: 'high' | 'medium' | 'low';
  optimization: string;
}

interface PerformanceIssue {
  id: string;
  type: 'bundle' | 'rendering' | 'network' | 'memory' | 'cpu';
  severity: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  solution: string;
  estimatedImprovement: number;
}

export function PerformanceOptimizationComponent() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [bundleAnalysis, setBundleAnalysis] = useState<BundleAnalysis[]>([]);
  const [issues, setIssues] = useState<PerformanceIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedOptimizations, setSelectedOptimizations] = useState<Set<string>>(new Set());

  useEffect(() => {
    performPerformanceAnalysis();
  }, []);

  const performPerformanceAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulation d'une analyse de performance
    const analysisResults = await simulatePerformanceAnalysis();
    
    setMetrics(analysisResults.metrics);
    setBundleAnalysis(analysisResults.bundleAnalysis);
    setIssues(analysisResults.issues);
    
    setIsAnalyzing(false);
  };

  const simulatePerformanceAnalysis = async () => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    return {
      metrics: [
        {
          name: 'Temps de chargement initial',
          current: 1.2,
          target: 1.0,
          unit: 's',
          status: 'excellent' as const,
          trend: 'improving' as const
        },
        {
          name: 'Temps de rendu',
          current: 18,
          target: 16,
          unit: 'ms',
          status: 'excellent' as const,
          trend: 'improving' as const
        },
        {
          name: 'Taille du bundle',
          current: 0.6,
          target: 0.5,
          unit: 'MB',
          status: 'excellent' as const,
          trend: 'improving' as const
        },
        {
          name: 'Utilisation mémoire',
          current: 45,
          target: 40,
          unit: '%',
          status: 'excellent' as const,
          trend: 'improving' as const
        },
        {
          name: 'Score Lighthouse',
          current: 95,
          target: 95,
          unit: '/100',
          status: 'excellent' as const,
          trend: 'improving' as const
        }
      ],
      bundleAnalysis: [
        {
          name: 'vendor.js',
          size: 420,
          gzipSize: 140,
          impact: 'low' as const,
          optimization: 'Tree shaking avancé et code splitting optimisé'
        },
        {
          name: 'app.js',
          size: 180,
          gzipSize: 55,
          impact: 'low' as const,
          optimization: 'Lazy loading intelligent et composants optimisés'
        },
        {
          name: 'styles.css',
          size: 95,
          gzipSize: 25,
          impact: 'low' as const,
          optimization: 'Purge CSS avancé et CSS-in-JS optimisé'
        }
      ],
      issues: [
        {
          id: '1',
          type: 'bundle' as const,
          severity: 'low' as const,
          description: 'Optimisation mineure des bundles',
          impact: 'Amélioration marginale du temps de chargement',
          solution: 'Fine-tuning du tree shaking et code splitting',
          estimatedImprovement: 8
        },
        {
          id: '2',
          type: 'rendering' as const,
          severity: 'low' as const,
          description: 'Optimisation des composants React',
          impact: 'Amélioration fine des performances de rendu',
          solution: 'Optimisation avancée des hooks et React.memo',
          estimatedImprovement: 5
        },
        {
          id: '3',
          type: 'network' as const,
          severity: 'low' as const,
          description: 'Optimisation du cache réseau',
          impact: 'Amélioration marginale de la latence',
          solution: 'Optimisation avancée du cache et de la pagination',
          estimatedImprovement: 3
        }
      ]
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-600" />;
      case 'declining': return <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case 'bundle': return <HardDrive className="w-5 h-5 text-blue-600" />;
      case 'rendering': return <Cpu className="w-5 h-5 text-green-600" />;
      case 'network': return <Network className="w-5 h-5 text-purple-600" />;
      case 'memory': return <Database className="w-5 h-5 text-orange-600" />;
      case 'cpu': return <Cpu className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatSize = (size: number) => {
    return size >= 1024 ? `${(size / 1024).toFixed(1)} MB` : `${size} KB`;
  };

  const calculateOverallScore = () => {
    const totalMetrics = metrics.length;
    const excellentCount = metrics.filter(m => m.status === 'excellent').length;
    const goodCount = metrics.filter(m => m.status === 'good').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    
    return Math.round((excellentCount * 100 + goodCount * 80 + warningCount * 60 + criticalCount * 30) / totalMetrics);
  };

  const overallScore = calculateOverallScore();

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Zap className="w-8 h-8 text-yellow-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Optimisation des Performances</h2>
            <p className="text-gray-600">Analyse et amélioration des performances de l'application</p>
          </div>
        </div>
        
        <button
          onClick={performPerformanceAnalysis}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyse en cours...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Nouvelle Analyse</span>
            </>
          )}
        </button>
      </div>

      {/* Score global */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Score de Performance Global</h3>
            <p className="text-gray-600">Basé sur {metrics.length} métriques clés</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-900">{overallScore}</div>
            <div className="text-sm text-blue-600">/ 100</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${overallScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Métriques de Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{metric.name}</h4>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold">{metric.current}</span>
                <span className="text-sm text-gray-600">{metric.unit}</span>
              </div>
              
              <div className="mt-2 text-sm text-gray-600">
                Objectif: {metric.target} {metric.unit}
              </div>
              
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      metric.status === 'excellent' ? 'bg-green-500' :
                      metric.status === 'good' ? 'bg-blue-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analyse des bundles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Analyse des Bundles</h3>
        <div className="space-y-3">
          {bundleAnalysis.map((bundle, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{bundle.name}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(bundle.impact)}`}>
                  Impact {bundle.impact}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Taille originale :</span> {formatSize(bundle.size)}
                </div>
                <div>
                  <span className="font-medium">Taille gzippée :</span> {formatSize(bundle.gzipSize)}
                </div>
                <div>
                  <span className="font-medium">Optimisation :</span> {bundle.optimization}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Problèmes identifiés */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Problèmes Identifiés</h3>
        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={issue.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start space-x-3">
                {getIssueTypeIcon(issue.type)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{issue.description}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      issue.severity === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                      issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {issue.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Impact :</span> {issue.impact}
                    </div>
                    <div>
                      <span className="font-medium">Amélioration estimée :</span> {issue.estimatedImprovement}%
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Solution :</span> {issue.solution}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions d'optimisation */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions d'Optimisation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <Zap className="w-5 h-5 text-yellow-600 mb-2" />
            <h4 className="font-medium">Optimiser les bundles</h4>
            <p className="text-sm text-gray-600">Réduire la taille des bundles JavaScript</p>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <Cpu className="w-5 h-5 text-green-600 mb-2" />
            <h4 className="font-medium">Optimiser le rendu</h4>
            <p className="text-sm text-gray-600">Améliorer les performances de rendu React</p>
          </button>
        </div>
      </div>
    </div>
  );
}