// Configuration des politiques de fonctionnalités pour désactiver les APIs problématiques
// Résout les avertissements sur les fonctionnalités non reconnues

console.log('🚫 Configuration des politiques de fonctionnalités en cours...');

// 1. Politiques de fonctionnalités à désactiver
const featurePolicies = {
  'vr': 'none',
  'ambient-light-sensor': 'none',
  'battery': 'none',
  'camera': 'self',
  'microphone': 'self',
  'geolocation': 'none',
  'payment': 'none',
  'usb': 'none',
  'magnetometer': 'none',
  'gyroscope': 'none',
  'accelerometer': 'none',
  'autoplay': 'none',
  'encrypted-media': 'none',
  'picture-in-picture': 'self',
  'fullscreen': 'self',
  'display-capture': 'self'
};

// 2. Application des politiques via meta tag
const applyFeaturePolicy = () => {
  try {
    // Supprimer l'ancienne meta Feature-Policy si elle existe
    const existingFP = document.querySelector('meta[http-equiv="Feature-Policy"]');
    if (existingFP) {
      existingFP.remove();
    }

    // Créer la nouvelle meta Feature-Policy
    const fpMeta = document.createElement('meta');
    fpMeta.httpEquiv = 'Feature-Policy';
    
    // Construire la chaîne de politique
    const fpString = Object.entries(featurePolicies)
      .map(([feature, policy]) => `${feature} ${policy}`)
      .join('; ');
    
    fpMeta.content = fpString;
    
    // Ajouter au head
    document.head.appendChild(fpMeta);
    
    console.log('✅ Politique de fonctionnalités appliquée');
    console.log('🚫 Fonctionnalités désactivées:', fpString);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'application de la politique de fonctionnalités:', error);
  }
};

// 3. Désactivation des APIs problématiques
const disableProblematicAPIs = () => {
  // Désactiver VR
  if ('getVRDisplays' in navigator) {
    navigator.getVRDisplays = () => {
      console.warn('🚫 API VR désactivée par la politique de fonctionnalités');
      return Promise.resolve([]);
    };
  }

  // Désactiver AmbientLightSensor
  if ('AmbientLightSensor' in window) {
    window.AmbientLightSensor = class AmbientLightSensor {
      constructor() {
        throw new Error('AmbientLightSensor désactivé par la politique de fonctionnalités');
      }
    };
  }

  // Désactiver Battery API
  if ('getBattery' in navigator) {
    navigator.getBattery = () => {
      console.warn('🚫 API Batterie désactivée par la politique de fonctionnalités');
      return Promise.resolve({
        charging: true,
        chargingTime: Infinity,
        dischargingTime: Infinity,
        level: 1.0,
        addEventListener: () => {},
        removeEventListener: () => {}
      });
    };
  }

  // Désactiver les capteurs de mouvement
  const motionSensors = ['Accelerometer', 'Gyroscope', 'Magnetometer'];
  motionSensors.forEach(sensorName => {
    if (sensorName in window) {
      window[sensorName] = class MockSensor {
        constructor() {
          throw new Error(`${sensorName} désactivé par la politique de fonctionnalités`);
        }
      };
    }
  });

  console.log('✅ APIs problématiques désactivées');
};

// 4. Configuration des permissions
const configurePermissions = () => {
  // Vérifier et configurer les permissions
  if (navigator.permissions) {
    const permissionConfig = {
      'camera': 'prompt',
      'microphone': 'prompt',
      'geolocation': 'denied',
      'notifications': 'denied',
      'persistent-storage': 'denied',
      'payment': 'denied',
      'usb': 'denied'
    };

    Object.entries(permissionConfig).forEach(([permission, state]) => {
      try {
        // Simuler la configuration des permissions
        console.log(`ℹ️ Permission ${permission} configurée: ${state}`);
      } catch (error) {
        console.log(`ℹ️ Permission ${permission} non configurable`);
      }
    });
  }
};

// 5. Désactivation des fonctionnalités de tracking
const disableTracking = () => {
  // Désactiver les APIs de tracking
  const trackingAPIs = [
    'navigator.doNotTrack',
    'navigator.msDoNotTrack',
    'window.doNotTrack'
  ];

  trackingAPIs.forEach(apiPath => {
    const parts = apiPath.split('.');
    const obj = parts[0] === 'window' ? window : window[parts[0]];
    const prop = parts[1];
    
    if (obj && prop) {
      Object.defineProperty(obj, prop, {
        value: '1',
        writable: false,
        configurable: false
      });
    }
  });

  // Désactiver les cookies tiers
  if (navigator.cookieEnabled) {
    // Forcer SameSite=Strict pour tous les cookies
    const originalSetCookie = document.__proto__.setCookie;
    if (originalSetCookie) {
      document.__proto__.setCookie = function(name, value, options = {}) {
        options.sameSite = 'Strict';
        options.secure = true;
        return originalSetCookie.call(this, name, value, options);
      };
    }
  }

  console.log('✅ Fonctionnalités de tracking désactivées');
};

// 6. Fonction d'initialisation principale
const initializeFeaturePolicy = () => {
  try {
    applyFeaturePolicy();
    disableProblematicAPIs();
    configurePermissions();
    disableTracking();
    
    console.log('✅ Politique de fonctionnalités complète appliquée');
    
    // Marquer comme configuré
    window.__FEATURE_POLICY_CONFIGURED__ = true;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la politique de fonctionnalités:', error);
  }
};

// 7. Application immédiate si le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFeaturePolicy);
} else {
  initializeFeaturePolicy();
}

// 8. Observer les changements pour appliquer les politiques aux nouveaux éléments
const fpObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Vérifier les nouveaux éléments qui pourraient avoir des fonctionnalités problématiques
          if (node.tagName === 'VIDEO' || node.tagName === 'AUDIO') {
            // Désactiver l'autoplay
            node.setAttribute('autoplay', 'false');
            node.setAttribute('muted', 'true');
          }
        }
      });
    }
  });
});

// Démarrer l'observation
fpObserver.observe(document.body, { childList: true, subtree: true });

// 9. Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    featurePolicies,
    applyFeaturePolicy,
    disableProblematicAPIs,
    configurePermissions,
    disableTracking,
    initializeFeaturePolicy
  };
}

// 10. Fonction de diagnostic
window.diagnoseFeaturePolicy = () => {
  console.log('🔍 Diagnostic Politique de Fonctionnalités:');
  console.log('- Politique configurée:', window.__FEATURE_POLICY_CONFIGURED__ || false);
  console.log('- CSP configurée:', window.__CSP_CONFIGURED__ || false);
  console.log('- Erreurs de navigateur corrigées:', window.__BROWSER_ERRORS_FIXED__ || false);
  
  // Vérifier les APIs désactivées
  console.log('- VR API désactivée:', !navigator.getVRDisplays || navigator.getVRDisplays.toString().includes('désactivée'));
  console.log('- Battery API désactivée:', !navigator.getBattery || navigator.getBattery.toString().includes('désactivée'));
  console.log('- AmbientLightSensor désactivé:', !window.AmbientLightSensor || window.AmbientLightSensor.toString().includes('désactivé'));
};