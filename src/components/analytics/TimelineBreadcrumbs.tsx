import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface VersionRow { id: string; legal_text_id: string; version_number?: number; created_at?: string; effective_date?: string; title?: string }
interface TextRow { id: string; title?: string; contradiction_group_id?: string | number; references?: string[] | null }

const TimelineBreadcrumbs: React.FC = () => {
  const { toast } = useToast();
  const [textId, setTextId] = useState<string>('');
  const [currentText, setCurrentText] = useState<TextRow | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [related, setRelated] = useState<TextRow[]>([]);

  const loadData = async (id: string) => {
    if (!id) return;
    try {
      const { data: textData, error: textErr } = await supabase.from('legal_texts').select('*').eq('id', id).single();
      if (!textErr && textData) setCurrentText(textData as any);

      const { data: vers, error: verErr } = await supabase.from('legal_text_versions')
        .select('*').eq('legal_text_id', id).order('version_number', { ascending: true });
      if (!verErr && vers) setVersions(vers as any);

      // Breadcrumbs by contradiction group  
      const contradictionGroupId = (textData as any)?.contradiction_group_id;
      if (contradictionGroupId) {
        try {
          const { data } = await (supabase as any).from('legal_texts')
            .select('id, title').eq('contradiction_group_id', contradictionGroupId).neq('id', id);
          if (data) {
            const relatedTexts: TextRow[] = data.map((item: any) => ({
              id: item.id,
              title: item.title
            }));
            setRelated(relatedTexts);
          } else {
            setRelated([]);
          }
        } catch {
          setRelated([]);
        }
      } else {
        setRelated([]);
      }
    } catch {
      // Fallback demo
      toast({ title: 'Fallback activé', description: 'Tables manquantes, affichage avec données de démonstration.' });
      setCurrentText({ id, title: `Texte ${id}`, contradiction_group_id: 'G-42', references: ['T-101', 'T-202'] });
      setVersions([
        { id: 'v1', legal_text_id: id, version_number: 1, created_at: '2023-05-01', title: 'Version initiale' },
        { id: 'v2', legal_text_id: id, version_number: 2, created_at: '2024-01-10', title: 'Amendements' },
        { id: 'v3', legal_text_id: id, version_number: 3, created_at: '2024-11-22', title: 'Révision' },
      ]);
      setRelated([{ id: 'T-101', title: 'Texte contradictoire A' }, { id: 'T-202', title: 'Texte contradictoire B' }]);
    }
  };

  useEffect(() => {
    // Optionally preload a known ID if exists
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Input placeholder="ID du texte (UUID)" value={textId} onChange={(e) => setTextId(e.target.value)} className="max-w-xs" />
        <Button onClick={() => loadData(textId)}>Charger</Button>
      </div>

      {currentText && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{currentText.title ?? `Texte ${currentText.id}`}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Groupe de contradiction:</span>
            <Badge variant="secondary">{String(currentText.contradiction_group_id ?? 'N/A')}</Badge>
          </div>

          {related.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {related.map((t) => (
                <Badge key={t.id} onClick={() => loadData(t.id)} className="cursor-pointer" title="Voir la timeline">
                  {t.title ?? t.id}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <ol className="relative border-s ps-5">
          {versions.map((v, idx) => (
            <li key={v.id} className="mb-6 ms-4">
              <div className="absolute w-3 h-3 bg-primary rounded-full mt-1.5 -start-1.5 border border-background" />
              <time className="mb-1 text-sm text-muted-foreground">{v.effective_date ?? v.created_at ?? '—'}</time>
              <h4 className="text-base font-medium">Version {v.version_number ?? idx + 1} — {v.title ?? 'Mise à jour'}</h4>
            </li>
          ))}
          {versions.length === 0 && <p className="text-muted-foreground">Aucune version chargée.</p>}
        </ol>
      </div>
    </div>
  );
};

export default TimelineBreadcrumbs;
