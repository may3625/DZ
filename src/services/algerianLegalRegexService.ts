/**
 * Service d'expressions régulières juridiques spécialisé pour l'Algérie
 * Traite le texte agrégé pour produire des publications structurées
 */

import { logger } from '@/utils/logger';

export interface StructuredPublication {
  title: string;
  number: string;
  date: string;
  type: 'loi' | 'decret' | 'arrete' | 'ordonnance' | 'instruction' | 'circulaire' | 'decision' | 'autre';
  institution: string;
  wilaya?: string;
  sector?: string;
  references: LegalReference[];
  articles: Article[];
  metadata: {
    language: 'ar' | 'fr' | 'mixed';
    wordCount: number;
    processingDate: string;
    confidence: number;
    entities: DetectedEntity[];
  };
}

export interface LegalReference {
  type: 'loi' | 'decret' | 'arrete' | 'ordonnance' | 'instruction' | 'jora' | 'autre';
  number: string;
  date?: string;
  title?: string;
  context: string;
  confidence: number;
}

export interface Article {
  number: string;
  title?: string;
  content: string;
  subsections?: SubSection[];
}

export interface SubSection {
  identifier: string;
  content: string;
}

export interface DetectedEntity {
  type: 'date' | 'number' | 'institution' | 'reference' | 'person' | 'place' | 'amount';
  value: string;
  context: string;
  confidence: number;
  position: { start: number; end: number };
}

/**
 * Patterns pour identifier les types de documents juridiques algériens
 */
const DOCUMENT_TYPE_PATTERNS = {
  loi: [
    /\bLoi\s+n°?\s*(\d+[-\/]\d+)/gi,
    /\bقانون\s+رقم\s*(\d+[-\/]\d+)/g
  ],
  decret: [
    /\bDécret\s+(exécutif\s+|présidentiel\s+)?n°?\s*(\d+[-\/]\d+)/gi,
    /\bمرسوم\s+(تنفيذي\s+|رئاسي\s+)?رقم\s*(\d+[-\/]\d+)/g
  ],
  arrete: [
    /\bArrêté\s+(interministériel\s+|ministériel\s+|du\s+wali\s+)?n°?\s*(\d+[-\/]\d+)/gi,
    /\bقرار\s+(وزاري\s+مشترك\s+|وزاري\s+|والي\s+)?رقم\s*(\d+[-\/]\d+)/g
  ],
  ordonnance: [
    /\bOrdonnance\s+n°?\s*(\d+[-\/]\d+)/gi,
    /\bأمر\s+رقم\s*(\d+[-\/]\d+)/g
  ],
  instruction: [
    /\bInstruction\s+n°?\s*(\d+[-\/]\d+)/gi,
    /\bتعليمة\s+رقم\s*(\d+[-\/]\d+)/g
  ],
  circulaire: [
    /\bCirculaire\s+n°?\s*(\d+[-\/]\d+)/gi,
    /\bمنشور\s+رقم\s*(\d+[-\/]\d+)/g
  ],
  decision: [
    /\bDécision\s+n°?\s*(\d+[-\/]\d+)/gi,
    /\bقرار\s+رقم\s*(\d+[-\/]\d+)/g
  ]
};

/**
 * Patterns pour les institutions algériennes
 */
const INSTITUTION_PATTERNS = [
  // Français
  /\b(Ministère|Ministre)\s+(de\s+|du\s+|des\s+)?([A-ZÀ-Ÿ][a-zà-ÿ\s]+)/gi,
  /\b(Wali|Wilaya)\s+(de\s+|du\s+|d')?([A-ZÀ-Ÿ][a-zà-ÿ\s]+)/gi,
  /\b(Direction|Inspection)\s+(générale\s+|régionale\s+)?([A-ZÀ-Ÿ][a-zà-ÿ\s]+)/gi,
  /\bAPC\s+(de\s+|du\s+|d')?([A-ZÀ-Ÿ][a-zà-ÿ\s]+)/gi,
  /\bAPW\s+(de\s+|du\s+|d')?([A-ZÀ-Ÿ][a-zà-ÿ\s]+)/gi,
  
  // Arabe
  /\b(وزارة|وزير)\s+([ء-ي\s]+)/g,
  /\b(والي|ولاية)\s+([ء-ي\s]+)/g,
  /\b(مديرية|تفتيش)\s+(عامة\s+|جهوية\s+)?([ء-ي\s]+)/g,
  /\b(بلدية|مجلس\s+شعبي\s+بلدي)\s+([ء-ي\s]+)/g,
  /\b(مجلس\s+شعبي\s+ولائي)\s+([ء-ي\s]+)/g
];

/**
 * Patterns pour les références juridiques
 */
const REFERENCE_PATTERNS = [
  // Références aux lois
  /\b(?:Loi|قانون)\s+n°?\s*(\d+[-\/]\d+)(?:\s+du\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{4}))?/gi,
  
  // Références aux décrets
  /\b(?:Décret|مرسوم)\s+(?:exécutif\s+|présidentiel\s+|تنفيذي\s+|رئاسي\s+)?n°?\s*(\d+[-\/]\d+)(?:\s+du\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{4}))?/gi,
  
  // Références JORA
  /\bJORA\s+n°?\s*(\d+)(?:\s+du\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{4}))?/gi,
  /\bالجريدة\s+الرسمية\s+رقم\s*(\d+)(?:\s+المؤرخة\s+في\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{4}))?/g,
  
  // Références d'articles
  /\b(?:article|المادة)\s+(\d+)(?:\s+(?:bis|ter|مكرر))?/gi
];

/**
 * Patterns pour les dates algériennes
 */
const DATE_PATTERNS = [
  // Format français
  /\b(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})\b/gi,
  /\b(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})\b/g,
  
  // Format arabe
  /\b(\d{1,2})\s+(محرم|صفر|ربيع\s+الأول|ربيع\s+الثاني|جمادى\s+الأولى|جمادى\s+الثانية|رجب|شعبان|رمضان|شوال|ذو\s+القعدة|ذو\s+الحجة)\s+(\d{4})\b/g,
  /\bالموافق\s+ل\s*(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/g,
  /\bالمؤرخ\s+في\s+(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/g
];

/**
 * Patterns pour identifier les articles et sections
 */
const ARTICLE_PATTERNS = [
  /^(?:Article|المادة)\s+(\d+)(?:\s*[.-]\s*(.*))?$/gim,
  /^(?:Art|م)\.\s*(\d+)(?:\s*[.-]\s*(.*))?$/gim
];

/**
 * Traite le texte agrégé pour produire une publication structurée
 */
export function processTextToStructuredPublication(
  extractedText: string,
  metadata: any = {}
): StructuredPublication {
  logger.info('PROCESSING', 'Début de structuration du texte juridique');
  
  const startTime = Date.now();
  
  // Détection du type de document
  const documentType = detectDocumentType(extractedText);
  
  // Extraction du titre et numéro
  const titleInfo = extractTitleAndNumber(extractedText, documentType);
  
  // Extraction de la date
  const date = extractDate(extractedText);
  
  // Extraction de l'institution
  const institution = extractInstitution(extractedText);
  
  // Extraction de la wilaya si applicable
  const wilaya = extractWilaya(extractedText);
  
  // Extraction du secteur
  const sector = extractSector(extractedText);
  
  // Extraction des références juridiques
  const references = extractLegalReferences(extractedText);
  
  // Extraction des articles
  const articles = extractArticles(extractedText);
  
  // Détection des entités
  const entities = detectEntities(extractedText);
  
  // Détection de la langue
  const language = detectLanguage(extractedText);
  
  // Calcul du nombre de mots
  const wordCount = extractedText.split(/\s+/).length;
  
  // Calcul de la confiance basé sur les entités détectées
  const confidence = calculateConfidence(titleInfo, date, institution, references, articles);
  
  const result: StructuredPublication = {
    title: titleInfo.title,
    number: titleInfo.number,
    date,
    type: documentType,
    institution,
    wilaya,
    sector,
    references,
    articles,
    metadata: {
      language,
      wordCount,
      processingDate: new Date().toISOString(),
      confidence,
      entities
    }
  };
  
  const processingTime = Date.now() - startTime;
  logger.info('PROCESSING', 'Structuration terminée', { 
    processingTime,
    type: documentType,
    articlesCount: articles.length,
    referencesCount: references.length
  });
  
  return result;
}

/**
 * Détecte le type de document juridique
 */
function detectDocumentType(text: string): StructuredPublication['type'] {
  for (const [type, patterns] of Object.entries(DOCUMENT_TYPE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return type as StructuredPublication['type'];
      }
    }
  }
  return 'autre';
}

/**
 * Extrait le titre et le numéro du document
 */
function extractTitleAndNumber(text: string, type: StructuredPublication['type']): { title: string; number: string } {
  const patterns = DOCUMENT_TYPE_PATTERNS[type] || [];
  
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const number = match[1] || match[2] || '';
      // Extraire le titre (première ligne généralement)
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const title = lines[0]?.trim() || `${type.charAt(0).toUpperCase() + type.slice(1)} n° ${number}`;
      
      return { title, number };
    }
  }
  
  return { title: 'Document sans titre', number: '' };
}

/**
 * Extrait la date du document
 */
function extractDate(text: string): string {
  for (const pattern of DATE_PATTERNS) {
    const match = pattern.exec(text);
    if (match) {
      // Normaliser la date au format ISO
      if (match.length >= 4) {
        const day = match[1];
        const month = match[2];
        const year = match[3];
        
        // Convertir les mois français en numéros
        const monthMap: Record<string, string> = {
          'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
          'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
          'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
        };
        
        const monthNum = monthMap[month.toLowerCase()] || month;
        return `${year}-${monthNum.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
  }
  
  return new Date().toISOString().split('T')[0];
}

/**
 * Extrait l'institution émettrice
 */
function extractInstitution(text: string): string {
  for (const pattern of INSTITUTION_PATTERNS) {
    const match = pattern.exec(text);
    if (match) {
      return match[0].trim();
    }
  }
  
  return 'Institution non identifiée';
}

/**
 * Extrait la wilaya si applicable
 */
function extractWilaya(text: string): string | undefined {
  const wilayaPattern = /\b(?:Wilaya|ولاية)\s+(?:de\s+|du\s+|d')?([A-ZÀ-Ÿء-ي][a-zà-ÿء-ي\s]+)/gi;
  const match = wilayaPattern.exec(text);
  return match ? match[1].trim() : undefined;
}

/**
 * Extrait le secteur d'activité
 */
function extractSector(text: string): string | undefined {
  const sectors = [
    'agriculture', 'industrie', 'commerce', 'transport', 'éducation', 'santé',
    'environnement', 'urbanisme', 'finance', 'justice', 'sécurité', 'culture',
    'jeunesse', 'sports', 'tourisme', 'énergie', 'mines', 'pêche', 'forêts'
  ];
  
  for (const sector of sectors) {
    if (text.toLowerCase().includes(sector)) {
      return sector;
    }
  }
  
  return undefined;
}

/**
 * Extrait les références juridiques
 */
function extractLegalReferences(text: string): LegalReference[] {
  const references: LegalReference[] = [];
  
  for (const pattern of REFERENCE_PATTERNS) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const reference: LegalReference = {
        type: determineReferenceType(match[0]),
        number: match[1] || '',
        date: match[2] || undefined,
        context: getContext(text, match.index, 100),
        confidence: 0.8
      };
      
      references.push(reference);
    }
  }
  
  return references;
}

/**
 * Détermine le type de référence juridique
 */
function determineReferenceType(refText: string): LegalReference['type'] {
  if (/\b(?:Loi|قانون)\b/i.test(refText)) return 'loi';
  if (/\b(?:Décret|مرسوم)\b/i.test(refText)) return 'decret';
  if (/\b(?:Arrêté|قرار)\b/i.test(refText)) return 'arrete';
  if (/\b(?:Ordonnance|أمر)\b/i.test(refText)) return 'ordonnance';
  if (/\b(?:Instruction|تعليمة)\b/i.test(refText)) return 'instruction';
  if (/\bJORA\b/i.test(refText)) return 'jora';
  return 'autre';
}

/**
 * Extrait les articles du document
 */
function extractArticles(text: string): Article[] {
  const articles: Article[] = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    for (const pattern of ARTICLE_PATTERNS) {
      const match = pattern.exec(line);
      if (match) {
        const number = match[1];
        const title = match[2] || undefined;
        
        // Extraire le contenu de l'article (lignes suivantes)
        let content = '';
        let j = i + 1;
        while (j < lines.length && !ARTICLE_PATTERNS.some(p => p.test(lines[j]))) {
          if (lines[j].trim()) {
            content += lines[j].trim() + ' ';
          }
          j++;
        }
        
        articles.push({
          number,
          title,
          content: content.trim()
        });
        
        break;
      }
    }
  }
  
  return articles;
}

/**
 * Détecte diverses entités dans le texte
 */
function detectEntities(text: string): DetectedEntity[] {
  const entities: DetectedEntity[] = [];
  
  // Détection des montants
  const amountPattern = /\b(\d+(?:\.\d{3})*(?:,\d{2})?)\s*(DA|DZD|dinars?|دينار)/gi;
  let match;
  while ((match = amountPattern.exec(text)) !== null) {
    entities.push({
      type: 'amount',
      value: match[0],
      context: getContext(text, match.index, 50),
      confidence: 0.9,
      position: { start: match.index, end: match.index + match[0].length }
    });
  }
  
  // Détection des personnes (noms propres)
  const personPattern = /\b[A-ZÀ-Ÿ][a-zà-ÿ]+\s+[A-ZÀ-Ÿ][a-zà-ÿ]+/g;
  while ((match = personPattern.exec(text)) !== null) {
    entities.push({
      type: 'person',
      value: match[0],
      context: getContext(text, match.index, 30),
      confidence: 0.6,
      position: { start: match.index, end: match.index + match[0].length }
    });
  }
  
  return entities;
}

/**
 * Détecte la langue dominante du texte
 */
function detectLanguage(text: string): 'ar' | 'fr' | 'mixed' {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const frenchChars = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
  
  if (arabicChars > frenchChars * 2) return 'ar';
  if (frenchChars > arabicChars * 2) return 'fr';
  return 'mixed';
}

/**
 * Calcule un score de confiance basé sur les éléments détectés
 */
function calculateConfidence(
  titleInfo: any,
  date: string,
  institution: string,
  references: LegalReference[],
  articles: Article[]
): number {
  let score = 0;
  
  // Titre et numéro détectés
  if (titleInfo.title && titleInfo.number) score += 0.3;
  
  // Date détectée
  if (date && date !== new Date().toISOString().split('T')[0]) score += 0.2;
  
  // Institution détectée
  if (institution && institution !== 'Institution non identifiée') score += 0.2;
  
  // Références juridiques trouvées
  if (references.length > 0) score += 0.15;
  
  // Articles structurés trouvés
  if (articles.length > 0) score += 0.15;
  
  return Math.min(score, 1.0);
}

/**
 * Extrait le contexte autour d'une position donnée
 */
function getContext(text: string, position: number, radius: number): string {
  const start = Math.max(0, position - radius);
  const end = Math.min(text.length, position + radius);
  return text.substring(start, end).trim();
}