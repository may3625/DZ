import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Pagination } from "@/components/common/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { useToast } from "@/hooks/use-toast";
import { LanguageTranslationPanel } from "./LanguageTranslationPanel";
import { 
  Send, 
  Search, 
  Filter,
  Eye,
  Settings,
  Globe,
  CheckCircle,
  Clock,
  AlertTriangle,
  Languages
} from 'lucide-react';

export interface ProcedureDocument {
  id: string;
  title: string;
  type: string;
  reference: string;
  category: string;
  submittedBy: string;
  approvedDate: Date;
  status: 'approved_pending_publication' | 'translation_pending' | 'translation_complete' | 'published';
  priority: 'low' | 'medium' | 'high';
  approvedBy: string;
  originalLanguage: 'fr' | 'ar' | 'en';
  translations: {
    [key in 'fr' | 'ar' | 'en']?: {
      documentId?: string;
      title?: string;
      content?: string;
      translationMethod?: 'equivalent_text' | 'search_based';
      status: 'pending' | 'in_progress' | 'completed' | 'validated' | 'ready_to_publish' | 'linked' | 'postponed';
      confidence?: number;
      lastUpdated?: Date;
      translatedBy?: string;
      validatedBy?: string;
    }
  };
  details: {
    type: string;
    reference: string;
    category: string;
    sector?: string;
    wilaya?: string;
    dateOfEffect?: Date;
    description?: string;
  };
}

interface MultiLanguagePublicationQueueProps {
  confidenceThreshold?: number;
  onConfidenceThresholdChange?: (threshold: number) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
  { code: 'ar' as const, name: 'العربية', flag: '🇩🇿' },
  { code: 'en' as const, name: 'English', flag: '🇬🇧' }
];

export function MultiLanguagePublicationQueue({
  confidenceThreshold = 90,
  onConfidenceThresholdChange
}: MultiLanguagePublicationQueueProps) {
  const [documents, setDocuments] = useState<ProcedureDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ProcedureDocument | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentConfidenceThreshold, setCurrentConfidenceThreshold] = useState(confidenceThreshold);
  const { toast } = useToast();

  useEffect(() => {
    // Données d'exemple avec traductions multi-langues
    const sampleDocuments: ProcedureDocument[] = [
      {
        id: '1',
        title: 'LOI N° 25-01 - Modernisation de la Justice Numérique',
        type: 'Loi',
        reference: 'LOI-25-01-2025',
        category: 'Justice',
        submittedBy: 'Service OCR Automatique',
        approvedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'translation_pending',
        priority: 'high',
        approvedBy: 'Dr. Ahmed Benali',
        originalLanguage: 'fr',
        translations: {
          fr: {
            title: 'LOI N° 25-01 - Modernisation de la Justice Numérique',
            status: 'ready_to_publish',
            confidence: 100,
            lastUpdated: new Date(),
            translatedBy: 'Original'
          },
          ar: {
            title: 'القانون رقم 25-01 - تحديث العدالة الرقمية',
            status: 'linked',
            confidence: 87,
            lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
            translatedBy: 'Service de Traduction'
          },
          en: {
            status: 'linked'
          }
        },
        details: {
          type: 'Loi',
          reference: 'LOI-25-01-2025',
          category: 'Justice',
          sector: 'Justice et Droits de l\'Homme',
          dateOfEffect: new Date('2025-03-01'),
          description: 'Modernisation des processus judiciaires par la numérisation'
        }
      },
      {
        id: '2',
        title: 'DÉCRET EXÉCUTIF N° 25-45 - Organisation Administrative',
        type: 'Décret Exécutif',
        reference: 'DE-25-45-2025',
        category: 'Administration',
        submittedBy: 'Ahmed Benali',
        approvedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'translation_complete',
        priority: 'medium',
        approvedBy: 'Dr. Fatima Cherif',
        originalLanguage: 'ar',
        translations: {
          ar: {
            title: 'المرسوم التنفيذي رقم 25-45 - التنظيم الإداري',
            status: 'ready_to_publish',
            confidence: 100,
            lastUpdated: new Date(),
            translatedBy: 'Original'
          },
          fr: {
            title: 'DÉCRET EXÉCUTIF N° 25-45 - Organisation Administrative',
            status: 'ready_to_publish',
            confidence: 94,
            lastUpdated: new Date(Date.now() - 60 * 60 * 1000),
            translatedBy: 'Service de Traduction',
            validatedBy: 'Expert juridique'
          },
          en: {
            title: 'EXECUTIVE DECREE N° 25-45 - Administrative Organization',
            status: 'ready_to_publish',
            confidence: 91,
            lastUpdated: new Date(Date.now() - 30 * 60 * 1000),
            translatedBy: 'Translation Service'
          }
        },
        details: {
          type: 'Décret Exécutif',
          reference: 'DE-25-45-2025',
          category: 'Administration',
          sector: 'Administration Publique',
          dateOfEffect: new Date('2025-02-20'),
          description: 'Réorganisation des structures administratives'
        }
      }
    ];

    setDocuments(sampleDocuments);
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.reference.toLowerCase().includes(searchTerm.toLowerCase());
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
      'approved_pending_publication': { label: 'Approuvé - En attente', className: 'bg-yellow-100 text-yellow-800' },
      'translation_pending': { label: 'Traduction en attente', className: 'bg-orange-100 text-orange-800' },
      'translation_complete': { label: 'Traduction terminée', className: 'bg-blue-100 text-blue-800' },
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

  const handleDocumentSelect = (doc: ProcedureDocument) => {
    setSelectedDocument(doc);
  };

  const handleTranslationUpdate = (
    documentId: string, 
    languageCode: 'fr' | 'ar' | 'en', 
    translationData: any
  ) => {
    setDocuments(docs => docs.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          translations: {
            ...doc.translations,
            [languageCode]: {
              ...doc.translations[languageCode],
              ...translationData,
              lastUpdated: new Date()
            }
          }
        };
      }
      return doc;
    }));

    // Mettre à jour le document sélectionné si c'est le même
    if (selectedDocument?.id === documentId) {
      setSelectedDocument(prev => prev ? {
        ...prev,
        translations: {
          ...prev.translations,
          [languageCode]: {
            ...prev.translations[languageCode],
            ...translationData,
            lastUpdated: new Date()
          }
        }
      } : null);
    }

    toast({
      title: "Traduction mise à jour",
      description: `La traduction en ${SUPPORTED_LANGUAGES.find(l => l.code === languageCode)?.name} a été mise à jour.`,
    });
  };

  const canPublish = (doc: ProcedureDocument) => {
    return SUPPORTED_LANGUAGES.every(lang => {
      const translation = doc.translations[lang.code];
      return translation && 
             translation.status === 'ready_to_publish' &&
             (translation.confidence || 0) >= currentConfidenceThreshold;
    });
  };

  const handlePublish = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    if (!canPublish(doc)) {
      toast({
        title: "Publication impossible",
        description: "Toutes les traductions doivent être complétées et validées avec le seuil de confiance requis.",
        variant: "destructive"
      });
      return;
    }

    setDocuments(docs => docs.map(d => 
      d.id === docId ? { ...d, status: 'published' as const } : d
    ));

    toast({
      title: "Document publié",
      description: "Le document a été publié avec succès dans toutes les langues.",
    });
  };

  const getStatistics = () => {
    return {
      total: documents.length,
      pending: documents.filter(d => d.status === 'approved_pending_publication').length,
      translationPending: documents.filter(d => d.status === 'translation_pending').length,
      translationComplete: documents.filter(d => d.status === 'translation_complete').length,
      published: documents.filter(d => d.status === 'published').length
    };
  };

  const stats = getStatistics();

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
                {canPublish(selectedDocument) && (
                  <Button
                    onClick={() => handlePublish(selectedDocument.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Publier
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              {SUPPORTED_LANGUAGES.map(lang => (
                <LanguageTranslationPanel
                  key={lang.code}
                  language={lang}
                  document={selectedDocument}
                  translation={selectedDocument.translations[lang.code]}
                  isOriginalLanguage={selectedDocument.originalLanguage === lang.code}
                  confidenceThreshold={currentConfidenceThreshold}
                  onTranslationUpdate={(translationData) =>
                    handleTranslationUpdate(selectedDocument.id, lang.code, translationData)
                  }
                />
              ))}
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
                {canPublish(selectedDocument) ? 'Publier le document' : 'Publication non disponible'}
              </Button>
            </div>

            {!canPublish(selectedDocument) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Conditions de publication non remplies</span>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  Toutes les langues doivent être dans l'état "Prêt à publier" avec un taux de confiance ≥ {currentConfidenceThreshold}%
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
        title="📋 File d'attente de publication multi-langues"
        description="Gestion des traductions et publication des procédures approuvées"
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
            filter === 'approved_pending_publication' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
          onClick={() => setFilter('approved_pending_publication')}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
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
            <p className="text-sm text-blue-600">Traduits</p>
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
            placeholder="Rechercher une procédure..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Seuil de confiance minimum</span>
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
          </div>
        </Card>
      </div>

      {/* Liste des documents */}
      <div className="grid gap-4">
        {paginatedDocuments.map((doc) => (
          <Card key={doc.id} className="border-l-4 border-l-primary cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{doc.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="secondary">{doc.type}</Badge>
                    <Badge variant="outline">{doc.reference}</Badge>
                    {getStatusBadge(doc.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Approuvé par {doc.approvedBy} • {doc.approvedDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityIcon(doc.priority)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDocumentSelect(doc)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Gérer les traductions
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {SUPPORTED_LANGUAGES.map(lang => {
                    const translation = doc.translations[lang.code];
                    const isOriginal = doc.originalLanguage === lang.code;
                    return (
                      <div key={lang.code} className="flex items-center gap-2">
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.name}</span>
                        {isOriginal ? (
                          <Badge className="bg-blue-100 text-blue-800">Original</Badge>
                        ) : translation?.status === 'completed' || translation?.status === 'validated' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : translation?.status === 'in_progress' ? (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        {translation?.confidence && (
                          <span className={`text-xs ${
                            translation.confidence >= currentConfidenceThreshold 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {translation.confidence}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {canPublish(doc) && (
                  <Button
                    onClick={() => handlePublish(doc.id)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Publier
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}