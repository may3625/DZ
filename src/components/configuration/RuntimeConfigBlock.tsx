import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Database } from 'lucide-react';

export function RuntimeConfigBlock() {
  const [localOnly, setLocalOnly] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');

  useEffect(() => {
    try {
      setLocalOnly(localStorage.getItem('LOCAL_ONLY') === 'true');
      setSupabaseUrl(localStorage.getItem('SUPABASE_URL') || '');
      setSupabaseAnonKey(localStorage.getItem('SUPABASE_ANON_KEY') || '');
    } catch (error) {
      console.warn('Failed to load runtime configuration from localStorage:', error);
    }
  }, []);

  const save = () => {
    try {
      localStorage.setItem('LOCAL_ONLY', localOnly ? 'true' : 'false');
      if (supabaseUrl) localStorage.setItem('SUPABASE_URL', supabaseUrl);
      if (supabaseAnonKey) localStorage.setItem('SUPABASE_ANON_KEY', supabaseAnonKey);
      alert('Configuration enregistrée. Recharger la page pour appliquer.');
    } catch {
      alert('Impossible de sauvegarder la configuration');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-teal-600" />
          <CardTitle>Configuration Runtime (local-only & Supabase)</CardTitle>
        </div>
        <CardDescription>Basculer le mode local-only et définir l'URL/clé Supabase à chaud (stockage local).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm block mb-1">Mode Local-only</label>
          <Button variant={localOnly ? 'default' : 'outline'} onClick={() => setLocalOnly(v => !v)}>
            {localOnly ? 'Activé' : 'Désactivé'}
          </Button>
        </div>
        <div>
          <label className="text-sm block mb-1">SUPABASE_URL</label>
          <Input value={supabaseUrl} onChange={e => setSupabaseUrl(e.target.value)} placeholder="http://localhost:54321 (dev) ou https://xxxxx.supabase.co" />
        </div>
        <div>
          <label className="text-sm block mb-1">SUPABASE_ANON_KEY</label>
          <Input value={supabaseAnonKey} onChange={e => setSupabaseAnonKey(e.target.value)} type="password" placeholder="clé anon (optionnel si en local)" />
        </div>
        <div className="pt-2">
          <Button onClick={save}>Enregistrer</Button>
        </div>
      </CardContent>
    </Card>
  );
}