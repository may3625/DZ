import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

interface MonthPoint { month: string; total: number }
interface SectorPoint { sector: string; total: number }
interface WilayaPoint { wilaya: string; total: number }

const colors = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
};

const TrendsCharts: React.FC = () => {
  const { toast } = useToast();
  const [months, setMonths] = useState<MonthPoint[]>([]);
  const [sectors, setSectors] = useState<SectorPoint[]>([]);
  const [wilayas, setWilayas] = useState<WilayaPoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [m, s, w] = await Promise.all([
        supabase.from('v_legal_texts_by_month').select('*'),
        supabase.from('v_legal_texts_by_sector').select('*'),
        supabase.from('v_legal_texts_by_wilaya').select('*')
      ]);

      if (cancelled) return;

      if (!m.error && m.data?.length) {
        setMonths(m.data.map((row: any) => ({ 
          month: new Date(row.month).toLocaleDateString('fr-FR', { year: '2-digit', month: 'short' }), 
          total: Number(row.count ?? 0) 
        })));
      }
      if (!s.error && s.data?.length) {
        setSectors(s.data.map((row: any) => ({ sector: row.sector ?? 'Inconnu', total: Number(row.count ?? 0) })));
      }
      if (!w.error && w.data?.length) {
        const top = [...w.data]
          .map((row: any) => ({ wilaya: String(row.wilaya_name ?? row.wilaya ?? row.code), total: Number(row.total ?? row.count ?? 0) }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 8);
        setWilayas(top);
      }

      if ((m.error || !m.data?.length) || (s.error || !s.data?.length) || (w.error || !w.data?.length)) {
        toast({ title: 'Fallback activé', description: 'Vues SQL introuvables, affichage de tendances de démonstration.' });
        // Demo data
        const now = new Date();
        const demoMonths: MonthPoint[] = Array.from({ length: 12 }).map((_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
          const label = d.toLocaleDateString('fr-FR', { year: '2-digit', month: 'short' });
          return { month: label, total: Math.round(40 + 25 * Math.sin(i / 2) + (i % 3) * 8) };
        });
        setMonths(demoMonths);
        setSectors([
          { sector: 'Énergie', total: 48 },
          { sector: 'Transports', total: 35 },
          { sector: 'Santé', total: 29 },
          { sector: 'Finance', total: 22 },
          { sector: 'Éducation', total: 18 },
        ]);
        setWilayas([
          { wilaya: 'Alger', total: 64 },
          { wilaya: 'Oran', total: 42 },
          { wilaya: 'Tizi Ouzou', total: 31 },
          { wilaya: 'Constantine', total: 29 },
          { wilaya: 'Annaba', total: 26 },
          { wilaya: 'Blida', total: 24 },
          { wilaya: 'Sétif', total: 22 },
          { wilaya: 'Batna', total: 21 },
        ]);
      }
    })();
    return () => { cancelled = true; };
  }, [toast]);

  const sectorColors = useMemo(() => {
    const palette = [
      'hsl(var(--primary))',
      'hsl(var(--secondary))',
      'hsl(var(--accent))',
      'hsl(var(--primary) / 0.7)',
      'hsl(var(--secondary) / 0.7)'
    ];
    return sectors.map((_, i) => palette[i % palette.length]);
  }, [sectors]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={months} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" name="Textes / mois" stroke={colors.primary} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={wilayas} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="wilaya" tick={{ fill: 'hsl(var(--muted-foreground))' }} interval={0} angle={-20} height={60} textAnchor="end" />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" name="Top wilayas" fill={colors.accent} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[320px] lg:col-span-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={sectors} dataKey="total" nameKey="sector" outerRadius={110} innerRadius={48}>
              {sectors.map((_, i) => (
                <Cell key={`c-${i}`} fill={sectorColors[i]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendsCharts;
