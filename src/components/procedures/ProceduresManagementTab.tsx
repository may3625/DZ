import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/stores/appStore';
import { Plus, Search, Filter, Edit, Trash2, Eye, Play, Clock, Users, Star } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/common/Pagination';

export function ProceduresManagementTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const procedures = useAppStore(state => state.procedures);
  const addProcedure = useAppStore(state => state.addProcedure);
  const updateProcedure = useAppStore(state => state.updateProcedure);
  const deleteProcedure = useAppStore(state => state.deleteProcedure);

  // Filtrer les procédures
  const filteredProcedures = useMemo(() => {
    return procedures.filter(procedure => {
      const matchesSearch = searchTerm === '' || 
        procedure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        procedure.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || procedure.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || procedure.status === selectedStatus;
      const matchesDifficulty = selectedDifficulty === 'all' || procedure.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesStatus && matchesDifficulty;
    });
  }, [procedures, searchTerm, selectedCategory, selectedStatus, selectedDifficulty]);

  // Pagination
  const {
    currentData: paginatedProcedures,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredProcedures,
    itemsPerPage: 5
  });

  const handleCreateProcedure = () => {
    const newProcedure = {
      id: `proc_${Date.now()}`,
      title: 'Nouvelle procédure',
      category: 'Administrative',
      institution: 'Administration générale',
      description: 'Description de la nouvelle procédure',
      steps: [],
      documents: [],
      requiredDocuments: [],
      requirements: [],
      duration: '2-3 semaines',
      processingTime: '2-3 semaines',
      difficulty: 'Moyen' as const,
      successRate: 85,
      status: 'En révision' as const,
      lastUpdate: new Date(),
      forms: [],
      cost: 'Gratuit',
      completedCount: 0,
      rating: 4.2,
      authority: 'Administration locale',
      views: 0,
      popularity: 0
    };
    
    addProcedure(newProcedure);
  };

  const handleEditProcedure = (procedure: any) => {
    console.log('Édition de la procédure:', procedure.title);
    // Ouvrir le modal d'édition
  };

  const handleDeleteProcedure = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette procédure ?')) {
      deleteProcedure(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validée': return 'bg-green-100 text-green-800';
      case 'En révision': return 'bg-yellow-100 text-yellow-800';
      case 'Obsolète': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile': return 'bg-green-100 text-green-800';
      case 'Moyen': return 'bg-yellow-100 text-yellow-800';
      case 'Difficile': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Procédures</h2>
          <p className="text-gray-600">Gérez et organisez les procédures administratives algériennes</p>
        </div>
        <Button onClick={handleCreateProcedure} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle Procédure
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher une procédure..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="Administrative">Administrative</SelectItem>
            <SelectItem value="Civile">Civile</SelectItem>
            <SelectItem value="Commerciale">Commerciale</SelectItem>
            <SelectItem value="Fiscale">Fiscale</SelectItem>
            <SelectItem value="Sociale">Sociale</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="Validée">Validée</SelectItem>
            <SelectItem value="En révision">En révision</SelectItem>
            <SelectItem value="Obsolète">Obsolète</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Difficulté" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="Facile">Facile</SelectItem>
            <SelectItem value="Moyen">Moyen</SelectItem>
            <SelectItem value="Difficile">Difficile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Procédures</p>
                <p className="text-2xl font-bold">{procedures.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Validées</p>
                <p className="text-2xl font-bold">
                  {procedures.filter(p => p.status === 'Validée').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Edit className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En révision</p>
                <p className="text-2xl font-bold">
                  {procedures.filter(p => p.status === 'En révision').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taux succès moyen</p>
                <p className="text-2xl font-bold">
                  {Math.round(procedures.reduce((acc, p) => acc + p.successRate, 0) / procedures.length || 0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des procédures */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedProcedures.map((procedure) => (
          <Card key={procedure.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{procedure.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {procedure.description}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(procedure.status)}>
                  {procedure.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Catégorie</span>
                <span className="font-medium">{procedure.category}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Difficulté</span>
                <Badge className={getDifficultyColor(procedure.difficulty)}>
                  {procedure.difficulty}
                </Badge>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Durée</span>
                <span className="font-medium">{procedure.duration}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Taux de succès</span>
                <span className="font-medium text-green-600">{procedure.successRate}%</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Étapes</span>
                <span className="font-medium">{procedure.steps.length}</span>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => console.log('Voir', procedure.id)}>
                <Eye className="w-4 h-4 mr-1" />
                Voir
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditProcedure(procedure)}>
                <Edit className="w-4 h-4 mr-1" />
                Éditer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-red-600 hover:text-red-700" 
                onClick={() => handleDeleteProcedure(procedure.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Supprimer
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* État vide */}
      {filteredProcedures.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Aucune procédure trouvée</h3>
                <p className="text-gray-600 mt-1">
                  Essayez de modifier vos critères de recherche ou créez une nouvelle procédure.
                </p>
              </div>
              <Button onClick={handleCreateProcedure} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Créer une procédure
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}