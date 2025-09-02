import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Home, Download } from 'lucide-react';
import { ALGERIA_58_WILAYAS_REALISTIC_GEOJSON } from '@/data/algeria-58-wilayas-realistic';

interface WilayaData {
  code: string;
  name: string;
  value: number;
  recent: number;
  sectors: number;
}

// Utilisation des données GeoJSON locales pour les contours corrects de l'Algérie

// Données complètes des 58 wilayas d'Algérie avec statistiques réalistes
const WILAYAS_DATA: WilayaData[] = [
  { code: "01", name: "Adrar", value: 75, recent: 12, sectors: 4 },
  { code: "02", name: "Chlef", value: 110, recent: 23, sectors: 6 },
  { code: "03", name: "Laghouat", value: 80, recent: 18, sectors: 5 },
  { code: "04", name: "Oum El Bouaghi", value: 85, recent: 16, sectors: 5 },
  { code: "05", name: "Batna", value: 120, recent: 28, sectors: 7 },
  { code: "06", name: "Béjaïa", value: 120, recent: 26, sectors: 6 },
  { code: "07", name: "Biskra", value: 100, recent: 24, sectors: 6 },
  { code: "08", name: "Béchar", value: 85, recent: 14, sectors: 4 },
  { code: "09", name: "Blida", value: 135, recent: 38, sectors: 7 },
  { code: "10", name: "Bouira", value: 95, recent: 20, sectors: 5 },
  { code: "11", name: "Tamanrasset", value: 60, recent: 12, sectors: 3 },
  { code: "12", name: "Tébessa", value: 90, recent: 22, sectors: 5 },
  { code: "13", name: "Tlemcen", value: 125, recent: 30, sectors: 6 },
  { code: "14", name: "Tiaret", value: 90, recent: 18, sectors: 5 },
  { code: "15", name: "Tizi Ouzou", value: 130, recent: 35, sectors: 7 },
  { code: "16", name: "Alger", value: 220, recent: 70, sectors: 9 },
  { code: "17", name: "Djelfa", value: 85, recent: 20, sectors: 5 },
  { code: "18", name: "Jijel", value: 95, recent: 19, sectors: 5 },
  { code: "19", name: "Sétif", value: 150, recent: 45, sectors: 7 },
  { code: "20", name: "Saïda", value: 80, recent: 14, sectors: 4 },
  { code: "21", name: "Skikda", value: 115, recent: 28, sectors: 6 },
  { code: "22", name: "Sidi Bel Abbès", value: 100, recent: 24, sectors: 6 },
  { code: "23", name: "Annaba", value: 140, recent: 40, sectors: 6 },
  { code: "24", name: "Guelma", value: 80, recent: 16, sectors: 5 },
  { code: "25", name: "Constantine", value: 160, recent: 50, sectors: 7 },
  { code: "26", name: "Médéa", value: 100, recent: 22, sectors: 5 },
  { code: "27", name: "Mostaganem", value: 105, recent: 24, sectors: 6 },
  { code: "28", name: "M'Sila", value: 100, recent: 26, sectors: 6 },
  { code: "29", name: "Mascara", value: 95, recent: 20, sectors: 5 },
  { code: "30", name: "Ouargla", value: 100, recent: 25, sectors: 6 },
  { code: "31", name: "Oran", value: 180, recent: 55, sectors: 8 },
  { code: "32", name: "El Bayadh", value: 60, recent: 12, sectors: 3 },
  { code: "33", name: "Illizi", value: 55, recent: 10, sectors: 3 },
  { code: "34", name: "Bordj Bou Arréridj", value: 90, recent: 22, sectors: 5 },
  { code: "35", name: "Boumerdès", value: 110, recent: 28, sectors: 6 },
  { code: "36", name: "El Tarf", value: 70, recent: 14, sectors: 4 },
  { code: "37", name: "Tindouf", value: 50, recent: 8, sectors: 2 },
  { code: "38", name: "Tissemsilt", value: 60, recent: 12, sectors: 4 },
  { code: "39", name: "El Oued", value: 95, recent: 26, sectors: 6 },
  { code: "40", name: "Khenchela", value: 70, recent: 14, sectors: 4 },
  { code: "41", name: "Souk Ahras", value: 75, recent: 15, sectors: 4 },
  { code: "42", name: "Tipaza", value: 90, recent: 18, sectors: 5 },
  { code: "43", name: "Mila", value: 75, recent: 14, sectors: 4 },
  { code: "44", name: "Aïn Defla", value: 80, recent: 16, sectors: 5 },
  { code: "45", name: "Naâma", value: 50, recent: 9, sectors: 3 },
  { code: "46", name: "Aïn Témouchent", value: 85, recent: 18, sectors: 5 },
  { code: "47", name: "Ghardaïa", value: 90, recent: 20, sectors: 5 },
  { code: "48", name: "Relizane", value: 90, recent: 18, sectors: 5 },
  { code: "49", name: "El M'Ghair", value: 60, recent: 14, sectors: 4 },
  { code: "50", name: "El Meniaa", value: 55, recent: 12, sectors: 4 },
  { code: "51", name: "Ouled Djellal", value: 50, recent: 11, sectors: 3 },
  { code: "52", name: "Bordj Baji Mokhtar", value: 35, recent: 6, sectors: 2 },
  { code: "53", name: "Béni Abbès", value: 40, recent: 7, sectors: 3 },
  { code: "54", name: "Timimoun", value: 45, recent: 8, sectors: 3 },
  { code: "55", name: "Touggourt", value: 65, recent: 16, sectors: 4 },
  { code: "56", name: "Djanet", value: 30, recent: 5, sectors: 2 },
  { code: "57", name: "In Salah", value: 35, recent: 6, sectors: 2 },
  { code: "58", name: "In Guezzam", value: 25, recent: 4, sectors: 2 }
];

const AlgeriaMapChoropleth: React.FC = () => {
  const [mapMode, setMapMode] = useState<'density' | 'recent' | 'sectors'>('density');
  const [hoveredWilaya, setHoveredWilaya] = useState<WilayaData | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<WilayaData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([2, 27]);

  // Calcul de l'échelle de couleurs
  const maxValue = Math.max(...WILAYAS_DATA.map(d => {
    switch (mapMode) {
      case 'recent': return d.recent;
      case 'sectors': return d.sectors;
      default: return d.value;
    }
  }));

  // Éviter les domaines invalides
  const safeMaxValue = Math.max(maxValue, 1);

  const colorScale = scaleLinear<string>()
    .domain([0, safeMaxValue])
    .range(mapMode === 'density' ? 
      ['#e3f2fd', '#0277bd'] : 
      mapMode === 'recent' ? 
      ['#e8f5e8', '#2e7d32'] : 
      ['#fff3e0', '#ef6c00']
    );

  const getWilayaValue = (wilaya: WilayaData) => {
    switch (mapMode) {
      case 'recent': return wilaya.recent;
      case 'sectors': return wilaya.sectors;
      default: return wilaya.value;
    }
  };

  const getWilayaColor = (wilayaCode: string) => {
    const wilaya = WILAYAS_DATA.find(w => w.code === wilayaCode || w.code === wilayaCode.padStart(2, '0'));
    if (!wilaya) return '#f5f5f5';
    return colorScale(getWilayaValue(wilaya));
  };

  const handleZoomIn = () => {
    if (zoom < 4) setZoom(zoom + 0.5);
  };

  const handleZoomOut = () => {
    if (zoom > 1) setZoom(zoom - 0.5);
  };

  const resetView = () => {
    setZoom(1);
    setCenter([2, 27]);
  };

  return (
    <div className="w-full space-y-4">
      {/* Contrôles */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-background border rounded-lg">
        <div className="flex items-center gap-4">
          <select 
            value={mapMode} 
            onChange={(e) => setMapMode(e.target.value as any)}
            className="w-[200px] px-3 py-2 border rounded-md bg-background text-foreground"
          >
            <option value="density">Densité des textes</option>
            <option value="recent">Textes récents</option>
            <option value="sectors">Diversité sectorielle</option>
          </select>
          
          <Badge variant="outline">
            {WILAYAS_DATA.length} wilayas
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomIn}
            title="Zoomer"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomOut}
            title="Dézoomer"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetView}
            title="Vue d'ensemble"
          >
            <Home className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Info wilaya survolée */}
      {hoveredWilaya && (
        <div className="fixed top-4 right-4 bg-popover text-popover-foreground p-3 rounded-md shadow-lg border z-50">
          <div className="text-sm">
            <div className="font-semibold">{hoveredWilaya.name} ({hoveredWilaya.code})</div>
            <div>Textes: {hoveredWilaya.value}</div>
            <div>Récents: {hoveredWilaya.recent}</div>
            <div>Secteurs: {hoveredWilaya.sectors}</div>
          </div>
        </div>
      )}

      {/* Carte horizontale avec vraies formes géographiques */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-0 relative">
            <div className="h-[600px] w-full relative">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 600,
                  center: [2, 27]
                }}
                width={1000}
                height={600}
                className="w-full h-full"
              >
                <ZoomableGroup zoom={zoom} center={center}>
                  <Geographies geography={ALGERIA_58_WILAYAS_REALISTIC_GEOJSON}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const wilayaCode = geo.properties.code;
                        const wilaya = WILAYAS_DATA.find(w => w.code === wilayaCode);
                        
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={getWilayaColor(wilayaCode)}
                            stroke="hsl(var(--border))"
                            strokeWidth={0.8}
                            className="cursor-pointer transition-all duration-300 hover:brightness-110"
                            onMouseEnter={() => wilaya && setHoveredWilaya(wilaya)}
                            onMouseLeave={() => setHoveredWilaya(null)}
                            onClick={() => wilaya && setSelectedWilaya(wilaya)}
                            style={{
                              default: {
                                outline: 'none',
                              },
                              hover: {
                                outline: 'none',
                                stroke: 'hsl(var(--primary))',
                                strokeWidth: 2,
                              },
                              pressed: {
                                outline: 'none',
                              },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
            </div>
          </CardContent>
        </Card>

        {/* Légende horizontale */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                {mapMode === 'density' ? 'Densité des textes' :
                 mapMode === 'recent' ? 'Textes récents' : 'Diversité sectorielle'}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Faible</span>
                  <div className="flex">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className="w-6 h-4 border-r border-white/20 last:border-r-0"
                        style={{
                          backgroundColor: maxValue > 0 ? colorScale(i * (maxValue / 9)) : '#f5f5f5'
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">Élevée</span>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Max: {maxValue} {mapMode === 'density' ? 'textes' : mapMode === 'recent' ? 'récents' : 'secteurs'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails wilaya sélectionnée */}
      {selectedWilaya && (
        <Card>
          <CardHeader>
            <CardTitle>Détails - {selectedWilaya.name} ({selectedWilaya.code})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{selectedWilaya.value}</div>
                <div className="text-sm text-muted-foreground">Textes total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{selectedWilaya.recent}</div>
                <div className="text-sm text-muted-foreground">Textes récents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{selectedWilaya.sectors}</div>
                <div className="text-sm text-muted-foreground">Secteurs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AlgeriaMapChoropleth;