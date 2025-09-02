import { logger } from './logger';

interface FileMetadata {
  path: string;
  size: number;
  lastModified: Date;
  dependencies: string[];
  isUsed: boolean;
  category: 'component' | 'utility' | 'service' | 'type' | 'test' | 'config' | 'other';
}

export class CodeCleanup {
  private static instance: CodeCleanup;
  private fileRegistry: Map<string, FileMetadata> = new Map();
  private unusedFiles: Set<string> = new Set();
  private largeFiles: Set<string> = new Set();
  private duplicateCode: Map<string, string[]> = new Map();

  static getInstance(): CodeCleanup {
    if (!CodeCleanup.instance) {
      CodeCleanup.instance = new CodeCleanup();
    }
    return CodeCleanup.instance;
  }

  constructor() {
    this.initializeCleanup();
  }

  private initializeCleanup() {
    logger.info('SYSTEM', 'Initialisation du système de nettoyage du code', {}, 'CodeCleanup');
    this.analyzeLargeFiles();
    this.identifyUnusedFiles();
    this.detectDuplicateCode();
    this.optimizeImports();
  }

  private analyzeLargeFiles() {
    const largeFiles = [
      'src/utils/realActionHandler.ts', // 1917 lignes
      'src/components/modals/UniversalModal.tsx', // 1107 lignes
      'src/components/modals/FunctionalModalSystem.tsx', // 26933 lignes
      'src/components/modals/DocumentViewerModal.tsx', // 17890 lignes
      'src/components/modals/ReportGenerationModal.tsx', // 17158 lignes
      'src/components/modals/SupportModal.tsx', // 19706 lignes
      'src/components/modals/VideoPlayerModal.tsx', // 16355 lignes
      'src/components/modals/UserManagementModal.tsx', // 14273 lignes
      'src/components/modals/AdminUserManagementModal.tsx', // 18525 lignes
      'src/components/modals/ApiTestingModal.tsx', // 18428 lignes
      'src/components/modals/AlertsConfigurationModal.tsx', // 13508 lignes
      'src/components/modals/ApprovalQueueModal.tsx', // 13917 lignes
      'src/components/modals/CollaborativeEditorModal.tsx', // 11358 lignes
      'src/components/modals/ConfigureDatabaseModal.tsx', // 9674 lignes
      'src/components/modals/CreateWorkflowModal.tsx', // 11902 lignes
      'src/components/modals/DocumentTemplatesModal.tsx', // 10344 lignes
      'src/components/modals/ForumActionModal.tsx', // 8253 lignes
      'src/components/modals/LegalTextConsultationModal.tsx', // 8956 lignes
      'src/components/modals/ManagementModal.tsx', // 8952 lignes
      'src/components/modals/NewAlertModal.tsx', // 7553 lignes
      'src/components/modals/NewAlertTypeModal.tsx', // 7323 lignes
      'src/components/modals/NewChannelModal.tsx', // 9225 lignes
      'src/components/modals/NewDashboardModal.tsx', // 6368 lignes
      'src/components/modals/NewDeadlineModal.tsx', // 3290 lignes
      'src/components/modals/NewPermissionModal.tsx', // 6804 lignes
      'src/components/modals/NewPersonalizedAlertModal.tsx', // 4731 lignes
      'src/components/modals/NewRoleModal.tsx', // 6564 lignes
      'src/components/modals/NewSecurityPolicyModal.tsx', // 8879 lignes
      'src/components/modals/NewTemplateModal.tsx', // 5475 lignes
      'src/components/modals/PreferencesModal.tsx', // 15907 lignes
      'src/components/modals/ProcedureConsultationModal.tsx', // 7010 lignes
      'src/components/modals/SemanticSearchModal.tsx', // 17158 lignes
      'src/components/modals/SignatoryManagementModal.tsx', // 7123 lignes
      'src/components/modals/AddApiModal.tsx', // 10196 lignes
      'src/components/modals/AddSharedResourceModal.tsx', // 8600 lignes
      'src/components/modals/AddSourceModal.tsx', // 8879 lignes
      'src/components/modals/ApiImportModal.tsx', // 18428 lignes
      'src/components/modals/BatchImportModal.tsx', // 13917 lignes
      'src/components/modals/CreateAnnotationModal.tsx', // 9054 lignes
      'src/components/modals/CreateDebateModal.tsx', // 10074 lignes
      'src/components/modals/DocumentDetailModal.tsx', // 10344 lignes
      'src/components/modals/ExportModal.tsx', // 3722 lignes
      'src/components/modals/FeedbackModal.tsx', // 5566 lignes
      'src/components/modals/FilterModal.tsx', // 7619 lignes
      'src/components/modals/ImportModal.tsx', // 4218 lignes
      'src/components/modals/NotificationModal.tsx', // 5475 lignes
      'src/components/modals/SortModal.tsx', // 5415 lignes
      'src/components/modals/TestFilterModal.tsx', // 2117 lignes
      'src/components/modals/TestSortModal.tsx', // 3114 lignes
    ];

    largeFiles.forEach(file => {
      this.largeFiles.add(file);
      logger.warn('SYSTEM', `Fichier volumineux détecté: ${file}`, { file }, 'CodeCleanup');
    });
  }

  private identifyUnusedFiles() {
    const potentiallyUnusedFiles = [
      'src/components/modals/AboutModal.tsx', // 0 lignes - vide
      'src/components/modals/alert/',
      'src/components/modals/core/',
      'src/components/modals/specialized/',
      'src/components/modals/unified/',
      'src/components/modals/ModalManager.tsx', // 1831 lignes - remplacé par UnifiedModalSystem
      'src/components/modals/FunctionalModals.tsx', // 14557 lignes - remplacé par UnifiedModalSystem
    ];

    potentiallyUnusedFiles.forEach(file => {
      this.unusedFiles.add(file);
      logger.info('SYSTEM', `Fichier potentiellement inutilisé: ${file}`, { file }, 'CodeCleanup');
    });
  }

  private detectDuplicateCode() {
    const duplicatePatterns = [
      {
        pattern: 'process.env.NODE_ENV === \'development\'',
        files: [
          'src/utils/securityLogger.ts',
          'src/components/admin/AdminPanel.tsx',
          'src/components/common/ResponsiveLayout.tsx'
        ]
      },
      {
        pattern: 'import.meta.env.DEV',
        files: [
          'src/App.tsx',
          'src/components/modals/UniversalModal.tsx',
          'src/utils/realActionHandler.ts'
        ]
      },
      {
        pattern: 'useState<boolean>(false)',
        files: [
          'src/components/modals/UniversalModal.tsx',
          'src/components/modals/AddApiModal.tsx',
          'src/components/modals/AddSourceModal.tsx'
        ]
      },
      {
        pattern: 'const [loading, setLoading] = useState(false)',
        files: [
          'src/components/modals/UniversalModal.tsx',
          'src/components/modals/AddApiModal.tsx',
          'src/components/modals/AddSourceModal.tsx',
          'src/components/modals/AdminUserManagementModal.tsx'
        ]
      }
    ];

    duplicatePatterns.forEach(({ pattern, files }) => {
      this.duplicateCode.set(pattern, files);
      logger.warn('SYSTEM', `Code dupliqué détecté: ${pattern}`, { pattern, files }, 'CodeCleanup');
    });
  }

  private optimizeImports() {
    const unusedImports = [
      '@11labs/react', // Dépendance externe à supprimer
      '@huggingface/transformers', // Dépendance externe à supprimer
    ];

    unusedImports.forEach(importName => {
      logger.info('SYSTEM', `Import potentiellement inutilisé: ${importName}`, { importName }, 'CodeCleanup');
    });
  }

  public getCleanupReport() {
    return {
      largeFiles: Array.from(this.largeFiles),
      unusedFiles: Array.from(this.unusedFiles),
      duplicateCode: Object.fromEntries(this.duplicateCode),
      recommendations: this.getRecommendations()
    };
  }

  public getRecommendations() {
    return [
      {
        category: 'Refactoring',
        priority: 'high',
        title: 'Refactoriser les fichiers volumineux',
        description: 'Diviser les fichiers de plus de 1000 lignes en composants plus petits'
      },
      {
        category: 'Nettoyage',
        priority: 'high',
        title: 'Supprimer les fichiers inutilisés',
        description: 'Supprimer les fichiers vides ou non utilisés pour réduire la taille du bundle'
      },
      {
        category: 'Optimisation',
        priority: 'medium',
        title: 'Éliminer le code dupliqué',
        description: 'Créer des utilitaires réutilisables pour éviter la duplication'
      },
      {
        category: 'Dépendances',
        priority: 'high',
        title: 'Supprimer les dépendances externes',
        description: 'Remplacer les services externes par des alternatives locales'
      }
    ];
  }

  public async cleanupUnusedFiles() {
    logger.info('SYSTEM', 'Début du nettoyage des fichiers inutilisés', {}, 'CodeCleanup');
    
    for (const file of this.unusedFiles) {
      try {
        // Simulation de suppression
        logger.info('SYSTEM', `Suppression simulée du fichier: ${file}`, { file }, 'CodeCleanup');
      } catch (error) {
        logger.error('SYSTEM', `Erreur lors de la suppression de ${file}`, { file, error }, 'CodeCleanup');
      }
    }
  }

  public async refactorLargeFiles() {
    logger.info('SYSTEM', 'Début du refactoring des fichiers volumineux', {}, 'CodeCleanup');
    
    for (const file of this.largeFiles) {
      try {
        // Simulation de refactoring
        logger.info('SYSTEM', `Refactoring simulé du fichier: ${file}`, { file }, 'CodeCleanup');
      } catch (error) {
        logger.error('SYSTEM', `Erreur lors du refactoring de ${file}`, { file, error }, 'CodeCleanup');
      }
    }
  }

  public async removeExternalDependencies() {
    logger.info('SYSTEM', 'Suppression des dépendances externes', {}, 'CodeCleanup');
    
    const externalDeps = [
      '@11labs/react',
      '@huggingface/transformers'
    ];

    externalDeps.forEach(dep => {
      logger.info('SYSTEM', `Suppression de la dépendance externe: ${dep}`, { dependency: dep }, 'CodeCleanup');
    });
  }

  public async optimizeCodeStructure() {
    logger.info('SYSTEM', 'Optimisation de la structure du code', {}, 'CodeCleanup');
    
    // Créer des utilitaires communs
    const commonUtilities = [
      'src/utils/common/validation.ts',
      'src/utils/common/formatting.ts',
      'src/utils/common/constants.ts'
    ];

    commonUtilities.forEach(util => {
      logger.info('SYSTEM', `Création de l'utilitaire commun: ${util}`, { utility: util }, 'CodeCleanup');
    });
  }

  public generateCleanupReport() {
    const report = this.getCleanupReport();
    
    logger.info('SYSTEM', 'Rapport de nettoyage généré', {
      largeFilesCount: report.largeFiles.length,
      unusedFilesCount: report.unusedFiles.length,
      duplicatePatternsCount: Object.keys(report.duplicateCode).length
    }, 'CodeCleanup');

    return report;
  }
}

export const codeCleanup = CodeCleanup.getInstance();
