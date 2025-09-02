// Configuration et données spécifiques à l'Algérie pour l'OCR
export const CONFIG_ALGERIA = {
  languages: ['fra', 'ara'],
  localProcessing: true,
  independent: true,
  optimizedForAlgeria: true
};

// Expressions régulières pour détecter les entités juridiques algériennes
export const REGEX_JURIDIQUE_ALGERIA = {
  // Lois algériennes (ex: Loi n° 08-09 du 25 février 2008)
  loi: /(?:loi|Loi)\s+n°?\s*(\d{1,2})-(\d{2})\s+du\s+(\d{1,2})\s+(\w+)\s+(\d{4})/gi,
  
  // Décrets (ex: Décret exécutif n° 20-123 du 15 mars 2020)
  decret: /(?:décret|Décret)\s+(exécutif|présidentiel)\s+n°?\s*(\d{1,2})-(\d{2,3})\s+du\s+(\d{1,2})\s+(\w+)\s+(\d{4})/gi,
  
  // Arrêtés (ex: Arrêté ministériel n° 456 du 10 janvier 2021)
  arrete: /(?:arrêté|Arrêté)\s+(ministériel|interministériel|de\s+wilaya)\s+n°?\s*(\d+)\s+du\s+(\d{1,2})\s+(\w+)\s+(\d{4})/gi,
  
  // Articles (ex: Article 125, Article 12 bis)
  article: /(?:article|Article)\s+(\d+)(\s+(?:bis|ter|quater)?)?/gi,
  
  // Institutions algériennes
  institution: /(?:République\s+algérienne|Conseil\s+constitutionnel|Cour\s+suprême|Conseil\s+d'État|Assemblée\s+populaire\s+nationale|Conseil\s+de\s+la\s+nation|Présidence\s+de\s+la\s+République|Gouvernement)/gi,
  
  // Wilayas
  wilaya: /(?:wilaya|Wilaya)\s+(?:d[eu']|de\s+la\s+)?([A-Za-zÀ-ÿ\s-]+)/gi
};