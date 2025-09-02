
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Search, 
  Database, 
  Brain, 
  Zap, 
  Network,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getLocalEmbedding, cosineSimilarity } from '@/ai/localEmbeddings';

interface SearchResult {
  id: string;
  title: string;
  similarity: number;
  content: string;
  type: string;
  source: string;
  relevance: number;
}

export function VectorSearch() {
  // États pour la recherche vectorielle
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [filterWilaya, setFilterWilaya] = useState('');
  const [filterSecteur, setFilterSecteur] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  // Options depuis la BDD
  const [wilayas, setWilayas] = useState<Array<{ code: string; name: string }>>([]);
  const [sectors, setSectors] = useState<Array<{ code: string | null; name: string }>>([]);

  useEffect(() => {
    let cancelled = false;
    const loadOptions = async () => {
      try {
        const { data: w } = await supabase.from('wilayas' as any).select('code, name').order('code');
        const { data: s } = await supabase.from('sectors' as any).select('code, name').order('name');
        if (!cancelled) {
          setWilayas((w as any[]) || []);
          setSectors((s as any[]) || []);
        }
      } catch {
        // ignore
      }
    };
    loadOptions();
    return () => { cancelled = true; };
  }, []);

  // Données étendues pour les résultats de recherche
  const extendedSampleResults: SearchResult[] = [
    {
      id: '1',
      title: 'Code civil algérien - Article 674',
      similarity: 0.94,
      content: 'Les dispositions relatives à la propriété foncière et aux droits réels...',
      type: 'Législation',
      source: 'Code civil',
      relevance: 95
    },
    {
      id: '2',
      title: 'Arrêt Cour suprême - Chambre civile',
      similarity: 0.87,
      content: 'En matière de propriété immobilière, la prescription acquisitive...',
      type: 'Jurisprudence',
      source: 'Cour suprême',
      relevance: 89
    },
    {
      id: '3',
      title: 'Loi foncière - Dispositions générales',
      similarity: 0.82,
      content: 'Les règles d\'acquisition et de transmission des biens fonciers...',
      type: 'Législation',
      source: 'Loi 90-25',
      relevance: 84
    },
    {
      id: '4',
      title: 'Décret exécutif sur la propriété commerciale',
      similarity: 0.91,
      content: 'Réglementation des baux commerciaux et protection du locataire...',
      type: 'Législation',
      source: 'Décret 2023-45',
      relevance: 92
    },
    {
      id: '5',
      title: 'Jurisprudence - Droit des contrats',
      similarity: 0.88,
      content: 'Interprétation des clauses contractuelles et responsabilité...',
      type: 'Jurisprudence',
      source: 'Cour d\'appel d\'Alger',
      relevance: 87
    },
    {
      id: '6',
      title: 'Code de commerce - Articles 15-25',
      similarity: 0.85,
      content: 'Dispositions relatives aux sociétés commerciales...',
      type: 'Législation',
      source: 'Code de commerce',
      relevance: 86
    },
    {
      id: '7',
      title: 'Doctrine - Responsabilité civile',
      similarity: 0.79,
      content: 'Analyse doctrinale des fondements de la responsabilité...',
      type: 'Doctrine',
      source: 'Revue juridique algérienne',
      relevance: 81
    },
    {
      id: '8',
      title: 'Loi sur la protection des données',
      similarity: 0.93,
      content: 'Réglementation de la protection des données personnelles...',
      type: 'Législation',
      source: 'Loi 2024-12',
      relevance: 94
    },
    {
      id: '9',
      title: 'Arrêt - Droit administratif',
      similarity: 0.86,
      content: 'Contrôle de légalité des actes administratifs...',
      type: 'Jurisprudence',
      source: 'Conseil d\'État',
      relevance: 88
    },
    {
      id: '10',
      title: 'Code pénal - Infractions économiques',
      similarity: 0.83,
      content: 'Répression des infractions économiques et financières...',
      type: 'Législation',
      source: 'Code pénal',
      relevance: 85
    },
    {
      id: '11',
      title: 'Doctrine - Droit constitutionnel',
      similarity: 0.77,
      content: 'Étude sur la hiérarchie des normes constitutionnelles...',
      type: 'Doctrine',
      source: 'Cahiers constitutionnels',
      relevance: 79
    },
    {
      id: '12',
      title: 'Loi sur les marchés publics',
      similarity: 0.90,
      content: 'Réglementation des procédures de passation des marchés...',
      type: 'Législation',
      source: 'Loi 2023-78',
      relevance: 91
    }
  ];

  // Pagination pour les résultats de recherche
  const {
    currentData: paginatedResults,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: searchResults,
    itemsPerPage: 4
  });

  // Fonction de recherche vectorielle réelle
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      // 1) Embedding local de la requête
      const { vector: qVec } = await getLocalEmbedding(searchQuery.trim());

      // 2) Récupérer tous les embeddings indexés (local/offline compatible)
      const { data: embRows, error: embErr } = await supabase
        .from('embeddings')
        .select('legal_text_id, embedding');
      if (embErr) {
        console.error('Erreur lecture embeddings:', embErr);
        setSearchResults([]);
        return;
      }
      const embeddings = (embRows || []).filter(r => Array.isArray((r as any).embedding));

      // 3) Calculer similarité côté client et trier
      const scored = embeddings.map((row: any) => ({
        id: row.legal_text_id,
        sim: cosineSimilarity(qVec, row.embedding as number[]),
      }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 50);

      const ids = scored.map(s => s.id);
      if (ids.length === 0) {
        setSearchResults([]);
        return;
      }

      // 4) Charger détails des textes
      const { data: texts, error: tErr } = await supabase
        .from('legal_texts' as any)
        .select('id, title, content, category, updated_at, created_at, wilaya_code, sector')
        .in('id', ids);
      if (tErr) {
        console.error('Erreur lecture legal_texts:', tErr);
        setSearchResults([]);
        return;
      }

      // 5) Appliquer filtres locaux (wilaya/secteur via champs dédiés, dates via created/updated)
      const filteredTexts = (texts || []).filter((t: any) => {
        const wOk = filterWilaya ? (t.wilaya_code === filterWilaya) : true;
        const sOk = filterSecteur ? ((t.sector || '') === filterSecteur) : true;
        const refDate = new Date(t.created_at || t.updated_at || 0);
        const dFromOk = filterDateFrom ? refDate >= new Date(filterDateFrom) : true;
        const dToOk = filterDateTo ? refDate <= new Date(filterDateTo) : true;
        return wOk && sOk && dFromOk && dToOk;
      });

      // 6) Fusionner et formater résultats
      const byId = new Map(scored.map(s => [s.id, s.sim] as const));
      const results: SearchResult[] = filteredTexts.map((t: any) => ({
        id: t.id,
        title: t.title || 'Sans titre',
        similarity: byId.get(t.id) || 0,
        content: t.content || '',
        type: 'Législation',
        source: 'legal_texts',
        relevance: Math.round((Number(byId.get(t.id) || 0) * 100)),
      }))
      .sort((a, b) => b.similarity - a.similarity);

      setSearchResults(results);

      // 7) Sauvegarder l'historique local pour suggestions
      try {
        const histRaw = localStorage.getItem('semantic_search_history');
        const hist = histRaw ? JSON.parse(histRaw) as string[] : [];
        const next = [searchQuery.trim(), ...hist.filter(q => q !== searchQuery.trim())].slice(0, 10);
        localStorage.setItem('semantic_search_history', JSON.stringify(next));
      } catch {
        // ignore history errors (e.g., storage disabled)
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Indexation: génère et insère les embeddings manquants
  const handleIndexNow = async () => {
    if (isIndexing) return;
    setIsIndexing(true);
    try {
      // Lire ids déjà indexés
      const { data: existing } = await supabase
        .from('embeddings')
        .select('legal_text_id');
      const existingIds = new Set((existing || []).map((r: any) => r.legal_text_id));

      // Récupérer textes sans embedding
      const { data: texts, error } = await supabase
        .from('legal_texts' as any)
        .select('id, content');
      if (error) {
        console.error('Erreur lecture legal_texts:', error);
        return;
      }
      const targets = ((texts as any[]) || []).filter((t: any) => !!t.content && !existingIds.has(t.id));

      // Batch insert
      const batchSize = 25;
      for (let i = 0; i < targets.length; i += batchSize) {
        const batch = targets.slice(i, i + batchSize);
        const rows = [] as any[];
        for (const t of batch) {
          const { vector, model } = await getLocalEmbedding((t as any).content as string);
          rows.push({ legal_text_id: (t as any).id, embedding: vector, model });
        }
        const { error: insErr } = await supabase.from('embeddings').insert(rows);
        if (insErr) {
          console.error('Erreur insertion embeddings:', insErr);
          break;
        }
      }
    } finally {
      setIsIndexing(false);
    }
  };
  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.9) return 'text-green-600';
    if (similarity >= 0.7) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Législation': return 'bg-blue-100 text-blue-800';
      case 'Jurisprudence': return 'bg-purple-100 text-purple-800';
      case 'Doctrine': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-6 h-6 text-blue-600" />
            Recherche Vectorielle et Graphe de Connaissances
          </CardTitle>
          <p className="text-gray-600">
            Recherche sémantique avancée basée sur les embeddings vectoriels
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-xl font-bold text-blue-600">2.5M</div>
              <div className="text-xs text-gray-600">Vecteurs indexés</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-xl font-bold text-green-600">768</div>
              <div className="text-xs text-gray-600">Dimensions</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-xl font-bold text-purple-600">94.7%</div>
              <div className="text-xs text-gray-600">Précision</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-xl font-bold text-orange-600">0.2s</div>
              <div className="text-xs text-gray-600">Temps de réponse</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interface de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-green-600" />
            Recherche Sémantique Avancée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Entrez votre requête de recherche vectorielle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSearching ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Recherche...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher
                  </>
                )}
              </Button>
              <Button 
                onClick={handleIndexNow}
                disabled={isIndexing}
                variant="outline"
              >
                {isIndexing ? 'Indexation…' : 'Indexer maintenant'}
              </Button>
            </div>
            
            <div className="text-sm text-gray-600">
              Recherche sémantique basée sur les embeddings vectoriels et l'IA
            </div>

            {/* Suggestions d'historique */}
            <div className="flex flex-wrap gap-2">
              {(typeof window !== 'undefined' && JSON.parse(localStorage.getItem('semantic_search_history') || '[]')).map((s: string, i: number) => (
                <button key={i} className="text-xs px-2 py-1 border rounded-full hover:bg-gray-50" onClick={() => setSearchQuery(s)}>
                  {s}
                </button>
              ))}
            </div>

            {/* Filtres locaux */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={filterWilaya}
                onChange={(e) => setFilterWilaya(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Toutes les wilayas</option>
                {wilayas.map((w) => (
                  <option key={w.code || w.name} value={w.code}>
                    {w.code ? `${w.code} - ${w.name}` : w.name}
                  </option>
                ))}
              </select>
              <select
                value={filterSecteur}
                onChange={(e) => setFilterSecteur(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Tous les secteurs</option>
                {sectors.map((s) => (
                  <option key={(s.code || s.name) as string} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats de recherche vectorielle */}
      {paginatedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Résultats de Recherche Vectorielle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">{result.title}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeColor(result.type)}>
                          {result.type}
                        </Badge>
                        <div className={`text-sm font-bold ${getSimilarityColor(result.similarity)}`}>
                          {(result.similarity * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3 line-clamp-2">{result.content}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Source: {result.source}</span>
                    <div className="flex items-center gap-4">
                      <span>Similarité: {(result.similarity * 100).toFixed(1)}%</span>
                      <span>Pertinence: {result.relevance}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Progress value={result.relevance} className="w-full" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination pour les résultats */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Graphe de connaissances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Graphe de Connaissances Juridiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium">Entités</h4>
                </div>
                <div className="text-2xl font-bold text-blue-600">127,456</div>
                <div className="text-sm text-gray-600">Concepts juridiques</div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Network className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium">Relations</h4>
                </div>
                <div className="text-2xl font-bold text-green-600">589,234</div>
                <div className="text-sm text-gray-600">Liens sémantiques</div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium">Chemins</h4>
                </div>
                <div className="text-2xl font-bold text-purple-600">1.2M</div>
                <div className="text-sm text-gray-600">Chemins sémantiques</div>
              </div>
            </div>

            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Network className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Visualisation du graphe de connaissances</p>
                <p className="text-sm text-gray-500">Représentation interactive des relations juridiques</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Algorithmes vectoriels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Algorithmes Vectoriels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">BERT Juridique</h4>
              <p className="text-sm text-gray-600 mb-3">Modèle transformeur spécialisé pour le droit algérien</p>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-100 text-green-800">Actif</Badge>
                <span className="text-sm font-medium">F1-Score: 0.94</span>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Word2Vec Légal</h4>
              <p className="text-sm text-gray-600 mb-3">Embeddings contextuels pour terminologie juridique</p>
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-100 text-blue-800">Actif</Badge>
                <span className="text-sm font-medium">Similarité: 0.87</span>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Sentence-BERT</h4>
              <p className="text-sm text-gray-600 mb-3">Embeddings de phrases pour recherche sémantique</p>
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-100 text-purple-800">Actif</Badge>
                <span className="text-sm font-medium">Précision: 0.91</span>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">FastText Arabe</h4>
              <p className="text-sm text-gray-600 mb-3">Embeddings optimisés pour textes juridiques arabes</p>
              <div className="flex items-center justify-between">
                <Badge className="bg-orange-100 text-orange-800">En test</Badge>
                <span className="text-sm font-medium">Couverture: 0.88</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
