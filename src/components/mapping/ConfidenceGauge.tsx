import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ConfidenceGaugeProps {
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  confidence,
  size = 'md',
  showLabel = true,
  className
}) => {
  const getConfidenceColor = (value: number) => {
    if (value >= 80) return 'text-green-600 dark:text-green-400';
    if (value >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (value >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceText = (value: number) => {
    if (value >= 80) return 'Élevée';
    if (value >= 60) return 'Moyenne';
    if (value >= 40) return 'Faible';
    return 'Très faible';
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        {showLabel && (
          <span className={cn('font-medium', textSizeClasses[size])}>
            Confiance
          </span>
        )}
        <span className={cn(
          'font-semibold',
          textSizeClasses[size],
          getConfidenceColor(confidence)
        )}>
          {confidence}%
        </span>
      </div>
      
      <Progress 
        value={confidence} 
        className={cn(sizeClasses[size], 'w-full')}
      />
      
      {showLabel && size !== 'sm' && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{getConfidenceText(confidence)}</span>
          <span>({confidence}/100)</span>
        </div>
      )}
    </div>
  );
};

export default ConfidenceGauge;