/**
 * Hook React pour la gestion responsive uniforme
 * Intégration complète avec le système Tailwind harmonisé
 */

import { useState, useEffect } from 'react';
import { BREAKPOINTS, useBreakpoint as getBreakpoint, RESPONSIVE_GRIDS, RESPONSIVE_SPACING, RESPONSIVE_TYPOGRAPHY } from '@/utils/responsiveUtils';

export type BreakpointKey = keyof typeof BREAKPOINTS;

interface ResponsiveConfig {
  mobile: any;
  tablet?: any;
  desktop?: any;
  large?: any;
}

/**
 * Hook principal pour la responsivité
 */
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState<BreakpointKey>('sm');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateBreakpoint = () => {
      const current = getBreakpoint() as BreakpointKey;
      setBreakpoint(current);
      setIsMobile(['xs', 'sm'].includes(current));
      setIsTablet(current === 'md');
      setIsDesktop(['lg', 'xl', '2xl'].includes(current));
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  /**
   * Retourne la valeur responsive appropriée
   */
  const getResponsiveValue = <T>(config: ResponsiveConfig | T): T => {
    if (typeof config !== 'object' || config === null) {
      return config as T;
    }

    const responsiveConfig = config as ResponsiveConfig;
    
    if (isDesktop && responsiveConfig.large) return responsiveConfig.large;
    if (isDesktop && responsiveConfig.desktop) return responsiveConfig.desktop;
    if (isTablet && responsiveConfig.tablet) return responsiveConfig.tablet;
    
    return responsiveConfig.mobile;
  };

  /**
   * Génère les classes CSS responsive
   */
  const getResponsiveClasses = (config: ResponsiveConfig): string => {
    const classes = [config.mobile];
    
    if (config.tablet) classes.push(`md:${config.tablet}`);
    if (config.desktop) classes.push(`lg:${config.desktop}`);
    if (config.large) classes.push(`xl:${config.large}`);
    
    return classes.filter(Boolean).join(' ');
  };

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    getResponsiveValue,
    getResponsiveClasses,
    // Utilitaires direct
    grids: RESPONSIVE_GRIDS,
    spacing: RESPONSIVE_SPACING,
    typography: RESPONSIVE_TYPOGRAPHY
  };
};

/**
 * Hook pour les grilles responsive
 */
export const useResponsiveGrid = (type: keyof typeof RESPONSIVE_GRIDS = 'cards') => {
  const { grids } = useResponsive();
  return grids[type];
};

/**
 * Hook pour l'espacement responsive
 */
export const useResponsiveSpacing = () => {
  const { spacing } = useResponsive();
  return spacing;
};

/**
 * Hook pour la typographie responsive
 */
export const useResponsiveTypography = () => {
  const { typography } = useResponsive();
  return typography;
};

/**
 * Hook pour détection des features responsive
 */
export const useResponsiveFeatures = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  return {
    showMobileMenu: isMobile,
    showSidebar: isDesktop,
    showTabletLayout: isTablet,
    maxItemsPerRow: isMobile ? 1 : isTablet ? 2 : 3,
    shouldStack: isMobile,
    shouldWrap: isTablet
  };
};

/**
 * Hook pour l'orientation
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    
    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    
    return () => window.removeEventListener('resize', updateOrientation);
  }, []);
  
  return orientation;
};

export default useResponsive;