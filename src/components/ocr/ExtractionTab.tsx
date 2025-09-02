/**
 * Interface d'affichage des résultats d'extraction OCR
 * Onglet Extraction avec aperçu du texte et métadonnées
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Languages,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  FileType,
  Hash
} from 'lucide-react';
import { ExtractedDocument } from '@/services/enhanced/algerianDocumentExtractionService';
import { StructuredPublication } from '@/services/enhanced/algerianLegalRegexService';

interface ExtractionTabProps {
  extractedDoc: ExtractedDocument | null;
  structuredPublication: StructuredPublication | null;
  isLoading: boolean;
}

export function ExtractionTab({ extractedDoc, structuredPublication, isLoading }: ExtractionTabProps) {
  const [showFullText, setShowFullText] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Mémorisation des données calculées
  const textPreview = useMemo(() => {
    if (!extractedDoc) return '';
    const maxChars = 1000;
    const text = extractedDoc.extractedText;
    return text.length > maxChars ? text.substring(0, maxChars) + '...' : text;
  }, [extractedDoc]);

  const qualityLabel = useMemo(() => {
    const score = extractedDoc ? extractedDoc.qualityIndicators.overallScore : 0;
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }, [extractedDoc]);

  const searchResults = useMemo(() => {
    if (!extractedDoc || !searchTerm) return [];
    const text = extractedDoc.extractedText.toLowerCase();
    const term = searchTerm.toLowerCase();
    const results = [];
    let index = text.indexOf(term);
    
    while (index !== -1 && results.length < 50) {
      const start = Math.max(0, index - 50);
      const end = Math.min(text.length, index + term.length + 50);
      const context = extractedDoc.extractedText.substring(start, end);
      
      results.push({
        index,
        context,
        highlight: { start: index - start, end: index - start + term.length }
      });
      
      index = text.indexOf(term, index + 1);
    }
    
    return results;
  }, [extractedDoc, searchTerm]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 animate-spin" />
              Extraction en cours...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={undefined} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Traitement du document avec les services d'extraction algériens...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!extractedDoc || !structuredPublication) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun document traité</h3>
            <p className="text-sm text-muted-foreground">
              Uploadez un document pour voir les résultats d'extraction
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { metadata, qualityIndicators } = extractedDoc;
  const totalPages = extractedDoc.ocrResult.totalPages;

  return (
    <div className="space-y-6">
      {/* En-tête avec statut de qualité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Texte Extrait
              {metadata.mixedContent && (
                <Badge variant="outline" className="ml-2">خالوطة</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={qualityLabel === 'excellent' ? 'default' : 
                        qualityLabel === 'good' ? 'secondary' : 'destructive'}
              >
                {qualityLabel === 'excellent' ? 'Excellent' :
                 qualityLabel === 'good' ? 'Bon' :
                 qualityLabel === 'fair' ? 'Correct' : 'Faible'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {qualityIndicators.overallScore}%
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Indicateurs de qualité */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4" />
                OCR
              </div>
              <Progress value={qualityIndicators.ocrConfidence} className="h-2" />
              <span className="text-xs text-muted-foreground">
                {qualityIndicators.ocrConfidence.toFixed(1)}%
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4" />
                Entités
              </div>
              <Progress value={qualityIndicators.entityDetection} className="h-2" />
              <span className="text-xs text-muted-foreground">
                {structuredPublication.entities.length} détectées
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileType className="h-4 w-4" />
                Structure
              </div>
              <Progress value={qualityIndicators.structureRecognition} className="h-2" />
              <span className="text-xs text-muted-foreground">
                {structuredPublication.type}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Languages className="h-4 w-4" />
                Langues
              </div>
              <Progress value={qualityIndicators.languageConsistency} className="h-2" />
              <span className="text-xs text-muted-foreground">
                {metadata.detectedLanguages.join(', ')}
              </span>
            </div>
          </div>

          {/* Avertissements si nécessaire */}
          {metadata.requiresManualReview && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Ce document nécessite une révision manuelle en raison de la qualité d'extraction.
              </span>
            </div>
          )}

          {/* Aperçu du texte */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Aperçu du texte extrait</h4>
              <div className="flex items-center gap-2">
                {totalPages > 1 && !showFullText && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFullText(!showFullText)}
                >
                  {showFullText ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Aperçu
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Voir tout
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Zone de recherche */}
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher dans le texte..."
                className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchResults.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Affichage du texte */}
            <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {showFullText ? (
                  searchTerm ? (
                    <div className="space-y-4">
                      {searchResults.map((result, index) => (
                        <div key={index} className="border-l-2 border-primary pl-3">
                          <div className="text-xs text-muted-foreground mb-1">
                            Position: {result.index}
                          </div>
                          <div>
                            {result.context.substring(0, result.highlight.start)}
                            <mark className="bg-yellow-200 px-1 rounded">
                              {result.context.substring(result.highlight.start, result.highlight.end)}
                            </mark>
                            {result.context.substring(result.highlight.end)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    extractedDoc.extractedText
                  )
                ) : totalPages > 1 ? (
                  extractedDoc.ocrResult.pages[currentPage - 1]?.fullText || 'Page non disponible'
                ) : (
                  textPreview
                )}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Panneau des métadonnées détectées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Métadonnées Détectées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations du document */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Document
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Type:</span>
                  <Badge variant="outline">{structuredPublication.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Titre:</span>
                  <span className="text-sm text-right max-w-48 truncate" title={structuredPublication.title}>
                    {structuredPublication.title}
                  </span>
                </div>
                {structuredPublication.number && (
                  <div className="flex justify-between">
                    <span className="text-sm">Numéro:</span>
                    <span className="text-sm">{structuredPublication.number}</span>
                  </div>
                )}
                {structuredPublication.date && (
                  <div className="flex justify-between">
                    <span className="text-sm">Date:</span>
                    <span className="text-sm">{structuredPublication.date}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm">Institution:</span>
                  <span className="text-sm text-right max-w-48 truncate" title={structuredPublication.institution}>
                    {structuredPublication.institution}
                  </span>
                </div>
              </div>
            </div>

            {/* Informations techniques */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Technique
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Pages:</span>
                  <span className="text-sm">{metadata.totalPages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taille:</span>
                  <span className="text-sm">{(extractedDoc.fileSize / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Temps de traitement:</span>
                  <span className="text-sm">{metadata.processingTime.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Entités détectées:</span>
                  <span className="text-sm">{structuredPublication.entities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Document algérien:</span>
                  {metadata.isAlgerianDocument ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Journal Officiel si détecté */}
          {structuredPublication.joNumber && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-900">Journal Officiel</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Numéro:</span>
                  <span className="ml-2">{structuredPublication.joNumber}</span>
                </div>
                {structuredPublication.joDate && (
                  <div>
                    <span className="text-blue-700">Date:</span>
                    <span className="ml-2">{structuredPublication.joDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}