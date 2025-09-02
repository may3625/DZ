/**
 * Service d'agrégation avancée du texte OCR
 * Complète la Phase 1 du plan d'action OCR unifié
 */

import { AlgerianTextRegion } from '@/services/algerianDocumentExtractionService';

export interface AggregationResult {
  aggregatedText: string;
  metadata: {
    totalPages: number;
    totalRegions: number;
    averageConfidence: number;
    languageDistribution: {
      arabic: number;
      french: number;
      mixed: number;
    };
    processingTime: number;
  };
  pageBreakdowns: Array<{
    pageNumber: number;
    regionCount: number;
    textLength: number;
    confidence: number;
    language: 'ar' | 'fr' | 'mixed';
  }>;
}

export class TextAggregationService {
  /**
   * Agrégation complète avec analyse détaillée
   */
  aggregateTextRegions(textRegions: AlgerianTextRegion[][]): AggregationResult {
    const startTime = Date.now();
    
    const aggregatedSections: string[] = [];
    const pageBreakdowns: AggregationResult['pageBreakdowns'] = [];
    
    let totalRegions = 0;
    let totalConfidence = 0;
    const languageCount = { arabic: 0, french: 0, mixed: 0 };
    
    // Traitement page par page
    for (const [pageIndex, pageRegions] of textRegions.entries()) {
      const pageStartMarker = `\n=== PAGE ${pageIndex + 1} ===\n`;
      const pageTexts: string[] = [];
      
      let pageConfidence = 0;
      const pageLanguageCount = { ar: 0, fr: 0, mixed: 0 };
      
      // Tri des régions par position (y puis x)
      const sortedRegions = this.sortRegionsByPosition(pageRegions);
      
      for (const region of sortedRegions) {
        if (region.text.trim().length > 0) {
          // Nettoyage et formatage du texte
          const cleanedText = this.cleanRegionText(region.text);
          pageTexts.push(cleanedText);
          
          pageConfidence += region.confidence;
          totalConfidence += region.confidence;
          totalRegions++;
          
          // Comptage des langues
          pageLanguageCount[region.language]++;
          languageCount[region.language === 'ar' ? 'arabic' : 
                       region.language === 'fr' ? 'french' : 'mixed']++;
        }
      }
      
      if (pageTexts.length > 0) {
        // Jointure intelligente des textes de la page
        const pageText = this.intelligentTextJoin(pageTexts);
        aggregatedSections.push(pageStartMarker + pageText);
        
        // Calcul des métriques de page
        const avgPageConfidence = pageConfidence / pageRegions.length;
        const dominantLanguage = this.getDominantLanguage(pageLanguageCount);
        
        pageBreakdowns.push({
          pageNumber: pageIndex + 1,
          regionCount: pageRegions.length,
          textLength: pageText.length,
          confidence: avgPageConfidence,
          language: dominantLanguage
        });
      }
    }
    
    // Agrégation finale
    const aggregatedText = this.finalizeAggregation(aggregatedSections);
    const processingTime = Date.now() - startTime;
    
    return {
      aggregatedText,
      metadata: {
        totalPages: textRegions.length,
        totalRegions,
        averageConfidence: totalRegions > 0 ? totalConfidence / totalRegions : 0,
        languageDistribution: {
          arabic: languageCount.arabic,
          french: languageCount.french,
          mixed: languageCount.mixed
        },
        processingTime
      },
      pageBreakdowns
    };
  }
  
  /**
   * Tri des régions par position (lecture naturelle)
   */
  private sortRegionsByPosition(regions: AlgerianTextRegion[]): AlgerianTextRegion[] {
    return regions.sort((a, b) => {
      // D'abord par Y (ligne), puis par X (colonne)
      const yDiff = a.bbox.y - b.bbox.y;
      if (Math.abs(yDiff) > 10) { // Tolérance de 10px pour même ligne
        return yDiff;
      }
      return a.bbox.x - b.bbox.x;
    });
  }
  
  /**
   * Nettoyage et normalisation du texte
   */
  private cleanRegionText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .replace(/([.!?])\s*$/, '$1') // Assurer la ponctuation finale
      .replace(/\n+/g, ' '); // Remplacer les sauts de ligne internes par des espaces
  }
  
  /**
   * Jointure intelligente des textes avec détection de phrases
   */
  private intelligentTextJoin(texts: string[]): string {
    const joinedTexts: string[] = [];
    
    for (let i = 0; i < texts.length; i++) {
      const currentText = texts[i];
      const nextText = texts[i + 1];
      
      // Ajouter le texte courant
      joinedTexts.push(currentText);
      
      if (nextText) {
        // Déterminer le séparateur approprié
        const separator = this.determineSeparator(currentText, nextText);
        if (separator) {
          joinedTexts.push(separator);
        }
      }
    }
    
    return joinedTexts.join('');
  }
  
  /**
   * Détermine le séparateur approprié entre deux textes
   */
  private determineSeparator(current: string, next: string): string {
    // Si le texte courant finit par une ponctuation forte
    if (/[.!?]$/.test(current)) {
      return '\n\n'; // Double saut de ligne pour nouveau paragraphe
    }
    
    // Si le texte suivant commence par une majuscule et le courant n'a pas de ponctuation
    if (/^[A-ZÀÂÄÇÉÈÊËÏÎÔÙÛÜŸÑÆŒ]/.test(next) && !/[.!?:;,]$/.test(current)) {
      return '. '; // Ajouter un point et un espace
    }
    
    // Si changement de langue détecté
    const currentIsArabic = /[\u0600-\u06FF]/.test(current);
    const nextIsArabic = /[\u0600-\u06FF]/.test(next);
    
    if (currentIsArabic !== nextIsArabic) {
      return '\n\n'; // Séparation pour changement de langue
    }
    
    // Par défaut, simple espace
    return ' ';
  }
  
  /**
   * Détermine la langue dominante d'une page
   */
  private getDominantLanguage(counts: { ar: number; fr: number; mixed: number }): 'ar' | 'fr' | 'mixed' {
    const total = counts.ar + counts.fr + counts.mixed;
    if (total === 0) return 'fr';
    
    if (counts.mixed / total > 0.3) return 'mixed';
    if (counts.ar > counts.fr) return 'ar';
    return 'fr';
  }
  
  /**
   * Finalisation de l'agrégation avec post-traitement
   */
  private finalizeAggregation(sections: string[]): string {
    let finalText = sections.join('\n\n');
    
    // Post-traitement global
    finalText = this.postProcessText(finalText);
    
    return finalText;
  }
  
  /**
   * Post-traitement final du texte
   */
  private postProcessText(text: string): string {
    return text
      // Normaliser les espaces multiples
      .replace(/\s{3,}/g, '  ')
      // Normaliser les sauts de ligne multiples
      .replace(/\n{4,}/g, '\n\n\n')
      // Corriger la ponctuation collée
      .replace(/([.!?])([A-ZÀÂÄÇÉÈÊËÏÎÔÙÛÜŸÑÆŒ])/g, '$1 $2')
      // Supprimer les espaces en fin de ligne
      .replace(/ +$/gm, '')
      .trim();
  }
  
  /**
   * Extraction de texte par type d'entité
   */
  extractByEntityType(textRegions: AlgerianTextRegion[][], entityType: string): string[] {
    const results: string[] = [];
    
    for (const pageRegions of textRegions) {
      for (const region of pageRegions) {
        if (region.entityType === entityType && region.text.trim()) {
          results.push(region.text.trim());
        }
      }
    }
    
    return results;
  }
  
  /**
   * Génération d'un résumé de l'agrégation
   */
  generateAggregationSummary(result: AggregationResult): string {
    const { metadata, pageBreakdowns } = result;
    
    const summary = [
      `Agrégation complétée: ${metadata.totalPages} pages, ${metadata.totalRegions} régions`,
      `Confiance moyenne: ${(metadata.averageConfidence * 100).toFixed(1)}%`,
      `Distribution linguistique: ${metadata.languageDistribution.arabic} AR, ${metadata.languageDistribution.french} FR, ${metadata.languageDistribution.mixed} mixte`,
      `Temps de traitement: ${metadata.processingTime}ms`,
      '',
      'Détail par page:',
      ...pageBreakdowns.map(page => 
        `- Page ${page.pageNumber}: ${page.regionCount} régions, ${page.textLength} caractères (${page.language.toUpperCase()})`
      )
    ];
    
    return summary.join('\n');
  }
}

export const textAggregationService = new TextAggregationService();
export default textAggregationService;