/**
 * Configuration et chargement de PDF.js
 */

export async function loadPDFJS() {
  try {
    // Import dynamique de PDF.js
    const pdfjs = await import('pdfjs-dist');
    
    // Configuration du worker - TOUJOURS local
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }
    
    console.log('✅ PDF.js worker configuré avec ES6 module');
    return pdfjs;
  } catch (error) {
    console.error('❌ Erreur lors du chargement de PDF.js:', error);
    throw error;
  }
}

// Export additionnel pour la compatibilité
export async function setupPDFWorker() {
  const pdfjs = await loadPDFJS();
  return pdfjs;
}