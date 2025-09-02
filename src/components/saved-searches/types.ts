
export interface SavedSearch {
  id: string; // Changé de number à string pour compatibilité Supabase
  title: string;
  date: string;
  results: number;
  category: string;
  filters: string[];
  description: string;
  lastAccessed: string;
}

export type SearchCategory = 
  | "Civil"
  | "Économique" 
  | "Social"
  | "Fiscal"
  | "Pénal"
  | "Urbanisme"
  | "Constitutionnel"
  | "Commercial"
  | "Douanier"
  | "Environnement"
  | "Énergie"
  | "Financier";
