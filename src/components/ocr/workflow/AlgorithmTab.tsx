import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  FileText, 
  Languages,
  Camera,
  Cpu,
  Settings
} from 'lucide-react';
import { AlgerianExtractionResult } from '@/services/enhanced/algerianDocumentExtractionService';

interface AlgorithmTabProps {
  extractedDocument: AlgerianExtractionResult | null;
}

export function AlgorithmTab({ extractedDocument }: AlgorithmTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Algorithmes d'Extraction OCR
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* Algorithme de détection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Détection d'Images
              </CardTitle>
              <CardDescription>
                Préprocessing et analyse des régions de texte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tessseract.js Engine</span>
                  <Badge variant="outline">Actif</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Préprocessing</span>
                  <Progress value={95} className="w-20 h-2" />
                </div>
                <div className="text-xs text-gray-600">
                  Optimisé pour documents juridiques algériens
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Algorithme de reconnaissance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Reconnaissance Linguistique
              </CardTitle>
              <CardDescription>
                Détection français/arabe et traitement bilingue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Modèle FR+AR</span>
                  <Badge variant="outline">Chargé</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Précision</span>
                  <Progress value={extractedDocument?.averageConfidence ? extractedDocument.averageConfidence * 100 : 0} className="w-20 h-2" />
                </div>
                <div className="text-xs text-gray-600">
                  Confiance: {extractedDocument ? Math.round((extractedDocument.averageConfidence || 0) * 100) : 0}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Performance
              </CardTitle>
              <CardDescription>
                Métriques de traitement en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Temps de traitement</span>
                  <Badge variant="secondary">
                    {extractedDocument?.processingTime ? `${Math.round(extractedDocument.processingTime / 1000)}s` : 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mode</span>
                  <Badge variant="outline">100% Local</Badge>
                </div>
                <div className="text-xs text-gray-600">
                  Aucune donnée envoyée sur Internet
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuration Active
              </CardTitle>
              <CardDescription>
                Paramètres d'optimisation appliqués
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">PSM Mode</span>
                  <Badge variant="outline">SINGLE_BLOCK</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Caractères autorisés</span>
                  <Badge variant="outline">FR+AR Extended</Badge>
                </div>
                <div className="text-xs text-gray-600">
                  Optimisé pour textes juridiques
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Détails techniques */}
      {extractedDocument && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Détails de l'Analyse
            </CardTitle>
            <CardDescription>
              Informations détaillées sur le traitement effectué
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm font-medium">Pages analysées</div>
                <div className="text-lg">{extractedDocument.totalPages}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Langues détectées</div>
                <div className="text-lg">{extractedDocument.metadata.detectedLanguages.join(', ')}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Type de document</div>
                <div className="text-lg capitalize">{extractedDocument.metadata.documentType}</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Qualité d'extraction</div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex justify-between">
                  <span className="text-sm">Clarté du texte</span>
                  <Progress value={(extractedDocument.metadata.extractionQuality?.textClarity || 0) * 100} className="w-16 h-2" />
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Détection structure</span>
                  <Progress value={(extractedDocument.metadata.extractionQuality?.structureDetection || 0) * 100} className="w-16 h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}