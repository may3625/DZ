/**
 * Hook React pour la validation et sécurisation des formulaires
 * Intégration complète avec le système de sécurité avancé
 */

import { useState, useCallback } from 'react';
import { useForm, UseFormProps, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { validator, advancedSanitizeInput, RateLimiter } from '@/utils/enhancedSecurity';
import { logger } from '@/utils/logger';

interface SecureFormConfig<T extends FieldValues = FieldValues> {
  schema?: z.ZodSchema<T>;
  sanitizeOnChange?: boolean;
  enableRateLimit?: boolean;
  rateLimitKey?: string;
  maxSubmissionRate?: number;
  onSecurityViolation?: (violation: string) => void;
}

interface SecurityViolation {
  type: 'rate_limit' | 'validation_error' | 'sanitization_failed' | 'suspicious_input';
  field?: string;
  message: string;
  timestamp: Date;
}

/**
 * Hook principal pour les formulaires sécurisés
 */
export const useSecureForm = <T extends FieldValues = FieldValues>(
  config: SecureFormConfig<T> & UseFormProps<T> = {}
) => {
  const {
    schema,
    sanitizeOnChange = true,
    enableRateLimit = true,
    rateLimitKey,
    maxSubmissionRate = 5,
    onSecurityViolation,
    ...formConfig
  } = config;

  const [securityViolations, setSecurityViolations] = useState<SecurityViolation[]>([]);
  const [isSecurityBlocked, setIsSecurityBlocked] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<Date | null>(null);

  // Configuration du formulaire avec validation Zod si fournie
  const formOptions: UseFormProps<T> = {
    ...formConfig,
    resolver: schema ? zodResolver(schema as any) : formConfig.resolver
  };

  const form = useForm<T>(formOptions);

  /**
   * Enregistre une violation de sécurité
   */
  const recordSecurityViolation = useCallback((violation: Omit<SecurityViolation, 'timestamp'>) => {
    const fullViolation: SecurityViolation = {
      ...violation,
      timestamp: new Date()
    };

    setSecurityViolations(prev => [...prev.slice(-9), fullViolation]); // Garder les 10 dernières
    
    logger.warn('SECURITY', `Violation de sécurité détectée: ${violation.type}`, {
      violation: fullViolation
    }, 'SecureForm');

    if (onSecurityViolation) {
      onSecurityViolation(violation.message);
    }

    // Bloquer temporairement si trop de violations
    if (securityViolations.length >= 3) {
      setIsSecurityBlocked(true);
      setTimeout(() => setIsSecurityBlocked(false), 60000); // 1 minute
    }
  }, [securityViolations.length, onSecurityViolation]);

  /**
   * Sanitise une valeur de champ
   */
  const sanitizeField = useCallback((
    fieldName: string, 
    value: any, 
    type: 'text' | 'email' | 'url' | 'html' = 'text'
  ): string => {
    try {
      const sanitized = advancedSanitizeInput(value, type);
      
      // Vérifier si la sanitisation a modifié la valeur
      if (String(value) !== sanitized && value !== '') {
        recordSecurityViolation({
          type: 'suspicious_input',
          field: fieldName,
          message: `Contenu suspect détecté dans le champ ${fieldName}`
        });
      }
      
      return sanitized;
    } catch (error) {
      recordSecurityViolation({
        type: 'sanitization_failed',
        field: fieldName,
        message: `Échec de la sanitisation pour le champ ${fieldName}`
      });
      return '';
    }
  }, [recordSecurityViolation]);

  /**
   * Handler sécurisé pour les changements de champ
   */
  const handleSecureChange = useCallback((
    fieldName: Path<T>,
    value: any,
    type: 'text' | 'email' | 'url' | 'html' = 'text'
  ) => {
    if (isSecurityBlocked) return;

    let processedValue = value;

    if (sanitizeOnChange && typeof value === 'string') {
      processedValue = sanitizeField(fieldName, value, type);
    }

    form.setValue(fieldName, processedValue, { shouldValidate: true });
  }, [form, sanitizeOnChange, sanitizeField, isSecurityBlocked]);

  /**
   * Validation sécurisée avancée
   */
  const validateSecure = useCallback(async (data: T): Promise<{
    isValid: boolean;
    errors: Record<string, string>;
    sanitizedData: T;
  }> => {
    try {
      // Sanitisation de toutes les données
      const sanitizedData = { ...data };
      
      Object.keys(sanitizedData).forEach(key => {
        const value = sanitizedData[key as keyof T];
        if (typeof value === 'string') {
          sanitizedData[key as keyof T] = sanitizeField(key, value) as T[keyof T];
        }
      });

      // Validation avec le schéma si fourni
      if (schema) {
        try {
          const validated = schema.parse(sanitizedData);
          return {
            isValid: true,
            errors: {},
            sanitizedData: validated
          };
        } catch (error) {
          if (error instanceof z.ZodError) {
            const errors: Record<string, string> = {};
            error.errors.forEach(err => {
              const path = err.path.join('.');
              errors[path] = err.message;
            });
            
            recordSecurityViolation({
              type: 'validation_error',
              message: `Erreurs de validation: ${Object.keys(errors).join(', ')}`
            });
            
            return {
              isValid: false,
              errors,
              sanitizedData
            };
          }
        }
      }

      return {
        isValid: true,
        errors: {},
        sanitizedData
      };
    } catch (error) {
      recordSecurityViolation({
        type: 'validation_error',
        message: 'Erreur générale de validation'
      });
      
      return {
        isValid: false,
        errors: { general: 'Erreur de validation' },
        sanitizedData: data
      };
    }
  }, [schema, sanitizeField, recordSecurityViolation]);

  /**
   * Soumission sécurisée
   */
  const handleSecureSubmit = useCallback((
    onSubmit: (data: T) => void | Promise<void>
  ) => {
    return form.handleSubmit(async (data: T) => {
      // Vérification du rate limiting
      if (enableRateLimit) {
        const identifier = rateLimitKey || 'form_submission';
        
        if (!RateLimiter.isAllowed(identifier)) {
          recordSecurityViolation({
            type: 'rate_limit',
            message: 'Trop de soumissions rapides détectées'
          });
          return;
        }
      }

      // Vérification de la fréquence de soumission
      if (lastSubmission) {
        const timeSinceLastSubmission = Date.now() - lastSubmission.getTime();
        const minInterval = (60 / maxSubmissionRate) * 1000; // Conversion en ms
        
        if (timeSinceLastSubmission < minInterval) {
          recordSecurityViolation({
            type: 'rate_limit',
            message: 'Soumission trop fréquente'
          });
          return;
        }
      }

      // Validation sécurisée
      const validation = await validateSecure(data);
      
      if (!validation.isValid) {
        // Les erreurs sont déjà enregistrées dans validateSecure
        return;
      }

      setLastSubmission(new Date());
      
      logger.info('FORMS', 'Soumission de formulaire sécurisée', {
        fields: Object.keys(data).length,
        sanitized: true
      }, 'SecureForm');

      await onSubmit(validation.sanitizedData);
    });
  }, [
    form,
    enableRateLimit,
    rateLimitKey,
    maxSubmissionRate,
    lastSubmission,
    validateSecure,
    recordSecurityViolation
  ]);

  /**
   * Nettoyage des violations anciennes
   */
  const clearOldViolations = useCallback(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    setSecurityViolations(prev => 
      prev.filter(violation => violation.timestamp > oneHourAgo)
    );
  }, []);

  return {
    form,
    // Méthodes sécurisées
    handleSecureChange,
    handleSecureSubmit,
    validateSecure,
    sanitizeField,
    // État de sécurité
    securityViolations,
    isSecurityBlocked,
    clearOldViolations,
    // Statistiques
    violationCount: securityViolations.length,
    hasRecentViolations: securityViolations.some(
      v => Date.now() - v.timestamp.getTime() < 5 * 60 * 1000 // 5 minutes
    )
  };
};

/**
 * Hook pour validation d'email sécurisée
 */
export const useSecureEmailValidation = () => {
  const validateEmail = useCallback((email: string) => {
    return validator.validateEmail(email);
  }, []);

  return { validateEmail };
};

/**
 * Hook pour validation de fichier sécurisée
 */
export const useSecureFileValidation = () => {
  const validateFile = useCallback((file: File) => {
    return validator.validateSecureFile(file);
  }, []);

  return { validateFile };
};

export default useSecureForm;