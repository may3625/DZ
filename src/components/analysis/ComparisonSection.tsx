import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  ArrowLeftRight, 
  FileText, 
  Search, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Download,
  Plus
} from 'lucide-react';

interface ComparisonResult {
  id: string;
  document1: string;
  document2: string;
  similarity: number;
  differences: number;
  createdDate: string;
  status: 'completed' | 'processing' | 'error';
  type: 'textual' | 'structural' | 'semantic';
  category: string;
}

export function ComparisonSection() {
  const [searchTerm, setSearchTerm] = useState('');

  const comparisons: ComparisonResult[] = [
    {
      id: '1',
      document1: 'Code Civil - Version 2023',
      document2: 'Code Civil - Version 2024',
      similarity: 87.5,
      differences: 45,
      createdDate: '2024-01-15',
      status: 'completed',
      type: 'textual',
      category: 'Code Civil'
    },
    {
      id: '2',
      document1: 'Procédure Permis de Construire - Ancienne',
      document2: 'Procédure Permis de Construire - Nouvelle',
      similarity: 62.3,
      differences: 89,
      createdDate: '2024-01-12',
      status: 'completed',
      type: 'structural',
      category: 'Procédures Administratives'
    },
    {
      id: '3',
      document1: 'Loi de Finances 2023',
      document2: 'Loi de Finances 2024',
      similarity: 71.2,
      differences: 156,
      createdDate: '2024-01-10',
      status: 'processing',
      type: 'semantic',
      category: 'Lois de Finances'
    },
    {
      id: '4',
      document1: 'Décret Exécutif 23-112',
      document2: 'Décret Exécutif 24-001',
      similarity: 94.8,
      differences: 12,
      createdDate: '2024-01-08',
      status: 'completed',
      type: 'textual',
      category: 'Décrets Exécutifs'
    },
    {
      id: '5',
      document1: 'Code du Commerce - Article 150',
      document2: 'Code du Commerce - Article 150 (Amendé)',
      similarity: 78.9,
      differences: 23,
      createdDate: '2024-01-05',
      status: 'error',
      type: 'textual',
      category: 'Code du Commerce'
    },
    {
      id: '6',
      document1: 'Procédure Visa - Version Standard',
      document2: 'Procédure Visa - Version Simplifiée',
      similarity: 56.7,
      differences: 78,
      createdDate: '2024-01-03',
      status: 'completed',
      type: 'structural',
      category: 'Procédures Consulaires'
    },
    {
      id: '7',
      document1: 'Code Pénal - Chapitre 5',
      document2: 'Code Pénal - Chapitre 5 (Révisé)',
      similarity: 83.4,
      differences: 34,
      createdDate: '2023-12-28',
      status: 'completed',
      type: 'semantic',
      category: 'Code Pénal'
    },
    {
      id: '8',
      document1: 'Loi sur l\'Investissement',
      document2: 'Loi sur l\'Investissement (Amendée)',
      similarity: 91.2,
      differences: 18,
      createdDate: '2023-12-25',
      status: 'completed',
      type: 'textual',
      category: 'Investissement'
    }
  ];

  // Filtrage des comparaisons
  const filteredComparisons = comparisons.filter(comparison =>
    comparison.document1.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comparison.document2.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comparison.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const {
    currentData: paginatedComparisons,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredComparisons,
    itemsPerPage: 5
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'textual':
        return 'bg-purple-100 text-purple-800';
      case 'structural':
        return 'bg-orange-100 text-orange-800';
      case 'semantic':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'text-green-600';
    if (similarity >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-blue-600" />
            Comparaison de Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Analysez et comparez les différences entre les versions de documents juridiques
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle Comparaison
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {comparisons.filter(c => c.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Comparaisons terminées</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {comparisons.filter(c => c.status === 'processing').length}
            </div>
            <div className="text-sm text-gray-600">En cours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {(comparisons.reduce((acc, c) => acc + c.similarity, 0) / comparisons.length).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Similarité moyenne</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {comparisons.reduce((acc, c) => acc + c.differences, 0)}
            </div>
            <div className="text-sm text-gray-600">Différences détectées</div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher une comparaison..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des comparaisons */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Comparaisons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedComparisons.map((comparison) => (
              <Card key={comparison.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(comparison.status)}
                        <h3 className="font-semibold">Comparaison #{comparison.id}</h3>
                        <Badge className={getStatusColor(comparison.status)}>
                          {comparison.status === 'completed' ? 'Terminé' :
                           comparison.status === 'processing' ? 'En cours' : 'Erreur'}
                        </Badge>
                        <Badge className={getTypeColor(comparison.type)}>
                          {comparison.type === 'textual' ? 'Textuel' :
                           comparison.type === 'structural' ? 'Structurel' : 'Sémantique'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">Document 1:</span>
                          <span className="text-sm text-gray-600">{comparison.document1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">Document 2:</span>
                          <span className="text-sm text-gray-600">{comparison.document2}</span>
                        </div>
                      </div>
                      
                      <Badge variant="outline">{comparison.category}</Badge>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(comparison.createdDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {comparison.status === 'completed' && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Similarité</span>
                          <span className={`font-medium ${getSimilarityColor(comparison.similarity)}`}>
                            {comparison.similarity}%
                          </span>
                        </div>
                        <Progress value={comparison.similarity} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Différences détectées:</span>
                        <span className="font-medium text-red-600">{comparison.differences}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Eye className="w-4 h-4" />
                      Voir Détails
                    </Button>
                    {comparison.status === 'completed' && (
                      <>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="w-4 h-4" />
                          Rapport
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <ArrowLeftRight className="w-4 h-4" />
                          Recomparer
                        </Button>
                      </>
                    )}
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