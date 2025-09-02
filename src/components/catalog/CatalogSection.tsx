import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Library, 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  Download,
  Calendar,
  Building2
} from 'lucide-react';

interface CatalogItem {
  id: string;
  title: string;
  type: 'procedure' | 'guide' | 'form';
  institution: string;
  category: string;
  lastUpdated: string;
  status: 'active' | 'archived' | 'draft';
  downloads: number;
}

export function CatalogSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterInstitution, setFilterInstitution] = useState('all');

  const catalogItems: CatalogItem[] = [
    {
      id: '1',
      title: 'Procédure d\'obtention du permis de conduire',
      type: 'procedure',
      institution: 'Ministère des Transports',
      category: 'Transport',
      lastUpdated: '2024-01-15',
      status: 'active',
      downloads: 1247
    },
    {
      id: '2',
      title: 'Demande de certificat de résidence',
      type: 'procedure',
      institution: 'Communes',
      category: 'État civil',
      lastUpdated: '2024-01-12',
      status: 'active',
      downloads: 892
    },
    {
      id: '3',
      title: 'Création d\'entreprise SARL',
      type: 'guide',
      institution: 'CNRC',
      category: 'Commerce',
      lastUpdated: '2024-01-10',
      status: 'active',
      downloads: 756
    },
    {
      id: '4',
      title: 'Formulaire de demande de passeport',
      type: 'form',
      institution: 'Ministère de l\'Intérieur',
      category: 'Documents d\'identité',
      lastUpdated: '2024-01-08',
      status: 'active',
      downloads: 634
    },
    {
      id: '5',
      title: 'Procédure de déclaration fiscale',
      type: 'procedure',
      institution: 'Direction des Impôts',
      category: 'Fiscal',
      lastUpdated: '2024-01-05',
      status: 'active',
      downloads: 523
    },
    {
      id: '6',
      title: 'Guide des marchés publics',
      type: 'guide',
      institution: 'Ministère des Finances',
      category: 'Marchés publics',
      lastUpdated: '2023-12-28',
      status: 'active',
      downloads: 445
    },
    {
      id: '7',
      title: 'Demande d\'autorisation d\'ouverture d\'établissement',
      type: 'procedure',
      institution: 'Ministère du Commerce',
      category: 'Commerce',
      lastUpdated: '2023-12-25',
      status: 'active',
      downloads: 389
    },
    {
      id: '8',
      title: 'Formulaire de demande de bourse universitaire',
      type: 'form',
      institution: 'Ministère de l\'Enseignement Supérieur',
      category: 'Éducation',
      lastUpdated: '2023-12-22',
      status: 'draft',
      downloads: 312
    }
  ];

  // Filtrage des éléments
  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesInstitution = filterInstitution === 'all' || item.institution === filterInstitution;
    
    return matchesSearch && matchesType && matchesInstitution;
  });

  // Pagination
  const {
    currentData: paginatedItems,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredItems,
    itemsPerPage: 5
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'procedure': return 'bg-blue-100 text-blue-800';
      case 'guide': return 'bg-green-100 text-green-800';
      case 'form': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Library className="w-5 h-5 text-blue-600" />
            Catalogue des Procédures
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtres et recherche */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher dans le catalogue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="procedure">Procédures</SelectItem>
                <SelectItem value="guide">Guides</SelectItem>
                <SelectItem value="form">Formulaires</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterInstitution} onValueChange={setFilterInstitution}>
              <SelectTrigger>
                <SelectValue placeholder="Institution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les institutions</SelectItem>
                <SelectItem value="Ministère des Transports">Ministère des Transports</SelectItem>
                <SelectItem value="Communes">Communes</SelectItem>
                <SelectItem value="CNRC">CNRC</SelectItem>
                <SelectItem value="Ministère de l'Intérieur">Ministère de l'Intérieur</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Plus de filtres
            </Button>
          </div>

          {/* Liste des éléments du catalogue */}
          <div className="space-y-4">
            {paginatedItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold">{item.title}</h3>
                        <Badge className={getTypeColor(item.type)}>
                          {item.type === 'procedure' ? 'Procédure' : 
                           item.type === 'guide' ? 'Guide' : 'Formulaire'}
                        </Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === 'active' ? 'Actif' : 
                           item.status === 'archived' ? 'Archivé' : 'Brouillon'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {item.institution}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Mis à jour: {new Date(item.lastUpdated).toLocaleDateString('fr-FR')}
                        </span>
                        <span>{item.downloads} téléchargements</span>
                      </div>
                      
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="w-4 h-4" />
                        Consulter
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Download className="w-4 h-4" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
        </CardContent>
      </Card>
    </div>
  );
}