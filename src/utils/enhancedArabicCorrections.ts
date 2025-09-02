/**
 * 🇩🇿 Corrections arabes avancées pour OCR algérien
 * Spécialisé pour textes juridiques officiels
 * Traite les problèmes spécifiques : mots collés, RTL, marqueurs parasites
 */

export interface EnhancedCorrectionResult {
  text: string;
  corrections: EnhancedCorrection[];
  statistics: CorrectionStatistics;
}

export interface EnhancedCorrection {
  type: 'word_separation' | 'rtl_direction' | 'marker_cleanup' | 'ligature_fix' | 'legal_term';
  original: string;
  corrected: string;
  confidence: number;
  position: number;
  description: string;
}

export interface CorrectionStatistics {
  wordsSeparated: number;
  rtlMarkersCleaned: number;
  ligaturesCorrected: number;
  legalTermsNormalized: number;
  directionsCorrected: number;
  totalCorrections: number;
  processingTime: number;
}

export class EnhancedArabicCorrections {
  
  /**
   * Pipeline complet de corrections arabes avancées
   */
  static processAdvancedCorrections(text: string): EnhancedCorrectionResult {
    const startTime = performance.now();
    let processedText = text;
    const corrections: EnhancedCorrection[] = [];
    
    console.log('🔧 [CORRECTIONS] Début pipeline avancé pour texte arabe');
    
    // 1. Nettoyage marqueurs RTL/LTR parasites (priorité haute)
    const markerResult = this.cleanRTLLTRMarkers(processedText);
    processedText = markerResult.text;
    corrections.push(...markerResult.corrections);
    
    // 2. Séparation des mots arabes collés
    const separationResult = this.separateCollidedWords(processedText);
    processedText = separationResult.text;
    corrections.push(...separationResult.corrections);
    
    // 3. Correction des liaisons entre caractères
    const ligatureResult = this.correctLigatures(processedText);
    processedText = ligatureResult.text;
    corrections.push(...ligatureResult.corrections);
    
    // 4. Correction direction RTL
    const directionResult = this.correctRTLDirection(processedText);
    processedText = directionResult.text;
    corrections.push(...directionResult.corrections);
    
    // 5. Normalisation termes juridiques algériens
    const legalResult = this.normalizeLegalTerms(processedText);
    processedText = legalResult.text;
    corrections.push(...legalResult.corrections);
    
    // 6. Post-traitement final
    const finalResult = this.finalPolishing(processedText);
    processedText = finalResult.text;
    corrections.push(...finalResult.corrections);
    
    const processingTime = performance.now() - startTime;
    
    // Calcul statistiques
    const statistics: CorrectionStatistics = {
      wordsSeparated: corrections.filter(c => c.type === 'word_separation').length,
      rtlMarkersCleaned: corrections.filter(c => c.type === 'marker_cleanup').length,
      ligaturesCorrected: corrections.filter(c => c.type === 'ligature_fix').length,
      legalTermsNormalized: corrections.filter(c => c.type === 'legal_term').length,
      directionsCorrected: corrections.filter(c => c.type === 'rtl_direction').length,
      totalCorrections: corrections.length,
      processingTime
    };
    
    console.log(`✅ [CORRECTIONS] Pipeline terminé: ${corrections.length} corrections en ${processingTime.toFixed(0)}ms`);
    
    return {
      text: processedText.trim(),
      corrections,
      statistics
    };
  }

  /**
   * Nettoyage avancé des marqueurs RTL/LTR parasites
   */
  private static cleanRTLLTRMarkers(text: string): { text: string; corrections: EnhancedCorrection[] } {
    let cleanedText = text;
    const corrections: EnhancedCorrection[] = [];
    
    // Marqueurs directionnels à supprimer
    const parasiteMarkers = [
      { marker: /\u200E/g, name: 'Left-to-Right Mark (LRM)' },
      { marker: /\u200F/g, name: 'Right-to-Left Mark (RLM)' },
      { marker: /\u202A/g, name: 'Left-to-Right Embedding (LRE)' },
      { marker: /\u202B/g, name: 'Right-to-Left Embedding (RLE)' },
      { marker: /\u202C/g, name: 'Pop Directional Formatting (PDF)' },
      { marker: /\u202D/g, name: 'Left-to-Right Override (LRO)' },
      { marker: /\u202E/g, name: 'Right-to-Left Override (RLO)' },
      { marker: /\u2066/g, name: 'Left-to-Right Isolate (LRI)' },
      { marker: /\u2067/g, name: 'Right-to-Left Isolate (RLI)' },
      { marker: /\u2068/g, name: 'First Strong Isolate (FSI)' },
      { marker: /\u2069/g, name: 'Pop Directional Isolate (PDI)' }
    ];
    
    parasiteMarkers.forEach(({ marker, name }) => {
      const matches = [...cleanedText.matchAll(marker)];
      matches.forEach(match => {
        if (match.index !== undefined) {
          corrections.push({
            type: 'marker_cleanup',
            original: match[0],
            corrected: '',
            confidence: 1.0,
            position: match.index,
            description: `Suppression marqueur parasite: ${name}`
          });
        }
      });
      cleanedText = cleanedText.replace(marker, '');
    });
    
    return { text: cleanedText, corrections };
  }

  /**
   * Séparation intelligente des mots arabes collés
   */
  private static separateCollidedWords(text: string): { text: string; corrections: EnhancedCorrection[] } {
    let processedText = text;
    const corrections: EnhancedCorrection[] = [];
    
    // Patterns spécialisés pour documents juridiques algériens
    const separationPatterns = [
      // Combinaisons institution + numéro
      {
        pattern: /رئاسي(رقم|قرار|مرسوم)/g,
        replacement: 'رئاسي $1',
        description: 'Séparation décret présidentiel'
      },
      {
        pattern: /تنفيذي(رقم|قرار|مرسوم)/g,
        replacement: 'تنفيذي $1',
        description: 'Séparation décret exécutif'
      },
      {
        pattern: /وزاري(رقم|قرار|مرسوم)/g,
        replacement: 'وزاري $1',
        description: 'Séparation décret ministériel'
      },
      
      // Dates et formulations temporelles
      {
        pattern: /المؤرخ(في)/g,
        replacement: 'المؤرخ $1',
        description: 'Séparation formule de date'
      },
      {
        pattern: /الموافق(لـ|ل)/g,
        replacement: 'الموافق $1',
        description: 'Séparation correspondance calendaire'
      },
      
      // État et institutions
      {
        pattern: /الجزائرية(الديمقراطية|الشعبية)/g,
        replacement: 'الجزائرية $1',
        description: 'Séparation nom officiel État'
      },
      {
        pattern: /الجمهورية(الجزائرية)/g,
        replacement: 'الجمهورية $1',
        description: 'Séparation République algérienne'
      },
      
      // Mots juridiques génériques
      {
        pattern: /رقم(\d+)/g,
        replacement: 'رقم $1',
        description: 'Séparation numéro'
      },
      {
        pattern: /المادة(\d+)/g,
        replacement: 'المادة $1',
        description: 'Séparation article'
      },
      {
        pattern: /الفصل(\d+)/g,
        replacement: 'الفصل $1',
        description: 'Séparation chapitre'
      },
      
      // Formules juridiques complexes
      {
        pattern: /والمتضمن(القانون|النظام|اللائحة)/g,
        replacement: 'والمتضمن $1',
        description: 'Séparation formule juridique'
      },
      {
        pattern: /المتعلق(بـ|ب)/g,
        replacement: 'المتعلق $1',
        description: 'Séparation relation juridique'
      },
      
      // Mots très longs (probablement collés)
      {
        pattern: /([ا-ي]{15,})/g,
        replacement: (match: string) => {
          // Diviser les mots très longs au milieu
          const midPoint = Math.ceil(match.length / 2);
          return match.substring(0, midPoint) + ' ' + match.substring(midPoint);
        },
        description: 'Séparation mot anormalement long'
      },
      
      // Séparation générale mots + chiffres
      {
        pattern: /([ا-ي]+)(\d+)([ا-ي]+)/g,
        replacement: '$1 $2 $3',
        description: 'Séparation texte-nombre-texte'
      },
      {
        pattern: /(\d+)([ا-ي]{3,})/g,
        replacement: '$1 $2',
        description: 'Séparation nombre-texte'
      },
      {
        pattern: /([ا-ي]{3,})(\d+)/g,
        replacement: '$1 $2',
        description: 'Séparation texte-nombre'
      }
    ];
    
    separationPatterns.forEach(({ pattern, replacement, description }) => {
      const matches = [...processedText.matchAll(pattern)];
      matches.forEach(match => {
        if (match.index !== undefined) {
          corrections.push({
            type: 'word_separation',
            original: match[0],
            corrected: typeof replacement === 'string' 
              ? match[0].replace(pattern, replacement)
              : replacement(match[0]),
            confidence: 0.9,
            position: match.index,
            description
          });
        }
      });
      
      if (typeof replacement === 'string') {
        processedText = processedText.replace(pattern, replacement);
      } else {
        processedText = processedText.replace(pattern, replacement);
      }
    });
    
    return { text: processedText, corrections };
  }

  /**
   * Correction avancée des liaisons entre caractères arabes
   */
  private static correctLigatures(text: string): { text: string; corrections: EnhancedCorrection[] } {
    let processedText = text;
    const corrections: EnhancedCorrection[] = [];
    
    // Corrections de liaisons spécifiques
    const ligatureCorrections = [
      // Liaisons courantes mal reconnues
      {
        pattern: /ه\s+([ا-ي])/g,
        replacement: 'ه$1',
        description: 'Correction liaison هـ'
      },
      {
        pattern: /([ا-ي])\s+ة/g,
        replacement: '$1ة',
        description: 'Correction liaison تاء مربوطة'
      },
      {
        pattern: /ال\s+([ا-ي])/g,
        replacement: 'ال$1',
        description: 'Correction liaison الـ'
      },
      {
        pattern: /([بتثجحخسشصضطظعغفقكلمنهي])\s+([ا-ي])/g,
        replacement: '$1$2',
        description: 'Correction liaison caractères connectables'
      },
      
      // Suppression du tatweel parasite
      {
        pattern: /ـ+/g,
        replacement: '',
        description: 'Suppression tatweel excessif'
      },
      
      // Ligatures spéciales
      {
        pattern: /لا/g,
        replacement: 'لا',
        description: 'Normalisation ligature lam-alif'
      },
      {
        pattern: /ﷺ/g,
        replacement: '(ص)',
        description: 'Remplacement ligature prophète'
      },
      {
        pattern: /ﷻ/g,
        replacement: 'جل جلاله',
        description: 'Remplacement ligature divine'
      }
    ];
    
    ligatureCorrections.forEach(({ pattern, replacement, description }) => {
      const matches = [...processedText.matchAll(pattern)];
      matches.forEach(match => {
        if (match.index !== undefined) {
          corrections.push({
            type: 'ligature_fix',
            original: match[0],
            corrected: match[0].replace(pattern, replacement),
            confidence: 0.85,
            position: match.index,
            description
          });
        }
      });
      processedText = processedText.replace(pattern, replacement);
    });
    
    return { text: processedText, corrections };
  }

  /**
   * Correction intelligente de la direction RTL
   */
  private static correctRTLDirection(text: string): { text: string; corrections: EnhancedCorrection[] } {
    let processedText = text;
    const corrections: EnhancedCorrection[] = [];
    
    // Détecter et corriger les lignes avec ordre inversé
    const lines = processedText.split('\n');
    const correctedLines = lines.map((line, lineIndex) => {
      const arabicChars = (line.match(/[\u0600-\u06FF]/g) || []).length;
      const totalChars = line.replace(/\s/g, '').length;
      
      // Si ligne majoritairement arabe
      if (totalChars > 0 && arabicChars / totalChars > 0.7) {
        const words = line.trim().split(/\s+/);
        
        if (words.length > 1) {
          // Heuristiques pour détecter ordre inversé
          const firstWord = words[0];
          const lastWord = words[words.length - 1];
          
          // Si premier mot finit par ponctuation et dernier non
          if (firstWord.match(/[.،؛!؟]$/) && !lastWord.match(/[.،؛!؟]$/)) {
            const correctedLine = words.reverse().join(' ');
            
            corrections.push({
              type: 'rtl_direction',
              original: line,
              corrected: correctedLine,
              confidence: 0.7,
              position: lineIndex,
              description: 'Correction ordre des mots RTL'
            });
            
            return correctedLine;
          }
          
          // Si ligne commence par mots de fin de phrase
          const endWords = ['والله', 'انتهى', 'تم', 'انتهت'];
          if (endWords.some(word => firstWord.includes(word))) {
            const correctedLine = words.reverse().join(' ');
            
            corrections.push({
              type: 'rtl_direction',
              original: line,
              corrected: correctedLine,
              confidence: 0.8,
              position: lineIndex,
              description: 'Correction ordre basée sur mots de fin'
            });
            
            return correctedLine;
          }
        }
      }
      
      return line;
    });
    
    processedText = correctedLines.join('\n');
    return { text: processedText, corrections };
  }

  /**
   * Normalisation des termes juridiques algériens
   */
  private static normalizeLegalTerms(text: string): { text: string; corrections: EnhancedCorrection[] } {
    let processedText = text;
    const corrections: EnhancedCorrection[] = [];
    
    // Termes juridiques standardisés
    const legalNormalizations = [
      {
        pattern: /الجمهورية\s*الجزائرية\s*الديمقراطية\s*والشعبية/gi,
        replacement: 'الجمهورية الجزائرية الديمقراطية والشعبية',
        description: 'Standardisation nom officiel République'
      },
      {
        pattern: /مرسوم\s*رئاسي\s*رقم/gi,
        replacement: 'مرسوم رئاسي رقم',
        description: 'Standardisation décret présidentiel'
      },
      {
        pattern: /مرسوم\s*تنفيذي\s*رقم/gi,
        replacement: 'مرسوم تنفيذي رقم',
        description: 'Standardisation décret exécutif'
      },
      {
        pattern: /المؤرخ\s*في/gi,
        replacement: 'المؤرخ في',
        description: 'Standardisation formule de date'
      },
      {
        pattern: /الموافق\s*لـ/gi,
        replacement: 'الموافق لـ',
        description: 'Standardisation correspondance grégorienne'
      },
      {
        pattern: /رئيس\s*الجمهورية/gi,
        replacement: 'رئيس الجمهورية',
        description: 'Standardisation titre présidentiel'
      },
      {
        pattern: /الوزير\s*الأول/gi,
        replacement: 'الوزير الأول',
        description: 'Standardisation Premier ministre'
      },
      {
        pattern: /الجريدة\s*الرسمية/gi,
        replacement: 'الجريدة الرسمية',
        description: 'Standardisation Journal officiel'
      }
    ];
    
    legalNormalizations.forEach(({ pattern, replacement, description }) => {
      const matches = [...processedText.matchAll(pattern)];
      matches.forEach(match => {
        if (match.index !== undefined) {
          corrections.push({
            type: 'legal_term',
            original: match[0],
            corrected: replacement,
            confidence: 0.95,
            position: match.index,
            description
          });
        }
      });
      processedText = processedText.replace(pattern, replacement);
    });
    
    return { text: processedText, corrections };
  }

  /**
   * Post-traitement final et polissage
   */
  private static finalPolishing(text: string): { text: string; corrections: EnhancedCorrection[] } {
    let processedText = text;
    const corrections: EnhancedCorrection[] = [];
    
    // Nettoyages finaux
    const polishingRules = [
      {
        pattern: /\s{2,}/g,
        replacement: ' ',
        description: 'Normalisation espaces multiples'
      },
      {
        pattern: /\n{3,}/g,
        replacement: '\n\n',
        description: 'Normalisation sauts de ligne'
      },
      {
        pattern: /([.،؛!؟])([ا-يa-zA-Z])/g,
        replacement: '$1 $2',
        description: 'Espaces après ponctuation'
      },
      {
        pattern: /([ا-ي])\s*([a-zA-Z])/g,
        replacement: '$1 $2',
        description: 'Espaces entre arabe et latin'
      },
      {
        pattern: /([a-zA-Z])\s*([ا-ي])/g,
        replacement: '$1 $2',
        description: 'Espaces entre latin et arabe'
      }
    ];
    
    polishingRules.forEach(({ pattern, replacement, description }) => {
      const before = processedText;
      processedText = processedText.replace(pattern, replacement);
      
      if (before !== processedText) {
        corrections.push({
          type: 'marker_cleanup',
          original: 'Texte avant polissage',
          corrected: 'Texte après polissage',
          confidence: 1.0,
          position: 0,
          description
        });
      }
    });
    
    return { text: processedText, corrections };
  }
}