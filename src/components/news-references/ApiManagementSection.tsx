import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  Settings, 
  RefreshCw, 
  Play, 
  Pause, 
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiData {
  id: string;
  name: string;
  url: string;
  method: string;
  description: string;
  authType: string;
  apiKey?: string;
  sections: string[];
  isActive: boolean;
  category: string;
  refreshInterval: number;
  createdAt: string;
  lastSync?: string;
}

interface ApiManagementSectionProps {
  sectionType: 'actualites' | 'references';
  title: string;
  description: string;
}

export function ApiManagementSection({ sectionType, title, description }: ApiManagementSectionProps) {
  const { toast } = useToast();
  const [apis, setApis] = useState<ApiData[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  // Charger les APIs depuis le localStorage
  useEffect(() => {
    const savedApis = localStorage.getItem('lovable_apis');
    if (savedApis) {
      const parsedApis = JSON.parse(savedApis);
      // Filtrer les APIs pour cette section
      const sectionApis = parsedApis.filter((api: ApiData) => 
        api.sections && api.sections.includes(sectionType)
      );
      setApis(sectionApis);
    }
  }, [sectionType]);

  // Sauvegarder les APIs dans le localStorage
  const saveApis = (newApis: ApiData[]) => {
    setApis(newApis);
    localStorage.setItem('lovable_apis', JSON.stringify(newApis));
  };

  const handleToggleApi = (apiId: string) => {
    const updatedApis = apis.map(api => 
      api.id === apiId ? { ...api, isActive: !api.isActive } : api
    );
    saveApis(updatedApis);
    
    const api = apis.find(a => a.id === apiId);
    toast({
      title: api?.isActive ? 'API désactivée' : 'API activée',
      description: `L'API "${api?.name}" a été ${api?.isActive ? 'désactivée' : 'activée'}`,
    });
  };

  const handleRefreshApi = async (apiId: string) => {
    setRefreshing(apiId);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedApis = apis.map(api => 
        api.id === apiId ? { 
          ...api, 
          lastSync: new Date().toLocaleString('fr-FR') 
        } : api
      );
      saveApis(updatedApis);
      
      const api = apis.find(a => a.id === apiId);
      toast({
        title: 'Données actualisées',
        description: `Les données de l'API "${api?.name}" ont été mises à jour`,
      });
    } catch (error) {
      toast({
        title: 'Erreur de synchronisation',
        description: 'Impossible de récupérer les données de l\'API',
        variant: 'destructive'
      });
    } finally {
      setRefreshing(null);
    }
  };

  const handleRefreshAll = async () => {
    setLoading(true);
    try {
      // Simuler la synchronisation de toutes les APIs actives
      const activeApis = apis.filter(api => api.isActive);
      
      for (const api of activeApis) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const updatedApis = apis.map(api => 
        api.isActive ? { 
          ...api, 
          lastSync: new Date().toLocaleString('fr-FR') 
        } : api
      );
      saveApis(updatedApis);
      
      toast({
        title: 'Synchronisation terminée',
        description: `${activeApis.length} API(s) synchronisée(s) avec succès`,
      });
    } catch (error) {
      toast({
        title: 'Erreur de synchronisation',
        description: 'Impossible de synchroniser toutes les APIs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle className="h-4 w-4" /> : <Pause className="h-4 w-4" />;
  };

  const formatRefreshInterval = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}j`;
  };

  if (apis.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune API configurée</h3>
            <p className="text-gray-500 mb-4">{description}</p>
            <Button variant="outline" onClick={() => window.location.href = '/configuration'}>
              <Settings className="h-4 w-4 mr-2" />
              Configurer des APIs
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeApis = apis.filter(api => api.isActive);
  const inactiveApis = apis.filter(api => !api.isActive);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {activeApis.length} actif(s)
            </Badge>
            <Button 
              onClick={handleRefreshAll} 
              disabled={loading || activeApis.length === 0}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Synchronisation...' : 'Tout actualiser'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* APIs actives */}
        {activeApis.length > 0 && (
          <div>
            <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              APIs actives ({activeApis.length})
            </h4>
            <div className="space-y-3">
              {activeApis.map((api) => (
                <div key={api.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-medium text-gray-900">{api.name}</h5>
                        <Badge variant="outline" className="text-xs">{api.category}</Badge>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Actif
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Endpoint:</span> {api.url}</p>
                        <p><span className="font-medium">Méthode:</span> {api.method}</p>
                        <p><span className="font-medium">Dernière sync:</span> {api.lastSync || 'Jamais'}</p>
                        <p><span className="font-medium">Intervalle:</span> {formatRefreshInterval(api.refreshInterval)}</p>
                        {api.description && (
                          <p className="text-xs text-gray-500 mt-1">{api.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefreshApi(api.id)}
                        disabled={refreshing === api.id}
                      >
                        <RefreshCw className={`h-4 w-4 ${refreshing === api.id ? 'animate-spin' : ''}`} />
                      </Button>
                      <Switch
                        checked={api.isActive}
                        onCheckedChange={() => handleToggleApi(api.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APIs inactives */}
        {inactiveApis.length > 0 && (
          <div>
            {activeApis.length > 0 && <Separator className="my-4" />}
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Pause className="h-4 w-4" />
              APIs inactives ({inactiveApis.length})
            </h4>
            <div className="space-y-3">
              {inactiveApis.map((api) => (
                <div key={api.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-medium text-gray-900">{api.name}</h5>
                        <Badge variant="outline" className="text-xs">{api.category}</Badge>
                        <Badge className="bg-gray-100 text-gray-800 text-xs">
                          Inactif
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Endpoint:</span> {api.url}</p>
                        <p><span className="font-medium">Méthode:</span> {api.method}</p>
                        <p><span className="font-medium">Dernière sync:</span> {api.lastSync || 'Jamais'}</p>
                        {api.description && (
                          <p className="text-xs text-gray-500 mt-1">{api.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        title="API inactive"
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={api.isActive}
                        onCheckedChange={() => handleToggleApi(api.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistiques */}
        <Separator className="my-4" />
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{apis.length}</div>
            <div className="text-sm text-gray-600">Total APIs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{activeApis.length}</div>
            <div className="text-sm text-gray-600">Actives</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">{inactiveApis.length}</div>
            <div className="text-sm text-gray-600">Inactives</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}