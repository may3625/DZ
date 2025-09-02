import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  BookOpen, 
  FileText, 
  Calendar, 
  Building, 
  Scale,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  Tag
} from 'lucide-react';
import { DocumentImportModal } from './DocumentImportModal';
import { DocumentExportModal } from './DocumentExportModal';
import { LegalTextEnrichmentModal } from './LegalTextEnrichmentModal';
import { LegalTextValidationModal } from './LegalTextValidationModal';
import { AdvancedSearchModal } from './AdvancedSearchModal';
import { useAppStore } from '@/stores/appStore';
import { LegalText } from '@/types/store';

interface LegalTextsCatalogInterfaceProps {
  language: 'fr' | 'ar';
  onAddLegalText?: () => void;
  onEditLegalText?: (text: LegalText) => void;
  onDeleteLegalText?: (id: string) => void;
}

export function LegalTextsCatalogInterface({ 
  language, 
  onAddLegalText, 
  onEditLegalText, 
  onDeleteLegalText 
}: LegalTextsCatalogInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modals states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showEnrichmentModal, setShowEnrichmentModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedTextForEnrichment, setSelectedTextForEnrichment] = useState<LegalText | null>(null);
  const [selectedTextForValidation, setSelectedTextForValidation] = useState<LegalText | null>(null);

  const legalTexts = useAppStore(state => state.legalTexts);
  const addLegalText = useAppStore(state => state.addLegalText);
  const updateLegalText = useAppStore(state => state.updateLegalText);
  const deleteLegalText = useAppStore(state => state.deleteLegalText);

  // Filtres algériens spécialisés
  const algerianInstitutions = [
    'Présidence de la République',
    'Gouvernement',
    'Assemblée Populaire Nationale',
    'Conseil de la Nation',
    'Conseil Constitutionnel',
    'Cour Suprême',
    'Conseil d\'État',
    'Ministère de la Justice',
    'Ministère de l\'Intérieur',
    'Ministère des Finances',
    'Ministère de l\'Énergie',
    'Ministère de l\'Éducation',
    'Ministère de la Santé',
    'Wali',
    'APC'
  ];

  const documentTypes = [
    { value: 'constitution', label: language === 'fr' ? 'Constitution' : 'الدستور' },
    { value: 'loi_organique', label: language === 'fr' ? 'Loi organique' : 'قانون عضوي' },
    { value: 'loi', label: language === 'fr' ? 'Loi' : 'قانون' },
    { value: 'ordonnance', label: language === 'fr' ? 'Ordonnance' : 'أمر' },
    { value: 'decret_presidentiel', label: language === 'fr' ? 'Décret présidentiel' : 'مرسوم رئاسي' },
    { value: 'decret_executif', label: language === 'fr' ? 'Décret exécutif' : 'مرسوم تنفيذي' },
    { value: 'arrete', label: language === 'fr' ? 'Arrêté' : 'قرار' },
    { value: 'decision', label: language === 'fr' ? 'Décision' : 'قرار' },
    { value: 'circulaire', label: language === 'fr' ? 'Circulaire' : 'منشور' },
    { value: 'instruction', label: language === 'fr' ? 'Instruction' : 'تعليمة' }
  ];

  const statusOptions = [
    { value: 'en_vigueur', label: language === 'fr' ? 'En vigueur' : 'نافذ' },
    { value: 'abroge', label: language === 'fr' ? 'Abrogé' : 'ملغى' },
    { value: 'modifie', label: language === 'fr' ? 'Modifié' : 'معدل' },
    { value: 'suspendu', label: language === 'fr' ? 'Suspendu' : 'معلق' },
    { value: 'projet', label: language === 'fr' ? 'Projet' : 'مشروع' }
  ];

  // Filtrage et tri
  const filteredAndSortedTexts = useMemo(() => {
    let filtered = legalTexts.filter(text => {
      const matchesSearch = searchTerm === '' || 
        text.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        text.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        text.numero?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'all' || text.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || text.status === selectedStatus;
      const matchesInstitution = selectedInstitution === 'all' || 
        text.source?.toLowerCase().includes(selectedInstitution.toLowerCase());
      
      const textYear = text.datePublication ? new Date(text.datePublication).getFullYear().toString() : '';
      const matchesYear = selectedYear === 'all' || textYear === selectedYear;

      return matchesSearch && matchesType && matchesStatus && matchesInstitution && matchesYear;
    });

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.datePublication || 0).getTime() - new Date(a.datePublication || 0).getTime();
        case 'date_asc':
          return new Date(a.datePublication || 0).getTime() - new Date(b.datePublication || 0).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return filtered;
  }, [legalTexts, searchTerm, selectedType, selectedStatus, selectedInstitution, selectedYear, sortBy]);

  const handleEnrichText = (text: LegalText) => {
    setSelectedTextForEnrichment(text);
    setShowEnrichmentModal(true);
  };

  const handleValidateText = (text: LegalText) => {
    setSelectedTextForValidation(text);
    setShowValidationModal(true);
  };

  const getAvailableYears = () => {
    const years = legalTexts
      .map(text => text.datePublication ? new Date(text.datePublication).getFullYear() : null)
      .filter(year => year !== null)
      .filter((year, index, array) => array.indexOf(year) === index)
      .sort((a, b) => (b as number) - (a as number));
    
    return years as number[];
  };

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header avec actions principales */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'fr' ? 'Catalogue des Textes Juridiques' : 'كتالوج النصوص القانونية'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'fr' 
              ? 'Interface complète de catalogage et gestion des textes juridiques algériens'
              : 'واجهة شاملة لفهرسة وإدارة النصوص القانونية الجزائرية'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowImportModal(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Importer' : 'استيراد'}
          </Button>
          
          <Button onClick={() => setShowExportModal(true)} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Exporter' : 'تصدير'}
          </Button>
          
          <Button onClick={() => setShowAdvancedSearch(true)} variant="outline">
            <Search className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Recherche avancée' : 'بحث متقدم'}
          </Button>
          
          <Button onClick={onAddLegalText}>
            <Plus className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Ajouter' : 'إضافة'}
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Recherche principale */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={language === 'fr' ? 'Rechercher dans les textes juridiques...' : 'البحث في النصوص القانونية...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'fr' ? 'Type de document' : 'نوع الوثيقة'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'fr' ? 'Tous les types' : 'جميع الأنواع'}
                  </SelectItem>
                  {documentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'fr' ? 'Statut' : 'الحالة'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'fr' ? 'Tous les statuts' : 'جميع الحالات'}
                  </SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'fr' ? 'Institution' : 'المؤسسة'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'fr' ? 'Toutes les institutions' : 'جميع المؤسسات'}
                  </SelectItem>
                  {algerianInstitutions.map(institution => (
                    <SelectItem key={institution} value={institution}>
                      {institution}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'fr' ? 'Année' : 'السنة'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'fr' ? 'Toutes les années' : 'جميع السنوات'}
                  </SelectItem>
                  {getAvailableYears().map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'fr' ? 'Trier par' : 'ترتيب حسب'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">
                    {language === 'fr' ? 'Date (récent → ancien)' : 'التاريخ (الأحدث → الأقدم)'}
                  </SelectItem>
                  <SelectItem value="date_asc">
                    {language === 'fr' ? 'Date (ancien → récent)' : 'التاريخ (الأقدم → الأحدث)'}
                  </SelectItem>
                  <SelectItem value="title_asc">
                    {language === 'fr' ? 'Titre (A → Z)' : 'العنوان (أ → ي)'}
                  </SelectItem>
                  <SelectItem value="title_desc">
                    {language === 'fr' ? 'Titre (Z → A)' : 'العنوان (ي → أ)'}
                  </SelectItem>
                  <SelectItem value="type">
                    {language === 'fr' ? 'Type de document' : 'نوع الوثيقة'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{filteredAndSortedTexts.length}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'fr' ? 'Textes trouvés' : 'النصوص الموجودة'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Scale className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredAndSortedTexts.filter(t => t.status === 'en_vigueur').length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'fr' ? 'En vigueur' : 'نافذة'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {new Set(filteredAndSortedTexts.map(t => t.source)).size}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'fr' ? 'Institutions' : 'المؤسسات'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{getAvailableYears().length}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'fr' ? 'Années couvertes' : 'السنوات المغطاة'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des textes juridiques */}
      <div className="space-y-4">
        {filteredAndSortedTexts.map(text => (
          <Card key={text.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{text.title}</h3>
                        <Badge variant="outline">{documentTypes.find(t => t.value === text.type)?.label || text.type}</Badge>
                        <Badge 
                          variant={text.status === 'en_vigueur' ? 'default' : 'secondary'}
                          className={text.status === 'en_vigueur' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {statusOptions.find(s => s.value === text.status)?.label || text.status}
                        </Badge>
                      </div>
                      
                      {text.numero && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === 'fr' ? 'Numéro:' : 'الرقم:'} {text.numero}
                        </p>
                      )}
                      
                      {text.datePublication && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {language === 'fr' ? 'Date de publication:' : 'تاريخ النشر:'} {' '}
                          {new Date(text.datePublication).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'ar-DZ')}
                        </p>
                      )}
                      
                      {text.source && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {language === 'fr' ? 'Source:' : 'المصدر:'} {text.source}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {text.content.substring(0, 200)}...
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    <Eye className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Consulter' : 'استشارة'}
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={() => handleEnrichText(text)}>
                    <Star className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Enrichir' : 'إثراء'}
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={() => handleValidateText(text)}>
                    <Tag className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Valider' : 'تصديق'}
                  </Button>
                  
                  {onEditLegalText && (
                    <Button variant="outline" size="sm" onClick={() => onEditLegalText(text)}>
                      <Edit className="w-4 h-4 mr-2" />
                      {language === 'fr' ? 'Modifier' : 'تعديل'}
                    </Button>
                  )}
                  
                  {onDeleteLegalText && (
                    <Button variant="destructive" size="sm" onClick={() => onDeleteLegalText(text.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      {language === 'fr' ? 'Supprimer' : 'حذف'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredAndSortedTexts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'fr' ? 'Aucun texte trouvé' : 'لا توجد نصوص'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'fr' 
                  ? 'Aucun texte juridique ne correspond à vos critères de recherche.'
                  : 'لا توجد نصوص قانونية تطابق معايير البحث الخاصة بك.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <DocumentImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={(files) => {
          console.log('Fichiers importés:', files);
          setShowImportModal(false);
        }}
      />

      <DocumentExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        selectedTexts={filteredAndSortedTexts}
        language={language}
      />

      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        language={language}
        onSearch={(criteria) => {
          console.log('Critères de recherche avancée:', criteria);
          setShowAdvancedSearch(false);
        }}
      />

      {selectedTextForEnrichment && (
        <LegalTextEnrichmentModal
          isOpen={showEnrichmentModal}
          onClose={() => {
            setShowEnrichmentModal(false);
            setSelectedTextForEnrichment(null);
          }}
          legalText={selectedTextForEnrichment}
          language={language}
          onEnrich={(enrichedText) => {
            updateLegalText(enrichedText.id, enrichedText);
            setShowEnrichmentModal(false);
            setSelectedTextForEnrichment(null);
          }}
        />
      )}

      {selectedTextForValidation && (
        <LegalTextValidationModal
          isOpen={showValidationModal}
          onClose={() => {
            setShowValidationModal(false);
            setSelectedTextForValidation(null);
          }}
          legalText={selectedTextForValidation}
          language={language}
          onValidate={(validatedText) => {
            updateLegalText(validatedText.id, validatedText);
            setShowValidationModal(false);
            setSelectedTextForValidation(null);
          }}
        />
      )}
    </div>
  );
}