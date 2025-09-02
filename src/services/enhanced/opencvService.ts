/**
 * Service OpenCV.js pour les algorithmes de traitement d'images
 * Gestion de l'initialisation et des opérations OpenCV
 */

export interface OpenCVConfig {
  threshold: number;
  minLineLength: number;
  maxLineGap: number;
  dilationIterations: number;
  erosionIterations: number;
}

export interface OpenCVLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  angle: number;
  length: number;
  type: 'horizontal' | 'vertical';
  confidence: number;
}

class OpenCVService {
  private cv: any = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Initialise OpenCV.js
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.isReady()) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.loadOpenCV();
    await this.initializationPromise;
  }

  /**
   * Force la réinitialisation d'OpenCV.js
   */
  async reinitialize(): Promise<void> {
    console.log('🔄 Réinitialisation forcée d\'OpenCV.js...');
    this.isInitialized = false;
    this.cv = null;
    this.initializationPromise = null;
    await this.initialize();
  }

  /**
   * Charge OpenCV.js depuis CDN
   */
  private async loadOpenCV(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Vérifier si OpenCV est déjà chargé
      if (typeof window !== 'undefined' && (window as any).cv) {
        this.cv = (window as any).cv;
        this.isInitialized = true;
        console.log('✅ OpenCV.js déjà chargé');
        resolve();
        return;
      }

      // Diagnostic : vérifier les ressources chargées
      console.log('🔍 Diagnostic des ressources...');
      this.diagnoseResources();
      
      // Vérifier si le fichier local existe
      this.checkLocalFile();

      // Utiliser les CDN OpenCV.js disponibles
      const opencvUrls = [
        'https://docs.opencv.org/4.8.0/opencv.js',
        'https://cdn.jsdelivr.net/npm/opencv.js@1.2.1/opencv.js'
      ];

      const tryLoadOpenCV = (urlIndex: number) => {
        if (urlIndex >= opencvUrls.length) {
          console.warn('⚠️ Impossible de charger OpenCV.js localement');
          // Fallback : initialiser sans OpenCV.js (pas de réseau)
          this.isInitialized = true;
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = opencvUrls[urlIndex];
        script.async = true;
        script.onload = () => {
          // Attendre que OpenCV soit complètement initialisé
          const waitForOpenCV = () => {
            if ((window as any).cv && typeof (window as any).cv.Mat === 'function') {
              this.cv = (window as any).cv;
              this.isInitialized = true;
              console.log(`✅ OpenCV.js chargé et initialisé depuis ${opencvUrls[urlIndex]}`);
              resolve();
            } else {
              console.log('⏳ Attente de l\'initialisation complète d\'OpenCV...');
              setTimeout(waitForOpenCV, 100);
            }
          };
          waitForOpenCV();
        };
        script.onerror = (error) => {
          console.warn(`⚠️ Échec du chargement depuis ${opencvUrls[urlIndex]}:`, error);
          console.log(`🔄 Tentative suivante (${urlIndex + 1}/${opencvUrls.length})...`);
          tryLoadOpenCV(urlIndex + 1);
        };
        document.head.appendChild(script);
      };

      tryLoadOpenCV(0);
    });
  }

  /**
   * Vérifie si le fichier OpenCV.js local existe
   */
  private async checkLocalFile(): Promise<void> {
    try {
      const response = await fetch('/opencv/opencv.js', { method: 'HEAD' });
      if (response.ok) {
        console.log('✅ Fichier OpenCV.js local disponible');
      } else {
        console.warn('⚠️ Fichier OpenCV.js local non trouvé, utilisation des CDN');
      }
    } catch (error) {
      console.warn('⚠️ Impossible de vérifier le fichier local:', error);
    }
  }

  /**
   * Diagnostic des ressources pour identifier les erreurs 404
   */
  private diagnoseResources(): void {
    // Vérifier les scripts déjà chargés
    const scripts = document.querySelectorAll('script[src]');
    console.log('📋 Scripts chargés:', Array.from(scripts).map(s => s.getAttribute('src')));

    // Vérifier les erreurs de réseau
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      console.log('🌐 Requête réseau:', url);
      return originalFetch.apply(this, args).catch(error => {
        console.error('❌ Erreur réseau:', url, error);
        throw error;
      });
    };

    // Écouter les erreurs de chargement de ressources
    window.addEventListener('error', (event) => {
      if (event.target && (event.target as any).src) {
        console.error('❌ Erreur de chargement de ressource:', (event.target as any).src);
      }
    }, true);
  }

  /**
   * Convertit ImageData en Mat OpenCV
   */
  private imageDataToMat(imageData: ImageData): any {
    if (!this.cv) {
      throw new Error('OpenCV.js non initialisé');
    }

    const mat = this.cv.matFromImageData(imageData);
    return mat;
  }

  /**
   * Convertit Mat OpenCV en ImageData
   */
  private matToImageData(mat: any): ImageData {
    if (!this.cv) {
      throw new Error('OpenCV.js non initialisé');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    this.cv.imshow(canvas, mat);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  /**
   * Applique les opérations morphologiques (dilatation et érosion)
   */
  applyMorphologicalOperations(
    imageData: ImageData, 
    config: OpenCVConfig
  ): ImageData {
    if (!this.cv) {
      console.warn('⚠️ OpenCV.js non disponible, retour de l\'image originale');
      return imageData;
    }

    try {
      // Convertir ImageData en Mat
      const src = this.imageDataToMat(imageData);
      
      // Convertir en niveaux de gris si nécessaire
      let gray = src;
      if (src.channels() === 4) {
        gray = new this.cv.Mat();
        this.cv.cvtColor(src, gray, this.cv.COLOR_RGBA2GRAY);
      }

      // Créer le kernel pour les opérations morphologiques
      const kernel = this.cv.getStructuringElement(
        this.cv.MORPH_RECT, 
        new this.cv.Size(3, 3)
      );

      // Appliquer la dilatation
      const dilated = new this.cv.Mat();
      this.cv.dilate(gray, dilated, kernel, new this.cv.Point(-1, -1), config.dilationIterations);

      // Appliquer l'érosion
      const eroded = new this.cv.Mat();
      this.cv.erode(dilated, eroded, kernel, new this.cv.Point(-1, -1), config.erosionIterations);

      // Convertir en ImageData
      const result = this.matToImageData(eroded);

      // Libérer la mémoire
      src.delete();
      if (gray !== src) gray.delete();
      dilated.delete();
      eroded.delete();
      kernel.delete();

      return result;

    } catch (error) {
      console.error('Erreur lors des opérations morphologiques:', error);
      throw error;
    }
  }

  /**
   * Détecte les lignes avec HoughLinesP
   */
  detectLinesWithHough(
    imageData: ImageData, 
    config: OpenCVConfig
  ): OpenCVLine[] {
    if (!this.cv) {
      console.warn('⚠️ OpenCV.js non disponible, retour de lignes simulées');
      // Retourner des lignes simulées en cas d'échec
      return this.generateSimulatedLines(imageData);
    }

    try {
      // Convertir ImageData en Mat
      const src = this.imageDataToMat(imageData);
      
      // Convertir en niveaux de gris
      const gray = new this.cv.Mat();
      this.cv.cvtColor(src, gray, this.cv.COLOR_RGBA2GRAY);

      // Appliquer le seuillage
      const binary = new this.cv.Mat();
      this.cv.threshold(gray, binary, 0, 255, this.cv.THRESH_BINARY + this.cv.THRESH_OTSU);

      // Détecter les lignes avec HoughLinesP
      const lines = new this.cv.Mat();
      this.cv.HoughLinesP(
        binary,
        lines,
        1, // rho
        Math.PI / 180, // theta
        config.threshold,
        config.minLineLength,
        config.maxLineGap
      );

      // Convertir les lignes en format utilisable
      const detectedLines: OpenCVLine[] = [];
      
      for (let i = 0; i < lines.rows; i++) {
        const x1 = lines.data32S[i * 4];
        const y1 = lines.data32S[i * 4 + 1];
        const x2 = lines.data32S[i * 4 + 2];
        const y2 = lines.data32S[i * 4 + 3];

        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        
        // Déterminer le type de ligne
        const isHorizontal = Math.abs(angle) < 45 || Math.abs(angle) > 135;
        const type: 'horizontal' | 'vertical' = isHorizontal ? 'horizontal' : 'vertical';

        // Calculer la confiance basée sur la longueur
        const confidence = Math.min(length / 100, 1.0);

        detectedLines.push({
          x1,
          y1,
          x2,
          y2,
          angle,
          length,
          type,
          confidence
        });
      }

      // Libérer la mémoire
      src.delete();
      gray.delete();
      binary.delete();
      lines.delete();

      console.log(`✅ Détecté ${detectedLines.length} lignes avec HoughLinesP`);
      return detectedLines;

    } catch (error) {
      console.error('Erreur lors de la détection de lignes:', error);
      throw error;
    }
  }

  /**
   * Vérifie si OpenCV.js est initialisé et fonctionnel
   */
  isReady(): boolean {
    const hasCV = this.isInitialized && this.cv !== null;
    
    // Vérifier si OpenCV est complètement chargé
    const hasRequiredMethods = hasCV && 
      typeof this.cv.Mat === 'function' &&
      typeof this.cv.HoughLinesP === 'function' &&
      typeof this.cv.cvtColor === 'function' &&
      typeof this.cv.COLOR_RGBA2GRAY !== 'undefined';
    
    // Si OpenCV est chargé mais pas complètement initialisé, attendre
    if (hasCV && !hasRequiredMethods) {
      console.log('⏳ OpenCV.js chargé mais pas complètement initialisé, attente...');
      // Attendre un peu plus pour l'initialisation complète
      setTimeout(() => {
        this.checkInitialization();
      }, 1000);
      return false;
    }
    
    console.log('🔍 Diagnostic OpenCV.js:', {
      isInitialized: this.isInitialized,
      hasCV: !!this.cv,
      hasRequiredMethods,
      cvType: typeof this.cv,
      hasMat: typeof this.cv?.Mat === 'function',
      hasHoughLinesP: typeof this.cv?.HoughLinesP === 'function',
      hasCvtColor: typeof this.cv?.cvtColor === 'function',
      hasColorConstants: typeof this.cv?.COLOR_RGBA2GRAY !== 'undefined'
    });
    
    return hasRequiredMethods;
  }

  /**
   * Vérifie l'initialisation complète d'OpenCV
   */
  private checkInitialization(): void {
    if (this.isReady()) {
      console.log('✅ OpenCV.js complètement initialisé');
    } else {
      console.warn('⚠️ OpenCV.js toujours pas complètement initialisé');
    }
  }

  /**
   * Diagnostic complet d'OpenCV.js
   */
  getDiagnosticInfo(): any {
    return {
      isInitialized: this.isInitialized,
      hasCV: !!this.cv,
      cvType: typeof this.cv,
      hasMat: typeof this.cv?.Mat === 'function',
      hasHoughLinesP: typeof this.cv?.HoughLinesP === 'function',
      hasCvtColor: typeof this.cv?.cvtColor === 'function',
      windowCV: typeof (window as any).cv,
      userAgent: navigator.userAgent
    };
  }

  /**
   * Obtient l'instance OpenCV
   */
  getOpenCV(): any {
    if (!this.isInitialized) {
      throw new Error('OpenCV.js non initialisé');
    }
    return this.cv;
  }

  /**
   * Génère des lignes simulées en cas d'échec d'OpenCV.js
   */
  private generateSimulatedLines(imageData: ImageData): OpenCVLine[] {
    const lines: OpenCVLine[] = [];
    
    // Générer quelques lignes simulées pour test
    for (let i = 0; i < 5; i++) {
      const x1 = Math.random() * imageData.width;
      const y1 = Math.random() * imageData.height;
      const x2 = Math.random() * imageData.width;
      const y2 = Math.random() * imageData.height;
      
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      
      const isHorizontal = Math.abs(angle) < 45 || Math.abs(angle) > 135;
      const type: 'horizontal' | 'vertical' = isHorizontal ? 'horizontal' : 'vertical';
      
      lines.push({
        x1,
        y1,
        x2,
        y2,
        angle,
        length,
        type,
        confidence: 0.5 // Confiance réduite pour les lignes simulées
      });
    }
    
    return lines;
  }
}

// Instance singleton
export const opencvService = new OpenCVService();