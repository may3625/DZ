import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      port: 8081,
      overlay: false,
      clientPort: 8081,
    },
    fs: {
      strict: false,
    },
    origin: 'http://localhost:8080',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    },
  },

  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    
    // PWA temporairement désactivée pour éviter les connexions Google
    // ...(mode === 'production' ? [VitePWA({
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
    //     globIgnores: ['**/tesseract-lang/**'],
    //     // Désactiver Google Analytics pour éviter les connexions externes
    //     skipWaiting: true,
    //     clientsClaim: true,
    //     // Exclure les modules Google
    //     exclude: [/google-analytics/, /firestore/, /gpt-engineer/],
    //     // Configuration sans Google
    //     runtimeCaching: []
    //   },
    //   manifest: {
    //     name: 'Dalil.dz - Plateforme Juridique Algérienne',
    //     short_name: 'Dalil.dz',
    //     description: 'Plateforme algérienne de veille juridique et réglementaire avec support RTL',
    //     theme_color: '#40915d',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     orientation: 'portrait',
    //     start_url: '/',
    //     scope: '/',
    //     lang: 'fr',
    //     categories: ['legal', 'government', 'reference'],
    //     icons: [
    //       {
    //         src: '/icon-192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //         purpose: 'any maskable'
    //       },
    //       {
    //         src: '/icon-512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable'
    //       }
    //     ]
    //   }
    // })] : [])
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"]
  },

  cacheDir: `.vite`,
  
  optimizeDeps: {
    force: true,
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@tanstack/react-query'
    ],
    exclude: [
      '@huggingface/transformers', 
      'react-day-picker', 
      'vite', 
      '@vite/client',
      'opencv.js' // Exclure opencv.js pour éviter les erreurs de mémoire
    ]
  },

  build: {
    target: 'es2020',
    sourcemap: mode === 'development',
    rollupOptions: {
      external: ['opencv.js'], // Exclure opencv.js du bundle pour éviter les erreurs de mémoire
      output: {
        manualChunks: {
          // Core React bundle - highest priority
          'vendor-react': ['react', 'react-dom', 'react/jsx-runtime'],
          
          // Router and query - medium priority
          'vendor-router': ['react-router-dom', '@tanstack/react-query'],
          
          // Heavy libraries - lazy loaded
          'vendor-heavy-ocr': ['tesseract.js'],
          // opencv.js supprimé pour éviter les erreurs de mémoire - chargé dynamiquement uniquement
          'vendor-heavy-ai': ['@huggingface/transformers'],
          'vendor-heavy-canvas': ['fabric', 'canvas'],
          'vendor-heavy-pdf': ['pdfjs-dist'],
          'vendor-heavy-maps': ['mapbox-gl', 'react-simple-maps', 'd3-geo'],
          
          // UI components - medium priority
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-select'],
          
          // Utilities - low priority
          'vendor-utils': ['date-fns', 'clsx', 'class-variance-authority', 'zod']
        }
      }
    },
    cssCodeSplit: true,
    chunkSizeWarningLimit: 2000 // Reduced for better monitoring
  },
  
  // Configuration pour Tesseract.js et autres variables globales
  define: {
    __TESSERACT_WORKER_PATH__: JSON.stringify('/tesseract-worker.js'),
    __TESSERACT_CORE_PATH__: JSON.stringify('/tesseract-core.wasm.js'),
    __TESSERACT_LANG_PATH__: JSON.stringify('/tesseract-lang'),
    __DEFINES__: JSON.stringify({}),
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
    'import.meta.env.DEV': mode === 'development',
    'import.meta.env.PROD': mode === 'production'
  },

  esbuild: {
    target: 'es2020',
    keepNames: true
  }
}));