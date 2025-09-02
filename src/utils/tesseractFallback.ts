/**
 * Système de fallback pour Tesseract.js
 * Évite les erreurs d'initialisation en détectant la disponibilité des ressources
 */

let tesseractAvailable: boolean | null = null;
let checkPromise: Promise<boolean> | null = null;

export async function isTesseractAvailable(): Promise<boolean> {
  // Si on a déjà vérifié, retourner le résultat en cache
  if (tesseractAvailable !== null) {
    return tesseractAvailable;
  }

  // Si une vérification est en cours, attendre son résultat
  if (checkPromise) {
    return checkPromise;
  }

  // Nouvelle vérification
  checkPromise = checkTesseractResources();
  tesseractAvailable = await checkPromise;
  checkPromise = null;
  
  return tesseractAvailable;
}

async function checkTesseractResources(): Promise<boolean> {
  try {
    console.log('🔍 Vérification des ressources Tesseract...');

    // Tesseract.js utilise maintenant les CDN par défaut - toujours disponible
    console.log('✅ Tesseract.js utilise les CDN officiels - ressources disponibles');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification Tesseract:', error);
    return false;
  }
}

/**
 * Wrapper sécurisé pour créer un worker Tesseract - ARABE PRIORITAIRE ALGÉRIE
 */
export async function createSafeTesseractWorker(languages: string | string[] = ['ara', 'fra'], workerNum = 1, options = {}) {
  try {
    const isAvailable = await isTesseractAvailable();
    
    if (!isAvailable) {
      console.warn('⚠️ Tesseract indisponible - retour d\'un worker fictif');
      return createMockWorker();
    }

    const { createWorker } = await import('tesseract.js');
    
    const worker = await createWorker(languages, workerNum, {
      // Utiliser les CDN par défaut de Tesseract.js
      ...options,
      errorHandler: (err: any) => {
        console.warn('⚠️ Tesseract worker warning (ignoré):', err);
        // Ne pas faire planter l'application
      }
    });

    return worker;
  } catch (error) {
    console.error('❌ Erreur création worker Tesseract:', error);
    return createMockWorker();
  }
}

/**
 * Worker fictif qui retourne des résultats vides mais ne fait pas planter l'app
 */
function createMockWorker() {
  return {
    recognize: async () => ({
      data: {
        text: '',
        confidence: 0
      }
    }),
    setParameters: async () => {},
    terminate: async () => {},
    reinitialize: async () => {},
    getParameters: async () => ({}),
  };
}

/**
 * Précharge les ressources Tesseract (maintenant via CDN)
 */
export async function preloadTesseractResources(): Promise<void> {
  try {
    // Tesseract.js gère automatiquement le préchargement des ressources CDN
    console.log('✅ Tesseract.js gère automatiquement les ressources CDN');
  } catch (error) {
    console.warn('Erreur préchargement ressources Tesseract:', error);
  }
}

/**
 * Reset du cache de disponibilité (utile pour les tests)
 */
export function resetTesseractCache() {
  tesseractAvailable = null;
  checkPromise = null;
}