import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Tag, 
  Link, 
  FileText, 
  Sparkles, 
  Brain, 
  Search,
  Plus,
  X,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LegalText } from '@/types/store';

interface LegalTextEnrichmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  legalText: LegalText;
  language: 'fr' | 'ar';
  onEnrich: (enrichedText: LegalText) => void;
}

interface EnrichmentSuggestion {
  type: 'keyword' | 'reference' | 'summary' | 'category';
  value: string;
  confidence: number;
  source: string;
}

interface ValidationResult {
  field: string;
  status: 'valid' | 'warning' | 'error';
  message: string;
}

export function LegalTextEnrichmentModal({ 
  isOpen, 
  onClose, 
  legalText, 
  language, 
  onEnrich 
}: LegalTextEnrichmentModalProps) {
  const { toast } = useToast();
  
  const [enrichedText, setEnrichedText] = useState<LegalText>(legalText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<EnrichmentSuggestion[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newReference, setNewReference] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setEnrichedText(legalText);
      performAnalysis();
    }
  }, [isOpen, legalText]);

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulation de l'analyse intelligente
      const steps = [
        'Analyse du contenu...',
        'Extraction des mots-clés...',
        'Recherche de références...',
        'Génération du résumé...',
        'Validation des métadonnées...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setAnalysisProgress(((i + 1) / steps.length) * 100);
      }

      // Génération des suggestions
      const generatedSuggestions: EnrichmentSuggestion[] = [
        {
          type: 'keyword',
          value: 'droit administratif',
          confidence: 0.92,
          source: 'Analyse sémantique'
        },
        {
          type: 'keyword',
          value: 'procédure administrative',
          confidence: 0.88,
          source: 'Analyse sémantique'
        },
        {
          type: 'reference',
          value: 'Loi n° 08-09 du 25 février 2008',
          confidence: 0.85,
          source: 'Base de données juridique'
        },
        {
          type: 'reference',
          value: 'Décret exécutif n° 15-247',
          confidence: 0.82,
          source: 'Base de données juridique'
        },
        {
          type: 'summary',
          value: 'Ce texte établit les règles fondamentales de la procédure administrative en Algérie, définissant les droits des citoyens et les obligations de l\'administration.',
          confidence: 0.90,
          source: 'Génération automatique'
        },
        {
          type: 'category',
          value: 'Droit administratif général',
          confidence: 0.94,
          source: 'Classification automatique'
        }
      ];

      setSuggestions(generatedSuggestions);
      
      // Validation
      const validation: ValidationResult[] = [
        {
          field: 'title',
          status: 'valid',
          message: 'Le titre est conforme aux standards'
        },
        {
          field: 'numero',
          status: enrichedText.numero ? 'valid' : 'warning',
          message: enrichedText.numero ? 'Numéro présent' : 'Numéro manquant'
        },
        {
          field: 'source',
          status: enrichedText.source ? 'valid' : 'warning',
          message: enrichedText.source ? 'Source identifiée' : 'Source non spécifiée'
        }
      ];

      setValidationResults(validation);

    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur d\'analyse' : 'خطأ في التحليل',
        description: 'Une erreur est survenue lors de l\'analyse du texte',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (suggestion: EnrichmentSuggestion) => {
    switch (suggestion.type) {
      case 'keyword':
        if (!enrichedText.keywords?.includes(suggestion.value)) {
          setEnrichedText(prev => ({
            ...prev,
            keywords: [...(prev.keywords || []), suggestion.value]
          }));
        }
        break;
      case 'reference':
        if (!enrichedText.references?.includes(suggestion.value)) {
          setEnrichedText(prev => ({
            ...prev,
            references: [...(prev.references || []), suggestion.value]
          }));
        }
        break;
      case 'summary':
        setEnrichedText(prev => ({
          ...prev,
          resume: suggestion.value
        }));
        break;
      case 'category':
        setEnrichedText(prev => ({
          ...prev,
          category: suggestion.value
        }));
        break;
    }

    // Retirer la suggestion appliquée
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !enrichedText.keywords?.includes(newKeyword.trim())) {
      setEnrichedText(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setEnrichedText(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || []
    }));
  };

  const addReference = () => {
    if (newReference.trim() && !enrichedText.references?.includes(newReference.trim())) {
      setEnrichedText(prev => ({
        ...prev,
        references: [...(prev.references || []), newReference.trim()]
      }));
      setNewReference('');
    }
  };

  const removeReference = (reference: string) => {
    setEnrichedText(prev => ({
      ...prev,
      references: prev.references?.filter(r => r !== reference) || []
    }));
  };

  const handleSave = () => {
    onEnrich(enrichedText);
    toast({
      title: language === 'fr' ? 'Enrichissement sauvegardé' : 'تم حفظ الإثراء',
      description: language === 'fr' 
        ? 'Les métadonnées ont été mises à jour avec succès'
        : 'تم تحديث البيانات الوصفية بنجاح'
    });
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'keyword': return <Tag className="w-4 h-4" />;
      case 'reference': return <Link className="w-4 h-4" />;
      case 'summary': return <FileText className="w-4 h-4" />;
      case 'category': return <BookOpen className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            {language === 'fr' ? 'Enrichissement du texte juridique' : 'إثراء النص القانوني'}
          </DialogTitle>
        </DialogHeader>

        {isAnalyzing ? (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'fr' ? 'Analyse intelligente en cours...' : 'جاري التحليل الذكي...'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === 'fr' 
                  ? 'Extraction automatique des métadonnées et suggestions d\'enrichissement'
                  : 'استخراج تلقائي للبيانات الوصفية واقتراحات الإثراء'
                }
              </p>
              <Progress value={analysisProgress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                {analysisProgress.toFixed(0)}%
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="suggestions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="suggestions">
                {language === 'fr' ? 'Suggestions' : 'الاقتراحات'}
              </TabsTrigger>
              <TabsTrigger value="keywords">
                {language === 'fr' ? 'Mots-clés' : 'الكلمات المفتاحية'}
              </TabsTrigger>
              <TabsTrigger value="references">
                {language === 'fr' ? 'Références' : 'المراجع'}
              </TabsTrigger>
              <TabsTrigger value="metadata">
                {language === 'fr' ? 'Métadonnées' : 'البيانات الوصفية'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="suggestions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {language === 'fr' ? 'Suggestions d\'enrichissement' : 'اقتراحات الإثراء'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {suggestions.length > 0 ? (
                    <div className="space-y-3">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            {getSuggestionIcon(suggestion.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">
                                  {suggestion.type === 'keyword' && (language === 'fr' ? 'Mot-clé' : 'كلمة مفتاحية')}
                                  {suggestion.type === 'reference' && (language === 'fr' ? 'Référence' : 'مرجع')}
                                  {suggestion.type === 'summary' && (language === 'fr' ? 'Résumé' : 'ملخص')}
                                  {suggestion.type === 'category' && (language === 'fr' ? 'Catégorie' : 'فئة')}
                                </Badge>
                                <Badge variant="secondary">
                                  {(suggestion.confidence * 100).toFixed(0)}%
                                </Badge>
                              </div>
                              <p className="text-sm font-medium">{suggestion.value}</p>
                              <p className="text-xs text-muted-foreground">{suggestion.source}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => applySuggestion(suggestion)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            {language === 'fr' ? 'Appliquer' : 'تطبيق'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {language === 'fr' 
                          ? 'Toutes les suggestions ont été appliquées'
                          : 'تم تطبيق جميع الاقتراحات'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {language === 'fr' ? 'Gestion des mots-clés' : 'إدارة الكلمات المفتاحية'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder={language === 'fr' ? 'Ajouter un mot-clé...' : 'إضافة كلمة مفتاحية...'}
                      onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    />
                    <Button onClick={addKeyword}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {enrichedText.keywords?.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {keyword}
                        <X 
                          className="w-3 h-3 ml-1" 
                          onClick={() => removeKeyword(keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                  
                  {(!enrichedText.keywords || enrichedText.keywords.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">
                      {language === 'fr' 
                        ? 'Aucun mot-clé défini'
                        : 'لا توجد كلمات مفتاحية محددة'
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="references" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    {language === 'fr' ? 'Références juridiques' : 'المراجع القانونية'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newReference}
                      onChange={(e) => setNewReference(e.target.value)}
                      placeholder={language === 'fr' ? 'Ajouter une référence...' : 'إضافة مرجع...'}
                      onKeyPress={(e) => e.key === 'Enter' && addReference()}
                    />
                    <Button onClick={addReference}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {enrichedText.references?.map((reference, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{reference}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeReference(reference)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {(!enrichedText.references || enrichedText.references.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">
                      {language === 'fr' 
                        ? 'Aucune référence définie'
                        : 'لا توجد مراجع محددة'
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === 'fr' ? 'Informations générales' : 'المعلومات العامة'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>{language === 'fr' ? 'Catégorie' : 'الفئة'}</Label>
                      <Input
                        value={enrichedText.category || ''}
                        onChange={(e) => setEnrichedText(prev => ({ ...prev, category: e.target.value }))}
                        placeholder={language === 'fr' ? 'Catégorie juridique...' : 'الفئة القانونية...'}
                      />
                    </div>
                    
                    <div>
                      <Label>{language === 'fr' ? 'Résumé' : 'الملخص'}</Label>
                      <Textarea
                        value={enrichedText.resume || ''}
                        onChange={(e) => setEnrichedText(prev => ({ ...prev, resume: e.target.value }))}
                        placeholder={language === 'fr' ? 'Résumé du texte...' : 'ملخص النص...'}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {language === 'fr' ? 'Validation' : 'التحقق'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {validationResults.map((result, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {getValidationIcon(result.status)}
                          <div>
                            <p className="text-sm font-medium">{result.field}</p>
                            <p className="text-xs text-muted-foreground">{result.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {language === 'fr' ? 'Annuler' : 'إلغاء'}
          </Button>
          
          <Button onClick={performAnalysis} variant="outline" disabled={isAnalyzing}>
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            {language === 'fr' ? 'Réanalyser' : 'إعادة تحليل'}
          </Button>
          
          <Button onClick={handleSave} disabled={isAnalyzing}>
            <Save className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Sauvegarder' : 'حفظ'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}