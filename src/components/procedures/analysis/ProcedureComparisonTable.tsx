
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Clock, 
  FileText, 
  Building2, 
  DollarSign, 
  Target,
  Users,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
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

interface ProcedureComparisonTableProps {
  procedures: ProcedureMetrics[];
  selectedProcedures: string[];
  onSelectionChange: (selected: string[]) => void;
}

// Données étendues pour la démonstration
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

export function ProcedureComparisonTable({ 
  procedures, 
  selectedProcedures, 
  onSelectionChange 
}: ProcedureComparisonTableProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [complexityRange, setComplexityRange] = useState<number[]>([0, 10]);
  const [timeRange, setTimeRange] = useState<number[]>([0, 50]);
  const [satisfactionRange, setSatisfactionRange] = useState<number[]>([1, 5]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const resetFilters = () => {
    setFilterType('all');
    setSearchTerm('');
    setCategoryFilter('all');
    setComplexityRange([0, 10]);
    setTimeRange([0, 50]);
    setSatisfactionRange([1, 5]);
  };

  const categories = [...new Set(extendedProcedures.map(p => p.category))];

  const handleProcedureToggle = (procedureId: string) => {
    const isSelected = selectedProcedures.includes(procedureId);
    if (isSelected) {
      onSelectionChange(selectedProcedures.filter(id => id !== procedureId));
    } else if (selectedProcedures.length < 3) {
      onSelectionChange([...selectedProcedures, procedureId]);
    }
  };

  const getComplexityLevel = (score: number) => {
    if (score <= 3) return { level: 'Faible', color: 'text-green-600', bg: 'bg-green-50' };
    if (score <= 6) return { level: 'Modérée', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (score <= 8) return { level: 'Élevée', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: 'Très Élevée', color: 'text-red-600', bg: 'bg-red-50' };
  };

  // Filtrage des procédures
  const filteredProcedures = extendedProcedures.filter(procedure => {
    const matchesSearch = procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         procedure.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || 
      (filterType === 'simple' && procedure.complexityScore <= 5) ||
      (filterType === 'complex' && procedure.complexityScore > 5) ||
      (filterType === 'fast' && procedure.averageTime <= 10) ||
      (filterType === 'slow' && procedure.averageTime > 10) ||
      (filterType === 'high-satisfaction' && procedure.userSatisfaction >= 4) ||
      (filterType === 'low-satisfaction' && procedure.userSatisfaction < 3);

    const matchesCategory = categoryFilter === 'all' || procedure.category === categoryFilter;
    
    const matchesComplexity = procedure.complexityScore >= complexityRange[0] && 
                             procedure.complexityScore <= complexityRange[1];
    
    const matchesTime = procedure.averageTime >= timeRange[0] && 
                       procedure.averageTime <= timeRange[1];
    
    const matchesSatisfaction = procedure.userSatisfaction >= satisfactionRange[0] && 
                               procedure.userSatisfaction <= satisfactionRange[1];

    return matchesSearch && matchesType && matchesCategory && 
           matchesComplexity && matchesTime && matchesSatisfaction;
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
    itemsPerPage: 4
  });

  const comparedProcedures = procedures.filter(p => selectedProcedures.includes(p.id));

  return (
    <div className="space-y-6">
      {/* Sélection des procédures avec filtres améliorés et pagination */}
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner les Procédures à Comparer (max 3)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de recherche */}
          <div className="flex gap-4">
            <div className="flex-1">
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
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filtrer par :</span>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type de procédure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les procédures</SelectItem>
                <SelectItem value="simple">Procédures simples</SelectItem>
                <SelectItem value="complex">Procédures complexes</SelectItem>
                <SelectItem value="fast">Procédures rapides (≤10j)</SelectItem>
                <SelectItem value="slow">Procédures longues (&gt;10j)</SelectItem>
                <SelectItem value="high-satisfaction">Haute satisfaction (≥4)</SelectItem>
                <SelectItem value="low-satisfaction">Satisfaction faible (&lt;3)</SelectItem>
              </SelectContent>
            </Select>
            
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
          </div>

          {/* Filtres avancés */}
          {showAdvancedFilters && (
            <div className="border-t pt-4 mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* Filtre de satisfaction */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Satisfaction: {satisfactionRange[0]} - {satisfactionRange[1]}/5
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
              </div>
            </div>
          )}

          {/* Indicateur de résultats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{totalItems} procédure{totalItems > 1 ? 's' : ''} trouvée{totalItems > 1 ? 's' : ''}</span>
            {(searchTerm || filterType !== 'all' || categoryFilter !== 'all' || 
              complexityRange[0] !== 0 || complexityRange[1] !== 10 ||
              timeRange[0] !== 0 || timeRange[1] !== 50 ||
              satisfactionRange[0] !== 1 || satisfactionRange[1] !== 5) && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-blue-600">
                <X className="w-3 h-3 mr-1" />
                Effacer les filtres
              </Button>
            )}
          </div>

          {/* Liste des procédures avec pagination */}
          <div className="space-y-3">
            {paginatedProcedures.map((procedure) => (
              <div key={procedure.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  checked={selectedProcedures.includes(procedure.id)}
                  onCheckedChange={() => handleProcedureToggle(procedure.id)}
                  disabled={!selectedProcedures.includes(procedure.id) && selectedProcedures.length >= 3}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{procedure.name}</h4>
                    {procedure.category && (
                      <Badge variant="outline" className="text-xs">
                        {procedure.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Complexité: {procedure.complexityScore}/10 | Délai: {procedure.averageTime}j | 
                    Réussite: {procedure.successRate}% | Satisfaction: {procedure.userSatisfaction}/5
                  </p>
                </div>
                <Badge className={`${getComplexityLevel(procedure.complexityScore).bg} ${getComplexityLevel(procedure.complexityScore).color} border-0`}>
                  {getComplexityLevel(procedure.complexityScore).level}
                </Badge>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
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

          {/* Indicateur de sélection */}
          {selectedProcedures.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>{selectedProcedures.length}</strong> procédure{selectedProcedures.length > 1 ? 's' : ''} sélectionnée{selectedProcedures.length > 1 ? 's' : ''} 
                {selectedProcedures.length < 3 ? ' (vous pouvez en sélectionner jusqu\'à 3)' : ''}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tableau de comparaison */}
      {comparedProcedures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparaison Détaillée</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Métrique</th>
                    {comparedProcedures.map((procedure) => (
                      <th key={procedure.id} className="text-center p-3 font-medium min-w-32">
                        {procedure.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Délai Moyen (jours)
                    </td>
                    {comparedProcedures.map((procedure) => (
                      <td key={procedure.id} className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-semibold">{procedure.averageTime}</span>
                          {procedure.trends.timeChange !== 0 && (
                            <span className={`text-xs flex items-center ${procedure.trends.timeChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {procedure.trends.timeChange > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {Math.abs(procedure.trends.timeChange)}%
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      Nombre d'Étapes
                    </td>
                    {comparedProcedures.map((procedure) => (
                      <td key={procedure.id} className="p-3 text-center font-semibold">
                        {procedure.steps}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      Documents Requis
                    </td>
                    {comparedProcedures.map((procedure) => (
                      <td key={procedure.id} className="p-3 text-center font-semibold">
                        {procedure.documents}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-600" />
                      Administrations
                    </td>
                    {comparedProcedures.map((procedure) => (
                      <td key={procedure.id} className="p-3 text-center font-semibold">
                        {procedure.administrations}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-yellow-600" />
                      Coût (DA)
                    </td>
                    {comparedProcedures.map((procedure) => (
                      <td key={procedure.id} className="p-3 text-center font-semibold">
                        {procedure.cost.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-red-600" />
                      Score de Complexité
                    </td>
                    {comparedProcedures.map((procedure) => (
                      <td key={procedure.id} className="p-3 text-center">
                        <Badge className={`${getComplexityLevel(procedure.complexityScore).bg} ${getComplexityLevel(procedure.complexityScore).color} border-0`}>
                          {procedure.complexityScore}/10
                        </Badge>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      Taux de Réussite (%)
                    </td>
                    {comparedProcedures.map((procedure) => (
                      <td key={procedure.id} className="p-3 text-center font-semibold">
                        {procedure.successRate}%
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      Satisfaction Utilisateur
                    </td>
                    {comparedProcedures.map((procedure) => (
                      <td key={procedure.id} className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-semibold">{procedure.userSatisfaction}/5</span>
                          {procedure.trends.satisfactionChange !== 0 && (
                            <span className={`text-xs flex items-center ${procedure.trends.satisfactionChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {procedure.trends.satisfactionChange > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {Math.abs(procedure.trends.satisfactionChange)}%
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
