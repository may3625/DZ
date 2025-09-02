import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Clock, 
  AlertTriangle, 
  Eye,
  Users,
  Zap,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApprovalItem, BatchApprovalGroup } from '@/services/approval/approvalItemService';
import { approvalItemService } from '@/services/approval/approvalItemService';
import ApprovalItemCard from './ApprovalItemCard';
import BatchApprovalPanel from './BatchApprovalPanel';
import ValidationDiagnostic from './ValidationDiagnostic';
import WorkflowOptimizationPanel from './WorkflowOptimizationPanel';

interface ApprovalWorkflowInterfaceProps {
  className?: string;
}

const ApprovalWorkflowInterface: React.FC<ApprovalWorkflowInterfaceProps> = ({
  className
}) => {
  const { toast } = useToast();
  const [approvalQueue, setApprovalQueue] = useState<ApprovalItem[]>([]);
  const [batchGroups, setBatchGroups] = useState<BatchApprovalGroup[]>([]);
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('queue');

  // Chargement initial
  useEffect(() => {
    loadApprovalQueue();
    loadBatchGroups();
  }, []);

  const loadApprovalQueue = () => {
    const queue = approvalItemService.getApprovalQueue();
    setApprovalQueue(queue);
  };

  const loadBatchGroups = () => {
    const groups = approvalItemService.createBatchGroups();
    setBatchGroups(groups);
  };

  /**
   * Gestion des actions d'approbation
   */
  const handleApprove = async (itemId: string, comments?: string) => {
    setIsLoading(true);
    try {
      const success = approvalItemService.approveItem(itemId, 'current-user', comments);
      
      if (success) {
        toast({
          title: "Document approuvé",
          description: "Le document a été approuvé avec succès",
        });
        
        loadApprovalQueue();
        setSelectedItem(null);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver le document",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (itemId: string, reason: string) => {
    setIsLoading(true);
    try {
      const success = approvalItemService.rejectItem(itemId, 'current-user', reason);
      
      if (success) {
        toast({
          title: "Document rejeté",
          description: "Le document a été rejeté",
        });
        
        loadApprovalQueue();
        setSelectedItem(null);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le document",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModify = async (itemId: string, fieldName: string, newValue: string, reason: string) => {
    setIsLoading(true);
    try {
      const success = approvalItemService.modifyItem(itemId, fieldName, newValue, reason, 'current-user');
      
      if (success) {
        toast({
          title: "Modification appliquée",
          description: `Le champ "${fieldName}" a été modifié`,
        });
        
        loadApprovalQueue();
        // Recharger l'item sélectionné
        const updatedQueue = approvalItemService.getApprovalQueue();
        const updatedItem = updatedQueue.find(item => item.id === itemId);
        if (updatedItem) {
          setSelectedItem(updatedItem);
        }
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le document",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Statistiques de la queue
   */
  const queueStats = {
    total: approvalQueue.length,
    critical: approvalQueue.filter(item => item.priority === 'critical').length,
    high: approvalQueue.filter(item => item.priority === 'high').length,
    avgConfidence: approvalQueue.length > 0 
      ? Math.round(approvalQueue.reduce((sum, item) => sum + item.confidence, 0) / approvalQueue.length)
      : 0,
    estimatedTime: approvalQueue.reduce((sum, item) => sum + item.estimatedReviewTime, 0)
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    } as const;
    
    return <Badge variant={variants[priority as keyof typeof variants] || 'outline'}>{priority}</Badge>;
  };

  return (
    <div className={className}>
      {/* En-tête avec statistiques */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            File d'Attente d'Approbation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{queueStats.total}</div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{queueStats.critical}</div>
              <div className="text-sm text-muted-foreground">Critiques</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{queueStats.high}</div>
              <div className="text-sm text-muted-foreground">Haute priorité</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{queueStats.avgConfidence}%</div>
              <div className="text-sm text-muted-foreground">Confiance moy.</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{queueStats.estimatedTime}min</div>
              <div className="text-sm text-muted-foreground">Temps estimé</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            File d'attente ({queueStats.total})
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Traitement par lot ({batchGroups.length})
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Optimisation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Liste des documents en attente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Documents en attente</h3>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {approvalQueue.map((item) => (
                    <ApprovalItemCard
                      key={item.id}
                      item={item}
                      isSelected={selectedItem?.id === item.id}
                      onSelect={() => setSelectedItem(item)}
                      onApprove={(comments) => handleApprove(item.id, comments)}
                      onReject={(reason) => handleReject(item.id, reason)}
                      onModify={(fieldName, newValue, reason) => 
                        handleModify(item.id, fieldName, newValue, reason)
                      }
                      isLoading={isLoading}
                    />
                  ))}
                  
                  {approvalQueue.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>Aucun document en attente d'approbation</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Panneau de détails */}
            <div className="space-y-4">
              {selectedItem ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Détails du document</h3>
                    {getPriorityBadge(selectedItem.priority)}
                  </div>
                  
                  <ValidationDiagnostic
                    item={selectedItem}
                    onFieldModify={(fieldName, newValue, reason) =>
                      handleModify(selectedItem.id, fieldName, newValue, reason)
                    }
                  />
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4" />
                  <p>Sélectionnez un document pour voir les détails</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <BatchApprovalPanel
            batchGroups={batchGroups}
            onBatchAction={(groupId, actionType) => {
              // Implémentation des actions par lot
              toast({
                title: "Action par lot",
                description: `Action "${actionType}" appliquée au groupe ${groupId}`,
              });
              loadApprovalQueue();
              loadBatchGroups();
            }}
          />
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <WorkflowOptimizationPanel
            items={approvalQueue}
            onOptimizationApplied={() => {
              loadApprovalQueue();
              loadBatchGroups();
            }}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance d'approbation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Documents traités aujourd'hui</span>
                    <span className="font-bold">15</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temps moyen de traitement</span>
                    <span className="font-bold">8 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux d'approbation</span>
                    <span className="font-bold text-green-600">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Problèmes fréquents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Confiance faible</span>
                    <Badge variant="destructive">23%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Champs manquants</span>
                    <Badge variant="secondary">18%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Format invalide</span>
                    <Badge variant="outline">12%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApprovalWorkflowInterface;