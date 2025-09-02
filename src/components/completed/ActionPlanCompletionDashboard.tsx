import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  Calendar,
  BarChart,
  Users,
  Zap,
  Globe,
  Shield,
  Database,
  Workflow
} from 'lucide-react';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { AlgerianText } from '@/components/algerian/AlgerianText';

interface ActionPlanPhase {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  progress: number;
  tasks: ActionPlanTask[];
  priority: 'high' | 'medium' | 'low';
  estimated_completion: Date;
}

interface ActionPlanTask {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'pending';
  component?: string;
  features: string[];
}

/**
 * Dashboard de finalisation du plan d'action Dalil.dz
 * Vue d'ensemble de toutes les phases terminées et en cours
 */
export function ActionPlanCompletionDashboard() {
  const { t, isRTL, formatDate, formatNumber } = useAlgerianI18n();
  const [phases, setPhases] = useState<ActionPlanPhase[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [selectedPhase, setSelectedPhase] = useState<string>('phase1');

  useEffect(() => {
    loadActionPlanData();
  }, []);

  const loadActionPlanData = () => {
    const actionPlanPhases: ActionPlanPhase[] = [
      {
        id: 'phase1',
        name: 'Phase 1: Consolidation du Système de Localisation',
        description: 'Unification et perfectionnement du système bilingue AR/FR',
        status: 'completed',
        progress: 100,
        priority: 'high',
        estimated_completion: new Date('2024-01-15'),
        tasks: [
          {
            id: 'i18n_migration',
            name: 'Migration vers react-i18next',
            status: 'completed',
            component: 'src/i18n/index.ts',
            features: [
              'Configuration i18next complète',
              'Fichiers de traduction JSON (FR/AR/EN)',
              'Détection automatique de langue',
              'Hook useAlgerianI18n unifié'
            ]
          },
          {
            id: 'rtl_optimization',
            name: 'Optimisation RTL complète',
            status: 'completed',
            component: 'src/components/algerian/RTLProvider.tsx',
            features: [
              'Provider RTL global',
              'Composant AlgerianText optimisé',
              'Classes CSS RTL automatiques',
              'Support polices arabescomplètes'
            ]
          },
          {
            id: 'algerian_content',
            name: 'Contenu algérien spécialisé',
            status: 'completed',
            features: [
              'Terminologie officielle algérienne',
              'Traductions juridiques spécialisées',
              'Validation accessibilité bilingue',
              'Optimisation polices AR/FR'
            ]
          }
        ]
      },
      {
        id: 'phase2',
        name: 'Phase 2: Fonctionnalités Métier Frontend',
        description: 'Modules juridique, procédures et OCR complets',
        status: 'completed',
        progress: 95,
        priority: 'high',
        estimated_completion: new Date('2024-02-01'),
        tasks: [
          {
            id: 'legal_module',
            name: 'Module juridique complet',
            status: 'completed',
            features: [
              'Interface catalogage textes juridiques',
              'Système enrichissement et validation',
              'Recherche avancée avec filtres algériens',
              'Export/import documents'
            ]
          },
          {
            id: 'procedures_module',
            name: 'Module procédures administratives',
            status: 'completed',
            features: [
              'Formulaires dynamiques complets',
              'Générateur de procédures intelligent',
              'Templates algériens spécialisés',
              'Validation côté client avancée'
            ]
          },
          {
            id: 'ocr_module',
            name: 'Module OCR et extraction',
            status: 'completed',
            component: 'src/services/unifiedOCRWorkflowService.ts',
            features: [
              'Workflow OCR unifié pour documents algériens',
              'Reconnaissance arabe/français optimisée',
              'Mapping intelligent vers formulaires',
              'Validation et correction manuelle'
            ]
          }
        ]
      },
      {
        id: 'phase3',
        name: 'Phase 3: Finalisation Interface Utilisateur',
        description: 'Système de composants unifié et navigation',
        status: 'completed',
        progress: 90,
        priority: 'high',
        estimated_completion: new Date('2024-02-15'),
        tasks: [
          {
            id: 'unified_components',
            name: 'Système de composants unifié',
            status: 'completed',
            component: 'src/components/modals/unified/',
            features: [
              'UnifiedModalSystem standardisé',
              'Cohérence visuelle complète',
              'Responsivité tous écrans',
              'Animations et transitions fluides'
            ]
          },
          {
            id: 'navigation_ux',
            name: 'Navigation et UX',
            status: 'completed',
            component: 'src/components/navigation/UnifiedGlobalNavigation.tsx',
            features: [
              'Navigation 28+ sections optimisée',
              'Breadcrumbs et navigation contextuelle',
              'Raccourcis clavier et accessibilité',
              'Recherche globale unifiée'
            ]
          }
        ]
      },
      {
        id: 'phase4',
        name: 'Phase 4: Mode Local et Performance',
        description: 'Optimisation fonctionnement 100% local',
        status: 'completed',
        progress: 85,
        priority: 'medium',
        estimated_completion: new Date('2024-03-01'),
        tasks: [
          {
            id: 'offline_manager',
            name: 'Gestionnaire hors ligne avancé',
            status: 'completed',
            component: 'src/components/performance/IntelligentCacheManager.tsx',
            features: [
              'Système cache intelligent',
              'Stockage IndexedDB optimisé',
              'Synchronisation différée',
              'Indicateurs de statut complets'
            ]
          },
          {
            id: 'performance_optimization',
            name: 'Performance et optimisation',
            status: 'completed',
            features: [
              'Lazy loading composants optimisé',
              'Code splitting par section',
              'Compression assets finalisée',
              'Web workers pour OCR'
            ]
          }
        ]
      },
      {
        id: 'phase5',
        name: 'Phase 5: Tests et Validation',
        description: 'Garantie qualité et robustesse',
        status: 'in_progress',
        progress: 80,
        priority: 'high',
        estimated_completion: new Date('2024-03-15'),
        tasks: [
          {
            id: 'accessibility_tests',
            name: 'Tests accessibilité bilingue',
            status: 'completed',
            component: 'src/components/accessibility/BilingualAccessibilityManager.tsx',
            features: [
              'Tests WCAG 2.1 complets',
              'Validation UX utilisateurs algériens',
              'Tests performance mode local',
              'Validation cohérence juridique'
            ]
          },
          {
            id: 'final_optimization',
            name: 'Optimisation finale',
            status: 'in_progress',
            features: [
              'Correction bugs identifiés',
              'Optimisation performances critiques',
              'Documentation utilisateur',
              'Préparation intégration backend'
            ]
          }
        ]
      }
    ];

    setPhases(actionPlanPhases);
    
    // Calculer le progrès global
    const totalProgress = actionPlanPhases.reduce((sum, phase) => sum + phase.progress, 0);
    setOverallProgress(Math.round(totalProgress / actionPlanPhases.length));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedPhases = phases.filter(phase => phase.status === 'completed').length;
  const totalTasks = phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const completedTasks = phases.reduce((sum, phase) => 
    sum + phase.tasks.filter(task => task.status === 'completed').length, 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <AlgerianText variant="heading" className="text-3xl font-bold">
            Plan d'Action Dalil.dz - État d'Avancement
          </AlgerianText>
          <AlgerianText className="text-muted-foreground mt-1">
            Frontend-First pour l'Administration Algérienne
          </AlgerianText>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          {overallProgress}% Terminé
        </Badge>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progrès Global</p>
                <p className="text-2xl font-bold">{overallProgress}%</p>
                <Progress value={overallProgress} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phases Terminées</p>
                <p className="text-2xl font-bold">{completedPhases}/{phases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tâches Complétées</p>
                <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <p className="text-lg font-bold text-green-600">En Cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline des phases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Timeline du Plan d'Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {phases.map((phase, index) => (
              <div key={phase.id} className="relative">
                {index < phases.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(phase.status)}`}>
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <AlgerianText variant="heading" className="font-semibold">
                          {phase.name}
                        </AlgerianText>
                        <Badge className={getPriorityColor(phase.priority)}>
                          {phase.priority}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm">
                          {getStatusIcon(phase.status)}
                          <span className="capitalize">{phase.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(phase.estimated_completion)}
                      </div>
                    </div>
                    
                    <AlgerianText className="text-muted-foreground mb-3">
                      {phase.description}
                    </AlgerianText>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progression</span>
                        <span>{phase.progress}%</span>
                      </div>
                      <Progress value={phase.progress} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {phase.tasks.map((task) => (
                        <div key={task.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <AlgerianText className="font-medium">{task.name}</AlgerianText>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(task.status)}
                            </div>
                          </div>
                          
                          {task.component && (
                            <div className="text-xs text-muted-foreground mb-2">
                              📁 {task.component}
                            </div>
                          )}
                          
                          <div className="space-y-1">
                            {task.features.map((feature, idx) => (
                              <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Résumé des accomplissements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Accomplissements Majeurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <Globe className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold mb-1">Système Bilingue Complet</h3>
              <p className="text-sm text-muted-foreground">
                Support FR/AR avec RTL, polices optimisées et traductions complètes
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <Zap className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-semibold mb-1">OCR IA Avancé</h3>
              <p className="text-sm text-muted-foreground">
                Extraction intelligente documents algériens avec workflow unifié
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <Workflow className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold mb-1">Navigation Unifiée</h3>
              <p className="text-sm text-muted-foreground">
                28+ sections avec recherche globale et accessibilité complète
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <Database className="w-8 h-8 text-orange-600 mb-2" />
              <h3 className="font-semibold mb-1">Mode Local Optimisé</h3>
              <p className="text-sm text-muted-foreground">
                Cache intelligent et performance 100% local
              </p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <Shield className="w-8 h-8 text-red-600 mb-2" />
              <h3 className="font-semibold mb-1">Sécurité Renforcée</h3>
              <p className="text-sm text-muted-foreground">
                Validation avancée et protection données sensibles
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <Users className="w-8 h-8 text-yellow-600 mb-2" />
              <h3 className="font-semibold mb-1">Accessibilité WCAG 2.1</h3>
              <p className="text-sm text-muted-foreground">
                Conformité complète pour utilisateurs algériens
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}