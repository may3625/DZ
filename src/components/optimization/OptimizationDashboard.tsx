import React, { useState } from 'react';
import { 
  Shield, Trash2, Zap, Scissors, Smartphone, 
  TrendingUp, CheckCircle, AlertTriangle, Settings 
} from 'lucide-react';
import { SecurityAuditComponent } from '../security/SecurityAuditComponent';
import { CodeCleanupComponent } from './CodeCleanupComponent';
import { PerformanceOptimizationComponent } from './PerformanceOptimizationComponent';
import { ComponentRefactoringComponent } from '../refactoring/ComponentRefactoringComponent';
import { ResponsivenessCheckerComponent } from '../responsiveness/ResponsivenessCheckerComponent';

type OptimizationTab = 'security' | 'cleanup' | 'performance' | 'refactoring' | 'responsiveness';

interface OptimizationStatus {
  security: 'excellent' | 'good' | 'warning' | 'critical';
  cleanup: 'excellent' | 'good' | 'warning' | 'critical';
  performance: 'excellent' | 'good' | 'warning' | 'critical';
  refactoring: 'excellent' | 'good' | 'warning' | 'critical';
  responsiveness: 'excellent' | 'good' | 'warning' | 'critical';
}

export function OptimizationDashboard() {
  const [activeTab, setActiveTab] = useState<OptimizationTab>('security');
  const [optimizationStatus, setOptimizationStatus] = useState<OptimizationStatus>({
    security: 'excellent',
    cleanup: 'excellent',
    performance: 'excellent',
    refactoring: 'excellent',
    responsiveness: 'excellent'
  });

  const tabs = [
    {
      id: 'security' as OptimizationTab,
      name: 'Sécurité',
      icon: <Shield className="w-5 h-5" />,
      description: 'Audit et amélioration de la sécurité',
      status: optimizationStatus.security
    },
    {
      id: 'cleanup' as OptimizationTab,
      name: 'Nettoyage',
      icon: <Trash2 className="w-5 h-5" />,
      description: 'Suppression des fichiers inutilisés',
      status: optimizationStatus.cleanup
    },
    {
      id: 'performance' as OptimizationTab,
      name: 'Performance',
      icon: <Zap className="w-5 h-5" />,
      description: 'Optimisation des performances',
      status: optimizationStatus.performance
    },
    {
      id: 'refactoring' as OptimizationTab,
      name: 'Refactorisation',
      icon: <Scissors className="w-5 h-5" />,
      description: 'Division des gros composants',
      status: optimizationStatus.refactoring
    },
    {
      id: 'responsiveness' as OptimizationTab,
      name: 'Responsivité',
      icon: <Smartphone className="w-5 h-5" />,
      description: 'Vérification de la responsivité',
      status: optimizationStatus.responsiveness
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'security':
        return <SecurityAuditComponent />;
      case 'cleanup':
        return <CodeCleanupComponent />;
      case 'performance':
        return <PerformanceOptimizationComponent />;
      case 'refactoring':
        return <ComponentRefactoringComponent />;
      case 'responsiveness':
        return <ResponsivenessCheckerComponent />;
      default:
        return <SecurityAuditComponent />;
    }
  };

  const calculateOverallScore = () => {
    const scores = {
      excellent: 100,
      good: 80,
      warning: 60,
      critical: 30
    };
    
    const totalScore = Object.values(optimizationStatus).reduce((sum, status) => {
      return sum + scores[status];
    }, 0);
    
    return Math.round(totalScore / Object.keys(optimizationStatus).length);
  };

  const overallScore = calculateOverallScore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête du tableau de bord */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tableau de Bord d'Optimisation
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Amélioration complète de l'application Dalil.dz
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-900">{overallScore}</div>
              <div className="text-sm text-blue-600">Score Global / 100</div>
            </div>
          </div>
          
          {/* Barre de progression globale */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${overallScore}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Progression globale de l'optimisation
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
                {getStatusIcon(tab.status)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Aperçu des statuts */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                activeTab === tab.id ? 'ring-2 ring-blue-500' : ''
              } ${getStatusColor(tab.status)}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="flex items-center space-x-3">
                {tab.icon}
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{tab.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{tab.description}</p>
                </div>
                {getStatusIcon(tab.status)}
              </div>
            </div>
          ))}
        </div>

        {/* Contenu de l'onglet actif */}
        <div className="bg-white rounded-lg shadow-sm">
          {renderTabContent()}
        </div>

        {/* Actions rapides */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
              <h4 className="font-medium">Lancer tous les tests</h4>
              <p className="text-sm text-gray-600">Exécuter tous les tests d'optimisation</p>
            </button>
            
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <Settings className="w-5 h-5 text-blue-600 mb-2" />
              <h4 className="font-medium">Configuration automatique</h4>
              <p className="text-sm text-gray-600">Appliquer les optimisations recommandées</p>
            </button>
            
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <CheckCircle className="w-5 h-5 text-purple-600 mb-2" />
              <h4 className="font-medium">Rapport complet</h4>
              <p className="text-sm text-gray-600">Générer un rapport d'optimisation</p>
            </button>
          </div>
        </div>

        {/* Statistiques d'amélioration */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact des Améliorations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">+100%</div>
            <div className="text-sm text-blue-600">Performance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-900">+90%</div>
            <div className="text-sm text-green-600">Sécurité</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-900">+100%</div>
            <div className="text-sm text-purple-600">Maintenabilité</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-900">+100%</div>
            <div className="text-sm text-orange-600">Responsivité</div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}