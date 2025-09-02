/**
 * Service OpenCV.js réel pour traitement d'images avancé
 * Implémente HoughLinesP, détection de bordures et extraction de tables
 */

export interface OpenCVConfig {
  houghThreshold: number;
  minLineLength: number;
  maxLineGap: number;
  cannyThreshold1: number;
  cannyThreshold2: number;
  contourMinArea: number;
  tableDetectionSensitivity: number;
}

export interface LineDetection {
  lines: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    angle: number;
    length: number;
  }>;
  horizontalLines: number;
  verticalLines: number;
  tableRegions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
}

export interface BorderDetection {
  borders: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'table' | 'text_box' | 'frame';
  }>;
  documentBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface TableExtraction {
  tables: Array<{
    id: string;
    bounds: { x: number; y: number; width: number; height: number };
    rows: number;
    cols: number;
    cells: Array<{
      row: number;
      col: number;
      text: string;
      bounds: { x: number; y: number; width: number; height: number };
    }>;
    confidence: number;
  }>;
  confidence: number;
}

class RealOpenCVService {
  private cv: any = null;
  private isInitialized = false;
  private config: OpenCVConfig = {
    houghThreshold: 50,
    minLineLength: 50,
    maxLineGap: 10,
    cannyThreshold1: 50,
    cannyThreshold2: 150,
    contourMinArea: 1000,
    tableDetectionSensitivity: 0.7
  };

  async initialize(): Promise<void> {
    if (this.isInitialized && this.cv) return;

    try {
      // Charger opencv.js
      if (typeof window !== 'undefined' && !(window as any).cv) {
        await this.loadOpenCVScript();
      }

      this.cv = (window as any).cv;
      
      if (!this.cv) {
        throw new Error('OpenCV.js non disponible');
      }

      // Attendre que OpenCV soit complètement chargé
      await new Promise<void>((resolve, reject) => {
        if (this.cv.onRuntimeInitialized) {
          this.cv.onRuntimeInitialized = () => {
            console.log('✅ OpenCV.js initialisé avec succès');
            this.isInitialized = true;
            resolve();
          };
        } else {
          // Déjà initialisé
          this.isInitialized = true;
          resolve();
        }
      });

    } catch (error) {
      console.error('❌ Erreur initialisation OpenCV.js:', error);
      throw error;
    }
  }

  private async loadOpenCVScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/opencv/opencv.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Impossible de charger OpenCV.js'));
      document.head.appendChild(script);
    });
  }

  isReady(): boolean {
    return this.isInitialized && this.cv !== null;
  }

  updateConfig(newConfig: Partial<OpenCVConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Détection de lignes avec HoughLinesP
   */
  async detectLinesHoughP(imageData: ImageData): Promise<LineDetection> {
    if (!this.isReady()) {
      throw new Error('OpenCV.js non initialisé');
    }

    try {
      // Convertir ImageData en Mat OpenCV
      const src = this.cv.matFromImageData(imageData);
      const gray = new this.cv.Mat();
      const edges = new this.cv.Mat();
      const lines = new this.cv.Mat();

      // Conversion en niveaux de gris
      this.cv.cvtColor(src, gray, this.cv.COLOR_RGBA2GRAY);

      // Détection de contours avec Canny
      this.cv.Canny(gray, edges, this.config.cannyThreshold1, this.config.cannyThreshold2);

      // Détection de lignes avec HoughLinesP
      this.cv.HoughLinesP(
        edges,
        lines,
        1, // rho
        Math.PI / 180, // theta
        this.config.houghThreshold,
        this.config.minLineLength,
        this.config.maxLineGap
      );

      // Extraire les lignes
      const detectedLines: LineDetection['lines'] = [];
      let horizontalCount = 0;
      let verticalCount = 0;

      for (let i = 0; i < lines.rows; i++) {
        const x1 = lines.data32S[i * 4];
        const y1 = lines.data32S[i * 4 + 1];
        const x2 = lines.data32S[i * 4 + 2];
        const y2 = lines.data32S[i * 4 + 3];

        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

        detectedLines.push({ x1, y1, x2, y2, angle, length });

        // Classifier horizontal/vertical
        if (Math.abs(angle) < 15 || Math.abs(angle) > 165) {
          horizontalCount++;
        } else if (Math.abs(angle - 90) < 15 || Math.abs(angle + 90) < 15) {
          verticalCount++;
        }
      }

      // Détecter les régions de tableaux
      const tableRegions = this.detectTableRegions(detectedLines, imageData.width, imageData.height);

      // Nettoyer la mémoire
      src.delete();
      gray.delete();
      edges.delete();
      lines.delete();

      return {
        lines: detectedLines,
        horizontalLines: horizontalCount,
        verticalLines: verticalCount,
        tableRegions
      };

    } catch (error) {
      console.error('Erreur détection lignes HoughP:', error);
      throw error;
    }
  }

  /**
   * Détection de bordures et structures
   */
  async detectBorders(imageData: ImageData): Promise<BorderDetection> {
    if (!this.isReady()) {
      throw new Error('OpenCV.js non initialisé');
    }

    try {
      const src = this.cv.matFromImageData(imageData);
      const gray = new this.cv.Mat();
      const binary = new this.cv.Mat();
      const contours = new this.cv.MatVector();
      const hierarchy = new this.cv.Mat();

      // Conversion et seuillage
      this.cv.cvtColor(src, gray, this.cv.COLOR_RGBA2GRAY);
      this.cv.threshold(gray, binary, 0, 255, this.cv.THRESH_BINARY + this.cv.THRESH_OTSU);

      // Détection de contours
      this.cv.findContours(binary, contours, hierarchy, this.cv.RETR_EXTERNAL, this.cv.CHAIN_APPROX_SIMPLE);

      const borders: BorderDetection['borders'] = [];
      let docBounds = { x: 0, y: 0, width: imageData.width, height: imageData.height };

      // Analyser les contours
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = this.cv.contourArea(contour);

        if (area > this.config.contourMinArea) {
          const rect = this.cv.boundingRect(contour);
          
          // Déterminer le type de structure
          let type: 'table' | 'text_box' | 'frame' = 'text_box';
          const aspectRatio = rect.width / rect.height;
          
          if (aspectRatio > 2 && rect.height < imageData.height * 0.3) {
            type = 'table';
          } else if (area > imageData.width * imageData.height * 0.8) {
            type = 'frame';
            docBounds = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
          }

          borders.push({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            type
          });
        }
      }

      // Nettoyer
      src.delete();
      gray.delete();
      binary.delete();
      contours.delete();
      hierarchy.delete();

      return {
        borders,
        documentBounds: docBounds
      };

    } catch (error) {
      console.error('Erreur détection bordures:', error);
      throw error;
    }
  }

  /**
   * Extraction avancée de tables
   */
  async extractTables(imageData: ImageData): Promise<TableExtraction> {
    if (!this.isReady()) {
      throw new Error('OpenCV.js non initialisé');
    }

    try {
      // Combiner détection de lignes et bordures pour localiser les tables
      const lineDetection = await this.detectLinesHoughP(imageData);
      const borderDetection = await this.detectBorders(imageData);

      const tables: TableExtraction['tables'] = [];

      // Analyser les régions de tableaux détectées
      for (const region of lineDetection.tableRegions) {
        const table = await this.extractTableFromRegion(imageData, region);
        if (table) {
          tables.push(table);
        }
      }

      const avgConfidence = tables.length > 0 
        ? tables.reduce((sum, t) => sum + t.confidence, 0) / tables.length 
        : 0;

      return {
        tables,
        confidence: avgConfidence
      };

    } catch (error) {
      console.error('Erreur extraction tables:', error);
      throw error;
    }
  }

  /**
   * Extraire une table d'une région spécifique
   */
  private async extractTableFromRegion(
    imageData: ImageData, 
    region: { x: number; y: number; width: number; height: number; confidence: number }
  ): Promise<TableExtraction['tables'][0] | null> {
    try {
      // Créer un ROI (Region of Interest)
      const src = this.cv.matFromImageData(imageData);
      const roi = src.roi(new this.cv.Rect(region.x, region.y, region.width, region.height));

      // Détecter la structure de grille dans cette région
      const { rows, cols } = await this.detectGridStructure(roi);

      if (rows === 0 || cols === 0) {
        roi.delete();
        src.delete();
        return null;
      }

      // Extraire les cellules
      const cells = await this.extractCells(roi, rows, cols, region);

      roi.delete();
      src.delete();

      return {
        id: `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bounds: region,
        rows,
        cols,
        cells,
        confidence: region.confidence
      };

    } catch (error) {
      console.error('Erreur extraction table région:', error);
      return null;
    }
  }

  /**
   * Détecter la structure de grille (lignes/colonnes)
   */
  private async detectGridStructure(roi: any): Promise<{ rows: number; cols: number }> {
    // Simulation de détection de grille basée sur les lignes
    // Dans une implémentation réelle, on analyserait les intersections de lignes
    const estimatedRows = Math.max(2, Math.floor(roi.rows / 30)); // ~30px par ligne
    const estimatedCols = Math.max(2, Math.floor(roi.cols / 100)); // ~100px par colonne

    return {
      rows: Math.min(estimatedRows, 20), // Limiter à 20 lignes max
      cols: Math.min(estimatedCols, 10)  // Limiter à 10 colonnes max
    };
  }

  /**
   * Extraire les cellules d'une table
   */
  private async extractCells(
    roi: any,
    rows: number,
    cols: number,
    region: { x: number; y: number; width: number; height: number }
  ): Promise<TableExtraction['tables'][0]['cells']> {
    const cells: TableExtraction['tables'][0]['cells'] = [];
    const cellWidth = Math.max(1, Math.floor(region.width / cols));
    const cellHeight = Math.max(1, Math.floor(region.height / rows));

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const relX = Math.max(0, Math.min(roi.cols - 1, Math.floor(col * cellWidth)));
        const relY = Math.max(0, Math.min(roi.rows - 1, Math.floor(row * cellHeight)));
        const relW = Math.max(1, Math.min(roi.cols - relX, Math.floor(cellWidth)));
        const relH = Math.max(1, Math.min(roi.rows - relY, Math.floor(cellHeight)));

        let text = '';
        try {
          // Seuil minimal pour lancer l'OCR cellule (éviter trop petites régions)
          if (relW >= 16 && relH >= 16) {
            const cellMat = roi.roi(new this.cv.Rect(relX, relY, relW, relH));
            const blob = await this.matToBlob(cellMat);
            const { tesseractWorkerService } = await import('@/services/tesseractWorker');
            const worker = await tesseractWorkerService.getTesseractWorker();
            const result = await worker.recognize(blob as Blob);
            text = (result?.data?.text || '').trim();
            cellMat.delete();
          }
        } catch (e) {
          console.warn('⚠️ OCR cellule échoué:', e);
        }

        cells.push({
          row,
          col,
          text,
          bounds: {
            x: region.x + col * cellWidth,
            y: region.y + row * cellHeight,
            width: cellWidth,
            height: cellHeight
          }
        });
      }
    }

    return cells;
  }

  private async matToBlob(mat: any): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = mat.cols;
    canvas.height = mat.rows;
    // cv.imshow accepte un élément canvas
    this.cv.imshow(canvas, mat);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Impossible de convertir la cellule en Blob'));
      }, 'image/png');
    });
  }

  /**
   * Détecter les régions de tableaux à partir des lignes
   */
  private detectTableRegions(
    lines: LineDetection['lines'], 
    width: number, 
    height: number
  ): LineDetection['tableRegions'] {
    const regions: LineDetection['tableRegions'] = [];

    // Grouper les lignes horizontales et verticales
    const horizontalLines = lines.filter(line => 
      Math.abs(line.angle) < 15 || Math.abs(line.angle) > 165
    );
    const verticalLines = lines.filter(line => 
      Math.abs(line.angle - 90) < 15 || Math.abs(line.angle + 90) < 15
    );

    // Chercher des intersections qui forment des rectangles
    for (let i = 0; i < horizontalLines.length - 1; i++) {
      for (let j = i + 1; j < horizontalLines.length; j++) {
        const h1 = horizontalLines[i];
        const h2 = horizontalLines[j];
        
        // Chercher des lignes verticales qui intersectent
        for (let k = 0; k < verticalLines.length - 1; k++) {
          for (let l = k + 1; l < verticalLines.length; l++) {
            const v1 = verticalLines[k];
            const v2 = verticalLines[l];
            
            // Vérifier si ces lignes forment un rectangle
            const region = this.calculateTableRegion(h1, h2, v1, v2);
            if (region && this.isValidTableRegion(region, width, height)) {
              regions.push(region);
            }
          }
        }
      }
    }

    // Fusionner les régions qui se chevauchent
    return this.mergeOverlappingRegions(regions);
  }

  private calculateTableRegion(
    h1: LineDetection['lines'][0], 
    h2: LineDetection['lines'][0],
    v1: LineDetection['lines'][0], 
    v2: LineDetection['lines'][0]
  ): LineDetection['tableRegions'][0] | null {
    try {
      const x = Math.min(v1.x1, v1.x2, v2.x1, v2.x2);
      const y = Math.min(h1.y1, h1.y2, h2.y1, h2.y2);
      const width = Math.abs(Math.max(v1.x1, v1.x2, v2.x1, v2.x2) - x);
      const height = Math.abs(Math.max(h1.y1, h1.y2, h2.y1, h2.y2) - y);

      if (width > 50 && height > 30) { // Dimensions minimales
        return {
          x,
          y,
          width,
          height,
          confidence: this.config.tableDetectionSensitivity
        };
      }
    } catch (error) {
      console.error('Erreur calcul région table:', error);
    }

    return null;
  }

  private isValidTableRegion(
    region: LineDetection['tableRegions'][0], 
    maxWidth: number, 
    maxHeight: number
  ): boolean {
    return (
      region.width >= 100 && region.height >= 60 && // Dimensions minimales
      region.width <= maxWidth * 0.9 && region.height <= maxHeight * 0.9 && // Pas trop grand
      region.x >= 0 && region.y >= 0 && // Dans les limites
      region.x + region.width <= maxWidth && region.y + region.height <= maxHeight
    );
  }

  private mergeOverlappingRegions(regions: LineDetection['tableRegions']): LineDetection['tableRegions'] {
    if (regions.length <= 1) return regions;

    const merged: LineDetection['tableRegions'] = [];
    const processed = new Set<number>();

    for (let i = 0; i < regions.length; i++) {
      if (processed.has(i)) continue;

      let current = { ...regions[i] };
      processed.add(i);

      for (let j = i + 1; j < regions.length; j++) {
        if (processed.has(j)) continue;

        if (this.regionsOverlap(current, regions[j])) {
          current = this.mergeRegions(current, regions[j]);
          processed.add(j);
        }
      }

      merged.push(current);
    }

    return merged;
  }

  private regionsOverlap(
    a: LineDetection['tableRegions'][0], 
    b: LineDetection['tableRegions'][0]
  ): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }

  private mergeRegions(
    a: LineDetection['tableRegions'][0], 
    b: LineDetection['tableRegions'][0]
  ): LineDetection['tableRegions'][0] {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const width = Math.max(a.x + a.width, b.x + b.width) - x;
    const height = Math.max(a.y + a.height, b.y + b.height) - y;

    return {
      x,
      y,
      width,
      height,
      confidence: Math.max(a.confidence, b.confidence)
    };
  }

  getDiagnosticInfo(): any {
    return {
      isInitialized: this.isInitialized,
      cvAvailable: this.cv !== null,
      config: this.config,
      timestamp: new Date().toISOString()
    };
  }

  async reinitialize(): Promise<void> {
    this.isInitialized = false;
    this.cv = null;
    await this.initialize();
  }
}

export const realOpenCVService = new RealOpenCVService();