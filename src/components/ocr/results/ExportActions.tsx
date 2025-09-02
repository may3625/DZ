import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Download, Copy, FileText, FileJson } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RealOCRResult } from '@/services/realOcrService';
import jsPDF from 'jspdf';

interface ExportActionsProps {
  result: RealOCRResult | null;
  mappedData: Record<string, unknown>;
}

export const ExportActions = ({ result, mappedData }: ExportActionsProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToJSON = async () => {
    if (!result) return;
    
    setIsExporting(true);
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        result,
        mappedData,
        metadata: {
          entitiesCount: result.entities ? Object.keys(result.entities).length : 0,
          extractedTextLength: result.text?.length || 0,
          confidence: result.confidence
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ocr-results-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export JSON réussi",
        description: "Les résultats ont été exportés en JSON"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'export",
        description: "Impossible d'exporter en JSON"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToTXT = async () => {
    if (!result) return;
    
    setIsExporting(true);
    try {
      let content = '=== RÉSULTATS OCR ===\n\n';
      content += `Date: ${new Date().toLocaleString()}\n`;
      content += `Confiance: ${result.confidence || 'N/A'}\n\n`;
      
      if (result.text) {
        content += '=== TEXTE EXTRAIT ===\n';
        content += result.text + '\n\n';
      }
      
      if (result.entities && Object.keys(result.entities).length > 0) {
        content += '=== ENTITÉS DÉTECTÉES ===\n';
        Object.entries(result.entities).forEach(([key, value], index) => {
          if (value) {
            content += `${index + 1}. ${key}: ${Array.isArray(value) ? value.join(', ') : value}\n`;
          }
        });
        content += '\n';
      }
      
      if (Object.keys(mappedData).length) {
        content += '=== DONNÉES MAPPÉES ===\n';
        Object.entries(mappedData).forEach(([key, value]) => {
          content += `${key}: ${value}\n`;
        });
      }

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ocr-results-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export TXT réussi",
        description: "Les résultats ont été exportés en texte"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'export",
        description: "Impossible d'exporter en TXT"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    if (!result) return;
    
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      const margin = 20;
      let yPosition = margin;
      
      // Titre
      pdf.setFontSize(20);
      pdf.text('Résultats OCR', margin, yPosition);
      yPosition += 15;
      
      // Métadonnées
      pdf.setFontSize(12);
      pdf.text(`Date: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Confiance: ${result.confidence || 'N/A'}`, margin, yPosition);
      yPosition += 15;
      
      // Texte extrait
      if (result.text) {
        pdf.setFontSize(14);
        pdf.text('Texte Extrait:', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        const lines = pdf.splitTextToSize(result.text, 170);
        lines.forEach((line: string) => {
          if (yPosition > 280) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }
      
      // Entités
      if (result.entities && Object.keys(result.entities).length > 0) {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.text('Entités Détectées:', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        Object.entries(result.entities).forEach(([key, value], index) => {
          if (value && yPosition > 280) {
            pdf.addPage();
            yPosition = margin;
          }
          if (value) {
            pdf.text(`${index + 1}. ${key}: ${Array.isArray(value) ? value.join(', ') : value}`, margin, yPosition);
            yPosition += 6;
          }
        });
      }
      
      pdf.save(`ocr-results-${Date.now()}.pdf`);

      toast({
        title: "Export PDF réussi",
        description: "Les résultats ont été exportés en PDF"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'export",
        description: "Impossible d'exporter en PDF"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    
    try {
      let content = 'RÉSULTATS OCR\n\n';
      
      if (result.text) {
        content += 'TEXTE EXTRAIT:\n';
        content += result.text + '\n\n';
      }
      
      if (result.entities && Object.keys(result.entities).length > 0) {
        content += 'ENTITÉS:\n';
        Object.entries(result.entities).forEach(([key, value]) => {
          if (value) {
            content += `${key}: ${Array.isArray(value) ? value.join(', ') : value}\n`;
          }
        });
      }
      
      await navigator.clipboard.writeText(content);
      
      toast({
        title: "Copié dans le presse-papier",
        description: "Les résultats ont été copiés"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de copie",
        description: "Impossible de copier dans le presse-papier"
      });
    }
  };

  if (!result) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Export...' : 'Exporter'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Exporter en JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToTXT}>
          <FileText className="h-4 w-4 mr-2" />
          Exporter en TXT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Exporter en PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copier tout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};