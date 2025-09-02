import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  FileText,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Edit3
} from 'lucide-react';
import { AlgerianExtractionResult } from '@/services/enhanced/algerianDocumentExtractionService';
import { MappingResult, MappedField } from '@/types/mapping';
import { ApprovalWorkflowService } from '@/services/approvalWorkflowService';
import { algerianLegalRegexService } from '@/services/enhanced/algerianLegalRegexService';
import { logger } from '@/utils/logger';

interface ValidationTabProps {
  extractedDocument: AlgerianExtractionResult | null;
  mappingResult: MappingResult | null;
  onValidationComplete: () => void;
}

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  suggestion?: string;
}

export function ValidationTab({ extractedDocument, mappingResult, onValidationComplete }: ValidationTabProps) {
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [editingFields, setEditingFields] = useState<Record<string, string>>({});
  const [approvalItem, setApprovalItem] = useState<any>(null);

  useEffect(() => {
    if (extractedDocument && mappingResult) {
      performValidation();
    }
  }, [extractedDocument, mappingResult]);

  const performValidation = async () => {
    if (!extractedDocument || !mappingResult) return;

    setIsValidating(true);
    const issues: ValidationIssue[] = [];

    try {
      // Validation de la confiance OCR
      if ((extractedDocument?.metadata?.averageConfidence || 0) < 0.7) {
        issues.push({
          type: 'warning',
          field: 'ocr_confidence',
          message: `Confiance OCR faible (${Math.round((extractedDocument?.metadata?.averageConfidence || 0) * 100)}%)`,
          suggestion: 'Vérifiez la qualité du document source'
        });
      }

      // Validation des champs mappés
      mappingResult.mappedFields.forEach(field => {
        if (field.confidence < 0.5) {
          issues.push({
            type: 'warning',
            field: field.fieldName,
            message: `Confiance de mapping faible pour "${field.fieldLabel}"`,
            suggestion: 'Vérifiez et corrigez la valeur si nécessaire'
          });
        }

        if (!field.mappedValue && field.confidence > 0.7) {
          issues.push({
            type: 'error',
            field: field.fieldName,
            message: `Champ obligatoire "${field.fieldLabel}" non rempli`,
            suggestion: 'Saisissez une valeur pour ce champ'
          });
        }

        // Validation spécifique des dates
        if (field.fieldName.includes('date') && field.mappedValue) {
          const dateValue = field.mappedValue;
          if (!/\d{4}-\d{2}-\d{2}/.test(dateValue) && !/\d{2}\/\d{2}\/\d{4}/.test(dateValue)) {
            issues.push({
              type: 'error',
              field: field.fieldName,
              message: `Format de date invalide pour "${field.fieldLabel}"`,
              suggestion: 'Utilisez le format DD/MM/YYYY ou YYYY-MM-DD'
            });
          }
        }

        // Validation des numéros
        if (field.fieldName.includes('numero') && field.mappedValue) {
          if (field.mappedValue.length < 3) {
            issues.push({
              type: 'warning',
              field: field.fieldName,
              message: `Numéro très court pour "${field.fieldLabel}"`,
              suggestion: 'Vérifiez que le numéro est complet'
            });
          }
        }
      });

      // Validation des champs non mappés critiques
      const criticalFields = ['numero', 'date', 'objet', 'institution'];
      mappingResult.unmappedFields.forEach(fieldName => {
        if (criticalFields.some(critical => fieldName.toLowerCase().includes(critical))) {
          issues.push({
            type: 'error',
            field: fieldName,
            message: `Champ critique "${fieldName}" non mappé`,
            suggestion: 'Ce champ doit être rempli manuellement'
          });
        }
      });

      // Validation de la complétude
      const completenessRate = mappingResult.mappedCount / mappingResult.totalFields;
      if (completenessRate < 0.8) {
        issues.push({
          type: 'warning',
          field: 'completeness',
          message: `Taux de complétude faible (${Math.round(completenessRate * 100)}%)`,
          suggestion: 'Plusieurs champs importants ne sont pas remplis'
        });
      }

      setValidationIssues(issues);

      // Créer l'item d'approbation
      const structuredPublication = await algerianLegalRegexService.processText(extractedDocument?.extractedText || '');
      const approval = await ApprovalWorkflowService.submitForApproval(
        'mapping_result',
        'Résultat de mapping',
        'Résultat de mapping pour validation',
        mappingResult.mappedData || {},
        mappingResult,
        'medium'
      );
      setApprovalItem(approval);

    } catch (error) {
      logger.error('VALIDATION', 'Erreur validation:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleFieldEdit = (fieldName: string, value: string) => {
    setEditingFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const saveFieldEdit = (fieldName: string) => {
    // Logique pour sauvegarder les modifications
    // Cela devrait mettre à jour le mappingResult
    logger.info('VALIDATION', 'Sauvegarde champ édité:', { fieldName, value: editingFields[fieldName] });
    
    const newEditingFields = { ...editingFields };
    delete newEditingFields[fieldName];
    setEditingFields(newEditingFields);
  };

  const revalidate = () => {
    performValidation();
  };

  const handleApprove = async () => {
    try {
      if (approvalItem) {
        await ApprovalWorkflowService.approveItem(approvalItem.id);
      }
      // Appeler onValidationComplete immédiatement pour passer au résultat
      onValidationComplete();
    } catch (error) {
      logger.error('VALIDATION', 'Erreur approbation:', error);
      // Même en cas d'erreur, on passe au résultat
      onValidationComplete();
    }
  };

  const completeValidation = () => {
    // Fonction pour forcer la transition vers les résultats
    onValidationComplete();
  };

  const handleReject = async () => {
    if (!approvalItem) return;

    try {
      await ApprovalWorkflowService.rejectItem(approvalItem.id, 'Validation manuelle rejetée');
    } catch (error) {
      logger.error('VALIDATION', 'Erreur rejet:', error);
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const getIssueVariant = (type: string): "destructive" | "default" => {
    return type === 'error' ? 'destructive' : 'default';
  };

  if (!extractedDocument || !mappingResult) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Veuillez d'abord compléter l'extraction et le mapping</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Phase 3: Validation et Diagnostic
            </div>
            <Button onClick={revalidate} variant="outline" size="sm" disabled={isValidating}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
              Revalider
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {validationIssues.filter(i => i.type === 'error').length}
              </div>
              <div className="text-sm text-gray-600">Erreurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {validationIssues.filter(i => i.type === 'warning').length}
              </div>
              <div className="text-sm text-gray-600">Avertissements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {validationIssues.length === 0 ? '✓' : Math.round((1 - validationIssues.filter(i => i.type === 'error').length / validationIssues.length) * 100) + '%'}
              </div>
              <div className="text-sm text-gray-600">Score de qualité</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues de validation */}
      {validationIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Problèmes Détectés ({validationIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validationIssues.map((issue, index) => (
                <Alert key={index} variant={getIssueVariant(issue.type)}>
                  <div className="flex items-start gap-3">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="font-medium">{issue.message}</div>
                        {issue.suggestion && (
                          <div className="text-sm text-gray-600 mt-1">
                            💡 {issue.suggestion}
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Correction inline des champs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Correction des Champs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mappingResult.mappedFields.map((field, index) => (
              <div key={index} className="space-y-2">
                <Label>{field.fieldLabel}</Label>
                <div className="flex gap-2">
                  <Input
                    value={editingFields[field.fieldName] !== undefined 
                      ? editingFields[field.fieldName] 
                      : (field.mappedValue || '')
                    }
                    onChange={(e) => handleFieldEdit(field.fieldName, e.target.value)}
                    className="flex-1"
                  />
                  {editingFields[field.fieldName] !== undefined && (
                    <Button
                      size="sm"
                      onClick={() => saveFieldEdit(field.fieldName)}
                    >
                      ✓
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Badge variant="outline" className="text-xs">
                    {Math.round(field.confidence * 100)}%
                  </Badge>
                  {field.isAccepted && <span className="text-green-600">✓ Accepté</span>}
                  {field.isEdited && <span className="text-blue-600">✎ Édité</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions d'approbation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Workflow d'Approbation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvalItem ? (
            <div className="space-y-4">
              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-medium mb-2">Item d'Approbation Créé</h4>
                <div className="text-sm text-gray-600">
                  <div>Type: {approvalItem.documentType}</div>
                  <div>Champs mappés: {Object.keys(approvalItem.mappedData || {}).length}</div>
                  <div>Créé: {new Date(approvalItem.createdAt).toLocaleString()}</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={handleApprove} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approuver et Enregistrer
                </Button>
                <Button 
                  onClick={handleReject} 
                  variant="outline"
                  className="flex-1"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Rejeter
                </Button>
              </div>
              
              {/* Bouton de force pour transition */}
              <div className="mt-4 pt-4 border-t">
                <Button 
                  onClick={completeValidation}
                  variant="default"
                  className="w-full"
                >
                  Continuer vers les Résultats
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-600">
              Création de l'item d'approbation en cours...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}