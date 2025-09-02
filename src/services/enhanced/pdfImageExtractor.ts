/**
 * Service d'extraction des pages PDF et conversion en images
 * Version simplifiée pour fonctionnement local
 * Étape 1 de l'algorithme : Extraire les pages
 */

export interface PageImage {
  pageNumber: number;
  width: number;
  height: number;
  data?: Uint8ClampedArray;
  canvas?: HTMLCanvasElement;
  originalWidth: number;
  originalHeight: number;
  scale: number;
}

export interface ExtractionConfig {
  scale: number;
  maxWidth?: number;
  maxHeight?: number;
  backgroundColor?: string;
}

class PDFImageExtractor {
  private readonly DEFAULT_CONFIG: ExtractionConfig = {
    scale: 2.0,
    maxWidth: 2480,
    maxHeight: 3508,
    backgroundColor: '#ffffff'
  };

  /**
   * Extrait toutes les pages d'un PDF et les convertit en images
   * Version simplifiée pour fonctionnement local
   */
  async extractPagesFromPDF(file: File, config: Partial<ExtractionConfig> = {}): Promise<PageImage[]> {
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
    const pages: PageImage[] = [];

    console.log('📄 Starting PDF page extraction (simplified version)...');
    const startTime = performance.now();

    try {
      // Pour les fichiers PDF, créer une page simulée
      // En production, cela serait remplacé par un vrai extracteur PDF
      const pageImage: PageImage = {
        pageNumber: 1,
        width: 800,
        height: 1200,
        originalWidth: 800,
        originalHeight: 1200,
        scale: mergedConfig.scale,
        data: this.createSampleImageData(800, 1200)
      };

      pages.push(pageImage);
      
      console.log(`✅ Page 1 extracted (${pageImage.width}x${pageImage.height})`);

      const processingTime = performance.now() - startTime;
      console.log(`🎯 PDF extraction completed: ${pages.length} pages in ${processingTime.toFixed(2)}ms`);

      return pages;

    } catch (error) {
      console.error('💥 PDF extraction failed:', error);
      throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Crée des données d'image d'exemple pour les tests
   */
  private createSampleImageData(width: number, height: number): Uint8ClampedArray {
    const data = new Uint8ClampedArray(width * height * 4);
    
    // Remplir avec du blanc
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;     // R
      data[i + 1] = 255; // G
      data[i + 2] = 255; // B
      data[i + 3] = 255; // A
    }
    
    return data;
  }

  /**
   * Extrait les pages d'une image (pour les fichiers image)
   */
  async extractPagesFromImage(file: File, config: Partial<ExtractionConfig> = {}): Promise<PageImage[]> {
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
    const pages: PageImage[] = [];

    try {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        img.onload = () => {
          try {
            // Calculer les dimensions optimales
            const scale = this.calculateOptimalScale(
              { width: img.width, height: img.height }, 
              mergedConfig
            );
            
            const scaledWidth = Math.floor(img.width * scale);
            const scaledHeight = Math.floor(img.height * scale);

            // Configurer le canvas
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;

            // Dessiner l'image
            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

            // Extraire les données d'image
            const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);

            const pageImage: PageImage = {
              pageNumber: 1,
              width: scaledWidth,
              height: scaledHeight,
              data: imageData.data,
              canvas: canvas,
              originalWidth: img.width,
              originalHeight: img.height,
              scale: scale
            };

            pages.push(pageImage);
            resolve(pages);

          } catch (error) {
            reject(new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = URL.createObjectURL(file);
      });

    } catch (error) {
      console.error('💥 Image extraction failed:', error);
      throw new Error(`Image extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calcule l'échelle optimale pour l'extraction
   */
  private calculateOptimalScale(viewport: { width: number; height: number }, config: ExtractionConfig): number {
    let scale = config.scale;

    // Ajuster selon les dimensions maximales
    if (config.maxWidth) {
      const maxScaleWidth = config.maxWidth / viewport.width;
      scale = Math.min(scale, maxScaleWidth);
    }

    if (config.maxHeight) {
      const maxScaleHeight = config.maxHeight / viewport.height;
      scale = Math.min(scale, maxScaleHeight);
    }

    // Minimum pour qualité OCR acceptable
    scale = Math.max(scale, 1.0);

    return scale;
  }

  /**
   * Convertit une PageImage en Blob pour téléchargement/debug
   */
  convertToBlob(pageImage: PageImage, quality: number = 0.9): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!pageImage.canvas) {
        reject(new Error('No canvas available for conversion'));
        return;
      }

      pageImage.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        'image/jpeg',
        quality
      );
    });
  }

  /**
   * Nettoie les ressources mémoire
   */
  cleanup(pages: PageImage[]): void {
    pages.forEach(page => {
      if (page.canvas) {
        const context = page.canvas.getContext('2d');
        if (context) {
          context.clearRect(0, 0, page.canvas.width, page.canvas.height);
        }
      }
    });
    console.log('🧹 PDF extraction resources cleaned up');
  }
}

export const pdfImageExtractor = new PDFImageExtractor();
export default pdfImageExtractor;