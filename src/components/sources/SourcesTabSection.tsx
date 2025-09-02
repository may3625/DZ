import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Globe, 
  CheckCircle, 
  XCircle, 
  Settings,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

export const SourcesTabSection = () => {
  const sources = [
    {
      id: 1,
      name: "Journal Officiel de la République Algérienne",
      url: "https://joradp.dz",
      status: "active",
      lastSync: "2025-01-19 14:30",
      documents: 1245,
      errors: 0,
      type: "RSS"
    },
    {
      id: 2,
      name: "Ministère de la Justice",
      url: "https://mjustice.dz",
      status: "active",
      lastSync: "2025-01-19 14:25",
      documents: 876,
      errors: 2,
      type: "Web Scraping"
    },
    {
      id: 3,
      name: "Conseil d'État",
      url: "https://conseildetat.dz",
      status: "inactive",
      lastSync: "2025-01-18 16:00",
      documents: 432,
      errors: 5,
      type: "API"
    },
    {
      id: 4,
      name: "Cour Suprême",
      url: "https://coursupreme.dz",
      status: "error",
      lastSync: "2025-01-19 12:00",
      documents: 298,
      errors: 12,
      type: "Web Scraping"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive': return <Pause className="w-4 h-4 text-gray-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sources de Données</h2>
          <p className="text-gray-600 mt-1">Gestion et surveillance des sources d'information juridique</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualiser tout
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Ajouter une source
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sources Totales</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sources Actives</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Documents Collectés</p>
                <p className="text-2xl font-bold text-gray-900">2,851</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Erreurs Détectées</p>
                <p className="text-2xl font-bold text-gray-900">19</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Liste des Sources
          </CardTitle>
          <CardDescription>
            Surveillance et gestion de toutes les sources d'information configurées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sources.map((source) => (
              <div key={source.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(source.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{source.name}</h3>
                        <Badge className={getStatusColor(source.status)}>
                          {source.status === 'active' ? 'Actif' : 
                           source.status === 'inactive' ? 'Inactif' : 'Erreur'}
                        </Badge>
                        <Badge variant="outline">{source.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{source.url}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Dernière sync:</span>
                          <p className="font-medium">{source.lastSync}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Documents:</span>
                          <p className="font-medium">{source.documents.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Erreurs:</span>
                          <p className={`font-medium ${source.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {source.errors}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      {source.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress bar for active sources */}
                {source.status === 'active' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progression de collecte</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
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