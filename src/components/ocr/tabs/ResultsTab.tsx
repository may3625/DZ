import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useOCRExport } from '@/hooks/useOCRExport';
import { MappingResult } from '@/types/mapping';
import { ExtractedDocument } from '@/services/enhanced/algerianDocumentExtractionService';
import { RealOCRResult } from '@/services/realOcrService';
import { 
  Download, 
  Copy, 
  Search, 
  FileText, 
  FileJson, 
  File,
  ExternalLink,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResultsTabProps {
  extractedDocument: ExtractedDocument | null;
  mappingResult: MappingResult | null;
  ocrResult: RealOCRResult | null;
  originalFile?: File | null;
}

const ResultsTab: React.FC<ResultsTabProps> = ({
  extractedDocument,
  mappingResult,
  ocrResult,
  originalFile
}) => {
  const { toast } = useToast();
  const { exportToJSON, exportToTXT, exportToPDF, copyToClipboard } = useOCRExport();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    index: number;
    context: string;
    page?: number;
  }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!extractedDocument || !searchQuery.trim()) return;

    setIsSearching(true);
    
    // Simuler la recherche dans le texte
    const text = extractedDocument?.extractedText || '';
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const results: Array<{index: number; context: string; page?: number}> = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(text.length, match.index + searchQuery.length + 50);
      const context = text.substring(start, end);
      
      results.push({
        index: match.index,
        context: `...${context}...`,
        page: Math.ceil((match.index / text.length) * (extractedDocument?.metadata?.totalPages || 1))
      });

      if (results.length >= 20) break; // Limiter à 20 résultats
    }

    setSearchResults(results);
    setIsSearching(false);

    toast({
      title: "Recherche terminée",
      description: `${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`,
    });
  };

  const handleExportJSON = async () => {
    if (!ocrResult || !mappingResult) return;

    try {
      const mappedData = mappingResult.mappedFields.reduce((acc, field) => {
        if (field.mappedValue) {
          acc[field.fieldName] = field.mappedValue;
        }
        return acc;
      }, {} as Record<string, any>);

      await exportToJSON(ocrResult, mappedData);
      
      toast({
        title: "Export JSON réussi",
        description: "Le fichier a été téléchargé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter en JSON",
        variant: "destructive"
      });
    }
  };

  const handleExportTXT = async () => {
    if (!ocrResult) return;

    try {
      await exportToTXT(ocrResult);
      
      toast({
        title: "Export TXT réussi",
        description: "Le fichier texte a été téléchargé",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter en TXT",
        variant: "destructive"
      });
    }
  };

  const handleExportPDF = async () => {
    if (!ocrResult || !mappingResult) return;

    try {
      const mappedData = mappingResult.mappedFields.reduce((acc, field) => {
        if (field.mappedValue) {
          acc[field.fieldName] = field.mappedValue;
        }
        return acc;
      }, {} as Record<string, any>);

      await exportToPDF(ocrResult, mappedData);
      
      toast({
        title: "Export PDF réussi",
        description: "Le rapport PDF a été généré",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter en PDF",
        variant: "destructive"
      });
    }
  };

  const handleCopyAll = async () => {
    if (!extractedDocument) return;

    try {
      await copyToClipboard(extractedDocument?.extractedText || '');
      
      toast({
        title: "Texte copié",
        description: "Le texte complet a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur de copie",
        description: "Impossible de copier le texte",
        variant: "destructive"
      });
    }
  };

  const handleOpenOriginalFile = () => {
    if (!originalFile) return;

    const url = URL.createObjectURL(originalFile);
    window.open(url, '_blank');
    
    // Nettoyer l'URL après ouverture
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  if (!extractedDocument) {
    return (
      <div className="p-6 text-center">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Aucun résultat à afficher. Veuillez d'abord effectuer une extraction.
        </p>
      </div>
    );
  }

      const totalPages = extractedDocument?.metadata?.totalPages || 1;

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec actions d'export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Résultats et Export</h2>
          <p className="text-muted-foreground">
            Visualisez, recherchez et exportez les données extraites
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCopyAll}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copier tout
          </Button>
          
          {originalFile && (
            <Button
              variant="outline"
              onClick={handleOpenOriginalFile}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Fichier original
            </Button>
          )}
        </div>
      </div>

      {/* Viewer texte OCR avec recherche */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Viewer Texte OCR
            </CardTitle>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-sm font-medium">
                  Page {currentPage} / {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Barre de recherche */}
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Rechercher dans le texte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Rechercher
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-96 w-full rounded border p-4">
            <div className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                              {extractedDocument?.extractedText || ''}
            </div>
          </ScrollArea>
          
          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">
                Résultats de recherche ({searchResults.length})
              </h4>
              <ScrollArea className="h-32 w-full">
                <div className="space-y-2">
                  {searchResults.map((result, index) => (
                    <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">
                          Position {result.index}
                        </Badge>
                        {result.page && (
                          <Badge variant="outline" className="text-xs">
                            Page {result.page}
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground">
                        {result.context}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Carte de métadonnées structurée */}
      <Card>
        <CardHeader>
          <CardTitle>Carte de Métadonnées</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fichier</label>
                              <p className="font-medium">{extractedDocument?.fileName || 'Document'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Taille</label>
                              <p className="font-medium">{((extractedDocument?.fileSize || 0) / 1024).toFixed(1)} KB</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
                              <p className="font-medium">{extractedDocument?.metadata?.documentType || 'Non détecté'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Pages</label>
                              <p className="font-medium">{extractedDocument?.metadata?.totalPages || 0}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Confiance OCR</label>
                              <p className="font-medium">{(extractedDocument?.metadata?.averageConfidence || 0).toFixed(1)}%</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Qualité</label>
              {(() => {
                const avg = extractedDocument?.metadata?.averageConfidence || 0;
                const label = avg >= 90 ? 'excellent' : avg >= 70 ? 'good' : avg >= 50 ? 'fair' : 'poor';
                return (
                  <Badge variant={label === 'excellent' ? 'default' : label === 'good' ? 'secondary' : 'destructive'}>
                    {label}
                  </Badge>
                );
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Récapitulatif du mapping */}
      {mappingResult && (
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif du Mapping</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {mappingResult.mappedFields
                .filter(field => field.mappedValue)
                .slice(0, 5) // Top 5 champs clés
                .map(field => (
                  <div key={field.fieldName} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{field.fieldLabel}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-md">
                        {field.mappedValue}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {field.confidence}%
                    </Badge>
                  </div>
                ))}
              
              {mappingResult.mappedFields.filter(f => f.mappedValue).length > 5 && (
                <div className="text-center text-sm text-muted-foreground">
                  ... et {mappingResult.mappedFields.filter(f => f.mappedValue).length - 5} autres champs
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions d'export et téléchargement */}
      <Card>
        <CardHeader>
          <CardTitle>Actions d'Export</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={handleExportJSON}
              disabled={!mappingResult}
              className="h-20 flex flex-col gap-2"
            >
              <FileJson className="w-6 h-6" />
              <span>JSON Complet</span>
              <span className="text-xs opacity-70">Texte + Métadonnées + Mapping</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportTXT}
              disabled={!ocrResult}
              className="h-20 flex flex-col gap-2"
            >
              <FileText className="w-6 h-6" />
              <span>Texte Brut</span>
              <span className="text-xs opacity-70">Texte agrégé uniquement</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={!mappingResult}
              className="h-20 flex flex-col gap-2"
            >
              <File className="w-6 h-6" />
              <span>Rapport PDF</span>
              <span className="text-xs opacity-70">Généré localement</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsTab;