// Gestionnaire centralisé des modales fonctionnelles pour l'application

export interface ModalData {
  type: string;
  title: string;
  data?: any;
  onSave?: (data: any) => void;
  onClose?: () => void;
}

// Système de gestion centralisé des modales fonctionnelles
function openModal(config: any) {
  const modalEvent = new CustomEvent('open-unified-modal', {
    detail: config
  });
  window.dispatchEvent(modalEvent);
}

// Fonctions d'ouverture de modales spécifiques - Implémentées avec UnifiedModalSystem
export const openTimelineExportModal = () => {
  openModal({
    id: `timeline_export_${Date.now()}`,
    type: 'export',
    title: 'Export Timeline',
    description: 'Exporter la chronologie des événements',
    size: 'lg'
  });
};

export const openAdvancedFiltersModal = (section: string) => {
  openModal({
    id: `advanced_filters_${Date.now()}`,
    type: 'search',
    title: `Filtres Avancés - ${section}`,
    description: 'Configuration des filtres de recherche avancée',
    size: 'lg',
    searchCategory: section.toLowerCase() as any
  });
};

export const openStatisticsModal = (section: string) => {
  openModal({
    id: `statistics_${Date.now()}`,
    type: 'analytics',
    title: `Statistiques - ${section}`,
    description: 'Analyse des données et métriques',
    size: 'xl',
    chartType: 'bar',
    data: []
  });
};

export const openAlertsConfigModal = () => {
  openModal({
    id: `alerts_config_${Date.now()}`,
    type: 'form',
    title: 'Configuration des Alertes',
    description: 'Paramètres de notification et d\'alerte',
    size: 'md',
    formComponent: () => null, // TODO: Implement AlertsConfigForm
    onSubmit: (data: any) => console.log('Alerts config saved:', data)
  });
};

export const openKnowledgeGraphModal = () => {
  openModal({
    id: `knowledge_graph_${Date.now()}`,
    type: 'display',
    title: 'Graphe de Connaissances',
    description: 'Visualisation des relations juridiques',
    size: 'full',
    content: 'Graphe de connaissances en développement...'
  });
};

export const openDataImportModal = () => {
  openModal({
    id: `data_import_${Date.now()}`,
    type: 'form',
    title: 'Import de Données',
    description: 'Importation de documents et données',
    size: 'lg',
    formComponent: () => null, // TODO: Implement DataImportForm
    onSubmit: (data: any) => console.log('Data imported:', data)
  });
};

export const openAIAnalysisModal = () => {
  openModal({
    id: `ai_analysis_${Date.now()}`,
    type: 'workflow',
    title: 'Analyse Intelligente IA',
    description: 'Traitement et analyse par intelligence artificielle',
    size: 'xl',
    steps: [],
    onComplete: (data: any) => console.log('AI analysis completed:', data)
  });
};

export const openDebateParticipationModal = (debateTitle: string) => {
  openModal({
    id: `debate_participation_${Date.now()}`,
    type: 'form',
    title: `Participation au Débat: ${debateTitle}`,
    description: 'Participer à la discussion juridique',
    size: 'lg',
    formComponent: () => null, // TODO: Implement DebateParticipationForm
    onSubmit: (data: any) => console.log('Debate participation:', data)
  });
};

export const openWorkflowModal = (workflowType: string = 'new') => {
  openModal({
    id: `workflow_${Date.now()}`,
    type: 'workflow',
    title: workflowType === 'new' ? 'Nouveau Workflow' : 'Workflow Existant',
    description: 'Gestion des processus métier',
    size: 'xl',
    steps: [],
    onComplete: (data: any) => console.log('Workflow completed:', data)
  });
};

export const openApprovalTasksModal = () => {
  openModal({
    id: `approval_tasks_${Date.now()}`,
    type: 'approval',
    title: 'Tâches d\'Approbation',
    description: 'Gestion des validations en attente',
    size: 'lg',
    item: null,
    approvalSteps: [],
    onApprove: (item: any) => console.log('Item approved:', item),
    onReject: (item: any, reason: string) => console.log('Item rejected:', item, reason)
  });
};

export const openApprovalHistoryModal = () => {
  openModal({
    id: `approval_history_${Date.now()}`,
    type: 'display',
    title: 'Historique des Approbations',
    description: 'Consultation de l\'historique des validations',
    size: 'lg',
    content: 'Historique des approbations...'
  });
};

export const openFavoriteFiltersModal = () => {
  openModal({
    id: `favorite_filters_${Date.now()}`,
    type: 'form',
    title: 'Filtres Favoris',
    description: 'Gestion des filtres de recherche sauvegardés',
    size: 'md',
    formComponent: () => null, // TODO: Implement FavoriteFiltersForm
    onSubmit: (data: any) => console.log('Favorite filters saved:', data)
  });
};

export const openClearFavoritesModal = () => {
  openModal({
    id: `clear_favorites_${Date.now()}`,
    type: 'confirmation',
    title: 'Effacer les Favoris',
    message: 'Êtes-vous sûr de vouloir supprimer tous vos favoris ?',
    variant: 'destructive',
    onConfirm: () => console.log('Favorites cleared')
  });
};

export const openTermSuggestionModal = () => {
  openModal({
    id: `term_suggestion_${Date.now()}`,
    type: 'form',
    title: 'Suggestion de Terme',
    description: 'Proposer un nouveau terme juridique',
    size: 'md',
    formComponent: () => null, // TODO: Implement TermSuggestionForm
    onSubmit: (data: any) => console.log('Term suggested:', data)
  });
};

export const openLegalQuizModal = () => {
  openModal({
    id: `legal_quiz_${Date.now()}`,
    type: 'workflow',
    title: 'Quiz Juridique',
    description: 'Test de connaissances juridiques',
    size: 'lg',
    steps: [],
    onComplete: (data: any) => console.log('Quiz completed:', data)
  });
};

export const openForumReplyModal = (topicTitle: string) => {
  openModal({
    id: `forum_reply_${Date.now()}`,
    type: 'form',
    title: `Répondre: ${topicTitle}`,
    description: 'Participer à la discussion du forum',
    size: 'lg',
    formComponent: () => null, // TODO: Implement ForumReplyForm
    onSubmit: (data: any) => console.log('Forum reply posted:', data)
  });
};

export const openUserDiscussionsModal = () => {
  openModal({
    id: `user_discussions_${Date.now()}`,
    type: 'display',
    title: 'Mes Discussions',
    description: 'Historique de vos participations aux forums',
    size: 'lg',
    content: 'Vos discussions...'
  });
};

export const openPopularTopicsModal = () => {
  openModal({
    id: `popular_topics_${Date.now()}`,
    type: 'display',
    title: 'Sujets Populaires',
    description: 'Les discussions les plus actives',
    size: 'lg',
    content: 'Sujets populaires...'
  });
};

export const openOnlineExpertsModal = () => {
  openModal({
    id: `online_experts_${Date.now()}`,
    type: 'display',
    title: 'Experts en Ligne',
    description: 'Consulter les experts disponibles',
    size: 'md',
    content: 'Experts connectés...'
  });
};

export const openForumRulesModal = () => {
  openModal({
    id: `forum_rules_${Date.now()}`,
    type: 'display',
    title: 'Règlement du Forum',
    description: 'Conditions d\'utilisation et règles de conduite',
    size: 'lg',
    content: 'Règles du forum...'
  });
};

export const openDocumentSuggestionModal = () => {
  openModal({
    id: `document_suggestion_${Date.now()}`,
    type: 'form',
    title: 'Suggérer un Document',
    description: 'Proposer l\'ajout d\'un nouveau document',
    size: 'lg',
    formComponent: () => null, // TODO: Implement DocumentSuggestionForm
    onSubmit: (data: any) => console.log('Document suggested:', data)
  });
};

export const openAccessRequestModal = () => {
  openModal({
    id: `access_request_${Date.now()}`,
    type: 'form',
    title: 'Demande d\'Accès',
    description: 'Demander l\'accès à des ressources restreintes',
    size: 'md',
    formComponent: () => null, // TODO: Implement AccessRequestForm
    onSubmit: (data: any) => console.log('Access requested:', data)
  });
};

export const openDocumentPreviewModal = () => {
  openModal({
    id: `document_preview_${Date.now()}`,
    type: 'display',
    title: 'Aperçu du Document',
    description: 'Prévisualisation avant publication',
    size: 'xl',
    content: 'Aperçu du document...'
  });
};

export const openAutoWritingModal = () => {
  openModal({
    id: `auto_writing_${Date.now()}`,
    type: 'workflow',
    title: 'Rédaction Automatisée',
    description: 'Assistant IA pour la rédaction juridique',
    size: 'xl',
    steps: [],
    onComplete: (data: any) => console.log('Auto-writing completed:', data)
  });
};

export const openCoherenceCheckModal = () => {
  openModal({
    id: `coherence_check_${Date.now()}`,
    type: 'workflow',
    title: 'Vérification de Cohérence',
    description: 'Analyse de la cohérence juridique',
    size: 'lg',
    steps: [],
    onComplete: (data: any) => console.log('Coherence check completed:', data)
  });
};

export const openLegalTranslationModal = () => {
  openModal({
    id: `legal_translation_${Date.now()}`,
    type: 'workflow',
    title: 'Traduction Juridique',
    description: 'Traduction spécialisée français-arabe',
    size: 'xl',
    steps: [],
    onComplete: (data: any) => console.log('Translation completed:', data)
  });
};

export const openDeduplicationModal = () => {
  openModal({
    id: `deduplication_${Date.now()}`,
    type: 'workflow',
    title: 'Déduplication',
    description: 'Détection et suppression des doublons',
    size: 'lg',
    steps: [],
    onComplete: (data: any) => console.log('Deduplication completed:', data)
  });
};

export const openNewsletterModal = () => {
  openModal({
    id: `newsletter_${Date.now()}`,
    type: 'form',
    title: 'Newsletter',
    description: 'Abonnement aux actualités juridiques',
    size: 'md',
    formComponent: () => null, // TODO: Implement NewsletterForm
    onSubmit: (data: any) => console.log('Newsletter subscribed:', data)
  });
};

export const openNewsArchiveModal = () => {
  openModal({
    id: `news_archive_${Date.now()}`,
    type: 'display',
    title: 'Archives des Actualités',
    description: 'Consultation des actualités passées',
    size: 'lg',
    content: 'Archives des actualités...'
  });
};

export const openCommentModal = (itemTitle: string) => {
  openModal({
    id: `comment_${Date.now()}`,
    type: 'form',
    title: `Commenter: ${itemTitle}`,
    description: 'Ajouter un commentaire ou une annotation',
    size: 'md',
    formComponent: () => null, // TODO: Implement CommentForm
    onSubmit: (data: any) => console.log('Comment posted:', data)
  });
};

export const openFullScreenModal = (documentTitle: string) => {
  openModal({
    id: `fullscreen_${Date.now()}`,
    type: 'display',
    title: `${documentTitle} - Mode Plein Écran`,
    description: 'Affichage en plein écran',
    size: 'full',
    content: `Document en plein écran: ${documentTitle}`
  });
};

export const openPrintModal = (documentTitle: string) => {
  openModal({
    id: `print_${Date.now()}`,
    type: 'form',
    title: `Imprimer: ${documentTitle}`,
    description: 'Options d\'impression et de mise en page',
    size: 'md',
    formComponent: () => null, // TODO: Implement PrintOptionsForm
    onSubmit: (data: any) => {
      console.log('Print options:', data);
      window.print();
    }
  });
};