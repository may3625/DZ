/**
 * Service de chargement intelligent pour Tesseract
 * Optimise le chargement selon la disponibilité des ressources
 */

import { TESSERACT_OPTIMIZED_CONFIG } from '../config/tesseract-optimized';

class SmartTesseractLoader {
  private static instance: SmartTesseractLoader;
  private loadedLanguages = new Set<string>();
  private worker: any = null;

  static getInstance(): SmartTesseractLoader {
    if (!SmartTesseractLoader.instance) {
      SmartTesseractLoader.instance = new SmartTesseractLoader();
    }
    return SmartTesseractLoader.instance;
  }

  async initialize(lang: string = 'fra'): Promise<void> {
    if (this.worker) return;

    try {
      // Import dynamique pour éviter le chargement au démarrage
      const { createWorker } = await import('tesseract.js');
      
      this.worker = await createWorker('fra', 1, {
        // Utiliser les CDN par défaut de Tesseract.js
        logger: m => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Tesseract:', m);
          }
        }
      });

      // Charger seulement la langue demandée
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
      await this.worker.loadLanguage(lang);
      await this.worker.initialize(lang);
      this.loadedLanguages.add(lang);
      console.log(`✅ Langue ${lang} chargée`);
    } catch (error) {
      console.error(`❌ Erreur lors du chargement de la langue ${lang}:`, error);
      throw error;
    }
  }

  async recognize(imageData: any, lang: string = 'fra'): Promise<any> {
    if (!this.worker) {
      await this.initialize(lang);
    }

    if (!this.loadedLanguages.has(lang)) {
      await this.loadLanguage(lang);
    }

    return this.worker.recognize(imageData);
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.loadedLanguages.clear();
    }
  }

  getLoadedLanguages(): string[] {
    return Array.from(this.loadedLanguages);
  }
}

export const smartTesseractLoader = SmartTesseractLoader.getInstance();
export default smartTesseractLoader;
