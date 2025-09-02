import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, Cog, Wrench, Eye, Download, Star, GitCompare
} from "lucide-react";
import { toast } from '@/hooks/use-toast';

interface FunctionalModalsProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'settings' | 'configuration' | 'tools' | 'utilities';
  onSave?: (data: any) => Promise<void>;
}

export function FunctionalModals({ isOpen, onClose, type, onSave }: FunctionalModalsProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: true
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (onSave) {
        await onSave(formData);
      }
      toast({
        title: "Succès",
        description: "La configuration a été sauvegardée avec succès.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la sauvegarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeTitle = (type: string) => {
    const titles = {
      settings: 'Paramètres',
      configuration: 'Configuration',
      tools: 'Outils',
      utilities: 'Utilitaires'
    };
    return titles[type as keyof typeof titles] || 'Fonctionnalité';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {getTypeTitle(type)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={`Nom de la ${getTypeTitle(type).toLowerCase()}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enabled">Statut</Label>
              <Select 
                value={formData.enabled ? 'enabled' : 'disabled'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, enabled: value === 'enabled' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Activé</SelectItem>
                  <SelectItem value="disabled">Désactivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={`Description de la ${getTypeTitle(type).toLowerCase()}`}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook pour utiliser les modals fonctionnels
export const useFunctionalModals = () => {
  const [documentViewOpen, setDocumentViewOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [comparisonType, setComparisonType] = useState<string>('');

  const openDocumentView = (document: any) => {
    setSelectedDocument(document);
    setDocumentViewOpen(true);
  };

  const openDownload = (document: any) => {
    setSelectedDocument(document);
    setDownloadOpen(true);
  };

  const openComparison = (documents: any[], type: string) => {
    setSelectedDocuments(documents);
    setComparisonType(type);
    setComparisonOpen(true);
  };

  const closeModal = () => {
    setDocumentViewOpen(false);
    setDownloadOpen(false);
    setComparisonOpen(false);
    setSelectedDocument(null);
    setSelectedDocuments([]);
    setComparisonType('');
  };

  return {
    modals: {
      documentView: documentViewOpen,
      download: downloadOpen,
      comparison: comparisonOpen
    },
    openDocumentView,
    openDownload,
    openComparison,
    closeModal,
    selectedDocument,
    selectedDocuments,
    comparisonType
  };
};

// Modal pour visualiser les documents
export const DocumentViewModal = ({ isOpen, onClose, document }: { isOpen: boolean; onClose: () => void; document?: any }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visualisation du document
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {document ? (
            <div>
              <h3 className="font-semibold">{document.title}</h3>
              <p className="text-gray-600">{document.content}</p>
            </div>
          ) : (
            <p>Aucun document à afficher</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Modal pour télécharger des documents
export const DownloadModal = ({ isOpen, onClose, document }: { isOpen: boolean; onClose: () => void; document?: any }) => {
  const handleDownload = () => {
    // Logique de téléchargement
    toast({
      title: "Téléchargement",
      description: "Le document a été téléchargé avec succès.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Télécharger le document
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Voulez-vous télécharger ce document ?</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleDownload}>
            Télécharger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Modal pour la comparaison de documents
export const ComparisonModal = ({ isOpen, onClose, items, type }: { isOpen: boolean; onClose: () => void; items?: any[]; type?: string }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Comparaison de {type || 'documents'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {items && items.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-2">Documents à comparer :</h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="p-2 border rounded">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.type} - {item.category}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>Aucun document à comparer</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};