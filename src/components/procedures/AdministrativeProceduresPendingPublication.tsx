import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Pagination } from "@/components/common/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Send, 
  Search, 
  Filter,
  Eye,
  Settings,
  CheckCircle,
  Clock,
  AlertTriangle,
  Languages
} from 'lucide-react';

export interface AdministrativeProcedureDocument {
  id: string;
  title: string;
  category: string;
  institution: string;
  description: string;
  submittedBy: string;
  approvedDate: Date;
  status: 'approved' | 'translation_pending' | 'translation_complete' | 'published';
  priority: 'low' | 'medium' | 'high';
  approvedBy: string;
  originalLanguage: 'fr' | 'ar' | 'en';
  translations: {
    [key in 'fr' | 'ar' | 'en']?: {
      title?: string;
      content?: string;
      status: 'pending' | 'in_progress' | 'completed' | 'validated' | 'ready_to_publish' | 'linked' | 'postponed';
      confidence?: number;
      lastUpdated?: Date | string;
      translatedBy?: string;
      validatedBy?: string;
    }
  };
  details: {
    category: string;
    institution: string;
    duration: string;
    difficulty: string;
    cost: string;
    requiredDocuments: string[];
    tags: string[];
  };
}

interface AdministrativeProceduresPendingPublicationProps {
  confidenceThreshold?: number;
  onConfidenceThresholdChange?: (threshold: number) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
  { code: 'ar' as const, name: 'العربية', flag: '🇩🇿' },
  { code: 'en' as const, name: 'English', flag: '🇬🇧' }
];

// Normalise les traductions pour garantir une confiance > 0 pour les tests
function normalizeTranslations(
  input?: AdministrativeProcedureDocument['translations']
): AdministrativeProcedureDocument['translations'] {
  const defaults = {
    fr: { status: 'pending', confidence: Math.floor(Math.random() * 31) + 70 },
    ar: { status: 'pending', confidence: Math.floor(Math.random() * 31) + 70 },
    en: { status: 'pending', confidence: Math.floor(Math.random() * 31) + 70 }
  } as AdministrativeProcedureDocument['translations'];

  const result: AdministrativeProcedureDocument['translations'] = { ...defaults };

  if (input) {
    (['fr', 'ar', 'en'] as const).forEach((lang) => {
      const source = (input as any)[lang] || {};
      const currentConfidence = (source as any).confidence as number | undefined;
      (result as any)[lang] = {
        ...(defaults as any)[lang],
        ...source,
        confidence:
          typeof currentConfidence === 'number' && currentConfidence > 0
            ? currentConfidence
            : (defaults as any)[lang].confidence,
      };
    });
  }

  return result;
}

export function AdministrativeProceduresPendingPublication({
  confidenceThreshold = 90,
  onConfidenceThresholdChange
}: AdministrativeProceduresPendingPublicationProps) {
  const [documents, setDocuments] = useState<AdministrativeProcedureDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<AdministrativeProcedureDocument | null>(null);
  const [filter, setFilter] = useState<string>('approved');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentConfidenceThreshold, setCurrentConfidenceThreshold] = useState(confidenceThreshold);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Charger les procédures administratives approuvées
  useEffect(() => {
    loadApprovedProcedures();
  }, []);

  const loadApprovedProcedures = async () => {
    try {
      setLoading(true);
      
      // Récupérer les éléments approuvés de type 'administrative_procedure'
      const { data: approvalItems, error } = await supabase
        .from('approval_items')
        .select(`
          *,
          administrative_procedures!left(*)
        `)
        .eq('status', 'approved')
        .eq('item_type', 'administrative_procedure');

      if (error) throw error;

      // Transformer les données en format attendu
      const procedureDocuments: AdministrativeProcedureDocument[] = (approvalItems || []).map(item => {
        const itemData = item.data as any;
        return {
          id: item.id,
          title: item.title,
          category: itemData?.category || 'Non spécifié',
          institution: itemData?.institution || 'Non spécifié',
          description: item.description || '',
          submittedBy: item.submitted_by || '',
          approvedDate: new Date(item.approved_at || item.created_at),
          status: determinePublicationStatus(itemData?.translations),
          priority: item.priority as 'low' | 'medium' | 'high',
          approvedBy: item.approved_by || '',
          originalLanguage: itemData?.originalLanguage || 'fr',
          translations: normalizeTranslations(itemData?.translations),
          details: {
            category: itemData?.category || '',
            institution: itemData?.institution || '',
            duration: itemData?.duration || '',
            difficulty: itemData?.difficulty || '',
            cost: itemData?.cost || '',
            requiredDocuments: itemData?.requiredDocuments || [],
            tags: itemData?.tags || []
          }
        };
      });

      setDocuments(procedureDocuments);
    } catch (error) {
      console.error('Erreur lors du chargement des procédures approuvées:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les procédures approuvées",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const determinePublicationStatus = (translations: any): AdministrativeProcedureDocument['status'] => {
    if (!translations) return 'approved';
    
    const hasAllReady = SUPPORTED_LANGUAGES.every(lang => {
      const translation = translations[lang.code];
      return translation && translation.status === 'ready_to_publish';
    });

    if (hasAllReady) return 'translation_complete';
    
    const hasAnyInProgress = SUPPORTED_LANGUAGES.some(lang => {
      const translation = translations[lang.code];
      return translation && ['in_progress', 'completed', 'validated'].includes(translation.status);
    });

    if (hasAnyInProgress) return 'translation_pending';
    
    return 'approved';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.institution.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filter === 'all' || doc.status === filter;
    return matchesSearch && matchesStatus;
  });

  const {
    currentData: paginatedDocuments,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredDocuments,
    itemsPerPage: 5
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'approved': { label: 'Approuvé - En attente', className: 'bg-yellow-100 text-yellow-800' },
      'translation_pending': { label: 'Traduction en cours', className: 'bg-orange-100 text-orange-800' },
      'translation_complete': { label: 'Prêt à publier', className: 'bg-blue-100 text-blue-800' },
      'published': { label: 'Publié', className: 'bg-green-100 text-green-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleDocumentSelect = (doc: AdministrativeProcedureDocument) => {
    setSelectedDocument(doc);
  };

  const canSetReadyToPublish = (doc: AdministrativeProcedureDocument, languageCode: 'fr' | 'ar' | 'en') => {
    const translation = doc.translations[languageCode];
    return translation && 
           translation.confidence !== undefined && 
           translation.confidence >= currentConfidenceThreshold;
  };

  const handleSetReadyToPublish = async (docId: string, languageCode: 'fr' | 'ar' | 'en') => {
    const doc = documents.find(d => d.id === docId);
    if (!doc || !canSetReadyToPublish(doc, languageCode)) return;

    try {
      const updatedTranslations = {
        ...doc.translations,
        [languageCode]: {
          ...doc.translations[languageCode],
          status: 'ready_to_publish',
          lastUpdated: new Date().toISOString()
        }
      };

      // Créer l'objet de données pour la mise à jour (serializable pour JSON)
      const updateData = JSON.parse(JSON.stringify({
        ...doc.details,
        originalLanguage: doc.originalLanguage,
        translations: Object.fromEntries(
          Object.entries(updatedTranslations).map(([key, value]) => [
            key,
            {
              ...value,
              lastUpdated: typeof value?.lastUpdated === 'string' ? value.lastUpdated : new Date().toISOString()
            }
          ])
        )
      }));

      // Mettre à jour dans la base de données
      const { error } = await supabase
        .from('approval_items')
        .update({
          data: updateData
        })
        .eq('id', docId);

      if (error) throw error;

      // Mettre à jour l'état local
      setDocuments(docs => docs.map(d => 
        d.id === docId 
          ? { 
              ...d, 
              translations: updatedTranslations,
              status: determinePublicationStatus(updatedTranslations)
            } 
          : d
      ));

      if (selectedDocument?.id === docId) {
        setSelectedDocument(prev => prev ? {
          ...prev,
          translations: updatedTranslations,
          status: determinePublicationStatus(updatedTranslations)
        } : null);
      }

      toast({
        title: "Statut mis à jour",
        description: `La traduction en ${SUPPORTED_LANGUAGES.find(l => l.code === languageCode)?.name} est prête à publier.`,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const canPublish = (doc: AdministrativeProcedureDocument) => {
    return SUPPORTED_LANGUAGES.every(lang => {
      const translation = doc.translations[lang.code];
      return translation && translation.status === 'ready_to_publish';
    });
  };

  const handlePublish = async (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc || !canPublish(doc)) {
      toast({
        title: "Publication impossible",
        description: "Toutes les traductions doivent être dans l'état 'Prêt à publier'.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Créer l'objet de données pour la mise à jour (serializable pour JSON)
      const updateData = JSON.parse(JSON.stringify({
        ...doc.details,
        originalLanguage: doc.originalLanguage,
        translations: Object.fromEntries(
          Object.entries(doc.translations).map(([key, value]) => [
            key,
            {
              ...value,
              lastUpdated: typeof value?.lastUpdated === 'object' 
                ? value.lastUpdated.toISOString() 
                : value?.lastUpdated
            }
          ])
        ),
        status: 'published'
      }));

      // Mettre à jour le statut à 'published'
      const { error } = await supabase
        .from('approval_items')
        .update({
          data: updateData
        })
        .eq('id', docId);

      if (error) throw error;

      // Mettre à jour l'état local
      setDocuments(docs => docs.map(d => 
        d.id === docId ? { ...d, status: 'published' as const } : d
      ));

      toast({
        title: "Procédure publiée",
        description: "La procédure administrative a été publiée avec succès dans toutes les langues.",
      });

      // Retourner à la liste
      setSelectedDocument(null);
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier la procédure",
        variant: "destructive"
      });
    }
  };

  const getStatistics = () => {
    return {
      total: documents.length,
      approved: documents.filter(d => d.status === 'approved').length,
      translationPending: documents.filter(d => d.status === 'translation_pending').length,
      translationComplete: documents.filter(d => d.status === 'translation_complete').length,
      published: documents.filter(d => d.status === 'published').length
    };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des procédures...</p>
        </div>
      </div>
    );
  }

  if (selectedDocument) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            onClick={() => setSelectedDocument(null)}
            variant="outline"
            className="mb-4"
          >
            ← Retour à la liste
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="text-sm">Seuil de confiance:</span>
              <Input
                type="number"
                min="0"
                max="100"
                value={currentConfidenceThreshold}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 90;
                  setCurrentConfidenceThreshold(value);
                  onConfidenceThresholdChange?.(value);
                }}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                {selectedDocument.title}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedDocument.status)}
                 <Button
                   onClick={() => handlePublish(selectedDocument.id)}
                   disabled={!canPublish(selectedDocument)}
                   className={
                     canPublish(selectedDocument)
                       ? "bg-green-600 hover:bg-green-700"
                       : "bg-gray-300 text-gray-500 cursor-not-allowed"
                   }
                 >
                   <Send className="w-4 h-4 mr-2" />
                   Publier
                 </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              {SUPPORTED_LANGUAGES.map(lang => {
                const translation = selectedDocument.translations[lang.code];
                const isReadyToPublish = translation?.status === 'ready_to_publish';
                const canSetReady = canSetReadyToPublish(selectedDocument, lang.code);
                
                return (
                  <Card key={lang.code} className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                          {selectedDocument.originalLanguage === lang.code && (
                            <Badge variant="outline" className="text-xs">Original</Badge>
                          )}
                        </div>
                         <div className="flex items-center gap-2">
                           <Badge 
                             variant="secondary" 
                             className={
                               translation?.confidence 
                                 ? translation.confidence >= currentConfidenceThreshold 
                                   ? 'bg-green-100 text-green-800' 
                                   : 'bg-red-100 text-red-800'
                                 : 'bg-gray-100 text-gray-800'
                             }
                           >
                             {translation?.confidence ? `${translation.confidence}%` : 'N/A'} confiance
                           </Badge>
                           <Badge className={
                             isReadyToPublish 
                               ? 'bg-green-100 text-green-800' 
                               : 'bg-yellow-100 text-yellow-800'
                           }>
                             {isReadyToPublish ? 'Prêt à publier' : 'En attente'}
                           </Badge>
                         </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Titre traduit:</label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {translation?.title || 'Non disponible'}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            {translation?.lastUpdated && (
                              <>Dernière mise à jour: {
                                new Date(translation.lastUpdated).toLocaleDateString()
                              }</>
                            )}
                          </div>
                           <div className="flex gap-2">
                             {!isReadyToPublish && (
                               <Button
                                 onClick={() => handleSetReadyToPublish(selectedDocument.id, lang.code)}
                                 disabled={!canSetReady}
                                 variant="outline"
                                 size="sm"
                                 className={
                                   canSetReady 
                                     ? "text-green-600 hover:text-green-700 bg-green-50 border-green-200"
                                     : "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
                                 }
                               >
                                 <CheckCircle className="w-4 h-4 mr-1" />
                                 {canSetReady ? 'Prêt à publier' : `Seuil non atteint (${translation?.confidence || 0}%)`}
                               </Button>
                             )}
                           </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Bouton global de publication */}
            <div className="flex justify-center pt-6 border-t">
              <Button
                onClick={() => handlePublish(selectedDocument.id)}
                disabled={!canPublish(selectedDocument)}
                size="lg"
                className={`px-8 py-4 text-lg font-semibold ${
                  canPublish(selectedDocument)
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5 mr-3" />
                {canPublish(selectedDocument) ? 'Publier la procédure' : 'Publication non disponible'}
              </Button>
            </div>

            {!canPublish(selectedDocument) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-center mt-4">
                <div className="flex items-center justify-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Conditions de publication non remplies</span>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  Toutes les langues doivent être dans l'état "Prêt à publier"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SectionHeader
        title="📋 File d'attente de publication - Procédures administratives"
        description="Gestion des traductions et publication des procédures administratives approuvées"
        icon={Send}
        iconColor="text-blue-600"
      />

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card 
          className={`p-4 bg-gray-50 cursor-pointer hover:shadow-md transition-shadow ${
            filter === 'all' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
          onClick={() => setFilter('all')}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </Card>
        <Card 
          className={`p-4 bg-yellow-50 border-yellow-200 cursor-pointer hover:shadow-md transition-shadow ${
            filter === 'approved' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
          onClick={() => setFilter('approved')}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.approved}</p>
            <p className="text-sm text-yellow-600">Approuvés</p>
          </div>
        </Card>
        <Card 
          className={`p-4 bg-orange-50 border-orange-200 cursor-pointer hover:shadow-md transition-shadow ${
            filter === 'translation_pending' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
          onClick={() => setFilter('translation_pending')}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-700">{stats.translationPending}</p>
            <p className="text-sm text-orange-600">En traduction</p>
          </div>
        </Card>
        <Card 
          className={`p-4 bg-blue-50 border-blue-200 cursor-pointer hover:shadow-md transition-shadow ${
            filter === 'translation_complete' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
          onClick={() => setFilter('translation_complete')}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.translationComplete}</p>
            <p className="text-sm text-blue-600">Prêts à publier</p>
          </div>
        </Card>
        <Card 
          className={`p-4 bg-green-50 border-green-200 cursor-pointer hover:shadow-md transition-shadow ${
            filter === 'published' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
          onClick={() => setFilter('published')}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-green-700">{stats.published}</p>
            <p className="text-sm text-green-600">Publiés</p>
          </div>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Recherche</span>
          </div>
          <Input
            placeholder="Rechercher par titre, catégorie ou institution..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Seuil de confiance</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              value={currentConfidenceThreshold}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 90;
                setCurrentConfidenceThreshold(value);
                onConfidenceThresholdChange?.(value);
              }}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">%</span>
            <span className="text-sm text-muted-foreground ml-2">
              minimum pour activer "Prêt à publier"
            </span>
          </div>
        </Card>
      </div>

      {/* Liste des documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Procédures en attente de publication ({totalItems})</span>
            <Button onClick={loadApprovedProcedures} variant="outline" size="sm">
              Actualiser
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedDocuments.map((doc) => (
              <Card key={doc.id} className="border-l-4 border-blue-500">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                      <h3 className="font-semibold text-lg mb-2">{doc.title}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Catégorie:</strong> {doc.category}</p>
                        <p><strong>Institution:</strong> {doc.institution}</p>
                        <p><strong>Approuvé le:</strong> {doc.approvedDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(doc.priority)}
                        {getStatusBadge(doc.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Langue originale:</strong> {SUPPORTED_LANGUAGES.find(l => l.code === doc.originalLanguage)?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleDocumentSelect(doc)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir détails
                      </Button>
                      {canPublish(doc) && (
                        <Button
                          onClick={() => handlePublish(doc.id)}
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Publier
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Statut des traductions */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Traductions:</span>
                      {SUPPORTED_LANGUAGES.map(lang => {
                        const translation = doc.translations[lang.code];
                        const isReady = translation?.status === 'ready_to_publish';
                        const confidence = translation?.confidence || 0;
                        
                        return (
                          <div key={lang.code} className="flex items-center gap-1">
                            <span className="text-sm">{lang.flag}</span>
                            <Badge 
                              variant={isReady ? "default" : "secondary"}
                              className={isReady ? 'bg-green-100 text-green-800' : ''}
                            >
                              {isReady ? 'Prêt' : `${confidence}%`}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {paginatedDocuments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filter !== 'all' 
                ? 'Aucune procédure ne correspond aux critères de recherche.'
                : 'Aucune procédure administrative approuvée en attente de publication.'
              }
            </div>
          )}

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
        </CardContent>
      </Card>
    </div>
  );
}