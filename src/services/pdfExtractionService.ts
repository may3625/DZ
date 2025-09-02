// Service d'extraction PDF RÉEL sans simulation
import { extractionStatus } from './extractionStatusService';

export interface PDFExtractionResult {
  text: string;
  metadata: {
    documentType: string;
    pageCount: number;
    hasImages: boolean;
    extractionDate: Date;
    confidence: number;
  };
}

// Fonction de détection du type de document
function detectDocumentType(text: string): string {
  const types = [
    { pattern: /décret\s+exécutif/gi, type: 'Décret Exécutif' },
    { pattern: /arrêté/gi, type: 'Arrêté' },
    { pattern: /loi\s+n°/gi, type: 'Loi' },
    { pattern: /ordonnance/gi, type: 'Ordonnance' },
    { pattern: /instruction/gi, type: 'Instruction' },
    { pattern: /circulaire/gi, type: 'Circulaire' }
  ];

  for (const { pattern, type } of types) {
    if (pattern.test(text)) {
      return type;
    }
  }
  return 'Document Juridique';
}

// Extraction de texte PDF RÉELLE utilisant PDF.js
export const extractTextFromPDF = async (file: File): Promise<PDFExtractionResult> => {
  console.log('🔄 [RÉEL] Début extraction PDF réelle pour:', file.name);
  extractionStatus.logRealExtraction('PDF', file.name, false, 'Début du traitement PDF');
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // IMPLÉMENTATION RÉELLE avec PDF.js
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configuration du worker
    // Utiliser le worker local pour PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    console.log('📄 [RÉEL] PDF chargé avec', pdf.numPages, 'pages');
    
    let extractedText = '';
    
    // Extraire le texte de toutes les pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      extractedText += pageText + '\n';
      console.log(`📝 [RÉEL] Page ${pageNum} extraite: ${pageText.length} caractères`);
    }
    
    const documentType = detectDocumentType(extractedText);
    console.log('✅ [RÉEL] Extraction terminée:', extractedText.length, 'caractères');
    extractionStatus.logRealExtraction('PDF', file.name, true, `${extractedText.length} caractères, Type: ${documentType}`);

    const result: PDFExtractionResult = {
      text: extractedText,
      metadata: {
        documentType,
        pageCount: pdf.numPages,
        hasImages: true,
        extractionDate: new Date(),
        confidence: 95, // Confiance élevée pour PDF.js
      }
    };
    
    return result;
    
  } catch (error) {
    console.error('❌ [RÉEL] Erreur extraction PDF:', error);
    const { getErrorMessage } = await import('@/utils/safeError');
    const msg = getErrorMessage(error);
    extractionStatus.logRealExtraction('PDF', file.name, false, `Erreur: ${msg}`);
    throw new Error(`Erreur extraction PDF: ${msg}`);
  }
};

// Fonction d'extraction PDF locale pour compatibilité
export const extractPDFDataLocally = async (file: File) => {
  console.log('🔄 [RÉEL] Extraction PDF locale pour:', file.name);
  
  const result = await extractTextFromPDF(file);
  
  return {
    text: result.text,
    metadata: {
      pageCount: result.metadata.pageCount,
      fileName: file.name,
      fileSize: file.size,
      processingTime: new Date().toISOString(),
      documentType: result.metadata.documentType,
      confidence: result.metadata.confidence
    }
  };
};

export default {
  extractTextFromPDF,
  extractPDFDataLocally
};