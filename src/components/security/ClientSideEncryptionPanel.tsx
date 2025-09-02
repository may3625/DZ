import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { encryptString, decryptString, loadEncryptedLocal, saveEncryptedLocal } from '@/lib/security/simpleCrypto';
import { toast } from 'sonner';

export function ClientSideEncryptionPanel() {
  const [passphrase, setPassphrase] = useState('');
  const [note, setNote] = useState('');
  const [decrypted, setDecrypted] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  
  React.useEffect(() => {
    loadEncryptedLocal('privateNotes').then(setSaved);
  }, []);

  const handleSave = async () => {
    if (!passphrase) {
      toast.error('Entrez une phrase secrète.');
      return;
    }
    try {
      const encrypted = await encryptString(note, passphrase);
      await saveEncryptedLocal('privateNotes', encrypted);
      setSaved(encrypted);
      toast.success('Note privée chiffrée et stockée localement.');
    } catch (e: any) {
      toast.error(e?.message || 'Échec du chiffrement');
    }
  };

  const handleDecrypt = async () => {
    const payload = await loadEncryptedLocal('privateNotes');
    if (!payload) {
      toast.error('Aucune note chiffrée trouvée.');
      return;
    }
    if (!passphrase) {
      toast.error('Entrez votre phrase secrète.');
      return;
    }
    try {
      const plain = await decryptString(payload, passphrase);
      setDecrypted(plain);
      toast.success('Déchiffré.');
    } catch (e: any) {
      toast.error('Passphrase incorrecte ou données corrompues');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chiffrement côté client (AES‑GCM)</CardTitle>
        <CardDescription>
          Les données sensibles (préférences, notes privées) sont chiffrées localement. La clé est dérivée d'une passphrase.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <Badge variant="secondary">Local only</Badge>
        </div>
        <Input
          type="password"
          placeholder="Votre passphrase locale (ne sera pas stockée)"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
        />
        <Textarea
          rows={4}
          placeholder="Saisissez une note privée à chiffrer (ex: préférences sensibles)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={handleSave}>Chiffrer & Enregistrer</Button>
          <Button variant="outline" onClick={handleDecrypt}>Déchiffrer</Button>
        </div>
        {saved && (
          <div className="text-xs text-muted-foreground break-all">
            Données stockées (chiffrées): {saved}
          </div>
        )}
        {decrypted !== null && (
          <div className="p-3 rounded-md border text-sm bg-white">
            <strong>Déchiffré:</strong> {decrypted}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
