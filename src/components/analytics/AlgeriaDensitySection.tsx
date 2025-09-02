import React from 'react';
import { UnifiedSectionHeader } from '@/components/common/UnifiedSectionHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Map } from 'lucide-react';
import AlgeriaMapChoropleth from '@/components/analytics/AlgeriaMapChoropleth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TrendsCharts from '@/components/analytics/TrendsCharts';
import TimelineBreadcrumbs from '@/components/analytics/TimelineBreadcrumbs';
import PredictiveCalendar from '@/components/analytics/PredictiveCalendar';

export function AlgeriaDensitySection() {
  return (
    <div className="space-y-6">
      <UnifiedSectionHeader
        icon={Map}
        title="Carte Algérie — Densité par wilaya"
        description="Carte choroplèthe interactive des 58 wilayas avec statistiques détaillées et modes d'affichage multiples."
        iconColor="text-green-700"
      />
      <Tabs defaultValue="map" className="w-full">
        <TabsList>
          <TabsTrigger value="map">Carte Choroplèthe (58 wilayas)</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="timeline">Timeline & Breadcrumbs</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier prédictif</TabsTrigger>
        </TabsList>
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Densité des textes par wilaya</CardTitle>
              <CardDescription>
                Carte interactive professionnelle avec 3 modes d'affichage : densité des textes, textes récents, et diversité sectorielle.
                Cliquez sur une wilaya pour voir les détails.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Nouvelle carte choroplèthe avec les 58 wilayas et contours corrects */}
              <AlgeriaMapChoropleth />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Tendances réglementaires</CardTitle>
              <CardDescription>Graphiques alimentés par des vues SQL (fallback si vues absentes).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <label className="text-sm">Période:</label>
                <select className="bg-background text-foreground border rounded px-2 py-1">
                  <option>12 derniers mois</option>
                  <option>24 derniers mois</option>
                  <option>Depuis 2010</option>
                </select>
                <div className="ml-auto flex items-center gap-2">
                  <button className="border rounded px-2 py-1 hover:bg-muted transition">Exporter PNG</button>
                </div>
              </div>
              <TrendsCharts />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Timeline d'évolution & Breadcrumbs</CardTitle>
              <CardDescription>Versions et relations sémantiques entre textes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <label className="text-sm">Filtre:</label>
                <select className="bg-background text-foreground border rounded px-2 py-1">
                  <option>Toutes les relations</option>
                  <option>Modifie</option>
                  <option>Abroge</option>
                  <option>Complète</option>
                </select>
              </div>
              <TimelineBreadcrumbs />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendrier prédictif (v1)</CardTitle>
              <CardDescription>Échéances estimées détectées par heuristiques.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <label className="text-sm inline-flex items-center gap-2">
                  <input type="checkbox" className="accent-[hsl(var(--primary))]" />
                  Afficher les week-ends
                </label>
                <label className="text-sm inline-flex items-center gap-2">
                  <input type="checkbox" className="accent-[hsl(var(--primary))]" defaultChecked />
                  Mettre en évidence les échéances proches
                </label>
              </div>
              <PredictiveCalendar />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}