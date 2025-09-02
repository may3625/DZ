// SOLUTION NUCLÉAIRE: Client Vite de remplacement 100% statique
// Élimine DÉFINITIVEMENT tous les identifiants aléatoires

console.log('🚀 Client Vite statique chargé - AUCUN identifiant aléatoire');

// Variables d'environnement FIXES
const env = {
  DEV: true,
  PROD: false,
  SSR: false,
  BASE_URL: '/',
  MODE: 'development'
};

// Définir import.meta.env de façon statique (en conservant les variables VITE_* si présentes)
if (typeof import.meta !== 'undefined') {
  // Utiliser Object.defineProperty pour éviter l'erreur d'assignation
  try {
    Object.defineProperty(import.meta, 'env', {
      value: { ...(import.meta.env || {}), ...env },
      writable: true,
      configurable: true
    });
  } catch (e) {
    // Fallback si import.meta.env est en lecture seule
    console.log('⚠️ import.meta.env est en lecture seule, utilisation du fallback');
  }
}

// Définir process.env de façon statique
if (typeof process !== 'undefined') {
  process.env = process.env || {};
  process.env.NODE_ENV = 'development';
}

// Définir global de façon statique
if (typeof global === 'undefined') {
  window.global = window;
}

// HMR statique (sans identifiants aléatoires)
const createHMR = () => {
  const hmr = {
    accept: () => {},
    acceptExports: () => {},
    dispose: () => {},
    decline: () => {},
    invalidate: () => {},
    on: () => {},
    off: () => {},
    send: () => {}
  };
  
  return hmr;
};

// Définir import.meta.hot de façon statique
if (typeof import.meta !== 'undefined') {
  try {
    Object.defineProperty(import.meta, 'hot', {
      value: createHMR(),
      writable: true,
      configurable: true
    });
  } catch (e) {
    console.log('⚠️ import.meta.hot est en lecture seule, utilisation du fallback');
    // Fallback: essayer de définir directement
    try {
      import.meta.hot = createHMR();
    } catch (fallbackError) {
      console.log('⚠️ Fallback échoué pour import.meta.hot');
    }
  }
}

// WebSocket de remplacement (statique)
class StaticWebSocket {
  constructor() {
    console.log('📡 WebSocket statique initialisé');
    this.readyState = 1; // OPEN
  }
  
  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}

// Remplacer WebSocket si nécessaire
if (typeof WebSocket !== 'undefined') {
  const OriginalWebSocket = WebSocket;
  window.WebSocket = function(url, protocols) {
    if (url && url.includes('vite')) {
      return new StaticWebSocket();
    }
    return new OriginalWebSocket(url, protocols);
  };
}

// Module de rechargement statique
const createReloadModule = () => ({
  reload: () => {
    console.log('🔄 Rechargement statique');
    window.location.reload();
  },
  
  updateStyle: (id, content) => {
    const style = document.getElementById(id) || document.createElement('style');
    style.id = id;
    style.textContent = content;
    if (!style.parentNode) {
      document.head.appendChild(style);
    }
  }
});

// Exporter le module de rechargement
window.__vite_reload = createReloadModule();

// Désactiver tous les événements Vite qui pourraient générer des identifiants
const disableViteEvents = () => {
  const events = ['vite:beforeUpdate', 'vite:afterUpdate', 'vite:error', 'vite:invalidate'];
  events.forEach(event => {
    document.addEventListener(event, (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();
    }, true);
  });
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  disableViteEvents();
  console.log('✅ Client Vite statique initialisé avec succès');
});

// Marquer comme client statique
window.__VITE_STATIC_CLIENT__ = true;
window.__NO_RANDOM_IDENTIFIERS__ = true;

export function injectQuery(id) { return id; }
export function createHotContext(url) {
  return {
    url,
    data: {},
    accept() {},
    dispose() {},
    prune() {},
    invalidate() {},
    on() {},
    off() {},
    send() {}
  };
}
export function updateStyle(id, content) {
  const style = document.getElementById(id) || document.createElement('style');
  style.id = id;
  style.textContent = content;
  if (!style.parentNode) {
    document.head.appendChild(style);
  }
}
export function removeStyle(id) {
  const style = document.getElementById(id);
  if (style && style.parentNode) {
    style.parentNode.removeChild(style);
  }
}
export default {
  env,
  hmr: createHMR(),
  reload: createReloadModule(),
  injectQuery,
  createHotContext,
  updateStyle,
  removeStyle
};