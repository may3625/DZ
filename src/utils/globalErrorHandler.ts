/**
 * Gestionnaire d'erreurs global pour éviter les erreurs non capturées
 */

let errorHandler: ((error: any) => void) | null = null;

export function setGlobalErrorHandler(handler: (error: any) => void) {
  errorHandler = handler;
}

export function setupGlobalErrorHandling() {
  // Capturer les erreurs JavaScript non gérées
  window.addEventListener('error', (event) => {
    const error = event.error;
    
    // Ignorer les erreurs Tesseract connues qui ne sont pas critiques
    if (error && (
      error.message?.includes('initialization failed') ||
      error.message?.includes('Cannot read properties of undefined') ||
      error.stack?.includes('tesseract')
    )) {
      console.warn('⚠️ Erreur Tesseract ignorée:', error.message);
      event.preventDefault(); // Empêcher l'affichage de l'erreur
      return;
    }

    // Autres erreurs
    if (errorHandler) {
      errorHandler(error);
    } else {
      console.error('❌ Erreur non gérée:', error);
    }
  });

  // Capturer les rejets de promesse non gérés
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    // Ignorer les erreurs Tesseract
    if (error && (
      error.message?.includes('initialization failed') ||
      error.message?.includes('tesseract') ||
      error.message?.includes('worker')
    )) {
      console.warn('⚠️ Promesse rejetée (Tesseract) ignorée:', error.message);
      event.preventDefault();
      return;
    }

    // Autres rejets
    if (errorHandler) {
      errorHandler(error);
    } else {
      console.error('❌ Promesse non gérée:', error);
    }
  });
}

// Initialiser automatiquement
if (typeof window !== 'undefined') {
  setupGlobalErrorHandling();
}