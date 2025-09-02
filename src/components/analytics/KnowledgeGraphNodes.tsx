import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePagination } from '@/hooks/usePagination';
import { StandardPagination } from '@/components/common/StandardPagination';
import { 
  Network, 
  GitBranch, 
  Link, 
  Search, 
  Filter,
  Eye,
  Share2,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

export function KnowledgeGraphNodes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const graphNodes = [
    {
      id: 1,
      name: 'Code du Commerce',
      type: 'Document Legal',
      connections: 45,
      status: 'Active',
      lastUpdate: '2025-02-19',
      strength: 0.92,
      category: 'Primary',
      relations: [
        { target: 'Loi sur les Sociétés', strength: 0.87 },
        { target: 'Décret d\'application', strength: 0.76 }
      ]
    },
    {
      id: 2,
      name: 'Procédure de création SARL',
      type: 'Procedure',
      connections: 32,
      status: 'Active',
      lastUpdate: '2025-02-18',
      strength: 0.89,
      category: 'Secondary',
      relations: [
        { target: 'CNRC', strength: 0.94 },
        { target: 'Statuts types', strength: 0.82 }
      ]
    },
    {
      id: 3,
      name: 'Droit du Travail',
      type: 'Domain',
      connections: 67,
      status: 'Active',
      lastUpdate: '2025-02-17',
      strength: 0.95,
      category: 'Primary',
      relations: [
        { target: 'Code du Travail', strength: 0.98 },
        { target: 'Conventions collectives', strength: 0.85 }
      ]
    },
    {
      id: 4,
      name: 'Formulaire déclaration fiscale',
      type: 'Template',
      connections: 28,
      status: 'Pending',
      lastUpdate: '2025-02-16',
      strength: 0.78,
      category: 'Secondary',
      relations: [
        { target: 'Code des Impôts', strength: 0.91 },
        { target: 'DGI', strength: 0.88 }
      ]
    },
    {
      id: 5,
      name: 'Institution CNRC',
      type: 'Institution',
      connections: 54,
      status: 'Active',
      lastUpdate: '2025-02-15',
      strength: 0.91,
      category: 'Primary',
      relations: [
        { target: 'Registre du Commerce', strength: 0.96 },
        { target: 'Immatriculation', strength: 0.89 }
      ]
    },
    {
      id: 6,
      name: 'Jurisprudence Cour Suprême',
      type: 'Jurisprudence',
      connections: 39,
      status: 'Active',
      lastUpdate: '2025-02-14',
      strength: 0.86,
      category: 'Secondary',
      relations: [
        { target: 'Arrêts de référence', strength: 0.93 },
        { target: 'Doctrine', strength: 0.79 }
      ]
    },
    {
      id: 7,
      name: 'Réglementation Urbanisme',
      type: 'Regulation',
      connections: 41,
      status: 'Draft',
      lastUpdate: '2025-02-13',
      strength: 0.84,
      category: 'Secondary',
      relations: [
        { target: 'Permis de construire', strength: 0.90 },
        { target: 'Plan d\'occupation', strength: 0.77 }
      ]
    },
    {
      id: 8,
      name: 'Ministère de la Justice',
      type: 'Institution',
      connections: 62,
      status: 'Active',
      lastUpdate: '2025-02-12',
      strength: 0.93,
      category: 'Primary',
      relations: [
        { target: 'Tribunaux', strength: 0.97 },
        { target: 'Procédures judiciaires', strength: 0.92 }
      ]
    }
  ];

  const graphRelations = [
    {
      id: 1,
      source: 'Code du Commerce',
      target: 'Procédure de création SARL',
      type: 'Référence',
      strength: 0.87,
      direction: 'bidirectional',
      lastVerified: '2025-02-19'
    },
    {
      id: 2,
      source: 'Institution CNRC',
      target: 'Procédure de création SARL',
      type: 'Autorité',
      strength: 0.94,
      direction: 'unidirectional',
      lastVerified: '2025-02-18'
    },
    {
      id: 3,
      source: 'Droit du Travail',
      target: 'Code du Travail',
      type: 'Fondement',
      strength: 0.98,
      direction: 'bidirectional',
      lastVerified: '2025-02-17'
    },
    {
      id: 4,
      source: 'Formulaire déclaration fiscale',
      target: 'Code des Impôts',
      type: 'Application',
      strength: 0.91,
      direction: 'unidirectional',
      lastVerified: '2025-02-16'
    },
    {
      id: 5,
      source: 'Jurisprudence Cour Suprême',
      target: 'Doctrine',
      type: 'Interprétation',
      strength: 0.79,
      direction: 'bidirectional',
      lastVerified: '2025-02-15'
    },
    {
      id: 6,
      source: 'Réglementation Urbanisme',
      target: 'Permis de construire',
      type: 'Régulation',
      strength: 0.90,
      direction: 'unidirectional',
      lastVerified: '2025-02-14'
    }
  ];

  const filteredNodes = graphNodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || node.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || node.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const {
    currentData: paginatedNodes,
    currentPage: nodesCurrentPage,
    totalPages: nodesTotalPages,
    itemsPerPage: nodesItemsPerPage,
    totalItems: nodesTotalItems,
    setCurrentPage: setNodesCurrentPage,
    setItemsPerPage: setNodesItemsPerPage
  } = usePagination({
    data: filteredNodes,
    itemsPerPage: 5
  });

  const {
    currentData: paginatedRelations,
    currentPage: relationsCurrentPage,
    totalPages: relationsTotalPages,
    itemsPerPage: relationsItemsPerPage,
    totalItems: relationsTotalItems,
    setCurrentPage: setRelationsCurrentPage,
    setItemsPerPage: setRelationsItemsPerPage
  } = usePagination({
    data: graphRelations,
    itemsPerPage: 5
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Draft': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    return category === 'Primary' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 0.9) return 'text-green-600';
    if (strength >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5 text-purple-600" />
            Nœuds du Graphe de Connaissance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un nœud..."
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
                <option value="Document Legal">Documents légaux</option>
                <option value="Procedure">Procédures</option>
                <option value="Institution">Institutions</option>
                <option value="Domain">Domaines</option>
                <option value="Template">Modèles</option>
                <option value="Jurisprudence">Jurisprudence</option>
                <option value="Regulation">Réglementations</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="Active">Actif</option>
                <option value="Pending">En attente</option>
                <option value="Draft">Brouillon</option>
              </select>
            </div>
          </div>

          {/* Liste des nœuds */}
          <div className="space-y-4">
            {paginatedNodes.map((node) => (
              <div key={node.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{node.name}</h4>
                      <Badge variant="outline">{node.type}</Badge>
                      <Badge className={getCategoryColor(node.category)}>
                        {node.category}
                      </Badge>
                      {getStatusIcon(node.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Connexions:</span> {node.connections}
                      </div>
                      <div>
                        <span className="font-medium">Force:</span> 
                        <span className={getStrengthColor(node.strength)}> {(node.strength * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="font-medium">Dernière MAJ:</span> {node.lastUpdate}
                      </div>
                      <div>
                        <span className="font-medium">Statut:</span> {node.status}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-700">Relations principales:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {node.relations.map((relation, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {relation.target} ({(relation.strength * 100).toFixed(0)}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Visualiser
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4 mr-1" />
                      Analyser
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination pour les nœuds */}
          {filteredNodes.length > 0 && (
            <div className="mt-6">
              <StandardPagination
                currentPage={nodesCurrentPage}
                totalPages={nodesTotalPages}
                totalItems={nodesTotalItems}
                itemsPerPage={nodesItemsPerPage}
                onPageChange={setNodesCurrentPage}
                onItemsPerPageChange={setNodesItemsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-600" />
            Relations du Graphe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedRelations.map((relation) => (
              <div key={relation.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="font-medium">{relation.source}</span>
                      <span className="mx-2 text-gray-400">→</span>
                      <span className="font-medium">{relation.target}</span>
                    </div>
                    <Badge variant="outline">{relation.type}</Badge>
                    <span className={`text-sm font-medium ${getStrengthColor(relation.strength)}`}>
                      {(relation.strength * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Vérifié: {relation.lastVerified}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination pour les relations */}
          {graphRelations.length > 0 && (
            <div className="mt-6">
              <StandardPagination
                currentPage={relationsCurrentPage}
                totalPages={relationsTotalPages}
                totalItems={relationsTotalItems}
                itemsPerPage={relationsItemsPerPage}
                onPageChange={setRelationsCurrentPage}
                onItemsPerPageChange={setRelationsItemsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}