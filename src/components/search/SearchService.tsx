import { supabase } from '@/integrations/supabase/client';
import { getLocalEmbedding, cosineSimilarity } from '@/ai/localEmbeddings';

export interface SearchResult {
  id: string;
  title: string;
  type: 'legal_text' | 'procedure';
  category: string;
  description: string;
  content?: string;
  institution?: string;
  lastUpdate: string;
  relevance: number;
}

export class SearchService {
  // Recherche dans les textes juridiques
  static async searchLegalTexts(query: string, filters: {
    category?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<SearchResult[]> {
    try {
      let searchQuery = supabase
        .from('legal_texts')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`);

      // Appliquer les filtres
      if (filters.category && filters.category !== 'all') {
        searchQuery = searchQuery.eq('category', filters.category);
      }
      if (filters.status && filters.status !== 'all') {
        searchQuery = searchQuery.eq('status', filters.status);
      }
      if (filters.dateFrom) {
        searchQuery = searchQuery.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        searchQuery = searchQuery.lte('created_at', filters.dateTo);
      }

      const { data, error } = await searchQuery.limit(50);

      if (error) {
        console.error('Error searching legal texts:', error);
        return [];
      }

      return ((data as any[]) || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        type: 'legal_text' as const,
        category: item.category,
        description: item.description || '',
        content: item.content,
        lastUpdate: item.updated_at || item.created_at || '',
        relevance: this.calculateRelevance(query, item.title, item.description, item.content)
      }));
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Recherche dans les procédures
  static async searchProcedures(query: string, filters: {
    category?: string;
    institution?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<SearchResult[]> {
    try {
      let searchQuery = supabase
        .from('administrative_procedures')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

      // Appliquer les filtres
      if (filters.category && filters.category !== 'all') {
        searchQuery = searchQuery.eq('category', filters.category);
      }
      if (filters.institution && filters.institution !== 'all') {
        searchQuery = searchQuery.eq('institution', filters.institution);
      }
      if (filters.dateFrom) {
        searchQuery = searchQuery.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        searchQuery = searchQuery.lte('created_at', filters.dateTo);
      }

      const { data, error } = await searchQuery.limit(50);

      if (error) {
        console.error('Error searching procedures:', error);
        return [];
      }

      return ((data as any[]) || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        type: 'procedure' as const,
        category: item.category,
        description: item.description || '',
        institution: item.institution,
        lastUpdate: item.updated_at || item.created_at || '',
        relevance: this.calculateRelevance(query, item.title, item.description)
      }));
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Recherche unifiée
  static async searchAll(query: string, filters: Record<string, string> = {}): Promise<SearchResult[]> {
    const [legalTexts, procedures] = await Promise.all([
      this.searchLegalTexts(query, filters),
      this.searchProcedures(query, filters)
    ]);

    const merged = [...legalTexts, ...procedures];
    if (!query || !merged.length) return merged.sort((a, b) => b.relevance - a.relevance);

    try {
      // Embedding local de la requête (Ollama si dispo, sinon BoW)
      const qEmb = await getLocalEmbedding(query);
      const embedWeight = 0.6; // pondération embedding
      const bm25Weight = 0.4;  // pondération lexicale

      // Construire un embedding simple pour chaque élément (titre + desc + contenu tronqué)
      const scored = await Promise.all(
        merged.map(async (r) => {
          const text = [r.title, r.description, (r.content || '').slice(0, 2000)].filter(Boolean).join('\n');
          const dEmb = await getLocalEmbedding(text);
          const sim = cosineSimilarity(qEmb.vector, dEmb.vector) || 0;
          const hybrid = bm25Weight * r.relevance + embedWeight * sim;
          return { ...r, relevance: hybrid } as SearchResult;
        })
      );

      return scored.sort((a, b) => b.relevance - a.relevance);
    } catch {
      // En cas d'échec embedding, fallback sur tri courant
      return merged.sort((a, b) => b.relevance - a.relevance);
    }
  }

  // Calcul simple de pertinence
  private static calculateRelevance(query: string, title: string, description?: string, content?: string): number {
    const searchTerm = query.toLowerCase();
    let score = 0;

    // Titre (poids 3)
    if (title.toLowerCase().includes(searchTerm)) {
      score += 3;
    }

    // Description (poids 2)
    if (description?.toLowerCase().includes(searchTerm)) {
      score += 2;
    }

    // Contenu (poids 1)
    if (content?.toLowerCase().includes(searchTerm)) {
      score += 1;
    }

    return Math.min(score / 6, 1); // Normaliser entre 0 et 1
  }
}