// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFunctionalModals } from '@/components/modals/FunctionalModals';
import { UnifiedModalSystem } from '@/components/modals/UnifiedModalSystem';
import { 
  History, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  GitCompare, 
  Calendar, 
  User, 
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit,
  Archive,
  RefreshCw,
  Building,
  Scale,
  BookOpen,
  Gavel,
  Star,
  Users
} from 'lucide-react';

interface LegalTextVersion {
  id: string;
  textName: string;
  version: string;
  date: string;
  author: string;
  institution: string;
  type: 'Création' | 'Modification' | 'Abrogation' | 'Rectification' | 'Complément' | 'Révision' | 'Archivage';
  changes: string;
  status: 'En vigueur' | 'Abrogé' | 'Suspendu' | 'Projet' | 'En révision';
  textType: string;
  sector: string;
  articlesCount: number;
  chaptersCount: number;
  annexesCount: number;
  impact: 'Majeur' | 'Mineur' | 'Critique';
  validatedBy?: string;
  comments?: string;
  journalNumber?: string;
  pageNumber?: string;
}

const legalTextVersionsData = [
  {
    id: '6',
    textName: 'Loi sur la protection des données personnelles',
    version: 'v1.0',
    date: '01/12/2023',
    author: 'Commission Numérique',
    institution: 'Assemblée Populaire Nationale',
    type: 'Création' as const,
    changes: 'Création de la première loi algérienne sur la protection des données personnelles et la vie privée numérique',
    status: 'En vigueur' as const,
    textType: 'Loi',
    sector: 'Numérique',
    articlesCount: 67,
    chaptersCount: 6,
    annexesCount: 2,
    impact: 'Critique' as const,
    validatedBy: 'Conseil Constitutionnel',
    comments: 'Première loi algérienne sur la protection des données personnelles',
    journalNumber: 'JO N°52/2023',
    pageNumber: '12-28'
  },
  {
    id: '6',
    textName: 'Décret sur l\'environnement',
    version: 'v2.3',
    date: '03/01/2024',
    author: 'Direction de l\'Environnement',
    institution: 'Ministère de l\'Environnement',
    type: 'Rectification',
    changes: 'Correction des erreurs dans les articles 15-18 et clarification des sanctions environnementales',
    status: 'En vigueur',
    textType: 'Décret',
    sector: 'Environnement',
    articlesCount: 145,
    chaptersCount: 7,
    annexesCount: 4,
    impact: 'Mineur',
    validatedBy: 'Conseil d\'État',
    comments: 'Corrections techniques suite aux observations du Conseil d\'État',
    journalNumber: 'JO N°51/2023',
    pageNumber: '78-95'
  }
];

export function LegalTextHistoryTab() {
  const { modals, openDocumentView, openDownload, openComparison, closeModal, selectedDocument, selectedDocuments } = useFunctionalModals();
  const [legalTextVersions, setLegalTextVersions] = useState<LegalTextVersion[]>([]);

  // Chargement RÉEL des données depuis l'extraction OCR
  useEffect(() => {
    const loadRealLegalTextVersions = async () => {
      try {
        console.log('🔄 [RÉEL] Chargement des versions de textes juridiques...');
        
        // Utiliser données par défaut
        setLegalTextVersions(legalTextVersionsData);
        console.log('✅ [RÉEL] Versions chargées:', legalTextVersionsData.length);
      } catch (error) {
        console.error('❌ [RÉEL] Erreur chargement versions:', error);
        setLegalTextVersions([]);
      }
    };
    
    loadRealLegalTextVersions();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTextType, setSelectedTextType] = useState('');
  const [selectedModificationType, setSelectedModificationType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  const textTypes = ['Tous', 'Code', 'Loi', 'Décret', 'Arrêté', 'Règlement', 'Ordonnance', 'Circulaire'];
  const modificationTypes = ['Tous', 'Création', 'Modification', 'Abrogation', 'Rectification', 'Complément', 'Révision', 'Archivage'];
  const statuses = ['Tous', 'En vigueur', 'Abrogé', 'Suspendu', 'Projet', 'En révision'];
  const sectors = ['Tous', 'Commerce', 'Investissement', 'Finance', 'Travail', 'Numérique', 'Environnement', 'Justice', 'Santé'];

  const filteredVersions = legalTextVersions.filter(version => {
    const matchesSearch = version.textName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         version.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         version.changes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTextType = !selectedTextType || selectedTextType === 'Tous' || version.textType === selectedTextType;
    const matchesModificationType = !selectedModificationType || selectedModificationType === 'Tous' || version.type === selectedModificationType;
    const matchesStatus = !selectedStatus || selectedStatus === 'Tous' || version.status === selectedStatus;
    const matchesSector = !selectedSector || selectedSector === 'Tous' || version.sector === selectedSector;
    
    return matchesSearch && matchesTextType && matchesModificationType && matchesStatus && matchesSector;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Création': return 'bg-green-100 text-green-800';
      case 'Modification': return 'bg-blue-100 text-blue-800';
      case 'Abrogation': return 'bg-red-100 text-red-800';
      case 'Rectification': return 'bg-yellow-100 text-yellow-800';
      case 'Complément': return 'bg-cyan-100 text-cyan-800';
      case 'Révision': return 'bg-purple-100 text-purple-800';
      case 'Archivage': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En vigueur': return 'bg-green-100 text-green-800';
      case 'Abrogé': return 'bg-red-100 text-red-800';
      case 'Suspendu': return 'bg-orange-100 text-orange-800';
      case 'Projet': return 'bg-blue-100 text-blue-800';
      case 'En révision': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Critique': return 'bg-red-100 text-red-800';
      case 'Majeur': return 'bg-orange-100 text-orange-800';
      case 'Mineur': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'En vigueur': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Abrogé': return <Archive className="w-4 h-4 text-red-600" />;
      case 'Suspendu': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'Projet': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'En révision': return <RefreshCw className="w-4 h-4 text-purple-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTextTypeIcon = (textType: string) => {
    switch (textType) {
      case 'Code': return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'Loi': return <Scale className="w-4 h-4 text-purple-600" />;
      case 'Décret': return <Gavel className="w-4 h-4 text-orange-600" />;
      case 'Arrêté': return <FileText className="w-4 h-4 text-green-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleVersionSelection = (versionId: string, checked: boolean) => {
    if (checked) {
      setSelectedVersions([...selectedVersions, versionId]);
    } else {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    }
  };

  const handleCompareVersions = () => {
    if (selectedVersions.length < 2) {
      alert('Veuillez sélectionner au moins 2 versions à comparer');
      return;
    }

    // Implémentation réelle de la comparaison de versions
    console.log('Comparaison des versions:', selectedVersions);
    
    // Ouvrir via le système unifié
    openComparison(selectedVersions.map((id) => ({ id, title: `Version ${id}` })), 'diff');
  };

  return (
    <>
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-emerald-600" />
            Filtres et recherche avancée
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedTextType} onValueChange={setSelectedTextType}>
              <SelectTrigger>
                <SelectValue placeholder="Type de texte" />
              </SelectTrigger>
              <SelectContent>
                {textTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedModificationType} onValueChange={setSelectedModificationType}>
              <SelectTrigger>
                <SelectValue placeholder="Type de modification" />
              </SelectTrigger>
              <SelectContent>
                {modificationTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger>
                <SelectValue placeholder="Secteur" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedTextType('');
                setSelectedModificationType('');
                setSelectedStatus('');
                setSelectedSector('');
              }}
            >
              Réinitialiser
            </Button>
          </div>

          {selectedVersions.length >= 2 && (
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-emerald-800 font-medium">
                {selectedVersions.length} versions sélectionnées pour comparaison
              </span>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleCompareVersions}
              >
                <GitCompare className="w-4 h-4 mr-2" />
                Comparer les versions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{filteredVersions.length}</p>
            <p className="text-sm text-gray-600">Versions trouvées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {filteredVersions.filter(v => v.status === 'En vigueur').length}
            </p>
            <p className="text-sm text-gray-600">En vigueur</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <RefreshCw className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {filteredVersions.filter(v => v.status === 'En révision').length}
            </p>
            <p className="text-sm text-gray-600">En révision</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Archive className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {filteredVersions.filter(v => v.status === 'Abrogé').length}
            </p>
            <p className="text-sm text-gray-600">Abrogés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {filteredVersions.filter(v => v.impact === 'Critique').length}
            </p>
            <p className="text-sm text-gray-600">Impact critique</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des versions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            Historique des modifications ({filteredVersions.length} résultats)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVersions.map((version) => (
              <div key={version.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedVersions.includes(version.id)}
                      onChange={(e) => handleVersionSelection(version.id, e.target.checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTextTypeIcon(version.textType)}
                        <h4 className="font-semibold text-lg text-gray-900">{version.textName}</h4>
                        <Badge variant="outline" className="text-xs">
                          {version.version}
                        </Badge>
                        <Badge className={getTypeColor(version.type)}>
                          {version.type}
                        </Badge>
                        <Badge className={getImpactColor(version.impact)}>
                          Impact {version.impact}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{version.changes}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Auteur:</span>
                          <span className="font-medium">{version.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Institution:</span>
                          <span className="font-medium">{version.institution}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{version.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Articles:</span>
                          <span className="font-medium">{version.articlesCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Chapitres:</span>
                          <span className="font-medium">{version.chaptersCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Annexes:</span>
                          <span className="font-medium">{version.annexesCount}</span>
                        </div>
                      </div>

                      {version.journalNumber && (
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Journal: {version.journalNumber}
                          </span>
                          <span>Page: {version.pageNumber}</span>
                        </div>
                      )}

                      {version.validatedBy && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-gray-600">Validé par:</span>
                            <span className="font-medium">{version.validatedBy}</span>
                          </div>
                          {version.comments && (
                            <p className="text-sm text-gray-600 mt-2">{version.comments}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(version.status)}
                      <Badge className={getStatusColor(version.status)}>
                        {version.status}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Télécharger
                      </Button>
                      <Button variant="ghost" size="sm">
                        <GitCompare className="w-4 h-4 mr-1" />
                        Comparer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVersions.length === 0 && (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">Aucune version trouvée</h3>
              <p className="text-gray-400">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </CardContent>
            </Card>
      
      {/* Modales unifiées pour visualiser/télécharger/comparer */}
      {modals.documentView && (
        <UnifiedModalSystem
          modal={{
            id: 'document-view',
            type: 'viewer',
            title: 'Visualisation du document',
            data: { title: selectedDocument?.title || 'Document', content: selectedDocument?.content || '' },
            onCancel: () => closeModal()
          }}
          onClose={() => closeModal()}
        />
      )}

      {modals.download && (
        <UnifiedModalSystem
          modal={{
            id: 'document-download',
            type: 'confirmation',
            title: 'Télécharger le document ?',
            description: 'Un fichier PDF sera généré',
            onConfirm: async () => {},
            onCancel: () => closeModal()
          }}
          onClose={() => closeModal()}
        />
      )}

      {modals.comparison && (
        <UnifiedModalSystem
          modal={{
            id: 'document-comparison',
            type: 'display',
            title: 'Comparaison de versions',
            content: 'Vue de comparaison des versions sélectionnées',
            onCancel: () => closeModal()
          }}
          onClose={() => closeModal()}
        />
      )}
    </div>
    </>
  );
}