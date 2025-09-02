/**
 * Système de navigation avancé avec raccourcis clavier
 * Navigation contextuelle et breadcrumbs intelligents
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { logger } from '@/utils/logger';
import { 
  Navigation, 
  Search, 
  Keyboard, 
  Command, 
  ArrowRight,
  Home,
  Gavel,
  ClipboardList,
  FileText,
  Users,
  Settings,
  BookOpen,
  BarChart3,
  HelpCircle,
  Zap,
  Star,
  History,
  ArrowLeft
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  category: string;
  shortcuts: string[];
  description?: string;
  children?: NavigationItem[];
  badge?: string;
  recent?: boolean;
  favorite?: boolean;
}

interface BreadcrumbItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType<any>;
}

interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  category: string;
  action: () => void;
}

export function AdvancedNavigationSystem() {
  const { t, language, isRTL } = useAlgerianI18n();
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPaths, setRecentPaths] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Structure de navigation complète (28+ sections)
  const navigationStructure: NavigationItem[] = useMemo(() => [
    // Dashboard
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: Home,
      path: '/dashboard',
      category: 'principal',
      shortcuts: ['Alt+D', 'Ctrl+Home'],
      description: 'Vue d\'ensemble et statistiques'
    },

    // Section Juridique
    {
      id: 'legal',
      label: 'Juridique',
      icon: Gavel,
      path: '/legal',
      category: 'principal',
      shortcuts: ['Alt+L'],
      description: 'Gestion des textes juridiques',
      children: [
        {
          id: 'legal-catalog',
          label: 'Catalogue juridique',
          icon: BookOpen,
          path: '/legal/catalog',
          category: 'juridique',
          shortcuts: ['Alt+L', 'C'],
          description: 'Catalogue des textes juridiques'
        },
        {
          id: 'legal-enrichment',
          label: 'Enrichissement juridique',
          icon: Zap,
          path: '/legal/enrichment',
          category: 'juridique',
          shortcuts: ['Alt+L', 'E'],
          description: 'Enrichissement et validation'
        },
        {
          id: 'legal-search',
          label: 'Recherche juridique',
          icon: Search,
          path: '/legal/search',
          category: 'juridique',
          shortcuts: ['Alt+L', 'S'],
          description: 'Recherche avancée dans les textes'
        },
        {
          id: 'legal-history',
          label: 'Historique juridique',
          icon: History,
          path: '/legal/history',
          category: 'juridique',
          shortcuts: ['Alt+L', 'H'],
          description: 'Historique des modifications'
        }
      ]
    },

    // Section Procédures
    {
      id: 'procedures',
      label: 'Procédures',
      icon: ClipboardList,
      path: '/procedures',
      category: 'principal',
      shortcuts: ['Alt+P'],
      description: 'Gestion des procédures administratives',
      children: [
        {
          id: 'procedures-catalog',
          label: 'Catalogue des procédures',
          icon: BookOpen,
          path: '/procedures/catalog',
          category: 'procédures',
          shortcuts: ['Alt+P', 'C'],
          description: 'Catalogue des procédures'
        },
        {
          id: 'procedures-enrichment',
          label: 'Enrichissement des procédures',
          icon: Zap,
          path: '/procedures/enrichment',
          category: 'procédures',
          shortcuts: ['Alt+P', 'E'],
          description: 'Enrichissement des procédures'
        },
        {
          id: 'procedures-search',
          label: 'Recherche de procédures',
          icon: Search,
          path: '/procedures/search',
          category: 'procédures',
          shortcuts: ['Alt+P', 'S'],
          description: 'Recherche dans les procédures'
        },
        {
          id: 'procedures-templates',
          label: 'Modèles de procédures',
          icon: FileText,
          path: '/procedures/templates',
          category: 'procédures',
          shortcuts: ['Alt+P', 'T'],
          description: 'Modèles et templates'
        }
      ]
    },

    // Section OCR
    {
      id: 'ocr',
      label: 'OCR-IA',
      icon: Zap,
      path: '/ocr',
      category: 'outils',
      shortcuts: ['Alt+O'],
      description: 'Reconnaissance optique de caractères',
      badge: 'IA',
      children: [
        {
          id: 'ocr-extraction',
          label: 'Extraction et Analyse',
          icon: Search,
          path: '/ocr/extraction',
          category: 'ocr',
          shortcuts: ['Alt+O', 'E'],
          description: 'Extraction de données'
        },
        {
          id: 'ocr-workflow',
          label: 'Workflow OCR',
          icon: ClipboardList,
          path: '/ocr/workflow',
          category: 'ocr',
          shortcuts: ['Alt+O', 'W'],
          description: 'Workflow de traitement'
        },
        {
          id: 'ocr-approval',
          label: 'File d\'approbation',
          icon: Users,
          path: '/ocr/approval',
          category: 'ocr',
          shortcuts: ['Alt+O', 'A'],
          description: 'Validation et approbation'
        },
        {
          id: 'ocr-analytics',
          label: 'Analytics OCR',
          icon: BarChart3,
          path: '/ocr/analytics',
          category: 'ocr',
          shortcuts: ['Alt+O', 'R'],
          description: 'Rapports et statistiques'
        }
      ]
    },

    // Section Analytics
    {
      id: 'analytics',
      label: 'Analytics et Rapports',
      icon: BarChart3,
      path: '/analytics',
      category: 'principal',
      shortcuts: ['Alt+A'],
      description: 'Analyses et rapports',
      children: [
        {
          id: 'analytics-dashboards',
          label: 'Tableaux de bord',
          icon: BarChart3,
          path: '/analytics/dashboards',
          category: 'analytics',
          shortcuts: ['Alt+A', 'D'],
          description: 'Tableaux de bord personnalisés'
        },
        {
          id: 'analytics-reports',
          label: 'Rapports',
          icon: FileText,
          path: '/analytics/reports',
          category: 'analytics',
          shortcuts: ['Alt+A', 'R'],
          description: 'Génération de rapports'
        },
        {
          id: 'analytics-performance',
          label: 'Performance',
          icon: Zap,
          path: '/analytics/performance',
          category: 'analytics',
          shortcuts: ['Alt+A', 'P'],
          description: 'Analyse de performance'
        }
      ]
    },

    // Section Collaboration
    {
      id: 'collaboration',
      label: 'Collaboration',
      icon: Users,
      path: '/collaboration',
      category: 'principal',
      shortcuts: ['Alt+C'],
      description: 'Outils collaboratifs',
      children: [
        {
          id: 'collaboration-teams',
          label: 'Équipes',
          icon: Users,
          path: '/collaboration/teams',
          category: 'collaboration',
          shortcuts: ['Alt+C', 'T'],
          description: 'Gestion des équipes'
        },
        {
          id: 'collaboration-annotations',
          label: 'Annotations',
          icon: FileText,
          path: '/collaboration/annotations',
          category: 'collaboration',
          shortcuts: ['Alt+C', 'A'],
          description: 'Annotations collaboratives'
        },
        {
          id: 'collaboration-debates',
          label: 'Débats',
          icon: Users,
          path: '/collaboration/debates',
          category: 'collaboration',
          shortcuts: ['Alt+C', 'D'],
          description: 'Débats structurés'
        }
      ]
    },

    // Section Ressources
    {
      id: 'resources',
      label: 'Ressources',
      icon: BookOpen,
      path: '/resources',
      category: 'principal',
      shortcuts: ['Alt+R'],
      description: 'Bibliothèque de ressources',
      children: [
        {
          id: 'resources-library',
          label: 'Bibliothèque',
          icon: BookOpen,
          path: '/resources/library',
          category: 'ressources',
          shortcuts: ['Alt+R', 'L'],
          description: 'Bibliothèque documentaire'
        },
        {
          id: 'resources-news',
          label: 'Actualités',
          icon: FileText,
          path: '/resources/news',
          category: 'ressources',
          shortcuts: ['Alt+R', 'N'],
          description: 'Actualités juridiques'
        },
        {
          id: 'resources-templates',
          label: 'Modèles',
          icon: FileText,
          path: '/resources/templates',
          category: 'ressources',
          shortcuts: ['Alt+R', 'T'],
          description: 'Modèles de documents'
        }
      ]
    },

    // Section Configuration
    {
      id: 'management',
      label: 'Gestion',
      icon: Settings,
      path: '/management',
      category: 'administration',
      shortcuts: ['Alt+M'],
      description: 'Gestion et administration',
      children: [
        {
          id: 'management-users',
          label: 'Utilisateurs',
          icon: Users,
          path: '/management/users',
          category: 'gestion',
          shortcuts: ['Alt+M', 'U'],
          description: 'Gestion des utilisateurs'
        },
        {
          id: 'management-nomenclature',
          label: 'Nomenclature',
          icon: BookOpen,
          path: '/management/nomenclature',
          category: 'gestion',
          shortcuts: ['Alt+M', 'N'],
          description: 'Gestion de la nomenclature'
        },
        {
          id: 'management-workflow',
          label: 'Workflows',
          icon: ClipboardList,
          path: '/management/workflow',
          category: 'gestion',
          shortcuts: ['Alt+M', 'W'],
          description: 'Configuration des workflows'
        }
      ]
    },

    // Section Paramètres
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      path: '/settings',
      category: 'administration',
      shortcuts: ['Ctrl+,', 'Alt+S'],
      description: 'Configuration système',
      children: [
        {
          id: 'settings-general',
          label: 'Général',
          icon: Settings,
          path: '/settings/general',
          category: 'paramètres',
          shortcuts: ['Alt+S', 'G'],
          description: 'Paramètres généraux'
        },
        {
          id: 'settings-localization',
          label: 'Localisation',
          icon: Settings,
          path: '/settings/localization',
          category: 'paramètres',
          shortcuts: ['Alt+S', 'L'],
          description: 'Langue et région'
        },
        {
          id: 'settings-performance',
          label: 'Performance',
          icon: Zap,
          path: '/settings/performance',
          category: 'paramètres',
          shortcuts: ['Alt+S', 'P'],
          description: 'Optimisation performance'
        }
      ]
    },

    // Section Aide
    {
      id: 'help',
      label: 'Aide',
      icon: HelpCircle,
      path: '/help',
      category: 'support',
      shortcuts: ['F1', 'Alt+H'],
      description: 'Documentation et support',
      children: [
        {
          id: 'help-user-guide',
          label: 'Guide utilisateur',
          icon: BookOpen,
          path: '/help/user-guide',
          category: 'aide',
          shortcuts: ['F1', 'U'],
          description: 'Guide d\'utilisation'
        },
        {
          id: 'help-admin-guide',
          label: 'Guide administrateur',
          icon: Users,
          path: '/help/admin-guide',
          category: 'aide',
          shortcuts: ['F1', 'A'],
          description: 'Guide administrateur'
        },
        {
          id: 'help-api',
          label: 'Documentation API',
          icon: FileText,
          path: '/help/api',
          category: 'aide',
          shortcuts: ['F1', 'P'],
          description: 'Documentation technique'
        },
        {
          id: 'help-tutorials',
          label: 'Tutoriels vidéo',
          icon: FileText,
          path: '/help/tutorials',
          category: 'aide',
          shortcuts: ['F1', 'T'],
          description: 'Tutoriels vidéo'
        }
      ]
    }
  ], []);

  // Raccourcis clavier
  const keyboardShortcuts: KeyboardShortcut[] = useMemo(() => [
    {
      id: 'command-palette',
      keys: ['Ctrl+K', 'Cmd+K'],
      description: 'Ouvrir la palette de commandes',
      category: 'Navigation',
      action: () => setIsCommandPaletteOpen(true)
    },
    {
      id: 'global-search',
      keys: ['Ctrl+/', 'Cmd+/'],
      description: 'Recherche globale',
      category: 'Recherche',
      action: () => {
        setIsCommandPaletteOpen(true);
        setSearchQuery('/');
      }
    },
    {
      id: 'go-home',
      keys: ['Alt+Home'],
      description: 'Retour à l\'accueil',
      category: 'Navigation',
      action: () => navigateTo('/dashboard')
    },
    {
      id: 'go-back',
      keys: ['Alt+ArrowLeft'],
      description: 'Page précédente',
      category: 'Navigation',
      action: () => window.history.back()
    },
    {
      id: 'go-forward',
      keys: ['Alt+ArrowRight'],
      description: 'Page suivante',
      category: 'Navigation',
      action: () => window.history.forward()
    },
    {
      id: 'shortcuts-help',
      keys: ['Ctrl+Shift+?', 'Cmd+Shift+?'],
      description: 'Afficher les raccourcis',
      category: 'Aide',
      action: () => setShowShortcuts(true)
    },
    {
      id: 'toggle-favorites',
      keys: ['Ctrl+B', 'Cmd+B'],
      description: 'Ajouter/retirer des favoris',
      category: 'Favoris',
      action: () => toggleFavorite(currentPath)
    }
  ], [currentPath]);

  // Navigation vers une page
  const navigateTo = useCallback((path: string) => {
    logger.info('Navigation', 'Navigation vers', { path, from: currentPath }, 'AdvancedNavigationSystem');
    
    setCurrentPath(path);
    
    // Ajouter aux récents (max 10)
    setRecentPaths(prev => {
      const updated = [path, ...prev.filter(p => p !== path)].slice(0, 10);
      localStorage.setItem('dalil-recent-paths', JSON.stringify(updated));
      return updated;
    });
    
    setIsCommandPaletteOpen(false);
    setSearchQuery('');
  }, [currentPath]);

  // Gérer les favoris
  const toggleFavorite = useCallback((path: string) => {
    setFavorites(prev => {
      const updated = prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path];
      
      localStorage.setItem('dalil-favorites', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Génération des breadcrumbs
  const generateBreadcrumbs = useCallback((path: string): BreadcrumbItem[] => {
    const parts = path.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { id: 'home', label: 'Accueil', path: '/', icon: Home }
    ];

    let currentPath = '';
    for (const part of parts) {
      currentPath += `/${part}`;
      
      // Trouver l'item correspondant dans la navigation
      const findItem = (items: NavigationItem[]): NavigationItem | undefined => {
        for (const item of items) {
          if (item.path === currentPath) return item;
          if (item.children) {
            const found = findItem(item.children);
            if (found) return found;
          }
        }
        return undefined;
      };

      const navItem = findItem(navigationStructure);
      if (navItem) {
        breadcrumbs.push({
          id: navItem.id,
          label: navItem.label,
          path: currentPath,
          icon: navItem.icon
        });
      }
    }

    return breadcrumbs;
  }, [navigationStructure]);

  // Filtrage des items pour la recherche
  const filteredItems = useMemo(() => {
    if (!searchQuery) return [];

    const flattenItems = (items: NavigationItem[]): NavigationItem[] => {
      return items.reduce((acc, item) => {
        acc.push(item);
        if (item.children) {
          acc.push(...flattenItems(item.children));
        }
        return acc;
      }, [] as NavigationItem[]);
    };

    const allItems = flattenItems(navigationStructure);
    
    return allItems.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortcuts.some(shortcut => 
        shortcut.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ).slice(0, 10);
  }, [searchQuery, navigationStructure]);

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of keyboardShortcuts) {
        for (const key of shortcut.keys) {
          if (isKeyComboPressed(event, key)) {
            event.preventDefault();
            shortcut.action();
            break;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardShortcuts]);

  // Vérifier si une combinaison de touches est pressée
  const isKeyComboPressed = (event: KeyboardEvent, combo: string): boolean => {
    const keys = combo.split('+').map(k => k.trim());
    const modifiers = {
      'Ctrl': event.ctrlKey,
      'Cmd': event.metaKey,
      'Alt': event.altKey,
      'Shift': event.shiftKey
    };

    // Vérifier les modificateurs
    for (const key of keys) {
      if (key in modifiers) {
        if (!modifiers[key as keyof typeof modifiers]) return false;
      } else {
        // Vérifier la touche principale
        if (event.key !== key && event.code !== key) return false;
      }
    }

    return true;
  };

  // Charger les données sauvegardées au démarrage
  useEffect(() => {
    try {
      const savedRecents = localStorage.getItem('dalil-recent-paths');
      if (savedRecents) {
        setRecentPaths(JSON.parse(savedRecents));
      }

      const savedFavorites = localStorage.getItem('dalil-favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('❌ Erreur chargement navigation:', error);
    }
  }, []);

  const breadcrumbs = generateBreadcrumbs(currentPath);

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <Card>
        <CardContent className="p-4">
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 h-auto p-1"
                  onClick={() => navigateTo(item.path)}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Button>
              </React.Fragment>
            ))}
          </nav>
        </CardContent>
      </Card>

      {/* Barre de navigation principale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Navigation Avancée
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="gap-2"
              >
                <Command className="h-4 w-4" />
                Palette de commandes
                <Badge variant="secondary">Ctrl+K</Badge>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShortcuts(true)}
                className="gap-2"
              >
                <Keyboard className="h-4 w-4" />
                Raccourcis
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Pages récentes */}
            {recentPaths.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Pages récentes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recentPaths.slice(0, 5).map((path) => {
                    const item = navigationStructure
                      .flatMap(i => [i, ...(i.children || [])])
                      .find(i => i.path === path);
                    
                    return item ? (
                      <Button
                        key={path}
                        variant="outline"
                        size="sm"
                        onClick={() => navigateTo(path)}
                        className="gap-2"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Favoris */}
            {favorites.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Favoris
                </h4>
                <div className="flex flex-wrap gap-2">
                  {favorites.map((path) => {
                    const item = navigationStructure
                      .flatMap(i => [i, ...(i.children || [])])
                      .find(i => i.path === path);
                    
                    return item ? (
                      <Button
                        key={path}
                        variant="outline"
                        size="sm"
                        onClick={() => navigateTo(path)}
                        className="gap-2"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                        <Star className="h-3 w-3 fill-current" />
                      </Button>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Palette de commandes */}
      <Dialog open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Palette de commandes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher une page, une commande..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            <ScrollArea className="h-80">
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-auto p-3"
                    onClick={() => navigateTo(item.path)}
                  >
                    <item.icon className="h-5 w-5" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {item.shortcuts.slice(0, 1).map((shortcut) => (
                        <Badge key={shortcut} variant="secondary" className="text-xs">
                          {shortcut}
                        </Badge>
                      ))}
                      {favorites.includes(item.path) && (
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Aide raccourcis clavier */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Raccourcis clavier
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-6">
              {Object.entries(
                keyboardShortcuts.reduce((acc, shortcut) => {
                  if (!acc[shortcut.category]) {
                    acc[shortcut.category] = [];
                  }
                  acc[shortcut.category].push(shortcut);
                  return acc;
                }, {} as Record<string, KeyboardShortcut[]>)
              ).map(([category, shortcuts]) => (
                <div key={category}>
                  <h4 className="font-medium mb-3">{category}</h4>
                  <div className="space-y-2">
                    {shortcuts.map((shortcut) => (
                      <div 
                        key={shortcut.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm">{shortcut.description}</span>
                        <div className="flex gap-1">
                          {shortcut.keys.map((key) => (
                            <Badge key={key} variant="outline" className="font-mono">
                              {key}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}