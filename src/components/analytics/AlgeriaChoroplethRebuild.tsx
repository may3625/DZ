import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
// import algeria58WilayasRaw from '@/data/algeria-58-wilayas-geojson.json';
import { ALGERIA_COMPLETE_GEOJSON } from '@/data/algeria-wilayas-complete';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WilayaTextsModal from './WilayaTextsModal';

interface WilayaStats {
  code: string;
  name: string;
  ar_name?: string;
  total_texts: number;
  recent_texts: number;
  sectors_count: number;
  last_publication?: string;
}

interface HoveredWilaya {
  name: string;
  arName?: string;
  code: string;
  total: number;
  recent: number;
  sectors: number;
}

const AlgeriaChoroplethRebuild: React.FC = () => {
  const { toast } = useToast();
  const [wilayasData, setWilayasData] = useState<WilayaStats[]>([]);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([2.6, 27.5]);
  const [hovered, setHovered] = useState<HoveredWilaya | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWilaya, setSelectedWilaya] = useState<{ code: string; name: string; arName?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 1000 });

  // Container measurement for vertical layout
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

  // Load wilaya statistics from Supabase
  useEffect(() => {
    let cancelled = false;
    
    const loadWilayaStats = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('v_wilaya_stats')
          .select('*')
          .order('code');

        if (cancelled) return;

        if (error) {
          console.error('Error loading wilaya stats:', error);
          toast({
            title: 'Erreur de chargement',
            description: 'Impossible de charger les statistiques des wilayas.',
            variant: 'destructive'
          });
          setWilayasData([]);
          return;
        }

        if (data && Array.isArray(data)) {
          console.log('Loaded wilaya stats:', data.length, 'records');
          setWilayasData(data);
        } else {
          console.warn('No data returned from v_wilaya_stats');
          setWilayasData([]);
        }

      } catch (err) {
        if (!cancelled) {
          console.error('Fetch error:', err);
          toast({
            title: 'Erreur de connexion',
            description: 'Problème de connexion à la base de données.',
            variant: 'destructive'
          });
          setWilayasData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadWilayaStats();
    
    return () => { cancelled = true; };
  }, [toast]);

  // Calculate statistics for color scaling
  const colorStats = useMemo(() => {
    if (wilayasData.length === 0) return { min: 0, max: 1, avg: 0 };
    
    const totals = wilayasData.map(w => w.total_texts);
    const sum = totals.reduce((acc, val) => acc + val, 0);
    
    return {
      min: Math.min(...totals),
      max: Math.max(...totals),
      avg: sum / totals.length
    };
  }, [wilayasData]);

  // Enhanced name normalization for better matching
  const normalizeName = useCallback((name?: string): string => {
    if (!name) return '';
    
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[-_]/g, ' ')
      .replace(/[^a-z\s']/g, '')
      .replace(/\b(wilaya|province|daira)\s+(de|d'|du|)\s*/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\bel\b/g, 'al')
      .replace(/\boum\b/g, 'um')
      .replace(/\bain\b/g, 'ayn');
  }, []);

  // Improved wilaya matching algorithm
  const findWilayaByProps = useCallback((props: any): WilayaStats | null => {
    if (!props || wilayasData.length === 0) return null;

    // Priority 1: Direct code matching (most reliable)
    const codeFields = [
      props.code, props.id, props.shapeISO, props.HASC_1, props.CODE_1, props.ID_1,
      props.shapeID, props.wilaya_code, props.ADM1_CODE, props.ISO_3166_2
    ];

    for (const field of codeFields) {
      if (!field) continue;
      
      const codeStr = String(field).trim();
      
      // Try direct match first
      const directMatch = wilayasData.find(w => w.code === codeStr);
      if (directMatch) return directMatch;
      
      // Try extracting numeric part and padding
      const numericMatch = codeStr.match(/(\d{1,2})/);
      if (numericMatch) {
        const paddedCode = numericMatch[1].padStart(2, '0');
        const codeMatch = wilayasData.find(w => w.code === paddedCode);
        if (codeMatch) return codeMatch;
      }
      
      // Try ISO format (DZ-XX)
      const isoMatch = codeStr.match(/DZ[-_]?(\d{1,2})/i);
      if (isoMatch) {
        const paddedCode = isoMatch[1].padStart(2, '0');
        const codeMatch = wilayasData.find(w => w.code === paddedCode);
        if (codeMatch) return codeMatch;
      }
    }

    // Priority 2: Name matching with enhanced normalization
    const nameFields = [
      props.name, props.shapeName, props.NAME_1, props.NAME, props.NAME_ENG,
      props.wilaya_name, props.ADM1_FR, props.ADM1_AR, props.name_ar
    ].filter(Boolean);

    for (const nameField of nameFields) {
      const normalizedInput = normalizeName(nameField);
      if (!normalizedInput) continue;

      // Exact normalized match
      const exactMatch = wilayasData.find(w => 
        normalizeName(w.name) === normalizedInput
      );
      if (exactMatch) return exactMatch;

      // Partial match (contains)
      const partialMatch = wilayasData.find(w => {
        const normalizedWilaya = normalizeName(w.name);
        return normalizedWilaya.includes(normalizedInput) || 
               normalizedInput.includes(normalizedWilaya);
      });
      if (partialMatch) return partialMatch;
    }

    // Debug: log unmatched props
    console.log('Unmatched wilaya props:', props);
    return null;
  }, [wilayasData, normalizeName]);

  // Enhanced color calculation for choropleth
  const getWilayaColor = useCallback((wilayaData: WilayaStats | null): string => {
    if (!wilayaData || wilayaData.total_texts === 0) {
      return 'hsl(var(--muted) / 0.3)';
    }
    
    if (colorStats.max === 0) return 'hsl(var(--muted) / 0.3)';
    
    const ratio = Math.min(1, wilayaData.total_texts / colorStats.max);
    
    // Progressive color scaling with better visual distinction
    if (ratio < 0.1) {
      return 'hsl(var(--primary) / 0.2)';
    } else if (ratio < 0.3) {
      return 'hsl(var(--primary) / 0.4)';
    } else if (ratio < 0.5) {
      return 'hsl(var(--primary) / 0.6)';
    } else if (ratio < 0.7) {
      return 'hsl(var(--primary) / 0.75)';
    } else {
      return 'hsl(var(--primary) / 0.9)';
    }
  }, [colorStats.max]);

  // Enhanced hover handler with mouse tracking
  const handleWilayaEnter = useCallback((geo: any, event: React.MouseEvent) => {
    const props = geo?.properties || {};
    const wilaya = findWilayaByProps(props);
    
    // Update mouse position for tooltip positioning
    if (event && event.clientX && event.clientY) {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
    
    if (wilaya) {
      setHovered({
        name: wilaya.name,
        arName: wilaya.ar_name,
        code: wilaya.code,
        total: wilaya.total_texts,
        recent: wilaya.recent_texts,
        sectors: wilaya.sectors_count
      });
    } else {
      // Fallback display for unmatched wilayas
      const displayName = props.shapeName || props.NAME_1 || props.name || 'Wilaya inconnue';
      setHovered({
        name: displayName,
        code: '',
        total: 0,
        recent: 0,
        sectors: 0
      });
    }
  }, [findWilayaByProps]);

  const handleWilayaLeave = useCallback(() => {
    setHovered(null);
  }, []);

  // Enhanced click handler
  const handleWilayaClick = useCallback((geo: any) => {
    const props = geo?.properties || {};
    const wilaya = findWilayaByProps(props);
    
    if (wilaya && wilaya.code) {
      setSelectedWilaya({ 
        code: wilaya.code, 
        name: wilaya.name, 
        arName: wilaya.ar_name 
      });
      setModalOpen(true);
    } else {
      toast({
        title: 'Wilaya non trouvée',
        description: 'Aucune donnée disponible pour cette région.',
        variant: 'default'
      });
    }
  }, [findWilayaByProps, toast]);

  // Reset to initial view
  const resetView = useCallback(() => {
    setZoom(1);
    setCenter([2.6, 27.5]);
  }, []);

  // Validation de géométrie pour éviter les erreurs de rendu
  const isValidGeo = (g: any): boolean => {
    try {
      const geom = g?.geometry;
      if (!geom) return false;
      const coords = geom.coordinates;
      if (!coords || !Array.isArray(coords)) return false;

      const isPair = (pt: any) => Array.isArray(pt) && Number.isFinite(pt[0]) && Number.isFinite(pt[1]);
      const isRing = (ring: any) => Array.isArray(ring) && ring.length >= 4 && ring.every(isPair);

      switch (geom.type) {
        case 'Polygon':
          return Array.isArray(coords) && coords.every(isRing);
        case 'MultiPolygon':
          return coords.every((poly: any) => Array.isArray(poly) && poly.every(isRing));
        case 'LineString':
          return coords.every(isPair);
        case 'MultiLineString':
          return coords.every((line: any) => Array.isArray(line) && line.every(isPair));
        case 'Point':
          return isPair(coords);
        default:
          return true;
      }
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="w-full aspect-[4/5] flex items-center justify-center rounded-lg border bg-muted/20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Chargement des données géographiques</p>
            <p className="text-sm text-muted-foreground">Préparation de la carte interactive...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Statistics Overview */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-muted/20 rounded-lg">
          <div className="text-2xl font-bold text-primary">{wilayasData.length}</div>
          <div className="text-sm text-muted-foreground">Wilayas</div>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {wilayasData.reduce((sum, w) => sum + w.total_texts, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Textes totaux</div>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {Math.round(colorStats.avg)}
          </div>
          <div className="text-sm text-muted-foreground">Moyenne/wilaya</div>
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex items-center justify-center space-x-4 p-4 bg-muted/10 rounded-lg">
        <span className="text-sm font-medium">Densité des textes légaux:</span>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}></div>
          <span className="text-xs">0</span>
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--primary) / 0.2)' }}></div>
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--primary) / 0.4)' }}></div>
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--primary) / 0.6)' }}></div>
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--primary) / 0.9)' }}></div>
          <span className="text-xs">{colorStats.max}+</span>
        </div>
      </div>

      {/* Main map container - Fixed vertical aspect ratio */}
      <div 
        ref={containerRef} 
        className="relative w-full aspect-[4/5] min-h-[600px] rounded-lg border overflow-hidden bg-gradient-to-b from-background to-muted/30 shadow-lg"
      >
        
        {/* Enhanced control panel */}
        <div className="absolute z-20 top-4 left-4 flex flex-col gap-2">
          <button
            className="w-12 h-12 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-all duration-200 flex items-center justify-center text-xl font-bold hover:scale-105"
            aria-label="Zoomer"
            onClick={() => setZoom(z => Math.min(8, z * 1.5))}
          >
            +
          </button>
          <button
            className="w-12 h-12 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-all duration-200 flex items-center justify-center text-xl font-bold hover:scale-105"
            aria-label="Dézoomer"
            onClick={() => setZoom(z => Math.max(1, z / 1.5))}
          >
            −
          </button>
          <button
            className="w-12 h-12 bg-secondary text-secondary-foreground rounded-lg shadow-lg hover:bg-secondary/80 transition-all duration-200 flex items-center justify-center text-sm font-bold hover:scale-105"
            aria-label="Réinitialiser la vue"
            onClick={resetView}
          >
            ⌂
          </button>
        </div>

        {/* Enhanced tooltip */}
        {hovered && (
          <div className="absolute z-20 top-4 right-4 rounded-xl border bg-background/95 backdrop-blur-sm px-5 py-4 shadow-xl min-w-[280px] max-w-[320px] animate-in slide-in-from-right-4 duration-200">
            <div className="space-y-3">
              <div className="border-b pb-2">
                <h3 className="font-bold text-lg text-foreground">
                  {hovered.name}
                </h3>
                {hovered.arName && (
                  <p className="text-sm text-muted-foreground">{hovered.arName}</p>
                )}
              </div>
              
              {hovered.code ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Code:</span>
                      <p className="font-semibold">{hovered.code}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Secteurs:</span>
                      <p className="font-semibold">{hovered.sectors}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Textes totaux:</span>
                      <p className="font-bold text-primary">{hovered.total}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Récents (30j):</span>
                      <p className="font-semibold">{hovered.recent}</p>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02]"
                    onClick={() => handleWilayaClick({ properties: { code: hovered.code } })}
                  >
                    📊 Voir les détails
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune donnée disponible pour cette région
                </p>
              )}
            </div>
          </div>
        )}

        {/* Map with optimized projection for Algeria */}
        <ComposableMap 
          width={dimensions.width} 
          height={dimensions.height}
          projectionConfig={{ 
            scale: Math.min(dimensions.width * 1.2, dimensions.height * 0.8),
            center: [2.6, 27.5] as [number, number],
            rotation: [0, 0, 0]
          }}
          className="w-full h-full"
        >
          <ZoomableGroup 
            zoom={zoom} 
            center={center} 
            minZoom={1} 
            maxZoom={8} 
            onMoveEnd={({ zoom: newZoom, coordinates }) => { 
              setZoom(newZoom); 
              setCenter(coordinates as [number, number]); 
            }}
          >
            {/* Country outline (reuse wilaya boundaries as outline layer to avoid external fetch) */}
            <Geographies geography={ALGERIA_COMPLETE_GEOJSON as any} key="country-outline">
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={`country-${geo.rsmKey}`}
                    geography={geo}
                    style={{
                      default: { 
                        fill: 'transparent', 
                        stroke: 'hsl(var(--border))', 
                        strokeWidth: 2.0, 
                        outline: 'none',
                        vectorEffect: 'non-scaling-stroke'
                      },
                      hover: { 
                        fill: 'transparent', 
                        stroke: 'hsl(var(--primary))', 
                        strokeWidth: 2.4, 
                        outline: 'none',
                        vectorEffect: 'non-scaling-stroke'
                      },
                      pressed: { 
                        fill: 'transparent', 
                        stroke: 'hsl(var(--primary))', 
                        strokeWidth: 2.4, 
                        outline: 'none',
                        vectorEffect: 'non-scaling-stroke'
                      }
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Wilaya boundaries with choropleth coloring (embedded) */}
            <Geographies geography={ALGERIA_COMPLETE_GEOJSON as any} key="wilayas-boundaries">
              {({ geographies }) =>
                geographies.filter(isValidGeo).map((geo) => {
                  const wilaya = findWilayaByProps(geo.properties);
                  const fillColor = wilaya ? getWilayaColor(wilaya) : 'hsl(var(--muted))';
                  
                  return (
                    <Geography
                      key={`wilaya-${geo.rsmKey}`}
                      geography={geo}
                      onMouseEnter={(event) => handleWilayaEnter(geo, event)}
                      onMouseLeave={handleWilayaLeave}
                      onClick={() => handleWilayaClick(geo)}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: 'hsl(var(--border))',
                          strokeWidth: 0.8,
                          outline: 'none',
                          cursor: 'pointer'
                        },
                        hover: {
                          fill: `${fillColor}CC`, // Add transparency on hover
                          stroke: 'hsl(var(--primary))',
                          strokeWidth: 2,
                          outline: 'none',
                          cursor: 'pointer'
                        },
                        pressed: {
                          fill: fillColor,
                          stroke: 'hsl(var(--primary))',
                          strokeWidth: 2,
                          outline: 'none',
                          cursor: 'pointer'
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Modal for detailed wilaya information */}
      <WilayaTextsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wilaya={selectedWilaya}
      />
    </div>
  );
};

export default AlgeriaChoroplethRebuild;