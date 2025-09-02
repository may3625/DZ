
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  TrendingUp,
  Users,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Building2,
  X,
  RotateCcw
} from 'lucide-react';

interface ProcedureMetrics {
  id: string;
  name: string;
  averageTime: number;
  steps: number;
  documents: number;
  administrations: number;
  cost: number;
  complexityScore: number;
  successRate: number;
  userSatisfaction: number;
  feedbackCount: number;
  trends: {
    timeChange: number;
    satisfactionChange: number;
  };
  category?: string;
}

interface UserFeedbackAnalysisProps {
  procedures: ProcedureMetrics[];
}

// Données simulées de feedback détaillé
const mockFeedbackData = {
  '1': { // Création SARL
    ratings: { 5: 45, 4: 32, 3: 28, 2: 15, 1: 36 },
    comments: [
      { id: 1, rating: 2, comment: "Trop de documents demandés, processus très long", category: "documents", date: "2024-01-15" },
      { id: 2, rating: 4, comment: "Personnel accueillant mais délais trop longs", category: "délais", date: "2024-01-12" },
      { id: 3, rating: 5, comment: "Excellente digitalisation du processus", category: "digitalisation", date: "2024-01-10" },
      { id: 4, rating: 3, comment: "Processus amélioré mais encore des lenteurs", category: "performance", date: "2024-01-08" },
      { id: 5, rating: 4, comment: "Interface utilisateur intuitive et claire", category: "interface", date: "2024-01-06" },
      { id: 6, rating: 2, comment: "Manque d'informations sur les délais", category: "information", date: "2024-01-04" },
      { id: 7, rating: 5, comment: "Service client très réactif et professionnel", category: "service", date: "2024-01-02" },
      { id: 8, rating: 3, comment: "Procédure acceptable mais pourrait être simplifiée", category: "simplification", date: "2023-12-30" }
    ],
    commonIssues: [
      { issue: "Délais trop longs", count: 67, percentage: 43 },
      { issue: "Documents redondants", count: 45, percentage: 29 },
      { issue: "Manque d'information", count: 28, percentage: 18 },
      { issue: "Personnel non formé", count: 16, percentage: 10 }
    ]
  },
  '2': { // Demande Passeport
    ratings: { 5: 178, 4: 125, 3: 89, 2: 25, 1: 15 },
    comments: [
      { id: 1, rating: 5, comment: "Processus rapide et efficace", category: "efficacité", date: "2024-01-16" },
      { id: 2, rating: 4, comment: "Bon service mais attente longue", category: "attente", date: "2024-01-14" },
      { id: 3, rating: 3, comment: "Procédure claire mais coûteuse", category: "coût", date: "2024-01-11" },
      { id: 4, rating: 5, comment: "Excellent accueil et accompagnement", category: "accueil", date: "2024-01-09" },
      { id: 5, rating: 4, comment: "Documentation claire et complète", category: "documentation", date: "2024-01-07" },
      { id: 6, rating: 2, comment: "Délais de traitement trop longs", category: "délais", date: "2024-01-05" },
      { id: 7, rating: 5, comment: "Personnel compétent et disponible", category: "personnel", date: "2024-01-03" },
      { id: 8, rating: 3, comment: "Procédure standard mais efficace", category: "procédure", date: "2023-12-31" }
    ],
    commonIssues: [
      { issue: "Files d'attente", count: 89, percentage: 21 },
      { issue: "Horaires limitées", count: 67, percentage: 15 },
      { issue: "Coût élevé", count: 45, percentage: 10 },
      { issue: "Délai de livraison", count: 34, percentage: 8 }
    ]
  },
  '3': { // Permis de Construire
    ratings: { 5: 12, 4: 18, 3: 25, 2: 28, 1: 6 },
    comments: [
      { id: 1, rating: 1, comment: "Processus extrêmement complexe et long", category: "complexité", date: "2024-01-13" },
      { id: 2, rating: 2, comment: "Manque de coordination entre services", category: "coordination", date: "2024-01-09" },
      { id: 3, rating: 3, comment: "Amélioration nécessaire de la communication", category: "communication", date: "2024-01-08" },
      { id: 4, rating: 2, comment: "Délais d'attente excessifs", category: "délais", date: "2024-01-06" },
      { id: 5, rating: 1, comment: "Procédure trop bureaucratique", category: "bureaucratie", date: "2024-01-04" },
      { id: 6, rating: 3, comment: "Manque de transparence dans les décisions", category: "transparence", date: "2024-01-02" },
      { id: 7, rating: 2, comment: "Coordination défaillante entre administrations", category: "coordination", date: "2023-12-30" },
      { id: 8, rating: 1, comment: "Processus inadapté aux besoins réels", category: "adaptation", date: "2023-12-28" }
    ],
    commonIssues: [
      { issue: "Processus trop complexe", count: 45, percentage: 51 },
      { issue: "Manque de coordination", count: 32, percentage: 36 },
      { issue: "Communication insuffisante", count: 28, percentage: 31 },
      { issue: "Délais non respectés", count: 23, percentage: 26 }
    ]
  }
};

// Données étendues des procédures pour la démonstration
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
    category: 'Commerce International'
  },
  {
    id: '7',
    name: 'Permis de Conduire',
    averageTime: 10,
    steps: 5,
    documents: 3,
    administrations: 2,
    cost: 5000,
    complexityScore: 3.2,
    successRate: 96,
    userSatisfaction: 4.5,
    feedbackCount: 567,
    trends: { timeChange: -2, satisfactionChange: 15 },
    category: 'Transport'
  },
  {
    id: '8',
    name: 'Carte d\'Identité',
    averageTime: 5,
    steps: 4,
    documents: 2,
    administrations: 1,
    cost: 2000,
    complexityScore: 2.1,
    successRate: 99,
    userSatisfaction: 4.7,
    feedbackCount: 789,
    trends: { timeChange: -1, satisfactionChange: 8 },
    category: 'État Civil'
  }
];

export function UserFeedbackAnalysis({ procedures }: UserFeedbackAnalysisProps) {
  const [selectedProcedure, setSelectedProcedure] = useState<string>('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [satisfactionFilter, setSatisfactionFilter] = useState<string>('all');
  
  // États de pagination pour les commentaires de chaque procédure
  const [procedurePagination, setProcedurePagination] = useState<Record<string, { currentPage: number; itemsPerPage: number }>>({});

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setSatisfactionFilter('all');
  };

  const getProcedurePagination = (procedureId: string) => {
    return procedurePagination[procedureId] || { currentPage: 1, itemsPerPage: 5 };
  };

  const updateProcedurePagination = (procedureId: string, updates: Partial<{ currentPage: number; itemsPerPage: number }>) => {
    setProcedurePagination(prev => ({
      ...prev,
      [procedureId]: { ...getProcedurePagination(procedureId), ...updates }
    }));
  };

  const categories = [...new Set(extendedProcedures.map(p => p.category))];

  // Filtrage des procédures
  const filteredProcedures = extendedProcedures.filter(procedure => {
    const matchesSearch = procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         procedure.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || procedure.category === categoryFilter;
    
    const matchesSatisfaction = satisfactionFilter === 'all' ||
      (satisfactionFilter === 'high' && procedure.userSatisfaction >= 4) ||
      (satisfactionFilter === 'medium' && procedure.userSatisfaction >= 3 && procedure.userSatisfaction < 4) ||
      (satisfactionFilter === 'low' && procedure.userSatisfaction < 3);

    return matchesSearch && matchesCategory && matchesSatisfaction;
  });

  const getSatisfactionColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
  };

  // Pagination pour l'ensemble des procédures disponibles avec filtres
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
    itemsPerPage: 3
  });

  // Pagination pour les commentaires
  const feedbackData = mockFeedbackData[selectedProcedure as keyof typeof mockFeedbackData];
  const comments = feedbackData?.comments || [];
  
  const {
    currentData: paginatedComments,
    currentPage: commentsCurrentPage,
    totalPages: commentsTotalPages,
    itemsPerPage: commentsItemsPerPage,
    totalItems: commentsTotalItems,
    setCurrentPage: setCommentsCurrentPage,
    setItemsPerPage: setCommentsItemsPerPage
  } = usePagination({
    data: comments,
    itemsPerPage: 5
  });

  return (
    <div className="space-y-6">
      {/* Aperçu général du feedback */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <ThumbsUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Satisfaction Moyenne</p>
              <p className="text-2xl font-bold mt-2 text-green-600">
                {(filteredProcedures.reduce((acc, p) => acc + p.userSatisfaction, 0) / filteredProcedures.length).toFixed(1)}/5
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold mt-2 text-blue-600">
                {filteredProcedures.reduce((acc, p) => acc + p.feedbackCount, 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs Actifs</p>
              <p className="text-2xl font-bold mt-2 text-purple-600">
                {Math.round(filteredProcedures.reduce((acc, p) => acc + p.feedbackCount, 0) * 0.8)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Temps Moyen</p>
              <p className="text-2xl font-bold mt-2 text-orange-600">
                {Math.round(filteredProcedures.reduce((acc, p) => acc + p.averageTime, 0) / filteredProcedures.length)}j
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres pour les procédures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtrer les Procédures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher une procédure..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
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

            <Select value={satisfactionFilter} onValueChange={setSatisfactionFilter}>
              <SelectTrigger className="w-48">
                <Star className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Satisfaction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes satisfactions</SelectItem>
                <SelectItem value="high">Haute (≥4/5)</SelectItem>
                <SelectItem value="medium">Moyenne (3-4/5)</SelectItem>
                <SelectItem value="low">Faible (&lt;3/5)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </Button>
          </div>

          {/* Indicateur de résultats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{totalItems} procédure{totalItems > 1 ? 's' : ''} trouvée{totalItems > 1 ? 's' : ''}</span>
            {(searchTerm || categoryFilter !== 'all' || satisfactionFilter !== 'all') && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-blue-600">
                <X className="w-3 h-3 mr-1" />
                Effacer les filtres
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analyse détaillée par procédure avec pagination */}
      <div className="space-y-6">
        {paginatedProcedures.map((procedure) => {
          const currentFeedbackData = mockFeedbackData[procedure.id as keyof typeof mockFeedbackData];
          const currentComments = currentFeedbackData?.comments || [];
          
          // Utilisation de la pagination centralisée
          const pagination = getProcedurePagination(procedure.id.toString());
          const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
          const endIndex = startIndex + pagination.itemsPerPage;
          const paginatedProcedureComments = currentComments.slice(startIndex, endIndex);
          const procedureTotalPages = Math.ceil(currentComments.length / pagination.itemsPerPage);
          const procedureTotalItems = currentComments.length;

          const totalRatings = currentFeedbackData ? Object.values(currentFeedbackData.ratings).reduce((acc, count) => acc + count, 0) : 0;

          return (
            <Card key={procedure.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                      {procedure.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {procedure.feedbackCount} commentaires • Satisfaction: {procedure.userSatisfaction}/5
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Tendance</div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(procedure.trends.satisfactionChange)}
                        <span className={`text-sm font-medium ${procedure.trends.satisfactionChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(procedure.trends.satisfactionChange)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Distribution des notes */}
                  <div>
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Distribution des Notes
                    </h4>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = currentFeedbackData?.ratings?.[rating as keyof typeof currentFeedbackData.ratings] || 0;
                        const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
                        
                        return (
                          <div key={rating} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-12">
                              <span className="text-sm">{rating}</span>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            </div>
                            <Progress value={percentage} className="flex-1 h-2" />
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {count} ({percentage}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Problèmes les plus fréquents */}
                  <div>
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Problèmes Identifiés
                    </h4>
                    <div className="space-y-3">
                      {currentFeedbackData?.commonIssues?.map((issue, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{issue.issue}</p>
                            <p className="text-xs text-gray-600">{issue.count} mentions</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {issue.percentage}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Commentaires récents */}
                <div className="mt-6">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Commentaires Récents
                  </h4>
                  <div className="space-y-3">
                    {paginatedProcedureComments.map((comment) => (
                      <div key={comment.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= comment.rating 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {comment.category}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">{comment.date}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination pour les commentaires */}
                  {procedureTotalPages > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={procedureTotalPages}
                        totalItems={procedureTotalItems}
                        itemsPerPage={pagination.itemsPerPage}
                        onPageChange={(page) => updateProcedurePagination(procedure.id.toString(), { currentPage: page })}
                        onItemsPerPageChange={(itemsPerPage) => updateProcedurePagination(procedure.id.toString(), { itemsPerPage, currentPage: 1 })}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination pour l'ensemble des procédures */}
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
    </div>
  );
}
