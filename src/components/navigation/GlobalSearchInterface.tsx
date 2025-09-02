/**
 * Interface de recherche globale unifiée
 * Recherche transversale dans toutes les sections
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { logger } from '@/utils/logger';
import { 
  Search, 
  Filter, 
  FileText, 
  ClipboardList, 
  BookOpen, 
  Users, 
  Settings,
  Gavel,
  Eye,
  Download,
  ExternalLink,
  Clock,
  Star,
  Tag
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'legal' | 'procedures' | 'news' | 'library' | 'users' | 'settings';
  subcategory?: string;
  content?: string;
  score: number;
  lastModified: Date;
  tags: string[];
  url: string;
  metadata?: Record<string, any>;
}

interface SearchFilters {
  category: string;
  dateRange: string;
  language: string;
  status: string;
  tags: string[];
}

export function GlobalSearchInterface() {
  const { t, language, isRTL, formatDate } = useAlgerianI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    dateRange: 'all',
    language: 'all',
    status: 'all',
    tags: []
  });
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Données simulées pour la démonstration
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Code de procédure civile - Article 15',
      description: 'Dispositions relatives aux délais de recours',
      category: 'legal',
      subcategory: 'Code civil',
      content: 'Les délais de recours sont fixés à 30 jours...',
      score: 95,
      lastModified: new Date('2024-01-15'),
      tags: ['procédure', 'délais', 'recours'],
      url: '/legal/code-procedure-civile/article-15',
      metadata: { 
        reference: 'Art. 15 CPC', 
        dateApplication: '2024-01-01' 
      }
    },
    {
      id: '2',
      title: 'Demande de passeport biométrique',
      description: 'Procédure complète pour l\'obtention d\'un passeport',
      category: 'procedures',
      subcategory: 'État civil',
      content: 'Documents requis: CNI, acte de naissance...',
      score: 88,
      lastModified: new Date('2024-02-10'),
      tags: ['passeport', 'état civil', 'identité'],
      url: '/procedures/passeport-biometrique',
      metadata: { 
        duree: '3-5 jours', 
        cout: '6000 DA' 
      }
    },
    {
      id: '3',
      title: 'Réforme du droit des affaires 2024',
      description: 'Nouvelles dispositions pour les entreprises',
      category: 'news',
      subcategory: 'Actualités juridiques',
      content: 'Les nouvelles mesures concernent notamment...',
      score: 82,
      lastModified: new Date('2024-03-05'),
      tags: ['réforme', 'entreprises', 'droit des affaires'],
      url: '/news/reforme-droit-affaires-2024',
      metadata: { 
        source: 'Journal Officiel', 
        numero: '15/2024' 
      }
    },
    {
      id: '4',
      title: 'Modèle de contrat de travail',
      description: 'Template standardisé pour contrats de travail',
      category: 'library',
      subcategory: 'Modèles',
      content: 'Contrat de travail à durée indéterminée...',
      score: 76,
      lastModified: new Date('2024-01-20'),
      tags: ['contrat', 'travail', 'modèle'],
      url: '/library/contrat-travail-template',
      metadata: { 
        format: 'PDF/DOCX', 
        pages: 3 
      }
    },
    {
      id: '5',
      title: 'Configuration OCR avancée',
      description: 'Paramètres d\'optimisation de reconnaissance',
      category: 'settings',
      subcategory: 'OCR',
      content: 'Paramètres de précision pour les documents arabes...',
      score: 71,
      lastModified: new Date('2024-02-28'),
      tags: ['OCR', 'configuration', 'arabe'],
      url: '/settings/ocr-advanced',
      metadata: { 
        version: '2.1', 
        langues: ['ar', 'fr'] 
      }
    }
  ];

  // Fonction de recherche
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    logger.info('Search', 'Recherche globale déclenchée', { 
      query: searchQuery, 
      filters 
    }, 'GlobalSearchInterface');

    // Simulation de recherche
    await new Promise(resolve => setTimeout(resolve, 500));

    // Filtrage des résultats
    let filteredResults = mockResults.filter(result => {
      const queryMatch = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const categoryMatch = filters.category === 'all' || result.category === filters.category;
      
      const dateMatch = filters.dateRange === 'all' || 
                       (filters.dateRange === 'recent' && 
                        (Date.now() - result.lastModified.getTime()) < 30 * 24 * 60 * 60 * 1000);

      return queryMatch && categoryMatch && dateMatch;
    });

    // Tri par score de pertinence
    filteredResults = filteredResults.sort((a, b) => b.score - a.score);

    setResults(filteredResults);
    setIsSearching(false);

    // Ajouter à l'historique
    if (searchQuery && !searchHistory.includes(searchQuery)) {
      setSearchHistory(prev => [searchQuery, ...prev.slice(0, 4)]);
    }

    logger.info('Search', 'Recherche terminée', { 
      query: searchQuery, 
      resultCount: filteredResults.length 
    }, 'GlobalSearchInterface');
  };

  // Effet de recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filters]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'legal': return <Gavel className="h-4 w-4" />;
      case 'procedures': return <ClipboardList className="h-4 w-4" />;
      case 'news': return <FileText className="h-4 w-4" />;
      case 'library': return <BookOpen className="h-4 w-4" />;
      case 'users': return <Users className="h-4 w-4" />;
      case 'settings': return <Settings className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'legal': 'Juridique',
      'procedures': 'Procédures',
      'news': 'Actualités',
      'library': 'Bibliothèque',
      'users': 'Utilisateurs',
      'settings': 'Paramètres'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const filteredResultsByCategory = useMemo(() => {
    const grouped: Record<string, SearchResult[]> = {};
    results.forEach(result => {
      if (!grouped[result.category]) {
        grouped[result.category] = [];
      }
      grouped[result.category].push(result);
    });
    return grouped;
  }, [results]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche Globale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Barre de recherche principale */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher dans toutes les sections..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>

            {/* Filtres */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select 
                value={filters.category} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="legal">Juridique</SelectItem>
                  <SelectItem value="procedures">Procédures</SelectItem>
                  <SelectItem value="news">Actualités</SelectItem>
                  <SelectItem value="library">Bibliothèque</SelectItem>
                  <SelectItem value="settings">Paramètres</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.dateRange} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les dates</SelectItem>
                  <SelectItem value="recent">30 derniers jours</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.language} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Langue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les langues</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtres avancés
              </Button>
            </div>

            {/* Historique de recherche */}
            {searchHistory.length > 0 && !query && (
              <div>
                <p className="text-sm font-medium mb-2">Recherches récentes:</p>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((historyQuery, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => setQuery(historyQuery)}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {historyQuery}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      {query && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {isSearching ? 'Recherche en cours...' : `${results.length} résultat(s) trouvé(s)`}
              </span>
              {results.length > 0 && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exporter
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="all">
                    Tous ({results.length})
                  </TabsTrigger>
                  {Object.entries(filteredResultsByCategory).map(([category, categoryResults]) => (
                    <TabsTrigger key={category} value={category}>
                      {getCategoryLabel(category)} ({categoryResults.length})
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {results.map((result) => (
                        <Card 
                          key={result.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedResult(result)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                {getCategoryIcon(result.category)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium hover:text-primary">
                                      {result.title}
                                    </h4>
                                    <Badge variant="outline">
                                      {getCategoryLabel(result.category)}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {result.description}
                                  </p>
                                  
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatDate(result.lastModified)}
                                    </span>
                                    
                                    {result.subcategory && (
                                      <span>{result.subcategory}</span>
                                    )}
                                    
                                    {result.metadata && Object.entries(result.metadata).slice(0, 2).map(([key, value]) => (
                                      <span key={key}>
                                        {key}: {String(value)}
                                      </span>
                                    ))}
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {result.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        <Tag className="h-2 w-2 mr-1" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 ml-4">
                                <Badge variant="outline">
                                  {result.score}%
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {Object.entries(filteredResultsByCategory).map(([category, categoryResults]) => (
                  <TabsContent key={category} value={category} className="mt-4">
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-4">
                        {categoryResults.map((result) => (
                          <Card 
                            key={result.id} 
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedResult(result)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium mb-1 hover:text-primary">
                                    {result.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {result.description}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>{formatDate(result.lastModified)}</span>
                                    {result.subcategory && <span>{result.subcategory}</span>}
                                  </div>
                                </div>
                                <Badge variant="outline">
                                  {result.score}%
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            ) : query && !isSearching ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucun résultat trouvé pour "{query}"
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Essayez avec d'autres mots-clés ou modifiez les filtres
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Prévisualisation du résultat sélectionné */}
      {selectedResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Aperçu: {selectedResult.title}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedResult(null)}
              >
                Fermer
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getCategoryIcon(selectedResult.category)}
                <Badge variant="outline">
                  {getCategoryLabel(selectedResult.category)}
                </Badge>
                {selectedResult.subcategory && (
                  <Badge variant="secondary">
                    {selectedResult.subcategory}
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground">
                {selectedResult.description}
              </p>
              
              {selectedResult.content && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-medium mb-2">Contenu:</h5>
                  <p className="text-sm">
                    {selectedResult.content.substring(0, 200)}
                    {selectedResult.content.length > 200 && '...'}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex flex-wrap gap-1">
                  {selectedResult.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button className="gap-2">
                  <Eye className="h-4 w-4" />
                  Voir le détail
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}