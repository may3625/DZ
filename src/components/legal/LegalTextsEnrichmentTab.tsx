import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Wand2, Database, Scan, Settings } from 'lucide-react';
import { SmartOCRProcessor } from '@/components/common/SmartOCRProcessor';
import { useGlobalActions } from '@/hooks/useGlobalActions';
import { UnifiedModalSystem } from '@/components/modals/UnifiedModalSystem';
import { AutoExtractionModal } from '@/components/extraction/AutoExtractionModal';
import { useApiModalHandler } from '@/hooks/useApiModalHandler';

interface LegalTextsEnrichmentTabProps {
  onAddLegalText: () => void;
  onOCRTextExtracted?: (text: string) => void;
  onOCRDataExtracted?: (data: { documentType: 'legal' | 'procedure', formData: Record<string, any> }) => void;
}

export function LegalTextsEnrichmentTab({ onAddLegalText, onOCRTextExtracted, onOCRDataExtracted }: LegalTextsEnrichmentTabProps) {
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const actions = useGlobalActions();
  const { showApiModal, apiContext, openApiModal, closeApiModal } = useApiModalHandler();

  const handleOCRExtracted = (text: string) => {
    console.log('Texte OCR extrait:', text);
    if (onOCRTextExtracted) {
      onOCRTextExtracted(text);
    }
    setShowOCRScanner(false);
  };

  const handleScanOCRClick = () => {
    console.log('🎯 [LegalTextsEnrichmentTab] Redirection vers Extraction et Mapping');
    // Naviguer vers la section Extraction et Mapping
    const event = new CustomEvent('navigate-to-section', { 
      detail: 'ocr-extraction'
    });
    window.dispatchEvent(event);
  };

  const handleSmartOCRDataExtracted = (data: { documentType: 'legal' | 'procedure', formData: Record<string, any> }) => {
    console.log('🎯 [LegalTextsEnrichmentTab] Données OCR extraites:', data);
    console.log('📋 [LegalTextsEnrichmentTab] Type de document:', data.documentType);
    console.log('📋 [LegalTextsEnrichmentTab] Nombre de champs:', Object.keys(data.formData).length);
    
    // Passer les données au parent AVANT de fermer le scanner
    try {
      console.log('📤 [LegalTextsEnrichmentTab] Transmission des données au parent...');
      if (onOCRDataExtracted) {
        onOCRDataExtracted(data);
        console.log('✅ [LegalTextsEnrichmentTab] Données transmises avec succès');
      } else {
        console.warn('⚠️ [LegalTextsEnrichmentTab] Pas de callback onOCRDataExtracted défini');
        // Fallback: déclencher l'ouverture du formulaire manuel
        onAddLegalText();
      }
    } catch (error) {
      console.error('❌ [LegalTextsEnrichmentTab] Erreur lors de la transmission:', error);
    }
    
    // Fermer le scanner après transmission
    setTimeout(() => {
      console.log('🔒 [LegalTextsEnrichmentTab] Fermeture du scanner');
      setShowOCRScanner(false);
    }, 100);
  };

  const handleImportCSVExcel = () => {
    actions.handleImport(['.csv', '.xlsx', '.xls']);
  };

  const [showBatchImport, setShowBatchImport] = useState(false);
  const [showAutoExtraction, setShowAutoExtraction] = useState(false);

  const handleAutoFill = () => {
    const event = new CustomEvent('open-ai-autofill', {
      detail: { context: 'legal-text' }
    });
    window.dispatchEvent(event);
  };

  const handleBatchImport = () => {
    setShowBatchImport(true);
  };

  

  const handleApiImport = () => {
    openApiModal('legal-texts');
  };

  if (showOCRScanner) {
    console.log('🎯 [LegalTextsEnrichmentTab] Affichage du scanner OCR');
    return (
      <SmartOCRProcessor
        title="Scanner un document juridique"
        onFormDataExtracted={handleSmartOCRDataExtracted}
        onClose={() => setShowOCRScanner(false)}
      />
    );
  }

  const handleAutoExtraction = () => {
    setShowAutoExtraction(true);
  };

  const actionsConfig = [
    {
      icon: Plus,
      title: "Ajouter un texte juridique",
      description: "Saisir manuellement un nouveau texte juridique algérien",
      buttonText: "Nouveau texte",
      color: "emerald",
      onClick: onAddLegalText
    },
    {
      icon: Scan,
      title: "Scanner un document",
      description: "Numériser et extraire le texte d'un document avec OCR",
      buttonText: "Scanner OCR",
      color: "blue",
      onClick: handleScanOCRClick
    },
    {
      icon: Upload,
      title: "Import en lot",
      description: "Importer plusieurs textes depuis un fichier Excel/CSV",
      buttonText: "Import CSV/Excel",
      color: "blue",
      onClick: handleBatchImport
    },
    {
      icon: Database,
      title: "Extraction automatique",
      description: "Extraire automatiquement des textes depuis diverses sources",
      buttonText: "Extraction auto",
      color: "orange",
      onClick: handleAutoExtraction
    },
    {
      icon: Wand2,
      title: "Auto-remplissage intelligent",
      description: "Remplissage automatique avec IA",
      buttonText: "Auto-remplissage",
      color: "purple",
      onClick: handleAutoFill
    },
    {
      icon: Settings,
      title: "Import API",
      description: "Importer le contenu depuis des sources API configurées",
      buttonText: "Import API",
      color: "purple",
      onClick: handleApiImport
    }
  ];

  return (
    <div className="space-y-8">
      {/* Section principale avec les 2 choix principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Option Manuelle */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={onAddLegalText}>
          <CardHeader className="text-center p-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-200 transition-colors">
              <Plus className="w-10 h-10 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900 mb-2">Saisie Manuelle</CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Saisir manuellement un nouveau texte juridique algérien via le formulaire complet
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <Button 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium" 
              onClick={onAddLegalText}
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
              Scanner et extraire automatiquement le texte d'un document avec reconnaissance optique
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
          {actionsConfig.slice(2).map((action, index) => (
            <Card key={index + 2} className="hover:shadow-md transition-shadow cursor-pointer border-gray-200" onClick={action.onClick}>
              <CardHeader className="text-center">
                <action.icon className={`w-12 h-12 mx-auto text-${action.color}-600 mb-4`} />
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline"
                  className={`w-full border-${action.color}-300 text-${action.color}-700 hover:bg-${action.color}-50`} 
                  onClick={action.onClick}
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {showApiModal && (
        <UnifiedModalSystem
          modal={{
            id: 'api-import-legal',
            type: 'display' as const,
            title: 'Import API',
            content: (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sources API disponibles</CardTitle>
                    <CardDescription>Sélectionnez la source d'import des textes juridiques</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Journal Officiel (API)</label>
                      <label className="flex items-center gap-2"><input type="checkbox" /> Portail Open Data</label>
                      <label className="flex items-center gap-2"><input type="checkbox" /> Intégrations institutionnelles</label>
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
                        <input className="w-full p-2 border rounded" placeholder="https://api.journal-officiel.dz" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">API Key (optionnel)</div>
                        <input className="w-full p-2 border rounded" placeholder="xxxxxxxx" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Type</div>
                        <select className="w-full p-2 border rounded"><option>Tous</option><option>Loi</option><option>Décret</option><option>Arrêté</option></select>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Période</div>
                        <select className="w-full p-2 border rounded"><option>12 derniers mois</option><option>30 jours</option><option>Personnalisée</option></select>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Langue</div>
                        <select className="w-full p-2 border rounded"><option>FR</option><option>AR</option></select>
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
              { id: 'import', label: 'Importer maintenant', variant: 'default', onClick: () => alert('Import démarré pour les textes juridiques') },
              { id: 'close', label: 'Fermer', variant: 'outline', onClick: closeApiModal }
            ]
          }}
          onClose={closeApiModal}
        />
      )}

      

      {showBatchImport && (
        <UnifiedModalSystem
          modal={{
            id: 'batch-import-legal',
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
        context="legal-texts"
      />
    </div>
  );
}
