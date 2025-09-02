/**
 * Service d'export PDF local - Phase 4 complétée
 * Génération de PDFs directement dans le navigateur sans serveur
 */

import jsPDF from 'jspdf';
import { AlgerianExtractionResult } from '@/services/enhanced/algerianDocumentExtractionService';
import { logger } from '@/utils/logger';

export interface PDFExportOptions {
  format: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  includeMetadata: boolean;
  includeImages: boolean;
  fontSize: number;
  margin: number;
  fontFamily: 'helvetica' | 'times' | 'courier';
  language: 'fr' | 'ar' | 'mixed';
}

export interface ExportResult {
  success: boolean;
  filename: string;
  size: number;
  pages: number;
  processingTime: number;
  error?: string;
}

class PDFExportService {
  private readonly DEFAULT_OPTIONS: PDFExportOptions = {
    format: 'A4',
    orientation: 'portrait',
    includeMetadata: true,
    includeImages: false,
    fontSize: 12,
    margin: 20,
    fontFamily: 'helvetica',
    language: 'fr'
  };

  /**
   * Exporte une extraction en PDF
   */
  async exportToPDF(
    extraction: AlgerianExtractionResult,
    options: Partial<PDFExportOptions> = {}
  ): Promise<ExportResult> {
    const startTime = performance.now();
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      logger.info('SYSTEM', 'Début de l\'export PDF', { 
        filename: extraction.originalFilename,
        language: extraction.languageDetected
      });

      // Créer le document PDF
      const pdf = new jsPDF({
        orientation: config.orientation,
        unit: 'mm',
        format: config.format
      });

      // Configuration de la page
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - (config.margin * 2);
      const contentHeight = pageHeight - (config.margin * 2);

      // Ajouter les métadonnées du document
      this.addDocumentMetadata(pdf, extraction, config);

      // Page de titre
      this.createTitlePage(pdf, extraction, config, pageWidth, pageHeight);

      // Ajouter les métadonnées si demandées
      if (config.includeMetadata) {
        pdf.addPage();
        this.addMetadataPage(pdf, extraction, config, contentWidth);
      }

      // Ajouter le contenu principal
      pdf.addPage();
      await this.addMainContent(pdf, extraction, config, contentWidth, contentHeight);

      // Ajouter les entités détectées
      const detectedEntities: Record<string, any[]> = (extraction.metadata as any)?.detectedEntities || {};
      if (Object.keys(detectedEntities).some(key => (detectedEntities as any)[key]?.length > 0)) {
        pdf.addPage();
        this.addEntitiesPage(pdf, extraction, config, contentWidth);
      }

      // Générer le PDF et déclencher le téléchargement
      const filename = this.generateFilename(extraction);
      const pdfData = pdf.output('blob');
      this.downloadBlob(pdfData, filename);

      const processingTime = performance.now() - startTime;
      const result: ExportResult = {
        success: true,
        filename,
        size: pdfData.size,
        pages: pdf.internal.pages.length - 1, // -1 car la première page est toujours vide
        processingTime
      };

      logger.info('SYSTEM', 'Export PDF terminé', result);
      return result;

    } catch (error) {
      const processingTime = performance.now() - startTime;
      logger.error('SYSTEM', 'Erreur lors de l\'export PDF', error);
      
      return {
        success: false,
        filename: '',
        size: 0,
        pages: 0,
        processingTime,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Ajoute les métadonnées du document PDF
   */
  private addDocumentMetadata(
    pdf: jsPDF,
    extraction: AlgerianExtractionResult,
    config: PDFExportOptions
  ): void {
    const metadata = {
      title: `Extraction OCR - ${extraction.originalFilename}`,
      subject: 'Document juridique algérien extrait par OCR-IA',
      author: 'OCR-IA Système',
      creator: 'DZOCR-IA v3.0',
      keywords: (() => {
        const detected: Record<string, any[]> = (extraction.metadata as any)?.detectedEntities || {};
        return Object.values(detected)
          .flat()
          .map((entity: any) => entity.value)
          .slice(0, 10)
          .join(', ');
      })()
    };

    pdf.setProperties(metadata);
  }

  /**
   * Crée la page de titre
   */
  private createTitlePage(
    pdf: jsPDF,
    extraction: AlgerianExtractionResult,
    config: PDFExportOptions,
    pageWidth: number,
    pageHeight: number
  ): void {
    // Titre principal
    pdf.setFontSize(24);
    pdf.setFont(config.fontFamily, 'bold');
    const title = 'Extraction OCR - Document Juridique Algérien';
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, 40);

    // Ligne de séparation
    pdf.setLineWidth(0.5);
    pdf.line(config.margin, 50, pageWidth - config.margin, 50);

    // Informations du document
    pdf.setFontSize(14);
    pdf.setFont(config.fontFamily, 'normal');
    
    const infoY = 70;
    const lineHeight = 8;
    let currentY = infoY;

    const infos = [
      `Fichier original: ${extraction.originalFilename}`,
      `Type de document: ${extraction.metadata.documentType || 'Document'}`,
      `Nombre de pages: ${extraction.totalPages}`,
      `Langue détectée: ${this.getLanguageLabel(extraction.languageDetected)}`,
      `${extraction.isMixedLanguage ? 'Document bilingue' : 'Document monolingue'}`,
      `Confiance moyenne: ${Math.round(extraction.confidenceScore * 100)}%`,
      `Date de traitement: ${new Date(extraction.metadata.processingDate).toLocaleDateString('fr-FR')}`,
      `Temps de traitement: ${extraction.metadata.processingTime} ms`
    ];

    infos.forEach(info => {
      pdf.text(info, config.margin, currentY);
      currentY += lineHeight;
    });

    // Logo ou marque (textuel)
    pdf.setFontSize(10);
    pdf.setFont(config.fontFamily, 'italic');
    const footer = 'Généré par DZOCR-IA v3.0 - Système d\'extraction OCR pour documents algériens';
    const footerWidth = pdf.getTextWidth(footer);
    pdf.text(footer, (pageWidth - footerWidth) / 2, pageHeight - 20);
  }

  /**
   * Ajoute la page de métadonnées
   */
  private addMetadataPage(
    pdf: jsPDF,
    extraction: AlgerianExtractionResult,
    config: PDFExportOptions,
    contentWidth: number
  ): void {
    pdf.setFontSize(18);
    pdf.setFont(config.fontFamily, 'bold');
    pdf.text('Métadonnées Techniques', config.margin, 30);

    pdf.setFontSize(12);
    pdf.setFont(config.fontFamily, 'normal');
    
    let currentY = 50;
    const lineHeight = 6;

    // Métadonnées techniques
    const technicalData = [
      '1. Traitement OCR',
      `   • Algorithme: Standard OCR`,
      `   • Temps de traitement: ${extraction.metadata.processingTime} ms`,
      `   • Confiance moyenne: ${Math.round(extraction.metadata.averageConfidence * 100)}%`,
      '',
      '2. Distribution des langues',
      `   • Régions en arabe: ${extraction.metadata.languageDistribution?.arabic || 0}`,
      `   • Régions en français: ${extraction.metadata.languageDistribution?.french || 0}`,
      `   • Régions mixtes: ${extraction.metadata.languageDistribution?.mixed || 0}`,
      '',
      '3. Analyse du document',
      `   • Type détecté: ${extraction.metadata.documentType || 'Non déterminé'}`,
      `   • Document bilingue: ${extraction.isMixedLanguage ? 'Oui' : 'Non'}`,
      `   • Régions de texte détectées: ${extraction.textRegions.flat().length}`
    ];

    technicalData.forEach(line => {
      if (line.trim() === '') {
        currentY += lineHeight / 2;
      } else {
        pdf.text(line, config.margin, currentY);
        currentY += lineHeight;
      }
    });
  }

  /**
   * Ajoute le contenu principal (texte extrait)
   */
  private async addMainContent(
    pdf: jsPDF,
    extraction: AlgerianExtractionResult,
    config: PDFExportOptions,
    contentWidth: number,
    contentHeight: number
  ): Promise<void> {
    pdf.setFontSize(18);
    pdf.setFont(config.fontFamily, 'bold');
    pdf.text('Texte Extrait', config.margin, 30);

    pdf.setFontSize(config.fontSize);
    pdf.setFont(config.fontFamily, 'normal');

    // Diviser le texte en lignes qui tiennent dans la largeur
    const text = extraction.extractedText;
    const lines = pdf.splitTextToSize(text, contentWidth);
    
    let currentY = 50;
    const lineHeight = config.fontSize * 0.4;
    const maxY = config.margin + contentHeight - 20;

    for (let i = 0; i < lines.length; i++) {
      // Vérifier s'il faut ajouter une nouvelle page
      if (currentY > maxY) {
        pdf.addPage();
        currentY = config.margin + 10;
      }

      pdf.text(lines[i], config.margin, currentY);
      currentY += lineHeight;
    }
  }

  /**
   * Ajoute la page des entités détectées
   */
  private addEntitiesPage(
    pdf: jsPDF,
    extraction: AlgerianExtractionResult,
    config: PDFExportOptions,
    contentWidth: number
  ): void {
    pdf.setFontSize(18);
    pdf.setFont(config.fontFamily, 'bold');
    pdf.text('Entités Juridiques Détectées', config.margin, 30);

    pdf.setFontSize(12);
    pdf.setFont(config.fontFamily, 'normal');
    
    let currentY = 50;
    const lineHeight = 6;

    const detected: Record<string, any[]> = (extraction.metadata as any)?.detectedEntities || {};
    Object.entries(detected).forEach(([type, entities]) => {
      if (entities.length > 0) {
        // Titre de la catégorie
        pdf.setFont(config.fontFamily, 'bold');
        pdf.text(`${this.getCategoryLabel(type)} (${entities.length})`, config.margin, currentY);
        currentY += lineHeight;

        // Entités
        pdf.setFont(config.fontFamily, 'normal');
        entities.slice(0, 20).forEach((entity: any) => {
          const entityText = `• ${entity.value} (confiance: ${Math.round(entity.confidence * 100)}%)`;
          pdf.text(entityText, config.margin + 5, currentY);
          currentY += lineHeight;
        });

        if (entities.length > 20) {
          pdf.setFont(config.fontFamily, 'italic');
          pdf.text(`... et ${entities.length - 20} autres entités`, config.margin + 5, currentY);
          currentY += lineHeight;
        }

        currentY += lineHeight; // Espacement entre catégories
      }
    });
  }

  /**
   * Génère un nom de fichier pour l'export
   */
  private generateFilename(extraction: AlgerianExtractionResult): string {
    const date = new Date().toISOString().split('T')[0];
    const baseName = extraction.originalFilename.replace(/\.[^/.]+$/, '');
    return `OCR_Export_${baseName}_${date}.pdf`;
  }

  /**
   * Déclenche le téléchargement d'un blob
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Convertit le code de langue en label
   */
  private getLanguageLabel(code: string): string {
    const labels: Record<string, string> = {
      'fr': 'Français',
      'ar': 'Arabe',
      'mixed': 'Bilingue (Arabe/Français)'
    };
    return labels[code] || code;
  }

  /**
   * Convertit le type de catégorie en label
   */
  private getCategoryLabel(type: string): string {
    const labels: Record<string, string> = {
      'dates': 'Dates',
      'numbers': 'Numéros officiels',
      'institutions': 'Institutions',
      'references': 'Références juridiques'
    };
    return labels[type] || type;
  }
}

export const pdfExportService = new PDFExportService();
export default pdfExportService;