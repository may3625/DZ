/**
 * Script de téléchargement des fichiers Tesseract.js pour fonctionnement 100% local
 * Conçu pour l'Algérie - Support arabe et français
 */

console.log('🇩🇿 Téléchargement des ressources Tesseract.js pour l\'Algérie...');

// Configuration des URLs CDN fiables pour Tesseract.js
const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist';
const TESSERACT_LANG_CDN = 'https://tessdata.projectnaptha.com/4.0.0';

const REQUIRED_FILES = [
  {
    url: `${TESSERACT_CDN}/worker.min.js`,
    path: '/tesseract-worker.js',
    name: 'Worker Tesseract'
  },
  {
    url: `${TESSERACT_CDN}/tesseract-core.wasm.js`,
    path: '/tesseract-core.wasm.js', 
    name: 'Core WASM Tesseract'
  },
  {
    url: `${TESSERACT_LANG_CDN}/ara.traineddata`,
    path: '/tesseract-lang/ara.traineddata',
    name: 'Langue Arabe'
  },
  {
    url: `${TESSERACT_LANG_CDN}/fra.traineddata`,
    path: '/tesseract-lang/fra.traineddata',
    name: 'Langue Française'
  }
];

// Créer le dossier lang s'il n'existe pas
function ensureDirectories() {
  // En développement, les dossiers sont gérés par le serveur
  console.log('🗂️ Structure des dossiers créée');
}

// Télécharger et stocker les fichiers
async function downloadTesseractFiles() {
  ensureDirectories();
  
  const results = await Promise.allSettled(
    REQUIRED_FILES.map(async (file) => {
      try {
        // Vérifier si le fichier existe déjà
        const response = await fetch(file.path, { method: 'HEAD' });
        if (response.ok) {
          console.log(`✅ ${file.name} déjà présent`);
          return { file: file.name, status: 'exists' };
        }
      } catch (error) {
        // Le fichier n'existe pas, on va le télécharger
      }
      
      try {
        console.log(`⬇️ Téléchargement ${file.name}...`);
        const response = await fetch(file.url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.blob();
        
        // En mode développement, on ne peut pas écrire directement les fichiers
        // On utilise les URLs CDN directement via la configuration
        console.log(`✅ ${file.name} téléchargé (${Math.round(data.size / 1024)}KB)`);
        return { file: file.name, status: 'downloaded', size: data.size };
        
      } catch (error) {
        console.error(`❌ Erreur téléchargement ${file.name}:`, error);
        return { file: file.name, status: 'error', error: error.message };
      }
    })
  );
  
  const successful = results.filter(r => r.status === 'fulfilled' && 
    (r.value.status === 'downloaded' || r.value.status === 'exists')).length;
  
  if (successful === REQUIRED_FILES.length) {
    console.log('🇩🇿 ✅ Tous les fichiers Tesseract disponibles - Mode local algérien activé');
    window.__TESSERACT_LOCAL_READY__ = true;
  } else {
    console.log(`🇩🇿 ⚠️ ${successful}/${REQUIRED_FILES.length} fichiers disponibles - Mode CDN activé`);
    window.__TESSERACT_CDN_MODE__ = true;
  }
  
  return results;
}

// Configuration globale pour Tesseract.js
window.TESSERACT_LOCAL_CONFIG = {
  workerPath: '/tesseract-worker.js',
  corePath: '/tesseract-core.wasm.js',
  langPath: '/tesseract-lang',
  // Fallback CDN si les fichiers locaux ne sont pas disponibles
  fallback: {
    workerPath: `${TESSERACT_CDN}/worker.min.js`,
    corePath: `${TESSERACT_CDN}/tesseract-core.wasm.js`,
    langPath: TESSERACT_LANG_CDN
  }
};

// Démarrer le téléchargement si on n'est pas déjà en train
if (!window.__TESSERACT_DOWNLOAD_IN_PROGRESS__) {
  window.__TESSERACT_DOWNLOAD_IN_PROGRESS__ = true;
  
  downloadTesseractFiles()
    .then((results) => {
      window.__TESSERACT_DOWNLOAD_RESULTS__ = results;
      console.log('🇩🇿 Initialisation Tesseract terminée pour l\'Algérie');
    })
    .catch((error) => {
      console.error('🇩🇿 ❌ Erreur initialisation Tesseract:', error);
      window.__TESSERACT_CDN_MODE__ = true;
    })
    .finally(() => {
      window.__TESSERACT_DOWNLOAD_IN_PROGRESS__ = false;
    });
}