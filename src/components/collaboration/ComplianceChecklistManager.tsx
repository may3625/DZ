import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CheckCircle2, Plus } from 'lucide-react';
import { logAudit } from '@/utils/audit';

interface ChecklistRow {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  created_by: string;
}

interface ItemRow {
  id: string;
  checklist_id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
}

export function ComplianceChecklistManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ChecklistRow[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [due, setDue] = useState('');
  const [items, setItems] = useState<Record<string, ItemRow[]>>({});
  const [newItemTitle, setNewItemTitle] = useState<Record<string, string>>({});

  const loadLists = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;
    const { data, error } = await supabase
      .from('checklists')
      .select('*')
      .eq('created_by', uid)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn(error);
      return;
    }
    setList((data as any) || []);
    (data as any || []).forEach(async (c: ChecklistRow) => {
      const { data: it } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('checklist_id', c.id)
        .order('position', { ascending: true });
      setItems((prev) => ({ ...prev, [c.id]: (it as any) || [] }));
    });
  };

  useEffect(() => {
    loadLists();
  }, []);

  const createChecklist = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error('Veuillez vous connecter');
      const { data, error } = await supabase
        .from('checklists')
        .insert({ title: title.trim(), description: description || null, due_date: due || null, created_by: uid })
        .select()
        .single();
      if (error) throw error;
      setTitle(''); setDescription(''); setDue('');
      setList((prev) => [data as any, ...prev]);
      await logAudit('create', 'checklist', (data as any).id, { title: (data as any).title });
      toast({ title: 'Check-list créée' });
    } catch (e: any) {
      toast({ title: e.message || 'Erreur', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (checklistId: string) => {
    const t = newItemTitle[checklistId]?.trim();
    if (!t) return;
    const { data, error } = await supabase
      .from('checklist_items')
      .insert({ checklist_id: checklistId, title: t, status: 'pending' })
      .select()
      .single();
    if (error) {
      toast({ title: 'Ajout impossible', variant: 'destructive' });
      return;
    }
    setItems((prev) => ({ ...prev, [checklistId]: [...(prev[checklistId] || []), data as any] }));
    setNewItemTitle((prev) => ({ ...prev, [checklistId]: '' }));
    await logAudit('create', 'checklist_item', (data as any).id, { checklist_id: checklistId, title: t });
  };

  const toggleItem = async (item: ItemRow) => {
    const newStatus = item.status === 'pending' ? 'done' : 'pending';
    const { error } = await supabase
      .from('checklist_items')
      .update({ status: newStatus })
      .eq('id', item.id);
    if (error) {
      toast({ title: 'Mise à jour impossible', variant: 'destructive' });
      return;
    }
    setItems((prev) => ({
      ...prev,
      [item.checklist_id]: (prev[item.checklist_id] || []).map((it) => it.id === item.id ? { ...it, status: newStatus } : it),
    }));
    await logAudit('update', 'checklist_item', item.id, { status: newStatus });
  };

  const assignToMe = async (item: ItemRow) => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      toast({ title: 'Veuillez vous connecter', variant: 'destructive' });
      return;
    }
    const { error } = await supabase
      .from('assignments')
      .insert({ item_id: item.id, assignee_id: uid, status: 'assigned' });
    if (error) {
      toast({ title: 'Assignation impossible', variant: 'destructive' });
      return;
    }
    await logAudit('update', 'assignment', undefined, { item_id: item.id, assignee_id: uid });
    toast({ title: 'Assigné à vous' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check-lists conformité</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          <Button onClick={createChecklist} disabled={loading || !title.trim()}>
            <Plus className="w-4 h-4 mr-1" /> Créer
          </Button>
        </div>
        <Textarea placeholder="Description (optionnel)" value={description} onChange={(e) => setDescription(e.target.value)} />

        <div className="space-y-4">
          {list.map((c) => (
            <div key={c.id} className="border rounded-md p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Échéance: {c.due_date ? new Date(c.due_date).toLocaleDateString() : '—'}
                  </div>
                </div>
                <Badge variant={c.status === 'open' ? 'secondary' : 'default'}>{c.status}</Badge>
              </div>

              <div className="mt-3 space-y-2">
                {(items[c.id] || []).map((it) => (
                  <div key={it.id} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <div className="font-medium">{it.title}</div>
                      {it.description && <div className="text-sm text-muted-foreground">{it.description}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleItem(it)}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> {it.status === 'pending' ? 'Terminer' : 'Rouvrir'}
                      </Button>
                      <Button size="sm" onClick={() => assignToMe(it)}>M’assigner</Button>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Input placeholder="Nouvelle tâche" value={newItemTitle[c.id] || ''} onChange={(e) => setNewItemTitle((prev) => ({ ...prev, [c.id]: e.target.value }))} />
                  <Button variant="secondary" onClick={() => addItem(c.id)}>Ajouter</Button>
                </div>
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="text-sm text-muted-foreground">Aucune check-list pour le moment.</div>}
        </div>
      </CardContent>
    </Card>
  );
}
