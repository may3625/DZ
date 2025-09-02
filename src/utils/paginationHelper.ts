/**
 * Système de pagination unifié pour toute l'application
 */

import React, { useState, useMemo } from 'react';

export interface PaginationConfig<T = any> {
  data: T[];
  itemsPerPage?: number;
  searchTerm?: string;
  searchFields?: Array<keyof T>;
  filters?: Record<string, any>;
  initialPage?: number;
}

export interface PaginationReturn<T> {
  // Données paginées
  currentData: T[];
  filteredData: T[];
  
  // État de pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Actions de navigation
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  
  // Info d'affichage
  startItem: number;
  endItem: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function useUnifiedPagination<T extends Record<string, any>>({
  data,
  itemsPerPage = 5,
  searchTerm = '',
  searchFields = [],
  filters = {},
  initialPage = 1
}: PaginationConfig<T>): PaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentItemsPerPage, setCurrentItemsPerPage] = useState(itemsPerPage);

  // Filtrage et recherche optimisés
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Appliquer les filtres
      const passesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value || value === 'all' || value === '' || value === null || value === undefined) {
          return true;
        }
        
        const itemValue = item[key];
        
        if (Array.isArray(itemValue)) {
          return itemValue.includes(value);
        }
        
        if (typeof itemValue === 'string' && typeof value === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }
        
        return itemValue === value;
      });

      // Appliquer la recherche
      const passesSearch = !searchTerm || searchFields.some(field => {
        const fieldValue = item[field];
        if (fieldValue == null) return false;
        return fieldValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });

      return passesFilters && passesSearch;
    });
  }, [data, filters, searchTerm, searchFields]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / currentItemsPerPage);

  // Données paginées optimisées
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * currentItemsPerPage;
    const endIndex = startIndex + currentItemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, currentItemsPerPage]);

  // Calculs d'affichage
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * currentItemsPerPage + 1;
  const endItem = Math.min(currentPage * currentItemsPerPage, totalItems);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Actions de navigation sécurisées
  const goToPage = (page: number) => {
    const safePage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(safePage);
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    if (totalPages > 0) {
      setCurrentPage(totalPages);
    }
  };

  const handleSetItemsPerPage = (newItemsPerPage: number) => {
    setCurrentItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset à la première page
  };

  // Reset à la première page quand les données changent
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Reset à la première page quand les filtres changent
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  return {
    currentData,
    filteredData,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage: currentItemsPerPage,
    setCurrentPage: goToPage,
    setItemsPerPage: handleSetItemsPerPage,
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    startItem,
    endItem,
    hasNextPage,
    hasPrevPage
  };
}

export const defaultPaginationSizes = [5, 10, 15, 20, 25, 50];

export interface StandardPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
}