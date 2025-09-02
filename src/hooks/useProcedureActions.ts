import { useState } from 'react';
import { logger } from '@/utils/logger';

interface Procedure {
  id: string;
  title: string;
  category: string;
  ministry: string;
  type: string;
  status: string;
  lastUpdate: string;
}

export function useProcedureActions() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConsultProcedure = (procedure: Procedure | string, title?: string) => {
    const procedureData = typeof procedure === 'string' 
      ? { id: procedure, title: title || procedure, category: 'Administrative', ministry: 'Justice', type: 'Procédure', status: 'active', lastUpdate: new Date().toISOString() } 
      : procedure;
    
    logger.info('UI', 'Consultation de procédure administrative', { procedureId: procedureData.id, title: procedureData.title });
    
    const event = new CustomEvent('open-modal', {
      detail: {
        type: 'procedure-consultation',
        title: `Procédure: ${procedureData.title}`,
        data: {
          procedure: procedureData,
          content: {
            description: "Cette procédure définit les étapes nécessaires pour...",
            objective: "Faciliter les démarches administratives des citoyens",
            scope: "Applicable à tous les citoyens algériens et résidents",
            steps: [
              {
                number: 1,
                title: "Préparation du dossier",
                description: "Rassembler les documents requis",
                documents: ["Carte d'identité nationale", "Justificatif de domicile", "Formulaire officiel"],
                duration: "1-2 jours",
                cost: "Gratuit"
              },
              {
                number: 2,
                title: "Dépôt de la demande",
                description: "Soumettre le dossier complet au service compétent",
                location: "Mairie ou Daïra de résidence",
                duration: "30 minutes",
                cost: "500 DA (timbre fiscal)"
              },
              {
                number: 3,
                title: "Traitement et validation",
                description: "Examen du dossier par les services administratifs",
                duration: "5-10 jours ouvrables",
                tracking: "Numéro de suivi fourni"
              },
              {
                number: 4,
                title: "Retrait du document",
                description: "Récupération du document finalisé",
                requirements: ["Récépissé de dépôt", "Pièce d'identité"],
                duration: "15 minutes"
              }
            ],
            requirements: {
              general: ["Être majeur", "Résider en Algérie"],
              documents: ["Originaux et copies certifiées", "Photos d'identité récentes"],
              fees: "Variable selon le type de demande"
            },
            contacts: {
              hotline: "3003 (gratuit)",
              email: "info@interieur.gov.dz",
              website: "www.interieur.gov.dz"
            }
          },
          relatedProcedures: [
            "Demande de passeport",
            "Changement d'adresse",
            "Certificat de résidence"
          ],
          legalBasis: [
            "Loi n° 08-11 du 25 juin 2008",
            "Décret exécutif n° 09-317 du 20 octobre 2009"
          ]
        }
      }
    });
    window.dispatchEvent(event);
  };

  const handleDownloadProcedure = (procedure: Procedure | string, title?: string, format: 'PDF' | 'DOCX' = 'PDF') => {
    const procedureData = typeof procedure === 'string' 
      ? { id: procedure, title: title || procedure, category: 'Administrative', ministry: 'Justice', type: 'Procédure', status: 'active', lastUpdate: new Date().toISOString() } 
      : procedure;
    
    logger.info('UI', 'Téléchargement de procédure', { procedureId: procedureData.id, title: procedureData.title, format });
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          title: 'Téléchargement réussi',
          description: `Guide de procédure téléchargé en ${format}`
        }
      });
      window.dispatchEvent(event);
      
      // Simuler le téléchargement
      const link = document.createElement('a');
      link.href = '#';
      link.download = `procedure-${procedureData.title.toLowerCase().replace(/\s+/g, '-')}.${format.toLowerCase()}`;
      link.click();
    }, 1500);
  };

  const handleProcedureTracking = (procedure: Procedure | string, title?: string) => {
    const procedureData = typeof procedure === 'string' 
      ? { id: procedure, title: title || procedure, category: 'Administrative', ministry: 'Justice', type: 'Procédure', status: 'active', lastUpdate: new Date().toISOString() } 
      : procedure;
    
    logger.info('UI', 'Suivi de procédure', { procedureId: procedureData.id, title: procedureData.title });
    
    const event = new CustomEvent('open-modal', {
      detail: {
        type: 'procedure-tracking',
        title: `Suivi: ${procedureData.title}`,
        data: {
          procedure: procedureData,
          trackingInfo: {
            applicationNumber: `ALG${Date.now().toString().slice(-8)}`,
            status: 'En cours de traitement',
            submissionDate: '2024-01-10',
            expectedCompletion: '2024-01-20',
            currentStep: 2,
            totalSteps: 4
          },
          timeline: [
            {
              step: 1,
              title: "Dossier reçu",
              date: "2024-01-10",
              status: "completed",
              note: "Dossier complet et conforme"
            },
            {
              step: 2,
              title: "En cours d'examen",
              date: "2024-01-12",
              status: "current",
              note: "Vérification en cours par le service compétent"
            },
            {
              step: 3,
              title: "Validation finale",
              date: "2024-01-18",
              status: "pending",
              note: "En attente"
            },
            {
              step: 4,
              title: "Document prêt",
              date: "2024-01-20",
              status: "pending",
              note: "Disponible pour retrait"
            }
          ],
          notifications: [
            {
              type: "info",
              message: "Votre dossier est en cours de traitement",
              date: "2024-01-12"
            },
            {
              type: "warning", 
              message: "Document manquant: justificatif de revenus",
              date: "2024-01-11",
              resolved: true
            }
          ]
        }
      }
    });
    window.dispatchEvent(event);
  };

  const handleProcedureHelp = (procedure: Procedure | string, title?: string) => {
    const procedureData = typeof procedure === 'string' 
      ? { id: procedure, title: title || procedure, category: 'Administrative', ministry: 'Justice', type: 'Procédure', status: 'active', lastUpdate: new Date().toISOString() } 
      : procedure;
    
    logger.info('UI', 'Aide pour procédure', { procedureId: procedureData.id, title: procedureData.title });
    
    const event = new CustomEvent('open-modal', {
      detail: {
        type: 'procedure-help',
        title: `Aide: ${procedureData.title}`,
        data: {
          procedure: procedureData,
          faq: [
            {
              question: "Quels sont les documents requis ?",
              answer: "Vous devez fournir une carte d'identité nationale, un justificatif de domicile récent et le formulaire officiel dûment rempli."
            },
            {
              question: "Combien de temps dure la procédure ?",
              answer: "Le délai de traitement est généralement de 5 à 10 jours ouvrables après le dépôt d'un dossier complet."
            },
            {
              question: "Quels sont les frais à prévoir ?",
              answer: "Les frais incluent un timbre fiscal de 500 DA. Certaines procédures peuvent nécessiter des frais supplémentaires."
            },
            {
              question: "Où puis-je déposer ma demande ?",
              answer: "Vous pouvez déposer votre demande dans votre mairie de résidence ou au niveau de la Daïra."
            }
          ],
          contacts: {
            phone: "023 XX XX XX",
            email: "aide@proceduresgov.dz",
            address: "Service d'aide aux citoyens, Alger Centre"
          },
          guides: [
            {
              title: "Guide étape par étape",
              type: "PDF",
              size: "2.1 MB",
              description: "Guide détaillé avec captures d'écran"
            },
            {
              title: "Vidéo explicative",
              type: "MP4",
              duration: "8 min",
              description: "Tutoriel vidéo complet"
            }
          ],
          tips: [
            "Préparez tous vos documents avant de vous déplacer",
            "Vérifiez les horaires d'ouverture du service",
            "Gardez votre récépissé de dépôt en lieu sûr",
            "N'hésitez pas à contacter le service d'aide en cas de doute"
          ]
        }
      }
    });
    window.dispatchEvent(event);
  };

  const handleStartProcedure = (procedure: Procedure | string, title?: string) => {
    const procedureData = typeof procedure === 'string' 
      ? { id: procedure, title: title || procedure, category: 'Administrative', ministry: 'Justice', type: 'Procédure', status: 'active', lastUpdate: new Date().toISOString() } 
      : procedure;
    
    logger.info('UI', 'Démarrage de procédure', { procedureId: procedureData.id, title: procedureData.title });
    
    const event = new CustomEvent('open-modal', {
      detail: {
        type: 'procedure-start',
        title: `Démarrer: ${procedureData.title}`,
        data: {
          procedure: procedureData,
          wizard: {
            currentStep: 1,
            totalSteps: 3,
            steps: [
              {
                number: 1,
                title: "Vérification d'éligibilité",
                fields: [
                  { name: "nationality", label: "Nationalité", type: "select", required: true },
                  { name: "age", label: "Âge", type: "number", required: true },
                  { name: "residence", label: "Lieu de résidence", type: "text", required: true }
                ]
              },
              {
                number: 2,
                title: "Documents requis",
                fields: [
                  { name: "idCard", label: "Carte d'identité", type: "file", required: true },
                  { name: "proofOfAddress", label: "Justificatif de domicile", type: "file", required: true },
                  { name: "photo", label: "Photo d'identité", type: "file", required: false }
                ]
              },
              {
                number: 3,
                title: "Finalisation",
                fields: [
                  { name: "contactPhone", label: "Téléphone", type: "tel", required: true },
                  { name: "email", label: "Email", type: "email", required: false },
                  { name: "urgency", label: "Demande urgente", type: "checkbox", required: false }
                ]
              }
            ]
          },
          estimatedCost: "500 DA",
          estimatedDuration: "5-10 jours",
          requirements: [
            "Être de nationalité algérienne",
            "Être majeur (18 ans minimum)",
            "Résider en Algérie"
          ]
        }
      }
    });
    window.dispatchEvent(event);
  };

  return {
    handleConsultProcedure,
    handleDownloadProcedure,
    handleProcedureTracking,
    handleProcedureHelp,
    handleStartProcedure,
    isProcessing
  };
}