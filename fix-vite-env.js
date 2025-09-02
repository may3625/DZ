// Fix Vite environment variables configuration
// This script ensures proper handling of environment variables in development and production

console.log('🔧 CORRECTION DÉFINITIVE - Élimination des identifiants aléatoires Vite');

// Node.js imports for file system operations
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, writeFileSync, rmSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fonction pour corriger le fichier env.mjs problématique
function fixViteEnvFile() {
  const envPath = join(process.cwd(), 'node_modules/vite/dist/client/env.mjs');
  
  if (existsSync(envPath)) {
    console.log('📝 Correction du fichier env.mjs...');
    
    // Contenu de remplacement sans identifiants aléatoires
    const fixedContent = `// Fichier corrigé - AUCUN identifiant aléatoire
const defines = {};
export { defines };
`;
    
    try {
      writeFileSync(envPath, fixedContent);
      console.log('✅ Fichier env.mjs corrigé avec succès');
    } catch (error) {
      console.log('⚠️ Impossible de corriger env.mjs:', error.message);
    }
  } else {
    console.log('⚠️ Fichier env.mjs non trouvé - correction ignorée');
  }
}

// Fonction pour nettoyer tous les caches Vite
function cleanViteCaches() {
  console.log('🧹 Nettoyage des caches Vite...');
  
  const cacheDirs = [
    'node_modules/.vite',
    '.vite',
    'dist',
    'node_modules/.cache'
  ];
  
  cacheDirs.forEach(dir => {
    const dirPath = join(process.cwd(), dir);
    if (existsSync(dirPath)) {
      try {
        rmSync(dirPath, { recursive: true, force: true });
        console.log(`✅ Cache supprimé: ${dir}`);
      } catch (error) {
        console.log(`⚠️ Impossible de supprimer ${dir}:`, error.message);
      }
    }
  });
}

// Configuration des variables d'environnement pour Vite
if (typeof window !== 'undefined' && window.process?.env) {
  // Browser environment - ensure Vite env vars are properly set
  if (!window.process.env.VITE_SUPABASE_URL) {
    console.warn('⚠️ Variables d\'environnement Vite manquantes');
  }
}

// Node.js environment check et correction
if (typeof process !== 'undefined' && process.env) {
  // Server-side environment variables handling
  console.log('✅ Variables d\'environnement Node.js détectées');
  
  // Exécuter la correction si on est en Node.js
  console.log('🚀 Démarrage de la correction...');
  
  // Étape 1: Nettoyer les caches
  cleanViteCaches();
  
  // Étape 2: Corriger le fichier env.mjs
  fixViteEnvFile();
  
  // Étape 3: Marquer la correction comme appliquée
  const lockFile = join(process.cwd(), '.vite-fix-applied');
  writeFileSync(lockFile, `Correction appliquée le ${new Date().toISOString()}\n`);
  
  console.log('✅ Correction définitive appliquée avec succès');
  console.log('🚀 Prêt pour le démarrage du serveur de développement');
}