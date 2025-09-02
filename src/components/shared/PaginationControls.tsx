import React from 'react';
import { UnifiedPagination } from '@/components/common/UnifiedPagination';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange
}: PaginationControlsProps) {
  // Estimation des éléments pour la compatibilité
  const estimatedTotalItems = totalPages * 10; // Estimation basique
  const itemsPerPage = 5;

  return (
    <div className="py-4">
      <UnifiedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={estimatedTotalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        onItemsPerPageChange={() => {}} // Pas utilisé dans ce contexte
        variant="default"
        size="md"
        showItemsPerPage={false}
        showInfo={false}
        className="justify-center"
      />
    </div>
  );
}