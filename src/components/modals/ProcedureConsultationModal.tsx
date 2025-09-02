import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProcedureConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedure?: {
    id: string;
    title: string;
    description: string;
    steps: string[];
    category: string;
  };
}

export const ProcedureConsultationModal: React.FC<ProcedureConsultationModalProps> = ({
  isOpen,
  onClose,
  procedure
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    toast({ title: 'Search completed' });
  };

  if (!procedure) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Procedure Consultation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{procedure.category}</Badge>
          </div>
          <div className="space-y-2">
            <Label htmlFor="search">Search in procedure</Label>
            <div className="flex gap-2">
              <Textarea
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search terms..."
                rows={2}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Procedure Steps</Label>
            <ScrollArea className="h-[60vh] w-full border rounded-md p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{procedure.title}</h3>
                  <p className="text-sm text-muted-foreground">{procedure.description}</p>
                </div>
                <div className="space-y-2">
                  {procedure.steps && procedure.steps.length > 0 ? (
                    procedure.steps.map((step, index) => (
                      <div key={index} className="flex gap-2">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <p className="text-sm">{step}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune étape définie pour cette procédure.</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};