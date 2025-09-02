import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CSPError {
  type: 'connect-src' | 'script-src' | 'style-src' | 'other';
  message: string;
  url?: string;
  timestamp: Date;
}

export function CSPErrorHandler() {
  const [errors, setErrors] = useState<CSPError[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    // Écouter les erreurs CSP
    const handleCSPError = (event: SecurityPolicyViolationEvent) => {
      const error: CSPError = {
        type: 'other',
        message: `CSP violation: ${event.violatedDirective}`,
        url: event.blockedURI || undefined,
        timestamp: new Date()
      };

      // Déterminer le type d'erreur
      if (event.violatedDirective === 'connect-src') {
        error.type = 'connect-src';
        error.message = `Connexion bloquée par CSP: ${event.blockedURI}`;
      } else if (event.violatedDirective === 'script-src') {
        error.type = 'script-src';
        error.message = `Script bloqué par CSP: ${event.blockedURI}`;
      } else if (event.violatedDirective === 'style-src') {
        error.type = 'style-src';
        error.message = `Style bloqué par CSP: ${event.blockedURI}`;
      }

      setErrors(prev => [...prev, error]);
      
      // Afficher automatiquement les erreurs importantes
      if (error.type === 'connect-src' && error.url?.includes('localhost')) {
        setShowErrors(true);
      }
    };

    // Écouter les erreurs de WebSocket
    const handleWebSocketError = (event: Event) => {
      const error: CSPError = {
        type: 'connect-src',
        message: 'Erreur de connexion WebSocket',
        timestamp: new Date()
      };
      
      setErrors(prev => [...prev, error]);
      setShowErrors(true);
    };

    // Écouter les erreurs de préchargement
    const handlePreloadError = (event: Event) => {
      const target = event.target as HTMLLinkElement;
      if (target && target.rel === 'preload') {
        const error: CSPError = {
          type: 'other',
          message: `Ressource préchargée non utilisée: ${target.href}`,
          url: target.href,
          timestamp: new Date()
        };
        
        setErrors(prev => [...prev, error]);
      }
    };

    // Ajouter les écouteurs d'événements
    document.addEventListener('securitypolicyviolation', handleCSPError);
    document.addEventListener('error', handlePreloadError, true);
    
    // Écouter les erreurs de WebSocket
    if (typeof WebSocket !== 'undefined') {
      const OriginalWebSocket = WebSocket;
      window.WebSocket = function(url, protocols) {
        const ws = new OriginalWebSocket(url, protocols);
        ws.addEventListener('error', handleWebSocketError);
        return ws;
      } as any;
      (window.WebSocket as any).prototype = OriginalWebSocket.prototype;
    }

    return () => {
      document.removeEventListener('securitypolicyviolation', handleCSPError);
      document.removeEventListener('error', handlePreloadError, true);
    };
  }, []);

  const clearErrors = () => {
    setErrors([]);
    setShowErrors(false);
  };

  const retryConnection = () => {
    // Tenter de reconnecter les WebSockets
    window.location.reload();
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowErrors(!showErrors)}
        className="mb-2"
      >
        <AlertTriangle className="w-4 h-4 mr-2" />
        Erreurs CSP ({errors.length})
      </Button>

      {showErrors && (
        <div className="space-y-2">
          {errors.slice(-5).map((error, index) => (
            <Alert key={index} variant="destructive" className="text-xs">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <div className="font-medium">{error.message}</div>
                {error.url && (
                  <div className="text-xs opacity-75 mt-1 break-all">
                    URL: {error.url}
                  </div>
                )}
                <div className="text-xs opacity-50 mt-1">
                  {error.timestamp.toLocaleTimeString()}
                </div>
              </AlertDescription>
            </Alert>
          ))}
          
          <div className="flex gap-2">
            <Button size="sm" onClick={retryConnection} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
            <Button size="sm" onClick={clearErrors} variant="outline">
              Effacer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}