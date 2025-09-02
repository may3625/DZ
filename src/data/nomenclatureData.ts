// Données centralisées de nomenclature pour assurer la cohérence
// Ces données sont utilisées dans les onglets de nomenclature et les sélecteurs de formulaires

export interface NomenclatureItem {
  name: string;
  code: string;
  description: string;
  count: number;
  status: string;
}

// Types de textes juridiques complets (40 éléments)
export const ALL_LEGAL_TYPES: NomenclatureItem[] = [
  { name: "Constitution", code: "CON", description: "Loi fondamentale de l'État", count: 1, status: "Actif" },
  { name: "Accord International", code: "ACI", description: "Accord signé avec d'autres États", count: 45, status: "Actif" },
  { name: "Convention Internationale", code: "CVI", description: "Convention multilatérale", count: 67, status: "Actif" },
  { name: "Code", code: "COD", description: "Compilation de textes juridiques", count: 45, status: "Actif" },
  { name: "Loi Organique", code: "LOR", description: "Loi définissant l'organisation des pouvoirs", count: 23, status: "Actif" },
  { name: "Loi", code: "LOI", description: "Texte voté par le Parlement", count: 1250, status: "Actif" },
  { name: "Ordonnance", code: "ORD", description: "Acte du Président de la République", count: 234, status: "Actif" },
  { name: "Décret Législatif", code: "DLG", description: "Décret ayant force de loi", count: 89, status: "Actif" },
  { name: "Décret Présidentiel", code: "DPR", description: "Décret du Président de la République", count: 345, status: "Actif" },
  { name: "Décret Exécutif", code: "DEC", description: "Acte réglementaire du Premier ministre", count: 890, status: "Actif" },
  { name: "Arrêté", code: "ARR", description: "Décision administrative", count: 2340, status: "Actif" },
  { name: "Arrêté interministérielle", code: "AIM", description: "Arrêté signé par plusieurs ministres", count: 456, status: "Actif" },
  { name: "Arrêté ministérielle", code: "ARM", description: "Décision d'un ministre", count: 1234, status: "Actif" },
  { name: "Décision", code: "DEC", description: "Acte administratif individuel", count: 3456, status: "Actif" },
  { name: "Décision interministérielle", code: "DIM", description: "Décision prise par plusieurs ministères", count: 234, status: "Actif" },
  { name: "Avis", code: "AVI", description: "Opinion consultative", count: 567, status: "Actif" },
  { name: "Proclamation", code: "PRO", description: "Annonce officielle solennelle", count: 89, status: "Actif" },
  { name: "Instruction", code: "INS", description: "Directive d'application", count: 789, status: "Actif" },
  { name: "Instruction interministérielle", code: "IIM", description: "Instruction commune à plusieurs ministères", count: 123, status: "Actif" },
  { name: "Règlements", code: "REG", description: "Règles générales d'application", count: 345, status: "Actif" },
  { name: "Circulaire", code: "CIR", description: "Instruction administrative", count: 567, status: "Actif" },
  { name: "Circulaire interministérielle", code: "CIM", description: "Circulaire commune à plusieurs ministères", count: 178, status: "Actif" },
  { name: "Convention", code: "COV", description: "Accord contractuel", count: 234, status: "Actif" },
  { name: "Note", code: "NOT", description: "Communication écrite", count: 456, status: "Actif" },
  { name: "Note circulaire", code: "NCR", description: "Note d'information générale", count: 123, status: "Actif" },
  { name: "Notification", code: "NTF", description: "Acte de porter à connaissance", count: 789, status: "Actif" },
  { name: "Communiqué", code: "COM", description: "Communication publique", count: 345, status: "Actif" },
  { name: "Correspondance", code: "COR", description: "Échange de courriers", count: 567, status: "Actif" },
  { name: "Délibération", code: "DEL", description: "Décision prise après débat", count: 234, status: "Actif" },
  { name: "Résolutions", code: "RES", description: "Décision formelle", count: 456, status: "Actif" },
  { name: "Déclaration", code: "DCL", description: "Énoncé officiel", count: 123, status: "Actif" },
  { name: "Bulletin d'information", code: "BIN", description: "Publication d'informations", count: 789, status: "Actif" },
  { name: "Jurisprudence", code: "JUR", description: "Ensemble des décisions de justice", count: 2456, status: "Actif" },
  { name: "Cahier de charge", code: "CDC", description: "Document définissant les exigences", count: 345, status: "Actif" },
  { name: "Cahier des clauses administratives générales", code: "CAG", description: "Clauses générales des marchés publics", count: 67, status: "Actif" },
  { name: "Discours", code: "DIS", description: "Allocution officielle", count: 234, status: "Actif" },
  { name: "Rapport, Guide", code: "RAP", description: "Document d'analyse ou de guidance", count: 567, status: "Actif" },
  { name: "Plan d'action", code: "PLA", description: "Programme d'actions structuré", count: 123, status: "Actif" },
  { name: "Barème, Norme", code: "BAR", description: "Échelle de valeurs ou standard", count: 456, status: "Actif" },
  { name: "Procès-verbal", code: "PVB", description: "Compte-rendu officiel", count: 789, status: "Actif" }
];

// Catégories de procédures complètes (16 éléments)
export const ALL_PROCEDURE_CATEGORIES: NomenclatureItem[] = [
  { name: "État Civil", code: "ETI", description: "Actes et documents d'état civil", count: 45, status: "Actif" },
  { name: "Urbanisme", code: "URB", description: "Permis et autorisations d'urbanisme", count: 67, status: "Actif" },
  { name: "Commerce", code: "COM", description: "Registre du commerce et activités", count: 89, status: "Actif" },
  { name: "Emploi", code: "EMP", description: "Demandes d'emploi et formation", count: 123, status: "Actif" },
  { name: "Santé", code: "SAN", description: "Cartes et services de santé", count: 78, status: "Actif" },
  { name: "Éducation", code: "EDU", description: "Inscriptions et diplômes", count: 156, status: "Actif" },
  { name: "Transport", code: "TRA", description: "Permis et autorisations de transport", count: 234, status: "Actif" },
  { name: "Fiscalité", code: "FIS", description: "Déclarations et paiements fiscaux", count: 345, status: "Actif" },
  { name: "Logement", code: "LOG", description: "Demandes de logement social", count: 112, status: "Actif" },
  { name: "Agriculture", code: "AGR", description: "Subventions et autorisations agricoles", count: 89, status: "Actif" },
  { name: "Environnement", code: "ENV", description: "Autorisations environnementales", count: 67, status: "Actif" },
  { name: "Culture", code: "CUL", description: "Subventions culturelles", count: 45, status: "Actif" },
  { name: "Sports", code: "SPO", description: "Licences et autorisations sportives", count: 78, status: "Actif" },
  { name: "Tourisme", code: "TOU", description: "Autorisations touristiques", count: 56, status: "Actif" },
  { name: "Industrie", code: "IND", description: "Autorisations industrielles", count: 134, status: "Actif" },
  { name: "Mines", code: "MIN", description: "Concessions minières", count: 23, status: "Actif" }
];

// Fonctions utilitaires pour convertir vers le format FormField compatible
export const convertNomenclatureToFormOptions = (items: NomenclatureItem[]): string[] => {
  return items.map(item => item.name);
};

// Fonction pour obtenir un élément par code
export const getNomenclatureItemByCode = (code: string, type: 'legal' | 'procedure'): NomenclatureItem | undefined => {
  const data = type === 'legal' ? ALL_LEGAL_TYPES : ALL_PROCEDURE_CATEGORIES;
  return data.find(item => item.code === code);
};

// Fonction pour obtenir un élément par nom
export const getNomenclatureItemByName = (name: string, type: 'legal' | 'procedure'): NomenclatureItem | undefined => {
  const data = type === 'legal' ? ALL_LEGAL_TYPES : ALL_PROCEDURE_CATEGORIES;
  return data.find(item => item.name === name);
};