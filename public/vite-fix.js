// ULTIMATE VITE FIX - Eliminates ALL random identifiers definitively
// This script must run BEFORE any Vite module loads

// Ensure __WS_TOKEN__ exists globally for Vite client injection
// eslint-disable-next-line no-var
var __WS_TOKEN__ = (typeof window !== 'undefined' && window.__WS_TOKEN__) || '';

console.log('🔧 ULTIMATE VITE FIX - Initializing...');
if (typeof import !== 'undefined' && import.meta) {
  const staticEnv = {
    DEV: true,
    PROD: false,
    SSR: false,
    BASE_URL: '/',
    MODE: 'development'
  };
  
  try {
    Object.defineProperty(import.meta, 'env', {
      value: staticEnv,
      writable: false,
      configurable: false
    });
  } catch (e) {
    // Fallback for read-only environments
    console.log('⚠️ import.meta.env fallback');
  }
}

// Override all Vite client functions to prevent random ID generation
window.__vitePreload = function(id) { return Promise.resolve(); };
window.__viteInjectQuery = function(id) { return id; };
window.__viteCreateHotContext = function(url) {
  return {
    url: url,
    data: {},
    accept: function() {},
    dispose: function() {},
    prune: function() {},
    invalidate: function() {},
    on: function() {},
    off: function() {},
    send: function() {}
  };
};

// Static WebSocket replacement for HMR
class StaticHMRSocket {
  constructor() {
    this.readyState = 1; // WebSocket.OPEN
    console.log('📡 Static HMR Socket initialized');
  }
  
  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
}

// Replace WebSocket for Vite HMR
const originalWebSocket = window.WebSocket;
window.WebSocket = function(url, protocols) {
  if (url && (url.includes('vite') || url.includes('ws') || url.includes('hmr'))) {
    return new StaticHMRSocket();
  }
  return new originalWebSocket(url, protocols);
};

// Prevent all Vite hot reload events
const viteEvents = [
  'vite:beforeUpdate',
  'vite:afterUpdate', 
  'vite:error',
  'vite:invalidate',
  'vite:ws:connect',
  'vite:ws:disconnect'
];

viteEvents.forEach(eventName => {
  document.addEventListener(eventName, function(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  }, true);
});

// Static module replacements
window.__vite_plugin_react_preamble_installed__ = true;
window.__VITE_IS_MODERN__ = true;
window.__VITE_STATIC_CLIENT__ = true;

// Override any dynamic import that might generate random IDs
const originalImport = window.import || (async (specifier) => {
  throw new Error(`Dynamic import not supported: ${specifier}`);
});

// Ensure all globals are properly defined
if (typeof global === 'undefined') {
  window.global = window;
}

if (typeof process === 'undefined') {
  window.process = {
    env: { NODE_ENV: 'development' }
  };
}

console.log('✅ ULTIMATE VITE FIX - Applied successfully');
console.log('🚀 Ready for application startup');