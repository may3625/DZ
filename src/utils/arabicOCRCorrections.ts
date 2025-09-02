/**
 * Corrections OCR avancées pour texte arabe
 * Spécialement conçu pour les documents juridiques algériens
 */

export interface ArabicOCRCorrectionResult {
  correctedText: string;
  corrections: string[];
  wordsSeparated: number;
  ligaturesFixed: number;
  rtlFixed: boolean;
}

/**
 * Applique des corrections OCR avancées pour l'arabe
 */
export function correctArabicOCR(text: string): ArabicOCRCorrectionResult {
  if (!text || typeof text !== 'string') {
    return {
      correctedText: text || '',
      corrections: [],
      wordsSeparated: 0,
      ligaturesFixed: 0,
      rtlFixed: false
    };
  }

  let corrected = text;
  const corrections: string[] = [];
  let wordsSeparated = 0;
  let ligaturesFixed = 0;
  let rtlFixed = false;

  // 1. Nettoyage des marqueurs RTL/LTR parasites
  const originalLength = corrected.length;
  corrected = corrected.replace(/[\u200E\u200F\u202A\u202B\u202C\u202D\u202E]/g, '');
  if (corrected.length !== originalLength) {
    corrections.push('Nettoyage marqueurs RTL/LTR');
    rtlFixed = true;
  }

    // Séparation des mots collés courants - AMÉLIORATION MAJEURE
    const wordSeparations = [
      // CORRECTIONS SPÉCIFIQUES CRITIQUES - Ordre RTL correct
      [/رئاسيرقم/g, 'رقم رئاسي'], // ✅ PRIORITÉ HAUTE - Correction spécifique demandée
      [/تنفيذيرقم/g, 'رقم تنفيذي'], // ✅ PRIORITÉ HAUTE - Format RTL correct
      [/وزاريرقم/g, 'رقم وزاري'], // ✅ PRIORITÉ HAUTE - Format RTL correct  
      [/برلمانيرقم/g, 'رقم برلماني'], // ✅ Nouveau - format parlementaire
      [/بلديرقم/g, 'رقم بلدي'], // ✅ Nouveau - format municipal
      [/قضائيرقم/g, 'رقم قضائي'], // ✅ Nouveau - format judiciaire
      [/إداريرقم/g, 'رقم إداري'], // ✅ Nouveau - format administratif
      [/قانونيرقم/g, 'رقم قانوني'], // ✅ Nouveau - format légal
      [/تشريعيرقم/g, 'رقم تشريعي'], // ✅ Nouveau - format législatif
      
      // NOUVELLES CORRECTIONS CRITIQUES POUR L'ALGÉRIE
      [/الجمهوريةرقم/g, 'رقم الجمهورية'],
      [/الحكومةرقم/g, 'رقم الحكومة'],
      [/الوزارةرقم/g, 'رقم الوزارة'],
      [/المرسومرقم/g, 'رقم المرسوم'],
      [/القرارنقم/g, 'رقم القرار'], // Correction typo fréquent
      [/القانونرقم/g, 'رقم القانون'],
      
      // Mots juridiques collés - Format RTL amélioré  
      [/(مرسوم|قرار|قانون)(رقم)/g, '$2 $1'], // RTL: numéro AVANT le type
      [/(رئاسي|تنفيذي|وزاري|برلماني|بلدي|قضائي|إداري)(رقم)/g, '$2 $1'], // RTL: numéro AVANT l'adjectif
      [/(المؤرخ)(في)(\d+)/g, '$1 $2 $3'], // Séparation date
      [/(المادة|الفصل|الباب)(\d+)/g, '$1 $2'], // Séparation numéros d'articles
      [/(الفقرة|البند|النقطة)(\d+)/g, '$1 $2'], // Nouveau - séparation paragraphes
      
      // Corrections spécifiques Algérie - ORDRE RTL RESPECTÉ - ÉTENDUES
      [/الجمهوريةالجزائرية/g, 'الجمهورية الجزائرية'],
      [/الديمقراطيةالشعبية/g, 'الديمقراطية الشعبية'],
      [/الجزائريةالديمقراطية/g, 'الجزائرية الديمقراطية'],
      [/الشعبيةالديمقراطية/g, 'الشعبية الديمقراطية'],
      [/وزيرالعدل/g, 'وزير العدل'],
      [/وزيرالداخلية/g, 'وزير الداخلية'],
      [/وزيرالمالية/g, 'وزير المالية'],
      [/وزيرالدفاع/g, 'وزير الدفاع'], // Nouveau
      [/وزيرالخارجية/g, 'وزير الخارجية'], // Nouveau
      [/وزيرالتعليم/g, 'وزير التعليم'], // Nouveau
      [/وزيرالصحة/g, 'وزير الصحة'], // Nouveau
      [/وزيرالعمل/g, 'وزير العمل'], // Nouveau - Travail
      [/وزيرالتجارة/g, 'وزير التجارة'], // Nouveau - Commerce
      [/وزيرالثقافة/g, 'وزير الثقافة'], // Nouveau - Culture
      [/وزيرالبيئة/g, 'وزير البيئة'], // Nouveau - Environnement
      [/وزيرالنقل/g, 'وزير النقل'], // Nouveau - Transport
      [/الجريدةالرسمية/g, 'الجريدة الرسمية'],
      [/الولايةالمتحدة/g, 'الولاية المتحدة'],
      [/الإدارةالعامة/g, 'الإدارة العامة'], // Nouveau
      [/المحافظةالسامية/g, 'المحافظة السامية'], // Nouveau
      [/المديريةالعامة/g, 'المديرية العامة'], // Nouveau
      [/الأمانةالعامة/g, 'الأمانة العامة'], // Nouveau
      
      // Séparations améliorées arabe-chiffre avec contexte
      [/([ا-ي]{2,})(\d+)([ا-ي]{2,})/g, '$1 $2 $3'], // Mots entiers collés avec chiffres
      [/(\d+)([ا-ي]{2,})/g, '$1 $2'], // Chiffre collé au début d'un mot arabe
      [/([ا-ي]{2,})(\d+)/g, '$1 $2'], // Mot arabe collé à un chiffre
      
      // Nouvelles corrections communes documents algériens - ÉTENDUES
      [/المديرالعام/g, 'المدير العام'],
      [/رئيسالمجلس/g, 'رئيس المجلس'],  
      [/الأمينالعام/g, 'الأمين العام'],
      [/المحافظالسامي/g, 'المحافظ السامي'],
      [/الكاتبالعام/g, 'الكاتب العام'],
      [/النائبالعام/g, 'النائب العام'], // Nouveau
      [/المديرالإقليمي/g, 'المدير الإقليمي'], // Nouveau
      [/المسؤولالأول/g, 'المسؤول الأول'], // Nouveau
      [/الممثلالرسمي/g, 'الممثل الرسمي'], // Nouveau
      
      // Corrections d'expressions juridiques complètes - NOUVELLES
      [/فيتطبيق/g, 'في تطبيق'],
      [/بناءعلى/g, 'بناء على'],
      [/وفقالأحكام/g, 'وفق الأحكام'],
      [/طبقاللقانون/g, 'طبقا للقانون'],
      [/استناداإلى/g, 'استنادا إلى'],
      [/بالإشارةإلى/g, 'بالإشارة إلى'],
      [/وعلىضوء/g, 'وعلى ضوء'],
      [/بعداطلاع/g, 'بعد اطلاع'],
      [/ومراعاةلأحكام/g, 'ومراعاة لأحكام']
    ];

  wordSeparations.forEach(([pattern, replacement]: [RegExp, string]) => {
    const before = corrected;
    corrected = corrected.replace(pattern, replacement);
    if (corrected !== before) {
      wordsSeparated++;
    }
  });

  if (wordsSeparated > 0) {
    corrections.push(`Séparation de ${wordsSeparated} mots collés`);
  }

  // 3. Corrections des liaisons de caractères arabes
  const ligatureCorrections = [
    // Liaisons courantes mal reconnues
    [/ﻻ/g, 'لا'], // Lam-Alif
    [/ﷲ/g, 'الله'], // Allah
    [/ﺍ/g, 'ا'], // Alif isolé
    [/ﺎ/g, 'ا'], // Alif final
    [/ﻝ/g, 'ل'], // Lam isolé
    [/ﻞ/g, 'ل'], // Lam final
  ];

  ligatureCorrections.forEach(([pattern, replacement]: [RegExp, string]) => {
    const before = corrected;
    corrected = corrected.replace(pattern, replacement);
    if (corrected !== before) {
      ligaturesFixed++;
    }
  });

  if (ligaturesFixed > 0) {
    corrections.push(`Correction de ${ligaturesFixed} liaisons`);
  }

  // 4. Corrections spécifiques documents juridiques algériens - AMÉLIORÉES
  const legalCorrections = [
    // Corrections de reconnaissance commune - AJOUTS MAJEURS
    [/AS élu 29 ‏في‎ E33a/g, 'الجمهورية الجزائرية الديمقراطية الشعبية'],
    [/(الجماورية|الجمحورية|الجماهورية)/g, 'الجمهورية'], // Variantes OCR fréquentes
    [/(الدبمقراطية|الديموقراطية|الديمقراضية)/g, 'الديمقراطية'], // Variantes OCR
    [/(الشعبية|الشعبيه|الشعبيبة)/g, 'الشعبية'], // Variantes OCR
    [/(الجزأيرية|الجزاءرية|الجزايرية)/g, 'الجزائرية'], // Variantes OCR algériennes
    
    // Corrections de titres officiels - ÉTENDUES
    [/(رئبس|رءيس|رئيص) (الجماورية|الجمهورية)/g, 'رئيس الجمهورية'],
    [/(الوزبر|الوذير|الوزيز) الأول/g, 'الوزير الأول'],
    [/(وزبر|وذير|وزيز) العدل/g, 'وزير العدل'],
    [/(وزبر|وذير|وزيز) الداخلية/g, 'وزير الداخلية'], // Nouveau
    [/(وزبر|وذير|وزيز) المالية/g, 'وزير المالية'], // Nouveau
    [/(وزبر|وذير|وزيز) الدفاع/g, 'وزير الدفاع'], // Nouveau
    
    // Corrections de dates - AMÉLIORÉES
    [/(المؤرح|المؤرخ|المؤرة) في/g, 'المؤرخ في'],
    [/(الموافق|الموافن|الموافه) (لـ|ل)/g, 'الموافق لـ'],
    [/في شهر (\w+) سنة (\d+)/g, 'في شهر $1 سنة $2'], // Format date amélioré
    
    // Nouvelles corrections spécifiques documents algériens
    [/(مرسوم|مرصوم|مرسمو) (رئاسي|رءاسي)/g, 'مرسوم رئاسي'],
    [/(مرسوم|مرصوم|مرسمو) (تنفيذي|تنفيدي)/g, 'مرسوم تنفيذي'],
    [/(قرار|قزار|قرءر) (وزاري|وذاري)/g, 'قرار وزاري'],
    [/(الجريدة|الجزيدة|الجريده) (الرسمية|الرصمية)/g, 'الجريدة الرسمية'],
    [/(ولاية|ولايه|ولايت)/g, 'ولاية'], // Correction "wilaya"
    [/(دائرة|دايرة|دأيرة)/g, 'دائرة'], // Correction "daïra"
    [/(بلدية|بلديه|بلديت)/g, 'بلدية'], // Correction "commune"
  ];

  let legalFixed = 0;
  legalCorrections.forEach(([pattern, replacement]: [RegExp, string]) => {
    const before = corrected;
    corrected = corrected.replace(pattern, replacement);
    if (corrected !== before) {
      legalFixed++;
    }
  });

  if (legalFixed > 0) {
    corrections.push(`Corrections juridiques: ${legalFixed}`);
  }

  // 5. Normalisation finale des espaces
  corrected = corrected.replace(/\s+/g, ' ').trim();

  return {
    correctedText: corrected,
    corrections,
    wordsSeparated,
    ligaturesFixed,
    rtlFixed
  };
}