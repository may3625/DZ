import { useState } from 'react';
import { logger } from '@/utils/logger';

interface Dashboard {
  id: number;
  name: string;
  description: string;
  widgets: string[];
  isDefault: boolean;
  lastModified: string;
  views: number;
}

export function useDashboardActions() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleViewDashboard = (dashboard: Dashboard) => {
    logger.info('UI', 'Ouverture du tableau de bord', { dashboardId: dashboard.id, name: dashboard.name });
    
    // Créer un événement pour ouvrir la modal de vue du tableau de bord
    const event = new CustomEvent('open-modal', {
      detail: {
        type: 'dashboard-view',
        title: `Tableau de Bord: ${dashboard.name}`,
        data: { 
          dashboard,
          widgets: dashboard.widgets,
          metrics: {
            views: dashboard.views,
            lastModified: dashboard.lastModified,
            isDefault: dashboard.isDefault
          }
        }
      }
    });
    window.dispatchEvent(event);
  };

  const handleEditDashboard = (dashboard: Dashboard) => {
    logger.info('UI', 'Modification du tableau de bord', { dashboardId: dashboard.id, name: dashboard.name });
    
    const event = new CustomEvent('open-modal', {
      detail: {
        type: 'dashboard-edit',
        title: `Modifier: ${dashboard.name}`,
        data: { 
          dashboard,
          mode: 'edit',
          availableWidgets: [
            'Recherches récentes', 'Documents favoris', 'Notifications', 
            'Activité hebdomadaire', 'Statistiques d\'usage', 'Tendances',
            'Graphiques', 'Métriques', 'Rapports', 'Alertes'
          ]
        }
      }
    });
    window.dispatchEvent(event);
  };

  const handleDashboardSettings = (dashboard: Dashboard) => {
    logger.info('UI', 'Paramètres du tableau de bord', { dashboardId: dashboard.id, name: dashboard.name });
    
    const event = new CustomEvent('open-modal', {
      detail: {
        type: 'dashboard-settings',
        title: `Paramètres: ${dashboard.name}`,
        data: { 
          dashboard,
          settings: {
            refreshInterval: '5min',
            autoSave: true,
            notifications: true,
            sharing: {
              enabled: false,
              permissions: 'read-only'
            },
            export: {
              formats: ['PDF', 'Excel', 'JSON'],
              schedule: 'manual'
            }
          }
        }
      }
    });
    window.dispatchEvent(event);
  };

  const handleShareDashboard = (dashboard: Dashboard) => {
    logger.info('UI', 'Partage du tableau de bord', { dashboardId: dashboard.id, name: dashboard.name });
    
    const event = new CustomEvent('open-modal', {
      detail: {
        type: 'dashboard-share',
        title: `Partager: ${dashboard.name}`,
        data: { 
          dashboard,
          shareOptions: {
            internal: true,
            external: false,
            publicLink: false,
            permissions: ['view', 'comment', 'edit'],
            expiration: {
              enabled: false,
              date: null
            }
          },
          users: [
            { id: 1, name: 'Ahmed Benali', email: 'ahmed.benali@justice.dz', role: 'Juriste Senior' },
            { id: 2, name: 'Fatima Khelif', email: 'fatima.khelif@justice.dz', role: 'Analyste Juridique' },
            { id: 3, name: 'Omar Mansouri', email: 'omar.mansouri@justice.dz', role: 'Directeur Juridique' }
          ]
        }
      }
    });
    window.dispatchEvent(event);
  };

  const handleDuplicateDashboard = (dashboard: Dashboard) => {
    logger.info('UI', 'Duplication du tableau de bord', { dashboardId: dashboard.id, name: dashboard.name });
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          title: 'Tableau de bord dupliqué',
          description: `"${dashboard.name}" a été dupliqué avec succès`
        }
      });
      window.dispatchEvent(event);
    }, 1500);
  };

  const handleDeleteDashboard = (dashboard: Dashboard) => {
    if (dashboard.isDefault) {
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'error',
          title: 'Suppression impossible',
          description: 'Le tableau de bord principal ne peut pas être supprimé'
        }
      });
      window.dispatchEvent(event);
      return;
    }

    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer "${dashboard.name}" ?`);
    if (confirmed) {
      logger.info('UI', 'Suppression du tableau de bord', { dashboardId: dashboard.id, name: dashboard.name });
      
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        const event = new CustomEvent('show-toast', {
          detail: {
            type: 'success',
            title: 'Tableau de bord supprimé',
            description: `"${dashboard.name}" a été supprimé avec succès`
          }
        });
        window.dispatchEvent(event);
      }, 1000);
    }
  };

  const handleExportDashboard = (dashboard: Dashboard, format: 'PDF' | 'Excel' | 'JSON' = 'PDF') => {
    logger.info('UI', 'Export du tableau de bord', { dashboardId: dashboard.id, name: dashboard.name, format });
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          title: 'Export réussi',
          description: `Tableau de bord exporté en ${format}`
        }
      });
      window.dispatchEvent(event);
      
      // Simuler le téléchargement
      const link = document.createElement('a');
      link.href = '#';
      link.download = `tableau-bord-${dashboard.name.toLowerCase().replace(/\s+/g, '-')}.${format.toLowerCase()}`;
      link.click();
    }, 2000);
  };

  return {
    handleViewDashboard,
    handleEditDashboard,
    handleDashboardSettings,
    handleShareDashboard,
    handleDuplicateDashboard,
    handleDeleteDashboard,
    handleExportDashboard,
    isProcessing
  };
}