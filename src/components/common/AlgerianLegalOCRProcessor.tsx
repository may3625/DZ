import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scan, CheckCircle, FileText, Settings, AlertTriangle, BookOpen, Building, Scale } from 'lucide-react';
import { OCRScanner } from './OCRScanner';
import { OCRTextDisplay } from './OCRTextDisplay';
import { EnhancedArabicDisplay } from '@/components/ocr/EnhancedArabicDisplay';
import { extractAlgerianLegalTextData } from '@/utils/algerianOCRExtractor';
import { useAlgerianNomenclatureData } from '@/hooks/useAlgerianNomenclatureData';
import { ArabicTextProcessor } from '@/utils/arabicTextProcessor';

interface AlgerianLegalOCRProcessorProps {
  onFormDataExtracted: (data: { documentType: 'legal', formData: Record<string, any> }) => void;
  onClose?: () => void;
  title?: string;
  className?: string;
}

export function AlgerianLegalOCRProcessor({ 
  onFormDataExtracted, 
  onClose, 
  title = "Scanner OCR - Textes Juridiques Algériens", 
  className = "" 
}: AlgerianLegalOCRProcessorProps) {
  const [extractedData, setExtractedData] = useState<{ documentType: 'legal', formData: Record<string, any> } | null>(null);
  const [showScanner, setShowScanner] = useState(true);
  const [showTextDisplay, setShowTextDisplay] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [detectedLanguage, setDetectedLanguage] = useState<'ar' | 'fr' | 'mixed'>('fr');
  const [detectedInstitution, setDetectedInstitution] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const { mapAlgerianOCRDataToForm, validateAlgerianDocument } = useAlgerianNomenclatureData();

  const handleTextExtracted = async (text: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🇩🇿 [AlgerianLegalOCRProcessor] Texte OCR extrait pour analyse juridique:', text.substring(0, 300) + '...');
    }
    
    setExtractedText(text);
    setProcessingStage('Traitement avancé du texte arabe...');
    
    // Traitement arabe avancé
    const processingResult = ArabicTextProcessor.processArabicText(text);
    setDetectedLanguage(processingResult.language);
    
    // Utiliser le texte traité pour l'analyse
    const processedText = processingResult.processedText;
    
    setProcessingStage('Analyse du texte juridique algérien...');
    
    // Vérifier que c'est bien un texte juridique algérien
    const lowerText = processedText.toLowerCase();
    const isLegalDocument = 
      // Textes officiels algériens
      lowerText.includes('république algérienne démocratique et populaire') ||
      lowerText.includes('الجمهورية الجزائرية الديمقراطية الشعبية') ||
      lowerText.includes('journal officiel') ||
      lowerText.includes('الجريدة الرسمية') ||
      // Types de textes juridiques algériens
      lowerText.includes('décret exécutif') ||
      lowerText.includes('décret présidentiel') ||
      lowerText.includes('arrêté ministériel') ||
      lowerText.includes('arrêté interministériel') ||
      lowerText.includes('ordonnance') ||
      lowerText.includes('loi organique') ||
      lowerText.includes('instruction ministérielle') ||
      lowerText.includes('circulaire') ||
      // Institutions algériennes
      lowerText.includes('premier ministre') ||
      lowerText.includes('ministre de') ||
      lowerText.includes('wilaya') ||
      lowerText.includes('daïra') ||
      lowerText.includes('commune') ||
      // Codes algériens
      lowerText.includes('code civil') ||
      lowerText.includes('code pénal') ||
      lowerText.includes('code de commerce') ||
      lowerText.includes('code de procédure civile');

    if (!isLegalDocument) {
      setProcessingStage('⚠️ Document non reconnu comme texte juridique algérien');
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [AlgerianLegalOCRProcessor] Document ne semble pas être un texte juridique algérien');
      }
      return;
    }

    setProcessingStage('Identification de l\'institution émettrice...');
    
    // Détecter l'institution émettrice
    const institutions = [
      'Présidence de la République',
      'Premier Ministère',
      'Ministère de la Justice',
      'Ministère de l\'Intérieur et des Collectivités locales',
      'Ministère des Finances',
      'Ministère du Commerce',
      'Ministère de l\'Agriculture',
      'Ministère de la Santé',
      'Ministère de l\'Éducation nationale',
      'Ministère de l\'Enseignement supérieur',
      'Wilaya',
      'Commune'
    ];
    
    for (const institution of institutions) {
      if (lowerText.includes(institution.toLowerCase())) {
        setDetectedInstitution(institution);
        break;
      }
    }
    
    setProcessingStage('Extraction des données juridiques algériennes...');
    const legalData = extractAlgerianLegalTextData(processedText, processingResult.language);
    const mappedLegalData = mapAlgerianOCRDataToForm(legalData, 'legal');
    const parsedData = { documentType: 'legal' as const, formData: mappedLegalData };
    
    setProcessingStage('Validation des données extraites...');
    
    // Valider les données avec les référentiels algériens
    const validationResult = validateAlgerianDocument(parsedData);
    setConfidence(validationResult.confidence);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🇩🇿 Données juridiques algériennes extraites:', legalData);
      console.log('🇩🇿 [AlgerianLegalOCRProcessor] Données juridiques parsées et validées:', parsedData);
      console.log('🎯 [AlgerianLegalOCRProcessor] Confiance:', validationResult.confidence + '%');
      console.log('🏛️ [AlgerianLegalOCRProcessor] Institution détectée:', detectedInstitution);
      console.log('🗣️ [AlgerianLegalOCRProcessor] Langue détectée:', processingResult.language);
      console.log('🔧 [AlgerianLegalOCRProcessor] Corrections appliquées:', processingResult.corrections);
    }
    
    setExtractedData(parsedData);
    setShowScanner(false);
    setShowTextDisplay(true);
    setProcessingStage('Traitement terminé');
  };

  const handleValidateAndUse = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [AlgerianLegalOCRProcessor] Validation et utilisation des données juridiques:', extractedData);
    }
    if (extractedData) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 [AlgerianLegalOCRProcessor] Envoi des données vers le formulaire parent');
        console.log('🏛️ [AlgerianLegalOCRProcessor] Type de document juridique:', extractedData.documentType);
        console.log('📝 [AlgerianLegalOCRProcessor] Données formulaire:', extractedData.formData);
        console.log('📊 [AlgerianLegalOCRProcessor] Nombre de champs dans formData:', Object.keys(extractedData.formData).length);
      }
      
      try {
        onFormDataExtracted(extractedData);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [AlgerianLegalOCRProcessor] Callback onFormDataExtracted appelé avec succès');
        }
        
        // Fermer le scanner après un délai pour permettre au parent de traiter
        if (onClose) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔒 [AlgerianLegalOCRProcessor] Fermeture du scanner dans 100ms');
          }
          setTimeout(() => {
            onClose();
          }, 100);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [AlgerianLegalOCRProcessor] Erreur lors de l\'appel du callback:', error);
        }
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [AlgerianLegalOCRProcessor] Aucune donnée extraite disponible');
      }
    }
  };

  const handleNewScan = () => {
    setExtractedData(null);
    setShowScanner(true);
    setShowTextDisplay(false);
    setProcessingStage('');
    setConfidence(0);
    setDetectedLanguage('fr');
    setDetectedInstitution('');
    setExtractedText('');
  };

  const handleTextValidated = (validatedText: string) => {
    // Le texte a été validé par l'utilisateur, procéder à l'extraction finale
    if (extractedData) {
      handleValidateAndUse();
    }
  };

  if (showScanner && !showTextDisplay) {
    return (
      <div className="space-y-4">
        <OCRScanner
          onTextExtracted={handleTextExtracted}
          onClose={onClose}
          title={title}
          className={className}
        />
        {processingStage && (
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-purple-600 animate-spin" />
                <span className="text-sm font-medium text-purple-800">{processingStage}</span>
              </div>
              <Progress value={75} className="h-2" />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Affichage du texte extrait avec corrections
  if (showTextDisplay && extractedText) {
    // Détecter si le texte contient de l'arabe
    const isArabicText = /[\u0600-\u06FF]/.test(extractedText);
    
    return (
      <div className="space-y-4">
        {isArabicText ? (
          <Card className="w-full">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-purple-600" />
                Texte Juridique Algérien Extrait
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <EnhancedArabicDisplay 
                text={extractedText}
                onCopy={(correctedText) => {
                  navigator.clipboard.writeText(correctedText);
                }}
                className="mb-4"
              />
              {extractedData && (
                <Button 
                  onClick={handleValidateAndUse}
                  className="w-full bg-purple-600 hover:bg-purple-700 mt-4"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Continuer avec les données extraites
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <OCRTextDisplay
              originalText={extractedText}
              onUseText={handleTextValidated}
              onClose={() => setShowTextDisplay(false)}
              showProcessing={true}
              className="mb-4"
            />
            {extractedData && (
              <Button 
                onClick={handleValidateAndUse}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Continuer avec les données extraites
              </Button>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <Scale className="w-5 h-5 text-purple-600" />
          Données Extraites - Texte Juridique Algérien
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Informations sur le document détecté */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">Type:</span>
            <Badge variant="default" className="bg-purple-600">
              Texte Juridique
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Langue:</span>
            <Badge variant="outline" className="gap-1">
              {detectedLanguage === 'ar' ? (
                <>
                  <span>🇩🇿</span>
                  <span>العربية</span>
                </>
              ) : detectedLanguage === 'fr' ? (
                <>
                  <span>🇫🇷</span>
                  <span>Français-Fr</span>
                </>
              ) : (
                <>
                  <span>🇩🇿🇫🇷</span>
                  <span>Bilingue</span>
                </>
              )}
            </Badge>
          </div>
          
          {detectedInstitution && (
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium">Institution:</span>
              <Badge variant="outline" className="text-xs">
                {detectedInstitution}
              </Badge>
            </div>
          )}
        </div>

        {/* Indicateur de confiance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Confiance de l'extraction</span>
            <span className={`text-sm font-bold ${confidence >= 80 ? 'text-green-600' : confidence >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {confidence}%
            </span>
          </div>
          <Progress 
            value={confidence} 
            className={`h-2 ${confidence >= 80 ? 'bg-green-100' : confidence >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`} 
          />
          {confidence < 60 && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">
                Confiance faible. Veuillez vérifier attentivement les données extraites.
              </span>
            </div>
          )}
        </div>

        {/* Aperçu des données extraites */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-3">Données juridiques extraites ({Object.keys(extractedData?.formData || {}).length} champs)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
            {Object.entries(extractedData?.formData || {}).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="font-medium text-purple-700">{key}:</span>
                <span className="ml-2 text-purple-600">
                  {typeof value === 'string' ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={handleValidateAndUse}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Utiliser ces données juridiques
          </Button>
          
          <Button 
            onClick={handleNewScan}
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            <Scan className="w-4 h-4 mr-2" />
            Nouveau scan
          </Button>
          
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}