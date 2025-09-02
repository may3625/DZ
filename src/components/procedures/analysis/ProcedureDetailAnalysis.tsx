import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SmartAutocomplete } from '@/components/common/SmartAutocomplete';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  FileText, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  BarChart3,
  Target,
  Lightbulb,
  Search,
  Filter,
  Star,
  MessageSquare,
  Brain,
  X,
  RotateCcw
} from 'lucide-react';
import { ProcedureMetrics } from './types';
import { getComplexityLevel } from './utils';

interface ProcedureDetailAnalysisProps {
  procedures: ProcedureMetrics[];
}

const extendedProcedures: ProcedureMetrics[] = [
  {
    id: '1',
    name: 'Création SARL',
    averageTime: 22,
    steps: 12,
    documents: 8,
    administrations: 4,
    cost: 25000,
    complexityScore: 7.8,
    successRate: 92,
    userSatisfaction: 3.4,
    feedbackCount: 156,
    trends: { timeChange: -15, satisfactionChange: 8 },
    description: 'Procédure de création d\'une Société à Responsabilité Limitée avec dépôt de capital et immatriculation au registre du commerce.',
    risks: ['Délais d\'instruction variables', 'Exigences documentaires strictes', 'Contrôle fiscal potentiel'],
    recommendations: ['Préparer tous les documents avant le dépôt', 'Consulter un expert-comptable', 'Prévoir un délai supplémentaire'],
    simplificationRecommendations: ['Dématérialiser complètement le dépôt de capital', 'Créer un guichet unique pour toutes les formalités', 'Automatiser la vérification des documents'],
    aiInsights: ['Taux de réussite en amélioration (+8%)', 'Délais raccourcis grâce à la dématérialisation', 'Documents manquants = cause principale de rejet'],
    category: 'Entreprise'
  },
  {
    id: '2',
    name: 'Demande Passeport',
    averageTime: 8,
    steps: 6,
    documents: 5,
    administrations: 2,
    cost: 3000,
    complexityScore: 4.2,
    successRate: 98,
    userSatisfaction: 4.1,
    feedbackCount: 432,
    trends: { timeChange: -3, satisfactionChange: 12 },
    description: 'Demande de passeport biométrique pour les citoyens algériens avec prise de rendez-vous en ligne.',
    risks: ['Délais d\'attente pour RDV', 'Photos non conformes', 'Documents périmés'],
    recommendations: ['Vérifier la validité des documents', 'Respecter les normes photos', 'Prendre RDV à l\'avance'],
    simplificationRecommendations: ['Augmenter les créneaux de rendez-vous', 'Permettre la prise de photo sur place', 'Intégrer la vérification automatique des documents'],
    aiInsights: ['Satisfaction en hausse grâce au service en ligne', 'Photos conformes = 95% de réussite', 'RDV en ligne réduit l\'attente de 60%'],
    category: 'État Civil'
  },
  {
    id: '3',
    name: 'Permis de Construire',
    averageTime: 45,
    steps: 18,
    documents: 15,
    administrations: 6,
    cost: 50000,
    complexityScore: 9.2,
    successRate: 78,
    userSatisfaction: 2.8,
    feedbackCount: 89,
    trends: { timeChange: 5, satisfactionChange: -8 },
    description: 'Autorisation de construire pour les projets immobiliers avec étude d\'impact et conformité urbanistique.',
    risks: ['Non-conformité au POS', 'Études techniques insuffisantes', 'Recours des tiers'],
    recommendations: ['Consulter le POS en amont', 'Faire appel à un architecte', 'Prévoir une étude géotechnique'],
    simplificationRecommendations: ['Créer une plateforme unique pour toutes les validations', 'Réduire le nombre d\'étapes de 18 à 10', 'Automatiser les vérifications de conformité de base'],
    aiInsights: ['Complexité croissante due aux nouvelles normes', 'Recours fréquents = principal facteur de délai', 'Dossiers complets = 85% d\'acceptation'],
    category: 'Urbanisme'
  },
  {
    id: '4',
    name: 'Licence Commerciale',
    averageTime: 15,
    steps: 8,
    documents: 6,
    administrations: 3,
    cost: 15000,
    complexityScore: 5.5,
    successRate: 85,
    userSatisfaction: 3.2,
    feedbackCount: 234,
    trends: { timeChange: -8, satisfactionChange: 5 },
    description: 'Autorisation d\'exercer une activité commerciale avec vérification des conditions d\'installation.',
    risks: ['Zone non autorisée', 'Documents incomplets', 'Délais variables'],
    recommendations: ['Vérifier la zone d\'implantation', 'Préparer tous les documents', 'Contacter l\'administration'],
    simplificationRecommendations: ['Créer un guichet unique', 'Simplifier les documents requis', 'Automatiser les vérifications'],
    aiInsights: ['Taux de réussite stable', 'Délais en amélioration', 'Documents complets = succès'],
    category: 'Commerce'
  },
  {
    id: '5',
    name: 'Certificat de Conformité',
    averageTime: 12,
    steps: 7,
    documents: 4,
    administrations: 2,
    cost: 8000,
    complexityScore: 3.8,
    successRate: 95,
    userSatisfaction: 4.3,
    feedbackCount: 189,
    trends: { timeChange: -5, satisfactionChange: 10 },
    description: 'Certification de conformité pour les produits industriels et commerciaux.',
    risks: ['Tests non conformes', 'Délais de laboratoire', 'Coûts variables'],
    recommendations: ['Préparer les échantillons', 'Vérifier les normes', 'Prévoir les coûts'],
    simplificationRecommendations: ['Accélérer les tests', 'Réduire les coûts', 'Améliorer la communication'],
    aiInsights: ['Satisfaction élevée', 'Délais optimisés', 'Qualité constante'],
    category: 'Industrie'
  },
  {
    id: '6',
    name: 'Autorisation d\'Import',
    averageTime: 25,
    steps: 14,
    documents: 12,
    administrations: 5,
    cost: 35000,
    complexityScore: 8.1,
    successRate: 72,
    userSatisfaction: 2.9,
    feedbackCount: 156,
    trends: { timeChange: 3, satisfactionChange: -5 },
    description: 'Autorisation d\'importer des marchandises avec contrôle douanier et fiscal.',
    risks: ['Documents manquants', 'Contrôles stricts', 'Délais imprévisibles'],
    recommendations: ['Préparer tous les documents', 'Anticiper les contrôles', 'Prévoir des délais'],
    simplificationRecommendations: ['Dématérialiser les procédures', 'Harmoniser les contrôles', 'Améliorer la transparence'],
    aiInsights: ['Complexité croissante', 'Contrôles renforcés', 'Délais variables'],
    category: 'Commerce International'
  }
];

export function ProcedureDetailAnalysis({ procedures }: ProcedureDetailAnalysisProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureMetrics | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [satisfactionRange, setSatisfactionRange] = useState<number[]>([1, 5]);
  const [complexityRange, setComplexityRange] = useState<number[]>([0, 10]);
  const [timeRange, setTimeRange] = useState<number[]>([0, 50]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const resetFilters = () => {
    setFilterType('all');
    setCategoryFilter('all');
    setSatisfactionRange([1, 5]);
    setComplexityRange([0, 10]);
    setTimeRange([0, 50]);
    setSearchTerm('');
  };

  const categories = [...new Set(extendedProcedures.map(p => p.category))];

  const filteredProcedures = extendedProcedures.filter(procedure => {
    const matchesSearch = procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         procedure.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         procedure.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || 
      (filterType === 'simple' && procedure.complexityScore <= 5) ||
      (filterType === 'complex' && procedure.complexityScore > 5) ||
      (filterType === 'fast' && procedure.averageTime <= 15) ||
      (filterType === 'slow' && procedure.averageTime > 15) ||
      (filterType === 'high-satisfaction' && procedure.userSatisfaction >= 4) ||
      (filterType === 'low-satisfaction' && procedure.userSatisfaction < 3);

    const matchesCategory = categoryFilter === 'all' || procedure.category === categoryFilter;
    
    const matchesSatisfaction = procedure.userSatisfaction >= satisfactionRange[0] && 
                               procedure.userSatisfaction <= satisfactionRange[1];
    
    const matchesComplexity = procedure.complexityScore >= complexityRange[0] && 
                             procedure.complexityScore <= complexityRange[1];
    
    const matchesTime = procedure.averageTime >= timeRange[0] && 
                       procedure.averageTime <= timeRange[1];

    return matchesSearch && matchesType && matchesCategory && 
           matchesSatisfaction && matchesComplexity && matchesTime;
  });

  // Pagination pour les procédures filtrées
  const {
    currentData: paginatedProcedures,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredProcedures,
    itemsPerPage: 5
  });

  const getSuggestions = () => [
    { id: '1', text: 'Création SARL', type: 'suggestion' as const },
    { id: '2', text: 'Demande Passeport', type: 'suggestion' as const },
    { id: '3', text: 'Permis de Construire', type: 'suggestion' as const },
    { id: '4', text: 'Procédures administratives', type: 'recent' as const },
    { id: '5', text: 'Délais moyens', type: 'recent' as const }
  ];

  return (
    <div className="space-y-6">
      {/* Barre de recherche et filtres améliorés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Rechercher et Filtrer les Procédures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <SmartAutocomplete
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Rechercher une procédure (ex: création SARL, passeport...)..."
                context="procedure"
                suggestions={getSuggestions()}
                enableVoice={true}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtres avancés
            </Button>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </Button>
          </div>

          {/* Filtres de base */}
          <div className="flex gap-4 flex-wrap">
            <div className="w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les procédures</SelectItem>
                  <SelectItem value="simple">Procédures simples</SelectItem>
                  <SelectItem value="complex">Procédures complexes</SelectItem>
                  <SelectItem value="fast">Procédures rapides (≤15j)</SelectItem>
                                  <SelectItem value="slow">Procédures longues (&gt;15j)</SelectItem>
                <SelectItem value="high-satisfaction">Haute satisfaction (≥4)</SelectItem>
                <SelectItem value="low-satisfaction">Satisfaction faible (&lt;3)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Building2 className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtres avancés */}
          {showAdvancedFilters && (
            <div className="border-t pt-4 mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Filtre de satisfaction */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Satisfaction utilisateur: {satisfactionRange[0]} - {satisfactionRange[1]}/5
                  </Label>
                  <Slider
                    value={satisfactionRange}
                    onValueChange={setSatisfactionRange}
                    max={5}
                    min={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Filtre de complexité */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Complexité: {complexityRange[0]} - {complexityRange[1]}/10
                  </Label>
                  <Slider
                    value={complexityRange}
                    onValueChange={setComplexityRange}
                    max={10}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Filtre de délais */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Délais: {timeRange[0]} - {timeRange[1]} jours
                  </Label>
                  <Slider
                    value={timeRange}
                    onValueChange={setTimeRange}
                    max={50}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Indicateur de résultats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{totalItems} procédure{totalItems > 1 ? 's' : ''} trouvée{totalItems > 1 ? 's' : ''}</span>
            {(searchTerm || filterType !== 'all' || categoryFilter !== 'all' || 
              satisfactionRange[0] !== 1 || satisfactionRange[1] !== 5 ||
              complexityRange[0] !== 0 || complexityRange[1] !== 10 ||
              timeRange[0] !== 0 || timeRange[1] !== 50) && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-blue-600">
                <X className="w-3 h-3 mr-1" />
                Effacer les filtres
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des procédures avec pagination */}
        <Card>
          <CardHeader>
            <CardTitle>Procédures Disponibles ({totalItems})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paginatedProcedures.map((procedure) => {
                const complexity = getComplexityLevel(procedure.complexityScore);
                return (
                  <div 
                    key={procedure.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedProcedure?.id === procedure.id ? 'border-emerald-500 bg-emerald-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedProcedure(procedure)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold">{procedure.name}</h4>
                      <Badge className={`${complexity.bg} ${complexity.color} border-0`}>
                        {complexity.level}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{procedure.averageTime}j</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{procedure.documents} docs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{procedure.successRate}% réussite</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span>{procedure.userSatisfaction}/5</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination */}
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

        {/* Détails de la procédure sélectionnée */}
        <div className="space-y-6">
          {selectedProcedure ? (
            <>
              {/* Métriques principales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {selectedProcedure.name} - Analyse Détaillée
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">{selectedProcedure.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-blue-600">{selectedProcedure.averageTime}j</div>
                        <div className="text-sm text-gray-600">Délai moyen</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-green-600">{selectedProcedure.successRate}%</div>
                        <div className="text-sm text-gray-600">Taux de réussite</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <FileText className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-purple-600">{selectedProcedure.documents}</div>
                        <div className="text-sm text-gray-600">Documents requis</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <Target className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-orange-600">{selectedProcedure.complexityScore}/10</div>
                        <div className="text-sm text-gray-600">Complexité</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risques identifiés */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Risques Identifiés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedProcedure.risks?.map((risk, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-700">{risk}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommandations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    Recommandations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedProcedure.recommendations?.map((recommendation, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                        <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <span className="text-sm text-yellow-700">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommandations de simplification et d'allègement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    Recommandations de simplification et d'allègement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedProcedure.simplificationRecommendations?.map((recommendation, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-emerald-50 rounded">
                        <Target className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm text-emerald-700">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Insights IA */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Insights IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedProcedure.aiInsights?.map((insight, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                        <Brain className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span className="text-sm text-purple-700">{insight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Feedback utilisateurs avec pagination */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Feedback Utilisateurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold">{selectedProcedure.userSatisfaction}/5</span>
                      <span className="text-gray-600">({selectedProcedure.feedbackCount} avis)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {selectedProcedure.trends.satisfactionChange > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={selectedProcedure.trends.satisfactionChange > 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(selectedProcedure.trends.satisfactionChange)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Commentaires paginés */}
                  <div className="space-y-3 mb-4">
                    {/* Simulation de commentaires avec pagination */}
                    {[1,2,3].map((i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">Utilisateur {i}</span>
                          <div className="flex gap-1">
                            {Array.from({length: 5}).map((_, idx) => (
                              <Star key={idx} className={`w-3 h-3 ${idx < 4 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">Commentaire d'exemple sur la procédure.</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Les utilisateurs apprécient particulièrement la clarté des instructions et la disponibilité du support.</p>
                    <p className="mt-2">Points d'amélioration identifiés : réduction des délais et simplification des documents requis.</p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Sélectionnez une procédure</h3>
                <p className="text-gray-500">Choisissez une procédure dans la liste pour voir son analyse détaillée</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
