import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  open: boolean;
  onClose: () => void;
  wilaya: { code: string; name: string; arName?: string } | null;
}

interface AnyRow {
  [key: string]: any;
}

const pickTitle = (row: AnyRow) => row.title || row.name || row.subject || row.reference || `Texte ${row.id ?? ''}`;
const pickDate = (row: AnyRow) => row.published_at || row.date || row.created_at || row.updated_at || null;

const WilayaTextsModal: React.FC<Props> = ({ open, onClose, wilaya }) => {
  const [items, setItems] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!open || !wilaya?.code) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch legal texts by wilaya_code
        const { data, error } = await supabase
          .from('legal_texts')
          .select('*')
          .eq('wilaya_code', wilaya.code)
          .order('date', { ascending: false })
          .limit(50);
        if (error) throw error;
        if (!cancelled) setItems(data || []);
      } catch (e: any) {
        if (!cancelled) {
          setError('Aucune donnée précise trouvée pour cette wilaya. Affichage de base.');
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [open, wilaya?.code]);

  if (!open || !wilaya) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-lg border bg-background shadow-lg">
        <header className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-foreground">
            {wilaya.name}{wilaya.arName ? ` • ${wilaya.arName}` : ''}
          </h2>
          <button
            className="text-sm px-2 py-1 rounded bg-muted text-foreground hover:opacity-90"
            onClick={onClose}
          >
            Fermer
          </button>
        </header>
        <main className="p-4 overflow-auto">
          {loading && <p className="text-sm text-muted-foreground">Chargement…</p>}
          {!loading && error && (
            <p className="text-sm text-muted-foreground">{error}</p>
          )}
          {!loading && !error && items.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun texte trouvé pour cette wilaya.</p>
          )}
          {!loading && items.length > 0 && (
            <ul className="space-y-3">
              {items.map((row) => (
                <li key={row.id ?? Math.random()} className="p-3 rounded border hover:bg-muted/50 transition">
                  <div className="text-foreground font-medium">{pickTitle(row)}</div>
                  <div className="text-xs text-muted-foreground">
                    {pickDate(row) ? new Date(pickDate(row)).toLocaleDateString() : 'Sans date'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
};

export default WilayaTextsModal;
