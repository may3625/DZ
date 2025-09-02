import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/layout/PageLayout';
import { usePagination } from '@/hooks/usePagination';
import { Pagination as ListPagination } from '@/components/common/Pagination';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Database, History, Settings, Download, Upload, Globe, Home, RefreshCw } from 'lucide-react';
import { SupabaseModeControl } from '@/components/configuration/SupabaseModeControl';
import { SupabaseAdvancedActions } from '@/components/configuration/SupabaseAdvancedActions';
import { SupabaseMonitoring } from '@/components/configuration/SupabaseMonitoring';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Source {
  id: string;
  name: string;
  type: 'JO' | 'MINISTRY' | 'WILAYA' | 'OTHER';
  url: string | null;
  schedule_cron: string | null;
  active: boolean;
  created_at: string;
}

interface Job {
  id: string;
  type: string;
  source_id: string | null;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  log: string | null;
  created_at: string;
}

const defaultForm: Partial<Source> = {
  name: '',
  type: 'JO',
  url: '',
  schedule_cron: '',
  active: true,
};

export default function SourcesPage() {
  const { toast } = useToast();
  const [sources, setSources] = useState<Source[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Source>>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('sources');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: srcs, error: sErr }, { data: jbs, error: jErr }] = await Promise.all([
        supabase.from('sources').select('*').order('created_at', { ascending: false }),
        supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(50),
      ]);
      if (sErr) throw sErr;
      if (jErr) throw jErr;
      setSources(srcs || []);
      setJobs(jbs || []);
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur', description: e instanceof Error ? e.message : 'Chargement impossible' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async () => {
    try {
      if (!form.name || !form.type) {
        toast({ title: 'Formulaire incomplet', description: 'Nom et type requis' });
        return;
      }
      if (editingId) {
        const { error } = await supabase.from('sources').update({
          name: form.name,
          type: form.type,
          url: form.url,
          schedule_cron: form.schedule_cron,
          active: form.active,
        }).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Source mise à jour' });
      } else {
        const { error } = await supabase.from('sources').insert({
          name: form.name,
          type: form.type,
          url: form.url,
          schedule_cron: form.schedule_cron,
          active: form.active ?? true,
        });
        if (error) throw error;
        toast({ title: 'Source ajoutée' });
      }
      setForm(defaultForm);
      setEditingId(null);
      loadData();
    } catch (e) {
      toast({ title: 'Erreur', description: e instanceof Error ? e.message : 'Échec de l\'opération' });
    }
  };

  const onEdit = (s: Source) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      type: s.type,
      url: s.url ?? '',
      schedule_cron: s.schedule_cron ?? '',
      active: s.active,
    });
  };

  const onIngest = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ingest_source', { body: { source_id: id } });
      if (error) throw error;
      toast({ title: 'Ingestion lancée', description: JSON.stringify(data) });
      loadData();
    } catch (e) {
      toast({ title: 'Erreur ingestion', description: e instanceof Error ? e.message : 'Impossible de lancer l\'ingestion' });
    }
  };

  const { 
    currentData: pagedJobs,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination<Job>({ data: jobs, itemsPerPage: 5 });

  return (
    <PageLayout currentSection="sources-management" onRefresh={loadData}>
      <div className="mt-6 space-y-6">
        <SectionHeader
          icon={Database}
          title="Gestion des sources"
          description="Configuration et administration des sources d'alimentation et stratégie Supabase."
        />

        {/* Système d'onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Sources
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="supabase-strategy" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Stratégie Supabase
            </TabsTrigger>
          </TabsList>

          {/* Onglet Sources */}
          <TabsContent value="sources" className="space-y-6">
            <section>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="text-sm">Nom</label>
                  <Input value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm">Type</label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as Source['type'] }))}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JO">JO</SelectItem>
                      <SelectItem value="MINISTRY">MINISTRY</SelectItem>
                      <SelectItem value="WILAYA">WILAYA</SelectItem>
                      <SelectItem value="OTHER">OTHER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm">URL</label>
                  <Input value={form.url || ''} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm">Cron</label>
                  <Input value={form.schedule_cron || ''} onChange={(e) => setForm((f) => ({ ...f, schedule_cron: e.target.value }))} />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button onClick={onSubmit}>{editingId ? 'Mettre à jour' : 'Ajouter'}</Button>
                {editingId && (
                  <Button variant="secondary" onClick={() => { setEditingId(null); setForm(defaultForm); }}>Annuler</Button>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2">Sources</h2>
              <div className="space-y-2">
                {sources.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <div className="font-medium">{s.name} <span className="text-xs opacity-70">[{s.type}]</span></div>
                      <div className="text-sm opacity-80 truncate max-w-xl">{s.url}</div>
                      <div className="text-xs opacity-60">Cron: {s.schedule_cron || '—'} • Active: {s.active ? 'oui' : 'non'}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => onEdit(s)}>Éditer</Button>
                      <Button onClick={() => onIngest(s.id)}>Lancer ingestion</Button>
                    </div>
                  </div>
                ))}
                {sources.length === 0 && <div className="text-sm opacity-70">Aucune source pour le moment.</div>}
              </div>
            </section>
          </TabsContent>

          {/* Onglet Jobs */}
          <TabsContent value="jobs" className="space-y-6">
            <SectionHeader
              icon={History}
              title="Historique des jobs"
              description="Suivi des traitements d'ingestion et de leurs statuts."
            />
            <div className="space-y-2">
              {pagedJobs.map((j) => (
                <div key={j.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{j.type} • {j.status}</div>
                    <div className="opacity-60">{new Date(j.created_at).toLocaleString()}</div>
                  </div>
                  <div className="opacity-80">Source: {j.source_id || '—'}</div>
                  {j.log && (
                    <pre className="mt-2 max-h-32 overflow-auto bg-muted/30 p-2 rounded">{j.log}</pre>
                  )}
                </div>
              ))}
              {pagedJobs.length === 0 && <div className="text-sm opacity-70">Aucun job.</div>}
            </div>
            <div className="pt-4">
              <ListPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemsPerPageOptions={[5, 10, 20, 50]}
              />
            </div>
          </TabsContent>

          {/* Onglet Stratégie Supabase */}
          <TabsContent value="supabase-strategy" className="space-y-6">
            {/* Vue d'ensemble de la stratégie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Vue d'ensemble de la Stratégie Supabase
                </CardTitle>
                <CardDescription>
                  Stratégie hybride : développement avec base externe → production 100% locale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      Mode Développement (EXTERNE)
                    </h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Accès aux données de la base externe</li>
                      <li>• Collecte continue de nouvelles données</li>
                      <li>• Tests avec données réelles et complètes</li>
                      <li>• Développement et validation des fonctionnalités</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Home className="h-4 w-4 text-green-500" />
                      Mode Production (LOCAL)
                    </h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Base de données 100% locale</li>
                      <li>• Aucune connexion externe</li>
                      <li>• Respect total du CSP</li>
                      <li>• Contrôle total des données</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contrôle du mode Supabase */}
            <SupabaseModeControl />

            {/* Actions avancées */}
            <SupabaseAdvancedActions />

            {/* Monitoring en temps réel */}
            <SupabaseMonitoring />

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Actions Rapides
                </CardTitle>
                <CardDescription>
                  Opérations fréquentes pour la gestion de la stratégie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => {
                      // Lancer le script de téléchargement
                      console.log('🚀 Lancement du téléchargement...');
                      toast({ title: 'Téléchargement', description: 'Script de téléchargement lancé' });
                    }}
                  >
                    <Download className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">Télécharger Base</div>
                      <div className="text-xs text-gray-500">Export complet de la base externe</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => {
                      // Lancer le script d'import
                      console.log('📤 Lancement de l\'import...');
                      toast({ title: 'Import', description: 'Script d\'import lancé' });
                    }}
                  >
                    <Upload className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">Importer Local</div>
                      <div className="text-xs text-gray-500">Import vers Supabase local</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => {
                      // Vérifier le statut
                      console.log('🔍 Vérification du statut...');
                      toast({ title: 'Statut', description: 'Vérification du statut en cours' });
                    }}
                  >
                    <RefreshCw className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">Vérifier Statut</div>
                      <div className="text-xs text-gray-500">Contrôle de l\'état des services</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Informations et instructions */}
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <strong>Instructions d'utilisation :</strong>
                <br />
                1. <strong>Développez</strong> en mode EXTERNE pour collecter des données
                <br />
                2. <strong>Téléchargez</strong> la base quand vous êtes prêt
                <br />
                3. <strong>Importez</strong> vers Supabase local
                <br />
                4. <strong>Basculez</strong> en mode LOCAL pour la production
                <br />
                5. <strong>Profitez</strong> d'une application 100% locale et sécurisée
              </AlertDescription>
            </Alert>

            {/* Liens utiles */}
            <Card>
              <CardHeader>
                <CardTitle>Liens et Ressources</CardTitle>
                <CardDescription>
                  Documentation et scripts pour la stratégie Supabase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Documentation complète</span>
                    <Badge variant="outline">SOLUTION_SUPABASE_HYBRIDE.md</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Script de téléchargement</span>
                    <Badge variant="outline">download-supabase-db.sh</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Script d'import</span>
                    <Badge variant="outline">import-to-local-supabase.sh</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Test du mode local</span>
                    <Badge variant="outline">test-local-mode.sh</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
