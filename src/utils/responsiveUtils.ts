/**
 * Utilitaires pour l'harmonisation responsive systématique
 * Classes Tailwind standardisées pour une cohérence totale
 */

// Breakpoints standards Tailwind
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Grilles responsive standardisées
export const RESPONSIVE_GRIDS = {
  // Grilles pour cartes de contenu
  cards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  cardsLarge: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6',
  cardsSmall: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
  
  // Grilles pour formulaires
  form: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  formLarge: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
  formCompact: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  
  // Grilles pour tableaux de bord
  dashboard: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  dashboardStats: 'grid grid-cols-2 md:grid-cols-4 gap-4',
  
  // Grilles pour listes
  list: 'grid grid-cols-1 gap-4',
  listTwoColumn: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
  
  // Grilles pour sections
  section: 'grid grid-cols-1 md:grid-cols-3 gap-6',
  sectionWide: 'grid grid-cols-1 lg:grid-cols-2 gap-8'
} as const;

// Espacements responsive standardisés
export const RESPONSIVE_SPACING = {
  container: 'px-4 sm:px-6 lg:px-8',
  containerWide: 'px-4 sm:px-6 lg:px-8 xl:px-12',
  section: 'py-8 sm:py-12 lg:py-16',
  sectionSmall: 'py-6 sm:py-8 lg:py-12',
  card: 'p-4 sm:p-6',
  cardSmall: 'p-3 sm:p-4'
} as const;

// Typographie responsive standardisée
export const RESPONSIVE_TYPOGRAPHY = {
  heading1: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
  heading2: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
  heading3: 'text-lg sm:text-xl lg:text-2xl font-medium',
  heading4: 'text-base sm:text-lg lg:text-xl font-medium',
  body: 'text-sm sm:text-base',
  bodyLarge: 'text-base sm:text-lg',
  caption: 'text-xs sm:text-sm'
} as const;

// Boutons responsive standardisés
export const RESPONSIVE_BUTTONS = {
  default: 'px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base',
  small: 'px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm',
  large: 'px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg',
  icon: 'w-8 h-8 sm:w-10 sm:h-10',
  iconSmall: 'w-6 h-6 sm:w-8 sm:h-8'
} as const;

// Flexbox responsive standardisé
export const RESPONSIVE_FLEX = {
  stack: 'flex flex-col space-y-4 sm:space-y-6',
  stackSmall: 'flex flex-col space-y-2 sm:space-y-4',
  row: 'flex flex-col sm:flex-row sm:items-center gap-4',
  rowCenter: 'flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4',
  rowBetween: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
  wrap: 'flex flex-wrap gap-2 sm:gap-4',
  center: 'flex items-center justify-center'
} as const;

// Largeurs responsive standardisées
export const RESPONSIVE_WIDTHS = {
  full: 'w-full',
  auto: 'w-auto',
  modal: 'w-full max-w-lg sm:max-w-xl lg:max-w-2xl',
  modalLarge: 'w-full max-w-2xl sm:max-w-4xl lg:max-w-6xl',
  content: 'w-full max-w-4xl mx-auto',
  contentWide: 'w-full max-w-6xl mx-auto',
  sidebar: 'w-full lg:w-64 xl:w-80'
} as const;

// Visibilité responsive standardisée
export const RESPONSIVE_VISIBILITY = {
  hideMobile: 'hidden sm:block',
  hideTablet: 'block lg:hidden',
  hideDesktop: 'block lg:hidden',
  showMobile: 'block sm:hidden',
  showTablet: 'hidden sm:block lg:hidden',
  showDesktop: 'hidden lg:block'
} as const;

// Fonction utilitaire pour créer des classes responsive
export function createResponsiveClass(
  mobile: string,
  tablet?: string,
  desktop?: string,
  large?: string
): string {
  const classes = [mobile];
  
  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  if (large) classes.push(`xl:${large}`);
  
  return classes.join(' ');
}

// Hook pour déterminer la taille d'écran actuelle
export function useBreakpoint() {
  if (typeof window === 'undefined') return 'sm';
  
  const width = window.innerWidth;
  
  if (width >= 1536) return '2xl';
  if (width >= 1280) return 'xl';
  if (width >= 1024) return 'lg';
  if (width >= 768) return 'md';
  if (width >= 640) return 'sm';
  return 'xs';
}

// Validation des classes responsive
export function validateResponsiveClass(className: string): boolean {
  const responsivePattern = /^(sm:|md:|lg:|xl:|2xl:)/;
  const classes = className.split(' ');
  
  return classes.some(cls => 
    responsivePattern.test(cls) || 
    !cls.includes(':')
  );
}

export default {
  BREAKPOINTS,
  RESPONSIVE_GRIDS,
  RESPONSIVE_SPACING,
  RESPONSIVE_TYPOGRAPHY,
  RESPONSIVE_BUTTONS,
  RESPONSIVE_FLEX,
  RESPONSIVE_WIDTHS,
  RESPONSIVE_VISIBILITY,
  createResponsiveClass,
  useBreakpoint,
  validateResponsiveClass
};