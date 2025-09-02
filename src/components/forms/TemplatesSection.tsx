import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Copy,
  Plus,
  Star,
  Clock,
  User,
  Tag,
  Eye
} from 'lucide-react';

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'document' | 'form' | 'contract' | 'letter';
  fields: number;
  usage: number;
  rating: number;
  author: string;
  createdDate: string;
  lastModified: string;
  tags: string[];
  status: 'public' | 'private' | 'shared';
  size: string;
  language: 'fr' | 'ar' | 'both';
}

export function TemplatesSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const templates: FormTemplate[] = [
    {
      id: '1',
      name: 'Demande de certificat de résidence',
      description: 'Formulaire standard pour demander un certificat de résidence auprès de la commune',
      category: 'État civil',
      type: 'form',
      fields: 12,
      usage: 1247,
      rating: 4.8,
      author: 'Administration Communale',
      createdDate: '2024-01-15',
      lastModified: '2024-01-15',
      tags: ['résidence', 'commune', 'certificat', 'état civil'],
      status: 'public',
      size: '2.3 KB',
      language: 'both'
    },
    {
      id: '2',
      name: 'Contrat de travail CDI',
      description: 'Modèle de contrat de travail à durée indéterminée conforme au droit algérien',
      category: 'Droit du travail',
      type: 'contract',
      fields: 28,
      usage: 892,
      rating: 4.6,
      author: 'Juriste Expert',
      createdDate: '2024-01-12',
      lastModified: '2024-01-14',
      tags: ['CDI', 'travail', 'contrat', 'emploi'],
      status: 'public',
      size: '5.7 KB',
      language: 'fr'
    },
    {
      id: '3',
      name: 'Procuration notariée',
      description: 'Modèle de procuration pour actes notariés avec mentions obligatoires',
      category: 'Notariat',
      type: 'document',
      fields: 15,
      usage: 756,
      rating: 4.9,
      author: 'Chambre des Notaires',
      createdDate: '2024-01-10',
      lastModified: '2024-01-13',
      tags: ['procuration', 'notaire', 'mandat', 'représentation'],
      status: 'public',
      size: '3.2 KB',
      language: 'both'
    },
    {
      id: '4',
      name: 'Déclaration fiscale entreprise',
      description: 'Formulaire de déclaration fiscale pour les entreprises (G50)',
      category: 'Fiscal',
      type: 'form',
      fields: 45,
      usage: 634,
      rating: 4.2,
      author: 'Direction des Impôts',
      createdDate: '2024-01-08',
      lastModified: '2024-01-11',
      tags: ['fiscal', 'déclaration', 'entreprise', 'G50'],
      status: 'public',
      size: '8.9 KB',
      language: 'fr'
    },
    {
      id: '5',
      name: 'Lettre de mise en demeure',
      description: 'Modèle de lettre de mise en demeure pour recouvrement de créances',
      category: 'Recouvrement',
      type: 'letter',
      fields: 8,
      usage: 523,
      rating: 4.4,
      author: 'Cabinet d\'Avocats',
      createdDate: '2024-01-05',
      lastModified: '2024-01-09',
      tags: ['mise en demeure', 'créance', 'recouvrement', 'lettre'],
      status: 'shared',
      size: '1.8 KB',
      language: 'fr'
    },
    {
      id: '6',
      name: 'Bail de logement',
      description: 'Contrat de bail pour logement à usage d\'habitation',
      category: 'Immobilier',
      type: 'contract',
      fields: 32,
      usage: 1156,
      rating: 4.7,
      author: 'Syndic Immobilier',
      createdDate: '2024-01-03',
      lastModified: '2024-01-12',
      tags: ['bail', 'location', 'logement', 'immobilier'],
      status: 'public',
      size: '6.4 KB',
      language: 'both'
    },
    {
      id: '7',
      name: 'Demande de visa touristique',
      description: 'Formulaire de demande de visa touristique pour l\'Algérie',
      category: 'Immigration',
      type: 'form',
      fields: 22,
      usage: 2103,
      rating: 4.1,
      author: 'Consulat d\'Algérie',
      createdDate: '2023-12-28',
      lastModified: '2024-01-07',
      tags: ['visa', 'tourisme', 'immigration', 'consulat'],
      status: 'public',
      size: '4.1 KB',
      language: 'both'
    },
    {
      id: '8',
      name: 'Statuts SARL',
      description: 'Modèle de statuts pour société à responsabilité limitée',
      category: 'Droit des sociétés',
      type: 'document',
      fields: 38,
      usage: 445,
      rating: 4.8,
      author: 'CNRC',
      createdDate: '2023-12-25',
      lastModified: '2024-01-06',
      tags: ['SARL', 'statuts', 'société', 'création'],
      status: 'public',
      size: '7.2 KB',
      language: 'fr'
    }
  ];

  // Filtrage des templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    const matchesType = filterType === 'all' || template.type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Pagination
  const {
    currentData: paginatedTemplates,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredTemplates,
    itemsPerPage: 5
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'form': return 'bg-green-100 text-green-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'letter': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-red-100 text-red-800';
      case 'shared': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'fr': return 'bg-blue-100 text-blue-800';
      case 'ar': return 'bg-emerald-100 text-emerald-800';
      case 'both': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Catégories et types uniques
  const categories = [...new Set(templates.map(t => t.category))];
  const types = [...new Set(templates.map(t => t.type))];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Modèles de Formulaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Bibliothèque de modèles de documents et formulaires juridiques prêts à l'emploi
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau modèle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
            <div className="text-sm text-gray-600">Modèles disponibles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {templates.filter(t => t.status === 'public').length}
            </div>
            <div className="text-sm text-gray-600">Modèles publics</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {templates.reduce((acc, t) => acc + t.usage, 0)}
            </div>
            <div className="text-sm text-gray-600">Utilisations totales</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {(templates.reduce((acc, t) => acc + t.rating, 0) / templates.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Note moyenne</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher un modèle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              className="border rounded px-3 py-2"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select 
              className="border rounded px-3 py-2"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tous les types</option>
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'document' ? 'Document' :
                   type === 'form' ? 'Formulaire' :
                   type === 'contract' ? 'Contrat' : 'Lettre'}
                </option>
              ))}
            </select>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Plus de filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des modèles */}
      <div className="space-y-4">
        {paginatedTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <Badge className={getTypeColor(template.type)}>
                      {template.type === 'document' ? 'Document' :
                       template.type === 'form' ? 'Formulaire' :
                       template.type === 'contract' ? 'Contrat' : 'Lettre'}
                    </Badge>
                    <Badge className={getStatusColor(template.status)}>
                      {template.status === 'public' ? 'Public' :
                       template.status === 'private' ? 'Privé' : 'Partagé'}
                    </Badge>
                    <Badge className={getLanguageColor(template.language)}>
                      {template.language === 'fr' ? 'Français' :
                       template.language === 'ar' ? 'العربية' : 'Bilingue'}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{template.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {template.fields} champs
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {template.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(template.lastModified).toLocaleDateString('fr-FR')}
                    </span>
                    <span>{template.size}</span>
                  </div>
                  
                  <Badge variant="outline">{template.category}</Badge>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-2">
                    {getRatingStars(Math.round(template.rating))}
                    <span className="text-sm ml-1">({template.rating})</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {template.usage} utilisations
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {template.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t">
                <Button size="sm" className="gap-1">
                  <Download className="w-4 h-4" />
                  Télécharger
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Eye className="w-4 h-4" />
                  Aperçu
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Copy className="w-4 h-4" />
                  Dupliquer
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Edit className="w-4 h-4" />
                  Personnaliser
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Star className="w-4 h-4" />
                  Favoris
                </Button>
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

      {/* Catégories populaires */}
      <Card>
        <CardHeader>
          <CardTitle>Catégories Populaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const categoryTemplates = templates.filter(t => t.category === category);
              const totalUsage = categoryTemplates.reduce((acc, t) => acc + t.usage, 0);
              
              return (
                <div key={category} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="font-medium text-sm">{category}</div>
                  <div className="text-xs text-gray-500">
                    {categoryTemplates.length} modèles • {totalUsage} utilisations
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}