// Composant pour afficher les erreurs de validation

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  XCircle, 
  AlertCircle, 
  Info, 
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { ValidationError, ErrorSeverity, ValidationErrorType } from '@/types/approval';
import { ValidationService } from '@/services/validationService';
import { useToast } from '@/hooks/use-toast';

interface ValidationErrorsProps {
  errors: ValidationError[];
  itemId: string;
  onErrorResolved?: () => void;
}

export function ValidationErrors({ errors, itemId, onErrorResolved }: ValidationErrorsProps) {
  const { toast } = useToast();

  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'outline';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getErrorTypeLabel = (type: ValidationErrorType): string => {
    const labels = {
      format: 'Format',
      content: 'Contenu',
      metadata: 'Métadonnées',
      duplicate: 'Doublon',
      classification: 'Classification',
      legal_compliance: 'Conformité légale'
    };
    return labels[type] || type;
  };

  const handleResolveError = async (errorId: string) => {
    try {
      await ValidationService.resolveError(errorId);
      toast({
        title: "Erreur résolue",
        description: "L'erreur a été marquée comme résolue"
      });
      onErrorResolved?.();
    } catch (error) {
      console.error('Erreur lors de la résolution:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de résoudre l'erreur"
      });
    }
  };

  const unresolvedErrors = errors.filter(error => !error.is_resolved);
  const resolvedErrors = errors.filter(error => error.is_resolved);

  if (errors.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            Aucune erreur détectée
          </h3>
          <p className="text-muted-foreground">
            Cet élément a passé tous les contrôles de validation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Résumé des erreurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Rapport de validation
          </CardTitle>
          <CardDescription>
            {unresolvedErrors.length} erreur(s) non résolue(s) sur {errors.length} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-destructive">
                {errors.filter(e => e.severity === 'critical' && !e.is_resolved).length}
              </div>
              <div className="text-sm text-muted-foreground">Critiques</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">
                {errors.filter(e => e.severity === 'high' && !e.is_resolved).length}
              </div>
              <div className="text-sm text-muted-foreground">Élevées</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-500">
                {errors.filter(e => e.severity === 'medium' && !e.is_resolved).length}
              </div>
              <div className="text-sm text-muted-foreground">Moyennes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {errors.filter(e => e.severity === 'low' && !e.is_resolved).length}
              </div>
              <div className="text-sm text-muted-foreground">Faibles</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erreurs non résolues */}
      {unresolvedErrors.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-destructive">
            Erreurs à résoudre ({unresolvedErrors.length})
          </h4>
          
          {unresolvedErrors.map((error) => (
            <Alert key={error.id} className="border-l-4 border-l-destructive">
              <div className="flex items-start gap-3">
                {getSeverityIcon(error.severity)}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getSeverityColor(error.severity)}>
                      {error.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {getErrorTypeLabel(error.error_type)}
                    </Badge>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {error.error_code}
                    </code>
                  </div>
                  
                  <AlertDescription className="text-sm">
                    <strong>{error.error_message}</strong>
                    {error.field_path && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Champ: {error.field_path}
                      </div>
                    )}
                  </AlertDescription>
                  
                  {error.suggested_fix && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <strong>Suggestion:</strong> {error.suggested_fix}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Détectée le {new Date(error.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveError(error.id)}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Marquer comme résolue
                    </Button>
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Erreurs résolues */}
      {resolvedErrors.length > 0 && (
        <details className="space-y-2">
          <summary className="cursor-pointer font-semibold text-green-700">
            Erreurs résolues ({resolvedErrors.length})
          </summary>
          
          <div className="space-y-2 pl-4">
            {resolvedErrors.map((error) => (
              <div key={error.id} className="border rounded p-3 bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    {getErrorTypeLabel(error.error_type)}
                  </Badge>
                  <span className="text-sm text-green-800">{error.error_message}</span>
                </div>
                <div className="text-xs text-green-600">
                  Résolue le {new Date(error.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}