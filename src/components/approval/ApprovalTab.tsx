// Interface ApprovalTab avec boutons Approuver/Rejeter/Modifier

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar,
  FileText,
  Eye
} from 'lucide-react';
import { ApprovalItem, ValidationStatus, ApprovalPriority } from '@/types/approval';
import { ApprovalWorkflowService } from '@/services/approvalWorkflowService';
import { ValidationService } from '@/services/validationService';
import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from '@/hooks/use-toast';
import { ApprovalActions } from './ApprovalActions';
import { ValidationErrors } from './ValidationErrors';
import { ApprovalHistory } from './ApprovalHistory';
import { ItemPreview } from './ItemPreview';

export function ApprovalTab() {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ValidationStatus | 'all'>('all');
  
  const { user, userRole } = useAuthState();
  const { toast } = useToast();

  // Charger les éléments d'approbation
  useEffect(() => {
    loadApprovalItems();
  }, [activeFilter]);

  const loadApprovalItems = async () => {
    try {
      setLoading(true);
      
      const filters = activeFilter !== 'all' ? { status: activeFilter } : undefined;
      const approvalItems = await ApprovalWorkflowService.getApprovalQueue(filters);
      
      setItems(approvalItems);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les éléments d'approbation"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId: string, comment?: string) => {
    try {
      setActionLoading(itemId);
      await ApprovalWorkflowService.approveItem(itemId, comment);
      
      toast({
        title: "Approuvé",
        description: "L'élément a été approuvé avec succès"
      });
      
      await loadApprovalItems();
      setSelectedItem(null);
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'approuver l'élément"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (itemId: string, reason: string) => {
    try {
      setActionLoading(itemId);
      await ApprovalWorkflowService.rejectItem(itemId, reason);
      
      toast({
        title: "Rejeté",
        description: "L'élément a été rejeté"
      });
      
      await loadApprovalItems();
      setSelectedItem(null);
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de rejeter l'élément"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestModification = async (itemId: string, notes: string) => {
    try {
      setActionLoading(itemId);
      await ApprovalWorkflowService.requestModifications(itemId, notes);
      
      toast({
        title: "Modifications demandées",
        description: "Des modifications ont été demandées"
      });
      
      await loadApprovalItems();
      setSelectedItem(null);
    } catch (error) {
      console.error('Erreur lors de la demande de modification:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de demander des modifications"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: ValidationStatus) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      in_review: { label: 'En cours de révision', variant: 'default' as const, icon: Eye },
      approved: { label: 'Approuvé', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Rejeté', variant: 'destructive' as const, icon: XCircle },
      requires_modification: { label: 'Modifications requises', variant: 'outline' as const, icon: Edit }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: ApprovalPriority) => {
    const priorityConfig = {
      low: { label: 'Faible', variant: 'outline' as const },
      medium: { label: 'Moyenne', variant: 'secondary' as const },
      high: { label: 'Élevée', variant: 'default' as const },
      urgent: { label: 'Urgente', variant: 'destructive' as const }
    };

    const config = priorityConfig[priority];

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const canTakeAction = (item: ApprovalItem): boolean => {
    return userRole === 'admin' || item.assigned_to === user?.id;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('all')}
        >
          Tous
        </Button>
        <Button
          variant={activeFilter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('pending')}
        >
          En attente
        </Button>
        <Button
          variant={activeFilter === 'in_review' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('in_review')}
        >
          En révision
        </Button>
        <Button
          variant={activeFilter === 'requires_modification' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('requires_modification')}
        >
          Modifications requises
        </Button>
      </div>

      {/* Liste des éléments */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Éléments d'approbation</h3>
          
          {items.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucun élément d'approbation trouvé
                </p>
              </CardContent>
            </Card>
          ) : (
            items.map((item) => (
              <Card 
                key={item.id} 
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedItem?.id === item.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {getPriorityBadge(item.priority)}
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <FileText size={14} />
                        {item.item_type}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {item.validation_errors && item.validation_errors.length > 0 && (
                      <div className="flex items-center gap-1 text-destructive">
                        <AlertTriangle size={14} />
                        {item.validation_errors.length} erreur(s)
                      </div>
                    )}
                  </div>
                  
                  {item.assigned_to && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <User size={14} />
                      Assigné à: {item.assigned_to}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Détails de l'élément sélectionné */}
        <div className="space-y-4">
          {selectedItem ? (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="preview">Aperçu</TabsTrigger>
                <TabsTrigger value="errors">Erreurs</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="space-y-4">
                <ItemPreview item={selectedItem} />
              </TabsContent>
              
              <TabsContent value="errors" className="space-y-4">
                <ValidationErrors 
                  errors={selectedItem.validation_errors || []} 
                  itemId={selectedItem.id}
                  onErrorResolved={loadApprovalItems}
                />
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <ApprovalHistory itemId={selectedItem.id} />
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-4">
                {canTakeAction(selectedItem) ? (
                  <ApprovalActions
                    item={selectedItem}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onRequestModification={handleRequestModification}
                    loading={actionLoading === selectedItem.id}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">
                        Vous n'avez pas les permissions pour effectuer des actions sur cet élément.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Eye className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Sélectionnez un élément pour voir les détails
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}