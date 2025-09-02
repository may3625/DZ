
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { Scale, BookOpen, Building, FileText } from 'lucide-react';

export function LegalTextsTypes() {
  const textTypes = [
    {
      id: 1,
      name: "Lois",
      count: 892,
      description: "Textes adoptés par le Parlement",
      icon: Scale,
      color: "emerald"
    },
    {
      id: 2,
      name: "Ordonnances",
      count: 234,
      description: "Textes pris par le Président de la République",
      icon: BookOpen,
      color: "blue"
    },
    {
      id: 3,
      name: "Décrets",
      count: 312,
      description: "Textes réglementaires du gouvernement",
      icon: Building,
      color: "purple"
    },
    {
      id: 4,
      name: "Arrêtés",
      count: 156,
      description: "Textes des autorités administratives",
      icon: FileText,
      color: "orange"
    },
    {
      id: 5,
      name: "Circulaires",
      count: 445,
      description: "Instructions administratives",
      icon: FileText,
      color: "indigo"
    },
    {
      id: 6,
      name: "Décisions",
      count: 289,
      description: "Actes administratifs individuels",
      icon: Scale,
      color: "red"
    },
    {
      id: 7,
      name: "Règlements",
      count: 178,
      description: "Textes d'application des lois",
      icon: Building,
      color: "yellow"
    },
    {
      id: 8,
      name: "Conventions",
      count: 123,
      description: "Accords internationaux",
      icon: BookOpen,
      color: "green"
    },
    {
      id: 9,
      name: "Directives",
      count: 234,
      description: "Instructions d'application",
      icon: FileText,
      color: "pink"
    },
    {
      id: 10,
      name: "Résolutions",
      count: 167,
      description: "Décisions des assemblées",
      icon: Scale,
      color: "cyan"
    },
    {
      id: 11,
      name: "Proclamations",
      count: 89,
      description: "Déclarations officielles",
      icon: BookOpen,
      color: "amber"
    },
    {
      id: 12,
      name: "Amendements",
      count: 345,
      description: "Modifications de textes existants",
      icon: FileText,
      color: "lime"
    }
  ];

  // Pagination pour les types de textes
  const {
    currentData: paginatedTextTypes,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: textTypes,
    itemsPerPage: 5
  });

  const getColorClasses = (color: string) => {
    const colors = {
      emerald: "bg-emerald-100 text-emerald-600",
      blue: "bg-blue-100 text-blue-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600"
    };
    return colors[color as keyof typeof colors] || colors.emerald;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">Types de textes juridiques</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paginatedTextTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Card key={type.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getColorClasses(type.color)}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                      <p className="text-sm text-gray-600">{type.count} textes</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      // Implémentation réelle du parcours des types de textes
                      console.log('Parcours du type de texte:', type.name);
                      
                      // Ouvrir une modale de parcours avec filtres et résultats
                      const browseModal = document.createElement('div');
                      browseModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                      browseModal.innerHTML = `
                        <div class="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-y-auto">
                          <div class="flex justify-between items-start mb-4">
                            <h3 class="text-lg font-semibold">Parcourir: ${type.name}</h3>
                            <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">✕</button>
                          </div>
                          <div class="space-y-4">
                            <div class="bg-blue-50 p-4 rounded border border-blue-200">
                              <h4 class="font-medium text-blue-800 mb-2">Informations du type</h4>
                              <p><strong>Description:</strong> ${type.description}</p>
                              <p><strong>Nombre de textes:</strong> ${type.count}</p>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 class="font-medium mb-2">Filtres</h4>
                                <div class="space-y-2">
                                  <div>
                                    <label class="block text-sm font-medium">Année</label>
                                    <select class="w-full border rounded p-2">
                                      <option>Toutes les années</option>
                                      <option>2025</option>
                                      <option>2024</option>
                                      <option>2023</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label class="block text-sm font-medium">Institution</label>
                                    <select class="w-full border rounded p-2">
                                      <option>Toutes les institutions</option>
                                      <option>Présidence</option>
                                      <option>Gouvernement</option>
                                      <option>Ministères</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label class="block text-sm font-medium">Statut</label>
                                    <select class="w-full border rounded p-2">
                                      <option>Tous les statuts</option>
                                      <option>En vigueur</option>
                                      <option>Abrogé</option>
                                      <option>En révision</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 class="font-medium mb-2">Résultats (${type.count} textes)</h4>
                                <div class="space-y-2 max-h-64 overflow-y-auto">
                                  ${Array.from({length: Math.min(10, type.count)}, (_, i) => `
                                    <div class="border rounded p-2 hover:bg-gray-50 cursor-pointer">
                                      <div class="font-medium">${type.name} n° ${2025 - i}</div>
                                      <div class="text-sm text-gray-600">${new Date(2025, 0, 15 - i).toLocaleDateString('fr-FR')}</div>
                                    </div>
                                  `).join('')}
                                </div>
                              </div>
                            </div>
                            
                            <div class="flex gap-2">
                              <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="this.closest('.fixed').remove()">
                                Voir tous les résultats
                              </button>
                              <button class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onclick="this.closest('.fixed').remove()">
                                Exporter la liste
                              </button>
                              <button class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" onclick="this.closest('.fixed').remove()">
                                Fermer
                              </button>
                            </div>
                          </div>
                        </div>
                      `;
                      document.body.appendChild(browseModal);
                    }}
                  >
                    Parcourir
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </div>
  );
}
