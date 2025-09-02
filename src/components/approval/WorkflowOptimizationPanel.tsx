import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Brain, 
  Settings, 
  BarChart3,
  Lightbulb,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download
} from 'lucide-react';
import { 
  workflowOptimizationService, 
  WorkflowPattern, 
  WorkflowMetrics 
} from '@/services/approval/workflowOptimizationService';
import { ApprovalItem } from '@/services/approval/approvalItemService';
import { useToast } from '@/hooks/use-toast';

interface WorkflowOptimizationPanelProps {
  items: ApprovalItem[];
  onOptimizationApplied: () => void;
}

const WorkflowOptimizationPanel: React.FC<WorkflowOptimizationPanelProps> = ({
  items,
  onOptimizationApplied
}) => {
  const { toast } = useToast();
  const [patterns, setPatterns] = useState<WorkflowPattern[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{
    fieldName: string;
    originalValue: string;
    suggestedValue: string;
    confidence: number;
    reason: string;
  }>>([]);
  const [optimizations, setOptimizations] = useState<Array<{
    rule: string;
    modification: string;
    reasoning: string;
    impact: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadOptimizationData();
  }, [items]);

  const loadOptimizationData = async () => {
    setIsLoading(true);
    try {
      // Calcul des métriques
      const metricsData = workflowOptimizationService.calculateWorkflowMetrics(items);
      setMetrics(metricsData);

      // Détection des patterns
      const patternsData = workflowOptimizationService.detectRecurringPatterns(items);
      setPatterns(patternsData);

      // Optimisations suggérées
      const optimizationsData = workflowOptimizationService.optimizeValidationRules(items);
      setOptimizations(optimizationsData);

      // Suggestions de corrections pour l'item courant (si disponible)
      if (items.length > 0) {
        const suggestionsData = workflowOptimizationService.suggestAutoCorrections(items[0]);
        setSuggestions(suggestionsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'optimisation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyOptimization = (optimization: any) => {
    toast({
      title: "Optimisation appliquée",
      description: `${optimization.rule}: ${optimization.modification}`,
    });
    onOptimizationApplied();
  };

  const handleExportLearningData = () => {
    const data = workflowOptimizationService.exportLearningData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-learning-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export terminé",
      description: "Les données d'apprentissage ont été exportées",
    });
  };

  const getMetricColor = (value: number, type: 'rate' | 'time') => {
    if (type === 'rate') {
      if (value >= 80) return 'text-green-600 dark:text-green-400';
      if (value >= 60) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    } else { // time
      if (value <= 5) return 'text-green-600 dark:text-green-400';
      if (value <= 10) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p>Analyse du workflow en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec métriques globales */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance du Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{metrics.totalProcessed}</div>
                <div className="text-sm text-muted-foreground">Traités</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getMetricColor(metrics.approvalRate, 'rate')}`}>
                  {Math.round(metrics.approvalRate)}%
                </div>
                <div className="text-sm text-muted-foreground">Approbation</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getMetricColor(metrics.averageProcessingTime, 'time')}`}>
                  {Math.round(metrics.averageProcessingTime)}min
                </div>
                <div className="text-sm text-muted-foreground">Temps moy.</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getMetricColor(metrics.autoFixSuccessRate, 'rate')}`}>
                  {Math.round(metrics.autoFixSuccessRate)}%
                </div>
                <div className="text-sm text-muted-foreground">Auto-fix</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{metrics.commonIssues.length}</div>
                <div className="text-sm text-muted-foreground">Problèmes types</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Patterns ({patterns.length})
          </TabsTrigger>
          <TabsTrigger value="optimizations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Optimisations ({optimizations.length})
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Suggestions ({suggestions.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Patterns détectés</h3>
            <Button size="sm" variant="outline" onClick={loadOptimizationData}>
              <Brain className="h-4 w-4 mr-2" />
              Recalculer
            </Button>
          </div>

          {patterns.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>Aucun pattern récurrent détecté</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Les patterns apparaissent après traitement de plusieurs documents similaires
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {patterns.map((pattern) => (
                <Card key={pattern.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{pattern.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {pattern.description}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {pattern.frequency} occurrences
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Suggestion:</span>
                        <span className="text-sm">{pattern.improvementSuggestion}</span>
                      </div>
                      
                      {pattern.autoFixRules.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Règles automatiques:</p>
                          <div className="space-y-1">
                            {pattern.autoFixRules.map((rule, index) => (
                              <div key={index} className="text-xs p-2 bg-muted rounded">
                                <span className="font-medium">{rule.issueType}:</span> {rule.action}
                                <Badge variant="outline" className="ml-2">
                                  {rule.confidence}% confiance
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Optimisations recommandées</h3>
            <Badge variant="outline">{optimizations.length} disponibles</Badge>
          </div>

          {optimizations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>Workflow optimisé</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Aucune optimisation supplémentaire détectée
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {optimizations.map((optimization, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{optimization.rule}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {optimization.modification}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleApplyOptimization(optimization)}
                      >
                        Appliquer
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Justification:</p>
                          <p className="text-sm text-muted-foreground">{optimization.reasoning}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Impact attendu:</p>
                          <p className="text-sm text-muted-foreground">{optimization.impact}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Corrections suggérées</h3>
            <Badge variant="outline">{suggestions.length} disponibles</Badge>
          </div>

          {suggestions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>Aucune correction automatique suggérée</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Les suggestions apparaissent basées sur l'apprentissage du système
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{suggestion.fieldName}</span>
                          <Badge variant="outline">
                            {suggestion.confidence}% confiance
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-muted-foreground">Valeur actuelle:</span>
                            <code className="ml-2 px-1 bg-muted rounded">{suggestion.originalValue}</code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Suggestion:</span>
                            <code className="ml-2 px-1 bg-green-100 dark:bg-green-900/20 rounded">{suggestion.suggestedValue}</code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Raison:</span>
                            <span className="ml-2">{suggestion.reason}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Zap className="h-4 w-4 mr-2" />
                        Appliquer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {metrics && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Analyse détaillée</h3>
                <Button size="sm" variant="outline" onClick={handleExportLearningData}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter les données
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Problèmes communs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Problèmes les plus fréquents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {metrics.commonIssues.map((issue, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-4 w-4 ${
                              issue.severity === 'critical' ? 'text-red-500' :
                              issue.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                            }`} />
                            <span className="text-sm">{issue.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={issue.frequency} className="w-16" />
                            <span className="text-sm">{issue.frequency}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommandations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recommandations d'amélioration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {metrics.improvementRecommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <Lightbulb className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <span>{recommendation}</span>
                          </div>
                        ))}
                        {metrics.improvementRecommendations.length === 0 && (
                          <div className="text-center py-4 text-muted-foreground">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <p className="text-sm">Aucune amélioration suggérée</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowOptimizationPanel;