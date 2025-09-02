import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Contexte pour le layout responsive
interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  orientation: 'portrait' | 'landscape';
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined);

export function useResponsive() {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
}

interface ResponsiveProviderProps {
  children: React.ReactNode;
}

export function ResponsiveProvider({ children }: ResponsiveProviderProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Media queries pour les breakpoints
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
  const isLargeScreen = useMediaQuery('(min-width: 1280px)');

  // Déterminer la taille d'écran
  const getScreenSize = (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' => {
    if (isMobile) return 'sm';
    if (isTablet) return 'md';
    if (isDesktop) return 'lg';
    if (isLargeScreen) return 'xl';
    return '2xl';
  };

  // Détecter l'orientation
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Auto-collapse sidebar sur mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const contextValue: ResponsiveContextType = {
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    screenSize: getScreenSize(),
    orientation,
    sidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed
  };

  return (
    <ResponsiveContext.Provider value={contextValue}>
      {children}
    </ResponsiveContext.Provider>
  );
}

// Composant de layout responsive principal
interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function ResponsiveLayout({ 
  children, 
  sidebar, 
  header, 
  footer, 
  className = '' 
}: ResponsiveLayoutProps) {
  const { isMobile, isTablet, sidebarCollapsed, toggleSidebar } = useResponsive();

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${className}`}>
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Bouton menu pour mobile */}
            {isMobile && sidebar && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            {/* Contenu du header */}
            <div className="flex-1">
              {header}
            </div>
          </div>
        </header>
      )}

      {/* Contenu principal avec sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {sidebar && (
          <aside
            className={`
              ${isMobile ? 'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out' : 'relative'}
              ${isMobile && sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}
              ${!isMobile ? 'w-64' : 'w-80'}
              bg-white border-r border-gray-200 shadow-lg
            `}
          >
            {/* Overlay pour mobile */}
            {isMobile && !sidebarCollapsed && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={toggleSidebar}
              />
            )}
            
            {/* Contenu de la sidebar */}
            <div className="h-full flex flex-col">
              {/* Header de la sidebar */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                {isMobile && (
                  <button
                    onClick={toggleSidebar}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600"
                    aria-label="Close sidebar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Contenu de la sidebar */}
              <div className="flex-1 overflow-y-auto">
                {sidebar}
              </div>
            </div>
          </aside>
        )}

        {/* Contenu principal */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="bg-white border-t border-gray-200">
          <div className="px-4 py-6">
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
}

// Composant de grille responsive
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: number;
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  cols = 1, 
  gap = 4, 
  className = '' 
}: ResponsiveGridProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Calculer le nombre de colonnes selon la taille d'écran
  const getGridCols = () => {
    if (isMobile) return Math.min(cols, 1);
    if (isTablet) return Math.min(cols, 2);
    if (isDesktop) return Math.min(cols, 3);
    return Math.min(cols, 4);
  };

  const gridCols = getGridCols();

  return (
    <div 
      className={`
        grid gap-${gap}
        ${gridCols === 1 ? 'grid-cols-1' : ''}
        ${gridCols === 2 ? 'grid-cols-1 sm:grid-cols-2' : ''}
        ${gridCols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}
        ${gridCols === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Composant de carte responsive
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function ResponsiveCard({ 
  children, 
  className = '', 
  onClick, 
  hover = true 
}: ResponsiveCardProps) {
  const { isMobile } = useResponsive();

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm
        ${isMobile ? 'p-4' : 'p-6'}
        ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Composant de bouton responsive
interface ResponsiveButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function ResponsiveButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  onClick,
  disabled = false,
  loading = false
}: ResponsiveButtonProps) {
  const { isMobile } = useResponsive();

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500';
      case 'outline':
        return 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500';
      case 'ghost':
        return 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500';
      case 'destructive':
        return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-sm';
      case 'md':
        return isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base';
      case 'lg':
        return isMobile ? 'px-6 py-3 text-base' : 'px-8 py-4 text-lg';
      default:
        return isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base';
    }
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium rounded-md
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Chargement...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Composant de navigation responsive
interface ResponsiveNavigationProps {
  items: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    href?: string;
    onClick?: () => void;
    active?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function ResponsiveNavigation({ 
  items, 
  orientation = 'horizontal', 
  className = '' 
}: ResponsiveNavigationProps) {
  const { isMobile } = useResponsive();

  const isVertical = orientation === 'vertical' || isMobile;

  return (
    <nav className={`${isVertical ? 'space-y-1' : 'flex space-x-4'} ${className}`}>
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href}
          onClick={item.onClick}
          className={`
            flex items-center px-3 py-2 rounded-md text-sm font-medium
            ${isVertical ? 'w-full' : ''}
            ${item.active
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
            transition-colors duration-200
          `}
        >
          {item.icon && (
            <span className={`${isVertical ? 'mr-3' : 'mr-2'}`}>
              {item.icon}
            </span>
          )}
          {item.label}
        </a>
      ))}
    </nav>
  );
}