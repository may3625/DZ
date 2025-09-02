import { useModal } from '@/components/modals/unified/ModalContext';
import { useCallback } from 'react';

export function useOCRWorkflow() {
  const { openModal } = useModal();

  const openOCRWorkflow = useCallback((
    options?: {
      title?: string;
      mode?: 'workflow' | 'simple';
      onComplete?: (result: any) => void;
      size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    }
  ) => {
    const modalId = `ocr_workflow_${Date.now()}`;
    
    openModal({
      id: modalId,
      type: 'ocr',
      mode: options?.mode || 'workflow',
      title: options?.title || 'Workflow d\'Extraction OCR',
      size: options?.size || '2xl',
      onComplete: (result) => {
        console.log('🎉 [useOCRWorkflow] Workflow OCR terminé:', result);
        options?.onComplete?.(result);
      },
      closable: true
    });
    
    return modalId;
  }, [openModal]);

  const openSimpleOCR = useCallback((
    title: string = 'Scanner OCR Intelligent',
    onComplete?: (result: any) => void
  ) => {
    return openOCRWorkflow({
      title,
      mode: 'simple',
      onComplete,
      size: 'xl'
    });
  }, [openOCRWorkflow]);

  return {
    openOCRWorkflow,
    openSimpleOCR
  };
}