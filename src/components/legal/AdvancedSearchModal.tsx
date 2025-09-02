import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Calendar, 
  Building, 
  Scale, 
  FileText, 
  Tag,
  MapPin,
  Users,
  Clock,
  X
} from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'fr' | 'ar';
  onSearch: (criteria: AdvancedSearchCriteria) => void;
}

interface AdvancedSearchCriteria {
  // Recherche textuelle
  fullText: string;
  title: string;
  number: string;
  keywords: string[];
  
  // Filtres par type
  documentTypes: string[];
  legalStatuses: string[];
  institutions: string[];
  
  // Filtres temporels
  dateRange: DateRange | undefined;
  publicationYear: string;
  lastModifiedRange: DateRange | undefined;
  
  // Filtres géographiques (spécifiques à l'Algérie)
  wilayas: string[];
  legalDomains: string[];
  
  // Filtres avancés
  hasReferences: boolean;
  hasAmendments: boolean;
  isInForce: boolean;
  contentLanguage: 'fr' | 'ar' | 'both';
  
  // Options de recherche
  searchMode: 'exact' | 'fuzzy' | 'boolean';
  sortBy: string;
  maxResults: number;
}

export function AdvancedSearchModal({ isOpen, onClose, language, onSearch }: AdvancedSearchModalProps) {
  const [searchCriteria, setSearchCriteria] = useState<AdvancedSearchCriteria>({
    fullText: '',
    title: '',
    number: '',
    keywords: [],
    documentTypes: [],
    legalStatuses: [],
    institutions: [],
    dateRange: undefined,
    publicationYear: '',
    lastModifiedRange: undefined,
    wilayas: [],
    legalDomains: [],
    hasReferences: false,
    hasAmendments: false,
    isInForce: false,
    contentLanguage: 'both',
    searchMode: 'fuzzy',
    sortBy: 'relevance',
    maxResults: 100
  });

  const [currentKeyword, setCurrentKeyword] = useState('');

  // Options spécifiques à l'Algérie
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
    'Ministère de la Santé'
  ];

  const algerianWilayas = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa',
    'Biskra', 'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa',
    'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel',
    'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla',
    'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj', 'Boumerdès',
    'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
    'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar',
    'Ouled Djellal', 'Béni Abbès', 'In Salah', 'In Guezzam',
    'Touggourt', 'Djanet', 'El M\'Ghair', 'El Meniaa'
  ];

  const legalDomains = [
    { value: 'constitutional', label: language === 'fr' ? 'Droit constitutionnel' : 'القانون الدستوري' },
    { value: 'administrative', label: language === 'fr' ? 'Droit administratif' : 'القانون الإداري' },
    { value: 'civil', label: language === 'fr' ? 'Droit civil' : 'القانون المدني' },
    { value: 'commercial', label: language === 'fr' ? 'Droit commercial' : 'القانون التجاري' },
    { value: 'criminal', label: language === 'fr' ? 'Droit pénal' : 'القانون الجنائي' },
    { value: 'labor', label: language === 'fr' ? 'Droit du travail' : 'قانون العمل' },
    { value: 'family', label: language === 'fr' ? 'Droit de la famille' : 'قانون الأسرة' },
    { value: 'tax', label: language === 'fr' ? 'Droit fiscal' : 'القانون الضريبي' },
    { value: 'environment', label: language === 'fr' ? 'Droit de l\'environnement' : 'قانون البيئة' },
    { value: 'energy', label: language === 'fr' ? 'Droit de l\'énergie' : 'قانون الطاقة' },
    { value: 'banking', label: language === 'fr' ? 'Droit bancaire' : 'القانون المصرفي' },
    { value: 'municipal', label: language === 'fr' ? 'Droit municipal' : 'القانون البلدي' }
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

  const handleAddKeyword = () => {
    if (currentKeyword.trim() && !searchCriteria.keywords.includes(currentKeyword.trim())) {
      setSearchCriteria(prev => ({
        ...prev,
        keywords: [...prev.keywords, currentKeyword.trim()]
      }));
      setCurrentKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setSearchCriteria(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleMultiSelect = (field: keyof AdvancedSearchCriteria, value: string) => {
    setSearchCriteria(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const handleSearch = () => {
    onSearch(searchCriteria);
  };

  const handleReset = () => {
    setSearchCriteria({
      fullText: '',
      title: '',
      number: '',
      keywords: [],
      documentTypes: [],
      legalStatuses: [],
      institutions: [],
      dateRange: undefined,
      publicationYear: '',
      lastModifiedRange: undefined,
      wilayas: [],
      legalDomains: [],
      hasReferences: false,
      hasAmendments: false,
      isInForce: false,
      contentLanguage: 'both',
      searchMode: 'fuzzy',
      sortBy: 'relevance',
      maxResults: 100
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            {language === 'fr' ? 'Recherche avancée' : 'بحث متقدم'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="textual" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="textual">
              {language === 'fr' ? 'Recherche textuelle' : 'البحث النصي'}
            </TabsTrigger>
            <TabsTrigger value="filters">
              {language === 'fr' ? 'Filtres' : 'المرشحات'}
            </TabsTrigger>
            <TabsTrigger value="geography">
              {language === 'fr' ? 'Géographie' : 'الجغرافيا'}
            </TabsTrigger>
            <TabsTrigger value="advanced">
              {language === 'fr' ? 'Avancé' : 'متقدم'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="textual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {language === 'fr' ? 'Recherche dans le texte' : 'البحث في النص'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{language === 'fr' ? 'Texte complet' : 'النص الكامل'}</Label>
                  <Input
                    value={searchCriteria.fullText}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, fullText: e.target.value }))}
                    placeholder={language === 'fr' ? 'Rechercher dans tout le contenu...' : 'البحث في كامل المحتوى...'}
                  />
                </div>

                <div>
                  <Label>{language === 'fr' ? 'Titre' : 'العنوان'}</Label>
                  <Input
                    value={searchCriteria.title}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={language === 'fr' ? 'Rechercher dans les titres...' : 'البحث في العناوين...'}
                  />
                </div>

                <div>
                  <Label>{language === 'fr' ? 'Numéro' : 'الرقم'}</Label>
                  <Input
                    value={searchCriteria.number}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, number: e.target.value }))}
                    placeholder={language === 'fr' ? 'Numéro du document...' : 'رقم الوثيقة...'}
                  />
                </div>

                <div>
                  <Label>{language === 'fr' ? 'Mots-clés' : 'الكلمات المفتاحية'}</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      placeholder={language === 'fr' ? 'Ajouter un mot-clé...' : 'إضافة كلمة مفتاحية...'}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                    />
                    <Button onClick={handleAddKeyword} variant="outline">
                      {language === 'fr' ? 'Ajouter' : 'إضافة'}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchCriteria.keywords.map(keyword => (
                      <Badge key={keyword} variant="secondary" className="cursor-pointer">
                        {keyword}
                        <X 
                          className="w-3 h-3 ml-1" 
                          onClick={() => handleRemoveKeyword(keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>{language === 'fr' ? 'Mode de recherche' : 'وضع البحث'}</Label>
                  <RadioGroup 
                    value={searchCriteria.searchMode} 
                    onValueChange={(value: 'exact' | 'fuzzy' | 'boolean') => 
                      setSearchCriteria(prev => ({ ...prev, searchMode: value }))
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="exact" id="exact" />
                      <Label htmlFor="exact">
                        {language === 'fr' ? 'Correspondance exacte' : 'مطابقة دقيقة'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fuzzy" id="fuzzy" />
                      <Label htmlFor="fuzzy">
                        {language === 'fr' ? 'Recherche floue' : 'بحث غامض'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="boolean" id="boolean" />
                      <Label htmlFor="boolean">
                        {language === 'fr' ? 'Recherche booléenne' : 'بحث منطقي'}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filters" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    {language === 'fr' ? 'Types de documents' : 'أنواع الوثائق'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {documentTypes.map(type => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.value}
                          checked={searchCriteria.documentTypes.includes(type.value)}
                          onCheckedChange={() => handleMultiSelect('documentTypes', type.value)}
                        />
                        <Label htmlFor={type.value} className="text-sm">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {language === 'fr' ? 'Institutions' : 'المؤسسات'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {algerianInstitutions.map(institution => (
                      <div key={institution} className="flex items-center space-x-2">
                        <Checkbox
                          id={institution}
                          checked={searchCriteria.institutions.includes(institution)}
                          onCheckedChange={() => handleMultiSelect('institutions', institution)}
                        />
                        <Label htmlFor={institution} className="text-sm">
                          {institution}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {language === 'fr' ? 'Statuts juridiques' : 'الحالات القانونية'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {statusOptions.map(status => (
                      <div key={status.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={status.value}
                          checked={searchCriteria.legalStatuses.includes(status.value)}
                          onCheckedChange={() => handleMultiSelect('legalStatuses', status.value)}
                        />
                        <Label htmlFor={status.value} className="text-sm">
                          {status.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {language === 'fr' ? 'Période' : 'الفترة'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{language === 'fr' ? 'Date de publication' : 'تاريخ النشر'}</Label>
                    <DatePickerWithRange
                      date={searchCriteria.dateRange}
                      onDateChange={(range) => setSearchCriteria(prev => ({ ...prev, dateRange: range }))}
                    />
                  </div>
                  
                  <div>
                    <Label>{language === 'fr' ? 'Année de publication' : 'سنة النشر'}</Label>
                    <Input
                      type="number"
                      value={searchCriteria.publicationYear}
                      onChange={(e) => setSearchCriteria(prev => ({ ...prev, publicationYear: e.target.value }))}
                      placeholder="2024"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geography" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {language === 'fr' ? 'Wilayas' : 'الولايات'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {algerianWilayas.map(wilaya => (
                      <div key={wilaya} className="flex items-center space-x-2">
                        <Checkbox
                          id={wilaya}
                          checked={searchCriteria.wilayas.includes(wilaya)}
                          onCheckedChange={() => handleMultiSelect('wilayas', wilaya)}
                        />
                        <Label htmlFor={wilaya} className="text-sm">
                          {wilaya}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    {language === 'fr' ? 'Domaines juridiques' : 'المجالات القانونية'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {legalDomains.map(domain => (
                      <div key={domain.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={domain.value}
                          checked={searchCriteria.legalDomains.includes(domain.value)}
                          onCheckedChange={() => handleMultiSelect('legalDomains', domain.value)}
                        />
                        <Label htmlFor={domain.value} className="text-sm">
                          {domain.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'fr' ? 'Options avancées' : 'خيارات متقدمة'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasReferences"
                      checked={searchCriteria.hasReferences}
                      onCheckedChange={(checked) => 
                        setSearchCriteria(prev => ({ ...prev, hasReferences: checked as boolean }))
                      }
                    />
                    <Label htmlFor="hasReferences">
                      {language === 'fr' ? 'Avec références juridiques' : 'مع المراجع القانونية'}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasAmendments"
                      checked={searchCriteria.hasAmendments}
                      onCheckedChange={(checked) => 
                        setSearchCriteria(prev => ({ ...prev, hasAmendments: checked as boolean }))
                      }
                    />
                    <Label htmlFor="hasAmendments">
                      {language === 'fr' ? 'Avec modifications' : 'مع تعديلات'}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isInForce"
                      checked={searchCriteria.isInForce}
                      onCheckedChange={(checked) => 
                        setSearchCriteria(prev => ({ ...prev, isInForce: checked as boolean }))
                      }
                    />
                    <Label htmlFor="isInForce">
                      {language === 'fr' ? 'Textes en vigueur uniquement' : 'النصوص النافذة فقط'}
                    </Label>
                  </div>

                  <div>
                    <Label>{language === 'fr' ? 'Langue du contenu' : 'لغة المحتوى'}</Label>
                    <Select 
                      value={searchCriteria.contentLanguage} 
                      onValueChange={(value: 'fr' | 'ar' | 'both') => 
                        setSearchCriteria(prev => ({ ...prev, contentLanguage: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">
                          {language === 'fr' ? 'Toutes les langues' : 'جميع اللغات'}
                        </SelectItem>
                        <SelectItem value="fr">
                          {language === 'fr' ? 'Français uniquement' : 'الفرنسية فقط'}
                        </SelectItem>
                        <SelectItem value="ar">
                          {language === 'fr' ? 'Arabe uniquement' : 'العربية فقط'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'fr' ? 'Paramètres de résultat' : 'إعدادات النتائج'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{language === 'fr' ? 'Trier par' : 'ترتيب حسب'}</Label>
                    <Select 
                      value={searchCriteria.sortBy} 
                      onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, sortBy: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">
                          {language === 'fr' ? 'Pertinence' : 'الصلة'}
                        </SelectItem>
                        <SelectItem value="date_desc">
                          {language === 'fr' ? 'Date (récent → ancien)' : 'التاريخ (الأحدث → الأقدم)'}
                        </SelectItem>
                        <SelectItem value="date_asc">
                          {language === 'fr' ? 'Date (ancien → récent)' : 'التاريخ (الأقدم → الأحدث)'}
                        </SelectItem>
                        <SelectItem value="title">
                          {language === 'fr' ? 'Titre alphabétique' : 'العنوان أبجدياً'}
                        </SelectItem>
                        <SelectItem value="type">
                          {language === 'fr' ? 'Type de document' : 'نوع الوثيقة'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{language === 'fr' ? 'Nombre maximum de résultats' : 'العدد الأقصى للنتائج'}</Label>
                    <Select 
                      value={searchCriteria.maxResults.toString()} 
                      onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, maxResults: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                        <SelectItem value="500">500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            {language === 'fr' ? 'Réinitialiser' : 'إعادة تعيين'}
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {language === 'fr' ? 'Annuler' : 'إلغاء'}
            </Button>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Rechercher' : 'بحث'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}