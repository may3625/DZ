
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Upload } from 'lucide-react';
import { UnifiedModalSystem } from '@/components/modals/UnifiedModalSystem';
import { useApiModalHandler } from '@/hooks/useApiModalHandler';

interface ActionButtonsProps {
  resourceType?: 'ouvrage' | 'revue' | 'journal' | 'article' | 'video' | 'directory' | 'dictionnaire-juridique' | 'terminologie-specialisee';
}

export function ActionButtons({ resourceType = 'ouvrage' }: ActionButtonsProps) {
  const { showApiModal, openApiModal, closeApiModal } = useApiModalHandler();
  const [isApiEnabled, setIsApiEnabled] = useState(false);
  const [isLoadingApiData, setIsLoadingApiData] = useState(false);

  // Charger l'état de l'API depuis localStorage au montage
  // Par défaut, tous les interrupteurs sont désactivés
  useEffect(() => {
    const savedState = localStorage.getItem(`api_enabled_${resourceType}`);
    if (savedState !== null) {
      // Charger l'état sauvegardé
      setIsApiEnabled(JSON.parse(savedState));
    } else {
      // État désactivé par défaut (pas de sauvegarde forcée)
      setIsApiEnabled(false);
    }
  }, [resourceType]);

  // Données simulées selon le type de ressource
  const getSimulatedApiData = () => {
    const baseData = {
      ouvrage: [
        { id: 'api-1', title: "📚 API: Code Civil 2024", author: "API Légifrance", publisher: "Journal Officiel", year: "2024", pages: 450, category: "API - Droit Civil", description: "Version consolidée du Code Civil avec les dernières modifications via API" },
        { id: 'api-2', title: "⚖️ API: Droit des Obligations", author: "API Bibliothèque Nationale", publisher: "Editions HOUMA", year: "2023", pages: 320, category: "API - Droit Civil", description: "Étude approfondie du droit des obligations en droit algérien" }
      ],
      revue: [
        { id: 'api-1', title: "📖 API: Revue Algérienne de Droit", author: "API Université d'Alger", publisher: "Faculté de Droit", year: "2024", pages: 120, category: "API - Académique", description: "Revue semestrielle de recherche juridique" },
        { id: 'api-2', title: "📊 API: Jurisprudence Algérienne", author: "API Conseil d'État", publisher: "Publications Officielles", year: "2024", pages: 80, category: "API - Jurisprudence", description: "Recueil de jurisprudence des hautes juridictions" }
      ],
      journal: [
        { id: 'api-1', title: "📰 API: Journal Officiel", author: "API République Algérienne", publisher: "Imprimerie Officielle", year: "2024", pages: 50, category: "API - Officiel", description: "Publication officielle des lois et décrets" },
        { id: 'api-2', title: "📋 API: Bulletin Officiel des Marchés Publics", author: "API Ministère des Finances", publisher: "DGFP", year: "2024", pages: 40, category: "API - Marchés Publics", description: "Annonces légales des marchés publics" }
      ],
      article: [
        { id: 'api-1', title: "📄 API: L'essor du Droit Numérique", author: "API LegalTechDZ", publisher: "Revue Numérique", year: "2024", pages: 15, category: "API - Numérique", description: "Analyse de l'impact croissant du numérique sur le droit" },
        { id: 'api-2', title: "🔒 API: La Compliance au cœur des Entreprises", author: "API ComplianceDZ", publisher: "Cahiers Compliance", year: "2024", pages: 22, category: "API - Compliance", description: "Décryptage des enjeux de la compliance pour les entreprises" }
      ],
      video: [
        { id: 'api-1', title: "🎥 API: Conférence sur le Droit du Numérique", speaker: "API Pr. Karim Benali", duration: "1h 30min", year: "2024", category: "API - Numérique", description: "Présentation des nouvelles dispositions numériques" },
        { id: 'api-2', title: "📹 API: Séminaire sur l'Investissement", speaker: "API Dr. Samia Redjimi", duration: "2h 15min", year: "2024", category: "API - Économique", description: "Les enjeux juridiques de l'investissement en Algérie" }
      ]
    };
    return baseData[resourceType as keyof typeof baseData] || [];
  };

  // Fonction pour simuler le chargement des données API
  const loadApiData = async () => {
    setIsLoadingApiData(true);
    // Simulation d'un délai de chargement
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Déclencher un événement pour informer le composant parent
    const event = new CustomEvent('api-data-loaded', {
      detail: { 
        resourceType, 
        data: getSimulatedApiData(),
        isLoading: false 
      }
    });
    window.dispatchEvent(event);
    
    setIsLoadingApiData(false);
  };

  // Fonction pour vider les données API
  const clearApiData = () => {
    const event = new CustomEvent('api-data-cleared', {
      detail: { resourceType }
    });
    window.dispatchEvent(event);
  };

  const handleAddNew = () => {
    console.log('Opening add library resource form:', resourceType);
    
    // Déclencher l'événement directement
    const event = new CustomEvent('open-library-form', {
      detail: { resourceType }
    });
    window.dispatchEvent(event);
  };

  const handleEnrichment = () => {
    console.log('Opening enrichment with file import from library action buttons...');
    
    // Déclencher l'événement d'import directement
    const event = new CustomEvent('open-modal', {
      detail: {
        type: 'import',
        title: 'Importer des fichiers',
        data: { acceptedTypes: ['.pdf', '.doc', '.docx', '.txt'] }
      }
    });
    window.dispatchEvent(event);
  };

  const handleApiToggle = async (enabled: boolean) => {
    setIsApiEnabled(enabled);
    localStorage.setItem(`api_enabled_${resourceType}`, JSON.stringify(enabled));
    
    if (enabled) {
      console.log(`API activée pour ${resourceType} - Chargement des données...`);
      await loadApiData();
    } else {
      console.log(`API désactivée pour ${resourceType} - Arrêt du chargement automatique`);
      clearApiData();
    }
  };

  return (
    <>
      <div className="flex justify-center gap-3 mb-6">
        <Button className="gap-2 bg-teal-600 hover:bg-teal-700" onClick={handleAddNew}>
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
        <Button variant="outline" className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50" onClick={handleEnrichment}>
          <Upload className="w-4 h-4" />
          Enrichir
        </Button>
      </div>

      {/* Interrupteur API */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-sm font-medium">Chargement automatique via API</span>
        <Switch
          checked={isApiEnabled}
          onCheckedChange={handleApiToggle}
          disabled={isLoadingApiData}
        />
        <span className="text-xs text-gray-500">
          {isLoadingApiData ? 'Chargement...' : 'Activer/Désactiver'}
        </span>
      </div>

      {/* Indicateur de chargement */}
      {isLoadingApiData && (
        <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-blue-600">Chargement des données API en cours...</span>
        </div>
      )}

      {showApiModal && (
        <UnifiedModalSystem
          modal={{
            id: 'api-import-library',
            type: 'display',
            title: 'Importer des fichiers',
            data: { context: 'library' },
            // Simple placeholder content for unified display modal
            // The underlying flow remains the same (events + handlers)
            // @ts-ignore
            content: 'Sélectionnez des fichiers à importer (.pdf, .doc, .docx, .txt)'
          }}
          onClose={closeApiModal}
        />
      )}
    </>
  );
}
