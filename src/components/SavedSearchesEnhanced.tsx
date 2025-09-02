
import { useState } from "react";
import { Star } from "lucide-react";
import { SearchFilter } from "./saved-searches/SearchFilter";
import { StatisticsCards } from "./saved-searches/StatisticsCards";
import { SavedSearchCard } from "./saved-searches/SavedSearchCard";
import { EmptyState } from "./saved-searches/EmptyState";
import { useAppStore } from '@/stores/appStore';
import { UnifiedPagination } from '@/components/common/UnifiedPagination';
import { usePagination } from '@/hooks/usePagination';
import { InstantSearch } from '@/components/common/InstantSearch';

export function SavedSearchesEnhanced() {
  const [searchTerm, setSearchTerm] = useState("");

  const savedSearches = useAppStore(state => state.savedSearches);
  
  const filteredSearches = savedSearches.filter(search =>
    search.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    search.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    search.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination pour les recherches sauvegardées
  const {
    currentData: paginatedSearches,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredSearches,
    itemsPerPage: 5
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
          <Star className="w-8 h-8 text-yellow-500" />
          Recherches Sauvegardées
        </h2>
        <p className="text-gray-600 text-lg">
          Accédez rapidement à vos recherches juridiques algériennes précédentes
        </p>
      </div>

      <div className="space-y-4">
        <InstantSearch
          placeholder="Rechercher dans vos recherches sauvegardées..."
          onSearch={setSearchTerm}
          className="w-full"
        />
      </div>

      <StatisticsCards savedSearches={savedSearches} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {paginatedSearches.length > 0 ? (
          paginatedSearches.map((search) => (
            <SavedSearchCard key={search.id} search={search} />
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState />
          </div>
        )}
      </div>

      {/* Pagination */}
      {paginatedSearches.length > 0 && (
        <div className="mt-6">
          <UnifiedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            size="md"
            variant="default"
            showItemsPerPage={true}
            showInfo={true}
          />
        </div>
      )}
    </div>
  );
}
