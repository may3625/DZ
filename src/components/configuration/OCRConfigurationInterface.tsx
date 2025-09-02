/**
 * Interface de configuration OCR - Paramètres d'extraction avancés
 * Complète le plan d'action OCR unifié - Menu OCR + IA
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Zap, 
  Image, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Download,
  Upload
} from 'lucide-react';
import { ocrConfigurationService, OCRConfiguration } from '@/services/ocrConfigurationService';
import { toast } from 'sonner';

export function OCRConfigurationInterface() {
  const [config, setConfig] = useState<OCRConfiguration>(ocrConfigurationService.getConfiguration());
  const [hasChanges, setHasChanges] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    // Charger les recommandations au démarrage
    setRecommendations(ocrConfigurationService.getOptimizationRecommendations());
  }, []);

  useEffect(() => {
    // Valider la configuration à chaque changement
    const validation = ocrConfigurationService.validateConfiguration(config);
    setValidationResult(validation);
  }, [config]);

  const handleConfigChange = (section: keyof OCRConfiguration, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveConfiguration = () => {
    if (!validationResult.valid) {
      toast.error('Configuration invalide - veuillez corriger les erreurs');
      return;
    }

    ocrConfigurationService.updateConfiguration(config);
    setHasChanges(false);
    setRecommendations(ocrConfigurationService.getOptimizationRecommendations());
    toast.success('Configuration sauvegardée avec succès');
  };

  const handleResetToDefault = () => {
    ocrConfigurationService.resetToDefault();
    setConfig(ocrConfigurationService.getConfiguration());
    setHasChanges(false);
    toast.info('Configuration réinitialisée');
  };

  const handleLoadPreset = (preset: string) => {
    let newConfig: OCRConfiguration;
    
    switch (preset) {
      case 'fast':
        newConfig = ocrConfigurationService.getFastProcessingConfig();
        break;
      case 'quality':
        newConfig = ocrConfigurationService.getLowQualityConfig();
        break;
      case 'loi':
        newConfig = ocrConfigurationService.getOptimizedConfigForDocumentType('loi');
        break;
      case 'formulaire':
        newConfig = ocrConfigurationService.getOptimizedConfigForDocumentType('formulaire');
        break;
      default:
        return;
    }
    
    setConfig(newConfig);
    setHasChanges(true);
    toast.info(`Configuration ${preset} chargée`);
  };

  const exportConfiguration = () => {
    const configBlob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(configBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ocr-configuration.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Configuration exportée');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header avec actions principales */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Configuration OCR Avancée
          </h2>
          <p className="text-gray-600 mt-1">
            Paramètres d'extraction pour documents algériens
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportConfiguration}
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleResetToDefault}
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Défaut
          </Button>
          
          <Button 
            onClick={handleSaveConfiguration}
            disabled={!hasChanges || !validationResult.valid}
            size="sm"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Alertes de validation */}
      {!validationResult.valid && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Configuration invalide :</div>
            <ul className="list-disc list-inside space-y-1">
              {validationResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Recommandations */}
      {recommendations.length > 0 && (
        <Alert>
          <CheckCircle className="w-4 h-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Recommandations d'optimisation :</div>
            <ul className="list-disc list-inside space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Presets rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Configurations Prédéfinies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleLoadPreset('fast')}
              className="h-auto p-4 flex-col"
            >
              <Zap className="w-6 h-6 mb-2" />
              <span className="font-medium">Rapide</span>
              <span className="text-xs text-gray-500">Traitement accéléré</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleLoadPreset('quality')}
              className="h-auto p-4 flex-col"
            >
              <Image className="w-6 h-6 mb-2" />
              <span className="font-medium">Qualité</span>
              <span className="text-xs text-gray-500">Documents difficiles</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleLoadPreset('loi')}
              className="h-auto p-4 flex-col"
            >
              <FileText className="w-6 h-6 mb-2" />
              <span className="font-medium">Lois</span>
              <span className="text-xs text-gray-500">Textes juridiques</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleLoadPreset('formulaire')}
              className="h-auto p-4 flex-col"
            >
              <Settings className="w-6 h-6 mb-2" />
              <span className="font-medium">Formulaires</span>
              <span className="text-xs text-gray-500">Documents structurés</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration détaillée */}
      <Tabs defaultValue="extraction" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="extraction">Extraction</TabsTrigger>
          <TabsTrigger value="algerian">Algérien</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="quality">Qualité</TabsTrigger>
        </TabsList>

        {/* Onglet Extraction */}
        <TabsContent value="extraction">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres d'Extraction OCR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Langue</Label>
                  <Select
                    value={config.extraction.language}
                    onValueChange={(value) => handleConfigChange('extraction', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ara">Arabe uniquement</SelectItem>
                      <SelectItem value="fra">Français uniquement</SelectItem>
                      <SelectItem value="ara+fra">Arabe + Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>DPI</Label>
                  <Input
                    type="number"
                    value={config.extraction.dpi}
                    onChange={(e) => handleConfigChange('extraction', 'dpi', parseInt(e.target.value))}
                    min="72"
                    max="600"
                  />
                </div>

                <div>
                  <Label>Mode de Segmentation (PSM)</Label>
                  <Select
                    value={config.extraction.psm.toString()}
                    onValueChange={(value) => handleConfigChange('extraction', 'psm', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Page automatique</SelectItem>
                      <SelectItem value="6">Bloc uniforme</SelectItem>
                      <SelectItem value="7">Ligne de texte</SelectItem>
                      <SelectItem value="8">Mot unique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Moteur OCR (OEM)</Label>
                  <Select
                    value={config.extraction.oem.toString()}
                    onValueChange={(value) => handleConfigChange('extraction', 'oem', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Legacy only</SelectItem>
                      <SelectItem value="1">Neural nets LSTM only</SelectItem>
                      <SelectItem value="2">Legacy + LSTM</SelectItem>
                      <SelectItem value="3">Par défaut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.extraction.enablePreprocessing}
                  onCheckedChange={(checked) => handleConfigChange('extraction', 'enablePreprocessing', checked)}
                />
                <Label>Activer le prétraitement d'image</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Spécificités Algériennes */}
        <TabsContent value="algerian">
          <Card>
            <CardHeader>
              <CardTitle>Spécificités des Documents Algériens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.algerian.detectMixedLanguage}
                    onCheckedChange={(checked) => handleConfigChange('algerian', 'detectMixedLanguage', checked)}
                  />
                  <Label>Détecter les langues mixtes</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.algerian.enhanceArabicText}
                    onCheckedChange={(checked) => handleConfigChange('algerian', 'enhanceArabicText', checked)}
                  />
                  <Label>Améliorer le texte arabe</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.algerian.detectOfficialFormats}
                    onCheckedChange={(checked) => handleConfigChange('algerian', 'detectOfficialFormats', checked)}
                  />
                  <Label>Détecter les formats officiels</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.algerian.documentTypeDetection}
                    onCheckedChange={(checked) => handleConfigChange('algerian', 'documentTypeDetection', checked)}
                  />
                  <Label>Détection automatique du type de document</Label>
                </div>
              </div>

              <div>
                <Label>Formats de date supportés</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.algerian.extractDateFormats.map((format, index) => (
                    <Badge key={index} variant="secondary">
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Performance */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Taille max fichier (MB)</Label>
                  <Input
                    type="number"
                    value={config.performance.maxFileSize}
                    onChange={(e) => handleConfigChange('performance', 'maxFileSize', parseInt(e.target.value))}
                    min="1"
                    max="200"
                  />
                </div>

                <div>
                  <Label>Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={config.performance.timeoutMs}
                    onChange={(e) => handleConfigChange('performance', 'timeoutMs', parseInt(e.target.value))}
                    min="10000"
                    max="300000"
                  />
                </div>

                <div>
                  <Label>Limite mémoire (MB)</Label>
                  <Input
                    type="number"
                    value={config.performance.memoryLimit}
                    onChange={(e) => handleConfigChange('performance', 'memoryLimit', parseInt(e.target.value))}
                    min="256"
                    max="2048"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.performance.parallel}
                    onCheckedChange={(checked) => handleConfigChange('performance', 'parallel', checked)}
                  />
                  <Label>Traitement parallèle</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.performance.enableGPU}
                    onCheckedChange={(checked) => handleConfigChange('performance', 'enableGPU', checked)}
                  />
                  <Label>Accélération GPU (expérimental)</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Qualité */}
        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de Qualité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Confiance minimum</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={config.quality.minConfidence}
                    onChange={(e) => handleConfigChange('quality', 'minConfidence', parseFloat(e.target.value))}
                  />
                </div>

                <div>
                  <Label>Niveau de débruitage</Label>
                  <Select
                    value={config.quality.denoiseLevel.toString()}
                    onValueChange={(value) => handleConfigChange('quality', 'denoiseLevel', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Aucun</SelectItem>
                      <SelectItem value="1">Léger</SelectItem>
                      <SelectItem value="2">Modéré</SelectItem>
                      <SelectItem value="3">Fort</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Ajustement contraste</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="3"
                    value={config.quality.contrastAdjustment}
                    onChange={(e) => handleConfigChange('quality', 'contrastAdjustment', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.quality.autoRetryLowConfidence}
                    onCheckedChange={(checked) => handleConfigChange('quality', 'autoRetryLowConfidence', checked)}
                  />
                  <Label>Recommencer automatiquement si confiance faible</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.quality.enhanceImages}
                    onCheckedChange={(checked) => handleConfigChange('quality', 'enhanceImages', checked)}
                  />
                  <Label>Améliorer automatiquement les images</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}