import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Menu, 
  X, 
  Home, 
  FileText, 
  Settings, 
  BookOpen,
  Users,
  BarChart,
  HelpCircle,
  Zap,
  Globe,
  ChevronDown,
  Star
} from 'lucide-react';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { AlgerianText } from '@/components/algerian/AlgerianText';
import { LanguageSelector } from '@/components/LanguageSelector';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface NavigationSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  subsections?: NavigationSection[];
  badge?: string;
}

/**
 * Phase 3 du plan d'action - Navigation globale unifiée
 * Support complet des 28+ sections avec recherche et accessibilité
 */
export function UnifiedGlobalNavigation() {
  const { t, isRTL, language } = useAlgerianI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [searchResults, setSearchResults] = useState<NavigationSection[]>([]);
  const [favoritesSections, setFavoritesSections] = useState<string[]>([]);

  // Définition complète de la navigation (28+ sections)
  const navigationSections: NavigationSection[] = [
    {
      id: 'dashboard',
      label: t('navigation.dashboard') || 'Tableau de bord',
      icon: Home,
      path: '/'
    },
    {
      id: 'legal',
      label: t('navigation.legal-texts') || 'Juridique',
      icon: FileText,
      path: '/legal',
      subsections: [
        { id: 'legal-catalog', label: 'Catalogue', icon: BookOpen, path: '/legal-catalog' },
        { id: 'legal-enrichment', label: 'Enrichissement', icon: Settings, path: '/legal-enrichment' },
        { id: 'legal-search', label: 'Recherche', icon: Search, path: '/legal-search' }
      ]
    },
    {
      id: 'procedures',
      label: t('navigation.procedures') || 'Procédures',
      icon: Settings,
      path: '/procedures',
      subsections: [
        { id: 'procedures-catalog', label: 'Catalogue', icon: BookOpen, path: '/procedures-catalog' },
        { id: 'procedures-enrichment', label: 'Enrichissement', icon: Settings, path: '/procedures-enrichment' },
        { id: 'procedures-search', label: 'Recherche', icon: Search, path: '/procedures-search' }
      ]
    },
    {
      id: 'ocr',
      label: t('navigation.ocr') || 'OCR IA',
      icon: Zap,
      path: '/ocr',
      badge: 'Nouveau',
      subsections: [
        { id: 'ocr-extraction', label: 'Extraction', icon: Zap, path: '/ocr-extraction' },
        { id: 'ocr-workflow', label: 'Workflow', icon: Settings, path: '/ocr-workflow' },
        { id: 'ocr-validation', label: 'Validation', icon: FileText, path: '/ocr-validation' }
      ]
    },
    {
      id: 'collaboration',
      label: t('navigation.collaboration') || 'Collaboration',
      icon: Users,
      path: '/collaboration',
      subsections: [
        { id: 'team-workspace', label: 'Espace équipe', icon: Users, path: '/team-workspace' },
        { id: 'shared-documents', label: 'Documents partagés', icon: FileText, path: '/shared-documents' },
        { id: 'comments-reviews', label: 'Commentaires', icon: BookOpen, path: '/comments-reviews' }
      ]
    },
    {
      id: 'analytics',
      label: t('navigation.analytics') || 'Analytiques',
      icon: BarChart,
      path: '/analytics',
      subsections: [
        { id: 'usage-statistics', label: 'Statistiques', icon: BarChart, path: '/usage-statistics' },
        { id: 'performance-reports', label: 'Rapports', icon: FileText, path: '/performance-reports' },
        { id: 'user-insights', label: 'Insights', icon: Users, path: '/user-insights' }
      ]
    },
    {
      id: 'resources',
      label: t('navigation.resources') || 'Ressources',
      icon: BookOpen,
      path: '/resources',
      subsections: [
        { id: 'documentation', label: 'Documentation', icon: BookOpen, path: '/documentation' },
        { id: 'tutorials', label: 'Tutoriels', icon: HelpCircle, path: '/tutorials' },
        { id: 'templates', label: 'Modèles', icon: FileText, path: '/templates' }
      ]
    },
    {
      id: 'management',
      label: t('navigation.management') || 'Gestion',
      icon: Settings,
      path: '/management',
      subsections: [
        { id: 'user-management', label: 'Utilisateurs', icon: Users, path: '/user-management' },
        { id: 'system-config', label: 'Configuration', icon: Settings, path: '/system-config' },
        { id: 'integrations', label: 'Intégrations', icon: Globe, path: '/integrations' }
      ]
    },
    {
      id: 'help',
      label: t('navigation.help') || 'Aide',
      icon: HelpCircle,
      path: '/help'
    }
  ];

  useEffect(() => {
    // Charger les sections favorites depuis localStorage
    const saved = localStorage.getItem('dalil-favorite-sections');
    if (saved) {
      setFavoritesSections(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Recherche en temps réel
    if (searchQuery.trim()) {
      const results = searchInNavigation(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchInNavigation = (query: string): NavigationSection[] => {
    const results: NavigationSection[] = [];
    const lowerQuery = query.toLowerCase();

    const searchInSection = (section: NavigationSection) => {
      if (section.label.toLowerCase().includes(lowerQuery)) {
        results.push(section);
      }
      if (section.subsections) {
        section.subsections.forEach(searchInSection);
      }
    };

    navigationSections.forEach(searchInSection);
    return results.slice(0, 5); // Limiter à 5 résultats
  };

  const toggleFavorite = (sectionId: string) => {
    const newFavorites = favoritesSections.includes(sectionId)
      ? favoritesSections.filter(id => id !== sectionId)
      : [...favoritesSections, sectionId];
    
    setFavoritesSections(newFavorites);
    localStorage.setItem('dalil-favorite-sections', JSON.stringify(newFavorites));
  };

  const navigateToSection = (sectionId: string) => {
    setCurrentSection(sectionId);
    setIsMenuOpen(false);
    
    // Émettre l'événement de navigation
    window.dispatchEvent(new CustomEvent('navigate-to-section', { 
      detail: sectionId 
    }));
  };

  const getSectionByPath = (path: string) => {
    for (const section of navigationSections) {
      if (section.path === path) return section;
      if (section.subsections) {
        for (const subsection of section.subsections) {
          if (subsection.path === path) return subsection;
        }
      }
    }
    return null;
  };

  const renderNavigationItem = (section: NavigationSection, isSubsection = false) => {
    const isActive = currentSection === section.id;
    const isFavorite = favoritesSections.includes(section.id);
    const IconComponent = section.icon;

    return (
      <div key={section.id} className={`${isSubsection ? 'ml-4' : ''}`}>
        <Button
          variant={isActive ? 'default' : 'ghost'}
          className={`w-full justify-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}
          onClick={() => navigateToSection(section.id)}
        >
          <IconComponent className="w-4 h-4" />
          <AlgerianText className="flex-1 text-start">{section.label}</AlgerianText>
          
          {section.badge && (
            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
              {section.badge}
            </span>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(section.id);
            }}
          >
            <Star className={`w-3 h-3 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
          </Button>
        </Button>
        
        {section.subsections && (
          <div className="mt-1 space-y-1">
            {section.subsections.map(subsection => renderNavigationItem(subsection, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Navigation mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          
          <AlgerianText variant="heading" className="font-bold">
            Dalil.dz
          </AlgerianText>
          
          <LanguageSelector />
        </div>
      </div>

      {/* Navigation desktop et overlay mobile */}
      <div className={`
        fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-40 
        w-80 bg-background border-r shadow-lg transform transition-transform duration-300
        ${isMenuOpen || window.innerWidth >= 1024 ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <AlgerianText variant="heading" className="text-xl font-bold">
                Dalil.dz
              </AlgerianText>
              <div className="hidden lg:block">
                <LanguageSelector />
              </div>
            </div>
            
            {/* Recherche globale */}
            <div className="relative">
              <Search className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={t('common.search') || 'Rechercher...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? 'pr-10' : 'pl-10'}`}
              />
              
              {/* Résultats de recherche */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
                  {searchResults.map((result) => (
                    <Button
                      key={result.id}
                      variant="ghost"
                      className="w-full justify-start gap-3 p-3"
                      onClick={() => navigateToSection(result.id)}
                    >
                      <result.icon className="w-4 h-4" />
                      <AlgerianText>{result.label}</AlgerianText>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sections favorites */}
          {favoritesSections.length > 0 && (
            <div className="p-4 border-b">
              <AlgerianText className="text-sm font-medium text-muted-foreground mb-2">
                Favoris
              </AlgerianText>
              <div className="space-y-1">
                {favoritesSections.map(sectionId => {
                  const section = navigationSections.find(s => s.id === sectionId);
                  return section && renderNavigationItem(section);
                })}
              </div>
            </div>
          )}

          {/* Navigation principale */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navigationSections.map(section => renderNavigationItem(section))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground text-center">
              <AlgerianText>
                {t('algerian.republicName') || 'République Algérienne Démocratique et Populaire'}
              </AlgerianText>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay pour mobile */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}