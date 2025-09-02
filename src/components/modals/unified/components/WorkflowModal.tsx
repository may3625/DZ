/**
 * Modal de workflow pour processus multi-étapes
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { WorkflowModalConfig } from '../types';

interface WorkflowModalProps {
  config: WorkflowModalConfig;
  onClose: () => void;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({ config, onClose }) => {
  const [currentStep, setCurrentStep] = useState(config.currentStep || 0);
  const [stepData, setStepData] = useState<Record<number, any>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleStepChange = (stepIndex: number) => {
    if (!config.canNavigate && stepIndex !== currentStep + 1 && stepIndex !== currentStep - 1) {
      return;
    }
    
    setCurrentStep(stepIndex);
    if (config.onStepChange) {
      config.onStepChange(stepIndex);
    }
  };

  const handleStepData = (data: any) => {
    setStepData(prev => ({
      ...prev,
      [currentStep]: data
    }));
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const step = config.steps[currentStep];
    if (!step.validation) return true;
    
    const data = stepData[currentStep];
    return await step.validation(data);
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    if (currentStep < config.steps.length - 1) {
      handleStepChange(currentStep + 1);
    } else {
      // Workflow terminé
      const allData = Object.values(stepData);
      if (config.onComplete) {
        config.onComplete(allData);
      }
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) return 'completed';
    if (stepIndex === currentStep) return 'active';
    if (stepIndex < currentStep) return 'completed';
    return 'pending';
  };

  const getStepIcon = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'active':
        return <Clock className="w-4 h-4 text-primary" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const currentStepConfig = config.steps[currentStep];
  const StepComponent = currentStepConfig?.component;
  const progress = ((currentStep + 1) / config.steps.length) * 100;

  return (
    <div className="w-full">
      {/* Header avec progression */}
      <div className="border-b p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">
              Étape {currentStep + 1} sur {config.steps.length}
            </h3>
            <Badge variant="outline">
              {progress.toFixed(0)}%
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
        
        {/* Navigation des étapes */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {config.steps.map((step, index) => {
            const status = getStepStatus(index);
            const isActive = index === currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isActive ? 'ring-2 ring-primary' : ''
                  } ${config.canNavigate ? 'cursor-pointer' : 'cursor-default'}`}
                  onClick={() => config.canNavigate && handleStepChange(index)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      {getStepIcon(index)}
                      <div>
                        <p className="text-sm font-medium">{step.title}</p>
                        {step.description && (
                          <p className="text-xs text-muted-foreground">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {index < config.steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contenu de l'étape actuelle */}
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {currentStepConfig.title}
          </h2>
          {currentStepConfig.description && (
            <p className="text-muted-foreground">
              {currentStepConfig.description}
            </p>
          )}
        </div>
        
        <div className="mb-6">
          {StepComponent && (
            <StepComponent
              {...currentStepConfig.props}
              data={stepData[currentStep]}
              onChange={handleStepData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t p-4">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleNext}>
              {currentStep === config.steps.length - 1 ? 'Terminer' : 'Suivant'}
              {currentStep < config.steps.length - 1 && (
                <ChevronRight className="w-4 h-4 ml-2" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};