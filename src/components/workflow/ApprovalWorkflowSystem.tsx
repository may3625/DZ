import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckCircle, XCircle, Clock, AlertCircle, User, 
  FileText, Calendar, MessageSquare, Eye, Edit, 
  ArrowRight, ArrowLeft, RotateCcw, History
} from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  assignee?: string;
  assigneeAvatar?: string;
  dueDate?: Date;
  completedAt?: Date;
  comments?: string[];
  required: boolean;
  order: number;
}

interface WorkflowConfig {
  id: string;
  title: string;
  description: string;
  type: 'legal_text' | 'procedure' | 'news' | 'template';
  steps: WorkflowStep[];
  currentStep: number;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  submittedBy: string;
  submittedByAvatar?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: number; // en heures
}

interface ApprovalWorkflowSystemProps {
  workflow: WorkflowConfig;
  onApprove?: (workflowId: string) => Promise<void>;
  onReject?: (workflowId: string, reason: string) => Promise<void>;
  onComment?: (workflowId: string, stepId: string, comment: string) => Promise<void>;
  onAssign?: (workflowId: string, stepId: string, assignee: string) => Promise<void>;
  readOnly?: boolean;
}

export function ApprovalWorkflowSystem({
  workflow,
  onApprove,
  onReject,
  onComment,
  onAssign,
  readOnly = false
}: ApprovalWorkflowSystemProps) {
  const [currentStep, setCurrentStep] = useState(workflow.currentStep);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  const getStepStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: WorkflowConfig['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkflowTypeIcon = (type: WorkflowConfig['type']) => {
    switch (type) {
      case 'legal_text':
        return <FileText className="h-5 w-5" />;
      case 'procedure':
        return <ArrowRight className="h-5 w-5" />;
      case 'news':
        return <MessageSquare className="h-5 w-5" />;
      case 'template':
        return <Edit className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const calculateProgress = () => {
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length;
    return (completedSteps / workflow.steps.length) * 100;
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    
    setLoading(true);
    try {
      await onApprove(workflow.id);
      toast({
        title: "Approuvé",
        description: "Le workflow a été approuvé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'approbation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!onReject) return;
    
    setLoading(true);
    try {
      await onReject(workflow.id, reason);
      toast({
        title: "Rejeté",
        description: "Le workflow a été rejeté.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du rejet.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (stepId: string) => {
    if (!onComment || !comment.trim()) return;
    
    setLoading(true);
    try {
      await onComment(workflow.id, stepId, comment);
      setComment('');
      setShowCommentForm(false);
      toast({
        title: "Commentaire ajouté",
        description: "Le commentaire a été ajouté avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout du commentaire.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (stepId: string, assignee: string) => {
    if (!onAssign) return;
    
    setLoading(true);
    try {
      await onAssign(workflow.id, stepId, assignee);
      toast({
        title: "Assigné",
        description: "L'étape a été assignée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'assignation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getEstimatedTimeRemaining = () => {
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length;
    const remainingSteps = workflow.steps.length - completedSteps;
    const avgTimePerStep = workflow.estimatedDuration / workflow.steps.length;
    return Math.round(remainingSteps * avgTimePerStep);
  };

  return (
    <div className="space-y-6">
      {/* En-tête du workflow */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getWorkflowTypeIcon(workflow.type)}
              <div>
                <CardTitle className="text-xl">{workflow.title}</CardTitle>
                <CardDescription>{workflow.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(workflow.priority)}>
                {workflow.priority.toUpperCase()}
              </Badge>
              <Badge variant={workflow.status === 'approved' ? 'default' : 'secondary'}>
                {workflow.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Soumis par: {workflow.submittedBy}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Créé le: {formatDate(workflow.createdAt)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Temps restant: ~{getEstimatedTimeRemaining()}h
              </span>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progression</span>
              <span className="text-sm text-gray-500">
                {workflow.steps.filter(s => s.status === 'completed').length} / {workflow.steps.length}
              </span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Étapes du workflow */}
      <div className="space-y-4">
        {workflow.steps.map((step, index) => (
          <Card key={step.id} className={`${step.status === 'in_progress' ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    {getStepStatusIcon(step.status)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{step.name}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStepStatusColor(step.status)}>
                    {step.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {step.required && (
                    <Badge variant="outline">Requis</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {step.assignee && (
                    <div className="flex items-center space-x-2 mb-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={step.assigneeAvatar} />
                        <AvatarFallback>{step.assignee.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">
                        Assigné à: {step.assignee}
                      </span>
                    </div>
                  )}
                  
                  {step.dueDate && (
                    <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Échéance: {formatDate(step.dueDate)}
                      </span>
                    </div>
                  )}
                  
                  {step.completedAt && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">
                        Terminé le: {formatDate(step.completedAt)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {!readOnly && step.status === 'in_progress' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove()}
                        disabled={loading}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject('Rejeté par l\'utilisateur')}
                        disabled={loading}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveStepId(activeStepId === step.id ? null : step.id);
                      setShowCommentForm(activeStepId === step.id ? false : true);
                    }}
                    className="w-full"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {step.comments && step.comments.length > 0 
                      ? `${step.comments.length} commentaire(s)`
                      : 'Ajouter un commentaire'
                    }
                  </Button>
                </div>
              </div>
              
              {/* Formulaire de commentaire */}
              {activeStepId === step.id && showCommentForm && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      className="w-full p-2 border rounded-md resize-none"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(step.id)}
                        disabled={loading || !comment.trim()}
                      >
                        Ajouter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setComment('');
                          setShowCommentForm(false);
                          setActiveStepId(null);
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Commentaires existants */}
              {step.comments && step.comments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Commentaires:</h4>
                  {step.comments.map((comment, commentIndex) => (
                    <div key={commentIndex} className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">{comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions globales */}
      {!readOnly && workflow.status === 'in_review' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">
                  Actions disponibles pour ce workflow
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleApprove()}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver le workflow
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject('Rejeté globalement')}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter le workflow
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Hook pour utiliser le système de workflow
export function useApprovalWorkflow() {
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);
  const [loading, setLoading] = useState(false);

  const createWorkflow = useCallback(async (config: Omit<WorkflowConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      const newWorkflow: WorkflowConfig = {
        ...config,
        id: `workflow-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setWorkflows(prev => [...prev, newWorkflow]);
      logger.info('WORKFLOW', 'Workflow créé', { workflowId: newWorkflow.id }, 'ApprovalWorkflow');
      
      return newWorkflow;
    } catch (error) {
      logger.error('WORKFLOW', 'Erreur lors de la création du workflow', { error }, 'ApprovalWorkflow');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWorkflow = useCallback(async (workflowId: string, updates: Partial<WorkflowConfig>) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, ...updates, updatedAt: new Date() }
        : w
    ));
  }, []);

  const deleteWorkflow = useCallback(async (workflowId: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== workflowId));
  }, []);

  return {
    workflows,
    loading,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow
  };
}