/**
 * Service de détection des lignes verticales séparatrices de texte (Étape 5)
 * Filtre les lignes verticales selon les critères de l'annexe :
 * - Lignes situées près du centre de la page
 * - Exclut les lignes qui croisent des horizontales (structures tabulaires)
 * - Utilise une marge d'erreur ε pour compenser les imperfections
 */

import { DetectedLine } from '../imageProcessingService';
import { ContentRegion } from './borderRemovalService';

export interface SeparatorDetectionConfig {
  centerTolerance: number;        // Marge d'erreur ε autour du centre (pixels)
  minimumHeight: number;          // Hauteur minimale d'un séparateur (pourcentage)
  intersectionTolerance: number;  // Tolérance pour détecter les intersections
  confidenceThreshold: number;    // Seuil de confiance minimum
}

export interface SeparatorAnalysis {
  detectedSeparators: DetectedLine[];
  rejectedLines: Array<{
    line: DetectedLine;
    reason: 'outside_center' | 'intersects_table' | 'too_short' | 'low_confidence';
  }>;
  centerRegion: {
    centerX: number;
    toleranceZone: { left: number; right: number };
  };
  processingTime: number;
  confidence: number;
}

class TextSeparatorDetector {
  private readonly DEFAULT_CONFIG: SeparatorDetectionConfig = {
    centerTolerance: 50,    // 50 pixels autour du centre
    minimumHeight: 0.6,     // Au moins 60% de la hauteur de la page
    intersectionTolerance: 10, // 10 pixels pour détecter intersections
    confidenceThreshold: 0.7
  };

  /**
   * Étape 5 : Détecter lignes verticales séparatrices de texte
   * Divise le texte en colonnes distinctes selon l'algorithme
   */
  detectTextSeparators(
    verticalLines: DetectedLine[],
    horizontalLines: DetectedLine[],
    contentRegion: ContentRegion,
    config: Partial<SeparatorDetectionConfig> = {}
  ): SeparatorAnalysis {
    
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = performance.now();

    console.log('📏 Starting text separator detection...');
    console.log(`📐 Content region: ${contentRegion.contentWidth}x${contentRegion.contentHeight}`);

    try {
      // Calculer la région centrale avec tolérance
      const centerAnalysis = this.calculateCenterRegion(contentRegion, mergedConfig);

      // Analyser chaque ligne verticale selon les critères
      const analysisResult = this.analyzeVerticalLines(
        verticalLines,
        horizontalLines,
        contentRegion,
        centerAnalysis,
        mergedConfig
      );

      const processingTime = performance.now() - startTime;

      console.log(`✅ Text separators detected: ${analysisResult.separators.length} valid separators found`);

      return {
        detectedSeparators: analysisResult.separators,
        rejectedLines: analysisResult.rejected,
        centerRegion: centerAnalysis,
        processingTime,
        confidence: this.calculateOverallConfidence(analysisResult.separators, verticalLines)
      };

    } catch (error) {
      console.error('❌ Text separator detection failed:', error);
      throw new Error(`Text separator detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calcule la région centrale avec marge d'erreur ε
   */
  private calculateCenterRegion(
    contentRegion: ContentRegion,
    config: SeparatorDetectionConfig
  ): SeparatorAnalysis['centerRegion'] {
    
    const centerX = contentRegion.contentX + (contentRegion.contentWidth / 2);
    const tolerance = config.centerTolerance;

    const toleranceZone = {
      left: centerX - tolerance,
      right: centerX + tolerance
    };

    console.log(`🎯 Center region calculated: X=${centerX} ±${tolerance}px (${toleranceZone.left}-${toleranceZone.right})`);

    return {
      centerX,
      toleranceZone
    };
  }

  /**
   * Analyse toutes les lignes verticales selon les critères de l'algorithme
   */
  private analyzeVerticalLines(
    verticalLines: DetectedLine[],
    horizontalLines: DetectedLine[],
    contentRegion: ContentRegion,
    centerRegion: SeparatorAnalysis['centerRegion'],
    config: SeparatorDetectionConfig
  ): { separators: DetectedLine[], rejected: SeparatorAnalysis['rejectedLines'] } {
    
    const separators: DetectedLine[] = [];
    const rejected: SeparatorAnalysis['rejectedLines'] = [];

    console.log(`🔍 Analyzing ${verticalLines.length} vertical lines...`);

    for (const line of verticalLines) {
      const analysis = this.analyzeSingleLine(
        line,
        horizontalLines,
        contentRegion,
        centerRegion,
        config
      );

      if (analysis.isValid) {
        separators.push(line);
        console.log(`✅ Line accepted: X=${line.x1}, Height=${this.calculateLineHeight(line)}`);
      } else {
        rejected.push({
          line,
          reason: analysis.rejectionReason!
        });
        console.log(`❌ Line rejected: X=${line.x1}, Reason=${analysis.rejectionReason}`);
      }
    }

    return { separators, rejected };
  }

  /**
   * Analyse une ligne individuelle selon tous les critères
   */
  private analyzeSingleLine(
    line: DetectedLine,
    horizontalLines: DetectedLine[],
    contentRegion: ContentRegion,
    centerRegion: SeparatorAnalysis['centerRegion'],
    config: SeparatorDetectionConfig
  ): { isValid: boolean, rejectionReason?: SeparatorAnalysis['rejectedLines'][0]['reason'] } {
    
    // Critère 1 : Vérifier si la ligne est dans la zone de contenu
    if (!this.isLineInContentRegion(line, contentRegion)) {
      return { isValid: false, rejectionReason: 'outside_center' };
    }

    // Critère 2 : Vérifier si la ligne est proche du centre (avec tolérance ε)
    if (!this.isLineNearCenter(line, centerRegion, config)) {
      return { isValid: false, rejectionReason: 'outside_center' };
    }

    // Critère 3 : Vérifier la hauteur minimale
    if (!this.hasMinimumHeight(line, contentRegion, config)) {
      return { isValid: false, rejectionReason: 'too_short' };
    }

    // Critère 4 : Vérifier qu'elle ne croise pas de lignes horizontales (éviter tables)
    if (this.intersectsWithHorizontalLines(line, horizontalLines, config)) {
      return { isValid: false, rejectionReason: 'intersects_table' };
    }

    // Critère 5 : Vérifier la confiance
    if (line.confidence < config.confidenceThreshold) {
      return { isValid: false, rejectionReason: 'low_confidence' };
    }

    return { isValid: true };
  }

  /**
   * Vérifie si une ligne est dans la zone de contenu
   */
  private isLineInContentRegion(line: DetectedLine, contentRegion: ContentRegion): boolean {
    return line.x1 >= contentRegion.contentX &&
           line.x1 <= contentRegion.contentX + contentRegion.contentWidth &&
           line.y1 >= contentRegion.contentY &&
           line.y2 <= contentRegion.contentY + contentRegion.contentHeight;
  }

  /**
   * Vérifie si une ligne est proche du centre avec marge d'erreur ε
   */
  private isLineNearCenter(
    line: DetectedLine,
    centerRegion: SeparatorAnalysis['centerRegion'],
    config: SeparatorDetectionConfig
  ): boolean {
    const lineX = line.x1;
    return lineX >= centerRegion.toleranceZone.left &&
           lineX <= centerRegion.toleranceZone.right;
  }

  /**
   * Vérifie si une ligne a la hauteur minimale requise
   */
  private hasMinimumHeight(
    line: DetectedLine,
    contentRegion: ContentRegion,
    config: SeparatorDetectionConfig
  ): boolean {
    const lineHeight = this.calculateLineHeight(line);
    const minimumRequired = contentRegion.contentHeight * config.minimumHeight;
    return lineHeight >= minimumRequired;
  }

  /**
   * Vérifie si une ligne verticale croise des lignes horizontales (indicateur de table)
   */
  private intersectsWithHorizontalLines(
    verticalLine: DetectedLine,
    horizontalLines: DetectedLine[],
    config: SeparatorDetectionConfig
  ): boolean {
    
    const tolerance = config.intersectionTolerance;

    for (const horizontalLine of horizontalLines) {
      if (this.linesIntersect(verticalLine, horizontalLine, tolerance)) {
        console.log(`🔗 Intersection detected between vertical line X=${verticalLine.x1} and horizontal line Y=${horizontalLine.y1}`);
        return true;
      }
    }

    return false;
  }

  /**
   * Détermine si deux lignes se croisent avec une tolérance
   */
  private linesIntersect(
    verticalLine: DetectedLine,
    horizontalLine: DetectedLine,
    tolerance: number
  ): boolean {
    
    // Vérifier si la ligne verticale passe dans la zone Y de la ligne horizontale
    const verticalInHorizontalRange = 
      verticalLine.y1 <= horizontalLine.y1 + tolerance &&
      verticalLine.y2 >= horizontalLine.y1 - tolerance;

    // Vérifier si la ligne horizontale passe dans la zone X de la ligne verticale
    const horizontalInVerticalRange = 
      horizontalLine.x1 <= verticalLine.x1 + tolerance &&
      horizontalLine.x2 >= verticalLine.x1 - tolerance;

    return verticalInHorizontalRange && horizontalInVerticalRange;
  }

  /**
   * Calcule la hauteur d'une ligne
   */
  private calculateLineHeight(line: DetectedLine): number {
    return Math.abs(line.y2 - line.y1);
  }

  /**
   * Calcule la confiance globale de la détection
   */
  private calculateOverallConfidence(
    separators: DetectedLine[],
    originalLines: DetectedLine[]
  ): number {
    
    if (originalLines.length === 0) return 0;

    // Confiance basée sur le ratio de lignes acceptées
    const acceptanceRatio = separators.length / originalLines.length;

    // Confiance moyenne des lignes acceptées
    const avgConfidence = separators.length > 0
      ? separators.reduce((sum, line) => sum + line.confidence, 0) / separators.length
      : 0;

    // Bonus si on a trouvé au moins un séparateur valide
    const foundSeparatorBonus = separators.length > 0 ? 0.2 : 0;

    return Math.min(1.0, (acceptanceRatio * 0.4) + (avgConfidence * 0.4) + foundSeparatorBonus);
  }

  /**
   * Créer des colonnes de texte basées sur les séparateurs détectés
   */
  createTextColumns(
    separators: DetectedLine[],
    contentRegion: ContentRegion
  ): Array<{ x: number, y: number, width: number, height: number, columnNumber: number }> {
    
    const columns = [];

    if (separators.length === 0) {
      // Une seule colonne si aucun séparateur
      columns.push({
        x: contentRegion.contentX,
        y: contentRegion.contentY,
        width: contentRegion.contentWidth,
        height: contentRegion.contentHeight,
        columnNumber: 1
      });
    } else {
      // Trier les séparateurs par position X
      const sortedSeparators = separators.sort((a, b) => a.x1 - b.x1);

      // Première colonne (avant le premier séparateur)
      columns.push({
        x: contentRegion.contentX,
        y: contentRegion.contentY,
        width: sortedSeparators[0].x1 - contentRegion.contentX,
        height: contentRegion.contentHeight,
        columnNumber: 1
      });

      // Colonnes entre les séparateurs
      for (let i = 0; i < sortedSeparators.length - 1; i++) {
        columns.push({
          x: sortedSeparators[i].x1,
          y: contentRegion.contentY,
          width: sortedSeparators[i + 1].x1 - sortedSeparators[i].x1,
          height: contentRegion.contentHeight,
          columnNumber: i + 2
        });
      }

      // Dernière colonne (après le dernier séparateur)
      const lastSeparator = sortedSeparators[sortedSeparators.length - 1];
      columns.push({
        x: lastSeparator.x1,
        y: contentRegion.contentY,
        width: (contentRegion.contentX + contentRegion.contentWidth) - lastSeparator.x1,
        height: contentRegion.contentHeight,
        columnNumber: sortedSeparators.length + 1
      });
    }

    console.log(`📑 Created ${columns.length} text columns from ${separators.length} separators`);
    return columns;
  }
}

export const textSeparatorDetector = new TextSeparatorDetector();
export default textSeparatorDetector;