import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, CheckCircle, XCircle, Eye, FileText, Users, Settings
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { ApprovalQueueModalProps } from '@/types/modalInterfaces';
import ApprovalWorkflowInterface from '@/components/approval/ApprovalWorkflowInterface';
import ValidationDiagnostic from '@/components/approval/ValidationDiagnostic';
import { ApprovalItem } from '@/services/approval/approvalItemService';

export function ApprovalQueueModal({ isOpen, onClose, onApprove, onReject, data }: ApprovalQueueModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('workflow');
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);

  // Si des données spécifiques sont passées (ex: un item à examiner)
  useEffect(() => {
    if (data?.approvalItem) {
      setSelectedItem(data.approvalItem);
      setActiveTab('diagnostic');
    }
  }, [data]);

  const handleItemAction = async (action: 'approve' | 'reject', itemId?: string, reason?: string) => {
    setLoading(true);
    try {
      if (action === 'approve' && onApprove) {
        await onApprove(selectedItem || {});
        toast({
          title: "Approuvé",
          description: "L'élément a été approuvé avec succès.",
        });
      } else if (action === 'reject' && onReject && reason) {
        await onReject(selectedItem || {}, reason);
        toast({
          title: "Rejeté",
          description: "L'élément a été rejeté.",
        });
      }
      
      if (data?.mode !== 'examination') {
        onClose();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Une erreur s'est produite lors de l'${action === 'approve' ? 'approbation' : 'rejet'}.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {data?.title || 'Workflow d\'Approbation'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workflow" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Workflow Complet
              </TabsTrigger>
              <TabsTrigger value="diagnostic" className="flex items-center gap-2" disabled={!selectedItem}>
                <Eye className="h-4 w-4" />
                Diagnostic Détaillé
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuration
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-4 overflow-hidden">
              <TabsContent value="workflow" className="h-full m-0">
                <ApprovalWorkflowInterface className="h-full" />
              </TabsContent>

              <TabsContent value="diagnostic" className="h-full m-0">
                {selectedItem ? (
                  <div className="h-full overflow-auto">
                    <ValidationDiagnostic
                      item={selectedItem}
                      onFieldModify={(fieldName, newValue, reason) => {
                        console.log('Field modification:', { fieldName, newValue, reason });
                        // Ici on pourrait appeler un service pour persister la modification
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto mb-4" />
                      <p>Sélectionnez un document depuis l'onglet Workflow</p>
                      <p className="text-sm">pour voir son diagnostic détaillé</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="h-full m-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Configuration du Workflow</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Seuil de confiance automatique</label>
                        <input 
                          type="range" 
                          min="50" 
                          max="100" 
                          defaultValue="80" 
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Documents avec confiance ≥ 80% approuvés automatiquement
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Groupement automatique</label>
                        <select className="w-full p-2 border rounded">
                          <option>Activé (similarité ≥ 70%)</option>
                          <option>Activé (similarité ≥ 60%)</option>
                          <option>Désactivé</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Historique et Apprentissage</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 border rounded">
                        <div className="font-bold text-lg">47</div>
                        <div className="text-muted-foreground">Corrections appliquées</div>
                      </div>
                      <div className="p-3 border rounded">
                        <div className="font-bold text-lg">23</div>
                        <div className="text-muted-foreground">Patterns identifiés</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {data?.mode === 'examination' && selectedItem && (
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleItemAction('reject', selectedItem.id, 'Examen détaillé - rejet')}
              disabled={loading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
            <Button 
              onClick={() => handleItemAction('approve', selectedItem.id)}
              disabled={loading || selectedItem.criticalIssuesCount > 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}