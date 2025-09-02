
// @ts-nocheck
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { securityEnhancements } from '@/utils/securityEnhancements';

function isLocalOnly(): boolean {
  try {
    return (localStorage.getItem('LOCAL_ONLY') === 'true');
  } catch { return false; }
}

function isExternal(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    const h = u.hostname;
    const isLocal = h === 'localhost' || h === '127.0.0.1' || h === '::1' || h.endsWith('.lan') || /^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(h);
    return !isLocal;
  } catch { return true; }
}

export function EnhancedSecurityProvider({ children }: { children: React.ReactNode }) {
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    // Initialize security hooks (fetch/WebSocket guards, resource scan, performance monitoring)
    try { securityEnhancements.monitorPerformance(); } catch (e) {
      // ignore monitoring init errors
      console.warn('security monitor init failed', e);
    }

    // No more warning about external URL when LOCAL_ONLY is active
    // The user will control this through the dedicated Supabase Mode Control component
  }, []);

  const banner = useMemo(() => (
    warning ? (
      <div className="sticky top-0 z-50">
        <Alert variant="destructive" className="rounded-none">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      </div>
    ) : null
  ), [warning]);

  return (
    <>
      {banner}
      {children}
    </>
  );
}
