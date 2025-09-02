import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle, Languages, Wand2, Eye } from 'lucide-react';
import { correctArabicOCR } from '@/utils/arabicOCRCorrections';
import { ArabicTextProcessor } from '@/utils/arabicTextProcessor';

interface EnhancedArabicDisplayProps {
  text: string;
  onCopy?: (text: string) => void;
  className?: string;
}

export function EnhancedArabicDisplay({ text, onCopy, className = '' }: EnhancedArabicDisplayProps) {
  const [copied, setCopied] = React.useState(false);
  
  // Traitement du texte avec corrections OCR arabes
  const processedData = useMemo(() => {
    if (!text) return null;
    
    // Appliquer les corrections OCR
    const ocrResult = correctArabicOCR(text);
    
    // Traitement avec ArabicTextProcessor
    const processingResult = ArabicTextProcessor.processArabicText(ocrResult.correctedText);
    
    return {
      originalText: text,
      correctedText: ocrResult.correctedText,
      finalText: processingResult.processedText,
      ocrCorrections: ocrResult.corrections,
      processingCorrections: processingResult.corrections,
      language: processingResult.language,
      arabicRatio: processingResult.arabicRatio,
      wordsSeparated: ocrResult.wordsSeparated + processingResult.wordsSeparated,
      ligaturesFixed: ocrResult.ligaturesFixed + processingResult.ligaturesCorrected,
      rtlFixed: ocrResult.rtlFixed
    };
  }, [text]);

  const handleCopy = async () => {
    if (processedData) {
      try {
        await navigator.clipboard.writeText(processedData.finalText);
        if (onCopy) {
          onCopy(processedData.finalText);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.warn('Erreur copie:', error);
        // Fallback pour anciens navigateurs
        if (onCopy) {
          onCopy(processedData.finalText);
        }
      }
    }
  };

  if (!processedData) {
    return null;
  }

  const { language, arabicRatio, finalText, ocrCorrections, processingCorrections, wordsSeparated, ligaturesFixed, rtlFixed } = processedData;
  
  // Affichage de langue amélioré
  const languageDisplay = language === 'ar' ? { icon: '🇩🇿', label: 'العربية' } :
                         language === 'fr' ? { icon: '🇫🇷', label: 'Français-Fr' } :
                         { icon: '🇩🇿🇫🇷', label: 'Mixte AR-FR' };
  
  const preprocessingType = language === 'ar' || language === 'mixed' ? 'Standard arabe' : 'Standard français';

  const totalCorrections = ocrCorrections.length + processingCorrections.length;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-green-50">
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          Texte OCR Extrait
          {totalCorrections > 0 && (
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
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Préprocessing:</span>
            <Badge variant="outline" className="text-xs">
              {preprocessingType}
            </Badge>
          </div>
          
          {totalCorrections > 0 && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Corrections:</span>
              <Badge variant="outline" className="text-xs">
                {totalCorrections} appliquées
              </Badge>
            </div>
          )}
        </div>

        {/* Corrections appliquées */}
        {totalCorrections > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Corrections OCR arabes appliquées:
            </h4>
            <ul className="text-xs text-green-700 space-y-1">
              {ocrCorrections.map((correction, index) => (
                <li key={`ocr-${index}`} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  {correction}
                </li>
              ))}
              {processingCorrections.map((correction, index) => (
                <li key={`proc-${index}`} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  {correction}
                </li>
              ))}
            </ul>
            {(wordsSeparated > 0 || ligaturesFixed > 0 || rtlFixed) && (
              <div className="mt-2 text-xs text-green-600">
                ✨ {wordsSeparated} mots séparés, {ligaturesFixed} liaisons corrigées
                {rtlFixed && ' • Direction RTL corrigée'}
              </div>
            )}
          </div>
        )}

        {/* Aperçu du texte */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Aperçu du texte corrigé:</h4>
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
          
          <div className="bg-gray-50 border rounded-lg p-4 max-h-80 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-gray-800 rtl:text-right">
              {ArabicTextProcessor.formatForDisplay(finalText, 800)}
            </pre>
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-blue-600 font-medium">Caractères:</span>
              <span className="ml-1 text-blue-800">{finalText.length}</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Arabe:</span>
              <span className="ml-1 text-blue-800">{Math.round(arabicRatio * 100)}%</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Qualité:</span>
              <span className="ml-1 text-blue-800">
                {totalCorrections > 0 ? 'Améliorée' : 'Standard'}
              </span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Mode:</span>
              <span className="ml-1 text-blue-800">
                {arabicRatio > 0.5 ? 'RTL' : 'LTR'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}