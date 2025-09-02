// @ts-nocheck
import { useState, useCallback } from 'react';
import { ultraSimpleOCRService } from '@/services/ultraSimpleOCRService';
import { extractionStatus } from '@/services/extractionStatusService';

interface OCRResult {
  text: string;
  confidence: number;
}

interface UseOCRScannerReturn {
  isProcessing: boolean;
  error: string | null;
  scanDocument: (file: File) => Promise<OCRResult | null>;
  scanFromCamera: () => Promise<OCRResult | null>;
  clearError: () => void;
}

export function useOCRScanner(): UseOCRScannerReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanDocument = useCallback(async (file: File): Promise<OCRResult | null> => {
    setIsProcessing(true);
    setError(null);
    
    console.log('🔄 [HOOK] Début extraction réelle pour:', file.name);
    extractionStatus.logRealExtraction('OCR', file.name, false, 'Début du traitement');
    
    try {
      // Utiliser le service OCR ultra-simple qui fonctionne
      const result = await ultraSimpleOCRService.processFile(file);
      
      if (result && result.text.length > 10) {
        extractionStatus.logRealExtraction('OCR', file.name, true, `${result.text.length} caractères extraits (${result.language})`);
        console.log('✅ [HOOK] Extraction réussie:', result.text.substring(0, 100) + '...');
        console.log(`📊 [HOOK] Langue détectée: ${result.language}`);
        console.log(`📊 [HOOK] Confiance: ${(result.confidence * 100).toFixed(1)}%`);
      } else {
        extractionStatus.logRealExtraction('OCR', file.name, false, 'Texte insuffisant');
      }
      
      // Convertir le format pour compatibilité
      return {
        text: result.text,
        confidence: result.confidence * 100 // Convertir en pourcentage
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur OCR';
      extractionStatus.logRealExtraction('OCR', file.name, false, message);
      setError(message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const scanFromCamera = useCallback(async (): Promise<OCRResult | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      return new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', async () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            stream.getTracks().forEach(t => t.stop());
            reject(new Error('Contexte canvas indisponible'));
            return;
          }
          ctx.drawImage(video, 0, 0);
          stream.getTracks().forEach(t => t.stop());
          const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.85));
          if (!blob) return resolve(null);
          const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
          const result = await ultraSimpleOCRService.processFile(file);
          // Convertir le format pour compatibilité
          resolve({
            text: result.text,
            confidence: result.confidence * 100 // Convertir en pourcentage
          });
        });
      });
    } catch (err) {
      setError('Impossible d\'accéder à la caméra');
      return null;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { isProcessing, error, scanDocument, scanFromCamera, clearError };
}
