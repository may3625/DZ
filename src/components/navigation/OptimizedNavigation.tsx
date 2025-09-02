import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedNavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  language?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export function OptimizedNavigation({ 
  currentSection, 
  onSectionChange, 
  language = "fr",
  showBackButton = true,
  showHomeButton = true 
}: OptimizedNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);

  // Initialiser l'historique de navigation
  useEffect(() => {
    if (currentSection && currentSection !== 'dashboard') {
      setNavigationHistory(prev => {
        // Éviter les doublons consécutifs
        if (prev[prev.length - 1] !== currentSection) {
          return [...prev, currentSection];
        }
        return prev;
      });
    }
  }, [currentSection]);

  // Fonction de navigation optimisée avec protection contre les doubles clics
  const handleNavigation = useCallback((targetSection: string, useHistory = false) => {
    if (isNavigating) {
      console.log('Navigation déjà en cours, ignorée');
      return;
    }

    setIsNavigating(true);
    
    try {
      if (useHistory) {
        // Utiliser l'historique du navigateur
        navigate(-1);
      } else if (targetSection === 'dashboard') {
        navigate('/', { replace: false });
      } else {
        navigate(`/${targetSection}`, { replace: false });
      }
      
      // Mettre à jour l'historique local
      if (!useHistory && targetSection !== 'dashboard') {
        setNavigationHistory(prev => [...prev, targetSection]);
      }
      
      console.log(`Navigation vers: ${targetSection}`);
      
      // Scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Erreur de navigation:', error);
    } finally {
      // Réactiver la navigation après un délai
      setTimeout(() => setIsNavigating(false), 300);
    }
  }, [navigate, isNavigating]);

  // Fonction de retour en arrière optimisée
  const handleGoBack = useCallback(() => {
    if (isNavigating) {
      console.log('Navigation déjà en cours, ignorée');
      return;
    }

    setIsNavigating(true);
    
    try {
      // Vérifier s'il y a un historique de navigation
      if (navigationHistory.length > 1) {
        // Retourner à la section précédente dans l'historique
        const previousSection = navigationHistory[navigationHistory.length - 2];
        setNavigationHistory(prev => prev.slice(0, -1));
        handleNavigation(previousSection);
      } else {
        // Utiliser l'historique du navigateur
        navigate(-1);
      }
    } catch (error) {
      console.error('Erreur de retour en arrière:', error);
      // Fallback vers le dashboard
      handleNavigation('dashboard');
    } finally {
      setTimeout(() => setIsNavigating(false), 300);
    }
  }, [navigationHistory, isNavigating, navigate, handleNavigation]);

  // Fonction de retour au dashboard
  const handleGoHome = useCallback(() => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    setNavigationHistory([]);
    handleNavigation('dashboard');
    
    setTimeout(() => setIsNavigating(false), 300);
  }, [isNavigating, handleNavigation]);

  // Texte localisé
  const getText = (key: string) => {
    const translations = {
      fr: {
        back: "Retour",
        home: "Accueil",
        navigation: "Navigation"
      },
      ar: {
        back: "رجوع",
        home: "الرئيسية",
        navigation: "التنقل"
      },
      en: {
        back: "Back",
        home: "Home",
        navigation: "Navigation"
      }
    };
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations['fr']] || key;
  };

  // Ne pas afficher sur le dashboard
  if (currentSection === 'dashboard') {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Boutons de navigation */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoBack}
                disabled={isNavigating}
                className={cn(
                  "flex items-center gap-2 transition-all duration-200",
                  isNavigating ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 hover:border-gray-300"
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{getText('back')}</span>
              </Button>
            )}
            
            {showHomeButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoHome}
                disabled={isNavigating}
                className={cn(
                  "flex items-center gap-2 transition-all duration-200",
                  isNavigating ? "opacity-50 cursor-not-allowed" : "hover:bg-green-50 hover:text-green-700"
                )}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">{getText('home')}</span>
              </Button>
            )}
          </div>

          {/* Indicateur de navigation */}
          {isNavigating && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span>{getText('navigation')}...</span>
            </div>
          )}

          {/* Informations de débogage (en développement) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400">
              Historique: {navigationHistory.length} sections
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OptimizedNavigation;