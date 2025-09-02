/**
 * Modal d'approbation pour workflows de validation
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  MessageSquare,
  Clock,
  User,
  FileText
} from 'lucide-react';
import { ApprovalModalConfig } from '../types';

interface ApprovalModalProps {
  config: ApprovalModalConfig;
  onClose: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ config, onClose }) => {
  const [comment, setComment] = useState('');
  const [changes, setChanges] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await config.onApprove(config.item, comment);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await config.onReject(config.item, comment);
      onClose();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestChanges = async () => {
    if (isProcessing || !config.onRequestChanges) return;
    
    setIsProcessing(true);
    try {
      await config.onRequestChanges(config.item, changes);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la demande de modifications:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepStatus = (step: any) => {
    if (step.isComplete) return 'completed';
    if (step.required) return 'required';
    return 'optional';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'required':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'requested_changes':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      case 'requested_changes': return 'Modifications demandées';
      case 'submitted': return 'Soumis';
      default: return action;
    }
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="review" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="review">Révision</TabsTrigger>
          <TabsTrigger value="steps">Étapes</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4 p-6">
          {/* Détails de l'élément à approuver */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Élément à réviser
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>ID:</strong> {config.item.id}</div>
                <div><strong>Titre:</strong> {config.item.title}</div>
                <div><strong>Type:</strong> {config.item.type}</div>
                <div><strong>Statut:</strong> 
                  <Badge variant="outline" className="ml-2">
                    {config.item.status}
                  </Badge>
                </div>
                {config.item.description && (
                  <div><strong>Description:</strong> {config.item.description}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions d'approbation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Commentaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Ajouter des commentaires (optionnel)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              
              {config.onRequestChanges && (
                <Textarea
                  placeholder="Décrire les modifications demandées..."
                  value={changes}
                  onChange={(e) => setChanges(e.target.value)}
                  rows={3}
                />
              )}
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Annuler
            </Button>
            
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Rejeter
            </Button>
            
            {config.onRequestChanges && (
              <Button
                variant="outline"
                onClick={handleRequestChanges}
                disabled={isProcessing || !changes.trim()}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Demander des modifications
              </Button>
            )}
            
            <Button 
              onClick={handleApprove}
              disabled={isProcessing}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approuver
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="steps" className="space-y-4 p-6">
          <div className="space-y-3">
            {config.approvalSteps.map((step, index) => {
              const status = getStepStatus(step);
              
              return (
                <Card key={step.id} className={step.isComplete ? 'bg-green-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {getStepIcon(status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{step.title}</h4>
                          <Badge variant={step.required ? 'destructive' : 'secondary'}>
                            {step.required ? 'Requis' : 'Optionnel'}
                          </Badge>
                        </div>
                        {step.description && (
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 p-6">
          {config.history && config.history.length > 0 ? (
            <div className="space-y-3">
              {config.history.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getActionIcon(entry.action)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{entry.user}</span>
                          <Badge variant="outline">
                            {getActionLabel(entry.action)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        {entry.comment && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {entry.comment}
                          </p>
                        )}
                        {entry.changes && entry.changes.length > 0 && (
                          <div className="text-xs">
                            <span className="font-medium">Modifications:</span>
                            <ul className="list-disc list-inside ml-2">
                              {entry.changes.map((change, index) => (
                                <li key={index}>{change}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucun historique d'approbation disponible
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};