import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Image, 
  FileImage, 
  Upload, 
  Download, 
  Eye, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Settings,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OCRExtractionResult {
  text: string;
  confidence: number;
  language: string;
  processingTime: number;
  extractedFields?: Record<string, any>;
  validationResults?: Record<string, boolean>;
}

export interface OCRModalProps {
  title: string;
  description?: string;
  mode: 'workflow' | 'simple';
  file?: File;
  onExtract?: (data: any) => void;
  onValidate?: (data: any) => void;
  onSave?: (data: any) => void;
  onComplete?: (result: any) => void;
  extractionProgress?: number;
  size?: 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const OCRModal: React.FC<OCRModalProps> = ({
  title,
  description,
  mode,
  file,
  onExtract,
  onValidate,
  onSave,
  onComplete,
  extractionProgress = 0,
  size = 'lg',
  className,
}) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'extract' | 'validate' | 'save'>('upload');
  const [extractedData, setExtractedData] = useState<OCRExtractionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (uploadedFile: File) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentStep('extract');
      
      // Simulation d'extraction OCR
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: OCRExtractionResult = {
        text: "Texte extrait de l'image...",
        confidence: 0.85,
        language: "fr",
        processingTime: 2.1,
        extractedFields: {
          titre: "Document administratif",
          date: "2024-01-15",
          reference: "REF-2024-001"
        },
        validationResults: {
          titre: true,
          date: true,
          reference: false
        }
      };
      
      setExtractedData(mockResult);
      setCurrentStep('validate');
      
      if (onExtract) {
        await onExtract(mockResult);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'extraction');
      setCurrentStep('upload');
    } finally {
      setLoading(false);
    }
  }, [onExtract]);

  const handleValidation = useCallback(async () => {
    if (!extractedData) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (onValidate) {
        await onValidate(extractedData);
      }
      
      setCurrentStep('save');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  }, [extractedData, onValidate]);

  const handleSave = useCallback(async () => {
    if (!extractedData) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (onSave) {
        await onSave(extractedData);
      }
      
      if (onComplete) {
        await onComplete(extractedData);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  }, [extractedData, onSave, onComplete]);

  const getStepStatus = (step: string) => {
    const stepOrder = ['upload', 'extract', 'validate', 'save'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStepIcon = (step: string) => {
    const status = getStepStatus(step);
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'current':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const renderUploadStep = () => (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          Glissez-déposez votre fichier ici ou cliquez pour sélectionner
        </p>
        <Button
          variant="outline"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*,.pdf';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                handleFileUpload(file);
              }
            };
            input.click();
          }}
        >
          Sélectionner un fichier
        </Button>
      </div>
      
      {file && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fichier sélectionné</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderExtractStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Extraction en cours...</h3>
        <p className="text-sm text-gray-600 mb-4">
          Analyse du document et extraction du texte
        </p>
        
        <Progress value={extractionProgress} className="w-full mb-4" />
        
        <div className="text-sm text-gray-500">
          {extractionProgress}% terminé
        </div>
      </div>
    </div>
  );

  const renderValidateStep = () => (
    <div className="space-y-4">
      {extractedData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Résultats de l'extraction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Confiance:</span>
                  <Badge variant={extractedData.confidence > 0.8 ? 'default' : 'secondary'}>
                    {(extractedData.confidence * 100).toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Langue:</span>
                  <Badge variant="outline">{extractedData.language.toUpperCase()}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Temps de traitement:</span>
                  <span className="text-sm text-gray-600">{extractedData.processingTime}s</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Champs extraits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {extractedData.extractedFields && Object.entries(extractedData.extractedFields).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{key}:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{String(value)}</span>
                      {extractedData.validationResults?.[key] ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Texte extrait</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-32 overflow-y-auto p-3 bg-gray-50 rounded text-sm">
                {extractedData.text}
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('extract')}
        >
          Réextraire
        </Button>
        <Button
          onClick={handleValidation}
          disabled={loading}
        >
          Valider et continuer
        </Button>
      </div>
    </div>
  );

  const renderSaveStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Extraction terminée avec succès</h3>
        <p className="text-sm text-gray-600 mb-4">
          Les données ont été extraites et validées. Vous pouvez maintenant les sauvegarder.
        </p>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('validate')}
        >
          Retour
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return renderUploadStep();
      case 'extract':
        return renderExtractStep();
      case 'validate':
        return renderValidateStep();
      case 'save':
        return renderSaveStep();
      default:
        return renderUploadStep();
    }
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

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          {['upload', 'extract', 'validate', 'save'].map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex items-center space-x-2">
                {getStepIcon(step)}
                <span className={cn(
                  "text-sm font-medium",
                  getStepStatus(step) === 'current' ? 'text-blue-600' : 
                  getStepStatus(step) === 'completed' ? 'text-green-600' : 'text-gray-500'
                )}>
                  {step === 'upload' ? 'Upload' :
                   step === 'extract' ? 'Extraction' :
                   step === 'validate' ? 'Validation' : 'Sauvegarde'}
                </span>
              </div>
              
              {index < 3 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4",
                  getStepStatus(step) === 'completed' ? "bg-green-500" : "bg-gray-300"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 flex-1 overflow-y-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          </div>
        )}
        
        {renderCurrentStep()}
      </div>
    </div>
  );
};

// Composant Circle manquant
const Circle: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("w-5 h-5 rounded-full border-2 border-current", className)} />
);