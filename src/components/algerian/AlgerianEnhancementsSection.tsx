import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe,
  Database, 
  Wifi, 
  Smartphone,
  Languages,
  MapPin
} from 'lucide-react';
import { RTLProvider, useRTL } from './RTLProvider';
import { OfflineManager } from './OfflineManager';
import { EnhancedAlgerianData } from './EnhancedAlgerianData';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { SectionHeader } from '@/components/common/SectionHeader';

interface AlgerianEnhancementsSectionProps {
  language?: string;
}

function RTLToggleButton() {
  const { isRTL, toggleRTL, language } = useRTL();
  
  return (
    <Button 
      onClick={toggleRTL}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Languages className="w-4 h-4" />
      {language === 'ar' ? 'العربية' : 'Français'}
      <Badge variant="secondary" className="ml-1">
        {isRTL ? 'RTL' : 'LTR'}
      </Badge>
    </Button>
  );
}

export function AlgerianEnhancementsSection({ language = "fr" }: AlgerianEnhancementsSectionProps) {
  const [activeFeature, setActiveFeature] = useState<string>('rtl');

  return (
    <RTLProvider>
      <div className="space-y-6">
      <SectionHeader
        icon={MapPin}
        title="Améliorations Algériennes"
        description="Fonctionnalités spécialisées pour l'usage en Algérie"
        iconColor="text-green-600"
      />
      <Card>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Languages className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Support RTL</div>
              <div className="text-xs text-gray-600">Interface arabe</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Données Locales</div>
              <div className="text-xs text-gray-600">Contenu algérien</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Wifi className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Mode Offline</div>
              <div className="text-xs text-gray-600">Sans internet</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Smartphone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium">PWA</div>
              <div className="text-xs text-gray-600">Installation mobile</div>
            </div>
          </div>

          <Tabs value={activeFeature} onValueChange={setActiveFeature} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="rtl" className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                RTL
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Données
              </TabsTrigger>
              <TabsTrigger value="offline" className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Offline
              </TabsTrigger>
              <TabsTrigger value="pwa" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                PWA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rtl" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Support RTL (Right-to-Left)</CardTitle>
                  <p className="text-sm text-gray-600">
                    Interface optimisée pour la langue arabe avec direction RTL
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Basculer entre arabe et français :</span>
                    <RTLToggleButton />
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium mb-2">Fonctionnalités RTL :</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Interface complètement inversée pour l'arabe</li>
                      <li>• Polices arabes optimisées (Amiri, Noto Arabic, Cairo)</li>
                      <li>• Adaptation automatique des composants</li>
                      <li>• Sauvegarde des préférences linguistiques</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg font-cairo" dir="rtl">
                    <p className="text-lg mb-2">مثال على النص العربي</p>
                    <p className="text-sm text-gray-600">
                      هذا مثال على كيفية ظهور النص العربي في الواجهة مع دعم RTL الكامل
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <EnhancedAlgerianData />
            </TabsContent>

            <TabsContent value="offline" className="space-y-4">
              <OfflineManager />
            </TabsContent>

            <TabsContent value="pwa" className="space-y-4">
              <PWAInstallPrompt />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progressive Web App (PWA)</CardTitle>
                  <p className="text-sm text-gray-600">
                    Installation et utilisation mobile optimisées
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Avantages PWA :</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Installation native sur mobile</li>
                        <li>• Fonctionnement hors ligne</li>
                        <li>• Démarrage instantané</li>
                        <li>• Mise à jour automatique</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Optimisations :</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Cache intelligent des ressources</li>
                        <li>• Synchronisation background</li>
                        <li>• Interface adaptative</li>
                        <li>• Notifications push</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Instructions d'installation :</h4>
                    <ol className="text-sm text-yellow-700 space-y-1">
                      <li>1. Ouvrez dalil.dz dans votre navigateur mobile</li>
                      <li>2. Appuyez sur "Installer l'application" quand le prompt apparaît</li>
                      <li>3. L'application sera ajoutée à votre écran d'accueil</li>
                      <li>4. Lancez l'app directement depuis l'icône</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    </RTLProvider>
  );
}