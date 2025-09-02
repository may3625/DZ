import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Building, 
  Scale, 
  Users, 
  Search,
  Filter,
  Calendar,
  FileText,
  Star
} from 'lucide-react';

interface AlgerianInstitution {
  id: string;
  name: string;
  nameAr: string;
  type: 'ministere' | 'tribunal' | 'administration' | 'universite';
  wilaya: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  services: string[];
}

interface AlgerianLegalText {
  id: string;
  title: string;
  titleAr: string;
  type: 'loi' | 'decret' | 'arrete' | 'ordonnance';
  number: string;
  date: string;
  status: 'en_vigueur' | 'abroge' | 'modifie';
  domain: string;
  authority: string;
  summary: string;
  content?: string;
}

export function EnhancedAlgerianData() {
  const [activeTab, setActiveTab] = useState<'institutions' | 'texts' | 'procedures'>('institutions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('');

  // Données enrichies des institutions algériennes
  const algerianInstitutions: AlgerianInstitution[] = [
    {
      id: 'inst-1',
      name: 'Ministère de la Justice',
      nameAr: 'وزارة العدل',
      type: 'ministere',
      wilaya: 'Alger',
      address: '8, Place Bir Hakem, El Biar, Alger',
      phone: '+213 21 92 33 33',
      email: 'contact@mjustice.dz',
      website: 'www.mjustice.dz',
      services: ['État civil', 'Casier judiciaire', 'Légalisation', 'Notariat']
    },
    {
      id: 'inst-2',
      name: 'Cour Suprême',
      nameAr: 'المحكمة العليا',
      type: 'tribunal',
      wilaya: 'Alger',
      address: '11, Chemin Ibn Badis, Kouba, Alger',
      phone: '+213 21 28 34 56',
      services: ['Pourvoi en cassation', 'Unification jurisprudence', 'Avis consultatifs']
    },
    {
      id: 'inst-3',
      name: 'Conseil d\'État',
      nameAr: 'مجلس الدولة',
      type: 'tribunal',
      wilaya: 'Alger',
      address: '12, Rue Abderrahmane Laâla, Hydra, Alger',
      phone: '+213 21 69 12 34',
      services: ['Contentieux administratif', 'Avis juridiques', 'Contrôle légalité']
    },
    {
      id: 'inst-4',
      name: 'Université d\'Alger 1 - Faculté de Droit',
      nameAr: 'جامعة الجزائر 1 - كلية الحقوق',
      type: 'universite',
      wilaya: 'Alger',
      address: '2, Rue Didouche Mourad, Alger Centre',
      phone: '+213 21 63 78 90',
      email: 'droit@univ-alger.dz',
      services: ['Formation juridique', 'Recherche', 'Expertise', 'Formation continue']
    }
  ];

  // Données enrichies des textes juridiques algériens
  const algerianLegalTexts: AlgerianLegalText[] = [
    {
      id: 'text-1',
      title: 'Constitution de la République Algérienne Démocratique et Populaire',
      titleAr: 'دستور الجمهورية الجزائرية الديمقراطية الشعبية',
      type: 'loi',
      number: '2020-442',
      date: '2020-12-30',
      status: 'en_vigueur',
      domain: 'Droit constitutionnel',
      authority: 'Parlement',
      summary: 'Loi fondamentale définissant l\'organisation de l\'État algérien'
    },
    {
      id: 'text-2',
      title: 'Code pénal',
      titleAr: 'قانون العقوبات',
      type: 'loi',
      number: '66-156',
      date: '1966-06-08',
      status: 'en_vigueur',
      domain: 'Droit pénal',
      authority: 'Parlement',
      summary: 'Définit les infractions et les sanctions pénales en Algérie'
    },
    {
      id: 'text-3',
      title: 'Code de procédure civile et administrative',
      titleAr: 'قانون الإجراءات المدنية والإدارية',
      type: 'loi',
      number: '08-09',
      date: '2008-02-25',
      status: 'en_vigueur',
      domain: 'Procédure civile',
      authority: 'Parlement',
      summary: 'Règles de procédure devant les juridictions civiles et administratives'
    },
    {
      id: 'text-4',
      title: 'Loi sur la famille',
      titleAr: 'قانون الأسرة',
      type: 'loi',
      number: '84-11',
      date: '1984-06-09',
      status: 'modifie',
      domain: 'Droit de la famille',
      authority: 'Parlement',
      summary: 'Statut personnel et relations familiales'
    }
  ];

  const wilayas = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
    'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
    'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda',
    'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
    'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj',
    'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
    'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane'
  ];

  const filteredInstitutions = algerianInstitutions.filter(inst => {
    const matchesSearch = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inst.nameAr.includes(searchQuery) ||
                         inst.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesWilaya = !selectedWilaya || inst.wilaya === selectedWilaya;
    return matchesSearch && matchesWilaya;
  });

  const filteredTexts = algerianLegalTexts.filter(text => 
    text.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    text.titleAr.includes(searchQuery) ||
    text.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderInstitutions = () => (
    <div className="space-y-4">
      {filteredInstitutions.map(institution => (
        <Card key={institution.id} className="algerian-data hover-lift">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{institution.name}</CardTitle>
                <p className="text-sm text-gray-600 font-cairo" dir="rtl">{institution.nameAr}</p>
              </div>
              <Badge variant="outline" className="ml-2">
                {institution.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{institution.address}, {institution.wilaya}</span>
              </div>
              
              {institution.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 text-gray-500">📞</span>
                  <span>{institution.phone}</span>
                </div>
              )}
              
              {institution.email && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 text-gray-500">📧</span>
                  <span>{institution.email}</span>
                </div>
              )}
              
              <div className="mt-3">
                <h4 className="text-sm font-medium mb-2">Services disponibles:</h4>
                <div className="flex flex-wrap gap-1">
                  {institution.services.map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTexts = () => (
    <div className="space-y-4">
      {filteredTexts.map(text => (
        <Card key={text.id} className="algerian-data hover-lift">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{text.title}</CardTitle>
                <p className="text-sm text-gray-600 font-cairo mt-1" dir="rtl">{text.titleAr}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={text.status === 'en_vigueur' ? 'default' : 'secondary'}>
                  {text.status === 'en_vigueur' ? 'En vigueur' : 
                   text.status === 'abroge' ? 'Abrogé' : 'Modifié'}
                </Badge>
                <Badge variant="outline">{text.type}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Numéro:</span> {text.number}
                </div>
                <div>
                  <span className="font-medium">Date:</span> {new Date(text.date).toLocaleDateString('fr-DZ')}
                </div>
                <div>
                  <span className="font-medium">Domaine:</span> {text.domain}
                </div>
                <div>
                  <span className="font-medium">Autorité:</span> {text.authority}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{text.summary}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <FileText className="w-3 h-3 mr-1" />
                  Consulter
                </Button>
                <Button size="sm" variant="outline">
                  <Star className="w-3 h-3 mr-1" />
                  Favoris
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-green-600" />
            Données Locales Algériennes Enrichies
          </CardTitle>
          <p className="text-sm text-gray-600">
            Accès aux institutions, textes juridiques et procédures officielles d'Algérie
          </p>
        </CardHeader>
        <CardContent>
          {/* Navigation par onglets */}
          <div className="flex gap-2 mb-6">
            <Button 
              variant={activeTab === 'institutions' ? 'default' : 'outline'}
              onClick={() => setActiveTab('institutions')}
              size="sm"
            >
              <Building className="w-4 h-4 mr-2" />
              Institutions
            </Button>
            <Button 
              variant={activeTab === 'texts' ? 'default' : 'outline'}
              onClick={() => setActiveTab('texts')}
              size="sm"
            >
              <Scale className="w-4 h-4 mr-2" />
              Textes juridiques
            </Button>
            <Button 
              variant={activeTab === 'procedures' ? 'default' : 'outline'}
              onClick={() => setActiveTab('procedures')}
              size="sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              Procédures
            </Button>
          </div>

          {/* Filtres */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            {activeTab === 'institutions' && (
              <select
                value={selectedWilaya}
                onChange={(e) => setSelectedWilaya(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Toutes les wilayas</option>
                {wilayas.map(wilaya => (
                  <option key={wilaya} value={wilaya}>{wilaya}</option>
                ))}
              </select>
            )}
          </div>

          {/* Contenu basé sur l'onglet actif */}
          {activeTab === 'institutions' && renderInstitutions()}
          {activeTab === 'texts' && renderTexts()}
          {activeTab === 'procedures' && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Section des procédures en cours de développement</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}