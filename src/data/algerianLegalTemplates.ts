// Types for Algerian legal templates
export interface AlgerianLegalTemplate {
  id: string;
  name: string;
  type: string;
  fields: string[];
  formStructure?: any;
}

export interface FormTemplate {
  id: string;
  name: string;
  type: string;
  fields: string[];
}

// Placeholder for Algerian legal templates
export const algerianLegalTemplates: AlgerianLegalTemplate[] = [];

export function getTemplateByType(type: string): AlgerianLegalTemplate | null {
  return null;
}

export function getFormStructureByType(type: string): FormTemplate | null {
  return null;
}

export default algerianLegalTemplates;