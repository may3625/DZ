/* eslint-disable no-useless-escape */
/**
 * Service d'analyse de structure de document (Étape 8)
 * Détection de la hiérarchie et organisation des documents algériens
 * Identification des sections, articles, références et éléments structurels
 */

import { ExtractedContent } from './contentExtractionService';
import { TableExtractionResult } from './tableExtractionService';

export interface DocumentSection {
  id: string;
  type: 'title' | 'article' | 'chapter' | 'section' | 'paragraph' | 'list_item' | 'footer' | 'header';
  level: number;
  text: string;
  startPosition: number;
  endPosition: number;
  confidence: number;
  parent?: string;
  children: string[];
  numbering?: {
    type: 'numeric' | 'roman' | 'alphabetic' | 'arabic_numeric';
    value: string;
    sequence: number;
  };
}

export interface CrossReference {
  id: string;
  sourceText: string;
  targetType: 'law' | 'decree' | 'article' | 'annex' | 'external_doc';
  reference: string;
  position: number;
  confidence: number;
  isValid: boolean;
}

export interface SignatureBlock {
  id: string;
  type: 'minister' | 'director' | 'official' | 'witness';
  name?: string;
  title?: string;
  date?: string;
  location?: string;
  position: { x: number, y: number, width: number, height: number };
  confidence: number;
}

export interface DocumentStructureResult {
  pageNumber: number;
  documentType: 'decree' | 'law' | 'circular' | 'instruction' | 'procedure' | 'form' | 'unknown';
  hierarchy: DocumentSection[];
  crossReferences: CrossReference[];
  signatures: SignatureBlock[];
  metadata: {
    totalSections: number;
    averageConfidence: number;
    hasNumbering: boolean;
    isStructured: boolean;
    detectedLanguages: string[];
  };
  processingTime: number;
}

export interface StructureAnalysisConfig {
  enableHierarchyDetection: boolean;
  enableCrossReferenceExtraction: boolean;
  enableSignatureDetection: boolean;
  confidenceThreshold: number;
  maxHierarchyLevels: number;
}

class DocumentStructureService {
  private readonly DEFAULT_CONFIG: StructureAnalysisConfig = {
    enableHierarchyDetection: true,
    enableCrossReferenceExtraction: true,
    enableSignatureDetection: true,
    confidenceThreshold: 0.7,
    maxHierarchyLevels: 6
  };

  // Patterns pour documents algériens
  private readonly ALGERIAN_PATTERNS = {
    decree: /(?:arrêté|décret|ordonnance)\s*(?:n°|numéro|num)\s*(\d+[-/]\d+)/i,
    law: /(?:loi|code)\s*(?:n°|numéro|num)\s*(\d+[-/]\d+)/i,
    circular: /(?:circulaire|instruction)\s*(?:n°|numéro|num)\s*(\d+[-/]\d+)/i,
    article: /(?:article|art\.?)\s*(\d+)/i,
    chapter: /(?:chapitre|titre|section)\s*(\d+|[ivxlcdm]+)/i,
    numbering: {
      arabic: /^(\d+)[\.\-\)]/,
      roman: /^([ivxlcdm]+)[\.\-\)]/i,
      alphabetic: /^([a-z])[\.\-\)]/i,
      bullets: /^[•\-\*\+]/
    }
  };

  /**
   * Étape 8 : Analyse complète de la structure du document
   */
  async analyzeDocumentStructure(
    extractionResult: ExtractedContent,
    tableResult?: TableExtractionResult,
    config: Partial<StructureAnalysisConfig> = {}
  ): Promise<DocumentStructureResult> {
    
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = performance.now();

    console.log('🏗️ Starting document structure analysis...');

    try {
      // Déterminer le type de document
      const documentType = this.detectDocumentType(extractionResult.overallText || '');

      // Analyser la hiérarchie si activé
      const hierarchy = mergedConfig.enableHierarchyDetection
        ? this.analyzeHierarchy(extractionResult.overallText || '', mergedConfig)
        : [];

      // Extraire les références croisées si activé
      const crossReferences = mergedConfig.enableCrossReferenceExtraction
        ? this.extractCrossReferences(extractionResult.overallText || '', mergedConfig)
        : [];

      // Détecter les blocs de signature si activé
      const signatures = mergedConfig.enableSignatureDetection
        ? this.detectSignatureBlocks(extractionResult.textRegions || [], mergedConfig)
        : [];

      // Calculer les métadonnées
      const metadata = this.calculateMetadata(hierarchy, extractionResult);

      const processingTime = performance.now() - startTime;

      console.log(`✅ Document structure analysis completed in ${processingTime.toFixed(2)}ms`);
      console.log(`📊 Found: ${hierarchy.length} sections, ${crossReferences.length} references, ${signatures.length} signatures`);

      return {
        pageNumber: 1,
        documentType,
        hierarchy,
        crossReferences,
        signatures,
        metadata,
        processingTime
      };

    } catch (error) {
      console.error('❌ Document structure analysis failed:', error);
      throw new Error(`Document structure analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Détection du type de document
   */
  private detectDocumentType(text: string): DocumentStructureResult['documentType'] {
    const lowercaseText = text.toLowerCase();

    if (this.ALGERIAN_PATTERNS.decree.test(lowercaseText)) {
      return 'decree';
    }
    
    if (this.ALGERIAN_PATTERNS.law.test(lowercaseText)) {
      return 'law';
    }
    
    if (this.ALGERIAN_PATTERNS.circular.test(lowercaseText)) {
      return 'circular';
    }
    
    if (lowercaseText.includes('instruction') && lowercaseText.includes('procédure')) {
      return 'instruction';
    }
    
    if (lowercaseText.includes('formulaire') || lowercaseText.includes('demande')) {
      return 'form';
    }
    
    if (lowercaseText.includes('procédure') || lowercaseText.includes('démarche')) {
      return 'procedure';
    }
    
    return 'unknown';
  }

  /**
   * Analyse de la hiérarchie du document
   */
  private analyzeHierarchy(text: string, config: StructureAnalysisConfig): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    let sectionCounter = 0;
    const hierarchyStack: DocumentSection[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.length < 3) continue; // Ignorer lignes trop courtes

      // Analyser le type et niveau de la ligne
      const sectionInfo = this.analyzeSectionType(line);
      
      if (sectionInfo) {
        const section: DocumentSection = {
          id: `section_${sectionCounter++}`,
          type: sectionInfo.type,
          level: sectionInfo.level,
          text: line,
          startPosition: text.indexOf(line),
          endPosition: text.indexOf(line) + line.length,
          confidence: sectionInfo.confidence,
          children: [],
          numbering: sectionInfo.numbering
        };

        // Gérer la hiérarchie
        this.updateHierarchy(section, hierarchyStack, config);
        sections.push(section);
      }
    }

    return sections;
  }

  /**
   * Analyse du type de section
   */
  private analyzeSectionType(line: string): {
    type: DocumentSection['type'],
    level: number,
    confidence: number,
    numbering?: DocumentSection['numbering']
  } | null {
    
    // Détection des titres (texte en majuscules, centré)
    if (line === line.toUpperCase() && line.length > 10) {
      return {
        type: 'title',
        level: 1,
        confidence: 0.9
      };
    }

    // Détection des articles
    const articleMatch = this.ALGERIAN_PATTERNS.article.exec(line);
    if (articleMatch) {
      return {
        type: 'article',
        level: 2,
        confidence: 0.95,
        numbering: {
          type: 'numeric',
          value: articleMatch[1],
          sequence: parseInt(articleMatch[1])
        }
      };
    }

    // Détection des chapitres
    const chapterMatch = this.ALGERIAN_PATTERNS.chapter.exec(line);
    if (chapterMatch) {
      return {
        type: 'chapter',
        level: 1,
        confidence: 0.9,
        numbering: {
          type: isNaN(parseInt(chapterMatch[1])) ? 'roman' : 'numeric',
          value: chapterMatch[1],
          sequence: isNaN(parseInt(chapterMatch[1])) ? 0 : parseInt(chapterMatch[1])
        }
      };
    }

    // Détection des listes numérotées
    for (const [type, pattern] of Object.entries(this.ALGERIAN_PATTERNS.numbering)) {
      const match = pattern.exec(line);
      if (match) {
        return {
          type: 'list_item',
          level: 3,
          confidence: 0.8,
          numbering: {
            type: type as any,
            value: match[1] || '',
            sequence: type === 'arabic' ? parseInt(match[1]) : 0
          }
        };
      }
    }

    // Détection des paragraphes longs (potentiels articles)
    if (line.length > 100 && /^[A-Z]/.test(line)) {
      return {
        type: 'paragraph',
        level: 3,
        confidence: 0.6
      };
    }

    return null;
  }

  /**
   * Mise à jour de la hiérarchie
   */
  private updateHierarchy(
    section: DocumentSection,
    hierarchyStack: DocumentSection[],
    config: StructureAnalysisConfig
  ): void {
    
    // Nettoyer la pile selon le niveau
    while (hierarchyStack.length > 0 && hierarchyStack[hierarchyStack.length - 1].level >= section.level) {
      hierarchyStack.pop();
    }

    // Établir relation parent-enfant
    if (hierarchyStack.length > 0) {
      const parent = hierarchyStack[hierarchyStack.length - 1];
      section.parent = parent.id;
      parent.children.push(section.id);
    }

    // Ajouter à la pile si niveau approprié
    if (section.level <= config.maxHierarchyLevels) {
      hierarchyStack.push(section);
    }
  }

  /**
   * Extraction des références croisées
   */
  private extractCrossReferences(text: string, config: StructureAnalysisConfig): CrossReference[] {
    const references: CrossReference[] = [];
    let refCounter = 0;

    // Patterns pour références algériennes
    const referencePatterns = [
      {
        pattern: /(?:loi|décret|arrêté)\s*(?:n°|numéro|num)\s*(\d+[-/]\d+)/gi,
        type: 'law' as const
      },
      {
        pattern: /(?:article|art\.?)\s*(\d+)/gi,
        type: 'article' as const
      },
      {
        pattern: /(?:annexe|annex)\s*(\d+|[ivxlcdm]+)/gi,
        type: 'annex' as const
      },
      {
        pattern: /(?:voir|cf\.?|référence)\s*([^\n\.]+)/gi,
        type: 'external_doc' as const
      }
    ];

    for (const { pattern, type } of referencePatterns) {
      let match;
      pattern.lastIndex = 0; // Reset regex

      while ((match = pattern.exec(text)) !== null) {
        const reference: CrossReference = {
          id: `ref_${refCounter++}`,
          sourceText: match[0],
          targetType: type,
          reference: match[1] || match[0],
          position: match.index,
          confidence: this.calculateReferenceConfidence(match[0], type),
          isValid: this.validateReference(match[0], type)
        };

        if (reference.confidence >= config.confidenceThreshold) {
          references.push(reference);
        }
      }
    }

    return references;
  }

  /**
   * Calcul de confiance pour référence
   */
  private calculateReferenceConfidence(referenceText: string, type: CrossReference['targetType']): number {
    let confidence = 0.5;

    // Bonus pour format correct
    if (type === 'law' && /\d+[-/]\d+/.test(referenceText)) {
      confidence += 0.3;
    }

    // Bonus pour mots-clés reconnus
    if (/(?:loi|décret|arrêté|article)/.test(referenceText.toLowerCase())) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Validation de référence
   */
  private validateReference(referenceText: string, type: CrossReference['targetType']): boolean {
    // Validation basique - peut être étendue avec base de données
    const minLength = type === 'article' ? 3 : 5;
    return referenceText.length >= minLength && !/^\d+$/.test(referenceText);
  }

  /**
   * Détection des blocs de signature
   */
  private detectSignatureBlocks(regions: any[], config: StructureAnalysisConfig): SignatureBlock[] {
    const signatures: SignatureBlock[] = [];
    let sigCounter = 0;

    // Chercher dans les régions de type signature ou footer
    const candidateRegions = regions.filter(region => 
      region.type === 'signature' || 
      region.type === 'footer' ||
      (region.y > regions[0]?.y * 0.8) // Bas de page
    );

    for (const region of candidateRegions) {
      if (!region.text) continue;

      const signatureInfo = this.analyzeSignatureContent(region.text);
      
      if (signatureInfo && signatureInfo.confidence >= config.confidenceThreshold) {
        const signature: SignatureBlock = {
          id: `sig_${sigCounter++}`,
          type: signatureInfo.type,
          name: signatureInfo.name,
          title: signatureInfo.title,
          date: signatureInfo.date,
          location: signatureInfo.location,
          position: {
            x: region.x,
            y: region.y,
            width: region.width,
            height: region.height
          },
          confidence: signatureInfo.confidence
        };

        signatures.push(signature);
      }
    }

    return signatures;
  }

  /**
   * Analyse du contenu de signature
   */
  private analyzeSignatureContent(text: string): {
    type: SignatureBlock['type'],
    name?: string,
    title?: string,
    date?: string,
    location?: string,
    confidence: number
  } | null {
    
    const lowercaseText = text.toLowerCase();
    let confidence = 0.3;
    let type: SignatureBlock['type'] = 'official';

    // Détection du type de signataire
    if (lowercaseText.includes('ministre')) {
      type = 'minister';
      confidence += 0.4;
    } else if (lowercaseText.includes('directeur') || lowercaseText.includes('chef')) {
      type = 'director';
      confidence += 0.3;
    } else if (lowercaseText.includes('témoin')) {
      type = 'witness';
      confidence += 0.2;
    }

    // Extraction des informations
    const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    const date = dateMatch ? dateMatch[1] : undefined;
    if (date) confidence += 0.2;

    // Recherche nom/titre (lignes contenant majuscules)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const nameTitle = lines.find(line => /^[A-Z][a-zA-ZÀ-ÿ\s]+$/.test(line));
    
    if (nameTitle) confidence += 0.2;

    return confidence >= 0.5 ? {
      type,
      name: nameTitle,
      date,
      confidence
    } : null;
  }

  /**
   * Calcul des métadonnées
   */
  private calculateMetadata(
    hierarchy: DocumentSection[],
    extractionResult: ExtractedContent
  ) {
    const hasNumbering = hierarchy.some(section => section.numbering);
    const isStructured = hierarchy.length > 2 && hasNumbering;
    const averageConfidence = hierarchy.length > 0
      ? hierarchy.reduce((sum, section) => sum + section.confidence, 0) / hierarchy.length
      : 0;

    return {
      totalSections: hierarchy.length,
      averageConfidence,
      hasNumbering,
      isStructured,
      detectedLanguages: ['fr', 'ar'] // Default languages for Algerian documents
    };
  }
}

export const documentStructureService = new DocumentStructureService();
export default documentStructureService;