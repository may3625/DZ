import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Calendar, User, Clock } from 'lucide-react';

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: {
    id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    status: string;
    type: string;
  };
}

const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  if (!document) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{document.type}</Badge>
            <Badge variant={document.status === 'approved' ? 'default' : 'destructive'}>
              {document.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Author: {document.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created: {document.createdAt}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">{document.title}</h3>
            <ScrollArea className="h-[60vh] w-full border rounded-md p-4">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {document.content}
                </pre>
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDetailModal;