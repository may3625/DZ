import React, { useEffect, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { performanceMonitor } from '@/utils/performanceMonitor';

// Progressive local mode activation
function AppWrapper() {
  useEffect(() => {
    // Import local mode only when needed, without blocking initial render
    import('@/utils/activateLocalMode').then(({ isLocalOnlyActive }) => {
      if (!isLocalOnlyActive()) {
        import('@/utils/activateLocalMode').then(({ activateLocalOnlyMode }) => {
          activateLocalOnlyMode();
        });
      }
    });

    // Initialize performance monitoring
    console.log('🚀 Application démarrée avec optimisations lazy loading');
    
    // Report performance after initial load
    setTimeout(() => {
      performanceMonitor.reportSummary();
    }, 3000);
  }, []);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-sm text-muted-foreground">Chargement de l'application...</p>
        </div>
      </div>
    }>
      <App />
    </Suspense>
  );
}

// Prevent multiple createRoot calls during hot module replacement
const rootElement = document.getElementById('root')!;
if (!rootElement.hasChildNodes()) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppWrapper />
    </React.StrictMode>
  );
}