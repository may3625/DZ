import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UnifiedPagination } from '@/components/common/UnifiedPagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Building2, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users,
  FileText
} from 'lucide-react';

interface Institution {
  id: string;
  name: string;
  type: 'ministere' | 'direction' | 'agence' | 'commune';
  address: string;
  phone: string;
  email: string;
  website?: string;
  procedures: number;
  region: string;
  status: 'active' | 'inactive';
}

export function InstitutionsSection() {
  const [searchTerm, setSearchTerm] = useState('');

  const institutions: Institution[] = [
    {
      id: '1',
      name: 'Ministère de l\'Intérieur et des Collectivités Locales',
      type: 'ministere',
      address: '18, Rue Docteur Saâdane, Alger',
      phone: '+213 21 73 23 00',
      email: 'contact@interieur.gov.dz',
      website: 'https://www.interieur.gov.dz',
      procedures: 156,
      region: 'Alger',
      status: 'active'
    },
    {
      id: '2',
      name: 'Direction Générale de l\'État Civil',
      type: 'direction',
      address: 'Avenue Franklin Roosevelt, Alger',
      phone: '+213 21 71 12 34',
      email: 'etat.civil@interieur.gov.dz',
      procedures: 23,
      region: 'Alger',
      status: 'active'
    },
    {
      id: '3',
      name: 'Commune d\'Alger Centre',
      type: 'commune',
      address: 'Place des Martyrs, Alger',
      phone: '+213 21 63 45 67',
      email: 'contact@alger-centre.dz',
      website: 'https://alger-centre.dz',
      procedures: 45,
      region: 'Alger',
      status: 'active'
    },
    {
      id: '4',
      name: 'Centre National du Registre du Commerce (CNRC)',
      type: 'agence',
      address: 'Lot Djenane Malik, Hydra, Alger',
      phone: '+213 21 54 89 12',
      email: 'info@cnrc.dz',
      website: 'https://www.cnrc.org.dz',
      procedures: 78,
      region: 'National',
      status: 'active'
    },
    {
      id: '5',
      name: 'Direction des Impôts de Wilaya d\'Alger',
      type: 'direction',
      address: 'Boulevard Zighout Youcef, Alger',
      phone: '+213 21 64 78 90',
      email: 'impots.alger@mfdgi.gov.dz',
      procedures: 34,
      region: 'Alger',
      status: 'active'
    },
    {
      id: '6',
      name: 'Ministère des Transports',
      type: 'ministere',
      address: '119, Rue Didouche Mourad, Alger',
      phone: '+213 21 74 56 78',
      email: 'contact@transport.gov.dz',
      website: 'https://www.transport.gov.dz',
      procedures: 67,
      region: 'National',
      status: 'active'
    },
    {
      id: '7',
      name: 'Agence Nationale de l\'Emploi (ANEM)',
      type: 'agence',
      address: '44, Rue Mohamed Belouizdad, Alger',
      phone: '+213 21 65 23 45',
      email: 'contact@anem.dz',
      website: 'https://www.anem.dz',
      procedures: 29,
      region: 'National',
      status: 'active'
    },
    {
      id: '8',
      name: 'Commune de Constantine',
      type: 'commune',
      address: 'Place Ahmed Bey, Constantine',
      phone: '+213 31 92 34 56',
      email: 'mairie@constantine.dz',
      procedures: 52,
      region: 'Constantine',
      status: 'active'
    }
  ];

  // Filtrage des institutions
  const filteredInstitutions = institutions.filter(institution =>
    institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const {
    currentData: paginatedInstitutions,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredInstitutions,
    itemsPerPage: 5
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ministere': return 'bg-purple-100 text-purple-800';
      case 'direction': return 'bg-blue-100 text-blue-800';
      case 'agence': return 'bg-green-100 text-green-800';
      case 'commune': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'ministere': return 'Ministère';
      case 'direction': return 'Direction';
      case 'agence': return 'Agence';
      case 'commune': return 'Commune';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            Répertoire des Institutions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher une institution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Liste des institutions */}
          <div className="space-y-4">
            {paginatedInstitutions.map((institution) => (
              <Card key={institution.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{institution.name}</h3>
                        <Badge className={getTypeColor(institution.type)}>
                          {getTypeName(institution.type)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{institution.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{institution.phone}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{institution.email}</span>
                          </div>
                          {institution.website && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Globe className="w-4 h-4" />
                              <a 
                                href={institution.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Site web officiel
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{institution.procedures}</div>
                      <div className="text-xs text-gray-500">Procédures</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{institution.region}</Badge>
                      <Badge className="bg-green-100 text-green-800">
                        {institution.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileText className="w-4 h-4" />
                        Voir procédures
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Users className="w-4 h-4" />
                        Contacter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6">
            <UnifiedPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              size="md"
              variant="default"
              showItemsPerPage={true}
              showInfo={true}
            />
          </div>

          {/* Statistiques */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {institutions.filter(i => i.type === 'ministere').length}
              </div>
              <div className="text-sm text-gray-600">Ministères</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {institutions.filter(i => i.type === 'direction').length}
              </div>
              <div className="text-sm text-gray-600">Directions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {institutions.filter(i => i.type === 'agence').length}
              </div>
              <div className="text-sm text-gray-600">Agences</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {institutions.filter(i => i.type === 'commune').length}
              </div>
              <div className="text-sm text-gray-600">Communes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}