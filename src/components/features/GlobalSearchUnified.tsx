import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Clock,
  FileText,
  Users,
  Settings,
  Star,
  TrendingUp,
  Globe,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'legal-text' | 'procedure' | 'form' | 'news' | 'user' | 'setting';
  category: string;
  relevance: number;
  lastModified: Date;
  path: string;
  tags: string[];
}

interface SearchFilter {
  type: SearchResult['type'] | 'all';
  category: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'smart';
  frequency: number;
}

export function GlobalSearchUnified() {
  const { t, language, isRTL } = useAlgerianI18n();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<SearchFilter>({
    type: 'all',
    category: 'all',
    dateRange: 'all'
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const translations = {
    fr: {
      title: "Recherche Globale Unifiée",
      placeholder: "Rechercher dans tout Dalil.dz...",
      searching: "Recherche en cours...",
      noResults: "Aucun résultat trouvé",
      filters: "Filtres",
      recent: "Récentes",
      popular: "Populaires",
      suggestions: "Suggestions",
      allTypes: "Tous types",
      legalText: "Textes juridiques",
      procedure: "Procédures",
      form: "Formulaires",
      news: "Actualités",
      user: "Utilisateurs",
      setting: "Paramètres",
      relevance: "Pertinence",
      modified: "Modifié",
      clearHistory: "Effacer l'historique",
      advancedSearch: "Recherche avancée"
    },
    ar: {
      title: "البحث الموحد الشامل",
      placeholder: "البحث في جميع أنحاء دليل.دز...",
      searching: "جاري البحث...",
      noResults: "لم يتم العثور على نتائج",
      filters: "المرشحات",
      recent: "الأخيرة",
      popular: "الشائعة",
      suggestions: "الاقتراحات",
      allTypes: "جميع الأنواع",
      legalText: "النصوص القانونية",
      procedure: "الإجراءات",
      form: "النماذج",
      news: "الأخبار",
      user: "المستخدمون",
      setting: "الإعدادات",
      relevance: "الصلة",
      modified: "تم التعديل",
      clearHistory: "مسح التاريخ",
      advancedSearch: "البحث المتقدم"
    },
    en: {
      title: "Unified Global Search",
      placeholder: "Search across all of Dalil.dz...",
      searching: "Searching...",
      noResults: "No results found",
      filters: "Filters",
      recent: "Recent",
      popular: "Popular",
      suggestions: "Suggestions",
      allTypes: "All Types",
      legalText: "Legal Texts",
      procedure: "Procedures",
      form: "Forms",
      news: "News",
      user: "Users",
      setting: "Settings",
      relevance: "Relevance",
      modified: "Modified",
      clearHistory: "Clear History",
      advancedSearch: "Advanced Search"
    }
  };

  const texts = translations[language as keyof typeof translations] || translations.fr;

  // Charger l'historique de recherche
  useEffect(() => {
    const saved = localStorage.getItem('dalil-search-history');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.warn('Erreur lors du chargement de l\'historique de recherche:', error);
      }
    }
  }, []);

  // Sauvegarder l'historique de recherche
  const saveSearchHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('dalil-search-history', JSON.stringify(updated));
  }, [recentSearches]);

  // Recherche en temps réel avec debounce
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simuler une recherche avec délai
    await new Promise(resolve => setTimeout(resolve, 500));

    // Résultats de recherche simulés
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'Code Civil Algérien - Article 324',
        description: 'Dispositions relatives aux contrats et obligations...',
        type: 'legal-text' as const,
        category: 'Droit Civil',
        relevance: 95,
        lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
        path: '/legal-catalog/civil-code/article-324',
        tags: ['contrat', 'obligation', 'civil']
      },
      {
        id: '2',
        title: 'Procédure de demande de passeport',
        description: 'Guide complet pour obtenir un passeport biométrique...',
        type: 'procedure' as const,
        category: 'Documents d\'identité',
        relevance: 88,
        lastModified: new Date(Date.now() - 1000 * 60 * 60 * 48),
        path: '/procedures-catalog/passport-request',
        tags: ['passeport', 'identité', 'biométrique']
      },
      {
        id: '3',
        title: 'Formulaire de déclaration de naissance',
        description: 'Formulaire officiel pour déclarer une naissance en Algérie...',
        type: 'form' as const,
        category: 'État civil',
        relevance: 82,
        lastModified: new Date(Date.now() - 1000 * 60 * 60 * 72),
        path: '/forms/birth-declaration',
        tags: ['naissance', 'état civil', 'déclaration']
      },
      {
        id: '4',
        title: 'Nouvelles réformes juridiques 2024',
        description: 'Aperçu des dernières modifications du système juridique...',
        type: 'news' as const,
        category: 'Actualités juridiques',
        relevance: 76,
        lastModified: new Date(Date.now() - 1000 * 60 * 60 * 96),
        path: '/news/legal-reforms-2024',
        tags: ['réforme', 'juridique', '2024']
      }
    ].filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Appliquer les filtres
    const filteredResults = mockResults.filter(result => {
      if (filters.type !== 'all' && result.type !== filters.type) return false;
      if (filters.category !== 'all' && result.category !== filters.category) return false;
      
      // Filtre par date
      if (filters.dateRange !== 'all') {
        const now = Date.now();
        const resultTime = result.lastModified.getTime();
        const dayMs = 1000 * 60 * 60 * 24;
        
        switch (filters.dateRange) {
          case 'today':
            if (now - resultTime > dayMs) return false;
            break;
          case 'week':
            if (now - resultTime > dayMs * 7) return false;
            break;
          case 'month':
            if (now - resultTime > dayMs * 30) return false;
            break;
        }
      }
      
      return true;
    });

    setResults(filteredResults.sort((a, b) => b.relevance - a.relevance));
    setIsSearching(false);
    
    // Sauvegarder dans l'historique
    saveSearchHistory(searchQuery);
  }, [filters, saveSearchHistory]);

  // Gérer la saisie avec debounce
  const handleInputChange = (value: string) => {
    setQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Gérer les suggestions
  const handleInputFocus = () => {
    setShowSuggestions(true);
    // Charger les suggestions populaires
    const mockSuggestions: SearchSuggestion[] = [
      { id: '1', text: 'code civil algérien', type: 'popular', frequency: 245 },
      { id: '2', text: 'demande passeport', type: 'popular', frequency: 189 },
      { id: '3', text: 'certificat de résidence', type: 'popular', frequency: 156 },
      { id: '4', text: 'loi des finances 2024', type: 'recent', frequency: 78 }
    ];
    setSuggestions(mockSuggestions);
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'legal-text':
        return <BookOpen className="w-4 h-4" />;
      case 'procedure':
        return <Briefcase className="w-4 h-4" />;
      case 'form':
        return <FileText className="w-4 h-4" />;
      case 'news':
        return <Globe className="w-4 h-4" />;
      case 'user':
        return <Users className="w-4 h-4" />;
      case 'setting':
        return <Settings className="w-4 h-4" />;
    }
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'popular':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'smart':
        return <Star className="w-4 h-4 text-yellow-500" />;
    }
  };

  const formatRelevance = (relevance: number) => {
    if (relevance >= 90) return 'Très pertinent';
    if (relevance >= 70) return 'Pertinent';
    return 'Moins pertinent';
  };

  return (
    <div className="space-y-6">
      {/* Barre de recherche principale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            {texts.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={texts.placeholder}
                className="pl-10 pr-4 h-12 text-lg"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Suggestions */}
            {showSuggestions && (query.length === 0 || suggestions.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {query.length === 0 && recentSearches.length > 0 && (
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">{texts.recent}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem('dalil-search-history');
                        }}
                      >
                        {texts.clearHistory}
                      </Button>
                    </div>
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => {
                          setQuery(search);
                          performSearch(search);
                          setShowSuggestions(false);
                        }}
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{search}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-3">
                  <span className="text-sm font-medium text-gray-600 mb-2 block">{texts.suggestions}</span>
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        setQuery(suggestion.text);
                        performSearch(suggestion.text);
                        setShowSuggestions(false);
                      }}
                    >
                      {getSuggestionIcon(suggestion.type)}
                      <span className="text-sm">{suggestion.text}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {suggestion.frequency}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-600" />
            {texts.filters}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <select 
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as SearchFilter['type'] }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="all">{texts.allTypes}</option>
                <option value="legal-text">{texts.legalText}</option>
                <option value="procedure">{texts.procedure}</option>
                <option value="form">{texts.form}</option>
                <option value="news">{texts.news}</option>
                <option value="user">{texts.user}</option>
                <option value="setting">{texts.setting}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Catégorie</label>
              <select 
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="all">Toutes catégories</option>
                <option value="Droit Civil">Droit Civil</option>
                <option value="Droit Pénal">Droit Pénal</option>
                <option value="Droit Commercial">Droit Commercial</option>
                <option value="Documents d'identité">Documents d'identité</option>
                <option value="État civil">État civil</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Période</label>
              <select 
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as SearchFilter['dateRange'] }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="all">Toutes périodes</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      {query && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isSearching ? texts.searching : `${results.length} résultat(s) pour "${query}"`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {texts.noResults}
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <div 
                    key={result.id} 
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => window.open(result.path, '_blank')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-blue-600 hover:text-blue-800">
                          {result.title}
                        </h3>
                        <p className="text-gray-600 mt-1 line-clamp-2">
                          {result.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{result.category}</span>
                          <span>•</span>
                          <span>{formatRelevance(result.relevance)}</span>
                          <span>•</span>
                          <span>{texts.modified} {result.lastModified.toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        {result.relevance}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}