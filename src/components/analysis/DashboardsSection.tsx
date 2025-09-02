import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { UnifiedModalSystem } from '@/components/modals/UnifiedModalSystem';
import {
  BarChart3,
  Plus,
  Search,
  Eye,
  Edit,
  Share2,
  Calendar,
  Users,
  TrendingUp,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';

export function DashboardsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDashboardModal, setShowNewDashboardModal] = useState(false);

  const dashboards = [
    {
      id: 1,
      name: "Tableau de Bord Exécutif",
      description: "Vue d'ensemble des KPIs principaux",
      category: "Direction",
      author: "Admin",
      created: "2025-01-01",
      lastUpdated: "2025-01-02",
      views: 234,
      widgets: 8,
      isPublic: true,
      isPersonal: false,
      isShared: true,
      isTemplate: false,
      tags: ["kpi", "direction", "synthèse"]
    },
    {
      id: 2,
      name: "Suivi des Procédures",
      description: "Monitoring des procédures administratives",
      category: "Opérationnel",
      author: "M. Benali",
      created: "2024-12-28",
      lastUpdated: "2025-01-02",
      views: 156,
      widgets: 6,
      isPublic: false,
      isPersonal: true,
      isShared: false,
      isTemplate: false,
      tags: ["procédures", "suivi", "administratif"]
    },
    {
      id: 3,
      name: "Conformité Réglementaire",
      description: "Suivi de la conformité et des alertes",
      category: "Conformité",
      author: "Mme Dubois",
      created: "2024-12-25",
      lastUpdated: "2025-01-01",
      views: 189,
      widgets: 10,
      isPublic: true,
      isPersonal: false,
      isShared: true,
      isTemplate: false,
      tags: ["conformité", "réglementation", "alertes"]
    },
    {
      id: 4,
      name: "Modèle Tableau Analytique",
      description: "Template pour tableaux d'analyse",
      category: "Template",
      author: "Système",
      created: "2024-12-20",
      lastUpdated: "2024-12-20",
      views: 78,
      widgets: 5,
      isPublic: true,
      isPersonal: false,
      isShared: false,
      isTemplate: true,
      tags: ["modèle", "analytique", "template"]
    },
    {
      id: 5,
      name: "Modèle Tableau KPI",
      description: "Template standard pour KPIs",
      category: "Template",
      author: "Système",
      created: "2024-12-15",
      lastUpdated: "2024-12-15",
      views: 92,
      widgets: 7,
      isPublic: true,
      isPersonal: false,
      isShared: false,
      isTemplate: true,
      tags: ["modèle", "kpi", "template"]
    },
    {
      id: 6,
      name: "Mon Tableau Personnel",
      description: "Tableau de bord personnalisé",
      category: "Personnel",
      author: "Utilisateur",
      created: "2024-12-10",
      lastUpdated: "2025-01-01",
      views: 45,
      widgets: 4,
      isPublic: false,
      isPersonal: true,
      isShared: false,
      isTemplate: false,
      tags: ["personnel", "custom"]
    }
  ];

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dashboard.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dashboard.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtres par onglet
  const allDashboards = filteredDashboards;
  const personalDashboards = filteredDashboards.filter(d => d.isPersonal);
  const sharedDashboards = filteredDashboards.filter(d => d.isShared);
  const templateDashboards = filteredDashboards.filter(d => d.isTemplate);

  // Pagination pour l'onglet "tous"
  const {
    currentData: paginatedDashboards,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: allDashboards,
    itemsPerPage: 5
  });

  // Pagination pour l'onglet "personnel"
  const {
    currentData: paginatedPersonalDashboards,
    currentPage: personalCurrentPage,
    totalPages: personalTotalPages,
    itemsPerPage: personalItemsPerPage,
    totalItems: personalTotalItems,
    setCurrentPage: setPersonalCurrentPage,
    setItemsPerPage: setPersonalItemsPerPage
  } = usePagination({
    data: personalDashboards,
    itemsPerPage: 5
  });

  // Pagination pour l'onglet "partagés"
  const {
    currentData: paginatedSharedDashboards,
    currentPage: sharedCurrentPage,
    totalPages: sharedTotalPages,
    itemsPerPage: sharedItemsPerPage,
    totalItems: sharedTotalItems,
    setCurrentPage: setSharedCurrentPage,
    setItemsPerPage: setSharedItemsPerPage
  } = usePagination({
    data: sharedDashboards,
    itemsPerPage: 5
  });

  // Pagination pour l'onglet "modèles"
  const {
    currentData: paginatedTemplateDashboards,
    currentPage: templateCurrentPage,
    totalPages: templateTotalPages,
    itemsPerPage: templateItemsPerPage,
    totalItems: templateTotalItems,
    setCurrentPage: setTemplateCurrentPage,
    setItemsPerPage: setTemplateItemsPerPage
  } = usePagination({
    data: templateDashboards,
    itemsPerPage: 5
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Direction': return 'bg-blue-100 text-blue-800';
      case 'Opérationnel': return 'bg-green-100 text-green-800';
      case 'Conformité': return 'bg-purple-100 text-purple-800';
      case 'Analytique': return 'bg-orange-100 text-orange-800';
      case 'Personnel': return 'bg-gray-100 text-gray-800';
      case 'Template': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboardCard = (dashboard: any) => (
    <Card key={dashboard.id} className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                {dashboard.name}
              </h3>
              <Badge className={getCategoryColor(dashboard.category)}>
                {dashboard.category}
              </Badge>
              {dashboard.isPublic && (
                <Badge variant="outline">Public</Badge>
              )}
              {dashboard.isTemplate && (
                <Badge variant="secondary">Modèle</Badge>
              )}
            </div>
            
            <p className="text-gray-600 mb-3">{dashboard.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span>Par {dashboard.author}</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Créé le {dashboard.created}
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                Mis à jour le {dashboard.lastUpdated}
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {dashboard.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              <div>{dashboard.widgets} widgets</div>
              <div>{dashboard.views} vues</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header avec bouton Nouveau Tableau de Bord */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableaux de Bord</h2>
          <p className="text-gray-600">Créez et gérez vos tableaux de bord personnalisés</p>
        </div>
        <Button onClick={() => setShowNewDashboardModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Tableau de Bord
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Rechercher un tableau de bord..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-600">Tableaux de bord</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">67</p>
                <p className="text-sm text-gray-600">Widgets actifs</p>
              </div>
              <PieChart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-sm text-gray-600">Vues totales</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-gray-600">Utilisateurs actifs</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tous les tableaux</TabsTrigger>
          <TabsTrigger value="personal">Mes tableaux</TabsTrigger>
          <TabsTrigger value="shared">Partagés</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {paginatedDashboards.map(renderDashboardCard)}
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
        </TabsContent>

        <TabsContent value="personal" className="space-y-4">
          {paginatedPersonalDashboards.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">Aucun tableau de bord personnel trouvé.</p>
                <Button className="mt-4" onClick={() => setShowNewDashboardModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer mon premier tableau
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatedPersonalDashboards.map(renderDashboardCard)}
              {personalTotalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={personalCurrentPage}
                    totalPages={personalTotalPages}
                    totalItems={personalTotalItems}
                    itemsPerPage={personalItemsPerPage}
                    onPageChange={setPersonalCurrentPage}
                    onItemsPerPageChange={setPersonalItemsPerPage}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          {paginatedSharedDashboards.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">Aucun tableau de bord partagé trouvé.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatedSharedDashboards.map(renderDashboardCard)}
              {sharedTotalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={sharedCurrentPage}
                    totalPages={sharedTotalPages}
                    totalItems={sharedTotalItems}
                    itemsPerPage={sharedItemsPerPage}
                    onPageChange={setSharedCurrentPage}
                    onItemsPerPageChange={setSharedItemsPerPage}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {paginatedTemplateDashboards.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">Aucun modèle de tableau de bord trouvé.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatedTemplateDashboards.map(renderDashboardCard)}
              {templateTotalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={templateCurrentPage}
                    totalPages={templateTotalPages}
                    totalItems={templateTotalItems}
                    itemsPerPage={templateItemsPerPage}
                    onPageChange={setTemplateCurrentPage}
                    onItemsPerPageChange={setTemplateItemsPerPage}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal Nouveau Tableau de Bord */}
      {showNewDashboardModal && (
        <UnifiedModalSystem
          modal={{
            id: 'new-dashboard-analysis',
            type: 'form',
            title: 'Create New Dashboard',
            description: 'Configure your dashboard settings',
            data: {
              name: '',
              description: '',
              layout: 'grid',
              public: false
            },
            onSave: () => setShowNewDashboardModal(false),
            onCancel: () => setShowNewDashboardModal(false)
          }}
          onClose={() => setShowNewDashboardModal(false)}
        />
      )}
    </div>
  );
}
