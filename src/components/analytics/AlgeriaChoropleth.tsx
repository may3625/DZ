import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { geoCentroid } from 'd3-geo';

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WilayaTextsModal from './WilayaTextsModal';

interface WilayaPoint {
  id: string;
  code: string; // numeric string 1..58
  name: string;
  ar_name?: string;
  latitude: string; // provided as string in file
  longitude: string; // provided as string in file
}

interface WilayaCount { code: string; total: number }

const GEO_V = 'lyo-fix3';
const worldTopoUrl = `/world-110m.json?v=${GEO_V}`;
const countryOutlineUrl = `/algeria-country.geo.json?v=${GEO_V}`;
const wilayasCentroidsUrl = `/algeria-wilayas.geo.json?v=${GEO_V}`;
// Optionnel: limites internes des 58 wilayas (GeoJSON/TopoJSON FeatureCollection de polygons)
// Placez un fichier à l'un de ces emplacements pour activer l'affichage des limites internes.
const wilayasBoundariesCandidates = [
  `/algeria-wilayas.geo.json?v=${GEO_V}`,
  `/algeria-wilayas-boundaries.json?v=${GEO_V}`,
  `/algeria-wilayas-boundaries.geo.json?v=${GEO_V}`
];

const AlgeriaChoropleth: React.FC = () => {
  const { toast } = useToast();
  const [wilayas, setWilayas] = useState<WilayaPoint[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [boundariesSource, setBoundariesSource] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([2.6, 27.5]);
  const [topN, setTopN] = useState<number>(0);
  const topSet = useMemo(() => {
    if (!topN) return null as Set<string> | null;
    return new Set(
      Object.entries(counts)
        .sort((a, b) => (b[1] || 0) - (a[1] || 0))
        .slice(0, topN)
        .map(([code]) => String(code))
    );
  }, [counts, topN]);
  const [hovered, setHovered] = useState<{ name: string; arName?: string; code?: string; total?: number } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWilaya, setSelectedWilaya] = useState<{ code: string; name: string; arName?: string } | null>(null);

  // Mesure du conteneur pour adapter la carte automatiquement
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setWidth(Math.max(560, Math.floor(cr.width)));
        setHeight(Math.max(480, Math.floor(cr.height)));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const getLatLng = (w: WilayaPoint): [number, number] => {
    let lat = parseFloat(w.latitude as any);
    let lng = parseFloat(w.longitude as any);
    const looksWrong = lat < 18 || lat > 38 || lng < -10 || lng > 13;
    if (looksWrong) {
      const swappedLat = parseFloat(w.longitude as any);
      const swappedLng = parseFloat(w.latitude as any);
      const swappedOk = swappedLat >= 18 && swappedLat <= 38 && swappedLng >= -10 && swappedLng <= 13;
      if (swappedOk) { lat = swappedLat; lng = swappedLng; }
    }
    return [lng, lat];
  };

  // Normalisation des noms pour matcher par libellé plutôt que par centroïde
  const normalizeName = (s?: string) => {
    const base = (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // accents
      .replace(/-/g, ' ')
      .replace(/[^a-z\u0600-\u06FF\s']/g, '') // garder l'apostrophe pour d'
      .replace(/\b(wilaya|province)\s+(de|d')\s+/g, '') // retirer préfixes
      .replace(/\s+/g, ' ')
      .trim();
    return base.replace(/\b(el)\s+/g, 'al '); // unifier el/al
  };

  const findWilayaByProps = (props: any, fallbackName?: string): WilayaPoint | null => {
    // 0) Tentative par code ISO/HASC/etc.
    const rawCodes: Array<string | number | undefined> = [
      props?.shapeISO,
      props?.HASC_1,
      props?.CODE_1,
      props?.ID_1,
      props?.shapeID,
      props?.code,
      props?.id,
    ];
    for (const c of rawCodes) {
      if (c == null) continue;
      const s = String(c);
      // Cherche un code numérique à 1-2 chiffres, ex: DZ-01, DZ-1
      const m = s.match(/(\d{1,2})(?!\d)/);
      if (m) {
        const padded = m[1].padStart(2, '0');
        const byCode = wilayas.find((w) => w.code === padded);
        if (byCode) return byCode;
      }
    }

    const candidates: string[] = [
      props?.shapeName,
      props?.NAME_1,
      props?.NAME,
      props?.NAME_ENG,
      props?.name,
      fallbackName,
    ].filter(Boolean);
    const normalized = candidates.map((c) => normalizeName(c));

    // 1) Match exact par nom
    let found = wilayas.find((w) => normalized.includes(normalizeName(w.name)));

    // 2) Fuzzy: inclusions (gère variantes "El/Al", tirets, etc.)
    if (!found) {
      found = wilayas.find((w) => {
        const nw = normalizeName(w.name);
        return normalized.some((c) => c.includes(nw) || nw.includes(c));
      }) || null;
    }
    return found || null;
  };

  const findNearestWilaya = (lng: number, lat: number): WilayaPoint | null => {
    let nearest: WilayaPoint | null = null;
    let best = Infinity;
    for (const w of wilayas) {
      const [wLng, wLat] = getLatLng(w);
      const d = (wLat - lat) * (wLat - lat) + (wLng - lng) * (wLng - lng);
      if (d < best) { best = d; nearest = w; }
    }
    return nearest;
  };


  useEffect(() => {
    // Load local wilayas centroids
    fetch(wilayasCentroidsUrl)
      .then(r => r.json())
      .then((data: WilayaPoint[]) => setWilayas(data))
      .catch(() => {
        toast({ title: 'Erreur chargement wilayas', description: 'Impossible de charger le GeoJSON local.', variant: 'destructive' });
      });
  }, [toast]);

  useEffect(() => {
    // Détecter un fichier de frontières interne en vérifiant qu'il s'agit bien de JSON
    (async () => {
      for (const candidate of wilayasBoundariesCandidates) {
        try {
          const res = await fetch(candidate, { headers: { Accept: 'application/json' } });
          if (!res.ok) continue;
          const text = await res.text();
          const first = text.trim()[0];
          if (first === '{' || first === '[') {
            setBoundariesSource(candidate);
            break;
          }
        } catch {
          // ignore
        }
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Try view: vw_texts_by_wilaya (expects fields: wilaya_code, total)
      const { data, error } = await supabase.from('v_legal_texts_by_wilaya' as any).select('*');
      if (!cancelled && data && !error) {
        const map: Record<string, number> = {};
        data.forEach((row: any) => {
          const code = String(row.wilaya_code ?? row.code ?? row.id ?? '');
          const total = Number(row.total ?? row.count ?? 0);
          if (code) map[code] = total;
        });
        setCounts(map);
      } else if (!cancelled) {
        // Fallback deterministic demo values
        const map: Record<string, number> = {};
        wilayas.forEach((w) => {
          const seed = parseInt(w.code, 10);
          map[w.code] = (seed * 13) % 120; // 0..119
        });
        setCounts(map);
        toast({ title: 'Fallback activé', description: 'Vues SQL introuvables, affichage avec données de démonstration.' });
      }
    })();
    return () => { cancelled = true; };
  }, [wilayas, toast]);

  const maxValue = useMemo(() => {
    return Object.values(counts).reduce((m, v) => Math.max(m, v || 0), 0) || 1;
  }, [counts]);

  const radiusFor = (value: number) => {
    const minR = 2;
    const maxR = 12;
    const v = Math.max(0, Math.min(1, value / maxValue));
    return minR + v * (maxR - minR);
  };

  // Validation robuste des géométries GeoJSON pour éviter les erreurs de rendu
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

  return (
    <div className="w-full">
      <div ref={containerRef} className="relative w-full aspect-[3/4] sm:aspect-[4/3] lg:aspect-[16/10] max-h-[90vh] min-h-[480px] rounded-md border overflow-hidden">
        <div className="absolute z-10 top-2 left-2 flex flex-col gap-1">
          <button
            className="bg-primary text-primary-foreground rounded px-2 py-1 shadow hover:opacity-90 transition"
            aria-label="Zoomer"
            onClick={() => setZoom((z) => Math.min(8, z * 1.25))}
          >+
          </button>
          <button
            className="bg-primary text-primary-foreground rounded px-2 py-1 shadow hover:opacity-90 transition"
            aria-label="Dézoomer"
            onClick={() => setZoom((z) => Math.max(1, z / 1.25))}
          >-
          </button>
          <button
            className="bg-muted text-foreground rounded px-2 py-1 shadow hover:opacity-90 transition"
            aria-label="Réinitialiser"
            onClick={() => { setZoom(1); setCenter([2.6, 27.5]); }}
          >Reset
          </button>
        </div>
        {hovered && (
          <div className="absolute z-10 top-2 right-2 rounded-md border bg-background/80 backdrop-blur px-3 py-2 shadow">
            <button
              className="font-medium text-foreground underline-offset-2 hover:underline text-left"
              onClick={() => {
                if (hovered?.code) {
                  const nearest = wilayas.find(w => w.code === hovered.code);
                  setSelectedWilaya({ code: hovered.code!, name: nearest?.name || hovered.name, arName: nearest?.ar_name });
                  setModalOpen(true);
                }
              }}
            >
              {hovered.name}{hovered.arName ? ` • ${hovered.arName}` : ''}
            </button>
            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                {hovered.code ? `Code: ${hovered.code} • ` : ''}{typeof hovered.total === 'number' ? `${hovered.total} textes` : ''}
              </div>
              {hovered.code && (
                <button
                  className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:opacity-90"
                  onClick={() => {
                    const nearest = wilayas.find(w => w.code === hovered.code);
                    setSelectedWilaya({ code: hovered.code!, name: nearest?.name || hovered.name, arName: nearest?.ar_name });
                    setModalOpen(true);
                  }}
                >
                  Voir détails
                </button>
              )}
            </div>
          </div>
        )}
        <ComposableMap width={width} height={height} projectionConfig={{ scale: 1000 }} className="w-full h-full">
          <ZoomableGroup zoom={zoom} center={center} minZoom={1} maxZoom={8} onMoveEnd={({ zoom, coordinates }) => { setZoom(zoom); setCenter(coordinates as [number, number]); }}>
            {/* Fond: contour du pays (limite externe) */}
            <Geographies geography={countryOutlineUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { fill: 'transparent', stroke: 'hsl(var(--foreground) / 0.5)', strokeWidth: 1.2, outline: 'none' },
                      hover: { fill: 'transparent', stroke: 'hsl(var(--foreground))', strokeWidth: 1.4, outline: 'none' },
                      pressed: { fill: 'transparent', outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Limites internes des wilayas (si fichier présent) */}
            {boundariesSource && (
              <Geographies geography={boundariesSource}>
                {({ geographies }) =>
                  geographies.filter(isValidGeo).map((geo) => {
                    const props = (geo as any).properties || {};
                    const displayName = props.shapeName || props.NAME_1 || props.name || props.NAME_ENG || props.NAME || 'Wilaya';
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => {
                          const props = (geo as any).properties || {};
                          const displayName = props.shapeName || props.NAME_1 || props.name || props.NAME_ENG || props.NAME || 'Wilaya';
                          const match = findWilayaByProps(props, displayName);
                          if (match) {
                            const total = counts[match.code] || 0;
                            setHovered({ name: match.name, arName: match.ar_name, code: match.code, total });
                          } else {
                            try {
                              const [lng, lat] = geoCentroid(geo as any) as [number, number];
                              const nearest = findNearestWilaya(lng, lat);
                              if (nearest) {
                                const total = counts[nearest.code] || 0;
                                setHovered({ name: displayName || nearest.name, arName: nearest.ar_name, code: nearest.code, total });
                              } else {
                                setHovered({ name: displayName });
                              }
                            } catch {
                              setHovered({ name: displayName });
                            }
                          }
                        }}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => {
                          const props = (geo as any).properties || {};
                          const displayName = props.shapeName || props.NAME_1 || props.name || props.NAME_ENG || props.NAME || 'Wilaya';
                          const match = findWilayaByProps(props, displayName);
                          if (match) {
                            setSelectedWilaya({ code: match.code, name: match.name, arName: match.ar_name });
                            setModalOpen(true);
                          } else {
                            try {
                              const [lng, lat] = geoCentroid(geo as any) as [number, number];
                              const nearest = findNearestWilaya(lng, lat);
                              if (nearest) {
                                setSelectedWilaya({ code: nearest.code, name: nearest.name, arName: nearest.ar_name });
                                setModalOpen(true);
                              }
                            } catch { /* noop */ }
                          }
                        }}
                        style={{
                          default: { fill: 'hsl(var(--muted))', stroke: 'hsl(var(--foreground) / 0.4)', strokeWidth: 0.8, outline: 'none', cursor: 'pointer' },
                          hover: { fill: 'hsl(var(--accent) / 0.12)', stroke: 'hsl(var(--accent))', strokeWidth: 1, outline: 'none', cursor: 'pointer' },
                          pressed: { fill: 'hsl(var(--accent) / 0.2)', outline: 'none', cursor: 'pointer' },
                        }}
                      >
                        <title>{displayName}</title>
                      </Geography>
                    );
                  })
                }
              </Geographies>
            )}

            {/* Points/cercles de densité par wilaya (centroïdes) */}
            {wilayas.map((w) => {
              let lat = parseFloat(w.latitude as any);
              let lng = parseFloat(w.longitude as any);
              // Auto-correct if dataset swapped keys (common in some sources)
              const looksWrong = lat < 18 || lat > 38 || lng < -10 || lng > 13;
              if (looksWrong) {
                const swappedLat = parseFloat(w.longitude as any);
                const swappedLng = parseFloat(w.latitude as any);
                const swappedOk = swappedLat >= 18 && swappedLat <= 38 && swappedLng >= -10 && swappedLng <= 13;
                if (swappedOk) { lat = swappedLat; lng = swappedLng; }
              }
              const value = counts[w.code] || 0;
              const r = radiusFor(value);
              return (
                <Marker key={w.code} coordinates={[lng, lat]}>
                  <circle
                    r={r}
                    fill="hsl(var(--primary))"
                    fillOpacity={(topSet && !topSet.has(w.code) ? 0.2 : 0.35) + Math.min(0.6, value / (maxValue || 1))}
                    stroke="hsl(var(--primary))"
                    strokeOpacity={0.6}
                    pointerEvents="none"
                  >
                    <title>{`${w.name} • ${value} textes`}</title>
                  </circle>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{ background: 'hsl(var(--primary))', opacity: 0.35 }} /> Faible</div>
          <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{ background: 'hsl(var(--primary))', opacity: 0.55 }} /> Moyen</div>
          <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{ background: 'hsl(var(--primary))', opacity: 0.75 }} /> Élevé</div>
          <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{ background: 'hsl(var(--primary))', opacity: 0.95 }} /> Très élevé</div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="topN" className="text-xs">Mettre en avant</label>
          <select id="topN" className="bg-background text-foreground border rounded px-2 py-1" value={topN} onChange={(e) => setTopN(Number(e.target.value))}>
            <option value={0}>Toutes</option>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
          </select>
          <span className="text-xs">wilayas</span>
        </div>
      </div>

      {!boundariesSource && (
        <p className="mt-2 text-xs text-muted-foreground">
          Limites internes des 58 wilayas non trouvées. Pour activer l'affichage des frontières, ajoutez un fichier GeoJSON/TopoJSON dans le dossier public sous l'un des noms suivants: 
          <code className="ml-1">algeria-wilayas-boundaries.json</code>, <code className="ml-1">dza-adm1.json</code> ou <code className="ml-1">algeria-wilayas-boundaries.geo.json</code>.
        </p>
      )}

      <WilayaTextsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wilaya={selectedWilaya}
      />
    </div>
  );
};

export default AlgeriaChoropleth;
