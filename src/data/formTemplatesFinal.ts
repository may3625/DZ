import { ENRICHED_FORM_TEMPLATES, EnrichedFormTemplate } from './enrichedFormTemplates';
import { FormTemplate } from './formTemplates';

// Export des templates enrichis comme templates finaux
export const formTemplatesFinal = ENRICHED_FORM_TEMPLATES;
export const ALL_FORM_TEMPLATES = ENRICHED_FORM_TEMPLATES;

// Interface unifiée
export type { EnrichedFormTemplate, FormTemplate };

export default formTemplatesFinal;