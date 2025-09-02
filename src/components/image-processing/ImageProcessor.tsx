import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  Settings, 
  Image as ImageIcon, 
  Table, 
  Zap,
  RefreshCw,
  Trash2,
  FileText,
  BarChart3
} from 'lucide-react';
import useImageProcessing from '@/hooks/useImageProcessing';
import { ProcessingResults } from './ProcessingResults';
import { TableExtractionView } from './TableExtractionView';
import { ConfigurationPanel } from './ConfigurationPanel';
import { toast } from 'sonner';

export function ImageProcessor() {
  const {
    isProcessing,
    progress,
    results,
    extractedTables,
    config,
    processFile,
    clearResults,
    updateConfig,
    exportResults,
    downloadProcessedImage,
    retryProcessing
  } = useImageProcessing();

  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Type de fichier non supporté. Utilisez PDF, JPEG, PNG ou WebP.');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB
      toast.error('Fichier trop volumineux. Maximum 50MB.');
      return;
    }
    
    processFile(file);
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const getProcessingStats = () => {
    if (results.length === 0) return null;
    
    const totalLines = results.reduce((sum, r) => sum + r.detectedLines.length, 0);
    const totalZones = results.reduce((sum, r) => sum + r.detectedZones.length, 0);
    const avgQuality = results.reduce((sum, r) => sum + r.quality, 0) / results.length;
    const avgProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / results.length;
    
    return {
      totalLines,
      totalZones,
      avgQuality: Math.round(avgQuality * 100),
      avgProcessingTime: Math.round(avgProcessingTime)
    };
  };

  const stats = getProcessingStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Traitement d'Images Avancé
          </h1>
          <p className="text-muted-foreground mt-2">
            Extraction intelligente de tables et zones de texte avec OpenCV.js
          </p>
        </div>
        
        {results.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={exportResults} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={clearResults} variant="outline">
              <Trash2 className="w-4 h-4 mr-2" />
              Effacer
            </Button>
          </div>
        )}
      </div>

      {/* Zone de téléchargement */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              Glissez vos fichiers ici ou cliquez pour sélectionner
            </h3>
            <p className="text-muted-foreground mb-4">
              Supports: PDF, JPEG, PNG, WebP (max 50MB)
            </p>
            
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <Button asChild disabled={isProcessing}>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Sélectionner un fichier
              </label>
            </Button>
          </div>
          
          {/* Barre de progression */}
          {isProcessing && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Traitement en cours...</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Lignes détectées</p>
                  <p className="text-2xl font-bold">{stats.totalLines}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Zones identifiées</p>
                  <p className="text-2xl font-bold">{stats.totalZones}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Table className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Tables extraites</p>
                  <p className="text-2xl font-bold">{extractedTables.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Qualité moyenne</p>
                  <p className="text-2xl font-bold">{stats.avgQuality}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contenu principal */}
      {results.length > 0 && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="results">
              <FileText className="w-4 h-4 mr-2" />
              Résultats
            </TabsTrigger>
            <TabsTrigger value="tables">
              <Table className="w-4 h-4 mr-2" />
              Tables ({extractedTables.length})
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="results">
            <ProcessingResults 
              results={results}
              onDownload={downloadProcessedImage}
              onRetry={retryProcessing}
              isProcessing={isProcessing}
            />
          </TabsContent>
          
          <TabsContent value="tables">
            <TableExtractionView tables={extractedTables} />
          </TabsContent>
          
          <TabsContent value="config">
            <ConfigurationPanel 
              config={config}
              onConfigChange={updateConfig}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default ImageProcessor;