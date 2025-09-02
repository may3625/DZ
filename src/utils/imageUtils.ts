import { PDFPageImage } from '@/types/imageProcessing';

export class ImageUtils {
  /**
   * Convertit un File en HTMLImageElement
   */
  static loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Convertit un HTMLImageElement en ImageData
   */
  static imageElementToImageData(img: HTMLImageElement): ImageData {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  /**
   * Convertit ImageData en Blob
   */
  static imageDataToBlob(imageData: ImageData, type: string = 'image/png'): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      ctx.putImageData(imageData, 0, 0);
      
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, type);
    });
  }

  /**
   * Redimensionne une image en conservant le ratio
   */
  static resizeImage(
    imageData: ImageData, 
    maxWidth: number, 
    maxHeight: number
  ): ImageData {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Calculer les nouvelles dimensions
    let { width, height } = imageData;
    
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    
    // Redimensionner
    canvas.width = width;
    canvas.height = height;
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCtx.putImageData(imageData, 0, 0);
    
    ctx.drawImage(tempCanvas, 0, 0, width, height);
    
    return ctx.getImageData(0, 0, width, height);
  }

  /**
   * Applique un filtre de contraste à une image
   */
  static enhanceContrast(imageData: ImageData, factor: number = 1.5): ImageData {
    const data = new Uint8ClampedArray(imageData.data);
    
    for (let i = 0; i < data.length; i += 4) {
      // Appliquer le contraste aux canaux RGB
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));     // R
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128)); // G
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128)); // B
      // Alpha reste inchangé
    }
    
    return new ImageData(data, imageData.width, imageData.height);
  }

  /**
   * Convertit une image en niveaux de gris
   */
  static toGrayscale(imageData: ImageData): ImageData {
    const data = new Uint8ClampedArray(imageData.data);
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;     // R
      data[i + 1] = gray; // G
      data[i + 2] = gray; // B
      // Alpha reste inchangé
    }
    
    return new ImageData(data, imageData.width, imageData.height);
  }

  /**
   * Applique un filtre de netteté
   */
  static sharpenImage(imageData: ImageData): ImageData {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    
    // Noyau de netteté
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB seulement
          let sum = 0;
          
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const pixelIndex = ((y + ky) * width + (x + kx)) * 4 + c;
              const kernelIndex = (ky + 1) * 3 + (kx + 1);
              sum += imageData.data[pixelIndex] * kernel[kernelIndex];
            }
          }
          
          const outputIndex = (y * width + x) * 4 + c;
          data[outputIndex] = Math.min(255, Math.max(0, sum));
        }
      }
    }
    
    return new ImageData(data, imageData.width, imageData.height);
  }

  /**
   * Détecte si une image est probablement un document scanné
   */
  static isScannedDocument(imageData: ImageData): { isDocument: boolean; confidence: number } {
    // Analyse simple basée sur la distribution des couleurs
    const data = imageData.data;
    let whitePixels = 0;
    let blackPixels = 0;
    let grayPixels = 0;
    let colorPixels = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const avg = (r + g + b) / 3;
      const variance = Math.max(Math.abs(r - avg), Math.abs(g - avg), Math.abs(b - avg));
      
      if (avg > 240 && variance < 10) {
        whitePixels++;
      } else if (avg < 50 && variance < 10) {
        blackPixels++;
      } else if (variance < 20) {
        grayPixels++;
      } else {
        colorPixels++;
      }
    }
    
    const totalPixels = data.length / 4;
    const monochromeRatio = (whitePixels + blackPixels + grayPixels) / totalPixels;
    const whiteRatio = whitePixels / totalPixels;
    
    // Un document typique a beaucoup de blanc, peu de couleurs
    const isDocument = monochromeRatio > 0.8 && whiteRatio > 0.6;
    const confidence = Math.min(1, monochromeRatio * whiteRatio * 2);
    
    return { isDocument, confidence };
  }

  /**
   * Optimise une image pour l'OCR
   */
  static optimizeForOCR(imageData: ImageData): ImageData {
    // 1. Convertir en niveaux de gris
    let processed = this.toGrayscale(imageData);
    
    // 2. Améliorer le contraste
    processed = this.enhanceContrast(processed, 1.3);
    
    // 3. Appliquer un seuillage adaptatif simple
    processed = this.applyThreshold(processed, 0.5);
    
    return processed;
  }

  /**
   * Applique un seuillage binaire
   */
  private static applyThreshold(imageData: ImageData, threshold: number = 0.5): ImageData {
    const data = new Uint8ClampedArray(imageData.data);
    const thresholdValue = threshold * 255;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i]; // L'image est déjà en niveaux de gris
      const binary = gray > thresholdValue ? 255 : 0;
      
      data[i] = binary;     // R
      data[i + 1] = binary; // G
      data[i + 2] = binary; // B
      // Alpha reste inchangé
    }
    
    return new ImageData(data, imageData.width, imageData.height);
  }

  /**
   * Calcule la qualité d'une image basée sur la netteté
   */
  static calculateImageQuality(imageData: ImageData): number {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    let totalVariance = 0;
    let pixelCount = 0;
    
    // Calculer la variance locale pour estimer la netteté
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const centerIndex = (y * width + x) * 4;
        const centerGray = (data[centerIndex] + data[centerIndex + 1] + data[centerIndex + 2]) / 3;
        
        let localVariance = 0;
        let neighborCount = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            
            const neighborIndex = ((y + dy) * width + (x + dx)) * 4;
            const neighborGray = (data[neighborIndex] + data[neighborIndex + 1] + data[neighborIndex + 2]) / 3;
            
            localVariance += Math.abs(centerGray - neighborGray);
            neighborCount++;
          }
        }
        
        totalVariance += localVariance / neighborCount;
        pixelCount++;
      }
    }
    
    const averageVariance = totalVariance / pixelCount;
    
    // Normaliser entre 0 et 1
    return Math.min(1, averageVariance / 50);
  }

  /**
   * Crée une vignette d'une image
   */
  static createThumbnail(imageData: ImageData, size: number = 150): ImageData {
    return this.resizeImage(imageData, size, size);
  }

  /**
   * Compare deux images et retourne un score de similarité
   */
  static compareImages(img1: ImageData, img2: ImageData): number {
    if (img1.width !== img2.width || img1.height !== img2.height) {
      return 0; // Images de tailles différentes
    }
    
    const data1 = img1.data;
    const data2 = img2.data;
    let totalDifference = 0;
    
    for (let i = 0; i < data1.length; i += 4) {
      const diff = Math.abs(data1[i] - data2[i]) + 
                   Math.abs(data1[i + 1] - data2[i + 1]) + 
                   Math.abs(data1[i + 2] - data2[i + 2]);
      totalDifference += diff;
    }
    
    const maxPossibleDifference = (data1.length / 4) * 3 * 255;
    const similarity = 1 - (totalDifference / maxPossibleDifference);
    
    return Math.max(0, similarity);
  }

  /**
   * Sauvegarde une ImageData en tant qu'image téléchargeable
   */
  static downloadImage(imageData: ImageData, filename: string = 'processed_image.png'): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  }
}

export default ImageUtils;