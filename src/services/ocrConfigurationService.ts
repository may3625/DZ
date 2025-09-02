/**
 * Service de configuration OCR - Paramètres avancés pour l'extraction algérienne
 * Complète le plan d'action OCR unifié
 */

export interface OCRConfiguration {
  extraction: {
    language: 'ara' | 'fra' | 'ara+fra';
    psm: number; // Page Segmentation Mode
    oem: number; // OCR Engine Mode
    dpi: number;
    enablePreprocessing: boolean;
    whiteList: string;
    blackList: string;
  };
  algerian: {
    detectMixedLanguage: boolean;
    enhanceArabicText: boolean;
    detectOfficialFormats: boolean;
    extractDateFormats: string[];
    institutionPatterns: string[];
    documentTypeDetection: boolean;
  };
  performance: {
    maxFileSize: number; // MB
    timeoutMs: number;
    parallel: boolean;
    memoryLimit: number; // MB
    enableGPU: boolean;
  };
  quality: {
    minConfidence: number;
    autoRetryLowConfidence: boolean;
    enhanceImages: boolean;
    denoiseLevel: number;
    contrastAdjustment: number;
  };
}

export interface DocumentTypeConfig {
  type: string;
  patterns: string[];
  requiredFields: string[];
  optionalFields: string[];
  validationRules: Record<string, any>;
}

export class OCRConfigurationService {
  private defaultConfig: OCRConfiguration = {
    extraction: {
      language: 'ara+fra',
      psm: 6, // Uniform block of text
      oem: 3, // Default, based on what is available
      dpi: 300,
      enablePreprocessing: true,
      whiteList: '',
      blackList: ''
    },
    algerian: {
      detectMixedLanguage: true,
      enhanceArabicText: true,
      detectOfficialFormats: true,
      extractDateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY/MM/DD'],
      institutionPatterns: [
        'République Algérienne Démocratique et Populaire',
        'Ministère',
        'Wilaya',
        'Prefecture',
        'Commune',
        'Direction'
      ],
      documentTypeDetection: true
    },
    performance: {
      maxFileSize: 50,
      timeoutMs: 120000, // 2 minutes
      parallel: true,
      memoryLimit: 512,
      enableGPU: false
    },
    quality: {
      minConfidence: 0.75,
      autoRetryLowConfidence: true,
      enhanceImages: true,
      denoiseLevel: 1,
      contrastAdjustment: 1.2
    }
  };

  private documentTypes: DocumentTypeConfig[] = [
    {
      type: 'loi',
      patterns: ['Loi n°', 'LOI N°', 'loi du'],
      requiredFields: ['title', 'number', 'date', 'content'],
      optionalFields: ['minister', 'journal_officiel'],
      validationRules: {
        number: { pattern: /\d{2}-\d{2}/ },
        date: { required: true, format: 'date' }
      }
    },
    {
      type: 'decret',
      patterns: ['Décret n°', 'DÉCRET N°', 'décret du'],
      requiredFields: ['title', 'number', 'date', 'content'],
      optionalFields: ['minister', 'signature'],
      validationRules: {
        number: { pattern: /\d{2,3}-\d{2,3}/ },
        date: { required: true, format: 'date' }
      }
    },
    {
      type: 'arrete',
      patterns: ['Arrêté n°', 'ARRÊTÉ N°', 'arrêté du'],
      requiredFields: ['title', 'number', 'date', 'authority'],
      optionalFields: ['reference', 'application_date'],
      validationRules: {
        authority: { required: true, type: 'string' }
      }
    },
    {
      type: 'circulaire',
      patterns: ['Circulaire n°', 'CIRCULAIRE N°'],
      requiredFields: ['title', 'number', 'date', 'destination'],
      optionalFields: ['urgent', 'response_deadline'],
      validationRules: {
        destination: { required: true, type: 'string' }
      }
    }
  ];

  private currentConfig: OCRConfiguration;

  constructor() {
    this.currentConfig = { ...this.defaultConfig };
    this.loadConfigFromStorage();
  }

  /**
   * Obtenir la configuration actuelle
   */
  getConfiguration(): OCRConfiguration {
    return { ...this.currentConfig };
  }

  /**
   * Mettre à jour la configuration
   */
  updateConfiguration(updates: Partial<OCRConfiguration>): void {
    this.currentConfig = this.mergeConfig(this.currentConfig, updates);
    this.saveConfigToStorage();
  }

  /**
   * Réinitialiser à la configuration par défaut
   */
  resetToDefault(): void {
    this.currentConfig = { ...this.defaultConfig };
    this.saveConfigToStorage();
  }

  /**
   * Configuration optimisée pour un type de document
   */
  getOptimizedConfigForDocumentType(documentType: string): OCRConfiguration {
    const baseConfig = { ...this.currentConfig };
    
    switch (documentType) {
      case 'loi':
      case 'decret':
        return {
          ...baseConfig,
          extraction: {
            ...baseConfig.extraction,
            psm: 6, // Bloc de texte uniforme
            dpi: 300
          },
          quality: {
            ...baseConfig.quality,
            minConfidence: 0.8, // Plus exigeant pour les lois
            enhanceImages: true
          }
        };
        
      case 'formulaire':
        return {
          ...baseConfig,
          extraction: {
            ...baseConfig.extraction,
            psm: 4, // Une seule colonne de texte de tailles variables
            dpi: 200
          },
          quality: {
            ...baseConfig.quality,
            minConfidence: 0.7
          }
        };
        
      case 'table':
        return {
          ...baseConfig,
          extraction: {
            ...baseConfig.extraction,
            psm: 6, // Bloc de texte uniforme pour tables
            dpi: 300
          },
          algerian: {
            ...baseConfig.algerian,
            detectOfficialFormats: false // Se concentrer sur le contenu
          }
        };
        
      default:
        return baseConfig;
    }
  }

  /**
   * Configuration pour documents de mauvaise qualité
   */
  getLowQualityConfig(): OCRConfiguration {
    return {
      ...this.currentConfig,
      extraction: {
        ...this.currentConfig.extraction,
        dpi: 400, // Plus haute résolution
        enablePreprocessing: true
      },
      quality: {
        ...this.currentConfig.quality,
        minConfidence: 0.6, // Tolérance plus faible
        enhanceImages: true,
        denoiseLevel: 2,
        contrastAdjustment: 1.5
      },
      performance: {
        ...this.currentConfig.performance,
        timeoutMs: 180000 // Plus de temps
      }
    };
  }

  /**
   * Configuration pour traitement rapide
   */
  getFastProcessingConfig(): OCRConfiguration {
    return {
      ...this.currentConfig,
      extraction: {
        ...this.currentConfig.extraction,
        dpi: 150, // Résolution plus faible
        enablePreprocessing: false
      },
      quality: {
        ...this.currentConfig.quality,
        enhanceImages: false,
        autoRetryLowConfidence: false
      },
      performance: {
        ...this.currentConfig.performance,
        timeoutMs: 30000, // 30 secondes
        parallel: true
      }
    };
  }

  /**
   * Obtenir les types de documents supportés
   */
  getSupportedDocumentTypes(): DocumentTypeConfig[] {
    return [...this.documentTypes];
  }

  /**
   * Détecter le type de document à partir du contenu
   */
  detectDocumentType(content: string): string | null {
    for (const docType of this.documentTypes) {
      for (const pattern of docType.patterns) {
        if (content.includes(pattern)) {
          return docType.type;
        }
      }
    }
    return null;
  }

  /**
   * Valider la configuration
   */
  validateConfiguration(config: Partial<OCRConfiguration>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (config.extraction?.dpi && (config.extraction.dpi < 72 || config.extraction.dpi > 600)) {
      errors.push('DPI doit être entre 72 et 600');
    }
    
    if (config.performance?.maxFileSize && config.performance.maxFileSize > 200) {
      errors.push('Taille maximum de fichier ne peut pas dépasser 200MB');
    }
    
    if (config.quality?.minConfidence && (config.quality.minConfidence < 0 || config.quality.minConfidence > 1)) {
      errors.push('Confiance minimum doit être entre 0 et 1');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtenir les recommandations d'optimisation
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.currentConfig.extraction.dpi > 300) {
      recommendations.push('Réduire le DPI à 300 pour améliorer les performances');
    }
    
    if (!this.currentConfig.performance.parallel) {
      recommendations.push('Activer le traitement parallèle pour accélérer l\'extraction');
    }
    
    if (this.currentConfig.quality.minConfidence < 0.7) {
      recommendations.push('Augmenter la confiance minimum à 0.7 pour une meilleure qualité');
    }
    
    if (!this.currentConfig.algerian.detectMixedLanguage) {
      recommendations.push('Activer la détection de langue mixte pour les documents algériens');
    }
    
    return recommendations;
  }

  /**
   * Fusion récursive des configurations
   */
  private mergeConfig(base: OCRConfiguration, updates: Partial<OCRConfiguration>): OCRConfiguration {
    const result = { ...base };
    
    Object.keys(updates).forEach(key => {
      const updateValue = updates[key as keyof OCRConfiguration];
      if (updateValue && typeof updateValue === 'object' && !Array.isArray(updateValue)) {
        result[key as keyof OCRConfiguration] = {
          ...result[key as keyof OCRConfiguration],
          ...updateValue
        } as any;
      } else if (updateValue !== undefined) {
        (result as any)[key] = updateValue;
      }
    });
    
    return result;
  }

  /**
   * Sauvegarder la configuration
   */
  private saveConfigToStorage(): void {
    try {
      localStorage.setItem('ocr-config', JSON.stringify(this.currentConfig));
    } catch (error) {
      console.warn('Impossible de sauvegarder la configuration OCR:', error);
    }
  }

  /**
   * Charger la configuration depuis le stockage
   */
  private loadConfigFromStorage(): void {
    try {
      const stored = localStorage.getItem('ocr-config');
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        this.currentConfig = this.mergeConfig(this.defaultConfig, parsedConfig);
      }
    } catch (error) {
      console.warn('Impossible de charger la configuration OCR:', error);
    }
  }
}

export const ocrConfigurationService = new OCRConfigurationService();
export default ocrConfigurationService;