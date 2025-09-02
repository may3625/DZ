import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOptimizedNavigation } from '@/hooks/useOptimizedNavigation';

interface OptimizedBackButtonProps {
  currentSection: string;
  showHomeButton?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  language?: string;
}

export function OptimizedBackButton({
  currentSection,
  showHomeButton = true,
  variant = 'outline',
  size = 'sm',
  className,
  language = 'fr'
}: OptimizedBackButtonProps) {
  const { goBack, goHome, canGoBack, isNavigating } = useOptimizedNavigation(currentSection);
  const [isPressed, setIsPressed] = useState(false);
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction de retour en arrière avec protection visuelle
  const handleGoBack = useCallback(() => {
    if (isNavigating || !canGoBack) return;

    setIsPressed(true);
    
    // Délai visuel pour éviter les doubles clics
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    
    pressTimeoutRef.current = setTimeout(() => {
      setIsPressed(false);
    }, 100);

    goBack();
  }, [goBack, isNavigating, canGoBack]);

  // Fonction de retour au dashboard
  const handleGoHome = useCallback(() => {
    if (isNavigating) return;

    setIsPressed(true);
    
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    
    pressTimeoutRef.current = setTimeout(() => {
      setIsPressed(false);
    }, 100);

    goHome();
  }, [goHome, isNavigating]);

  // Nettoyer le timeout lors du démontage
  React.useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
      }
    };
  }, []);

  // Texte localisé
  const getText = (key: string) => {
    const translations = {
      fr: {
        back: "Retour",
        home: "Accueil",
        noHistory: "Aucun historique"
      },
      ar: {
        back: "رجوع",
        home: "الرئيسية",
        noHistory: "لا يوجد سجل"
      },
      en: {
        back: "Back",
        home: "Home",
        noHistory: "No history"
      }
    };
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations] || key;
  };

  // Ne pas afficher sur le dashboard
  if (currentSection === 'dashboard') {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Bouton de retour */}
      <Button
        variant={variant}
        size={size}
        onClick={handleGoBack}
        disabled={isNavigating || !canGoBack}
        className={cn(
          "flex items-center gap-2 transition-all duration-200",
          isPressed && "scale-95",
          isNavigating && "opacity-50 cursor-not-allowed",
          !canGoBack && "opacity-30 cursor-not-allowed",
          className
        )}
        title={canGoBack ? getText('back') : getText('noHistory')}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">{getText('back')}</span>
      </Button>

      {/* Bouton d'accueil */}
      {showHomeButton && (
        <Button
          variant="ghost"
          size={size}
          onClick={handleGoHome}
          disabled={isNavigating}
          className={cn(
            "flex items-center gap-2 transition-all duration-200",
            isPressed && "scale-95",
            isNavigating && "opacity-50 cursor-not-allowed",
            "hover:bg-green-50 hover:text-green-700"
          )}
          title={getText('home')}
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">{getText('home')}</span>
        </Button>
      )}

      {/* Indicateur de navigation */}
      {isNavigating && (
        <div className="flex items-center gap-2 text-sm text-gray-500 ml-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="text-xs">...</span>
        </div>
      )}
    </div>
  );
}

export default OptimizedBackButton;