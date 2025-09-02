
import React, { useState, useEffect } from 'react';
import { ActionButtons } from './ActionButtons';
import { ResourceCard } from './ResourceCard';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { InstantSearch } from '@/components/common/InstantSearch';

import { Book } from 'lucide-react';

export function OuvragesTab() {
  const [apiOuvrages, setApiOuvrages] = useState<any[]>([]);
  const [isApiEnabled, setIsApiEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Écouter les événements API
  useEffect(() => {
    const handleApiDataLoaded = (event: CustomEvent) => {
      if (event.detail.resourceType === 'ouvrage') {
        setApiOuvrages(event.detail.data);
        setIsApiEnabled(true);
      }
    };

    const handleApiDataCleared = (event: CustomEvent) => {
      if (event.detail.resourceType === 'ouvrage') {
        setApiOuvrages([]);
        setIsApiEnabled(false);
      }
    };

    // Charger l'état initial depuis localStorage
    const savedState = localStorage.getItem('api_enabled_ouvrage');
    if (savedState !== null) {
      // Charger l'état sauvegardé
      setIsApiEnabled(JSON.parse(savedState));
    } else {
      // État désactivé par défaut (pas de sauvegarde forcée)
      setIsApiEnabled(false);
    }

    window.addEventListener('api-data-loaded', handleApiDataLoaded as EventListener);
    window.addEventListener('api-data-cleared', handleApiDataCleared as EventListener);

    return () => {
      window.removeEventListener('api-data-loaded', handleApiDataLoaded as EventListener);
      window.removeEventListener('api-data-cleared', handleApiDataCleared as EventListener);
    };
  }, []);

  const ouvrages = [
    {
      id: 1,
      title: "Code Civil Algérien",
      author: "République Algérienne",
      publisher: "Journal Officiel",
      year: "2024",
      pages: 450,
      category: "Droit Civil",
      description: "Version consolidée du Code Civil avec les dernières modifications"
    },
    {
      id: 2,
      title: "Droit des Obligations",
      author: "Mohamed Bedjaoui",
      publisher: "Editions HOUMA",
      year: "2023",
      pages: 320,
      category: "Droit Civil",
      description: "Étude approfondie du droit des obligations en droit algérien"
    },
    {
      id: 3,
      title: "Code de Procédure Civile",
      author: "République Algérienne",
      publisher: "Journal Officiel",
      year: "2024",
      pages: 380,
      category: "Procédure Civile",
      description: "Procédures civiles et commerciales en vigueur"
    },
    {
      id: 4,
      title: "Droit Commercial Algérien",
      author: "Ahmed Benali",
      publisher: "Editions DALIM",
      year: "2023",
      pages: 420,
      category: "Droit Commercial",
      description: "Traité complet du droit commercial algérien"
    },
    {
      id: 5,
      title: "Code Pénal Algérien",
      author: "République Algérienne",
      publisher: "Journal Officiel",
      year: "2024",
      pages: 520,
      category: "Droit Pénal",
      description: "Code pénal avec jurisprudence et commentaires"
    },
    {
      id: 6,
      title: "Droit Administratif",
      author: "Fatima Cherif",
      publisher: "Editions CASBAH",
      year: "2023",
      pages: 380,
      category: "Droit Administratif",
      description: "Manuel de droit administratif algérien"
    },
    {
      id: 7,
      title: "Code du Travail",
      author: "République Algérienne",
      publisher: "Journal Officiel",
      year: "2024",
      pages: 280,
      category: "Droit Social",
      description: "Relations de travail et sécurité sociale"
    },
    {
      id: 8,
      title: "Droit Fiscal Algérien",
      author: "Karim Boudiaf",
      publisher: "Editions ENAL",
      year: "2023",
      pages: 350,
      category: "Droit Fiscal",
      description: "Guide complet de la fiscalité algérienne"
    },
    {
      id: 9,
      title: "Code des Marchés Publics",
      author: "République Algérienne",
      publisher: "Journal Officiel",
      year: "2024",
      pages: 180,
      category: "Droit Public",
      description: "Réglementation des marchés publics"
    },
    {
      id: 10,
      title: "Droit de la Famille",
      author: "Leila Mansouri",
      publisher: "Editions HOUMA",
      year: "2023",
      pages: 290,
      category: "Droit Civil",
      description: "Étude du droit de la famille en Algérie"
    },
    {
      id: 11,
      title: "Code de Procédure Pénale",
      author: "République Algérienne",
      publisher: "Journal Officiel",
      year: "2024",
      pages: 320,
      category: "Procédure Pénale",
      description: "Procédures pénales et garanties des droits"
    },
    {
      id: 12,
      title: "Droit International Privé",
      author: "Omar Khelifi",
      publisher: "Editions DALIM",
      year: "2023",
      pages: 410,
      category: "Droit International",
      description: "Conflits de lois et de juridictions"
    }
  ];

  // Filtrage des données selon la recherche
  const filteredOuvrages = ouvrages.filter(ouvrage =>
    ouvrage.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ouvrage.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ouvrage.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ouvrage.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ouvrage.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApiOuvrages = apiOuvrages.filter(ouvrage =>
    ouvrage.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ouvrage.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ouvrage.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ouvrage.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ouvrage.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Combiner les données locales et API
  const combinedOuvrages = [...filteredOuvrages, ...filteredApiOuvrages];

  // Pagination pour les ouvrages combinés
  const {
    currentData: paginatedOuvrages,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: combinedOuvrages,
    itemsPerPage: 5
  });

  return (
    <div className="space-y-6">


      <ActionButtons resourceType="ouvrage" />
      
      {/* Barre de recherche */}
      <div className="mb-4">
        <InstantSearch
          placeholder="Rechercher dans les ouvrages..."
          onSearch={setSearchQuery}
          className="max-w-md"
        />
      </div>
      
      {/* Indicateur de source de données */}
      <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
        <span className="text-xs font-medium text-blue-700">
          💾 Données locales ({filteredOuvrages.length})
          {isApiEnabled && apiOuvrages.length > 0 && (
            <span className="ml-2">+ 📡 Données API ({filteredApiOuvrages.length})</span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedOuvrages.map((ouvrage) => {
          // Déterminer si c'est une donnée API ou locale
          const isApiData = ouvrage.id.toString().startsWith('api-');
          
          return (
            <ResourceCard 
              key={ouvrage.id}
              id={ouvrage.id}
              title={ouvrage.title}
              author={ouvrage.author}
              publisher={ouvrage.publisher}
              year={ouvrage.year}
              pages={ouvrage.pages}
              category={ouvrage.category}
              description={ouvrage.description}
              icon={<Book className="w-5 h-5" />}
              iconBgColor={isApiData ? "bg-green-100" : "bg-blue-100"}
              iconColor={isApiData ? "text-green-600" : "text-blue-600"}
              actionLabel="Consulter"
            />
          );
        })}
      </div>
      {/* Pagination pour les données combinées */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}
    </div>
  );
}
