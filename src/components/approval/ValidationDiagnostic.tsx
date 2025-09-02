import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Edit3, 
  RefreshCw,
  Zap,
  Eye,
  Search
} from 'lucide-react';
import { ApprovalItem } from '@/services/approval/approvalItemService';
import { ValidationIssue } from '@/services/validation/validationService';
import { validationService } from '@/services/validation/validationService';
import { MappedField } from '@/types/mapping';
import { cn } from '@/lib/utils';

interface ValidationDiagnosticProps {
  item: ApprovalItem;
  onFieldModify: (fieldName: string, newValue: string, reason: string) => void;
}

const ValidationDiagnostic: React.FC<ValidationDiagnosticProps> = ({
  item,
  onFieldModify
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingField, setEditingField] = useState<MappedField | null>(null);
  const [newValue, setNewValue] = useState('');
  const [editReason, setEditReason] = useState('');
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [validationResult, setValidationResult] = useState(item.validationResult);
  const [showSourceText, setShowSourceText] = useState(false);

  const getIssueSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getIssueSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      warning: 'secondary',
      info: 'outline'
    } as const;
    
    return <Badge variant={variants[severity as keyof typeof variants] || 'outline'}>{severity}</Badge>;
  };

  /**
   * Revalidation sans refaire l'OCR
   */
  const handleRevalidate = async () => {
    setIsRevalidating(true);
    try {
      const newValidationResult = validationService.revalidate(
        item.mappingResult,
        item.extractedText
      );
      setValidationResult(newValidationResult);
    } catch (error) {
      console.error('Erreur lors de la revalidation:', error);
    } finally {
      setIsRevalidating(false);
    }
  };

  /**
   * Correction automatique des problèmes
   */
  const handleAutoFix = async () => {
    setIsRevalidating(true);
    try {
      const fixedResult = validationService.autoFixIssues(
        item.mappingResult,
        validationResult.issues
      );
      
      // Revalidation après correction
      const newValidationResult = validationService.revalidate(
        fixedResult,
        item.extractedText
      );
      
      setValidationResult(newValidationResult);
    } catch (error) {
      console.error('Erreur lors de la correction automatique:', error);
    } finally {
      setIsRevalidating(false);
    }
  };

  /**
   * Ouverture du dialog d'édition
   */
  const openEditDialog = (field: MappedField) => {
    setEditingField(field);
    setNewValue(field.mappedValue || '');
    setEditReason('');
    setShowEditDialog(true);
  };

  /**
   * Soumission de l'édition
   */
  const handleEditSubmit = () => {
    if (editingField && newValue.trim() && editReason.trim()) {
      onFieldModify(editingField.fieldName, newValue.trim(), editReason.trim());
      setShowEditDialog(false);
      setEditingField(null);
      setNewValue('');
      setEditReason('');
    }
  };

  const getFieldConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const autoFixableIssues = validationResult.issues.filter(issue => issue.autoFixable);

  return (
    <div className="space-y-4">
      {/* En-tête avec actions globales */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Diagnostic de Validation
            </CardTitle>
            <div className="flex gap-2">
              {autoFixableIssues.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAutoFix}
                  disabled={isRevalidating}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Correction auto ({autoFixableIssues.length})
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleRevalidate}
                disabled={isRevalidating}
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', isRevalidating && 'animate-spin')} />
                Revalider
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSourceText(!showSourceText)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Source
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={cn('text-2xl font-bold', getFieldConfidenceColor(validationResult.score))}>
                {validationResult.score}%
              </div>
              <div className="text-sm text-muted-foreground">Score global</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {validationResult.issues.filter(i => i.severity === 'critical').length}
              </div>
              <div className="text-sm text-muted-foreground">Critiques</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {validationResult.issues.filter(i => i.severity === 'warning').length}
              </div>
              <div className="text-sm text-muted-foreground">Avertissements</div>
            </div>
          </div>

          {validationResult.readyForApproval && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Prêt pour approbation</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Texte source (conditionnel) */}
      {showSourceText && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Texte source extrait</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                {item.extractedText}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Liste des problèmes détectés */}
      {validationResult.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Problèmes détectés ({validationResult.issues.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-3">
                {validationResult.issues.map((issue, index) => (
                  <div key={issue.id} className="flex items-start gap-3 p-3 border rounded-md">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIssueSeverityIcon(issue.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getIssueSeverityBadge(issue.severity)}
                        <Badge variant="outline" className="text-xs">{issue.type}</Badge>
                        {issue.autoFixable && (
                          <Badge variant="outline" className="text-xs text-blue-600">
                            Auto-corrigeable
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{issue.message}</p>
                      {issue.suggestions && issue.suggestions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Suggestions:</p>
                          <ul className="text-xs text-muted-foreground list-disc list-inside">
                            {issue.suggestions.map((suggestion, i) => (
                              <li key={i}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Champs mappés avec possibilité d'édition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Champs mappés ({item.mappingResult.mappedFields.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-60">
            <div className="space-y-3">
              {item.mappingResult.mappedFields.map((field) => (
                <div key={field.fieldName} className="flex items-center gap-3 p-3 border rounded-md">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{field.fieldLabel}</span>
                      <Badge variant="outline" className={getFieldConfidenceColor(field.confidence)}>
                        {field.confidence}%
                      </Badge>
                      {field.isEdited && (
                        <Badge variant="outline" className="text-blue-600">
                          Modifié
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {field.mappedValue || <span className="italic">Non mappé</span>}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(field)}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recommandations */}
      {validationResult.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recommandations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {validationResult.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Dialog d'édition de champ */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le champ</DialogTitle>
          </DialogHeader>
          
          {editingField && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{editingField.fieldLabel}</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Valeur actuelle: {editingField.mappedValue || 'Non définie'}
                </p>
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Nouvelle valeur..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Raison de la modification</label>
                <Textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Expliquez pourquoi vous modifiez ce champ..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={!newValue.trim() || !editReason.trim()}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Appliquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ValidationDiagnostic;