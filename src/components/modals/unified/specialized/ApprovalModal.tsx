import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Clock, 
  User, 
  MessageSquare,
  Loader2,
  History,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ApprovalStep {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  validator?: (item: any) => boolean | Promise<boolean>;
  isComplete?: boolean;
  completedBy?: string;
  completedAt?: Date;
}

export interface ApprovalHistoryEntry {
  id: string;
  action: 'approved' | 'rejected' | 'requested_changes' | 'submitted';
  user: string;
  timestamp: Date;
  comment?: string;
  changes?: string[];
}

export interface ApprovalModalProps {
  title: string;
  description?: string;
  item: any;
  approvalSteps: ApprovalStep[];
  currentStep?: number;
  onApprove: (item: any, comment?: string) => void | Promise<void>;
  onReject: (item: any, reason?: string) => void | Promise<void>;
  onRequestChanges?: (item: any, changes: string) => void | Promise<void>;
  history?: ApprovalHistoryEntry[];
  canApprove?: boolean;
  canReject?: boolean;
  canRequestChanges?: boolean;
  size?: 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

const actionConfig = {
  approved: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  requested_changes: {
    icon: Edit3,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  submitted: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
};

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  title,
  description,
  item,
  approvalSteps,
  currentStep = 0,
  onApprove,
  onReject,
  onRequestChanges,
  history = [],
  canApprove = true,
  canReject = true,
  canRequestChanges = true,
  size = 'lg',
  className,
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | 'changes' | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = useCallback(async (actionType: 'approve' | 'reject' | 'changes') => {
    if (!comment.trim() && actionType !== 'approve') {
      return; // Commentaire requis pour reject et changes
    }

    try {
      setLoading(true);
      
      switch (actionType) {
        case 'approve':
          await onApprove(item, comment.trim() || undefined);
          break;
        case 'reject':
          await onReject(item, comment);
          break;
        case 'changes':
          if (onRequestChanges) {
            await onRequestChanges(item, comment);
          }
          break;
      }
    } catch (error) {
      console.error('Erreur lors de l\'action d\'approbation:', error);
    } finally {
      setLoading(false);
    }
  }, [action, comment, item, onApprove, onReject, onRequestChanges]);

  const getStepStatus = (step: ApprovalStep) => {
    if (step.isComplete) return 'completed';
    if (step.id === approvalSteps[currentStep]?.id) return 'current';
    return 'pending';
  };

  const getStepIcon = (step: ApprovalStep) => {
    const status = getStepStatus(step);
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'current':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={cn('p-0 overflow-hidden', sizeClasses[size], className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 flex-1 overflow-y-auto max-h-[600px]">
        <div className="space-y-6">
          {/* Item Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Élément à approuver</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600">{key}:</span>
                    <span className="text-gray-900">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Approval Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Étapes d'approbation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {approvalSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    {getStepIcon(step)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={cn(
                          "text-sm font-medium",
                          getStepStatus(step) === 'current' ? 'text-blue-600' : 
                          getStepStatus(step) === 'completed' ? 'text-green-600' : 'text-gray-500'
                        )}>
                          {step.title}
                        </span>
                        {step.required && (
                          <Badge variant="secondary" className="text-xs">Requis</Badge>
                        )}
                      </div>
                      {step.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      )}
                      {step.isComplete && step.completedBy && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Approuvé par {step.completedBy} le {formatDate(step.completedAt!)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Approval History */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  Historique des actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((entry) => {
                    const config = actionConfig[entry.action];
                    const IconComponent = config.icon;
                    
                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          "p-3 rounded-md border",
                          config.bgColor,
                          config.borderColor
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <IconComponent className={cn("w-4 h-4 mt-0.5", config.color)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={cn("text-sm font-medium", config.color)}>
                                {entry.action === 'approved' ? 'Approuvé' :
                                 entry.action === 'rejected' ? 'Rejeté' :
                                 entry.action === 'requested_changes' ? 'Modifications demandées' :
                                 'Soumis'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                par {entry.user}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(entry.timestamp)}
                              </span>
                            </div>
                            {entry.comment && (
                              <p className="text-sm text-gray-700 mt-1">
                                {entry.comment}
                              </p>
                            )}
                            {entry.changes && entry.changes.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-600 mb-1">
                                  Modifications demandées:
                                </p>
                                <ul className="text-xs text-gray-700 space-y-1">
                                  {entry.changes.map((change, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                      <span className="text-gray-500">•</span>
                                      <span>{change}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Action d'approbation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {canApprove && (
                    <Button
                      variant="outline"
                      onClick={() => setAction('approve')}
                      className={cn(
                        "flex-1",
                        action === 'approve' && "border-green-500 text-green-600"
                      )}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approuver
                    </Button>
                  )}
                  
                  {canReject && (
                    <Button
                      variant="outline"
                      onClick={() => setAction('reject')}
                      className={cn(
                        "flex-1",
                        action === 'reject' && "border-red-500 text-red-600"
                      )}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                  )}
                  
                  {canRequestChanges && onRequestChanges && (
                    <Button
                      variant="outline"
                      onClick={() => setAction('changes')}
                      className={cn(
                        "flex-1",
                        action === 'changes' && "border-yellow-500 text-yellow-600"
                      )}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Demander des modifications
                    </Button>
                  )}
                </div>

                {/* Comment Input */}
                {action && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {action === 'approve' ? 'Commentaire (optionnel)' :
                       action === 'reject' ? 'Raison du rejet *' :
                       'Modifications demandées *'}
                    </label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={
                        action === 'approve' ? 'Ajouter un commentaire...' :
                        action === 'reject' ? 'Expliquer la raison du rejet...' :
                        'Décrire les modifications demandées...'
                      }
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                )}

                {/* Submit Button */}
                {action && (
                  <Button
                    onClick={() => handleAction(action)}
                    disabled={loading || (!comment.trim() && action !== 'approve')}
                    className="w-full"
                    variant={
                      action === 'approve' ? 'default' :
                      action === 'reject' ? 'destructive' : 'default'
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        {action === 'approve' ? 'Approuver' :
                         action === 'reject' ? 'Rejeter' : 'Demander des modifications'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};