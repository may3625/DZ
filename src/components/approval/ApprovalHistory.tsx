// Composant pour afficher l'historique d'approbation

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Eye, 
  UserPlus,
  FileText
} from 'lucide-react';
import { ApprovalHistory as ApprovalHistoryType } from '@/types/approval';
import { ApprovalWorkflowService } from '@/services/approvalWorkflowService';

interface ApprovalHistoryProps {
  itemId: string;
}

export function ApprovalHistory({ itemId }: ApprovalHistoryProps) {
  const [history, setHistory] = useState<ApprovalHistoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [itemId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await ApprovalWorkflowService.getItemHistory(itemId);
      setHistory(historyData);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'submitted':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'assigned':
        return <UserPlus className="h-4 w-4 text-indigo-500" />;
      case 'status_changed':
      case 'updated':
        return <Edit className="h-4 w-4 text-amber-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'reviewed':
        return <Eye className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionLabel = (action: string): string => {
    const labels = {
      submitted: 'Soumis',
      assigned: 'Assigné',
      status_changed: 'Statut modifié',
      updated: 'Mis à jour',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      reviewed: 'Révisé',
      modified: 'Modifié'
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (action) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'submitted':
      case 'assigned':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
          <CardDescription>
            Aucun historique disponible pour cet élément
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            L'historique sera disponible une fois que des actions auront été effectuées.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des actions</CardTitle>
        <CardDescription>
          Chronologie des actions effectuées sur cet élément
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div key={entry.id}>
              <div className="flex items-start gap-3">
                {/* Icône d'action */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                  {getActionIcon(entry.action)}
                </div>
                
                {/* Contenu */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getActionColor(entry.action)}>
                      {getActionLabel(entry.action)}
                    </Badge>
                    
                    {entry.previous_status && entry.new_status && (
                      <span className="text-sm text-muted-foreground">
                        {entry.previous_status} → {entry.new_status}
                      </span>
                    )}
                    
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                  
                  {entry.actor_id && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Par: {entry.actor_id}</span>
                    </div>
                  )}
                  
                  {entry.comment && (
                    <div className="bg-muted/50 border rounded p-2 text-sm">
                      <strong>Commentaire:</strong> {entry.comment}
                    </div>
                  )}
                  
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Métadonnées techniques
                      </summary>
                      <pre className="mt-2 bg-muted/30 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(entry.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
              
              {/* Séparateur */}
              {index < history.length - 1 && (
                <div className="ml-4 mt-4">
                  <Separator orientation="vertical" className="h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}