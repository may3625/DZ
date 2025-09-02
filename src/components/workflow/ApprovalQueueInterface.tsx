/**
 * Interface de Gestion de la Queue d'Approbation
 * Permet la révision manuelle des documents extraits
 * et l'approbation avant enregistrement final
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Eye,
  Edit,
  Users,
  BarChart3,
  FileText,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

import { approvalWorkflowService, ApprovalItem, ApprovalSettings } from '@/services/enhanced/approvalWorkflowService';

export function ApprovalQueueInterface() {
  const [queueItems, setQueueItems] = useState<ApprovalItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Charger les données de la queue
   */
  const loadQueueData = useCallback(async () => {
    setRefreshing(true);
    try {
      const allItems = await approvalWorkflowService.getQueueItems();
      setQueueItems(allItems);
      
      // Charger les statistiques
      const queueStats = await approvalWorkflowService.getApprovalStatsExtended();
      setStats(queueStats as any);
      
      
      console.log('📊 Données queue chargées:', {
        total: allItems.length,
        stats: queueStats
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement queue:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  /**
   * Traiter une action d'approbation
   */
  const handleApprovalAction = useCallback(async (
    itemId: string, 
    action: 'approve' | 'reject' | 'request_correction',
    comments?: string,
    corrections?: Record<string, any>
  ) => {
    try {
      await approvalWorkflowService.processReviewAction(itemId, action, 'current_user');

      await loadQueueData();
      setSelectedItem(null);
      console.log('✅ Action traitée:', { itemId, action });
    } catch (error) {
      console.error('❌ Erreur action approbation:', error);
    }
  }, [loadQueueData]);

  /**
   * Approbation par lot
   */
  const handleBatchApproval = useCallback(async () => {
    try {
      const itemIds = queueItems
        .filter(item => item.status === 'pending')
        .map(item => item.id);
      
      await approvalWorkflowService.batchApprove(itemIds, 'current_user');
      await loadQueueData();
      
    } catch (error) {
      console.error('❌ Erreur approbation par lot:', error);
    }
  }, [loadQueueData, queueItems]);

  // Charger les données au montage
  useEffect(() => {
    loadQueueData();
  }, [loadQueueData]);

  /**
   * Filtrer les éléments selon l'onglet actif
   */
  const getFilteredItems = (status: string): ApprovalItem[] => {
    switch (status) {
      case 'pending':
        return queueItems.filter(item => item.status === 'pending');
      case 'review':
        return queueItems.filter(item => item.status === 'modified');
      case 'correction':
        return queueItems.filter(item => item.status === 'modified');
      case 'approved':
        return queueItems.filter(item => item.status === 'approved');
      case 'rejected':
        return queueItems.filter(item => item.status === 'rejected');
      default:
        return queueItems;
    }
  };

  /**
   * Obtenir la couleur du badge selon le statut
   */
  const getStatusBadgeVariant = (status: ApprovalItem['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'modified': return 'default';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  /**
   * Obtenir l'icône selon le statut
   */
  const getStatusIcon = (status: ApprovalItem['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'modified': return <Eye className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Queue d'Approbation - Workflow OCR
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadQueueData}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button 
                size="sm" 
                onClick={handleBatchApproval}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Approbation par Lot
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium">En Attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium">Approuvés</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium">Rejetés</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium">Auto-Approbation</p>
                <p className="text-2xl font-bold text-orange-600">{stats.autoApprovalRate.toFixed(1)}%</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium">Temps Moyen</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageReviewTime.toFixed(1)}h</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interface principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des documents */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Documents en Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="pending">En Attente ({stats?.pending || 0})</TabsTrigger>
                  <TabsTrigger value="review">Révision ({stats?.underReview || 0})</TabsTrigger>
                  <TabsTrigger value="correction">Correction ({stats?.needsCorrection || 0})</TabsTrigger>
                  <TabsTrigger value="approved">Approuvés</TabsTrigger>
                  <TabsTrigger value="rejected">Rejetés</TabsTrigger>
                </TabsList>

                {['pending', 'review', 'correction', 'approved', 'rejected'].map(tabValue => (
                  <TabsContent key={tabValue} value={tabValue} className="space-y-3 max-h-96 overflow-y-auto">
                    {getFilteredItems(tabValue).map((item) => (
                      <div 
                        key={item.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedItem?.id === item.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(item.status)}
                              <h4 className="font-medium">{(item as any).originalDocument?.filename || (item as any).title || `Document ${item.id.slice(0, 8)}`}</h4>
                              <Badge variant={getStatusBadgeVariant(item.status)}>
                                {item.status}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Type: {(item as any).documentType || (item as any).item_type || 'document'}</p>
                              <p>Confiance: {((item as any).mappingResults?.confidence || 0)}%</p>
                              <p>Soumis: {new Date(item.createdAt).toLocaleString()}</p>
                              {((item as any).mappingResults?.unmappedFields?.length || 0) > 0 && (
                                <p className="text-orange-600">
                                  {(item as any).mappingResults.unmappedFields.length} champs non mappés
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end text-xs text-gray-500">
                            <span>{((item as any).originalDocument?.pages || 1)} pages</span>
                            <span>{(((item as any).originalDocument?.size || 0) / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {getFilteredItems(tabValue).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucun document dans cette catégorie</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Panneau de détails et actions */}
        <div>
          {selectedItem ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Révision du Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Informations du document */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{(selectedItem as any).originalDocument?.filename || `Document ${selectedItem.id.slice(0, 8)}`}</h4>
                    <div className="text-sm text-gray-600">
                      <p>Type: {(selectedItem as any).documentType || (selectedItem as any).item_type || 'document'}</p>
                      <p>Pages: {(selectedItem as any).originalDocument?.pages || 1}</p>
                      <p>Format: {(selectedItem as any).originalDocument?.format || 'PDF'}</p>
                    </div>
                  </div>

                  {/* Métadonnées d'extraction */}
                  <div className="bg-gray-50 p-3 rounded">
                    <h5 className="font-medium text-sm mb-2">Extraction</h5>
                    <div className="text-xs space-y-1">
                      <p>Algorithme: {(selectedItem as any).processingMetadata?.algorithmUsed || 'OCR Standard'}</p>
                      <p>Temps: {((selectedItem as any).processingMetadata?.extractionTime || 1000) / 1000}s</p>
                      <p>Confiance: {(selectedItem as any).mappingResults?.confidence || 0}%</p>
                    </div>
                  </div>

                  {/* Champs non mappés */}
                  {((selectedItem as any).mappingResults?.unmappedFields?.length || 0) > 0 && (
                    <div className="bg-orange-50 p-3 rounded">
                      <h5 className="font-medium text-sm mb-2 text-orange-800">
                        Champs Non Mappés ({(selectedItem as any).mappingResults.unmappedFields.length})
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {(selectedItem as any).mappingResults.unmappedFields.map((field: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Commentaires existants */}
                  {(selectedItem as any).comments && (selectedItem as any).comments.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded">
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        Commentaires
                      </h5>
                      <div className="space-y-1">
                        {(selectedItem as any).comments.map((comment: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">{comment.author}</span>
                              <span className="text-sm text-muted-foreground">
                                {comment.timestamp.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                            {comment.type && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                {comment.type}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions selon le statut */}
                {selectedItem.status === 'pending' && (
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprovalAction(
                        selectedItem.id, 
                        'approve',
                        'Document approuvé manuellement'
                      )}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approuver
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                      onClick={() => handleApprovalAction(
                        selectedItem.id, 
                        'request_correction',
                        'Corrections requises pour les champs non mappés'
                      )}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Demander Correction
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-red-600 text-red-600 hover:bg-red-50"
                      onClick={() => handleApprovalAction(
                        selectedItem.id, 
                        'reject',
                        'Document rejeté - qualité insuffisante'
                      )}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                  </div>
                )}

                {selectedItem.status === 'modified' && (
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Ouvrir l'Éditeur
                    </Button>
                  </div>
                )}

                {(selectedItem.status === 'approved' || selectedItem.status === 'rejected') && (
                  <div className="bg-gray-50 p-3 rounded text-center">
                    <p className="text-sm text-gray-600">
                      Document traité le {(selectedItem as any).reviewedAt ? new Date((selectedItem as any).reviewedAt).toLocaleString() : 'N/A'}
                    </p>
                    {(selectedItem as any).reviewedBy && (
                      <p className="text-xs text-gray-500">
                        Par: {(selectedItem as any).reviewedBy}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">
                  Sélectionnez un document pour voir les détails et actions disponibles
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}