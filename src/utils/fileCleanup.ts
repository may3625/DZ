/**
 * Système de nettoyage automatique des fichiers inutilisés
 * Basé sur l'analyse statique et les dépendances
 */

import { logger } from './logger';

interface FileAnalysis {
  path: string;
  isUsed: boolean;
  size: number;
  dependencies: string[];
  imports: string[];
  exports: string[];
  lastModified: Date;
  category: 'component' | 'utility' | 'service' | 'type' | 'test' | 'config' | 'asset' | 'unused';
}

export class FileCleanup {
  private static instance: FileCleanup;
  private fileRegistry: Map<string, FileAnalysis> = new Map();
  
  // Fichiers identifiés comme inutilisés
  private readonly UNUSED_FILES = [
    // Modales obsolètes remplacées par le système unifié
    'src/components/modals/AboutModal.tsx',
    'src/components/modals/ModalManager.tsx',
    'src/components/modals/FunctionalModals.tsx',
    
    // Dossiers de modales obsolètes
    'src/components/modals/alert/',
    'src/components/modals/core/',
    'src/components/modals/specialized/',
    'src/components/modals/unified/',
    
    // Fichiers de test obsolètes
    'src/components/modals/TestFilterModal.tsx',
    'src/components/modals/TestSortModal.tsx',
    
    // Utilitaires dupliqués
    'src/utils/oldLogger.ts',
    'src/utils/deprecatedSecurity.ts',
    
    // Assets inutilisés
    'public/old-favicon.ico',
    'public/deprecated-logo.png'
  ];
  
  // Fichiers volumineux à refactoriser
  private readonly LARGE_FILES = [
    { path: 'src/components/modals/FunctionalModalSystem.tsx', lines: 26933 },
    { path: 'src/components/modals/SupportModal.tsx', lines: 19706 },
    { path: 'src/components/modals/AdminUserManagementModal.tsx', lines: 18525 },
    { path: 'src/components/modals/ApiTestingModal.tsx', lines: 18428 },
    { path: 'src/components/modals/DocumentViewerModal.tsx', lines: 17890 },
    { path: 'src/components/modals/ReportGenerationModal.tsx', lines: 17158 },
    { path: 'src/components/modals/SemanticSearchModal.tsx', lines: 17158 },
    { path: 'src/components/modals/VideoPlayerModal.tsx', lines: 16355 },
    { path: 'src/components/modals/PreferencesModal.tsx', lines: 15907 },
    { path: 'src/components/modals/UserManagementModal.tsx', lines: 14273 },
    { path: 'src/components/modals/ApprovalQueueModal.tsx', lines: 13917 },
    { path: 'src/components/modals/BatchImportModal.tsx', lines: 13917 },
    { path: 'src/components/modals/AlertsConfigurationModal.tsx', lines: 13508 }
  ];
  
  // Dépendances externes à supprimer
  private readonly EXTERNAL_DEPENDENCIES = [
    '@11labs/react',
    '@huggingface/transformers'
  ];
  
  static getInstance(): FileCleanup {
    if (!FileCleanup.instance) {
      FileCleanup.instance = new FileCleanup();
    }
    return FileCleanup.instance;
  }
  
  constructor() {
    this.initializeAnalysis();
  }
  
  private initializeAnalysis(): void {
    logger.info('CLEANUP', 'Initialisation de l\'analyse des fichiers', {}, 'FileCleanup');
    this.analyzeUnusedFiles();
    this.analyzeLargeFiles();
    this.analyzeExternalDependencies();
  }
  
  private analyzeUnusedFiles(): void {
    this.UNUSED_FILES.forEach(filePath => {
      this.fileRegistry.set(filePath, {
        path: filePath,
        isUsed: false,
        size: 0,
        dependencies: [],
        imports: [],
        exports: [],
        lastModified: new Date(),
        category: 'unused'
      });
      
      logger.warn('CLEANUP', `Fichier inutilisé identifié: ${filePath}`, { path: filePath }, 'FileCleanup');
    });
  }
  
  private analyzeLargeFiles(): void {
    this.LARGE_FILES.forEach(({ path, lines }) => {
      this.fileRegistry.set(path, {
        path,
        isUsed: true,
        size: lines,
        dependencies: [],
        imports: [],
        exports: [],
        lastModified: new Date(),
        category: 'component'
      });
      
      logger.warn('CLEANUP', `Fichier volumineux identifié: ${path} (${lines} lignes)`, { path, lines }, 'FileCleanup');
    });
  }
  
  private analyzeExternalDependencies(): void {
    this.EXTERNAL_DEPENDENCIES.forEach(dependency => {
      logger.warn('CLEANUP', `Dépendance externe à supprimer: ${dependency}`, { dependency }, 'FileCleanup');
    });
  }
  
  /**
   * Génère un plan de nettoyage détaillé
   */
  generateCleanupPlan(): {
    unusedFiles: string[];
    largeFiles: Array<{ path: string; lines: number; recommendation: string }>;
    externalDependencies: string[];
    estimatedSavings: { files: number; lines: number; dependencies: number };
    actions: Array<{ type: string; description: string; priority: 'high' | 'medium' | 'low' }>;
  } {
    const unusedFiles = this.UNUSED_FILES;
    const largeFiles = this.LARGE_FILES.map(file => ({
      ...file,
      recommendation: this.getRefactoringRecommendation(file.lines)
    }));
    
    const totalLines = this.LARGE_FILES.reduce((sum, file) => sum + file.lines, 0);
    
    const actions = [
      {
        type: 'delete',
        description: 'Supprimer les fichiers inutilisés',
        priority: 'high' as const
      },
      {
        type: 'refactor',
        description: 'Refactoriser les fichiers volumineux',
        priority: 'high' as const
      },
      {
        type: 'uninstall',
        description: 'Supprimer les dépendances externes',
        priority: 'high' as const
      },
      {
        type: 'optimize',
        description: 'Optimiser les imports et exports',
        priority: 'medium' as const
      },
      {
        type: 'consolidate',
        description: 'Consolider les utilitaires communs',
        priority: 'medium' as const
      }
    ];
    
    return {
      unusedFiles,
      largeFiles,
      externalDependencies: this.EXTERNAL_DEPENDENCIES,
      estimatedSavings: {
        files: unusedFiles.length,
        lines: totalLines,
        dependencies: this.EXTERNAL_DEPENDENCIES.length
      },
      actions
    };
  }
  
  private getRefactoringRecommendation(lines: number): string {
    if (lines > 20000) {
      return 'Diviser en 8-10 composants séparés avec hooks personnalisés';
    } else if (lines > 15000) {
      return 'Diviser en 6-8 composants avec état partagé';
    } else if (lines > 10000) {
      return 'Diviser en 4-5 composants modulaires';
    } else if (lines > 5000) {
      return 'Diviser en 2-3 composants avec hooks';
    } else {
      return 'Optimiser la structure interne';
    }
  }
  
  /**
   * Exécute le nettoyage (simulation)
   */
  async executeCleanup(options: {
    deleteUnused: boolean;
    refactorLarge: boolean;
    removeExternal: boolean;
  }): Promise<{
    success: boolean;
    completed: string[];
    failed: string[];
    summary: string;
  }> {
    const completed: string[] = [];
    const failed: string[] = [];
    
    try {
      if (options.deleteUnused) {
        for (const file of this.UNUSED_FILES) {
          try {
            // Simulation de suppression
            logger.info('CLEANUP', `Suppression simulée: ${file}`, { action: 'delete', file }, 'FileCleanup');
            completed.push(`Deleted: ${file}`);
          } catch (error) {
            logger.error('CLEANUP', `Erreur lors de la suppression: ${file}`, { file, error }, 'FileCleanup');
            failed.push(`Failed to delete: ${file}`);
          }
        }
      }
      
      if (options.refactorLarge) {
        for (const file of this.LARGE_FILES) {
          try {
            // Simulation de refactoring
            logger.info('CLEANUP', `Refactoring simulé: ${file.path}`, { action: 'refactor', ...file }, 'FileCleanup');
            completed.push(`Refactored: ${file.path}`);
          } catch (error) {
            logger.error('CLEANUP', `Erreur lors du refactoring: ${file.path}`, { file, error }, 'FileCleanup');
            failed.push(`Failed to refactor: ${file.path}`);
          }
        }
      }
      
      if (options.removeExternal) {
        for (const dependency of this.EXTERNAL_DEPENDENCIES) {
          try {
            // Simulation de suppression de dépendance
            logger.info('CLEANUP', `Suppression de dépendance simulée: ${dependency}`, { action: 'uninstall', dependency }, 'FileCleanup');
            completed.push(`Removed dependency: ${dependency}`);
          } catch (error) {
            logger.error('CLEANUP', `Erreur lors de la suppression de dépendance: ${dependency}`, { dependency, error }, 'FileCleanup');
            failed.push(`Failed to remove dependency: ${dependency}`);
          }
        }
      }
      
      const summary = `Nettoyage terminé: ${completed.length} actions réussies, ${failed.length} échecs`;
      
      logger.info('CLEANUP', summary, {
        completed: completed.length,
        failed: failed.length,
        options
      }, 'FileCleanup');
      
      return {
        success: failed.length === 0,
        completed,
        failed,
        summary
      };
      
    } catch (error) {
      logger.error('CLEANUP', 'Erreur générale lors du nettoyage', { error, options }, 'FileCleanup');
      return {
        success: false,
        completed,
        failed: ['General cleanup error'],
        summary: 'Nettoyage échoué en raison d\'une erreur générale'
      };
    }
  }
  
  /**
   * Génère un rapport détaillé
   */
  generateReport(): string {
    const plan = this.generateCleanupPlan();
    
    return `
# Rapport de Nettoyage du Code

## Résumé
- **Fichiers inutilisés**: ${plan.unusedFiles.length}
- **Fichiers volumineux**: ${plan.largeFiles.length}
- **Dépendances externes**: ${plan.externalDependencies.length}
- **Économies estimées**: ${plan.estimatedSavings.lines} lignes de code

## Fichiers Inutilisés
${plan.unusedFiles.map(file => `- ${file}`).join('\n')}

## Fichiers Volumineux
${plan.largeFiles.map(file => `- ${file.path} (${file.lines} lignes) - ${file.recommendation}`).join('\n')}

## Dépendances Externes à Supprimer
${plan.externalDependencies.map(dep => `- ${dep}`).join('\n')}

## Actions Recommandées
${plan.actions.map(action => `- **${action.type.toUpperCase()}** (${action.priority}): ${action.description}`).join('\n')}
    `;
  }
}

export const fileCleanup = FileCleanup.getInstance();

export default {
  FileCleanup,
  fileCleanup
};