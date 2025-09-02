import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { RealOCRResult } from '@/services/realOcrService';
import { FileText, Tag, Database } from 'lucide-react';

interface ResultsViewerProps {
  result: RealOCRResult | null;
  mappedData: Record<string, unknown>;
  viewMode: 'preview' | 'json' | 'mapped';
  currentPage: number;
  searchTerm: string;
}

export const ResultsViewer = ({ 
  result, 
  mappedData, 
  viewMode, 
  currentPage, 
  searchTerm 
}: ResultsViewerProps) => {
  if (!result) return null;

  const highlightText = (text: string, search: string) => {
    if (!search) return text;
    
    const regex = new RegExp(`(${search})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const renderPreviewMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Texte extrait */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Texte Extrait
            <Badge variant="outline">
              {result.text ? 1 : 0} document
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            {result.text && (
              <div className="p-3 border-l-2 border-muted mb-2">
                <div 
                  className="text-sm"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(result.text, searchTerm) 
                  }}
                />
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Entités détectées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Entités Détectées
            <Badge variant="outline">
              {result.entities ? Object.keys(result.entities).length : 0} entités
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            {result.entities && Object.entries(result.entities).map(([key, value], index) => (
              <div key={index} className="p-3 border rounded-lg mb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{key}</Badge>
                  <Badge variant="outline">
                    {Array.isArray(value) ? `${value.length} items` : 'Single value'}
                  </Badge>
                </div>
                <div 
                  className="text-sm font-medium"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(Array.isArray(value) ? value.join(', ') : String(value || ''), searchTerm) 
                  }}
                />
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderJsonMode = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Données JSON Brutes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full">
          <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderMappedMode = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Données Mappées
          <Badge variant="outline">
            {Object.keys(mappedData).length} champs
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full">
          {Object.keys(mappedData).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune donnée mappée disponible
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(mappedData).map(([key, value], index) => (
                <div key={index}>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-muted-foreground mb-1">
                        {key}
                      </div>
                      <div 
                        className="text-sm"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightText(String(value), searchTerm) 
                        }}
                      />
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {typeof value}
                    </Badge>
                  </div>
                  {index < Object.entries(mappedData).length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {viewMode === 'preview' && renderPreviewMode()}
      {viewMode === 'json' && renderJsonMode()}
      {viewMode === 'mapped' && renderMappedMode()}
      
      {/* Métadonnées générales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Métadonnées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">Confiance</div>
              <div>{result.confidence ? `${Math.round(result.confidence * 100)}%` : 'N/A'}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Entités</div>
              <div>{result.entities ? Object.keys(result.entities).length : 0}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Lignes de texte</div>
              <div>{result.text ? 1 : 0}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Traitement</div>
              <div>{new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};