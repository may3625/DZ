import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Fonction pour mettre à jour l'état
    const updateMatches = () => {
      setMatches(media.matches);
    };

    // Initialiser l'état
    updateMatches();

    // Ajouter l'écouteur d'événement
    media.addEventListener('change', updateMatches);

    // Cleanup
    return () => {
      media.removeEventListener('change', updateMatches);
    };
  }, [query]);

  return matches;
}

// Hooks spécialisés pour les breakpoints courants
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsLargeScreen(): boolean {
  return useMediaQuery('(min-width: 1280px)');
}

export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}

export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)');
}

// Hook pour détecter si l'appareil supporte le touch
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(pointer: coarse)');
}

// Hook pour détecter si l'appareil a une haute densité de pixels
export function useIsHighDPI(): boolean {
  return useMediaQuery('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)');
}

// Hook pour détecter si l'appareil supporte les animations
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// Hook pour détecter le thème préféré de l'utilisateur
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

// Hook pour détecter si l'appareil a un écran couleur
export function useIsColorScreen(): boolean {
  return useMediaQuery('(color)');
}

// Hook pour détecter si l'appareil a un écran monochrome
export function useIsMonochromeScreen(): boolean {
  return useMediaQuery('(monochrome)');
}