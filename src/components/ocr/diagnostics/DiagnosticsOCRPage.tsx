import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertCircle, FileText, Activity, Upload } from 'lucide-react';
import { realUnifiedOCRService } from '@/services/realUnifiedOCRService';
import { useOCRProcessing } from '@/components/ocr/hooks/useOCRProcessing';
import { TestingInterface } from '@/components/ocr/testing/TestingInterface';
import { MonitoringDashboard } from '@/components/ocr/monitoring/MonitoringDashboard';
import { ResultsTab } from '@/components/ocr/results/ResultsTab';
import { SectionHeader } from '@/components/common/SectionHeader';

export function DiagnosticsOCRPage() {
  const [pdfOk, setPdfOk] = useState<boolean | null>(null);
  const [langOk, setLangOk] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);

  // Utilisation du hook OCR
  const { 
    isProcessing, 
    result, 
    mappedData, 
    error, 
    processingSteps, 
    processFile, 
    clearResults 
  } = useOCRProcessing();

  const runDiagnostics = useCallback(async () => {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      try {
        const { default: PdfWorker } = await import('pdfjs-dist/build/pdf.worker.min.mjs?worker');
        // @ts-ignore
        pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();
        setPdfOk(true);
        setLogs(l => [...l, 'PDF.js: worker local (module) OK']);
      } catch {
        // @ts-ignore
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(/* @vite-ignore */ 'pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
        setPdfOk(true);
        setLogs(l => [...l, 'PDF.js: worker local (fallback) OK']);
      }
    } catch (e) {
      setPdfOk(false);
      setLogs(l => [...l, 'PDF.js: échec du chargement local']);
    }

    try {
      // Tester l'initialisation du service OCR réel
      setLogs(l => [...l, 'Test initialisation service OCR réel...']);
      await realUnifiedOCRService.initialize();
      setLangOk(true);
      setLogs(l => [...l, '✅ Service OCR réel initialisé avec succès (CDN Tesseract)']);
    } catch (error: any) {
      setLangOk(false);
      setLogs(l => [...l, `❌ Erreur initialisation OCR: ${error.message}`]);
    }
  }, []);

  useEffect(() => {
    // Relancer les diagnostics au montage
    runDiagnostics();
  }, [runDiagnostics]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(10);
    setLogs(l => [...l, `Fichier chargé: ${file.name}`]);

    try {
      let result;
      if (file.type === 'application/pdf') {
        setLogs(l => [...l, 'Extraction par le service OCR RÉEL (PDF)...']);
        await realUnifiedOCRService.initialize();
        const extracted = await realUnifiedOCRService.extractFromPDF(file);
        result = { text: extracted.text, confidence: extracted.confidence * 100 };
      } else {
        setLogs(l => [...l, 'OCR image via Tesseract RÉEL...']);
        await realUnifiedOCRService.initialize();
        const extracted = await realUnifiedOCRService.extractText(file);
        result = { text: extracted.text, confidence: extracted.confidence * 100 };
      }
      setProgress(90);
      setText(result?.text || '');
      setLogs(l => [...l, `Confiance: ${result?.confidence ?? 0}%`]);
      setProgress(100);
    } catch (err: any) {
      setLogs(l => [...l, `Erreur: ${err.message}`]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={FileText}
        title="Diagnostics OCR"
        description="Plateforme complète d'OCR avec résultats, export, tests et monitoring."
        iconColor="text-teal-600"
      />

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="upload">Upload & OCR</TabsTrigger>
          <TabsTrigger value="results">Résultats</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="testing">Tests</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Indicateurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {pdfOk ? (
                    <CheckCircle2 className="text-green-600" />
                  ) : pdfOk === false ? (
                    <AlertCircle className="text-red-600" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-gray-300" />
                  )}
                  <span>PDF.js local OK</span>
                </div>
                <div className="flex items-center gap-2">
                  {langOk ? (
                    <CheckCircle2 className="text-green-600" />
                  ) : langOk === false ? (
                    <AlertCircle className="text-red-600" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-gray-300" />
                  )}
                  <span>Service OCR Réel (Tesseract CDN)</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Tester un document
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input 
                  type="file" 
                  accept=".pdf,image/*" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await processFile(file);
                      // Appel également l'ancien handler pour les logs
                      handleUpload(e);
                    }
                  }} 
                />
                {(uploading || isProcessing) && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground">
                      {isProcessing ? 'Traitement OCR en cours...' : 'Traitement en cours...'}
                    </p>
                    {processingSteps.length > 0 && (
                      <div className="space-y-1">
                        {processingSteps.map((step, index) => (
                          <div key={index} className="text-xs text-muted-foreground">
                            {step}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-md h-56 overflow-auto text-xs">
                  {logs.map((l, i) => (
                    <div key={i} className="mb-1">• {l}</div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Texte extrait (aperçu)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-3 rounded-md h-56 overflow-auto text-xs whitespace-pre-wrap">
                  {result?.text || text || '—'}
                </pre>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="results">
          <ResultsTab 
            result={result}
            mappedData={mappedData}
            isProcessing={isProcessing}
            onClearResults={clearResults}
          />
        </TabsContent>

        <TabsContent value="export">
          <ResultsTab 
            result={result}
            mappedData={mappedData}
            isProcessing={isProcessing}
            onClearResults={clearResults}
          />
        </TabsContent>

        <TabsContent value="testing">
          <TestingInterface />
        </TabsContent>

        <TabsContent value="monitoring">
          <MonitoringDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}