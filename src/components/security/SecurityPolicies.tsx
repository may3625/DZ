import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Shield, 
  Search, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Download,
  FileText,
  Lock,
  Key,
  UserCheck,
  Database,
  Network
} from 'lucide-react';

export function SecurityPolicies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const policies = [
    {
      id: 1,
      name: 'Politique de sécurité des données personnelles',
      description: 'Gestion et protection des données personnelles conformément au RGPD',
      category: 'Protection des données',
      status: 'active',
      severity: 'critique',
      lastReview: '2025-02-15',
      nextReview: '2025-05-15',
      version: '2.1',
      compliance: 'RGPD',
      icon: Database
    },
    {
      id: 2,
      name: 'Politique de contrôle d\'accès',
      description: 'Définition des règles d\'accès aux systèmes et applications',
      category: 'Contrôle d\'accès',
      status: 'active',
      severity: 'haute',
      lastReview: '2025-02-10',
      nextReview: '2025-04-10',
      version: '3.0',
      compliance: 'ISO 27001',
      icon: Lock
    },
    {
      id: 3,
      name: 'Politique de gestion des mots de passe',
      description: 'Règles de création et gestion des mots de passe',
      category: 'Authentification',
      status: 'active',
      severity: 'haute',
      lastReview: '2025-02-08',
      nextReview: '2025-05-08',
      version: '1.5',
      compliance: 'NIST',
      icon: Key
    },
    {
      id: 4,
      name: 'Politique de sauvegarde et récupération',
      description: 'Procédures de sauvegarde et plan de continuité',
      category: 'Continuité',
      status: 'en_revision',
      severity: 'critique',
      lastReview: '2025-01-20',
      nextReview: '2025-03-20',
      version: '2.0',
      compliance: 'ISO 22301',
      icon: Database
    },
    {
      id: 5,
      name: 'Politique de sécurité réseau',
      description: 'Configuration et surveillance de la sécurité réseau',
      category: 'Réseau',
      status: 'active',
      severity: 'haute',
      lastReview: '2025-02-12',
      nextReview: '2025-05-12',
      version: '1.8',
      compliance: 'ISO 27001',
      icon: Network
    },
    {
      id: 6,
      name: 'Politique de gestion des incidents',
      description: 'Procédures de détection et réponse aux incidents',
      category: 'Gestion des incidents',
      status: 'active',
      severity: 'critique',
      lastReview: '2025-02-05',
      nextReview: '2025-04-05',
      version: '2.2',
      compliance: 'NIST',
      icon: AlertTriangle
    },
    {
      id: 7,
      name: 'Politique de formation à la sécurité',
      description: 'Programme de sensibilisation et formation du personnel',
      category: 'Formation',
      status: 'draft',
      severity: 'moyenne',
      lastReview: '2025-01-15',
      nextReview: '2025-03-15',
      version: '1.0',
      compliance: 'ISO 27001',
      icon: UserCheck
    },
    {
      id: 8,
      name: 'Politique de télétravail sécurisé',
      description: 'Règles de sécurité pour le travail à distance',
      category: 'Télétravail',
      status: 'active',
      severity: 'haute',
      lastReview: '2025-02-01',
      nextReview: '2025-05-01',
      version: '1.3',
      compliance: 'RGPD',
      icon: Shield
    },
    {
      id: 9,
      name: 'Politique de gestion des vulnérabilités',
      description: 'Identification et correction des vulnérabilités',
      category: 'Vulnérabilités',
      status: 'en_revision',
      severity: 'haute',
      lastReview: '2025-01-25',
      nextReview: '2025-04-25',
      version: '1.7',
      compliance: 'NIST',
      icon: AlertTriangle
    },
    {
      id: 10,
      name: 'Politique de chiffrement des données',
      description: 'Standards de chiffrement pour les données sensibles',
      category: 'Chiffrement',
      status: 'active',
      severity: 'critique',
      lastReview: '2025-02-18',
      nextReview: '2025-05-18',
      version: '2.0',
      compliance: 'AES-256',
      icon: Lock
    }
  ];

  // Filtrage
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination pour les politiques
  const {
    currentData: paginatedPolicies,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredPolicies,
    itemsPerPage: 5
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'en_revision':
        return <Badge className="bg-yellow-100 text-yellow-800">En révision</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Brouillon</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expiré</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critique':
        return <Badge className="bg-red-100 text-red-800">Critique</Badge>;
      case 'haute':
        return <Badge className="bg-orange-100 text-orange-800">Haute</Badge>;
      case 'moyenne':
        return <Badge className="bg-yellow-100 text-yellow-800">Moyenne</Badge>;
      case 'basse':
        return <Badge className="bg-blue-100 text-blue-800">Basse</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'en_revision': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'draft': return <Edit className="w-4 h-4 text-gray-600" />;
      case 'expired': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusStats = () => {
    const active = policies.filter(p => p.status === 'active').length;
    const revision = policies.filter(p => p.status === 'en_revision').length;
    const draft = policies.filter(p => p.status === 'draft').length;
    const expired = policies.filter(p => p.status === 'expired').length;
    return { active, revision, draft, expired };
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Politiques de Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Actives</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.revision}</div>
              <div className="text-sm text-gray-600">En révision</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
              <div className="text-sm text-gray-600">Brouillons</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-sm text-gray-600">Expirées</div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher une politique..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="en_revision">En révision</option>
              <option value="draft">Brouillon</option>
              <option value="expired">Expiré</option>
            </select>
          </div>

          {/* Liste des politiques */}
          <div className="space-y-4">
            {paginatedPolicies.map((policy) => {
              const IconComponent = policy.icon;
              return (
                <Card key={policy.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{policy.name}</h4>
                            <span className="text-sm text-gray-500">v{policy.version}</span>
                            {getStatusIcon(policy.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {getStatusBadge(policy.status)}
                            {getSeverityBadge(policy.severity)}
                            <Badge variant="outline" className="text-xs">
                              {policy.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {policy.compliance}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Dernière révision:</span> {policy.lastReview}
                            </div>
                            <div>
                              <span className="font-medium">Prochaine révision:</span> {policy.nextReview}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-sm">Nouvelle politique</span>
              </Button>
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Révisions en cours</span>
              </Button>
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm">Politiques expirées</span>
              </Button>
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Download className="w-5 h-5" />
                <span className="text-sm">Exporter tout</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}