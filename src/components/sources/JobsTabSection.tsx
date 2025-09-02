import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Eye,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const JobsTabSection = () => {
  const jobs = [
    {
      id: 1,
      name: "Synchronisation Journal Officiel",
      type: "sync",
      status: "running",
      progress: 67,
      startTime: "2025-01-19 14:30:00",
      duration: "00:05:23",
      source: "Journal Officiel RADP",
      documentsProcessed: 145,
      totalDocuments: 216,
      errors: 0
    },
    {
      id: 2,
      name: "Import base de données locale",
      type: "import",
      status: "completed",
      progress: 100,
      startTime: "2025-01-19 13:15:00",
      duration: "00:12:45",
      source: "Fichier local",
      documentsProcessed: 892,
      totalDocuments: 892,
      errors: 3
    },
    {
      id: 3,
      name: "Export vers base locale",
      type: "export",
      status: "pending",
      progress: 0,
      startTime: null,
      duration: null,
      source: "Base externe",
      documentsProcessed: 0,
      totalDocuments: 1456,
      errors: 0
    },
    {
      id: 4,
      name: "Collecte Ministère Justice",
      type: "collection",
      status: "failed",
      progress: 23,
      startTime: "2025-01-19 12:00:00",
      duration: "00:02:15",
      source: "mjustice.dz",
      documentsProcessed: 34,
      totalDocuments: 150,
      errors: 15
    },
    {
      id: 5,
      name: "Nettoyage données orphelines",
      type: "cleanup",
      status: "scheduled",
      progress: 0,
      startTime: null,
      duration: null,
      source: "Base interne",
      documentsProcessed: 0,
      totalDocuments: 0,
      errors: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'scheduled': return <Clock className="w-4 h-4 text-purple-600" />;
      default: return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sync': return <RefreshCw className="w-4 h-4" />;
      case 'import': return <Upload className="w-4 h-4" />;
      case 'export': return <Download className="w-4 h-4" />;
      case 'collection': return <RefreshCw className="w-4 h-4" />;
      case 'cleanup': return <Settings className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'En cours';
      case 'completed': return 'Terminé';
      case 'failed': return 'Échec';
      case 'pending': return 'En attente';
      case 'scheduled': return 'Planifié';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tâches et Jobs</h2>
          <p className="text-gray-600 mt-1">Surveillance et gestion des tâches de traitement des données</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
          <Button className="gap-2">
            <PlayCircle className="w-4 h-4" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">En cours</p>
                <p className="text-xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-600">En attente</p>
                <p className="text-xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Terminés</p>
                <p className="text-xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Échecs</p>
                <p className="text-xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Erreurs</p>
                <p className="text-xl font-bold">18</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-blue-600" />
            Liste des Tâches
          </CardTitle>
          <CardDescription>
            Suivi en temps réel de toutes les tâches de traitement et synchronisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(job.type)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{job.name}</h3>
                      <p className="text-sm text-gray-600">{job.source}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <Badge className={getStatusColor(job.status)}>
                        {getStatusText(job.status)}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {job.status === 'running' && (
                        <Button variant="ghost" size="sm">
                          <PauseCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {(job.status === 'failed' || job.status === 'completed') && (
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Début:</span>
                    <p className="font-medium">
                      {job.startTime ? new Date(job.startTime).toLocaleString('fr-FR') : 'Non démarré'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Durée:</span>
                    <p className="font-medium">{job.duration || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Documents:</span>
                    <p className="font-medium">{job.documentsProcessed} / {job.totalDocuments}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Erreurs:</span>
                    <p className={`font-medium ${job.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {job.errors}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                {job.status === 'running' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progression</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                  </div>
                )}

                {job.status === 'completed' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Terminé</span>
                      <span>100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};