/**
 * Fonction utilitaire pour appliquer des corrections OCR arabes avancées
 * Compatible avec l'ancien code qui l'utilisait
 */

import { correctArabicOCR } from './arabicOCRCorrections';

/**
 * Applique les corrections arabes avancées sur un texte
 */
export async function applyAdvancedArabicCorrections(text: string): Promise<string> {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  // Utiliser le système de corrections existant
  const result = correctArabicOCR(text);
  
  console.log('🔄 [CORRECTIONS AVANCÉES] Corrections appliquées:', result.corrections);
  
  return result.correctedText;
}

export default applyAdvancedArabicCorrections;