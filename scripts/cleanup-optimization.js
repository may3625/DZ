#!/usr/bin/env node

/**
 * Script de nettoyage et d'optimisation finale
 * Supprime les fichiers inutiles et optimise la taille du projet
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Nettoyage et optimisation finale...');

const PUBLIC_DIR = path.join(__dirname, '../public');

// Fonction pour obtenir la taille d'un fichier en MB
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024 / 1024).toFixed(2);
}

// Fonction pour obtenir la taille d'un dossier en MB
function getDirSizeMB(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        calculateSize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }
  }
  
  calculateSize(dirPath);
  return (totalSize / 1024 / 1024).toFixed(2);
}

// Fonction pour supprimer un fichier ou dossier
function removeFileOrDir(path) {
  try {
    if (fs.existsSync(path)) {
      if (fs.statSync(path).isDirectory()) {
        fs.rmSync(path, { recursive: true, force: true });
      } else {
        fs.unlinkSync(path);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression de ${path}:`, error.message);
    return false;
  }
}

// Liste des fichiers/dossiers à supprimer ou optimiser
const cleanupItems = [
  // Fichiers de test inutiles
  'test-ocr.js',
  'test-ocr-quick.js',
  
  // Fichiers de développement
  'public/vite-client-override.js',
  
  // Fichiers géographiques redondants
  'public/algeria-country.geo.json',
  'public/dza-adm1.json',
  'public/world-110m.json',
  
  // Fichiers Tesseract non compressés (garder seulement les .gz)
  'public/tesseract-worker.js',
  'public/tesseract-lang/fra.traineddata.gz',
  'public/tesseract-lang/ara.traineddata.gz'
];

// Fichiers à garder mais optimiser
const optimizeItems = [
  'public/lovable-uploads',
  'public/forms',
  'public/guides'
];

async function performCleanup() {
  console.log('\n📊 Analyse avant nettoyage...');
  const beforeSize = getDirSizeMB(PUBLIC_DIR);
  console.log(`  📦 Taille du dossier public: ${beforeSize}MB`);

  console.log('\n🗑️  Suppression des fichiers inutiles...');
  let removedCount = 0;
  let totalRemovedSize = 0;

  for (const item of cleanupItems) {
    const itemPath = path.join(__dirname, '..', item);
    if (fs.existsSync(itemPath)) {
      const size = fs.statSync(itemPath).isDirectory() 
        ? getDirSizeMB(itemPath) 
        : getFileSizeMB(itemPath);
      
      if (removeFileOrDir(itemPath)) {
        console.log(`  ✅ Supprimé: ${item} (${size}MB)`);
        removedCount++;
        totalRemovedSize += parseFloat(size);
      }
    }
  }

  console.log('\n📦 Optimisation des dossiers...');
  for (const item of optimizeItems) {
    const itemPath = path.join(__dirname, '..', item);
    if (fs.existsSync(itemPath)) {
      const size = getDirSizeMB(itemPath);
      console.log(`  📁 ${item}: ${size}MB`);
      
      // Supprimer les fichiers temporaires dans ces dossiers
      const tempFiles = ['*.tmp', '*.log', '*.cache'];
      for (const pattern of tempFiles) {
        try {
          execSync(`find "${itemPath}" -name "${pattern}" -delete`, { stdio: 'ignore' });
        } catch (error) {
          // Ignorer les erreurs si aucun fichier trouvé
        }
      }
    }
  }

  // Créer un fichier .gitignore pour éviter les fichiers volumineux à l'avenir
  const gitignoreContent = `# Fichiers volumineux à ignorer
*.wasm
*.traineddata
*.geo.json
!algeria-wilayas-simplified.geo.json

# Fichiers temporaires
*.tmp
*.log
*.cache

# Fichiers de développement
vite-client-override.js

# Fichiers de test
test-*.js

# Fichiers non compressés (garder seulement .gz)
tesseract-core.wasm
tesseract-core.wasm.js
tesseract-worker.js
*.traineddata
!*.traineddata.gz

# Dossiers volumineux
node_modules/
dist/
build/
.cache/
`;

  const gitignorePath = path.join(__dirname, '../public/.gitignore');
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('  ✅ Fichier .gitignore créé pour éviter les fichiers volumineux');

  // Créer un script de vérification de taille
  const sizeCheckScript = `#!/usr/bin/env node

/**
 * Script de vérification de la taille des fichiers
 * Alerte si des fichiers volumineux sont ajoutés
 */

import fs from 'fs';
import path from 'path';

const MAX_FILE_SIZE_MB = 1; // 1MB
const MAX_DIR_SIZE_MB = 5;  // 5MB

function checkFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const sizeMB = stats.size / 1024 / 1024;
  
  if (sizeMB > MAX_FILE_SIZE_MB) {
    console.warn(\`⚠️  Fichier volumineux détecté: \${filePath} (\${sizeMB.toFixed(2)}MB)\`);
    return sizeMB;
  }
  return 0;
}

function checkDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        calculateSize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }
  }
  
  calculateSize(dirPath);
  const sizeMB = totalSize / 1024 / 1024;
  
  if (sizeMB > MAX_DIR_SIZE_MB) {
    console.warn(\`⚠️  Dossier volumineux détecté: \${dirPath} (\${sizeMB.toFixed(2)}MB)\`);
  }
  
  return sizeMB;
}

// Vérifier le dossier public
const publicDir = path.join(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  console.log('🔍 Vérification de la taille des fichiers...');
  checkDirectorySize(publicDir);
}

console.log('✅ Vérification terminée');
`;

  const sizeCheckPath = path.join(__dirname, '../scripts/check-file-sizes.js');
  fs.writeFileSync(sizeCheckPath, sizeCheckScript);
  execSync(`chmod +x "${sizeCheckPath}"`);
  console.log('  ✅ Script de vérification de taille créé');

  // Résumé final
  console.log('\n📈 Résumé du nettoyage:');
  console.log(`  🗑️  Fichiers supprimés: ${removedCount}`);
  console.log(`  📉 Espace libéré: ${totalRemovedSize.toFixed(2)}MB`);
  
  const afterSize = getDirSizeMB(PUBLIC_DIR);
  console.log(`  📦 Nouvelle taille du dossier public: ${afterSize}MB`);
  
  const totalReduction = ((parseFloat(beforeSize) - parseFloat(afterSize)) / parseFloat(beforeSize) * 100).toFixed(1);
  console.log(`  📉 Réduction totale: ${totalReduction}%`);

  console.log('\n💡 Recommandations pour maintenir une taille optimale:');
  console.log('  1. Exécutez régulièrement: node scripts/check-file-sizes.js');
  console.log('  2. Utilisez la compression gzip pour les fichiers volumineux');
  console.log('  3. Considérez l\'utilisation d\'un CDN pour les assets statiques');
  console.log('  4. Implémentez le lazy loading pour les fonctionnalités non critiques');

  console.log('\n✅ Nettoyage et optimisation terminés !');
}

// Exécuter le nettoyage
performCleanup().catch(console.error);