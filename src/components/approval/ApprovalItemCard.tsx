import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Clock, 
  AlertTriangle, 
  Eye,
  MessageSquare
} from 'lucide-react';
import { ApprovalItem } from '@/services/approval/approvalItemService';
import { cn } from '@/lib/utils';

interface ApprovalItemCardProps {
  item: ApprovalItem;
  isSelected: boolean;
  onSelect: () => void;
  onApprove: (comments?: string) => void;
  onReject: (reason: string) => void;
  onModify: (fieldName: string, newValue: string, reason: string) => void;
  isLoading: boolean;
}

const ApprovalItemCard: React.FC<ApprovalItemCardProps> = ({
  item,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  onModify,
  isLoading
}) => {
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      default: return 'border-gray-200 bg-white dark:bg-gray-950';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleApprovalSubmit = () => {
    onApprove(approvalComments || undefined);
    setShowApprovalDialog(false);
    setApprovalComments('');
  };

  const handleRejectSubmit = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason);
      setShowRejectDialog(false);
      setRejectionReason('');
    }
  };

  return (
    <>
      <Card 
        className={cn(
          'cursor-pointer transition-all duration-200',
          getPriorityColor(item.priority),
          isSelected && 'ring-2 ring-primary'
        )}
        onClick={onSelect}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{item.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Badge variant="outline" className="text-xs">
                {item.type}
              </Badge>
              {item.priority === 'critical' && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Statistiques compactes */}
          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            <div className="text-center">
              <div className={cn('font-bold', getConfidenceColor(item.confidence))}>
                {item.confidence}%
              </div>
              <div className="text-muted-foreground">Confiance</div>
            </div>
            <div className="text-center">
              <div className="font-bold">
                {item.criticalIssuesCount > 0 ? (
                  <span className="text-red-600">{item.criticalIssuesCount}</span>
                ) : (
                  <span className="text-green-600">0</span>
                )}
              </div>
              <div className="text-muted-foreground">Critiques</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{item.estimatedReviewTime}min</div>
              <div className="text-muted-foreground">Temps</div>
            </div>
          </div>

          {/* Aperçu des champs clés */}
          <div className="space-y-1 mb-3">
            {Object.entries(item.compactData.keyFields).slice(0, 2).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="text-muted-foreground">{key}:</span>
                <span className="ml-1 font-medium">{value}</span>
              </div>
            ))}
          </div>

          {/* Actions rapides */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowApprovalDialog(true);
              }}
              disabled={isLoading || item.criticalIssuesCount > 0}
              className="flex-1"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Approuver
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setShowRejectDialog(true);
              }}
              disabled={isLoading}
              className="flex-1"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Rejeter
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              disabled={isLoading}
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>

          {/* Indicateur de modifications */}
          {item.modifications && item.modifications.length > 0 && (
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              <Edit3 className="h-3 w-3 inline mr-1" />
              {item.modifications.length} modification(s)
            </div>
          )}

          {/* Temps depuis création */}
          <div className="mt-2 text-xs text-muted-foreground flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(item.createdAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Dialog d'approbation */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver le document</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Vous êtes sur le point d'approuver: <strong>{item.title}</strong>
            </div>
            
            <div>
              <label className="text-sm font-medium">Commentaires (optionnel)</label>
              <Textarea
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="Ajoutez des commentaires d'approbation..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleApprovalSubmit} disabled={isLoading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmer l'approbation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de rejet */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le document</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Vous êtes sur le point de rejeter: <strong>{item.title}</strong>
            </div>
            
            <div>
              <label className="text-sm font-medium">Raison du rejet *</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Expliquez pourquoi vous rejetez ce document..."
                rows={3}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectSubmit} 
              disabled={isLoading || !rejectionReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApprovalItemCard;