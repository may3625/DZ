import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileText, Eye, Languages, Zap } from 'lucide-react';
import { ArabicOCRCorrectionResult } from '@/utils/arabicOCRCorrections';

interface OCRTextPreviewProps {
  extractedText: string;
  language: string;
  confidence: number;
  processingType: string;
  corrections?: ArabicOCRCorrectionResult;
  isVisible: boolean;
}

export const OCRTextPreview: React.FC<OCRTextPreviewProps> = ({
  extractedText,
  language,
  confidence,
  processingType,
  corrections,
  isVisible
}) => {
  if (!isVisible || !extractedText) {
    return null;
  }

  const getLanguageDisplay = (lang: string): { flag: string; name: string; color: string } => {
    switch (lang.toLowerCase()) {
      case 'ara':
      case 'arabic':
        return { flag: '🇩🇿', name: 'العربية', color: 'bg-green-100 text-green-800 border-green-200' };
      case 'fra':
      case 'french':
      case 'français':
        return { flag: '🇫🇷', name: 'Français-Fr', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'mixed':
      case 'bilingual':
        return { flag: '🇩🇿🇫🇷', name: 'Mixte AR-FR', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      default:
        return { flag: '🇩🇿', name: 'العربية', color: 'bg-green-100 text-green-800 border-green-200' };
    }
  };

  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.8) return 'text-green-600';
    if (conf >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProcessingDisplay = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'arabic':
      case 'standard_arabic':
      case 'arabe uniquement':
      case 'activé pour arabe':
      case 'standard arabe':
        return 'Standard arabe';
      case 'french':
      case 'standard_french':
      case 'français uniquement':
      case 'standard français':
        return 'Standard français';
      case 'bilingual':
      case 'bilingue (arabe + français)':
        return 'Bilingue AR-FR';
      default:
        // Détecter si le type contient "arabe"
        if (type.toLowerCase().includes('arabe')) {
          return 'Standard arabe';
        }
        return type || 'Standard arabe';
    }
  };

  const languageInfo = getLanguageDisplay(language);
  const isArabic = language.toLowerCase().includes('ara') || extractedText.match(/[\u0600-\u06FF]/);

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Texte OCR Extrait
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {/* Métadonnées d'extraction */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-gray-500" />
            <Badge className={`${languageInfo.color} border`}>
              {languageInfo.flag} {languageInfo.name}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Confiance: <span className={`font-semibold ${getConfidenceColor(confidence)}`}>
                {(confidence * 100).toFixed(1)}%
              </span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gray-500" />
            <Badge variant="outline" className="text-xs">
              {getProcessingDisplay(processingType)}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Corrections appliquées (si disponibles) */}
        {corrections && corrections.corrections.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-green-800 mb-2">
              ✨ Corrections OCR appliquées:
            </h4>
            <div className="flex flex-wrap gap-2">
              {corrections.corrections.map((correction, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-green-100 text-green-700">
                  {correction}
                </Badge>
              ))}
            </div>
            {corrections.wordsSeparated > 0 && (
              <div className="text-xs text-green-600 mt-1">
                📝 {corrections.wordsSeparated} mots séparés • 
                🔗 {corrections.ligaturesFixed} liaisons corrigées • 
                {corrections.rtlFixed && '⬅️ Direction RTL corrigée'}
              </div>
            )}
          </div>
        )}

        {/* Texte extrait */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Aperçu du texte ({extractedText.length} caractères)
          </h4>
          
          <ScrollArea className="h-48 w-full rounded-md border bg-gray-50 p-4">
            <div 
              className={`text-sm leading-relaxed whitespace-pre-wrap ${
                isArabic ? 'text-right font-arabic' : 'text-left'
              }`}
              dir={isArabic ? 'rtl' : 'ltr'}
              style={{
                fontFamily: isArabic 
                  ? 'Arial, "Noto Sans Arabic", "Traditional Arabic", serif' 
                  : 'system-ui, -apple-system, sans-serif',
                lineHeight: isArabic ? '1.8' : '1.6',
                fontSize: isArabic ? '15px' : '14px'
              }}
            >
              {extractedText || 'Aucun texte détecté'}
            </div>
          </ScrollArea>
        </div>

        {/* Statistiques du texte */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-800">
              {extractedText.length}
            </div>
            <div className="text-xs text-gray-600">Caractères</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-800">
              {extractedText.split(/\s+/).filter(word => word.length > 0).length}
            </div>
            <div className="text-xs text-gray-600">Mots</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-800">
              {extractedText.split(/\n/).length}
            </div>
            <div className="text-xs text-gray-600">Lignes</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-800">
              {((extractedText.match(/[\u0600-\u06FF]/g) || []).length / extractedText.length * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">Arabe</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};