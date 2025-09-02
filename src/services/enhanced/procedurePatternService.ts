/* eslint-disable no-useless-escape */
/**
 * Service de reconnaissance de motifs de procédures administratives (Étape 10)
 * Extraction spécialisée pour workflows et procédures algériennes
 * Identification des étapes, délais, documents requis et coûts
 */

export interface ProcedureStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  estimatedDuration?: string;
  requiredDocuments: string[];
  location?: string;
  cost?: string;
  responsible?: string;
  prerequisites?: string[];
  confidence: number;
  position: { start: number; end: number };
}

export interface RequiredDocument {
  id: string;
  name: string;
  type: 'certificate' | 'form' | 'identification' | 'proof' | 'declaration' | 'other';
  isOriginal: boolean;
  copies?: number;
  validity?: string;
  issuer?: string;
  confidence: number;
  position: { start: number; end: number };
}

export interface TimelineElement {
  id: string;
  type: 'deadline' | 'duration' | 'waiting_period' | 'validity_period';
  value: string;
  unit: 'days' | 'weeks' | 'months' | 'years' | 'hours';
  numericValue?: number;
  context: string;
  confidence: number;
  position: { start: number; end: number };
}

export interface CostElement {
  id: string;
  description: string;
  amount?: string;
  currency: 'DZD' | 'EUR' | 'USD';
  type: 'fee' | 'tax' | 'stamp' | 'service_charge' | 'penalty';
  paymentLocation?: string;
  paymentMethod?: string;
  confidence: number;
  position: { start: number; end: number };
}

export interface ContactInfo {
  id: string;
  type: 'office' | 'person' | 'service' | 'hotline';
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  confidence: number;
  position: { start: number; end: number };
}

export interface ProcedurePatternResult {
  procedureSteps: ProcedureStep[];
  requiredDocuments: RequiredDocument[];
  timeline: TimelineElement[];
  costs: CostElement[];
  contacts: ContactInfo[];
  summary: {
    totalSteps: number;
    estimatedTotalDuration?: string;
    totalCost?: string;
    documentsCount: number;
    averageConfidence: number;
  };
  processingTime: number;
}

export interface ProcedurePatternConfig {
  enableStepDetection: boolean;
  enableDocumentExtraction: boolean;
  enableTimelineExtraction: boolean;
  enableCostExtraction: boolean;
  enableContactExtraction: boolean;
  confidenceThreshold: number;
  strictDocumentValidation: boolean;
}

class ProcedurePatternService {
  private readonly DEFAULT_CONFIG: ProcedurePatternConfig = {
    enableStepDetection: true,
    enableDocumentExtraction: true,
    enableTimelineExtraction: true,
    enableCostExtraction: true,
    enableContactExtraction: true,
    confidenceThreshold: 0.6,
    strictDocumentValidation: false
  };

  // Patterns pour procédures administratives algériennes
  private readonly PROCEDURE_PATTERNS = {
    // Étapes de procédure
    steps: [
      {
        pattern: /(?:étape|phase|stade)\s*(\d+)\s*[:\-]?\s*(.{1,200}?)(?=\n|étape|phase|$)/gi,
        extract: ['step_number', 'description']
      },
      {
        pattern: /(\d+)[\.\-\)]\s*(.{1,200}?)(?=\n\d+[\.\-\)]|\n\n|$)/g,
        extract: ['step_number', 'description']
      },
      {
        pattern: /(?:premièrement|deuxièmement|troisièmement|ensuite|puis|enfin|finalement)[:\s]*(.{1,200}?)(?=\n|premièrement|deuxièmement|$)/gi,
        extract: ['description']
      }
    ],

    // Documents requis
    documents: [
      {
        pattern: /(?:acte\s+de\s+naissance|extrait\s+de\s+naissance)(?:\s+(original|copie))?\s*(?:\((\d+)\s*copies?\))?/gi,
        type: 'certificate',
        extract: ['document_type', 'original_copy', 'copies']
      },
      {
        pattern: /(?:carte\s+d'identité|carte\s+nationale|cin)(?:\s+(original|copie))?\s*(?:\((\d+)\s*copies?\))?/gi,
        type: 'identification',
        extract: ['document_type', 'original_copy', 'copies']
      },
      {
        pattern: /(?:certificat|attestation)\s+(?:de\s+)?(.{1,50}?)(?:\s+(original|copie))?\s*(?:\((\d+)\s*copies?\))?/gi,
        type: 'certificate',
        extract: ['document_name', 'original_copy', 'copies']
      },
      {
        pattern: /formulaire\s+(.{1,50}?)(?:\s+(?:dûment\s+)?(?:rempli|complété))?/gi,
        type: 'form',
        extract: ['form_name']
      },
      {
        pattern: /(?:justificatif|preuve)\s+(?:de\s+)?(.{1,50})/gi,
        type: 'proof',
        extract: ['proof_type']
      }
    ],

    // Délais et durées
    timeline: [
      {
        pattern: /(?:délai|durée|période)\s*(?:de\s+)?(\d+)\s*(jours?|semaines?|mois|années?)/gi,
        extract: ['duration', 'unit']
      },
      {
        pattern: /(?:dans\s+(?:les\s+)?|sous\s+|avant\s+)(\d+)\s*(jours?|semaines?|mois|années?)/gi,
        extract: ['duration', 'unit']
      },
      {
        pattern: /(?:validité|valable)\s*(?:de\s+|pendant\s+)?(\d+)\s*(jours?|semaines?|mois|années?)/gi,
        extract: ['duration', 'unit']
      },
      {
        pattern: /(\d+)\s*(?:à\s+)?(\d+)\s*(jours?|semaines?|mois)\s*(?:ouvrables?|ouvrés?)?/gi,
        extract: ['min_duration', 'max_duration', 'unit']
      }
    ],

    // Coûts et frais
    costs: [
      {
        pattern: /(?:frais|coût|tarif|prix)\s*(?:de\s+)?(.{1,50}?)\s*[:\-]?\s*(\d{1,6}(?:[.,]\d{2})?)\s*(?:da|dinars?|dzd)/gi,
        extract: ['cost_description', 'amount']
      },
      {
        pattern: /(\d{1,6}(?:[.,]\d{2})?)\s*(?:da|dinars?|dzd)\s*(?:pour|de)\s*(.{1,50})/gi,
        extract: ['amount', 'cost_description']
      },
      {
        pattern: /timbre\s*(?:fiscal|de\s+)?(\d+)\s*(?:da|dinars?)/gi,
        extract: ['amount']
      },
      {
        pattern: /(?:gratuit|sans\s+frais|aucun\s+coût)/gi,
        extract: []
      }
    ],

    // Lieux et contacts
    contacts: [
      {
        pattern: /(?:adresse|bureau|service)\s*[:\-]?\s*(.{1,100}?)(?=\n|téléphone|email|$)/gi,
        extract: ['address']
      },
      {
        pattern: /(?:téléphone|tél|phone)\s*[:\-]?\s*((?:\+213\s*)?(?:\d{2,3}[\s\-]?){2,4}\d{2,4})/gi,
        extract: ['phone']
      },
      {
        pattern: /(?:email|e-mail|courriel)\s*[:\-]?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
        extract: ['email']
      },
      {
        pattern: /(?:horaires?|heures?)\s*[:\-]?\s*(.{1,100}?)(?=\n|$)/gi,
        extract: ['hours']
      }
    ]
  };

  // Termes de validation pour documents algériens
  private readonly ALGERIAN_DOCUMENT_TERMS = {
    certificates: [
      'acte de naissance', 'extrait de naissance', 'certificat de nationalité',
      'certificat de résidence', 'certificat médical', 'certificat de scolarité',
      'certificat de travail', 'attestation de salaire', 'attestation de domicile'
    ],
    forms: [
      'formulaire de demande', 'imprimé', 'bordereau', 'déclaration',
      'demande manuscrite', 'lettre de motivation'
    ],
    identification: [
      'carte d\'identité', 'carte nationale', 'passeport', 'permis de conduire'
    ],
    proofs: [
      'justificatif de revenus', 'justificatif de domicile', 'preuve de paiement',
      'quittance', 'facture', 'relevé bancaire'
    ]
  };

  /**
   * Étape 10 : Reconnaissance de motifs de procédures administratives
   */
  async recognizeProcedurePatterns(
    text: string,
    config: Partial<ProcedurePatternConfig> = {}
  ): Promise<ProcedurePatternResult> {
    
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = performance.now();

    console.log('📋 Starting procedure pattern recognition...');

    try {
      const result: ProcedurePatternResult = {
        procedureSteps: [],
        requiredDocuments: [],
        timeline: [],
        costs: [],
        contacts: [],
        summary: {
          totalSteps: 0,
          documentsCount: 0,
          averageConfidence: 0
        },
        processingTime: 0
      };

      // Extraction des étapes si activée
      if (mergedConfig.enableStepDetection) {
        result.procedureSteps = this.extractProcedureSteps(text, mergedConfig);
      }

      // Extraction des documents si activée
      if (mergedConfig.enableDocumentExtraction) {
        result.requiredDocuments = this.extractRequiredDocuments(text, mergedConfig);
      }

      // Extraction de la timeline si activée
      if (mergedConfig.enableTimelineExtraction) {
        result.timeline = this.extractTimeline(text, mergedConfig);
      }

      // Extraction des coûts si activée
      if (mergedConfig.enableCostExtraction) {
        result.costs = this.extractCosts(text, mergedConfig);
      }

      // Extraction des contacts si activée
      if (mergedConfig.enableContactExtraction) {
        result.contacts = this.extractContacts(text, mergedConfig);
      }

      // Calcul du résumé
      result.summary = this.calculateSummary(result);

      const processingTime = performance.now() - startTime;
      result.processingTime = processingTime;

      console.log(`✅ Procedure pattern recognition completed in ${processingTime.toFixed(2)}ms`);
      console.log(`📊 Found: ${result.procedureSteps.length} steps, ${result.requiredDocuments.length} documents, ${result.costs.length} costs`);

      return result;

    } catch (error) {
      console.error('❌ Procedure pattern recognition failed:', error);
      throw new Error(`Procedure pattern recognition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extraction des étapes de procédure
   */
  private extractProcedureSteps(text: string, config: ProcedurePatternConfig): ProcedureStep[] {
    const steps: ProcedureStep[] = [];
    let stepCounter = 0;

    for (const patternDef of this.PROCEDURE_PATTERNS.steps) {
      let match;
      patternDef.pattern.lastIndex = 0;

      while ((match = patternDef.pattern.exec(text)) !== null) {
        const context = this.extractContext(text, match.index, 150);
        const confidence = this.calculateStepConfidence(match[0], context);

        if (confidence >= config.confidenceThreshold) {
          const stepNumber = match[1] ? parseInt(match[1]) : stepCounter + 1;
          const description = match[2] || match[1];

          const step: ProcedureStep = {
            id: `step_${stepCounter++}`,
            stepNumber,
            title: this.extractStepTitle(description),
            description: description.trim(),
            estimatedDuration: this.extractDurationFromContext(context),
            requiredDocuments: this.extractDocumentsFromContext(context),
            location: this.extractLocationFromContext(context),
            cost: this.extractCostFromContext(context),
            responsible: this.extractResponsibleFromContext(context),
            confidence,
            position: { start: match.index, end: match.index + match[0].length }
          };

          steps.push(step);
        }
      }
    }

    return this.sortAndValidateSteps(steps);
  }

  /**
   * Extraction des documents requis
   */
  private extractRequiredDocuments(text: string, config: ProcedurePatternConfig): RequiredDocument[] {
    const documents: RequiredDocument[] = [];
    let docCounter = 0;

    for (const patternDef of this.PROCEDURE_PATTERNS.documents) {
      let match;
      patternDef.pattern.lastIndex = 0;

      while ((match = patternDef.pattern.exec(text)) !== null) {
        const confidence = this.calculateDocumentConfidence(match[0], config);

        if (confidence >= config.confidenceThreshold) {
          const document: RequiredDocument = {
            id: `doc_${docCounter++}`,
            name: this.normalizeDocumentName(match[0]),
            type: patternDef.type as RequiredDocument['type'],
            isOriginal: this.determineIfOriginal(match[0]),
            copies: this.extractCopiesCount(match[0]),
            validity: this.extractValidityFromMatch(match[0]),
            issuer: this.extractIssuerFromMatch(match[0]),
            confidence,
            position: { start: match.index, end: match.index + match[0].length }
          };

          documents.push(document);
        }
      }
    }

    return this.deduplicateDocuments(documents);
  }

  /**
   * Extraction de la timeline
   */
  private extractTimeline(text: string, config: ProcedurePatternConfig): TimelineElement[] {
    const timeline: TimelineElement[] = [];
    let timeCounter = 0;

    for (const patternDef of this.PROCEDURE_PATTERNS.timeline) {
      let match;
      patternDef.pattern.lastIndex = 0;

      while ((match = patternDef.pattern.exec(text)) !== null) {
        const context = this.extractContext(text, match.index, 100);
        const confidence = this.calculateTimelineConfidence(match[0], context);

        if (confidence >= config.confidenceThreshold) {
          const timeElement: TimelineElement = {
            id: `time_${timeCounter++}`,
            type: this.determineTimelineType(match[0], context),
            value: match[0],
            unit: this.normalizeTimeUnit(match[2] || match[3]),
            numericValue: parseInt(match[1]),
            context,
            confidence,
            position: { start: match.index, end: match.index + match[0].length }
          };

          timeline.push(timeElement);
        }
      }
    }

    return timeline;
  }

  /**
   * Extraction des coûts
   */
  private extractCosts(text: string, config: ProcedurePatternConfig): CostElement[] {
    const costs: CostElement[] = [];
    let costCounter = 0;

    for (const patternDef of this.PROCEDURE_PATTERNS.costs) {
      let match;
      patternDef.pattern.lastIndex = 0;

      while ((match = patternDef.pattern.exec(text)) !== null) {
        const confidence = this.calculateCostConfidence(match[0]);

        if (confidence >= config.confidenceThreshold) {
          const cost: CostElement = {
            id: `cost_${costCounter++}`,
            description: this.extractCostDescription(match),
            amount: this.extractAmount(match),
            currency: 'DZD',
            type: this.determineCostType(match[0]),
            confidence,
            position: { start: match.index, end: match.index + match[0].length }
          };

          costs.push(cost);
        }
      }
    }

    return costs;
  }

  /**
   * Extraction des contacts
   */
  private extractContacts(text: string, config: ProcedurePatternConfig): ContactInfo[] {
    const contacts: ContactInfo[] = [];
    let contactCounter = 0;

    for (const patternDef of this.PROCEDURE_PATTERNS.contacts) {
      let match;
      patternDef.pattern.lastIndex = 0;

      while ((match = patternDef.pattern.exec(text)) !== null) {
        const confidence = this.calculateContactConfidence(match[0]);

        if (confidence >= config.confidenceThreshold) {
          const contact: ContactInfo = {
            id: `contact_${contactCounter++}`,
            type: this.determineContactType(match[0]),
            name: this.extractContactName(match[0]),
            address: this.extractContactField(match, 'address'),
            phone: this.extractContactField(match, 'phone'),
            email: this.extractContactField(match, 'email'),
            hours: this.extractContactField(match, 'hours'),
            confidence,
            position: { start: match.index, end: match.index + match[0].length }
          };

          contacts.push(contact);
        }
      }
    }

    return contacts;
  }

  // Méthodes utilitaires pour extraction et validation

  private extractContext(text: string, position: number, radius: number): string {
    const start = Math.max(0, position - radius);
    const end = Math.min(text.length, position + radius);
    return text.substring(start, end);
  }

  private calculateStepConfidence(matchText: string, context: string): number {
    let confidence = 0.6;
    
    if (/^\d+[\.\-\)]/.test(matchText)) confidence += 0.2;
    if (/(?:étape|phase|stade)/.test(context.toLowerCase())) confidence += 0.2;
    if (context.length > 50) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private calculateDocumentConfidence(matchText: string, config: ProcedurePatternConfig): number {
    let confidence = 0.5;
    
    // Validation stricte si activée
    if (config.strictDocumentValidation) {
      const isKnownDocument = Object.values(this.ALGERIAN_DOCUMENT_TERMS)
        .flat()
        .some(term => matchText.toLowerCase().includes(term.toLowerCase()));
      
      if (!isKnownDocument) return 0.3;
      confidence += 0.3;
    }
    
    if (/(?:original|copie|\d+\s*copies?)/.test(matchText)) confidence += 0.2;
    if (matchText.length > 10) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private calculateTimelineConfidence(matchText: string, context: string): number {
    let confidence = 0.6;
    
    if (/\d+\s*(?:jours?|semaines?|mois)/.test(matchText)) confidence += 0.3;
    if (/(?:délai|durée|période|dans|sous|avant)/.test(context.toLowerCase())) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  private calculateCostConfidence(matchText: string): number {
    let confidence = 0.7;
    
    if (/\d+(?:[.,]\d{2})?\s*(?:da|dinars?)/.test(matchText)) confidence += 0.2;
    if (/(?:gratuit|sans\s+frais)/.test(matchText)) confidence += 0.3;
    
    return Math.min(confidence, 1.0);
  }

  private calculateContactConfidence(matchText: string): number {
    let confidence = 0.6;
    
    if (/@/.test(matchText)) confidence += 0.3;
    if (/\+213|0\d{9}/.test(matchText)) confidence += 0.3;
    if (/(?:rue|avenue|boulevard|cité)/.test(matchText.toLowerCase())) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  // Méthodes utilitaires additionnelles pour normalisation et extraction

  private extractStepTitle(description: string): string {
    const sentences = description.split(/[.!?]/);
    return sentences[0].trim().substring(0, 100);
  }

  private normalizeDocumentName(docText: string): string {
    return docText.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  private determineIfOriginal(docText: string): boolean {
    return /original/.test(docText.toLowerCase());
  }

  private extractCopiesCount(docText: string): number | undefined {
    const match = docText.match(/\((\d+)\s*copies?\)/);
    return match ? parseInt(match[1]) : undefined;
  }

  private normalizeTimeUnit(unit: string): TimelineElement['unit'] {
    const unitMap: Record<string, TimelineElement['unit']> = {
      'jour': 'days', 'jours': 'days',
      'semaine': 'weeks', 'semaines': 'weeks',
      'mois': 'months',
      'année': 'years', 'années': 'years', 'ans': 'years',
      'heure': 'hours', 'heures': 'hours'
    };
    return unitMap[unit.toLowerCase()] || 'days';
  }

  private determineTimelineType(matchText: string, context: string): TimelineElement['type'] {
    if (/validité|valable/.test(context.toLowerCase())) return 'validity_period';
    if (/délai|avant|sous/.test(context.toLowerCase())) return 'deadline';
    if (/attente|attendre/.test(context.toLowerCase())) return 'waiting_period';
    return 'duration';
  }

  private determineCostType(costText: string): CostElement['type'] {
    if (/timbre/.test(costText.toLowerCase())) return 'stamp';
    if (/taxe/.test(costText.toLowerCase())) return 'tax';
    if (/frais/.test(costText.toLowerCase())) return 'fee';
    return 'service_charge';
  }

  private determineContactType(contactText: string): ContactInfo['type'] {
    if (/@/.test(contactText)) return 'service';
    if (/\+213|0\d{9}/.test(contactText)) return 'hotline';
    if (/(?:rue|avenue|boulevard)/.test(contactText.toLowerCase())) return 'office';
    return 'service';
  }

  // Méthodes de post-traitement

  private sortAndValidateSteps(steps: ProcedureStep[]): ProcedureStep[] {
    return steps.sort((a, b) => a.stepNumber - b.stepNumber);
  }

  private deduplicateDocuments(documents: RequiredDocument[]): RequiredDocument[] {
    const seen = new Set<string>();
    return documents.filter(doc => {
      const key = doc.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private calculateSummary(result: ProcedurePatternResult) {
    const allConfidences = [
      ...result.procedureSteps.map(s => s.confidence),
      ...result.requiredDocuments.map(d => d.confidence),
      ...result.timeline.map(t => t.confidence),
      ...result.costs.map(c => c.confidence),
      ...result.contacts.map(c => c.confidence)
    ];

    const averageConfidence = allConfidences.length > 0
      ? allConfidences.reduce((sum, conf) => sum + conf, 0) / allConfidences.length
      : 0;

    const totalCost = result.costs
      .filter(c => c.amount)
      .reduce((sum, c) => sum + (parseFloat(c.amount!) || 0), 0);

    return {
      totalSteps: result.procedureSteps.length,
      documentsCount: result.requiredDocuments.length,
      averageConfidence,
      totalCost: totalCost > 0 ? `${totalCost} DZD` : undefined,
      estimatedTotalDuration: this.calculateTotalDuration(result.timeline)
    };
  }

  private calculateTotalDuration(timeline: TimelineElement[]): string | undefined {
    const durations = timeline.filter(t => t.type === 'duration' && t.numericValue);
    if (durations.length === 0) return undefined;

    const totalDays = durations.reduce((sum, d) => {
      const multiplier = d.unit === 'weeks' ? 7 : d.unit === 'months' ? 30 : 1;
      return sum + (d.numericValue! * multiplier);
    }, 0);

    if (totalDays < 7) return `${totalDays} jours`;
    if (totalDays < 30) return `${Math.ceil(totalDays / 7)} semaines`;
    return `${Math.ceil(totalDays / 30)} mois`;
  }

  // Méthodes d'extraction spécialisées
  private extractDurationFromContext(context: string): string | undefined {
    const match = context.match(/(\d+)\s*(jours?|semaines?|mois)/i);
    return match ? `${match[1]} ${match[2]}` : undefined;
  }

  private extractDocumentsFromContext(context: string): string[] {
    // Simplifiée - peut être étendue
    return [];
  }

  private extractLocationFromContext(context: string): string | undefined {
    const locationMatch = context.match(/(?:à|au|chez)\s+([A-Z][^.!?]*)/);
    return locationMatch ? locationMatch[1].trim() : undefined;
  }

  private extractCostFromContext(context: string): string | undefined {
    const costMatch = context.match(/(\d+(?:[.,]\d{2})?)\s*(?:da|dinars?)/i);
    return costMatch ? `${costMatch[1]} DZD` : undefined;
  }

  private extractResponsibleFromContext(context: string): string | undefined {
    const responsibleMatch = context.match(/(?:par|chez|auprès\s+(?:de|du))\s+([^.!?\n]*)/i);
    return responsibleMatch ? responsibleMatch[1].trim() : undefined;
  }

  private extractValidityFromMatch(matchText: string): string | undefined {
    const validityMatch = matchText.match(/valable\s+(\d+\s*\w+)/i);
    return validityMatch ? validityMatch[1] : undefined;
  }

  private extractIssuerFromMatch(matchText: string): string | undefined {
    const issuerMatch = matchText.match(/délivré\s+par\s+([^.!?\n]*)/i);
    return issuerMatch ? issuerMatch[1].trim() : undefined;
  }

  private extractCostDescription(match: RegExpExecArray): string {
    return match[1] || match[2] || 'Frais de service';
  }

  private extractAmount(match: RegExpExecArray): string | undefined {
    // Cherche un montant dans les groupes capturés
    for (let i = 1; i < match.length; i++) {
      if (match[i] && /\d+(?:[.,]\d{2})?/.test(match[i])) {
        return match[i];
      }
    }
    return undefined;
  }

  private extractContactName(contactText: string): string {
    const lines = contactText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    return lines[0] || 'Contact';
  }

  private extractContactField(match: RegExpExecArray, field: string): string | undefined {
    // Simplifiée - retourne le groupe capturé correspondant
    return match[1];
  }
}

export const procedurePatternService = new ProcedurePatternService();
export default procedurePatternService;