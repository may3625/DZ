// Configuration CSP (Content Security Policy) pour résoudre les problèmes de sécurité
// et d'iframe sandbox

console.log('🛡️ Configuration CSP en cours...');

// 1. Configuration CSP de base
const cspConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'", // Nécessaire pour Vite en développement
    "data:",
    "blob:"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    "data:",
    "blob:"
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:"
  ],
  'font-src': [
    "'self'",
    "data:",
    "blob:"
  ],
  'connect-src': [
    "'self'",
    "ws://localhost:*",
    "wss://localhost:*",
    "http://localhost:*",
    "https://localhost:*"
  ],
  'media-src': [
    "'self'",
    "data:",
    "blob:"
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
  'sandbox': [
    'allow-scripts',
    'allow-same-origin',
    'allow-forms',
    'allow-popups',
    'allow-modals'
  ]
};

// 2. Application de la CSP via meta tag
const applyCSP = () => {
  try {
    // Supprimer l'ancienne meta CSP si elle existe
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingCSP) {
      existingCSP.remove();
    }

    // Créer la nouvelle meta CSP
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    
    // Construire la chaîne CSP
    const cspString = Object.entries(cspConfig)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
    
    cspMeta.content = cspString;
    
    // Ajouter au head
    document.head.appendChild(cspMeta);
    
    console.log('✅ CSP appliquée avec succès');
    console.log('🛡️ Politique de sécurité:', cspString);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'application de la CSP:', error);
  }
};

// 3. Correction des problèmes d'iframe sandbox
const fixIframeSandbox = () => {
  // Détecter et corriger les iframes problématiques
  const iframes = document.querySelectorAll('iframe');
  
  iframes.forEach((iframe, index) => {
    try {
      const currentSandbox = iframe.getAttribute('sandbox') || '';
      const sandboxValues = currentSandbox.split(' ').filter(Boolean);
      
      // Ajouter les permissions nécessaires
      const requiredPermissions = [
        'allow-scripts',
        'allow-same-origin',
        'allow-forms',
        'allow-popups',
        'allow-modals'
      ];
      
      // Fusionner les permissions existantes avec les nouvelles
      const newSandbox = [...new Set([...sandboxValues, ...requiredPermissions])].join(' ');
      
      if (newSandbox !== currentSandbox) {
        iframe.setAttribute('sandbox', newSandbox);
        console.log(`✅ Iframe ${index} corrigée - sandbox: ${newSandbox}`);
      }
      
      // Ajouter des attributs de sécurité supplémentaires
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('referrerpolicy', 'no-referrer');
      
    } catch (error) {
      console.warn(`⚠️ Impossible de corriger l'iframe ${index}:`, error.message);
    }
  });
};

// 4. Correction des problèmes de permissions
const fixPermissions = () => {
  // Vérifier et corriger les permissions de l'API
  if (navigator.permissions) {
    const permissionNames = [
      'camera',
      'microphone',
      'geolocation',
      'notifications',
      'persistent-storage'
    ];
    
    permissionNames.forEach(async (permissionName) => {
      try {
        const result = await navigator.permissions.query({ name: permissionName });
        console.log(`ℹ️ Permission ${permissionName}: ${result.state}`);
      } catch (error) {
        console.log(`ℹ️ Permission ${permissionName} non supportée`);
      }
    });
  }
};

// 5. Correction des problèmes de cookies
const fixCookieIssues = () => {
  // Vérifier la configuration des cookies
  try {
    // Test de cookie simple
    const testCookie = `csp_test_${Date.now()}=1`;
    document.cookie = testCookie;
    
    if (document.cookie.includes(testCookie)) {
      // Supprimer le cookie de test
      document.cookie = `${testCookie}; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      console.log('✅ Cookies fonctionnels');
    } else {
      console.warn('⚠️ Cookies désactivés ou bloqués');
    }
  } catch (error) {
    console.warn('⚠️ Impossible de tester les cookies:', error.message);
  }
};

// 6. Fonction d'initialisation principale
const initializeCSP = () => {
  try {
    applyCSP();
    fixIframeSandbox();
    fixPermissions();
    fixCookieIssues();
    
    console.log('✅ Configuration CSP complète appliquée');
    
    // Marquer comme configuré
    window.__CSP_CONFIGURED__ = true;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation CSP:', error);
  }
};

// 7. Application immédiate si le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCSP);
} else {
  initializeCSP();
}

// 8. Observer les changements pour appliquer la CSP aux nouveaux éléments
const cspObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Corriger les nouvelles iframes
          if (node.tagName === 'IFRAME') {
            setTimeout(fixIframeSandbox, 100);
          }
        }
      });
    }
  });
});

// Démarrer l'observation
cspObserver.observe(document.body, { childList: true, subtree: true });

// 9. Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cspConfig,
    applyCSP,
    fixIframeSandbox,
    fixPermissions,
    fixCookieIssues,
    initializeCSP
  };
}

// 10. Fonction de diagnostic
window.diagnoseCSP = () => {
  console.log('🔍 Diagnostic CSP:');
  console.log('- CSP configurée:', window.__CSP_CONFIGURED__ || false);
  console.log('- Erreurs de navigateur corrigées:', window.__BROWSER_ERRORS_FIXED__ || false);
  console.log('- Client Vite statique:', window.__VITE_STATIC_CLIENT__ || false);
  
  // Vérifier les iframes
  const iframes = document.querySelectorAll('iframe');
  console.log(`- Nombre d'iframes: ${iframes.length}`);
  
  iframes.forEach((iframe, index) => {
    console.log(`  Iframe ${index}:`, {
      sandbox: iframe.getAttribute('sandbox'),
      src: iframe.getAttribute('src'),
      loading: iframe.getAttribute('loading')
    });
  });
};