/**
 * Données algériennes consolidées pour Dalil.dz
 * Contenu 100% algérien optimisé
 */

export const ALGERIAN_CONSOLIDATED_DATA = {
  version: '1.0.0',
  lastUpdate: new Date().toISOString(),
  source: 'Consolidation automatique',
  algerianContent: true,
  localMode: true,
  data: {
    wilayas: require('../algeria-58-wilayas-real.ts').default,
    legalTemplates: require('../algerianLegalTemplates.ts').default,
    forms: require('../formTemplates.ts').default,
    workflows: require('../algerianWorkflowExamples.ts').default
  }
};

export default ALGERIAN_CONSOLIDATED_DATA;
