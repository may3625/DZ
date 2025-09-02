import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  Globe,
  Zap,
  Eye,
  FileCheck
} from 'lucide-react';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';

interface TestResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'running';
  duration: number;
  category: 'accessibility' | 'performance' | 'ux' | 'legal' | 'localization';
  details?: string;
}

interface TestSuite {
  name: string;
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  progress: number;
}

export function TestingValidationSection() {
  const { t, language, isRTL } = useAlgerianI18n();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);

  const translations = {
    fr: {
      title: "Tests et Validation",
      description: "Validation complète qualité et conformité",
      overview: "Vue d'ensemble",
      accessibility: "Accessibilité",
      performance: "Performance", 
      ux: "Expérience utilisateur",
      legal: "Conformité juridique",
      localization: "Localisation",
      runAllTests: "Lancer tous les tests",
      running: "Tests en cours...",
      testResults: "Résultats des tests",
      passed: "Réussis",
      failed: "Échecs",
      warnings: "Avertissements",
      duration: "Durée",
      bilingualTests: "Tests bilingues",
      rtlSupport: "Support RTL",
      legalValidation: "Validation juridique",
      performanceMetrics: "Métriques de performance",
      userExperience: "Tests d'expérience utilisateur",
      overallScore: "Score global"
    },
    ar: {
      title: "الاختبار والتحقق",
      description: "التحقق الكامل من الجودة والامتثال",
      overview: "نظرة عامة",
      accessibility: "إمكانية الوصول",
      performance: "الأداء",
      ux: "تجربة المستخدم",
      legal: "الامتثال القانوني",
      localization: "التوطين",
      runAllTests: "تشغيل جميع الاختبارات",
      running: "الاختبارات جارية...",
      testResults: "نتائج الاختبارات",
      passed: "نجح",
      failed: "فشل",
      warnings: "تحذيرات",
      duration: "المدة",
      bilingualTests: "الاختبارات ثنائية اللغة",
      rtlSupport: "دعم الكتابة من اليمين لليسار",
      legalValidation: "التحقق القانوني",
      performanceMetrics: "مقاييس الأداء",
      userExperience: "اختبارات تجربة المستخدم",
      overallScore: "النتيجة الإجمالية"
    },
    en: {
      title: "Testing & Validation",
      description: "Complete quality and compliance validation",
      overview: "Overview",
      accessibility: "Accessibility",
      performance: "Performance",
      ux: "User Experience",
      legal: "Legal Compliance",
      localization: "Localization",
      runAllTests: "Run All Tests",
      running: "Tests Running...",
      testResults: "Test Results",
      passed: "Passed",
      failed: "Failed",
      warnings: "Warnings",
      duration: "Duration",
      bilingualTests: "Bilingual Tests",
      rtlSupport: "RTL Support",
      legalValidation: "Legal Validation",
      performanceMetrics: "Performance Metrics",
      userExperience: "User Experience Tests",
      overallScore: "Overall Score"
    }
  };

  const texts = translations[language as keyof typeof translations] || translations.fr;

  // Initialiser les suites de tests
  useEffect(() => {
    const mockSuites: TestSuite[] = [
      {
        name: texts.accessibility,
        total: 25,
        passed: 23,
        failed: 1,
        warnings: 1,
        progress: 100
      },
      {
        name: texts.performance,
        total: 18,
        passed: 16,
        failed: 0,
        warnings: 2,
        progress: 100
      },
      {
        name: texts.ux,
        total: 32,
        passed: 28,
        failed: 2,
        warnings: 2,
        progress: 100
      },
      {
        name: texts.legal,
        total: 15,
        passed: 14,
        failed: 0,
        warnings: 1,
        progress: 100
      },
      {
        name: texts.localization,
        total: 22,
        passed: 20,
        failed: 1,
        warnings: 1,
        progress: 100
      }
    ];
    
    setTestSuites(mockSuites);
  }, [language]);

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    // Simuler l'exécution des tests
    const mockTests: TestResult[] = [
      {
        id: '1',
        name: 'Contraste des couleurs (WCAG 2.1)',
        status: 'pass',
        duration: 120,
        category: 'accessibility',
        details: 'Tous les ratios de contraste respectent les standards AA'
      },
      {
        id: '2',
        name: 'Navigation clavier',
        status: 'pass',
        duration: 85,
        category: 'accessibility'
      },
      {
        id: '3',
        name: 'Support RTL complet',
        status: 'warning',
        duration: 210,
        category: 'localization',
        details: 'Quelques composants nécessitent des ajustements RTL'
      },
      {
        id: '4',
        name: 'Temps de chargement initial',
        status: 'pass',
        duration: 300,
        category: 'performance'
      },
      {
        id: '5',
        name: 'Cohérence terminologie juridique',
        status: 'pass',
        duration: 180,
        category: 'legal'
      },
      {
        id: '6',
        name: 'Usabilité mobile',
        status: 'fail',
        duration: 420,
        category: 'ux',
        details: 'Problèmes d\'accessibilité sur écrans < 320px'
      },
      {
        id: '7',
        name: 'Traductions manquantes',
        status: 'warning',
        duration: 95,
        category: 'localization'
      },
      {
        id: '8',
        name: 'Performance OCR arabe',
        status: 'pass',
        duration: 540,
        category: 'performance'
      }
    ];

    // Simuler le temps d'exécution
    for (let i = 0; i < mockTests.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTestResults(prev => [...prev, { ...mockTests[i], status: 'running' }]);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setTestResults(prev => 
        prev.map((test, index) => 
          index === i ? { ...test, status: mockTests[i].status } : test
        )
      );
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getCategoryIcon = (category: TestResult['category']) => {
    switch (category) {
      case 'accessibility':
        return <Eye className="w-4 h-4" />;
      case 'performance':
        return <Zap className="w-4 h-4" />;
      case 'ux':
        return <Users className="w-4 h-4" />;
      case 'legal':
        return <FileCheck className="w-4 h-4" />;
      case 'localization':
        return <Globe className="w-4 h-4" />;
    }
  };

  const calculateOverallScore = () => {
    if (testSuites.length === 0) return 0;
    const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passed, 0);
    const totalTests = testSuites.reduce((sum, suite) => sum + suite.total, 0);
    return Math.round((totalPassed / totalTests) * 100);
  };

  const overallScore = calculateOverallScore();

  return (
    <div className="space-y-6">
      {/* En-tête avec score global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-blue-600" />
            {texts.title}
          </CardTitle>
          <p className="text-gray-600">{texts.description}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${overallScore >= 90 ? 'text-green-600' : overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                {overallScore}%
              </div>
              <div className="text-sm text-gray-600">{texts.overallScore}</div>
            </div>
            <div className="flex-1">
              <Progress value={overallScore} className="h-3" />
            </div>
            <Button onClick={runAllTests} disabled={isRunning}>
              {isRunning ? texts.running : texts.runAllTests}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Onglets de tests */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">{texts.overview}</TabsTrigger>
          <TabsTrigger value="accessibility">{texts.accessibility}</TabsTrigger>
          <TabsTrigger value="performance">{texts.performance}</TabsTrigger>
          <TabsTrigger value="ux">{texts.ux}</TabsTrigger>
          <TabsTrigger value="legal">{texts.legal}</TabsTrigger>
          <TabsTrigger value="localization">{texts.localization}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testSuites.map((suite, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{suite.name}</h3>
                      <Badge variant="outline">{suite.total} tests</Badge>
                    </div>
                    
                    <Progress value={(suite.passed / suite.total) * 100} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">✓ {suite.passed}</span>
                      <span className="text-red-600">✗ {suite.failed}</span>
                      <span className="text-yellow-600">⚠ {suite.warnings}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Tests d'accessibilité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.filter(test => test.category === 'accessibility').map((test) => (
                  <div key={test.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <div className="font-medium">{test.name}</div>
                      {test.details && (
                        <div className="text-sm text-gray-600">{test.details}</div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{test.duration}ms</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                Tests de performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.filter(test => test.category === 'performance').map((test) => (
                  <div key={test.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <div className="font-medium">{test.name}</div>
                      {test.details && (
                        <div className="text-sm text-gray-600">{test.details}</div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{test.duration}ms</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Autres onglets similaires... */}
        <TabsContent value="ux" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Tests d'expérience utilisateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Navigation intuitive</h4>
                  <p className="text-sm text-blue-700">
                    Tests de parcours utilisateur et facilité de navigation
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Cohérence visuelle</h4>
                  <p className="text-sm text-green-700">
                    Uniformité des composants et du design system
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-orange-600" />
                Validation juridique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Terminologie officielle</h4>
                  <p className="text-sm text-gray-600">
                    Validation de l'usage des termes juridiques algériens officiels
                  </p>
                  <Badge className="mt-2" variant="secondary">Conforme</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Références législatives</h4>
                  <p className="text-sm text-gray-600">
                    Vérification des références aux textes juridiques algériens
                  </p>
                  <Badge className="mt-2" variant="secondary">Conforme</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                Tests de localisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Traductions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Français</span>
                      <Badge variant="secondary">100%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Arabe</span>
                      <Badge variant="secondary">98%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Anglais</span>
                      <Badge variant="secondary">95%</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Support RTL</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Layout adaptatif</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex justify-between">
                      <span>Typographie arabe</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex justify-between">
                      <span>Icônes et symboles</span>
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}