/**
 * Breadcrumbs contextuels améliorés
 * Support bilingue algérien avec navigation intelligente
 */

import React, { useMemo, useCallback } from 'react';
import { ChevronRight, Home, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  id: string;
  label: string;
  labelAr: string;
  href?: string;
  isCurrentPage?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  metadata?: {
    category: string;
    priority: 'high' | 'medium' | 'low';
    lastVisited?: Date;
  };
}

interface BreadcrumbsContextualProps {
  items: BreadcrumbItem[];
  maxVisible?: number;
  showHome?: boolean;
  onNavigate?: (itemId: string) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'enhanced';
}

export function BreadcrumbsContextual({
  items,
  maxVisible = 4,
  showHome = true,
  onNavigate,
  className = '',
  variant = 'default'
}: BreadcrumbsContextualProps) {
  const { t, language, isRTL } = useAlgerianI18n();

  // Éléments de navigation avec raccourcis intelligents
  const navigationItems = useMemo(() => {
    const allItems = showHome 
      ? [{
          id: 'home',
          label: 'Accueil',
          labelAr: 'الرئيسية',
          href: '/',
          icon: Home,
          metadata: { category: 'navigation', priority: 'high' as const }
        }, ...items]
      : items;

    // Si trop d'éléments, montrer seulement les plus importants
    if (allItems.length > maxVisible) {
      const firstItems = allItems.slice(0, 1);
      const lastItems = allItems.slice(-(maxVisible - 2));
      return [...firstItems, { 
        id: 'ellipsis', 
        label: '...', 
        labelAr: '...',
        metadata: { category: 'ellipsis', priority: 'low' as const }
      }, ...lastItems];
    }

    return allItems;
  }, [items, maxVisible, showHome]);

  const handleNavigation = useCallback((item: BreadcrumbItem) => {
    if (item.href && onNavigate) {
      onNavigate(item.id);
    }
  }, [onNavigate]);

  const SeparatorIcon = isRTL ? ArrowLeft : ArrowRight;

  const getItemLabel = (item: BreadcrumbItem) => {
    return language === 'ar' ? item.labelAr : item.label;
  };

  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number) => {
    const isLast = index === navigationItems.length - 1;
    const isEllipsis = item.id === 'ellipsis';
    const Icon = item.icon;

    if (isEllipsis) {
      return (
        <React.Fragment key={item.id}>
          <BreadcrumbSeparator>
            <SeparatorIcon className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbEllipsis className="h-4 w-4" />
          </BreadcrumbItem>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={item.id}>
        {index > 0 && (
          <BreadcrumbSeparator>
            <SeparatorIcon className="h-4 w-4" />
          </BreadcrumbSeparator>
        )}
        <BreadcrumbItem>
          {isLast || !item.href ? (
            <BreadcrumbPage className={`
              flex items-center gap-2 font-medium
              ${variant === 'enhanced' ? 'text-primary' : ''}
              ${isRTL ? 'flex-row-reverse' : ''}
            `}>
              {Icon && <Icon className="h-4 w-4" />}
              {getItemLabel(item)}
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              onClick={() => handleNavigation(item)}
              className={`
                flex items-center gap-2 cursor-pointer
                transition-colors hover:text-primary
                ${isRTL ? 'flex-row-reverse' : ''}
                ${variant === 'enhanced' ? 'hover:underline' : ''}
              `}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {getItemLabel(item)}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
      </React.Fragment>
    );
  };

  if (variant === 'compact') {
    const currentItem = navigationItems[navigationItems.length - 1];
    const parentItem = navigationItems[navigationItems.length - 2];

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {parentItem && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation(parentItem)}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              {getItemLabel(parentItem)}
            </Button>
            <SeparatorIcon className="h-4 w-4 text-muted-foreground" />
          </>
        )}
        <span className="font-medium text-foreground">
          {getItemLabel(currentItem)}
        </span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <Breadcrumb>
        <BreadcrumbList className={`
          ${isRTL ? 'flex-row-reverse' : ''}
          ${variant === 'enhanced' ? 'gap-3' : ''}
        `}>
          {navigationItems.map(renderBreadcrumbItem)}
        </BreadcrumbList>
      </Breadcrumb>
      
      {variant === 'enhanced' && (
        <div className="mt-2 text-xs text-muted-foreground">
          {isRTL ? 'المسار الحالي' : 'Chemin actuel'}: {navigationItems.length} {isRTL ? 'عنصر' : 'éléments'}
        </div>
      )}
    </div>
  );
}