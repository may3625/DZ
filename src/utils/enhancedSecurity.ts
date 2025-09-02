/**
 * Système de sécurité avancé - Version 9.5/10
 * Validation, sanitisation et protection complètes
 */

import { logger } from './logger';
import { secureLog } from './basicSecurity';

// Types pour la validation
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
  errorMessage?: string;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: Record<string, any>;
}

// Patterns de validation sécurisés
const SECURITY_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^(\+33|0)[1-9](\d{8})$/,
  postalCode: /^[0-9]{5}$/,
  siret: /^[0-9]{14}$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  noScript: /^(?!.*<script).*$/i,
  noSqlInjection: /^(?!.*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)).*$/i,
  safeHtml: /^[^<>]*$/,
  fileName: /^[a-zA-Z0-9._-]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
} as const;

// Liste noire de mots/caractères dangereux
const BLACKLIST = [
  'javascript:',
  'vbscript:',
  'onload=',
  'onerror=',
  'onclick=',
  'onmouseover=',
  '<script',
  '</script>',
  'eval(',
  'setTimeout(',
  'setInterval(',
  'Function(',
  'constructor',
  '__proto__',
  'prototype'
];

/**
 * Sanitisation avancée des entrées utilisateur
 */
export const advancedSanitizeInput = (input: any, type: 'text' | 'email' | 'url' | 'html' = 'text'): string => {
  if (!input) return '';
  
  let sanitized = String(input);
  
  // Suppression des caractères de contrôle
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Suppression des éléments de la liste noire
  BLACKLIST.forEach(item => {
    const regex = new RegExp(item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  switch (type) {
    case 'text':
      // Encodage des caractères spéciaux HTML
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
      break;
      
    case 'email':
      // Nettoyage spécifique pour email
      sanitized = sanitized.toLowerCase().replace(/[^a-z0-9@._+-]/g, '');
      break;
      
    case 'url':
      // Validation et nettoyage URL
      try {
        const url = new URL(sanitized);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return '';
        }
        sanitized = url.toString();
      } catch {
        return '';
      }
      break;
      
    case 'html':
      // Sanitisation HTML (enlever les balises dangereuses)
      sanitized = sanitized
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '');
      break;
  }
  
  // Limitation de la longueur
  sanitized = sanitized.substring(0, 10000);
  
  secureLog.info('Input sanitized', { 
    originalLength: String(input).length, 
    sanitizedLength: sanitized.length,
    type 
  });
  
  return sanitized;
};

/**
 * Validateur avancé avec schéma
 */
export class AdvancedValidator {
  private static instance: AdvancedValidator;
  
  static getInstance(): AdvancedValidator {
    if (!AdvancedValidator.instance) {
      AdvancedValidator.instance = new AdvancedValidator();
    }
    return AdvancedValidator.instance;
  }
  
  /**
   * Validation complète avec schéma
   */
  validate(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
    const errors: Record<string, string> = {};
    const sanitizedData: Record<string, any> = {};
    
    // Validation de chaque champ
    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field];
      
      // Vérification required
      if (rule.required && (!value || value === '')) {
        errors[field] = rule.errorMessage || `Le champ ${field} est requis`;
        continue;
      }
      
      // Si pas de valeur et pas requis, on passe
      if (!value && !rule.required) {
        sanitizedData[field] = '';
        continue;
      }
      
      // Sanitisation
      const sanitizedValue = advancedSanitizeInput(value);
      
      // Validation longueur minimale
      if (rule.minLength && sanitizedValue.length < rule.minLength) {
        errors[field] = rule.errorMessage || `${field} doit contenir au moins ${rule.minLength} caractères`;
        continue;
      }
      
      // Validation longueur maximale
      if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
        errors[field] = rule.errorMessage || `${field} ne peut pas dépasser ${rule.maxLength} caractères`;
        continue;
      }
      
      // Validation pattern
      if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
        errors[field] = rule.errorMessage || `${field} a un format invalide`;
        continue;
      }
      
      // Validation personnalisée
      if (rule.customValidator && !rule.customValidator(sanitizedValue)) {
        errors[field] = rule.errorMessage || `${field} est invalide`;
        continue;
      }
      
      sanitizedData[field] = sanitizedValue;
    }
    
    const isValid = Object.keys(errors).length === 0;
    
    secureLog.info('Validation completed', {
      fieldsCount: Object.keys(schema).length,
      errorsCount: Object.keys(errors).length,
      isValid
    });
    
    return { isValid, errors, sanitizedData };
  }
  
  /**
   * Validation d'email avancée
   */
  validateEmail(email: string): { isValid: boolean; error?: string } {
    const sanitized = advancedSanitizeInput(email, 'email');
    
    if (!sanitized) {
      return { isValid: false, error: 'Email requis' };
    }
    
    if (!SECURITY_PATTERNS.email.test(sanitized)) {
      return { isValid: false, error: 'Format email invalide' };
    }
    
    // Vérifications supplémentaires
    const parts = sanitized.split('@');
    if (parts[0].length > 64 || parts[1].length > 253) {
      return { isValid: false, error: 'Email trop long' };
    }
    
    return { isValid: true };
  }
  
  /**
   * Validation de fichier sécurisée
   */
  validateSecureFile(file: File): { isValid: boolean; error?: string; sanitizedName?: string } {
    // Taille maximale : 100MB
    const maxSize = 100 * 1024 * 1024;
    
    if (file.size > maxSize) {
      return { isValid: false, error: 'Fichier trop volumineux (max 100MB)' };
    }
    
    // Types autorisés étendus
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.ms-powerpoint',
      'application/zip',
      'application/x-zip-compressed'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Type de fichier non autorisé' };
    }
    
    // Sanitisation du nom de fichier
    let sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
    sanitizedName = sanitizedName.substring(0, 100); // Limitation longueur
    
    // Vérification extension
    const allowedExtensions = ['.pdf', '.txt', '.csv', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.docx', '.xlsx', '.pptx', '.doc', '.xls', '.ppt', '.zip'];
    const hasValidExtension = allowedExtensions.some(ext => 
      sanitizedName.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidExtension) {
      return { isValid: false, error: 'Extension de fichier non autorisée' };
    }
    
    return { isValid: true, sanitizedName };
  }
}

/**
 * Protection CSRF
 */
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>();
  
  static generateToken(sessionId: string): string {
    const token = crypto.randomUUID();
    const expires = Date.now() + (60 * 60 * 1000); // 1 heure
    
    this.tokens.set(sessionId, { token, expires });
    
    secureLog.info('CSRF token generated', { sessionId });
    return token;
  }
  
  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    
    if (!stored) {
      secureLog.warn('CSRF token not found', { sessionId });
      return false;
    }
    
    if (Date.now() > stored.expires) {
      this.tokens.delete(sessionId);
      secureLog.warn('CSRF token expired', { sessionId });
      return false;
    }
    
    if (stored.token !== token) {
      secureLog.security('CSRF token mismatch', { sessionId });
      return false;
    }
    
    return true;
  }
  
  static cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [sessionId, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

/**
 * Rate limiting
 */
export class RateLimiter {
  private static requests = new Map<string, number[]>();
  private static readonly WINDOW_SIZE = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_REQUESTS = 100; // 100 requêtes par fenêtre
  
  static isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.WINDOW_SIZE;
    
    // Récupérer les requêtes existantes
    let requests = this.requests.get(identifier) || [];
    
    // Filtrer les requêtes dans la fenêtre
    requests = requests.filter(time => time > windowStart);
    
    // Vérifier la limite
    if (requests.length >= this.MAX_REQUESTS) {
      secureLog.security('Rate limit exceeded', { identifier, count: requests.length });
      return false;
    }
    
    // Ajouter la nouvelle requête
    requests.push(now);
    this.requests.set(identifier, requests);
    
    return true;
  }
  
  static cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.WINDOW_SIZE;
    
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => time > windowStart);
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

// Initialisation automatique
setInterval(() => {
  CSRFProtection.cleanupExpiredTokens();
  RateLimiter.cleanup();
}, 5 * 60 * 1000); // Nettoyage toutes les 5 minutes

export const validator = AdvancedValidator.getInstance();

export default {
  advancedSanitizeInput,
  validator,
  CSRFProtection,
  RateLimiter,
  SECURITY_PATTERNS,
  BLACKLIST
};