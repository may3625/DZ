import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Languages, 
  FileText, 
  Calendar, 
  Building, 
  Tag, 
  Eye,
  Download,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LanguageVersion {
  code: 'fr' | 'ar' | 'en';
  name: string;
  flag: string;
  title: string;
  content: string;
  status: string;
  publishDate?: string;
  category?: string;
  authority?: string;
  reference?: string;
}

interface MultiLanguageDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentType: 'legal' | 'procedure';
  originalDocument: {
    title: string;
    type?: string;
    category?: string;
    publishDate?: string;
    authority?: string;
    status?: string;
    content?: string;
    description?: string;
  };
}

const MOCK_LANGUAGE_VERSIONS: Record<string, LanguageVersion[]> = {
  // Pour chaque document, on peut avoir des versions dans différentes langues
  "default": [
    {
      code: 'fr',
      name: 'Français',
      flag: '🇫🇷',
      title: 'Version française du document',
      content: 'Contenu détaillé en français du document juridique avec toutes les dispositions légales applicables...',
      status: 'En vigueur',
      publishDate: '2024-01-15',
      category: 'Droit administratif',
      authority: 'Ministère de la Justice',
      reference: 'REF-FR-2024-001'
    },
    {
      code: 'ar',
      name: 'العربية',
      flag: '🇩🇿',
      title: 'النسخة العربية من الوثيقة',
      content: 'المحتوى التفصيلي باللغة العربية للوثيقة القانونية مع جميع الأحكام القانونية المطبقة...',
      status: 'ساري المفعول',
      publishDate: '2024-01-15',
      category: 'القانون الإداري',
      authority: 'وزارة العدل',
      reference: 'REF-AR-2024-001'
    },
    {
      code: 'en',
      name: 'English',
      flag: '🇬🇧',
      title: 'English version of the document',
      content: 'Detailed content in English of the legal document with all applicable legal provisions...',
      status: 'In effect',
      publishDate: '2024-01-15',
      category: 'Administrative Law',
      authority: 'Ministry of Justice',
      reference: 'REF-EN-2024-001'
    }
  ]
};

export function MultiLanguageDocumentModal({
  isOpen,
  onClose,
  documentId,
  documentType,
  originalDocument
}: MultiLanguageDocumentModalProps) {
  const { i18n } = useTranslation();
  const [activeLanguage, setActiveLanguage] = useState<string>(i18n.language || 'fr');
  
  // Simuler la récupération des versions linguistiques
  const languageVersions = MOCK_LANGUAGE_VERSIONS[documentId] || MOCK_LANGUAGE_VERSIONS["default"];
  
  const currentVersion = languageVersions.find(v => v.code === activeLanguage) || languageVersions[0];

  const handleDownload = (version: LanguageVersion) => {
    const blob = new Blob([
      `${version.title}\n\n${version.content}`
    ], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${version.title}-${version.code}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const getStatusColor = (status: string) => {
    if (status === 'En vigueur' || status === 'ساري المفعول' || status === 'In effect') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Versions multilingues - {originalDocument.title}
              <Badge variant="outline">
                {documentType === 'legal' ? 'Texte juridique' : 'Procédure'}
              </Badge>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <Tabs value={activeLanguage} onValueChange={setActiveLanguage} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              {languageVersions.map((version) => (
                <TabsTrigger
                  key={version.code}
                  value={version.code}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg">{version.flag}</span>
                  {version.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {languageVersions.map((version) => (
              <TabsContent
                key={version.code}
                value={version.code}
                className="flex-1 min-h-0 mt-0"
              >
                <div className="h-full flex flex-col gap-4">
                  {/* En-tête du document */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{version.title}</CardTitle>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getStatusColor(version.status)}>
                              {version.status}
                            </Badge>
                            {version.category && (
                              <Badge variant="outline">
                                <Tag className="w-3 h-3 mr-1" />
                                {version.category}
                              </Badge>
                            )}
                            {version.reference && (
                              <Badge variant="secondary">
                                <FileText className="w-3 h-3 mr-1" />
                                {version.reference}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {version.publishDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Date de publication:</span>
                                <span className="font-medium">{version.publishDate}</span>
                              </div>
                            )}
                            {version.authority && (
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Autorité:</span>
                                <span className="font-medium">{version.authority}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(version)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Contenu du document */}
                  <Card className="flex-1 min-h-0">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Contenu du document
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                      <ScrollArea className="h-[400px] w-full">
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {version.content}
                          </p>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {languageVersions.length} version{languageVersions.length > 1 ? 's' : ''} linguistique{languageVersions.length > 1 ? 's' : ''} disponible{languageVersions.length > 1 ? 's' : ''}
          </div>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}