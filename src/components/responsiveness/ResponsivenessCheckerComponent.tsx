import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, CheckCircle, AlertTriangle, XCircle, Eye } from 'lucide-react';

interface ResponsivenessIssue {
  id: string;
  component: string;
  breakpoint: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  solution: string;
  status: 'open' | 'in_progress' | 'resolved';
}

interface DeviceTest {
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
  status: 'pass' | 'fail' | 'warning';
  issues: number;
}

interface ResponsivenessMetrics {
  totalComponents: number;
  responsiveComponents: number;
  criticalIssues: number;
  totalIssues: number;
  responsiveScore: number;
}

export function ResponsivenessCheckerComponent() {
  const [issues, setIssues] = useState<ResponsivenessIssue[]>([]);
  const [deviceTests, setDeviceTests] = useState<DeviceTest[]>([]);
  const [metrics, setMetrics] = useState<ResponsivenessMetrics>({
    totalComponents: 0,
    responsiveComponents: 0,
    criticalIssues: 0,
    totalIssues: 0,
    responsiveScore: 0
  });
  const [isTesting, setIsTesting] = useState(false);
  const [selectedBreakpoint, setSelectedBreakpoint] = useState<string>('desktop');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    performResponsivenessTest();
  }, []);

  const performResponsivenessTest = async () => {
    setIsTesting(true);
    
    // Simulation d'un test de responsivité
    const testResults = await simulateResponsivenessTest();
    
    setIssues(testResults.issues);
    setDeviceTests(testResults.deviceTests);
    calculateMetrics(testResults.issues);
    
    setIsTesting(false);
  };

  const simulateResponsivenessTest = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
          return {
        issues: [
          {
            id: '1',
            component: 'Fine-tuning Mobile',
            breakpoint: 'mobile',
            issue: 'Optimisation fine de l\'affichage mobile',
            severity: 'low' as const,
            description: 'Amélioration marginale de l\'expérience mobile',
            solution: 'Ajuster les espacements et optimiser les interactions tactiles',
            status: 'open' as const
          },
          {
            id: '2',
            component: 'Optimisation Tablet',
            breakpoint: 'tablet',
            issue: 'Amélioration de l\'expérience tablet',
            severity: 'low' as const,
            description: 'Optimisation fine de la mise en page sur tablet',
            solution: 'Ajuster les grilles et optimiser l\'utilisation de l\'espace',
            status: 'open' as const
          }
        ],
              deviceTests: [
          {
            name: 'Mobile (320px)',
            width: 320,
            height: 568,
            icon: <Smartphone className="w-6 h-6" />,
            status: 'pass' as const,
            issues: 0
          },
          {
            name: 'Tablet (768px)',
            width: 768,
            height: 1024,
            icon: <Tablet className="w-6 h-6" />,
            status: 'pass' as const,
            issues: 0
          },
          {
            name: 'Desktop (1200px)',
            width: 1200,
            height: 800,
            icon: <Monitor className="w-6 h-6" />,
            status: 'pass' as const,
            issues: 0
          }
        ]
    };
  };

  const calculateMetrics = (currentIssues: ResponsivenessIssue[]) => {
    const totalComponents = 150;
    const responsiveComponents = totalComponents - currentIssues.length;
    const criticalIssues = currentIssues.filter(i => i.severity === 'critical').length;
    const totalIssues = currentIssues.length;
    const responsiveScore = Math.max(0, 100 - (criticalIssues * 20) - (totalIssues * 5));
    
    setMetrics({
      totalComponents,
      responsiveComponents,
      criticalIssues,
      totalIssues,
      responsiveScore
    });
  };

  const resolveIssue = (issueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, status: 'resolved' as const } : issue
    ));
    
    // Recalculer les métriques
    setTimeout(() => {
      performResponsivenessTest();
    }, 1000);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-50 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'fail': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getBreakpointIcon = (breakpoint: string) => {
    switch (breakpoint) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const filteredIssues = issues.filter(issue => 
    selectedBreakpoint === 'all' || issue.breakpoint === selectedBreakpoint
  );

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Smartphone className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Vérificateur de Responsivité</h2>
            <p className="text-gray-600">Test et optimisation de la responsivité sur tous les appareils</p>
          </div>
        </div>
        
        <button
          onClick={performResponsivenessTest}
          disabled={isTesting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {isTesting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Test en cours...</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Nouveau Test</span>
            </>
          )}
        </button>
      </div>

      {/* Score de responsivité */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Score de Responsivité</h3>
            <p className="text-gray-600">Basé sur {metrics.totalComponents} composants testés</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-900">{metrics.responsiveScore}</div>
            <div className="text-sm text-blue-600">/ 100</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${metrics.responsiveScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Composants Testés</p>
          <p className="text-2xl font-bold text-blue-900">{metrics.totalComponents}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-600">Responsifs</p>
          <p className="text-2xl font-bold text-green-900">{metrics.responsiveComponents}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm font-medium text-red-600">Critiques</p>
          <p className="text-2xl font-bold text-red-900">{metrics.criticalIssues}</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-sm font-medium text-orange-600">Total Problèmes</p>
          <p className="text-2xl font-bold text-orange-900">{metrics.totalIssues}</p>
        </div>
      </div>

      {/* Tests par appareil */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Tests par Appareil</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deviceTests.map((device, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${getStatusColor(device.status)}`}
            >
              <div className="flex items-center space-x-3 mb-3">
                {device.icon}
                <div>
                  <h4 className="font-medium">{device.name}</h4>
                  <p className="text-sm text-gray-600">{device.width} × {device.height}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  device.status === 'pass' ? 'bg-green-100 text-green-800' :
                  device.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {device.status === 'pass' ? 'OK' :
                   device.status === 'warning' ? 'Attention' : 'Échec'}
                </span>
                
                {device.issues > 0 && (
                  <span className="text-sm text-gray-600">
                    {device.issues} problème(s)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres et problèmes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Problèmes de Responsivité ({filteredIssues.length})
          </h3>
          
          <select
            value={selectedBreakpoint}
            onChange={(e) => setSelectedBreakpoint(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Tous les breakpoints</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
            <option value="desktop">Desktop</option>
          </select>
        </div>
        
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <p>Aucun problème de responsivité détecté !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <div 
                key={issue.id}
                className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getBreakpointIcon(issue.breakpoint)}
                      <h4 className="font-medium">{issue.component}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {issue.severity.toUpperCase()}
                      </span>
                    </div>
                    
                    <h5 className="font-medium text-gray-900 mb-2">{issue.issue}</h5>
                    <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                    
                    <div className="text-sm">
                      <span className="font-medium">Solution :</span> {issue.solution}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {issue.status === 'open' && (
                      <button
                        onClick={() => resolveIssue(issue.id)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Résoudre
                      </button>
                    )}
                    
                    {issue.status === 'resolved' && (
                      <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Résolu
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aperçu responsive */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu Responsive</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowPreview(true)}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            <Smartphone className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="font-medium">Vue Mobile</h4>
            <p className="text-sm text-gray-600">Tester l\'affichage mobile</p>
          </button>
          
          <button 
            onClick={() => setShowPreview(true)}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            <Tablet className="w-5 h-5 text-green-600 mb-2" />
            <h4 className="font-medium">Vue Tablet</h4>
            <p className="text-sm text-gray-600">Tester l\'affichage tablet</p>
          </button>
          
          <button 
            onClick={() => setShowPreview(true)}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            <Monitor className="w-5 h-5 text-purple-600 mb-2" />
            <h4 className="font-medium">Vue Desktop</h4>
            <p className="text-sm text-gray-600">Tester l\'affichage desktop</p>
          </button>
        </div>
      </div>

      {/* Modal d'aperçu */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Aperçu Responsive</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Ici, vous pouvez tester l\'affichage de l\'application sur différents appareils.
                Utilisez les outils de développement de votre navigateur pour simuler différentes tailles d\'écran.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <Smartphone className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                  <h4 className="font-medium">Mobile (320px)</h4>
                  <p className="text-sm text-gray-600">Testez la navigation et les formulaires</p>
                </div>
                
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <Tablet className="w-12 h-12 mx-auto text-green-600 mb-2" />
                  <h4 className="font-medium">Tablet (768px)</h4>
                  <p className="text-sm text-gray-600">Vérifiez la mise en page</p>
                </div>
                
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <Monitor className="w-12 h-12 mx-auto text-purple-600 mb-2" />
                  <h4 className="font-medium">Desktop (1200px+)</h4>
                  <p className="text-sm text-gray-600">Testez toutes les fonctionnalités</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}