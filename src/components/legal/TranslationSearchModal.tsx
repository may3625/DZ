import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ProcedureDocument } from "./MultiLanguagePublicationQueue";
import { 
  Search,
  CheckCircle,
  FileText,
  Calendar,
  Hash,
  Filter,
  Percent
} from 'lucide-react';

interface LanguageInfo {
  code: 'fr' | 'ar' | 'en';
  name: string;
  flag: string;
}

interface SearchResult {
  id: string;
  title: string;
  reference: string;
  type: string;
  category: string;
  confidence: number;
  dateOfEffect?: Date;
  content: string;
  similarity: number;
}

interface TranslationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageInfo;
  originalDocument: ProcedureDocument;
  onSelectDocument: (document: SearchResult) => void;
}

export function TranslationSearchModal({
  isOpen,
  onClose,
  language,
  originalDocument,
  onSelectDocument
}: TranslationSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Auto-recherche basée sur le titre du document original
      setSearchTerm(originalDocument.title);
      performSearch(originalDocument.title);
    }
  }, [isOpen, originalDocument]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simuler une recherche avec des résultats d'exemple
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResults: SearchResult[] = [
        {
          id: `search_${Date.now()}_1`,
          title: language.code === 'ar' 
            ? 'القانون رقم 25-01 - تحديث العدالة الرقمية'
            : language.code === 'en'
            ? 'LAW N° 25-01 - Digital Justice Modernization'
            : 'LOI N° 25-01 - Modernisation de la Justice Numérique',
          reference: 'LOI-25-01-2025',
          type: originalDocument.type,
          category: originalDocument.category,
          confidence: 96,
          similarity: 98,
          dateOfEffect: originalDocument.details.dateOfEffect,
          content: language.code === 'ar'
            ? 'يهدف هذا القانون إلى تحديث نظام العدالة من خلال الرقمنة والتقنيات الحديثة...'
            : language.code === 'en'
            ? 'This law aims to modernize the justice system through digitalization and modern technologies...'
            : 'Cette loi vise à moderniser le système judiciaire par la numérisation et les technologies modernes...'
        },
        {
          id: `search_${Date.now()}_2`,
          title: language.code === 'ar'
            ? 'قانون العدالة الإلكترونية - نسخة محدثة'
            : language.code === 'en'
            ? 'Electronic Justice Act - Updated Version'
            : 'Loi sur la Justice Électronique - Version mise à jour',
          reference: 'LOI-24-15-2024',
          type: originalDocument.type,
          category: originalDocument.category,
          confidence: 89,
          similarity: 85,
          dateOfEffect: new Date('2024-12-01'),
          content: language.code === 'ar'
            ? 'تحديث أحكام العدالة الإلكترونية والإجراءات الرقمية في المحاكم...'
            : language.code === 'en'
            ? 'Updates to electronic justice provisions and digital procedures in courts...'
            : 'Mise à jour des dispositions de justice électronique et procédures numériques dans les tribunaux...'
        },
        {
          id: `search_${Date.now()}_3`,
          title: language.code === 'ar'
            ? 'مرسوم تنفيذي حول التقنيات القضائية'
            : language.code === 'en'
            ? 'Executive Decree on Judicial Technologies'
            : 'Décret exécutif sur les technologies judiciaires',
          reference: 'DE-24-120-2024',
          type: 'Décret Exécutif',
          category: originalDocument.category,
          confidence: 78,
          similarity: 72,
          dateOfEffect: new Date('2024-10-15'),
          content: language.code === 'ar'
            ? 'تنظيم استخدام التقنيات الحديثة في الإجراءات القضائية...'
            : language.code === 'en'
            ? 'Regulation of modern technology use in judicial procedures...'
            : 'Réglementation de l\'utilisation des technologies modernes dans les procédures judiciaires...'
        }
      ];

      // Filtrer les résultats qui correspondent à la langue recherchée
      setSearchResults(mockResults.filter(result => result.similarity >= 70));
      
    } catch (error) {
      toast({
        title: "Erreur de recherche",
        description: "Une erreur est survenue lors de la recherche.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    performSearch(searchTerm);
  };

  const handleSelectResult = (result: SearchResult) => {
    setSelectedResult(result);
  };

  const handleConfirmSelection = () => {
    if (!selectedResult) return;

    // Vérifier les détails critiques
    const hasMatchingDetails = 
      selectedResult.type === originalDocument.details.type &&
      selectedResult.category === originalDocument.details.category;

    if (!hasMatchingDetails) {
      toast({
        title: "Attention",
        description: "Les détails du document sélectionné ne correspondent pas exactement au document original.",
        variant: "destructive"
      });
      return;
    }

    onSelectDocument(selectedResult);
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'text-green-600';
    if (similarity >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Rechercher un document équivalent en {language.name}
            <span className="text-lg">{language.flag}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Document original de référence */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Document original de référence:</h4>
              <div className="text-sm space-y-1">
                <div><strong>Titre:</strong> {originalDocument.title}</div>
                <div><strong>Type:</strong> {originalDocument.details.type}</div>
                <div><strong>Référence:</strong> {originalDocument.details.reference}</div>
                <div><strong>Catégorie:</strong> {originalDocument.details.category}</div>
                {originalDocument.details.dateOfEffect && (
                  <div><strong>Date d'effet:</strong> {originalDocument.details.dateOfEffect.toLocaleDateString()}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Barre de recherche */}
          <div className="flex gap-2">
            <Input
              placeholder={`Rechercher en ${language.name}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Résultats de recherche */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {searchResults.length === 0 && !isSearching && searchTerm && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucun résultat trouvé pour cette recherche.</p>
              </div>
            )}

            {searchResults.map((result) => (
              <Card 
                key={result.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedResult?.id === result.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : ''
                }`}
                onClick={() => handleSelectResult(result)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-sm">{result.title}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Percent className="w-3 h-3 mr-1" />
                        <span className={getSimilarityColor(result.similarity)}>
                          {result.similarity}% similarité
                        </span>
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <span className={getConfidenceColor(result.confidence)}>
                          {result.confidence}% confiance
                        </span>
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        <span>Réf: {result.reference}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>Type: {result.type}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Filter className="w-3 h-3" />
                        <span>Catégorie: {result.category}</span>
                      </div>
                      {result.dateOfEffect && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Effet: {result.dateOfEffect.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs bg-gray-50 p-2 rounded">
                    <strong>Aperçu:</strong> {result.content}
                  </div>

                  {/* Vérification des détails critiques */}
                  <div className="mt-3 flex gap-2">
                    {result.type === originalDocument.details.type ? (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Type correspondant
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Type différent
                      </Badge>
                    )}
                    
                    {result.category === originalDocument.details.category ? (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Catégorie correspondante
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Catégorie différente
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmSelection}
            disabled={!selectedResult}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Sélectionner ce document
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}