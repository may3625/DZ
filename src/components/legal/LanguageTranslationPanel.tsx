import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { TranslationSearchModal } from "./TranslationSearchModal";
import { DocumentDetailsComparison } from "./DocumentDetailsComparison";
import type { ProcedureDocument } from "./MultiLanguagePublicationQueue";
import { 
  Search,
  FileText,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Globe,
  Percent
} from 'lucide-react';

interface LanguageInfo {
  code: 'fr' | 'ar' | 'en';
  name: string;
  flag: string;
}

interface Translation {
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

interface LanguageTranslationPanelProps {
  language: LanguageInfo;
  document: ProcedureDocument;
  translation?: Translation;
  isOriginalLanguage: boolean;
  confidenceThreshold: number;
  onTranslationUpdate: (translationData: Partial<Translation>) => void;
}

export function LanguageTranslationPanel({
  language,
  document,
  translation,
  isOriginalLanguage,
  confidenceThreshold,
  onTranslationUpdate
}: LanguageTranslationPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showDetailsComparison, setShowDetailsComparison] = useState(false);
  const [editedTitle, setEditedTitle] = useState(translation?.title || '');
  const [editedContent, setEditedContent] = useState(translation?.content || '');
  const { toast } = useToast();

  const getStatusIcon = () => {
    if (isOriginalLanguage) return <CheckCircle className="w-4 h-4 text-blue-500" />;
    
    switch (translation?.status) {
      case 'completed':
      case 'validated':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ready_to_publish':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'linked':
        return <Globe className="w-4 h-4 text-orange-500" />;
      case 'postponed':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'pending':
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = () => {
    if (isOriginalLanguage) {
      return <Badge className="bg-blue-100 text-blue-800">Original</Badge>;
    }

    const statusConfig = {
      'pending': { label: 'En attente', className: 'bg-red-100 text-red-800' },
      'in_progress': { label: 'En cours', className: 'bg-yellow-100 text-yellow-800' },
      'completed': { label: 'Terminé', className: 'bg-green-100 text-green-800' },
      'validated': { label: 'Validé', className: 'bg-blue-100 text-blue-800' },
      'ready_to_publish': { label: 'Prêt à publier', className: 'bg-emerald-100 text-emerald-800' },
      'linked': { label: 'En liaison', className: 'bg-orange-100 text-orange-800' },
      'postponed': { label: 'Reporté', className: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[translation?.status || 'linked'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleSaveTranslation = () => {
    if (!editedTitle.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre de la traduction est requis.",
        variant: "destructive"
      });
      return;
    }

    onTranslationUpdate({
      title: editedTitle,
      content: editedContent,
      status: 'completed',
      confidence: 95, // Valeur par défaut pour les traductions manuelles
      translatedBy: 'Utilisateur actuel'
    });

    setIsEditing(false);
    toast({
      title: "Traduction sauvegardée",
      description: `La traduction en ${language.name} a été mise à jour.`,
    });
  };

  const handleStartTranslation = (method: 'equivalent_text' | 'search_based') => {
    if (method === 'search_based') {
      setShowSearchModal(true);
    } else {
      setIsEditing(true);
      onTranslationUpdate({
        status: 'in_progress',
        translationMethod: method
      });
    }
  };

  // Initialiser le statut par défaut à "linked" si aucun statut n'est défini
  React.useEffect(() => {
    if (!isOriginalLanguage && (!translation || !translation.status)) {
      onTranslationUpdate({
        status: 'linked'
      });
    }
  }, [isOriginalLanguage, translation?.status, onTranslationUpdate]);

  const handleSearchResult = (selectedDocument: any) => {
    setEditedTitle(selectedDocument.title);
    setEditedContent(selectedDocument.content);
    onTranslationUpdate({
      documentId: selectedDocument.id,
      title: selectedDocument.title,
      content: selectedDocument.content,
      status: 'completed',
      confidence: selectedDocument.confidence || 90,
      translationMethod: 'search_based',
      translatedBy: 'Recherche automatique'
    });
    setShowSearchModal(false);
    toast({
      title: "Document trouvé",
      description: "Le document équivalent a été sélectionné avec succès.",
    });
  };

  const handleValidateTranslation = () => {
    onTranslationUpdate({
      status: 'validated',
      validatedBy: 'Expert juridique',
      confidence: Math.min((translation?.confidence || 90) + 5, 100)
    });
    toast({
      title: "Traduction validée",
      description: `La traduction en ${language.name} a été validée.`,
    });
  };

  const confidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500';
    return confidence >= confidenceThreshold ? 'text-green-600' : 'text-red-600';
  };

  return (
    <>
      <Card className={`h-full ${
        isOriginalLanguage 
          ? 'border-blue-200 bg-blue-50' 
          : translation?.status === 'validated'
          ? 'border-green-200 bg-green-50'
          : translation?.status === 'completed'
          ? 'border-blue-200 bg-blue-50'
          : 'border-gray-200'
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
              {getStatusIcon()}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                <div className="flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  <span className={`text-xs font-medium ${confidenceColor(translation?.confidence)}`}>
                    {(translation?.confidence ?? 0)}%
                  </span>
                  {((translation?.confidence ?? 0) < confidenceThreshold) && (
                    <span className="text-xs text-red-500 ml-1">
                      (&lt; {confidenceThreshold}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOriginalLanguage ? (
            // Langue originale - lecture seule
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-blue-700 mb-1 block">
                  Titre original
                </label>
                <div className="p-3 bg-white border border-blue-200 rounded text-sm">
                  {document.title}
                </div>
              </div>
              
              <Button
                onClick={() => setShowDetailsComparison(true)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Voir les détails du document
              </Button>
            </div>
          ) : !translation || translation?.status === 'pending' ? (
            // Aucune traduction - proposer les options
            <div className="space-y-3 text-center">
              <div className="text-sm text-muted-foreground mb-4">
                Aucune traduction disponible pour cette langue.
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => handleStartTranslation('equivalent_text')}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Proposer un texte équivalent
                </Button>
                
                <Button
                  onClick={() => handleStartTranslation('search_based')}
                  className="w-full"
                  variant="outline"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher un document existant
                </Button>
              </div>
            </div>
          ) : isEditing ? (
            // Mode édition
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Titre</label>
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Titre de la traduction"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Contenu</label>
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Contenu de la traduction"
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSaveTranslation} size="sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            // Traduction existante - mode lecture
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Titre</label>
                <div className="p-2 bg-white border rounded text-sm">
                  {translation?.title || 'Non défini'}
                </div>
              </div>
              
              {translation?.content && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Contenu</label>
                  <div className="p-2 bg-white border rounded text-sm max-h-24 overflow-y-auto">
                    {translation.content.substring(0, 200)}
                    {translation.content.length > 200 && '...'}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                {translation?.translatedBy && (
                  <div>Traduit par: {translation.translatedBy}</div>
                )}
                {translation?.lastUpdated && (
                  <div>Dernière mise à jour: {translation.lastUpdated.toLocaleString()}</div>
                )}
                {translation?.translationMethod && (
                  <div>
                    Méthode: {translation.translationMethod === 'equivalent_text' 
                      ? 'Texte équivalent' 
                      : 'Recherche de document'}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    setEditedTitle(translation?.title || '');
                    setEditedContent(translation?.content || '');
                    setIsEditing(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>

                {translation?.status === 'completed' && translation.confidence && translation.confidence >= confidenceThreshold && (
                  <Button
                    onClick={handleValidateTranslation}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Valider la traduction
                  </Button>
                )}

                {/* Le bouton "Prêt à publier" est géré dans les actions de statut ci-dessous */}

                <Button
                  onClick={() => setShowDetailsComparison(true)}
                  variant="outline"
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Comparer les détails
                </Button>

                {/* Boutons d'action pour le statut */}
                <div className="border-t pt-2 mt-2">
                  <div className="text-xs text-muted-foreground mb-2">Actions de statut :</div>
                  <div className="grid grid-cols-1 gap-1">
                    <Button
                      onClick={() => onTranslationUpdate({ status: 'ready_to_publish' })}
                      size="sm"
                      variant={translation?.status === 'ready_to_publish' ? 'default' : 'outline'}
                      className={translation?.status === 'ready_to_publish' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                      disabled={!translation?.confidence || translation.confidence < confidenceThreshold}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Prêt à publier
                    </Button>
                    <Button
                      onClick={() => onTranslationUpdate({ status: 'linked' })}
                      size="sm"
                      variant={translation?.status === 'linked' ? 'default' : 'outline'}
                      className={translation?.status === 'linked' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                    >
                      <Globe className="w-3 h-3 mr-1" />
                      En liaison
                    </Button>
                    <Button
                      onClick={() => onTranslationUpdate({ status: 'postponed' })}
                      size="sm"
                      variant={translation?.status === 'postponed' ? 'default' : 'outline'}
                      className={translation?.status === 'postponed' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Reporter
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {translation?.confidence && translation.confidence < confidenceThreshold && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-red-800">Confiance insuffisante</div>
                  <div className="text-red-700">
                    Le taux de confiance ({translation.confidence}%) est inférieur au seuil requis ({confidenceThreshold}%).
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      <TranslationSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        language={language}
        originalDocument={document}
        onSelectDocument={handleSearchResult}
      />

      <DocumentDetailsComparison
        isOpen={showDetailsComparison}
        onClose={() => setShowDetailsComparison(false)}
        originalDocument={document}
        translatedDocument={translation}
        language={language}
      />
    </>
  );
}