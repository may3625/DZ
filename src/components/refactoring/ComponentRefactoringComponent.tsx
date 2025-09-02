import React, { useState, useEffect } from 'react';
import { Scissors, Code, Layers, GitBranch, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface LargeComponent {
  path: string;
  lines: number;
  complexity: number;
  components: number;
  functions: number;
  imports: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  dependencies: string[];
}

interface RefactoringPlan {
  id: string;
  componentPath: string;
  targetComponents: string[];
  estimatedLines: number[];
  complexity: 'low' | 'medium' | 'high';
  estimatedTime: number;
  dependencies: string[];
  status: 'planned' | 'in_progress' | 'completed' | 'failed';
}

interface RefactoringMetrics {
  totalComponents: number;
  largeComponents: number;
  refactoredComponents: number;
  totalLines: number;
  averageLines: number;
  complexityScore: number;
}

export function ComponentRefactoringComponent() {
  const [largeComponents, setLargeComponents] = useState<LargeComponent[]>([]);
  const [refactoringPlans, setRefactoringPlans] = useState<RefactoringPlan[]>([]);
  const [metrics, setMetrics] = useState<RefactoringMetrics>({
    totalComponents: 0,
    largeComponents: 0,
    refactoredComponents: 0,
    totalLines: 0,
    averageLines: 0,
    complexityScore: 0
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());

  useEffect(() => {
    performComponentAnalysis();
  }, []);

  const performComponentAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulation d'une analyse des composants
    const analysisResults = await simulateComponentAnalysis();
    
    setLargeComponents(analysisResults.largeComponents);
    setRefactoringPlans(analysisResults.refactoringPlans);
    calculateMetrics(analysisResults.largeComponents);
    
    setIsAnalyzing(false);
  };

  const simulateComponentAnalysis = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      largeComponents: [
        {
          path: 'src/components/ocr/DZOCRIAProcessor.tsx',
          lines: 1200,
          complexity: 25,
          components: 4,
          functions: 12,
          imports: 8,
          status: 'completed' as const,
          priority: 'low' as const,
          estimatedTime: 1,
          dependencies: ['OCR', 'AI', 'Processing']
        },
        {
          path: 'src/components/procedures/ProcedureCatalogTab.tsx',
          lines: 450,
          complexity: 18,
          components: 3,
          functions: 8,
          imports: 6,
          status: 'completed' as const,
          priority: 'low' as const,
          estimatedTime: 0.5,
          dependencies: ['Procedures', 'Catalog', 'UI']
        },
        {
          path: 'src/components/help/AdminGuideSection.tsx',
          lines: 380,
          complexity: 15,
          components: 2,
          functions: 6,
          imports: 5,
          status: 'completed' as const,
          priority: 'low' as const,
          estimatedTime: 0.3,
          dependencies: ['Help', 'Admin', 'Documentation']
        },
        {
          path: 'src/components/news-references/DirectoriesSection.tsx',
          lines: 320,
          complexity: 12,
          components: 2,
          functions: 5,
          imports: 4,
          status: 'completed' as const,
          priority: 'low' as const,
          estimatedTime: 0.2,
          dependencies: ['News', 'References', 'Directories']
        },
        {
          path: 'src/components/ocr/OCRSettingsComponent.tsx',
          lines: 280,
          complexity: 10,
          components: 2,
          functions: 4,
          imports: 3,
          status: 'completed' as const,
          priority: 'low' as const,
          estimatedTime: 0.2,
          dependencies: ['OCR', 'Settings', 'Configuration']
        }
      ],
      refactoringPlans: [
        {
          id: '1',
          componentPath: 'src/components/ocr/DZOCRIAProcessor.tsx',
          targetComponents: [
            'OCRProcessor.tsx',
            'OCRValidator.tsx',
            'OCRResults.tsx',
            'OCRWorkflow.tsx'
          ],
          estimatedLines: [300, 200, 150, 100],
          complexity: 'low' as const,
          estimatedTime: 1,
          dependencies: ['OCR', 'AI', 'Processing'],
          status: 'completed' as const
        },
        {
          id: '2',
          componentPath: 'src/components/procedures/ProcedureCatalogTab.tsx',
          targetComponents: [
            'ProcedureList.tsx',
            'ProcedureFilters.tsx',
            'ProcedureDetails.tsx'
          ],
          estimatedLines: [150, 100, 80],
          complexity: 'low' as const,
          estimatedTime: 0.5,
          dependencies: ['Procedures', 'Catalog', 'UI'],
          status: 'completed' as const
        }
      ]
    };
  };

  const calculateMetrics = (components: LargeComponent[]) => {
    const totalComponents = 1250;
    const largeComponents = components.length;
    const refactoredComponents = components.filter(c => c.status === 'completed').length;
    const totalLines = components.reduce((sum, c) => sum + c.lines, 0);
    const averageLines = totalLines / largeComponents;
    const complexityScore = components.reduce((sum, c) => sum + c.complexity, 0) / largeComponents;
    
    setMetrics({
      totalComponents,
      largeComponents,
      refactoredComponents,
      totalLines,
      averageLines,
      complexityScore
    });
  };

  const startRefactoring = (componentPath: string) => {
    setLargeComponents(prev => prev.map(c => 
      c.path === componentPath ? { ...c, status: 'in_progress' as const } : c
    ));
    
    setRefactoringPlans(prev => prev.map(p => 
      p.componentPath === componentPath ? { ...p, status: 'in_progress' as const } : p
    ));
  };

  const completeRefactoring = (componentPath: string) => {
    setLargeComponents(prev => prev.map(c => 
      c.path === componentPath ? { ...c, status: 'completed' as const } : c
    ));
    
    setRefactoringPlans(prev => prev.map(p => 
      p.componentPath === componentPath ? { ...p, status: 'completed' as const } : p
    ));
    
    // Recalculer les métriques
    setTimeout(() => {
      performComponentAnalysis();
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity >= 80) return 'text-red-600';
    if (complexity >= 60) return 'text-yellow-600';
    if (complexity >= 40) return 'text-blue-600';
    return 'text-green-600';
  };

  const formatTime = (hours: number) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}j ${remainingHours}h`;
    }
    return `${hours}h`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'failed': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Scissors className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Refactorisation des Composants</h2>
            <p className="text-gray-600">Division des composants volumineux en composants plus petits</p>
          </div>
        </div>
        
        <button
          onClick={performComponentAnalysis}
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
              <Code className="w-4 h-4" />
              <span>Nouvelle Analyse</span>
            </>
          )}
        </button>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Composants Volumineux</p>
          <p className="text-2xl font-bold text-blue-900">{metrics.largeComponents}</p>
          <p className="text-sm text-blue-600">sur {metrics.totalComponents} total</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-600">Refactorisés</p>
          <p className="text-2xl font-bold text-green-900">{metrics.refactoredComponents}</p>
          <p className="text-sm text-green-600">composants terminés</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm font-medium text-purple-600">Complexité Moyenne</p>
          <p className="text-2xl font-bold text-purple-900">{metrics.complexityScore.toFixed(0)}</p>
          <p className="text-sm text-purple-600">/ 100</p>
        </div>
      </div>

      {/* Composants volumineux */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Composants Volumineux ({largeComponents.length})
        </h3>
        
        <div className="space-y-3">
          {largeComponents.map((component, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${getStatusColor(component.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(component.status)}
                    <h4 className="font-medium text-gray-900">{component.path}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(component.priority)}`}>
                      {component.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="font-medium">Lignes :</span> {component.lines.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Complexité :</span> 
                      <span className={`ml-1 ${getComplexityColor(component.complexity)}`}>
                        {component.complexity}/100
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Composants :</span> {component.components}
                    </div>
                    <div>
                      <span className="font-medium">Fonctions :</span> {component.functions}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Imports :</span> {component.imports}
                    </div>
                    <div>
                      <span className="font-medium">Temps estimé :</span> {formatTime(component.estimatedTime)}
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="font-medium text-sm">Dépendances :</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {component.dependencies.map((dep, depIndex) => (
                        <span 
                          key={depIndex}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 flex flex-col space-y-2">
                  {component.status === 'pending' && (
                    <button
                      onClick={() => startRefactoring(component.path)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Commencer
                    </button>
                  )}
                  
                  {component.status === 'in_progress' && (
                    <button
                      onClick={() => completeRefactoring(component.path)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Terminer
                    </button>
                  )}
                  
                  {component.status === 'completed' && (
                    <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Terminé
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plans de refactorisation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Plans de Refactorisation ({refactoringPlans.length})
        </h3>
        
        <div className="space-y-3">
          {refactoringPlans.map((plan) => (
            <div key={plan.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900">{plan.componentPath}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  plan.complexity === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                  plan.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                  'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  Complexité {plan.complexity}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="font-medium text-sm">Composants cibles :</span>
                  <div className="mt-1 space-y-1">
                    {plan.targetComponents.map((target, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{target}</span>
                        <span className="text-gray-500">~{plan.estimatedLines[index]} lignes</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Temps estimé :</span> {formatTime(plan.estimatedTime)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Statut :</span> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                      plan.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {plan.status === 'completed' ? 'Terminé' :
                       plan.status === 'in_progress' ? 'En cours' : 'Planifié'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <span className="font-medium">Dépendances :</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {plan.dependencies.map((dep, depIndex) => (
                    <span 
                      key={depIndex}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions de refactorisation */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions de Refactorisation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <GitBranch className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="font-medium">Créer une branche</h4>
            <p className="text-sm text-gray-600">Isoler les changements de refactorisation</p>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <Layers className="w-5 h-5 text-green-600 mb-2" />
            <h4 className="font-medium">Extraire des composants</h4>
            <p className="text-sm text-gray-600">Diviser les composants volumineux</p>
          </button>
        </div>
      </div>
    </div>
  );
}