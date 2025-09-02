
import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { TabFormField } from '@/components/common/TabFormField';
import { Pagination } from '@/components/common/Pagination';
import { UnifiedPagination } from '@/components/common/UnifiedPagination';
import { usePagination } from '@/hooks/usePagination';
import { InstantSearch } from '@/components/common/InstantSearch';
import { Newspaper, Calendar, TrendingUp, Users, FileText, Settings } from 'lucide-react';
import { AddNewsForm } from '@/components/forms/AddNewsForm';
import { useGlobalActions } from '@/hooks/useGlobalActions';
import { UnifiedModalSystem } from '@/components/modals/UnifiedModalSystem';
import { useApiModalHandler } from '@/hooks/useApiModalHandler';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin,
  Award,
  BookOpen,
  Gavel,
  Scale,
  Building,
  GraduationCap
} from 'lucide-react';

export function NewsSection() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newsSearchQuery, setNewsSearchQuery] = useState('');
  const [eventsSearchQuery, setEventsSearchQuery] = useState('');
  const [analysesSearchQuery, setAnalysesSearchQuery] = useState('');
  const [discussionsSearchQuery, setDiscussionsSearchQuery] = useState('');
  const [commentairesSearchQuery, setCommentairesSearchQuery] = useState('');
  const [tendancesSearchQuery, setTendancesSearchQuery] = useState('');
  const [isNewsApiEnabled, setIsNewsApiEnabled] = useState(false);
  const [apiNewsData, setApiNewsData] = useState<any[]>([]);
  const [apiEventsData, setApiEventsData] = useState<any[]>([]);
  const [isLoadingApiData, setIsLoadingApiData] = useState(false);
  const actions = useGlobalActions();
  const { showApiModal, apiContext, openApiModal, closeApiModal } = useApiModalHandler();

  // Charger l'état de l'API depuis localStorage au montage
  useEffect(() => {
    const savedState = localStorage.getItem('api_enabled_news');
    if (savedState !== null) {
      // Charger l'état sauvegardé
      setIsNewsApiEnabled(JSON.parse(savedState));
    } else {
      // État désactivé par défaut (pas de sauvegarde forcée)
      setIsNewsApiEnabled(false);
    }
  }, []);

  // Données simulées depuis l'API
  const simulatedApiNewsData = [
    { id: 'api-1', title: "🚀 API: Nouvelle loi sur la cybersécurité", date: "Il y a 1 heure", description: "L'API a détecté une nouvelle loi sur la cybersécurité publiée au Journal Officiel...", category: "API - Cybersécurité", source: "API Légifrance" },
    { id: 'api-2', title: "📊 API: Statistiques judiciaires 2024", date: "Il y a 2 heures", description: "Données automatiques des statistiques judiciaires pour l'année 2024...", category: "API - Statistiques", source: "API Ministère Justice" },
    { id: 'api-3', title: "⚖️ API: Nouvelle jurisprudence commerciale", date: "Il y a 3 heures", description: "La Cour de Cassation a rendu un arrêt important sur le droit commercial...", category: "API - Jurisprudence", source: "API Cour de Cassation" },
    { id: 'api-4', title: "🏛️ API: Réforme du code de procédure", date: "Il y a 4 heures", description: "Nouvelle réforme du code de procédure civile détectée automatiquement...", category: "API - Procédure", source: "API Journal Officiel" },
    { id: 'api-5', title: "💼 API: Nouveaux décrets d'application", date: "Il y a 5 heures", description: "Publication de nouveaux décrets d'application pour la loi économique...", category: "API - Décrets", source: "API Légifrance" },
    { id: 'api-6', title: "🌍 API: Accord international signé", date: "Il y a 6 heures", description: "Nouvel accord international sur la coopération judiciaire...", category: "API - International", source: "API Ministère Affaires Étrangères" }
  ];

  // Données simulées d'événements depuis l'API
  const simulatedApiEventsData = [
    { id: 'api-event-1', title: "🚀 API: Webinaire sur l'IA juridique", date: "25 Mai 2024", location: "En ligne", category: "API - Webinaire" },
    { id: 'api-event-2', title: "📊 API: Colloque numérique et droit", date: "30 Juin 2024", location: "Alger", category: "API - Colloque" },
    { id: 'api-event-3', title: "⚖️ API: Formation continue avocats", date: "15 Juillet 2024", location: "Oran", category: "API - Formation" },
    { id: 'api-event-4', title: "🏛️ API: Congrès magistrats", date: "20 Août 2024", location: "Constantine", category: "API - Congrès" }
  ];

  // Fonction pour simuler le chargement des données API
  const loadApiNewsData = async () => {
    setIsLoadingApiData(true);
    // Simulation d'un délai de chargement
    await new Promise(resolve => setTimeout(resolve, 1500));
    setApiNewsData(simulatedApiNewsData);
    setApiEventsData(simulatedApiEventsData);
    setIsLoadingApiData(false);
  };

  // Fonction pour vider les données API
  const clearApiNewsData = () => {
    setApiNewsData([]);
    setApiEventsData([]);
  };

  // Données dynamiques pour les actualités
  const newsData = [
    { id: 1, title: "Réforme du Code Civil", date: "Il y a 2 jours", description: "Le gouvernement a annoncé une réforme majeure du Code Civil...", category: "Législation" },
    { id: 2, title: "Nouvelle Loi sur la Protection des Données", date: "Il y a 1 semaine", description: "Une nouvelle loi renforce la protection des données personnelles...", category: "RGPD" },
    { id: 3, title: "Impact du Brexit sur les Contrats Internationaux", date: "Il y a 2 semaines", description: "Le Brexit continue d'impacter les contrats internationaux...", category: "International" },
    { id: 4, title: "Nouvelle Jurisprudence sur les Marques", date: "Il y a 3 jours", description: "La Cour de Cassation clarifie les critères de protection des marques...", category: "Propriété Intellectuelle" },
    { id: 5, title: "Réforme de la Procédure Administrative", date: "Il y a 1 jour", description: "Simplification des procédures administratives pour les entreprises...", category: "Administratif" },
    { id: 6, title: "Nouvelle Directive sur les Marchés Publics", date: "Il y a 4 jours", description: "Transparence renforcée dans les marchés publics...", category: "Marchés Publics" },
    { id: 7, title: "Protection des Données Bancaires", date: "Il y a 5 jours", description: "Nouvelles mesures de sécurité pour les données bancaires...", category: "Bancaire" },
    { id: 8, title: "Réforme du Droit du Travail", date: "Il y a 1 semaine", description: "Modernisation du code du travail algérien...", category: "Travail" },
    { id: 9, title: "Nouvelle Loi sur l'Environnement", date: "Il y a 2 semaines", description: "Renforcement de la protection environnementale...", category: "Environnement" },
    { id: 10, title: "Réforme de la Justice Pénale", date: "Il y a 3 jours", description: "Modernisation de la procédure pénale...", category: "Pénal" },
    { id: 11, title: "Protection des Consommateurs", date: "Il y a 6 jours", description: "Nouvelles garanties pour les consommateurs...", category: "Consommation" },
    { id: 12, title: "Droit Numérique et IA", date: "Il y a 1 semaine", description: "Cadre juridique pour l'intelligence artificielle...", category: "Numérique" }
  ];

  // Données dynamiques pour les événements
  const eventsData = [
    { id: 1, title: "Conférence sur le Droit du Numérique", date: "15 Mai 2024", location: "Alger", category: "Conférence" },
    { id: 2, title: "Atelier sur la Médiation", date: "22 Juin 2024", location: "Oran", category: "Atelier" },
    { id: 3, title: "Séminaire sur la Compliance", date: "5 Juillet 2024", location: "Constantine", category: "Séminaire" },
    { id: 4, title: "Forum sur l'Arbitrage International", date: "12 Septembre 2024", location: "Alger", category: "Forum" },
    { id: 5, title: "Formation sur le RGPD", date: "28 Octobre 2024", location: "Oran", category: "Formation" },
    { id: 6, title: "Colloque sur le Droit des Affaires", date: "10 Novembre 2024", location: "Constantine", category: "Colloque" },
    { id: 7, title: "Journée du Droit de l'Environnement", date: "15 Décembre 2024", location: "Annaba", category: "Journée" },
    { id: 8, title: "Workshop sur la Cybersécurité", date: "20 Janvier 2025", location: "Sétif", category: "Workshop" },
    { id: 9, title: "Conférence sur l'Innovation Juridique", date: "25 Février 2025", location: "Alger", category: "Conférence" },
    { id: 10, title: "Séminaire sur le Droit Maritime", date: "10 Mars 2025", location: "Oran", category: "Séminaire" },
    { id: 11, title: "Forum sur la Justice Restaurative", date: "15 Avril 2025", location: "Constantine", category: "Forum" },
    { id: 12, title: "Colloque sur le Droit Constitutionnel", date: "20 Mai 2025", location: "Alger", category: "Colloque" }
  ];

  // Filtrage des données basé sur la recherche
  const filteredNewsData = newsData.filter(news =>
    news.title.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
    news.description.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
    news.category.toLowerCase().includes(newsSearchQuery.toLowerCase())
  );

  const filteredApiNewsData = apiNewsData.filter(news =>
    news.title.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
    news.description.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
    news.category.toLowerCase().includes(newsSearchQuery.toLowerCase())
  );

  // Combiner les données locales et API
  const combinedNewsData = [...filteredNewsData, ...filteredApiNewsData];

  // Données pour les analyses
  const analysesData = [
    { id: 1, title: "L'essor du Droit Numérique", author: "Me. Ali Ahmed", summary: "Analyse de l'impact croissant du numérique sur le droit..." },
    { id: 2, title: "La Compliance au cœur des Entreprises", author: "Dr. Fatima Ben", summary: "Décryptage des enjeux de la compliance pour les entreprises algériennes..." },
    { id: 3, title: "Les Défis de l'Arbitrage International", author: "Pr. Karim Said", summary: "Analyse des défis et opportunités de l'arbitrage international..." },
    { id: 4, title: "L'Intelligence Artificielle et le Droit", author: "LegalTechDZ", summary: "Quel est le futur de l'IA dans le secteur juridique ?..." },
    { id: 5, title: "La Fiscalité des Entreprises en Algérie", author: "TaxAdvisorDZ", summary: "Panorama des réformes fiscales récentes..." },
    { id: 6, title: "Le Droit du Travail en Algérie", author: "LabourRights", summary: "Évolutions majeures du droit du travail..." },
    { id: 7, title: "La Protection des Données en Algérie", author: "DataLawyer", summary: "Nouvelles obligations pour les entreprises..." }
  ];

  // Données pour les discussions
  const discussionsData = [
    { id: 1, title: "La Réforme du Code de Commerce", author: "Ali23", summary: "Quels sont les impacts de la réforme sur les entreprises ?..." },
    { id: 2, title: "Les Nouveaux Défis de la Profession d'Avocat", author: "YasmineK", summary: "Comment s'adapter aux mutations du monde juridique ?..." },
    { id: 3, title: "L'Intelligence Artificielle et le Droit", author: "LegalTechDZ", summary: "Quel est le futur de l'IA dans le secteur juridique ?..." },
    { id: 4, title: "La Compliance dans les PME", author: "PMEExpert", summary: "Quels outils pour une conformité efficace ?..." },
    { id: 5, title: "La Médiation en Algérie", author: "MediationDZ", summary: "La médiation comme alternative au contentieux..." }
  ];

  const filteredEventsData = eventsData.filter(event =>
    event.title.toLowerCase().includes(eventsSearchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(eventsSearchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(eventsSearchQuery.toLowerCase())
  );

  const filteredApiEventsData = apiEventsData.filter(event =>
    event.title.toLowerCase().includes(eventsSearchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(eventsSearchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(eventsSearchQuery.toLowerCase())
  );

  // Combiner les données d'événements locales et API
  const combinedEventsData = [...filteredEventsData, ...filteredApiEventsData];

  const filteredAnalysesData = analysesData.filter(analysis =>
    analysis.title.toLowerCase().includes(analysesSearchQuery.toLowerCase()) ||
    analysis.author.toLowerCase().includes(analysesSearchQuery.toLowerCase()) ||
    analysis.summary.toLowerCase().includes(analysesSearchQuery.toLowerCase())
  );

    const filteredDiscussionsData = discussionsData.filter(discussion =>
    discussion.title.toLowerCase().includes(discussionsSearchQuery.toLowerCase()) ||
    discussion.author.toLowerCase().includes(discussionsSearchQuery.toLowerCase()) ||
    discussion.summary.toLowerCase().includes(discussionsSearchQuery.toLowerCase())
  );

  // Pagination pour les actualités
  const {
    currentData: paginatedNews,
    currentPage: newsCurrentPage,
    totalPages: newsTotalPages,
    itemsPerPage: newsItemsPerPage,
    totalItems: newsTotalItems,
    setCurrentPage: setNewsCurrentPage,
    setItemsPerPage: setNewsItemsPerPage
  } = usePagination({
    data: combinedNewsData,
    itemsPerPage: 5
  });

  // Pagination pour les événements
  const {
    currentData: paginatedEvents,
    currentPage: eventsCurrentPage,
    totalPages: eventsTotalPages,
    itemsPerPage: eventsItemsPerPage,
    totalItems: eventsTotalItems,
    setCurrentPage: setEventsCurrentPage,
    setItemsPerPage: setEventsItemsPerPage
  } = usePagination({
    data: combinedEventsData,
    itemsPerPage: 5
  });

  // Pagination pour les analyses
  const {
    currentData: paginatedAnalyses,
    currentPage: analysesCurrentPage,
    totalPages: analysesTotalPages,
    itemsPerPage: analysesItemsPerPage,
    totalItems: analysesTotalItems,
    setCurrentPage: setAnalysesCurrentPage,
    setItemsPerPage: setAnalysesItemsPerPage
  } = usePagination({
    data: filteredAnalysesData,
    itemsPerPage: 3
  });
  const articlesData = [
    { id: 1, title: "La Protection des Données en Algérie", author: "DataLawyer" },
    { id: 2, title: "Les Contrats Commerciaux Internationaux", author: "TradeExpert" },
    { id: 3, title: "Le Droit du Travail en Algérie", author: "LabourRights" },
    { id: 4, title: "La Fiscalité des Entreprises en Algérie", author: "TaxAdvisorDZ" },
    { id: 5, title: "L'Arbitrage et la Médiation en Algérie", author: "ADRSolutions" },
    { id: 6, title: "Le Droit de la Propriété Intellectuelle", author: "IntellectualProperty" }
  ];

  // Pagination pour les discussions
  const {
    currentData: paginatedDiscussions,
    currentPage: discussionsCurrentPage,
    totalPages: discussionsTotalPages,
    itemsPerPage: discussionsItemsPerPage,
    totalItems: discussionsTotalItems,
    setCurrentPage: setDiscussionsCurrentPage,
    setItemsPerPage: setDiscussionsItemsPerPage
  } = usePagination({
    data: filteredDiscussionsData,
    itemsPerPage: 2
  });
  // Pagination pour les articles
  const {
    currentData: paginatedArticles,
    currentPage: articlesCurrentPage,
    totalPages: articlesTotalPages,
    itemsPerPage: articlesItemsPerPage,
    totalItems: articlesTotalItems,
    setCurrentPage: setArticlesCurrentPage,
    setItemsPerPage: setArticlesItemsPerPage
  } = usePagination({
    data: articlesData,
    itemsPerPage: 3
  });

  // Données pour les professions juridiques
  const legalProfessions = [
    {
      id: 1,
      name: "Dr. Ahmed Benali",
      profession: "Avocat",
      speciality: "Droit commercial",
      experience: "15 ans",
      location: "Alger",
      rating: 4.8,
      cases: 127,
      publications: 23,
      status: "Actif"
    },
    {
      id: 2,
      name: "Mme Fatima Cherif",
      profession: "Notaire",
      speciality: "Droit immobilier",
      experience: "12 ans",
      location: "Oran",
      rating: 4.9,
      cases: 89,
      publications: 15,
      status: "Actif"
    },
    {
      id: 3,
      name: "Dr. Karim Meziane",
      profession: "Huissier",
      speciality: "Exécution forcée",
      experience: "8 ans",
      location: "Constantine",
      rating: 4.6,
      cases: 234,
      publications: 8,
      status: "Actif"
    },
    {
      id: 4,
      name: "Mme Leila Mansouri",
      profession: "Avocat",
      speciality: "Droit pénal",
      experience: "20 ans",
      location: "Alger",
      rating: 4.7,
      cases: 156,
      publications: 31,
      status: "Actif"
    },
    {
      id: 5,
      name: "Dr. Yacine Brahim",
      profession: "Notaire",
      speciality: "Droit des sociétés",
      experience: "10 ans",
      location: "Annaba",
      rating: 4.5,
      cases: 67,
      publications: 12,
      status: "Actif"
    },
    {
      id: 6,
      name: "M. Salim Kaced",
      profession: "Huissier",
      speciality: "Recouvrement",
      experience: "6 ans",
      location: "Tlemcen",
      rating: 4.4,
      cases: 189,
      publications: 5,
      status: "Actif"
    },
    {
      id: 7,
      name: "Dr. Amina Bouaziz",
      profession: "Avocat",
      speciality: "Droit administratif",
      experience: "18 ans",
      location: "Alger",
      rating: 4.8,
      cases: 203,
      publications: 28,
      status: "Actif"
    },
    {
      id: 8,
      name: "M. Kamel Boudiaf",
      profession: "Notaire",
      speciality: "Droit familial",
      experience: "14 ans",
      location: "Blida",
      rating: 4.6,
      cases: 145,
      publications: 19,
      status: "Actif"
    }
  ];

  // Données pour les cabinets juridiques
  const legalFirms = [
    {
      id: 1,
      name: "Cabinet Benali & Associés",
      type: "Cabinet d'avocats",
      specialities: ["Droit commercial", "Droit des sociétés", "Droit fiscal"],
      location: "Alger Centre",
      size: "15 avocats",
      founded: "2010",
      rating: 4.8,
      cases: 1250
    },
    {
      id: 2,
      name: "Étude Notariale Cherif",
      type: "Étude notariale",
      specialities: ["Droit immobilier", "Droit familial", "Successions"],
      location: "Oran",
      size: "8 notaires",
      founded: "2008",
      rating: 4.9,
      cases: 890
    },
    {
      id: 3,
      name: "Office d'Huissier Meziane",
      type: "Office d'huissier",
      specialities: ["Exécution forcée", "Recouvrement", "Significations"],
      location: "Constantine",
      size: "5 huissiers",
      founded: "2015",
      rating: 4.6,
      cases: 2100
    },
    {
      id: 4,
      name: "Cabinet Mansouri & Partners",
      type: "Cabinet d'avocats",
      specialities: ["Droit pénal", "Droit administratif", "Contentieux"],
      location: "Alger",
      size: "12 avocats",
      founded: "2005",
      rating: 4.7,
      cases: 980
    },
    {
      id: 5,
      name: "Étude Notariale Brahim",
      type: "Étude notariale",
      specialities: ["Droit des sociétés", "Fusions-acquisitions", "Contrats"],
      location: "Annaba",
      size: "6 notaires",
      founded: "2012",
      rating: 4.5,
      cases: 450
    },
    {
      id: 6,
      name: "Office d'Huissier Kaced",
      type: "Office d'huissier",
      specialities: ["Recouvrement", "Exécution", "Mise en demeure"],
      location: "Tlemcen",
      size: "3 huissiers",
      founded: "2017",
      rating: 4.4,
      cases: 1200
    }
  ];

  // Pagination pour les professions juridiques
  const {
    currentData: paginatedProfessions,
    currentPage: professionsCurrentPage,
    totalPages: professionsTotalPages,
    itemsPerPage: professionsItemsPerPage,
    totalItems: professionsTotalItems,
    setCurrentPage: setProfessionsCurrentPage,
    setItemsPerPage: setProfessionsItemsPerPage
  } = usePagination({
    data: legalProfessions,
    itemsPerPage: 5
  });

  // Pagination pour les cabinets juridiques
  const {
    currentData: paginatedFirms,
    currentPage: firmsCurrentPage,
    totalPages: firmsTotalPages,
    itemsPerPage: firmsItemsPerPage,
    totalItems: firmsTotalItems,
    setCurrentPage: setFirmsCurrentPage,
    setItemsPerPage: setFirmsItemsPerPage
  } = usePagination({
    data: legalFirms,
    itemsPerPage: 3
  });

  const handleAdd = () => {
    console.log('Opening add news form...');
    setShowAddForm(true);
  };

  const handleEnrich = () => {
    console.log('Opening enrichment with file import...');
    actions.handleImport(['.pdf', '.doc', '.docx', '.txt']);
  };

  const handleNewsApiToggle = async (enabled: boolean) => {
    setIsNewsApiEnabled(enabled);
    localStorage.setItem('api_enabled_news', JSON.stringify(enabled));
    
    if (enabled) {
      console.log('API Actualités activée - Chargement des données...');
      await loadApiNewsData();
    } else {
      console.log('API Actualités désactivée - Arrêt du chargement automatique');
      clearApiNewsData();
    }
  };

  const handleCloseForm = () => {
    console.log('Closing add news form...');
    setShowAddForm(false);
  };

  if (showAddForm) {
    return (
      <AddNewsForm 
        isOpen={true} 
        onClose={handleCloseForm} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="actualites" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="actualites" className="gap-2">
            <Newspaper className="w-4 h-4" />
            Actualités Récentes
          </TabsTrigger>
          <TabsTrigger value="analyse" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Analyse & Tendances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actualites" className="mt-6 space-y-6">
          {/* Boutons d'action connectés */}
          <div className="flex gap-3 justify-center mb-6">
            <Button className="gap-2" onClick={handleAdd}>
              <Newspaper className="w-4 h-4" />
              Ajouter
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleEnrich}>
              <FileText className="w-4 h-4" />
              Enrichir
            </Button>
          </div>

          {/* Interrupteur API */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-sm font-medium">Chargement automatique des actualités et événements</span>
            <Switch
              checked={isNewsApiEnabled}
              onCheckedChange={handleNewsApiToggle}
            />
            <span className="text-xs text-gray-500">Activer/Désactiver</span>
          </div>

          <div className="mb-4">
            <InstantSearch
              placeholder="Rechercher dans les actualités..."
              onSearch={setNewsSearchQuery}
              className="max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-red-600" />
                  Dernières Actualités
                </CardTitle>
                <p className="text-sm text-gray-600">Suivez les actualités juridiques en temps réel</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Indicateur de chargement API */}
                  {isLoadingApiData && (
                    <div className="p-3 border rounded bg-blue-50 border-blue-200">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-600">Chargement des données API en cours...</span>
                      </div>
                    </div>
                  )}

                  {/* Indicateur de source de données */}
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <span className="text-xs font-medium text-blue-700">
                      💾 Données locales ({filteredNewsData.length})
                      {isNewsApiEnabled && apiNewsData.length > 0 && (
                        <span className="ml-2">+ 📡 Données API ({filteredApiNewsData.length})</span>
                      )}
                    </span>
                  </div>

                  {/* Données combinées */}
                  {paginatedNews.map((news) => {
                    // Déterminer si c'est une donnée API ou locale
                    const isApiData = news.id.toString().startsWith('api-');
                    
                    return (
                      <div 
                        key={news.id} 
                        className={`p-3 border rounded hover:${isApiData ? 'bg-green-50' : 'bg-gray-50'} ${
                          isApiData ? 'border-green-200 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{news.title}</span>
                          <span className="text-xs text-gray-500">{news.date}</span>
                        </div>
                        <p className="text-xs text-gray-600">{news.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-xs ${isApiData ? 'text-green-600' : 'text-blue-600'}`}>
                            {news.category}
                          </span>
                          {isApiData && (
                            <span className="text-xs text-gray-500">{news.source}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination pour les actualités */}
                <Pagination
                  currentPage={newsCurrentPage}
                  totalPages={newsTotalPages}
                  totalItems={newsTotalItems}
                  itemsPerPage={newsItemsPerPage}
                  onPageChange={setNewsCurrentPage}
                  onItemsPerPageChange={setNewsItemsPerPage}
                />
                
                <Button className="w-full">
                  Voir toutes les actualités
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Événements Juridiques à Venir
                </CardTitle>
                <p className="text-sm text-gray-600">Ne manquez aucun événement important du secteur juridique</p>
               </CardHeader>
               <CardContent>
                 {/* Indicateur de source de données pour les événements */}
                 <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                   <span className="text-xs font-medium text-blue-700">
                     💾 Données locales ({filteredEventsData.length})
                     {isNewsApiEnabled && apiEventsData.length > 0 && (
                       <span className="ml-2">+ 📡 Données API ({filteredApiEventsData.length})</span>
                     )}
                   </span>
                 </div>
                 
                 <div className="mb-4">
                   <InstantSearch
                     placeholder="Rechercher dans les événements..."
                     onSearch={setEventsSearchQuery}
                     className="max-w-md"
                   />
                 </div>
                 <div className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {paginatedEvents.map((event) => {
                       // Déterminer si c'est une donnée API ou locale
                       const isApiData = event.id.toString().startsWith('api-event');
                       
                       return (
                         <div 
                           key={event.id} 
                           className={`p-3 rounded ${
                             isApiData ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                           }`}
                         >
                           <div className="font-medium text-sm">{event.title}</div>
                           <p className="text-xs text-gray-600">{event.date} - {event.location}</p>
                           <span className={`text-xs ${isApiData ? 'text-green-600' : 'text-purple-600'}`}>
                             {event.category}
                           </span>
                         </div>
                       );
                     })}
                   </div>
                  
                  {/* Pagination pour les événements */}
                  <Pagination
                    currentPage={eventsCurrentPage}
                    totalPages={eventsTotalPages}
                    totalItems={eventsTotalItems}
                    itemsPerPage={eventsItemsPerPage}
                    onPageChange={setEventsCurrentPage}
                    onItemsPerPageChange={setEventsItemsPerPage}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analyse" className="mt-6 space-y-6">
          {/* Boutons d'action connectés */}
          <div className="flex gap-3 justify-center mb-6">
            <Button className="gap-2" onClick={handleAdd}>
              <Newspaper className="w-4 h-4" />
              Ajouter
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleEnrich}>
              <FileText className="w-4 h-4" />
              Enrichir
            </Button>
          </div>

          <div className="mb-4">
            <InstantSearch
              placeholder="Rechercher dans les analyses..."
              onSearch={setAnalysesSearchQuery}
              className="max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Analyse des Tendances Juridiques
                </CardTitle>
                <p className="text-sm text-gray-600">Décryptage des grandes tendances du droit algérien</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {paginatedAnalyses.map((analysis) => (
                    <div key={analysis.id} className="p-3 border rounded hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{analysis.title}</span>
                        <span className="text-xs text-gray-500">Par {analysis.author}</span>
                      </div>
                      <p className="text-xs text-gray-600">{analysis.summary}</p>
                    </div>
                  ))}
                </div>
                <UnifiedPagination
                  currentPage={analysesCurrentPage}
                  totalPages={analysesTotalPages}
                  totalItems={analysesTotalItems}
                  itemsPerPage={analysesItemsPerPage}
                  onPageChange={setAnalysesCurrentPage}
                  onItemsPerPageChange={setAnalysesItemsPerPage}
                  size="sm"
                  variant="compact"
                  showItemsPerPage={false}
                  showInfo={true}
                />
                <Button className="w-full">
                  Consulter toutes les analyses
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Focus sur les Professions Juridiques
                </CardTitle>
                <p className="text-sm text-gray-600">Zoom sur les acteurs clés du monde juridique algérien</p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="professions" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="professions">Professionnels</TabsTrigger>
                    <TabsTrigger value="cabinets">Cabinets</TabsTrigger>
                  </TabsList>

                  <TabsContent value="professions" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paginatedProfessions.map((profession) => (
                        <div key={profession.id} className="p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-sm">{profession.name}</h4>
                              <p className="text-xs text-gray-600">{profession.profession}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              {profession.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Scale className="w-3 h-3 text-blue-600" />
                              <span>{profession.speciality}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              <span>{profession.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="w-3 h-3 text-yellow-600" />
                              <span>{profession.experience} d'expérience</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Gavel className="w-3 h-3 text-purple-600" />
                              <span>{profession.cases} dossiers traités</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">{profession.rating}</span>
                              <span className="text-xs text-gray-500">/5</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-500">{profession.publications} publications</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination pour les professionnels */}
                    {professionsTotalPages > 1 && (
                      <div className="mt-4">
                        <Pagination
                          currentPage={professionsCurrentPage}
                          totalPages={professionsTotalPages}
                          totalItems={professionsTotalItems}
                          itemsPerPage={professionsItemsPerPage}
                          onPageChange={setProfessionsCurrentPage}
                          onItemsPerPageChange={setProfessionsItemsPerPage}
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="cabinets" className="space-y-4">
                    <div className="space-y-4">
                      {paginatedFirms.map((firm) => (
                        <div key={firm.id} className="p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-sm">{firm.name}</h4>
                              <p className="text-xs text-gray-600">{firm.type}</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              {firm.size}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Building className="w-3 h-3 text-blue-600" />
                              <span>{firm.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              <span>Fondé en {firm.founded}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Gavel className="w-3 h-3 text-purple-600" />
                              <span>{firm.cases} dossiers traités</span>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1 mb-2">
                              {firm.specialities.map((speciality, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {speciality}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">{firm.rating}</span>
                              <span className="text-xs text-gray-500">/5</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination pour les cabinets */}
                    {firmsTotalPages > 1 && (
                      <div className="mt-4">
                        <Pagination
                          currentPage={firmsCurrentPage}
                          totalPages={firmsTotalPages}
                          totalItems={firmsTotalItems}
                          itemsPerPage={firmsItemsPerPage}
                          onPageChange={setFirmsCurrentPage}
                          onItemsPerPageChange={setFirmsItemsPerPage}
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


      </Tabs>

      {showApiModal && (
        <UnifiedModalSystem
          modal={{
            id: 'api-import-news',
            type: 'display',
            title: 'Importer des fichiers',
            data: { context: apiContext || 'news' },
            // @ts-ignore
            content: 'Sélectionnez des fichiers à importer (.pdf, .doc, .docx, .txt)'
          }}
          onClose={closeApiModal}
        />
      )}
    </div>
  );
}
