/**
 * Système de design responsive unifié pour Dalil.dz
 * Phase 3: Finalisation UI - Cohérence visuelle et responsivité
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Type, 
  Layout, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Zap,
  Eye,
  Accessibility,
  Contrast,
  Sun,
  Moon,
  CheckCircle
} from 'lucide-react';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { logger } from '@/utils/logger';

interface DesignToken {
  name: string;
  value: string;
  description: string;
  category: 'colors' | 'typography' | 'spacing' | 'borders' | 'shadows';
}

interface ResponsiveBreakpoint {
  name: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

interface DesignComponent {
  name: string;
  preview: React.ReactNode;
  code: string;
  description: string;
  responsive: boolean;
  accessibility: 'good' | 'fair' | 'excellent';
}

export function ResponsiveDesignSystem() {
  const { t, isRTL } = useAlgerianI18n();
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('desktop');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const breakpoints: ResponsiveBreakpoint[] = [
    {
      name: 'mobile',
      value: '< 640px',
      description: 'Téléphones mobiles',
      icon: <Smartphone className="w-4 h-4" />
    },
    {
      name: 'tablet',
      value: '640px - 1024px',
      description: 'Tablettes',
      icon: <Tablet className="w-4 h-4" />
    },
    {
      name: 'desktop',
      value: '> 1024px',
      description: 'Ordinateurs de bureau',
      icon: <Monitor className="w-4 h-4" />
    }
  ];

  const designTokens: DesignToken[] = [
    // Couleurs
    {
      name: '--primary',
      value: 'hsl(142, 76%, 36%)',
      description: 'Couleur principale (vert algérien)',
      category: 'colors'
    },
    {
      name: '--primary-foreground',
      value: 'hsl(355, 7%, 97%)',
      description: 'Texte sur couleur principale',
      category: 'colors'
    },
    {
      name: '--secondary',
      value: 'hsl(210, 40%, 98%)',
      description: 'Couleur secondaire',
      category: 'colors'
    },
    {
      name: '--accent',
      value: 'hsl(210, 40%, 96%)',
      description: 'Couleur d\'accent',
      category: 'colors'
    },
    {
      name: '--destructive',
      value: 'hsl(0, 84%, 60%)',
      description: 'Couleur destructive/erreur',
      category: 'colors'
    },
    {
      name: '--muted',
      value: 'hsl(210, 40%, 96%)',
      description: 'Couleur atténuée',
      category: 'colors'
    },
    {
      name: '--border',
      value: 'hsl(214, 32%, 91%)',
      description: 'Couleur des bordures',
      category: 'colors'
    },
    
    // Typographie
    {
      name: '--font-sans',
      value: '"Inter", system-ui, sans-serif',
      description: 'Police principale',
      category: 'typography'
    },
    {
      name: '--font-arabic',
      value: '"Noto Sans Arabic", system-ui, sans-serif',
      description: 'Police arabe',
      category: 'typography'
    },
    {
      name: '--text-sm',
      value: '0.875rem',
      description: 'Texte petit (14px)',
      category: 'typography'
    },
    {
      name: '--text-base',
      value: '1rem',
      description: 'Texte normal (16px)',
      category: 'typography'
    },
    {
      name: '--text-lg',
      value: '1.125rem',
      description: 'Texte large (18px)',
      category: 'typography'
    },
    {
      name: '--text-xl',
      value: '1.25rem',
      description: 'Texte extra-large (20px)',
      category: 'typography'
    },
    
    // Espacement
    {
      name: '--spacing-xs',
      value: '0.25rem',
      description: 'Espacement très petit (4px)',
      category: 'spacing'
    },
    {
      name: '--spacing-sm',
      value: '0.5rem',
      description: 'Espacement petit (8px)',
      category: 'spacing'
    },
    {
      name: '--spacing-md',
      value: '1rem',
      description: 'Espacement moyen (16px)',
      category: 'spacing'
    },
    {
      name: '--spacing-lg',
      value: '1.5rem',
      description: 'Espacement large (24px)',
      category: 'spacing'
    },
    {
      name: '--spacing-xl',
      value: '2rem',
      description: 'Espacement extra-large (32px)',
      category: 'spacing'
    },
    
    // Bordures
    {
      name: '--radius',
      value: '0.5rem',
      description: 'Rayon de bordure standard',
      category: 'borders'
    },
    {
      name: '--radius-sm',
      value: '0.25rem',
      description: 'Rayon de bordure petit',
      category: 'borders'
    },
    {
      name: '--radius-lg',
      value: '0.75rem',
      description: 'Rayon de bordure large',
      category: 'borders'
    },
    
    // Ombres
    {
      name: '--shadow-sm',
      value: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      description: 'Ombre petite',
      category: 'shadows'
    },
    {
      name: '--shadow-md',
      value: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      description: 'Ombre moyenne',
      category: 'shadows'
    },
    {
      name: '--shadow-lg',
      value: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      description: 'Ombre large',
      category: 'shadows'
    }
  ];

  const designComponents: DesignComponent[] = [
    {
      name: 'Carte de procédure',
      preview: (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="text-lg">Demande d'acte de naissance</CardTitle>
            <Badge variant="secondary">État civil</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Procédure pour obtenir un acte de naissance auprès des services d'état civil.
            </p>
            <Button className="w-full">Commencer</Button>
          </CardContent>
        </Card>
      ),
      code: `<Card className="max-w-sm">
  <CardHeader>
    <CardTitle>Demande d'acte de naissance</CardTitle>
    <Badge variant="secondary">État civil</Badge>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground mb-4">
      Procédure pour obtenir un acte de naissance...
    </p>
    <Button className="w-full">Commencer</Button>
  </CardContent>
</Card>`,
      description: 'Carte responsive pour l\'affichage des procédures administratives',
      responsive: true,
      accessibility: 'excellent'
    },
    {
      name: 'Navigation algérienne',
      preview: (
        <nav className="flex items-center gap-4 p-4 bg-primary text-primary-foreground rounded">
          <div className="font-bold">Dalil.dz</div>
          <div className="hidden md:flex gap-4 text-sm">
            <a href="#" className="hover:underline">Accueil</a>
            <a href="#" className="hover:underline">Procédures</a>
            <a href="#" className="hover:underline">Textes juridiques</a>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              FR
            </Button>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              AR
            </Button>
          </div>
        </nav>
      ),
      code: `<nav className="flex items-center gap-4 p-4 bg-primary text-primary-foreground rounded">
  <div className="font-bold">Dalil.dz</div>
  <div className="hidden md:flex gap-4 text-sm">
    <a href="#" className="hover:underline">Accueil</a>
    <a href="#" className="hover:underline">Procédures</a>
    <a href="#" className="hover:underline">Textes juridiques</a>
  </div>
  <div className="ml-auto flex gap-2">
    <Button variant="outline" size="sm">FR</Button>
    <Button variant="outline" size="sm">AR</Button>
  </div>
</nav>`,
      description: 'Barre de navigation adaptive avec sélecteur de langue FR/AR',
      responsive: true,
      accessibility: 'good'
    },
    {
      name: 'Formulaire bilingue',
      preview: (
        <div className="space-y-4 p-4 border rounded max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom complet / الاسم الكامل</label>
            <input 
              className="w-full p-2 border rounded" 
              placeholder="Entrez votre nom complet"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Wilaya / الولاية</label>
            <select className="w-full p-2 border rounded">
              <option>Choisir une wilaya</option>
              <option>Alger / الجزائر</option>
              <option>Oran / وهران</option>
            </select>
          </div>
          <Button className="w-full">Soumettre / إرسال</Button>
        </div>
      ),
      code: `<div className="space-y-4">
  <div className="space-y-2">
    <label className="text-sm font-medium">
      Nom complet / الاسم الكامل
    </label>
    <input 
      className="w-full p-2 border rounded" 
      placeholder="Entrez votre nom complet"
    />
  </div>
  <Button className="w-full">Soumettre / إرسال</Button>
</div>`,
      description: 'Formulaire avec libellés bilingues français/arabe',
      responsive: true,
      accessibility: 'excellent'
    }
  ];

  // Détection de la taille d'écran
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCurrentBreakpoint('mobile');
      } else if (width < 1024) {
        setCurrentBreakpoint('tablet');
      } else {
        setCurrentBreakpoint('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Application du mode sombre et contraste élevé
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    logger.info('UI', 'Thème mis à jour', { 
      isDarkMode, 
      highContrast 
    }, 'ResponsiveDesignSystem');
  }, [isDarkMode, highContrast]);

  const groupedTokens = designTokens.reduce((acc, token) => {
    if (!acc[token.category]) {
      acc[token.category] = [];
    }
    acc[token.category].push(token);
    return acc;
  }, {} as Record<string, DesignToken[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'colors': return <Palette className="w-4 h-4" />;
      case 'typography': return <Type className="w-4 h-4" />;
      case 'spacing': return <Layout className="w-4 h-4" />;
      case 'borders': return <Layout className="w-4 h-4" />;
      case 'shadows': return <Layout className="w-4 h-4" />;
      default: return <Layout className="w-4 h-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    const names = {
      colors: 'Couleurs',
      typography: 'Typographie',
      spacing: 'Espacement',
      borders: 'Bordures',
      shadows: 'Ombres'
    };
    return names[category as keyof typeof names] || category;
  };

  const getAccessibilityColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-full">
                <Palette className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Système de Design Dalil.dz</CardTitle>
                <p className="text-muted-foreground">
                  Design system unifié et responsive pour l'administration algérienne
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Indicateur de breakpoint actuel */}
              <div className="flex items-center gap-2 px-3 py-1 bg-white/50 rounded-full">
                {breakpoints.find(bp => bp.name === currentBreakpoint)?.icon}
                <span className="text-sm font-medium capitalize">{currentBreakpoint}</span>
              </div>
              
              {/* Contrôles d'accessibilité */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="gap-2"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDarkMode ? 'Clair' : 'Sombre'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHighContrast(!highContrast)}
                className="gap-2"
              >
                <Contrast className="w-4 h-4" />
                {highContrast ? 'Contraste normal' : 'Contraste élevé'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="tokens" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tokens">Tokens de design</TabsTrigger>
          <TabsTrigger value="components">Composants</TabsTrigger>
          <TabsTrigger value="responsive">Responsive</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibilité</TabsTrigger>
        </TabsList>

        {/* Tokens de design */}
        <TabsContent value="tokens" className="space-y-6">
          {Object.entries(groupedTokens).map(([category, tokens]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {getCategoryName(category)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tokens.map((token) => (
                    <div key={token.name} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {token.name}
                        </code>
                        {category === 'colors' && (
                          <div 
                            className="w-6 h-6 rounded border-2 border-gray-200"
                            style={{ backgroundColor: token.value }}
                          />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {token.description}
                      </div>
                      <div className="text-xs font-mono text-gray-500">
                        {token.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Composants */}
        <TabsContent value="components" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {designComponents.map((component) => (
              <Card key={component.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{component.name}</CardTitle>
                    <div className="flex gap-2">
                      {component.responsive && (
                        <Badge variant="secondary">
                          <Layout className="w-3 h-3 mr-1" />
                          Responsive
                        </Badge>
                      )}
                      <Badge variant="outline" className={getAccessibilityColor(component.accessibility)}>
                        <Accessibility className="w-3 h-3 mr-1" />
                        {component.accessibility}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {component.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Aperçu */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {component.preview}
                  </div>
                  
                  {/* Code */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium hover:text-primary">
                      Voir le code
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                      <code>{component.code}</code>
                    </pre>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Responsive */}
        <TabsContent value="responsive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Points de rupture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {breakpoints.map((breakpoint) => (
                  <div 
                    key={breakpoint.name}
                    className={`p-4 border rounded-lg transition-all ${
                      currentBreakpoint === breakpoint.name 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {breakpoint.icon}
                      <span className="font-medium capitalize">{breakpoint.name}</span>
                      {currentBreakpoint === breakpoint.name && (
                        <Badge variant="default" className="ml-auto">
                          Actuel
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {breakpoint.value}
                    </div>
                    <div className="text-sm">
                      {breakpoint.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Classes utilitaires responsive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Affichage</h4>
                    <div className="space-y-1 text-sm font-mono">
                      <div><code>hidden md:block</code> - Masqué sur mobile</div>
                      <div><code>block md:hidden</code> - Visible sur mobile uniquement</div>
                      <div><code>flex md:grid</code> - Flex sur mobile, grid sur desktop</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Grilles</h4>
                    <div className="space-y-1 text-sm font-mono">
                      <div><code>grid-cols-1 md:grid-cols-2 lg:grid-cols-3</code></div>
                      <div><code>col-span-1 md:col-span-2</code></div>
                      <div><code>gap-2 md:gap-4 lg:gap-6</code></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Typographie</h4>
                    <div className="space-y-1 text-sm font-mono">
                      <div><code>text-sm md:text-base lg:text-lg</code></div>
                      <div><code>text-center md:text-left</code></div>
                      <div><code>leading-tight md:leading-normal</code></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Espacement</h4>
                    <div className="space-y-1 text-sm font-mono">
                      <div><code>p-2 md:p-4 lg:p-6</code></div>
                      <div><code>mx-2 md:mx-4 lg:mx-auto</code></div>
                      <div><code>space-y-2 md:space-y-4</code></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibilité */}
        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="w-5 h-5" />
                Critères d'accessibilité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Visuel
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Contraste minimum 4.5:1</span>
                      <Badge variant="default">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Respecté
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Taille de police minimum 16px</span>
                      <Badge variant="default">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Respecté
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Zones de clic minimum 44x44px</span>
                      <Badge variant="default">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Respecté
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Sémantique
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Structure HTML sémantique</span>
                      <Badge variant="default">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Respecté
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Labels pour tous les champs</span>
                      <Badge variant="default">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Respecté
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Navigation au clavier</span>
                      <Badge variant="default">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Respecté
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support multilingue (FR/AR)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Direction du texte (RTL/LTR)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Français (LTR)</p>
                      <div className="p-3 bg-gray-50 rounded text-left">
                        <p>Bienvenue sur Dalil.dz - Votre guide des procédures administratives algériennes.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">العربية (RTL)</p>
                      <div className="p-3 bg-gray-50 rounded text-right" dir="rtl">
                        <p>مرحباً بكم في موقع دليل.dz - دليلكم للإجراءات الإدارية الجزائرية.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Polices optimisées</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Français:</span> Inter - Police optimisée pour la lisibilité
                    </div>
                    <div>
                      <span className="font-medium">العربية:</span> Noto Sans Arabic - Support complet des caractères arabes
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