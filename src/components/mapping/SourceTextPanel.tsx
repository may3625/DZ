import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, EyeOff } from 'lucide-react';
import { EntityHighlight } from '@/types/mapping';
import { LegalEntity } from '@/services/enhanced/algerianLegalRegexService';
import { cn } from '@/lib/utils';

interface SourceTextPanelProps {
  sourceText: string;
  entities: LegalEntity[];
  mappedFields: string[];
  onSearch: (query: string) => Array<{ start: number; end: number; match: string }>;
  className?: string;
}

const SourceTextPanel: React.FC<SourceTextPanelProps> = ({
  sourceText,
  entities,
  mappedFields,
  onSearch,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ start: number; end: number; match: string }>>([]);
  const [showEntities, setShowEntities] = useState(true);
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<Set<string>>(new Set());

  // Créer les highlights des entités
  const entityHighlights = useMemo((): EntityHighlight[] => {
    return entities.map(entity => {
      const startIndex = sourceText.toLowerCase().indexOf(entity.value.toLowerCase());
      return {
        entity,
        startIndex: startIndex,
        endIndex: startIndex + entity.value.length,
        isUsed: mappedFields.includes(entity.type),
        mappedToField: mappedFields.find(field => field.includes(entity.type))
      };
    }).filter(highlight => highlight.startIndex !== -1);
  }, [entities, sourceText, mappedFields]);

  // Obtenir les types d'entités uniques
  const entityTypes = useMemo(() => {
    const types = new Set(entities.map(e => e.type));
    return Array.from(types);
  }, [entities]);

  // Gérer la recherche
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = onSearch(searchQuery);
    setSearchResults(results);
  };

  // Alterner la visibilité d'un type d'entité
  const toggleEntityType = (type: string) => {
    const newSelected = new Set(selectedEntityTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedEntityTypes(newSelected);
  };

  // Rendu du texte avec surlignage
  const renderHighlightedText = () => {
    if (!sourceText) return null;

    let lastIndex = 0;
    const elements: React.ReactNode[] = [];
    
    // Combiner tous les highlights (entités + recherche)
    const allHighlights = [
      ...entityHighlights
        .filter(h => showEntities && (selectedEntityTypes.size === 0 || selectedEntityTypes.has(h.entity.type)))
        .map(h => ({ 
          startIndex: h.startIndex, 
          endIndex: h.endIndex, 
          type: 'entity' as const, 
          entityData: h 
        })),
      ...searchResults.map(r => ({ 
        startIndex: r.start, 
        endIndex: r.end, 
        type: 'search' as const, 
        searchData: r 
      }))
    ].sort((a, b) => a.startIndex - b.startIndex);

    allHighlights.forEach((highlight, index) => {
      // Ajouter le texte avant le highlight
      if (highlight.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {sourceText.slice(lastIndex, highlight.startIndex)}
          </span>
        );
      }

      // Ajouter le highlight
      if (highlight.type === 'entity' && highlight.entityData) {
        const entityHighlight = highlight.entityData;
        elements.push(
          <span
            key={`entity-${index}`}
            className={cn(
              'px-1 py-0.5 rounded-sm cursor-pointer transition-colors',
              entityHighlight.isUsed
                ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                : 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
              'hover:opacity-80'
            )}
            title={`${entityHighlight.entity.type} (${Math.round(entityHighlight.entity.confidence)}% confiance)`}
          >
            {sourceText.slice(highlight.startIndex, highlight.endIndex)}
          </span>
        );
      } else if (highlight.type === 'search') {
        elements.push(
          <span
            key={`search-${index}`}
            className="bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-1 py-0.5 rounded-sm"
          >
            {sourceText.slice(highlight.startIndex, highlight.endIndex)}
          </span>
        );
      }

      lastIndex = highlight.endIndex;
    });

    // Ajouter le texte restant
    if (lastIndex < sourceText.length) {
      elements.push(
        <span key="text-end">
          {sourceText.slice(lastIndex)}
        </span>
      );
    }

    return <div className="whitespace-pre-wrap leading-relaxed">{elements}</div>;
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* En-tête avec recherche */}
      <div className="border-b border-border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Texte source</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEntities(!showEntities)}
            className="ml-auto"
          >
            {showEntities ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {showEntities ? 'Masquer entités' : 'Afficher entités'}
          </Button>
        </div>

        {/* Barre de recherche */}
        <div className="flex gap-2">
          <Input
            placeholder="Rechercher dans le texte..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Filtres par type d'entité */}
        {showEntities && entityTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground self-center">Filtrer:</span>
            {entityTypes.map(type => (
              <Badge
                key={type}
                variant={selectedEntityTypes.has(type) ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => toggleEntityType(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        )}

        {/* Statistiques */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{entities.length} entités détectées</span>
          {searchResults.length > 0 && (
            <span>{searchResults.length} résultats de recherche</span>
          )}
        </div>
      </div>

      {/* Contenu du texte avec scroll */}
      <ScrollArea className="flex-1 p-4">
        <div className="text-sm">
          {sourceText ? renderHighlightedText() : (
            <div className="text-center text-muted-foreground py-8">
              Aucun texte source disponible
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Légende */}
      {showEntities && (
        <div className="border-t border-border p-4 space-y-2">
          <h4 className="text-sm font-medium">Légende:</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-200 dark:bg-green-800 rounded-sm"></div>
              <span>Entité mappée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-200 dark:bg-blue-800 rounded-sm"></div>
              <span>Entité détectée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-200 dark:bg-yellow-800 rounded-sm"></div>
              <span>Résultat recherche</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceTextPanel;