import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Upload, 
  FileJson, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TranslationKey {
  key: string;
  section: string;
  subsection?: string;
  context?: string;
  fr: string;
  ar: string;
  en: string;
  status: 'complete' | 'partial' | 'missing';
  lastModified: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  preview: TranslationKey[];
}

interface TranslationImportExportProps {
  translations: TranslationKey[];
  section: string;
  onImport: (translations: TranslationKey[]) => void;
  onSyncWithFiles?: () => Promise<void>;
  className?: string;
}

export function TranslationImportExport({ 
  translations, 
  section, 
  onImport, 
  onSyncWithFiles,
  className 
}: TranslationImportExportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const exportToJSON = useCallback(() => {
    try {
      // Structure compatible avec i18next
      const exportData = {
        metadata: {
          section,
          exportDate: new Date().toISOString(),
          totalKeys: translations.length,
          version: '1.0.0'
        },
        translations: {}
      };

      // Organiser par langue
      ['fr', 'ar', 'en'].forEach(lang => {
        exportData.translations[lang] = {};
        translations.forEach(t => {
          const keys = t.key.split('.');
          let current = exportData.translations[lang];
          
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
          }
          
          current[keys[keys.length - 1]] = t[lang as keyof TranslationKey] || '';
        });
      });

      // Créer et télécharger le fichier
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations-${section}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: `${translations.length} traductions exportées pour la section "${section}"`,
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les traductions",
        variant: "destructive",
      });
    }
  }, [translations, section, toast]);

  const exportForI18next = useCallback(() => {
    try {
      // Export direct compatible avec les fichiers existants
      const langExports = {};
      
      ['fr', 'ar', 'en'].forEach(lang => {
        const langData = {};
        translations.forEach(t => {
          const keys = t.key.split('.');
          let current = langData;
          
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
          }
          
          current[keys[keys.length - 1]] = t[lang as keyof TranslationKey] || '';
        });
        
        langExports[lang] = langData;
      });

      // Créer les fichiers par langue
      Object.entries(langExports).forEach(([lang, data]) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${lang}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

      toast({
        title: "Export i18next réussi",
        description: "Fichiers de langue générés (fr.json, ar.json, en.json)",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export i18next",
        description: "Impossible de générer les fichiers de langue",
        variant: "destructive",
      });
    }
  }, [translations, toast]);

  const handleImport = useCallback(async (file: File) => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const content = await file.text();
      const data = JSON.parse(content);
      
      const imported: TranslationKey[] = [];
      const errors: string[] = [];
      
      if (data.translations) {
        // Format avec metadata
        const processNestedKeys = (obj: any, prefix = '', lang: 'fr' | 'ar' | 'en') => {
          Object.entries(obj).forEach(([key, value]) => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'string') {
              // Trouver ou créer l'entrée
              let existing = imported.find(t => t.key === fullKey);
              if (!existing) {
                existing = {
                  key: fullKey,
                  section,
                  fr: '',
                  ar: '',
                  en: '',
                  status: 'missing',
                  lastModified: new Date().toISOString().split('T')[0]
                };
                imported.push(existing);
              }
              existing[lang] = value;
              
              // Mettre à jour le statut
              const hasAll = existing.fr && existing.ar && existing.en;
              const hasAny = existing.fr || existing.ar || existing.en;
              existing.status = hasAll ? 'complete' : hasAny ? 'partial' : 'missing';
            } else if (typeof value === 'object' && value !== null) {
              processNestedKeys(value, fullKey, lang);
            }
          });
        };

        ['fr', 'ar', 'en'].forEach(lang => {
          if (data.translations[lang]) {
            processNestedKeys(data.translations[lang], '', lang as 'fr' | 'ar' | 'en');
          }
        });
      } else {
        // Format direct (structure i18next)
        const processKeys = (obj: any, prefix = '') => {
          Object.entries(obj).forEach(([key, value]) => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'string') {
              imported.push({
                key: fullKey,
                section,
                fr: value, // Assume la langue du fichier
                ar: '',
                en: '',
                status: 'partial',
                lastModified: new Date().toISOString().split('T')[0]
              });
            } else if (typeof value === 'object' && value !== null) {
              processKeys(value, fullKey);
            }
          });
        };
        
        processKeys(data);
      }

      const result: ImportResult = {
        success: imported.length > 0,
        imported: imported.length,
        errors,
        preview: imported.slice(0, 5) // Preview des 5 premiers
      };

      setImportResult(result);
      
      if (result.success) {
        onImport(imported);
        toast({
          title: "Import réussi",
          description: `${result.imported} traductions importées`,
        });
      }
    } catch (error) {
      const result: ImportResult = {
        success: false,
        imported: 0,
        errors: ['Format de fichier invalide ou corrompu'],
        preview: []
      };
      setImportResult(result);
      
      toast({
        title: "Erreur d'import",
        description: "Le fichier n'a pas pu être traité",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  }, [section, onImport, toast]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  }, [handleImport]);

  const handleSyncWithFiles = useCallback(async () => {
    if (!onSyncWithFiles) return;
    
    setIsSyncing(true);
    try {
      await onSyncWithFiles();
      toast({
        title: "Synchronisation réussie",
        description: "Les traductions ont été synchronisées avec les fichiers locaux",
      });
    } catch (error) {
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser avec les fichiers locaux",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [onSyncWithFiles, toast]);

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5" />
            Import & Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Section */}
          <div className="space-y-3">
            <h4 className="font-medium">Export des traductions</h4>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={exportToJSON} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export JSON complet
              </Button>
              <Button onClick={exportForI18next} variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Export i18next
              </Button>
              <Badge variant="secondary">{translations.length} traductions</Badge>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium">Import des traductions</h4>
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline"
                disabled={isImporting}
              >
                {isImporting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Importer JSON
              </Button>
              {onSyncWithFiles && (
                <Button 
                  onClick={handleSyncWithFiles} 
                  variant="outline"
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Sync avec fichiers
                </Button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Import Progress */}
          {isImporting && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Import en cours...</div>
              <Progress value={undefined} className="h-2" />
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <Alert className={importResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {importResult.success ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription>
                {importResult.success ? (
                  <div>
                    <strong>Import réussi !</strong> {importResult.imported} traductions importées.
                    {importResult.preview.length > 0 && (
                      <div className="mt-2 text-sm">
                        <div className="font-medium mb-1">Aperçu :</div>
                        <ul className="space-y-1">
                          {importResult.preview.map(t => (
                            <li key={t.key} className="font-mono text-xs">
                              {t.key}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <strong>Erreur d'import</strong>
                    <ul className="mt-2 space-y-1">
                      {importResult.errors.map((error, index) => (
                        <li key={index} className="text-sm">• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}