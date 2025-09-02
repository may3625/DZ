/**
 * Suite de tests d'accessibilité bilingue
 * Validation UX et conformité algérienne
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  Keyboard, 
  MousePointer, 
  Smartphone, 
  Monitor,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface AccessibilityTest {
  id: string;
  name: string;
  category: 'visual' | 'audio' | 'motor' | 'cognitive' | 'rtl';
  status: 'passed' | 'failed' | 'warning' | 'pending';
  score: number;
  description: string;
  recommendations?: string[];
}

interface TestResults {
  overall: number;
  byCategory: Record<string, number>;
  tests: AccessibilityTest[];
}

export function AccessibilityTestSuite() {
  const { t, language, isRTL, formatNumber } = useAlgerianI18n();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResults | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Tests d'accessibilité prédéfinis
  const defaultTests: AccessibilityTest[] = [
    {
      id: 'contrast-ratio',
      name: 'Contraste des couleurs',
      category: 'visual',
      status: 'pending',
      score: 0,
      description: 'Vérification du ratio de contraste WCAG AA (4.5:1)',
    },
    {
      id: 'font-scaling',
      name: 'Échelle des polices',
      category: 'visual',
      status: 'pending',
      score: 0,
      description: 'Test de lisibilité à 200% de zoom',
    },
    {
      id: 'rtl-layout',
      name: 'Support RTL',
      category: 'rtl',
      status: 'pending',
      score: 0,
      description: 'Validation de la mise en page droite-gauche',
    },
    {
      id: 'arabic-fonts',
      name: 'Polices arabes',
      category: 'rtl',
      status: 'pending',
      score: 0,
      description: 'Qualité du rendu des caractères arabes',
    },
    {
      id: 'keyboard-navigation',
      name: 'Navigation clavier',
      category: 'motor',
      status: 'pending',
      score: 0,
      description: 'Accessibilité complète au clavier',
    },
    {
      id: 'focus-indicators',
      name: 'Indicateurs de focus',
      category: 'motor',
      status: 'pending',
      score: 0,
      description: 'Visibilité des éléments focalisés',
    },
    {
      id: 'alt-text',
      name: 'Textes alternatifs',
      category: 'visual',
      status: 'pending',
      score: 0,
      description: 'Descriptions d\'images complètes',
    },
    {
      id: 'form-labels',
      name: 'Étiquetage des formulaires',
      category: 'cognitive',
      status: 'pending',
      score: 0,
      description: 'Clarté des labels et instructions',
    },
    {
      id: 'error-messages',
      name: 'Messages d\'erreur',
      category: 'cognitive',
      status: 'pending',
      score: 0,
      description: 'Clarté et accessibilité des erreurs',
    },
    {
      id: 'mobile-touch',
      name: 'Zones tactiles mobiles',
      category: 'motor',
      status: 'pending',
      score: 0,
      description: 'Taille des éléments interactifs (44px min)',
    }
  ];

  // Simulation des tests d'accessibilité
  const runAccessibilityTests = async () => {
    setIsRunning(true);
    setProgress(0);

    const testResults: AccessibilityTest[] = [];
    const totalTests = defaultTests.length;

    for (let i = 0; i < totalTests; i++) {
      const test = defaultTests[i];
      
      // Simulation du test
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Générer des résultats aléatoires pour la démo
      const score = Math.floor(Math.random() * 40) + 60; // 60-100%
      let status: AccessibilityTest['status'] = 'passed';
      const recommendations: string[] = [];

      if (score < 70) {
        status = 'failed';
        recommendations.push('Amélioration nécessaire');
      } else if (score < 85) {
        status = 'warning';
        recommendations.push('Optimisations recommandées');
      } else {
        status = 'passed';
      }

      // Tests spécifiques pour l'arabe
      if (test.category === 'rtl') {
        if (isRTL) {
          recommendations.push('Support RTL actif');
        } else {
          recommendations.push('Tester en mode RTL');
        }
      }

      testResults.push({
        ...test,
        status,
        score,
        recommendations
      });

      setProgress(((i + 1) / totalTests) * 100);
    }

    // Calculer les scores par catégorie
    const byCategory: Record<string, number> = {};
    const categories = ['visual', 'audio', 'motor', 'cognitive', 'rtl'];
    
    categories.forEach(category => {
      const categoryTests = testResults.filter(t => t.category === category);
      if (categoryTests.length > 0) {
        const avgScore = categoryTests.reduce((sum, t) => sum + t.score, 0) / categoryTests.length;
        byCategory[category] = Math.round(avgScore);
      }
    });

    const overall = Math.round(
      testResults.reduce((sum, t) => sum + t.score, 0) / testResults.length
    );

    setResults({
      overall,
      byCategory,
      tests: testResults
    });

    setIsRunning(false);
  };

  const getStatusIcon = (status: AccessibilityTest['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Zap className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'visual': return <Eye className="h-4 w-4" />;
      case 'audio': return <Volume2 className="h-4 w-4" />;
      case 'motor': return <MousePointer className="h-4 w-4" />;
      case 'cognitive': return <Monitor className="h-4 w-4" />;
      case 'rtl': return <Keyboard className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const filteredTests = results?.tests.filter(test => 
    selectedCategory === 'all' || test.category === selectedCategory
  ) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Tests d'Accessibilité Bilingue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Validation WCAG 2.1 AA et support RTL algérien
                </p>
                {results && (
                  <p className="text-2xl font-bold text-primary">
                    Score global: {formatNumber(results.overall)}%
                  </p>
                )}
              </div>
              <Button 
                onClick={runAccessibilityTests}
                disabled={isRunning}
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Zap className="h-4 w-4 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Lancer les tests
                  </>
                )}
              </Button>
            </div>

            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats détaillés</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="visual">Visuel</TabsTrigger>
                <TabsTrigger value="motor">Moteur</TabsTrigger>
                <TabsTrigger value="cognitive">Cognitif</TabsTrigger>
                <TabsTrigger value="rtl">RTL</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-6">
                <div className="grid gap-4">
                  {filteredTests.map((test) => (
                    <Card key={test.id} className="border-l-4 border-l-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getCategoryIcon(test.category)}
                            <div>
                              <h4 className="font-medium">{test.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {test.description}
                              </p>
                              {test.recommendations && test.recommendations.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-primary">
                                    Recommandations:
                                  </p>
                                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                                    {test.recommendations.map((rec, index) => (
                                      <li key={index}>{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={test.status === 'passed' ? 'default' : 
                                     test.status === 'warning' ? 'secondary' : 'destructive'}
                            >
                              {formatNumber(test.score)}%
                            </Badge>
                            {getStatusIcon(test.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Scores par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(results.byCategory).map(([category, score]) => (
                <div key={category} className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    {getCategoryIcon(category)}
                  </div>
                  <p className="text-sm font-medium capitalize">{category}</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatNumber(score)}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}