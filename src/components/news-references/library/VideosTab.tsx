
import React, { useState, useEffect } from 'react';
import { ActionButtons } from './ActionButtons';
import { ResourceCard } from './ResourceCard';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { InstantSearch } from '@/components/common/InstantSearch';

import { Play } from 'lucide-react';

export function VideosTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [apiVideos, setApiVideos] = useState<any[]>([]);
  const [isApiEnabled, setIsApiEnabled] = useState(false);

  // Écouter les événements API
  useEffect(() => {
    const handleApiDataLoaded = (event: CustomEvent) => {
      if (event.detail.resourceType === 'video') {
        setApiVideos(event.detail.data);
        setIsApiEnabled(true);
      }
    };

    const handleApiDataCleared = (event: CustomEvent) => {
      if (event.detail.resourceType === 'video') {
        setApiVideos([]);
        setIsApiEnabled(false);
      }
    };

    // Charger l'état initial depuis localStorage
    const savedState = localStorage.getItem('api_enabled_video');
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

  const videos = [
    {
      id: 1,
      title: "Conférence : Le nouveau code de procédure",
      speaker: "Pr. Karim Benali",
      duration: "1h 30min",
      year: "2024",
      category: "Procédure",
      description: "Présentation des nouvelles dispositions procédurales"
    },
    {
      id: 2,
      title: "Séminaire : Droit des investissements",
      speaker: "Dr. Samia Redjimi",
      duration: "2h 15min",
      year: "2024",
      category: "Économique",
      description: "Les enjeux juridiques de l'investissement en Algérie"
    },
    {
      id: 3,
      title: "Webinaire : Protection des données personnelles",
      speaker: "Dr. Ahmed Mahiou",
      duration: "1h 45min",
      year: "2024",
      category: "Numérique",
      description: "Conformité RGPD et obligations légales"
    },
    {
      id: 4,
      title: "Conférence : Droit fiscal des entreprises",
      speaker: "Pr. Omar Khelifi",
      duration: "2h 00min",
      year: "2024",
      category: "Fiscal",
      description: "Optimisation fiscale et planification"
    },
    {
      id: 5,
      title: "Séminaire : Droit administratif",
      speaker: "Dr. Leila Mansouri",
      duration: "1h 55min",
      year: "2023",
      category: "Administratif",
      description: "Contentieux administratif et recours"
    },
    {
      id: 6,
      title: "Webinaire : Droit commercial international",
      speaker: "Pr. Mohamed Bedjaoui",
      duration: "2h 30min",
      year: "2024",
      category: "International",
      description: "Contrats internationaux et arbitrage"
    },
    {
      id: 7,
      title: "Conférence : Droit social et syndical",
      speaker: "Dr. Rachid Tlemçani",
      duration: "1h 40min",
      year: "2023",
      category: "Social",
      description: "Libertés syndicales et négociation"
    },
    {
      id: 8,
      title: "Séminaire : Droit de l'environnement",
      speaker: "Pr. Hassan Benali",
      duration: "1h 50min",
      year: "2024",
      category: "Environnemental",
      description: "Réglementation et protection environnementale"
    },
    {
      id: 9,
      title: "Webinaire : Droit bancaire et financier",
      speaker: "Dr. Abdelkader Messaoudi",
      duration: "2h 10min",
      year: "2024",
      category: "Bancaire",
      description: "Régulation et services financiers"
    },
    {
      id: 10,
      title: "Conférence : Droit pénal et procédure",
      speaker: "Pr. Samira Zidane",
      duration: "1h 35min",
      year: "2024",
      category: "Pénal",
      description: "Garanties procédurales et droits de la défense"
    }
  ];

  // Filtrage des données selon la recherche
  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApiVideos = apiVideos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Combiner les données locales et API
  const combinedVideos = [...filteredVideos, ...filteredApiVideos];

  // Pagination pour les vidéos
  const {
    currentData: paginatedVideos,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: combinedVideos,
    itemsPerPage: 5
  });

  return (
    <div className="space-y-6">


      <ActionButtons resourceType="video" />
      
      {/* Barre de recherche */}
      <div className="mb-4">
        <InstantSearch
          placeholder="Rechercher dans les vidéos..."
          onSearch={setSearchQuery}
          className="max-w-md"
        />
      </div>
      
      {/* Indicateur de source de données */}
      <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
        <span className="text-xs font-medium text-blue-700">
          💾 Données locales ({filteredVideos.length})
          {isApiEnabled && apiVideos.length > 0 && (
            <span className="ml-2">+ 📡 Données API ({filteredApiVideos.length})</span>
          )}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedVideos.map((video) => {
          // Déterminer si c'est une donnée API ou locale
          const isApiData = video.id.toString().startsWith('api-');
          
          return (
            <ResourceCard 
              key={video.id}
              id={video.id}
              title={video.title}
              speaker={video.speaker}
              duration={video.duration}
              year={video.year}
              category={video.category}
              description={video.description}
              icon={<Play className="w-5 h-5" />}
              iconBgColor={isApiData ? "bg-green-100" : "bg-red-100"}
              iconColor={isApiData ? "text-green-600" : "text-red-600"}
              actionLabel="Regarder"
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
