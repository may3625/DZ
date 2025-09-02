import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, PlusCircle, Wifi, WifiOff } from 'lucide-react';
import { logAudit } from '@/utils/audit';

interface Sector { id: string; name: string; }
interface ThreadRow { id: string; title: string; created_by: string; sector_id: string | null; created_at: string; }
interface PostRow { id?: string; thread_id: string; content: string; created_by: string; created_at?: string; offline_id?: string; }

export function SectorForums() {
  const { toast } = useToast();
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState<string | undefined>();
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('sectors').select('id, name').order('name');
      if (error) { console.warn(error); return; }
      setSectors((data as any) || []);
      if (data && data.length > 0) setSelectedSector(data[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!selectedSector) return;
    (async () => {
      const { data, error } = await supabase
        .from('threads')
        .select('*')
        .eq('sector_id', selectedSector)
        .order('created_at', { ascending: false });
      if (error) { console.warn(error); return; }
      setThreads((data as any) || []);
    })();
  }, [selectedSector]);

  const loadPosts = async (threadId: string) => {
    setActiveThreadId(threadId);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    if (error) { console.warn(error); return; }
    setPosts((data as any) || []);
  };

  const createThread = async () => {
    if (!newThreadTitle.trim() || !selectedSector) return;
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('Veuillez vous connecter.');

      const { data, error } = await supabase
        .from('threads')
        .insert({ title: newThreadTitle.trim(), created_by: userId, sector_id: selectedSector })
        .select()
        .single();
      if (error) throw error;
      setThreads((prev) => [data as any, ...prev]);
      setNewThreadTitle('');
      await logAudit('create', 'thread', (data as any).id, { title: (data as any).title, sector_id: (data as any).sector_id });
      toast({ title: 'Sujet créé' });
    } catch (e: any) {
      toast({ title: e.message || 'Création impossible', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.trim() || !activeThreadId) return;
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) { toast({ title: 'Veuillez vous connecter', variant: 'destructive' }); return; }

    const optimistic: PostRow = {
      thread_id: activeThreadId,
      content: newPost.trim(),
      created_by: userId,
      offline_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    setPosts((p) => [...p, optimistic]);
    setNewPost('');

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          thread_id: optimistic.thread_id,
          content: optimistic.content,
          created_by: userId,
          offline_id: optimistic.offline_id,
        })
        .select()
        .single();
      if (error) throw error;
      setPosts((cur) => cur.map((po) => (po.offline_id === optimistic.offline_id ? { ...po, id: (data as any).id } : po)));
      await logAudit('publish', 'post', (data as any).id, { thread_id: (data as any).thread_id });
    } catch (e) {
      toast({ title: 'Message enregistré hors-ligne', description: 'Il sera synchronisé quand la connexion reviendra.' });
    }
  };

  const offlineCount = useMemo(() => posts.filter((p) => !p.id).length, [posts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Espaces sectoriels</span>
          <div className="flex items-center gap-2 text-sm">
            {online ? (<><Wifi className="w-4 h-4" /> En ligne</>) : (<><WifiOff className="w-4 h-4" /> Hors-ligne</>)}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Secteur" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Input value={newThreadTitle} onChange={(e) => setNewThreadTitle(e.target.value)} placeholder="Nouveau sujet (titre)" />
              <Button onClick={createThread} disabled={loading || !newThreadTitle.trim()}>
                <PlusCircle className="w-4 h-4 mr-1" /> Créer
              </Button>
            </div>

            <div className="space-y-2">
              {threads.map((t) => (
                <div key={t.id} className={`p-2 rounded border cursor-pointer ${activeThreadId === t.id ? 'bg-muted' : ''}`} onClick={() => loadPosts(t.id)}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{t.title}</div>
                    <Badge variant="secondary">{new Date(t.created_at).toLocaleDateString()}</Badge>
                  </div>
                </div>
              ))}
              {threads.length === 0 && <div className="text-sm text-muted-foreground">Aucun sujet pour ce secteur.</div>}
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            {activeThreadId ? (
              <>
                <div className="flex gap-2">
                  <Textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Votre message..." rows={3} />
                  <Button onClick={createPost}>
                    <MessageSquare className="w-4 h-4 mr-1" /> Publier
                  </Button>
                </div>
                {offlineCount > 0 && (
                  <div className="text-xs text-muted-foreground">{offlineCount} message(s) en attente de synchronisation</div>
                )}
                <div className="space-y-2 max-h-96 overflow-auto">
                  {posts.map((p, idx) => (
                    <div key={p.id || p.offline_id || idx} className="p-3 rounded border">
                      <div className="text-sm whitespace-pre-wrap">{p.content}</div>
                      {!p.id && <Badge className="mt-2" variant="outline">Hors-ligne</Badge>}
                    </div>
                  ))}
                  {posts.length === 0 && <div className="text-sm text-muted-foreground">Aucun message.</div>}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Sélectionnez un sujet pour afficher les messages.</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
