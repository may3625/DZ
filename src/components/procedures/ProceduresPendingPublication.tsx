// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Pagination } from "@/components/common/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { useToast } from "@/hooks/use-toast";
import { LanguageTranslationPanel } from "../legal/LanguageTranslationPanel";
import ConfidenceGauge from '@/components/mapping/ConfidenceGauge';
import { MultiLanguageDocumentModal } from '@/components/common/MultiLanguageDocumentModal';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  FileText, 
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Send,
  Eye,
  Filter,
  Search,
  ClipboardList,
  Building,
  FileSearch,
  Globe,
  Languages
} from 'lucide-react';

interface ProcedureDocument {
  id: string;
  title: string;
  type: string;
  procedureCategory: 'commercial' | 'administrative' | 'juridique' | 'fiscal' | 'urbanisme' | 'immigration';
  submittedBy: string;
  submissionDate: Date;
  status: 'ready_to_publish' | 'awaiting_translation' | 'awaiting_linking' | 'published' | 'publication_delayed';
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  comments: Comment[];
  language: 'ar' | 'fr' | 'both';
  translationStatus: 'complete' | 'partial' | 'none';
  linkingStatus: 'complete' | 'partial' | 'none';
  estimatedDuration: string;
  publicationData: Record<string, unknown>;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  type: 'comment' | 'approval' | 'rejection' | 'publication_request';
}

// Mock data for procedures ready for publication
const mockPublicationProcedures = [
  {
    id: '1',
    title: 'Procédure de Création d\'Entreprise Individuelle Numérique',
    type: 'Procédure Commerciale',
    procedureCategory: 'commercial',
    submittedBy: 'Service de Publication',
    submissionDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
    status: 'ready_to_publish',
    confidence: 100,
    priority: 'high',
    assignedTo: 'Équipe Publication',
    comments: [],
    language: 'both',
    translationStatus: 'complete',
    linkingStatus: 'complete',
    estimatedDuration: '7-14 jours',
    publicationData: {
      reference: 'PCEI-2025-001',
      datePublication: '2025-02-20'
    }
  },
  {
    id: '2',
    title: 'Procédure de Demande de Permis de Construire Résidentiel',
    type: 'Procédure Urbanisme',
    procedureCategory: 'urbanisme',
    submittedBy: 'Service de Publication',
    submissionDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
    status: 'awaiting_translation',
    confidence: 95,
    priority: 'medium',
    assignedTo: 'Équipe Traduction',
    comments: [
      {
        id: '1',
        author: 'Équipe Traduction',
        content: 'Traduction en arabe en cours, finalisation prévue demain.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        type: 'comment'
      }
    ],
    language: 'fr',
    translationStatus: 'partial',
    linkingStatus: 'complete',
    estimatedDuration: '15-30 jours',
    publicationData: {
      reference: 'PDPC-2025-045',
      datePublication: '2025-02-22'
    }
  },
  {
    id: '3',
    title: 'Procédure de Renouvellement de Carte de Séjour',
    type: 'Procédure Immigration',
    procedureCategory: 'immigration',
    submittedBy: 'Service de Publication',
    submissionDate: new Date(Date.now() - 8 * 60 * 60 * 1000),
    status: 'awaiting_linking',
    confidence: 92,
    priority: 'low',
    assignedTo: 'Équipe Liaison',
    comments: [
      {
        id: '2',
        author: 'Équipe Liaison',
        content: 'Procédures connexes en cours d\'identification.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        type: 'comment'
      }
    ],
    language: 'both',
    translationStatus: 'complete',
    linkingStatus: 'partial',
    estimatedDuration: '21 jours',
    publicationData: {
      reference: 'PRCS-2025-089',
      datePublication: '2025-02-25'
    }
  },
  {
    id: '4',
    title: 'Procédure d\'Inscription au Registre du Commerce Électronique',
    type: 'Procédure Commerciale',
    procedureCategory: 'commercial',
    submittedBy: 'Service de Publication',
    submissionDate: new Date(Date.now() - 10 * 60 * 60 * 1000),
    status: 'published',
    confidence: 100,
    priority: 'high',
    assignedTo: null,
    comments: [
      {
        id: '3',
        author: 'Système',
        content: 'Procédure publiée avec succès le 18/02/2025.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        type: 'publication_request'
      }
    ],
    language: 'both',
    translationStatus: 'complete',
    linkingStatus: 'complete',
    estimatedDuration: '7-14 jours',
    publicationData: {
      reference: 'PIRCE-2025-156',
      datePublication: '2025-02-18'
    }
  },
  {
    id: '5',
    title: 'Procédure de Déclaration Fiscale Entreprise',
    type: 'Procédure Fiscale',
    procedureCategory: 'fiscal',
    submittedBy: 'Service de Publication',
    submissionDate: new Date(Date.now() - 14 * 60 * 60 * 1000),
    status: 'publication_delayed',
    confidence: 98,
    priority: 'medium',
    assignedTo: 'Chef de Publication',
    comments: [
      {
        id: '4',
        author: 'Chef de Publication',
        content: 'Publication reportée en attente de validation des services fiscaux.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'comment'
      }
    ],
    language: 'both',
    translationStatus: 'complete',
    linkingStatus: 'complete',
    estimatedDuration: '10-15 jours',
    publicationData: {
      reference: 'PDFE-2025-234',
      datePublication: '2025-02-28'
    }
  }
];

const ProceduresPendingPublication: React.FC = () => {
  const [documents, setDocuments] = useState<ProcedureDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ProcedureDocument | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');
  const [isMultiLanguageModalOpen, setIsMultiLanguageModalOpen] = useState(false);
  const [selectedProcedureForLanguages, setSelectedProcedureForLanguages] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    setDocuments(mockPublicationProcedures);
  }, []);

  const SUPPORTED_LANGUAGES = [
    { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
    { code: 'ar' as const, name: 'العربية', flag: '🇩🇿' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧' }
  ];

  // Génère des traductions avec une confiance non nulle pour les tests
  const generateInitialTranslations = (original: 'fr' | 'ar') => {
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    return {
      fr: original === 'fr'
        ? { status: 'ready_to_publish', confidence: 100, translatedBy: 'Original' }
        : { status: 'linked', confidence: rand(78, 92) },
      ar: original === 'ar'
        ? { status: 'ready_to_publish', confidence: 100, translatedBy: 'Original' }
        : { status: 'linked', confidence: rand(75, 90) },
      en: { status: 'linked', confidence: rand(70, 88) }
    } as any;
  };

  const [confidenceThreshold, setConfidenceThreshold] = useState(90);
  const [translations, setTranslations] = useState<Record<'fr' | 'ar' | 'en', any>>({});

  useEffect(() => {
    if (!selectedDocument) return;
    const originalLang: 'fr' | 'ar' = selectedDocument.language === 'ar' ? 'ar' : 'fr';
    setTranslations(generateInitialTranslations(originalLang));
  }, [selectedDocument]);

  const handleLanguageUpdate = (lang: 'fr' | 'ar' | 'en', data: any) => {
    setTranslations((prev: any) => ({
      ...prev,
      [lang]: { ...(prev?.[lang] || {}), ...data, lastUpdated: new Date() }
    }));
  };

  const handleViewProcedure = (procedureId: string) => {
    // Handle view procedure logic
    console.log('Viewing procedure:', procedureId);
  };

  const handleMultiLanguageProcedure = (procedure: any) => {
    setSelectedProcedureForLanguages(procedure);
    setIsMultiLanguageModalOpen(true);
  };

  const handleDownloadProcedure = (procedure: any) => {
    const blob = new Blob([
      `Titre: ${procedure.title}\nType: ${procedure.type}\nContenu:\n${procedure.description || 'Description de la procédure'}`
    ], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${procedure.title || 'procedure'}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleShareProcedure = (procedure: any) => {
    navigator.clipboard.writeText(`${window.location.origin}/procedure/${procedure.id}`);
    toast({
      title: "Lien copié",
      description: "Le lien de la procédure a été copié dans le presse-papiers.",
    });
  };

  const canPublishSelected = () => {
    return SUPPORTED_LANGUAGES.every((l) => {
      const t = (translations as any)[l.code];
      return t && t.status === 'ready_to_publish' && (t.confidence || 0) >= confidenceThreshold;
    });
  };

  // Filtrer seulement les documents approuvés
  const approvedDocuments = documents.filter(doc => doc.status === 'ready_to_publish' || doc.status === 'awaiting_translation' || doc.status === 'awaiting_linking' || doc.status === 'published' || doc.status === 'publication_delayed');
  
  const filteredDocuments = approvedDocuments.filter(doc => {
    const matchesStatus = filter === 'all' || doc.status === filter;
    const matchesType = typeFilter === 'all' || doc.procedureCategory === typeFilter;
    const matchesLanguage = languageFilter === 'all' || doc.language === languageFilter;
    const matchesSearch = searchTerm === '' || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesLanguage && matchesSearch;
  });

  // Pagination pour les documents filtrés
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
      'ready_to_publish': { label: 'Prêt à publier', className: 'bg-green-100 text-green-800' },
      'awaiting_translation': { label: 'En traduction', className: 'bg-blue-100 text-blue-800' },
      'awaiting_linking': { label: 'En liaison', className: 'bg-yellow-100 text-yellow-800' },
      'published': { label: 'Publié', className: 'bg-emerald-100 text-emerald-800' },
      'publication_delayed': { label: 'Publication reportée', className: 'bg-red-100 text-red-800' }
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

  const handlePublish = (docId: string) => {
    setDocuments(docs => docs.map(doc => 
      doc.id === docId ? { ...doc, status: 'published' as const } : doc
    ));
    toast({
      title: "Procédure publiée",
      description: "La procédure a été publiée avec succès.",
    });
  };

  const handleDelay = (docId: string) => {
    setDocuments(docs => docs.map(doc => 
      doc.id === docId ? { ...doc, status: 'publication_delayed' as const } : doc
    ));
    toast({
      title: "Publication reportée",
      description: "La publication de la procédure a été reportée.",
    });
  };

  const handleViewDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setSelectedDocument(doc);
      toast({
        title: "Procédure sélectionnée",
        description: `Détails de ${doc.title}`,
      });
    }
  };

  const addComment = (docId: string, comment?: string) => {
    const commentText = comment || newComment;
    if (!commentText.trim()) return;
    
    const newCommentObj: Comment = {
      id: Date.now().toString(),
      author: 'Utilisateur actuel',
      content: commentText,
      timestamp: new Date(),
      type: 'comment'
    };

    setDocuments(docs => docs.map(doc => 
      doc.id === docId 
        ? { ...doc, comments: [...doc.comments, newCommentObj] }
        : doc
    ));
    
    if (!comment) {
      setNewComment('');
    }
  };

  const getStatistics = () => {
    return {
      total: documents.length,
      readyToPublish: documents.filter(d => d.status === 'ready_to_publish').length,
      awaitingTranslation: documents.filter(d => d.status === 'awaiting_translation').length,
      awaitingLinking: documents.filter(d => d.status === 'awaiting_linking').length,
      published: documents.filter(d => d.status === 'published').length,
      delayed: documents.filter(d => d.status === 'publication_delayed').length,
      avgConfidence: documents.reduce((acc, doc) => acc + doc.confidence, 0) / documents.length
    };
  };

  const stats = getStatistics();

  const ProcedureCard = ({ procedure }: { procedure: any }) => (
    <Card key={procedure.id} className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{procedure.title}</CardTitle>
            {procedure.title_fr && procedure.language === 'ar' && (
              <p className="text-sm text-muted-foreground mb-2">{procedure.title_fr}</p>
            )}
            {procedure.title_ar && procedure.language === 'fr' && (
              <p className="text-sm text-muted-foreground mb-2 text-right">{procedure.title_ar}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary">{procedure.type}</Badge>
              <Badge variant="outline">{procedure.category}</Badge>
              {getStatusBadge(procedure)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewProcedure(procedure.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleMultiLanguageProcedure(procedure)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700"
            >
              <Languages className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleDownloadProcedure(procedure)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleShareProcedure(procedure)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{procedure.reference}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{procedure.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{procedure.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{procedure.estimatedDuration}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <span>{procedure.language === 'ar' ? 'العربية' : 'Français'}</span>
        </div>
        
        {procedure.translationConfidence && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Confiance de traduction</span>
              <span className={procedure.translationConfidence >= confidenceThreshold ? 'text-green-600' : 'text-red-600'}>
                {procedure.translationConfidence}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  procedure.translationConfidence >= confidenceThreshold ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${procedure.translationConfidence}%` }}
              ></div>
            </div>
          </div>
        )}

        {procedure.linkedDocuments.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Procédures liées:</p>
            <div className="flex gap-2">
              {procedure.linkedDocuments.map((linkedId: number) => (
                <Badge key={linkedId} variant="outline" className="text-xs">
                  <Link className="h-3 w-3 mr-1" />
                  Proc #{linkedId}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {procedure.needsLinking && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLinkProcedures(procedure.id)}
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              Lier procédures
            </Button>
          )}
          {!procedure.needsLinking && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleValidateForPublication(procedure.id)}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Valider publication
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SectionHeader
        title="📋 File d'attente de publication"
        description="Gestion et suivi des procédures administratives prêtes pour publication"
        icon={Send}
        iconColor="text-blue-600"
      />

      {/* Statistics - Cliquables comme filtres */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
          className={`p-4 bg-green-50 border-green-200 cursor-pointer hover:shadow-md transition-shadow ${
            filter === 'ready_to_publish' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
          onClick={() => setFilter('ready_to_publish')}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-green-700">{stats.readyToPublish}</p>
            <p className="text-sm text-green-600">Prêts à publier</p>
          </div>
        </Card>
        <Card 
          className={`p-4 bg-blue-50 border-blue-200 cursor-pointer hover:shadow-md transition-shadow ${
            filter === 'awaiting_translation' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
          onClick={() => setFilter('awaiting_translation')}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.awaitingTranslation}</p>
            <p className="text-sm text-blue-600">En traduction</p>
          </div>
        </Card>
        <Card 
          className={`p-4 bg-yellow-50 border-yellow-200 cursor-pointer hover:shadow-md transition-shadow ${
            filter === 'awaiting_linking' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
          onClick={() => setFilter('awaiting_linking')}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.awaitingLinking}</p>
            <p className="text-sm text-yellow-600">En liaison</p>
          </div>
        </Card>
        <Card 
          className={`p-4 bg-emerald-50 border-emerald-200 cursor-pointer hover:shadow-md transition-shadow ${
            filter === 'published' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
          onClick={() => setFilter('published')}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-700">{stats.published}</p>
            <p className="text-sm text-emerald-600">Publiés</p>
          </div>
        </Card>
        <Card 
          className={`p-4 bg-red-50 border-red-200 cursor-pointer hover:shadow-md transition-shadow ${
            filter === 'publication_delayed' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
          onClick={() => setFilter('publication_delayed')}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-red-700">{stats.delayed}</p>
            <p className="text-sm text-red-600">Reportés</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2">
                <Button
                  variant={typeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('all')}
                >
                  Toutes
                </Button>
                <Button
                  variant={typeFilter === 'commercial' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('commercial')}
                >
                  Commercial
                </Button>
                <Button
                  variant={typeFilter === 'urbanisme' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('urbanisme')}
                >
                  Urbanisme
                </Button>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher une procédure..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Documents */}
          <div className="space-y-3">
            {paginatedDocuments.map((doc) => (
              <Card 
                key={doc.id} 
                className={`p-4 cursor-pointer transition-all ${
                  selectedDocument?.id === doc.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getPriorityIcon(doc.priority)}
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{doc.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(doc.status)}
                        <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {doc.submittedBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <Languages className="w-3 h-3" />
                          {doc.language === 'both' ? 'AR/FR' : doc.language.toUpperCase()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {doc.estimatedDuration}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDocument(doc.id);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {doc.status === 'ready_to_publish' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePublish(doc.id);
                        }}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={totalItems}
            />
          )}
        </div>

        {/* Document Details Panel */}
        <div className="space-y-4">
          {selectedDocument ? (
            <Card className="p-4">
              {(() => {
                const normalizedDocument: any = {
                  id: selectedDocument.id,
                  title: selectedDocument.title,
                  type: selectedDocument.type,
                  reference: (selectedDocument.publicationData as any)?.reference || selectedDocument.id,
                  category: selectedDocument.procedureCategory,
                  submittedBy: selectedDocument.submittedBy,
                  approvedDate: selectedDocument.submissionDate,
                  status: 'translation_pending',
                  priority: selectedDocument.priority,
                  approvedBy: selectedDocument.assignedTo || '—',
                  originalLanguage: (selectedDocument.language === 'ar' ? 'ar' : 'fr') as 'fr' | 'ar' | 'en',
                  translations: translations as any,
                  details: {
                    type: selectedDocument.type,
                    reference: (selectedDocument.publicationData as any)?.reference || selectedDocument.id,
                    category: selectedDocument.procedureCategory,
                    dateOfEffect: new Date(),
                    description: ''
                  }
                };

                return (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{selectedDocument.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {getStatusBadge(selectedDocument.status)}
                        <Badge variant="outline">{selectedDocument.type}</Badge>
                      </div>
                    </div>

                    {/* Seuil de confiance */}
                    <div className="space-y-2">
                      <ConfidenceGauge 
                        confidence={confidenceThreshold}
                        size="md"
                        showLabel={true}
                        className="w-full"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="range"
                          min="0"
                          max="100"
                          value={confidenceThreshold}
                          onChange={(e) => setConfidenceThreshold(parseInt(e.target.value) || 90)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={confidenceThreshold}
                          onChange={(e) => setConfidenceThreshold(parseInt(e.target.value) || 90)}
                          className="w-20 text-center"
                        />
                      </div>
                    </div>

                    {/* Panneaux de traduction par langue */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-1 gap-4">
                          {SUPPORTED_LANGUAGES.map((lang) => (
                          <LanguageTranslationPanel
                            key={lang.code}
                            language={lang as any}
                            document={normalizedDocument}
                            translation={(translations as any)[lang.code]}
                            isOriginalLanguage={normalizedDocument.originalLanguage === lang.code}
                            confidenceThreshold={confidenceThreshold}
                            onTranslationUpdate={(data) => handleLanguageUpdate(lang.code as any, data)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Bouton global de publication */}
                    <div className="flex flex-col gap-2 pt-2">
                      <Button
                        onClick={() => handlePublish(selectedDocument.id)}
                        disabled={!canPublishSelected()}
                        className={canPublishSelected() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Publier
                      </Button>
                      {!canPublishSelected() && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                          Toutes les langues doivent être à l'état "Prêt à publier" avec une confiance ≥ {confidenceThreshold}%.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </Card>
          ) : (
            <Card className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Sélectionnez une procédure pour voir les détails</p>
            </Card>
          )}
        </div>
      </div>

      {/* Modal multilangue */}
      {isMultiLanguageModalOpen && selectedProcedureForLanguages && (
        <MultiLanguageDocumentModal
          isOpen={isMultiLanguageModalOpen}
          onClose={() => setIsMultiLanguageModalOpen(false)}
          documentId={selectedProcedureForLanguages.id.toString()}
          documentType="procedure"
          originalDocument={{
            title: selectedProcedureForLanguages.title,
            type: selectedProcedureForLanguages.type,
            category: selectedProcedureForLanguages.procedureCategory,
            content: selectedProcedureForLanguages.description || 'Description de la procédure'
          }}
        />
      )}
    </div>
  );
};

export default ProceduresPendingPublication;