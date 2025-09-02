
import React, { useState, useEffect } from 'react';
import { ActionButtons } from './ActionButtons';
import { ResourceCard } from './ResourceCard';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { InstantSearch } from '@/components/common/InstantSearch';

import { Newspaper } from 'lucide-react';

export function JournauxTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [apiJournaux, setApiJournaux] = useState<any[]>([]);
  const [isApiEnabled, setIsApiEnabled] = useState(false);

  // Écouter les événements API
  useEffect(() => {
    const handleApiDataLoaded = (event: CustomEvent) => {
      if (event.detail.resourceType === 'journal') {
        setApiJournaux(event.detail.data);
        setIsApiEnabled(true);
      }
    };

    const handleApiDataCleared = (event: CustomEvent) => {
      if (event.detail.resourceType === 'journal') {
        setApiJournaux([]);
        setIsApiEnabled(false);
      }
    };

    // Charger l'état initial depuis localStorage
    const savedState = localStorage.getItem('api_enabled_journal');
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

  const journaux = [
    {
      id: 1,
      title: "Journal Officiel de la République Algérienne",
      author: "République Algérienne",
      publisher: "Imprimerie Officielle",
      year: "2024",
      pages: 50,
      category: "Officiel",
      description: "Publication officielle des textes réglementaires"
    },
    {
      id: 2,
      title: "Bulletin Officiel des Annonces Légales",
      author: "Ministère de la Justice",
      publisher: "Imprimerie Officielle",
      year: "2024",
      pages: 30,
      category: "Légal",
      description: "Annonces légales et judiciaires"
    },
    {
      id: 3,
      title: "Bulletin Officiel des Marchés Publics",
      author: "Ministère des Finances",
      publisher: "Imprimerie Officielle",
      year: "2024",
      pages: 25,
      category: "Marchés Publics",
      description: "Publication des marchés publics"
    },
    {
      id: 4,
      title: "Bulletin Officiel des Sociétés",
      author: "Centre National du Registre de Commerce",
      publisher: "CNRC",
      year: "2024",
      pages: 40,
      category: "Commerce",
      description: "Annonces légales des sociétés"
    },
    {
      id: 5,
      title: "Bulletin Officiel des Propriétés Industrielles",
      author: "Institut National Algérien de la Propriété Industrielle",
      publisher: "INAPI",
      year: "2024",
      pages: 35,
      category: "Propriété Industrielle",
      description: "Brevets et marques déposées"
    },
    {
      id: 6,
      title: "Bulletin Officiel des Douanes",
      author: "Direction Générale des Douanes",
      publisher: "DGD",
      year: "2024",
      pages: 20,
      category: "Douanes",
      description: "Réglementation douanière"
    },
    {
      id: 7,
      title: "Bulletin Officiel de la Banque d'Algérie",
      author: "Banque d'Algérie",
      publisher: "BA",
      year: "2024",
      pages: 45,
      category: "Banque",
      description: "Réglementation bancaire et monétaire"
    },
    {
      id: 8,
      title: "Bulletin Officiel de l'Environnement",
      author: "Ministère de l'Environnement",
      publisher: "Imprimerie Officielle",
      year: "2024",
      pages: 30,
      category: "Environnement",
      description: "Réglementation environnementale"
    }
  ];

  // Filtrage des données selon la recherche
  const filteredJournaux = journaux.filter(journal =>
    journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journal.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journal.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journal.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journal.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApiJournaux = apiJournaux.filter(journal =>
    journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journal.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journal.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journal.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journal.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Combiner les données locales et API
  const combinedJournaux = [...filteredJournaux, ...filteredApiJournaux];

  // Pagination pour les journaux
  const {
    currentData: paginatedJournaux,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: combinedJournaux,
    itemsPerPage: 5
  });

  return (
    <div className="space-y-6">


      <ActionButtons resourceType="journal" />
      
      {/* Barre de recherche */}
      <div className="mb-4">
        <InstantSearch
          placeholder="Rechercher dans les journaux..."
          onSearch={setSearchQuery}
          className="max-w-md"
        />
      </div>
      
      {/* Indicateur de source de données */}
      <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
        <span className="text-xs font-medium text-blue-700">
          💾 Données locales ({filteredJournaux.length})
          {isApiEnabled && apiJournaux.length > 0 && (
            <span className="ml-2">+ 📡 Données API ({filteredApiJournaux.length})</span>
          )}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedJournaux.map((journal) => {
          // Déterminer si c'est une donnée API ou locale
          const isApiData = journal.id.toString().startsWith('api-');
          
          return (
            <ResourceCard 
              key={journal.id}
              id={journal.id}
              title={journal.title}
              author={journal.author}
              publisher={journal.publisher}
              year={journal.year}
              pages={journal.pages}
              category={journal.category}
              description={journal.description}
              icon={<Newspaper className="w-5 h-5" />}
              iconBgColor={isApiData ? "bg-green-100" : "bg-orange-100"}
              iconColor={isApiData ? "text-green-600" : "text-orange-600"}
              actionLabel="Consulter"
            />
          );
        })}
      </div>
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
