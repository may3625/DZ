import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Grid, 
  Eraser, 
  LineChart,
  Table,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Target
} from 'lucide-react';
import { ProcessingResult } from '@/services/imageProcessingService';
import { TableExtractionResult } from '@/services/advancedTableExtraction';
import { CleaningResult } from '@/services/zoneCleaningService';

interface AdvancedProcessingResultsProps {
  imageProcessing?: ProcessingResult;
  tableExtraction?: TableExtractionResult;
  zoneCleaning?: CleaningResult;
  metrics?: {
    imageProcessingMetrics?: any;
    tableExtractionMetrics?: any;
    zoneCleaningMetrics?: any;
  };
}

export function AdvancedProcessingResults({
  imageProcessing,
  tableExtraction,
  zoneCleaning,
  metrics
}: AdvancedProcessingResultsProps) {
  if (!imageProcessing && !tableExtraction && !zoneCleaning) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Résultats du Traitement Avancé</h3>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="lines">Détection Lignes</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="cleaning">Nettoyage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {imageProcessing && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <LineChart className="w-4 h-4" />
                      Traitement d'Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Lignes détectées</span>
                        <Badge variant="secondary">
                          {(imageProcessing.detectedLines?.length || 0)}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Zones détectées</span>
                        <Badge variant="secondary">
                          {imageProcessing.detectedZones?.length || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tables extraites</span>
                        <Badge variant="secondary">
                          {imageProcessing.extractedTables?.length || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Qualité</span>
                        <Badge variant={imageProcessing.quality > 0.7 ? "default" : "secondary"}>
                          {Math.round(imageProcessing.quality * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Extraction de tables */}
            {tableExtraction && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Table className="w-4 h-4" />
                    Extraction Tables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tables trouvées</span>
                      <Badge variant={tableExtraction.totalTables > 0 ? "default" : "secondary"}>
                        {tableExtraction.totalTables}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cellules fusionnées</span>
                      <Badge variant="secondary">
                        {tableExtraction.tables?.filter(t => t.hasMergedCells).length || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Temps traitement</span>
                      <Badge variant="outline">
                        {tableExtraction.extractionTime}ms
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Statut</span>
                      <Badge variant={tableExtraction.success ? "default" : "destructive"}>
                        {tableExtraction.success ? "Succès" : "Échec"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Nettoyage des zones */}
            {zoneCleaning && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eraser className="w-4 h-4" />
                    Nettoyage Zones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Zones traitées</span>
                      <Badge variant="secondary">
                        {zoneCleaning.statistics?.zonesProcessed || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Bordures supprimées</span>
                      <Badge variant={zoneCleaning.statistics?.bordersRemoved > 0 ? "default" : "secondary"}>
                        {zoneCleaning.statistics?.bordersRemoved || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Bruit réduit</span>
                      <Badge variant="secondary">
                        {zoneCleaning.statistics?.noiseReduced || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Intersections</span>
                      <Badge variant="secondary">
                        {zoneCleaning.statistics?.intersectionsDetected || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Métriques globales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Globale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Qualité de détection</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Efficacité nettoyage</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lines" className="space-y-4">
          {imageProcessing?.detectedLines && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lignes Détectées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-center">
                      {imageProcessing.detectedLines?.length || 0}
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      lignes trouvées
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Zones Détectées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-center">
                      {imageProcessing.detectedZones?.length || 0}
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      zones identifiées
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          {tableExtraction?.tables && tableExtraction.tables.length > 0 ? (
            <div className="space-y-4">
              {tableExtraction.tables.map((table, index) => (
                <Card key={table.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Table {index + 1}</span>
                      <div className="flex items-center gap-2">
                        {table.hasHeader && <Badge variant="outline">En-tête</Badge>}
                        {table.hasMergedCells && <Badge variant="secondary">Cellules fusionnées</Badge>}
                        <Badge variant={table.confidence > 0.7 ? "default" : "destructive"}>
                          {Math.round(table.confidence * 100)}%
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{table.rows}</div>
                        <div className="text-sm text-muted-foreground">Lignes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{table.cols}</div>
                        <div className="text-sm text-muted-foreground">Colonnes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{table.cells.length}</div>
                        <div className="text-sm text-muted-foreground">Cellules</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {table.cells.filter(c => c.isMerged).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Fusionnées</div>
                      </div>
                    </div>

                    {/* Aperçu des cellules avec contenu */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Contenu des cellules:</h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {table.cells
                          .filter(cell => cell.content.trim().length > 0)
                          .slice(0, 5)
                          .map((cell, idx) => (
                            <div key={cell.id} className="text-xs bg-muted p-2 rounded">
                              <div className="font-medium">
                                Cellule ({cell.row + 1}, {cell.col + 1})
                                {cell.isMerged && <Badge variant="outline" className="ml-2 text-xs">Fusionnée</Badge>}
                              </div>
                              <div className="text-muted-foreground truncate">
                                {cell.content}
                              </div>
                            </div>
                          ))}
                        {table.cells.filter(c => c.content.trim().length > 0).length > 5 && (
                          <div className="text-xs text-muted-foreground text-center">
                            ... et {table.cells.filter(c => c.content.trim().length > 0).length - 5} autres cellules
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Table className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune table détectée dans le document</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cleaning" className="space-y-4">
          {zoneCleaning && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Zones Originales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {zoneCleaning.originalZones?.slice(0, 5).map((zone, index) => (
                        <div key={zone.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{zone.type}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={zone.shouldKeep ? "default" : "destructive"}>
                              {zone.shouldKeep ? "Conservée" : "Supprimée"}
                            </Badge>
                            {zone.shouldKeep ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Trash2 className="w-4 h-4 text-red-500" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Bordures Supprimées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {zoneCleaning.removedBorders?.slice(0, 5).map((border, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm capitalize">{border.type}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{border.thickness}px</Badge>
                            {border.isDecorative && <Badge variant="secondary">Décorative</Badge>}
                          </div>
                        </div>
                      ))}
                      {!zoneCleaning.removedBorders?.length && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Aucune bordure supprimée
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Statistiques de Nettoyage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {zoneCleaning.statistics?.zonesProcessed || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Zones traitées</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {zoneCleaning.statistics?.bordersRemoved || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Bordures supprimées</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {zoneCleaning.statistics?.noiseReduced || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Bruit réduit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">
                        {zoneCleaning.processingTime || 0}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Temps traitement</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {zoneCleaning.intersections?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Intersections Importantes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {zoneCleaning.intersections.slice(0, 6).map((intersection, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">
                            ({Math.round(intersection.x)}, {Math.round(intersection.y)})
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{intersection.type}</Badge>
                            <Badge variant={intersection.confidence > 0.7 ? "default" : "secondary"}>
                              {Math.round(intersection.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Fonction utilitaire pour obtenir ImageData d'un fichier
async function getImageDataFromFile(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve(imageData);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}