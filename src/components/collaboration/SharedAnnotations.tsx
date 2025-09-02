import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAudit } from '@/utils/audit';

interface LegalText { id: string; title: string | null; content: string | null; }
interface AnnotationRow { id: string; range: any; note: string | null; visibility: 'private' | 'team' | 'public' | null; }

type Visibility = 'private' | 'team' | 'public';

function applyHighlights(content: string, annotations: { start: number; end: number }[]) {
  if (!content) return content;
  const sorted = [...annotations].sort((a, b) => a.start - b.start);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  sorted.forEach((a, idx) => {
    if (a.start > cursor) parts.push(<span key={`t-${idx}-pre`}>{content.slice(cursor, a.start)}</span>);
    parts.push(<mark key={`m-${idx}`} className="bg-yellow-200/60">{content.slice(a.start, a.end)}</mark>);
    cursor = a.end;
  });
  parts.push(<span key="tail">{content.slice(cursor)}</span>);
  return parts;
}

export function SharedAnnotations() {
  const { toast } = useToast();
  const [texts, setTexts] = useState<LegalText[]>([]);
  const [selected, setSelected] = useState<string | undefined>();
  const [content, setContent] = useState<string>('');
  const [annotations, setAnnotations] = useState<AnnotationRow[]>([]);
  const [note, setNote] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('legal_texts').select('id, title, content').limit(20);
      setTexts((data as any) || []);
      if (data && data.length > 0) setSelected(data[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      const { data: lt } = await supabase.from('legal_texts').select('content').eq('id', selected).maybeSingle();
      setContent(lt?.content || '');
      const { data: anns } = await supabase.from('annotations').select('*').eq('legal_text_id', selected).order('created_at', { ascending: true });
      setAnnotations((anns as any) || []);
    })();
  }, [selected]);

  const onSelect = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !containerRef.current) return;
    const range = sel.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) return;

    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(containerRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const selectedText = range.toString();
    const end = start + selectedText.length;
    if (selectedText.length > 0) {
      setSelectionRange({ start, end, text: selectedText });
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', onSelect);
    return () => document.removeEventListener('mouseup', onSelect);
  }, []);

  const saveAnnotation = async () => {
    if (!selected || !selectionRange) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error('Veuillez vous connecter');
      const { data, error } = await supabase
        .from('annotations')
        .insert({
          legal_text_id: selected,
          user_id: uid,
          range: selectionRange,
          note: note || null,
          visibility,
        })
        .select()
        .single();
      if (error) throw error;
      setAnnotations((prev) => [...prev, data as any]);
      setNote(''); setSelectionRange(null);
      await logAudit('create', 'annotation', (data as any).id, { legal_text_id: selected, range: selectionRange });
      toast({ title: 'Annotation enregistrée' });
    } catch (e: any) {
      toast({ title: e.message || 'Erreur', variant: 'destructive' });
    }
  };

  const highlightRanges = useMemo(() => annotations.map((a) => ({ start: (a as any).range?.start ?? 0, end: (a as any).range?.end ?? 0 })), [annotations]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Annotations partagées</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un texte légal" />
            </SelectTrigger>
            <SelectContent>
              {texts.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.title || t.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input placeholder="Note (optionnelle)" value={note} onChange={(e) => setNote(e.target.value)} />

          <Select value={visibility} onValueChange={(v) => setVisibility(v as Visibility)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Privé</SelectItem>
              <SelectItem value="team">Équipe</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded p-3 max-h-80 overflow-auto" ref={containerRef}>
          {applyHighlights(content, highlightRanges)}
        </div>

        <div className="flex items-center gap-2">
          <Button disabled={!selectionRange} onClick={saveAnnotation}>Enregistrer l’annotation</Button>
          {selectionRange && (
            <span className="text-xs text-muted-foreground">Sélection: “{selectionRange.text.slice(0, 40)}{selectionRange.text.length > 40 ? '…' : ''}”</span>
          )}
        </div>

        <div className="space-y-2">
          {annotations.map((a) => (
            <div key={(a as any).id} className="text-sm p-2 rounded border">
              <div className="font-medium">{(a as any).note || 'Annotation'}</div>
              <div className="text-xs text-muted-foreground">[{(a as any).range?.start}-{(a as any).range?.end}] — {(a as any).visibility}</div>
            </div>
          ))}
          {annotations.length === 0 && <div className="text-sm text-muted-foreground">Aucune annotation.</div>}
        </div>
      </CardContent>
    </Card>
  );
}
