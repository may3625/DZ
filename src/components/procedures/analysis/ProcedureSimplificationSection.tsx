
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Zap, 
  Clock, 
  Users, 
  FileText, 
  TrendingDown, 
  CheckCircle,
  AlertCircle,
  Target,
  Search,
  Filter
} from 'lucide-react';

export function ProcedureSimplificationSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const simplificationOpportunities = [
    {
      id: 1,
      procedure: "Demande de permis de construire",
      complexity: "Élevée",
      steps: 12,
      proposedSteps: 7,
      potentialReduction: "42%",
      priority: "Haute",
      status: "En cours"
    },
    {
      id: 2,
      procedure: "Inscription au registre du commerce",
      complexity: "Moyenne",
      steps: 8,
      proposedSteps: 5,
      potentialReduction: "38%",
      priority: "Moyenne",
      status: "Planifié"
    },
    {
      id: 3,
      procedure: "Demande de passeport",
      complexity: "Faible",
      steps: 6,
      proposedSteps: 4,
      potentialReduction: "33%",
      priority: "Faible",
      status: "Terminé"
    },
    // Données d'exemple supplémentaires pour forcer la pagination
    {
      id: 4,
      procedure: "Création d'entreprise SARL",
      complexity: "Élevée",
      steps: 15,
      proposedSteps: 9,
      potentialReduction: "40%",
      priority: "Haute",
      status: "En cours"
    },
    {
      id: 5,
      procedure: "Licence commerciale",
      complexity: "Moyenne",
      steps: 10,
      proposedSteps: 6,
      potentialReduction: "40%",
      priority: "Moyenne",
      status: "Planifié"
    },
    {
      id: 6,
      procedure: "Certificat de conformité",
      complexity: "Faible",
      steps: 5,
      proposedSteps: 3,
      potentialReduction: "40%",
      priority: "Faible",
      status: "Terminé"
    },
    {
      id: 7,
      procedure: "Autorisation d'exploitation",
      complexity: "Élevée",
      steps: 18,
      proposedSteps: 11,
      potentialReduction: "39%",
      priority: "Haute",
      status: "En cours"
    },
    {
      id: 8,
      procedure: "Déclaration fiscale",
      complexity: "Moyenne",
      steps: 9,
      proposedSteps: 5,
      potentialReduction: "44%",
      priority: "Moyenne",
      status: "Planifié"
    }
  ];

  const simplificationMetrics = [
    { label: "Procédures analysées", value: "156", icon: FileText, trend: "+12%" },
    { label: "Temps moyen économisé", value: "35 min", icon: Clock, trend: "+18%" },
    { label: "Étapes réduites", value: "248", icon: TrendingDown, trend: "+25%" },
    { label: "Satisfaction usagers", value: "87%", icon: Users, trend: "+8%" }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Haute': return 'bg-red-100 text-red-800';
      case 'Moyenne': return 'bg-yellow-100 text-yellow-800';
      case 'Faible': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Terminé': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'En cours': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'Planifié': return <Target className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // Filtrage des opportunités de simplification
  const filteredOpportunities = simplificationOpportunities.filter(opportunity => {
    const matchesSearch = opportunity.procedure.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || opportunity.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || opportunity.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Pagination pour les opportunités de simplification
  const {
    currentData: paginatedOpportunities,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredOpportunities,
    itemsPerPage: 5
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-yellow-600" />
        <h3 className="text-xl font-semibold">Simplification et allègement des procédures</h3>
      </div>

      {/* Métriques de simplification */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {simplificationMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-green-600">{metric.trend}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <metric.icon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Opportunités de simplification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Opportunités de simplification identifiées
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
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
              <div className="flex gap-2">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Toutes les priorités</option>
                  <option value="Haute">Haute priorité</option>
                  <option value="Moyenne">Moyenne priorité</option>
                  <option value="Faible">Faible priorité</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="Terminé">Terminé</option>
                  <option value="En cours">En cours</option>
                  <option value="Planifié">Planifié</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {paginatedOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">{opportunity.procedure}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Complexité: {opportunity.complexity}</span>
                      <span>Étapes actuelles: {opportunity.steps}</span>
                      <span>Étapes proposées: {opportunity.proposedSteps}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(opportunity.status)}
                    <Badge className={getPriorityColor(opportunity.priority)}>
                      {opportunity.priority}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Réduction potentielle: {opportunity.potentialReduction}</span>
                    <span>{opportunity.status}</span>
                  </div>
                  <Progress 
                    value={parseInt(opportunity.potentialReduction)} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredOpportunities.length > 0 && (
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

      {/* Actions de simplification */}
      <Card>
        <CardHeader>
          <CardTitle>Actions recommandées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium">Analyser nouvelle procédure</p>
                <p className="text-xs text-gray-500">Identifier les étapes redondantes</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className="font-medium">Consulter les usagers</p>
                <p className="text-xs text-gray-500">Recueillir les retours d'expérience</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <div className="text-left">
                <p className="font-medium">Automatiser les étapes</p>
                <p className="text-xs text-gray-500">Réduire les interventions manuelles</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
