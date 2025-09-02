// Types pour le store principal - Version unifiée et compatible pour l'Algérie
import { LegalTextType, Institution } from './legal';

// Import pour éviter les conflits de types
export interface LegalTextBase {
  id: string;
  title: string;
  description: string;
  content: string;
  datePublication: Date;
  dateModification?: Date;
  articles?: number;
  modifications?: number;
  version?: string;
  views?: number;
  popularity: number;
}

export interface LegalText extends LegalTextBase {
  type: LegalTextType | string; // Allow both for compatibility
  category: string;
  domain: string;
  institution: Institution | string; // Allow both for compatibility
  publishDate: string;
  status: 'En vigueur' | 'Abrogé' | 'En cours' | 'Suspendu' | string; // Allow both for compatibility
  authority: string;
  joNumber: string;
  date: Date;
  source: string;
  author: string;
  insertionMethod: 'manual' | 'ocr' | 'import';
  // Additional properties for enrichment
  numero?: string;
  keywords?: string[];
  references?: string[];
  resume?: string;
  validationStatus?: string;
  // Ensure all properties exist for compatibility
  [key: string]: any;
}

export interface Procedure {
  id: string;
  title: string;
  category: string;
  institution: string;
  description: string;
  steps: ProcedureStep[];
  documents: string[];
  requiredDocuments: string[];
  requirements: string[]; // For backward compatibility
  duration: string;
  processingTime: string; // For backward compatibility
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  successRate: number;
  status: 'Validée' | 'En révision' | 'Obsolète';
  lastUpdate: Date;
  forms: ProcedureForm[];
  cost: string;
  completedCount: number;
  rating: number;
  tags?: string[];
  authority: string;
  views?: number;
  popularity?: number;
}

export interface ProcedureStep {
  id: string;
  title: string;
  description: string;
  duration?: string;
  required: boolean;
  documents?: string[];
}

export interface ProcedureForm {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  format: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  publishDate: string;
  author: string;
  views: number;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  fileUrl: string;
  downloadCount: number;
}

export interface AppState {
  legalTexts: LegalText[];
  procedures: Procedure[];
  news: NewsItem[];
  templates: DocumentTemplate[];
  savedSearches: any[];
  favorites: any[];
  forumDiscussions: any[];
  sharedResources: any[];
  videoTutorials: any[];
  configuration: any;
  forumMembers: any[];
  currentUser: any;
  currentSection: string;
}

export interface AppActions {
  // Legal texts actions
  addLegalText: (text: LegalText) => void;
  updateLegalText: (id: string, updates: Partial<LegalText>) => void;
  deleteLegalText: (id: string) => void;
  searchLegalTexts: (query: string) => LegalText[];
  
  // Procedures actions
  addProcedure: (procedure: Procedure) => void;
  updateProcedure: (id: string, updates: Partial<Procedure>) => void;
  deleteProcedure: (id: string) => void;
  searchProcedures: (query: string) => Procedure[];
  
  // News actions
  addNews: (news: NewsItem) => void;
  updateNews: (id: string, updates: Partial<NewsItem>) => void;
  deleteNews: (id: string) => void;
  
  // Templates actions
  addTemplate: (template: DocumentTemplate) => void;
  updateTemplate: (id: string, updates: Partial<DocumentTemplate>) => void;
  deleteTemplate: (id: string) => void;
  
  // Forum actions
  addForumDiscussion: (discussion: any) => void;
  addSharedResource: (resource: any) => void;
  addVideoTutorial: (tutorial: any) => void;
  addForumMember: (member: any) => void;
  
  // Settings actions
  setConfiguration: (config: any) => void;
  setCurrentUser: (user: any) => void;
  setCurrentSection: (section: string) => void;
  
  // Saved searches and favorites
  deleteSavedSearch: (id: string) => void;
  removeFromFavorites: (itemId: string, itemType: string) => void;
  
  // Global search
  globalSearch: (query: string) => {
    legalTexts: LegalText[];
    procedures: Procedure[];
    news: NewsItem[];
    templates: DocumentTemplate[];
  };
}

export type AppStore = AppState & AppActions;