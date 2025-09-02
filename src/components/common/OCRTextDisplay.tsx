import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Eye, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Languages,
  Settings,
  Wand2
} from 'lucide-react';
import { ArabicTextProcessor, ArabicProcessingResult } from '@/utils/arabicTextProcessor';
import { correctArabicOCR, ArabicOCRCorrectionResult } from '@/utils/arabicOCRCorrections';

interface OCRTextDisplayProps {
  originalText: string;
  onUseText?: (text: string) => void;
  onClose?: () => void;
  showProcessing?: boolean;
  className?: string;
}

export function OCRTextDisplay({ 
  originalText, 
  onUseText, 
  onClose, 
  showProcessing = true,
  className = "" 
}: OCRTextDisplayProps) {
  const [processingResult, setProcessingResult] = React.useState<ArabicProcessingResult | null>(null);
  const [arabicCorrections, setArabicCorrections] = React.useState<ArabicOCRCorrectionResult | null>(null);
  const [showOriginal, setShowOriginal] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (originalText && showProcessing) {
      // Appliquer d'abord les corrections OCR arabes
      const correctionResult = correctArabicOCR(originalText);
      setArabicCorrections(correctionResult);
      
      // Puis traiter avec ArabicTextProcessor
      const result = ArabicTextProcessor.processArabicText(correctionResult.correctedText);
      setProcessingResult(result);
    }
  }, [originalText, showProcessing]);

  const displayText = processingResult ? processingResult.processedText : 
                     arabicCorrections ? arabicCorrections.correctedText : originalText;
  const formattedText = ArabicTextProcessor.formatForDisplay(displayText, 800);
  
  // Détection de langue améliorée
  const detectLanguage = (text: string) => {
    const arabicCharsRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
    const frenchCharsRegex = /[A-Za-zÀ-ÿ]/g;
    
    const arabicMatches = text.match(arabicCharsRegex) || [];
    const frenchMatches = text.match(frenchCharsRegex) || [];
    const totalLetters = arabicMatches.length + frenchMatches.length;
    const arabicRatio = totalLetters > 0 ? arabicMatches.length / totalLetters : 0;
    
    if (arabicRatio > 0.6) return 'ara';
    if (arabicRatio > 0.15) return 'mixed';
    return frenchMatches.length > 0 ? 'fra' : 'ara';
  };
  
  const language = detectLanguage(displayText);
  const languageDisplay = language === 'ara' ? { icon: '🇩🇿', label: 'العربية' } :
                         language === 'fra' ? { icon: '🇫🇷', label: 'Français-Fr' } :
                         { icon: '🇩🇿🇫🇷', label: 'Mixte AR-FR' };
  
  const preprocessingType = language === 'ara' || language === 'mixed' ? 'Standard arabe' : 'Standard français';
  const isRTL = language === 'ara' || (language === 'mixed' && (processingResult?.arabicRatio ?? 0) > 0.5);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur copie:', error);
    }
  };

  const handleUseText = () => {
    if (onUseText) {
      onUseText(displayText);
    }
  };

  if (!originalText) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6 text-center text-gray-500">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Aucun texte extrait</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-green-50">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Texte OCR Extrait
          {processingResult && processingResult.corrections.length > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Wand2 className="w-3 h-3 mr-1" />
              Amélioré
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 p-6">
        {/* Informations de détection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Langue:</span>
            <Badge variant="outline" className="gap-1">
              <span>{languageDisplay.icon}</span>
              <span>{languageDisplay.label}</span>
            </Badge>
          </div>
          
          {processingResult && (
            <>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Préprocessing:</span>
                <Badge variant="outline" className="text-xs">
                  {preprocessingType}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Corrections:</span>
                <Badge variant="outline" className="text-xs">
                  {(arabicCorrections?.corrections.length || 0) + (processingResult?.corrections.length || 0)} appliquées
                </Badge>
              </div>
            </>
          )}
        </div>

        {/* Corrections appliquées */}
        {((arabicCorrections && arabicCorrections.corrections.length > 0) || 
          (processingResult && processingResult.corrections.length > 0)) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Corrections appliquées:
            </h4>
            <ul className="text-xs text-green-700 space-y-1">
              {arabicCorrections?.corrections.map((correction, index) => (
                <li key={`arabic-${index}`} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  {correction}
                </li>
              ))}
              {processingResult?.corrections.map((correction, index) => (
                <li key={`processing-${index}`} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  {correction}
                </li>
              ))}
            </ul>
            {arabicCorrections && arabicCorrections.wordsSeparated > 0 && (
              <div className="mt-2 text-xs text-green-600">
                ✨ {arabicCorrections.wordsSeparated} mots séparés, {arabicCorrections.ligaturesFixed} liaisons corrigées
                {arabicCorrections.rtlFixed && ' • Direction RTL corrigée'}
              </div>
            )}
            {processingResult && processingResult.wordsSeparated > 0 && (
              <div className="mt-2 text-xs text-green-600">
                ✨ {processingResult.wordsSeparated} mots séparés, {processingResult.ligaturesCorrected} liaisons corrigées
              </div>
            )}
          </div>
        )}

        {/* Aperçu du texte */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Aperçu du texte:
            </h4>
            <div className="flex gap-2">
              {processingResult && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="text-xs"
                >
                  {showOriginal ? 'Texte traité' : 'Texte original'}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                {copied ? 'Copié!' : 'Copier'}
              </Button>
            </div>
          </div>
          
          <div className="bg-gray-50 border rounded-lg p-4 max-h-80 overflow-y-auto">
            <pre
              dir={isRTL ? 'rtl' : 'ltr'}
              lang={language === 'ara' ? 'ar' : language === 'fra' ? 'fr' : 'ar'}
              className={`whitespace-pre-wrap text-sm leading-relaxed text-gray-800 ${isRTL ? 'text-right font-sans' : 'font-mono'}`}
            >
              {showOriginal && processingResult 
                ? ArabicTextProcessor.formatForDisplay(processingResult.originalText, 800)
                : formattedText
              }
            </pre>
          </div>
          
          {displayText.length > 800 && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Texte tronqué pour l'aperçu ({displayText.length} caractères au total)
            </div>
          )}
        </div>

        {/* Statistiques */}
        {processingResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-blue-600 font-medium">Caractères:</span>
                <span className="ml-1 text-blue-800">{processingResult.processedText.length}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Arabe:</span>
                <span className="ml-1 text-blue-800">{Math.round(processingResult.arabicRatio * 100)}%</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Qualité:</span>
                <span className="ml-1 text-blue-800">
                  {processingResult.corrections.length > 0 ? 'Améliorée' : 'Standard'}
                </span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Mode:</span>
                <span className="ml-1 text-blue-800">
                  {processingResult.arabicRatio > 0.5 ? 'RTL' : 'LTR'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {onUseText && (
            <Button 
              onClick={handleUseText}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Utiliser ce texte
            </Button>
          )}
          
          {onClose && (
            <Button 
              onClick={onClose} 
              variant="outline"
              className="border-gray-300"
            >
              Fermer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}