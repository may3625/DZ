import { FormTemplate } from '@/data/formTemplates';
import { FormField } from '@/components/configuration/form-generator/types';

// Interface pour les templates enrichis avec traduction
export interface EnrichedFormTemplate extends FormTemplate {
  translations?: {
    [languageCode: string]: {
      name: string;
      description: string;
      fields: Array<{
        label: string;
        placeholder?: string;
        options?: string[];
      }>;
    };
  };
  organization?: string;
  signatory?: string;
  legalDomain?: string;
  status?: string;
}

// Création des formulaires enrichis basés sur les données de nomenclature
export const createEnrichedFormTemplates = (): EnrichedFormTemplate[] => {
  
  // Types de textes juridiques (du NomenclatureSection)
  const legalTypes = [
    { name: "Constitution", code: "CON", description: "Loi fondamentale de l'État" },
    { name: "Accord International", code: "ACI", description: "Accord signé avec d'autres États" },
    { name: "Convention Internationale", code: "CVI", description: "Convention multilatérale" },
    { name: "Code", code: "COD", description: "Compilation de textes juridiques" },
    { name: "Loi Organique", code: "LOR", description: "Loi définissant l'organisation des pouvoirs" },
    { name: "Loi", code: "LOI", description: "Texte voté par le Parlement" },
    { name: "Ordonnance", code: "ORD", description: "Acte du Président de la République" },
    { name: "Décret Législatif", code: "DLG", description: "Décret ayant force de loi" },
    { name: "Décret Présidentiel", code: "DPR", description: "Décret du Président de la République" },
    { name: "Décret Exécutif", code: "DEC", description: "Acte réglementaire du Premier ministre" },
    { name: "Arrêté", code: "ARR", description: "Décision administrative" },
    { name: "Arrêté interministérielle", code: "AIM", description: "Arrêté signé par plusieurs ministres" },
    { name: "Arrêté ministérielle", code: "ARM", description: "Décision d'un ministre" },
    { name: "Décision", code: "DEC", description: "Acte administratif individuel" },
    { name: "Instruction", code: "INS", description: "Directive d'application" },
    { name: "Règlements", code: "REG", description: "Règles générales d'application" },
    { name: "Circulaire", code: "CIR", description: "Instruction administrative" },
    { name: "Convention", code: "COV", description: "Accord contractuel" }
  ];

  // Catégories de procédures (du NomenclatureSection)
  const procedureCategories = [
    { name: "État Civil", code: "ETI", description: "Actes et documents d'état civil" },
    { name: "Urbanisme", code: "URB", description: "Permis et autorisations d'urbanisme" },
    { name: "Commerce", code: "COM", description: "Registre du commerce et activités" },
    { name: "Emploi", code: "EMP", description: "Demandes d'emploi et formation" },
    { name: "Santé", code: "SAN", description: "Cartes et services de santé" },
    { name: "Éducation", code: "EDU", description: "Inscriptions et diplômes" },
    { name: "Transport", code: "TRA", description: "Permis et autorisations de transport" },
    { name: "Fiscalité", code: "FIS", description: "Déclarations et paiements fiscaux" },
    { name: "Logement", code: "LOG", description: "Demandes de logement social" },
    { name: "Agriculture", code: "AGR", description: "Subventions et autorisations agricoles" },
    { name: "Environnement", code: "ENV", description: "Autorisations environnementales" },
    { name: "Culture", code: "CUL", description: "Subventions culturelles" }
  ];

  // Domaines juridiques (du NomenclatureSection)
  const legalDomains = [
    "Droit Civil", "Droit Pénal", "Droit Commercial", "Droit Administratif",
    "Droit du Travail", "Droit Fiscal", "Droit International", "Droit de la Famille",
    "Droit Constitutionnel", "Droit Social", "Droit Bancaire", "Droit de l'Environnement"
  ];

  // Organisations principales
  const organizations = [
    "Présidence de la République",
    "Premier Ministère", 
    "Ministère de la Justice",
    "Ministère de l'Intérieur",
    "Ministère des Finances",
    "Ministère de la Santé",
    "Ministère de l'Éducation Nationale"
  ];

  const templates: EnrichedFormTemplate[] = [];

  // Générer les templates pour Types de Textes Juridiques
  legalTypes.forEach((type, index) => {
    const baseFields: FormField[] = [
      {
        id: 'titre',
        name: 'titre',
        label: 'Titre du document',
        type: 'text',
        required: true,
        placeholder: `Entrez le titre ${type.name.toLowerCase()}`
      },
      {
        id: 'numero',
        name: 'numero',
        label: 'Numéro',
        type: 'text',
        required: true,
        placeholder: `N° ${type.code}-2024-001`
      },
      {
        id: 'date_promulgation',
        name: 'date_promulgation',
        label: 'Date de promulgation',
        type: 'date',
        required: true,
      },
      {
        id: 'organisation',
        name: 'organisation',
        label: 'Organisation émettrice',
        type: 'select',
        required: true,
        options: organizations
      },
      {
        id: 'contenu',
        name: 'contenu',
        label: 'Contenu du document',
        type: 'textarea',
        required: true,
        placeholder: 'Saisissez le contenu détaillé du document juridique'
      },
      {
        id: 'domaine_juridique',
        name: 'domaine_juridique',
        label: 'Domaine juridique',
        type: 'select',
        required: false,
        options: legalDomains
      },
      {
        id: 'statut',
        name: 'statut',
        label: 'Statut',
        type: 'select',
        required: true,
        options: ['En vigueur', 'Projet', 'Abrogé', 'Suspendu']
      }
    ];

    templates.push({
      id: `legal_text_${type.code.toLowerCase()}_${index}`,
      name: `Formulaire ${type.name}`,
      type: 'textes_juridiques',
      description: type.description,
      category: 'Textes Juridiques',
      fields: baseFields,
      legalDomain: 'Droit Administratif',
      status: 'Actif',
      translations: {
        fr: {
          name: `Formulaire ${type.name}`,
          description: type.description,
          fields: baseFields.map(field => ({
            label: field.label,
            placeholder: field.placeholder,
            options: field.options
          }))
        },
        ar: {
          name: `نموذج ${type.name}`,
          description: `نموذج لـ ${type.description}`,
          fields: baseFields.map(field => ({
            label: translateFieldToArabic(field.label),
            placeholder: field.placeholder ? translateFieldToArabic(field.placeholder) : undefined,
            options: field.options?.map(opt => translateFieldToArabic(opt))
          }))
        },
        en: {
          name: `${type.name} Form`,
          description: `Form for ${type.description}`,
          fields: baseFields.map(field => ({
            label: translateFieldToEnglish(field.label),
            placeholder: field.placeholder ? translateFieldToEnglish(field.placeholder) : undefined,
            options: field.options?.map(opt => translateFieldToEnglish(opt))
          }))
        }
      }
    });
  });

  // Générer les templates pour Catégories de Procédures
  procedureCategories.forEach((category, index) => {
    const baseFields: FormField[] = [
      {
        id: 'nom_procedure',
        name: 'nom_procedure',
        label: 'Nom de la procédure',
        type: 'text',
        required: true,
        placeholder: `Nom de la procédure ${category.name.toLowerCase()}`
      },
      {
        id: 'description',
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        placeholder: `Description détaillée de la procédure ${category.name.toLowerCase()}`
      },
      {
        id: 'documents_requis',
        name: 'documents_requis',
        label: 'Documents requis',
        type: 'textarea',
        required: true,
        placeholder: 'Liste des documents nécessaires pour cette procédure'
      },
      {
        id: 'delai_traitement',
        name: 'delai_traitement',
        label: 'Délai de traitement',
        type: 'text',
        required: false,
        placeholder: 'Ex: 30 jours ouvrables'
      },
      {
        id: 'cout',
        name: 'cout',
        label: 'Coût de la procédure',
        type: 'text',
        required: false,
        placeholder: 'Ex: 2000 DA'
      },
      {
        id: 'organisation_responsable',
        name: 'organisation_responsable',
        label: 'Organisation responsable',
        type: 'select',
        required: true,
        options: organizations
      },
      {
        id: 'etapes',
        name: 'etapes',
        label: 'Étapes de la procédure',
        type: 'textarea',
        required: false,
        placeholder: 'Décrivez les étapes principales de la procédure'
      }
    ];

    templates.push({
      id: `procedure_${category.code.toLowerCase()}_${index}`,
      name: `Procédure ${category.name}`,
      type: 'procedures_administratives',
      description: category.description,
      category: 'Procédures Administratives',
      fields: baseFields,
      status: 'Actif',
      translations: {
        fr: {
          name: `Procédure ${category.name}`,
          description: category.description,
          fields: baseFields.map(field => ({
            label: field.label,
            placeholder: field.placeholder,
            options: field.options
          }))
        },
        ar: {
          name: `إجراء ${category.name}`,
          description: `إجراء لـ ${category.description}`,
          fields: baseFields.map(field => ({
            label: translateFieldToArabic(field.label),
            placeholder: field.placeholder ? translateFieldToArabic(field.placeholder) : undefined,
            options: field.options?.map(opt => translateFieldToArabic(opt))
          }))
        },
        en: {
          name: `${category.name} Procedure`,
          description: `Procedure for ${category.description}`,
          fields: baseFields.map(field => ({
            label: translateFieldToEnglish(field.label),
            placeholder: field.placeholder ? translateFieldToEnglish(field.placeholder) : undefined,
            options: field.options?.map(opt => translateFieldToEnglish(opt))
          }))
        }
      }
    });
  });

  return templates;
};

// Fonctions de traduction simplifiées (à améliorer avec un vrai système de traduction)
function translateFieldToArabic(text: string): string {
  const translations: Record<string, string> = {
    'Titre du document': 'عنوان الوثيقة',
    'Numéro': 'الرقم',
    'Date de promulgation': 'تاريخ الإصدار',
    'Organisation émettrice': 'الجهة المصدرة',
    'Contenu du document': 'محتوى الوثيقة',
    'Domaine juridique': 'المجال القانوني',
    'Statut': 'الحالة',
    'Nom de la procédure': 'اسم الإجراء',
    'Description': 'الوصف',
    'Documents requis': 'الوثائق المطلوبة',
    'Délai de traitement': 'مدة المعالجة',
    'Coût de la procédure': 'تكلفة الإجراء',
    'Organisation responsable': 'الجهة المسؤولة',
    'Étapes de la procédure': 'خطوات الإجراء'
  };
  return translations[text] || text;
}

function translateFieldToEnglish(text: string): string {
  const translations: Record<string, string> = {
    'Titre du document': 'Document Title',
    'Numéro': 'Number',
    'Date de promulgation': 'Promulgation Date',
    'Organisation émettrice': 'Issuing Organization',
    'Contenu du document': 'Document Content',
    'Domaine juridique': 'Legal Domain',
    'Statut': 'Status',
    'Nom de la procédure': 'Procedure Name',
    'Description': 'Description',
    'Documents requis': 'Required Documents',
    'Délai de traitement': 'Processing Time',
    'Coût de la procédure': 'Procedure Cost',
    'Organisation responsable': 'Responsible Organization',
    'Étapes de la procédure': 'Procedure Steps'
  };
  return translations[text] || text;
}

// Export des templates enrichis
export const ENRICHED_FORM_TEMPLATES = createEnrichedFormTemplates();

// Fonction pour obtenir les templates par type avec traduction
export function getTemplatesByType(type: string, language: string = 'fr'): EnrichedFormTemplate[] {
  return ENRICHED_FORM_TEMPLATES
    .filter(template => template.type === type)
    .map(template => ({
      ...template,
      name: template.translations?.[language]?.name || template.name,
      description: template.translations?.[language]?.description || template.description,
      fields: template.fields.map((field, index) => ({
        ...field,
        label: template.translations?.[language]?.fields[index]?.label || field.label,
        placeholder: template.translations?.[language]?.fields[index]?.placeholder || field.placeholder,
        options: template.translations?.[language]?.fields[index]?.options || field.options
      }))
    }));
}

// Fonction pour obtenir tous les types disponibles
export function getAvailableFormTypes(): Array<{value: string, label: string}> {
  const types = Array.from(new Set(ENRICHED_FORM_TEMPLATES.map(t => t.type)));
  return types.map(type => ({
    value: type,
    label: type === 'textes_juridiques' ? 'Textes Juridiques' : 'Procédures Administratives'
  }));
}

export default ENRICHED_FORM_TEMPLATES;