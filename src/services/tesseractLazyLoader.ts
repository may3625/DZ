/**
 * Service de chargement intelligent pour Tesseract.js
 * Optimise le chargement selon la disponibilité des ressources
 */

let tesseractPromise: Promise<any> | null = null;
let worker: any = null;

export class TesseractLazyLoader {
  private static instance: TesseractLazyLoader;
  private loadedLanguages = new Set<string>();

  static getInstance(): TesseractLazyLoader {
    if (!TesseractLazyLoader.instance) {
      TesseractLazyLoader.instance = new TesseractLazyLoader();
    }
    return TesseractLazyLoader.instance;
  }

  async loadTesseract(): Promise<any> {
    if (tesseractPromise) return tesseractPromise;

    tesseractPromise = this.importTesseract();
    return tesseractPromise;
  }

  private async importTesseract(): Promise<any> {
    try {
      console.log('🔄 Chargement dynamique de Tesseract.js...');
      const startTime = performance.now();
      
      const { createWorker } = await import('tesseract.js');
      
      const loadTime = performance.now() - startTime;
      console.log(`✅ Tesseract.js chargé en ${loadTime.toFixed(2)}ms`);
      
      return { createWorker };
    } catch (error) {
      console.error('❌ Erreur lors du chargement de Tesseract.js:', error);
      throw error;
    }
  }

  async initialize(lang: string = 'fra'): Promise<void> {
    if (worker) return;

    try {
      const { createWorker } = await this.loadTesseract();
      
      console.log('🚀 Initialisation du worker Tesseract...');
      worker = await createWorker({
        logger: (m: any) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Tesseract:', m);
          }
        }
      });

      await this.loadLanguage(lang);
      console.log('✅ Tesseract initialisé avec chargement optimisé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de Tesseract:', error);
      throw error;
    }
  }

  async loadLanguage(lang: string): Promise<void> {
    if (this.loadedLanguages.has(lang)) return;

    try {
      console.log(`🔄 Chargement de la langue ${lang}...`);
      await worker.loadLanguage(lang);
      await worker.initialize(lang);
      this.loadedLanguages.add(lang);
      console.log(`✅ Langue ${lang} chargée`);
    } catch (error) {
      console.error(`❌ Erreur lors du chargement de la langue ${lang}:`, error);
      throw error;
    }
  }

  async recognize(imageData: any, lang: string = 'fra'): Promise<any> {
    if (!worker) {
      await this.initialize(lang);
    }

    if (!this.loadedLanguages.has(lang)) {
      await this.loadLanguage(lang);
    }

    return worker.recognize(imageData);
  }

  async terminate(): Promise<void> {
    if (worker) {
      await worker.terminate();
      worker = null;
      this.loadedLanguages.clear();
      tesseractPromise = null;
    }
  }

  getLoadedLanguages(): string[] {
    return Array.from(this.loadedLanguages);
  }

  isInitialized(): boolean {
    return worker !== null;
  }
}

export const tesseractLazyLoader = TesseractLazyLoader.getInstance();
export default tesseractLazyLoader;