import { 
  ImageProcessingConfig, 
  DetectedLine, 
  DetectedZone, 
  ProcessingResult,
  PDFPageImage 
} from '@/types/imageProcessing';

// Export types for other services
export type { DetectedLine, DetectedZone, ProcessingResult, PDFPageImage };

// Compatibility aliases and extra types
export type ImageProcessingResult = ProcessingResult;

export interface LineDetectionResult {
  horizontalLines: Array<{
    start: { x: number; y: number };
    end: { x: number; y: number };
    thickness: number;
  }>;
  verticalLines: Array<{
    start: { x: number; y: number };
    end: { x: number; y: number };
    thickness: number;
  }>;
  intersections: Array<{ x: number; y: number }>;
}

// Additional types for compatibility
export interface TableRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  rows: number;
  cols: number;
  confidence: number;
  cells?: any;
  type?: string;
}

export interface CellRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  row: number;
  col: number;
  text?: string;
  colspan?: number;
  rowspan?: number;
}

export interface ProcessedPage {
  pageNumber: number;
  text: string;
  confidence: number;
  processingTime: number;
  textRegions?: any[];
}

// Configuration par défaut optimisée pour les documents algériens
const DEFAULT_CONFIG: ImageProcessingConfig = {
  borderElimination: {
    top: 3,
    bottom: 2,
    left: 2,
    right: 2,
    tolerance: 5
  },
  imagePreprocessing: {
    denoise: true,
    sharpen: false,
    contrast: 1.2,
    contrastEnhancement: true,
    noiseReduction: true,
    medianFilterSize: 3
  },
  lineDetection: {
    threshold: 50,
    minLineLength: 100,
    maxLineGap: 10,
    rho: 1,
    theta: Math.PI / 180
  },
  tableDetection: {
    minCellWidth: 30,
    minCellHeight: 20,
    mergeThreshold: 5
  }
};

export class ImageProcessingService {
  private config: ImageProcessingConfig;

  constructor(config: Partial<ImageProcessingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async convertPDFToImages(pdfFile: File, scale: number = 2): Promise<PDFPageImage[]> {
    // Déléguer au service PDF avancé
    const { pdfProcessingService } = await import('./enhanced/pdfProcessingService');
const result = await pdfProcessingService.processPDF(pdfFile);
    
    return result.pages.map(page => ({
      pageNumber: page.pageNumber,
      imageData: page.imageData,
      width: page.width,
      height: page.height,
      scale: scale,
      canvas: document.createElement('canvas'),
      metadata: { processingTime: 0, width: page.width, height: page.height, scale: scale }
    }));
  }

  async processImage(imageData: ImageData): Promise<ProcessingResult> {
    // Déléguer au service d'image avancé
    const { advancedImageProcessingService } = await import('./enhanced/advancedImageProcessingService');
    
    try {
      const result = await advancedImageProcessingService.processDocument(imageData);
      
      return {
        originalImage: imageData,
        processedImage: result.cleanedImage,
        cleanedImage: result.cleanedImage,
        detectedLines: result.detectedLines.map(line => ({
          x1: line.start.x,
          y1: line.start.y,
          x2: line.end.x,
          y2: line.end.y,
          start: line.start,
          end: line.end,
          confidence: 0.8,
          angle: line.angle,
          length: line.length,
          type: line.type === 'diagonal' ? 'horizontal' : line.type
        })),
        detectedZones: result.textZones.map(zone => ({
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
          type: 'text' as const,
          confidence: 0.8,
          density: 0.7
        })),
        textZones: result.textZones.map(zone => ({
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
          type: 'text' as const,
          confidence: 0.8,
          density: 0.7
        })),
        tableZones: result.tableZones.map(table => ({
          id: `table_${Date.now()}`,
          headers: [],
          rows: [],
          cells: [],
          cols: table.cols,
          boundingBox: {
            x: table.boundingBox.x,
            y: table.boundingBox.y,
            width: table.boundingBox.width,
            height: table.boundingBox.height
          },
          zone: { ...table.boundingBox, type: 'table' as const, confidence: table.confidence, density: 0.8 },
          confidence: table.confidence,
          structure: {
            rows: table.structure.rows,
            cols: table.structure.cols,
            hasHeader: table.structure.hasHeader,
            hasFooter: table.structure.hasFooter,
            isRegular: table.structure.isRegular
          },
          metadata: { 
            rowCount: table.structure.rows,
            columnCount: table.structure.cols,
            hasHeaders: false,
            extractionMethod: 'advanced',
            confidence: table.confidence,
            quality: table.confidence,
            borderStyle: 'explicit'
          }
        })),
        extractedTables: result.tableZones.map(table => ({
          id: `table_${Date.now()}`,
          headers: [],
          rows: [],
          cells: [],
          cols: table.cols,
          boundingBox: {
            x: table.boundingBox.x,
            y: table.boundingBox.y,
            width: table.boundingBox.width,
            height: table.boundingBox.height
          },
          zone: { ...table.boundingBox, type: 'table' as const, confidence: table.confidence, density: 0.8 },
          confidence: table.confidence,
          structure: {
            rows: table.structure.rows,
            cols: table.structure.cols,
            hasHeader: table.structure.hasHeader,
            hasFooter: table.structure.hasFooter,
            isRegular: table.structure.isRegular
          },
          metadata: { 
            rowCount: table.structure.rows,
            columnCount: table.structure.cols,
            hasHeaders: false,
            extractionMethod: 'advanced',
            confidence: table.confidence,
            quality: table.confidence,
            borderStyle: 'explicit'
          }
        })),
        processingTime: result.processingTime,
        quality: result.quality,
        metadata: {
          imageWidth: imageData.width,
          imageHeight: imageData.height,
          processingDate: new Date(),
          algorithmVersion: '3.0.0',
          processingSteps: ['preprocessing', 'line_detection', 'zone_detection'],
          confidence: result.quality
        }
      };
    } catch (error) {
      // Fallback vers implémentation de base
      return {
        originalImage: imageData,
        processedImage: imageData,
        cleanedImage: imageData,
        detectedLines: [],
        detectedZones: [],
        textZones: [],
        tableZones: [],
        extractedTables: [],
        processingTime: 0,
        quality: 0.5,
        metadata: {
          imageWidth: imageData.width,
          imageHeight: imageData.height,
          processingDate: new Date(),
          algorithmVersion: '3.0.0',
          processingSteps: ['fallback'],
          confidence: 0.5
        }
      };
    }
  }

  updateConfig(newConfig: Partial<ImageProcessingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): ImageProcessingConfig {
    return { ...this.config };
  }
}

export const imageProcessingService = new ImageProcessingService();