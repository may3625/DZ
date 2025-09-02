// Placeholder for form templates
export const formTemplates = [];

export interface FormTemplate {
  id: string;
  name: string;
  type: string;
  description: string;  
  category: string;
  fields: any[];
}

export default formTemplates;