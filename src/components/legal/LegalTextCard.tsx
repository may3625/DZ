
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Tag, 
  Eye, 
  Download, 
  Share2,
  Scale,
  BookOpen,
  Building,
  FileText,
  Languages
} from 'lucide-react';
import { LegalText } from './hooks/useLegalTextsData';
import { UnifiedModalSystem } from '@/components/modals/UnifiedModalSystem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MultiLanguageDocumentModal } from '@/components/common/MultiLanguageDocumentModal';

interface LegalTextCardProps {
  text: LegalText;
}

export function LegalTextCard({ text }: LegalTextCardProps) {
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMultiLanguageModalOpen, setIsMultiLanguageModalOpen] = useState(false);

  const handleConsult = () => {
    setIsConsultationModalOpen(true);
  };

  const handleDownload = () => {
    // Téléchargement réel simulé (blob PDF)
    const blob = new Blob([
      `Titre: ${text.title}\nType: ${text.type}\nContenu:\n${text.content || text.description}`
    ], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${text.title || 'texte-juridique'}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleMultiLanguage = () => {
    setIsMultiLanguageModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En vigueur':
        return 'bg-green-100 text-green-800';
      case 'Abrogé':
        return 'bg-red-100 text-red-800';
      case 'Suspendu':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Loi':
        return Scale;
      case 'Ordonnance':
        return BookOpen;
      case 'Décret':
        return Building;
      default:
        return FileText;
    }
  };

  const TypeIcon = getTypeIcon(text.type);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TypeIcon className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-lg">{text.title}</CardTitle>
              <Badge variant="outline">{text.type}</Badge>
              <Badge className={getStatusColor(text.status)}>
                {text.status}
              </Badge>
            </div>
            <CardDescription className="mb-3">
              {text.description}
            </CardDescription>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Publié le:</span>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {text.publishDate}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Catégorie:</span>
                <p className="font-medium flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {text.category}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Autorité:</span>
                <p className="font-medium">{text.authority}</p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {text.joNumber}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleConsult}
            >
              <Eye className="w-4 h-4 mr-1" />
              Consulter
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMultiLanguage}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            >
              <Languages className="w-4 h-4 mr-1" />
              Autres langues
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-1" />
              Télécharger
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-1" />
              Partager
            </Button>
          </div>
        </div>
      </CardContent>
      
      {isConsultationModalOpen && (
        <UnifiedModalSystem
          modal={{
            id: `legal-text-${text.id}-consult`,
            type: 'viewer',
            title: text.title,
            data: {
              title: text.title,
              description: text.description,
              status: text.status,
              category: text.category,
              content: text.content || text.description
            },
            onCancel: () => setIsConsultationModalOpen(false)
          }}
          onClose={() => setIsConsultationModalOpen(false)}
        />
      )}
      {isMultiLanguageModalOpen && (
        <MultiLanguageDocumentModal
          isOpen={isMultiLanguageModalOpen}
          onClose={() => setIsMultiLanguageModalOpen(false)}
          documentId={text.id.toString()}
          documentType="legal"
          originalDocument={{
            title: text.title,
            type: text.type,
            category: text.category,
            publishDate: text.publishDate,
            authority: text.authority,
            status: text.status,
            content: text.content,
            description: text.description
          }}
        />
      )}
      {isShareModalOpen && (
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Partager ce texte juridique</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <div className="text-gray-700">Lien de partage :</div>
              <div className="flex items-center gap-2">
                <Input readOnly value={`${window.location.origin}/legal-text/${text.id}`} className="flex-1" />
                <Button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/legal-text/${text.id}`);
                  }}
                  size="sm"
                  variant="outline"
                >
                  Copier
                </Button>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setIsShareModalOpen(false)}>Fermer</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
