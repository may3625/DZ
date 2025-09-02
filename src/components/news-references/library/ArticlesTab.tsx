
import React, { useState, useEffect } from 'react';
import { ActionButtons } from './ActionButtons';
import { ResourceCard } from './ResourceCard';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { InstantSearch } from '@/components/common/InstantSearch';

import { FileText } from 'lucide-react';

export function ArticlesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [apiArticles, setApiArticles] = useState<any[]>([]);
  const [isApiEnabled, setIsApiEnabled] = useState(false);

  // Écouter les événements API
  useEffect(() => {
    const handleApiDataLoaded = (event: CustomEvent) => {
      if (event.detail.resourceType === 'article') {
        setApiArticles(event.detail.data);
        setIsApiEnabled(true);
      }
    };

    const handleApiDataCleared = (event: CustomEvent) => {
      if (event.detail.resourceType === 'article') {
        setApiArticles([]);
        setIsApiEnabled(false);
      }
    };

    // Charger l'état initial depuis localStorage
    const savedState = localStorage.getItem('api_enabled_article');
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

  const articles = [
    {
      id: 1,
      title: "La réforme du droit commercial algérien",
      author: "Pr. Ahmed Mahiou",
      publisher: "Revue de Droit",
      year: "2024",
      pages: 25,
      category: "Droit Commercial",
      description: "Analyse des récentes modifications du code de commerce"
    },
    {
      id: 2,
      title: "L'évolution du droit de la famille",
      author: "Dr. Fatima Zohra",
      publisher: "Cahiers Juridiques",
      year: "2023",
      pages: 18,
      category: "Droit de la Famille",
      description: "Étude comparative des réformes récentes"
    },
    {
      id: 3,
      title: "La protection des données personnelles",
      author: "Dr. Karim Boudiaf",
      publisher: "Revue Numérique",
      year: "2024",
      pages: 22,
      category: "Droit Numérique",
      description: "Nouvelles obligations RGPD en Algérie"
    },
    {
      id: 4,
      title: "Le contentieux administratif",
      author: "Pr. Leila Mansouri",
      publisher: "Cahiers Administratifs",
      year: "2024",
      pages: 30,
      category: "Droit Administratif",
      description: "Évolution de la jurisprudence administrative"
    },
    {
      id: 5,
      title: "La fiscalité des entreprises",
      author: "Dr. Omar Khelifi",
      publisher: "Revue Fiscale",
      year: "2023",
      pages: 28,
      category: "Droit Fiscal",
      description: "Optimisation fiscale et conformité"
    },
    {
      id: 6,
      title: "Le droit des contrats internationaux",
      author: "Pr. Mohamed Bedjaoui",
      publisher: "Revue Internationale",
      year: "2024",
      pages: 35,
      category: "Droit International",
      description: "Conflits de lois et arbitrage"
    },
    {
      id: 7,
      title: "La responsabilité médicale",
      author: "Dr. Amina Cherif",
      publisher: "Cahiers Médicaux",
      year: "2023",
      pages: 20,
      category: "Droit Médical",
      description: "Obligations et responsabilités des praticiens"
    },
    {
      id: 8,
      title: "Le droit de l'environnement",
      author: "Pr. Hassan Benali",
      publisher: "Revue Environnementale",
      year: "2024",
      pages: 26,
      category: "Droit Environnemental",
      description: "Protection et réglementation environnementale"
    },
    {
      id: 9,
      title: "La procédure pénale",
      author: "Dr. Samira Zidane",
      publisher: "Cahiers Pénaux",
      year: "2024",
      pages: 32,
      category: "Droit Pénal",
      description: "Garanties procédurales et droits de la défense"
    },
    {
      id: 10,
      title: "Le droit social et syndical",
      author: "Pr. Rachid Tlemçani",
      publisher: "Revue Sociale",
      year: "2023",
      pages: 24,
      category: "Droit Social",
      description: "Libertés syndicales et négociation collective"
    },
    {
      id: 11,
      title: "La propriété intellectuelle",
      author: "Dr. Yasmina Boudjemaa",
      publisher: "Cahiers de Propriété",
      year: "2024",
      pages: 19,
      category: "Propriété Intellectuelle",
      description: "Brevets, marques et droits d'auteur"
    },
    {
      id: 12,
      title: "Le droit bancaire et financier",
      author: "Pr. Abdelkader Messaoudi",
      publisher: "Revue Bancaire",
      year: "2024",
      pages: 27,
      category: "Droit Bancaire",
      description: "Régulation bancaire et services financiers"
    }
  ];

  // Filtrage des données selon la recherche
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApiArticles = apiArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Combiner les données locales et API
  const combinedArticles = [...filteredArticles, ...filteredApiArticles];

  // Pagination pour les articles
  const {
    currentData: paginatedArticles,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: combinedArticles,
    itemsPerPage: 5
  });

  return (
    <div className="space-y-6">


      <ActionButtons resourceType="article" />
      
      {/* Barre de recherche */}
      <div className="mb-4">
        <InstantSearch
          placeholder="Rechercher dans les articles..."
          onSearch={setSearchQuery}
          className="max-w-md"
        />
      </div>
      
      {/* Indicateur de source de données */}
      <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
        <span className="text-xs font-medium text-blue-700">
          💾 Données locales ({filteredArticles.length})
          {isApiEnabled && apiArticles.length > 0 && (
            <span className="ml-2">+ 📡 Données API ({filteredApiArticles.length})</span>
          )}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedArticles.map((article) => {
          // Déterminer si c'est une donnée API ou locale
          const isApiData = article.id.toString().startsWith('api-');
          
          return (
            <ResourceCard 
              key={article.id}
              id={article.id}
              title={article.title}
              author={article.author}
              publisher={article.publisher}
              year={article.year}
              pages={article.pages}
              category={article.category}
              description={article.description}
              icon={<FileText className="w-5 h-5" />}
              iconBgColor={isApiData ? "bg-green-100" : "bg-blue-100"}
              iconColor={isApiData ? "text-green-600" : "text-blue-600"}
              actionLabel="Lire"
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
