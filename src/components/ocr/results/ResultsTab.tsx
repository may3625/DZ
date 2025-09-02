import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ChevronLeft, ChevronRight, Eye, Filter } from 'lucide-react';
import { RealOCRResult } from '@/services/realOcrService';
import { ExportActions } from './ExportActions';
import { ResultsViewer } from './ResultsViewer';
import { ResultsNavigation } from './ResultsNavigation';
import { useToast } from '@/hooks/use-toast';

interface ResultsTabProps {
  result: RealOCRResult | null;
  mappedData: Record<string, unknown>;
  isProcessing: boolean;
  onClearResults: () => void;
}

export const ResultsTab = ({ result, mappedData, isProcessing, onClearResults }: ResultsTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'preview' | 'json' | 'mapped'>('preview');
  const { toast } = useToast();

  // Filtrer les résultats basé sur la recherche
  const filteredResults = useMemo(() => {
    if (!result || !searchTerm) return result;

    const filtered = {
      ...result,
      entities: result.entities && Object.keys(result.entities).length > 0
        ? Object.fromEntries(
            Object.entries(result.entities).filter(([key, value]) => 
              String(value)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              key?.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
        : result.entities,
      text: result.text?.toLowerCase().includes(searchTerm.toLowerCase()) 
        ? result.text 
        : ''
    };

    return filtered;
  }, [result, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const handleViewModeChange = (mode: 'preview' | 'json' | 'mapped') => {
    setViewMode(mode);
    toast({
      title: "Mode d'affichage changé",
      description: `Basculé vers le mode ${mode}`
    });
  };

  if (isProcessing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Traitement en cours...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Résultats OCR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Aucun résultat à afficher. Veuillez traiter un document d'abord.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec contrôles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Résultats OCR
              <Badge variant="secondary">
                {filteredResults?.entities ? Object.keys(filteredResults.entities).length : 0} entités
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClearResults}>
                Effacer
              </Button>
              <ExportActions result={result} mappedData={mappedData} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Barre de recherche et filtres */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les résultats..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>

          {/* Navigation et modes d'affichage */}
          <div className="flex items-center justify-between mb-4">
            <ResultsNavigation 
              currentPage={currentPage}
              totalItems={filteredResults?.entities ? Object.keys(filteredResults.entities).length : 0}
              onPageChange={setCurrentPage}
            />
            
            <Tabs value={viewMode} onValueChange={handleViewModeChange}>
              <TabsList>
                <TabsTrigger value="preview">Aperçu</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="mapped">Mappé</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Viewer principal */}
      <ResultsViewer 
        result={filteredResults as RealOCRResult}
        mappedData={mappedData}
        viewMode={viewMode}
        currentPage={currentPage}
        searchTerm={searchTerm}
      />
    </div>
  );
};