import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Save, 
  Edit3, 
  Copy, 
  Undo, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  Languages
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

interface TranslationEditorProps {
  translation: TranslationKey;
  onSave: (key: string, lang: 'fr' | 'ar' | 'en', value: string) => void;
  onEditToggle?: () => void;
  isEditing?: boolean;
  className?: string;
}

export function TranslationEditor({ 
  translation, 
  onSave, 
  onEditToggle,
  isEditing = false,
  className 
}: TranslationEditorProps) {
  const [editValues, setEditValues] = useState({
    fr: translation.fr,
    ar: translation.ar,
    en: translation.en
  });
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleInputChange = useCallback((lang: 'fr' | 'ar' | 'en', value: string) => {
    setEditValues(prev => ({ ...prev, [lang]: value }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback((lang: 'fr' | 'ar' | 'en') => {
    const value = editValues[lang];
    onSave(translation.key, lang, value);
    setHasChanges(false);
    toast({
      title: "Traduction sauvegardée",
      description: `Mise à jour en ${lang.toUpperCase()} pour "${translation.key}"`,
    });
  }, [editValues, onSave, translation.key, toast]);

  const handleSaveAll = useCallback(() => {
    Object.entries(editValues).forEach(([lang, value]) => {
      if (value !== translation[lang as keyof typeof translation]) {
        onSave(translation.key, lang as 'fr' | 'ar' | 'en', value);
      }
    });
    setHasChanges(false);
    toast({
      title: "Toutes les traductions sauvegardées",
      description: `Mise à jour pour "${translation.key}"`,
    });
  }, [editValues, translation, onSave, toast]);

  const handleCopyFrom = useCallback((fromLang: 'fr' | 'ar' | 'en', toLang: 'fr' | 'ar' | 'en') => {
    const value = editValues[fromLang];
    if (value) {
      setEditValues(prev => ({ ...prev, [toLang]: value }));
      setHasChanges(true);
      toast({
        title: "Texte copié",
        description: `Copié de ${fromLang.toUpperCase()} vers ${toLang.toUpperCase()}`,
      });
    }
  }, [editValues, toast]);

  const handleReset = useCallback(() => {
    setEditValues({
      fr: translation.fr,
      ar: translation.ar,
      en: translation.en
    });
    setHasChanges(false);
  }, [translation]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': 
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'partial': 
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'missing': 
        return <XCircle className="w-4 h-4 text-red-600" />;
      default: 
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'missing': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={`border-l-4 border-l-primary ${className}`}>
      <CardContent className="pt-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                {translation.key}
              </code>
              <Badge className={getStatusColor(translation.status)}>
                {getStatusIcon(translation.status)}
                <span className="ml-1 capitalize">{translation.status}</span>
              </Badge>
            </div>
            {translation.context && (
              <p className="text-sm text-muted-foreground">
                {translation.context}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Section: {translation.section}</span>
              {translation.subsection && <span>Sous-section: {translation.subsection}</span>}
              <span>Modifié: {translation.lastModified}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
                className="text-xs"
              >
                <Undo className="w-3 h-3 mr-1" />
                Annuler
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onEditToggle}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Translation Fields */}
        {isEditing ? (
          <div className="space-y-4">
            {/* French */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`fr-${translation.key}`} className="text-sm font-medium">
                  🇫🇷 Français
                </Label>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleCopyFrom('fr', 'ar')}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    → AR
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleCopyFrom('fr', 'en')}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    → EN
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSave('fr')}
                    className="h-6 px-2 text-xs"
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <Textarea
                id={`fr-${translation.key}`}
                value={editValues.fr}
                onChange={(e) => handleInputChange('fr', e.target.value)}
                className="min-h-[60px] resize-none"
                placeholder="Traduction française..."
              />
            </div>

            {/* Arabic */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`ar-${translation.key}`} className="text-sm font-medium">
                  🇩🇿 العربية
                </Label>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleCopyFrom('ar', 'fr')}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    → FR
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleCopyFrom('ar', 'en')}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    → EN
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSave('ar')}
                    className="h-6 px-2 text-xs"
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <Textarea
                id={`ar-${translation.key}`}
                value={editValues.ar}
                onChange={(e) => handleInputChange('ar', e.target.value)}
                className="min-h-[60px] resize-none text-right"
                dir="rtl"
                placeholder="الترجمة العربية..."
              />
            </div>

            {/* English */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`en-${translation.key}`} className="text-sm font-medium">
                  🇬🇧 English
                </Label>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleCopyFrom('en', 'fr')}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    → FR
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleCopyFrom('en', 'ar')}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    → AR
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSave('en')}
                    className="h-6 px-2 text-xs"
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <Textarea
                id={`en-${translation.key}`}
                value={editValues.en}
                onChange={(e) => handleInputChange('en', e.target.value)}
                className="min-h-[60px] resize-none"
                placeholder="English translation..."
              />
            </div>

            {/* Save All Button */}
            {hasChanges && (
              <div className="flex justify-end pt-2 border-t">
                <Button onClick={handleSaveAll} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder tout
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* French Display */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">🇫🇷 Français</Label>
              <div className="mt-1 p-3 bg-muted rounded-md text-sm min-h-[60px] flex items-start">
                {translation.fr || <span className="text-muted-foreground italic">Non traduit</span>}
              </div>
            </div>

            {/* Arabic Display */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">🇩🇿 العربية</Label>
              <div className="mt-1 p-3 bg-muted rounded-md text-sm min-h-[60px] text-right flex items-start" dir="rtl">
                {translation.ar || <span className="text-muted-foreground italic">غير مترجم</span>}
              </div>
            </div>

            {/* English Display */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">🇬🇧 English</Label>
              <div className="mt-1 p-3 bg-muted rounded-md text-sm min-h-[60px] flex items-start">
                {translation.en || <span className="text-muted-foreground italic">Not translated</span>}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}