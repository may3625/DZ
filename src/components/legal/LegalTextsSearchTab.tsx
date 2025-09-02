
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  History,
  Zap,
  Search
} from "lucide-react";
import { SavedSearchesEnhanced } from "../SavedSearchesEnhanced";
import { LegalTextsSearchHistoryTab } from "./LegalTextsSearchHistoryTab";
import { LegalTextsPopularSearchesTab } from "./LegalTextsPopularSearchesTab";
import { NextGenSearchSection } from "../search/NextGenSearchSection";
import { AdvancedSearchSection } from "@/components/AdvancedSearchSection";

export function LegalTextsSearchTab() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="nextgen" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="advanced" className="text-sm">
            <Search className="w-4 h-4 mr-1" />
            Recherche avancée
          </TabsTrigger>
          <TabsTrigger value="nextgen" className="text-sm">
            <Zap className="w-4 h-4 mr-1" />
            Recherche Nouvelle Génération
          </TabsTrigger>
          <TabsTrigger value="history" className="text-sm">
            Historique des recherches
          </TabsTrigger>
          <TabsTrigger value="saved-searches" className="text-sm">
            Recherches sauvegardées
          </TabsTrigger>
          <TabsTrigger value="popular-searches" className="text-sm">
            Recherches populaires
          </TabsTrigger>
        </TabsList>

        <TabsContent value="advanced" className="mt-6">
          <AdvancedSearchSection />
        </TabsContent>

        <TabsContent value="nextgen" className="mt-6">
          <NextGenSearchSection />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <LegalTextsSearchHistoryTab />
        </TabsContent>
        
        <TabsContent value="saved-searches" className="mt-6">
          <SavedSearchesEnhanced />
        </TabsContent>

        <TabsContent value="popular-searches" className="mt-6">
          <LegalTextsPopularSearchesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
