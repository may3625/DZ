import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuditLogRow {
  id: string;
  created_at: string;
  actor_id: string | null;
  action: string;
  entity_type: 'thread' | 'post' | 'checklist' | 'checklist_item' | 'assignment' | 'annotation' | string;
  entity_id: string | null;
  diff: any;
  metadata: any;
}

const ENTITY_OPTIONS = ['thread','post','checklist','checklist_item','assignment','annotation'] as const;

export function AuditLogViewer() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [entity, setEntity] = useState<string>('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const run = async () => {
      let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
      if (entity && entity !== 'all') query = query.eq('entity_type', entity);
      if (from) query = query.gte('created_at', new Date(from).toISOString());
      if (to) {
        const end = new Date(to);
        end.setHours(23,59,59,999);
        query = query.lte('created_at', end.toISOString());
      }
      const { data, error } = await query;
      if (error) throw error;
      const filtered = (data as AuditLogRow[] || []).filter((row) => {
        if (!search.trim()) return true;
        const s = search.toLowerCase();
        return (
          row.action.toLowerCase().includes(s) ||
          row.entity_type.toLowerCase().includes(s) ||
          (row.entity_id || '').toLowerCase().includes(s)
        );
      });
      setLogs(filtered);
    };
    try {
      await run();
    } catch (e1: any) {
      // Retry once in case of transient network/CORS hiccups in sandbox
      try {
        await new Promise(r => setTimeout(r, 500));
        await run();
      } catch (e2: any) {
        console.error('Audit fetch failed', e2);
        const msg = e2?.message === 'Failed to fetch' ?
          "Connexion Supabase échouée. Vérifiez les autorisations CORS/RLS du projet et réessayez." :
          (e2?.message || 'Impossible de charger le journal');
        toast({ title: msg, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  }, [entity, from, to, search, toast]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const {
    currentData: paged,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({ data: logs, itemsPerPage: 5 });

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal d’audit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <Select value={entity} onValueChange={setEntity}>
            <SelectTrigger>
              <SelectValue placeholder="Type d’entité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {ENTITY_OPTIONS.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Input placeholder="Recherche (action, entité, id)" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button onClick={fetchLogs} disabled={loading}>{loading ? 'Chargement…' : 'Rafraîchir'}</Button>
        </div>

        <div className="space-y-2">
          {paged.map((row) => (
            <div key={row.id} className="p-3 border rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{row.action}</Badge>
                  <span className="text-sm">{row.entity_type}</span>
                  {row.entity_id && <Badge variant="outline">{row.entity_id.slice(0,8)}…</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</div>
              </div>
              {(row.diff || row.metadata) && (
                <div className="mt-2">
                  <Button size="sm" variant="outline" onClick={() => toggle(row.id)}>
                    {expanded[row.id] ? 'Masquer détails' : 'Voir détails'}
                  </Button>
                  {expanded[row.id] && (
                    <pre className="mt-2 text-xs overflow-auto max-h-60 bg-muted p-2 rounded">{JSON.stringify({ diff: row.diff, metadata: row.metadata }, null, 2)}</pre>
                  )}
                </div>
              )}
            </div>
          ))}
          {logs.length === 0 && <div className="text-sm text-muted-foreground">Aucun évènement d’audit.</div>}
        </div>

        {logs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </CardContent>
    </Card>
  );
}
