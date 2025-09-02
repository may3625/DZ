/**
 * Système de logging unifié pour Dalil.dz
 * Logging local avec persistance optionnelle
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory = 'UI' | 'OCR' | 'API' | 'Navigation' | 'Performance' | 'Security' | 'General' | 'OFFLINE' | 'SYNC' | 'SYSTEM' | 'VALIDATION' | 'WORKFLOW' | 'FORMS' | 'PROCESSING' | 'OCR_MONITORING' | 'PerformanceMonitoring' | 'Supabase' | 'SECURITY' | 'MAPPING' | 'SupabaseSync' | 'CACHE' | 'CLEANUP' | 'Search' | 'Forms' | 'STORAGE';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  component?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private enabledLevels: Set<LogLevel> = new Set(['error', 'warn', 'info']);

  constructor() {
    // En développement, activer tous les niveaux
    if (process.env.NODE_ENV === 'development') {
      this.enabledLevels.add('debug');
    }
  }

  private log(level: LogLevel, category: LogCategory, message: string, data?: any, component?: string) {
    if (!this.enabledLevels.has(level)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data,
      component
    };

    // Ajouter au tableau local
    this.logs.push(entry);
    
    // Maintenir la limite
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log console en développement
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level === 'debug' ? console.log : console[level];
      const prefix = `[${category}${component ? `::${component}` : ''}]`;
      
      if (data) {
        logMethod(prefix, message, data);
      } else {
        logMethod(prefix, message);
      }
    }

    // Sauvegarder en localStorage (optionnel)
    this.persistLogs();
  }

  debug(category: LogCategory, message: string, data?: any, component?: string) {
    this.log('debug', category, message, data, component);
  }

  info(category: LogCategory, message: string, data?: any, component?: string) {
    this.log('info', category, message, data, component);
  }

  warn(category: LogCategory, message: string, data?: any, component?: string) {
    this.log('warn', category, message, data, component);
  }

  error(category: LogCategory, message: string, data?: any, component?: string) {
    this.log('error', category, message, data, component);
  }

  private persistLogs() {
    try {
      // Sauvegarder uniquement les 100 derniers logs
      const recentLogs = this.logs.slice(-100);
      localStorage.setItem('dalil-logs', JSON.stringify(recentLogs));
    } catch (error) {
      // Ignorer les erreurs de localStorage
    }
  }

  getLogs(level?: LogLevel, category?: LogCategory): LogEntry[] {
    return this.logs.filter(log => {
      if (level && log.level !== level) return false;
      if (category && log.category !== category) return false;
      return true;
    });
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('dalil-logs');
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Helper function for procedure logging
export const logProcedure = (message: string, data?: any, component?: string) => {
  logger.info('General', message, data, component);
};

export const logger = new Logger();