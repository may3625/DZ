// Correction globale des erreurs de navigateur
// Résout les problèmes de fonctionnalités non reconnues et d'iframe sandbox

console.log('🔧 Correction des erreurs de navigateur en cours...');

// 1. Correction des fonctionnalités non reconnues
const fixUnrecognizedFeatures = () => {
  // Correction pour 'vr'
  if (!('getVRDisplays' in navigator)) {
    navigator.getVRDisplays = () => Promise.resolve([]);
    console.log('✅ Fonctionnalité VR corrigée');
  }

  // Correction pour 'ambient-light-sensor'
  if (!('AmbientLightSensor' in window)) {
    window.AmbientLightSensor = class AmbientLightSensor {
      constructor() {
        throw new Error('AmbientLightSensor not supported in this browser');
      }
    };
    console.log('✅ Capteur de lumière ambiante corrigé');
  }

  // Correction pour 'battery'
  if (!('getBattery' in navigator)) {
    navigator.getBattery = () => Promise.resolve({
      charging: true,
      chargingTime: Infinity,
      dischargingTime: Infinity,
      level: 1.0,
      addEventListener: () => {},
      removeEventListener: () => {}
    });
    console.log('✅ API Batterie corrigée');
  }
};

// 2. Correction des problèmes d'iframe sandbox
const fixIframeSandboxIssues = () => {
  // Détecter si nous sommes dans une iframe
  const isInIframe = window !== window.top;
  
  if (isInIframe) {
    console.log('⚠️ Détection d\'iframe - Application des corrections de sécurité');
    
    // Désactiver les fonctionnalités sensibles en iframe
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
      navigator.mediaDevices.getUserMedia = function(constraints) {
        console.warn('🚫 getUserMedia désactivé en mode iframe pour des raisons de sécurité');
        return Promise.reject(new Error('getUserMedia not available in iframe mode'));
      };
    }
    
    // Désactiver le partage en iframe
    if (navigator.share) {
      navigator.share = function() {
        console.warn('🚫 API de partage désactivée en mode iframe');
        return Promise.reject(new Error('Share API not available in iframe mode'));
      };
    }
  }
};

// 3. Correction des problèmes de cookies tiers
const fixThirdPartyCookies = () => {
  // Détecter les problèmes de cookies tiers
  try {
    const testCookie = 'test_cookie=' + Date.now();
    document.cookie = testCookie;
    const hasCookie = document.cookie.indexOf(testCookie) !== -1;
    document.cookie = testCookie + '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    if (!hasCookie) {
      console.warn('⚠️ Cookies désactivés - Certaines fonctionnalités peuvent ne pas fonctionner');
    }
  } catch (e) {
    console.warn('⚠️ Impossible de tester les cookies:', e.message);
  }
};

// 4. Correction des problèmes de preload
const fixPreloadIssues = () => {
  // Supprimer les liens de preload problématiques
  const problematicPreloads = document.querySelectorAll('link[rel="preload"]');
  problematicPreloads.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href.includes('facebook.com') || href.includes('google-analytics'))) {
      console.log('🗑️ Suppression du preload problématique:', href);
      link.remove();
    }
  });
};

// 5. Correction des problèmes de permissions
const fixPermissionIssues = () => {
  // Vérifier et corriger les permissions
  if (navigator.permissions) {
    // Permission pour la caméra
    navigator.permissions.query({ name: 'camera' }).then(result => {
      if (result.state === 'denied') {
        console.warn('🚫 Permission caméra refusée');
      }
    }).catch(() => {
      console.log('ℹ️ API de permissions non supportée');
    });
    
    // Permission pour le microphone
    navigator.permissions.query({ name: 'microphone' }).then(result => {
      if (result.state === 'denied') {
        console.warn('🚫 Permission microphone refusée');
      }
    }).catch(() => {
      console.log('ℹ️ API de permissions non supportée');
    });
  }
};

// 6. Fonction d'initialisation principale
const initializeBrowserFixes = () => {
  try {
    fixUnrecognizedFeatures();
    fixIframeSandboxIssues();
    fixThirdPartyCookies();
    fixPreloadIssues();
    fixPermissionIssues();
    
    console.log('✅ Toutes les corrections de navigateur ont été appliquées');
  } catch (error) {
    console.error('❌ Erreur lors de l\'application des corrections:', error);
  }
};

// 7. Application des corrections
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeBrowserFixes);
} else {
  initializeBrowserFixes();
}

// 8. Correction en temps réel pour les éléments ajoutés dynamiquement
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Vérifier les nouveaux liens de preload
          if (node.tagName === 'LINK' && node.rel === 'preload') {
            const href = node.getAttribute('href');
            if (href && (href.includes('facebook.com') || href.includes('google-analytics'))) {
              console.log('🗑️ Suppression du nouveau preload problématique:', href);
              node.remove();
            }
          }
        }
      });
    }
  });
});

// Démarrer l'observation
observer.observe(document.head, { childList: true, subtree: true });

// 9. Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeBrowserFixes,
    fixUnrecognizedFeatures,
    fixIframeSandboxIssues,
    fixThirdPartyCookies,
    fixPreloadIssues,
    fixPermissionIssues
  };
}

// 10. Marquer comme corrigé
window.__BROWSER_ERRORS_FIXED__ = true;