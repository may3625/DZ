import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePagination } from '@/hooks/usePagination';
import { StandardPagination } from '@/components/common/StandardPagination';
import { 
  Activity, 
  FileText, 
  Users, 
  Clock, 
  TrendingUp,
  Search,
  Filter,
  Eye,
  Download,
  Share2
} from 'lucide-react';

export function RecentActivityOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const recentActivities = [
    {
      id: 1,
      type: 'Document consulté',
      title: 'Code du Commerce - Article 12',
      user: 'Marie Dubois',
      timestamp: '2025-02-19 14:30',
      category: 'Legal',
      details: 'Consultation complète du document',
      views: 45
    },
    {
      id: 2,
      type: 'Procédure créée',
      title: 'Demande de permis de construire',
      user: 'Ahmed Benali',
      timestamp: '2025-02-19 13:15',
      category: 'Procedure',
      details: 'Nouvelle procédure administrative',
      views: 23
    },
    {
      id: 3,
      type: 'Recherche effectuée',
      title: 'Recherche: "droit du travail"',
      user: 'Sophie Martin',
      timestamp: '2025-02-19 12:45',
      category: 'Search',
      details: '156 résultats trouvés',
      views: 12
    },
    {
      id: 4,
      type: 'Document téléchargé',
      title: 'Formulaire de déclaration fiscale',
      user: 'Karim Hadj',
      timestamp: '2025-02-19 11:20',
      category: 'Download',
      details: 'Format PDF téléchargé',
      views: 89
    },
    {
      id: 5,
      type: 'Commentaire ajouté',
      title: 'Loi de finances 2025',
      user: 'Fatima Zohra',
      timestamp: '2025-02-19 10:30',
      category: 'Comment',
      details: 'Commentaire sur l\'article 15',
      views: 67
    },
    {
      id: 6,
      type: 'Traduction demandée',
      title: 'Arrêté ministériel n° 245',
      user: 'Omar Bensalem',
      timestamp: '2025-02-19 09:15',
      category: 'Translation',
      details: 'Traduction FR → AR',
      views: 34
    },
    {
      id: 7,
      type: 'Analyse générée',
      title: 'Rapport d\'impact juridique',
      user: 'Système IA',
      timestamp: '2025-02-19 08:45',
      category: 'AI',
      details: 'Analyse automatique complétée',
      views: 78
    },
    {
      id: 8,
      type: 'Validation effectuée',
      title: 'Procédure de visa',
      user: 'Rachid Amari',
      timestamp: '2025-02-19 08:00',
      category: 'Validation',
      details: 'Procédure validée et publiée',
      views: 56
    }
  ];

  const filteredActivities = recentActivities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || activity.category.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  const {
    currentData: paginatedActivities,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredActivities,
    itemsPerPage: 5
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Document consulté': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'Procédure créée': return <Activity className="w-4 h-4 text-green-600" />;
      case 'Recherche effectuée': return <Search className="w-4 h-4 text-purple-600" />;
      case 'Document téléchargé': return <Download className="w-4 h-4 text-orange-600" />;
      case 'Commentaire ajouté': return <Users className="w-4 h-4 text-indigo-600" />;
      case 'Traduction demandée': return <Share2 className="w-4 h-4 text-pink-600" />;
      case 'Analyse générée': return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'Validation effectuée': return <Eye className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Legal: 'bg-blue-100 text-blue-800',
      Procedure: 'bg-green-100 text-green-800',
      Search: 'bg-purple-100 text-purple-800',
      Download: 'bg-orange-100 text-orange-800',
      Comment: 'bg-indigo-100 text-indigo-800',
      Translation: 'bg-pink-100 text-pink-800',
      AI: 'bg-emerald-100 text-emerald-800',
      Validation: 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
          {/* Filtres */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher dans l'activité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tous les types</option>
                <option value="legal">Documents légaux</option>
                <option value="procedure">Procédures</option>
                <option value="search">Recherches</option>
                <option value="download">Téléchargements</option>
                <option value="comment">Commentaires</option>
                <option value="translation">Traductions</option>
                <option value="ai">Analyses IA</option>
                <option value="validation">Validations</option>
              </select>
            </div>
          </div>

          {/* Liste des activités */}
          <div className="space-y-4">
            {paginatedActivities.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-gray-50">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <Badge className={getCategoryColor(activity.category)}>
                          {activity.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{activity.details}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {activity.user}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.timestamp}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {activity.views} vues
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Voir détails
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredActivities.length > 0 && (
            <div className="mt-6">
              <StandardPagination
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