import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  validation?: (data: any) => boolean | Promise<boolean>;
  isComplete?: boolean;
  isOptional?: boolean;
}

export interface WorkflowModalProps {
  title: string;
  description?: string;
  steps: WorkflowStep[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: (data: any) => void;
  onCancel?: () => void;
  canNavigate?: boolean;
  showProgress?: boolean;
  size?: 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const WorkflowModal: React.FC<WorkflowModalProps> = ({
  title,
  description,
  steps,
  currentStep = 0,
  onStepChange,
  onComplete,
  onCancel,
  canNavigate = true,
  showProgress = true,
  size = 'lg',
  className,
}) => {
  const [localCurrentStep, setLocalCurrentStep] = useState(currentStep);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const activeStep = onStepChange ? currentStep : localCurrentStep;

  const handleStepChange = useCallback(async (newStep: number) => {
    if (newStep < 0 || newStep >= steps.length) return;

    // Validation de l'étape courante avant de naviguer
    if (activeStep < steps.length) {
      const currentStepConfig = steps[activeStep];
      if (currentStepConfig.validation) {
        try {
          setLoading(true);
          const isValid = await currentStepConfig.validation(stepData[currentStepConfig.id] || {});
          if (!isValid) {
            setValidationErrors(prev => ({
              ...prev,
              [currentStepConfig.id]: 'Validation échouée pour cette étape'
            }));
            return;
          }
        } catch (error) {
          setValidationErrors(prev => ({
            ...prev,
            [currentStepConfig.id]: error instanceof Error ? error.message : 'Erreur de validation'
          }));
          return;
        } finally {
          setLoading(false);
        }
      }
    }

    // Marquer l'étape comme complète
    if (activeStep < steps.length) {
      const updatedSteps = [...steps];
      updatedSteps[activeStep] = {
        ...updatedSteps[activeStep],
        isComplete: true
      };
    }

    // Naviguer vers la nouvelle étape
    if (onStepChange) {
      onStepChange(newStep);
    } else {
      setLocalCurrentStep(newStep);
    }

    // Effacer les erreurs de validation
    setValidationErrors({});
  }, [activeStep, steps, stepData, onStepChange]);

  const handleStepDataUpdate = useCallback((stepId: string, data: any) => {
    setStepData(prev => ({
      ...prev,
      [stepId]: data
    }));
  }, []);

  const handleComplete = useCallback(async () => {
    if (onComplete) {
      try {
        setLoading(true);
        await onComplete(stepData);
      } catch (error) {
        console.error('Erreur lors de la finalisation:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [onComplete, stepData]);

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < activeStep) return 'completed';
    if (stepIndex === activeStep) return 'current';
    return 'pending';
  };

  const getStepIcon = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'current':
        return <Circle className="w-5 h-5 text-blue-600 fill-current" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const progressPercentage = ((activeStep + 1) / steps.length) * 100;

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
          
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={loading}
              className="h-8 w-8 p-0 hover:bg-background/50"
              aria-label="Fermer la modal"
            >
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="px-6 py-3 border-b bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Étape {activeStep + 1} sur {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}

      {/* Steps Indicator */}
      <div className="px-6 py-4 border-b bg-muted/20">
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center">
                  {getStepIcon(index)}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  getStepStatus(index) === 'current' ? 'text-blue-600' : 
                  getStepStatus(index) === 'completed' ? 'text-green-600' : 'text-gray-500'
                )}>
                  {step.title}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="px-6 py-4 flex-1 overflow-y-auto min-h-[300px]">
        {activeStep < steps.length && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                {steps[activeStep].title}
              </h3>
              {steps[activeStep].description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {steps[activeStep].description}
                </p>
              )}
            </div>
            
            <div className="min-h-[200px]">
              {React.createElement(
                steps[activeStep].component,
                {
                  ...steps[activeStep].props,
                  onDataUpdate: (data: any) => handleStepDataUpdate(steps[activeStep].id, data),
                  data: stepData[steps[activeStep].id] || {},
                }
              )}
            </div>

            {/* Validation Error */}
            {validationErrors[steps[activeStep].id] && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  {validationErrors[steps[activeStep].id]}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="px-6 py-4 bg-muted/30 border-t">
        <div className="flex justify-between">
          <Button
            variant="outline"
            disabled={!canNavigate || activeStep === 0 || loading}
            onClick={() => handleStepChange(activeStep - 1)}
            className="min-w-20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          
          <div className="flex space-x-2">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="min-w-20"
              >
                Annuler
              </Button>
            )}
            
            {activeStep === steps.length - 1 ? (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="min-w-20"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finalisation...
                  </>
                ) : (
                  'Terminer'
                )}
              </Button>
            ) : (
              <Button
                onClick={() => handleStepChange(activeStep + 1)}
                disabled={!canNavigate || loading}
                className="min-w-20"
              >
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};