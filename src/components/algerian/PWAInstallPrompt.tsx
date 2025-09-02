import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Download, 
  X, 
  CheckCircle,
  Wifi,
  Database,
  Zap
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Afficher le prompt après un délai pour ne pas être intrusif
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('dalil-pwa-prompt-seen');
        if (!hasSeenPrompt) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('L\'utilisateur a accepté l\'installation');
      } else {
        console.log('L\'utilisateur a refusé l\'installation');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('dalil-pwa-prompt-seen', 'true');
  };

  if (isInstalled) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Dalil.dz installé</p>
              <p className="text-sm text-green-600">Application disponible sur votre appareil</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Card className="pwa-install-prompt border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Installer Dalil.dz
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-blue-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-blue-700">
          Installez Dalil.dz sur votre appareil pour un accès rapide et une expérience optimisée.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Wifi className="w-4 h-4" />
            <span>Fonctionne hors ligne</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Database className="w-4 h-4" />
            <span>Données locales</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Zap className="w-4 h-4" />
            <span>Démarrage rapide</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleInstallClick}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Installer l'application
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            className="border-blue-300 text-blue-600"
          >
            Plus tard
          </Button>
        </div>

        <div className="text-xs text-blue-600 space-y-1">
          <p><strong>Avantages de l'installation :</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Accès instantané depuis l'écran d'accueil</li>
            <li>Fonctionnement optimal hors ligne</li>
            <li>Notifications des nouvelles actualités juridiques</li>
            <li>Interface adaptée à votre appareil</li>
            <li>Données entièrement stockées localement</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}