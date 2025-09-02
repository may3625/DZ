import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  FileText as Template, 
  Search, 
  Star,
  Clock,
  Eye,
  Download,
  Copy,
  Edit,
  Trash2,
  FileText,
  Heart,
  Bookmark,
  Calendar,
  User
} from 'lucide-react';

export function ModelsAndFavorites() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const templates = [
    {
      id: 1,
      name: 'Demande de passeport - Standard',
      description: 'Formulaire standard pour une demande de passeport biométrique',
      category: 'Identité',
      type: 'template',
      usage: 1247,
      rating: 4.8,
      lastUsed: '2025-02-18',
      createdBy: 'Système',
      isFavorite: true,
      isRecent: true
    },
    {
      id: 2,
      name: 'Création SARL - Complet',
      description: 'Modèle complet pour la création d\'une SARL avec tous les documents',
      category: 'Entreprise',
      type: 'template',
      usage: 892,
      rating: 4.6,
      lastUsed: '2025-02-17',
      createdBy: 'Admin',
      isFavorite: false,
      isRecent: true
    },
    {
      id: 3,
      name: 'Permis de construire - Résidentiel',
      description: 'Formulaire pour permis de construire pour habitation individuelle',
      category: 'Urbanisme',
      type: 'template',
      usage: 634,
      rating: 4.3,
      lastUsed: '2025-02-15',
      createdBy: 'Expert Urbanisme',
      isFavorite: true,
      isRecent: false
    },
    {
      id: 4,
      name: 'Mon formulaire personnalisé',
      description: 'Formulaire personnalisé pour demande spécifique',
      category: 'Personnel',
      type: 'personal',
      usage: 45,
      rating: 5.0,
      lastUsed: '2025-02-19',
      createdBy: 'Moi',
      isFavorite: true,
      isRecent: true
    },
    {
      id: 5,
      name: 'Certificat de résidence',
      description: 'Demande d\'attestation de domicile auprès de la commune',
      category: 'Administration',
      type: 'template',
      usage: 523,
      rating: 4.5,
      lastUsed: '2025-02-14',
      createdBy: 'Système',
      isFavorite: false,
      isRecent: false
    },
    {
      id: 6,
      name: 'Licence commerciale - Commerce',
      description: 'Autorisation d\'exercer une activité commerciale',
      category: 'Commerce',
      type: 'template',
      usage: 389,
      rating: 4.4,
      lastUsed: '2025-02-12',
      createdBy: 'Expert Commerce',
      isFavorite: true,
      isRecent: false
    },
    {
      id: 7,
      name: 'Ma demande de congé personnalisée',
      description: 'Formulaire personnalisé pour demande de congé spécial',
      category: 'RH',
      type: 'personal',
      usage: 12,
      rating: 4.9,
      lastUsed: '2025-02-16',
      createdBy: 'Moi',
      isFavorite: false,
      isRecent: true
    },
    {
      id: 8,
      name: 'Déclaration fiscale - Entreprise',
      description: 'Formulaire de déclaration fiscale pour entreprises',
      category: 'Fiscal',
      type: 'template',
      usage: 267,
      rating: 4.2,
      lastUsed: '2025-02-10',
      createdBy: 'Expert Fiscal',
      isFavorite: false,
      isRecent: false
    }
  ];

  // Filtrage
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Données par onglet
  const templateData = filteredTemplates.filter(t => t.type === 'template');
  const favoriteData = filteredTemplates.filter(t => t.isFavorite);
  const recentData = filteredTemplates.filter(t => t.isRecent);
  const personalData = filteredTemplates.filter(t => t.type === 'personal');

  // Paginations pour chaque onglet
  const {
    currentData: paginatedTemplates,
    currentPage: templatesPage,
    totalPages: templatesTotalPages,
    itemsPerPage: templatesItemsPerPage,
    totalItems: templatesTotalItems,
    setCurrentPage: setTemplatesPage,
    setItemsPerPage: setTemplatesItemsPerPage
  } = usePagination({ data: templateData, itemsPerPage: 4 });

  const {
    currentData: paginatedFavorites,
    currentPage: favoritesPage,
    totalPages: favoritesTotalPages,
    itemsPerPage: favoritesItemsPerPage,
    totalItems: favoritesTotalItems,
    setCurrentPage: setFavoritesPage,
    setItemsPerPage: setFavoritesItemsPerPage
  } = usePagination({ data: favoriteData, itemsPerPage: 4 });

  const {
    currentData: paginatedRecents,
    currentPage: recentsPage,
    totalPages: recentsTotalPages,
    itemsPerPage: recentsItemsPerPage,
    totalItems: recentsTotalItems,
    setCurrentPage: setRecentsPage,
    setItemsPerPage: setRecentsItemsPerPage
  } = usePagination({ data: recentData, itemsPerPage: 4 });

  const categories = [...new Set(templates.map(t => t.category))];

  const renderTemplateCard = (template: any) => (
    <Card key={template.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{template.name}</h4>
              {template.isFavorite && (
                <Heart className="w-4 h-4 text-red-500 fill-current" />
              )}
              {template.isRecent && (
                <Badge className="bg-blue-100 text-blue-800 text-xs">Récent</Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{template.description}</p>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">{template.category}</Badge>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star className="w-3 h-3 fill-current text-yellow-500" />
                {template.rating}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Eye className="w-3 h-3" />
                {template.usage}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Par {template.createdBy}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                Dernière utilisation: {template.lastUsed}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="w-3 h-3 mr-1" />
            Voir
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Copy className="w-3 h-3 mr-1" />
            Utiliser
          </Button>
          <Button variant="ghost" size="sm">
            <Heart className={`w-4 h-4 ${template.isFavorite ? 'text-red-500 fill-current' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Template className="w-5 h-5 text-purple-600" />
            Mes Formulaires Personnalisés
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un formulaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Onglets */}
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Template className="w-4 h-4" />
                Modèles ({templateData.length})
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Favoris ({favoriteData.length})
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Récents ({recentData.length})
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Personnels ({personalData.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedTemplates.map(renderTemplateCard)}
              </div>
              <Pagination
                currentPage={templatesPage}
                totalPages={templatesTotalPages}
                totalItems={templatesTotalItems}
                itemsPerPage={templatesItemsPerPage}
                onPageChange={setTemplatesPage}
                onItemsPerPageChange={setTemplatesItemsPerPage}
              />
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedFavorites.map(renderTemplateCard)}
              </div>
              <Pagination
                currentPage={favoritesPage}
                totalPages={favoritesTotalPages}
                totalItems={favoritesTotalItems}
                itemsPerPage={favoritesItemsPerPage}
                onPageChange={setFavoritesPage}
                onItemsPerPageChange={setFavoritesItemsPerPage}
              />
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedRecents.map(renderTemplateCard)}
              </div>
              <Pagination
                currentPage={recentsPage}
                totalPages={recentsTotalPages}
                totalItems={recentsTotalItems}
                itemsPerPage={recentsItemsPerPage}
                onPageChange={setRecentsPage}
                onItemsPerPageChange={setRecentsItemsPerPage}
              />
            </TabsContent>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalData.map(renderTemplateCard)}
              </div>
              {personalData.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun formulaire personnel</h3>
                  <p className="text-gray-500 mb-4">Créez votre premier formulaire personnalisé</p>
                  <Button>
                    <Template className="w-4 h-4 mr-2" />
                    Créer un formulaire
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Actions rapides */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">Actions rapides</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Template className="w-5 h-5" />
                <span className="text-sm">Nouveau modèle</span>
              </Button>
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Bookmark className="w-5 h-5" />
                <span className="text-sm">Mes favoris</span>
              </Button>
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Download className="w-5 h-5" />
                <span className="text-sm">Exporter</span>
              </Button>
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Copy className="w-5 h-5" />
                <span className="text-sm">Dupliquer</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}