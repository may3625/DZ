import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Wand2, Database, Scan, Settings } from 'lucide-react';
import { SmartOCRProcessor } from '@/components/common/SmartOCRProcessor';
import { UnifiedModalSystem } from '@/components/modals/UnifiedModalSystem';
import { AutoExtractionModal } from '@/components/extraction/AutoExtractionModal';
import { useApiModalHandler } from '@/hooks/useApiModalHandler';

interface EnrichmentTabProps {
  onAddProcedure: () => void;
  onOCRTextExtracted?: (text: string) => void;
  onOCRDataExtracted?: (data: { documentType: 'legal' | 'procedure', formData: Record<string, any> }) => void;
}

export function EnrichmentTab({ onAddProcedure, onOCRTextExtracted, onOCRDataExtracted }: EnrichmentTabProps) {
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [showAutoExtraction, setShowAutoExtraction] = useState(false);
  const { showApiModal, apiContext, openApiModal, closeApiModal } = useApiModalHandler();

  const handleOCRExtracted = (text: string) => {
    console.log('Texte OCR extrait pour procédure:', text);
    if (onOCRTextExtracted) {
      onOCRTextExtracted(text);
    }
    setShowOCRScanner(false);
  };

  const handleSmartOCRDataExtracted = (data: { documentType: 'legal' | 'procedure', formData: Record<string, any> }) => {
    console.log('🎯 [EnrichmentTab] Données OCR extraites:', data);
    console.log('📋 [EnrichmentTab] Type de document:', data.documentType);
    console.log('📋 [EnrichmentTab] Nombre de champs:', Object.keys(data.formData).length);
    
    // Passer les données au parent AVANT de fermer le scanner
    try {
      console.log('📤 [EnrichmentTab] Transmission des données au parent...');
      if (onOCRDataExtracted) {
        onOCRDataExtracted(data);
        console.log('✅ [EnrichmentTab] Données transmises avec succès');
      } else {
        console.warn('⚠️ [EnrichmentTab] Pas de callback onOCRDataExtracted défini');
        // Fallback: déclencher l'ouverture du formulaire manuel
        onAddProcedure();
      }
    } catch (error) {
      console.error('❌ [EnrichmentTab] Erreur lors de la transmission:', error);
    }
    
    // Fermer le scanner après transmission
    setTimeout(() => {
      console.log('🔒 [EnrichmentTab] Fermeture du scanner');
      setShowOCRScanner(false);
    }, 100);
  };

  const handleScanOCRClick = () => {
    console.log('🎯 [EnrichmentTab] Redirection vers Extraction et Mapping');
    // Naviguer vers la section Extraction et Mapping
    const event = new CustomEvent('navigate-to-section', { 
      detail: 'ocr-extraction'
    });
    window.dispatchEvent(event);
  };

  if (showOCRScanner) {
    return (
      <SmartOCRProcessor
        title="Scanner un document de procédure"
        onFormDataExtracted={handleSmartOCRDataExtracted}
        onClose={() => setShowOCRScanner(false)}
      />
    );
  }

  const handleImportCSVExcel = () => {
    setShowBatchImport(true);
  };

  const handleBatchImportComplete = (results: Record<string, unknown>[]) => {
    console.log('Import terminé:', results);
    setShowBatchImport(false);
  };

  const handleAutoFill = () => {
    const event = new CustomEvent('open-ai-autofill', {
      detail: { context: 'procedure' }
    });
    window.dispatchEvent(event);
  };

  const handleAutoExtraction = () => {
    setShowAutoExtraction(true);
  };

  const handleApiImport = () => {
    openApiModal('procedures');
  };

  return (
    <div className="space-y-8">
      {/* Section principale avec les 2 choix principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Option Manuelle */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={onAddProcedure}>
          <CardHeader className="text-center p-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-200 transition-colors">
              <Plus className="w-10 h-10 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900 mb-2">Saisie Manuelle</CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Saisir manuellement une nouvelle procédure administrative via le formulaire complet
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <Button 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium" 
              onClick={onAddProcedure}
            >
              <Plus className="w-5 h-5 mr-3" />
              Formulaire Manuel
            </Button>
          </CardContent>
        </Card>

        {/* Option OCR */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={handleScanOCRClick}>
          <CardHeader className="text-center p-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
              <Scan className="w-10 h-10 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900 mb-2">Scan OCR</CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Scanner et extraire automatiquement le contenu d'un document avec reconnaissance optique
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <Button 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium" 
              onClick={handleScanOCRClick}
            >
              <Scan className="w-5 h-5 mr-3" />
              Scanner Document
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Autres options d'enrichissement */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Options d'enrichissement avancées</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200" onClick={handleImportCSVExcel}>
            <CardHeader className="text-center">
              <Upload className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-lg">Import en lot</CardTitle>
              <CardDescription>
                Importer plusieurs procédures depuis un fichier Excel/CSV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50" 
                onClick={handleImportCSVExcel}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV/Excel
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200" onClick={handleAutoExtraction}>
            <CardHeader className="text-center">
              <Database className="w-12 h-12 mx-auto text-orange-600 mb-4" />
              <CardTitle className="text-lg">Extraction automatique</CardTitle>
              <CardDescription>
                Importer et traiter automatiquement des procédures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-50" 
                onClick={handleAutoExtraction}
              >
                <Database className="w-4 h-4 mr-2" />
                Extraction auto
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200" onClick={handleAutoFill}>
            <CardHeader className="text-center">
              <Wand2 className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <CardTitle className="text-lg">Auto-remplissage intelligent</CardTitle>
              <CardDescription>
                Remplissage automatique avec IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50" 
                onClick={handleAutoFill}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Auto-remplissage
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200" onClick={handleApiImport}>
            <CardHeader className="text-center">
              <Settings className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
              <CardTitle className="text-lg">Import API</CardTitle>
              <CardDescription>
                Importer le contenu depuis des sources API configurées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50" 
                onClick={handleApiImport}
              >
                <Settings className="w-4 h-4 mr-2" />
                Import API
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      

      {showApiModal && (
        <UnifiedModalSystem
          modal={{
            id: 'api-import-procedure',
            type: 'display',
            title: 'Import API',
            content: (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sources API disponibles</CardTitle>
                    <CardDescription>Sélectionnez la source d'import des procédures</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Services ministériels</label>
                      <label className="flex items-center gap-2"><input type="checkbox" /> Portail Open Gov</label>
                      <label className="flex items-center gap-2"><input type="checkbox" /> Intégrations collectivités (APC/APW)</label>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>Paramètres de connexion et filtrage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Base URL</div>
                        <input className="w-full p-2 border rounded" placeholder="https://api.procedures.dz" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">API Key (optionnel)</div>
                        <input className="w-full p-2 border rounded" placeholder="xxxxxxxx" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Catégorie</div>
                        <select className="w-full p-2 border rounded"><option>Toutes</option><option>État civil</option><option>Commerce</option><option>Urbanisme</option></select>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Période</div>
                        <select className="w-full p-2 border rounded"><option>12 derniers mois</option><option>30 jours</option><option>Personnalisée</option></select>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Statut</div>
                        <select className="w-full p-2 border rounded"><option>Actives</option><option>Modifiées</option><option>Suspendues</option></select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Prévisualisation</CardTitle>
                    <CardDescription>Enregistrements détectés</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">Aucun appel effectué. Utilisez "Tester la connexion" pour voir un aperçu.</div>
                  </CardContent>
                </Card>
              </div>
            ),
            actions: [
              { id: 'test', label: 'Tester la connexion', variant: 'outline', onClick: () => alert('Test de connexion lancé...') },
              { id: 'import', label: 'Importer maintenant', variant: 'default', onClick: () => alert('Import démarré pour les procédures') },
              { id: 'close', label: 'Fermer', variant: 'outline', onClick: closeApiModal }
            ]
          }}
          onClose={closeApiModal}
        />
      )}

      {showBatchImport && (
        <UnifiedModalSystem
          modal={{
            id: 'batch-import-procedure',
            type: 'import',
            title: 'Import en lot (CSV/Excel)',
            onImport: async () => {},
            onCancel: () => setShowBatchImport(false)
          }}
          onClose={() => setShowBatchImport(false)}
        />
      )}

      <AutoExtractionModal
        isOpen={showAutoExtraction}
        onClose={() => setShowAutoExtraction(false)}
        context="procedures"
      />
    </div>
  );
}
