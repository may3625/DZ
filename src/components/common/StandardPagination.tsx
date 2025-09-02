import React from 'react';
import { UnifiedPagination } from '@/components/common/UnifiedPagination';
import { cn } from '@/lib/utils';

interface StandardPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  className?: string;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
  size?: 'sm' | 'md' | 'lg';
  alignment?: 'left' | 'center' | 'right';
}

export function StandardPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
  showItemsPerPage = true,
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50],
  size = 'md',
  alignment = 'center'
}: StandardPaginationProps) {
  if (totalPages <= 1 && totalItems <= itemsPerPage) {
    return null;
  }

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  const containerClass = cn(
    'flex w-full',
    alignmentClasses[alignment],
    className
  );

  return (
    <div className={containerClass}>
      <UnifiedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        itemsPerPageOptions={itemsPerPageOptions}
        size={size}
      />
    </div>
  );
}

// Export du hook unifié depuis paginationHelper
export { useUnifiedPagination as useStandardPagination } from '@/utils/paginationHelper';
export type { PaginationConfig as UseStandardPaginationProps } from '@/utils/paginationHelper';