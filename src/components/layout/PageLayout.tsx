import { ReactNode, useCallback, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GovernmentHeader } from "@/components/layout/GovernmentHeader";
import { MainHeader } from "@/components/layout/MainHeader";
import { MainNavigation } from "@/components/MainNavigation";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { Footer } from "@/components/Footer";

interface PageLayoutProps {
  currentSection: string;
  children: ReactNode;
  initialLanguage?: string;
  onRefresh?: () => void;
}

export function PageLayout({ currentSection, children, initialLanguage = "fr", onRefresh }: PageLayoutProps) {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(initialLanguage);
  const [activeSection, setActiveSection] = useState(currentSection);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
  }, []);

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);

    // Protection basique contre URLs externes
    if (typeof section !== 'string' || section.includes('http://') || section.includes('https://')) return;

    if (section === 'dashboard') {
      navigate('/');
      return;
    }

    // Routes spéciales qui ne sont pas gérées par Index
    if (section === 'ocr-diagnostics') {
      navigate('/ocr-diagnostics');
      return;
    }
    if (section === 'sources-management') {
      navigate('/sources');
      return;
    }

    // Par défaut, route basée sur la section
    navigate(`/${section}`);
  }, [navigate]);

  const headerProps = useMemo(() => ({
    language,
    activeSection,
    onLanguageChange: handleLanguageChange,
    onSectionChange: handleSectionChange,
  }), [language, activeSection, handleLanguageChange, handleSectionChange]);

  const navigationProps = useMemo(() => ({
    onSectionChange: handleSectionChange,
    activeSection,
    language,
  }), [handleSectionChange, activeSection, language]);

  return (
    <div className="min-h-screen w-full algerian-green-bg flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 p-2 z-50">
        Aller au contenu principal
      </a>

      <GovernmentHeader language={language} onLanguageChange={handleLanguageChange} />
      <MainHeader {...headerProps} />

      <div className="hidden md:block">
        <MainNavigation {...navigationProps} />
      </div>

      <BreadcrumbNavigation currentSection={activeSection} onSectionChange={handleSectionChange} language={language} onRefresh={onRefresh} />

      <main id="main-content" className="flex-grow bg-gray-50" role="main" aria-label="Contenu principal">
        <div className="container mx-auto px-4 sm:px-6 pt-6 pb-6 max-w-7xl">
          {children}
        </div>
      </main>

      <Footer onSectionChange={handleSectionChange} />
    </div>
  );
}

export default PageLayout;
