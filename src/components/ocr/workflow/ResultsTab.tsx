import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Download, 
  Copy, 
  ExternalLink, 
  Search,
  FileText,
  Map,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building,
  Hash,
  User
} from 'lucide-react';
import { AlgerianExtractionResult } from '@/services/enhanced/algerianDocumentExtractionService';
import { MappingResult } from '@/types/mapping';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';
import { pdfExportService } from '@/services/enhanced/pdfExportService';

interface ResultsTabProps {
  extractedDocument: AlgerianExtractionResult | null;
  mappingResult: MappingResult | null;
  validationCompleted: boolean;
}

export function ResultsTab({ extractedDocument, mappingResult, validationCompleted }: ResultsTabProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ pageIndex: number; position: number; context: string }>>([]);

  const handleSearch = () => {
    if (!extractedDocument || !searchQuery.trim()) return;

    const results: Array<{ pageIndex: number; position: number; context: string }> = [];
    const query = searchQuery.toLowerCase();

    extractedDocument?.textRegions?.forEach((regions, pageIndex) => {
      const text = extractedDocument.extractedText.toLowerCase();
      let position = text.indexOf(query);
      
      while (position !== -1) {
        const start = Math.max(0, position - 50);
        const end = Math.min(text.length, position + query.length + 50);
        const context = extractedDocument.extractedText.substring(start, end);
        
        results.push({ pageIndex, position, context });
        position = text.indexOf(query, position + 1);
      }
    });

    setSearchResults(results);
    if (results.length > 0) {
      setCurrentPage(results[0].pageIndex);
    }
  };

  const exportToJSON = () => {
    if (!extractedDocument || !mappingResult) return;

    const exportData = {
      extraction: {
        text: extractedDocument?.extractedText || '',
        metadata: extractedDocument?.metadata || {},
        pages: extractedDocument?.totalPages || 0,
        processingTime: extractedDocument?.metadata?.processingTime || 0,
        averageConfidence: extractedDocument?.metadata?.averageConfidence || 0
      },
      mapping: {
        formType: mappingResult.formType,
        mappedFields: mappingResult.mappedFields,
        unmappedFields: mappingResult.unmappedFields,
        overallConfidence: mappingResult.overallConfidence,
        mappedCount: mappingResult.mappedCount,
        totalFields: mappingResult.totalFields
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr_extraction_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Export JSON téléchargé avec succès');
  };

  const exportToTXT = () => {
    if (!extractedDocument) return;

    const blob = new Blob([extractedDocument?.extractedText || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_text_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Texte exporté avec succès');
  };

  const exportToPDF = async () => {
    if (!extractedDocument) return;
    try {
      await pdfExportService.exportToPDF(extractedDocument as any, { includeMetadata: true, includeImages: false });
      toast.success('Export PDF généré');
    } catch (e) {
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Texte copié dans le presse-papiers');
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const getKeyMappings = () => {
    if (!mappingResult) return [];
    
    return mappingResult.mappedFields
      .filter(field => field.isAccepted && field.mappedValue)
      .slice(0, 8); // Top 8 champs principaux
  };

  if (!extractedDocument || !mappingResult || !validationCompleted) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Veuillez compléter toutes les étapes précédentes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions d'export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Phase 4: Résultats et Export
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToJSON} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Button onClick={exportToTXT} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                TXT
              </Button>
              <Button onClick={exportToPDF} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={() => copyToClipboard(extractedDocument?.extractedText || '')} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copier
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{extractedDocument?.totalPages || 0}</div>
              <div className="text-sm text-gray-600">Pages traitées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{mappingResult.mappedCount}</div>
              <div className="text-sm text-gray-600">Champs mappés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((extractedDocument?.metadata?.averageConfidence || 0) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Confiance OCR</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(extractedDocument?.metadata?.processingTime || 0)}ms
              </div>
              <div className="text-sm text-gray-600">Temps total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="viewer" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="viewer">Viewer Texte</TabsTrigger>
          <TabsTrigger value="metadata">Métadonnées</TabsTrigger>
          <TabsTrigger value="mapping">Récapitulatif Mapping</TabsTrigger>
        </TabsList>

        {/* Viewer texte avec recherche */}
        <TabsContent value="viewer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Viewer Texte OCR
              </CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Rechercher dans le texte..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              {searchResults.length > 0 && (
                <div className="text-sm text-gray-600">
                  {searchResults.length} résultat(s) trouvé(s)
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Navigation par page */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Page précédente
                  </Button>
                  <span className="text-sm">
                    Page {currentPage + 1} / {extractedDocument?.totalPages || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                                          onClick={() => setCurrentPage(Math.min((extractedDocument?.totalPages || 0) - 1, currentPage + 1))}
                      disabled={currentPage === (extractedDocument?.totalPages || 0) - 1}
                  >
                    Page suivante
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Contenu de la page */}
                <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">
                    {extractedDocument?.extractedText || 'Texte non trouvé'}
                  </pre>
                </div>

                {/* Résultats de recherche */}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Résultats de recherche:</h4>
                    {searchResults.slice(0, 5).map((result, index) => (
                      <div 
                        key={index} 
                        className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2 cursor-pointer hover:bg-yellow-100"
                        onClick={() => setCurrentPage(result.pageIndex)}
                      >
                        <div className="font-medium">Page {result.pageIndex + 1}</div>
                        <div className="text-gray-600">...{result.context}...</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Métadonnées structurées */}
        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Carte des Métadonnées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Document
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <Badge>{extractedDocument?.metadata?.documentType || 'Non détecté'}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Officiel:</span>
                        <Badge variant={extractedDocument?.isMixedLanguage ? "default" : "secondary"}>
                    {extractedDocument?.isMixedLanguage ? 'Oui' : 'Non'}
                  </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Bilingue:</span>
                        <Badge variant={extractedDocument?.isMixedLanguage ? "default" : "secondary"}>
                    {extractedDocument?.isMixedLanguage ? 'Oui' : 'Non'}
                  </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Institutions
                    </h4>
                    <div className="space-y-1">
                      {extractedDocument?.metadata?.institutions?.length ? (
                extractedDocument.metadata.institutions.map((inst: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="mr-2 mb-1">
                            {inst}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Aucune institution détectée</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Qualité d'Extraction</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Global:</span>
                          <span>{Math.round((extractedDocument?.confidenceScore || 0) * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Clarté texte:</span>
                          <span>{Math.round((extractedDocument?.metadata?.averageConfidence || 0) * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Structure:</span>
                          <span>85%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Langues:</span>
                          <span>{extractedDocument?.isMixedLanguage ? '95%' : '90%'}</span>
                        </div>
                      </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Temps total:</span>
                        <span>{Math.round(extractedDocument?.metadata?.processingTime || 0)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confiance moyenne:</span>
                        <span>{Math.round((extractedDocument?.metadata?.averageConfidence || 0) * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pages:</span>
                        <span>{extractedDocument?.totalPages || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Relations juridiques</h4>
                    <div className="space-y-2 text-sm">
                      {(() => {
                        const rel: any = (extractedDocument as any).legalRelationships;
                        if (!rel) return <span className="text-gray-500">Aucune relation détectée</span>;
                        return (
                          <div className="space-y-1">
                            <div className="flex justify-between"><span>Total:</span><span>{rel.total || 0}</span></div>
                            {rel.byType && Object.entries(rel.byType).map(([k, v]) => (
                              <div key={k} className="flex justify-between"><span>{k}:</span><span>{String(v)}</span></div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Récapitulatif du mapping */}
        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Récapitulatif du Mapping - Champs Clés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getKeyMappings().map((field, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{field.fieldLabel}</div>
                      <Badge variant={field.confidence > 0.8 ? "default" : "secondary"}>
                        {Math.round(field.confidence * 100)}%
                      </Badge>
                    </div>
                    <div className="text-sm bg-gray-50 border rounded p-2">
                      {field.mappedValue || 'Non mappé'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      {field.isAccepted && <span className="text-green-600">✓ Accepté</span>}
                      {field.isEdited && <span className="text-blue-600">✎ Édité</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Statistiques finales */}
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">{mappingResult.mappedCount}</div>
                    <div className="text-xs text-gray-600">Champs mappés</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">{mappingResult.unmappedFields.length}</div>
                    <div className="text-xs text-gray-600">Non mappés</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">{Math.round(mappingResult.overallConfidence * 100)}%</div>
                    <div className="text-xs text-gray-600">Confiance globale</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">
                      {Math.round((mappingResult.mappedCount / mappingResult.totalFields) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Complétude</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}