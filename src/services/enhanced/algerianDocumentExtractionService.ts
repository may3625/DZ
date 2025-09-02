/**
 * Service d'extraction de documents algériens
 * Traite les documents juridiques algériens avec support RTL et détection bilingue
 */

import { realOCRExtractionService, type OCRExtractionResult, type TextRegion } from './realOCRExtractionService';
import { logger } from '@/utils/logger';
import { legalRelationshipService } from '@/services/legalRelationshipService';

// Export des interfaces héritées pour compatibilité
export type ExtractedDocument = AlgerianExtractionResult;
export type AlgerianDocumentPage = AlgerianPageResult;

// Interfaces pour compatibilité avec les composants existants
export interface StructuredPublication {
  title: string;
  type: 'loi' | 'decret' | 'arrete' | 'circulaire' | 'instruction' | 'journal_officiel' | 'other';
  number: string;
  date: string;
  content: string;
  entities: any[];
  entitiesByType: {
    dates: any[];
    numbers: any[];
    institutions: any[];
    references: any[];
    subjects: any[];
  };
  metadata: {
    isOfficial: boolean;
    language: 'ar' | 'fr' | 'mixed';
    confidence: number;
    processingTime: number;
  };
  institution?: string;
  joNumber?: string;
  joDate?: string;
  sections: any;
}

export interface RealProcessingResult {
  extractedDocument: ExtractedDocument;
  structuredPublication: StructuredPublication;
  analysisResult: RealAnalysisResult;
  confidence: number;
  processingTime: number;
  // Compatibilité avec DZOCRIAProcessor
  processingMetadata: {
    totalPages: number;
    averageConfidence: number;
    totalProcessingTime: number;
  };
  detectedLines: any[];
  tableRegions: any[];
  textSeparators: any[];
}

export interface RealAnalysisResult {
  documentType: string;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  metadata: {
    language: 'ar' | 'fr' | 'mixed';
    isOfficial: boolean;
    confidence: number;
  };
  textQuality: {
    clarity: number;
    completeness: number;
    structure: number;
  };
}

export interface AlgerianExtractionMetadata {
  isOfficial: boolean;
  isBilingual: boolean;
  hasArabicContent: boolean;
  hasFrenchContent: boolean;
  documentType: 'journal_officiel' | 'loi' | 'decret' | 'arrete' | 'circulaire' | 'instruction' | 'other';
  institutions: string[];
  detectedLanguages: string[];
  confidence: number;
  // Propriétés de compatibilité avec l'existant
  mixedContent?: boolean;
  isAlgerianDocument?: boolean;
  requiresManualReview?: boolean;
  totalPages?: number;
  processingTime?: number;
  averageConfidence?: number;
  extractionQuality?: {
    overall: number;
    textClarity: number;
    structureDetection: number;
    languageDetection: number;
  };
  title?: string;
  date?: string;
  number?: string;
  institution?: string;
  // Propriétés de compatibilité avec les composants existants
  detectedEntities?: any[];
  languageDistribution?: {
    french: number;
    arabic: number;
    mixed: number;
  };
  processingDate?: string;
}

export interface AlgerianTextRegion extends TextRegion {
  isArabic: boolean;
  isFrench: boolean;
  textDirection: 'ltr' | 'rtl' | 'mixed';
  processedText: string;
}

export interface AlgerianPageResult {
  pageNumber: number;
  textRegions: AlgerianTextRegion[];
  fullText: string;
  metadata: AlgerianExtractionMetadata;
  confidence: number;
  processingTime: number;
  // Propriétés de compatibilité
  tables?: any[];
  tableRegions?: any[];
  width?: number;
  height?: number;
  borderRegion?: any;
  horizontalLines?: any[];
  verticalLines?: any[];
  separatorLines?: any[];
  lines?: any[];
}

export interface AlgerianExtractionResult {
  pages: AlgerianPageResult[];
  extractedText: string;
  metadata: AlgerianExtractionMetadata;
  totalPages: number;
  averageConfidence: number;
  processingTime: number;
  rawOcrResult: OCRExtractionResult;
  // Propriétés de compatibilité avec ExtractedDocument
  confidence?: number;
  documentType?: string;
  qualityIndicators?: any;
  ocrResult?: OCRExtractionResult;
  fileName?: string;
  fileSize?: number;
  totalProcessingTime?: number;
  // Propriétés de compatibilité avec les composants existants
  languageDetected?: string;
  isMixedLanguage?: boolean;
  textRegions?: AlgerianTextRegion[];
  originalFilename?: string;
  confidenceScore?: number;
}

class AlgerianDocumentExtractionService {
  
  // Méthode principale pour la compatibilité avec l'existant
  async extractDocumentFromFile(file: File): Promise<AlgerianExtractionResult> {
    return this.extractDocument(file);
  }
  
  async extractDocument(file: File): Promise<AlgerianExtractionResult> {
    const startTime = performance.now();
    logger.info('OCR', '🇩🇿 Début extraction document algérien:', { fileName: file.name });

    try {
      const rawOcrResult = await realOCRExtractionService.extractDocumentFromFile(file);
      const algerianPages = await this.processAlgerianPages(rawOcrResult.pages);
      const extractedText = this.aggregatePageTexts(algerianPages);
      const metadata = this.analyzeDocumentMetadata(algerianPages, extractedText);
      const processingTime = performance.now() - startTime;
      
      const result: AlgerianExtractionResult = {
        pages: algerianPages,
        extractedText,
        metadata,
        totalPages: algerianPages.length,
        averageConfidence: this.calculateAverageConfidence(algerianPages),
        processingTime,
        rawOcrResult,
        // Détection de langue basée sur le résultat OCR
        languageDetected: this.detectPrimaryLanguage(rawOcrResult.detectedLanguages),
        isMixedLanguage: rawOcrResult.detectedLanguages.length > 1
      };

      // Analyse complémentaire: liens juridiques (Vu, modifications, abrogations, etc.)
      try {
        const relationships = await legalRelationshipService.analyzeRelationships(extractedText);
        // enrichir les métadonnées avec un décompte simple
        (result as any).legalRelationships = {
          total: relationships.length,
          byType: relationships.reduce((acc: Record<string, number>, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
          }, {})
        };
      } catch {}

      logger.info('OCR', '✅ Extraction algérienne terminée');
      return result;
    } catch (error) {
      logger.error('OCR', '❌ Erreur extraction algérienne:', error);
      throw error;
    }
  }

  private async processAlgerianPages(rawPages: any[]): Promise<AlgerianPageResult[]> {
    return rawPages.map((rawPage, index) => {
      const pageNumber = index + 1;
      
      // Traitement des textRegions pour l'contexte algérien
      const algerianTextRegions: AlgerianTextRegion[] = (rawPage.textRegions || []).map((region: any) => {
        const text = region.text || '';
        const isArabic = this.detectArabicContent(text);
        const isFrench = this.detectFrenchContent(text);
        
        return {
          ...region,
          isArabic,
          isFrench,
          textDirection: isArabic && !isFrench ? 'rtl' : 
                       !isArabic && isFrench ? 'ltr' : 'mixed',
          processedText: this.processTextForAlgerian(text, isArabic, isFrench),
          // Enrichissement des propriétés héritées
          x: region.bbox?.x0 || 0,
          y: region.bbox?.y0 || 0,
          width: region.bbox ? (region.bbox.x1 - region.bbox.x0) : 0,
          height: region.bbox ? (region.bbox.y1 - region.bbox.y0) : 0,
          columnIndex: this.detectColumnIndex(region.bbox, rawPage.width || 1000)
        };
      });
      
      return {
        pageNumber,
        textRegions: algerianTextRegions,
        fullText: rawPage.fullText || '',
        metadata: this.createPageMetadata(algerianTextRegions, rawPage),
        confidence: rawPage.confidence || 0,
        processingTime: rawPage.processingTime || 0,
        // Propriétés de compatibilité avec DZOCRIAProcessor
        tables: [],
        tableRegions: [],
        width: rawPage.width || 1000,
        height: rawPage.height || 1400,
        borderRegion: null,
        horizontalLines: [],
        verticalLines: [],
        separatorLines: [],
        lines: algerianTextRegions.map(region => ({
          text: region.text,
          bbox: region.bbox,
          confidence: region.confidence
        }))
      };
    });
  }

  private aggregatePageTexts(pages: AlgerianPageResult[]): string {
    return pages.map(page => page.fullText).join('\n\n');
  }

  private analyzeDocumentMetadata(pages: AlgerianPageResult[], extractedText: string): AlgerianExtractionMetadata {
    const hasArabicContent = this.detectArabicContent(extractedText);
    const hasFrenchContent = this.detectFrenchContent(extractedText);
    const isBilingual = hasArabicContent && hasFrenchContent;
    const documentType = this.detectDocumentType(extractedText);
    const institutions = this.extractInstitutions(extractedText);
    const detectedLanguages = this.getDetectedLanguages(hasArabicContent, hasFrenchContent);
    
    return {
      ...this.createDefaultMetadata(),
      hasArabicContent,
      hasFrenchContent,
      isBilingual,
      documentType,
      institutions,
      detectedLanguages,
      confidence: this.calculateMetadataConfidence(extractedText),
      extractionQuality: this.assessExtractionQuality(pages, extractedText)
    };
  }

  private createDefaultMetadata(): AlgerianExtractionMetadata {
    return {
      isOfficial: false,
      isBilingual: false,
      hasArabicContent: false,
      hasFrenchContent: true,
      documentType: 'other',
      institutions: [],
      detectedLanguages: ['fra'],
      confidence: 0.8,
      // Propriétés de compatibilité
      mixedContent: false,
      isAlgerianDocument: true,
      requiresManualReview: false,
      totalPages: 1,
      processingTime: 0,
      averageConfidence: 0.8,
      extractionQuality: {
        overall: 0.8,
        textClarity: 0.8,
        structureDetection: 0.8,
        languageDetection: 0.8
      },
      title: '',
      date: '',
      number: '',
      institution: ''
    };
  }

  private calculateAverageConfidence(pages: AlgerianPageResult[]): number {
    if (pages.length === 0) return 0;
    return pages.reduce((sum, page) => sum + page.confidence, 0) / pages.length;
  }

  private detectArabicContent(text: string): boolean {
    // Détection de caractères arabes (plage Unicode 0600-06FF)
    const arabicRegex = /[\u0600-\u06FF]/g;
    return arabicRegex.test(text);
  }

  private detectFrenchContent(text: string): boolean {
    // Détection de mots français courants et patterns juridiques
    const frenchPatterns = [
      /\b(le|la|les|du|de|des|et|ou|que|qui|pour|avec|dans|sur|par|ce|cette|ces|un|une|des)\b/gi,
      /\b(république|algérienne|démocratique|populaire|président|ministre|journal|officiel)\b/gi,
      /\b(décret|arrêté|loi|ordonnance|circulaire|instruction|ministère)\b/gi
    ];
    return frenchPatterns.some(pattern => pattern.test(text));
  }

  private detectDocumentType(text: string): AlgerianExtractionMetadata['documentType'] {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('journal officiel')) return 'journal_officiel';
    if (lowerText.includes('décret')) return 'decret';
    if (lowerText.includes('arrêté')) return 'arrete';
    if (lowerText.includes('loi n°') || lowerText.includes('loi du')) return 'loi';
    if (lowerText.includes('circulaire')) return 'circulaire';
    if (lowerText.includes('instruction')) return 'instruction';
    return 'other';
  }

  private extractInstitutions(text: string): string[] {
    const institutions: string[] = [];
    const institutionPatterns = [
      /ministère\s+de\s+[^.\n]+/gi,
      /présidence\s+de\s+la\s+république/gi,
      /premier\s+ministère/gi,
      /secrétariat\s+général\s+du\s+gouvernement/gi,
      /conseil\s+des\s+ministres/gi,
      /assemblée\s+populaire\s+nationale/gi,
      /conseil\s+de\s+la\s+nation/gi
    ];

    institutionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.trim().replace(/\s+/g, ' ');
          if (!institutions.includes(cleaned)) {
            institutions.push(cleaned);
          }
        });
      }
    });

    return institutions.slice(0, 5); // Limiter à 5 institutions maximum
  }

  private getDetectedLanguages(hasArabic: boolean, hasFrench: boolean): string[] {
    const languages: string[] = [];
    if (hasFrench) languages.push('fra');
    if (hasArabic) languages.push('ara');
    return languages.length > 0 ? languages : ['fra']; // Par défaut français
  }

  private calculateMetadataConfidence(text: string): number {
    let confidence = 0.5; // Base
    
    // Bonus pour longueur de texte raisonnable
    if (text.length > 100) confidence += 0.1;
    if (text.length > 500) confidence += 0.1;
    
    // Bonus pour détection d'institutions
    const institutions = this.extractInstitutions(text);
    confidence += Math.min(institutions.length * 0.05, 0.15);
    
    // Bonus pour patterns juridiques
    const legalPatterns = /(décret|arrêté|loi|ordonnance|circulaire)/gi;
    if (legalPatterns.test(text)) confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  }

  private assessExtractionQuality(pages: AlgerianPageResult[], text: string): AlgerianExtractionMetadata['extractionQuality'] {
    const avgConfidence = this.calculateAverageConfidence(pages);
    const textQuality = this.assessTextQuality(text);
    const structureQuality = this.assessStructureQuality(text);
    const languageQuality = this.assessLanguageDetectionQuality(text);
    
    return {
      overall: (avgConfidence + textQuality + structureQuality + languageQuality) / 4,
      textClarity: textQuality,
      structureDetection: structureQuality,
      languageDetection: languageQuality
    };
  }

  private assessTextQuality(text: string): number {
    let quality = 0.5;
    
    // Pénalité pour texte trop court ou trop de caractères étranges
    if (text.length < 50) quality -= 0.2;
    
    const strangeChars = (text.match(/[^\w\s\u0600-\u06FF.,;:!?()[\]{}""''«»]/g) || []).length;
    const strangeRatio = strangeChars / text.length;
    if (strangeRatio > 0.1) quality -= 0.3;
    
    // Bonus pour structure cohérente
    if (/\n\s*\n/.test(text)) quality += 0.1; // Paragraphes
    if (/^\s*\d+[\.)]\s/m.test(text)) quality += 0.1; // Listes numérotées
    
    return Math.max(0.1, Math.min(quality, 0.95));
  }

  private assessStructureQuality(text: string): number {
    let quality = 0.5;
    
    // Détection de structure juridique
    if (/article\s+\d+/gi.test(text)) quality += 0.15;
    if (/chapitre\s+[ivx\d]+/gi.test(text)) quality += 0.1;
    if (/section\s+[ivx\d]+/gi.test(text)) quality += 0.1;
    if (/titre\s+[ivx\d]+/gi.test(text)) quality += 0.1;
    
    // Détection de dates et numéros
    if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(text)) quality += 0.05;
    if (/n°\s*\d+/gi.test(text)) quality += 0.05;
    
    return Math.min(quality, 0.95);
  }

  private assessLanguageDetectionQuality(text: string): number {
    const hasArabic = this.detectArabicContent(text);
    const hasFrench = this.detectFrenchContent(text);
    
    if (hasArabic && hasFrench) return 0.9; // Bilingue détecté
    if (hasArabic || hasFrench) return 0.8; // Une langue détectée
    return 0.6; // Aucune langue clairement détectée
  }

  /**
   * Traitement spécialisé du texte pour le contexte algérien
   */
  private processTextForAlgerian(text: string, isArabic: boolean, isFrench: boolean): string {
    let processed = text.trim();
    
    // Normalisation des espaces
    processed = processed.replace(/\s+/g, ' ');
    
    // Normalisation des caractères arabes si présents
    if (isArabic) {
      // Normalisation des caractères arabes étendus
      processed = processed
        .replace(/[أإآا]/g, 'ا') // Normalisation alif
        .replace(/[ىيئ]/g, 'ي') // Normalisation ya
        .replace(/[ةه]/g, 'ة')   // Normalisation ta marbuta
        .replace(/\u064B/g, '')  // Suppression tanwin fath
        .replace(/\u064C/g, '')  // Suppression tanwin damm
        .replace(/\u064D/g, '')  // Suppression tanwin kasr
        .replace(/\u064E/g, '')  // Suppression fatha
        .replace(/\u064F/g, '')  // Suppression damma
        .replace(/\u0650/g, '')  // Suppression kasra
        .replace(/\u0651/g, '')  // Suppression shadda
        .replace(/\u0652/g, ''); // Suppression sukun
    }
    
    // Normalisation française si présent
    if (isFrench) {
      // Correction des erreurs OCR courantes en français
      processed = processed
        .replace(/œ/g, 'oe')
        .replace(/['']/g, "'")
        .replace(/[""]/g, '"')
        .replace(/…/g, '...')
        .replace(/–/g, '-')
        .replace(/—/g, '-');
    }
    
    return processed;
  }

  /**
   * Détection de l'index de colonne basé sur la position horizontale
   */
  private detectColumnIndex(bbox: any, pageWidth: number): number {
    if (!bbox) return 0;
    
    const x = bbox.x0 || 0;
    const columnWidth = pageWidth / 2; // Supposons 2 colonnes max pour JO algériens
    
    return Math.floor(x / columnWidth);
  }

  /**
   * Création des métadonnées spécifiques à chaque page
   */
  private createPageMetadata(textRegions: AlgerianTextRegion[], rawPage: any): AlgerianExtractionMetadata {
    const pageText = textRegions.map(r => r.text).join(' ');
    const hasArabic = textRegions.some(r => r.isArabic);
    const hasFrench = textRegions.some(r => r.isFrench);
    
    return {
      ...this.createDefaultMetadata(),
      hasArabicContent: hasArabic,
      hasFrenchContent: hasFrench,
      isBilingual: hasArabic && hasFrench,
      detectedLanguages: this.getDetectedLanguages(hasArabic, hasFrench),
      confidence: rawPage.confidence || 0.8,
      processingTime: rawPage.processingTime || 0
    };
  }

  /**
   * Détermine la langue primaire à partir de la liste des langues détectées
   */
  private detectPrimaryLanguage(detectedLanguages: string[]): string {
    if (!detectedLanguages || detectedLanguages.length === 0) return 'fr';
    
    // Si plusieurs langues, retourne la première (généralement la plus fréquente)
    const primaryLang = detectedLanguages[0];
    
    // Normalisation des codes de langue
    switch (primaryLang) {
      case 'ara':
      case 'ar':
        return 'ar';
      case 'fra':
      case 'fr':
        return 'fr';
      default:
        return 'fr'; // Défaut français
    }
  }
}

export const algerianDocumentExtractionService = new AlgerianDocumentExtractionService();
export default algerianDocumentExtractionService;