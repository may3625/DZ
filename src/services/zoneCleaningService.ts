import { ProcessingResult } from './imageProcessingService';

// Compatibility type for LineDetectionResult
export interface LineDetectionResult {
  horizontalLines: Array<{
    start: { x: number; y: number };
    end: { x: number; y: number };
    thickness: number;
    confidence?: number;
  }>;
  verticalLines: Array<{
    start: { x: number; y: number };
    end: { x: number; y: number };
    thickness: number;
    confidence?: number;
  }>;
  intersections: Array<{ x: number; y: number; type: string; }>;
}

// Extended ProcessingResult with contours
export interface ImageProcessingResult extends ProcessingResult {
  contours: Array<{
    area: number;
    boundingBox: { x: number; y: number; width: number; height: number };
  }>;
  lines: LineDetectionResult;
}

// Types pour le nettoyage de zones
export interface Zone {
  id: string;
  type: 'text' | 'table' | 'image' | 'border' | 'noise' | 'header' | 'footer';
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  shouldKeep: boolean;
  cleaningActions: string[];
  content?: string;
}

export interface BorderElement {
  type: 'line' | 'rectangle' | 'decoration';
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  thickness: number;
  isDecorative: boolean;
  shouldRemove: boolean;
}

export interface CleaningResult {
  originalZones: Zone[];
  cleanedZones: Zone[];
  removedBorders: BorderElement[];
  intersections: Array<{
    x: number;
    y: number;
    type: string;
    confidence: number;
  }>;
  cleanedImageData: ImageData;
  processingTime: number;
  success: boolean;
  statistics: {
    zonesProcessed: number;
    bordersRemoved: number;
    noiseReduced: number;
    intersectionsDetected: number;
  };
}

export interface CleaningOptions {
  removeBorders: boolean;
  removeNoise: boolean;
  detectIntersections: boolean;
  preserveText: boolean;
  preserveTables: boolean;
  aggressiveness: number; // 0-1, 0 = conservateur, 1 = agressif
  minZoneSize: number;
  borderThickness: number;
  noiseThreshold: number;
}

class ZoneCleaningService {
  private readonly defaultOptions: CleaningOptions = {
    removeBorders: true,
    removeNoise: true,
    detectIntersections: true,
    preserveText: true,
    preserveTables: true,
    aggressiveness: 0.5,
    minZoneSize: 100,
    borderThickness: 3,
    noiseThreshold: 0.1
  };

  /**
   * Nettoie les zones d'une image en éliminant les bordures et le bruit
   */
  async cleanZones(
    imageData: ImageData,
    processingResult: ImageProcessingResult,
    options: Partial<CleaningOptions> = {}
  ): Promise<CleaningResult> {
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };
    
    console.log('🔄 Début du nettoyage de zones');

    try {
      // 1. Analyser les zones dans l'image
      const originalZones = await this.analyzeZones(imageData, processingResult);
      console.log(`Analysé ${originalZones.length} zones`);

      // 2. Détecter les bordures
      const borders = await this.detectBorders(imageData, processingResult.lines || this.createDefaultLineResult(), opts);
      console.log(`Détecté ${borders.length} éléments de bordure`);

      // 3. Détecter les intersections importantes
      const intersections = await this.detectImportantIntersections(processingResult.lines || this.createDefaultLineResult(), opts);
      console.log(`Détecté ${intersections.length} intersections importantes`);

      // 4. Nettoyer l'image
      const cleanedImageData = await this.performCleaning(imageData, originalZones, borders, opts);

      // 5. Réévaluer les zones après nettoyage
      const cleanedZones = await this.reevaluateZones(originalZones, borders, opts);

      const processingTime = Date.now() - startTime;

      const result: CleaningResult = {
        originalZones,
        cleanedZones,
        removedBorders: borders.filter(b => b.shouldRemove),
        intersections,
        cleanedImageData,
        processingTime,
        success: true,
        statistics: {
          zonesProcessed: cleanedZones.length,
          bordersRemoved: borders.filter(b => b.shouldRemove).length,
          noiseReduced: this.calculateNoiseReduction(originalZones, cleanedZones),
          intersectionsDetected: intersections.length
        }
      };

      console.log('✅ Nettoyage de zones terminé');
      return result;

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage de zones:', error);
      return {
        originalZones: [],
        cleanedZones: [],
        removedBorders: [],
        intersections: [],
        cleanedImageData: imageData,
        processingTime: Date.now() - startTime,
        success: false,
        statistics: {
          zonesProcessed: 0,
          bordersRemoved: 0,
          noiseReduced: 0,
          intersectionsDetected: 0
        }
      };
    }
  }

  // Helper method to create default line result
  private createDefaultLineResult(): LineDetectionResult {
    return {
      horizontalLines: [],
      verticalLines: [],
      intersections: []
    };
  }

  /**
   * Analyse les zones dans l'image
   */
  private async analyzeZones(
    imageData: ImageData,
    processingResult: ImageProcessingResult
  ): Promise<Zone[]> {
    const zones: Zone[] = [];
    const width = imageData.width;
    const height = imageData.height;

    // 1. Zones basées sur les contours détectés
    const contours = processingResult.contours || [];
    for (const contour of contours) {
      if (contour.area > this.defaultOptions.minZoneSize) {
        const zone: Zone = {
          id: `contour_${zones.length}`,
          type: this.classifyZoneType(contour, imageData),
          boundingBox: contour.boundingBox,
          confidence: Math.min(contour.area / 10000, 1), // Confiance basée sur la taille
          shouldKeep: true,
          cleaningActions: []
        };

        zones.push(zone);
      }
    }

    // 2. Zones de bordure (périphérie de l'image)
    const borderMargin = 20;
    
    // Bordure supérieure
    zones.push({
      id: 'border_top',
      type: 'border',
      boundingBox: { x: 0, y: 0, width: width, height: borderMargin },
      confidence: 0.9,
      shouldKeep: false,
      cleaningActions: ['border_removal']
    });

    // Bordure inférieure
    zones.push({
      id: 'border_bottom',
      type: 'border',
      boundingBox: { x: 0, y: height - borderMargin, width: width, height: borderMargin },
      confidence: 0.9,
      shouldKeep: false,
      cleaningActions: ['border_removal']
    });

    // Bordures latérales
    zones.push({
      id: 'border_left',
      type: 'border',
      boundingBox: { x: 0, y: 0, width: borderMargin, height: height },
      confidence: 0.9,
      shouldKeep: false,
      cleaningActions: ['border_removal']
    });

    zones.push({
      id: 'border_right',
      type: 'border',
      boundingBox: { x: width - borderMargin, y: 0, width: borderMargin, height: height },
      confidence: 0.9,
      shouldKeep: false,
      cleaningActions: ['border_removal']
    });

    // 3. Zones de bruit (petites zones isolées)
    const noiseZones = this.detectNoiseZones(imageData, processingResult);
    zones.push(...noiseZones);

    console.log(`Zones analysées: ${zones.filter(z => z.type === 'text').length} texte, ${zones.filter(z => z.type === 'table').length} table, ${zones.filter(z => z.type === 'border').length} bordure, ${zones.filter(z => z.type === 'noise').length} bruit`);

    return zones;
  }

  /**
   * Classifie le type d'une zone basé sur ses caractéristiques
   */
  private classifyZoneType(contour: any, imageData: ImageData): Zone['type'] {
    const { boundingBox } = contour;
    
    // Analyse de la forme
    const aspectRatio = boundingBox.width / boundingBox.height;
    
    // Zone très large et pas haute = probablement du texte
    if (aspectRatio > 3 && boundingBox.height < 50) {
      return 'text';
    }
    
    // Zone carrée ou rectangulaire avec des dimensions moyennes = probablement une table
    if (aspectRatio > 0.5 && aspectRatio < 2 && boundingBox.width > 100 && boundingBox.height > 100) {
      return 'table';
    }
    
    // Zone en haut ou en bas de l'image = header/footer
    if (boundingBox.y < imageData.height * 0.1) {
      return 'header';
    }
    if (boundingBox.y > imageData.height * 0.9) {
      return 'footer';
    }
    
    // Petite zone = probablement du bruit ou une image
    if (contour.area < 500) {
      return 'noise';
    }
    
    // Par défaut
    return 'text';
  }

  /**
   * Détecte les zones de bruit
   */
  private detectNoiseZones(
    imageData: ImageData,
    processingResult: ImageProcessingResult
  ): Zone[] {
    const noiseZones: Zone[] = [];
    
    // Analyser les petites régions isolées
    const contours = processingResult.contours || [];
    const smallContours = contours.filter(c => c.area < 200);
    
    for (const contour of smallContours) {
      // Vérifier si c'est vraiment du bruit en analysant le contexte
      const isIsolated = this.isRegionIsolated(contour.boundingBox, imageData);
      
      if (isIsolated) {
        noiseZones.push({
          id: `noise_${noiseZones.length}`,
          type: 'noise',
          boundingBox: contour.boundingBox,
          confidence: 0.8,
          shouldKeep: false,
          cleaningActions: ['noise_removal']
        });
      }
    }

    return noiseZones;
  }

  /**
   * Vérifie si une région est isolée (entourée de blanc)
   */
  private isRegionIsolated(
    boundingBox: { x: number; y: number; width: number; height: number },
    imageData: ImageData
  ): boolean {
    const data = imageData.data;
    const width = imageData.width;
    const margin = 10;

    let whitePixels = 0;
    let totalPixels = 0;

    // Vérifier une zone autour de la région
    for (let y = Math.max(0, boundingBox.y - margin); 
         y < Math.min(imageData.height, boundingBox.y + boundingBox.height + margin); y++) {
      for (let x = Math.max(0, boundingBox.x - margin); 
           x < Math.min(imageData.width, boundingBox.x + boundingBox.width + margin); x++) {
        
        // Ignorer la région elle-même
        if (x >= boundingBox.x && x < boundingBox.x + boundingBox.width &&
            y >= boundingBox.y && y < boundingBox.y + boundingBox.height) {
          continue;
        }

        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        const brightness = (r + g + b) / 3;
        if (brightness > 200) whitePixels++;
        totalPixels++;
      }
    }

    // Si plus de 80% des pixels environnants sont blancs, c'est isolé
    return totalPixels > 0 && (whitePixels / totalPixels) > 0.8;
  }

  /**
   * Détecte les bordures décoratives
   */
  private async detectBorders(
    imageData: ImageData,
    lines: LineDetectionResult,
    options: CleaningOptions
  ): Promise<BorderElement[]> {
    const borders: BorderElement[] = [];
    const width = imageData.width;
    const height = imageData.height;

    // 1. Bordures basées sur les lignes détectées
    for (const line of lines.horizontalLines) {
      const isTopBorder = line.start.y < height * 0.1;
      const isBottomBorder = line.start.y > height * 0.9;
      const isFullWidth = (line.end.x - line.start.x) > width * 0.8;
      
      if ((isTopBorder || isBottomBorder) && isFullWidth) {
        borders.push({
          type: 'line',
          boundingBox: {
            x: line.start.x,
            y: line.start.y - line.thickness / 2,
            width: line.end.x - line.start.x,
            height: line.thickness
          },
          thickness: line.thickness,
          isDecorative: true,
          shouldRemove: options.removeBorders
        });
      }
    }

    for (const line of lines.verticalLines) {
      const isLeftBorder = line.start.x < width * 0.1;
      const isRightBorder = line.start.x > width * 0.9;
      const isFullHeight = (line.end.y - line.start.y) > height * 0.8;
      
      if ((isLeftBorder || isRightBorder) && isFullHeight) {
        borders.push({
          type: 'line',
          boundingBox: {
            x: line.start.x - line.thickness / 2,
            y: line.start.y,
            width: line.thickness,
            height: line.end.y - line.start.y
          },
          thickness: line.thickness,
          isDecorative: true,
          shouldRemove: options.removeBorders
        });
      }
    }

    console.log(`Bordures détectées: ${borders.length} éléments`);
    return borders;
  }

  /**
   * Détecte les intersections importantes
   */
  private async detectImportantIntersections(
    lines: LineDetectionResult,
    options: CleaningOptions
  ): Promise<Array<{ x: number; y: number; type: string; confidence: number }>> {
    const intersections = [];

    for (const intersection of lines.intersections) {
      // Analyser le type d'intersection
      const intersectionType = this.classifyIntersection(intersection, lines);
      
      // Calculer la confiance basée sur le nombre de lignes qui se croisent
      const confidence = this.calculateIntersectionConfidence(intersection, lines);

      if (confidence > 0.5) { // Seuil de confiance
        intersections.push({
          x: intersection.x,
          y: intersection.y,
          type: intersectionType,
          confidence
        });
      }
    }

    return intersections;
  }

  /**
   * Classifie le type d'intersection
   */
  private classifyIntersection(
    intersection: { x: number; y: number; type: string },
    lines: LineDetectionResult
  ): string {
    const tolerance = 10;
    let horizontalCount = 0;
    let verticalCount = 0;

    // Compter les lignes qui passent par cette intersection
    for (const hLine of lines.horizontalLines) {
      if (Math.abs(hLine.start.y - intersection.y) <= tolerance &&
          intersection.x >= hLine.start.x - tolerance &&
          intersection.x <= hLine.end.x + tolerance) {
        horizontalCount++;
      }
    }

    for (const vLine of lines.verticalLines) {
      if (Math.abs(vLine.start.x - intersection.x) <= tolerance &&
          intersection.y >= vLine.start.y - tolerance &&
          intersection.y <= vLine.end.y + tolerance) {
        verticalCount++;
      }
    }

    if (horizontalCount >= 2 && verticalCount >= 2) {
      return 'grid_junction';
    } else if (horizontalCount >= 1 && verticalCount >= 1) {
      return 'table_corner';
    } else {
      return 'line_end';
    }
  }

  /**
   * Calcule la confiance d'une intersection
   */
  private calculateIntersectionConfidence(
    intersection: { x: number; y: number },
    lines: LineDetectionResult
  ): number {
    let totalStrength = 0;
    let lineCount = 0;

    // Analyser la force des lignes qui se croisent
    for (const hLine of lines.horizontalLines) {
      if (Math.abs(hLine.start.y - intersection.y) <= 5) {
        totalStrength += hLine.confidence || 0.5;
        lineCount++;
      }
    }

    for (const vLine of lines.verticalLines) {
      if (Math.abs(vLine.start.x - intersection.x) <= 5) {
        totalStrength += vLine.confidence || 0.5;
        lineCount++;
      }
    }

    return lineCount > 0 ? totalStrength / lineCount : 0;
  }

  /**
   * Effectue le nettoyage de l'image
   */
  private async performCleaning(
    imageData: ImageData,
    zones: Zone[],
    borders: BorderElement[],
    options: CleaningOptions
  ): Promise<ImageData> {
    // Copier les données d'image
    const cleanedData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );

    const data = cleanedData.data;
    const width = imageData.width;

    // 1. Supprimer les bordures
    if (options.removeBorders) {
      for (const border of borders) {
        if (border.shouldRemove) {
          this.eraseBoundingBox(data, width, border.boundingBox);
        }
      }
    }

    // 2. Supprimer le bruit
    if (options.removeNoise) {
      for (const zone of zones) {
        if (zone.type === 'noise' && !zone.shouldKeep) {
          this.eraseBoundingBox(data, width, zone.boundingBox);
        }
      }
    }

    return cleanedData;
  }

  /**
   * Efface une zone rectangulaire (la remplit de blanc)
   */
  private eraseBoundingBox(
    data: Uint8ClampedArray,
    width: number,
    boundingBox: { x: number; y: number; width: number; height: number }
  ): void {
    for (let y = boundingBox.y; y < boundingBox.y + boundingBox.height; y++) {
      for (let x = boundingBox.x; x < boundingBox.x + boundingBox.width; x++) {
        const idx = (y * width + x) * 4;
        if (idx < data.length - 3) {
          data[idx] = 255;     // Rouge
          data[idx + 1] = 255; // Vert
          data[idx + 2] = 255; // Bleu
          // Alpha reste inchangé
        }
      }
    }
  }

  /**
   * Réévalue les zones après nettoyage
   */
  private async reevaluateZones(
    originalZones: Zone[],
    borders: BorderElement[],
    options: CleaningOptions
  ): Promise<Zone[]> {
    const cleanedZones: Zone[] = [];

    for (const zone of originalZones) {
      // Ignorer les zones supprimées
      if (!zone.shouldKeep) continue;

      // Vérifier si la zone n'a pas été affectée par la suppression de bordures
      const affectedByBorderRemoval = borders.some(border => 
        border.shouldRemove && this.boundingBoxesOverlap(zone.boundingBox, border.boundingBox)
      );

      if (!affectedByBorderRemoval) {
        cleanedZones.push({
          ...zone,
          cleaningActions: [...zone.cleaningActions, 'validated']
        });
      }
    }

    return cleanedZones;
  }

  /**
   * Vérifie si deux boîtes englobantes se chevauchent
   */
  private boundingBoxesOverlap(
    box1: { x: number; y: number; width: number; height: number },
    box2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return !(box1.x + box1.width < box2.x || 
             box2.x + box2.width < box1.x || 
             box1.y + box1.height < box2.y || 
             box2.y + box2.height < box1.y);
  }

  /**
   * Calcule la réduction de bruit
   */
  private calculateNoiseReduction(originalZones: Zone[], cleanedZones: Zone[]): number {
    const originalNoise = originalZones.filter(z => z.type === 'noise').length;
    const remainingNoise = cleanedZones.filter(z => z.type === 'noise').length;
    
    return originalNoise - remainingNoise;
  }
}

export const zoneCleaningService = new ZoneCleaningService();