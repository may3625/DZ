import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AIAutoFillGlobalManager } from '@/components/ai/AIAutoFillGlobalManager';
import { setupGlobalErrorHandling } from '@/utils/globalErrorHandler';
import Index from '@/pages/Index';
import { ModalProvider } from '@/components/modals/unified';
import { ModalRenderer } from '@/components/modals/unified/ModalRenderer';
import { RTLProvider } from '@/components/algerian/RTLProvider';
import { EnhancedSecurityProvider } from '@/components/security/EnhancedSecurityProvider';
import '@/i18n/index';
import { ScrollToTop } from '@/components/routing/ScrollToTop';

// Initialiser la gestion d'erreurs globale
setupGlobalErrorHandling();

const queryClient = new QueryClient();

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path=":section" element={<Index />} />
        <Route path=":section/*" element={<Index />} />
        <Route path="*" element={<Index />} />
      </Routes>
      <AIAutoFillGlobalManager />
      <ModalRenderer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EnhancedSecurityProvider>
        <RTLProvider>
          <Router>
            <AuthProvider>
              <ModalProvider maxConcurrentModals={2}>
                <AppContent />
              </ModalProvider>
            </AuthProvider>
          </Router>
        </RTLProvider>
      </EnhancedSecurityProvider>
    </QueryClientProvider>
  );
}

export default App;