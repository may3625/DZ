/**
 * Configuration optimisée pour Tesseract.js
 * Utilise CDN + compression pour réduire la taille
 */

export const TESSERACT_OPTIMIZED_CONFIG = {
  // Utiliser les CDN par défaut au lieu des fichiers locaux
  "loadOnlyNeeded": true,
  "preloadLanguages": [
    "fra"
  ],
  "useCompression": false,
  "compressedExtensions": [
    ".gz",
    ".br"
  ]
};

export const TESSERACT_LANGUAGES = {
  fra: {
    name: 'Français',
    size: '1.08MB',
    compressed: '0.58MB'
  },
  ara: {
    name: 'Arabe',
    size: '1.37MB',
    compressed: '0.69MB'
  }
};

export function getOptimizedTesseractConfig() {
  return {
    ...TESSERACT_OPTIMIZED_CONFIG
    // Utiliser les CDN par défaut de Tesseract.js
  };
}
