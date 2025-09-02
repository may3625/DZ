/* eslint-disable no-useless-escape */
/**
 * Service de reconnaissance de motifs légaux avancés (Étape 9)
 * Patterns spécialisés pour documents administratifs et légaux algériens
 * Extraction d'entités légales avec validation contextuelle
 */

export interface LegalEntity {
  id: string;
  type: 'ministry' | 'institution' | 'law_reference' | 'decree_number' | 'official_title' | 'date' | 'location' | 'amount';
  value: string;
  context: string;
  position: { start: number; end: number };
  confidence: number;
  validated: boolean;
  metadata?: Record<string, any>;
}

export interface PatternMatch {
  patternId: string;
  patternName: string;
  matchedText: string;
  extractedData: Record<string, string>;
  confidence: number;
  position: { start: number; end: number };
  context: string;
}

export interface LegalPatternResult {
  entities: LegalEntity[];
  patterns: PatternMatch[];
  summary: {
    totalEntities: number;
    entitiesByType: Record<string, number>;
    averageConfidence: number;
    validatedEntities: number;
  };
  processingTime: number;
}

export interface LegalPatternConfig {
  enableContextValidation: boolean;
  confidenceThreshold: number;
  enableEntityLinking: boolean;
  strictMode: boolean;
}

class LegalPatternService {
  private readonly DEFAULT_CONFIG: LegalPatternConfig = {
    enableContextValidation: true,
    confidenceThreshold: 0.7,
    enableEntityLinking: true,
    strictMode: false
  };

  // Base de données des motifs légaux algériens
  private readonly ALGERIAN_LEGAL_PATTERNS = {
    // Références législatives
    law_references: [
      {
        id: 'law_reference_1',
        name: 'Loi avec numéro',
        pattern: /(?:loi\s*(?:n°|numéro|num\.?)\s*)(\d{2}[-\/]\d{2,3})\s*(?:du\s*(\d{1,2}(?:er)?\s+\w+\s+\d{4}))?/gi,
        extract: ['number', 'date']
      },
      {
        id: 'law_reference_2', 
        name: 'Code référence',
        pattern: /(?:code\s+(?:de\s+(?:la\s+)?)?(?:des\s+)?)(\w+(?:\s+\w+)*)\s*(?:n°\s*(\d+[-\/]\d+))?/gi,
        extract: ['code_name', 'number']
      }
    ],

    // Décrets et arrêtés
    decree_references: [
      {
        id: 'decree_1',
        name: 'Décret exécutif',
        pattern: /(?:décret\s+exécutif\s*(?:n°|numéro|num\.?)\s*)(\d{2}[-\/]\d{2,3})\s*(?:du\s*(\d{1,2}(?:er)?\s+\w+\s+\d{4}))?/gi,
        extract: ['number', 'date']
      },
      {
        id: 'decree_2',
        name: 'Arrêté ministériel',
        pattern: /(?:arrêté\s+(?:ministériel\s+)?(?:interministériel\s+)?(?:n°|numéro|num\.?)\s*)(\d+[-\/]\d+)\s*(?:du\s*(\d{1,2}(?:er)?\s+\w+\s+\d{4}))?/gi,
        extract: ['number', 'date']
      }
    ],

    // Institutions algériennes
    institutions: [
      {
        id: 'ministry_1',
        name: 'Ministères',
        pattern: /(?:ministère\s+(?:de\s+(?:la\s+|l\')?(?:des\s+)?)?)([\w\s,\']+?)(?:\s+et\s+|\s*[,;.]|\s*$)/gi,
        extract: ['ministry_name']
      },
      {
        id: 'wilaya_1',
        name: 'Wilayas',
        pattern: /(?:wilaya\s+(?:de\s+(?:la\s+)?(?:d\')?)?)([\w\s-]+?)(?:\s*[,;.]|\s*$)/gi,
        extract: ['wilaya_name']
      },
      {
        id: 'direction_1',
        name: 'Directions',
        pattern: /(?:direction\s+(?:de\s+(?:la\s+|l\')?(?:des\s+)?)?)([\w\s,\']+?)(?:\s+et\s+|\s*[,;.]|\s*$)/gi,
        extract: ['direction_name']
      }
    ],

    // Dates officielles
    dates: [
      {
        id: 'date_1',
        name: 'Date française complète',
        pattern: /(\d{1,2})(?:er)?\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/gi,
        extract: ['day', 'month', 'year']
      },
      {
        id: 'date_2',
        name: 'Date numérique',
        pattern: /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g,
        extract: ['day', 'month', 'year']
      }
    ],

    // Montants et valeurs
    amounts: [
      {
        id: 'amount_1',
        name: 'Montant en dinars',
        pattern: /(\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})?)\s*(?:da|dinars?|dzd)/gi,
        extract: ['amount']
      },
      {
        id: 'amount_2',
        name: 'Pourcentage',
        pattern: /(\d+(?:,\d+)?)\s*%/g,
        extract: ['percentage']
      }
    ],

    // Titres officiels
    official_titles: [
      {
        id: 'title_1',
        name: 'Titres administratifs',
        pattern: /(?:monsieur|madame)\s+(le\s+|la\s+)?(ministre|directeur|chef|secrétaire\s+général|wali|président|vice-président)(?:\s+(?:de\s+(?:la\s+|l\')?(?:des\s+)?)?)([\w\s,\']*?)(?:\s*[,;.]|\s*$)/gi,
        extract: ['gender', 'title', 'department']
      }
    ],

    // Références d'articles
    articles: [
      {
        id: 'article_1',
        name: 'Article avec numéro',
        pattern: /(?:article|art\.?)\s*(\d+)(?:\s*(?:bis|ter|quater))?/gi,
        extract: ['article_number']
      }
    ]
  };

  // Validation contextuelle
  private readonly CONTEXT_VALIDATORS = {
    ministry: (text: string) => /(?:république|algérie|gouvernement|cabinet|secrétariat)/i.test(text),
    law: (text: string) => /(?:journal\s+officiel|jo|promulgu|publié|adopté)/i.test(text),
    decree: (text: string) => /(?:exécution|application|fixant|portant|relatif)/i.test(text),
    institution: (text: string) => /(?:administration|service|bureau|département)/i.test(text)
  };

  /**
   * Étape 9 : Reconnaissance avancée de motifs légaux
   */
  async recognizeLegalPatterns(
    text: string,
    config: Partial<LegalPatternConfig> = {}
  ): Promise<LegalPatternResult> {
    
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = performance.now();

    console.log('⚖️ Starting legal pattern recognition...');

    try {
      const entities: LegalEntity[] = [];
      const patterns: PatternMatch[] = [];
      let entityCounter = 0;

      // Traitement par catégorie de motifs
      for (const [category, categoryPatterns] of Object.entries(this.ALGERIAN_LEGAL_PATTERNS)) {
        for (const patternDef of categoryPatterns) {
          const matches = this.findPatternMatches(text, patternDef, mergedConfig);
          
          for (const match of matches) {
            patterns.push(match);

            // Convertir match en entités
            const extractedEntities = this.convertMatchToEntities(
              match, 
              category, 
              entityCounter, 
              mergedConfig
            );
            
            entities.push(...extractedEntities);
            entityCounter += extractedEntities.length;
          }
        }
      }

      // Validation et liaison d'entités si activée
      if (mergedConfig.enableEntityLinking) {
        this.linkRelatedEntities(entities);
      }

      // Calcul du résumé
      const summary = this.calculateSummary(entities);

      const processingTime = performance.now() - startTime;

      console.log(`✅ Legal pattern recognition completed in ${processingTime.toFixed(2)}ms`);
      console.log(`📊 Found: ${entities.length} entities, ${patterns.length} patterns`);

      return {
        entities,
        patterns,
        summary,
        processingTime
      };

    } catch (error) {
      console.error('❌ Legal pattern recognition failed:', error);
      throw new Error(`Legal pattern recognition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Recherche de correspondances pour un motif
   */
  private findPatternMatches(
    text: string,
    patternDef: any,
    config: LegalPatternConfig
  ): PatternMatch[] {
    
    const matches: PatternMatch[] = [];
    let match;

    // Reset du regex pour éviter les problèmes de state
    patternDef.pattern.lastIndex = 0;

    while ((match = patternDef.pattern.exec(text)) !== null) {
      const matchedText = match[0];
      const context = this.extractContext(text, match.index, 100);
      
      // Validation contextuelle si activée
      const contextualConfidence = config.enableContextValidation
        ? this.validateContext(matchedText, context, patternDef.name)
        : 0.8;

      if (contextualConfidence >= config.confidenceThreshold) {
        const extractedData: Record<string, string> = {};
        
        // Extraire les données selon la définition
        patternDef.extract.forEach((field: string, index: number) => {
          if (match[index + 1]) {
            extractedData[field] = match[index + 1].trim();
          }
        });

        matches.push({
          patternId: patternDef.id,
          patternName: patternDef.name,
          matchedText,
          extractedData,
          confidence: contextualConfidence,
          position: { start: match.index, end: match.index + matchedText.length },
          context
        });
      }
    }

    return matches;
  }

  /**
   * Extraction du contexte autour d'une correspondance
   */
  private extractContext(text: string, position: number, radius: number): string {
    const start = Math.max(0, position - radius);
    const end = Math.min(text.length, position + radius);
    return text.substring(start, end);
  }

  /**
   * Validation contextuelle
   */
  private validateContext(matchedText: string, context: string, patternName: string): number {
    let confidence = 0.6; // Confiance de base

    // Validation selon le type de motif
    if (patternName.includes('ministère') || patternName.includes('Ministères')) {
      if (this.CONTEXT_VALIDATORS.ministry(context)) confidence += 0.3;
    } else if (patternName.includes('Loi') || patternName.includes('Code')) {
      if (this.CONTEXT_VALIDATORS.law(context)) confidence += 0.3;
    } else if (patternName.includes('Décret') || patternName.includes('Arrêté')) {
      if (this.CONTEXT_VALIDATORS.decree(context)) confidence += 0.3;
    } else if (patternName.includes('Direction') || patternName.includes('Wilaya')) {
      if (this.CONTEXT_VALIDATORS.institution(context)) confidence += 0.2;
    }

    // Bonus pour format correct
    if (/\d{2}[-\/]\d{2,3}/.test(matchedText)) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Conversion de correspondance en entités
   */
  private convertMatchToEntities(
    match: PatternMatch,
    category: string,
    startId: number,
    config: LegalPatternConfig
  ): LegalEntity[] {
    
    const entities: LegalEntity[] = [];
    
    // Mappage de catégorie vers type d'entité
    const categoryToType: Record<string, LegalEntity['type']> = {
      'law_references': 'law_reference',
      'decree_references': 'decree_number',
      'institutions': 'institution',
      'dates': 'date',
      'amounts': 'amount',
      'official_titles': 'official_title'
    };

    const entityType = categoryToType[category] || 'law_reference';

    // Créer une entité principale
    const mainEntity: LegalEntity = {
      id: `entity_${startId}`,
      type: entityType,
      value: match.matchedText,
      context: match.context,
      position: match.position,
      confidence: match.confidence,
      validated: config.enableContextValidation && match.confidence >= config.confidenceThreshold,
      metadata: {
        patternId: match.patternId,
        patternName: match.patternName,
        extractedData: match.extractedData
      }
    };

    entities.push(mainEntity);

    // Créer des entités supplémentaires pour les données extraites
    Object.entries(match.extractedData).forEach(([field, value], index) => {
      const subEntity: LegalEntity = {
        id: `entity_${startId}_${index + 1}`,
        type: this.mapFieldToEntityType(field),
        value: value,
        context: match.context,
        position: match.position,
        confidence: match.confidence * 0.9, // Légèrement moins confiant pour sous-entités
        validated: mainEntity.validated,
        metadata: {
          parentEntity: mainEntity.id,
          field,
          patternId: match.patternId
        }
      };

      entities.push(subEntity);
    });

    return entities;
  }

  /**
   * Mappage de champ vers type d'entité
   */
  private mapFieldToEntityType(field: string): LegalEntity['type'] {
    const fieldMapping: Record<string, LegalEntity['type']> = {
      'number': 'decree_number',
      'date': 'date',
      'ministry_name': 'ministry',
      'wilaya_name': 'location',
      'direction_name': 'institution',
      'amount': 'amount',
      'title': 'official_title',
      'department': 'institution'
    };

    return fieldMapping[field] || 'institution';
  }

  /**
   * Liaison d'entités connexes
   */
  private linkRelatedEntities(entities: LegalEntity[]): void {
    // Lier les dates aux lois/décrets proches
    const dateEntities = entities.filter(e => e.type === 'date');
    const lawEntities = entities.filter(e => e.type === 'law_reference' || e.type === 'decree_number');

    for (const dateEntity of dateEntities) {
      for (const lawEntity of lawEntities) {
        // Si les entités sont proches (dans les 50 caractères)
        const distance = Math.abs(dateEntity.position.start - lawEntity.position.start);
        if (distance < 50) {
          // Ajouter liaison
          if (!lawEntity.metadata) lawEntity.metadata = {};
          if (!lawEntity.metadata.linkedEntities) lawEntity.metadata.linkedEntities = [];
          lawEntity.metadata.linkedEntities.push(dateEntity.id);

          if (!dateEntity.metadata) dateEntity.metadata = {};
          if (!dateEntity.metadata.linkedEntities) dateEntity.metadata.linkedEntities = [];
          dateEntity.metadata.linkedEntities.push(lawEntity.id);
        }
      }
    }
  }

  /**
   * Calcul du résumé
   */
  private calculateSummary(entities: LegalEntity[]) {
    const entitiesByType: Record<string, number> = {};
    let totalConfidence = 0;
    let validatedCount = 0;

    for (const entity of entities) {
      entitiesByType[entity.type] = (entitiesByType[entity.type] || 0) + 1;
      totalConfidence += entity.confidence;
      if (entity.validated) validatedCount++;
    }

    return {
      totalEntities: entities.length,
      entitiesByType,
      averageConfidence: entities.length > 0 ? totalConfidence / entities.length : 0,
      validatedEntities: validatedCount
    };
  }

  /**
   * Recherche d'entités par type
   */
  findEntitiesByType(result: LegalPatternResult, type: LegalEntity['type']): LegalEntity[] {
    return result.entities.filter(entity => entity.type === type);
  }

  /**
   * Recherche d'entités par valeur
   */
  findEntitiesByValue(result: LegalPatternResult, value: string): LegalEntity[] {
    return result.entities.filter(entity => 
      entity.value.toLowerCase().includes(value.toLowerCase())
    );
  }

  /**
   * Validation d'une entité spécifique
   */
  validateEntity(entity: LegalEntity, context: string): boolean {
    switch (entity.type) {
      case 'law_reference':
      case 'decree_number':
        return /\d{2}[-\/]\d{2,3}/.test(entity.value);
      
      case 'date':
        return /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(entity.value) ||
               /\d{1,2}\s+\w+\s+\d{4}/.test(entity.value);
      
      case 'amount':
        return /\d/.test(entity.value);
      
      default:
        return entity.value.length > 2;
    }
  }
}

export const legalPatternService = new LegalPatternService();
export default legalPatternService;