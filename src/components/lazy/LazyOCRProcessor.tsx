import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { DZOCRIAProcessor } from '@/components/ocr/DZOCRIAProcessor';
import { ArabicOCRTester } from '@/components/ocr/ArabicOCRTester';

interface LazyOCRProcessorProps {
  mode?: 'processor' | 'tester';
  [key: string]: any;
}

export const LazyOCRProcessor: React.FC<LazyOCRProcessorProps> = ({ mode = 'processor', ...props }) => {
  const Component = mode === 'tester' ? ArabicOCRTester : DZOCRIAProcessor;
  
  return <Component {...props} />;
};