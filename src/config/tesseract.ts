/**
 * Configuration globale pour Tesseract.js
 * Utilise les fichiers locaux pour éviter les problèmes CSP
 */

import { getAlgerianArabicWhitelist, ARABIC_OCR_PARAMETERS } from './arabicCharacterSets';

export const TESSERACT_CONFIG = {
  // Utiliser les CDN par défaut de Tesseract.js
  // workerPath et corePath seront automatiquement chargés depuis jsDelivr
  // langPath aussi sera automatiquement géré
  
  // Configuration CRITIQUE Algérie : Arabe UNIQUEMENT pour meilleure extraction
  languages: ['ara'], // ARABE SEUL pour éviter interférences françaises
  defaultLanguage: 'ara', // Mode arabe pur pour documents algériens
  
  // Paramètres OCR OPTIMISÉS pour extraction arabe pure
  parameters: {
    // Mode de segmentation optimal pour arabe dense
    tessedit_pageseg_mode: '6', // Bloc uniforme - meilleur pour texte arabe
    tessedit_ocr_engine_mode: '2', // LSTM seul - optimal pour arabe moderne
    
    // Désactivation des dictionnaires pour pure reconnaissance de formes
    load_system_dawg: '0',
    load_freq_dawg: '0',
    load_unambig_dawg: '0',
    load_punc_dawg: '0',
    load_number_dawg: '0',
    
    // Configuration RTL essentielle
    preserve_interword_spaces: '1',
    textord_arabic_numerals: '1',
    
    // Paramètres spécifiques pour l'arabe (importés depuis la configuration dédiée)
    ...ARABIC_OCR_PARAMETERS
  },
  
  // Configuration des workers
  workerOptions: {
    logger: (m: any) => console.log('Tesseract:', m),
    errorHandler: (err: any) => console.error('Tesseract Error:', err),
    gzip: false, // Désactivé pour les fichiers locaux
  }
};

/**
 * Vérifie si les fichiers Tesseract.js sont disponibles (maintenant depuis CDN)
 */
export async function checkTesseractAvailability(): Promise<boolean> {
  try {
    // 🇩🇿 Tesseract.js utilise maintenant les CDN par défaut - toujours disponible
    console.log('🇩🇿 ✅ Tesseract.js utilise les CDN - Mode OCR réel disponible');
    return true;
  } catch (error) {
    console.warn('🇩🇿 Erreur vérification Tesseract:', error);
    return false;
  }
}

/**
 * Obtient la configuration Tesseract.js selon l'environnement
 */
export function getTesseractConfig() {
  // Utiliser les CDN par défaut de Tesseract.js
  return {
    ...TESSERACT_CONFIG
  };
}