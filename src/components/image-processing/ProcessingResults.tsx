import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  RefreshCw, 
  Eye, 
  EyeOff,
  ZoomIn,
  Clock,
  Target,
  Layers
} from 'lucide-react';
import { ProcessingResult } from '@/types/imageProcessing';

interface ProcessingResultsProps {
  results: ProcessingResult[];
  onDownload: (index: number) => void;
  onRetry: (index: number) => Promise<void>;
  isProcessing: boolean;
}

export function ProcessingResults({ 
  results, 
  onDownload, 
  onRetry, 
  isProcessing 
}: ProcessingResultsProps) {
  const [visibleImages, setVisibleImages] = useState<{ [key: number]: boolean }>({});
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const toggleImageVisibility = (index: number) => {
    setVisibleImages(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const openImageModal = (index: number) => {
    setSelectedImage(index);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const renderImageData = (imageData: ImageData, title: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">{title}</h4>
        <img 
          src={canvas.toDataURL()} 
          alt={title}
          className="w-full h-auto border rounded cursor-pointer hover:opacity-75 transition-opacity"
          onClick={() => openImageModal(results.findIndex(r => 
            r.originalImage === imageData || r.processedImage === imageData
          ))}
        />
      </div>
    );
  };

  const getQualityBadgeVariant = (quality: number) => {
    if (quality >= 0.8) return "default";
    if (quality >= 0.6) return "secondary";
    return "destructive";
  };

  const getQualityLabel = (quality: number) => {
    if (quality >= 0.8) return "Excellente";
    if (quality >= 0.6) return "Bonne";
    if (quality >= 0.4) return "Moyenne";
    return "Faible";
  };

  return (
    <div className="space-y-6">
      {results.map((result, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Résultat {index + 1}
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Badge variant={getQualityBadgeVariant(result.quality)}>
                  {getQualityLabel(result.quality)} ({Math.round(result.quality * 100)}%)
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleImageVisibility(index)}
                >
                  {visibleImages[index] ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Masquer
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Afficher
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(index)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Télécharger
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetry(index)}
                  disabled={isProcessing}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retraiter
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Statistiques du résultat */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Temps de traitement</p>
                  <p className="font-semibold">{Math.round(result.processingTime)}ms</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Lignes détectées</p>
                  <p className="font-semibold">{result.detectedLines.length}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Zones identifiées</p>
                  <p className="font-semibold">{result.detectedZones.length}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <ZoomIn className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Dimensions</p>
                  <p className="font-semibold">
                    {result.originalImage.width} × {result.originalImage.height}
                  </p>
                </div>
              </div>
            </div>

            {/* Détails des détections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Lignes détectées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.detectedLines.slice(0, 3).map((line, lineIndex) => (
                      <div key={lineIndex} className="flex items-center justify-between text-xs">
                        <span className="capitalize">{line.type}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(line.confidence * 100)}%
                        </Badge>
                      </div>
                    ))}
                    {result.detectedLines.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        ... et {result.detectedLines.length - 3} autres
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Zones identifiées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.detectedZones.slice(0, 3).map((zone, zoneIndex) => (
                      <div key={zoneIndex} className="flex items-center justify-between text-xs">
                        <span className="capitalize">{zone.type}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(zone.confidence * 100)}%
                        </Badge>
                      </div>
                    ))}
                    {result.detectedZones.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        ... et {result.detectedZones.length - 3} autres
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Images */}
            {visibleImages[index] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderImageData(result.originalImage, "Image originale")}
                {renderImageData(result.processedImage, "Image traitée")}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Modal pour affichage en grand */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div className="max-w-4xl max-h-full overflow-auto">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Résultat {selectedImage + 1} - Vue détaillée
                </h3>
                <Button variant="outline" onClick={closeImageModal}>
                  Fermer
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {renderImageData(results[selectedImage].originalImage, "Original")}
                {renderImageData(results[selectedImage].processedImage, "Traité")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcessingResults;