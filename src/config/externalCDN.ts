// Configuration des CDN externes pour réduire la taille du repository
export const EXTERNAL_CDN_CONFIG = {
  // Tesseract.js - OCR
  tesseract: {
    core: 'https://unpkg.com/tesseract.js@4.1.1/dist/tesseract-core.wasm.js',
    worker: 'https://unpkg.com/tesseract.js@4.1.1/dist/worker.min.js',
    lang: 'https://tessdata.projectnaptha.com/4.0.0'
  },
  
  // OpenCV.js - Vision par ordinateur
  opencv: {
    core: 'https://docs.opencv.org/4.8.0/opencv.js',
    utils: 'https://docs.opencv.org/4.8.0/utils.js'
  },
  
  // Autres bibliothèques
  libraries: {
    pdfjs: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    jsqr: 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js',
    html2canvas: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
  }
};

// Fonction pour charger dynamiquement les bibliothèques externes
export const loadExternalLibrary = async (url: string, type: 'script' | 'wasm' = 'script'): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (type === 'script') {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve(window);
      script.onerror = () => reject(new Error(`Failed to load: ${url}`));
      document.head.appendChild(script);
    } else if (type === 'wasm') {
      // Pour les fichiers WASM, utiliser fetch
      fetch(url)
        .then(response => response.arrayBuffer())
        .then(buffer => resolve(buffer))
        .catch(reject);
    }
  });
};

// Configuration des fallbacks locaux (si CDN indisponible)
export const FALLBACK_CONFIG = {
  enabled: true,
  localPaths: {
    tesseract: '/assets/tesseract/',
    opencv: '/assets/opencv/',
    pdfjs: '/assets/pdfjs/'
  }
};

// Vérifier la disponibilité des CDN
export const checkCDNAvailability = async (): Promise<Record<string, boolean>> => {
  const results: Record<string, boolean> = {};
  
  for (const [name, config] of Object.entries(EXTERNAL_CDN_CONFIG)) {
    try {
      if (typeof config === 'string') {
        const response = await fetch(config, { method: 'HEAD' });
        results[name] = response.ok;
      } else if (typeof config === 'object') {
        for (const [key, url] of Object.entries(config)) {
          try {
            const response = await fetch(url as string, { method: 'HEAD' });
            results[`${name}.${key}`] = response.ok;
          } catch {
            results[`${name}.${key}`] = false;
          }
        }
      }
    } catch {
      results[name] = false;
    }
  }
  
  return results;
};