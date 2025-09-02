import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  BookOpen, 
  Search, 
  FileText, 
  Scale,
  Building,
  Briefcase,
  Users,
  Gavel,
  Shield,
  Globe,
  Home,
  Landmark,
  Truck,
  Heart,
  GraduationCap,
  TreePine
} from 'lucide-react';

export function MainCategories() {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      id: 1,
      name: 'Droit Civil',
      description: 'Règles régissant les rapports entre personnes privées',
      termsCount: 1247,
      icon: Scale,
      subcategories: ['Obligations', 'Contrats', 'Propriété', 'Famille'],
      lastUpdate: '2025-02-18'
    },
    {
      id: 2,
      name: 'Droit Pénal',
      description: 'Infractions et sanctions pénales',
      termsCount: 892,
      icon: Gavel,
      subcategories: ['Crimes', 'Délits', 'Contraventions', 'Procédure'],
      lastUpdate: '2025-02-17'
    },
    {
      id: 3,
      name: 'Droit Commercial',
      description: 'Réglementation des activités commerciales',
      termsCount: 756,
      icon: Briefcase,
      subcategories: ['Sociétés', 'Commerce', 'Concurrence', 'Bankruptcy'],
      lastUpdate: '2025-02-16'
    },
    {
      id: 4,
      name: 'Droit Administratif',
      description: 'Organisation et fonctionnement de l\'administration',
      termsCount: 634,
      icon: Building,
      subcategories: ['Fonction publique', 'Marchés publics', 'Contrôle', 'Contentieux'],
      lastUpdate: '2025-02-15'
    },
    {
      id: 5,
      name: 'Droit du Travail',
      description: 'Relations individuelles et collectives de travail',
      termsCount: 523,
      icon: Users,
      subcategories: ['Contrat de travail', 'Syndicats', 'Grève', 'Sécurité'],
      lastUpdate: '2025-02-14'
    },
    {
      id: 6,
      name: 'Droit International',
      description: 'Relations juridiques internationales',
      termsCount: 445,
      icon: Globe,
      subcategories: ['Traités', 'Diplomatie', 'Commerce international', 'Organisations'],
      lastUpdate: '2025-02-13'
    },
    {
      id: 7,
      name: 'Droit Constitutionnel',
      description: 'Organisation des pouvoirs publics',
      termsCount: 389,
      icon: Landmark,
      subcategories: ['Constitution', 'Élections', 'Droits fondamentaux', 'Institutions'],
      lastUpdate: '2025-02-12'
    },
    {
      id: 8,
      name: 'Droit Fiscal',
      description: 'Réglementation des impôts et taxes',
      termsCount: 312,
      icon: FileText,
      subcategories: ['Impôts directs', 'Impôts indirects', 'Douanes', 'Contrôle fiscal'],
      lastUpdate: '2025-02-11'
    },
    {
      id: 9,
      name: 'Droit de la Propriété',
      description: 'Droits réels et propriété intellectuelle',
      termsCount: 289,
      icon: Home,
      subcategories: ['Propriété immobilière', 'Propriété mobilière', 'Usufruit', 'Servitudes'],
      lastUpdate: '2025-02-10'
    },
    {
      id: 10,
      name: 'Droit des Transports',
      description: 'Réglementation du secteur des transports',
      termsCount: 267,
      icon: Truck,
      subcategories: ['Transport routier', 'Transport maritime', 'Transport aérien', 'Logistique'],
      lastUpdate: '2025-02-09'
    },
    {
      id: 11,
      name: 'Droit de la Santé',
      description: 'Réglementation du secteur de la santé',
      termsCount: 234,
      icon: Heart,
      subcategories: ['Profession médicale', 'Établissements de santé', 'Médicaments', 'Responsabilité'],
      lastUpdate: '2025-02-08'
    },
    {
      id: 12,
      name: 'Droit de l\'Éducation',
      description: 'Organisation du système éducatif',
      termsCount: 198,
      icon: GraduationCap,
      subcategories: ['Enseignement primaire', 'Enseignement secondaire', 'Enseignement supérieur', 'Formation'],
      lastUpdate: '2025-02-07'
    },
    {
      id: 13,
      name: 'Droit de l\'Environnement',
      description: 'Protection de l\'environnement et développement durable',
      termsCount: 176,
      icon: TreePine,
      subcategories: ['Pollution', 'Biodiversité', 'Énergie', 'Climat'],
      lastUpdate: '2025-02-06'
    },
    {
      id: 14,
      name: 'Droit de la Sécurité',
      description: 'Sécurité publique et ordre public',
      termsCount: 156,
      icon: Shield,
      subcategories: ['Police', 'Gendarmerie', 'Sécurité civile', 'Défense'],
      lastUpdate: '2025-02-05'
    }
  ];

  // Filtrage par terme de recherche
  const filteredCategories = categories.filter(
    category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategories.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination pour les catégories principales
  const {
    currentData: paginatedCategories,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredCategories,
    itemsPerPage: 6
  });

  const getTotalTerms = () => categories.reduce((sum, cat) => sum + cat.termsCount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Catégories Principales
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Catégories</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{getTotalTerms().toLocaleString()}</div>
              <div className="text-sm text-gray-600">Termes totaux</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">48</div>
              <div className="text-sm text-gray-600">Sous-catégories</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">99%</div>
              <div className="text-sm text-gray-600">Couverture</div>
            </div>
          </div>

          {/* Grille des catégories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <div className="text-sm text-gray-500">
                          {category.termsCount} termes
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    
                    {/* Sous-catégories */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {category.subcategories.slice(0, 3).map((sub, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                      {category.subcategories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{category.subcategories.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Mis à jour: {category.lastUpdate}</span>
                      <Button variant="ghost" size="sm">
                        Explorer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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

          {/* Actions rapides */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">Actions rapides</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Search className="w-5 h-5" />
                <span className="text-sm">Recherche avancée</span>
              </Button>
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-sm">Nouveau terme</span>
              </Button>
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm">Guide d'utilisation</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}