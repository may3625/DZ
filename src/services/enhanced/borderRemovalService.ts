/**
 * Service de suppression des bordures (Étape 4 de l'algorithme)
 * Analyse visuelle : 3 lignes haut, 2 lignes bas, 2 lignes de chaque côté
 * Délimite l'image en éliminant les éléments visuels non essentiels
 */

import { DetectedLine } from '../imageProcessingService';

export interface BorderConfig {
  topLines: number;      // Nombre de lignes de bordure en haut (3)
  bottomLines: number;   // Nombre de lignes de bordure en bas (2)
  sideLines: number;     // Nombre de lignes de bordure sur les côtés (2)
  tolerance: number;     // Tolérance en pixels pour la détection
  marginPercent: number; // Pourcentage de marge pour la zone de recherche
}

export interface ContentRegion {
  contentX: number;
  contentY: number;
  contentWidth: number;
  contentHeight: number;
  removedBorders: {
    top: DetectedLine[];
    bottom: DetectedLine[];
    left: DetectedLine[];
    right: DetectedLine[];
  };
  confidence: number;
}

export interface BorderAnalysis {
  originalDimensions: { width: number; height: number };
  detectedBorders: {
    top: DetectedLine[];
    bottom: DetectedLine[];
    left: DetectedLine[];
    right: DetectedLine[];
  };
  contentRegion: ContentRegion;
  processingTime: number;
}

class BorderRemovalService {
  private readonly DEFAULT_CONFIG: BorderConfig = {
    topLines: 3,      // Selon l'annexe : 3 lignes horizontales en haut
    bottomLines: 2,   // Selon l'annexe : 2 lignes horizontales en bas
    sideLines: 2,     // Selon l'annexe : 2 lignes verticales de chaque côté
    tolerance: 15,    // Pixels de tolérance pour la détection
    marginPercent: 20 // Chercher dans les 20% des bords
  };

  /**
   * Étape 4 : Enlever les bordures selon l'analyse visuelle de l'annexe
   * Identifie et supprime les bordures caractéristiques des documents algériens
   */
  removeBorders(
    horizontalLines: DetectedLine[],
    verticalLines: DetectedLine[],
    pageWidth: number,
    pageHeight: number,
    config: Partial<BorderConfig> = {}
  ): BorderAnalysis {
    
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = performance.now();

    console.log('🚫 Starting border removal analysis...');
    console.log(`📏 Page dimensions: ${pageWidth}x${pageHeight}`);

    try {
      // Analyser et identifier les bordures selon les caractéristiques
      const detectedBorders = this.identifyBorders(
        horizontalLines, 
        verticalLines, 
        pageWidth, 
        pageHeight, 
        mergedConfig
      );

      // Calculer la région de contenu délimitée
      const contentRegion = this.calculateContentRegion(
        detectedBorders, 
        pageWidth, 
        pageHeight, 
        mergedConfig
      );

      const processingTime = performance.now() - startTime;

      console.log(`✅ Borders removed - Content region: ${contentRegion.contentX},${contentRegion.contentY} ${contentRegion.contentWidth}x${contentRegion.contentHeight}`);

      return {
        originalDimensions: { width: pageWidth, height: pageHeight },
        detectedBorders,
        contentRegion,
        processingTime
      };

    } catch (error) {
      console.error('❌ Border removal failed:', error);
      throw new Error(`Border removal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Identifie les bordures selon l'analyse visuelle de l'annexe
   * 3 lignes haut, 2 lignes bas, 2 lignes de chaque côté
   */
  private identifyBorders(
    horizontalLines: DetectedLine[],
    verticalLines: DetectedLine[],
    pageWidth: number,
    pageHeight: number,
    config: BorderConfig
  ): BorderAnalysis['detectedBorders'] {

    console.log('🔍 Analyzing border patterns...');

    // Calculer les zones de recherche
    const topSearchHeight = pageHeight * (config.marginPercent / 100);
    const bottomSearchHeight = pageHeight * (config.marginPercent / 100);
    const sideSearchWidth = pageWidth * (config.marginPercent / 100);

    // Identifier les bordures du haut (3 lignes selon l'annexe)
    const topBorders = this.identifyTopBorders(
      horizontalLines, 
      topSearchHeight, 
      pageWidth, 
      config
    );

    // Identifier les bordures du bas (2 lignes selon l'annexe)
    const bottomBorders = this.identifyBottomBorders(
      horizontalLines, 
      pageHeight - bottomSearchHeight, 
      pageHeight, 
      pageWidth, 
      config
    );

    // Identifier les bordures gauche (2 lignes selon l'annexe)
    const leftBorders = this.identifyLeftBorders(
      verticalLines, 
      sideSearchWidth, 
      pageHeight, 
      config
    );

    // Identifier les bordures droite (2 lignes selon l'annexe)
    const rightBorders = this.identifyRightBorders(
      verticalLines, 
      pageWidth - sideSearchWidth, 
      pageWidth, 
      pageHeight, 
      config
    );

    console.log(`📊 Borders identified: ${topBorders.length} top, ${bottomBorders.length} bottom, ${leftBorders.length} left, ${rightBorders.length} right`);

    return {
      top: topBorders,
      bottom: bottomBorders,
      left: leftBorders,
      right: rightBorders
    };
  }

  /**
   * Identifie les 3 lignes de bordure du haut
   */
  private identifyTopBorders(
    horizontalLines: DetectedLine[],
    searchHeight: number,
    pageWidth: number,
    config: BorderConfig
  ): DetectedLine[] {
    
    // Filtrer les lignes dans la zone de recherche du haut
    const candidateLines = horizontalLines
      .filter(line => line.y1 <= searchHeight)
      .filter(line => this.isLineSpanningWidth(line, pageWidth, 0.7)) // Au moins 70% de la largeur
      .sort((a, b) => a.y1 - b.y1); // Trier par position Y

    // Sélectionner les 3 premières lignes les plus probables
    const topBorders = candidateLines.slice(0, config.topLines);

    console.log(`🔝 Top borders: ${topBorders.length} lines detected in region 0-${searchHeight.toFixed(0)}px`);
    
    return topBorders;
  }

  /**
   * Identifie les 2 lignes de bordure du bas
   */
  private identifyBottomBorders(
    horizontalLines: DetectedLine[],
    searchStartY: number,
    pageHeight: number,
    pageWidth: number,
    config: BorderConfig
  ): DetectedLine[] {
    
    // Filtrer les lignes dans la zone de recherche du bas
    const candidateLines = horizontalLines
      .filter(line => line.y1 >= searchStartY)
      .filter(line => this.isLineSpanningWidth(line, pageWidth, 0.7))
      .sort((a, b) => b.y1 - a.y1); // Trier par position Y descendante

    // Sélectionner les 2 dernières lignes les plus probables
    const bottomBorders = candidateLines.slice(0, config.bottomLines);

    console.log(`🔻 Bottom borders: ${bottomBorders.length} lines detected in region ${searchStartY.toFixed(0)}-${pageHeight}px`);
    
    return bottomBorders;
  }

  /**
   * Identifie les 2 lignes de bordure gauche
   */
  private identifyLeftBorders(
    verticalLines: DetectedLine[],
    searchWidth: number,
    pageHeight: number,
    config: BorderConfig
  ): DetectedLine[] {
    
    // Filtrer les lignes dans la zone de recherche gauche
    const candidateLines = verticalLines
      .filter(line => line.x1 <= searchWidth)
      .filter(line => this.isLineSpanningHeight(line, pageHeight, 0.7))
      .sort((a, b) => a.x1 - b.x1); // Trier par position X

    // Sélectionner les 2 premières lignes les plus probables
    const leftBorders = candidateLines.slice(0, config.sideLines);

    console.log(`⬅️ Left borders: ${leftBorders.length} lines detected in region 0-${searchWidth.toFixed(0)}px`);
    
    return leftBorders;
  }

  /**
   * Identifie les 2 lignes de bordure droite
   */
  private identifyRightBorders(
    verticalLines: DetectedLine[],
    searchStartX: number,
    pageWidth: number,
    pageHeight: number,
    config: BorderConfig
  ): DetectedLine[] {
    
    // Filtrer les lignes dans la zone de recherche droite
    const candidateLines = verticalLines
      .filter(line => line.x1 >= searchStartX)
      .filter(line => this.isLineSpanningHeight(line, pageHeight, 0.7))
      .sort((a, b) => b.x1 - a.x1); // Trier par position X descendante

    // Sélectionner les 2 dernières lignes les plus probables
    const rightBorders = candidateLines.slice(0, config.sideLines);

    console.log(`➡️ Right borders: ${rightBorders.length} lines detected in region ${searchStartX.toFixed(0)}-${pageWidth}px`);
    
    return rightBorders;
  }

  /**
   * Calcule la région de contenu après suppression des bordures
   */
  private calculateContentRegion(
    borders: BorderAnalysis['detectedBorders'],
    pageWidth: number,
    pageHeight: number,
    config: BorderConfig
  ): ContentRegion {
    
    const tolerance = config.tolerance;

    // Calculer les limites basées sur les bordures détectées
    let contentX = tolerance;
    let contentY = tolerance;
    let contentWidth = pageWidth - (tolerance * 2);
    let contentHeight = pageHeight - (tolerance * 2);

    // Ajuster selon les bordures détectées
    if (borders.left.length > 0) {
      const rightmostLeftBorder = Math.max(...borders.left.map(line => line.x1));
      contentX = rightmostLeftBorder + tolerance;
    }

    if (borders.top.length > 0) {
      const bottommostTopBorder = Math.max(...borders.top.map(line => line.y1));
      contentY = bottommostTopBorder + tolerance;
    }

    if (borders.right.length > 0) {
      const leftmostRightBorder = Math.min(...borders.right.map(line => line.x1));
      contentWidth = leftmostRightBorder - contentX - tolerance;
    }

    if (borders.bottom.length > 0) {
      const topmostBottomBorder = Math.min(...borders.bottom.map(line => line.y1));
      contentHeight = topmostBottomBorder - contentY - tolerance;
    }

    // Assurer des dimensions positives
    contentWidth = Math.max(contentWidth, 100);
    contentHeight = Math.max(contentHeight, 100);

    // Calculer la confiance basée sur le nombre de bordures détectées
    const totalExpectedBorders = config.topLines + config.bottomLines + (config.sideLines * 2);
    const totalDetectedBorders = borders.top.length + borders.bottom.length + 
                                borders.left.length + borders.right.length;
    const confidence = totalDetectedBorders / totalExpectedBorders;

    return {
      contentX,
      contentY,
      contentWidth,
      contentHeight,
      removedBorders: borders,
      confidence
    };
  }

  /**
   * Vérifie si une ligne horizontale s'étend sur une largeur significative
   */
  private isLineSpanningWidth(line: DetectedLine, pageWidth: number, minRatio: number): boolean {
    const lineWidth = Math.abs(line.x2 - line.x1);
    return lineWidth >= (pageWidth * minRatio);
  }

  /**
   * Vérifie si une ligne verticale s'étend sur une hauteur significative
   */
  private isLineSpanningHeight(line: DetectedLine, pageHeight: number, minRatio: number): boolean {
    const lineHeight = Math.abs(line.y2 - line.y1);
    return lineHeight >= (pageHeight * minRatio);
  }

  /**
   * Créer une région de contenu par défaut si aucune bordure n'est détectée
   */
  createDefaultContentRegion(pageWidth: number, pageHeight: number, config: BorderConfig): ContentRegion {
    const tolerance = config.tolerance;
    
    return {
      contentX: tolerance,
      contentY: tolerance,
      contentWidth: pageWidth - (tolerance * 2),
      contentHeight: pageHeight - (tolerance * 2),
      removedBorders: {
        top: [],
        bottom: [],
        left: [],
        right: []
      },
      confidence: 0.5 // Confiance moyenne car pas de bordures détectées
    };
  }

  /**
   * Valide la région de contenu calculée
   */
  validateContentRegion(region: ContentRegion, pageWidth: number, pageHeight: number): boolean {
    return region.contentX >= 0 &&
           region.contentY >= 0 &&
           region.contentWidth > 0 &&
           region.contentHeight > 0 &&
           region.contentX + region.contentWidth <= pageWidth &&
           region.contentY + region.contentHeight <= pageHeight;
  }
}

export const borderRemovalService = new BorderRemovalService();
export default borderRemovalService;