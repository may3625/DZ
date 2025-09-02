import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load des composants utilisant OpenCV
const AdvancedTestingInterface = React.lazy(() => 
  import('@/components/ocr/AdvancedTestingInterface').then(module => ({ default: module.AdvancedTestingInterface }))
);
const ArabicExtractionTester = React.lazy(() => 
  import('@/components/ArabicExtractionTester').then(module => ({ default: module.ArabicExtractionTester }))
);

interface LazyCVComponentProps {
  [key: string]: any;
}

export const LazyAdvancedTestingInterface: React.FC<LazyCVComponentProps> = (props) => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Chargement des outils avancés...</p>
          <p className="text-xs text-muted-foreground mt-1">Initialisation d'OpenCV.js</p>
        </div>
      </div>
    }>
      <AdvancedTestingInterface {...props} />
    </Suspense>
  );
};

export const LazyArabicExtractionTester: React.FC<LazyCVComponentProps> = (props) => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Chargement du testeur arabe...</p>
          <p className="text-xs text-muted-foreground mt-1">Chargement des modèles linguistiques</p>
        </div>
      </div>
    }>
      <ArabicExtractionTester {...props} />
    </Suspense>
  );
};