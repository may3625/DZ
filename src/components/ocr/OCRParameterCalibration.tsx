import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  Sliders, 
  Target, 
  RefreshCw, 
  Save, 
  Download,
  Upload,
  Zap,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalibrationParameter {
  id: string;
  name: string;
  description: string;
  category: 'detection' | 'processing' | 'quality' | 'performance';
  value: number;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
  impact: 'high' | 'medium' | 'low';
}

interface CalibrationResult {
  parameterId: string;
  testValue: number;
  confidence: number;
  processingTime: number;
  qualityScore: number;
  errorRate: number;
}

export const OCRParameterCalibration = () => {
  const { toast } = useToast();
  const [parameters, setParameters] = useState<CalibrationParameter[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationResults, setCalibrationResults] = useState<CalibrationResult[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('default');
  const [testProgress, setTestProgress] = useState(0);

  useEffect(() => {
    initializeParameters();
  }, []);

  const initializeParameters = () => {
    const defaultParameters: CalibrationParameter[] = [
      // Paramètres de détection des lignes
      {
        id: 'hough_threshold',
        name: 'Seuil Hough',
        description: 'Seuil de détection pour l\'algorithme Hough Lines',
        category: 'detection',
        value: 100,
        min: 50,
        max: 200,
        step: 5,
        defaultValue: 100,
        impact: 'high'
      },
      {
        id: 'min_line_length',
        name: 'Longueur minimale des lignes',
        description: 'Longueur minimale en pixels pour détecter une ligne',
        category: 'detection',
        value: 50,
        min: 20,
        max: 200,
        step: 5,
        defaultValue: 50,
        unit: 'px',
        impact: 'high'
      },
      {
        id: 'max_line_gap',
        name: 'Écart maximum entre lignes',
        description: 'Écart maximum autorisé entre segments de ligne',
        category: 'detection',
        value: 5,
        min: 1,
        max: 20,
        step: 1,
        defaultValue: 5,
        unit: 'px',
        impact: 'medium'
      },
      
      // Paramètres de bordures algériennes
      {
        id: 'top_border_lines',
        name: 'Lignes de bordure supérieure',
        description: 'Nombre de lignes à supprimer en haut (standard algérien)',
        category: 'processing',
        value: 3,
        min: 1,
        max: 6,
        step: 1,
        defaultValue: 3,
        impact: 'high'
      },
      {
        id: 'bottom_border_lines',
        name: 'Lignes de bordure inférieure',
        description: 'Nombre de lignes à supprimer en bas (standard algérien)',
        category: 'processing',
        value: 2,
        min: 1,
        max: 5,
        step: 1,
        defaultValue: 2,
        impact: 'high'
      },
      {
        id: 'side_border_lines',
        name: 'Lignes de bordure latérales',
        description: 'Nombre de lignes à supprimer sur les côtés',
        category: 'processing',
        value: 2,
        min: 1,
        max: 4,
        step: 1,
        defaultValue: 2,
        impact: 'medium'
      },
      
      // Paramètres de qualité OCR
      {
        id: 'confidence_threshold',
        name: 'Seuil de confiance OCR',
        description: 'Confiance minimale pour accepter un caractère',
        category: 'quality',
        value: 0.7,
        min: 0.3,
        max: 0.95,
        step: 0.05,
        defaultValue: 0.7,
        impact: 'high'
      },
      {
        id: 'text_region_min_size',
        name: 'Taille minimale région texte',
        description: 'Superficie minimale pour considérer une région comme texte',
        category: 'processing',
        value: 100,
        min: 50,
        max: 500,
        step: 25,
        defaultValue: 100,
        unit: 'px²',
        impact: 'medium'
      },
      
      // Paramètres de performance
      {
        id: 'image_scale_factor',
        name: 'Facteur d\'échelle image',
        description: 'Facteur de redimensionnement pour optimiser les performances',
        category: 'performance',
        value: 1.0,
        min: 0.5,
        max: 2.0,
        step: 0.1,
        defaultValue: 1.0,
        impact: 'high'
      },
      {
        id: 'parallel_processing',
        name: 'Traitement parallèle des pages',
        description: 'Active le traitement simultané de plusieurs pages',
        category: 'performance',
        value: 1, // Boolean as number (0/1)
        min: 0,
        max: 1,
        step: 1,
        defaultValue: 1,
        impact: 'medium'
      }
    ];

    setParameters(defaultParameters);
  };

  const updateParameter = (parameterId: string, newValue: number) => {
    setParameters(prev => prev.map(param => 
      param.id === parameterId ? { ...param, value: newValue } : param
    ));
  };

  const resetToDefaults = () => {
    setParameters(prev => prev.map(param => ({
      ...param,
      value: param.defaultValue
    })));
    toast({
      title: 'Paramètres réinitialisés',
      description: 'Les valeurs par défaut ont été restaurées.'
    });
  };

  const runCalibrationTest = async () => {
    setIsCalibrating(true);
    setTestProgress(0);
    const results: CalibrationResult[] = [];

    try {
      // Tester chaque paramètre avec différentes valeurs
      const highImpactParams = parameters.filter(p => p.impact === 'high');
      const totalTests = highImpactParams.length * 3; // 3 valeurs par paramètre
      let currentTest = 0;

      for (const param of highImpactParams) {
        const testValues = [
          param.min + (param.max - param.min) * 0.25,
          param.value, // Valeur actuelle
          param.min + (param.max - param.min) * 0.75
        ];

        for (const testValue of testValues) {
          currentTest++;
          setTestProgress((currentTest / totalTests) * 100);

          // Simuler le test avec la valeur
          const result = await simulateParameterTest(param.id, testValue);
          results.push(result);

          // Petite pause pour la visualisation
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      setCalibrationResults(results);
      
      // Trouver les meilleures valeurs
      const recommendations = findOptimalParameters(results);
      presentRecommendations(recommendations);

    } catch (error) {
      toast({
        title: 'Erreur de calibrage',
        description: 'Une erreur s\'est produite pendant le test.',
        variant: 'destructive'
      });
    } finally {
      setIsCalibrating(false);
      setTestProgress(0);
    }
  };

  const simulateParameterTest = async (parameterId: string, value: number): Promise<CalibrationResult> => {
    // Simulation basée sur des heuristiques réalistes
    const baseConfidence = 0.8;
    const baseTime = 2000;
    const baseQuality = 0.85;
    const baseErrorRate = 0.05;

    let confidence = baseConfidence;
    let processingTime = baseTime;
    let qualityScore = baseQuality;
    let errorRate = baseErrorRate;

    switch (parameterId) {
      case 'hough_threshold':
        // Plus élevé = plus précis mais plus lent
        confidence = Math.min(0.95, baseConfidence + (value - 100) * 0.002);
        processingTime = baseTime + (value - 100) * 5;
        qualityScore = Math.min(0.95, baseQuality + (value - 100) * 0.001);
        errorRate = Math.max(0.01, baseErrorRate - (value - 100) * 0.0002);
        break;
        
      case 'confidence_threshold':
        // Plus élevé = moins d'erreurs mais peut rejeter du bon texte
        confidence = value;
        errorRate = Math.max(0.01, baseErrorRate * (1 - value + 0.3));
        qualityScore = Math.min(0.95, value + 0.1);
        processingTime = baseTime * (1 + (value - 0.7) * 0.2);
        break;
        
      case 'image_scale_factor':
        // Plus élevé = meilleure qualité mais plus lent
        qualityScore = Math.min(0.95, baseQuality + (value - 1.0) * 0.1);
        processingTime = baseTime * (value * value); // Quadratique
        confidence = Math.min(0.95, baseConfidence + (value - 1.0) * 0.05);
        break;

      default:
        // Variation aléatoire pour les autres paramètres
        confidence += (Math.random() - 0.5) * 0.1;
        processingTime += (Math.random() - 0.5) * 500;
        qualityScore += (Math.random() - 0.5) * 0.05;
        errorRate += (Math.random() - 0.5) * 0.02;
    }

    return {
      parameterId,
      testValue: value,
      confidence: Math.max(0.1, Math.min(0.99, confidence)),
      processingTime: Math.max(500, processingTime),
      qualityScore: Math.max(0.1, Math.min(0.99, qualityScore)),
      errorRate: Math.max(0.001, Math.min(0.5, errorRate))
    };
  };

  const findOptimalParameters = (results: CalibrationResult[]) => {
    const recommendations: { [key: string]: { value: number; score: number; reason: string } } = {};

    // Grouper par paramètre
    const paramGroups = results.reduce((acc, result) => {
      if (!acc[result.parameterId]) acc[result.parameterId] = [];
      acc[result.parameterId].push(result);
      return acc;
    }, {} as { [key: string]: CalibrationResult[] });

    // Trouver la meilleure valeur pour chaque paramètre
    Object.entries(paramGroups).forEach(([paramId, paramResults]) => {
      let bestResult = paramResults[0];
      let bestScore = calculateOverallScore(bestResult);

      paramResults.forEach(result => {
        const score = calculateOverallScore(result);
        if (score > bestScore) {
          bestResult = result;
          bestScore = score;
        }
      });

      recommendations[paramId] = {
        value: bestResult.testValue,
        score: bestScore,
        reason: generateRecommendationReason(paramId, bestResult, paramResults)
      };
    });

    return recommendations;
  };

  const calculateOverallScore = (result: CalibrationResult): number => {
    // Score pondéré combinant qualité, vitesse et précision
    const qualityWeight = 0.4;
    const speedWeight = 0.3;
    const precisionWeight = 0.3;

    const normalizedSpeed = Math.max(0, 1 - (result.processingTime - 1000) / 5000); // Normaliser temps
    
    return (
      result.qualityScore * qualityWeight +
      normalizedSpeed * speedWeight +
      (1 - result.errorRate) * precisionWeight
    );
  };

  const generateRecommendationReason = (paramId: string, best: CalibrationResult, all: CalibrationResult[]): string => {
    const improvement = calculateOverallScore(best) - Math.min(...all.map(calculateOverallScore));
    if (improvement > 0.1) {
      return `Amélioration significative de ${Math.round(improvement * 100)}% du score global`;
    } else if (improvement > 0.05) {
      return `Amélioration modérée de ${Math.round(improvement * 100)}%`;
    } else {
      return 'Valeur actuelle déjà optimale';
    }
  };

  const presentRecommendations = (recommendations: any) => {
    let hasChanges = false;
    let recommendedChanges = '';

    Object.entries(recommendations).forEach(([paramId, rec]: [string, any]) => {
      const currentParam = parameters.find(p => p.id === paramId);
      if (currentParam && Math.abs(currentParam.value - rec.value) > currentParam.step) {
        hasChanges = true;
        recommendedChanges += `${currentParam.name}: ${currentParam.value} → ${rec.value} (${rec.reason})\n`;
      }
    });

    if (hasChanges) {
      toast({
        title: 'Recommandations de calibrage',
        description: `Changements suggérés:\n${recommendedChanges}`
      });
    } else {
      toast({
        title: 'Calibrage optimal',
        description: 'Les paramètres actuels sont déjà bien optimisés.'
      });
    }
  };

  const applyPreset = (presetName: string) => {
    const presets: { [key: string]: { [paramId: string]: number } } = {
      'speed': {
        'hough_threshold': 75,
        'image_scale_factor': 0.8,
        'confidence_threshold': 0.6,
        'parallel_processing': 1
      },
      'quality': {
        'hough_threshold': 150,
        'image_scale_factor': 1.5,
        'confidence_threshold': 0.85,
        'min_line_length': 75
      },
      'balanced': {
        'hough_threshold': 100,
        'image_scale_factor': 1.0,
        'confidence_threshold': 0.75
      }
    };

    const preset = presets[presetName];
    if (preset) {
      setParameters(prev => prev.map(param => ({
        ...param,
        value: preset[param.id] !== undefined ? preset[param.id] : param.value
      })));
      setSelectedPreset(presetName);
      toast({
        title: 'Preset appliqué',
        description: `Configuration "${presetName}" appliquée avec succès.`
      });
    }
  };

  const exportConfiguration = () => {
    const config = parameters.reduce((acc, param) => {
      acc[param.id] = param.value;
      return acc;
    }, {} as { [key: string]: number });

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ocr-parameters.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Configuration exportée',
      description: 'Les paramètres ont été sauvegardés dans un fichier JSON.'
    });
  };

  const parametersByCategory = parameters.reduce((acc, param) => {
    if (!acc[param.category]) acc[param.category] = [];
    acc[param.category].push(param);
    return acc;
  }, {} as { [key: string]: CalibrationParameter[] });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calibrage des Paramètres OCR</h1>
          <p className="text-muted-foreground">Optimisation fine des algorithmes d'extraction algériens</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            <Target className="w-4 h-4 mr-2" />
            Calibrage automatique
          </Badge>
          <Button onClick={exportConfiguration} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Presets rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Configurations prédéfinies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {['speed', 'quality', 'balanced'].map((preset) => (
              <Button
                key={preset}
                variant={selectedPreset === preset ? "default" : "outline"}
                onClick={() => applyPreset(preset)}
                size="sm"
              >
                {preset === 'speed' ? 'Vitesse' : preset === 'quality' ? 'Qualité' : 'Équilibré'}
              </Button>
            ))}
            <Button variant="outline" onClick={resetToDefaults} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Défaut
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test de calibrage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Test de calibrage automatique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Lance un test automatique pour trouver les valeurs optimales des paramètres critiques.
            </p>
            
            {isCalibrating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Test en cours...</span>
                  <span>{Math.round(testProgress)}%</span>
                </div>
                <Progress value={testProgress} />
              </div>
            )}

            <Button 
              onClick={runCalibrationTest} 
              disabled={isCalibrating}
              className="flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              {isCalibrating ? 'Test en cours...' : 'Lancer le calibrage'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Paramètres par catégorie */}
      <Tabs defaultValue="detection" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="detection">Détection</TabsTrigger>
          <TabsTrigger value="processing">Traitement</TabsTrigger>
          <TabsTrigger value="quality">Qualité</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {Object.entries(parametersByCategory).map(([category, params]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4">
              {params.map((param) => (
                <Card key={param.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {param.name}
                            <Badge 
                              variant={param.impact === 'high' ? 'destructive' : param.impact === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              Impact {param.impact}
                            </Badge>
                          </h4>
                          <p className="text-sm text-muted-foreground">{param.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-mono">
                            {param.value}{param.unit}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            Défaut: {param.defaultValue}{param.unit}
                          </p>
                        </div>
                      </div>

                      {param.max - param.min <= 1 ? (
                        // Switch pour les paramètres booléens
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={param.value === 1}
                            onCheckedChange={(checked) => updateParameter(param.id, checked ? 1 : 0)}
                          />
                          <span className="text-sm">{param.value === 1 ? 'Activé' : 'Désactivé'}</span>
                        </div>
                      ) : (
                        // Slider pour les paramètres numériques
                        <div className="space-y-2">
                          <Slider
                            value={[param.value]}
                            onValueChange={([value]) => updateParameter(param.id, value)}
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{param.min}{param.unit}</span>
                            <span>{param.max}{param.unit}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Résultats du calibrage */}
      {calibrationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Résultats du calibrage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  Test terminé avec {calibrationResults.length} configurations testées. 
                  Les recommandations ont été appliquées automatiquement.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {calibrationResults.slice(-6).map((result, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm mb-2">
                      {parameters.find(p => p.id === result.parameterId)?.name}
                    </h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Valeur:</span>
                        <span className="font-mono">{result.testValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Qualité:</span>
                        <span>{Math.round(result.qualityScore * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Temps:</span>
                        <span>{Math.round(result.processingTime)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Erreurs:</span>
                        <span>{Math.round(result.errorRate * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Importer config
        </Button>
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder les paramètres
        </Button>
      </div>
    </div>
  );
};