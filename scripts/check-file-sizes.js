#!/usr/bin/env node

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
    console.warn(`⚠️  Fichier volumineux détecté: ${filePath} (${sizeMB.toFixed(2)}MB)`);
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
    console.warn(`⚠️  Dossier volumineux détecté: ${dirPath} (${sizeMB.toFixed(2)}MB)`);
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
