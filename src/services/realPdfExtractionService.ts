/**
 * Service d'extraction PDF réel utilisant PDF.js
 * Remplace la simulation par une vraie extraction
 */

import * as pdfjsLib from 'pdfjs-dist';
import { getErrorMessage } from '@/utils/safeError';

// Configuration PDF.js pour fonctionnement 100% local
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.js',
  import.meta.url
).toString();

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
}

// Extraction de texte PDF réelle utilisant PDF.js
export const extractTextFromPDF = async (file: File): Promise<PDFExtractionResult> => {
  try {
    console.log('🔄 Début extraction PDF réelle pour:', file.name);
    
    // Convertir le fichier en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Charger le document PDF
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: '/cmaps/',
      cMapPacked: true,
    }).promise;
    
    console.log('📄 PDF chargé, nombre de pages:', pdf.numPages);
    
    // Extraire les métadonnées
    const metadata = await pdf.getMetadata();
    
    // Extraire le texte de toutes les pages
    const textPromises = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      textPromises.push(extractPageText(pdf, pageNum));
    }
    
    const pageTexts = await Promise.all(textPromises);
    const fullText = pageTexts.join('\n\n');
    
    console.log('✅ Extraction PDF réelle terminée, texte extrait:', fullText.length, 'caractères');
    
      return {
        text: fullText,
        pageCount: pdf.numPages,
        metadata: {
          title: (metadata.info as any)?.Title || undefined,
          author: (metadata.info as any)?.Author || undefined,
          subject: (metadata.info as any)?.Subject || undefined,
          creator: (metadata.info as any)?.Creator || undefined,
          producer: (metadata.info as any)?.Producer || undefined,
          creationDate: (metadata.info as any)?.CreationDate || undefined,
          modificationDate: (metadata.info as any)?.ModDate || undefined,
        }
      };
    
  } catch (error) {
    console.error('❌ Erreur extraction PDF réelle:', error);
    const msg = getErrorMessage(error);
    throw new Error(`Erreur lors de l'extraction PDF: ${msg}`);
  }
};

async function extractPageText(pdf: any, pageNum: number): Promise<string> {
  try {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Assembler le texte avec préservation de la structure
    return textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
      
  } catch (error) {
    console.error(`Erreur extraction page ${pageNum}:`, error);
    return '';
  }
}

export default {
  extractTextFromPDF
};