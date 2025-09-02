import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, Line, Path, Image as FabricImage } from 'fabric';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Eye, 
  Square, 
  Circle as CircleIcon, 
  Minus, 
  MousePointer, 
  RotateCcw,
  Download,
  ZoomIn,
  ZoomOut,
  Move,
  Palette,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DetectedElement {
  id: string;
  type: 'line' | 'rectangle' | 'text_region' | 'table';
  bounds: { x: number; y: number; width: number; height: number };
  confidence: number;
  properties?: any;
}

interface VisualizationLayer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  elements: DetectedElement[];
}

export const EnhancedImageCanvas = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'line' | 'rectangle' | 'circle' | 'move'>('select');
  const [activeColor, setActiveColor] = useState('#ff0000');
  const [brushWidth, setBrushWidth] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Couches de visualisation pour différents éléments détectés
  const [visualizationLayers, setVisualizationLayers] = useState<VisualizationLayer[]>([
    {
      id: 'horizontal_lines',
      name: 'Lignes horizontales',
      visible: true,
      color: '#ff0000',
      elements: []
    },
    {
      id: 'vertical_lines',
      name: 'Lignes verticales',
      visible: true,
      color: '#00ff00',
      elements: []
    },
    {
      id: 'borders',
      name: 'Bordures détectées',
      visible: true,
      color: '#0000ff',
      elements: []
    },
    {
      id: 'text_regions',
      name: 'Zones de texte',
      visible: true,
      color: '#ffff00',
      elements: []
    },
    {
      id: 'tables',
      name: 'Tables détectées',
      visible: true,
      color: '#ff00ff',
      elements: []
    }
  ]);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    const canvas = new FabricCanvas(canvasRef.current, {
      width: Math.min(800, rect.width - 40),
      height: 600,
      backgroundColor: '#f8f9fa',
      selection: activeTool === 'select',
      preserveObjectStacking: true
    });

    // Configuration des événements
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('path:created', handlePathCreated);

    setFabricCanvas(canvas);

    // Charger une image de test
    loadTestImage(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  const loadTestImage = async (canvas: FabricCanvas) => {
    try {
      // Créer une image de test avec des éléments simulés
      const img = new Image();
      img.onload = () => {
        const fabricImage = new FabricImage(img, {
          left: 0,
          top: 0,
          scaleX: canvas.width! / img.width,
          scaleY: canvas.height! / img.height,
          selectable: false,
          evented: false
        });
        
        canvas.add(fabricImage);
        canvas.sendObjectToBack(fabricImage);
        canvas.renderAll();
        
        setOriginalImage(img);
        setImageLoaded(true);
        
        // Générer des éléments détectés simulés
        generateMockDetectedElements();
        
        toast({
          title: 'Image chargée',
          description: 'Image de test chargée avec succès'
        });
      };
      
      // Créer une image de test simple
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 400;
      testCanvas.height = 300;
      const ctx = testCanvas.getContext('2d')!;
      
      // Fond blanc
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 400, 300);
      
      // Simuler un document avec des lignes et du texte
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      
      // Bordures
      ctx.strokeRect(10, 10, 380, 280);
      ctx.strokeRect(15, 15, 370, 270);
      
      // Lignes horizontales
      for (let i = 0; i < 8; i++) {
        const y = 40 + i * 30;
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(370, y);
        ctx.stroke();
      }
      
      // Lignes verticales (séparateurs)
      ctx.beginPath();
      ctx.moveTo(200, 40);
      ctx.lineTo(200, 280);
      ctx.stroke();
      
      // Simuler du texte
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.fillText('RÉPUBLIQUE ALGÉRIENNE', 50, 60);
      ctx.fillText('JOURNAL OFFICIEL', 220, 60);
      ctx.fillText('Article 1er: Dispositions générales', 50, 90);
      ctx.fillText('N° 2024-001', 220, 90);
      
      img.src = testCanvas.toDataURL();
      
    } catch (error) {
      console.error('Erreur lors du chargement de l\'image:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'image de test',
        variant: 'destructive'
      });
    }
  };

  const generateMockDetectedElements = () => {
    const mockElements: { [layerId: string]: DetectedElement[] } = {
      horizontal_lines: [
        { id: 'h1', type: 'line', bounds: { x: 30, y: 40, width: 340, height: 1 }, confidence: 0.95 },
        { id: 'h2', type: 'line', bounds: { x: 30, y: 70, width: 340, height: 1 }, confidence: 0.92 },
        { id: 'h3', type: 'line', bounds: { x: 30, y: 100, width: 340, height: 1 }, confidence: 0.89 },
        { id: 'h4', type: 'line', bounds: { x: 30, y: 130, width: 340, height: 1 }, confidence: 0.94 }
      ],
      vertical_lines: [
        { id: 'v1', type: 'line', bounds: { x: 200, y: 40, width: 1, height: 240 }, confidence: 0.88 }
      ],
      borders: [
        { id: 'b1', type: 'rectangle', bounds: { x: 10, y: 10, width: 380, height: 280 }, confidence: 0.96 },
        { id: 'b2', type: 'rectangle', bounds: { x: 15, y: 15, width: 370, height: 270 }, confidence: 0.93 }
      ],
      text_regions: [
        { id: 't1', type: 'text_region', bounds: { x: 30, y: 45, width: 160, height: 120 }, confidence: 0.87 },
        { id: 't2', type: 'text_region', bounds: { x: 210, y: 45, width: 160, height: 120 }, confidence: 0.91 }
      ],
      tables: [
        { id: 'table1', type: 'table', bounds: { x: 30, y: 180, width: 340, height: 90 }, confidence: 0.84 }
      ]
    };

    setVisualizationLayers(prev => prev.map(layer => ({
      ...layer,
      elements: mockElements[layer.id] || []
    })));
  };

  const handleMouseDown = useCallback((e: any) => {
    if (activeTool === 'select' || activeTool === 'move') return;
    
    setIsDrawing(true);
    const pointer = fabricCanvas?.getPointer(e.e);
    if (!pointer) return;

    switch (activeTool) {
      case 'rectangle': {
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: activeColor,
          strokeWidth: brushWidth
        });
        fabricCanvas?.add(rect);
        break;
      }
      case 'circle': {
        const circle = new Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          fill: 'transparent',
          stroke: activeColor,
          strokeWidth: brushWidth
        });
        fabricCanvas?.add(circle);
        break;
      }
      case 'line': {
        const line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: activeColor,
          strokeWidth: brushWidth
        });
        fabricCanvas?.add(line);
        break;
      }
    }
  }, [activeTool, activeColor, brushWidth, fabricCanvas]);

  const handleMouseMove = useCallback((e: any) => {
    if (!isDrawing || !fabricCanvas) return;
    
    const pointer = fabricCanvas.getPointer(e.e);
    const activeObject = fabricCanvas.getActiveObject();
    
    if (activeObject) {
      switch (activeTool) {
        case 'rectangle': {
          if (activeObject instanceof Rect) {
            activeObject.set({
              width: Math.abs(pointer.x - activeObject.left!),
              height: Math.abs(pointer.y - activeObject.top!)
            });
          }
          break;
        }
        case 'circle': {
          if (activeObject instanceof Circle) {
            const radius = Math.sqrt(
              Math.pow(pointer.x - activeObject.left!, 2) + 
              Math.pow(pointer.y - activeObject.top!, 2)
            ) / 2;
            activeObject.set({ radius });
          }
          break;
        }
        case 'line': {
          if (activeObject instanceof Line) {
            activeObject.set({
              x2: pointer.x,
              y2: pointer.y
            });
          }
          break;
        }
      }
      fabricCanvas.renderAll();
    }
  }, [isDrawing, activeTool, fabricCanvas]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handlePathCreated = useCallback((e: any) => {
    // Personnaliser les chemins créés avec l'outil de dessin libre
    e.path.set({
      stroke: activeColor,
      strokeWidth: brushWidth
    });
  }, [activeColor, brushWidth]);

  const toggleLayerVisibility = (layerId: string) => {
    setVisualizationLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
    renderVisualizationLayers();
  };

  const renderVisualizationLayers = useCallback(() => {
    if (!fabricCanvas) return;

    // Supprimer les éléments de visualisation existants
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      if ((obj as any).data && (obj as any).data.isVisualization) {
        fabricCanvas.remove(obj);
      }
    });

    // Ajouter les éléments des couches visibles
    visualizationLayers.forEach(layer => {
      if (!layer.visible) return;

      layer.elements.forEach(element => {
        let fabricObject;
        
        switch (element.type) {
          case 'line':
            if (element.bounds.width > element.bounds.height) {
              // Ligne horizontale
              fabricObject = new Line([
                element.bounds.x,
                element.bounds.y,
                element.bounds.x + element.bounds.width,
                element.bounds.y
              ], {
                stroke: layer.color,
                strokeWidth: 2,
                selectable: false,
                evented: false,
                data: { isVisualization: true, layerId: layer.id, elementId: element.id }
              });
            } else {
              // Ligne verticale
              fabricObject = new Line([
                element.bounds.x,
                element.bounds.y,
                element.bounds.x,
                element.bounds.y + element.bounds.height
              ], {
                stroke: layer.color,
                strokeWidth: 2,
                selectable: false,
                evented: false,
                data: { isVisualization: true, layerId: layer.id, elementId: element.id }
              });
            }
            break;
            
          case 'rectangle':
          case 'text_region':
          case 'table':
            fabricObject = new Rect({
              left: element.bounds.x,
              top: element.bounds.y,
              width: element.bounds.width,
              height: element.bounds.height,
              fill: 'transparent',
              stroke: layer.color,
              strokeWidth: element.type === 'table' ? 3 : 2,
              strokeDashArray: element.type === 'text_region' ? [5, 5] : undefined,
              selectable: false,
              evented: false,
              data: { isVisualization: true, layerId: layer.id, elementId: element.id }
            });
            break;
        }
        
        if (fabricObject) {
          fabricCanvas.add(fabricObject);
        }
      });
    });

    fabricCanvas.renderAll();
  }, [fabricCanvas, visualizationLayers]);

  useEffect(() => {
    renderVisualizationLayers();
  }, [renderVisualizationLayers]);

  const handleZoom = (delta: number) => {
    if (!fabricCanvas) return;
    
    const newZoom = Math.max(0.1, Math.min(3, zoom + delta));
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom);
    fabricCanvas.renderAll();
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    
    // Supprimer seulement les annotations, pas l'image de fond et les visualisations
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      if (!(obj as any).data || (!(obj as any).data.isVisualization && !(obj as any).data.isBackground)) {
        fabricCanvas.remove(obj);
      }
    });
    fabricCanvas.renderAll();
    
    toast({
      title: 'Annotations effacées',
      description: 'Toutes les annotations ont été supprimées'
    });
  };

  const handleExport = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });
    
    const link = document.createElement('a');
    link.download = 'ocr-analysis.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Image exportée',
      description: 'L\'analyse a été sauvegardée en PNG'
    });
  };

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000'];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Canvas d'Analyse d'Images</h1>
          <p className="text-muted-foreground">Visualisation et annotation des résultats de détection</p>
        </div>
        <Badge variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Analyse visuelle
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panneau d'outils */}
        <div className="lg:col-span-1 space-y-4">
          {/* Outils de dessin */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Outils d'annotation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={activeTool === 'select' ? 'default' : 'outline'}
                  onClick={() => setActiveTool('select')}
                  size="sm"
                >
                  <MousePointer className="w-4 h-4" />
                </Button>
                <Button
                  variant={activeTool === 'move' ? 'default' : 'outline'}
                  onClick={() => setActiveTool('move')}
                  size="sm"
                >
                  <Move className="w-4 h-4" />
                </Button>
                <Button
                  variant={activeTool === 'rectangle' ? 'default' : 'outline'}
                  onClick={() => setActiveTool('rectangle')}
                  size="sm"
                >
                  <Square className="w-4 h-4" />
                </Button>
                <Button
                  variant={activeTool === 'circle' ? 'default' : 'outline'}
                  onClick={() => setActiveTool('circle')}
                  size="sm"
                >
                  <CircleIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant={activeTool === 'line' ? 'default' : 'outline'}
                  onClick={() => setActiveTool('line')}
                  size="sm"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>

              {/* Couleurs */}
              <div>
                <label className="text-sm font-medium">Couleur</label>
                <div className="grid grid-cols-4 gap-1 mt-1">
                  {colors.map(color => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded border-2 ${
                        activeColor === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setActiveColor(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Épaisseur du trait */}
              <div>
                <label className="text-sm font-medium">Épaisseur: {brushWidth}px</label>
                <Slider
                  value={[brushWidth]}
                  onValueChange={([value]) => setBrushWidth(value)}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contrôles de vue */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contrôles de vue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Zoom: {Math.round(zoom * 100)}%</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleZoom(-0.1)}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleZoom(0.1)}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Effacer
                </Button>
                <Button size="sm" variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Couches de visualisation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Couches de détection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {visualizationLayers.map(layer => (
                  <div key={layer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className="text-sm">{layer.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {layer.elements.length}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant={layer.visible ? 'default' : 'outline'}
                      onClick={() => toggleLayerVisibility(layer.id)}
                      className="h-6 w-12 text-xs"
                    >
                      {layer.visible ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Canvas principal */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Canvas d'analyse
                {imageLoaded && (
                  <Badge variant="secondary">Image chargée</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={containerRef} className="border rounded-lg overflow-hidden">
                <canvas ref={canvasRef} className="block" />
              </div>
              
              {!imageLoaded && (
                <div className="mt-4 text-center text-muted-foreground">
                  <Settings className="w-8 h-8 mx-auto mb-2" />
                  <p>Chargement de l'image de test...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};