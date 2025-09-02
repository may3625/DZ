/**
 * Type definitions for OCR and image processing services
 */

// Extended ImageData interface with additional properties
export interface ExtendedImageData extends ImageData {
  pageNumber?: number;
  imageData?: ImageData;
}

// PDF Processing Configuration
export interface PDFProcessingConfig {
  scale: number;
  quality: number;
  maxPages?: number;
  pageRange?: number[];
  dpi?: number;
  format?: string;
}

// PDF Page Result
export interface PDFPageResult {
  pageNumber: number;
  imageData: ImageData;
  width: number;
  height: number;
  text?: string;
}

// PDF Processing Result
export interface PDFProcessingResult {
  pages: PDFPageResult[];
  text: string;
  error?: string;
  processingTime?: number;
  metadata: {
    pageCount: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
}

// Log Categories
export type LogCategory = 'OCR' | 'PDF' | 'IMAGE' | 'SYSTEM' | 'ERROR' | 'DEBUG';