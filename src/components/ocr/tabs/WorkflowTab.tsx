import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Send,
  Download,
  FileText,
  User,
  Calendar,
  MessageSquare,
  Workflow
} from 'lucide-react';
import { useOCRWorkflowStore } from '@/stores/ocrWorkflowStore';
import { toast } from 'sonner';

export function WorkflowTab() {
  const { 
    extractionData, 
    mappingData, 
    validationData,
    workflowData,
    setWorkflowData,
    canAccessStep, 
    resetWorkflow,
    goToStep 
  } = useOCRWorkflowStore();
  
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | 'needs_review'>('pending');
  const [comments, setComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = useCallback(async () => {
    if (!extractionData || !mappingData || !validationData) return;

    setIsProcessing(true);
    console.log('✅ [WorkflowTab] Début de l\'approbation');

    try {
      // Construire les données finales
      const finalData = {
        // Métadonnées du document
        document: {
          fileName: extractionData.fileName,
          fileSize: extractionData.fileSize,
          fileType: extractionData.fileType,
          extractedAt: extractionData.extractedAt
        },
        
        // Données OCR
        ocr: {
          text: extractionData.ocrResult.text,
          confidence: extractionData.ocrResult.confidence,
          language: extractionData.ocrResult.language,
          documentType: extractionData.ocrResult.documentType,
          entities: extractionData.ocrResult.entities
        },
        
        // Données mappées
        mapping: {
          ...mappingData.mappedFields,
          mappingConfidence: mappingData.confidence,
          formType: mappingData.formType
        },
        
        // Validation
        validation: {
          isValid: validationData.isValid,
          warnings: validationData.warnings,
          errors: validationData.errors,
          reviewedAt: validationData.reviewedAt
        }
      };

      const workflowResult = {
        status: 'approved' as const,
        approvedBy: 'Utilisateur système',
        approvedAt: new Date(),
        comments: comments.trim() || 'Approuvé automatiquement',
        finalData
      };

      setWorkflowData(workflowResult);
      toast.success('Document approuvé et finalisé avec succès !');
      console.log('✅ [WorkflowTab] Approbation terminée:', workflowResult);

    } catch (error) {
      console.error('❌ [WorkflowTab] Erreur lors de l\'approbation:', error);
      toast.error('Erreur lors de l\'approbation');
    } finally {
      setIsProcessing(false);
    }
  }, [extractionData, mappingData, validationData, comments, setWorkflowData]);

  const handleReject = useCallback(async () => {
    if (!comments.trim()) {
      toast.error('Veuillez ajouter un commentaire pour expliquer le rejet');
      return;
    }

    setIsProcessing(true);
    console.log('❌ [WorkflowTab] Début du rejet');

    try {
      const workflowResult = {
        status: 'rejected' as const,
        approvedBy: 'Utilisateur système',
        approvedAt: new Date(),
        comments: comments.trim(),
        finalData: {}
      };

      setWorkflowData(workflowResult);
      toast.error('Document rejeté');
      console.log('❌ [WorkflowTab] Rejet enregistré:', workflowResult);

    } catch (error) {
      console.error('❌ [WorkflowTab] Erreur lors du rejet:', error);
      toast.error('Erreur lors du rejet');
    } finally {
      setIsProcessing(false);
    }
  }, [comments, setWorkflowData]);

  const handleNeedsReview = useCallback(async () => {
    if (!comments.trim()) {
      toast.error('Veuillez ajouter un commentaire pour expliquer ce qui nécessite une révision');
      return;
    }

    setIsProcessing(true);
    console.log('⚠️ [WorkflowTab] Marquage pour révision');

    try {
      const workflowResult = {
        status: 'needs_review' as const,
        approvedBy: 'Utilisateur système',
        approvedAt: new Date(),
        comments: comments.trim(),
        finalData: {}
      };

      setWorkflowData(workflowResult);
      toast.warning('Document marqué comme nécessitant une révision');
      console.log('⚠️ [WorkflowTab] Révision requise:', workflowResult);

    } catch (error) {
      console.error('❌ [WorkflowTab] Erreur lors du marquage:', error);
      toast.error('Erreur lors du marquage pour révision');
    } finally {
      setIsProcessing(false);
    }
  }, [comments, setWorkflowData]);

  const exportFinalData = useCallback(() => {
    if (!workflowData?.finalData) return;

    const jsonData = JSON.stringify(workflowData.finalData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document_finalise_${extractionData?.fileName?.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Données exportées avec succès');
  }, [workflowData, extractionData]);

  const startNewWorkflow = useCallback(() => {
    resetWorkflow();
    toast.info('Nouveau workflow démarré');
  }, [resetWorkflow]);

  if (!canAccessStep('workflow')) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6 text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
          <p className="text-orange-700">
            Veuillez d'abord compléter toutes les étapes précédentes.
          </p>
          <Button 
            onClick={() => goToStep('validation')} 
            variant="outline" 
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la Validation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête du workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            Workflow d'Approbation Finale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Toutes les étapes d'extraction, mapping et validation sont terminées. 
              Vous pouvez maintenant approuver, rejeter ou marquer le document pour révision.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Extraction</span>
              </div>
              <p className="text-xs text-green-700">
                {extractionData?.ocrResult.text.length.toLocaleString()} caractères extraits
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Mapping</span>
              </div>
              <p className="text-xs text-blue-700">
                {mappingData && Math.round(mappingData.confidence)}% de confiance
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Validation</span>
              </div>
              <p className="text-xs text-purple-700">
                {validationData?.isValid ? 'Validé' : 'Avec avertissements'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* État actuel ou résultat */}
      {workflowData ? (
        <Card className={
          workflowData.status === 'approved' 
            ? "border-green-200 bg-green-50" 
            : workflowData.status === 'rejected'
            ? "border-red-200 bg-red-50"
            : "border-orange-200 bg-orange-50"
        }>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${
              workflowData.status === 'approved' 
                ? "text-green-800" 
                : workflowData.status === 'rejected'
                ? "text-red-800"
                : "text-orange-800"
            }`}>
              {workflowData.status === 'approved' && <CheckCircle className="w-5 h-5" />}
              {workflowData.status === 'rejected' && <XCircle className="w-5 h-5" />}
              {workflowData.status === 'needs_review' && <Clock className="w-5 h-5" />}
              
              {workflowData.status === 'approved' && 'Document Approuvé'}
              {workflowData.status === 'rejected' && 'Document Rejeté'}
              {workflowData.status === 'needs_review' && 'Révision Requise'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-muted-foreground">Traité par:</span>
                  <span className="font-medium">{workflowData.approvedBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {workflowData.approvedAt?.toLocaleDateString()} à {workflowData.approvedAt?.toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {workflowData.comments && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">Commentaires:</span>
                  </div>
                  <p className="text-sm bg-white p-3 rounded border">
                    {workflowData.comments}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                {workflowData.status === 'approved' && (
                  <Button onClick={exportFinalData}>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter les Données Finales
                  </Button>
                )}
                
                <Button onClick={startNewWorkflow} variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Nouveau Document
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Décision d'Approbation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Commentaires (optionnel pour approbation, obligatoire pour rejet/révision)
              </label>
              <Textarea
                placeholder="Ajoutez vos commentaires ou observations..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approuver
              </Button>

              <Button 
                onClick={handleNeedsReview}
                disabled={isProcessing || !comments.trim()}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Clock className="w-4 h-4 mr-2" />
                Révision Requise
              </Button>

              <Button 
                onClick={handleReject}
                disabled={isProcessing || !comments.trim()}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejeter
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              * Le rejet et la demande de révision nécessitent un commentaire explicatif
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Button 
              onClick={() => goToStep('validation')}
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la Validation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}