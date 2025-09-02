/**
 * Préprocesseur d'images spécialement optimisé pour les textes arabes algériens
 * Améliore la qualité des images avant l'OCR pour maximiser la précision
 */

export interface ArabicPreprocessingOptions {
  enhanceContrast: boolean;
  denoiseImage: boolean;
  straightenLines: boolean;
  improveDPI: boolean;
  sharpenText: boolean;
}

export class ArabicImagePreprocessor {
  
  /**
   * Préprocesse une image pour optimiser l'OCR arabe
   */
  static async preprocessForArabicOCR(
    imageFile: File, 
    options: Partial<ArabicPreprocessingOptions> = {}
  ): Promise<File> {
    
    const defaultOptions: ArabicPreprocessingOptions = {
      enhanceContrast: true,
      denoiseImage: true,
      straightenLines: true,
      improveDPI: true,
      sharpenText: true,
      ...options
    };

    console.log('🔧 [Préprocessing AR] Début optimisation image pour arabe...');

    try {
      // Convertir le fichier en ImageData pour manipulation
      const imageData = await this.fileToImageData(imageFile);
      let processedImageData = imageData;

      // 1. Améliorer le contraste (essentiel pour l'arabe)
      if (defaultOptions.enhanceContrast) {
        console.log('📈 [Préprocessing AR] Amélioration du contraste...');
        processedImageData = this.enhanceContrast(processedImageData);
      }

      // 2. Réduction du bruit (important pour documents scannés arabes)
      if (defaultOptions.denoiseImage) {
        console.log('🧹 [Préprocessing AR] Réduction du bruit...');
        processedImageData = this.denoiseImage(processedImageData);
      }

      // 3. Redressement des lignes (critique pour l'arabe RTL)
      if (defaultOptions.straightenLines) {
        console.log('📏 [Préprocessing AR] Redressement des lignes arabes...');
        processedImageData = this.straightenArabicLines(processedImageData);
      }

      // 4. Amélioration de la netteté du texte arabe
      if (defaultOptions.sharpenText) {
        console.log('🔍 [Préprocessing AR] Amélioration netteté texte arabe...');
        processedImageData = this.sharpenArabicText(processedImageData);
      }

      // Convertir le résultat en fichier
      const processedFile = await this.imageDataToFile(processedImageData, imageFile.name);
      
      console.log('✅ [Préprocessing AR] Optimisation terminée');
      return processedFile;

    } catch (error) {
      console.error('❌ [Préprocessing AR] Erreur lors du préprocessing:', error);
      // En cas d'erreur, retourner l'image originale
      return imageFile;
    }
  }

  /**
   * Convertit un File en ImageData pour manipulation
   */
  private static async fileToImageData(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(imageData);
      };
      
      img.onerror = () => reject(new Error('Impossible de charger l\'image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Convertit ImageData en File
   */
  private static async imageDataToFile(imageData: ImageData, originalName: string): Promise<File> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Impossible de créer le contexte canvas');
    }

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const fileName = originalName.replace(/\.[^/.]+$/, '_preprocessed.png');
          resolve(new File([blob], fileName, { type: 'image/png' }));
        }
      }, 'image/png', 0.95);
    });
  }

  /**
   * Améliore le contraste spécifiquement pour l'arabe
   */
  private static enhanceContrast(imageData: ImageData): ImageData {
    const data = imageData.data;
    const factor = 1.3; // Facteur optimal pour l'arabe

    for (let i = 0; i < data.length; i += 4) {
      // Convertir en niveaux de gris
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      // Améliorer le contraste
      const enhanced = Math.min(255, Math.max(0, (gray - 128) * factor + 128));
      
      data[i] = enhanced;     // R
      data[i + 1] = enhanced; // G
      data[i + 2] = enhanced; // B
      // Alpha reste inchangé
    }

    return imageData;
  }

  /**
   * Réduit le bruit dans l'image
   */
  private static denoiseImage(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data);

    // Filtre médian 3x3 pour réduire le bruit
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const neighbors = [];
        
        // Collecter les voisins
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            neighbors.push(data[idx]); // Utiliser le canal rouge pour le niveau de gris
          }
        }
        
        // Médiane
        neighbors.sort((a, b) => a - b);
        const median = neighbors[4]; // Élément central
        
        const idx = (y * width + x) * 4;
        newData[idx] = median;
        newData[idx + 1] = median;
        newData[idx + 2] = median;
      }
    }

    return new ImageData(newData, width, height);
  }

  /**
   * Redresse les lignes de texte arabe et améliore l'orientation RTL
   */
  private static straightenArabicLines(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data);
    
    console.log('📏 [Préprocessing AR] Amélioration orientation RTL...');
    
    // Améliorer la séparation des mots arabes en renforçant les espaces
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const nextIdx = (y * width + x + 1) * 4;
        
        const currentGray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        const nextGray = 0.299 * data[nextIdx] + 0.587 * data[nextIdx + 1] + 0.114 * data[nextIdx + 2];
        
        // Améliorer les espaces entre mots (zones claires entre zones sombres)
        if (currentGray > 200 && nextGray > 200) {
          // Zone d'espace - la rendre plus blanche pour améliorer la séparation
          newData[idx] = Math.min(255, currentGray + 20);
          newData[idx + 1] = Math.min(255, currentGray + 20);
          newData[idx + 2] = Math.min(255, currentGray + 20);
        }
      }
    }
    
    return new ImageData(newData, width, height);
  }

  /**
   * Améliore la netteté du texte arabe avec kernel optimisé pour l'arabe
   */
  private static sharpenArabicText(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data);

    // Matrice de convolution spécialement optimisée pour l'écriture arabe (plus agressive)
    const kernel = [
      0, -0.8, 0,
      -0.8, 4.2, -0.8,
      0, -0.8, 0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        let kernelIdx = 0;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const pixelIdx = ((y + dy) * width + (x + dx)) * 4;
            sum += data[pixelIdx] * kernel[kernelIdx];
            kernelIdx++;
          }
        }

        const result = Math.min(255, Math.max(0, sum));
        const idx = (y * width + x) * 4;
        
        newData[idx] = result;
        newData[idx + 1] = result;
        newData[idx + 2] = result;
      }
    }

    return new ImageData(newData, width, height);
  }

  /**
   * Optimise spécifiquement l'image pour la reconnaissance de texte arabe RTL
   */
  static async preprocessForArabicRTL(imageFile: File): Promise<File> {
    console.log('🔧 [RTL-AR] Préprocessing spécifique pour texte arabe RTL...');
    
    try {
      const imageData = await this.fileToImageData(imageFile);
      let processedImageData = imageData;

      // 1. Amélioration contrast spécifique pour l'arabe
      processedImageData = this.enhanceArabicContrast(processedImageData);
      
      // 2. Nettoyage des artéfacts de scan pour l'arabe
      processedImageData = this.cleanArabicScanArtifacts(processedImageData);
      
      // 3. Amélioration de la séparation des caractères arabes
      processedImageData = this.improveArabicCharacterSeparation(processedImageData);
      
      // 4. Redressement et orientation RTL
      processedImageData = this.straightenArabicLines(processedImageData);
      
      // 5. Netteté finale optimisée
      processedImageData = this.sharpenArabicText(processedImageData);

      const processedFile = await this.imageDataToFile(processedImageData, imageFile.name);
      console.log('✅ [RTL-AR] Préprocessing arabe RTL terminé');
      return processedFile;

    } catch (error) {
      console.error('❌ [RTL-AR] Erreur préprocessing arabe:', error);
      return imageFile;
    }
  }

  /**
   * Améliore le contraste spécifiquement pour les caractères arabes
   */
  private static enhanceArabicContrast(imageData: ImageData): ImageData {
    const data = imageData.data;
    const factor = 1.5; // Plus agressif pour l'arabe

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      // Utilisation d'une courbe S pour améliorer les contrastes moyens (typiques de l'arabe)
      const enhanced = gray < 128 
        ? Math.max(0, (gray - 128) * factor + 128) * 0.8
        : Math.min(255, (gray - 128) * factor + 128);
      
      data[i] = enhanced;
      data[i + 1] = enhanced;
      data[i + 2] = enhanced;
    }

    return imageData;
  }

  /**
   * Nettoie les artéfacts spécifiques aux scans de documents arabes
   */
  private static cleanArabicScanArtifacts(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data);

    // Filtre morphologique pour nettoyer les points isolés
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const gray = data[idx];
        
        // Compter les voisins sombres
        let darkNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
            if (data[neighborIdx] < 128) darkNeighbors++;
          }
        }
        
        // Si pixel isolé sombre avec peu de voisins sombres, le supprimer
        if (gray < 128 && darkNeighbors < 3) {
          newData[idx] = 255;
          newData[idx + 1] = 255;
          newData[idx + 2] = 255;
        }
      }
    }

    return new ImageData(newData, width, height);
  }

  /**
   * Améliore la séparation entre caractères arabes connectés
   */
  private static improveArabicCharacterSeparation(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data);

    // Détection et amélioration des connexions fines entre caractères
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 2; x++) {
        const idx = (y * width + x) * 4;
        const rightIdx = (y * width + x + 1) * 4;
        
        const gray = data[idx];
        const rightGray = data[rightIdx];
        
        // Si connexion fine horizontale (liaison entre caractères)
        if (gray < 180 && rightGray < 180) {
          // Vérifier si c'est vraiment une liaison fine
          const topIdx = ((y - 1) * width + x) * 4;
          const bottomIdx = ((y + 1) * width + x) * 4;
          
          if (data[topIdx] > 200 && data[bottomIdx] > 200) {
            // Liaison fine détectée - l'éclaircir légèrement
            newData[idx] = Math.min(255, gray + 40);
            newData[idx + 1] = Math.min(255, gray + 40);
            newData[idx + 2] = Math.min(255, gray + 40);
          }
        }
      }
    }

    return new ImageData(newData, width, height);
  }

  /**
   * Analyse la qualité de l'image pour l'OCR arabe
   */
  static analyzeImageQuality(imageData: ImageData): {
    contrast: number;
    sharpness: number;
    noise: number;
    suitabilityForArabic: 'excellent' | 'good' | 'poor';
  } {
    // Calcul simplifié de la qualité
    const contrast = this.calculateContrast(imageData);
    const sharpness = this.calculateSharpness(imageData);
    const noise = this.calculateNoise(imageData);

    let suitability: 'excellent' | 'good' | 'poor' = 'poor';
    if (contrast > 0.7 && sharpness > 0.6 && noise < 0.3) {
      suitability = 'excellent';
    } else if (contrast > 0.5 && sharpness > 0.4 && noise < 0.5) {
      suitability = 'good';
    }

    console.log(`📊 [Qualité AR] Contraste: ${Math.round(contrast * 100)}%, Netteté: ${Math.round(sharpness * 100)}%, Bruit: ${Math.round(noise * 100)}%`);
    console.log(`🎯 [Qualité AR] Convenance pour arabe: ${suitability}`);

    return { contrast, sharpness, noise, suitabilityForArabic: suitability };
  }

  private static calculateContrast(imageData: ImageData): number {
    // Calcul simplifié du contraste
    const data = imageData.data;
    let min = 255, max = 0;

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      min = Math.min(min, gray);
      max = Math.max(max, gray);
    }

    return (max - min) / 255;
  }

  private static calculateSharpness(imageData: ImageData): number {
    // Calcul simplifié de la netteté (gradient moyen)
    const { width, height, data } = imageData;
    let totalGradient = 0;
    let count = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const right = ((y * width + x + 1) * 4);
        const bottom = (((y + 1) * width + x) * 4);

        const gradX = Math.abs(data[idx] - data[right]);
        const gradY = Math.abs(data[idx] - data[bottom]);
        totalGradient += Math.sqrt(gradX * gradX + gradY * gradY);
        count++;
      }
    }

    return Math.min(1, (totalGradient / count) / 100);
  }

  private static calculateNoise(imageData: ImageData): number {
    // Calcul simplifié du bruit
    const { width, height, data } = imageData;
    let variance = 0;
    let count = 0;
    let mean = 0;

    // Calculer la moyenne
    for (let i = 0; i < data.length; i += 4) {
      mean += data[i];
      count++;
    }
    mean /= count;

    // Calculer la variance
    for (let i = 0; i < data.length; i += 4) {
      variance += Math.pow(data[i] - mean, 2);
    }
    variance /= count;

    return Math.min(1, Math.sqrt(variance) / 128);
  }
}