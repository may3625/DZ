import { UnifiedPagination } from '@/components/common/UnifiedPagination';

interface ResultsNavigationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export const ResultsNavigation = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage = 5,
  onPageChange 
}: ResultsNavigationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Conversion des indices pour la compatibilité (0-based vers 1-based)
  const convertedCurrentPage = currentPage + 1;
  const handlePageChange = (page: number) => {
    onPageChange(page - 1); // Convertir vers 0-based
  };

  return (
    <UnifiedPagination
      currentPage={convertedCurrentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={handlePageChange}
      onItemsPerPageChange={() => {}} // OCR results typically don't need this
      variant="compact"
      size="sm"
      showItemsPerPage={false}
      showInfo={true}
    />
  );
};