import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// jsQR sera chargé dynamiquement lors de l'analyse pour éviter les erreurs de bundling

interface QRScannerProps {
  onDetected: (text: string) => void;
  onClose: () => void;
}

export function QRScanner({ onDetected, onClose }: QRScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    try {
      const img = new Image();
      img.onload = async () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const mod = await import('jsqr');
        const jsQRFn: any = (mod as any).default ?? (mod as any);
        const code = jsQRFn(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          onDetected(code.data);
        } else {
          setError("QR non détecté. Essayez une image plus nette.");
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
        setError("Impossible de lire l'image.");
      };
      img.src = URL.createObjectURL(file);
    } catch (e: any) {
      setIsProcessing(false);
      setError(e?.message || 'Erreur inattendue');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Scanner un QR</h3>
          <Button variant="ghost" onClick={onClose}>Fermer</Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Astuce: pointez la caméra sur le QR ou importez une photo. Sur mobile, utilisez l'appareil photo intégré.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          {isProcessing && (
            <Badge variant="secondary">Analyse en cours…</Badge>
          )}

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              Importer une image
            </Button>
            <Button onClick={onClose}>Terminer</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
