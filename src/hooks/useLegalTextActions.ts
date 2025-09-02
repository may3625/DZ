import { useState } from 'react';
import { logger } from '@/utils/logger';

interface LegalText {
  id: string;
  title: string;
  type: string;
  source: string;
  date: string;
  status: string;
  content?: string;
}

export function useLegalTextActions() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConsultText = (text: LegalText | string, title?: string) => {
    const textData = typeof text === 'string' ? { id: text, title: title || text, type: 'document', source: 'JO', date: new Date().toISOString(), status: 'active' } : text;
    
    logger.info('UI', 'Consultation de texte juridique', { textId: textData.id, title: textData.title });
    
    const event = new CustomEvent('open-modal', {
      detail: {
        type: 'legal-text-consultation',
        title: `Consultation: ${textData.title}`,
        data: {
          text: textData,
          content: {
            preamble: "Considérant les dispositions de la Constitution, notamment ses articles 12, 140 et 141;",
            articles: [
              {
                number: "Article 1er",
                content: "La présente loi définit les modalités d'application des dispositions relatives..."
              },
              {
                number: "Article 2",
                content: "Au sens de la présente loi, on entend par..."
              }
            ],
            attachments: [
              { name: "Annexe I - Formulaires officiels", type: "PDF", size: "2.3 MB" },
              { name: "Annexe II - Modèles types", type: "DOCX", size: "1.8 MB" }
            ]
          },
          metadata: {
            journal: "Journal Officiel de la République Algérienne",
            number: "N° 42",
            date: textData.date,
            pages: "3-15",
            keywords: ["administration", "procédure", "juridique"],
            relatedTexts: [
              "Loi n° 88-01 du 12 janvier 1988",
              "Décret exécutif n° 90-12 du 1er janvier 1990"
            ]
          }
        }
      }
    });
    window.dispatchEvent(event);
  };

  const handleDownloadText = (text: LegalText | string, title?: string, format: 'PDF' | 'DOCX' | 'TXT' = 'PDF') => {
    const textData = typeof text === 'string' ? { id: text, title: title || text, type: 'document', source: 'JO', date: new Date().toISOString(), status: 'active' } : text;
    
    logger.info('UI', 'Téléchargement de texte juridique', { textId: textData.id, title: textData.title, format });
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          title: 'Téléchargement réussi',
          description: `"${textData.title}" téléchargé en ${format}`
        }
      });
      window.dispatchEvent(event);
      
      // Simuler le téléchargement
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${textData.title.toLowerCase().replace(/\s+/g, '-')}.${format.toLowerCase()}`;
      link.click();
    }, 1500);
  };

  const handleShareText = (text: LegalText | string, title?: string) => {
    const textData = typeof text === 'string' ? { id: text, title: title || text, type: 'document', source: 'JO', date: new Date().toISOString(), status: 'active' } : text;
    
    logger.info('UI', 'Partage de texte juridique', { textId: textData.id, title: textData.title });
    
    const event = new CustomEvent('open-modal', {
      detail: {
        type: 'legal-text-share',
        title: `Partager: ${textData.title}`,
        data: {
          text: textData,
          shareOptions: {
            internal: true,
            external: false,
            publicLink: true,
            permissions: ['view', 'comment', 'download'],
            restrictions: {
              watermark: true,
              printDisabled: false,
              downloadLimit: null
            }
          },
          recipients: [],
          shareHistory: [
            { user: 'Ahmed Benali', date: '2024-01-15', action: 'Consulté' },
            { user: 'Fatima Khelif', date: '2024-01-14', action: 'Téléchargé' }
          ]
        }
      }
    });
    window.dispatchEvent(event);
  };

  const handleAddToFavorites = (text: LegalText | string, title?: string) => {
    const textData = typeof text === 'string' ? { id: text, title: title || text, type: 'document', source: 'JO', date: new Date().toISOString(), status: 'active' } : text;
    
    logger.info('UI', 'Ajout aux favoris', { textId: textData.id, title: textData.title });
    
    const isFavorite = localStorage.getItem(`favorite_${textData.id}`) === 'true';
    
    if (isFavorite) {
      localStorage.removeItem(`favorite_${textData.id}`);
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'info',
          title: 'Retiré des favoris',
          description: `"${textData.title}" a été retiré de vos favoris`
        }
      });
      window.dispatchEvent(event);
    } else {
      localStorage.setItem(`favorite_${textData.id}`, 'true');
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          title: 'Ajouté aux favoris',
          description: `"${textData.title}" a été ajouté à vos favoris`
        }
      });
      window.dispatchEvent(event);
    }
  };

  const handleTextAnnotation = (text: LegalText | string, title?: string) => {
    const textData = typeof text === 'string' ? { id: text, title: title || text, type: 'document', source: 'JO', date: new Date().toISOString(), status: 'active' } : text;
    
    logger.info('UI', 'Annotation de texte juridique', { textId: textData.id, title: textData.title });
    
    const event = new CustomEvent('open-modal', {
      detail: {
        type: 'text-annotation',
        title: `Annotations: ${textData.title}`,
        data: {
          text: textData,
          annotations: [
            {
              id: 1,
              content: "Important: Cette disposition s'applique uniquement aux entreprises de plus de 50 salariés",
              author: "Ahmed Benali",
              date: "2024-01-15",
              type: "note",
              articleRef: "Article 5"
            },
            {
              id: 2,
              content: "Attention: Délai de mise en conformité de 6 mois",
              author: "Fatima Khelif",
              date: "2024-01-14",
              type: "warning",
              articleRef: "Article 12"
            }
          ],
          tools: {
            highlight: true,
            note: true,
            comment: true,
            reference: true
          }
        }
      }
    });
    window.dispatchEvent(event);
  };

  const handleTextComparison = (texts: LegalText[] | string[]) => {
    logger.info('UI', 'Comparaison de textes juridiques', { textCount: texts.length });
    
    const event = new CustomEvent('open-modal', {
      detail: {
        type: 'text-comparison',
        title: 'Comparaison de Textes Juridiques',
        data: {
          texts: texts,
          comparisonTypes: ['version', 'content', 'structure', 'impact'],
          results: {
            differences: [
              { type: 'addition', content: 'Nouvel article 15 bis ajouté', position: 'Article 15' },
              { type: 'modification', content: 'Modification des délais de recours', position: 'Article 8' },
              { type: 'suppression', content: 'Suppression de l\'alinéa 3', position: 'Article 12' }
            ],
            similarities: 85,
            impactAnalysis: {
              high: 2,
              medium: 5,
              low: 12
            }
          }
        }
      }
    });
    window.dispatchEvent(event);
  };

  return {
    handleConsultText,
    handleDownloadText,
    handleShareText,
    handleAddToFavorites,
    handleTextAnnotation,
    handleTextComparison,
    isProcessing
  };
}