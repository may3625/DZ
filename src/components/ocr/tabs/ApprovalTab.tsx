/**
 * Onglet de workflow d'approbation OCR
 * Interface de gestion de la queue d'approbation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Clock,
  User,
  BarChart3,
  Filter,
  FileText,
  AlertTriangle,
  Send,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { MappingResult } from '@/types/mapping';
import { ValidationResult } from '@/services/validation/validationService';
import { 
  approvalWorkflowService, 
  ApprovalItem, 
  ApprovalAction, 
  ApprovalStats,
  ApprovalFilter 
} from '@/services/approval/approvalWorkflowService';

interface ApprovalTabProps {
  extractedText: string;
  mappingResult: MappingResult | null;
  validationResult: ValidationResult | null;
  documentType: string;
  sourceFile?: string;
  onApprovalComplete: (approved: boolean, data?: any) => void;
}

export function ApprovalTab({
  extractedText,
  mappingResult,
  validationResult,
  documentType,
  sourceFile,
  onApprovalComplete
}: ApprovalTabProps) {
  const [approvalQueue, setApprovalQueue] = useState<ApprovalItem[]>([]);
  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<ApprovalFilter>({});
  const [currentItem, setCurrentItem] = useState<ApprovalItem | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'modify' | 'request_review'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [modifications, setModifications] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Charger la queue d'approbation
  useEffect(() => {
    refreshApprovalQueue();
    refreshStats();
  }, [filter]);

  // Créer un item d'approbation si on a toutes les données
  useEffect(() => {
    if (mappingResult && validationResult && !currentItem) {
      createApprovalItem();
    }
  }, [mappingResult, validationResult]);

  const refreshApprovalQueue = () => {
    const queue = approvalWorkflowService.getApprovalQueue(filter);
    setApprovalQueue(queue);
  };

  const refreshStats = () => {
    const newStats = approvalWorkflowService.getApprovalStats();
    setStats(newStats);
  };

  const createApprovalItem = async () => {
    if (!mappingResult || !validationResult) return;

    try {
      const item = await approvalWorkflowService.createApprovalItem(
        extractedText,
        mappingResult,
        validationResult,
        documentType,
        sourceFile
      );
      setCurrentItem(item);
      refreshApprovalQueue();
      refreshStats();
    } catch (error) {
      console.error('❌ Erreur création item d\'approbation:', error);
    }
  };

  const handleApprovalAction = async (itemId: string) => {
    if (!currentItem) return;

    setIsProcessing(true);
    try {
      const action: ApprovalAction = {
        type: reviewAction,
        reason: reviewNotes,
        modifications: reviewAction === 'modify' ? modifications : undefined
      };

      await approvalWorkflowService.processApprovalAction(itemId, action, 'current-user');
      
      if (reviewAction === 'approve') {
        onApprovalComplete(true, currentItem.proposedChanges || currentItem.originalData.mappingResult.mappedFields);
      } else if (reviewAction === 'reject') {
        onApprovalComplete(false);
      }

      refreshApprovalQueue();
      refreshStats();
      setCurrentItem(null);
      setReviewNotes('');
      setModifications({});
    } catch (error) {
      console.error('❌ Erreur traitement approbation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchAction = async () => {
    if (selectedItems.size === 0) return;

    setIsProcessing(true);
    try {
      const action: ApprovalAction = { type: reviewAction, reason: reviewNotes };
      const result = await approvalWorkflowService.processBatchApproval(
        Array.from(selectedItems),
        action,
        'current-user'
      );

      console.log(`✅ Traitement batch: ${result.success.length} succès, ${result.failed.length} échecs`);
      
      setSelectedItems(new Set());
      refreshApprovalQueue();
      refreshStats();
    } catch (error) {
      console.error('❌ Erreur traitement batch:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleItemSelection = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleModificationChange = (field: string, value: any) => {
    setModifications(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_review': return 'bg-yellow-100 text-yellow-800';
      case 'modified': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">En attente</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">Approuvés</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <p className="text-xs text-muted-foreground">Rejetés</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{stats.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Taux succès</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Document Actuel</TabsTrigger>
          <TabsTrigger value="queue">Queue d'Approbation ({approvalQueue.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Document actuel */}
        <TabsContent value="current" className="space-y-4">
          {currentItem ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {currentItem.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(currentItem.priority)}>
                      {currentItem.priority}
                    </Badge>
                    <Badge className={getStatusColor(currentItem.status)}>
                      {currentItem.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informations du document */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Informations</h4>
                    <div className="space-y-1 text-sm">
                      <div>Type: {currentItem.documentType}</div>
                      <div>Confiance: {currentItem.originalData.confidence}%</div>
                      <div>Créé: {currentItem.createdAt.toLocaleString()}</div>
                      {currentItem.sourceFile && <div>Fichier: {currentItem.sourceFile}</div>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Validation</h4>
                    <div className="space-y-1 text-sm">
                      <div>Score: {currentItem.originalData.validationResult.score}%</div>
                      <div>Problèmes: {currentItem.originalData.validationResult.issues.length}</div>
                      <div>Prêt: {currentItem.originalData.validationResult.readyForApproval ? 'Oui' : 'Non'}</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Actions d'approbation */}
                <div className="space-y-4">
                  <h4 className="font-medium">Action d'approbation</h4>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant={reviewAction === 'approve' ? 'default' : 'outline'}
                      onClick={() => setReviewAction('approve')}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approuver
                    </Button>
                    <Button
                      variant={reviewAction === 'reject' ? 'default' : 'outline'}
                      onClick={() => setReviewAction('reject')}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeter
                    </Button>
                    <Button
                      variant={reviewAction === 'modify' ? 'default' : 'outline'}
                      onClick={() => setReviewAction('modify')}
                      className="gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Modifier
                    </Button>
                    <Button
                      variant={reviewAction === 'request_review' ? 'default' : 'outline'}
                      onClick={() => setReviewAction('request_review')}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Révision
                    </Button>
                  </div>

                  {reviewAction === 'modify' && (
                    <Card className="p-4">
                      <h5 className="font-medium mb-2">Modifications proposées</h5>
                      <div className="space-y-2">
                        {currentItem.originalData.mappingResult.mappedFields && 
                          Object.entries(currentItem.originalData.mappingResult.mappedFields).map(([field, data]) => (
                            <div key={field} className="flex items-center gap-2">
                              <label className="w-24 text-sm">{field}:</label>
                              <input
                                type="text"
                                className="flex-1 px-2 py-1 border rounded"
                                defaultValue={data.mappedValue}
                                onChange={(e) => handleModificationChange(field, e.target.value)}
                              />
                            </div>
                          ))
                        }
                      </div>
                    </Card>
                  )}

                  <Textarea
                    placeholder="Notes de révision (optionnel)..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="min-h-[80px]"
                  />

                  <Button
                    onClick={() => handleApprovalAction(currentItem.id)}
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isProcessing ? 'Traitement...' : 'Envoyer la décision'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun document en cours</h3>
                <p className="text-muted-foreground">
                  Extractez et mappez d'abord un document pour l'envoyer en approbation.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Queue d'approbation */}
        <TabsContent value="queue" className="space-y-4">
          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  value={filter.status?.[0] || 'all'}
                  onValueChange={(value) => setFilter(prev => ({
                    ...prev,
                    status: value === 'all' ? undefined : [value as any]
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="needs_review">Révision requise</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filter.priority?.[0] || 'all'}
                  onValueChange={(value) => setFilter(prev => ({
                    ...prev,
                    priority: value === 'all' ? undefined : [value as any]
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="low">Basse</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filter.type?.[0] || 'all'}
                  onValueChange={(value) => setFilter(prev => ({
                    ...prev,
                    type: value === 'all' ? undefined : [value as any]
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="mapping_validation">Mapping</SelectItem>
                    <SelectItem value="ocr_extraction">OCR</SelectItem>
                    <SelectItem value="batch_processing">Lot</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={refreshApprovalQueue} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Actualiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions en lot */}
          {selectedItems.size > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedItems.size} élément(s) sélectionné(s)</span>
                  </div>
                  <Button onClick={handleBatchAction} disabled={isProcessing} className="gap-2">
                    <Send className="h-4 w-4" />
                    Traitement par lot
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des items */}
          <div className="space-y-3">
            {approvalQueue.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{item.title}</h4>
                          <Badge className={getPriorityColor(item.priority)} variant="outline">
                            {item.priority}
                          </Badge>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.createdAt.toLocaleDateString()}
                          </span>
                          {item.assignedTo && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {item.assignedTo}
                            </span>
                          )}
                          <span>Confiance: {item.originalData.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {approvalQueue.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Queue vide</h3>
                <p className="text-muted-foreground">
                  Aucun élément en attente d'approbation avec les filtres actuels.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analyse des Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Temps de traitement moyen</h4>
                  <div className="text-2xl font-bold mb-2">{stats?.averageProcessingTime || 0} min</div>
                  <Progress value={(stats?.averageProcessingTime || 0) / 10 * 100} className="h-2" />
                </div>
                <div>
                  <h4 className="font-medium mb-3">Taux de succès global</h4>
                  <div className="text-2xl font-bold mb-2">{stats?.successRate.toFixed(1) || 0}%</div>
                  <Progress value={stats?.successRate || 0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}