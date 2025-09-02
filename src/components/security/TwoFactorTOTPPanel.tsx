import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { QrCode } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';

interface EnrolledFactor {
  id: string;
  factor_type: string;
  friendly_name?: string | null;
  status?: string;
}

export function TwoFactorTOTPPanel() {
  const [loading, setLoading] = useState(false);
  const [factors, setFactors] = useState<EnrolledFactor[]>([]);
  const [enrolling, setEnrolling] = useState<{ id: string; uri: string } | null>(null);
  const [code, setCode] = useState('');

  const refreshFactors = async () => {
    const { data, error } = await (supabase as any).auth.mfa.listFactors();
    if (error) {
      console.warn(error);
      return;
    }
    setFactors(data?.totp?.factors || data?.all || []);
  };

  useEffect(() => {
    refreshFactors();
  }, []);

  const handleEnroll = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any).auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      const totp = (data as any)?.totp ?? data;
      if (!totp) throw new Error('Aucune donnée TOTP retournée');
      setEnrolling({ id: data.id, uri: totp.uri || totp.qr_code || '' });
      toast.success("TOTP initialisé. Scannez le QR et entrez le code à 6 chiffres.");
    } catch (e: any) {
      toast.error(e?.message || 'Échec de l\'initialisation TOTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!enrolling?.id || !code) return;
    try {
      setLoading(true);
      const { error } = await (supabase as any).auth.mfa.verify({ factorId: enrolling.id, code });
      if (error) throw error;
      toast.success('2FA activée avec succès.');
      setEnrolling(null);
      setCode('');
      await refreshFactors();
    } catch (e: any) {
      toast.error(e?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const enrolled = factors.filter((f) => f.factor_type === 'totp');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentification à Deux Facteurs (TOTP)</CardTitle>
        <CardDescription>
          Ajoutez une couche de sécurité supplémentaire avec un code généré par une application d'authentification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {enrolled.length > 0 ? (
          <div className="flex items-center justify-between p-3 rounded-md border">
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800">Activée</Badge>
              <div className="text-sm text-muted-foreground">TOTP déjà configuré</div>
            </div>
            <Button variant="outline" onClick={refreshFactors}>Rafraîchir</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <QrCode className="w-4 h-4" />
              Scannez un QR code avec Google Authenticator, 1Password, Authy, etc.
            </div>
            {!enrolling ? (
              <Button onClick={handleEnroll} disabled={loading}>
                Activer la 2FA
              </Button>
            ) : (
              <div className="space-y-3">
                {enrolling.uri && (
                  <div className="flex flex-col items-center gap-2">
                    <QRCodeCanvas value={enrolling.uri} size={160} includeMargin />
                    <div className="text-xs break-all text-muted-foreground">{enrolling.uri}</div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Entrez le code à 6 chiffres"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                  />
                  <Button onClick={handleVerify} disabled={loading || code.length < 6}>
                    Vérifier
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
