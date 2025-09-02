/**
 * Service d'Agrégation Avancée de Textes
 * Améliore l'agrégation automatique des pages avec algorithmes intelligents
 */

import { AlgerianTextRegion, AlgerianPageResult } from './algerianDocumentExtractionService';

export interface AggregationConfig {
  enableSmartColumnDetection: boolean;
  enableContextualMerging: boolean;
  enableDuplicateDetection: boolean;
  enableStructureAnalysis: boolean;
  confidenceThreshold: number;
  proximityThreshold: number; // pixels
  similarityThreshold: number; // 0-1
  maxGapSize: number; // pixels
  columnDetectionSensitivity: number; // 0-1
}

export interface AggregationResult {
  aggregatedText: string;
  originalPages: AlgerianPageResult[];
  aggregationMetrics: {
    totalRegions: number;
    mergedRegions: number;
    duplicatesRemoved: number;
    columnsDetected: number;
    processingTime: number;
    confidenceScore: number;
  };
  structureInfo: {
    hasColumns: boolean;
    columnCount: number;
    hasHeaders: boolean;
    hasTables: boolean;
    documentFlow: 'linear' | 'columnar' | 'mixed';
  };
  processingSteps: string[];
}

export interface TextBlock {
  id: string;
  text: string;
  regions: AlgerianTextRegion[];
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  type: 'header' | 'paragraph' | 'list' | 'table' | 'footer';
  column: number;
  readingOrder: number;
  isRTL: boolean;
  metadata: {
    fontSize?: number;
    fontWeight?: string;
    alignment?: 'left' | 'center' | 'right';
    indentation?: number;
  };
}

class AdvancedTextAggregationService {
  private config: AggregationConfig = {
    enableSmartColumnDetection: true,
    enableContextualMerging: true,
    enableDuplicateDetection: true,
    enableStructureAnalysis: true,
    confidenceThreshold: 0.7,
    proximityThreshold: 20,
    similarityThreshold: 0.8,
    maxGapSize: 50,
    columnDetectionSensitivity: 0.6
  };

  updateConfig(newConfig: Partial<AggregationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Agrégation avancée des pages avec algorithmes intelligents
   */
  async aggregatePages(pages: AlgerianPageResult[]): Promise<AggregationResult> {
    const startTime = performance.now();
    const processingSteps: string[] = [];

    try {
      processingSteps.push('Initialisation agrégation avancée');
      
      // 1. Analyser la structure globale du document
      const documentStructure = this.analyzeDocumentStructure(pages);
      processingSteps.push('Analyse structure globale');

      // 2. Détecter les colonnes sur chaque page
      const pagesWithColumns = this.detectColumnsInPages(pages);
      processingSteps.push('Détection colonnes multi-pages');

      // 3. Créer des blocs de texte intelligents
      const textBlocks = this.createIntelligentTextBlocks(pagesWithColumns);
      processingSteps.push('Création blocs texte intelligents');

      // 4. Établir l'ordre de lecture optimal
      const orderedBlocks = this.establishReadingOrder(textBlocks, documentStructure);
      processingSteps.push('Établissement ordre lecture');

      // 5. Fusion contextuelle des blocs
      const mergedBlocks = this.performContextualMerging(orderedBlocks);
      processingSteps.push('Fusion contextuelle');

      // 6. Détection et suppression des doublons
      const deduplicatedBlocks = this.removeDuplicates(mergedBlocks);
      processingSteps.push('Suppression doublons');

      // 7. Génération du texte final
      const finalText = this.generateFinalText(deduplicatedBlocks, documentStructure);
      processingSteps.push('Génération texte final');

      // 8. Calcul des métriques
      const metrics = this.calculateAggregationMetrics(
        pages,
        textBlocks,
        mergedBlocks,
        deduplicatedBlocks,
        performance.now() - startTime
      );

      return {
        aggregatedText: finalText,
        originalPages: pages,
        aggregationMetrics: metrics,
        structureInfo: documentStructure,
        processingSteps
      };

    } catch (error) {
      console.error('Erreur agrégation avancée:', error);
      throw error;
    }
  }

  /**
   * Analyse de la structure globale du document
   */
  private analyzeDocumentStructure(pages: AlgerianPageResult[]): AggregationResult['structureInfo'] {
    let totalRegions = 0;
    let wideRegions = 0; // Régions qui couvrent plus de 60% de la largeur
    let hasHeaders = false;
    let hasTables = false;

    for (const page of pages) {
      totalRegions += page.textRegions.length;
      
      for (const region of page.textRegions) {
        const regionWidth = region.width || 0;
        const pageWidth = page.width || 1000;
        
        // Détecter les en-têtes (généralement en haut et centrés)
        if (region.y < pageWidth * 0.2 && regionWidth > pageWidth * 0.5) {
          hasHeaders = true;
        }

        // Détecter les régions larges (indices de structure simple)
        if (regionWidth > pageWidth * 0.6) {
          wideRegions++;
        }

        // Détecter les tables (structure plus complexe à implémenter)
        if (page.tables && page.tables.length > 0) {
          hasTables = true;
        }
      }
    }

    // Détermine le type de flux du document
    const wideRegionRatio = totalRegions > 0 ? wideRegions / totalRegions : 0;
    let documentFlow: 'linear' | 'columnar' | 'mixed' = 'linear';
    
    if (wideRegionRatio > 0.7) {
      documentFlow = 'linear';
    } else if (wideRegionRatio < 0.3) {
      documentFlow = 'columnar';
    } else {
      documentFlow = 'mixed';
    }

    // Estimation du nombre de colonnes
    const avgRegionsPerPage = totalRegions / pages.length;
    let columnCount = 1;
    
    if (documentFlow === 'columnar') {
      columnCount = Math.max(2, Math.min(4, Math.round(avgRegionsPerPage / 10)));
    } else if (documentFlow === 'mixed') {
      columnCount = 2;
    }

    return {
      hasColumns: documentFlow !== 'linear',
      columnCount,
      hasHeaders,
      hasTables,
      documentFlow
    };
  }

  /**
   * Détection intelligente des colonnes
   */
  private detectColumnsInPages(pages: AlgerianPageResult[]): AlgerianPageResult[] {
    if (!this.config.enableSmartColumnDetection) {
      return pages;
    }

    return pages.map(page => {
      const enhancedRegions = page.textRegions.map(region => {
        // Algorithme amélioré de détection de colonnes
        const pageWidth = page.width || 1000;
        const regionX = region.x || 0;
        const regionWidth = region.width || 0;
        
        // Analyse de la position horizontale pour déterminer la colonne
        let columnIndex = 0;
        const columnWidth = pageWidth / 2; // Supposons 2 colonnes par défaut
        
        if (regionX > pageWidth * 0.55) {
          columnIndex = 1; // Colonne droite
        } else if (regionX < pageWidth * 0.45 && regionX + regionWidth < pageWidth * 0.55) {
          columnIndex = 0; // Colonne gauche
        } else {
          // Région qui s'étend sur plusieurs colonnes
          columnIndex = -1; // Indicateur de région multi-colonnes
        }

        return {
          ...region,
          columnIndex,
          enhancedMetadata: {
            isMultiColumn: columnIndex === -1,
            relativePosition: regionX / pageWidth,
            widthRatio: regionWidth / pageWidth
          }
        };
      });

      return {
        ...page,
        textRegions: enhancedRegions
      };
    });
  }

  /**
   * Création de blocs de texte intelligents
   */
  private createIntelligentTextBlocks(pages: AlgerianPageResult[]): TextBlock[] {
    const blocks: TextBlock[] = [];
    let blockIdCounter = 0;

    for (const page of pages) {
      const pageBlocks = this.groupRegionsIntoBlocks(page.textRegions, page.pageNumber);
      
      for (const block of pageBlocks) {
        blocks.push({
          id: `block_${blockIdCounter++}`,
          text: block.regions.map(r => r.text).join(' '),
          regions: block.regions,
          bounds: this.calculateBlockBounds(block.regions),
          confidence: this.calculateBlockConfidence(block.regions),
          type: this.classifyBlockType(block.regions),
          column: this.determineBlockColumn(block.regions),
          readingOrder: 0, // À déterminer plus tard
          isRTL: block.regions.some(r => r.isArabic),
          metadata: this.extractBlockMetadata(block.regions)
        });
      }
    }

    return blocks;
  }

  /**
   * Regroupement des régions en blocs cohérents
   */
  private groupRegionsIntoBlocks(regions: AlgerianTextRegion[], pageNumber: number): { regions: AlgerianTextRegion[] }[] {
    if (regions.length === 0) return [];

    const blocks: { regions: AlgerianTextRegion[] }[] = [];
    const processed = new Set<number>();
    
    for (let i = 0; i < regions.length; i++) {
      if (processed.has(i)) continue;

      const currentBlock = [regions[i]];
      processed.add(i);

      // Chercher les régions adjacentes
      for (let j = i + 1; j < regions.length; j++) {
        if (processed.has(j)) continue;

        if (this.areRegionsAdjacent(regions[i], regions[j])) {
          currentBlock.push(regions[j]);
          processed.add(j);
        }
      }

      blocks.push({ regions: currentBlock });
    }

    return blocks;
  }

  /**
   * Vérification d'adjacence entre régions
   */
  private areRegionsAdjacent(region1: AlgerianTextRegion, region2: AlgerianTextRegion): boolean {
    const threshold = this.config.proximityThreshold;
    
    const r1 = {
      x: region1.x || 0,
      y: region1.y || 0,
      width: region1.width || 0,
      height: region1.height || 0
    };
    
    const r2 = {
      x: region2.x || 0,
      y: region2.y || 0,
      width: region2.width || 0,
      height: region2.height || 0
    };

    // Vérifier la proximité verticale
    const verticalGap = Math.abs(r1.y - (r2.y + r2.height));
    const horizontalOverlap = Math.min(r1.x + r1.width, r2.x + r2.width) - Math.max(r1.x, r2.x);

    return verticalGap < threshold && horizontalOverlap > 0;
  }

  /**
   * Établissement de l'ordre de lecture optimal
   */
  private establishReadingOrder(blocks: TextBlock[], structure: AggregationResult['structureInfo']): TextBlock[] {
    if (structure.documentFlow === 'linear') {
      return this.establishLinearReadingOrder(blocks);
    } else if (structure.documentFlow === 'columnar') {
      return this.establishColumnarReadingOrder(blocks);
    } else {
      return this.establishMixedReadingOrder(blocks);
    }
  }

  /**
   * Ordre de lecture linéaire (de haut en bas)
   */
  private establishLinearReadingOrder(blocks: TextBlock[]): TextBlock[] {
    return blocks
      .sort((a, b) => a.bounds.y - b.bounds.y)
      .map((block, index) => ({ ...block, readingOrder: index }));
  }

  /**
   * Ordre de lecture en colonnes
   */
  private establishColumnarReadingOrder(blocks: TextBlock[]): TextBlock[] {
    const sortedBlocks = [...blocks];
    
    // Grouper par colonnes puis trier par position verticale
    const columnGroups = this.groupBlocksByColumn(sortedBlocks);
    const orderedBlocks: TextBlock[] = [];
    let orderCounter = 0;

    // Pour chaque colonne, traiter de haut en bas
    for (const columnBlocks of columnGroups) {
      const sortedColumnBlocks = columnBlocks.sort((a, b) => a.bounds.y - b.bounds.y);
      
      for (const block of sortedColumnBlocks) {
        orderedBlocks.push({ ...block, readingOrder: orderCounter++ });
      }
    }

    return orderedBlocks;
  }

  /**
   * Ordre de lecture mixte
   */
  private establishMixedReadingOrder(blocks: TextBlock[]): TextBlock[] {
    // Algorithme hybride qui adapte l'ordre selon le type de bloc
    const orderedBlocks: TextBlock[] = [];
    let orderCounter = 0;

    // D'abord les en-têtes
    const headers = blocks.filter(b => b.type === 'header').sort((a, b) => a.bounds.y - b.bounds.y);
    headers.forEach(block => {
      orderedBlocks.push({ ...block, readingOrder: orderCounter++ });
    });

    // Ensuite le contenu principal en respectant les colonnes
    const content = blocks.filter(b => b.type !== 'header' && b.type !== 'footer');
    const contentByColumns = this.groupBlocksByColumn(content);
    
    for (const columnBlocks of contentByColumns) {
      const sortedColumnBlocks = columnBlocks.sort((a, b) => a.bounds.y - b.bounds.y);
      sortedColumnBlocks.forEach(block => {
        orderedBlocks.push({ ...block, readingOrder: orderCounter++ });
      });
    }

    // Enfin les pieds de page
    const footers = blocks.filter(b => b.type === 'footer').sort((a, b) => a.bounds.y - b.bounds.y);
    footers.forEach(block => {
      orderedBlocks.push({ ...block, readingOrder: orderCounter++ });
    });

    return orderedBlocks;
  }

  /**
   * Fusion contextuelle des blocs
   */
  private performContextualMerging(blocks: TextBlock[]): TextBlock[] {
    if (!this.config.enableContextualMerging) {
      return blocks;
    }

    const mergedBlocks: TextBlock[] = [];
    const processed = new Set<string>();

    for (const block of blocks) {
      if (processed.has(block.id)) continue;

      let currentBlock = block;
      processed.add(block.id);

      // Chercher les blocs à fusionner
      for (const otherBlock of blocks) {
        if (processed.has(otherBlock.id)) continue;

        if (this.shouldMergeBlocks(currentBlock, otherBlock)) {
          currentBlock = this.mergeTextBlocks(currentBlock, otherBlock);
          processed.add(otherBlock.id);
        }
      }

      mergedBlocks.push(currentBlock);
    }

    return mergedBlocks;
  }

  /**
   * Détermine si deux blocs doivent être fusionnés
   */
  private shouldMergeBlocks(block1: TextBlock, block2: TextBlock): boolean {
    // Même colonne et types compatibles
    if (block1.column !== block2.column) return false;
    if (block1.type !== block2.type) return false;
    
    // Proximité verticale
    const verticalGap = Math.abs(block1.bounds.y - block2.bounds.y);
    if (verticalGap > this.config.maxGapSize) return false;
    
    // Continuité textuelle
    const textSimilarity = this.calculateTextContinuity(block1.text, block2.text);
    
    return textSimilarity > this.config.similarityThreshold;
  }

  /**
   * Fusion de deux blocs de texte
   */
  private mergeTextBlocks(block1: TextBlock, block2: TextBlock): TextBlock {
    return {
      ...block1,
      text: `${block1.text} ${block2.text}`,
      regions: [...block1.regions, ...block2.regions],
      bounds: this.mergeBounds(block1.bounds, block2.bounds),
      confidence: (block1.confidence + block2.confidence) / 2,
      readingOrder: Math.min(block1.readingOrder, block2.readingOrder)
    };
  }

  /**
   * Suppression des doublons
   */
  private removeDuplicates(blocks: TextBlock[]): TextBlock[] {
    if (!this.config.enableDuplicateDetection) {
      return blocks;
    }

    const uniqueBlocks: TextBlock[] = [];
    const seenTexts = new Set<string>();

    for (const block of blocks) {
      const normalizedText = this.normalizeTextForComparison(block.text);
      
      if (!seenTexts.has(normalizedText)) {
        seenTexts.add(normalizedText);
        uniqueBlocks.push(block);
      }
    }

    return uniqueBlocks;
  }

  /**
   * Génération du texte final
   */
  private generateFinalText(blocks: TextBlock[], structure: AggregationResult['structureInfo']): string {
    const sortedBlocks = blocks.sort((a, b) => a.readingOrder - b.readingOrder);
    
    let finalText = '';
    let previousType: string | null = null;

    for (const block of sortedBlocks) {
      // Ajouter des séparateurs appropriés selon le type
      if (previousType && this.needsSeparator(previousType, block.type)) {
        finalText += '\n\n';
      } else if (finalText.length > 0) {
        finalText += '\n';
      }

      finalText += block.text;
      previousType = block.type;
    }

    return finalText.trim();
  }

  // === MÉTHODES UTILITAIRES ===

  private calculateBlockBounds(regions: AlgerianTextRegion[]): TextBlock['bounds'] {
    if (regions.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const minX = Math.min(...regions.map(r => r.x || 0));
    const minY = Math.min(...regions.map(r => r.y || 0));
    const maxX = Math.max(...regions.map(r => (r.x || 0) + (r.width || 0)));
    const maxY = Math.max(...regions.map(r => (r.y || 0) + (r.height || 0)));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  private calculateBlockConfidence(regions: AlgerianTextRegion[]): number {
    if (regions.length === 0) return 0;
    
    const totalConfidence = regions.reduce((sum, r) => sum + (r.confidence || 0), 0);
    return totalConfidence / regions.length;
  }

  private classifyBlockType(regions: AlgerianTextRegion[]): TextBlock['type'] {
    // Classification basique - peut être améliorée
    const avgY = regions.reduce((sum, r) => sum + (r.y || 0), 0) / regions.length;
    const text = regions.map(r => r.text).join(' ');
    
    if (avgY < 100 && text.length < 100) {
      return 'header';
    } else if (text.match(/^\s*[-•]\s/)) {
      return 'list';
    } else if (avgY > 800) {
      return 'footer';
    }
    
    return 'paragraph';
  }

  private determineBlockColumn(regions: AlgerianTextRegion[]): number {
    if (regions.length === 0) return 0;
    
    // Utiliser la colonne de la première région ou calculer la moyenne
    const firstRegion = regions[0] as any;
    return firstRegion.columnIndex || 0;
  }

  private extractBlockMetadata(regions: AlgerianTextRegion[]): TextBlock['metadata'] {
    return {
      fontSize: 12, // Valeur par défaut
      fontWeight: 'normal',
      alignment: 'left',
      indentation: 0
    };
  }

  private groupBlocksByColumn(blocks: TextBlock[]): TextBlock[][] {
    const columnGroups: { [key: number]: TextBlock[] } = {};
    
    for (const block of blocks) {
      if (!columnGroups[block.column]) {
        columnGroups[block.column] = [];
      }
      columnGroups[block.column].push(block);
    }
    
    return Object.values(columnGroups);
  }

  private calculateTextContinuity(text1: string, text2: string): number {
    // Algorithme simple de continuité textuelle
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const lastWords1 = words1.slice(-3);
    const firstWords2 = words2.slice(0, 3);
    
    let matches = 0;
    for (const word of lastWords1) {
      if (firstWords2.includes(word)) {
        matches++;
      }
    }
    
    return matches / Math.max(lastWords1.length, firstWords2.length);
  }

  private mergeBounds(bounds1: TextBlock['bounds'], bounds2: TextBlock['bounds']): TextBlock['bounds'] {
    const minX = Math.min(bounds1.x, bounds2.x);
    const minY = Math.min(bounds1.y, bounds2.y);
    const maxX = Math.max(bounds1.x + bounds1.width, bounds2.x + bounds2.width);
    const maxY = Math.max(bounds1.y + bounds1.height, bounds2.y + bounds2.height);
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  private normalizeTextForComparison(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
  }

  private needsSeparator(previousType: string, currentType: string): boolean {
    // Ajouter des séparateurs entre certains types de blocs
    const separatorNeeded: { [key: string]: string[] } = {
      'header': ['paragraph', 'list'],
      'paragraph': ['header', 'list'],
      'list': ['header', 'paragraph']
    };
    
    return separatorNeeded[previousType]?.includes(currentType) || false;
  }

  private calculateAggregationMetrics(
    originalPages: AlgerianPageResult[],
    textBlocks: TextBlock[],
    mergedBlocks: TextBlock[],
    finalBlocks: TextBlock[],
    processingTime: number
  ): AggregationResult['aggregationMetrics'] {
    const totalRegions = originalPages.reduce((sum, page) => sum + page.textRegions.length, 0);
    const mergedRegions = textBlocks.length - mergedBlocks.length;
    const duplicatesRemoved = mergedBlocks.length - finalBlocks.length;
    
    const avgConfidence = finalBlocks.length > 0
      ? finalBlocks.reduce((sum, block) => sum + block.confidence, 0) / finalBlocks.length
      : 0;

    const uniqueColumns = new Set(finalBlocks.map(block => block.column)).size;

    return {
      totalRegions,
      mergedRegions,
      duplicatesRemoved,
      columnsDetected: uniqueColumns,
      processingTime,
      confidenceScore: avgConfidence
    };
  }
}

export const advancedTextAggregationService = new AdvancedTextAggregationService();