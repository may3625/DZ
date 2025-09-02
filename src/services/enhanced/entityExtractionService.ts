/* eslint-disable no-useless-escape */
/**
 * Service d'extraction d'entités nommées avancées (Étape 11)
 * Reconnaissance et liaison d'entités spécialisées pour documents algériens
 * Support multilingue français-arabe avec validation contextuelle
 */

export interface NamedEntity {
  id: string;
  text: string;
  type: 'PERSON' | 'ORG' | 'LOC' | 'DATE' | 'MONEY' | 'PERCENT' | 'LAW' | 'INSTITUTION' | 'TITLE' | 'MISC';
  subtype?: string;
  confidence: number;
  position: { start: number; end: number };
  context: string;
  language: 'fra' | 'ara' | 'mixed';
  metadata?: Record<string, any>;
  linkedEntities?: string[];
  normalized?: string;
}

export interface EntityRelation {
  id: string;
  sourceEntity: string;
  targetEntity: string;
  relationType: 'WORKS_FOR' | 'LOCATED_IN' | 'MEMBER_OF' | 'SIGNED_BY' | 'ISSUED_BY' | 'REFERS_TO' | 'PART_OF';
  confidence: number;
  context: string;
}

export interface EntityExtractionResult {
  entities: NamedEntity[];
  relations: EntityRelation[];
  summary: {
    totalEntities: number;
    entitiesByType: Record<string, number>;
    entitiesByLanguage: Record<string, number>;
    averageConfidence: number;
    totalRelations: number;
  };
  processingTime: number;
}

export interface EntityExtractionConfig {
  enableMultilingualExtraction: boolean;
  enableEntityLinking: boolean;
  enableRelationExtraction: boolean;
  confidenceThreshold: number;
  enableNormalization: boolean;
  strictValidation: boolean;
}

class EntityExtractionService {
  private readonly DEFAULT_CONFIG: EntityExtractionConfig = {
    enableMultilingualExtraction: true,
    enableEntityLinking: true,
    enableRelationExtraction: true,
    confidenceThreshold: 0.6,
    enableNormalization: true,
    strictValidation: false
  };

  // Patterns d'entités nommées spécialisés pour l'Algérie
  private readonly ENTITY_PATTERNS = {
    // Personnes (noms algériens)
    PERSON: [
      {
        pattern: /(?:M\.|Mme|Monsieur|Madame|Dr\.?|Professeur)\s+([A-ZÀÁÂÄÇÈÉÊËÌÍÎÏÑÒÓÔÖÙÚÛÜ][a-zàáâäçèéêëìíîïñòóôöùúûü]+(?:\s+[A-ZÀÁÂÄÇÈÉÊËÌÍÎÏÑÒÓÔÖÙÚÛÜ][a-zàáâäçèéêëìíîïñòóôöùúûü]+)*)/g,
        subtype: 'formal_name'
      },
      {
        pattern: /([A-ZÀÁÂÄÇÈÉÊËÌÍÎÏÑÒÓÔÖÙÚÛÜ][a-zàáâäçèéêëìíîïñòóôöùúûü]+\s+(?:ben|ibn|ould|bent)\s+[A-ZÀÁÂÄÇÈÉÊËÌÍÎÏÑÒÓÔÖÙÚÛÜ][a-zàáâäçèéêëìíîïñòóôöùúûü]+)/g,
        subtype: 'algerian_name'
      },
      {
        pattern: /([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+)*)/g,
        subtype: 'arabic_name'
      }
    ],

    // Organisations et institutions
    ORG: [
      {
        pattern: /(Ministère\s+(?:de\s+(?:la\s+|l\')?(?:des\s+)?)?[\w\s,\']+?)(?:\s+et\s+|\s*[,;.]|\s*$)/gi,
        subtype: 'ministry'
      },
      {
        pattern: /(Direction\s+(?:de\s+(?:la\s+|l\')?(?:des\s+)?)?[\w\s,\']+?)(?:\s+et\s+|\s*[,;.]|\s*$)/gi,
        subtype: 'direction'
      },
      {
        pattern: /(Assemblée\s+Populaire\s+Nationale|APN|Conseil\s+de\s+la\s+Nation|Sénat)/gi,
        subtype: 'parliament'
      },
      {
        pattern: /(Banque\s+(?:d\')?Algérie|Banque\s+Centrale|Office\s+National\s+[\w\s]+)/gi,
        subtype: 'public_institution'
      }
    ],

    // Lieux géographiques algériens
    LOC: [
      {
        pattern: /(Wilaya\s+(?:de\s+(?:la\s+)?(?:d\')?)?)([\w\s-]+?)(?:\s*[,;.]|\s*$)/gi,
        subtype: 'wilaya'
      },
      {
        pattern: /(Daïra\s+(?:de\s+(?:la\s+)?(?:d\')?)?)([\w\s-]+?)(?:\s*[,;.]|\s*$)/gi,
        subtype: 'daira'
      },
      {
        pattern: /(Commune\s+(?:de\s+(?:la\s+)?(?:d\')?)?)([\w\s-]+?)(?:\s*[,;.]|\s*$)/gi,
        subtype: 'commune'
      },
      {
        pattern: /(Alger|Oran|Constantine|Annaba|Blida|Batna|Djelfa|Sétif|Sidi\s+Bel\s+Abbès|Biskra|Tébessa|El\s+Oued|Skikda|Tiaret|Béjaïa|Tlemcen|Ouargla|Béchar|Mostaganem|Bordj\s+Bou\s+Arréridj|Chlef|Médéa|Tizi\s+Ouzou|Mascara|Oum\s+el\s+Bouaghi|Guelma|Laghouat|Khenchela|Souk\s+Ahras|Bouira|Tamanrasset|El\s+Bayadh|Illizi|Tissemsilt|El\s+Tarf|Jijel|Aïn\s+Defla|Naâma|Aïn\s+Témouchent|Ghardaïa|Relizane|Tindouf|M\'Sila|Mila|Aïn\s+Beïda|Ouled\s+Djellal)/gi,
        subtype: 'city'
      }
    ],

    // Dates en français et arabe
    DATE: [
      {
        pattern: /(\d{1,2})(?:er)?\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/gi,
        subtype: 'full_date_fr'
      },
      {
        pattern: /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g,
        subtype: 'numeric_date'
      },
      {
        pattern: /(Ramadan|Dhu\s+al-Hijjah|Muharram|Safar|Rabi\'\s+al-awwal|Rabi\'\s+al-thani|Jumada\s+al-awwal|Jumada\s+al-thani|Rajab|Sha\'ban|Shawwal|Dhu\s+al-Qi\'dah)\s+(\d{4})/gi,
        subtype: 'hijri_date'
      }
    ],

    // Montants et devises
    MONEY: [
      {
        pattern: /(\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})?)\s*(DA|dinars?|DZD|centimes?)/gi,
        subtype: 'algerian_dinar'
      },
      {
        pattern: /(\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})?)\s*(€|euros?|EUR|\$|dollars?|USD)/gi,
        subtype: 'foreign_currency'
      }
    ],

    // Pourcentages
    PERCENT: [
      {
        pattern: /(\d+(?:,\d+)?)\s*(%|pour\s+cent|pourcent)/gi,
        subtype: 'percentage'
      }
    ],

    // Références légales
    LAW: [
      {
        pattern: /(Loi\s*(?:n°|numéro|num\.?)\s*\d{2}[-\/]\d{2,3}(?:\s*du\s*\d{1,2}(?:er)?\s+\w+\s+\d{4})?)/gi,
        subtype: 'law_reference'
      },
      {
        pattern: /(Décret\s+exécutif\s*(?:n°|numéro|num\.?)\s*\d{2}[-\/]\d{2,3}(?:\s*du\s*\d{1,2}(?:er)?\s+\w+\s+\d{4})?)/gi,
        subtype: 'decree'
      },
      {
        pattern: /(Arrêté\s+(?:ministériel\s+)?(?:interministériel\s+)?(?:n°|numéro|num\.?)\s*\d+[-\/]\d+)/gi,
        subtype: 'ministerial_order'
      }
    ],

    // Titres officiels
    TITLE: [
      {
        pattern: /(Ministre|Secrétaire\s+général|Directeur\s+général|Wali|Président|Vice-président|Chef\s+de\s+cabinet|Inspecteur\s+général)/gi,
        subtype: 'official_title'
      }
    ]
  };

  // Base de connaissances pour validation
  private readonly KNOWLEDGE_BASE = {
    algerian_wilayas: [
      'Adrar', 'Chlef', 'Laghouat', 'Oum el Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
      'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
      'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda',
      'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
      'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj',
      'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
      'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
      'Ghardaïa', 'Relizane'
    ],
    algerian_ministries: [
      'Affaires étrangères', 'Intérieur', 'Justice', 'Défense nationale',
      'Finances', 'Éducation nationale', 'Enseignement supérieur',
      'Santé', 'Agriculture', 'Industrie', 'Commerce', 'Travail',
      'Transport', 'Habitat', 'Énergie', 'Tourisme', 'Culture',
      'Jeunesse et Sports', 'Solidarité nationale', 'Communication'
    ]
  };

  /**
   * Étape 11 : Extraction d'entités nommées avancées
   */
  async extractEntities(
    text: string,
    config: Partial<EntityExtractionConfig> = {}
  ): Promise<EntityExtractionResult> {
    
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = performance.now();

    console.log('🏷️ Starting advanced entity extraction...');

    try {
      const entities: NamedEntity[] = [];
      let entityCounter = 0;

      // Extraction d'entités par type
      for (const [entityType, patterns] of Object.entries(this.ENTITY_PATTERNS)) {
        for (const patternDef of patterns) {
          const extractedEntities = this.extractEntitiesWithPattern(
            text,
            entityType as NamedEntity['type'],
            patternDef,
            entityCounter,
            mergedConfig
          );
          
          entities.push(...extractedEntities);
          entityCounter += extractedEntities.length;
        }
      }

      // Normalisation si activée
      if (mergedConfig.enableNormalization) {
        this.normalizeEntities(entities);
      }

      // Filtrage par confiance
      const filteredEntities = entities.filter(e => e.confidence >= mergedConfig.confidenceThreshold);

      // Extraction de relations si activée
      const relations = mergedConfig.enableRelationExtraction
        ? this.extractEntityRelations(filteredEntities, text, mergedConfig)
        : [];

      // Liaison d'entités si activée
      if (mergedConfig.enableEntityLinking) {
        this.linkRelatedEntities(filteredEntities, text);
      }

      // Calcul du résumé
      const summary = this.calculateSummary(filteredEntities, relations);

      const processingTime = performance.now() - startTime;

      console.log(`✅ Entity extraction completed in ${processingTime.toFixed(2)}ms`);
      console.log(`📊 Found: ${filteredEntities.length} entities, ${relations.length} relations`);

      return {
        entities: filteredEntities,
        relations,
        summary,
        processingTime
      };

    } catch (error) {
      console.error('❌ Entity extraction failed:', error);
      throw new Error(`Entity extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extraction d'entités avec un pattern spécifique
   */
  private extractEntitiesWithPattern(
    text: string,
    entityType: NamedEntity['type'],
    patternDef: any,
    startId: number,
    config: EntityExtractionConfig
  ): NamedEntity[] {
    
    const entities: NamedEntity[] = [];
    let match;
    let entityId = startId;

    patternDef.pattern.lastIndex = 0;

    while ((match = patternDef.pattern.exec(text)) !== null) {
      const entityText = match[1] || match[0];
      const context = this.extractContext(text, match.index, 100);
      
      // Détection de langue
      const language = config.enableMultilingualExtraction
        ? this.detectEntityLanguage(entityText)
        : 'fra';

      // Calcul de confiance
      const confidence = this.calculateEntityConfidence(
        entityText,
        entityType,
        patternDef.subtype,
        context,
        config
      );

      if (confidence >= config.confidenceThreshold) {
        const entity: NamedEntity = {
          id: `entity_${entityId++}`,
          text: entityText.trim(),
          type: entityType,
          subtype: patternDef.subtype,
          confidence,
          position: {
            start: match.index,
            end: match.index + match[0].length
          },
          context,
          language,
          metadata: {
            pattern: patternDef.pattern.source,
            fullMatch: match[0]
          }
        };

        entities.push(entity);
      }
    }

    return entities;
  }

  /**
   * Détection de la langue d'une entité
   */
  private detectEntityLanguage(text: string): NamedEntity['language'] {
    const arabicPattern = /[\u0600-\u06FF]/;
    const frenchPattern = /[a-zA-ZÀ-ÿ]/;
    
    const hasArabic = arabicPattern.test(text);
    const hasFrench = frenchPattern.test(text);
    
    if (hasArabic && hasFrench) return 'mixed';
    if (hasArabic) return 'ara';
    return 'fra';
  }

  /**
   * Calcul de confiance pour entité
   */
  private calculateEntityConfidence(
    entityText: string,
    entityType: NamedEntity['type'],
    subtype: string | undefined,
    context: string,
    config: EntityExtractionConfig
  ): number {
    
    let confidence = 0.6; // Confiance de base

    // Validation contextuelle
    confidence += this.validateEntityContext(entityText, entityType, context);

    // Validation par base de connaissances
    if (config.strictValidation) {
      confidence += this.validateAgainstKnowledgeBase(entityText, entityType, subtype);
    }

    // Bonus pour format correct
    confidence += this.validateEntityFormat(entityText, entityType);

    // Bonus pour capitalisation appropriée
    if (this.hasCorrectCapitalization(entityText, entityType)) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Validation contextuelle
   */
  private validateEntityContext(
    entityText: string,
    entityType: NamedEntity['type'],
    context: string
  ): number {
    
    const contextWords = context.toLowerCase();
    let bonus = 0;

    switch (entityType) {
      case 'PERSON':
        if (/(?:monsieur|madame|m\.|mme|président|ministre|directeur)/.test(contextWords)) {
          bonus += 0.2;
        }
        break;

      case 'ORG':
        if (/(?:ministère|direction|service|bureau|administration)/.test(contextWords)) {
          bonus += 0.2;
        }
        break;

      case 'LOC':
        if (/(?:wilaya|commune|daïra|ville|région|située?)/.test(contextWords)) {
          bonus += 0.2;
        }
        break;

      case 'LAW':
        if (/(?:promulgu|publié|journal\s+officiel|adopté)/.test(contextWords)) {
          bonus += 0.2;
        }
        break;

      case 'DATE':
        if (/(?:du|le|en\s+date|signé|publié)/.test(contextWords)) {
          bonus += 0.1;
        }
        break;
    }

    return bonus;
  }

  /**
   * Validation contre base de connaissances
   */
  private validateAgainstKnowledgeBase(
    entityText: string,
    entityType: NamedEntity['type'],
    subtype?: string
  ): number {
    
    const normalizedText = entityText.toLowerCase().trim();

    switch (entityType) {
      case 'LOC':
        if (subtype === 'wilaya') {
          const isKnownWilaya = this.KNOWLEDGE_BASE.algerian_wilayas.some(w =>
            normalizedText.includes(w.toLowerCase())
          );
          return isKnownWilaya ? 0.3 : -0.2;
        }
        break;

      case 'ORG':
        if (subtype === 'ministry') {
          const isKnownMinistry = this.KNOWLEDGE_BASE.algerian_ministries.some(m =>
            normalizedText.includes(m.toLowerCase())
          );
          return isKnownMinistry ? 0.3 : 0;
        }
        break;
    }

    return 0;
  }

  /**
   * Validation du format d'entité
   */
  private validateEntityFormat(entityText: string, entityType: NamedEntity['type']): number {
    switch (entityType) {
      case 'DATE':
        if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(entityText)) return 0.2;
        if (/\d{1,2}\s+\w+\s+\d{4}/.test(entityText)) return 0.2;
        break;

      case 'MONEY':
        if (/\d+(?:[.,]\d{2})?\s*(?:DA|DZD|dinars?)/.test(entityText)) return 0.2;
        break;

      case 'LAW':
        if (/\d{2}[-\/]\d{2,3}/.test(entityText)) return 0.2;
        break;

      case 'PERCENT':
        if (/\d+(?:,\d+)?\s*%/.test(entityText)) return 0.2;
        break;
    }

    return 0;
  }

  /**
   * Vérification de la capitalisation
   */
  private hasCorrectCapitalization(entityText: string, entityType: NamedEntity['type']): boolean {
    switch (entityType) {
      case 'PERSON':
      case 'ORG':
      case 'LOC':
        return /^[A-ZÀÁÂÄÇÈÉÊËÌÍÎÏÑÒÓÔÖÙÚÛÜ]/.test(entityText);
      
      default:
        return true;
    }
  }

  /**
   * Normalisation des entités
   */
  private normalizeEntities(entities: NamedEntity[]): void {
    for (const entity of entities) {
      switch (entity.type) {
        case 'DATE':
          entity.normalized = this.normalizeDateEntity(entity.text);
          break;

        case 'MONEY':
          entity.normalized = this.normalizeMoneyEntity(entity.text);
          break;

        case 'LOC':
          entity.normalized = this.normalizeLocationEntity(entity.text);
          break;

        case 'ORG':
          entity.normalized = this.normalizeOrganizationEntity(entity.text);
          break;

        case 'PERSON':
          entity.normalized = this.normalizePersonEntity(entity.text);
          break;
      }
    }
  }

  // Méthodes de normalisation spécialisées

  private normalizeDateEntity(dateText: string): string {
    // Convertir différents formats de date vers un format standard
    const frenchMonths: Record<string, string> = {
      'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
      'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
      'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
    };

    for (const [french, numeric] of Object.entries(frenchMonths)) {
      if (dateText.toLowerCase().includes(french)) {
        const match = dateText.match(/(\d{1,2})(?:er)?\s+\w+\s+(\d{4})/);
        if (match) {
          return `${match[1].padStart(2, '0')}/${numeric}/${match[2]}`;
        }
      }
    }

    return dateText;
  }

  private normalizeMoneyEntity(moneyText: string): string {
    const match = moneyText.match(/(\d+(?:[.,]\d{2})?)/);
    if (match) {
      const amount = match[1].replace(',', '.');
      return `${amount} DZD`;
    }
    return moneyText;
  }

  private normalizeLocationEntity(locationText: string): string {
    return locationText
      .replace(/^(?:wilaya\s+(?:de\s+(?:la\s+)?(?:d\')?)?)/gi, '')
      .replace(/^(?:commune\s+(?:de\s+(?:la\s+)?(?:d\')?)?)/gi, '')
      .trim();
  }

  private normalizeOrganizationEntity(orgText: string): string {
    return orgText.trim();
  }

  private normalizePersonEntity(personText: string): string {
    return personText
      .replace(/^(?:M\.|Mme|Monsieur|Madame|Dr\.?|Professeur)\s+/gi, '')
      .trim();
  }

  /**
   * Extraction de relations entre entités
   */
  private extractEntityRelations(
    entities: NamedEntity[],
    text: string,
    config: EntityExtractionConfig
  ): EntityRelation[] {
    
    const relations: EntityRelation[] = [];
    let relationCounter = 0;

    // Recherche de relations spécifiques
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entity1 = entities[i];
        const entity2 = entities[j];

        // Vérifier si les entités sont proches dans le texte
        const distance = Math.abs(entity1.position.start - entity2.position.start);
        if (distance > 200) continue; // Trop éloignées

        const relation = this.detectEntityRelation(entity1, entity2, text);
        if (relation && relation.confidence >= config.confidenceThreshold) {
          relations.push({
            ...relation,
            id: `rel_${relationCounter++}`
          });
        }
      }
    }

    return relations;
  }

  /**
   * Détection de relation entre deux entités
   */
  private detectEntityRelation(
    entity1: NamedEntity,
    entity2: NamedEntity,
    text: string
  ): Omit<EntityRelation, 'id'> | null {
    
    const contextStart = Math.min(entity1.position.start, entity2.position.start);
    const contextEnd = Math.max(entity1.position.end, entity2.position.end);
    const relationContext = text.substring(contextStart, contextEnd).toLowerCase();

    // Relations PERSON -> ORG
    if (entity1.type === 'PERSON' && entity2.type === 'ORG') {
      if (/(?:ministre|directeur|chef|président)/.test(relationContext)) {
        return {
          sourceEntity: entity1.id,
          targetEntity: entity2.id,
          relationType: 'WORKS_FOR',
          confidence: 0.8,
          context: relationContext
        };
      }
    }

    // Relations ORG -> LOC
    if (entity1.type === 'ORG' && entity2.type === 'LOC') {
      if (/(?:de\s+(?:la\s+)?(?:du\s+)?|située?\s+à|basée?\s+à)/.test(relationContext)) {
        return {
          sourceEntity: entity1.id,
          targetEntity: entity2.id,
          relationType: 'LOCATED_IN',
          confidence: 0.7,
          context: relationContext
        };
      }
    }

    // Relations LAW -> PERSON (signé par)
    if (entity1.type === 'LAW' && entity2.type === 'PERSON') {
      if (/(?:signé|promulgué|adopté)\s+par/.test(relationContext)) {
        return {
          sourceEntity: entity1.id,
          targetEntity: entity2.id,
          relationType: 'SIGNED_BY',
          confidence: 0.8,
          context: relationContext
        };
      }
    }

    return null;
  }

  /**
   * Liaison d'entités connexes
   */
  private linkRelatedEntities(entities: NamedEntity[], text: string): void {
    for (const entity of entities) {
      const linkedEntities: string[] = [];

      for (const otherEntity of entities) {
        if (entity.id === otherEntity.id) continue;

        // Vérifier la proximité et le contexte
        const distance = Math.abs(entity.position.start - otherEntity.position.start);
        if (distance < 100 && this.areEntitiesRelated(entity, otherEntity)) {
          linkedEntities.push(otherEntity.id);
        }
      }

      if (linkedEntities.length > 0) {
        entity.linkedEntities = linkedEntities;
      }
    }
  }

  /**
   * Vérification si deux entités sont connexes
   */
  private areEntitiesRelated(entity1: NamedEntity, entity2: NamedEntity): boolean {
    // Logique simplifiée - peut être étendue
    const relatedTypes = [
      ['PERSON', 'ORG'],
      ['PERSON', 'TITLE'],
      ['ORG', 'LOC'],
      ['LAW', 'DATE'],
      ['LAW', 'PERSON']
    ];

    return relatedTypes.some(([type1, type2]) =>
      (entity1.type === type1 && entity2.type === type2) ||
      (entity1.type === type2 && entity2.type === type1)
    );
  }

  /**
   * Extraction du contexte
   */
  private extractContext(text: string, position: number, radius: number): string {
    const start = Math.max(0, position - radius);
    const end = Math.min(text.length, position + radius);
    return text.substring(start, end);
  }

  /**
   * Calcul du résumé
   */
  private calculateSummary(
    entities: NamedEntity[],
    relations: EntityRelation[]
  ) {
    const entitiesByType: Record<string, number> = {};
    const entitiesByLanguage: Record<string, number> = {};
    let totalConfidence = 0;

    for (const entity of entities) {
      entitiesByType[entity.type] = (entitiesByType[entity.type] || 0) + 1;
      entitiesByLanguage[entity.language] = (entitiesByLanguage[entity.language] || 0) + 1;
      totalConfidence += entity.confidence;
    }

    return {
      totalEntities: entities.length,
      entitiesByType,
      entitiesByLanguage,
      averageConfidence: entities.length > 0 ? totalConfidence / entities.length : 0,
      totalRelations: relations.length
    };
  }

  /**
   * Recherche d'entités par type
   */
  findEntitiesByType(result: EntityExtractionResult, type: NamedEntity['type']): NamedEntity[] {
    return result.entities.filter(entity => entity.type === type);
  }

  /**
   * Recherche d'entités par sous-type
   */
  findEntitiesBySubtype(result: EntityExtractionResult, subtype: string): NamedEntity[] {
    return result.entities.filter(entity => entity.subtype === subtype);
  }

  /**
   * Recherche d'entités par langue
   */
  findEntitiesByLanguage(result: EntityExtractionResult, language: NamedEntity['language']): NamedEntity[] {
    return result.entities.filter(entity => entity.language === language);
  }
}

export const entityExtractionService = new EntityExtractionService();
export default entityExtractionService;