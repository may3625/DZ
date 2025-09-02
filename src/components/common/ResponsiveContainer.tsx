/**
 * Conteneur responsive unifié pour harmoniser l'affichage
 * Utilise le système de classes Tailwind harmonisé
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/useResponsive';
import { RESPONSIVE_SPACING, RESPONSIVE_WIDTHS } from '@/utils/responsiveUtils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'wide' | 'full' | 'modal' | 'sidebar';
  spacing?: 'default' | 'compact' | 'relaxed' | 'tight';
  className?: string;
  as?: React.ElementType;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  variant = 'default',
  spacing = 'default',
  className,
  as: Component = 'div'
}) => {
  const { isMobile, isTablet } = useResponsive();

  // Configuration des largeurs selon la variante
  const widthClasses = {
    default: RESPONSIVE_WIDTHS.content,
    wide: RESPONSIVE_WIDTHS.contentWide,
    full: RESPONSIVE_WIDTHS.full,
    modal: isMobile ? RESPONSIVE_WIDTHS.full : RESPONSIVE_WIDTHS.modal,
    sidebar: RESPONSIVE_WIDTHS.sidebar
  };

  // Configuration de l'espacement selon l'option
  const spacingClasses = {
    default: RESPONSIVE_SPACING.container,
    compact: RESPONSIVE_SPACING.cardSmall,
    relaxed: RESPONSIVE_SPACING.section,
    tight: 'px-2 sm:px-4'
  };

  const containerClasses = cn(
    widthClasses[variant],
    spacingClasses[spacing],
    // Classes responsive supplémentaires selon l'écran
    {
      'min-h-screen': variant === 'full',
      'py-4 sm:py-6 lg:py-8': spacing === 'default',
      'py-2 sm:py-4': spacing === 'compact',
      'py-8 sm:py-12 lg:py-16': spacing === 'relaxed',
      'py-1 sm:py-2': spacing === 'tight'
    },
    className
  );

  return (
    <Component className={containerClasses}>
      {children}
    </Component>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  type?: 'cards' | 'form' | 'dashboard' | 'list' | 'custom';
  customClasses?: string;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  type = 'cards',
  customClasses,
  gap = 'md',
  className
}) => {
  const { grids } = useResponsive();

  const gapClasses = {
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  };

  const gridClasses = cn(
    customClasses || grids[type],
    gapClasses[gap],
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal' | 'responsive';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  direction = 'responsive',
  align = 'stretch',
  justify = 'start',
  gap = 'md',
  className
}) => {
  const directionClasses = {
    vertical: 'flex flex-col',
    horizontal: 'flex flex-row',
    responsive: 'flex flex-col sm:flex-row'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  };

  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6'
  };

  const stackClasses = cn(
    directionClasses[direction],
    alignClasses[align],
    justifyClasses[justify],
    gapClasses[gap],
    className
  );

  return (
    <div className={stackClasses}>
      {children}
    </div>
  );
};

interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'body' | 'bodyLarge' | 'caption';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'body',
  className,
  as
}) => {
  const { typography } = useResponsive();

  // Déterminer l'élément par défaut selon la variante
  const defaultElement = {
    heading1: 'h1',
    heading2: 'h2',
    heading3: 'h3',
    heading4: 'h4',
    body: 'p',
    bodyLarge: 'p',
    caption: 'span'
  } as const;

  const Component = as || defaultElement[variant];
  
  const textClasses = cn(
    typography[variant],
    'text-foreground',
    className
  );

  return (
    <Component className={textClasses}>
      {children}
    </Component>
  );
};

export default ResponsiveContainer;