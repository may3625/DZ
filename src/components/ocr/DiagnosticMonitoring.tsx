import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Activity, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';

export function DiagnosticMonitoring() {
  const diagnosticData = [
    {
      id: 1,
      metric: "Qualité OCR moyenne",
      value: "94.2%",
      status: "excellent",
      trend: "up",
      change: "+2.1%",
      lastUpdate: "Il y a 5 min"
    },
    {
      id: 2,
      metric: "Temps de traitement moyen",
      value: "1.8s",
      status: "good",
      trend: "down",
      change: "-0.3s",
      lastUpdate: "Il y a 3 min"
    },
    {
      id: 3,
      metric: "Taux d'erreur",
      value: "2.1%",
      status: "warning",
      trend: "up",
      change: "+0.4%",
      lastUpdate: "Il y a 7 min"
    },
    {
      id: 4,
      metric: "Documents traités/h",
      value: "1,247",
      status: "excellent",
      trend: "up",
      change: "+15%",
      lastUpdate: "Il y a 2 min"
    },
    {
      id: 5,
      metric: "Utilisation mémoire",
      value: "76%",
      status: "good",
      trend: "up",
      change: "+5%",
      lastUpdate: "Il y a 1 min"
    },
    {
      id: 6,
      metric: "Utilisation CPU",
      value: "58%",
      status: "good",
      trend: "down",
      change: "-3%",
      lastUpdate: "Il y a 4 min"
    },
    {
      id: 7,
      metric: "Précision reconnaissance",
      value: "97.8%",
      status: "excellent",
      trend: "up",
      change: "+1.2%",
      lastUpdate: "Il y a 6 min"
    },
    {
      id: 8,
      metric: "Files d'attente",
      value: "12",
      status: "warning",
      trend: "up",
      change: "+7",
      lastUpdate: "Il y a 1 min"
    }
  ];

  // Pagination pour les métriques de diagnostic
  const {
    currentData: paginatedMetrics,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: diagnosticData,
    itemsPerPage: 4
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string, change: string) => {
    const isPositive = !change.startsWith('-');
    if (trend === 'up') {
      return <TrendingUp className={`w-4 h-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />;
    } else {
      return <TrendingDown className={`w-4 h-4 ${isPositive ? 'text-red-600' : 'text-green-600'}`} />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600" />
            Diagnostic & Monitoring
            <Badge variant="outline" className="bg-red-50">
              🔍 Temps réel
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedMetrics.map((metric) => (
              <Card key={metric.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{metric.metric}</h4>
                      <div className="text-2xl font-bold">{metric.value}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(metric.status)}
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend, metric.change)}
                      <span className={metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                        {metric.change}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{metric.lastUpdate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination pour le diagnostic */}
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

          {/* Résumé global */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              État général du système
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Performance globale:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={87} className="flex-1 h-2" />
                  <span className="font-medium">87%</span>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Santé du système:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={92} className="flex-1 h-2" />
                  <span className="font-medium">92%</span>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Efficacité OCR:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={94} className="flex-1 h-2" />
                  <span className="font-medium">94%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}