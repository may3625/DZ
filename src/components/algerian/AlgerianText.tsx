import React from 'react';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { cn } from '@/lib/utils';

interface AlgerianTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'body' | 'heading' | 'caption' | 'legal';
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Composant optimisé pour afficher du texte avec les bonnes polices
 * et le support RTL selon la langue active
 */
export function AlgerianText({ 
  children, 
  className = '', 
  variant = 'body',
  as: Component = 'span' 
}: AlgerianTextProps) {
  const { getFontClass, getTextDirection, isRTL } = useAlgerianI18n();

  const baseClasses = cn(
    getFontClass(),
    'language-transition',
    {
      'text-sm leading-relaxed': variant === 'body',
      'text-lg font-semibold leading-tight': variant === 'heading',
      'text-xs text-muted-foreground': variant === 'caption',
      'text-base font-medium leading-normal': variant === 'legal',
    },
    {
      'text-right': isRTL && variant !== 'caption',
      'text-left': !isRTL && variant !== 'caption',
    },
    className
  );

  return (
    <Component 
      className={baseClasses}
      dir={getTextDirection()}
    >
      {children}
    </Component>
  );
}