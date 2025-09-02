/**
 * Modal de recherche unifiée pour l'écosystème juridique algérien
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  FileText, 
  Calendar,
  Tag,
  Building,
  Loader2,
  X
} from 'lucide-react';
import { SearchModalConfig } from '../types';

interface SearchModalProps {
  config: SearchModalConfig;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ config, onClose }) => {
  const [query, setQuery] = useState(config.initialQuery || '');
  const [filters, setFilters] = useState(config.filters || {});
  const [results, setResults] = useState(config.results || []);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const searchCategories = [
    { value: 'all', label: 'Tout', icon: Search },
    { value: 'legal', label: 'Textes juridiques', icon: FileText },
    { value: 'procedures', label: 'Procédures', icon: Building },
    { value: 'news', label: 'Actualités', icon: Calendar },
    { value: 'library', label: 'Bibliothèque', icon: Tag }
  ];

  const documentTypes = [
    'Constitution',
    'Loi',
    'Ordonnance',
    'Décret présidentiel',
    'Décret exécutif',
    'Arrêté',
    'Instruction',
    'Circulaire'
  ];

  const institutions = [
    'Présidence de la République',
    'Gouvernement',
    'Assemblée Populaire Nationale',
    'Conseil de la Nation',
    'Conseil Constitutionnel',
    'Cour Suprême'
  ];

  useEffect(() => {
    if (query.length > 2) {
      performSearch();
    }
  }, [query, filters]);

  const performSearch = async () => {
    setIsSearching(true);
    
    try {
      // Simulation de recherche
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockResults = [
        {
          id: '1',
          type: 'legal',
          title: 'Loi n° 08-09 du 25 février 2008 relative au code de procédure civile et administrative',
          summary: 'Cette loi établit les règles de procédure civile et administrative en Algérie...',
          date: '2008-02-25',
          source: 'Journal Officiel n° 21',
          relevance: 0.95,
          keywords: ['procédure civile', 'administrative', 'juridiction']
        },
        {
          id: '2',
          type: 'procedure',
          title: 'Procédure de demande de passeport',
          summary: 'Guide complet pour la demande de passeport algérien...',
          date: '2024-01-15',
          source: 'Ministère de l\'Intérieur',
          relevance: 0.87,
          keywords: ['passeport', 'citoyenneté', 'voyage']
        },
        {
          id: '3',
          type: 'legal',
          title: 'Décret exécutif n° 15-247 du 10 septembre 2015',
          summary: 'Décret relatif aux modalités d\'application...',
          date: '2015-09-10',
          source: 'Journal Officiel n° 50',
          relevance: 0.82,
          keywords: ['décret', 'modalités', 'application']
        }
      ].filter(result => {
        // Filtrage par catégorie
        if (config.searchCategory && config.searchCategory !== 'all') {
          return result.type === config.searchCategory;
        }
        return true;
      });

      setResults(mockResults);
      
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    config.onSearch(query, filters);
    performSearch();
  };

  const handleSelect = (item: any) => {
    if (config.onSelect) {
      config.onSelect(item);
    }
    onClose();
  };

  const addFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setActiveFilters(prev => [...prev, `${key}:${value}`]);
  };

  const removeFilter = (filterString: string) => {
    const [key] = filterString.split(':');
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    setActiveFilters(prev => prev.filter(f => f !== filterString));
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'legal': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'procedure': return <Building className="w-4 h-4 text-green-600" />;
      case 'news': return <Calendar className="w-4 h-4 text-orange-600" />;
      default: return <Tag className="w-4 h-4 text-gray-600" />;
    }
  };

  const getResultTypeName = (type: string) => {
    switch (type) {
      case 'legal': return 'Texte juridique';
      case 'procedure': return 'Procédure';
      case 'news': return 'Actualité';
      case 'library': return 'Bibliothèque';
      default: return type;
    }
  };

  return (
    <div className="w-full">
      {/* Barre de recherche */}
      <div className="p-6 border-b">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans la base juridique algérienne..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Filtres actifs */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((filter) => (
              <Badge key={filter} variant="secondary" className="cursor-pointer">
                {filter}
                <X 
                  className="w-3 h-3 ml-1" 
                  onClick={() => removeFilter(filter)}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* Catégories de recherche */}
        <div className="flex gap-2 overflow-x-auto">
          {searchCategories.map((category) => {
            const Icon = category.icon;
            const isActive = config.searchCategory === category.value;
            
            return (
              <Button
                key={category.value}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className="whitespace-nowrap"
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>

      <Tabs defaultValue="results" className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results">
            Résultats ({results.length})
          </TabsTrigger>
          <TabsTrigger value="filters">
            <Filter className="w-4 h-4 mr-2" />
            Filtres avancés
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="p-6">
          {isSearching ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Recherche en cours...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((result) => (
                <Card 
                  key={result.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelect(result)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getResultIcon(result.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium line-clamp-1">{result.title}</h4>
                          <Badge variant="outline">
                            {getResultTypeName(result.type)}
                          </Badge>
                          <Badge variant="secondary">
                            {(result.relevance * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {result.summary}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(result.date).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {result.source}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {query.length > 2 
                  ? 'Aucun résultat trouvé pour votre recherche'
                  : 'Entrez votre recherche pour commencer'
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="filters" className="p-6">
          <div className="space-y-6">
            {/* Type de document */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Type de document
              </label>
              <Select onValueChange={(value) => addFilter('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Institution */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Institution émettrice
              </label>
              <Select onValueChange={(value) => addFilter('institution', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une institution" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((institution) => (
                    <SelectItem key={institution} value={institution.toLowerCase()}>
                      {institution}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Période */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Période de publication
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  type="date" 
                  placeholder="Date de début"
                  onChange={(e) => addFilter('dateStart', e.target.value)}
                />
                <Input 
                  type="date" 
                  placeholder="Date de fin"
                  onChange={(e) => addFilter('dateEnd', e.target.value)}
                />
              </div>
            </div>

            {/* Statut */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Statut du document
              </label>
              <Select onValueChange={(value) => addFilter('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_vigueur">En vigueur</SelectItem>
                  <SelectItem value="abroge">Abrogé</SelectItem>
                  <SelectItem value="modifie">Modifié</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};