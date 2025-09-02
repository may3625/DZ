/**
 * Processeur de texte arabe avancé pour l'OCR algérien
 * Corrige les problèmes spécifiques de l'arabe RTL et des textes juridiques algériens
 */

export interface ArabicProcessingResult {
  originalText: string;
  processedText: string;
  corrections: string[];
  arabicRatio: number;
  language: 'ar' | 'fr' | 'mixed';
  preprocessing: string;
  wordsSeparated: number;
  ligaturesCorrected: number;
}

export class ArabicTextProcessor {
  
  /**
   * Traite un texte OCR pour corriger les problèmes spécifiques à l'arabe
   */
  static processArabicText(text: string): ArabicProcessingResult {
    if (!text || typeof text !== 'string') {
      return {
        originalText: text || '',
        processedText: text || '',
        corrections: [],
        arabicRatio: 0,
        language: 'fr',
        preprocessing: 'Aucun',
        wordsSeparated: 0,
        ligaturesCorrected: 0
      };
    }

    const originalText = text;
    let processedText = text;
    const corrections: string[] = [];
    let wordsSeparated = 0;
    let ligaturesCorrected = 0;

    // Détecter le ratio arabe
    const arabicCharsRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
    const frenchCharsRegex = /[A-Za-zÀ-ÿ]/g;
    
    const arabicMatches = processedText.match(arabicCharsRegex) || [];
    const frenchMatches = processedText.match(frenchCharsRegex) || [];
    const totalLetters = arabicMatches.length + frenchMatches.length;
    const arabicRatio = totalLetters > 0 ? arabicMatches.length / totalLetters : 0;

    // Déterminer la langue et le preprocessing
    let language: 'ar' | 'fr' | 'mixed';
    let preprocessing: string;
    
    if (arabicRatio > 0.7) {
      language = 'ar';
      preprocessing = 'Standard arabe';
    } else if (arabicRatio > 0.2) {
      language = 'mixed';
      preprocessing = 'Bilingue (Arabe + Français)';
    } else {
      language = 'fr';
      preprocessing = 'Standard français';
    }

    // Appliquer les corrections si du texte arabe est détecté
    if (arabicRatio > 0.1) {
      // 1. Séparation des mots arabes collés
      const separationResult = this.separateCollidedArabicWords(processedText);
      processedText = separationResult.text;
      wordsSeparated = separationResult.separatedCount;
      if (separationResult.separatedCount > 0) {
        corrections.push(`Séparation de ${separationResult.separatedCount} mots collés`);
      }

      // 2. Correction des liaisons arabes
      const ligatureResult = this.correctArabicLigatures(processedText);
      processedText = ligatureResult.text;
      ligaturesCorrected = ligatureResult.correctedCount;
      if (ligatureResult.correctedCount > 0) {
        corrections.push(`Correction de ${ligatureResult.correctedCount} liaisons de caractères`);
      }

      // 3. Nettoyage des marqueurs RTL/LTR parasites
      const cleanedResult = this.cleanRTLLTRMarkers(processedText);
      processedText = cleanedResult.text;
      if (cleanedResult.removed > 0) {
        corrections.push(`Suppression de ${cleanedResult.removed} marqueurs parasites`);
      }

      // 4. Correction du sens RTL
      const rtlResult = this.correctRTLDirection(processedText);
      processedText = rtlResult.text;
      if (rtlResult.corrected) {
        corrections.push('Correction de la direction RTL');
      }

      // 5. Corrections spécifiques aux textes juridiques algériens
      const legalResult = this.correctAlgerianLegalText(processedText);
      processedText = legalResult.text;
      if (legalResult.corrections.length > 0) {
        corrections.push(...legalResult.corrections);
      }
    }

    return {
      originalText,
      processedText: processedText.trim(),
      corrections,
      arabicRatio,
      language,
      preprocessing,
      wordsSeparated,
      ligaturesCorrected
    };
  }

  /**
   * Sépare les mots arabes collés (ex: رئاسيرقم → رقم رئاسي) - AMÉLIORÉ RTL
   */
  private static separateCollidedArabicWords(text: string): { text: string; separatedCount: number } {
    let processedText = text;
    let separatedCount = 0;

    // Patterns de mots arabes couramment collés dans les documents officiels - ORDRE RTL CORRIGÉ
    const collisionPatterns = [
      // CORRECTIONS SPÉCIFIQUES DEMANDÉES - Format RTL correct
      { pattern: /رئاسيرقم/g, replacement: 'رقم رئاسي' }, // ✅ ORDRE RTL CORRECT
      { pattern: /تنفيذيرقم/g, replacement: 'رقم تنفيذي' }, // ✅ ORDRE RTL CORRECT
      { pattern: /وزاريرقم/g, replacement: 'رقم وزاري' }, // ✅ ORDRE RTL CORRECT
      { pattern: /برلمانيرقم/g, replacement: 'رقم برلماني' }, // Nouveau
      { pattern: /بلديرقم/g, replacement: 'رقم بلدي' }, // Nouveau
      
      // Numéros et mots - Séparation améliorée avec contexte
      { pattern: /([ا-ي]{2,})(\d+)([ا-ي]{2,})/g, replacement: '$1 $2 $3' }, // Mots entiers
      { pattern: /(\d{2,})([ا-ي]{2,})/g, replacement: '$1 $2' }, // Chiffres multiples
      { pattern: /([ا-ي]{2,})(\d{2,})/g, replacement: '$1 $2' }, // Vers chiffres multiples
      
      // Mots juridiques courants - Ordre RTL corrigé
      { pattern: /رئاسي(قرار|مرسوم)/g, replacement: '$1 رئاسي' }, // RTL: type AVANT adjectif
      { pattern: /تنفيذي(قرار|مرسوم)/g, replacement: '$1 تنفيذي' }, // RTL: type AVANT adjectif
      { pattern: /وزاري(قرار|مرسوم)/g, replacement: '$1 وزاري' }, // RTL: type AVANT adjectif
      { pattern: /الجزائرية(الديمقراطية|الشعبية)/g, replacement: 'الجزائرية $1' },
      { pattern: /الديمقراطية(الشعبية)/g, replacement: 'الديمقراطية $1' },
      
      // Dates et références courantes - Améliorées
      { pattern: /المؤرخ(في)(\d+)/g, replacement: 'المؤرخ $1 $2' },
      { pattern: /الموافق(لـ)(\d+)/g, replacement: 'الموافق $1 $2' },
      { pattern: /(المادة|الفصل|الباب)(\d+)/g, replacement: '$1 $2' },
      
      // Nouveaux patterns pour institutions algériennes
      { pattern: /وزير(العدل|الداخلية|المالية|الدفاع)/g, replacement: 'وزير $1' },
      { pattern: /مدير(عام|ولائي|محلي)/g, replacement: 'مدير $1' },
      { pattern: /رئيس(المجلس|البلدية|الدائرة)/g, replacement: 'رئيس $1' },
      
      // Séparation générale entre mots arabes sans espace - Plus précise
      { pattern: /([ا-ي]{4,})([ا-ي]{4,})/g, replacement: '$1 $2' }, // Mots longs uniquement
      { pattern: /([ال][ا-ي]{3,})([ا-ي]{3,})/g, replacement: '$1 $2' } // Avec article défini
    ];

    collisionPatterns.forEach(({ pattern, replacement }) => {
      const matches = processedText.match(pattern);
      if (matches) {
        separatedCount += matches.length;
        processedText = processedText.replace(pattern, replacement);
      }
    });

    return { text: processedText, separatedCount };
  }

  /**
   * Corrige les liaisons de caractères arabes - AMÉLIORATION MAJEURE
   */
  private static correctArabicLigatures(text: string): { text: string; correctedCount: number } {
    let processedText = text;
    let correctedCount = 0;

    // Corrections de ligatures courantes mal reconnues - ÉTENDUES
    const ligatureCorrections = [
      // Ligatures standard mal interprétées
      { pattern: /ﻻ/g, replacement: 'لا', name: 'lam-alif ligature' },
      { pattern: /ﷲ/g, replacement: 'الله', name: 'Allah ligature' },
      { pattern: /ﷺ/g, replacement: '(ص)', name: 'sallallahu alayhi wasallam' },
      { pattern: /ﷻ/g, replacement: 'جل جلاله', name: 'jalla jalaluhu' },
      
      // Corrections de formes contextuelles étendues
      { pattern: /ـ+/g, replacement: '', name: 'tatweel removal' },
      { pattern: /[ـﹶﹷﹸﹹﹺﹻﹼﹽﹾﹿ][ـ]*/g, replacement: '', name: 'extended tatweel' },
      
      // Corrections de caractères arabes déformés par l'OCR
      { pattern: /ﺍ/g, replacement: 'ا', name: 'alif isolated' },
      { pattern: /ﺎ/g, replacement: 'ا', name: 'alif final' },
      { pattern: /ﺃ/g, replacement: 'أ', name: 'alif with hamza above' },
      { pattern: /ﺇ/g, replacement: 'إ', name: 'alif with hamza below' },
      { pattern: /ﻝ/g, replacement: 'ل', name: 'lam isolated' },
      { pattern: /ﻞ/g, replacement: 'ل', name: 'lam final' },
      { pattern: /ﻟ/g, replacement: 'ل', name: 'lam initial' },
      { pattern: /ﻠ/g, replacement: 'ل', name: 'lam medial' },
      
      // Nouvelles corrections pour caractères problématiques
      { pattern: /ﻡ/g, replacement: 'م', name: 'meem isolated' },
      { pattern: /ﻢ/g, replacement: 'م', name: 'meem final' },
      { pattern: /ﻣ/g, replacement: 'م', name: 'meem initial' },
      { pattern: /ﻤ/g, replacement: 'م', name: 'meem medial' },
      { pattern: /ﻥ/g, replacement: 'ن', name: 'noon isolated' },
      { pattern: /ﻦ/g, replacement: 'ن', name: 'noon final' },
      { pattern: /ﻧ/g, replacement: 'ن', name: 'noon initial' },
      { pattern: /ﻨ/g, replacement: 'ن', name: 'noon medial' },
      
      // Correction des espaces arabes problématiques
      { pattern: /\u00A0/g, replacement: ' ', name: 'non-breaking space' },
      { pattern: /[\u2000-\u200A]/g, replacement: ' ', name: 'various spaces' },
      { pattern: /\u3000/g, replacement: ' ', name: 'ideographic space' },
      
      // Séparation de caractères mal liés - AMÉLIORÉE
      { pattern: /([بتثجحخسشصضطظعغفقكلمنهيء])([اآأإؤئ])/g, replacement: '$1$2', name: 'character connection fix' },
      
      // Nouvelles corrections spécifiques aux documents algériens
      { pattern: /([ا-ي])\u064B([ا-ي])/g, replacement: '$1 $2', name: 'fathatan separator' },
      { pattern: /([ا-ي])\u064C([ا-ي])/g, replacement: '$1 $2', name: 'dammatan separator' },
      { pattern: /([ا-ي])\u064D([ا-ي])/g, replacement: '$1 $2', name: 'kasratan separator' }
    ];

    ligatureCorrections.forEach(({ pattern, replacement, name }) => {
      const matches = processedText.match(pattern);
      if (matches) {
        correctedCount += matches.length;
        processedText = processedText.replace(pattern, replacement);
      }
    });

    return { text: processedText, correctedCount };
  }

  /**
   * Nettoie les marqueurs RTL/LTR parasites - AMÉLIORATION MAJEURE
   */
  private static cleanRTLLTRMarkers(text: string): { text: string; removed: number } {
    let processedText = text;
    let removed = 0;

    // Marqueurs de direction parasites - LISTE ÉTENDUE
    const directionMarkers = [
      /\u200E/g, // Left-to-Right Mark (LRM)
      /\u200F/g, // Right-to-Left Mark (RLM) 
      /\u202A/g, // Left-to-Right Embedding (LRE)
      /\u202B/g, // Right-to-Left Embedding (RLE)
      /\u202C/g, // Pop Directional Formatting (PDF)
      /\u202D/g, // Left-to-Right Override (LRO)
      /\u202E/g, // Right-to-Left Override (RLO)
      /[\u2066-\u2069]/g, // Directional Isolate markers (FSI, LRI, RLI, PDI)
      /\u061C/g, // Arabic Letter Mark (ALM) - souvent parasite
      /[\uFEFF]/g, // Byte Order Mark (BOM) parfois présent
      /[\u200C\u200D]/g, // Zero Width Non-Joiner/Joiner - souvent parasites
    ];

    // Nouveaux marqueurs parasites fréquents dans l'OCR arabe
    const ocrArtifacts = [
      /[\u00AD]/g, // Soft Hyphen
      /[\u2028\u2029]/g, // Line/Paragraph separators
      /[\u180E]/g, // Mongolian Vowel Separator (parfois détecté)
      /[\uFEFE\uFEFF]/g, // Zero Width No-Break Space variants
    ];

    // Traitement des marqueurs directionnels
    directionMarkers.forEach(marker => {
      const matches = processedText.match(marker);
      if (matches) {
        removed += matches.length;
        processedText = processedText.replace(marker, '');
      }
    });

    // Traitement des artefacts OCR
    ocrArtifacts.forEach(artifact => {
      const matches = processedText.match(artifact);
      if (matches) {
        removed += matches.length;
        processedText = processedText.replace(artifact, '');
      }
    });

    return { text: processedText, removed };
  }

  /**
   * Corrige la direction RTL du texte - AMÉLIORATION INTELLIGENTE
   */
  private static correctRTLDirection(text: string): { text: string; corrected: boolean } {
    let processedText = text;
    let corrected = false;

    // Détecter les sections arabes avec pattern étendu
    const arabicWordPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]+/g;
    const arabicSections = processedText.match(arabicWordPattern);

    if (arabicSections) {
      arabicSections.forEach(section => {
        const words = section.trim().split(/\s+/).filter(w => w.length > 0);
        if (words.length > 2) { // Au moins 3 mots pour détecter l'inversion
          // Détecter si l'ordre semble inversé - HEURISTIQUES AMÉLIORÉES
          const startWords = ['في', 'إن', 'أن', 'من', 'إلى', 'على', 'عن', 'مع', 'بعد', 'قبل', 'حول', 'ضد'];
          const endMarkers = ['ـــ', '...', '.', '،', '؛', ')', ']'];
          const documentStarters = ['المؤرخ', 'الموافق', 'المتضمن', 'المعدل', 'المتمم'];
          
          const firstWord = words[0];
          const lastWord = words[words.length - 1];
          
          // Détection d'inversion par position de mots fonctionnels
          const hasStartWordAtEnd = startWords.includes(lastWord);
          const hasEndMarkerAtStart = endMarkers.some(marker => firstWord.includes(marker));
          const hasDocStartAtEnd = documentStarters.includes(lastWord);
          
          // Détecter les numéros de décrets inversés (رقم X au lieu de X رقم)
          const numberPattern = /(\d+)\s+(رقم)/g;
          const hasInvertedNumbers = numberPattern.test(section);
          
          if (hasStartWordAtEnd || hasEndMarkerAtStart || hasDocStartAtEnd || hasInvertedNumbers) {
            // Correction intelligente selon le type d'inversion
            let correctedSection;
            
            if (hasInvertedNumbers) {
              // Corriger spécifiquement les numéros inversés
              correctedSection = section.replace(/(\d+)\s+(رقم)/g, '$2 $1');
            } else {
              // Inversion complète des mots
              correctedSection = words.reverse().join(' ');
            }
            
            processedText = processedText.replace(section, correctedSection);
            corrected = true;
          }
          
          // Correction spéciale pour les titres de documents algériens
          const titlePattern = /(الجمهورية|المؤرخ|المتضمن)(.+)/;
          if (titlePattern.test(section)) {
            const titleMatch = section.match(titlePattern);
            if (titleMatch && words.indexOf(titleMatch[1]) > 2) {
              // Le titre est au milieu/fin, le remettre au début
              const titleWord = titleMatch[1];
              const otherWords = words.filter(w => w !== titleWord);
              const correctedSection = [titleWord, ...otherWords].join(' ');
              processedText = processedText.replace(section, correctedSection);
              corrected = true;
            }
          }
        }
      });
    }

    return { text: processedText, corrected };
  }

  /**
   * Corrections spécifiques aux textes juridiques algériens
   */
  private static correctAlgerianLegalText(text: string): { text: string; corrections: string[] } {
    let processedText = text;
    const corrections: string[] = [];

    // Corrections spécifiques aux documents officiels algériens
    const algerianCorrections = [
      {
        pattern: /الجمهورية\s*الجزائرية\s*الديمقراطية\s*والشعبية/gi,
        replacement: 'الجمهورية الجزائرية الديمقراطية والشعبية',
        description: 'Correction nom officiel de l\'État'
      },
      {
        pattern: /مرسوم\s*رئاسي\s*رقم/gi,
        replacement: 'مرسوم رئاسي رقم',
        description: 'Format décret présidentiel'
      },
      {
        pattern: /مرسوم\s*تنفيذي\s*رقم/gi,
        replacement: 'مرسوم تنفيذي رقم',
        description: 'Format décret exécutif'
      },
      {
        pattern: /المؤرخ\s*في/gi,
        replacement: 'المؤرخ في',
        description: 'Format date officielle'
      },
      {
        pattern: /الموافق\s*ل/gi,
        replacement: 'الموافق لـ',
        description: 'Format correspondance grégorienne'
      }
    ];

    algerianCorrections.forEach(({ pattern, replacement, description }) => {
      if (pattern.test(processedText)) {
        processedText = processedText.replace(pattern, replacement);
        corrections.push(description);
      }
    });

    return { text: processedText, corrections };
  }

  /**
   * Formate le texte pour l'affichage avec amélioration de la lisibilité
   */
  static formatForDisplay(text: string, maxLength: number = 500): string {
    if (!text) return '';

    let formatted = text;

    // Nettoyer les espaces multiples
    formatted = formatted.replace(/\s+/g, ' ').trim();

    // Ajouter des sauts de ligne logiques pour la lisibilité
    formatted = formatted.replace(/\.\s+/g, '.\n\n');
    formatted = formatted.replace(/:\s+/g, ':\n');
    formatted = formatted.replace(/;\s+/g, ';\n');

    // Limiter la longueur si nécessaire
    if (formatted.length > maxLength) {
      formatted = formatted.substring(0, maxLength) + '...';
    }

    return formatted;
  }

  /**
   * Obtient l'icône et le libellé de langue formatés
   */
  static getLanguageDisplay(language: 'ar' | 'fr' | 'mixed'): { icon: string; label: string } {
    switch (language) {
      case 'ar':
        return { icon: '🇩🇿', label: 'العربية' };
      case 'fr':
        return { icon: '🇫🇷', label: 'Français-Fr' };
      case 'mixed':
        return { icon: '🇩🇿🇫🇷', label: 'Bilingue (AR/FR)' };
      default:
        return { icon: '🔍', label: 'Détecté' };
    }
  }
}