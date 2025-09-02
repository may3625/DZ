import React from 'react';
import { ActionButtons } from './ActionButtons';
import { ResourceCard } from './ResourceCard';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { BookOpen } from 'lucide-react';

export function DictionnairesJuridiquesTab() {
  const dictionnaires = [
    {
      id: 1,
      title: "Dictionnaire Juridique Français-Arabe",
      author: "Dr. Ahmed Benali",
      publisher: "Éditions Juridiques Algériennes",
      year: "2024",
      pages: 850,
      category: "Dictionnaire Bilingue",
      description: "Dictionnaire spécialisé de termes juridiques français-arabe avec 15,000 entrées"
    },
    {
      id: 2,
      title: "Lexique du Droit Civil Algérien",
      author: "Prof. Fatima Boudiaf",
      publisher: "Presses Universitaires d'Alger",
      year: "2023",
      pages: 420,
      category: "Droit Civil",
      description: "Glossaire spécialisé des termes du droit civil avec références aux articles de loi"
    },
    {
      id: 3,
      title: "Dictionnaire de Droit Pénal",
      author: "Dr. Mohamed Khelifi",
      publisher: "Dar El Houda",
      year: "2024",
      pages: 380,
      category: "Droit Pénal",
      description: "Dictionnaire des termes de droit pénal et de procédure pénale"
    },
    {
      id: 4,
      title: "Glossaire du Droit Commercial",
      author: "Dr. Leila Mansouri",
      publisher: "Éditions Commerciales",
      year: "2024",
      pages: 520,
      category: "Droit Commercial",
      description: "Terminologie complète du droit commercial et des affaires"
    },
    {
      id: 5,
      title: "Dictionnaire de Droit Administratif",
      author: "Prof. Karim Meziane",
      publisher: "Presses de l'ENA",
      year: "2023",
      pages: 680,
      category: "Droit Administratif",
      description: "Lexique des termes administratifs et de la fonction publique"
    },
    {
      id: 6,
      title: "Vocabulaire du Droit du Travail",
      author: "Dr. Yacine Brahim",
      publisher: "Éditions Sociales",
      year: "2024",
      pages: 450,
      category: "Droit du Travail",
      description: "Dictionnaire spécialisé en droit social et relations de travail"
    },
    {
      id: 7,
      title: "Lexique du Droit Fiscal",
      author: "Dr. Salim Kaced",
      publisher: "Éditions Fiscales",
      year: "2023",
      pages: 390,
      category: "Droit Fiscal",
      description: "Terminologie fiscale et comptable pour les professionnels"
    },
    {
      id: 8,
      title: "Dictionnaire de Droit International",
      author: "Prof. Amina Bouaziz",
      publisher: "Presses Internationales",
      year: "2024",
      pages: 720,
      category: "Droit International",
      description: "Lexique des termes de droit international public et privé"
    },
    {
      id: 9,
      title: "Glossaire du Droit de l'Environnement",
      author: "Dr. Kamel Boudiaf",
      publisher: "Éditions Vertes",
      year: "2023",
      pages: 340,
      category: "Droit Environnemental",
      description: "Terminologie environnementale et développement durable"
    },
    {
      id: 10,
      title: "Dictionnaire de Droit Numérique",
      author: "Dr. Nadia Benali",
      publisher: "Éditions Digitales",
      year: "2024",
      pages: 480,
      category: "Droit Numérique",
      description: "Lexique des nouvelles technologies et cybersécurité"
    },
    {
      id: 11,
      title: "Vocabulaire du Droit de la Consommation",
      author: "Prof. Rachid Bensalem",
      publisher: "Éditions Consommateurs",
      year: "2023",
      pages: 310,
      category: "Droit de la Consommation",
      description: "Terminologie de la protection des consommateurs"
    },
    {
      id: 12,
      title: "Dictionnaire de Droit de la Famille",
      author: "Dr. Malika Zerrouki",
      publisher: "Éditions Familiales",
      year: "2024",
      pages: 420,
      category: "Droit de la Famille",
      description: "Lexique spécialisé en droit familial et successoral"
    }
  ];

  // Pagination pour les dictionnaires
  const {
    currentData: paginatedDictionnaires,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: dictionnaires,
    itemsPerPage: 5
  });

  return (
    <div className="space-y-6">
      <ActionButtons resourceType="dictionnaire-juridique" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedDictionnaires.map((dictionnaire) => (
          <ResourceCard 
            key={dictionnaire.id}
            id={dictionnaire.id}
            title={dictionnaire.title}
            author={dictionnaire.author}
            publisher={dictionnaire.publisher}
            year={dictionnaire.year}
            pages={dictionnaire.pages}
            category={dictionnaire.category}
            description={dictionnaire.description}
            icon={<BookOpen className="w-5 h-5" />}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            actionLabel="Consulter"
          />
        ))}
      </div>
      
      {/* Pagination */}
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