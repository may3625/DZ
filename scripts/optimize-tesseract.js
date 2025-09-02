#!/usr/bin/env node

/**
 * Script d'optimisation des fichiers Tesseract
 * Compresse et optimise les fichiers Tesseract pour réduire la taille
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Optimisation des fichiers Tesseract...');

const PUBLIC_DIR = path.join(__dirname, '../public');
const TESSERACT_DIR = path.join(PUBLIC_DIR, 'tesseract-lang');

// Fonction pour obtenir la taille d'un fichier en MB
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024 / 1024).toFixed(2);
}

// Fonction pour compresser un fichier avec gzip
function compressFile(filePath) {
  const compressedPath = filePath + '.gz';
  try {
    execSync(`gzip -c "${filePath}" > "${compressedPath}"`);
    const originalSize = getFileSizeMB(filePath);
    const compressedSize = getFileSizeMB(compressedPath);
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    console.log(`  📦 ${path.basename(filePath)}: ${originalSize}MB → ${compressedSize}MB (${reduction}% réduction)`);
    return { originalSize, compressedSize, reduction };
  } catch (error) {
    console.error(`  ❌ Erreur lors de la compression de ${filePath}:`, error.message);
    return null;
  }
}

// Fonction pour créer un fichier de configuration optimisé
function createOptimizedConfig() {
  const config = {
    // Utiliser CDN pour les fichiers principaux
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v6.0.1/dist/worker.min.js',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@4.0.4/tesseract-core.wasm.js',
    
    // Garder seulement les modèles de langues locaux (plus petits)
    langPath: '/tesseract-lang',
    
    // Configuration pour le chargement optimisé
    loadOnlyNeeded: true,
    preloadLanguages: ['fra'], // Précharger seulement le français par défaut
    
    // Compression activée
    useCompression: true,
    compressedExtensions: ['.gz', '.br']
  };

  const configPath = path.join(__dirname, '../src/config/tesseract-optimized.ts');
  const configContent = `/**
 * Configuration optimisée pour Tesseract.js
 * Utilise CDN + compression pour réduire la taille
 */

export const TESSERACT_OPTIMIZED_CONFIG = ${JSON.stringify(config, null, 2)};

export const TESSERACT_LANGUAGES = {
  fra: {
    name: 'Français',
    size: '${getFileSizeMB(path.join(TESSERACT_DIR, 'fra.traineddata'))}MB',
    compressed: '${getFileSizeMB(path.join(TESSERACT_DIR, 'fra.traineddata.gz'))}MB'
  },
  ara: {
    name: 'Arabe',
    size: '${getFileSizeMB(path.join(TESSERACT_DIR, 'ara.traineddata'))}MB',
    compressed: '${getFileSizeMB(path.join(TESSERACT_DIR, 'ara.traineddata.gz'))}MB'
  }
};

export function getOptimizedTesseractConfig() {
  return {
    ...TESSERACT_OPTIMIZED_CONFIG,
    // Détection automatique de la meilleure source
    getWorkerPath: () => {
      // Essayer CDN d'abord, puis local
      return TESSERACT_OPTIMIZED_CONFIG.workerPath;
    },
    getCorePath: () => {
      return TESSERACT_OPTIMIZED_CONFIG.corePath;
    }
  };
}
`;

  fs.writeFileSync(configPath, configContent);
  console.log('  ✅ Configuration optimisée créée');
}

// Fonction pour créer un service de chargement intelligent
function createSmartLoader() {
  const loaderContent = `/**
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
      
      this.worker = await createWorker({
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
      console.log(\`✅ Langue \${lang} chargée\`);
    } catch (error) {
      console.error(\`❌ Erreur lors du chargement de la langue \${lang}:\`, error);
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
`;

  const loaderPath = path.join(__dirname, '../src/services/smartTesseractLoader.ts');
  fs.writeFileSync(loaderPath, loaderContent);
  console.log('  ✅ Service de chargement intelligent créé');
}

// Fonction principale
async function optimizeTesseract() {
  console.log('\n📊 Analyse des fichiers Tesseract...');
  
  const files = [
    path.join(PUBLIC_DIR, 'tesseract-worker.js'),
    path.join(PUBLIC_DIR, 'tesseract-core.wasm.js'),
    path.join(PUBLIC_DIR, 'tesseract-core.wasm'),
    path.join(TESSERACT_DIR, 'fra.traineddata'),
    path.join(TESSERACT_DIR, 'ara.traineddata')
  ];

  let totalOriginalSize = 0;
  let totalCompressedSize = 0;

  // Compresser chaque fichier
  for (const file of files) {
    if (fs.existsSync(file)) {
      const result = compressFile(file);
      if (result) {
        totalOriginalSize += parseFloat(result.originalSize);
        totalCompressedSize += parseFloat(result.compressedSize);
      }
    } else {
      console.log(`  ⚠️  Fichier non trouvé: ${path.basename(file)}`);
    }
  }

  // Créer les fichiers de configuration optimisés
  createOptimizedConfig();
  createSmartLoader();

  // Résumé
  console.log('\n📈 Résumé de l\'optimisation:');
  console.log(`  📦 Taille originale: ${totalOriginalSize.toFixed(2)}MB`);
  console.log(`  📦 Taille compressée: ${totalCompressedSize.toFixed(2)}MB`);
  console.log(`  📉 Réduction totale: ${((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1)}%`);

  // Recommandations
  console.log('\n💡 Recommandations:');
  console.log('  1. Utilisez le service SmartTesseractLoader pour le chargement optimisé');
  console.log('  2. Configurez votre serveur pour servir les fichiers .gz');
  console.log('  3. Considérez l\'utilisation d\'un CDN pour les fichiers principaux');
  console.log('  4. Implémentez le chargement à la demande des langues');

  console.log('\n✅ Optimisation Tesseract terminée !');
}

// Exécuter l'optimisation
optimizeTesseract().catch(console.error);