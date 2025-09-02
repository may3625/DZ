import { useCallback } from 'react';
import { RealOCRResult } from '@/services/realOcrService';
import { exportToJSON, exportToTXT, exportToPDF } from '@/services/ocrExportService';

export interface UseOCRExportReturn {
  exportToJSON: (result: RealOCRResult, mappedData: Record<string, unknown>) => Promise<void>;
  exportToTXT: (result: RealOCRResult) => Promise<void>;
  exportToPDF: (result: RealOCRResult, mappedData: Record<string, unknown>) => Promise<void>;
  copyToClipboard: (text: string) => Promise<void>;
}

export const useOCRExport = (): UseOCRExportReturn => {
  const handleExportToJSON = useCallback(async (result: RealOCRResult, mappedData: Record<string, unknown>) => {
    try {
      await exportToJSON(result, mappedData);
    } catch (error) {
      console.error('Erreur lors de l\'export JSON:', error);
      throw error;
    }
  }, []);

  const handleExportToTXT = useCallback(async (result: RealOCRResult) => {
    try {
      await exportToTXT(result);
    } catch (error) {
      console.error('Erreur lors de l\'export TXT:', error);
      throw error;
    }
  }, []);

  const handleExportToPDF = useCallback(async (result: RealOCRResult, mappedData: Record<string, unknown>) => {
    try {
      await exportToPDF(result, mappedData);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      throw error;
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback pour les environnements non-sécurisés
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Erreur lors de la copie fallback:', err);
          throw new Error('Impossible de copier le texte');
        }
        
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Erreur lors de la copie dans le presse-papiers:', error);
      throw error;
    }
  }, []);

  return {
    exportToJSON: handleExportToJSON,
    exportToTXT: handleExportToTXT,
    exportToPDF: handleExportToPDF,
    copyToClipboard
  };
};