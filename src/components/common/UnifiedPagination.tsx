import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
  showItemsPerPage?: boolean;
  showInfo?: boolean;
  className?: string;
}

export function UnifiedPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50],
  size = 'md',
  variant = 'default',
  showItemsPerPage = true,
  showInfo = true,
  className
}: UnifiedPaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const sizeClasses = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-9 w-9 text-base'
  };

  const getVisiblePages = () => {
    if (totalPages <= 1) return [];
    
    const delta = variant === 'compact' ? 1 : 2;
    const range = [];
    const rangeWithDots = [];

    // Calculer les pages à afficher
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Première page
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Pages du milieu
    rangeWithDots.push(...range);

    // Dernière page
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Affichage pour les cas sans pagination
  if (totalPages <= 1 && variant !== 'detailed') {
    return showInfo ? (
      <div className={cn("flex items-center justify-between text-sm text-muted-foreground", className)}>
        <div>
          {totalItems === 0 ? (
            "Aucun élément à afficher"
          ) : (
            `Affichage de ${totalItems} élément${totalItems > 1 ? 's' : ''}`
          )}
        </div>
        {showItemsPerPage && totalItems > 0 && (
          <div className="flex items-center gap-2">
            <span>Éléments par page :</span>
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    ) : null;
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {/* Info compacte */}
        {showInfo && (
          <Badge variant="outline" className="text-xs">
            Page {currentPage}/{totalPages}
          </Badge>
        )}

        {/* Navigation compacte */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={sizeClasses[size]}
            >
              <ChevronsLeft className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={sizeClasses[size]}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={sizeClasses[size]}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages}
              className={sizeClasses[size]}
            >
              <ChevronsRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      {/* Information d'affichage */}
      {showInfo && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {totalItems === 0 ? (
              "Aucun élément à afficher"
            ) : (
              `Affichage de ${startItem} à ${endItem} sur ${totalItems} élément${totalItems > 1 ? 's' : ''}`
            )}
          </span>
          {variant === 'detailed' && (
            <Badge variant="outline">
              Page {currentPage}/{totalPages}
            </Badge>
          )}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Sélecteur d'éléments par page */}
        {showItemsPerPage && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Éléments par page :</span>
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Contrôles de navigation */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={sizeClasses[size]}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={sizeClasses[size]}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Pages numérotées */}
            {getVisiblePages().map((page, index) => {
              if (page === '...') {
                return (
                  <span key={index} className="px-2 text-muted-foreground">
                    ...
                  </span>
                );
              }
              return (
                <Button
                  key={index}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={sizeClasses[size]}
                >
                  {page}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={sizeClasses[size]}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages}
              className={sizeClasses[size]}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}