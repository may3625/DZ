import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainNavigation } from "@/components/MainNavigation";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { GovernmentHeader } from "@/components/layout/GovernmentHeader";
import { MainHeader } from "@/components/layout/MainHeader";
import { ContentRenderer } from "@/components/layout/ContentRenderer";
import { supabase } from "@/integrations/supabase/client";

// SecurityProvider supprimé - Branche LYO

// import { AutoRefreshToggle } from "@/components/common/AutoRefreshToggle"; // Temporairement commenté pour test

const VALID_SECTIONS = new Set([
  "dashboard", "legal-catalog", "legal-enrichment", "legal-search",
  "procedures-catalog", "procedures-enrichment", "procedures-search", "procedures-resources",
  "analytics-dashboards", "analysis", "reports", "assisted-writing",
  "analytics-algeria",
  "forum", "collaborative-workspace", "shared-resources",
  "news", "library", "dictionaries", "directories",
  "nomenclature", "algerian-enhancements", "complementary-resources", "data-management", "alerts-notifications", "user-management",
  "security", "performance-scalability", "integrations-interoperability", "accessibility-settings", "offline-mode", "mobile-app", "translation-management", "sources-management", "sources",
  "about", "contact", "technical-support", "privacy-policy", "terms-of-use", "messages", "ai-advanced", "favorites",
  "data-extraction", "document-templates", "saved-searches",
  "ai-assistant", "admin",
  "ocr-extraction", "ocr-mapping", "ocr-validation", "ocr-workflow", "ocr-analytics",
"batch-processing", "approval-workflow", "ocr-analytics-reports", "ocr-diagnostics",
"modal-test", "optimization-dashboard"
]);

const Index = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(section || "dashboard");
  const [language, setLanguage] = useState("fr");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // La section /advanced-search est supprimée. Aucune redirection implicite.



  // Sync activeSection with URL
  useEffect(() => {
    // Ne considérer que le premier segment comme section logique
    const urlSection = (section || "dashboard").split('/')[0];
    if (VALID_SECTIONS.has(urlSection) && urlSection !== activeSection) {
      setActiveSection(urlSection);
    }
    if (!VALID_SECTIONS.has(urlSection)) {
      setActiveSection("__not_found__");
    }
  }, [section, activeSection]);

  // Navigation with browser history
  const handleSectionChange = useCallback((newSection: string) => {
    console.log('Attempting to navigate to section:', newSection);
    
    // Vérifier que la section est valide et ne contient pas d'URL externe
    if (typeof newSection !== 'string' || newSection.includes('http://') || newSection.includes('https://')) {
      console.warn(`Section invalide ou URL externe détectée: ${newSection}`);
      return;
    }
    
    if (VALID_SECTIONS.has(newSection)) {
      try {
        if (newSection === "dashboard") {
          navigate("/", { replace: false });
        } else {
          navigate(`/${newSection}`, { replace: false });
        }
        // Mettre à jour l'état immédiatement pour éviter les problèmes de synchronisation
        setActiveSection(newSection);
        console.log('Successfully navigated to section:', newSection);
      } catch (error) {
        console.error('Navigation error:', error);
      }
    } else {
      console.warn(`Section invalide tentée: ${newSection}`);
      setActiveSection("__not_found__");
      navigate(`/${newSection}`, { replace: false });
    }
  }, [navigate]);

  useEffect(() => {
    const handleNavigateToSection = (event: CustomEvent) => {
      console.log('Navigation event received:', event.detail);
      const targetSection = event.detail;
      
      // Gérer les redirections spéciales vers Alimentation de la Banque de Données
      if (targetSection === 'bank-feeding-legal-enrichment') {
        handleSectionChange('legal-enrichment');
        // L'onglet par défaut est 'enrichment' pour les textes juridiques
        return;
      }
      
      if (targetSection === 'bank-feeding-legal-approval') {
        handleSectionChange('legal-enrichment');
        // Navigation vers l'onglet approval-queue des textes juridiques
        setTimeout(() => {
          const tabEvent = new CustomEvent('switch-to-tab', {
            detail: { section: 'legal-enrichment', tab: 'approval-queue' }
          });
          window.dispatchEvent(tabEvent);
        }, 100);
        return;
      }
      
      if (targetSection === 'bank-feeding-procedures-enrichment') {
        handleSectionChange('procedures-enrichment');
        // L'onglet par défaut est 'enrichment' pour les procédures
        return;
      }
      
      if (targetSection === 'bank-feeding-procedures-approval') {
        handleSectionChange('procedures-enrichment');
        // Navigation vers l'onglet approval-queue des procédures
        setTimeout(() => {
          const tabEvent = new CustomEvent('switch-to-tab', {
            detail: { section: 'procedures-enrichment', tab: 'approval-queue' }
          });
          window.dispatchEvent(tabEvent);
        }, 100);
        return;
      }
      
      if (typeof targetSection === 'string' && VALID_SECTIONS.has(targetSection)) {
        handleSectionChange(targetSection);
        
        // Amélioration de l'accessibilité - annoncer le changement de section
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Navigation vers la section: ${targetSection}`;
        document.body.appendChild(announcement);
        
        // Nettoyer l'annonce après un délai
        setTimeout(() => {
          if (document.body.contains(announcement)) {
            document.body.removeChild(announcement);
          }
        }, 1000);
      } else {
        console.warn(`Section invalide reçue via événement: ${targetSection}`);
        setActiveSection("__not_found__");
      }
    };

    window.addEventListener('navigate-to-section', handleNavigateToSection as EventListener);

    return () => {
      window.removeEventListener('navigate-to-section', handleNavigateToSection as EventListener);
    };
  }, [handleSectionChange]);

  // Gestionnaire de changement de langue mémorisé
  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
  }, []);

  // Fonction de refresh pour l'auto-refresh
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    console.log('Page refreshed via auto-refresh');
  }, []);

  // Props mémorisées pour éviter les re-rendus inutiles
  const headerProps = useMemo(() => ({
    language,
    activeSection,
    onLanguageChange: handleLanguageChange,
    onSectionChange: handleSectionChange
  }), [language, activeSection, handleLanguageChange, handleSectionChange]);

  const navigationProps = useMemo(() => ({
    onSectionChange: handleSectionChange,
    activeSection,
    language
  }), [handleSectionChange, activeSection, language]);

  const breadcrumbProps = useMemo(() => ({
    currentSection: activeSection,
    onSectionChange: handleSectionChange,
    language,
    onRefresh: handleRefresh
  }), [activeSection, handleSectionChange, language, handleRefresh]);

  return (
    <div className="min-h-screen w-full algerian-green-bg flex flex-col">
        {/* Skip to main content link pour l'accessibilité */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50"
        >
          Aller au contenu principal
        </a>

        {/* Header gouvernemental */}
        <GovernmentHeader language={language} onLanguageChange={handleLanguageChange} />

        {/* Header principal */}
        <MainHeader {...headerProps} />

        {/* Menu de navigation principal - Hidden on mobile */}
        <div className="hidden md:block">
          <MainNavigation {...navigationProps} />
        </div>

        {activeSection !== "__not_found__" && (
          <BreadcrumbNavigation {...breadcrumbProps} />
        )}



        {/* Main Content avec landmark ARIA */}
        <main id="main-content" className="flex-grow bg-gray-50" role="main" aria-label="Contenu principal">
          <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
            
            <ContentRenderer activeSection={activeSection} language={language} refreshTrigger={refreshTrigger} />
          </div>
        </main>

        {/* Footer */}
        <Footer onSectionChange={handleSectionChange} />
      </div>
  );
};

export default Index;