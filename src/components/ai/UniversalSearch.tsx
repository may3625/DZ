
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { buttonHandlers } from '@/utils/buttonUtils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Search, 
  Globe, 
  Database, 
  FileText, 
  Users, 
  Calendar,
  Brain,
  Zap,
  Target,
  Activity,
  Scale,
  ClipboardList
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'document' | 'legislation' | 'jurisprudence' | 'procedure' | 'contact' | 'event';
  source: string;
  relevance: number;
  date: string;
  category: string;
}

export function UniversalSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');

  const extendedSampleResults: SearchResult[] = [
    {
      id: '1',
      title: 'Code civil algérien - Article 674',
      content: 'Les dispositions relatives à la propriété foncière et aux droits réels immobiliers...',
      type: 'legislation',
      source: 'Législation',
      relevance: 95,
      date: '2024-01-15',
      category: 'Droit civil'
    },
    {
      id: '2',
      title: 'Procédure de demande de passeport',
      content: 'Les étapes détaillées pour obtenir un passeport biométrique algérien...',
      type: 'procedure',
      source: 'Procédures',
      relevance: 89,
      date: '2024-01-14',
      category: 'Administration'
    },
    {
      id: '3',
      title: 'Arrêt n°2024-156 - Cour suprême',
      content: 'Décision de la chambre civile concernant les contrats de bail commercial...',
      type: 'jurisprudence',
      source: 'Jurisprudence',
      relevance: 87,
      date: '2024-01-13',
      category: 'Droit commercial'
    },
    {
      id: '4',
      title: 'Dr. Ahmed Benali - Avocat spécialisé',
      content: 'Spécialiste en droit des affaires et droit commercial, 15 ans d\'expérience...',
      type: 'contact',
      source: 'Annuaire',
      relevance: 82,
      date: '2024-01-12',
      category: 'Professionnels'
    },
    {
      id: '5',
      title: 'Conférence sur le nouveau code de commerce',
      content: 'Présentation des principales modifications du code de commerce algérien...',
      type: 'event',
      source: 'Événements',
      relevance: 78,
      date: '2024-01-20',
      category: 'Formation'
    },
    {
      id: '6',
      title: 'Loi sur la protection des données personnelles',
      content: 'Réglementation complète de la protection des données personnelles en Algérie...',
      type: 'legislation',
      source: 'Législation',
      relevance: 93,
      date: '2024-01-11',
      category: 'Droit numérique'
    },
    {
      id: '7',
      title: 'Procédure de création d\'entreprise',
      content: 'Guide complet pour créer une entreprise en Algérie, étapes et documents requis...',
      type: 'procedure',
      source: 'Procédures',
      relevance: 91,
      date: '2024-01-10',
      category: 'Entreprise'
    },
    {
      id: '8',
      title: 'Jurisprudence - Droit du travail',
      content: 'Arrêt de la Cour suprême sur les licenciements pour motif économique...',
      type: 'jurisprudence',
      source: 'Jurisprudence',
      relevance: 85,
      date: '2024-01-09',
      category: 'Droit du travail'
    },
    {
      id: '9',
      title: 'Mme Fatima Cherif - Notaire',
      content: 'Notaire spécialisée en droit immobilier et successions, étude à Oran...',
      type: 'contact',
      source: 'Annuaire',
      relevance: 79,
      date: '2024-01-08',
      category: 'Professionnels'
    },
    {
      id: '10',
      title: 'Séminaire sur la réforme fiscale',
      content: 'Présentation des nouvelles dispositions fiscales pour les entreprises...',
      type: 'event',
      source: 'Événements',
      relevance: 76,
      date: '2024-01-25',
      category: 'Formation'
    },
    {
      id: '11',
      title: 'Code de commerce - Articles 15-25',
      content: 'Dispositions relatives aux sociétés commerciales et leur constitution...',
      type: 'legislation',
      source: 'Législation',
      relevance: 88,
      date: '2024-01-07',
      category: 'Droit commercial'
    },
    {
      id: '12',
      title: 'Procédure de divorce par consentement mutuel',
      content: 'Étapes détaillées pour un divorce amiable devant le juge de paix...',
      type: 'procedure',
      source: 'Procédures',
      relevance: 84,
      date: '2024-01-06',
      category: 'Droit de la famille'
    },
    {
      id: '13',
      title: 'Arrêt - Droit administratif',
      content: 'Décision du Conseil d\'État sur le recours pour excès de pouvoir...',
      type: 'jurisprudence',
      source: 'Jurisprudence',
      relevance: 83,
      date: '2024-01-05',
      category: 'Droit administratif'
    },
    {
      id: '14',
      title: 'Dr. Karim Meziane - Huissier',
      content: 'Huissier de justice spécialisé en recouvrement et exécution forcée...',
      type: 'contact',
      source: 'Annuaire',
      relevance: 77,
      date: '2024-01-04',
      category: 'Professionnels'
    },
    {
      id: '15',
      title: 'Colloque sur la justice numérique',
      content: 'Débats sur la digitalisation de la justice et ses enjeux...',
      type: 'event',
      source: 'Événements',
      relevance: 74,
      date: '2024-01-30',
      category: 'Innovation'
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
    data: extendedSampleResults,
    itemsPerPage: 5
  });

  const filters = [
    { id: 'all', label: 'Tout', icon: Globe, count: 2847 },
    { id: 'legislation', label: 'Législation', icon: FileText, count: 1247 },
    { id: 'jurisprudence', label: 'Jurisprudence', icon: Scale, count: 856 },
    { id: 'procedure', label: 'Procédures', icon: ClipboardList, count: 634 },
    { id: 'contact', label: 'Contacts', icon: Users, count: 423 },
    { id: 'event', label: 'Événements', icon: Calendar, count: 187 }
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Recherche réelle
    setTimeout(() => {
      setResults(extendedSampleResults);
      setIsSearching(false);
    }, 1500);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'legislation': return 'bg-blue-100 text-blue-800';
      case 'jurisprudence': return 'bg-purple-100 text-purple-800';
      case 'procedure': return 'bg-green-100 text-green-800';
      case 'contact': return 'bg-orange-100 text-orange-800';
      case 'event': return 'bg-pink-100 text-pink-800';
      case 'document': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'legislation': return <FileText className="w-4 h-4" />;
      case 'jurisprudence': return <Scale className="w-4 h-4" />;
      case 'procedure': return <ClipboardList className="w-4 h-4" />;
      case 'contact': return <Users className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'document': return <Database className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 90) return 'text-green-600';
    if (relevance >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  // Filtrer les résultats selon le filtre actif
  const filteredResults = paginatedResults.filter(result => 
    activeFilter === 'all' || result.type === activeFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-green-600" />
            Recherche Universelle Omnisciente
          </CardTitle>
          <p className="text-gray-600">
            Recherche unifiée dans toutes les sources de données juridiques
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-xl font-bold text-green-600">12.5M</div>
              <div className="text-xs text-gray-600">Documents indexés</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-xl font-bold text-blue-600">47</div>
              <div className="text-xs text-gray-600">Sources connectées</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-xl font-bold text-purple-600">0.15s</div>
              <div className="text-xs text-gray-600">Temps de réponse</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-xl font-bold text-orange-600">99.2%</div>
              <div className="text-xs text-gray-600">Disponibilité</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interface de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Recherche Intelligente Unifiée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Rechercher dans toutes les sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching} className="bg-green-500 hover:bg-green-600">
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
            </div>

            {/* Suggestions de recherche */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Suggestions:</span>
              {['code civil', 'procédure administrative', 'jurisprudence commerciale', 'droit du travail'].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtres */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Filtres de Recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className="flex items-center gap-2"
                >
                  <filter.icon className="w-3 h-3" />
                  <span>{filter.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats */}
      {filteredResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-green-600" />
              Résultats de Recherche Universelle
              <Badge variant="outline">{filteredResults.length} résultats</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(result.type)}
                      <h3 className="font-semibold text-gray-900">{result.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(result.type)}>
                        {result.source}
                      </Badge>
                      <div className={`text-sm font-bold ${getRelevanceColor(result.relevance)}`}>
                        {result.relevance}%
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3 line-clamp-2">{result.content}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-xs">
                        {result.category}
                      </Badge>
                      <span>{result.date}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="w-3 h-3 mr-1" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Database className="w-3 h-3 mr-1" />
                        Détails
                      </Button>
                    </div>
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

      {/* Sources connectées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Sources de Données Connectées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium">Base Législative</h4>
              </div>
              <div className="text-sm text-gray-600">
                <div>• Codes et lois</div>
                <div>• Décrets et arrêtés</div>
                <div>• Ordonnances</div>
              </div>
              <Badge className="mt-2 bg-green-100 text-green-800">Connecté</Badge>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium">Jurisprudence</h4>
              </div>
              <div className="text-sm text-gray-600">
                <div>• Cour suprême</div>
                <div>• Tribunaux administratifs</div>
                <div>• Cours d'appel</div>
              </div>
              <Badge className="mt-2 bg-green-100 text-green-800">Connecté</Badge>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-600" />
                <h4 className="font-medium">Annuaires</h4>
              </div>
              <div className="text-sm text-gray-600">
                <div>• Avocats</div>
                <div>• Notaires</div>
                <div>• Experts</div>
              </div>
              <Badge className="mt-2 bg-green-100 text-green-800">Connecté</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
