/**
 * Types unifiés pour le traitement d'images - Version unifiée
 */

export interface ImageProcessingConfig {
  borderElimination: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    tolerance: number;
  };
  imagePreprocessing: {
    denoise: boolean;
    sharpen: boolean;
    contrast: number;
    contrastEnhancement: boolean;
    noiseReduction: boolean;
    medianFilterSize: number;
  };
  lineDetection: {
    threshold: number;
    minLineLength: number;
    maxLineGap: number;
    rho: number;
    theta: number;
  };
  tableDetection: {
    minCellWidth: number;
    minCellHeight: number;
    mergeThreshold: number;
  };
}

export interface DetectedLine {
  // Format unifié avec toutes les propriétés nécessaires
  start: { x: number; y: number };
  end: { x: number; y: number };
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  angle: number;
  length: number;
  type: 'horizontal' | 'vertical' | 'diagonal';
  confidence: number;
}

export interface DetectedZone {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'text' | 'table' | 'image' | 'header' | 'footer';
  confidence: number;
  density: number;
  lines?: DetectedLine[];
}

export interface TableCell {
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  text: string;
  row: number;
  col: number;
  rowspan: number;
  colspan: number;
  colSpan: number;
  rowSpan: number;
  confidence: number;
  isHeader: boolean;
  isEmpty: boolean;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  borders: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  formatting: {
    bold: boolean;
    italic: boolean;
    fontSize: number;
  };
  alignment: 'left' | 'center' | 'right';
}

export interface ExtractedTable {
  id: string;
  headers: string[];
  rows: TableCell[][];
  cells: TableCell[][];
  cols: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  zone: DetectedZone;
  confidence: number;
  structure: {
    rows: number;
    cols: number;
    hasHeader: boolean;
    hasFooter: boolean;
    isRegular: boolean;
  };
  metadata: {
    rowCount: number;
    columnCount: number;
    hasHeaders: boolean;
    extractionMethod: string;
    confidence: number;
    quality: number;
    borderStyle?: string;
    hasHeader?: boolean;
    hasFooter?: boolean;
    isRegular?: boolean;
  };
}

export interface ProcessingResult {
  originalImage: ImageData;
  processedImage: ImageData;
  cleanedImage: ImageData;
  detectedLines: DetectedLine[];
  detectedZones: DetectedZone[];
  textZones: DetectedZone[];
  tableZones: ExtractedTable[];
  extractedTables: ExtractedTable[];
  processingTime: number;
  quality: number;
  metadata: {
    imageWidth: number;
    imageHeight: number;
    processingDate: Date;
    algorithmVersion: string;
    algorithmUsed?: string;
    parameters?: Record<string, any>;
    timestamp?: Date;
    processingSteps?: string[];
    confidence?: number;
  };
}

export interface PDFPageImage {
  pageNumber: number;
  imageData: ImageData;
  width: number;
  height: number;
  scale: number;
  canvas: HTMLCanvasElement;
  metadata: {
    processingTime: number;
    width: number;
    height: number;
    scale: number;
  };
}

export interface PDFPage {
  pageNumber: number;
  imageData: ImageData;
  width: number;
  height: number;
  quality: number;
  processingTime: number;
  scale: number;
}


// Exports for compatibility
export type { DetectedLine as Line };
export type { DetectedZone as Zone };
export type { TableCell as Cell };
export type { ExtractedTable as Table };