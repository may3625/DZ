// @ts-nocheck
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  Camera, 
  Scan, 
  Download, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Settings,
  Info
} from 'lucide-react';
import { algerianOCRService } from '@/services/ocrService';
import { createSafeTesseractWorker } from '@/utils/tesseractFallback';

interface RealLocalOCRProcessorProps {
  onFormDataExtracted?: (data: { documentType: 'legal' | 'procedure', formData: Record<string, any> }) => void;
  onClose?: () => void;
}

export function RealLocalOCRProcessor({ onFormDataExtracted, onClose }: RealLocalOCRProcessorProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // États
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initProgress, setInitProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [tesseractWorker, setTesseractWorker] = useState<any>(null);
  
  // Résultats
  const [extractionResults, setExtractionResults] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState({
    tesseract: 'Pas initialisé',
    nlp: 'Local simplifié',
    mapping: 'Local simplifié',
    storage: 'Local'
  });

  // Initialisation RÉELLE de Tesseract.js
  const initializeRealServices = useCallback(async () => {
    if (isInitialized) return;

    try {
      setCurrentStep('Chargement de Tesseract.js...');
      setInitProgress(10);
      setSystemStatus(prev => ({ ...prev, tesseract: 'Chargement...' }));

      // Import dynamique de Tesseract.js
      console.log('📦 Importation de Tesseract.js...');
      
      setCurrentStep('Initialisation worker Tesseract (FR+AR)...');
      setInitProgress(30);

      // Création du worker avec langues FR + AR (langues locales)
      console.log('🔧 Création du worker Tesseract...');
      const worker = await createSafeTesseractWorker(['ara', 'fra'], 1, {
        gzip: false,
        logger: (m: any) => {
          console.log('📖 [Tesseract]', m);
          if (m.status === 'recognizing text') {
            setCurrentStep(`OCR en cours: ${Math.round(m.progress * 100)}%`);
          }
        },
        errorHandler: (err: any) => console.error('❌ [Tesseract]', err)
      });

      setCurrentStep('Configuration Tesseract pour documents juridiques...');
      setInitProgress(70);

      // Configuration pour documents juridiques algériens
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789أبتثجحخدذرزسشصضطظعغفقكلمنهويىءآإؤئ °-/.,;:()[]{}«»"\'',
        preserve_interword_spaces: '1',
        tessedit_pageseg_mode: 1 as any // Mode page complète
      });

      setTesseractWorker(worker);
      setSystemStatus(prev => ({ ...prev, tesseract: 'Opérationnel (réel)' }));
      setInitProgress(100);
      setCurrentStep('Tesseract.js prêt !');
      setIsInitialized(true);

      console.log('✅ Tesseract.js initialisé avec succès');
      toast({
        title: "🇩🇿 Tesseract.js Initialisé",
        description: "OCR FR+AR prêt pour l'extraction de documents juridiques",
      });

    } catch (error) {
      console.error('❌ Erreur d\'initialisation Tesseract:', error);
      setSystemStatus(prev => ({ ...prev, tesseract: 'Erreur' }));
      const { getErrorMessage } = await import('@/utils/safeError');
      const msg = getErrorMessage(error);
      toast({
        title: "❌ Erreur Tesseract.js",
        description: `Impossible d'initialiser: ${msg}`,
        variant: "destructive"
      });
    }
  }, [isInitialized, toast]);

  // Traitement RÉEL avec Tesseract.js
  const processFileWithRealOCR = useCallback(async (file: File) => {
    if (!isInitialized || !tesseractWorker) {
      await initializeRealServices();
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setExtractionResults(null);

    try {
      setCurrentStep('Préparation du fichier...');
      setProcessingProgress(10);

      let imageToProcess;

      if (file.type === 'application/pdf') {
        // Utiliser le service canonique pour PDF
        setCurrentStep('Extraction OCR PDF (local)...');
        setProcessingProgress(40);

        try {
          const extracted = await algerianOCRService.extractFromPDF(file);

          const extractionResult = {
            text: extracted.text,
            confidence: extracted.confidence / 100,
            processingTime: extracted.metadata?.processingTime ?? 0,
            structuredData: {
              titre: extracted.structuredData?.title || '',
              numero: extracted.structuredData?.number || '',
              type: extracted.structuredData?.type || '',
              institution: extracted.structuredData?.institution || '',
              dateGregorienne: extracted.structuredData?.dateGregorian || '',
              contenu: extracted.text,
              articles: extracted.structuredData?.articles?.map(a => ({ numero: a.number, contenu: a.content })) || []
            },
            zones: [],
            tables: extracted.tables || []
          };

          setExtractionResults(extractionResult);
          setProcessingProgress(100);
          setCurrentStep('Extraction terminée !');

          toast({ title: '✅ OCR PDF (local)', description: `Texte: ${extracted.text.length} caractères` });
          setIsProcessing(false);
          return; // Fin traitement PDF
        } catch (e:any) {
          console.error('Erreur OCR PDF:', e);
          throw e;
        }
      } else {
        // Pour les images, utilisation directe
        imageToProcess = file;
        setCurrentStep('Image chargée, début OCR...');
        setProcessingProgress(30);
      }

      // OCR RÉEL avec Tesseract.js
      setCurrentStep('Extraction OCR en cours...');
      console.log('🔍 Début OCR avec Tesseract.js...');
      
      const startTime = Date.now();
      const { data: { text, confidence } } = await tesseractWorker.recognize(imageToProcess);
      const processingTime = Date.now() - startTime;

      setCurrentStep('Analyse du texte extrait...');
      setProcessingProgress(80);

      console.log('✅ OCR terminé:', { textLength: text.length, confidence, processingTime });

      // Analyse simple du texte (sans NLP complexe pour l'instant)
      const algerianLegalPatterns = {
        decretExecutif: /décret\s+exécutif\s+n[°]\s*(\d+[-]\d+)/i,
        decretPresidentiel: /décret\s+présidentiel\s+n[°]\s*(\d+[-]\d+)/i,
        arrete: /arrêté\s+(?:ministériel\s+)?n[°]\s*(\d+[-]\d+)/i,
        loi: /loi\s+n[°]\s*(\d+[-]\d+)/i,
        dateGregoriennes: /(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/gi,
        institutions: /(ministère|ministre|président|premier\s+ministre|république\s+algérienne)/gi,
        articles: /article\s+(\d+(?:\s+bis|\s+ter|\s+quater)?)/gi
      };

              const documentType = 'legal';
      let numero = '';
      let institution = '';
      let datePublication = '';
      let typeDoc = 'document_juridique';

      // Détection du type de document
      if (algerianLegalPatterns.decretExecutif.test(text)) {
        typeDoc = 'decret_executif';
        const match = text.match(algerianLegalPatterns.decretExecutif);
        numero = match ? match[1] : '';
      } else if (algerianLegalPatterns.decretPresidentiel.test(text)) {
        typeDoc = 'decret_presidentiel';
        const match = text.match(algerianLegalPatterns.decretPresidentiel);
        numero = match ? match[1] : '';
      } else if (algerianLegalPatterns.arrete.test(text)) {
        typeDoc = 'arrete';
        const match = text.match(algerianLegalPatterns.arrete);
        numero = match ? match[1] : '';
      } else if (algerianLegalPatterns.loi.test(text)) {
        typeDoc = 'loi';
        const match = text.match(algerianLegalPatterns.loi);
        numero = match ? match[1] : '';
      }

      // Extraction de la date
      const dateMatch = text.match(algerianLegalPatterns.dateGregoriennes);
      if (dateMatch) {
        datePublication = dateMatch[0];
      }

      // Extraction de l'institution
      const institutionMatch = text.match(algerianLegalPatterns.institutions);
      if (institutionMatch) {
        institution = institutionMatch[0];
      }

      // Extraction des articles
      const articles = [];
      let articleMatch;
      const articleRegex = new RegExp(algerianLegalPatterns.articles.source, 'gi');
      while ((articleMatch = articleRegex.exec(text)) !== null) {
        articles.push({
          numero: articleMatch[1],
          contenu: `Article ${articleMatch[1]} - [Contenu extrait du texte]`
        });
      }

      // Construction des résultats
      const extractionResult = {
        text,
        confidence: confidence / 100, // Tesseract donne 0-100, on veut 0-1
        processingTime,
        structuredData: {
          titre: `${typeDoc.replace('_', ' ')} n° ${numero}${datePublication ? ` du ${datePublication}` : ''}`,
          numero,
          type: typeDoc,
          institution,
          dateGregorienne: datePublication,
          contenu: text,
          articles,
          signataires: [],
          references: []
        },
        zones: [
          { content: text.substring(0, 100), type: 'content', confidence: confidence / 100 }
        ],
        tables: []
      };

      setExtractionResults(extractionResult);
      setProcessingProgress(100);
      setCurrentStep('Extraction terminée !');

      toast({
        title: "✅ OCR Réel Terminé",
        description: `Texte extrait: ${text.length} caractères (${Math.round(confidence)}% confiance)`,
      });

    } catch (error) {
      console.error('❌ Erreur OCR:', error);
      const { getErrorMessage } = await import('@/utils/safeError');
      const msg = getErrorMessage(error);
      toast({
        title: "❌ Erreur OCR",
        description: `Erreur lors de l'extraction: ${msg}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized, tesseractWorker, initializeRealServices, toast]);

  // Gestion du drag & drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const supportedFile = files.find((file: File) => 
      file.type === 'application/pdf' || 
      file.type.startsWith('image/')
    );
    
    if (supportedFile) {
      processFileWithRealOCR(supportedFile);
    } else {
      toast({
        title: "Format non supporté",
        description: "Veuillez glisser un fichier PDF ou une image",
        variant: "destructive"
      });
    }
  }, [processFileWithRealOCR, toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      processFileWithRealOCR(file);
    }
  }, [processFileWithRealOCR]);

  // Application des résultats au formulaire
  const applyToForm = useCallback(() => {
    if (extractionResults && onFormDataExtracted) {
      const mappedData = {
        documentType: 'legal' as const,
        formData: {
          titre: extractionResults.structuredData.titre,
          numero: extractionResults.structuredData.numero,
          type: extractionResults.structuredData.type,
          institution: extractionResults.structuredData.institution,
          datePublication: extractionResults.structuredData.dateGregorienne,
          contenu: extractionResults.text,
          articles: extractionResults.structuredData.articles
        }
      };

      onFormDataExtracted(mappedData);
      toast({
        title: "📋 Données Appliquées au Formulaire",
        description: "Les données OCR réelles ont été mappées vers le formulaire",
      });
      onClose?.();
    }
  }, [extractionResults, onFormDataExtracted, onClose, toast]);

  // Nettoyage
  const cleanup = useCallback(async () => {
    if (tesseractWorker) {
      await tesseractWorker.terminate();
      setTesseractWorker(null);
      console.log('🧹 Worker Tesseract nettoyé');
    }
  }, [tesseractWorker]);

  // Nettoyage au démontage du composant
  React.useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* En-tête avec H1 pour SEO/accessibilité */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Info className="w-6 h-6 text-blue-600" />
            <span className="sr-only">Titre</span>
            <span role="heading" aria-level={1}>🇩🇿 OCR Juridique Algérien - Tesseract.js RÉEL</span>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              OCR Réel
            </Badge>
          </CardTitle>
          <p className="text-blue-700">
            Extraction OCR réelle avec Tesseract.js FR+AR + PDF.js - Analyse de documents juridiques algériens
          </p>
        </CardHeader>
      </Card>

      {/* Statut des services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5" />
            État des Services OCR Réels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="text-sm">Tesseract.js:</span>
              <Badge variant={systemStatus.tesseract.includes('Opérationnel') ? 'default' : 'secondary'}>
                {systemStatus.tesseract}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span className="text-sm">Analyse:</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {systemStatus.nlp}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Scan className="w-4 h-4" />
              <span className="text-sm">Mapping:</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {systemStatus.mapping}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="text-sm">Stockage:</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {systemStatus.storage}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Initialisation */}
      {!isInitialized && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Button 
                onClick={initializeRealServices}
                disabled={initProgress > 0 && initProgress < 100}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                Initialiser Tesseract.js (RÉEL)
              </Button>
              
              {initProgress > 0 && initProgress < 100 && (
                <div className="space-y-2">
                  <Progress value={initProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">{currentStep}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zone de drop */}
      {isInitialized && !isProcessing && (
        <Card 
          className="border-2 border-dashed border-blue-300 hover:border-blue-500 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Upload className="w-12 h-12 text-blue-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Glissez votre document ici (OCR RÉEL)</h3>
                <p className="text-sm text-muted-foreground">
                  PDF ou images supportés - Tesseract.js FR+AR
                </p>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>OCR Réel :</strong> Utilise Tesseract.js pour l'extraction réelle de texte. 
                  Le traitement peut prendre quelques secondes selon la taille du document.
                </AlertDescription>
              </Alert>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </CardContent>
        </Card>
      )}

      {/* Progression */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">OCR en cours avec Tesseract.js...</span>
              </div>
              <Progress value={processingProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">{currentStep}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats */}
      {extractionResults && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Résultats OCR Réels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Confiance</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(extractionResults.confidence * 100)}%
                  </p>
                </div>
                <div className="text-center">
                  <Scan className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Temps</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {extractionResults.processingTime}ms
                  </p>
                </div>
                <div className="text-center">
                  <FileText className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Caractères</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {extractionResults.text.length}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <strong>Type détecté:</strong> {extractionResults.structuredData.type}
                </div>
                <div>
                  <strong>Titre:</strong> {extractionResults.structuredData.titre}
                </div>
                <div>
                  <strong>Institution:</strong> {extractionResults.structuredData.institution}
                </div>
                
                <div>
                  <strong>Texte extrait (100 premiers caractères):</strong>
                  <div className="bg-gray-50 p-3 rounded mt-2">
                    <pre className="text-sm whitespace-pre-wrap">
                      {extractionResults.text.substring(0, 300)}...
                    </pre>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={applyToForm} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Appliquer au Formulaire
                  </Button>
                  {onClose && (
                    <Button onClick={onClose} variant="outline">
                      Fermer
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}