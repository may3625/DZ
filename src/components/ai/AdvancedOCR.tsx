import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Upload, 
  Download, 
  Brain, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Languages, 
  Eye, 
  Edit, 
  Share2, 
  Play,
  FileImage,
  Copy,
  Users,
  Lightbulb
} from 'lucide-react';

export function AdvancedOCR() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('algerian-legal-v2');

  // Modèles OCR disponibles
  const availableModels = [
    {
      id: 'algerian-legal-v2',
      name: 'Modèle Juridique Algérien v2.0',
      description: 'Spécialisé dans les textes juridiques algériens',
      accuracy: 98.5,
      speed: 95,
      languages: ['fr', 'ar', 'en'],
      status: 'active'
    },
    {
      id: 'general-legal-v1',
      name: 'Modèle Juridique Général v1.0',
      description: 'Modèle général pour documents juridiques',
      accuracy: 96.2,
      speed: 90,
      languages: ['fr', 'en', 'es', 'de'],
      status: 'active'
    }
  ];

  const handleFileUpload = useCallback((files) => {
    if (!files) return;
    console.log('Fichiers uploadés:', files);
  }, []);

  const processDocument = useCallback(async (documentId) => {
    setIsProcessing(true);
    console.log('Traitement du document:', documentId);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsProcessing(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Documents Traités</p>
              <p className="text-2xl font-bold mt-2 text-blue-600">0</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Taux de Réussite</p>
              <p className="text-2xl font-bold mt-2 text-green-600">0%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Confiance Moyenne</p>
              <p className="text-2xl font-bold mt-2 text-purple-600">0%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Temps Moyen</p>
              <p className="text-2xl font-bold mt-2 text-orange-600">0s</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration et Upload */}
        <div className="lg:col-span-1 space-y-6">
          {/* Sélection du modèle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Modèle OCR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un modèle" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <span>{model.name}</span>
                        <Badge variant={model.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {model.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedModel && (
                <div className="space-y-3">
                  {availableModels.find(m => m.id === selectedModel) && (
                    <>
                      <div className="text-sm">
                        <p className="font-medium">Précision: {availableModels.find(m => m.id === selectedModel)?.accuracy}%</p>
                        <p className="text-gray-600">Vitesse: {availableModels.find(m => m.id === selectedModel)?.speed}%</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Langues supportées:</p>
                        <div className="flex flex-wrap gap-1">
                          {availableModels.find(m => m.id === selectedModel)?.languages.map(lang => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload de fichiers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload de Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  Glissez-déposez vos documents ou cliquez pour sélectionner
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Sélectionner des fichiers
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, PNG, JPG, TIFF, BMP (max 50MB par fichier)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Zone de résultats */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Zone de Traitement OCR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Prêt pour le traitement OCR avancé</p>
                <p className="text-sm">Sélectionnez un modèle et uploadez des documents</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
