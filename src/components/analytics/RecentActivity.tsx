import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Activity, 
  User, 
  FileText, 
  Search, 
  Download,
  Eye,
  Clock,
  Calendar
} from 'lucide-react';

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'document_view',
      user: 'Ahmed Benali',
      action: 'a consulté',
      target: 'Code civil algérien - Article 123',
      timestamp: '2025-02-19 14:30',
      category: 'Civil'
    },
    {
      id: 2,
      type: 'search',
      user: 'Fatima Kadi',
      action: 'a recherché',
      target: 'loi de finances 2025',
      timestamp: '2025-02-19 14:25',
      category: 'Fiscal'
    },
    {
      id: 3,
      type: 'download',
      user: 'Mohamed Cherif',
      action: 'a téléchargé',
      target: 'Décret exécutif n° 23-112',
      timestamp: '2025-02-19 14:20',
      category: 'Administratif'
    },
    {
      id: 4,
      type: 'document_view',
      user: 'Amina Bouras',
      action: 'a consulté',
      target: 'Code pénal - Chapitre II',
      timestamp: '2025-02-19 14:15',
      category: 'Pénal'
    },
    {
      id: 5,
      type: 'search',
      user: 'Karim Ziani',
      action: 'a recherché',
      target: 'marchés publics',
      timestamp: '2025-02-19 14:10',
      category: 'Administratif'
    },
    {
      id: 6,
      type: 'document_view',
      user: 'Leila Mammeri',
      action: 'a consulté',
      target: 'Loi sur l\'investissement',
      timestamp: '2025-02-19 14:05',
      category: 'Économique'
    },
    {
      id: 7,
      type: 'download',
      user: 'Rachid Touati',
      action: 'a téléchargé',
      target: 'Code du travail - Section 3',
      timestamp: '2025-02-19 14:00',
      category: 'Social'
    },
    {
      id: 8,
      type: 'search',
      user: 'Nadia Belkacem',
      action: 'a recherché',
      target: 'protection données personnelles',
      timestamp: '2025-02-19 13:55',
      category: 'RGPD'
    },
    {
      id: 9,
      type: 'document_view',
      user: 'Youcef Brahim',
      action: 'a consulté',
      target: 'Ordonnance sur la concurrence',
      timestamp: '2025-02-19 13:50',
      category: 'Commercial'
    },
    {
      id: 10,
      type: 'download',
      user: 'Samira Hadj',
      action: 'a téléchargé',
      target: 'Loi sur l\'environnement',
      timestamp: '2025-02-19 13:45',
      category: 'Environnement'
    },
    {
      id: 11,
      type: 'search',
      user: 'Omar Djelloul',
      action: 'a recherché',
      target: 'propriété intellectuelle',
      timestamp: '2025-02-19 13:40',
      category: 'Propriété'
    },
    {
      id: 12,
      type: 'document_view',
      user: 'Hasna Meziane',
      action: 'a consulté',
      target: 'Code de la famille',
      timestamp: '2025-02-19 13:35',
      category: 'Famille'
    }
  ];

  // Pagination pour l'activité récente
  const {
    currentData: paginatedActivities,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: activities,
    itemsPerPage: 5
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document_view': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'search': return <Search className="w-4 h-4 text-green-600" />;
      case 'download': return <Download className="w-4 h-4 text-purple-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'document_view': return 'Consultation';
      case 'search': return 'Recherche';
      case 'download': return 'Téléchargement';
      default: return 'Activité';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Civil': 'bg-blue-100 text-blue-800',
      'Fiscal': 'bg-green-100 text-green-800',
      'Administratif': 'bg-yellow-100 text-yellow-800',
      'Pénal': 'bg-red-100 text-red-800',
      'Économique': 'bg-purple-100 text-purple-800',
      'Social': 'bg-pink-100 text-pink-800',
      'RGPD': 'bg-indigo-100 text-indigo-800',
      'Commercial': 'bg-orange-100 text-orange-800',
      'Environnement': 'bg-emerald-100 text-emerald-800',
      'Propriété': 'bg-cyan-100 text-cyan-800',
      'Famille': 'bg-rose-100 text-rose-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Activité Récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(activity.type)}
                    </Badge>
                    <Badge className={`text-xs ${getCategoryColor(activity.category)}`}>
                      {activity.category}
                    </Badge>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-gray-600"> {activity.action} </span>
                    <span className="text-gray-900">{activity.target}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {activity.timestamp}
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Pagination */}
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

          {/* Statistiques rapides */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Statistiques d'aujourd'hui
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">247</div>
                <div className="text-gray-600">Consultations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">89</div>
                <div className="text-gray-600">Recherches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">156</div>
                <div className="text-gray-600">Téléchargements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">45</div>
                <div className="text-gray-600">Utilisateurs actifs</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}