/**
 * Service de correspondance et fusion intelligente pour l'extraction de tables
 * Implémentation complète des algorithmes de fusion avancés
 */

import { ExtractedTable, TableCell } from '@/types/imageProcessing';
import { ReconstructedTable } from './advancedTableExtractionService';

export interface TableMergeConfig {
  maxMergeDistance: number;
  structureSimilarityThreshold: number;
  contentSimilarityThreshold: number;
  enableCrossPageMerging: boolean;
  intelligentHeaderMatching: boolean;
}

export interface MergeCandidate {
  primaryTable: ExtractedTable;
  secondaryTable: ExtractedTable;
  mergeScore: number;
  mergeType: 'horizontal' | 'vertical' | 'continuation';
  confidence: number;
  alignmentQuality: number;
}

class IntelligentTableMergeService {
  private config: TableMergeConfig = {
    maxMergeDistance: 50,
    structureSimilarityThreshold: 0.8,
    contentSimilarityThreshold: 0.7,
    enableCrossPageMerging: true,
    intelligentHeaderMatching: true
  };

  /**
   * Correspondance et fusion intelligente de tables
   */
  async performIntelligentMerging(tables: ExtractedTable[]): Promise<ExtractedTable[]> {
    console.log(`🔄 Début fusion intelligente de ${tables.length} tables`);
    
    if (tables.length <= 1) return tables;

    // Étape 1: Analyser les candidats à la fusion
    const mergeCandidates = this.identifyMergeCandidates(tables);
    console.log(`📊 Identifié ${mergeCandidates.length} candidats à la fusion`);

    // Étape 2: Trier par score de fusion décroissant
    const sortedCandidates = mergeCandidates.sort((a, b) => b.mergeScore - a.mergeScore);

    // Étape 3: Fusionner intelligemment
    const mergedTables = await this.executeMerging(tables, sortedCandidates);

    console.log(`✅ Fusion terminée: ${tables.length} → ${mergedTables.length} tables`);
    return mergedTables;
  }

  /**
   * Identification des candidats à la fusion
   */
  private identifyMergeCandidates(tables: ExtractedTable[]): MergeCandidate[] {
    const candidates: MergeCandidate[] = [];

    for (let i = 0; i < tables.length; i++) {
      for (let j = i + 1; j < tables.length; j++) {
        const candidate = this.analyzeMergeCompatibility(tables[i], tables[j]);
        
        if (candidate && candidate.mergeScore > 0.5) {
          candidates.push(candidate);
        }
      }
    }

    return candidates;
  }

  /**
   * Analyse de compatibilité pour fusion
   */
  private analyzeMergeCompatibility(table1: ExtractedTable, table2: ExtractedTable): MergeCandidate | null {
    // Calcul de la distance spatiale
    const spatialDistance = this.calculateSpatialDistance(table1, table2);
    
    if (spatialDistance > this.config.maxMergeDistance) {
      return null; // Trop éloignées
    }

    // Analyse de la compatibilité structurelle
    const structuralCompatibility = this.analyzeStructuralCompatibility(table1, table2);
    
    if (structuralCompatibility.score < this.config.structureSimilarityThreshold) {
      return null; // Structures incompatibles
    }

    // Analyse de l'alignement
    const alignmentAnalysis = this.analyzeAlignment(table1, table2);

    // Détermination du type de fusion
    const mergeType = this.determineMergeType(table1, table2, alignmentAnalysis);

    // Calcul du score global de fusion
    const mergeScore = this.calculateMergeScore(
      spatialDistance,
      structuralCompatibility,
      alignmentAnalysis
    );

    return {
      primaryTable: table1,
      secondaryTable: table2,
      mergeScore,
      mergeType,
      confidence: structuralCompatibility.confidence,
      alignmentQuality: alignmentAnalysis.quality
    };
  }

  /**
   * Calcul de la distance spatiale entre tables
   */
  private calculateSpatialDistance(table1: ExtractedTable, table2: ExtractedTable): number {
    const box1 = table1.boundingBox || table1.zone;
    const box2 = table2.boundingBox || table2.zone;

    // Distance entre centres
    const center1 = {
      x: box1.x + box1.width / 2,
      y: box1.y + box1.height / 2
    };
    
    const center2 = {
      x: box2.x + box2.width / 2,
      y: box2.y + box2.height / 2
    };

    return Math.sqrt(
      Math.pow(center2.x - center1.x, 2) + 
      Math.pow(center2.y - center1.y, 2)
    );
  }

  /**
   * Analyse de compatibilité structurelle
   */
  private analyzeStructuralCompatibility(table1: ExtractedTable, table2: ExtractedTable): any {
    let score = 0;
    let confidence = 0;

    // Compatibilité du nombre de colonnes
    const cols1 = table1.cols || table1.metadata?.columnCount || 0;
    const cols2 = table2.cols || table2.metadata?.columnCount || 0;
    
    if (cols1 === cols2) {
      score += 0.4;
      confidence += 0.3;
    } else if (Math.abs(cols1 - cols2) <= 1) {
      score += 0.2;
      confidence += 0.1;
    }

    // Compatibilité des en-têtes
    if (this.config.intelligentHeaderMatching) {
      const headerSimilarity = this.compareHeaders(table1.headers, table2.headers);
      score += headerSimilarity.score * 0.4;
      confidence += headerSimilarity.confidence * 0.3;
    }

    // Similarité des métadonnées
    const metadataSimilarity = this.compareMetadata(table1.metadata, table2.metadata);
    score += metadataSimilarity * 0.2;
    confidence += metadataSimilarity * 0.2;

    return {
      score: Math.min(score, 1.0),
      confidence: Math.min(confidence, 1.0)
    };
  }

  /**
   * Comparaison intelligente des en-têtes
   */
  private compareHeaders(headers1: string[], headers2: string[]): any {
    if (!headers1 || !headers2 || headers1.length === 0 || headers2.length === 0) {
      return { score: 0.5, confidence: 0.3 }; // Score neutre
    }

    let totalSimilarity = 0;
    let matchCount = 0;

    const maxLength = Math.max(headers1.length, headers2.length);
    
    for (let i = 0; i < maxLength; i++) {
      const header1 = headers1[i] || '';
      const header2 = headers2[i] || '';
      
      if (header1 && header2) {
        const similarity = this.calculateTextSimilarity(header1, header2);
        totalSimilarity += similarity;
        
        if (similarity > 0.7) matchCount++;
      }
    }

    const avgSimilarity = maxLength > 0 ? totalSimilarity / maxLength : 0;
    const matchRatio = maxLength > 0 ? matchCount / maxLength : 0;

    return {
      score: (avgSimilarity + matchRatio) / 2,
      confidence: matchRatio
    };
  }

  /**
   * Calcul de similarité textuelle
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;
    
    const normalized1 = text1.toLowerCase().trim();
    const normalized2 = text2.toLowerCase().trim();
    
    if (normalized1 === normalized2) return 1.0;
    
    // Algorithme de Levenshtein simplifié
    const maxLen = Math.max(normalized1.length, normalized2.length);
    if (maxLen === 0) return 1.0;
    
    let matches = 0;
    const minLen = Math.min(normalized1.length, normalized2.length);
    
    for (let i = 0; i < minLen; i++) {
      if (normalized1[i] === normalized2[i]) {
        matches++;
      }
    }
    
    return matches / maxLen;
  }

  /**
   * Comparaison des métadonnées
   */
  private compareMetadata(meta1: any, meta2: any): number {
    if (!meta1 || !meta2) return 0.5;

    let score = 0;
    let factors = 0;

    // Style de bordure
    if (meta1.borderStyle && meta2.borderStyle) {
      score += meta1.borderStyle === meta2.borderStyle ? 0.3 : 0.1;
      factors += 0.3;
    }

    // Présence d'en-têtes
    if (meta1.hasHeaders !== undefined && meta2.hasHeaders !== undefined) {
      score += meta1.hasHeaders === meta2.hasHeaders ? 0.2 : 0;
      factors += 0.2;
    }

    // Méthode d'extraction
    if (meta1.extractionMethod && meta2.extractionMethod) {
      score += meta1.extractionMethod === meta2.extractionMethod ? 0.2 : 0.1;
      factors += 0.2;
    }

    return factors > 0 ? score / factors : 0.5;
  }

  /**
   * Analyse d'alignement entre tables
   */
  private analyzeAlignment(table1: ExtractedTable, table2: ExtractedTable): any {
    const box1 = table1.boundingBox || table1.zone;
    const box2 = table2.boundingBox || table2.zone;

    // Alignement horizontal
    const horizontalOverlap = this.calculateHorizontalOverlap(box1, box2);
    const verticalOverlap = this.calculateVerticalOverlap(box1, box2);

    // Alignement des bordures
    const leftAligned = Math.abs(box1.x - box2.x) < 10;
    const rightAligned = Math.abs((box1.x + box1.width) - (box2.x + box2.width)) < 10;
    const topAligned = Math.abs(box1.y - box2.y) < 10;
    const bottomAligned = Math.abs((box1.y + box1.height) - (box2.y + box2.height)) < 10;

    // Calcul de la qualité d'alignement
    let quality = 0;
    
    if (horizontalOverlap > 0.8) quality += 0.4;
    else if (horizontalOverlap > 0.5) quality += 0.2;
    
    if (verticalOverlap > 0.8) quality += 0.4;
    else if (verticalOverlap > 0.5) quality += 0.2;

    if (leftAligned || rightAligned) quality += 0.1;
    if (topAligned || bottomAligned) quality += 0.1;

    return {
      horizontalOverlap,
      verticalOverlap,
      leftAligned,
      rightAligned,
      topAligned,
      bottomAligned,
      quality: Math.min(quality, 1.0)
    };
  }

  /**
   * Calcul du chevauchement horizontal
   */
  private calculateHorizontalOverlap(box1: any, box2: any): number {
    const left = Math.max(box1.x, box2.x);
    const right = Math.min(box1.x + box1.width, box2.x + box2.width);
    
    if (left >= right) return 0;
    
    const overlap = right - left;
    const maxWidth = Math.max(box1.width, box2.width);
    
    return overlap / maxWidth;
  }

  /**
   * Calcul du chevauchement vertical
   */
  private calculateVerticalOverlap(box1: any, box2: any): number {
    const top = Math.max(box1.y, box2.y);
    const bottom = Math.min(box1.y + box1.height, box2.y + box2.height);
    
    if (top >= bottom) return 0;
    
    const overlap = bottom - top;
    const maxHeight = Math.max(box1.height, box2.height);
    
    return overlap / maxHeight;
  }

  /**
   * Détermination du type de fusion
   */
  private determineMergeType(table1: ExtractedTable, table2: ExtractedTable, alignment: any): 'horizontal' | 'vertical' | 'continuation' {
    const box1 = table1.boundingBox || table1.zone;
    const box2 = table2.boundingBox || table2.zone;

    // Fusion verticale (tables l'une sous l'autre)
    if (alignment.horizontalOverlap > 0.7 && box2.y > box1.y + box1.height) {
      return 'vertical';
    }

    // Fusion horizontale (tables côte à côte)
    if (alignment.verticalOverlap > 0.7 && box2.x > box1.x + box1.width) {
      return 'horizontal';
    }

    // Continuation (suite logique)
    return 'continuation';
  }

  /**
   * Calcul du score global de fusion
   */
  private calculateMergeScore(
    spatialDistance: number,
    structuralCompatibility: any,
    alignmentAnalysis: any
  ): number {
    // Score basé sur la distance (plus proche = meilleur)
    const distanceScore = Math.max(0, 1 - (spatialDistance / this.config.maxMergeDistance));
    
    // Score basé sur la compatibilité structurelle
    const structureScore = structuralCompatibility.score;
    
    // Score basé sur l'alignement
    const alignmentScore = alignmentAnalysis.quality;

    // Moyenne pondérée
    return (distanceScore * 0.3 + structureScore * 0.5 + alignmentScore * 0.2);
  }

  /**
   * Exécution de la fusion
   */
  private async executeMerging(
    originalTables: ExtractedTable[],
    mergeCandidates: MergeCandidate[]
  ): Promise<ExtractedTable[]> {
    const processedTables = new Set<string>();
    const resultTables: ExtractedTable[] = [];

    for (const candidate of mergeCandidates) {
      const id1 = candidate.primaryTable.id;
      const id2 = candidate.secondaryTable.id;

      // Ignorer si les tables ont déjà été fusionnées
      if (processedTables.has(id1) || processedTables.has(id2)) {
        continue;
      }

      try {
        // Effectuer la fusion
        const mergedTable = await this.mergeTables(candidate);
        
        if (mergedTable) {
          resultTables.push(mergedTable);
          processedTables.add(id1);
          processedTables.add(id2);
          
          console.log(`✅ Tables ${id1} et ${id2} fusionnées (score: ${candidate.mergeScore.toFixed(2)})`);
        }
      } catch (error) {
        console.warn(`⚠️ Erreur lors de la fusion des tables ${id1} et ${id2}:`, error);
      }
    }

    // Ajouter les tables non fusionnées
    for (const table of originalTables) {
      if (!processedTables.has(table.id)) {
        resultTables.push(table);
      }
    }

    return resultTables;
  }

  /**
   * Fusion effective de deux tables
   */
  private async mergeTables(candidate: MergeCandidate): Promise<ExtractedTable | null> {
    const { primaryTable, secondaryTable, mergeType } = candidate;

    switch (mergeType) {
      case 'vertical':
        return this.mergeTablesVertically(primaryTable, secondaryTable);
      
      case 'horizontal':
        return this.mergeTablesHorizontally(primaryTable, secondaryTable);
      
      case 'continuation':
        return this.mergeTablesContinuation(primaryTable, secondaryTable);
      
      default:
        return null;
    }
  }

  /**
   * Fusion verticale (lignes)
   */
  private mergeTablesVertically(table1: ExtractedTable, table2: ExtractedTable): ExtractedTable {
    const mergedRows = [...(table1.rows || table1.cells || [])];
    
    // Ajouter les lignes de la deuxième table
    if (table2.rows) {
      mergedRows.push(...table2.rows);
    } else if (table2.cells) {
      mergedRows.push(...table2.cells);
    }

    // Calculer la nouvelle boîte englobante
    const box1 = table1.boundingBox || table1.zone;
    const box2 = table2.boundingBox || table2.zone;
    
    const mergedBoundingBox = {
      x: Math.min(box1.x, box2.x),
      y: Math.min(box1.y, box2.y),
      width: Math.max(box1.x + box1.width, box2.x + box2.width) - Math.min(box1.x, box2.x),
      height: Math.max(box1.y + box1.height, box2.y + box2.height) - Math.min(box1.y, box2.y)
    };

    return {
      ...table1,
      id: `merged_vertical_${table1.id}_${table2.id}`,
      rows: mergedRows,
      cells: mergedRows,
      boundingBox: mergedBoundingBox,
        zone: {
          ...mergedBoundingBox,
          type: 'table' as const,
          confidence: 0.8,
          density: 0.5
        },
      metadata: {
        ...table1.metadata,
        rowCount: mergedRows.length,
        extractionMethod: 'intelligent_vertical_merge',
        confidence: (table1.metadata.confidence + table2.metadata.confidence) / 2
      }
    };
  }

  /**
   * Fusion horizontale (colonnes)
   */
  private mergeTablesHorizontally(table1: ExtractedTable, table2: ExtractedTable): ExtractedTable {
    const rows1 = table1.rows || table1.cells || [];
    const rows2 = table2.rows || table2.cells || [];
    
    const mergedRows: TableCell[][] = [];
    const maxRows = Math.max(rows1.length, rows2.length);

    for (let i = 0; i < maxRows; i++) {
      const row1 = rows1[i] || [];
      const row2 = rows2[i] || [];
      mergedRows.push([...row1, ...row2]);
    }

    // Fusionner les en-têtes
    const mergedHeaders = [...(table1.headers || []), ...(table2.headers || [])];

    // Calculer la nouvelle boîte englobante
    const box1 = table1.boundingBox || table1.zone;
    const box2 = table2.boundingBox || table2.zone;
    
    const mergedBoundingBox = {
      x: Math.min(box1.x, box2.x),
      y: Math.min(box1.y, box2.y),
      width: Math.max(box1.x + box1.width, box2.x + box2.width) - Math.min(box1.x, box2.x),
      height: Math.max(box1.y + box1.height, box2.y + box2.height) - Math.min(box1.y, box2.y)
    };

    return {
      ...table1,
      id: `merged_horizontal_${table1.id}_${table2.id}`,
      headers: mergedHeaders,
      rows: mergedRows,
      cells: mergedRows,
      cols: mergedHeaders.length,
      boundingBox: mergedBoundingBox,
        zone: {
          ...mergedBoundingBox,
          type: 'table' as const,
          confidence: 0.8,
          density: 0.5
        },
      metadata: {
        ...table1.metadata,
        columnCount: mergedHeaders.length,
        extractionMethod: 'intelligent_horizontal_merge',
        confidence: (table1.metadata.confidence + table2.metadata.confidence) / 2
      }
    };
  }

  /**
   * Fusion par continuation
   */
  private mergeTablesContinuation(table1: ExtractedTable, table2: ExtractedTable): ExtractedTable {
    // Utiliser la fusion verticale par défaut pour les continuations
    return this.mergeTablesVertically(table1, table2);
  }

  /**
   * Mise à jour de la configuration
   */
  updateConfig(config: Partial<TableMergeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Récupération de la configuration
   */
  getConfig(): TableMergeConfig {
    return { ...this.config };
  }
}

export const intelligentTableMergeService = new IntelligentTableMergeService();
export default intelligentTableMergeService;