import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationState {
  isNavigating: boolean;
  currentSection: string;
  navigationHistory: string[];
  lastNavigationTime: number;
}

interface UseOptimizedNavigationReturn {
  navigateToSection: (section: string) => void;
  goBack: () => void;
  goHome: () => void;
  canGoBack: boolean;
  isNavigating: boolean;
  currentSection: string;
  navigationHistory: string[];
}

export function useOptimizedNavigation(
  initialSection: string = 'dashboard',
  navigationDelay: number = 300
): UseOptimizedNavigationReturn {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastNavigationRef = useRef<number>(0);

  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    currentSection: initialSection,
    navigationHistory: [],
    lastNavigationTime: 0
  });

  // Mettre à jour la section courante basée sur l'URL
  useEffect(() => {
    const pathSection = location.pathname.slice(1) || 'dashboard';
    if (pathSection !== navigationState.currentSection) {
      setNavigationState(prev => ({
        ...prev,
        currentSection: pathSection,
        navigationHistory: pathSection !== 'dashboard' 
          ? [...prev.navigationHistory, pathSection]
          : prev.navigationHistory
      }));
    }
  }, [location.pathname, navigationState.currentSection]);

  // Fonction de navigation optimisée avec protection contre les doubles clics
  const navigateToSection = useCallback((section: string) => {
    const now = Date.now();
    
    // Protection contre les clics trop rapides
    if (now - lastNavigationRef.current < navigationDelay) {
      console.log('Navigation trop rapide, ignorée');
      return;
    }

    // Protection contre la navigation déjà en cours
    if (navigationState.isNavigating) {
      console.log('Navigation déjà en cours, ignorée');
      return;
    }

    // Protection contre la navigation vers la même section
    if (section === navigationState.currentSection) {
      console.log('Navigation vers la même section, ignorée');
      return;
    }

    lastNavigationRef.current = now;
    
    setNavigationState(prev => ({
      ...prev,
      isNavigating: true
    }));

    try {
      if (section === 'dashboard') {
        navigate('/', { replace: false });
      } else {
        navigate(`/${section}`, { replace: false });
      }

      // Mettre à jour l'historique local
      if (section !== 'dashboard') {
        setNavigationState(prev => ({
          ...prev,
          navigationHistory: [...prev.navigationHistory, section]
        }));
      }

      console.log(`Navigation vers: ${section}`);
      
      // Scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Erreur de navigation:', error);
    } finally {
      // Réactiver la navigation après le délai
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      navigationTimeoutRef.current = setTimeout(() => {
        setNavigationState(prev => ({
          ...prev,
          isNavigating: false
        }));
      }, navigationDelay);
    }
  }, [navigate, navigationState.isNavigating, navigationState.currentSection, navigationDelay]);

  // Fonction de retour en arrière optimisée - CORRECTION DU BUG DOUBLE-CLIC
  const goBack = useCallback(() => {
    const now = Date.now();
    
    // Protection stricte contre les doubles clics
    if (now - lastNavigationRef.current < navigationDelay) {
      console.log('Navigation trop rapide, ignorée');
      return;
    }

    if (navigationState.isNavigating) {
      console.log('Navigation déjà en cours, ignorée');
      return;
    }

    lastNavigationRef.current = now;
    
    setNavigationState(prev => ({
      ...prev,
      isNavigating: true
    }));

    try {
      // Utiliser DIRECTEMENT l'historique du navigateur
      navigate(-1);
      console.log('Navigation retour via historique navigateur');
    } catch (error) {
      console.error('Erreur de retour en arrière:', error);
      // Fallback vers le dashboard
      navigate('/', { replace: true });
    }
    
    // Réinitialiser l'état après un délai plus court
    setTimeout(() => {
      setNavigationState(prev => ({
        ...prev,
        isNavigating: false
      }));
    }, 150);
  }, [navigationState.isNavigating, navigate, navigationDelay]);

  // Fonction de retour au dashboard
  const goHome = useCallback(() => {
    if (navigationState.isNavigating) return;
    
    setNavigationState(prev => ({
      ...prev,
      navigationHistory: [],
      isNavigating: true
    }));
    
    navigateToSection('dashboard');
  }, [navigationState.isNavigating, navigateToSection]);

  // Nettoyer le timeout lors du démontage
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  return {
    navigateToSection,
    goBack,
    goHome,
    canGoBack: window.history.length > 1, // Utiliser l'historique réel du navigateur
    isNavigating: navigationState.isNavigating,
    currentSection: navigationState.currentSection,
    navigationHistory: navigationState.navigationHistory
  };
}

export default useOptimizedNavigation;