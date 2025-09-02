import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Settings, 
  FileText, 
  Database, 
  AlertTriangle,
  CheckCircle,
  Info,
  Cpu,
  HardDrive,
  Network,
  Activity,
  Clock,
  Shield
} from 'lucide-react';

interface AdvancedOCRConfigurationSectionProps {
  showOCRProcessor?: boolean;
  onShowOCRProcessor?: (show: boolean) => void;
  onFormDataExtracted?: (data: { documentType: 'legal' | 'procedure', formData: Record<string, any> }) => void;
}

export function FixedAdvancedOCRConfigurationSection({
  showOCRProcessor = false,
  onShowOCRProcessor,
  onFormDataExtracted
}: AdvancedOCRConfigurationSectionProps) {
  const [activeTab, setActiveTab] = useState("extraction");

  const [config, setConfig] = useState({
    enableAdvancedNLP: true,
    enableEntityExtraction: true,
    enableAutoMapping: true,
    batchProcessing: false,
    realTimeValidation: true,
    enableLogging: true
  });

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const systemStatus = {
    tesseractJS: 'Opérationnel',
    nlpModels: 'Chargés',
    mappingEngine: 'Actif',
    qualityMonitor: 'Surveillance',
    algerianTemplates: 'Chargés',
    nomenclatureDB: 'Connectée'
  };

  try {
    return (
      <div className="space-y-6">
        {/* Tableau de bord OCR Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Tableau de Bord Configuration OCR
            </CardTitle>
            <CardDescription>
              Vue d'ensemble des performances et statistiques OCR
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700">1,247</p>
                    <p className="text-sm text-green-600">Documents traités</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">2.3s</p>
                    <p className="text-sm text-blue-600">Temps moyen</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-700">94.2%</p>
                    <p className="text-sm text-purple-600">Précision</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-700">12</p>
                    <p className="text-sm text-amber-600">En attente</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Performance par Type</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Textes Juridiques</span>
                    <div className="flex items-center gap-2">
                      <Progress value={96} className="w-24 h-2" />
                      <span className="text-sm font-medium">96%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Procédures Admin.</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-24 h-2" />
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Documents Mixtes</span>
                    <div className="flex items-center gap-2">
                      <Progress value={88} className="w-24 h-2" />
                      <span className="text-sm font-medium">88%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Statut des Services</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">TensorFlow.js</span>
                    <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">PDF.js Engine</span>
                    <Badge className="bg-green-100 text-green-800">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">NLP Models</span>
                    <Badge className="bg-green-100 text-green-800">Chargés</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration avec onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="extraction">Extraction</TabsTrigger>
            <TabsTrigger value="nlp">NLP & IA</TabsTrigger>
            <TabsTrigger value="mapping">Mapping</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="extraction" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Configuration d'Extraction PDF.js
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Mode haute résolution</label>
                    <p className="text-sm text-gray-600">Extraction avec qualité maximale pour OCR</p>
                  </div>
                  <Switch 
                    checked={config.enableAdvancedNLP}
                    onCheckedChange={(checked) => handleConfigChange('enableAdvancedNLP', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Détection automatique de langue</label>
                    <p className="text-sm text-gray-600">Français et Arabe pour documents algériens</p>
                  </div>
                  <Switch 
                    checked={true}
                    disabled
                  />
                </div>

                <div className="bg-blue-50 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Configuration Optimisée</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    PDF.js configuré spécialement pour les documents officiels algériens
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nlp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Modèles NLP et Intelligence Artificielle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Extraction d'entités juridiques</label>
                    <p className="text-sm text-gray-600">Numéros, dates, références légales</p>
                  </div>
                  <Switch 
                    checked={config.enableEntityExtraction}
                    onCheckedChange={(checked) => handleConfigChange('enableEntityExtraction', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Analyse des relations</label>
                    <p className="text-sm text-gray-600">Détection des 7 types de relations juridiques</p>
                  </div>
                  <Switch 
                    checked={true}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Modèles Chargés</span>
                    </div>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Entités juridiques algériennes</li>
                      <li>• Relations hiérarchiques</li>
                      <li>• Nomenclatures officielles</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Templates DZ</span>
                    </div>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Décret Exécutif</li>
                      <li>• Arrêté Ministériel</li>
                      <li>• Loi et Ordonnance</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mapping" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Mapping Automatique vers Formulaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Mapping automatique</label>
                    <p className="text-sm text-gray-600">Correspondance vers formulaires structurés</p>
                  </div>
                  <Switch 
                    checked={config.enableAutoMapping}
                    onCheckedChange={(checked) => handleConfigChange('enableAutoMapping', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Validation en temps réel</label>
                    <p className="text-sm text-gray-600">Vérification immédiate des données extraites</p>
                  </div>
                  <Switch 
                    checked={config.realTimeValidation}
                    onCheckedChange={(checked) => handleConfigChange('realTimeValidation', checked)}
                  />
                </div>

                <div className="bg-yellow-50 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Qualité du Mapping</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-yellow-700">Précision moyenne: </span>
                      <span className="font-semibold text-yellow-800">94.8%</span>
                    </div>
                    <div>
                      <span className="text-yellow-700">Templates actifs: </span>
                      <span className="font-semibold text-yellow-800">4/4</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Performance et Ressources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">CPU</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">12%</div>
                    <div className="text-sm text-gray-600">Utilisation moyenne</div>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Mémoire</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">245MB</div>
                    <div className="text-sm text-gray-600">Modèles chargés</div>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Network className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Réseau</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">Local</div>
                    <div className="text-sm text-gray-600">Aucune connexion requise</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Traitement par lot</label>
                    <p className="text-sm text-gray-600">Traitement simultané de plusieurs documents</p>
                  </div>
                  <Switch 
                    checked={config.batchProcessing}
                    onCheckedChange={(checked) => handleConfigChange('batchProcessing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Logs détaillés</label>
                    <p className="text-sm text-gray-600">Enregistrement des opérations pour débogage</p>
                  </div>
                  <Switch 
                    checked={config.enableLogging}
                    onCheckedChange={(checked) => handleConfigChange('enableLogging', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Statut des services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Statut des Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(systemStatus).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium capitalize">
                    {service.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Badge className="bg-green-100 text-green-800">
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Erreur dans FixedAdvancedOCRConfigurationSection:', error);
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h3 className="font-semibold text-red-800">❌ Erreur de Rendu</h3>
          <p className="text-red-700">
            Une erreur s'est produite lors du chargement de la configuration OCR avancée.
          </p>
          <pre className="text-xs text-red-600 mt-2">
            {error?.toString()}
          </pre>
        </div>
      </div>
    );
  }
}

export default FixedAdvancedOCRConfigurationSection;