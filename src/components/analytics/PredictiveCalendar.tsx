import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
// import { DayPicker } from 'react-day-picker';
// import 'react-day-picker/dist/style.css';

// Temporary placeholder for DayPicker
const DayPicker = ({ mode, month, onMonthChange, modifiers, modifiersClassNames }: any) => (
  <div className="p-4 border rounded">
    <p className="text-sm text-muted-foreground">Calendar temporarily disabled</p>
    <p className="text-xs mt-2">Month: {month?.toLocaleDateString()}</p>
  </div>
);

interface EventItem { date: Date; label: string; textId: string }

const deadlineRegex = /(dans\s+un\s+d[ée]lai\s+de\s+)(\d+)\s*(jours?|mois|ann[ée]es?)/i;

const PredictiveCalendar: React.FC = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [month, setMonth] = useState<Date>(new Date());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from('legal_texts')
        .select('id, title, content, date, created_at')
        .order('date', { ascending: false })
        .limit(50);
      if (!cancelled && data && !error) {
        const ev: EventItem[] = [];
        data.forEach((row: any) => {
          const m = (row.content || '').match(deadlineRegex);
          if (m) {
            const qty = parseInt(m[2], 10);
            const unit = m[3].toLowerCase();
            const base = row.date ? new Date(row.date) : (row.created_at ? new Date(row.created_at) : new Date());
            const d = new Date(base);
            if (unit.startsWith('jour')) d.setDate(d.getDate() + qty);
            else if (unit.startsWith('mois')) d.setMonth(d.getMonth() + qty);
            else d.setFullYear(d.getFullYear() + qty);
            ev.push({ date: d, label: row.title ?? `Échéance (${qty} ${unit})`, textId: row.id });
          }
        });
        setEvents(ev);
        if (ev.length === 0) toast({ title: 'Aucune échéance détectée', description: 'Aucun motif “dans un délai de …” trouvé dans les 50 derniers textes.' });
      }
      if (!data || error) {
        toast({ title: 'Fallback activé', description: 'Affichage d’échéances de démonstration.' });
        const base = new Date();
        setEvents([
          { date: new Date(base.getFullYear(), base.getMonth(), base.getDate() + 7), label: 'Délais de 7 jours', textId: 'demo-1' },
          { date: new Date(base.getFullYear(), base.getMonth(), base.getDate() + 30), label: 'Délais de 30 jours', textId: 'demo-2' },
        ]);
      }
    })();
    return () => { cancelled = true; };
  }, [toast]);

  const modifiers = useMemo(() => ({
    events: events.map(e => e.date)
  }), [events]);

  const footer = (
    <ul className="text-sm text-muted-foreground list-disc pl-6">
      {events.slice(0, 6).map((e, i) => (
        <li key={i}>{e.label} — {e.date.toLocaleDateString('fr-FR')}</li>
      ))}
      {events.length === 0 && <li>Aucune échéance prédictive disponible</li>}
    </ul>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <DayPicker
        mode="single"
        month={month}
        onMonthChange={setMonth}
        modifiers={modifiers}
        modifiersClassNames={{ events: 'bg-primary text-primary-foreground rounded-full' }}
      />
      <div className="flex-1">
        <h4 className="font-medium mb-2">Échéances détectées</h4>
        {footer}
      </div>
    </div>
  );
};

export default PredictiveCalendar;
