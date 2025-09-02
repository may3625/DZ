/**
 * Utilitaires d'export avancés - Phase 4 du plan d'action OCR
 * Export PDF, JSON, TXT avec optimisations
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  FileText, 
  File, 
  Image, 
  Copy, 
  ExternalLink,
  Settings,
  CheckCircle
} from 'lucide-react';
import { AlgerianExtractionResult } from '@/services/algerianDocumentExtractionService';
import { MappingResult } from '@/types/mapping';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface ExportOptions {
  format: 'json' | 'txt' | 'pdf' | 'csv';
  includeMetadata: boolean;
  includeMapping: boolean;
  includeRegions: boolean;
  pageBreaks: boolean;
  compression: boolean;
}

interface ExportUtilitiesProps {
  extractedDocument: AlgerianExtractionResult | null;
  mappingResult: MappingResult | null;
  originalFile?: File;
}

export function ExportUtilities({
  extractedDocument,
  mappingResult,
  originalFile
}: ExportUtilitiesProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeMetadata: true,
    includeMapping: true,
    includeRegions: false,
    pageBreaks: true,
    compression: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const updateOption = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const exportAsJSON = async (): Promise<Blob> => {
    const exportData: any = {
      metadata: {
        exportDate: new Date().toISOString(),
        originalFilename: extractedDocument?.originalFilename,
        exportOptions: exportOptions
      }
    };

    if (extractedDocument) {
      exportData.extraction = {
              id: extractedDocument?.id || '',
      filename: extractedDocument?.originalFilename || 'document',
      fileType: extractedDocument?.fileType || 'unknown',
      totalPages: extractedDocument?.totalPages || 0,
      extractedText: extractedDocument?.extractedText || '',
      processingStatus: extractedDocument?.processingStatus || 'unknown',
      confidenceScore: extractedDocument?.confidenceScore || 0,
      languageDetected: extractedDocument?.languageDetected || 'fr',
      isMixedLanguage: extractedDocument?.isMixedLanguage || false
      };

      if (exportOptions.includeMetadata) {
        exportData.extraction.metadata = extractedDocument?.metadata || {};
      }

      if (exportOptions.includeRegions) {
        exportData.extraction.textRegions = extractedDocument?.textRegions || [];
      }
    }

    if (mappingResult && exportOptions.includeMapping) {
      exportData.mapping = {
        formType: mappingResult.formType,
        mappedData: mappingResult.mappedData,
        mappedFields: mappingResult.mappedFields,
        unmappedFields: mappingResult.unmappedFields,
        confidence: mappingResult.confidence
      };
    }

    const jsonString = JSON.stringify(exportData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  };

  const exportAsTXT = async (): Promise<Blob> => {
    let content = '';

    // En-tête
    content += `EXTRACTION OCR - ${extractedDocument?.originalFilename || 'Document'}\n`;
    content += `Date d'export: ${new Date().toLocaleString()}\n`;
    content += `${'='.repeat(60)}\n\n`;

    // Métadonnées
    if (extractedDocument && exportOptions.includeMetadata) {
      content += `MÉTADONNÉES:\n`;
      content += `- Type de fichier: ${extractedDocument?.fileType || 'unknown'}\n`;
      content += `- Nombre de pages: ${extractedDocument?.totalPages || 0}\n`;
      content += `- Langue détectée: ${extractedDocument?.languageDetected || 'fr'}\n`;
      content += `- Confiance: ${((extractedDocument?.confidenceScore || 0) * 100).toFixed(1)}%\n`;
      content += `- Temps de traitement: ${extractedDocument.metadata?.processingTime || 0}ms\n`;
      content += `- Type de document: ${extractedDocument.metadata?.documentType || 'N/A'}\n\n`;
    }

    // Mapping
    if (mappingResult && exportOptions.includeMapping) {
      content += `MAPPING:\n`;
      content += `- Type de formulaire: ${mappingResult.formType}\n`;
      content += `- Champs mappés: ${mappingResult.mappedFields.length}\n`;
      content += `- Champs non mappés: ${mappingResult.unmappedFields.length}\n`;
      content += `- Confiance du mapping: ${(mappingResult.confidence * 100).toFixed(1)}%\n\n`;
      
      // Données mappées
      content += `DONNÉES MAPPÉES:\n`;
      Object.entries(mappingResult.mappedData).forEach(([key, value]) => {
        content += `- ${key}: ${value}\n`;
      });
      content += '\n';
    }

    // Contenu principal
    content += `TEXTE EXTRAIT:\n`;
    content += `${'='.repeat(40)}\n\n`;

    if (extractedDocument) {
      if (exportOptions.pageBreaks && (extractedDocument?.textRegions?.length || 0) > 1) {
        // Export avec séparation par pages
        extractedDocument?.textRegions?.forEach((pageRegions, pageIndex) => {
          content += `--- PAGE ${pageIndex + 1} ---\n\n`;
          pageRegions.forEach(region => {
            if (region.text.trim()) {
              content += `${region.text.trim()}\n\n`;
            }
          });
          content += '\n';
        });
      } else {
        // Export du texte agrégé
        content += extractedDocument?.extractedText || '';
      }
    }

    return new Blob([content], { type: 'text/plain;charset=utf-8' });
  };

  const exportAsPDF = async (): Promise<Blob> => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 6;
    let currentY = margin;

    // Configuration de la police
    pdf.setFont('helvetica');
    
    // Titre
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Extraction OCR - ${extractedDocument?.originalFilename || 'Document'}`, margin, currentY);
    currentY += lineHeight * 2;

    // Date
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Généré le: ${new Date().toLocaleString()}`, margin, currentY);
    currentY += lineHeight * 2;

    // Ligne de séparation
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += lineHeight;

    // Métadonnées
    if (extractedDocument && exportOptions.includeMetadata) {
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Métadonnées:', margin, currentY);
      currentY += lineHeight;

      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      
      const metadata = [
        `Type: ${extractedDocument?.fileType || 'unknown'}`,
        `Pages: ${extractedDocument?.totalPages || 0}`,
        `Langue: ${extractedDocument?.languageDetected || 'fr'}`,
        `Confiance: ${((extractedDocument?.confidenceScore || 0) * 100).toFixed(1)}%`,
        `Temps: ${extractedDocument.metadata?.processingTime || 0}ms`
      ];

      metadata.forEach(line => {
        pdf.text(`• ${line}`, margin + 5, currentY);
        currentY += lineHeight;
      });
      
      currentY += lineHeight;
    }

    // Contenu principal
    if (extractedDocument) {
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Texte extrait:', margin, currentY);
      currentY += lineHeight * 1.5;

      pdf.setFontSize(9);
      pdf.setTextColor(40, 40, 40);

      const textLines = pdf.splitTextToSize(
        extractedDocument?.extractedText || '',
        pageWidth - 2 * margin
      );

      textLines.forEach((line: string) => {
        if (currentY > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text(line, margin, currentY);
        currentY += lineHeight;
      });
    }

    return pdf.output('blob');
  };

  const exportAsCSV = async (): Promise<Blob> => {
    let csvContent = '';
    
    // En-têtes
    const headers = ['Page', 'Région', 'Texte', 'Confiance', 'Langue', 'Type'];
    csvContent += headers.join(',') + '\n';

    // Données
    if (extractedDocument) {
              extractedDocument?.textRegions?.forEach((pageRegions, pageIndex) => {
        pageRegions.forEach((region, regionIndex) => {
          const row = [
            pageIndex + 1,
            regionIndex + 1,
            `"${region.text.replace(/"/g, '""')}"`, // Échapper les guillemets
            region.confidence.toFixed(3),
            region.language,
            region.entityType || 'text'
          ];
          csvContent += row.join(',') + '\n';
        });
      });
    }

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  };

  const performExport = async () => {
    if (!extractedDocument) {
      toast.error('Aucun document à exporter');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      let blob: Blob;
      let filename: string;
      const baseFilename = (extractedDocument?.originalFilename || 'document').replace(/\.[^/.]+$/, '');

      // Simulation du progrès
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      switch (exportOptions.format) {
        case 'json':
          blob = await exportAsJSON();
          filename = `${baseFilename}_extraction.json`;
          break;
        case 'txt':
          blob = await exportAsTXT();
          filename = `${baseFilename}_extraction.txt`;
          break;
        case 'pdf':
          blob = await exportAsPDF();
          filename = `${baseFilename}_extraction.pdf`;
          break;
        case 'csv':
          blob = await exportAsCSV();
          filename = `${baseFilename}_extraction.csv`;
          break;
        default:
          throw new Error('Format non supporté');
      }

      clearInterval(progressInterval);
      setExportProgress(100);

      // Téléchargement
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Export ${exportOptions.format.toUpperCase()} réussi`);

    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const copyToClipboard = async () => {
    if (!extractedDocument) return;

    try {
      await navigator.clipboard.writeText(extractedDocument?.extractedText || '');
      toast.success('Texte copié dans le presse-papiers');
    } catch (error) {
      console.error('Erreur copie:', error);
      toast.error('Erreur lors de la copie');
    }
  };

  const openOriginalFile = () => {
    if (!originalFile) {
      toast.error('Fichier original non disponible');
      return;
    }

    const url = URL.createObjectURL(originalFile);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="space-y-6">
      {/* Options d'export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Options d'export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format */}
          <div className="space-y-2">
            <Label>Format d'export</Label>
            <Select
              value={exportOptions.format}
              onValueChange={(value: any) => updateOption('format', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (Données complètes)</SelectItem>
                <SelectItem value="txt">TXT (Texte seul)</SelectItem>
                <SelectItem value="pdf">PDF (Formaté)</SelectItem>
                <SelectItem value="csv">CSV (Régions tabulaires)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options d'inclusion */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="metadata"
                checked={exportOptions.includeMetadata}
                onCheckedChange={(checked) => updateOption('includeMetadata', checked)}
              />
              <Label htmlFor="metadata">Inclure métadonnées</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="mapping"
                checked={exportOptions.includeMapping}
                onCheckedChange={(checked) => updateOption('includeMapping', checked)}
                disabled={!mappingResult}
              />
              <Label htmlFor="mapping">Inclure mapping</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="regions"
                checked={exportOptions.includeRegions}
                onCheckedChange={(checked) => updateOption('includeRegions', checked)}
              />
              <Label htmlFor="regions">Inclure régions détaillées</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="pageBreaks"
                checked={exportOptions.pageBreaks}
                onCheckedChange={(checked) => updateOption('pageBreaks', checked)}
              />
              <Label htmlFor="pageBreaks">Saut de page</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions d'export */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={performExport}
          disabled={!extractedDocument || isExporting}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exporter {exportOptions.format.toUpperCase()}
        </Button>

        <Button
          variant="outline"
          onClick={copyToClipboard}
          disabled={!extractedDocument}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copier texte
        </Button>

        <Button
          variant="outline"
          onClick={openOriginalFile}
          disabled={!originalFile}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Fichier original
        </Button>

        <Button
          variant="outline"
          disabled={!extractedDocument}
          className="flex items-center gap-2"
        >
          <Image className="h-4 w-4" />
          Aperçu pages
        </Button>
      </div>

      {/* Progrès d'export */}
      {isExporting && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Export en cours...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résumé des données */}
      {extractedDocument && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Résumé des données
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium">Pages</p>
                <p className="text-muted-foreground">{extractedDocument?.totalPages || 0}</p>
              </div>
              <div>
                <p className="font-medium">Caractères</p>
                <p className="text-muted-foreground">{extractedDocument?.extractedText?.length || 0}</p>
              </div>
              <div>
                <p className="font-medium">Confiance</p>
                <p className="text-muted-foreground">
                  {((extractedDocument?.confidenceScore || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="font-medium">Langue</p>
                <p className="text-muted-foreground">
                  {(extractedDocument?.languageDetected || 'fr').toUpperCase()}
                </p>
              </div>
            </div>
            
            {mappingResult && (
              <div className="pt-3 border-t">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Formulaire</p>
                    <p className="text-muted-foreground">{mappingResult.formType}</p>
                  </div>
                  <div>
                    <p className="font-medium">Champs mappés</p>
                    <p className="text-muted-foreground">{mappingResult.mappedFields.length}</p>
                  </div>
                  <div>
                    <p className="font-medium">Confiance mapping</p>
                    <p className="text-muted-foreground">
                      {(mappingResult.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}