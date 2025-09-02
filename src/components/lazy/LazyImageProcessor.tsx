import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const ImageProcessor = React.lazy(() => import('@/components/image-processing/ImageProcessor'));

interface LazyImageProcessorProps {
  [key: string]: any;
}

export const LazyImageProcessor: React.FC<LazyImageProcessorProps> = (props) => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Chargement du processeur d'images...</p>
          <p className="text-xs text-muted-foreground mt-1">Initialisation d'OpenCV.js</p>
        </div>
      </div>
    }>
      <ImageProcessor {...props} />
    </Suspense>
  );
};