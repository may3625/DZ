import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  TrendingUp,
  TrendingDown,
  Settings,
  RefreshCw
} from 'lucide-react';

interface DiagnosticEntry {
  id: string;
  timestamp: string;
  component: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  duration?: number;
  accuracy?: number;
}

export function DiagnosticSection() {
  const diagnostics: DiagnosticEntry[] = [
    {
      id: '1',
      timestamp: '2024-01-15 14:30:25',
      component: 'OCR Engine',
      status: 'success',
      message: 'Extraction de texte terminée avec succès',
      details: 'Document PDF - 5 pages analysées',
      duration: 3.2,
      accuracy: 98.5
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:28:12',
      component: 'Image Preprocessing',
      status: 'warning',
      message: 'Qualité d\'image sous-optimale détectée',
      details: 'Résolution: 150 DPI (recommandé: 300 DPI)',
      duration: 1.8,
      accuracy: 85.2
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:25:45',
      component: 'Text Analysis',
      status: 'success',
      message: 'Analyse sémantique complétée',
      details: 'Détection de 12 entités juridiques',
      duration: 2.1,
      accuracy: 94.7
    },
    {
      id: '4',
      timestamp: '2024-01-15 14:23:18',
      component: 'Document Classification',
      status: 'error',
      message: 'Échec de classification automatique',
      details: 'Type de document non reconnu',
      duration: 0.5,
      accuracy: 0
    },
    {
      id: '5',
      timestamp: '2024-01-15 14:20:33',
      component: 'Language Detection',
      status: 'success',
      message: 'Langue détectée: Français (Algérie)',
      details: 'Confiance: 99.2%',
      duration: 0.3,
      accuracy: 99.2
    },
    {
      id: '6',
      timestamp: '2024-01-15 14:18:56',
      component: 'PDF Parser',
      status: 'warning',
      message: 'Document partiellement endommagé',
      details: 'Page 3 corrompue, récupération partielle',
      duration: 4.7,
      accuracy: 78.9
    },
    {
      id: '7',
      timestamp: '2024-01-15 14:15:22',
      component: 'OCR Confidence',
      status: 'success',
      message: 'Niveau de confiance élevé',
      details: 'Score global: 96.3%',
      duration: 2.8,
      accuracy: 96.3
    },
    {
      id: '8',
      timestamp: '2024-01-15 14:12:44',
      component: 'Structure Analysis',
      status: 'success',
      message: 'Structure documentaire identifiée',
      details: 'Format: Document officiel avec en-têtes',
      duration: 1.9,
      accuracy: 92.1
    }
  ];

  // Pagination
  const {
    currentData: paginatedDiagnostics,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: diagnostics,
    itemsPerPage: 5
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAccuracyTrend = (accuracy: number) => {
    if (accuracy >= 95) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (accuracy >= 80) return <TrendingUp className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  // Statistiques
  const totalProcesses = diagnostics.length;
  const successCount = diagnostics.filter(d => d.status === 'success').length;
  const warningCount = diagnostics.filter(d => d.status === 'warning').length;
  const errorCount = diagnostics.filter(d => d.status === 'error').length;
  const avgAccuracy = diagnostics.reduce((acc, d) => acc + (d.accuracy || 0), 0) / totalProcesses;
  const avgDuration = diagnostics.reduce((acc, d) => acc + (d.duration || 0), 0) / totalProcesses;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Diagnostic OCR-IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Surveillance en temps réel des performances du système OCR-IA
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Settings className="w-4 h-4" />
                Configuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <div className="text-sm text-gray-600">Succès</div>
            <div className="text-xs text-green-600">
              {((successCount / totalProcesses) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <div className="text-sm text-gray-600">Avertissements</div>
            <div className="text-xs text-yellow-600">
              {((warningCount / totalProcesses) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-gray-600">Erreurs</div>
            <div className="text-xs text-red-600">
              {((errorCount / totalProcesses) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{avgAccuracy.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Précision moyenne</div>
            <div className="text-xs text-blue-600">
              {avgDuration.toFixed(1)}s durée moy.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journal de diagnostic */}
      <Card>
        <CardHeader>
          <CardTitle>Journal de Diagnostic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedDiagnostics.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(entry.status)}
                    <div>
                      <div className="font-medium">{entry.message}</div>
                      <div className="text-sm text-gray-600">{entry.component}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(entry.status)}>
                      {entry.status === 'success' ? 'Succès' : 
                       entry.status === 'warning' ? 'Attention' : 'Erreur'}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {entry.timestamp}
                    </div>
                  </div>
                </div>
                
                {entry.details && (
                  <div className="text-sm text-gray-600 mb-3 ml-7">
                    {entry.details}
                  </div>
                )}
                
                <div className="flex items-center gap-6 ml-7 text-xs text-gray-500">
                  {entry.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.duration}s
                    </span>
                  )}
                  {entry.accuracy !== undefined && (
                    <span className="flex items-center gap-1">
                      {getAccuracyTrend(entry.accuracy)}
                      {entry.accuracy.toFixed(1)}% précision
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
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
        </CardContent>
      </Card>
    </div>
  );
}