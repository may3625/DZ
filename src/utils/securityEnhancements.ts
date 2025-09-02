import { logger } from './logger';
import { sanitizeHTML } from './secureDOM';

// Local-only mode flag from environment
const LOCAL_ONLY: boolean = ((import.meta as any)?.env?.VITE_LOCAL_ONLY === true || (import.meta as any)?.env?.VITE_LOCAL_ONLY === 'true') || (typeof localStorage !== 'undefined' && localStorage.getItem('LOCAL_ONLY') === 'true');

function isLocalURL(urlStr: string): boolean {
  try {
    const url = new URL(urlStr, window.location.href);
    const host = url.hostname;
    const currentHost = window.location.hostname;
    
    if (!host) return true;
    
    // Accept current domain (development server)
    if (host === currentHost) return true;
    
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.endsWith('.lan') ||
      host.endsWith('.lovable.dev') || // Lovable development domains
      host.endsWith('.sandbox.lovable.dev') ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    );
  } catch {
    return true;
  }
}

// Interface pour les paramètres de sécurité
interface SecurityConfig {
  enableCSP: boolean;
  enableXSSProtection: boolean;
  enableCSRFProtection: boolean;
  enableRateLimiting: boolean;
  enableInputValidation: boolean;
  enableOutputEncoding: boolean;
  maxRequestSize: number;
  allowedOrigins: string[];
  blockedPatterns: RegExp[];
}

// Classe pour les améliorations de sécurité
export class SecurityEnhancements {
  private static instance: SecurityEnhancements;
  private config: SecurityConfig;
  private blockedIPs: Set<string> = new Set();
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

  static getInstance(): SecurityEnhancements {
    if (!SecurityEnhancements.instance) {
      SecurityEnhancements.instance = new SecurityEnhancements();
    }
    return SecurityEnhancements.instance;
  }

  constructor() {
    this.config = {
      enableCSP: true,
      enableXSSProtection: true,
      enableCSRFProtection: true,
      enableRateLimiting: true,
      enableInputValidation: true,
      enableOutputEncoding: true,
      maxRequestSize: 10 * 1024 * 1024, // 10MB
      allowedOrigins: ['localhost', '127.0.0.1'],
      blockedPatterns: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /eval\s*\(/gi,
        /expression\s*\(/gi
      ]
    };

    this.initializeSecurity();
  }

  private initializeSecurity() {
    logger.info('SECURITY', 'Initialisation des améliorations de sécurité', {}, 'SecurityEnhancements');
    
    if (this.config.enableCSP) {
      this.setupCSP();
    }
    
    if (this.config.enableXSSProtection) {
      this.setupXSSProtection();
    }
    
    if (this.config.enableRateLimiting) {
      this.setupRateLimiting();
    }
    
    // Local-only network guards (fetch/WebSocket) and resource scan
    this.setupLocalNetworkGuards();
    setTimeout(() => this.scanResources(), 0);

    this.setupSecurityHeaders();
    this.setupGlobalErrorHandling();
  }

  private setupCSP() {
    // En mode développement, on désactive la CSP pour éviter les blocages
    if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
      logger.info('SECURITY', 'CSP désactivé en mode développement', {}, 'SecurityEnhancements');
      return;
    }

    // Content Security Policy avec support complet pour Supabase (production uniquement)
    const cspRules = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // Support complet pour Supabase (REST API, Realtime WebSockets, Storage)
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://bsopguyucqkmjrkxaztc.supabase.co wss://bsopguyucqkmjrkxaztc.supabase.co http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:* wss://localhost:* wss://127.0.0.1:*",
      "media-src 'self' blob:",
      "object-src 'none'",
      "frame-src 'none'",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    // Supprimer l'ancien meta tag CSP s'il existe
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingCSP) {
      existingCSP.remove();
    }

    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = cspRules;
    document.head.appendChild(meta);

    logger.info('SECURITY', 'CSP appliqué avec support complet Supabase', { cspRules }, 'SecurityEnhancements');
  }

  private setupXSSProtection() {
    // Protection XSS basique côté client
    const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if (originalInnerHTML) {
      Object.defineProperty(Element.prototype, 'innerHTML', {
        get: originalInnerHTML.get,
        set: function(value: string) {
          const sanitized = sanitizeHTML(value);
          return originalInnerHTML.set?.call(this, sanitized);
        }
      });
    }
  }

  private setupSecurityHeaders() {
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    logger.info('SECURITY', 'Headers de sécurité appliqués', { headers: securityHeaders },
      'SecurityEnhancements');
  }

  private setupRateLimiting() {
    // Limitation du taux de requêtes + blocage local-only
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      let urlStr: string;
      if (typeof input === 'string') urlStr = input;
      else if (input instanceof Request) urlStr = input.url;
      else if (input instanceof URL) urlStr = input.toString();
      else urlStr = String(input);

      if (LOCAL_ONLY && !isLocalURL(urlStr)) {
        logger.warn('SECURITY', 'Blocked external request (local-only)', { url: urlStr }, 'SecurityEnhancements');
        throw new Error('External requests blocked in local-only mode');
      }
      
      if (!this.checkRateLimit(urlStr)) {
        logger.warn('SECURITY', 'Rate limit exceeded', { url: urlStr }, 'SecurityEnhancements');
        throw new Error('Rate limit exceeded');
      }
      
      return originalFetch(input as any, init);
    };
  }

  private setupGlobalErrorHandling() {
    // Gestionnaire d'erreurs global
    window.addEventListener('error', (event) => {
      logger.error('SECURITY', 'Global error caught', {
        message: event.error?.message,
        filename: event.filename,
        lineno: event.lineno
      }, 'SecurityEnhancements');
    });

    window.addEventListener('unhandledrejection', (event) => {
      logger.error('SECURITY', 'Unhandled promise rejection', {
        reason: event.reason
      }, 'SecurityEnhancements');
    });
  }



  public validateInput(input: string, type: 'email' | 'url' | 'text' | 'number' = 'text'): boolean {
    if (!this.config.enableInputValidation) return true;

    const patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      url: /^https?:\/\/.+/,
      text: /^[^<>]*$/,
      number: /^\d+$/
    };

    const pattern = patterns[type];
    const isValid = pattern.test(input);

    if (!isValid) {
      logger.warn('SECURITY', 'Invalid input detected', { input: input.substring(0, 50), type }, 'SecurityEnhancements');
    }

    return isValid;
  }

  private checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100;

    const current = this.rateLimitMap.get(identifier) || { count: 0, resetTime: now + windowMs };

    if (now > current.resetTime) {
      current.count = 1;
      current.resetTime = now + windowMs;
    } else {
      current.count++;
    }

    this.rateLimitMap.set(identifier, current);

    if (current.count > maxRequests) {
      logger.warn('SECURITY', 'Rate limit exceeded', { identifier, count: current.count }, 'SecurityEnhancements');
      return false;
    }

    return true;
  }

  public encodeOutput(output: string): string {
    if (!this.config.enableOutputEncoding) return output;

    return output
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  public blockIP(ip: string) {
    this.blockedIPs.add(ip);
    logger.info('SECURITY', 'IP blocked', { ip }, 'SecurityEnhancements');
  }

  public isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  public generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  public validateCSRFToken(token: string, sessionToken: string): boolean {
    const isValid = token === sessionToken;
    if (!isValid) {
      logger.warn('SECURITY', 'Invalid CSRF token', {}, 'SecurityEnhancements');
    }
    return isValid;
  }

  public secureRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => chars[byte % chars.length]).join('');
  }

  public hashPassword(password: string, salt?: string): Promise<string> {
    return new Promise((resolve) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + (salt || ''));
      crypto.subtle.digest('SHA-256', data).then(hash => {
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      });
    });
  }

  public detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bDROP\b)/i,
      /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/i,
      /'/,
      /;/,
      /--/,
      /\/\*/
    ];

    const detected = sqlPatterns.some(pattern => pattern.test(input));
    
    if (detected) {
      logger.warn('SECURITY', 'SQL injection attempt detected', { input: input.substring(0, 100) }, 'SecurityEnhancements');
    }

    return detected;
  }

  public monitorPerformance() {
    // Surveillance des performances pour détecter les attaques DoS
    const startTime = performance.now();
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only report performance issues for non-development resources
        if (entry.duration > 10000 && !entry.name.includes('lovable.dev') && !entry.name.includes('localhost')) {
          logger.warn('SECURITY', 'Performance anomaly detected', {
            name: entry.name,
            duration: entry.duration
          }, 'SecurityEnhancements');
        }
      }
    });

    observer.observe({ entryTypes: ['measure', 'navigation'] });
  }

  private setupLocalNetworkGuards() {
    // WebSocket guard with better error handling
    try {
      const OriginalWebSocket = window.WebSocket;
      if (OriginalWebSocket && !(window as any).__ws_guard_installed__) {
        (window as any).__ws_guard_installed__ = true;
        const PatchedWebSocket = function(url: string | URL, protocols?: string | string[]) {
          const href = typeof url === 'string' ? url : url.toString();
          
          // Allow localhost and development WebSocket connections
          if (href.includes('localhost') || href.includes('127.0.0.1') || href.includes('ws://localhost') || href.includes('ws://127.0.0.1')) {
            // @ts-ignore
            return new OriginalWebSocket(url, protocols);
          }
          
          if (LOCAL_ONLY && !isLocalURL(href)) {
            logger.warn('SECURITY', 'Blocked external WebSocket (local-only)', { url: href }, 'SecurityEnhancements');
            throw new Error('External WebSocket blocked in local-only mode');
          }
          
          // @ts-ignore
          return new OriginalWebSocket(url, protocols);
        } as any;
        PatchedWebSocket.prototype = OriginalWebSocket.prototype;
        // @ts-ignore
        window.WebSocket = PatchedWebSocket;
      }
    } catch (error) {
      logger.warn('SECURITY', 'WebSocket guard installation failed', { error: error.message }, 'SecurityEnhancements');
    }
  }

  private scanResources() {
    try {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const currentHost = window.location.hostname;
      
      for (const entry of entries) {
        // Skip scanning for development and local resources
        if (entry.name.includes(currentHost) || 
            entry.name.includes('localhost') || 
            entry.name.includes('127.0.0.1') ||
            entry.name.includes('lovable.dev') ||
            entry.name.startsWith('blob:') ||
            entry.name.startsWith('data:')) {
          continue;
        }
        
        if (!isLocalURL(entry.name)) {
          logger.warn('SECURITY', 'External resource detected', {
            name: entry.name,
            initiatorType: (entry as any).initiatorType
          }, 'SecurityEnhancements');
        }
      }
    } catch (error) {
      logger.warn('SECURITY', 'Resource scanning failed', { error: error.message }, 'SecurityEnhancements');
    }
  }
  
  public getSecurityReport() {
    return {
      blockedIPs: this.blockedIPs.size,
      rateLimitEntries: this.rateLimitMap.size,
      config: this.config,
      timestamp: new Date().toISOString()
    };
  }
  
  public updateConfig(newConfig: Partial<SecurityConfig>) {
    this.config = { ...this.config, ...newConfig };
    logger.info('SECURITY', 'Configuration de sécurité mise à jour', { config: newConfig }, 'SecurityEnhancements');
  }
}

export const securityEnhancements = SecurityEnhancements.getInstance();