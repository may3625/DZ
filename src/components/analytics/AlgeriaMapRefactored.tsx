import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { geoBounds, geoMercator, geoPath, geoCentroid } from 'd3-geo';
import type { ReactNode } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Home, Info } from 'lucide-react';
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

// GeoJSON local (simplifié) – unique source utilisée pour contours et polygones
import { ALGERIA_SIMPLE_GEOJSON } from '@/data/algeria-wilayas-simple';
// import algeria58WilayasReal from '@/data/algeria-58-wilayas-geojson.json';
const wilayasBoundariesUrl = `/algeria-wilayas-simplified.geo.json`;

const AlgeriaMapRefactored: React.FC = () => {
  const { toast } = useToast();
  const [wilayasData, setWilayasData] = useState<WilayaStats[]>([]);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([2.6, 27.5]);
  const [hovered, setHovered] = useState<HoveredWilaya | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWilaya, setSelectedWilaya] = useState<{ code: string; name: string; arName?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [disablePolygons, setDisablePolygons] = useState(false);
  const [wilayasGeojson, setWilayasGeojson] = useState<any | null>(null);
  const [autoCenter, setAutoCenter] = useState<[number, number]>([2.6, 27.5]);
  const [autoScale, setAutoScale] = useState<number>(1000);

  // Container responsive avec aspect ratio fixe vertical (prend toute la hauteur du rectangle)
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 1000 });

  // Mesure du conteneur - optimisé pour layout vertical
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const updateDimensions = () => {
      const rect = el.getBoundingClientRect();
      const width = Math.max(400, rect.width);
      const height = Math.max(500, rect.height);
      setDimensions({ width, height });
    };

    const ro = new ResizeObserver(updateDimensions);
    ro.observe(el);
    updateDimensions();
    
    return () => ro.disconnect();
  }, []);

  // Charger le GeoJSON local de manière explicite (évite tout souci de chemin)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(wilayasBoundariesUrl, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setWilayasGeojson(json);
      } catch (e) {
        console.error('Erreur chargement GeoJSON wilayas:', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Calcul auto du center/scale en fonction du GeoJSON et des dimensions
  useEffect(() => {
    if (!wilayasGeojson) return;
    try {
      const centroid = geoCentroid(wilayasGeojson) as [number, number];
      const projection = geoMercator()
        .center(centroid)
        .fitSize([dimensions.width, dimensions.height], wilayasGeojson as any);
      setAutoCenter(centroid);
      setAutoScale(Math.max(200, Math.min(8000, projection.scale() * 0.95)));
    } catch (e) {
      console.warn('Auto-fit projection failed, using defaults', e);
      setAutoCenter([2.6, 27.5]);
      setAutoScale(Math.max(800, Math.min(2000, Math.max(dimensions.width, dimensions.height))));
    }
  }, [wilayasGeojson, dimensions.width, dimensions.height]);

  // Charger les statistiques des wilayas depuis Supabase
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
          console.error('Erreur lors du chargement des statistiques:', error);
          toast({
            title: 'Erreur de chargement',
            description: 'Impossible de charger les statistiques des wilayas.',
            variant: 'destructive'
          });
          
          // Données de démonstration
          const demoData: WilayaStats[] = Array.from({ length: 58 }, (_, i) => {
            const code = String(i + 1).padStart(2, '0');
            return {
              code,
              name: `Wilaya ${code}`,
              total_texts: Math.floor(Math.random() * 100),
              recent_texts: Math.floor(Math.random() * 20),
              sectors_count: Math.floor(Math.random() * 8),
            };
          });
          setWilayasData(demoData);
          return;
        }

        if (data && Array.isArray(data)) {
          setWilayasData(data);
        } else {
          setWilayasData([]);
        }

      } catch (err) {
        if (!cancelled) {
          console.error('Erreur de connexion:', err);
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

  // Calculer les statistiques pour l'échelle de couleurs
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

  // Normalisation des noms pour matching
  const normalizeName = useCallback((name?: string): string => {
    if (!name) return '';
    
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer diacritiques
      .replace(/[-_]/g, ' ')
      .replace(/[^a-z\s']/g, '')
      .replace(/\b(wilaya|province|daira)\s+(de|d'|du|)\s*/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\bel\b/g, 'al')
      .replace(/\boum\b/g, 'um')
      .replace(/\bain\b/g, 'ayn');
  }, []);

  // Algorithme de matching des wilayas amélioré
  const findWilayaByProps = useCallback((props: any): WilayaStats | null => {
    if (!props || wilayasData.length === 0) return null;

    // Priorité 1: Matching par code direct
    const codeFields = [
      props.code, props.id, props.wilaya_code, props.shapeISO, 
      props.HASC_1, props.CODE_1, props.ID_1, props.shapeID,
      props.ADM1_CODE, props.ISO_3166_2
    ];

    for (const field of codeFields) {
      if (!field) continue;
      
      const codeStr = String(field).trim();
      
      // Match direct
      const directMatch = wilayasData.find(w => w.code === codeStr);
      if (directMatch) return directMatch;
      
      // Extraction numérique + padding
      const numericMatch = codeStr.match(/(\d{1,2})/);
      if (numericMatch) {
        const paddedCode = numericMatch[1].padStart(2, '0');
        const codeMatch = wilayasData.find(w => w.code === paddedCode);
        if (codeMatch) return codeMatch;
      }
    }

    // Priorité 2: Matching par nom
    const nameFields = [
      props.name, props.shapeName, props.NAME_1, props.NAME, 
      props.NAME_ENG, props.wilaya_name, props.ADM1_FR, props.ADM1_AR, props.name_ar
    ].filter(Boolean);

    for (const nameField of nameFields) {
      const normalizedInput = normalizeName(nameField);
      if (!normalizedInput) continue;

      // Match exact normalisé
      const exactMatch = wilayasData.find(w => 
        normalizeName(w.name) === normalizedInput
      );
      if (exactMatch) return exactMatch;

      // Match partiel
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

  // Calcul des couleurs choroplèthes
  const getWilayaColor = useCallback((totalTexts: number): string => {
    if (totalTexts === 0) return 'hsl(var(--muted))';
    if (colorStats.max === 0) return 'hsl(var(--muted))';
    
    const ratio = Math.min(1, totalTexts / colorStats.max);
    
    // Échelle de couleurs sophistiquée
    if (ratio < 0.2) {
      const opacity = 0.2 + (ratio * 0.3);
      return `hsl(var(--primary) / ${opacity})`;
    } else if (ratio < 0.5) {
      const opacity = 0.5 + (ratio * 0.3);
      return `hsl(var(--primary) / ${opacity})`;
    } else if (ratio < 0.8) {
      const opacity = 0.8 + (ratio * 0.15);
      return `hsl(var(--primary) / ${opacity})`;
    } else {
      return `hsl(var(--primary) / 0.95)`;
    }
  }, [colorStats.max]);

  // Handler de survol avec debouncing
  const handleWilayaHover = useCallback((geo: any) => {
    const props = geo?.properties || {};
    const wilaya = findWilayaByProps(props);
    
    if (wilaya) {
      setHovered({
        name: wilaya.name,
        arName: wilaya.ar_name,
        code: wilaya.code,
        total: wilaya.total_texts,
        recent: wilaya.recent_texts,
        sectors: wilaya.sectors_count
      });
      setShowTooltip(true);
    } else {
      const displayName = props.name || props.shapeName || props.NAME_1 || 'Wilaya inconnue';
      setHovered({
        name: displayName,
        code: '',
        total: 0,
        recent: 0,
        sectors: 0
      });
      setShowTooltip(true);
    }
  }, [findWilayaByProps]);

  // Handler de sortie de survol
  const handleWilayaLeave = useCallback(() => {
    setShowTooltip(false);
    setTimeout(() => setHovered(null), 150);
  }, []);

  // Handler de clic
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

  // Contrôles de navigation
  const handleZoomIn = useCallback(() => {
    setZoom(z => Math.min(8, z * 1.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(z => Math.max(1, z / 1.5));
  }, []);

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

  // Sanitize: ferme les anneaux et supprime ceux invalides
  const sanitizeGeo = (g: any): any | null => {
    if (!g?.geometry) return null;
    const geom = g.geometry;

    const isPair = (pt: any) => Array.isArray(pt) && Number.isFinite(pt[0]) && Number.isFinite(pt[1]);
    const closeRing = (ring: any[]) => {
      if (!Array.isArray(ring) || ring.length < 4) return null;
      const [sx, sy] = ring[0] || [];
      const [ex, ey] = ring[ring.length - 1] || [];
      if (!isPair([sx, sy]) || !isPair([ex, ey])) return null;
      if (sx !== ex || sy !== ey) return [...ring, ring[0]];
      return ring;
    };

    if (geom.type === 'Polygon') {
      const rings = (geom.coordinates || [])
        .map((r: any) => closeRing(r))
        .filter((r: any) => Array.isArray(r) && r.length >= 4);
      if (!rings.length) return null;
      return { ...g, geometry: { type: 'Polygon', coordinates: rings } };
    }
    if (geom.type === 'MultiPolygon') {
      const polys = (geom.coordinates || [])
        .map((poly: any) => {
          const rings = Array.isArray(poly) ? poly.map((r: any) => closeRing(r)).filter((r: any) => Array.isArray(r) && r.length >= 4) : [];
          return rings.length ? rings : null;
        })
        .filter(Boolean);
      if (!polys.length) return null;
      return { ...g, geometry: { type: 'MultiPolygon', coordinates: polys } };
    }
    return g;
  };

  // Error boundary pour neutraliser les erreurs de rendu des polygones
  class MapErrorBoundary extends React.Component<{ onError: () => void; children: ReactNode }, { hasError: boolean }> {
    constructor(props: { onError: () => void; children: ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: any) { try { this.props.onError?.(); } catch (e) { console.warn('MapErrorBoundary suppressed error', error, e); } }
    render() { return this.state.hasError ? null : (this.props.children as any); }
  }

  if (loading) {
    return (
      <div className="w-full aspect-[4/5] flex items-center justify-center rounded-lg border bg-muted/20">
        <div className="text-center">
          <p className="text-lg font-semibold">Chargement de la carte</p>
          <p className="text-sm text-muted-foreground">Préparation de l'affichage des wilayas…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="relative w-full aspect-[4/5] min-h-[480px] overflow-hidden rounded-md border">
        <div className="absolute z-10 top-2 left-2 flex gap-2">
          <Button size="icon" variant="outline" onClick={() => setZoom((z) => Math.min(8, z * 1.25))} aria-label="Zoomer"><ZoomIn className="w-4 h-4" /></Button>
          <Button size="icon" variant="outline" onClick={() => setZoom((z) => Math.max(1, z / 1.25))} aria-label="Dézoomer"><ZoomOut className="w-4 h-4" /></Button>
          <Button size="icon" variant="outline" onClick={() => { setZoom(1); setCenter([2.6, 27.5]); }} aria-label="Réinitialiser"><Home className="w-4 h-4" /></Button>
        </div>
        <ComposableMap 
          width={dimensions.width} 
          height={dimensions.height} 
          projection="geoMercator"
          projectionConfig={{ center: autoCenter, scale: autoScale }}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={autoCenter}
            minZoom={1}
            maxZoom={8}
            onMoveEnd={({ zoom: newZoom, coordinates }) => { setZoom(newZoom); setCenter(coordinates as [number, number]); }}
          >
            {/* Wilayas protégées par ErrorBoundary (désactivables) */}
            {!disablePolygons && (
              <MapErrorBoundary onError={() => setDisablePolygons(true)}>
                <Geographies geography={wilayasGeojson || ALGERIA_SIMPLE_GEOJSON} key="wilayas-boundaries">
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const safe = sanitizeGeo(geo);
                      if (!safe) return null;
                      const wilaya = findWilayaByProps(safe.properties);
                      const fillColor = wilaya ? getWilayaColor(wilaya.total_texts) : 'hsl(var(--muted))';
                      return (
                        <Geography
                          key={`wilaya-${safe.rsmKey || Math.random()}`}
                          geography={safe}
                          onMouseEnter={() => handleWilayaHover(safe)}
                          onMouseLeave={handleWilayaLeave}
                          onClick={() => handleWilayaClick(safe)}
                          style={{
                            default: { fill: fillColor, stroke: 'hsl(var(--foreground) / 0.4)', strokeWidth: 1, outline: 'none', cursor: 'pointer', transition: 'all 0.2s ease-in-out' },
                            hover: { fill: 'hsl(var(--primary) / 0.7)', stroke: 'hsl(var(--primary))', strokeWidth: 1.3, outline: 'none' },
                            pressed: { fill: 'hsl(var(--primary) / 0.9)', outline: 'none', cursor: 'pointer' }
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </MapErrorBoundary>
            )}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Info bandeau */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="w-4 h-4" />
        <span>Zoom: x{zoom.toFixed(2)} • Polygones {disablePolygons ? 'désactivés' : 'actifs'}</span>
      </div>

      {hovered && (
        <div className="text-sm">
          Wilaya: <strong>{hovered.name}</strong>{hovered.arName ? ` • ${hovered.arName}` : ''}{hovered.code ? ` • Code: ${hovered.code}` : ''} {typeof hovered.total === 'number' ? `• ${hovered.total} textes` : ''}
        </div>
      )}

      <WilayaTextsModal open={modalOpen} onClose={() => setModalOpen(false)} wilaya={selectedWilaya} />
    </div>
  );
};

export default AlgeriaMapRefactored;