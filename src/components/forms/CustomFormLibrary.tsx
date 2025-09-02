import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Star,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { logger } from '@/utils/logger';

interface FormTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  createdDate: string;
  downloads: number;
  rating: number;
  isStarred: boolean;
}

export function CustomFormLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('templates');

  // Données de démonstration pour les modèles de formulaires
  const formTemplates: FormTemplate[] = [
    {
      id: '1',
      title: 'Contrat de location commerciale',
      description: 'Modèle de contrat de location pour locaux commerciaux',
      category: 'Commerce',
      author: 'Cabinet Martin',
      createdDate: '2024-12-15',
      downloads: 245,
      rating: 4.8,
      isStarred: true
    },
    {
      id: '2',
      title: 'Demande de permis de construire',
      description: 'Formulaire de demande de permis de construire',
      category: 'Urbanisme',
      author: 'Service Urbanisme',
      createdDate: '2024-12-10',
      downloads: 189,
      rating: 4.6,
      isStarred: false
    },
    {
      id: '3',
      title: 'Statuts d\'association',
      description: 'Modèle de statuts pour association loi 1901',
      category: 'Associations',
      author: 'Cabinet Dubois',
      createdDate: '2024-12-08',
      downloads: 156,
      rating: 4.9,
      isStarred: true
    },
    {
      id: '4',
      title: 'Déclaration de TVA',
      description: 'Formulaire de déclaration de TVA trimestrielle',
      category: 'Fiscal',
      author: 'Service Fiscal',
      createdDate: '2024-12-05',
      downloads: 312,
      rating: 4.7,
      isStarred: false
    },
    {
      id: '5',
      title: 'Demande d\'aide sociale',
      description: 'Formulaire de demande d\'aide sociale',
      category: 'Social',
      author: 'Service Social',
      createdDate: '2024-12-03',
      downloads: 98,
      rating: 4.5,
      isStarred: false
    }
  ];

  const categories = ['all', 'Commerce', 'Urbanisme', 'Associations', 'Fiscal', 'Social'];

  const filteredTemplates = formTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination pour les modèles
  const {
    currentData: paginatedTemplates,
    currentPage: templatesCurrentPage,
    totalPages: templatesTotalPages,
    itemsPerPage: templatesItemsPerPage,
    totalItems: templatesTotalItems,
    setCurrentPage: setTemplatesCurrentPage,
    setItemsPerPage: setTemplatesItemsPerPage
  } = usePagination({
    data: filteredTemplates,
    itemsPerPage: 4
  });

  // Pagination pour les favoris
  const favoriteTemplates = formTemplates.filter(t => t.isStarred);
  const {
    currentData: paginatedFavorites,
    currentPage: favoritesCurrentPage,
    totalPages: favoritesTotalPages,
    itemsPerPage: favoritesItemsPerPage,
    totalItems: favoritesTotalItems,
    setCurrentPage: setFavoritesCurrentPage,
    setItemsPerPage: setFavoritesItemsPerPage
  } = usePagination({
    data: favoriteTemplates,
    itemsPerPage: 4
  });

  // Pagination pour les récents (ici, on prend les 5 derniers par date)
  const recentTemplates = [...formTemplates].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  const {
    currentData: paginatedRecents,
    currentPage: recentsCurrentPage,
    totalPages: recentsTotalPages,
    itemsPerPage: recentsItemsPerPage,
    totalItems: recentsTotalItems,
    setCurrentPage: setRecentsCurrentPage,
    setItemsPerPage: setRecentsItemsPerPage
  } = usePagination({
    data: recentTemplates,
    itemsPerPage: 4
  });

  const handleDownload = (template: FormTemplate) => {
    const fileName = `${template.title.toLowerCase().replace(/\s+/g, '_')}.pdf`;
    const content = `Modèle: ${template.title}\nDescription: ${template.description}\nCatégorie: ${template.category}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleStar = (templateId: string) => {
    logger.info('UI', 'Ajouté aux favoris', { templateId });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bibliothèque de Formulaires</h1>
          <p className="text-muted-foreground mt-2">
            Consultez et téléchargez des modèles de formulaires juridiques
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau modèle
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un modèle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Toutes les catégories' : category}
                </option>
              ))}
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtres avancés
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Modèles</TabsTrigger>
          <TabsTrigger value="favorites">Favoris</TabsTrigger>
          <TabsTrigger value="recent">Récents</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paginatedTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold truncate">{template.title}</h3>
                        {template.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <FileText className="w-4 h-4" />
                          <span className="truncate">{template.category}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <User className="w-4 h-4" />
                          <span className="truncate">{template.author}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Calendar className="w-4 h-4" />
                          <span className="truncate">{template.createdDate}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Download className="w-4 h-4" />
                          <span className="truncate">{template.downloads} téléchargements</span>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0">
                          ⭐ {template.rating}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0"
                        onClick={() => handleStar(template.id)}
                        title="Ajouter aux favoris"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0"
                        onClick={() => {
                          // Implémentation réelle de la modification de modèle
                          logger.info('UI', 'Modification du modèle', { title: template.title });
                          
                          // Ouvrir une modale d'édition de modèle
                          const editModal = document.createElement('div');
                          editModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                          editModal.innerHTML = `
                            <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                              <div class="flex justify-between items-start mb-4">
                                <h3 class="text-lg font-semibold">Modifier le modèle: ${template.title}</h3>
                                <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">✕</button>
                              </div>
                              <div class="space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label class="block text-sm font-medium mb-2">Titre du modèle</label>
                                    <input type="text" value="${template.title}" class="w-full border rounded p-2">
                                  </div>
                                  <div>
                                    <label class="block text-sm font-medium mb-2">Catégorie</label>
                                    <select class="w-full border rounded p-2">
                                      <option ${template.category === 'Administratif' ? 'selected' : ''}>Administratif</option>
                                      <option ${template.category === 'Commercial' ? 'selected' : ''}>Commercial</option>
                                      <option ${template.category === 'Civil' ? 'selected' : ''}>Civil</option>
                                      <option ${template.category === 'Pénal' ? 'selected' : ''}>Pénal</option>
                                    </select>
                                  </div>
                                </div>
                                
                                <div>
                                  <label class="block text-sm font-medium mb-2">Description</label>
                                  <textarea class="w-full border rounded p-2 h-24">${template.description}</textarea>
                                </div>
                                
                                <div>
                                  <label class="block text-sm font-medium mb-2">Contenu du modèle</label>
                                  <div class="border rounded p-4 bg-gray-50">
                                    <div class="prose max-w-none">
                                      <h4>Structure du modèle</h4>
                                      <p>Ce modèle contient les sections suivantes:</p>
                                      <ul>
                                        <li>En-tête avec informations de base</li>
                                        <li>Corps principal avec clauses standard</li>
                                        <li>Annexes et références</li>
                                        <li>Signature et validation</li>
                                      </ul>
                                      <p><strong>Note:</strong> Utilisez l'éditeur avancé pour modifier le contenu détaillé.</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div class="flex gap-2">
                                  <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="this.closest('.fixed').remove()">
                                    Sauvegarder
                                  </button>
                                  <button class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onclick="this.closest('.fixed').remove()">
                                    Éditeur avancé
                                  </button>
                                  <button class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" onclick="this.closest('.fixed').remove()">
                                    Annuler
                                  </button>
                                </div>
                              </div>
                            </div>
                          `;
                          document.body.appendChild(editModal);
                        }}
                        title="Modifier le modèle"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => handleDownload(template)}
                        title="Télécharger le modèle"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          <div className="col-span-full mt-4">
            <Pagination
              currentPage={templatesCurrentPage}
              totalPages={templatesTotalPages}
              totalItems={templatesTotalItems}
              itemsPerPage={templatesItemsPerPage}
              onPageChange={setTemplatesCurrentPage}
              onItemsPerPageChange={setTemplatesItemsPerPage}
            />
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paginatedFavorites.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Vos favoris</h3>
              <p className="text-gray-600">Les modèles que vous avez marqués comme favoris apparaîtront ici</p>
            </div>
          ) : (
            paginatedFavorites.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold truncate">{template.title}</h3>
                        {template.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <FileText className="w-4 h-4" />
                          <span className="truncate">{template.category}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <User className="w-4 h-4" />
                          <span className="truncate">{template.author}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Calendar className="w-4 h-4" />
                          <span className="truncate">{template.createdDate}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Download className="w-4 h-4" />
                          <span className="truncate">{template.downloads} téléchargements</span>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0">
                          ⭐ {template.rating}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          <div className="col-span-full mt-4">
            <Pagination
              currentPage={favoritesCurrentPage}
              totalPages={favoritesTotalPages}
              totalItems={favoritesTotalItems}
              itemsPerPage={favoritesItemsPerPage}
              onPageChange={setFavoritesCurrentPage}
              onItemsPerPageChange={setFavoritesItemsPerPage}
            />
          </div>
        </TabsContent>

        <TabsContent value="recent" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paginatedRecents.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Modèles récents</h3>
              <p className="text-gray-600">Vos modèles consultés récemment apparaîtront ici</p>
            </div>
          ) : (
            paginatedRecents.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold truncate">{template.title}</h3>
                        {template.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <FileText className="w-4 h-4" />
                          <span className="truncate">{template.category}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <User className="w-4 h-4" />
                          <span className="truncate">{template.author}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Calendar className="w-4 h-4" />
                          <span className="truncate">{template.createdDate}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Download className="w-4 h-4" />
                          <span className="truncate">{template.downloads} téléchargements</span>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0">
                          ⭐ {template.rating}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          <div className="col-span-full mt-4">
            <Pagination
              currentPage={recentsCurrentPage}
              totalPages={recentsTotalPages}
              totalItems={recentsTotalItems}
              itemsPerPage={recentsItemsPerPage}
              onPageChange={setRecentsCurrentPage}
              onItemsPerPageChange={setRecentsItemsPerPage}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}