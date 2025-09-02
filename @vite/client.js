// Complete Vite client replacement with all required exports
console.log('🔧 Complete Vite client replacement loaded');

// Environment configuration
const env = {
  DEV: true,
  PROD: false,
  SSR: false,
  BASE_URL: '/',
  MODE: 'development'
};

// HMR context creation
export function createHotContext(ownerPath) {
  return {
    file: ownerPath,
    url: ownerPath,
    data: {},
    accept(deps, callback) {
      if (typeof deps === 'function') {
        callback = deps;
        deps = undefined;
      }
    },
    acceptExports(exportNames, callback) {},
    dispose(callback) {},
    prune(callback) {},
    invalidate(message) {},
    on(event, callback) {},
    off(event, callback) {},
    send(event, data) {}
  };
}

// Query injection
export function injectQuery(url, queryToInject) {
  if (typeof url !== 'string') return url;
  
  const [pathname, search] = url.split('?');
  const searchParams = new URLSearchParams(search);
  
  if (queryToInject) {
    for (const [key, value] of Object.entries(queryToInject)) {
      searchParams.set(key, value);
    }
  }
  
  const queryString = searchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

// Style management
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

// Hot reload functionality
export function reload() {
  console.log('🔄 Static reload triggered');
  window.location.reload();
}

// Error overlay (no-op)
export function errorOverlay(err) {
  console.error('Build error:', err);
}

// Import analysis (no-op)
export function preloadModule(url) {
  return Promise.resolve();
}

// Define all required globals
if (typeof globalThis !== 'undefined') {
  // Define __WS_TOKEN__ and other Vite defines
  globalThis.__WS_TOKEN__ = '';
  globalThis.__DEFINES__ = {};
  globalThis.__TESSERACT_WORKER_PATH__ = '/tesseract-worker.js';
  globalThis.__TESSERACT_CORE_PATH__ = '/tesseract-core.wasm.js';
  globalThis.__TESSERACT_LANG_PATH__ = '/tesseract-lang';
  
  globalThis.import = globalThis.import || {};
  globalThis.import.meta = globalThis.import.meta || {};
  globalThis.import.meta.env = { ...env, ...(globalThis.import?.meta?.env || {}) };
  globalThis.import.meta.hot = createHotContext('static');
}

// WebSocket replacement for HMR
class StaticWebSocket {
  constructor() {
    this.readyState = 1; // OPEN
  }
  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}

// Replace WebSocket for Vite HMR
if (typeof window !== 'undefined') {
  const originalWebSocket = window.WebSocket;
  window.WebSocket = function(url, protocols) {
    if (url && (url.includes('vite') || url.includes('hmr'))) {
      return new StaticWebSocket();
    }
    return new originalWebSocket(url, protocols);
  };
  
  // Set global flags
  window.__VITE_STATIC_CLIENT__ = true;
  window.__NO_RANDOM_IDENTIFIERS__ = true;
}

// Default export
export default {
  env,
  createHotContext,
  injectQuery,
  updateStyle,
  removeStyle,
  reload,
  errorOverlay,
  preloadModule
};