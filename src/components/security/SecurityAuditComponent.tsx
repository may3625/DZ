import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthState } from '@/hooks/useAuthState';

interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  status: 'open' | 'resolved' | 'ignored';
  category: 'authentication' | 'authorization' | 'data' | 'network' | 'configuration';
}

interface SecurityMetrics {
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  resolvedIssues: number;
  securityScore: number;
}

export function SecurityAuditComponent() {
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalIssues: 0,
    criticalIssues: 0,
    highIssues: 0,
    mediumIssues: 0,
    lowIssues: 0,
    resolvedIssues: 0,
    securityScore: 0
  });
  const [showResolved, setShowResolved] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { user, userRole } = useAuthState();

  // Audit de sécurité automatique
  useEffect(() => {
    performSecurityAudit();
  }, []);

  const performSecurityAudit = async () => {
    setIsScanning(true);
    
    // Simulation d'un audit de sécurité
    const auditResults = await simulateSecurityAudit();
    
    setIssues(auditResults);
    calculateMetrics(auditResults);
    
    setIsScanning(false);
  };

  const simulateSecurityAudit = async (): Promise<SecurityIssue[]> => {
    // Simulation d'un audit de sécurité complet
    await new Promise(resolve => setTimeout(resolve, 2000));
    
          return [
        {
          id: '1',
          severity: 'low',
          title: 'Optimisation des headers de sécurité',
          description: 'Amélioration fine des headers de sécurité HTTP',
          recommendation: 'Implémenter des headers de sécurité avancés',
          status: 'open',
          category: 'network'
        },
        {
          id: '2',
          severity: 'low',
          title: 'Amélioration de la journalisation',
          description: 'Optimisation des logs de sécurité pour la production',
          recommendation: 'Configurer des niveaux de log adaptés à la production',
          status: 'open',
          category: 'configuration'
        },
        {
          id: '3',
          severity: 'low',
          title: 'Fine-tuning de l\'authentification',
          description: 'Optimisation des paramètres d\'authentification',
          recommendation: 'Ajuster les paramètres de sécurité selon les besoins',
          status: 'open',
          category: 'authentication'
        }
      ];
  };

  const calculateMetrics = (currentIssues: SecurityIssue[]) => {
    const total = currentIssues.length;
    const critical = currentIssues.filter(i => i.severity === 'critical').length;
    const high = currentIssues.filter(i => i.severity === 'high').length;
    const medium = currentIssues.filter(i => i.severity === 'medium').length;
    const low = currentIssues.filter(i => i.severity === 'low').length;
    const resolved = currentIssues.filter(i => i.status === 'resolved').length;
    
    // Calcul du score de sécurité (0-100)
    const score = Math.max(0, 100 - (critical * 25) - (high * 15) - (medium * 10) - (low * 5));
    
    setMetrics({
      totalIssues: total,
      criticalIssues: critical,
      highIssues: high,
      mediumIssues: medium,
      lowIssues: low,
      resolvedIssues: resolved,
      securityScore: score
    });
  };

  const resolveIssue = (issueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, status: 'resolved' as const } : issue
    ));
    performSecurityAudit(); // Recalculer les métriques
  };

  const ignoreIssue = (issueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, status: 'ignored' as const } : issue
    ));
    performSecurityAudit(); // Recalculer les métriques
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredIssues = showResolved 
    ? issues 
    : issues.filter(issue => issue.status !== 'resolved');

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Audit de Sécurité</h2>
            <p className="text-gray-600">Surveillance et amélioration de la sécurité</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={performSecurityAudit}
            disabled={isScanning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {isScanning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Scan en cours...</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Nouveau Scan</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            {showResolved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showResolved ? 'Masquer résolus' : 'Afficher résolus'}</span>
          </button>
        </div>
      </div>

      {/* Score de sécurité */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Score de Sécurité</p>
              <p className="text-2xl font-bold text-blue-900">{metrics.securityScore}/100</p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.securityScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm font-medium text-red-600">Critiques</p>
          <p className="text-2xl font-bold text-red-900">{metrics.criticalIssues}</p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-sm font-medium text-orange-600">Élevés</p>
          <p className="text-2xl font-bold text-orange-900">{metrics.highIssues}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-600">Résolus</p>
          <p className="text-2xl font-bold text-green-900">{metrics.resolvedIssues}</p>
        </div>
      </div>

      {/* Liste des problèmes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Problèmes de Sécurité ({filteredIssues.length})
        </h3>
        
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <p>Aucun problème de sécurité détecté !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <div 
                key={issue.id}
                className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{issue.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          issue.category === 'authentication' ? 'bg-purple-100 text-purple-800' :
                          issue.category === 'authorization' ? 'bg-indigo-100 text-indigo-800' :
                          issue.category === 'data' ? 'bg-pink-100 text-pink-800' :
                          issue.category === 'network' ? 'bg-teal-100 text-teal-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {issue.category}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{issue.description}</p>
                      <p className="text-sm font-medium">
                        <span className="text-gray-600">Recommandation :</span> {issue.recommendation}
                      </p>
                    </div>
                  </div>
                  
                  {issue.status === 'open' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => resolveIssue(issue.id)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Résoudre
                      </button>
                      <button
                        onClick={() => ignoreIssue(issue.id)}
                        className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Ignorer
                      </button>
                    </div>
                  )}
                  
                  {issue.status === 'resolved' && (
                    <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full ml-4">
                      Résolu
                    </span>
                  )}
                  
                  {issue.status === 'ignored' && (
                    <span className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full ml-4">
                      Ignoré
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions de sécurité */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions de Sécurité</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <Lock className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="font-medium">Renforcer l'authentification</h4>
            <p className="text-sm text-gray-600">Activer l'authentification à deux facteurs</p>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <Shield className="w-5 h-5 text-green-600 mb-2" />
            <h4 className="font-medium">Mettre à jour les politiques</h4>
            <p className="text-sm text-gray-600">Revoir et mettre à jour les politiques de sécurité</p>
          </button>
        </div>
      </div>
    </div>
  );
}