import React, { useState, useEffect } from 'react';
import { Trash2, FileX, Code, Package, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface UnusedFile {
  path: string;
  size: number;
  type: 'component' | 'utility' | 'style' | 'asset' | 'test' | 'other';
  lastModified: Date;
  reason: string;
  safeToDelete: boolean;
}

interface CodeMetrics {
  totalFiles: number;
  unusedFiles: number;
  totalSize: number;
  unusedSize: number;
  cleanupPercentage: number;
}

export function CodeCleanupComponent() {
  const [unusedFiles, setUnusedFiles] = useState<UnusedFile[]>([]);
  const [metrics, setMetrics] = useState<CodeMetrics>({
    totalFiles: 0,
    unusedFiles: 0,
    totalSize: 0,
    unusedSize: 0,
    cleanupPercentage: 0
  });
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    performCodeCleanupScan();
  }, []);

  const performCodeCleanupScan = async () => {
    setIsScanning(true);
    
    // Simulation d'un scan de nettoyage
    const scanResults = await simulateCodeCleanupScan();
    
    setUnusedFiles(scanResults);
    calculateMetrics(scanResults);
    
    setIsScanning(false);
  };

  const simulateCodeCleanupScan = async (): Promise<UnusedFile[]> => {
    // Simulation d'un scan de nettoyage de code
    await new Promise(resolve => setTimeout(resolve, 3000));
    
          return [
        {
          path: 'src/components/optimization/OptimizedComponent.tsx',
          size: 8.5,
          type: 'component',
          lastModified: new Date('2024-12-01'),
          reason: 'Composant optimisé et refactorisé',
          safeToDelete: false
        },
        {
          path: 'src/utils/optimized/performanceHelper.ts',
          size: 3.2,
          type: 'utility',
          lastModified: new Date('2024-12-01'),
          reason: 'Utilitaire de performance optimisé',
          safeToDelete: false
        },
        {
          path: 'src/styles/optimized-theme.css',
          size: 12.1,
          type: 'style',
          lastModified: new Date('2024-12-01'),
          reason: 'Thème CSS optimisé et purgé',
          safeToDelete: false
        }
      ];
  };

  const calculateMetrics = (files: UnusedFile[]) => {
    const totalFiles = 1250; // Simulation du nombre total de fichiers
    const unusedFiles = files.length;
    const totalSize = 25.2; // MB (optimisé)
    const unusedSize = files.reduce((sum, file) => sum + file.size, 0);
    const cleanupPercentage = (unusedSize / totalSize) * 100;
    
    setMetrics({
      totalFiles,
      unusedFiles,
      totalSize,
      unusedSize,
      cleanupPercentage
    });
  };

  const toggleFileSelection = (filePath: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(filePath)) {
      newSelection.delete(filePath);
    } else {
      newSelection.add(filePath);
    }
    setSelectedFiles(newSelection);
  };

  const selectAllSafe = () => {
    const safeFiles = unusedFiles.filter(file => file.safeToDelete);
    setSelectedFiles(new Set(safeFiles.map(file => file.path)));
  };

  const clearSelection = () => {
    setSelectedFiles(new Set());
  };

  const deleteSelectedFiles = async () => {
    if (selectedFiles.size === 0) return;
    
    setShowConfirmation(false);
    
    // Simulation de suppression
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Filtrer les fichiers supprimés
    const remainingFiles = unusedFiles.filter(file => !selectedFiles.has(file.path));
    setUnusedFiles(remainingFiles);
    calculateMetrics(remainingFiles);
    
    // Vider la sélection
    setSelectedFiles(new Set());
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'component': return <Code className="w-4 h-4 text-blue-600" />;
      case 'utility': return <Package className="w-4 h-4 text-green-600" />;
      case 'style': return <Code className="w-4 h-4 text-purple-600" />;
      case 'asset': return <FileX className="w-4 h-4 text-orange-600" />;
      case 'test': return <Code className="w-4 h-4 text-gray-600" />;
      default: return <FileX className="w-4 h-4 text-gray-600" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'component': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'utility': return 'bg-green-50 text-green-800 border-green-200';
      case 'style': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'asset': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'test': return 'bg-gray-50 text-gray-800 border-gray-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const formatFileSize = (size: number) => {
    return `${size.toFixed(1)} KB`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trash2 className="w-8 h-8 text-red-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nettoyage du Code</h2>
            <p className="text-gray-600">Identification et suppression des fichiers inutilisés</p>
          </div>
        </div>
        
        <button
          onClick={performCodeCleanupScan}
          disabled={isScanning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Scan en cours...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Nouveau Scan</span>
            </>
          )}
        </button>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Fichiers</p>
          <p className="text-2xl font-bold text-blue-900">{metrics.totalFiles}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm font-medium text-red-600">Fichiers Inutilisés</p>
          <p className="text-2xl font-bold text-red-900">{metrics.unusedFiles}</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-sm font-medium text-orange-600">Taille Inutilisée</p>
          <p className="text-2xl font-bold text-orange-900">{metrics.unusedSize.toFixed(1)} KB</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-600">% Nettoyage</p>
          <p className="text-2xl font-bold text-green-900">{metrics.cleanupPercentage.toFixed(1)}%</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm font-medium text-purple-600">Taille Totale</p>
          <p className="text-2xl font-bold text-purple-900">{metrics.totalSize.toFixed(1)} MB</p>
        </div>
      </div>

      {/* Actions de sélection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={selectAllSafe}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Sélectionner Sécurisés
          </button>
          
          <button
            onClick={clearSelection}
            className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Effacer Sélection
          </button>
        </div>
        
        {selectedFiles.size > 0 && (
          <button
            onClick={() => setShowConfirmation(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer {selectedFiles.size} fichier(s)</span>
          </button>
        )}
      </div>

      {/* Liste des fichiers inutilisés */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Fichiers Inutilisés ({unusedFiles.length})
        </h3>
        
        {unusedFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <p>Aucun fichier inutilisé détecté !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unusedFiles.map((file) => (
              <div 
                key={file.path}
                className={`p-4 rounded-lg border ${
                  selectedFiles.has(file.path) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.path)}
                    onChange={() => toggleFileSelection(file.path)}
                    disabled={!file.safeToDelete}
                    className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getFileTypeIcon(file.type)}
                      <h4 className="font-medium text-gray-900">{file.path}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFileTypeColor(file.type)}`}>
                        {file.type}
                      </span>
                      {!file.safeToDelete && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                          ATTENTION
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Taille :</span> {formatFileSize(file.size)}
                      </div>
                      <div>
                        <span className="font-medium">Dernière modification :</span> {formatDate(file.lastModified)}
                      </div>
                      <div>
                        <span className="font-medium">Raison :</span> {file.reason}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Confirmation de suppression</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer {selectedFiles.size} fichier(s) ? 
              Cette action est irréversible.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              
              <button
                onClick={deleteSelectedFiles}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}