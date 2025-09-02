// SOLUTION RADICALE: Remplacement complet de env.mjs
// Élimine définitivement les identifiants aléatoires générés par Vite

const context = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  } else if (typeof self !== "undefined") {
    return self;
  } else if (typeof window !== "undefined") {
    return window;
  } else {
    return Function("return this")();
  }
})();

// SOLUTION: Définir des variables stables au lieu d'utiliser __DEFINES__
const defines = {
  "process.env.NODE_ENV": "development",
  "global": "globalThis",
  "__WS_TOKEN__": "",
  "import.meta.env.DEV": true,
  "import.meta.env.PROD": false,
  "import.meta.env.SSR": false
};

// Application sécurisée des définitions
Object.keys(defines).forEach((key) => {
  try {
    const segments = key.split(".");
    let target = context;
    
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      if (!(segment in target)) {
        target[segment] = {};
      }
      target = target[segment];
    }
    
    const lastSegment = segments[segments.length - 1];
    const value = defines[key];
    
    // Conversion sécurisée des valeurs
    if (typeof value === "string" && (value === "true" || value === "false")) {
      target[lastSegment] = value === "true";
    } else if (typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
      target[lastSegment] = value.slice(1, -1);
    } else {
      target[lastSegment] = value;
    }
  } catch (error) {
    // Ignorer silencieusement les erreurs de définition
    console.warn(`Impossible de définir ${key}:`, error.message);
  }
});

// Export pour compatibilité
export default defines;