// Composant pour les actions d'approbation (Approuver/Rejeter/Modifier)

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Edit, AlertTriangle } from 'lucide-react';
import { ApprovalItem } from '@/types/approval';

interface ApprovalActionsProps {
  item: ApprovalItem;
  onApprove: (itemId: string, comment?: string) => Promise<void>;
  onReject: (itemId: string, reason: string) => Promise<void>;
  onRequestModification: (itemId: string, notes: string) => Promise<void>;
  loading: boolean;
}

export function ApprovalActions({ 
  item, 
  onApprove, 
  onReject, 
  onRequestModification, 
  loading 
}: ApprovalActionsProps) {
  const [action, setAction] = useState<'approve' | 'reject' | 'modify' | null>(null);
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');
  const [modificationNotes, setModificationNotes] = useState('');

  const handleApprove = async () => {
    await onApprove(item.id, comment);
    resetForm();
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    await onReject(item.id, reason);
    resetForm();
  };

  const handleRequestModification = async () => {
    if (!modificationNotes.trim()) return;
    await onRequestModification(item.id, modificationNotes);
    resetForm();
  };

  const resetForm = () => {
    setAction(null);
    setComment('');
    setReason('');
    setModificationNotes('');
  };

  const canTakeAction = item.status === 'pending' || item.status === 'under_review';

  if (!canTakeAction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Actions non disponibles
          </CardTitle>
          <CardDescription>
            Cet élément a déjà été traité (statut: {item.status})
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Actions d'approbation</CardTitle>
          <CardDescription>
            Choisissez une action à effectuer sur cet élément
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!action ? (
            // Boutons de sélection d'action
            <div className="grid gap-3">
              <Button
                onClick={() => setAction('approve')}
                className="w-full justify-start bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approuver
              </Button>
              
              <Button
                onClick={() => setAction('modify')}
                variant="outline"
                className="w-full justify-start"
                disabled={loading}
              >
                <Edit className="mr-2 h-4 w-4" />
                Demander des modifications
              </Button>
              
              <Button
                onClick={() => setAction('reject')}
                variant="destructive"
                className="w-full justify-start"
                disabled={loading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rejeter
              </Button>
            </div>
          ) : (
            // Formulaires d'action
            <div className="space-y-4">
              {action === 'approve' && (
                <div className="space-y-3">
                  <Label htmlFor="approval-comment">Commentaire (optionnel)</Label>
                  <Textarea
                    id="approval-comment"
                    placeholder="Ajoutez un commentaire sur cette approbation..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleApprove}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirmer l'approbation
                    </Button>
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      disabled={loading}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}

              {action === 'reject' && (
                <div className="space-y-3">
                  <Label htmlFor="rejection-reason">
                    Raison du rejet <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Expliquez pourquoi cet élément est rejeté..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    required
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleReject}
                      disabled={loading || !reason.trim()}
                      variant="destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Confirmer le rejet
                    </Button>
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      disabled={loading}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}

              {action === 'modify' && (
                <div className="space-y-3">
                  <Label htmlFor="modification-notes">
                    Notes de modification <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="modification-notes"
                    placeholder="Décrivez les modifications nécessaires..."
                    value={modificationNotes}
                    onChange={(e) => setModificationNotes(e.target.value)}
                    rows={4}
                    required
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRequestModification}
                      disabled={loading || !modificationNotes.trim()}
                      variant="outline"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Demander des modifications
                    </Button>
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      disabled={loading}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations additionnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informations sur l'élément</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span>{item.item_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Priorité:</span>
            <span className="capitalize">{item.priority}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Soumis le:</span>
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
          {item.due_date && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Échéance:</span>
              <span className={new Date(item.due_date) < new Date() ? 'text-destructive' : ''}>
                {new Date(item.due_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}