import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const AIAdvancedSection = React.lazy(() => 
  import('@/components/ai/AIAdvancedSection').then(module => ({ default: module.AIAdvancedSection }))
);

interface LazyAIAdvancedProps {
  [key: string]: any;
}

export const LazyAIAdvanced: React.FC<LazyAIAdvancedProps> = (props) => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Chargement de l'IA avancée...</p>
          <p className="text-xs text-muted-foreground mt-1">Initialisation des modèles HuggingFace</p>
        </div>
      </div>
    }>
      <AIAdvancedSection {...props} />
    </Suspense>
  );
};