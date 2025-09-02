import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProcedureDocument } from "./MultiLanguagePublicationQueue";
import { 
  FileText,
  Hash,
  Calendar,
  Building,
  MapPin,
  Tag,
  CheckCircle,
  AlertTriangle,
  Info
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

interface DocumentDetailsComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  originalDocument: ProcedureDocument;
  translatedDocument?: Translation;
  language: LanguageInfo;
}

interface DetailField {
  label: string;
  icon: React.ComponentType<any>;
  originalValue: string | Date | undefined;
  translatedValue?: string | Date | undefined;
  isRequired: boolean;
}

export function DocumentDetailsComparison({
  isOpen,
  onClose,
  originalDocument,
  translatedDocument,
  language
}: DocumentDetailsComparisonProps) {

  const formatDate = (date: Date | undefined): string => {
    return date ? date.toLocaleDateString() : 'Non défini';
  };

  const detailFields: DetailField[] = [
    {
      label: 'Type de document',
      icon: FileText,
      originalValue: originalDocument.details.type,
      translatedValue: originalDocument.details.type, // Doit être identique
      isRequired: true
    },
    {
      label: 'Référence',
      icon: Hash,
      originalValue: originalDocument.details.reference,
      translatedValue: originalDocument.details.reference, // Doit être identique
      isRequired: true
    },
    {
      label: 'Catégorie',
      icon: Tag,
      originalValue: originalDocument.details.category,
      translatedValue: originalDocument.details.category, // Doit être identique
      isRequired: true
    },
    {
      label: 'Secteur',
      icon: Building,
      originalValue: originalDocument.details.sector,
      translatedValue: originalDocument.details.sector, // Peut être traduit
      isRequired: false
    },
    {
      label: 'Wilaya',
      icon: MapPin,
      originalValue: originalDocument.details.wilaya,
      translatedValue: originalDocument.details.wilaya, // Généralement identique
      isRequired: false
    },
    {
      label: 'Date d\'effet',
      icon: Calendar,
      originalValue: originalDocument.details.dateOfEffect,
      translatedValue: originalDocument.details.dateOfEffect, // Doit être identique
      isRequired: true
    }
  ];

  const getComparisonIcon = (original: any, translated: any, isRequired: boolean) => {
    if (!translated && !isRequired) {
      return <Info className="w-4 h-4 text-gray-400" />;
    }
    
    if (!translated && isRequired) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }

    // Pour les dates, comparer les timestamps
    if (original instanceof Date && translated instanceof Date) {
      return original.getTime() === translated.getTime() 
        ? <CheckCircle className="w-4 h-4 text-green-500" />
        : <AlertTriangle className="w-4 h-4 text-red-500" />;
    }

    // Pour les autres valeurs
    return original === translated 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const getComparisonStatus = (original: any, translated: any, isRequired: boolean): 'match' | 'mismatch' | 'missing' | 'optional' => {
    if (!translated) {
      return isRequired ? 'missing' : 'optional';
    }

    if (original instanceof Date && translated instanceof Date) {
      return original.getTime() === translated.getTime() ? 'match' : 'mismatch';
    }

    return original === translated ? 'match' : 'mismatch';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'match':
        return <Badge className="bg-green-100 text-green-800">Conforme</Badge>;
      case 'mismatch':
        return <Badge variant="destructive">Non conforme</Badge>;
      case 'missing':
        return <Badge variant="destructive">Manquant</Badge>;
      case 'optional':
        return <Badge variant="secondary">Optionnel</Badge>;
      default:
        return null;
    }
  };

  const overallComplianceScore = () => {
    const requiredFields = detailFields.filter(field => field.isRequired);
    const matchingRequired = requiredFields.filter(field => 
      getComparisonStatus(field.originalValue, field.translatedValue, field.isRequired) === 'match'
    );
    
    return requiredFields.length > 0 
      ? Math.round((matchingRequired.length / requiredFields.length) * 100)
      : 100;
  };

  const complianceScore = overallComplianceScore();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Comparaison des détails du document
            <span className="text-lg">{language.flag}</span>
            <span className="text-base font-normal">({language.name})</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-y-auto">
          {/* Score de conformité global */}
          <Card className={`${
            complianceScore === 100 
              ? 'bg-green-50 border-green-200' 
              : complianceScore >= 80 
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {complianceScore === 100 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  )}
                  <span className="font-medium">Score de conformité</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${
                    complianceScore === 100 
                      ? 'text-green-700' 
                      : complianceScore >= 80 
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }`}>
                    {complianceScore}%
                  </span>
                  {getStatusBadge(complianceScore === 100 ? 'match' : 'mismatch')}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {complianceScore === 100 
                  ? 'Tous les détails requis correspondent parfaitement.'
                  : `${detailFields.filter(f => f.isRequired && getComparisonStatus(f.originalValue, f.translatedValue, f.isRequired) !== 'match').length} détail(s) requis ne correspondent pas.`
                }
              </p>
            </CardContent>
          </Card>

          {/* Informations sur le document traduit */}
          {translatedDocument && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informations sur la traduction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Méthode de traduction:</strong> {
                      translatedDocument.translationMethod === 'equivalent_text' 
                        ? 'Texte équivalent proposé'
                        : translatedDocument.translationMethod === 'search_based'
                        ? 'Document trouvé par recherche'
                        : 'Non spécifiée'
                    }
                  </div>
                  <div>
                    <strong>Statut:</strong> {
                      translatedDocument.status === 'validated' 
                        ? 'Validé'
                        : translatedDocument.status === 'completed'
                        ? 'Terminé'
                        : 'En cours'
                    }
                  </div>
                  {translatedDocument.confidence && (
                    <div>
                      <strong>Confiance:</strong> {translatedDocument.confidence}%
                    </div>
                  )}
                  {translatedDocument.lastUpdated && (
                    <div>
                      <strong>Dernière mise à jour:</strong> {translatedDocument.lastUpdated.toLocaleString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tableau de comparaison détaillée */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparaison détaillée des champs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detailFields.map((field, index) => {
                  const IconComponent = field.icon;
                  const status = getComparisonStatus(field.originalValue, field.translatedValue, field.isRequired);
                  
                  return (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${
                        status === 'match' 
                          ? 'bg-green-50 border-green-200'
                          : status === 'mismatch' || status === 'missing'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          <span className="font-medium">{field.label}</span>
                          {field.isRequired && (
                            <Badge variant="outline" className="text-xs">Requis</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getComparisonIcon(field.originalValue, field.translatedValue, field.isRequired)}
                          {getStatusBadge(status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="font-medium text-gray-600 block mb-1">
                            Document original ({originalDocument.originalLanguage.toUpperCase()})
                          </label>
                          <div className="p-2 bg-white border rounded">
                            {field.originalValue instanceof Date 
                              ? formatDate(field.originalValue)
                              : field.originalValue || 'Non défini'
                            }
                          </div>
                        </div>
                        <div>
                          <label className="font-medium text-gray-600 block mb-1">
                            Document traduit ({language.code.toUpperCase()})
                          </label>
                          <div className="p-2 bg-white border rounded">
                            {field.translatedValue instanceof Date 
                              ? formatDate(field.translatedValue)
                              : field.translatedValue || 'Non défini'
                            }
                          </div>
                        </div>
                      </div>

                      {status === 'mismatch' && field.isRequired && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-800">
                          <strong>⚠️ Attention:</strong> Ce champ requis ne correspond pas entre les versions. 
                          Cela peut affecter la validité légale du document traduit.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recommandations */}
          {complianceScore < 100 && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Recommandations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {detailFields
                    .filter(field => field.isRequired && getComparisonStatus(field.originalValue, field.translatedValue, field.isRequired) !== 'match')
                    .map((field, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span>
                          Vérifiez et corrigez le champ <strong>{field.label}</strong> 
                          pour qu'il corresponde exactement au document original.
                        </span>
                      </li>
                    ))
                  }
                  <li className="flex items-start gap-2 mt-4 p-2 bg-yellow-100 rounded">
                    <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <span>
                      La publication ne sera possible qu'une fois tous les détails requis conformes.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}