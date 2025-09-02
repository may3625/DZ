import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePagination } from '@/hooks/usePagination';
import { StandardPagination } from '@/components/common/StandardPagination';
import { 
  Users, 
  Eye, 
  Clock,
  TrendingUp,
  FileText
} from 'lucide-react';

export function CollaborativeWorkspace() {
  const collaborativeItems = [
    {
      id: 1,
      title: 'Réforme du Code du Travail 2025',
      type: 'Veille Legislative',
      participants: 8,
      lastUpdate: '2025-02-19 14:30',
      status: 'Active',
      priority: 'High'
    },
    {
      id: 2,
      title: 'Analyse des nouvelles procédures fiscales',
      type: 'Veille Réglementaire',
      participants: 5,
      lastUpdate: '2025-02-19 13:15',
      status: 'In Progress',
      priority: 'Medium'
    },
    {
      id: 3,
      title: 'Jurisprudence récente - Droit commercial',
      type: 'Veille Jurisprudentielle',
      participants: 12,
      lastUpdate: '2025-02-19 12:45',
      status: 'Review',
      priority: 'High'
    },
    {
      id: 4,
      title: 'Évolutions réglementaires urbanisme',
      type: 'Veille Sectorielle',
      participants: 6,
      lastUpdate: '2025-02-19 11:20',
      status: 'Active',
      priority: 'Low'
    },
    {
      id: 5,
      title: 'Nouvelles directives ministérielles',
      type: 'Veille Administrative',
      participants: 9,
      lastUpdate: '2025-02-19 10:30',
      status: 'Draft',
      priority: 'Medium'
    },
    {
      id: 6,
      title: 'Réglementation environnementale',
      type: 'Veille Environnementale',
      participants: 4,
      lastUpdate: '2025-02-19 09:15',
      status: 'Active',
      priority: 'High'
    }
  ];

  const {
    currentData: paginatedItems,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: collaborativeItems,
    itemsPerPage: 5
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Veille Collaborative
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{item.title}</h4>
                  <Badge variant="outline">{item.type}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {item.participants} participants
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {item.lastUpdate}
                  </span>
                  <Badge className={item.priority === 'High' ? 'bg-red-100 text-red-800' : 
                                  item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-green-100 text-green-800'}>
                    {item.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <StandardPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}