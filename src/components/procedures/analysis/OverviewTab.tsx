import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Clock, 
  FileText, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  BarChart3
} from 'lucide-react';
import { ProcedureComplexityChart } from './ProcedureComplexityChart';
import { ProcedureMetrics } from './types';
import { getComplexityLevel } from './utils';

interface OverviewTabProps {
  procedures: ProcedureMetrics[];
}

export function OverviewTab({ procedures }: OverviewTabProps) {
  // Données d'exemple pour forcer la pagination
  const exampleProcedures = [
    ...procedures,
    {
      id: "ex1",
      name: "Création d'entreprise SARL - Exemple 1",
      averageTime: 25,
      documents: 8,
      administrations: 3,
      cost: 150000,
      complexityScore: 75,
      successRate: 85,
      userSatisfaction: 4.2,
      feedbackCount: 45,
      trends: { timeChange: 5, satisfactionChange: 8 }
    },
    {
      id: "ex2", 
      name: "Demande de passeport - Exemple 2",
      averageTime: 15,
      documents: 5,
      administrations: 2,
      cost: 80000,
      complexityScore: 60,
      successRate: 92,
      userSatisfaction: 4.5,
      feedbackCount: 78,
      trends: { timeChange: -3, satisfactionChange: 12 }
    },
    {
      id: "ex3",
      name: "Permis de construire - Exemple 3", 
      averageTime: 45,
      documents: 12,
      administrations: 4,
      cost: 250000,
      complexityScore: 90,
      successRate: 68,
      userSatisfaction: 2.8,
      feedbackCount: 23,
      trends: { timeChange: 15, satisfactionChange: -5 }
    },
    {
      id: "ex4",
      name: "Licence commerciale - Exemple 4",
      averageTime: 30,
      documents: 10,
      administrations: 3,
      cost: 180000,
      complexityScore: 70,
      successRate: 78,
      userSatisfaction: 3.9,
      feedbackCount: 34,
      trends: { timeChange: 8, satisfactionChange: 6 }
    },
    {
      id: "ex5",
      name: "Certificat de conformité - Exemple 5",
      averageTime: 20,
      documents: 6,
      administrations: 2,
      cost: 95000,
      complexityScore: 55,
      successRate: 88,
      userSatisfaction: 4.1,
      feedbackCount: 56,
      trends: { timeChange: -2, satisfactionChange: 9 }
    }
  ];

  // Pagination pour les procédures
  const {
    currentData: paginatedProcedures,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: exampleProcedures,
    itemsPerPage: 2
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique de complexité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analyse de Complexité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProcedureComplexityChart procedures={procedures} />
        </CardContent>
      </Card>

      {/* Liste des procédures avec métriques */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des Procédures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedProcedures.map((procedure) => {
              const complexity = getComplexityLevel(procedure.complexityScore);
              return (
                <div key={procedure.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold">{procedure.name}</h4>
                    <Badge className={`${complexity.bg} ${complexity.color} border-0`}>
                      {complexity.level}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{procedure.averageTime} jours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span>{procedure.documents} documents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-green-600" />
                      <span>{procedure.administrations} administrations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-yellow-600" />
                      <span>{procedure.cost.toLocaleString()} DA</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>Taux de réussite: {procedure.successRate}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {procedure.trends.satisfactionChange > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={procedure.trends.satisfactionChange > 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(procedure.trends.satisfactionChange)}%
                      </span>
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
    </div>
  );
}