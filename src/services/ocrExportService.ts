import { RealOCRResult } from './realOcrService';

// Service d'export pour les résultats OCR

export const exportToJSON = async (result: RealOCRResult, mappedData: Record<string, unknown>): Promise<void> => {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      format: 'json'
    },
    ocrResult: {
      text: result.text,
      confidence: result.confidence,
      entities: result.entities || [],
      metadata: result.metadata || {},
      pages: result.pages || []
    },
    mappedData,
    statistics: {
      textLength: result.text.length,
      entitiesCount: result.entities ? Object.keys(result.entities).length : 0,
      averageConfidence: result.confidence,
      processingDate: new Date().toISOString()
    }
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `ocr-results-${new Date().getTime()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToTXT = async (result: RealOCRResult): Promise<void> => {
  const header = `=== RÉSULTATS OCR ===
Date d'extraction: ${new Date().toLocaleString('fr-FR')}
Confiance: ${Math.round(result.confidence * 100)}%
Longueur du texte: ${result.text.length} caractères
Entités détectées: ${result.entities ? Object.keys(result.entities).length : 0}

=== CONTENU DU DOCUMENT ===

`;

  const footer = `

=== FIN DU DOCUMENT ===
Généré par le système OCR le ${new Date().toLocaleString('fr-FR')}`;

  const content = header + result.text + footer;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `ocr-text-${new Date().getTime()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = async (result: RealOCRResult, mappedData: Record<string, unknown>): Promise<void> => {
  // Import dynamique pour éviter les problèmes de bundle
  const { jsPDF } = await import('jspdf');
  
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const lineHeight = 7;
  let currentY = margin;

  // Configuration des polices
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  
  // Titre
  pdf.text("Résultats OCR", margin, currentY);
  currentY += lineHeight * 2;
  
  // Métadonnées
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  
  const metadata = [
    `Date d'extraction: ${new Date().toLocaleString('fr-FR')}`,
    `Confiance OCR: ${Math.round(result.confidence * 100)}%`,
    `Longueur du texte: ${result.text.length} caractères`,
    `Entités détectées: ${result.entities ? Object.keys(result.entities).length : 0}`
  ];
  
  metadata.forEach(line => {
    pdf.text(line, margin, currentY);
    currentY += lineHeight;
  });
  
  currentY += lineHeight;
  
  // Séparateur
  pdf.setDrawColor(0);
  pdf.line(margin, currentY, pageWidth - margin, currentY);
  currentY += lineHeight * 2;
  
  // Titre du contenu
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Contenu du Document", margin, currentY);
  currentY += lineHeight * 2;
  
  // Contenu principal
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  
  const textLines = pdf.splitTextToSize(result.text, pageWidth - (margin * 2));
  
  textLines.forEach((line: string) => {
    if (currentY > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      currentY = margin;
    }
    pdf.text(line, margin, currentY);
    currentY += lineHeight;
  });
  
  // Nouvelle page pour les métadonnées mappées si elles existent
  if (Object.keys(mappedData).length > 0) {
    pdf.addPage();
    currentY = margin;
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Données Mappées", margin, currentY);
    currentY += lineHeight * 2;
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    
    Object.entries(mappedData).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        const line = `${key}: ${value}`;
        const wrappedLines = pdf.splitTextToSize(line, pageWidth - (margin * 2));
        
        wrappedLines.forEach((wrappedLine: string) => {
          if (currentY > pdf.internal.pageSize.getHeight() - margin) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(wrappedLine, margin, currentY);
          currentY += lineHeight;
        });
        currentY += lineHeight * 0.5; // Espacement entre les champs
      }
    });
  }
  
  // Entités détectées
  if (result.entities && Object.keys(result.entities).length > 0) {
    pdf.addPage();
    currentY = margin;
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Entités Détectées", margin, currentY);
    currentY += lineHeight * 2;
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    
    Object.entries(result.entities).forEach(([key, value]) => {
      if (value) {
        const line = `${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
        const wrappedLines = pdf.splitTextToSize(line, pageWidth - (margin * 2));
        
        wrappedLines.forEach((wrappedLine: string) => {
          if (currentY > pdf.internal.pageSize.getHeight() - margin) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(wrappedLine, margin, currentY);
          currentY += lineHeight;
        });
      }
    });
  }
  
  // Pied de page sur chaque page
  const pageCount = pdf.internal.pages.length - 1; // -1 because pages array includes a blank first element
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(
      `Page ${i} / ${pageCount} - Généré le ${new Date().toLocaleString('fr-FR')}`,
      margin,
      pdf.internal.pageSize.getHeight() - 10
    );
  }
  
  // Téléchargement
  pdf.save(`ocr-results-${new Date().getTime()}.pdf`);
};