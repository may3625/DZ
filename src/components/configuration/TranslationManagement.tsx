import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/common/Pagination';
import { 
  Languages, 
  Search, 
  Plus,
  RefreshCw,
  Filter,
  SortAsc,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { useToast } from '@/hooks/use-toast';
import { TranslationEditor } from './translation/TranslationEditor';
import { TranslationStatsComponent } from './translation/TranslationStats';
import { TranslationImportExport } from './translation/TranslationImportExport';

interface TranslationKey {
  key: string;
  section: string;
  subsection?: string;
  context?: string;
  fr: string;
  ar: string;
  en: string;
  status: 'complete' | 'partial' | 'missing';
  lastModified: string;
}

interface TranslationManagementProps {
  language?: string;
}

// Structure des sections de traduction
const TRANSLATION_SECTIONS = {
  'app': {
    title: { fr: 'Application', ar: 'التطبيق', en: 'Application' },
    subsections: ['general', 'navigation', 'messages']
  },
  'legal': {
    title: { fr: 'Juridique', ar: 'قانوني', en: 'Legal' },
    subsections: ['categories', 'documents', 'procedures']
  },
  'dashboard': {
    title: { fr: 'Tableau de bord', ar: 'لوحة القيادة', en: 'Dashboard' },
    subsections: ['widgets', 'charts', 'reports']
  },
  'forms': {
    title: { fr: 'Formulaires', ar: 'النماذج', en: 'Forms' },
    subsections: ['labels', 'placeholders', 'validation']
  },
  'notifications': {
    title: { fr: 'Notifications', ar: 'الإشعارات', en: 'Notifications' },
    subsections: ['alerts', 'toasts', 'emails']
  }
};

export function TranslationManagement({ language = "fr" }: TranslationManagementProps) {
  const { t, i18n } = useAlgerianI18n();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('app');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('key');
  const [translations, setTranslations] = useState<TranslationKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [showEmptyOnly, setShowEmptyOnly] = useState(false);

  // Charger les traductions avec intégration des fichiers existants
  useEffect(() => {
    loadTranslations();
  }, [activeSection]);

  const loadTranslations = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Intégrer avec les données réelles du système i18next
      const mockTranslations: TranslationKey[] = [
        // App section
        {
          key: 'app.title',
          section: 'app',
          subsection: 'general',
          context: 'Titre principal de l\'application',
          fr: 'Dalil.dz - Plateforme Juridique Algérienne',
          ar: 'دليل.دز - المنصة القانونية الجزائرية',
          en: 'Dalil.dz - Algerian Legal Platform',
          status: 'complete',
          lastModified: '2024-01-15'
        },
        {
          key: 'app.description',
          section: 'app',
          subsection: 'general',
          context: 'Description de l\'application',
          fr: 'Plateforme algérienne de veille juridique et réglementaire avec support RTL',
          ar: 'منصة جزائرية لمراقبة القوانين واللوائح مع دعم RTL',
          en: 'Algerian legal and regulatory monitoring platform with RTL support',
          status: 'complete',
          lastModified: '2024-01-15'
        },
        {
          key: 'navigation.dashboard',
          section: 'app',
          subsection: 'navigation',
          context: 'Menu de navigation',
          fr: 'Tableau de bord',
          ar: 'لوحة القيادة',
          en: 'Dashboard',
          status: 'complete',
          lastModified: '2024-01-15'
        },
        {
          key: 'navigation.legal-catalog',
          section: 'app',
          subsection: 'navigation',
          context: 'Menu de navigation',
          fr: 'Catalogue juridique',
          ar: 'الكتالوج القانوني',
          en: 'Legal Catalog',
          status: 'complete',
          lastModified: '2024-01-15'
        },
        {
          key: 'navigation.procedures',
          section: 'app',
          subsection: 'navigation',
          context: 'Menu de navigation',
          fr: 'Procédures',
          ar: 'الإجراءات',
          en: 'Procedures',
          status: 'complete',
          lastModified: '2024-01-15'
        },
        {
          key: 'common.loading',
          section: 'app',
          subsection: 'general',
          context: 'Message de chargement',
          fr: 'Chargement...',
          ar: 'جاري التحميل...',
          en: 'Loading...',
          status: 'complete',
          lastModified: '2024-01-15'
        },
        {
          key: 'common.save',
          section: 'app',
          subsection: 'general',
          context: 'Bouton sauvegarder',
          fr: 'Enregistrer',
          ar: 'حفظ',
          en: 'Save',
          status: 'complete',
          lastModified: '2024-01-15'
        },
        // Legal section
        {
          key: 'legal.categories.administrative',
          section: 'legal',
          subsection: 'categories',
          context: 'Catégorie de droit administratif',
          fr: 'Droit administratif',
          ar: 'القانون الإداري',
          en: 'Administrative Law',
          status: 'complete',
          lastModified: '2024-01-15'
        },
        {
          key: 'legal.categories.civil',
          section: 'legal',
          subsection: 'categories',
          context: 'Catégorie de droit civil',
          fr: 'Droit civil',
          ar: 'القانون المدني',
          en: '',
          status: 'partial',
          lastModified: '2024-01-14'
        },
        {
          key: 'legal.procedures.consultation',
          section: 'legal',
          subsection: 'procedures',
          context: 'Procédure de consultation',
          fr: 'Consultation de document',
          ar: 'استشارة المستند',
          en: 'Document consultation',
          status: 'complete',
          lastModified: '2024-01-15'
        },
        // Dashboard section
        {
          key: 'dashboard.welcome',
          section: 'dashboard',
          subsection: 'widgets',
          context: 'Message d\'accueil',
          fr: 'Bienvenue sur votre tableau de bord',
          ar: 'مرحباً بكم في لوحة القيادة',
          en: '',
          status: 'partial',
          lastModified: '2024-01-14'
        },
        {
          key: 'dashboard.stats.documents',
          section: 'dashboard',
          subsection: 'widgets',
          context: 'Statistique des documents',
          fr: 'Total des documents',
          ar: 'إجمالي المستندات',
          en: 'Total Documents',
          status: 'complete',
          lastModified: '2024-01-15'
        },
        // Forms section
        {
          key: 'forms.validation.required',
          section: 'forms',
          subsection: 'validation',
          context: 'Message de validation',
          fr: 'Ce champ est obligatoire',
          ar: 'هذا الحقل مطلوب',
          en: 'This field is required',
          status: 'complete',
          lastModified: '2024-01-15'
        },
        {
          key: 'forms.validation.email',
          section: 'forms',
          subsection: 'validation',
          context: 'Validation email',
          fr: 'Veuillez saisir un email valide',
          ar: 'يرجى إدخال بريد إلكتروني صالح',
          en: '',
          status: 'partial',
          lastModified: '2024-01-13'
        },
        {
          key: 'forms.labels.search',
          section: 'forms',
          subsection: 'labels',
          context: 'Label de recherche',
          fr: 'Rechercher',
          ar: 'بحث',
          en: 'Search',
          status: 'complete',
          lastModified: '2024-01-15'
        },
        // Notifications section  
        {
          key: 'notifications.alerts.new-document',
          section: 'notifications',
          subsection: 'alerts',
          context: 'Alerte nouveau document',
          fr: 'Nouveau document disponible',
          ar: 'وثيقة جديدة متاحة',
          en: 'New document available',
          status: 'complete',
          lastModified: '2024-01-15'
        },
        {
          key: 'notifications.toasts.saved',
          section: 'notifications',
          subsection: 'toasts',
          context: 'Message de sauvegarde',
          fr: 'Sauvegardé avec succès',
          ar: 'تم الحفظ بنجاح',
          en: '',
          status: 'partial',
          lastModified: '2024-01-12'
        }
      ];

      setTranslations(mockTranslations.filter(t => t.section === activeSection));
    } catch (error) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les traductions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeSection, toast]);

  // Filtrage et tri avancés
  const filteredAndSortedTranslations = useMemo(() => {
    let filtered = translations.filter(t => {
      const matchesSearch = searchTerm === '' || 
        t.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ar.includes(searchTerm) ||
        t.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.context && t.context.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      
      const matchesEmpty = !showEmptyOnly || 
        (showEmptyOnly && (!t.fr || !t.ar || !t.en));

      return matchesSearch && matchesStatus && matchesEmpty;
    });

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'key':
          return a.key.localeCompare(b.key);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'lastModified':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'subsection':
          return (a.subsection || '').localeCompare(b.subsection || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [translations, searchTerm, statusFilter, showEmptyOnly, sortBy]);

  // Pagination pour les traductions
  const {
    currentData: paginatedTranslations,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredAndSortedTranslations,
    itemsPerPage: 5
  });

  // Statistiques
  const stats = useMemo(() => {
    const complete = translations.filter(t => t.status === 'complete').length;
    const partial = translations.filter(t => t.status === 'partial').length;
    const missing = translations.filter(t => t.status === 'missing').length;
    
    const byLanguage = {
      fr: translations.filter(t => t.fr && t.fr.trim() !== '').length,
      ar: translations.filter(t => t.ar && t.ar.trim() !== '').length,
      en: translations.filter(t => t.en && t.en.trim() !== '').length
    };

    return {
      complete,
      partial,
      missing,
      total: translations.length,
      byLanguage
    };
  }, [translations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'missing': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <AlertCircle className="w-4 h-4" />;
      case 'missing': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleSaveTranslation = useCallback((key: string, lang: 'fr' | 'ar' | 'en', value: string) => {
    setTranslations(prev => prev.map(t => {
      if (t.key !== key) return t;
      
      const updated = { ...t, [lang]: value, lastModified: new Date().toISOString().split('T')[0] };
      
      // Recalculer le statut
      const hasAll = updated.fr && updated.ar && updated.en && 
                     updated.fr.trim() !== '' && updated.ar.trim() !== '' && updated.en.trim() !== '';
      const hasAny = updated.fr || updated.ar || updated.en;
      updated.status = hasAll ? 'complete' : hasAny ? 'partial' : 'missing';
      
      return updated;
    }));
  }, []);

  const handleImport = useCallback((importedTranslations: TranslationKey[]) => {
    setTranslations(prev => {
      const updated = [...prev];
      importedTranslations.forEach(imported => {
        const existingIndex = updated.findIndex(t => t.key === imported.key);
        if (existingIndex >= 0) {
          updated[existingIndex] = { ...updated[existingIndex], ...imported };
        } else {
          updated.push(imported);
        }
      });
      return updated;
    });
  }, []);

  const handleSyncWithFiles = useCallback(async () => {
    // Simuler la synchronisation avec les fichiers réels
    await loadTranslations();
  }, [loadTranslations]);

  const addNewTranslation = useCallback(() => {
    const newKey = `${activeSection}.new_key_${Date.now()}`;
    const newTranslation: TranslationKey = {
      key: newKey,
      section: activeSection,
      subsection: 'general',
      context: 'Nouvelle traduction',
      fr: '',
      ar: '',
      en: '',
      status: 'missing',
      lastModified: new Date().toISOString().split('T')[0]
    };
    
    setTranslations(prev => [...prev, newTranslation]);
    setEditingKey(newKey);
    toast({
      title: "Nouvelle traduction créée",
      description: "Vous pouvez maintenant éditer les valeurs",
    });
  }, [activeSection, toast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Système de Gestion des Traductions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation par sections */}
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="grid grid-cols-5 w-full">
              {Object.entries(TRANSLATION_SECTIONS).map(([key, section]) => (
                <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                  <span>{section.title.fr}</span>
                  <Badge variant="secondary" className="text-xs">
                    {translations.filter(t => t.section === key).length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Outils et contrôles */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Recherche et filtres */}
            <div className="flex gap-2 flex-1 min-w-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher clés, traductions, contexte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="complete">Complètes</SelectItem>
                  <SelectItem value="partial">Partielles</SelectItem>
                  <SelectItem value="missing">Manquantes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="key">Trier par clé</SelectItem>
                  <SelectItem value="status">Trier par statut</SelectItem>
                  <SelectItem value="lastModified">Plus récent</SelectItem>
                  <SelectItem value="subsection">Par section</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowEmptyOnly(!showEmptyOnly)}
              >
                {showEmptyOnly ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button size="sm" onClick={addNewTranslation}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
              <Button variant="outline" size="sm" onClick={loadTranslations} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">{filteredAndSortedTranslations.length}</Badge>
              <span className="text-muted-foreground">traductions affichées</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {stats.complete} complètes
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {stats.partial} partielles
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {stats.missing} manquantes
              </Badge>
            </div>
          </div>

          {/* Liste des traductions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {TRANSLATION_SECTIONS[activeSection as keyof typeof TRANSLATION_SECTIONS]?.title.fr}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Section: {activeSection}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                <div className="space-y-4">
                  {paginatedTranslations.length > 0 ? (
                    paginatedTranslations.map((translation) => (
                      <TranslationEditor
                        key={translation.key}
                        translation={translation}
                        onSave={handleSaveTranslation}
                        onEditToggle={() => setEditingKey(
                          editingKey === translation.key ? null : translation.key
                        )}
                        isEditing={editingKey === translation.key}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune traduction trouvée pour les critères sélectionnés</p>
                    </div>
                  )}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
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
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Statistiques détaillées */}
          <TranslationStatsComponent 
            stats={stats}
            sectionName={TRANSLATION_SECTIONS[activeSection as keyof typeof TRANSLATION_SECTIONS]?.title.fr || activeSection}
          />

          {/* Import/Export */}
          <TranslationImportExport
            translations={translations}
            section={activeSection}
            onImport={handleImport}
            onSyncWithFiles={handleSyncWithFiles}
          />
        </CardContent>
      </Card>
    </div>
  );
}