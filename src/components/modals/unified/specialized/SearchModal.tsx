import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  X, 
  BookOpen, 
  FileText, 
  Scale, 
  Newspaper,
  Library,
  Star,
  Clock,
  Eye,
  Download,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'legal' | 'procedures' | 'news' | 'library';
  category?: string;
  date?: Date;
  relevance: number;
  tags?: string[];
  url?: string;
  metadata?: Record<string, any>;
}

export interface SearchFilter {
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  type?: string[];
  tags?: string[];
}

export interface SearchModalProps {
  title: string;
  description?: string;
  initialQuery?: string;
  filters?: SearchFilter;
  results?: SearchResult[];
  onSearch: (query: string, filters?: SearchFilter) => void;
  onSelect?: (item: SearchResult) => void;
  searchCategory?: 'legal' | 'procedures' | 'news' | 'library' | 'all';
  size?: 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

const categoryConfig = {
  legal: {
    icon: Scale,
    label: 'Textes juridiques',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  procedures: {
    icon: FileText,
    label: 'Procédures',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  news: {
    icon: Newspaper,
    label: 'Actualités',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  library: {
    icon: Library,
    label: 'Bibliothèque',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
};

export const SearchModal: React.FC<SearchModalProps> = ({
  title,
  description,
  initialQuery = '',
  filters,
  results = [],
  onSearch,
  onSelect,
  searchCategory = 'all',
  size = 'lg',
  className,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [localFilters, setLocalFilters] = useState<SearchFilter>(filters || {});
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    searchCategory === 'all' ? undefined : searchCategory
  );

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      await onSearch(query, localFilters);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  }, [query, localFilters, onSearch]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleResultSelect = useCallback((result: SearchResult) => {
    if (onSelect) {
      onSelect(result);
    }
  }, [onSelect]);

  const getCategoryIcon = (type: string) => {
    const config = categoryConfig[type as keyof typeof categoryConfig];
    if (config) {
      const IconComponent = config.icon;
      return <IconComponent className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const getCategoryColor = (type: string) => {
    const config = categoryConfig[type as keyof typeof categoryConfig];
    return config?.color || 'text-gray-600';
  };

  const getCategoryBgColor = (type: string) => {
    const config = categoryConfig[type as keyof typeof categoryConfig];
    return config?.bgColor || 'bg-gray-50';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const renderFilters = () => (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Filtres</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Catégorie
          </label>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || undefined)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Toutes les catégories</option>
            <option value="legal">Textes juridiques</option>
            <option value="procedures">Procédures</option>
            <option value="news">Actualités</option>
            <option value="library">Bibliothèque</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Type
          </label>
          <select
            value={localFilters.type?.[0] || ''}
            onChange={(e) => setLocalFilters(prev => ({
              ...prev,
              type: e.target.value ? [e.target.value] : undefined
            }))}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Tous les types</option>
            <option value="legal">Juridique</option>
            <option value="procedures">Procédures</option>
            <option value="news">Actualités</option>
            <option value="library">Bibliothèque</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocalFilters({})}
        >
          Réinitialiser
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setShowFilters(false);
            handleSearch();
          }}
        >
          Appliquer
        </Button>
      </div>
    </div>
  );

  const renderSearchResults = () => (
    <div className="space-y-3">
      {results.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun résultat trouvé</p>
          <p className="text-sm">Essayez de modifier vos critères de recherche</p>
        </div>
      ) : (
        results.map((result) => (
          <Card
            key={result.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleResultSelect(result)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className={cn(
                  "p-2 rounded-full",
                  getCategoryBgColor(result.type)
                )}>
                  <div className={getCategoryColor(result.type)}>
                    {getCategoryIcon(result.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {result.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {categoryConfig[result.type]?.label || result.type}
                    </Badge>
                    {result.relevance > 0.8 && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  
                  {result.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {result.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      {result.date && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(result.date)}
                        </span>
                      )}
                      {result.category && (
                        <span>{result.category}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs">
                        {(result.relevance * 100).toFixed(0)}% pertinent
                      </span>
                    </div>
                  </div>
                  
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {result.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{result.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className={cn('p-0 overflow-hidden', sizeClasses[size], className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-6 py-4 border-b">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Rechercher..."
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-blue-50 border-blue-200")}
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Recherche...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && renderFilters()}

      {/* Results */}
      <div className="px-6 py-4 flex-1 overflow-y-auto max-h-[500px]">
        {renderSearchResults()}
      </div>

      {/* Footer */}
      {results.length > 0 && (
        <div className="px-6 py-3 border-t bg-muted/30">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{results.length} résultat(s) trouvé(s)</span>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Exporter
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};