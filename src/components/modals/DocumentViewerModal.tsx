import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  size: string;
  lastModified: string;
  author: string;
}

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, document }) => {
  // Vérification de garde pour éviter l'erreur si document est null
  if (!document) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{document.title}</DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle>{document.title}</CardTitle>
            <CardDescription>
              Type: {document.type} | Taille: {document.size} | Modifié: {document.lastModified} | Auteur: {document.author}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p>{document.content}</p>
              </div>
              <Button onClick={onClose}>Fermer</Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};