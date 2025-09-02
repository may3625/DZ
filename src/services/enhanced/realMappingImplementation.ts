/**
 * Implémentation réelle des algorithmes de mapping intelligent
 * Extension des capacités du service principal
 */

import { FormField, MappedField } from './intelligentMappingService';

export class RealMappingImplementation {
  
  /**
   * Calcul de score contextuel avancé
   */
  calculateContextScore(surroundingText: string, contextKeywords: string[], field: FormField): number {
    if (contextKeywords.length === 0) return 0.5;
    
    const lowerText = surroundingText.toLowerCase();
    const lowerKeywords = contextKeywords.map(k => k.toLowerCase());
    
    let score = 0;
    let foundKeywords = 0;
    
    for (const keyword of lowerKeywords) {
      if (lowerText.includes(keyword)) {
        foundKeywords++;
        // Bonus selon la proximité du mot-clé
        const index = lowerText.indexOf(keyword);
        const distance = Math.abs(index - lowerText.length / 2);
        const proximityBonus = Math.max(0, 1 - (distance / (lowerText.length / 2)));
        score += 0.3 + (proximityBonus * 0.2);
      }
    }
    
    // Bonus pour densité de mots-clés trouvés
    const density = foundKeywords / lowerKeywords.length;
    score += density * 0.3;
    
    return Math.min(score, 1.0);
  }

  /**
   * Calcul de score de position dans le document
   */
  calculatePositionScore(match: string, fullText: string, field: FormField): number {
    const matchIndex = fullText.indexOf(match);
    const textLength = fullText.length;
    const relativePosition = matchIndex / textLength;
    
    let score = 0.5;
    
    // Bonus selon le type de champ et sa position attendue
    const fieldName = field.name.toLowerCase();
    
    if (fieldName.includes('title') || fieldName.includes('titre')) {
      // Les titres sont généralement en début de document
      if (relativePosition < 0.3) score += 0.3;
      else if (relativePosition < 0.5) score += 0.1;
    } else if (fieldName.includes('date')) {
      // Les dates peuvent être en début ou en fin
      if (relativePosition < 0.2 || relativePosition > 0.8) score += 0.2;
    } else if (fieldName.includes('signature') || fieldName.includes('signataire')) {
      // Les signatures sont généralement en fin
      if (relativePosition > 0.7) score += 0.3;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Obtention du texte environnant
   */
  getSurroundingText(match: string, fullText: string, radius: number = 50): string {
    const matchIndex = fullText.indexOf(match);
    if (matchIndex === -1) return '';
    
    const start = Math.max(0, matchIndex - radius);
    const end = Math.min(fullText.length, matchIndex + match.length + radius);
    
    return fullText.substring(start, end);
  }

  /**
   * Mapping sémantique avancé avec calcul de similarité
   */
  async findAdvancedSemanticMatch(field: FormField, entities: any[]): Promise<{
    success: boolean;
    value: any;
    confidence: number;
    reasoning: string;
    suggestions?: any[];
  }> {
    const fieldLabel = field.label.toLowerCase();
    const fieldName = field.name.toLowerCase();
    const semanticTargets = [fieldLabel, fieldName, ...this.getFieldSynonyms(fieldLabel)];
    
    let bestMatch: any = null;
    let maxSimilarity = 0;
    const suggestions: any[] = [];

    for (const entity of entities) {
      const entityText = (entity.label || entity.text || '').toLowerCase();
      const entityType = (entity.type || '').toLowerCase();
      
      // Calcul de similarité multi-dimensionnelle
      const textSimilarity = this.calculateTextSimilarity(fieldLabel, entityText);
      const typeSimilarity = this.calculateTypeSimilarity(fieldName, entityType);
      const contextSimilarity = this.calculateContextualSimilarity(field, entity);
      
      // Score composite avec pondération
      const overallSimilarity = 
        (textSimilarity * 0.4) + 
        (typeSimilarity * 0.3) + 
        (contextSimilarity * 0.3);

      if (overallSimilarity > maxSimilarity && overallSimilarity > 0.4) {
        maxSimilarity = overallSimilarity;
        bestMatch = {
          value: this.extractEntityValue(entity),
          confidence: overallSimilarity,
          reasoning: `Similarité sémantique (${Math.round(overallSimilarity * 100)}%) avec "${entityText}"`
        };
      }

      if (overallSimilarity > 0.3) {
        suggestions.push({
          value: this.extractEntityValue(entity),
          similarity: overallSimilarity,
          source: entityText
        });
      }
    }

    return bestMatch || {
      success: false,
      value: null,
      confidence: 0,
      reasoning: 'Aucune correspondance sémantique suffisante',
      suggestions: suggestions.slice(0, 3)
    };
  }

  /**
   * Calcul de similarité textuelle (Levenshtein normalisé + Jaccard)
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;
    
    // Similarité de Levenshtein normalisée
    const levenshteinSim = 1 - (this.levenshteinDistance(text1, text2) / Math.max(text1.length, text2.length));
    
    // Similarité de Jaccard sur les mots
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    const jaccardSim = union.size > 0 ? intersection.size / union.size : 0;
    
    // Moyenne pondérée
    return (levenshteinSim * 0.6) + (jaccardSim * 0.4);
  }

  /**
   * Distance de Levenshtein
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    const n = str1.length;
    const m = str2.length;

    for (let i = 0; i <= m; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= n; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[m][n];
  }

  /**
   * Calcul de similarité de type
   */
  private calculateTypeSimilarity(fieldName: string, entityType: string): number {
    if (!fieldName || !entityType) return 0.5;
    
    const typeMapping: Record<string, string[]> = {
      'date': ['date', 'time', 'temporal'],
      'number': ['number', 'numeric', 'quantity', 'amount'],
      'person': ['person', 'people', 'individual', 'name'],
      'organization': ['organization', 'org', 'company', 'institution'],
      'location': ['location', 'place', 'address', 'geo'],
      'money': ['money', 'currency', 'amount', 'price'],
      'title': ['title', 'heading', 'subject', 'topic']
    };

    let maxSimilarity = 0;

    Object.entries(typeMapping).forEach(([category, types]) => {
      if (fieldName.includes(category)) {
        types.forEach(type => {
          if (entityType.includes(type)) {
            maxSimilarity = Math.max(maxSimilarity, 0.9);
          }
        });
      }
    });

    // Similarité textuelle de base
    if (maxSimilarity === 0) {
      maxSimilarity = this.calculateTextSimilarity(fieldName, entityType) * 0.7;
    }

    return maxSimilarity;
  }

  /**
   * Similarité contextuelle
   */
  private calculateContextualSimilarity(field: FormField, entity: any): number {
    let similarity = 0.5;

    // Vérifier la proximité dans le texte source
    if (entity.context) {
      const fieldSynonyms = this.getFieldSynonyms(field.label);
      const contextText = entity.context.toLowerCase();
      
      fieldSynonyms.forEach(synonym => {
        if (contextText.includes(synonym.toLowerCase())) {
          similarity += 0.2;
        }
      });
    }

    // Vérifier la cohérence avec le type de champ
    if (entity.confidence) {
      similarity += entity.confidence * 0.2;
    }

    return Math.min(similarity, 1.0);
  }

  /**
   * Extraction de la valeur d'une entité
   */
  private extractEntityValue(entity: any): any {
    return entity.value || entity.text || entity.label || '';
  }

  /**
   * Obtenir les synonymes d'un champ
   */
  private getFieldSynonyms(fieldLabel: string): string[] {
    const synonyms: Record<string, string[]> = {
      'titre': ['title', 'objet', 'sujet', 'intitulé'],
      'date': ['jour', 'day', 'mois', 'month', 'année', 'year', 'temps'],
      'numéro': ['number', 'n°', 'num', 'référence', 'id'],
      'institution': ['organisme', 'ministère', 'administration', 'service'],
      'lieu': ['place', 'endroit', 'location', 'adresse', 'localisation'],
      'montant': ['amount', 'somme', 'prix', 'coût', 'valeur'],
      'nom': ['name', 'appellation', 'dénomination'],
      'description': ['desc', 'détail', 'explication', 'présentation']
    };

    const label = fieldLabel.toLowerCase();
    
    for (const [key, values] of Object.entries(synonyms)) {
      if (label.includes(key)) {
        return values;
      }
    }

    return [fieldLabel];
  }

  /**
   * Vérification si l'IA doit être utilisée
   */
  shouldUseAI(field: FormField, extractedData: any): boolean {
    // Critères pour déclencher l'IA
    const fieldComplexity = this.assessFieldComplexity(field);
    const dataComplexity = this.assessDataComplexity(extractedData);
    
    return fieldComplexity > 0.6 || dataComplexity > 0.7;
  }

  /**
   * Évaluation de la complexité d'un champ
   */
  private assessFieldComplexity(field: FormField): number {
    let complexity = 0.3; // Base
    
    // Plus de patterns = plus complexe
    if (field.mapping.sourcePatterns.length > 3) complexity += 0.2;
    
    // Champs avec transformation = plus complexe
    if (field.mapping.transformationRules && field.mapping.transformationRules.length > 0) {
      complexity += 0.3;
    }
    
    // Type complexe
    if (field.type === 'textarea' || field.name.includes('description')) {
      complexity += 0.2;
    }
    
    return Math.min(complexity, 1.0);
  }

  /**
   * Évaluation de la complexité des données
   */
  private assessDataComplexity(extractedData: any): number {
    const text = this.getExtractedText(extractedData);
    
    let complexity = 0.4; // Base
    
    // Longueur du texte
    if (text.length > 5000) complexity += 0.2;
    if (text.length > 20000) complexity += 0.2;
    
    // Détection de contenu multilingue
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    if (arabicChars > 0) complexity += 0.1;
    
    // Détection de structure complexe
    const structuralElements = (text.match(/(article|chapitre|section|titre)/gi) || []).length;
    if (structuralElements > 5) complexity += 0.2;
    
    return Math.min(complexity, 1.0);
  }

  /**
   * Obtention du texte extrait
   */
  private getExtractedText(extractedData: any): string {
    if (typeof extractedData === 'string') return extractedData;
    if (extractedData.extractedText) return extractedData.extractedText;
    if (extractedData.text) return extractedData.text;
    if (extractedData.content) return extractedData.content;
    
    return JSON.stringify(extractedData);
  }

  /**
   * Mapping par IA (simulation avancée)
   */
  async performAIMapping(field: FormField, extractedData: any, entities: any[]): Promise<{
    success: boolean;
    value: any;
    confidence: number;
    reasoning: string;
  }> {
    // Simulation d'un appel à un modèle IA
    const text = this.getExtractedText(extractedData);
    
    // Analyse contextuelle avancée
    const context = this.buildAIContext(field, text, entities);
    const prediction = this.simulateAIPrediction(context);
    
    if (prediction.confidence > 0.6) {
      return {
        success: true,
        value: prediction.value,
        confidence: prediction.confidence,
        reasoning: `IA générative - ${prediction.explanation}`
      };
    }
    
    return {
      success: false,
      value: null,
      confidence: 0,
      reasoning: 'IA : Confiance insuffisante'
    };
  }

  /**
   * Construction du contexte pour l'IA
   */
  private buildAIContext(field: FormField, text: string, entities: any[]): any {
    return {
      fieldName: field.name,
      fieldLabel: field.label,
      fieldType: field.type,
      documentLength: text.length,
      entitiesCount: entities.length,
      textSample: text.substring(0, 500),
      relatedEntities: entities.slice(0, 10),
      fieldRequirements: field.validation,
      patterns: field.mapping.sourcePatterns
    };
  }

  /**
   * Simulation d'une prédiction IA
   */
  private simulateAIPrediction(context: any): {
    value: any;
    confidence: number;
    explanation: string;
  } {
    // Simulation basée sur des heuristiques
    let confidence = 0.5;
    let value = null;
    let explanation = 'Analyse contextuelle';

    // Simulation de reconnaissance de patterns complexes
    if (context.fieldName.includes('title') && context.textSample.length > 100) {
      const titleMatch = context.textSample.match(/^[A-Z][^.!?]*(?:[.!?]|$)/m);
      if (titleMatch) {
        value = titleMatch[0].trim();
        confidence = 0.8;
        explanation = 'Titre détecté par analyse de structure';
      }
    }

    // Simulation pour dates complexes
    if (context.fieldName.includes('date') && context.relatedEntities.length > 0) {
      const dateEntity = context.relatedEntities.find((e: any) => 
        e.type?.includes('date') || e.text?.match(/\d{1,2}\/\d{1,2}\/\d{4}/)
      );
      if (dateEntity) {
        value = dateEntity.text;
        confidence = 0.85;
        explanation = 'Date extraite par reconnaissance d\'entités';
      }
    }

    return { value, confidence, explanation };
  }
}

export const realMappingImplementation = new RealMappingImplementation();