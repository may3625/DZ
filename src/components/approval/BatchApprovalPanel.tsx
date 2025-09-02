import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Zap, 
  BarChart3,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { BatchApprovalGroup, BatchAction } from '@/services/approval/approvalItemService';
import { cn } from '@/lib/utils';

interface BatchApprovalPanelProps {
  batchGroups: BatchApprovalGroup[];
  onBatchAction: (groupId: string, actionType: string) => void;
}

const BatchApprovalPanel: React.FC<BatchApprovalPanelProps> = ({
  batchGroups,
  onBatchAction
}) => {
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroupSelection = (groupId: string) => {
    const newSelection = new Set(selectedGroups);
    if (newSelection.has(groupId)) {
      newSelection.delete(groupId);
    } else {
      newSelection.add(groupId);
    }
    setSelectedGroups(newSelection);
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'approve_all': return <CheckCircle className="h-4 w-4" />;
      case 'reject_all': return <XCircle className="h-4 w-4" />;
      case 'apply_corrections': return <Zap className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getActionVariant = (actionType: string) => {
    switch (actionType) {
      case 'approve_all': return 'default';
      case 'reject_all': return 'destructive';
      case 'apply_corrections': return 'secondary';
      default: return 'outline';
    }
  };

  const getSimilarityBadge = (similarity: number) => {
    const percentage = Math.round(similarity * 100);
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
    
    if (percentage >= 80) variant = 'default';
    else if (percentage >= 60) variant = 'secondary';
    else variant = 'destructive';
    
    return <Badge variant={variant}>{percentage}% similaire</Badge>;
  };

  const totalSelectedItems = Array.from(selectedGroups).reduce((total, groupId) => {
    const group = batchGroups.find(g => g.id === groupId);
    return total + (group ? group.items.length : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* En-tête avec actions globales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Traitement par lot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {batchGroups.length} groupe(s) détecté(s) • {totalSelectedItems} document(s) sélectionné(s)
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedGroups(new Set(batchGroups.map(g => g.id)))}
              >
                Tout sélectionner
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedGroups(new Set())}
              >
                Tout désélectionner
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des groupes */}
      <div className="space-y-4">
        {batchGroups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Aucun groupe de documents similaires détecté
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Les groupes apparaissent quand plusieurs documents ont des caractéristiques similaires
              </p>
            </CardContent>
          </Card>
        ) : (
          batchGroups.map((group) => (
            <Card key={group.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedGroups.has(group.id)}
                    onCheckedChange={() => toggleGroupSelection(group.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{group.name}</h3>
                      {getSimilarityBadge(group.similarity)}
                      <Badge variant="outline">{group.items.length} documents</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {group.commonPattern}
                    </p>

                    {/* Statistiques du groupe */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                        <span>
                          Confiance moyenne: {Math.round(
                            group.items.reduce((sum, item) => sum + item.confidence, 0) / group.items.length
                          )}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span>
                          {group.items.reduce((sum, item) => sum + item.criticalIssuesCount, 0)} problèmes critiques
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span>
                          {group.items.reduce((sum, item) => sum + item.estimatedReviewTime, 0)} min estimées
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGroupExpansion(group.id)}
                  >
                    {expandedGroups.has(group.id) ? 'Réduire' : 'Détails'}
                  </Button>
                </div>
              </CardHeader>

              {/* Actions du groupe */}
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {group.batchActions.map((action) => (
                    <Button
                      key={action.type}
                      size="sm"
                      variant={getActionVariant(action.type)}
                      onClick={() => onBatchAction(group.id, action.type)}
                      disabled={!action.applicable}
                      className="flex items-center gap-2"
                    >
                      {getActionIcon(action.type)}
                      {action.description}
                      <Badge variant="outline" className="ml-1">
                        {action.estimatedTime}min
                      </Badge>
                    </Button>
                  ))}
                </div>

                {/* Liste détaillée des items (si étendu) */}
                {expandedGroups.has(group.id) && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Documents du groupe:</h4>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {group.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-2 border rounded">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{item.title}</div>
                              <div className="text-xs text-muted-foreground">
                                Confiance: {item.confidence}% • 
                                {item.criticalIssuesCount > 0 && (
                                  <span className="text-red-600"> {item.criticalIssuesCount} critiques • </span>
                                )}
                                {item.estimatedReviewTime}min
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {item.priority === 'critical' && (
                                <Badge variant="destructive">Critique</Badge>
                              )}
                              {item.priority === 'high' && (
                                <Badge variant="secondary">Haute</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Actions globales pour les groupes sélectionnés */}
      {selectedGroups.size > 0 && (
        <Card className="border-primary">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">{selectedGroups.size} groupe(s) sélectionné(s)</span>
                <span className="text-muted-foreground ml-2">
                  ({totalSelectedItems} documents)
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    selectedGroups.forEach(groupId => {
                      onBatchAction(groupId, 'approve_all');
                    });
                    setSelectedGroups(new Set());
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver tous
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    selectedGroups.forEach(groupId => {
                      onBatchAction(groupId, 'apply_corrections');
                    });
                    setSelectedGroups(new Set());
                  }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Corriger automatiquement
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BatchApprovalPanel;