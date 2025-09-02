/**
 * Configuration complète des jeux de caractères arabes pour l'OCR algérien
 * Optimisé pour la reconnaissance de texte arabe dans les documents officiels
 */

export const ARABIC_CHARACTER_SETS = {
  // Caractères arabes de base (U+0600-U+06FF)
  basic: 'أبتثجحخدذرزسشصضطظعغفقكلمنهويىءآإؤئ',
  
  // Caractères arabes étendus avec diacritiques
  extended: 'أبتثجحخدذرزسشصضطظعغفقكلمنهويىءآإؤئًٌٍَُِّْ',
  
  // Caractères de liaison et formes contextuelles
  contextual: 'ـ',
  
  // Chiffres arabes-hindous (٠-٩)
  arabicNumerals: '٠١٢٣٤٥٦٧٨٩',
  
  // Chiffres européens 
  europeanNumerals: '0123456789',
  
  // Ponctuation arabe spécifique
  arabicPunctuation: '؛؟،؍؎؏؞؟؊؋،؎؏',
  
  // Lettres françaises avec accents (pour documents bilingues)
  french: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzàáâäèéêëìíîïòóôöùúûüÿç',
  
  // Ponctuation et symboles communs
  commonSymbols: ' °-/.,;:()[]{}«»"\'',
  
  // Caractères spéciaux pour documents officiels algériens
  officialSymbols: '№§©®™€$%&*+<>=|\\~^`@#'
};

/**
 * Génère un jeu de caractères complet pour l'OCR arabe algérien
 */
export function getAlgerianArabicWhitelist(includeExtended = true): string {
  let whitelist = '';
  
  // Toujours inclure les caractères de base
  whitelist += ARABIC_CHARACTER_SETS.basic;
  whitelist += ARABIC_CHARACTER_SETS.french;
  whitelist += ARABIC_CHARACTER_SETS.europeanNumerals;
  whitelist += ARABIC_CHARACTER_SETS.commonSymbols;
  whitelist += ARABIC_CHARACTER_SETS.contextual;
  
  if (includeExtended) {
    whitelist += ARABIC_CHARACTER_SETS.arabicNumerals;
    whitelist += ARABIC_CHARACTER_SETS.arabicPunctuation;
    whitelist += ARABIC_CHARACTER_SETS.officialSymbols;
  }
  
  // Supprimer les doublons
  return [...new Set(whitelist)].join('');
}

/**
 * Configuration optimisée pour différents types de documents algériens
 */
export const ALGERIAN_DOCUMENT_CONFIGS = {
  // Configuration pour textes juridiques (français + arabe officiel)
  legal: {
    whitelist: getAlgerianArabicWhitelist(true),
    pageseg_mode: '6', // Bloc uniforme
    ocr_engine_mode: '2', // LSTM uniquement
    arabic_support: true
  },
  
  // Configuration pour procédures administratives (plus de tolérance)
  administrative: {
    whitelist: getAlgerianArabicWhitelist(true),
    pageseg_mode: '1', // Page automatique
    ocr_engine_mode: '3', // Combiné Legacy + LSTM
    arabic_support: true
  },
  
  // Configuration pour documents mixtes français-arabe
  bilingual: {
    whitelist: getAlgerianArabicWhitelist(true),
    pageseg_mode: '4', // Colonne unique
    ocr_engine_mode: '2', // LSTM uniquement
    arabic_support: true
  },
  
  // Configuration pour textes principalement arabes
  arabic_primary: {
    whitelist: ARABIC_CHARACTER_SETS.extended + 
               ARABIC_CHARACTER_SETS.arabicNumerals + 
               ARABIC_CHARACTER_SETS.arabicPunctuation + 
               ARABIC_CHARACTER_SETS.contextual + 
               ARABIC_CHARACTER_SETS.commonSymbols,
    pageseg_mode: '6', // Bloc uniforme - optimal pour arabe
    ocr_engine_mode: '2', // LSTM uniquement
    arabic_support: true
  }
};

/**
 * Paramètres OCR spécifiques pour améliorer la reconnaissance arabe
 */
export const ARABIC_OCR_PARAMETERS = {
  // Paramètres essentiels pour l'arabe
  preserve_interword_spaces: '1',
  textord_arabic_numerals: '1',
  textord_heavy_nr: '1',
  textord_min_linesize: '2.5',
  
  // Désactivation des dictionnaires pour éviter les interférences
  load_system_dawg: '0',
  load_freq_dawg: '0',
  load_unambig_dawg: '0',
  load_punc_dawg: '0',
  load_number_dawg: '0',
  
  // Optimisations pour la direction RTL
  textord_tabfind_show_vlines: '0',
  textord_use_cjk_fp_model: '0',
  classify_enable_learning: '0',
  classify_enable_adaptive_matcher: '0',
  
  // Amélioration de la détection des mots arabes
  wordrec_enable_assoc: '1',
  segment_penalty_dict_frequent_word: '1',
  segment_penalty_dict_case_ok: '1',
  
  // Paramètres avancés pour l'arabe (ajouts pour corriger les problèmes d'extraction)
  textord_noise_sizefraction: '10.0',     // Augmente la tolérance au bruit pour l'arabe
  textord_noise_translimit: '7.0',       // Améliore la détection des caractères déformés
  textord_noise_normratio: '2.0',        // Normalise mieux les variations de taille
  
  // Optimisations spécifiques pour les liaisons arabes
  chop_enable: '1',                       // Active la séparation de caractères liés
  chop_debug: '0',                        // Désactive le debug pour les performances
  wordrec_num_seg_states: '30',           // Augmente les états de segmentation pour l'arabe
  
  // Amélioration de la détection des espaces en arabe
  tosp_debug_level: '0',                  // Désactive debug espaces
  tosp_enough_space_samples_for_median: '3', // Réduit les échantillons requis pour l'arabe
  tosp_old_to_method: '0',                // Utilise la nouvelle méthode de détection d'espaces
  
  // Paramètres pour améliorer la reconnaissance des diacritiques arabes
  textord_noise_sncount: '1',             // Réduit le seuil de bruit pour les diacritiques
  language_model_penalty_non_freq_dict_word: '0.1', // Réduit la pénalité pour mots non-dict
  language_model_penalty_non_dict_word: '0.15',     // Réduit la pénalité pour nouveaux mots
  
  // Optimisations pour documents juridiques algériens
  classify_min_certainty_margin: '5.5',   // Augmente la marge de certitude
  classify_certainty_scale: '20.0',       // Améliore l'échelle de certitude
  matcher_avg_noise_size: '12.0'          // Ajuste la taille moyenne du bruit
};

/**
 * Détecte si un texte contient principalement de l'arabe
 */
export function detectArabicRatio(text: string): number {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;
  return totalChars > 0 ? arabicChars / totalChars : 0;
}

/**
 * Détermine la configuration optimale selon le contenu détecté
 */
export function getOptimalConfigForText(text: string): keyof typeof ALGERIAN_DOCUMENT_CONFIGS {
  const arabicRatio = detectArabicRatio(text);
  
  if (arabicRatio > 0.8) return 'arabic_primary';
  if (arabicRatio > 0.3) return 'bilingual';
  if (arabicRatio > 0.1) return 'administrative';
  return 'legal';
}