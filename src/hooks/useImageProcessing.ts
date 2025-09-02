import { useState, useCallback, useRef } from 'react';
import { 
  ProcessingResult, 
  ImageProcessingConfig, 
  ExtractedTable
} from '@/types/imageProcessing';
import { imageProcessingService } from '@/services/imageProcessingService';
import { tableExtractionService } from '@/services/tableExtractionService';
import { ImageUtils } from '@/utils/imageUtils';
import { toast } from 'sonner';

interface UseImageProcessingReturn {
  // État
  isProcessing: boolean;
  progress: number;
  results: ProcessingResult[];
  extractedTables: ExtractedTable[];
  config: ImageProcessingConfig;
  
  // Actions
  processFile: (file: File) => Promise<void>;
  processImage: (imageData: ImageData) => Promise<ProcessingResult>;
  processPDF: (file: File) => Promise<void>;
  clearResults: () => void;
  updateConfig: (newConfig: Partial<ImageProcessingConfig>) => void;
  exportResults: () => void;
  downloadProcessedImage: (index: number) => void;
  retryProcessing: (index: number) => Promise<void>;
}

export function useImageProcessing(): UseImageProcessingReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [extractedTables, setExtractedTables] = useState<ExtractedTable[]>([]);
  const [config, setConfig] = useState<ImageProcessingConfig>(
    imageProcessingService.getConfig()
  );
  
  const processingAbortController = useRef<AbortController | null>(null);

  const processFile = useCallback(async (file: File) => {
    if (isProcessing) {
      toast.error('Un traitement est déjà en cours');
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);
      processingAbortController.current = new AbortController();

      const fileType = file.type;

      if (fileType === 'application/pdf') {
        await processPDF(file);
      } else if (fileType.startsWith('image/')) {
        await processImageFile(file);
      } else {
        throw new Error('Type de fichier non supporté. Utilisez PDF ou images.');
      }

      toast.success('Traitement terminé avec succès');
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur de traitement');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      processingAbortController.current = null;
    }
  }, [isProcessing]);

  const processImageFile = useCallback(async (file: File) => {
    setProgress(20);
    
    // Charger l'image
    const img = await ImageUtils.loadImageFromFile(file);
    setProgress(40);
    
    // Convertir en ImageData
    const imageData = ImageUtils.imageElementToImageData(img);
    setProgress(60);
    
    // Traiter l'image
    const result = await processImage(imageData);
    setProgress(80);
    
    // Extraire les tables
    await extractTablesFromResult(result);
    setProgress(100);
  }, []);

  const processPDF = useCallback(async (file: File) => {
    try {
      setProgress(10);
      
      // Convertir le PDF en images
      const pdfImages = await imageProcessingService.convertPDFToImages(file, 2);
      setProgress(30);
      
      const totalPages = pdfImages.length;
      const newResults: ProcessingResult[] = [];
      const allTables: ExtractedTable[] = [];
      
      for (let i = 0; i < totalPages; i++) {
        if (processingAbortController.current?.signal.aborted) {
          throw new Error('Traitement annulé par l\'utilisateur');
        }
        
        const pageImage = pdfImages[i];
        const progress = 30 + ((i / totalPages) * 50);
        setProgress(progress);
        
        // Traiter chaque page
        const result = await imageProcessingService.processImage(pageImage.imageData);
        newResults.push(result);
        
        // Extraire les tables de cette page
        const pageTables = await tableExtractionService.extractTablesFromZones(
          result.detectedZones
        );
        allTables.push(...pageTables);
        
        toast.info(`Page ${i + 1}/${totalPages} traitée`);
      }
      
      setProgress(90);
      
      // Fusionner les tables intelligemment
      const mergedTables = await tableExtractionService.mergeTablesIntelligently(allTables);
      
      setResults(prev => [...prev, ...newResults]);
      setExtractedTables(prev => [...prev, ...mergedTables]);
      
      setProgress(100);
      
    } catch (error) {
      console.error('Erreur lors du traitement PDF:', error);
      throw error;
    }
  }, []);

  const processImage = useCallback(async (imageData: ImageData): Promise<ProcessingResult> => {
    try {
      // Vérifier si c'est un document scanné
      const documentCheck = ImageUtils.isScannedDocument(imageData);
      
      if (!documentCheck.isDocument) {
        toast.warning('Cette image ne semble pas être un document scanné');
      }
      
      // Optimiser pour l'OCR si nécessaire
      const optimizedImage = documentCheck.confidence > 0.5 
        ? ImageUtils.optimizeForOCR(imageData)
        : imageData;
      
      // Traiter avec OpenCV
      const result = await imageProcessingService.processImage(optimizedImage);
      
      setResults(prev => [...prev, result]);
      
      return result;
    } catch (error) {
      console.error('Erreur lors du traitement d\'image:', error);
      throw error;
    }
  }, []);

  const extractTablesFromResult = useCallback(async (result: ProcessingResult) => {
    try {
      const tables = await tableExtractionService.extractTablesFromZones(
        result.detectedZones
      );
      
      setExtractedTables(prev => [...prev, ...tables]);
      
      if (tables.length > 0) {
        toast.success(`${tables.length} table(s) extraite(s)`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction de tables:', error);
      toast.error('Erreur lors de l\'extraction des tables');
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setExtractedTables([]);
    setProgress(0);
  }, []);

  const updateConfig = useCallback((newConfig: Partial<ImageProcessingConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    imageProcessingService.updateConfig(newConfig);
  }, [config]);

  const exportResults = useCallback(() => {
    if (extractedTables.length === 0) {
      toast.error('Aucune table à exporter');
      return;
    }

    try {
      // Créer un objet avec tous les résultats
      const exportData = {
        timestamp: new Date().toISOString(),
        config,
        results: results.map(result => ({
          processingTime: result.processingTime,
          quality: result.quality,
          detectedLines: result.detectedLines.length,
          detectedZones: result.detectedZones.length
        })),
        tables: extractedTables.map(table => ({
          id: table.id,
          rows: table.rows,
          cols: table.cols,
          cells: table.cells.map(row => 
            row.map(cell => ({
              row: cell.row,
              col: cell.col,
              rowSpan: cell.rowSpan,
              colSpan: cell.colSpan,
              text: cell.text,
              confidence: cell.confidence
            }))
          ),
          metadata: table.metadata
        }))
      };

      // Télécharger le JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extraction_results_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Résultats exportés avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Erreur lors de l\'export');
    }
  }, [extractedTables, results, config]);

  const downloadProcessedImage = useCallback((index: number) => {
    if (index >= 0 && index < results.length) {
      const result = results[index];
      ImageUtils.downloadImage(
        result.processedImage, 
        `processed_image_${index + 1}.png`
      );
    }
  }, [results]);

  const retryProcessing = useCallback(async (index: number) => {
    if (index >= 0 && index < results.length) {
      try {
        setIsProcessing(true);
        const originalImage = results[index].originalImage;
        const newResult = await processImage(originalImage);
        
        // Remplacer l'ancien résultat
        setResults(prev => prev.map((result, i) => i === index ? newResult : result));
        
        toast.success('Retraitement terminé');
      } catch (error) {
        console.error('Erreur lors du retraitement:', error);
        toast.error('Erreur lors du retraitement');
      } finally {
        setIsProcessing(false);
      }
    }
  }, [results, processImage]);

  return {
    // État
    isProcessing,
    progress,
    results,
    extractedTables,
    config,
    
    // Actions
    processFile,
    processImage,
    processPDF,
    clearResults,
    updateConfig,
    exportResults,
    downloadProcessedImage,
    retryProcessing
  };
}

export default useImageProcessing;