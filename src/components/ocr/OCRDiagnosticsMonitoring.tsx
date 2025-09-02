import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePagination } from '@/hooks/usePagination';
import { StandardPagination } from '@/components/common/StandardPagination';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  FileText
} from 'lucide-react';

export function OCRDiagnosticsMonitoring() {
  const [searchTerm, setSearchTerm] = useState('');

  const diagnosticsData = [
    {
      id: 1,
      timestamp: '2025-02-19 14:30',
      document: 'Loi de finances 2025.pdf',
      status: 'Success',
      accuracy: 98.5,  
      processingTime: '2.3s',
      errors: 0,
      warnings: 1
    },
    {
      id: 2,
      timestamp: '2025-02-19 14:25',
      document: 'Décret urbanisme.pdf',
      status: 'Warning',
      accuracy: 87.2,
      processingTime: '4.1s', 
      errors: 0,
      warnings: 3
    },
    {
      id: 3,
      timestamp: '2025-02-19 14:20',
      document: 'Arrêté ministériel.pdf',
      status: 'Error',
      accuracy: 65.8,
      processingTime: '1.8s',
      errors: 2,
      warnings: 5
    },
    {
      id: 4,
      timestamp: '2025-02-19 14:15',
      document: 'Code commerce.pdf',
      status: 'Success',
      accuracy: 95.3,
      processingTime: '3.2s',
      errors: 0,
      warnings: 0
    },
    {
      id: 5,
      timestamp: '2025-02-19 14:10',
      document: 'Procédure SARL.pdf',
      status: 'Success',
      accuracy: 99.1,
      processingTime: '1.9s',
      errors: 0,
      warnings: 0
    },
    {
      id: 6,
      timestamp: '2025-02-19 14:05',
      document: 'Formulaire fiscal.pdf',
      status: 'Warning', 
      accuracy: 88.7,
      processingTime: '2.7s',
      errors: 0,
      warnings: 2
    }
  ];

  const {
    currentData: paginatedDiagnostics,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: diagnosticsData,
    itemsPerPage: 5
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'Error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Diagnostic & Monitoring (OCR-IA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedDiagnostics.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{item.document}</h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <Badge variant={item.status === 'Success' ? 'default' : 'destructive'}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>Précision: {item.accuracy}%</div>
                  <div>Temps: {item.processingTime}</div>
                  <div>Erreurs: {item.errors}</div>
                  <div>Avertissements: {item.warnings}</div>
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