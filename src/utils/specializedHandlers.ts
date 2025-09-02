// Handlers spécialisés pour les fonctionnalités spécifiques de l'application

import { logger } from './logger';

// Fonction utilitaire pour ouvrir une modal via événement
function openModal(type: string, config: any) {
  const modalEvent = new CustomEvent('open-unified-modal', {
    detail: { type, config }
  });
  window.dispatchEvent(modalEvent);
}

// Handler pour les guides de ressources procédurales
export function handleConsultGuide(guideName: string) {
  openModal('guide', {
    title: guideName,
    content: `Guide détaillé pour ${guideName}`,
    type: 'guide',
    category: 'Procédures administratives'
  });
}

// Handler pour le téléchargement de formulaires
export function handleDownloadForms(categoryTitle: string) {
  openModal('form', {
    title: `Formulaires ${categoryTitle}`,
    fields: [],
    type: 'form',
    category: categoryTitle
  });
}

// Handler pour les modèles de documents
export function handleBrowseTemplates(categoryTitle: string) {
  openModal('template', {
    title: `Modèles ${categoryTitle}`,
    content: `Modèles de documents pour ${categoryTitle}`,
    type: 'template',
    category: categoryTitle
  });
}

// Handler pour les actions de features
export function handleFeatureAction(action: string) {
  openModal('action', {
    title: `Action: ${action}`,
    content: `Action en cours de traitement: ${action}`,
    type: 'action',
    action: action
  });
}

// Handler pour les recherches API
export function handleSearchApi(searchTerm: string) {
  openModal('search', {
    title: 'Recherche API',
    content: `Recherche dans la documentation API: ${searchTerm}`,
    type: 'search',
    query: searchTerm
  });
}

// Handler pour le téléchargement de ressources
export function handleDownloadResource(resourceName: string, type: string) {
  openModal('document', {
    title: resourceName,
    content: `${type}: ${resourceName}`,
    type: 'document',
    category: 'Ressources API'
  });
}

// Handler pour les recherches dans les guides utilisateur
export function handleSearchUserGuide(searchTerm: string) {
  openModal('search', {
    title: 'Recherche Guide Utilisateur',
    content: `Recherche dans les guides: ${searchTerm}`,
    type: 'search',
    query: searchTerm
  });
}

// Handler pour la lecture d'articles
export function handleReadArticle(article: any) {
  openModal('document', {
    title: article.title || article.name || 'Article',
    content: article.description || 'Article du guide utilisateur',
    type: 'document',
    category: 'Guide utilisateur'
  });
}

// Handler pour le téléchargement de guides
export function handleDownloadGuide(title: string) {
  openModal('document', {
    title: title,
    content: `Guide: ${title}`,
    type: 'document',
    category: 'Documentation'
  });
}

// Handler pour la lecture de vidéos/tutoriels
export function handlePlayVideo(article: any) {
  openModal('video', {
    title: article.title || article.name || 'Tutoriel vidéo',
    content: article.description || 'Tutoriel vidéo explicatif',
    type: 'video',
    category: 'Formation'
  });
}

// Handler pour les recherches sémantiques
export function handleSemanticSearch(query: string) {
  openModal('search', {
    title: 'Recherche Sémantique',
    content: `Recherche sémantique: ${query}`,
    type: 'search',
    query: query,
    searchType: 'semantic'
  });
}

// Handler pour les recherches par mots-clés
export function handleKeywordSearch(query: string) {
  openModal('search', {
    title: 'Recherche par Mots-clés',
    content: `Recherche par mots-clés: ${query}`,
    type: 'search',
    query: query,
    searchType: 'keyword'
  });
}

// Handler pour les recherches IA
export function handleAISearch(query: string) {
  openModal('search', {
    title: 'Recherche Intelligente IA',
    content: `Recherche IA avancée: ${query}`,
    type: 'search',
    query: query,
    searchType: 'ai'
  });
}

// Handler pour la navigation par type de document
export function handleBrowseType(type: string, label: string) {
  openModal('search', {
    title: `Navigation ${label}`,
    content: `Parcourir tous les documents de type: ${label}`,
    type: 'search',
    documentType: type,
    searchType: 'browse'
  });
}

// Handler pour l'affichage de messages
export function handleMessageClick(message: any) {
  openModal('document', {
    title: message.title || 'Message',
    content: message.content || message.text || 'Contenu du message',
    type: 'document',
    category: 'Messages',
    author: message.sender || message.from
  });
}

// Handler pour les étoiles/favoris
export function handleStar(templateId: string) {
  // Simuler l'ajout aux favoris
  setTimeout(() => {
    const event = new CustomEvent('toast-message', {
      detail: {
        title: "Ajouté aux favoris",
        description: "Cet élément a été ajouté à vos favoris.",
      }
    });
    window.dispatchEvent(event);
  }, 100);
}

// Handler pour l'aperçu d'éléments
export function handlePreview(item: any) {
  openModal('document', {
    title: item.title || item.name || 'Aperçu',
    content: item.description || 'Aperçu de l\'élément',
    type: 'document',
    category: 'Aperçu',
    isPreview: true
  });
}

// Handler pour l'ajout d'éléments aux textes juridiques
export function handleAddToLegalTexts(template: any) {
  openModal('document', {
    title: `Ajout: ${template.title || template.name}`,
    content: 'Ajout de ce modèle aux textes juridiques',
    type: 'document',
    category: 'Textes Juridiques',
    action: 'add'
  });
}

// Handler pour l'ajout d'éléments aux procédures
export function handleAddToProcedures(template: any) {
  openModal('document', {
    title: `Ajout: ${template.title || template.name}`,
    content: 'Ajout de ce modèle aux procédures administratives',
    type: 'document',
    category: 'Procédures',
    action: 'add'
  });
}

// Handler pour l'exportation de modèles
export function handleExportTemplate(template: any) {
  openModal('document', {
    title: `Export: ${template.title || template.name}`,
    content: 'Exportation de ce modèle',
    type: 'document',
    category: 'Export',
    action: 'export'
  });
}

// Installer tous les handlers spécialisés dans le scope global
export function installSpecializedHandlers() {
  const globalScope = window as any;
  
  globalScope.specializedHandlers = {
    handleConsultGuide,
    handleDownloadForms,
    handleBrowseTemplates,
    handleFeatureAction,
    handleSearchApi,
    handleDownloadResource,
    handleSearchUserGuide,
    handleReadArticle,
    handleDownloadGuide,
    handlePlayVideo,
    handleSemanticSearch,
    handleKeywordSearch,
    handleAISearch,
    handleBrowseType,
    handleMessageClick,
    handleStar,
    handlePreview,
    handleAddToLegalTexts,
    handleAddToProcedures,
    handleExportTemplate
  };
  
  logger.info('UI', '🔧 Handlers spécialisés installés dans le scope global');
}