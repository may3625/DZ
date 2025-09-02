import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Download, 
  FileText, 
  Copy, 
  ExternalLink, 
  FileJson, 
  FileType,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useOCRExport } from '@/hooks/useOCRExport';
import { RealOCRResult } from '@/services/realOcrService';

interface ExportActionsProps {
  result: RealOCRResult;
  mappedData: Record<string, unknown>;
  originalFile?: File;
  onOpenOriginal?: () => void;
}

export function ExportActions({ result, mappedData, originalFile, onOpenOriginal }: ExportActionsProps) {
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const { exportToJSON, exportToTXT, exportToPDF, copyToClipboard } = useOCRExport();

  const handleExport = async (format: 'json' | 'txt' | 'pdf') => {
    setExportingFormat(format);
    
    try {
      switch (format) {
        case 'json':
          await exportToJSON(result, mappedData);
          toast.success('Export JSON téléchargé avec succès');
          break;
        case 'txt':
          await exportToTXT(result);
          toast.success('Export TXT téléchargé avec succès');
          break;
        case 'pdf':
          await exportToPDF(result, mappedData);
          toast.success('Export PDF généré avec succès');
          break;
      }
    } catch (error) {
      toast.error(`Erreur lors de l'export ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setExportingFormat(null);
    }
  };

  const handleCopyAll = async () => {
    try {
      await copyToClipboard(result.text);
      toast.success('Texte copié dans le presse-papiers');
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  // Statistiques pour l'affichage
  const stats = {
    textLength: result.text.length,
    confidence: Math.round(result.confidence * 100),
    entities: result.entities ? Object.keys(result.entities).length : 0,
    metadata: Object.keys(result.metadata || {}).length,
    mappedFields: Object.keys(mappedData).filter(key => mappedData[key]).length
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Actions d'Export et de Téléchargement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistiques du document */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.textLength.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Caractères</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.confidence}%</div>
              <div className="text-xs text-muted-foreground">Confiance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.entities}</div>
              <div className="text-xs text-muted-foreground">Entités</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.metadata}</div>
              <div className="text-xs text-muted-foreground">Métadonnées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.mappedFields}</div>
              <div className="text-xs text-muted-foreground">Champs mappés</div>
            </div>
          </div>

          {/* Actions d'export */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Export JSON */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <FileJson className="w-8 h-8 text-blue-500" />
                  <h3 className="font-medium">Export JSON</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    Texte + métadonnées + mapping complet
                  </p>
                  <Button
                    onClick={() => handleExport('json')}
                    disabled={exportingFormat === 'json'}
                    className="w-full"
                    variant="outline"
                  >
                    {exportingFormat === 'json' ? (
                      <>
                        <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                        Export...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Export TXT */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <FileType className="w-8 h-8 text-green-500" />
                  <h3 className="font-medium">Export TXT</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    Texte agrégé uniquement
                  </p>
                  <Button
                    onClick={() => handleExport('txt')}
                    disabled={exportingFormat === 'txt'}
                    className="w-full"
                    variant="outline"
                  >
                    {exportingFormat === 'txt' ? (
                      <>
                        <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                        Export...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Export PDF */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <FileText className="w-8 h-8 text-red-500" />
                  <h3 className="font-medium">Export PDF</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    PDF généré localement
                  </p>
                  <Button
                    onClick={() => handleExport('pdf')}
                    disabled={exportingFormat === 'pdf'}
                    className="w-full"
                    variant="outline"
                  >
                    {exportingFormat === 'pdf' ? (
                      <>
                        <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Générer
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Copier tout */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <Copy className="w-8 h-8 text-purple-500" />
                  <h3 className="font-medium">Copier tout</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    Vers le presse-papiers
                  </p>
                  <Button
                    onClick={handleCopyAll}
                    className="w-full"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copier
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accès au fichier original */}
          {originalFile && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Fichier d'origine</div>
                    <div className="text-sm text-muted-foreground">
                      {originalFile.name} • {(originalFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <Button
                  onClick={onOpenOriginal}
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ouvrir l'original
                </Button>
              </div>
            </div>
          )}

          {/* Indicateurs de qualité */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Indicateurs de Qualité</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Confiance OCR</span>
                <div className="flex items-center gap-2">
                  {stats.confidence >= 90 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : stats.confidence >= 70 ? (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <Badge variant={stats.confidence >= 90 ? 'default' : stats.confidence >= 70 ? 'secondary' : 'destructive'}>
                    {stats.confidence}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Densité du texte</span>
                <Badge variant="outline">
                  {stats.textLength > 1000 ? 'Élevée' : stats.textLength > 500 ? 'Moyenne' : 'Faible'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Entités détectées</span>
                <Badge variant="outline">
                  {stats.entities > 0 ? `${stats.entities} trouvée${stats.entities > 1 ? 's' : ''}` : 'Aucune'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}