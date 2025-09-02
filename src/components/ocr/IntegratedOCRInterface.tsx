/**
 * Interface OCR Intégrée - Composant Principal
 * Combine l'interface utilisateur (6 onglets) et la configuration (4 onglets)
 * Séparation claire entre Utilisation et Configuration
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Settings, 
  Users, 
  Activity,
  Zap,
  Shield,
  ArrowRight,
  ArrowLeft,
  Home,
  Info,
  CheckCircle
} from "lucide-react";

// Import des interfaces unifiées
import { UnifiedOCRInterface } from './UnifiedOCRInterface';
import { UnifiedOCRConfiguration } from '../configuration/UnifiedOCRConfiguration';

interface IntegratedOCRInterfaceProps {
  language?: string;
}

export const IntegratedOCRInterface: React.FC<IntegratedOCRInterfaceProps> = ({
  language = "fr"
}) => {
  const [activeMainTab, setActiveMainTab] = useState('usage');
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="space-y-6">
      {/* En-tête principal avec navigation */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-800">
                  Interface OCR-IA Intégrée
                </CardTitle>
                <CardDescription className="text-blue-700">
                  🇩🇿 Système Unifié de Traitement de Documents Juridiques Algériens
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInfo(!showInfo)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Info className="w-4 h-4 mr-2" />
                Info
              </Button>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                ✅ Consolidation Terminée
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        {showInfo && (
          <CardContent className="pt-0">
            <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Architecture Consolidée</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <div className="font-medium">📱 Interface Utilisateur (OCR-IA)</div>
                  <div className="text-xs space-y-1">
                    <div>• 6 onglets consolidés</div>
                    <div>• Extraction, Mapping, Validation</div>
                    <div>• Algorithmes avancés, Diagnostic</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium">⚙️ Configuration (Intégrations)</div>
                  <div className="text-xs space-y-1">
                    <div>• 4 onglets d'administration</div>
                    <div>• Paramètres, Workflow, Performance</div>
                    <div>• Administration & Maintenance</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-blue-600">
                <strong>Fonctionnalités préservées :</strong> Traitement par Lot, Fil d'Approbation, 
                Analytics, Diagnostic, Workflow d'Alimentation, 🇩🇿 Algorithme d'Extraction
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Navigation principale */}
      <Card>
        <CardContent className="p-4">
          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="usage" className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                📱 Interface Utilisateur (OCR-IA)
                <Badge variant="outline" className="ml-2 bg-blue-50">
                  6 onglets
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="configuration" className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                ⚙️ Configuration & Administration
                <Badge variant="outline" className="ml-2 bg-purple-50">
                  4 onglets
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Onglet Interface Utilisateur */}
            <TabsContent value="usage" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Interface Utilisateur OCR-IA</h3>
                </div>
                <p className="text-blue-700 text-sm mb-4">
                  Interface unifiée pour l'utilisation et le traitement des documents. 
                  Toutes les fonctionnalités de traitement sont consolidées ici.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-blue-600">
                  <div>📥 Extraction & Analyse</div>
                  <div>🗺️ Mapping Intelligent</div>
                  <div>✅ Validation & Approbation</div>
                  <div>📊 Résultats & Export</div>
                  <div>⚡ Algorithmes Avancés</div>
                  <div>🔍 Diagnostic & Monitoring</div>
                </div>
              </div>
              
              <UnifiedOCRInterface language={language} />
            </TabsContent>

            {/* Onglet Configuration */}
            <TabsContent value="configuration" className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Configuration & Administration</h3>
                </div>
                <p className="text-purple-700 text-sm mb-4">
                  Interface d'administration pour la configuration du système, 
                  la gestion des utilisateurs et la maintenance.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-2 text-xs text-purple-600">
                  <div>🎛️ Paramètres d'Extraction</div>
                  <div>🔄 Workflow & Processus</div>
                  <div>📈 Performance & Scalabilité</div>
                  <div>🔧 Administration & Maintenance</div>
                </div>
              </div>
              
              <UnifiedOCRConfiguration language={language} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Footer avec informations de consolidation */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Consolidation OCR-IA terminée avec succès</span>
            </div>
            <div className="text-xs text-gray-500">
              <strong>Fonctionnalités préservées :</strong> Traitement par Lot • Fil d'Approbation • 
              Analytics • Diagnostic • Workflow d'Alimentation • 🇩🇿 Algorithme d'Extraction
            </div>
            <div className="text-xs text-gray-400">
              Interface unifiée : 6 onglets utilisateur + 4 onglets configuration
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};