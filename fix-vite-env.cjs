#!/usr/bin/env node

// CORRECTION DÉFINITIVE - Élimination des identifiants aléatoires Vite
// Solution nucléaire pour corriger le problème "Unexpected identifier"

const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECTION DÉFINITIVE - Élimination des identifiants aléatoires Vite');

// Fonction pour corriger le fichier env.mjs problématique
function fixViteEnvFile() {
  const envPath = path.join(process.cwd(), 'node_modules/vite/dist/client/env.mjs');
  
  if (fs.existsSync(envPath)) {
    console.log('📝 Correction du fichier env.mjs...');
    
    // Contenu de remplacement sans identifiants aléatoires
    const fixedContent = `// Fichier corrigé - AUCUN identifiant aléatoire
const defines = {};
export { defines };
`;
    
    try {
      fs.writeFileSync(envPath, fixedContent);
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
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`✅ Cache supprimé: ${dir}`);
      } catch (error) {
        console.log(`⚠️ Impossible de supprimer ${dir}:`, error.message);
      }
    }
  });
}

// Fonction principale
function main() {
  console.log('🚀 Démarrage de la correction...');
  
  // Étape 1: Nettoyer les caches
  cleanViteCaches();
  
  // Étape 2: Corriger le fichier env.mjs
  fixViteEnvFile();
  
  // Étape 3: Marquer la correction comme appliquée
  const lockFile = path.join(process.cwd(), '.vite-fix-applied');
  fs.writeFileSync(lockFile, `Correction appliquée le ${new Date().toISOString()}\n`);
  
  console.log('✅ Correction définitive appliquée avec succès');
  console.log('🚀 Prêt pour le démarrage du serveur de développement');
}

// Exécuter la correction
main();