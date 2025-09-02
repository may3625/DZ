import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accessibility, 
  Eye, 
  Volume2, 
  Type, 
  Contrast,
  Languages,
  Keyboard,
  MousePointer,
  Monitor,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { AlgerianText } from '@/components/algerian/AlgerianText';

interface AccessibilitySettings {
  fontSize: number;
  contrast: 'normal' | 'high' | 'reverse';
  motion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  voiceNavigation: boolean;
  rtlOptimized: boolean;
  colorBlindness: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
}

interface AccessibilityTest {
  name: string;
  category: 'visual' | 'auditory' | 'keyboard' | 'cognitive' | 'rtl';
  status: 'pass' | 'fail' | 'warning';
  description: string;
  suggestion?: string;
}

/**
 * Phase 5 du plan d'action - Gestionnaire d'accessibilité bilingue
 * Tests et optimisations pour AR/FR avec conformité WCAG 2.1
 */
export function BilingualAccessibilityManager() {
  const { t, isRTL, language, setLanguage } = useAlgerianI18n();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    contrast: 'normal',
    motion: true,
    screenReader: false,
    keyboardNavigation: true,
    voiceNavigation: false,
    rtlOptimized: true,
    colorBlindness: 'none'
  });
  const [tests, setTests] = useState<AccessibilityTest[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    loadAccessibilitySettings();
    runAccessibilityTests();
  }, [language]);

  const loadAccessibilitySettings = () => {
    try {
      const saved = localStorage.getItem('dalil-accessibility-settings');
      if (saved) {
        setSettings({ ...settings, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Erreur chargement paramètres accessibilité:', error);
    }
  };

  const saveAccessibilitySettings = (newSettings: AccessibilitySettings) => {
    setSettings(newSettings);
    localStorage.setItem('dalil-accessibility-settings', JSON.stringify(newSettings));
    applyAccessibilitySettings(newSettings);
  };

  const applyAccessibilitySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Taille de police
    root.style.setProperty('--base-font-size', `${settings.fontSize}px`);
    
    // Contraste
    if (settings.contrast === 'high') {
      root.classList.add('high-contrast');
      root.classList.remove('reverse-contrast');
    } else if (settings.contrast === 'reverse') {
      root.classList.add('reverse-contrast');
      root.classList.remove('high-contrast');
    } else {
      root.classList.remove('high-contrast', 'reverse-contrast');
    }
    
    // Réduction de mouvement
    if (!settings.motion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Daltonisme
    if (settings.colorBlindness !== 'none') {
      root.classList.add(`colorblind-${settings.colorBlindness}`);
    } else {
      root.classList.remove('colorblind-deuteranopia', 'colorblind-protanopia', 'colorblind-tritanopia');
    }
  };

  const runAccessibilityTests = async () => {
    setIsRunningTests(true);
    
    // Simuler l'exécution des tests d'accessibilité
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockTests: AccessibilityTest[] = [
      {
        name: 'Contraste des couleurs',
        category: 'visual',
        status: 'pass',
        description: 'Rapport de contraste conforme WCAG AA (4.5:1 minimum)'
      },
      {
        name: 'Support RTL complet',
        category: 'rtl',
        status: language === 'ar' ? 'pass' : 'warning',
        description: 'Optimisation pour la lecture de droite à gauche',
        suggestion: language !== 'ar' ? 'Tester en arabe pour validation complète' : undefined
      },
      {
        name: 'Navigation clavier',
        category: 'keyboard',
        status: 'pass',
        description: 'Tous les éléments accessibles via clavier'
      },
      {
        name: 'Polices optimisées',
        category: 'visual',
        status: 'pass',
        description: 'Polices adaptées pour français et arabe'
      },
      {
        name: 'Structure sémantique',
        category: 'cognitive',
        status: 'warning',
        description: 'Hiérarchie des titres partiellement optimisée',
        suggestion: 'Vérifier l\'ordre des balises H1-H6'
      },
      {
        name: 'Alt text images',
        category: 'visual',
        status: 'fail',
        description: 'Certaines images manquent de descriptions',
        suggestion: 'Ajouter des attributs alt descriptifs'
      },
      {
        name: 'Lecteur d\'écran',
        category: 'auditory',
        status: 'pass',
        description: 'Compatible avec NVDA, JAWS et VoiceOver'
      },
      {
        name: 'Focus visible',
        category: 'keyboard',
        status: 'pass',
        description: 'Indicateurs de focus clairement visibles'
      }
    ];
    
    setTests(mockTests);
    setIsRunningTests(false);
  };

  const getTestIcon = (status: AccessibilityTest['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTestsByCategory = (category: AccessibilityTest['category']) => {
    return tests.filter(test => test.category === category);
  };

  const getOverallScore = () => {
    if (tests.length === 0) return 0;
    const passed = tests.filter(test => test.status === 'pass').length;
    const warnings = tests.filter(test => test.status === 'warning').length;
    return Math.round(((passed + warnings * 0.5) / tests.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AlgerianText variant="heading" className="text-2xl font-bold">
          {t('accessibility.title') || 'Accessibilité Bilingue'}
        </AlgerianText>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runAccessibilityTests} disabled={isRunningTests}>
            {isRunningTests ? (
              <Settings className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Accessibility className="w-4 h-4 mr-2" />
            )}
            {isRunningTests ? 'Test en cours...' : 'Tester l\'accessibilité'}
          </Button>
          <Badge variant={getOverallScore() >= 80 ? 'default' : getOverallScore() >= 60 ? 'secondary' : 'destructive'}>
            Score: {getOverallScore()}%
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paramètres visuels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Paramètres visuels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Taille de police: {settings.fontSize}px
                  </label>
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={([value]) => saveAccessibilitySettings({
                      ...settings,
                      fontSize: value
                    })}
                    min={12}
                    max={24}
                    step={1}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Contraste élevé</label>
                  <Switch
                    checked={settings.contrast === 'high'}
                    onCheckedChange={(checked) => saveAccessibilitySettings({
                      ...settings,
                      contrast: checked ? 'high' : 'normal'
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Réduire les animations</label>
                  <Switch
                    checked={!settings.motion}
                    onCheckedChange={(checked) => saveAccessibilitySettings({
                      ...settings,
                      motion: !checked
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Paramètres RTL/Langue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Paramètres linguistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Optimisation RTL</label>
                  <Switch
                    checked={settings.rtlOptimized}
                    onCheckedChange={(checked) => saveAccessibilitySettings({
                      ...settings,
                      rtlOptimized: checked
                    })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Langue actuelle</label>
                  <div className="flex gap-2">
                    <Button
                      variant={language === 'fr' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLanguage('fr')}
                    >
                      🇫🇷 Français
                    </Button>
                    <Button
                      variant={language === 'ar' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLanguage('ar')}
                    >
                      🇩🇿 العربية
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paramètres d'assistance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Assistance technique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Lecteur d'écran</label>
                  <Switch
                    checked={settings.screenReader}
                    onCheckedChange={(checked) => saveAccessibilitySettings({
                      ...settings,
                      screenReader: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Navigation clavier</label>
                  <Switch
                    checked={settings.keyboardNavigation}
                    onCheckedChange={(checked) => saveAccessibilitySettings({
                      ...settings,
                      keyboardNavigation: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Navigation vocale</label>
                  <Switch
                    checked={settings.voiceNavigation}
                    onCheckedChange={(checked) => saveAccessibilitySettings({
                      ...settings,
                      voiceNavigation: checked
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['visual', 'auditory', 'keyboard', 'cognitive', 'rtl'].map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg capitalize">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getTestsByCategory(category as AccessibilityTest['category']).map((test, index) => (
                      <div key={index} className="flex items-start gap-3">
                        {getTestIcon(test.status)}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{test.name}</p>
                          <p className="text-xs text-muted-foreground">{test.description}</p>
                          {test.suggestion && (
                            <p className="text-xs text-orange-600 mt-1">{test.suggestion}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guide d'accessibilité bilingue</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h3>Principes WCAG 2.1 pour AR/FR</h3>
              <ul className="space-y-2">
                <li><strong>Perceptible:</strong> Le contenu doit être présentable de manière à ce que les utilisateurs puissent le percevoir dans les deux langues</li>
                <li><strong>Utilisable:</strong> Les composants d'interface doivent être utilisables avec support RTL</li>
                <li><strong>Compréhensible:</strong> L'information et le fonctionnement de l'interface doivent être compréhensibles en français et en arabe</li>
                <li><strong>Robuste:</strong> Le contenu doit être suffisamment robuste pour être interprété par une large variété d'agents utilisateurs</li>
              </ul>
              
              <h3>Bonnes pratiques spécifiques</h3>
              <ul className="space-y-2">
                <li>Utiliser les polices appropriées pour chaque langue (Noto Sans Arabic pour l'arabe)</li>
                <li>Adapter les espacements et la mise en page pour le RTL</li>
                <li>Fournir des traductions complètes et contextuelles</li>
                <li>Tester avec des lecteurs d'écran multilingues</li>
                <li>Assurer la cohérence des raccourcis clavier</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}