// Utility to activate LOCAL_ONLY mode and prevent external connections
export function activateLocalOnlyMode() {
  try {
    localStorage.setItem('LOCAL_ONLY', 'true');
    console.log('🔒 Mode LOCAL_ONLY activé');
    console.log('✅ Aucune connexion externe ne sera établie');
    console.log('🇩🇿 Application 100% locale opérationnelle');
    
    // Dispatch event instead of reload for reactive updates
    window.dispatchEvent(new CustomEvent('local-mode-activated'));
  } catch (error) {
    console.warn('Impossible d\'activer le mode LOCAL_ONLY:', error);
  }
}

// Check if LOCAL_ONLY mode is active
export function isLocalOnlyActive(): boolean {
  try {
    return localStorage.getItem('LOCAL_ONLY') === 'true';
  } catch {
    return false;
  }
}

// Auto-activate LOCAL_ONLY mode progressively without reload
if (typeof window !== 'undefined' && !localStorage.getItem('LOCAL_ONLY')) {
  try {
    localStorage.setItem('LOCAL_ONLY', 'true');
    console.log('🔒 Mode LOCAL_ONLY activé automatiquement');
    console.log('✅ Aucune connexion externe ne sera établie');
    console.log('🇩🇿 Application 100% locale opérationnelle');
  } catch (error) {
    console.warn('Impossible d\'activer le mode LOCAL_ONLY:', error);
  }
}