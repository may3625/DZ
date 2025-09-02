/**
 * Onglet de validation et diagnostic OCR
 * Interface complète pour la validation des données extraites
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Edit3, 
  Save,
  TrendingUp,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { MappingResult } from '@/types/mapping';
import { ValidationResult } from '@/services/validation/validationService';
import { diagnosticService, DiagnosticReport, DiagnosticSuggestion } from '@/services/validation/diagnosticService';

interface ValidationTabProps {
  extractedText: string;
  mappingResult: MappingResult | null;
  validationResult: ValidationResult | null;
  onRevalidate: () => void;
  onFieldCorrection: (field: string, newValue: any) => void;
  onValidationComplete: (isValid: boolean) => void;
}

export function ValidationTab({
  extractedText,
  mappingResult,
  validationResult,
  onRevalidate,
  onFieldCorrection,
  onValidationComplete
}: ValidationTabProps) {
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());

  // Générer le rapport de diagnostic lors du chargement
  useEffect(() => {
    if (mappingResult && validationResult) {
      const report = diagnosticService.generateDiagnosticReport(
        extractedText,
        mappingResult,
        validationResult
      );
      setDiagnosticReport(report);
      
      // Initialiser les valeurs des champs
      const initialValues: Record<string, any> = {};
      if (mappingResult.mappedFields) {
        Object.entries(mappingResult.mappedFields).forEach(([field, data]) => {
          initialValues[field] = data.value;
        });
      }
      setFieldValues(initialValues);
      
      // Notifier si prêt pour l'approbation
      onValidationComplete(report.overall.readyForProduction);
    }
  }, [mappingResult, validationResult, extractedText, onValidationComplete]);

  const handleRevalidate = async () => {
    setIsRevalidating(true);
    try {
      await onRevalidate();
    } finally {
      setIsRevalidating(false);
    }
  };

  const handleFieldEdit = (field: string) => {
    setEditingField(field);
  };

  const handleFieldSave = (field: string, newValue: any) => {
    setFieldValues(prev => ({ ...prev, [field]: newValue }));
    onFieldCorrection(field, newValue);
    setEditingField(null);
  };

  const handleApplySuggestion = (suggestion: DiagnosticSuggestion) => {
    if (suggestion.field) {
      // Logique d'application de la suggestion
      console.log('Application de la suggestion:', suggestion);
      setSelectedSuggestions(prev => new Set([...prev, suggestion.description]));
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-50';
      case 'B': return 'text-blue-600 bg-blue-50';
      case 'C': return 'text-yellow-600 bg-yellow-50';
      case 'D': return 'text-orange-600 bg-orange-50';
      case 'F': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!diagnosticReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Génération du rapport de diagnostic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec score global */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Diagnostic Global
            </CardTitle>
            <Badge className={cn('text-lg font-bold px-4 py-2', getGradeColor(diagnosticReport.overall.grade))}>
              Note: {diagnosticReport.overall.grade} ({diagnosticReport.overall.score}%)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{diagnosticReport.overall.confidence}%</div>
              <div className="text-sm text-muted-foreground">Confiance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{diagnosticReport.mapping.fieldCoverage}%</div>
              <div className="text-sm text-muted-foreground">Champs mappés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{diagnosticReport.validation.passedChecks}</div>
              <div className="text-sm text-muted-foreground">Validations OK</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{diagnosticReport.performance.processingTime}ms</div>
              <div className="text-sm text-muted-foreground">Traitement</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {diagnosticReport.overall.readyForProduction ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              )}
              <span className="font-medium">
                {diagnosticReport.overall.readyForProduction 
                  ? 'Prêt pour la production' 
                  : 'Nécessite des corrections'
                }
              </span>
            </div>
            
            <Button 
              onClick={handleRevalidate} 
              disabled={isRevalidating}
              variant="outline"
              className="gap-2"
            >
              {isRevalidating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Revalider
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Onglets détaillés */}
      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="issues" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Problèmes ({diagnosticReport.validation.criticalIssues.length + diagnosticReport.validation.warnings.length})
          </TabsTrigger>
          <TabsTrigger value="fields" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Champs
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Onglet Problèmes */}
        <TabsContent value="issues" className="space-y-4">
          {diagnosticReport.validation.criticalIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Problèmes Critiques ({diagnosticReport.validation.criticalIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {diagnosticReport.validation.criticalIssues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <div className="font-medium text-red-800">{issue.message}</div>
                      {issue.field && (
                        <div className="text-sm text-red-600 mt-1">Champ: {issue.field}</div>
                      )}
                      {issue.suggestion && (
                        <div className="text-sm text-red-700 mt-2 p-2 bg-red-100 rounded">
                          <strong>Suggestion:</strong> {issue.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {diagnosticReport.validation.warnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="h-5 w-5" />
                  Avertissements ({diagnosticReport.validation.warnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {diagnosticReport.validation.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    {getSeverityIcon(warning.severity)}
                    <div className="flex-1">
                      <div className="font-medium text-yellow-800">{warning.message}</div>
                      {warning.field && (
                        <div className="text-sm text-yellow-600 mt-1">Champ: {warning.field}</div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {diagnosticReport.validation.criticalIssues.length === 0 && diagnosticReport.validation.warnings.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-800 mb-2">Aucun problème détecté</h3>
                <p className="text-green-600">Toutes les validations sont passées avec succès.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Champs */}
        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Champs Mappés - Correction en Ligne</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mappingResult?.mappedFields && Object.entries(mappingResult.mappedFields).map(([field, data]) => (
                <div key={field} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">{field}</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant={data.confidence && data.confidence > 80 ? 'default' : 'secondary'}>
                        {data.confidence ? `${data.confidence.toFixed(1)}%` : 'N/A'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFieldEdit(field)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {editingField === field ? (
                    <div className="space-y-2">
                      <Input
                        value={fieldValues[field] || ''}
                        onChange={(e) => setFieldValues(prev => ({
                          ...prev,
                          [field]: e.target.value
                        }))}
                        className="w-full"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleFieldSave(field, fieldValues[field])}
                          className="gap-1"
                        >
                          <Save className="h-3 w-3" />
                          Sauvegarder
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingField(null)}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      {fieldValues[field] || data.value || 'Valeur vide'}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Suggestions */}
        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Suggestions d'Amélioration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {diagnosticReport.validation.suggestions.map((suggestion, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={suggestion.priority === 'high' ? 'destructive' : 
                                      suggestion.priority === 'medium' ? 'default' : 'secondary'}>
                          {suggestion.priority}
                        </Badge>
                        <Badge variant="outline">{suggestion.type}</Badge>
                      </div>
                      <h4 className="font-medium mb-1">{suggestion.description}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{suggestion.action}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={suggestion.estimatedImpact} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground">{suggestion.estimatedImpact}% d'impact</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={selectedSuggestions.has(suggestion.description) ? 'default' : 'outline'}
                      onClick={() => handleApplySuggestion(suggestion)}
                      disabled={selectedSuggestions.has(suggestion.description)}
                    >
                      {selectedSuggestions.has(suggestion.description) ? 'Appliqué' : 'Appliquer'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Performance */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Métriques de Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Temps de traitement</span>
                  <Badge variant="outline">{diagnosticReport.performance.processingTime}ms</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Qualité OCR</span>
                  <Badge variant="outline">{diagnosticReport.ocr.textQuality}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Précision caractères</span>
                  <Badge variant="outline">{diagnosticReport.ocr.characterAccuracy}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Détection mise en page</span>
                  <Badge variant="outline">{diagnosticReport.ocr.layoutDetection}%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommandations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {diagnosticReport.recommendations.immediate.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Immédiates</h4>
                    <ul className="text-sm space-y-1">
                      {diagnosticReport.recommendations.immediate.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {diagnosticReport.recommendations.improvements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2">Améliorations</h4>
                    <ul className="text-sm space-y-1">
                      {diagnosticReport.recommendations.improvements.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingUp className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}