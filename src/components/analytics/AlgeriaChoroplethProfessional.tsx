import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { geoMercator } from 'd3-geo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Home, Download, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ALGERIA_58_WILAYAS_GEOJSON } from '@/data/algeria-58-wilayas-real';

interface WilayaStats {
  code: string;
  name: string;
  arName?: string;
  total: number;
  recent: number;
  sectors: number;
}

interface HoveredWilaya {
  name: string;
  code: string;
  total: number;
  recent: number;
  sectors: number;
  x: number;
  y: number;
}

const AlgeriaChoroplethProfessional: React.FC = () => {
  const [mapMode, setMapMode] = useState<'density' | 'recent' | 'sectors'>('density');
  const [wilayasData, setWilayasData] = useState<WilayaStats[]>([]);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([3.0, 28.0]);
  const [hovered, setHovered] = useState<HoveredWilaya | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<{ code: string; name: string; arName?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [geoData, setGeoData] = useState<any>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 1000 });

  // Normalisation des noms -> codes (extrait depuis un référentiel 58 wilayas)
  const nameToCode = useMemo(() => {
    const normalizeName = (name: string) => {
      return (name || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/["'’`]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    };

    const synonyms: Record<string, string> = {
      // Corrections d'orthographe/usages courants
      'timimoune': 'timimoun',
      'beni abbes': 'beni abbes',
      'bordj badji mokhtar': 'bordj baji mokhtar',
      'el menia': 'el meniaa',
      'el menea': 'el meniaa',
      'in guezzem': 'in guezzam',
      'in guezem': 'in guezzam',
    };

    return { normalizeName, synonyms };
  }, []);

  // Chargement + normalisation du GeoJSON réel (58 wilayas)
  useEffect(() => {
    try {
      const raw: any = ALGERIA_58_WILAYAS_GEOJSON;
      const normalized = {
        type: raw.type,
        features: (raw.features || []).map((f: any) => {
          const props = f.properties || {};
          // 1) Utiliser city_code ou code si présent
          let code: any = props.city_code ?? props.code ?? null;
          if (code !== undefined && code !== null) {
            code = String(code).padStart(2, '0');
          } else {
            // 2) Fallback léger par nom (synonymes seulement)
            const rawName = props.name || props.nom || '';
            let key = nameToCode.normalizeName(rawName);
            if (nameToCode.synonyms[key]) key = nameToCode.synonyms[key];
            // Sans référentiel externe, on laisse null si non détecté
          }

          return {
            ...f,
            properties: {
              ...props,
              code: code ?? null,
              arName: props.name_ar || props.arName || props['name_ar'] || null,
            }
          };
        })
      };

      setGeoData(normalized as any);
      setGeoError(null);
    } catch (e) {
      console.error('Erreur chargement GeoJSON intégré:', e);
      setGeoError('Impossible de charger la carte (GeoJSON)');
    }
  }, [nameToCode]);

  // Mesure du conteneur pour un fit-to-bounds en mode portrait (4/5)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateDimensions = () => {
      const rect = el.getBoundingClientRect();
      const width = Math.max(600, rect.width);
      const height = Math.max(750, rect.height);
      setDimensions({ width, height });
    };

    const ro = new ResizeObserver(updateDimensions);
    ro.observe(el);
    updateDimensions();
    return () => ro.disconnect();
  }, []);

  // Projection calculée automatiquement pour ajuster la carte aux bornes (fit-to-bounds)
  const projection = useMemo(() => {
    if (!geoData) return null;
    try {
      // Calcule une projection mercator adaptée aux dimensions du conteneur avec un agrandissement
      const baseProjection = geoMercator().fitSize([dimensions.width, dimensions.height], geoData as unknown as any);
      // Agrandir la carte de 20% pour qu'elle occupe plus d'espace
      const currentScale = baseProjection.scale();
      return baseProjection.scale(currentScale * 1.2);
    } catch (e) {
      // Fallback raisonnable si fitSize échoue
      return geoMercator().scale(3800).center([3.0, 28.0]);
    }
  }, [geoData, dimensions.width, dimensions.height]);

  // Récupération des données depuis Supabase
  const fetchWilayasStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Essayer d'utiliser les vues SQL d'abord
      const { data: statsData } = await supabase
        .from('v_wilaya_stats')
        .select('*');

      if (statsData && statsData.length > 0) {
        const processedData = statsData.map(stat => ({
          code: stat.code.padStart(2, '0'),
          name: stat.name || `Wilaya ${stat.code}`,
          total: stat.total_texts || 0,
          recent: stat.recent_texts || 0,
          sectors: stat.sectors_count || 0
        }));
        setWilayasData(processedData);
      } else {
        // Fallback avec données de démonstration réalistes pour les 58 wilayas
        const demoData: WilayaStats[] = [
          { code: "01", name: "Adrar", total: 75, recent: 12, sectors: 4 },
          { code: "02", name: "Chlef", total: 110, recent: 23, sectors: 6 },
          { code: "03", name: "Laghouat", total: 80, recent: 18, sectors: 5 },
          { code: "04", name: "Oum El Bouaghi", total: 85, recent: 16, sectors: 5 },
          { code: "05", name: "Batna", total: 120, recent: 28, sectors: 7 },
          { code: "06", name: "Béjaïa", total: 120, recent: 26, sectors: 6 },
          { code: "07", name: "Biskra", total: 100, recent: 24, sectors: 6 },
          { code: "08", name: "Béchar", total: 85, recent: 14, sectors: 4 },
          { code: "09", name: "Blida", total: 135, recent: 38, sectors: 7 },
          { code: "10", name: "Bouira", total: 95, recent: 20, sectors: 5 },
          { code: "11", name: "Tamanrasset", total: 60, recent: 12, sectors: 3 },
          { code: "12", name: "Tébessa", total: 90, recent: 22, sectors: 5 },
          { code: "13", name: "Tlemcen", total: 125, recent: 30, sectors: 6 },
          { code: "14", name: "Tiaret", total: 90, recent: 18, sectors: 5 },
          { code: "15", name: "Tizi Ouzou", total: 130, recent: 35, sectors: 7 },
          { code: "16", name: "Alger", total: 220, recent: 70, sectors: 9 },
          { code: "17", name: "Djelfa", total: 85, recent: 20, sectors: 5 },
          { code: "18", name: "Jijel", total: 95, recent: 19, sectors: 5 },
          { code: "19", name: "Sétif", total: 150, recent: 45, sectors: 7 },
          { code: "20", name: "Saïda", total: 80, recent: 14, sectors: 4 },
          { code: "21", name: "Skikda", total: 115, recent: 28, sectors: 6 },
          { code: "22", name: "Sidi Bel Abbès", total: 100, recent: 24, sectors: 6 },
          { code: "23", name: "Annaba", total: 140, recent: 40, sectors: 6 },
          { code: "24", name: "Guelma", total: 80, recent: 16, sectors: 5 },
          { code: "25", name: "Constantine", total: 160, recent: 50, sectors: 7 },
          { code: "26", name: "Médéa", total: 100, recent: 22, sectors: 5 },
          { code: "27", name: "Mostaganem", total: 105, recent: 24, sectors: 6 },
          { code: "28", name: "M'Sila", total: 100, recent: 26, sectors: 6 },
          { code: "29", name: "Mascara", total: 95, recent: 20, sectors: 5 },
          { code: "30", name: "Ouargla", total: 100, recent: 25, sectors: 6 },
          { code: "31", name: "Oran", total: 180, recent: 55, sectors: 8 },
          { code: "32", name: "El Bayadh", total: 60, recent: 12, sectors: 3 },
          { code: "33", name: "Illizi", total: 55, recent: 10, sectors: 3 },
          { code: "34", name: "Bordj Bou Arréridj", total: 90, recent: 22, sectors: 5 },
          { code: "35", name: "Boumerdès", total: 110, recent: 28, sectors: 6 },
          { code: "36", name: "El Tarf", total: 70, recent: 14, sectors: 4 },
          { code: "37", name: "Tindouf", total: 50, recent: 8, sectors: 2 },
          { code: "38", name: "Tissemsilt", total: 60, recent: 12, sectors: 4 },
          { code: "39", name: "El Oued", total: 95, recent: 26, sectors: 6 },
          { code: "40", name: "Khenchela", total: 70, recent: 14, sectors: 4 },
          { code: "41", name: "Souk Ahras", total: 75, recent: 15, sectors: 4 },
          { code: "42", name: "Tipaza", total: 90, recent: 18, sectors: 5 },
          { code: "43", name: "Mila", total: 75, recent: 14, sectors: 4 },
          { code: "44", name: "Aïn Defla", total: 80, recent: 16, sectors: 5 },
          { code: "45", name: "Naâma", total: 50, recent: 9, sectors: 3 },
          { code: "46", name: "Aïn Témouchent", total: 85, recent: 18, sectors: 5 },
          { code: "47", name: "Ghardaïa", total: 90, recent: 20, sectors: 5 },
          { code: "48", name: "Relizane", total: 90, recent: 18, sectors: 5 },
          // Les 10 nouvelles wilayas (créées en 2019)
          { code: "49", name: "El M'Ghair", total: 60, recent: 14, sectors: 4 },
          { code: "50", name: "El Meniaa", total: 55, recent: 12, sectors: 4 },
          { code: "51", name: "Ouled Djellal", total: 50, recent: 11, sectors: 3 },
          { code: "52", name: "Bordj Baji Mokhtar", total: 35, recent: 6, sectors: 2 },
          { code: "53", name: "Béni Abbès", total: 40, recent: 7, sectors: 3 },
          { code: "54", name: "Timimoun", total: 45, recent: 8, sectors: 3 },
          { code: "55", name: "Touggourt", total: 65, recent: 16, sectors: 4 },
          { code: "56", name: "Djanet", total: 30, recent: 5, sectors: 2 },
          { code: "57", name: "In Salah", total: 35, recent: 6, sectors: 2 },
          { code: "58", name: "In Guezzam", total: 25, recent: 4, sectors: 2 }
        ];
        setWilayasData(demoData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWilayasStats();
  }, [fetchWilayasStats]);

  // Modes de carte configurés avec useMemo pour optimisation
  const mapModes = useMemo(() => ({
    density: {
      label: 'Densité des textes',
      getValue: (w: WilayaStats) => w.total,
      colors: ['#e3f2fd', '#1976d2'],
      unit: 'textes'
    },
    recent: {
      label: 'Textes récents',
      getValue: (w: WilayaStats) => w.recent,
      colors: ['#e8f5e8', '#388e3c'],
      unit: 'récents'
    },
    sectors: {
      label: 'Diversité sectorielle',
      getValue: (w: WilayaStats) => w.sectors,
      colors: ['#fff3e0', '#f57c00'],
      unit: 'secteurs'
    }
  }), []);

  // Calcul de l'échelle de couleurs
  const { colorScale, maxValue } = useMemo(() => {
    const currentMode = mapModes[mapMode];
    const values = wilayasData.map(currentMode.getValue);
    const max = Math.max(...values, 1);
    
    const scale = scaleLinear<string>()
      .domain([0, max])
      .range(currentMode.colors);
    
    return { colorScale: scale, maxValue: max };
  }, [wilayasData, mapMode, mapModes]);

  // Fonctions de gestion des événements
  const getWilayaColor = useCallback((wilayaCode: string) => {
    const wilaya = wilayasData.find(w => w.code === wilayaCode);
    if (!wilaya) return '#f5f5f5';
    const value = mapModes[mapMode].getValue(wilaya);
    const color = colorScale(value);
    // Vérification de sécurité pour éviter les valeurs CSS invalides
    return color && typeof color === 'string' ? color : '#f5f5f5';
  }, [wilayasData, mapMode, mapModes, colorScale]);

  const handleWilayaHover = useCallback((geo: any, event: React.MouseEvent) => {
    const wilayaCode = geo.properties.code;
    const wilaya = wilayasData.find(w => w.code === wilayaCode);
    
    if (wilaya) {
      const rect = event.currentTarget.getBoundingClientRect();
      setHovered({
        name: wilaya.name,
        code: wilaya.code,
        total: wilaya.total,
        recent: wilaya.recent,
        sectors: wilaya.sectors,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  }, [wilayasData]);

  const handleWilayaClick = useCallback((geo: any) => {
    const wilayaCode = geo.properties.code;
    const wilaya = wilayasData.find(w => w.code === wilayaCode);
    
    if (wilaya) {
      setSelectedWilaya({
        code: wilaya.code,
        name: wilaya.name,
        arName: geo.properties.name_ar || geo.properties.arName
      });
      toast.success(`Wilaya sélectionnée: ${wilaya.name}`);
    }
  }, [wilayasData]);

  // Contrôles de zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));
  const resetView = () => {
    setZoom(1);
    setCenter([3.0, 28.0]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la carte des 58 wilayas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contrôles supérieurs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-background border rounded-lg">
        <div className="flex items-center gap-4">
          <Select value={mapMode} onValueChange={(value: any) => setMapMode(value)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="density">Densité des textes</SelectItem>
              <SelectItem value="recent">Textes récents</SelectItem>
              <SelectItem value="sectors">Diversité sectorielle</SelectItem>
            </SelectContent>
          </Select>
          
          <Badge variant="outline" className="flex items-center gap-2">
            <Info className="w-3 h-3" />
            58 wilayas
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoomer</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Dézoomer</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={resetView}>
                  <Home className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Vue d'ensemble</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Carte principale sans arrière-plan */}
      <div className="overflow-hidden">
        <div className="p-0 relative">
          <div ref={containerRef} className="aspect-[4/5] w-full relative">
            {geoError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-sm text-red-600 dark:text-red-400">
                  {geoError}
                </div>
              </div>
            )}

            {geoData && !geoError && (
              <ComposableMap
                projection={projection as any}
                width={dimensions.width}
                height={dimensions.height}
                className="w-full h-full"
              >
                <ZoomableGroup zoom={zoom} center={center}>
                  <Geographies geography={geoData}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const wilayaCode = geo.properties?.code;
                        const wilaya = wilayasData.find(w => w.code === wilayaCode);
                        
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={getWilayaColor(wilayaCode || '')}
                            stroke="hsl(var(--foreground))"
                            strokeWidth={1.2}
                            className="cursor-pointer transition-all duration-300"
                            onMouseEnter={(event) => handleWilayaHover(geo, event)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => handleWilayaClick(geo)}
                            style={{
                              default: {
                                outline: 'none',
                                vectorEffect: 'non-scaling-stroke',
                                shapeRendering: 'geometricPrecision',
                                strokeLinejoin: 'round',
                                strokeLinecap: 'round',
                              },
                              hover: {
                                outline: 'none',
                                stroke: 'hsl(var(--primary))',
                                strokeWidth: 2.5,
                                filter: 'brightness(1.1)',
                                vectorEffect: 'non-scaling-stroke',
                                shapeRendering: 'geometricPrecision',
                                strokeLinejoin: 'round',
                                strokeLinecap: 'round',
                              },
                              pressed: {
                                outline: 'none',
                                vectorEffect: 'non-scaling-stroke',
                                shapeRendering: 'geometricPrecision',
                                strokeLinejoin: 'round',
                                strokeLinecap: 'round',
                              },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>

                  {/* Calque des contours nets (Algérie + wilayas) */}
                  <Geographies geography={geoData}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={`outline-${geo.rsmKey}`}
                          geography={geo}
                          fill="transparent"
                          stroke="hsl(var(--foreground))"
                          strokeWidth={1.6}
                          style={{
                            default: {
                              outline: 'none',
                              vectorEffect: 'non-scaling-stroke',
                              shapeRendering: 'geometricPrecision',
                              strokeLinejoin: 'round',
                              strokeLinecap: 'round',
                              pointerEvents: 'none'
                            },
                            hover: { outline: 'none' },
                            pressed: { outline: 'none' }
                          }}
                        />
                      ))
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
            )}

            {/* Tooltip de survol */}
            {hovered && typeof hovered.x === 'number' && typeof hovered.y === 'number' && (
              <div
                className="absolute z-10 bg-background border border-border rounded-lg shadow-lg p-3 pointer-events-none"
                style={{
                  left: Math.max(0, hovered.x + 10),
                  top: Math.max(0, hovered.y - 10),
                  transform: 'translateY(-100%)'
                }}
              >
                <div className="text-sm font-semibold">{hovered.name} ({hovered.code})</div>
                <div className="text-xs text-muted-foreground mt-1 space-y-1">
                  <div>Textes: {hovered.total}</div>
                  <div>Récents: {hovered.recent}</div>
                  <div>Secteurs: {hovered.sectors}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Légende horizontale avec dégradé */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              {mapModes[mapMode].label}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">0</span>
                 <div className="flex h-4 w-48 rounded overflow-hidden border">
                   {Array.from({ length: 20 }, (_, i) => {
                     const value = maxValue > 0 ? i * (maxValue / 19) : 0;
                     const bgColor = colorScale(value);
                     return (
                        <div
                          key={i}
                          className="flex-1"
                          style={{
                            backgroundColor: bgColor && typeof bgColor === 'string' ? bgColor : '#f5f5f5'
                          }}
                        />
                      );
                    })}
                 </div>
                <span className="text-xs text-muted-foreground">{maxValue}</span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Max: {maxValue} {mapModes[mapMode].unit}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Détails wilaya sélectionnée */}
      {selectedWilaya && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Détails - {selectedWilaya.name} ({selectedWilaya.code})</span>
              {selectedWilaya.arName && (
                <span className="text-sm text-muted-foreground font-normal">
                  {selectedWilaya.arName}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const wilayaData = wilayasData.find(w => w.code === selectedWilaya.code);
              if (!wilayaData) return null;
              
              return (
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{wilayaData.total}</div>
                    <div className="text-sm text-muted-foreground">Textes total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{wilayaData.recent}</div>
                    <div className="text-sm text-muted-foreground">Textes récents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{wilayaData.sectors}</div>
                    <div className="text-sm text-muted-foreground">Secteurs</div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AlgeriaChoroplethProfessional;