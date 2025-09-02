export interface SearchPreferences {
  id: string;
  name: string;
  searchTerm: string;
  filters: {
    types: string[];
    statuses: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    institutions: string[];
    categories: string[];
  };
  sortBy: {
    field: string;
    direction: 'asc' | 'desc';
  };
  createdAt: string;
  lastUsed: string;
}

const STORAGE_KEY = 'search_preferences';

export class SearchPreferencesService {
  static getAll(): SearchPreferences[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static save(preferences: Omit<SearchPreferences, 'id' | 'createdAt' | 'lastUsed'>): SearchPreferences {
    const all = this.getAll();
    const newPreference: SearchPreferences = {
      ...preferences,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    
    all.push(newPreference);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return newPreference;
  }

  static update(id: string, updates: Partial<SearchPreferences>): SearchPreferences | null {
    const all = this.getAll();
    const index = all.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    all[index] = { ...all[index], ...updates, lastUsed: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return all[index];
  }

  static delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter(p => p.id !== id);
    
    if (filtered.length === all.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  static markAsUsed(id: string): void {
    this.update(id, { lastUsed: new Date().toISOString() });
  }

  static getRecent(limit: number = 5): SearchPreferences[] {
    return this.getAll()
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, limit);
  }
}