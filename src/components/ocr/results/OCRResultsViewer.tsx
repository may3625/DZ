import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Search, ChevronLeft, ChevronRight, FileText, MapPin, Calendar, User, Building } from 'lucide-react';
import { RealOCRResult } from '@/services/realOcrService';

interface OCRResultsViewerProps {
  result: RealOCRResult;
  mappedData: Record<string, unknown>;
  onExport?: () => void;
}

export function OCRResultsViewer({ result, mappedData, onExport }: OCRResultsViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  // Simulation des pages pour la navigation
  const totalPages = result.pages?.length || Math.ceil(result.text.length / 2000);
  const pagesData = useMemo(() => {
    if (result.pages) return result.pages;
    
    // Diviser le texte en pages simulées
    const chunkSize = 2000;
    const chunks = [];
    for (let i = 0; i < result.text.length; i += chunkSize) {
      chunks.push({
        pageNumber: Math.floor(i / chunkSize) + 1,
        text: result.text.slice(i, i + chunkSize),
        confidence: result.confidence
      });
    }
    return chunks;
  }, [result]);

  const currentPageData = pagesData[currentPage - 1];

  // Fonction de recherche avec surlignage
  const highlightSearchTerm = (text: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  // Métadonnées structurées
  const structuredMetadata = useMemo(() => {
    const metadata = result.metadata || {};
    return {
      document: {
        title: result.documentType || 'Document sans titre',
        type: result.documentType || 'Inconnu',
        language: result.language || 'Français',
        pageCount: totalPages,
        processingDate: new Date().toLocaleDateString('fr-FR')
      },
      extraction: {
        confidence: `${Math.round(result.confidence * 100)}%`,
        textLength: result.text.length,
        entitiesFound: result.entities ? Object.keys(result.entities).length : 0,
        processingTime: result.processingTime || 'N/A'
      },
      entities: result.entities || {},
      mapping: mappedData
    };
  }, [result, mappedData, totalPages]);

  // Récapitulatif du mapping des champs clés
  const keyFieldsSummary = useMemo(() => {
    const summary = [];
    for (const [key, value] of Object.entries(mappedData)) {
      if (value && typeof value === 'string' && value.length > 0) {
        summary.push({ field: key, value: String(value).substring(0, 50) + '...' });
      }
    }
    return summary;
  }, [mappedData]);

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Résultats OCR</h2>
          <p className="text-muted-foreground">
            {totalPages} page{totalPages > 1 ? 's' : ''} • Confiance: {Math.round(result.confidence * 100)}%
          </p>
        </div>
        <Button onClick={onExport} className="bg-primary hover:bg-primary/90">
          <FileText className="w-4 h-4 mr-2" />
          Exporter les résultats
        </Button>
      </div>

      <Tabs defaultValue="viewer" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="viewer">Visualiseur</TabsTrigger>
          <TabsTrigger value="metadata">Métadonnées</TabsTrigger>
          <TabsTrigger value="entities">Entités</TabsTrigger>
          <TabsTrigger value="mapping">Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="viewer" className="space-y-4">
          {/* Barre de recherche et navigation */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher dans le texte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Contenu de la page */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Page {currentPage}
                <Badge variant="secondary">
                  Confiance: {Math.round((currentPageData?.confidence || result.confidence) * 100)}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full">
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchTerm(currentPageData?.text || '')
                  }}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Document
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Titre:</span>
                  <span className="font-medium">{structuredMetadata.document.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">{structuredMetadata.document.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Langue:</span>
                  <span>{structuredMetadata.document.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pages:</span>
                  <span>{structuredMetadata.document.pageCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Extraction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confiance:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {structuredMetadata.extraction.confidence}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Longueur texte:</span>
                  <span>{structuredMetadata.extraction.textLength.toLocaleString()} caractères</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entités trouvées:</span>
                  <span>{structuredMetadata.extraction.entitiesFound}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date traitement:</span>
                  <span>{structuredMetadata.document.processingDate}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entités Détectées</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {Object.keys(structuredMetadata.entities).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(structuredMetadata.entities).map(([key, value], index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedEntity === `${index}` 
                            ? 'bg-primary/5 border-primary' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedEntity(selectedEntity === `${index}` ? null : `${index}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{key}</span>
                          </div>
                          <Badge variant="secondary">{Array.isArray(value) ? `${value.length} items` : 'Single'}</Badge>
                        </div>
                        {selectedEntity === `${index}` && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Aucune entité détectée dans ce document
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif du Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {keyFieldsSummary.length > 0 ? (
                  <div className="space-y-3">
                    {keyFieldsSummary.map((item, index) => (
                      <div key={index} className="border-l-4 border-primary/20 pl-4">
                        <div className="font-medium text-sm">{item.field}</div>
                        <div className="text-muted-foreground text-xs mt-1">{item.value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Aucun champ mappé disponible
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}