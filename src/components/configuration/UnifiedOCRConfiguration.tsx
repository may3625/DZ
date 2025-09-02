/**
 * Interface de Configuration OCR Unifiée - Administration
 * 4 onglets consolidés pour la configuration et l'administration du système OCR
 * Fonctionnalités préservées : Workflow d'Alimentation, 🇩🇿 Algorithme d'Extraction, etc.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Database, 
  GitBranch, 
  TrendingUp, 
  Shield,
  Zap,
  Activity,
  FileText,
  Users,
  Server,
  Key,
  Lock,
  RefreshCw,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  Cpu,
  HardDrive,
  Network,
  Clock,
  BarChart3,
  Cog,
  Wrench,
  Monitor
} from "lucide-react";

// Import des composants existants à préserver
import { FixedAdvancedOCRConfigurationSection } from './FixedAdvancedOCRConfigurationSection';
import { PerformanceScalabilitySection } from './PerformanceScalabilitySection';
import { UserManagementSection } from './UserManagementSection';
import { SecuritySection } from './SecuritySection';

interface UnifiedOCRConfigurationProps {
  language?: string;
}

export const UnifiedOCRConfiguration: React.FC<UnifiedOCRConfigurationProps> = ({
  language = "fr"
}) => {
  // États de configuration
  const [activeTab, setActiveTab] = useState('extraction-params');
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [configStatus, setConfigStatus] = useState<'saved' | 'modified' | 'error'>('saved');

  // États des paramètres
  const [extractionParams, setExtractionParams] = useState({
    algorithmType: 'algerian',
    confidenceThreshold: 0.8,
    maxPages: 100,
    enableBilingual: true,
    enableTableDetection: true,
    enableLineDetection: true
  });

  const [workflowParams, setWorkflowParams] = useState({
    autoApproval: false,
    batchProcessing: true,
    maxBatchSize: 50,
    enableNotifications: true,
    approvalTimeout: 24
  });

  const [performanceParams, setPerformanceParams] = useState({
    maxConcurrentJobs: 4,
    memoryLimit: 512,
    cpuLimit: 80,
    enableCaching: true,
    cacheSize: 1000
  });

  const [adminParams, setAdminParams] = useState({
    enableLogging: true,
    logLevel: 'info',
    enableBackup: true,
    backupFrequency: 'daily',
    enableUpdates: true
  });

  // Sauvegarde de la configuration
  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveProgress(0);

    try {
      // Real save would go here
      for (let i = 0; i <= 100; i += 20) {
        setSaveProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setConfigStatus('saved');
      setTimeout(() => setConfigStatus('saved'), 3000);
    } catch (error) {
      setConfigStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Gestion des changements de paramètres
  const handleParamChange = (section: string, param: string, value: any) => {
    switch (section) {
      case 'extraction':
        setExtractionParams(prev => ({ ...prev, [param]: value }));
        break;
      case 'workflow':
        setWorkflowParams(prev => ({ ...prev, [param]: value }));
        break;
      case 'performance':
        setPerformanceParams(prev => ({ ...prev, [param]: value }));
        break;
      case 'admin':
        setAdminParams(prev => ({ ...prev, [param]: value }));
        break;
    }
    setConfigStatus('modified');
  };

  return (
    <div className="space-y-6">
      {/* En-tête principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            Configuration OCR Unifiée
            <Badge variant="outline" className="bg-purple-50">
              ⚙️ Administration & Configuration
            </Badge>
          </CardTitle>
          <CardDescription>
            Interface unifiée pour la configuration et l'administration du système OCR-IA.
            Toutes les fonctionnalités préservées : Workflow d'Alimentation, 🇩🇿 Algorithme d'Extraction, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={configStatus === 'saved' ? 'default' : configStatus === 'modified' ? 'secondary' : 'destructive'}>
                {configStatus === 'saved' ? 'Sauvegardé' : configStatus === 'modified' ? 'Modifié' : 'Erreur'}
              </Badge>
              {configStatus === 'modified' && (
                <span className="text-sm text-orange-600">Configuration non sauvegardée</span>
              )}
            </div>
            <Button 
              onClick={handleSaveConfig} 
              disabled={isSaving || configStatus === 'saved'}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>

          {isSaving && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sauvegarde de la configuration...</span>
                <span>{saveProgress}%</span>
              </div>
              <Progress value={saveProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interface principale avec onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="extraction-params" className="flex items-center gap-2">
            🎛️ Paramètres d'Extraction
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            🔄 Workflow & Processus
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            📈 Performance & Scalabilité
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2">
            🔧 Administration & Maintenance
          </TabsTrigger>
        </TabsList>

        {/* Onglet 1: Paramètres d'Extraction */}
        <TabsContent value="extraction-params" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                🇩🇿 Algorithme d'Extraction - Documents Algériens
              </CardTitle>
              <CardDescription>
                Configuration des paramètres de l'algorithme d'extraction selon les spécificités algériennes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type d'algorithme */}
              <div className="space-y-4">
                <h4 className="font-semibold">Type d'Algorithme</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Algorithme Principal</Label>
                    <select 
                      value={extractionParams.algorithmType}
                      onChange={(e) => handleParamChange('extraction', 'algorithmType', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="algerian">🇩🇿 Algorithme Algérien (Recommandé)</option>
                      <option value="standard">Standard International</option>
                      <option value="hybrid">Hybride (Algérien + Standard)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Seuil de Confiance</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="range" 
                        min="0.1" 
                        max="1.0" 
                        step="0.1"
                        value={extractionParams.confidenceThreshold}
                        onChange={(e) => handleParamChange('extraction', 'confidenceThreshold', parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12">
                        {(extractionParams.confidenceThreshold * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paramètres de traitement */}
              <div className="space-y-4">
                <h4 className="font-semibold">Paramètres de Traitement</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre Maximum de Pages</Label>
                    <Input 
                      type="number"
                      value={extractionParams.maxPages}
                      onChange={(e) => handleParamChange('extraction', 'maxPages', parseInt(e.target.value))}
                      min="1"
                      max="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Détection de Tables</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={extractionParams.enableTableDetection}
                        onCheckedChange={(checked) => handleParamChange('extraction', 'enableTableDetection', checked)}
                      />
                      <Label>{extractionParams.enableTableDetection ? 'Activée' : 'Désactivée'}</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fonctionnalités avancées */}
              <div className="space-y-4">
                <h4 className="font-semibold">Fonctionnalités Avancées</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Support Bilingue (AR/FR)</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={extractionParams.enableBilingual}
                        onCheckedChange={(checked) => handleParamChange('extraction', 'enableBilingual', checked)}
                      />
                      <Label>{extractionParams.enableBilingual ? 'Activé' : 'Désactivé'}</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Détection de Lignes</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={extractionParams.enableLineDetection}
                        onCheckedChange={(checked) => handleParamChange('extraction', 'enableLineDetection', checked)}
                      />
                      <Label>{extractionParams.enableLineDetection ? 'Activée' : 'Désactivée'}</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Composant de configuration avancée existant */}
              <FixedAdvancedOCRConfigurationSection 
                showOCRProcessor={false}
                onShowOCRProcessor={() => {}}
                onFormDataExtracted={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet 2: Workflow & Processus */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-green-600" />
                Workflow d'Alimentation & Processus
              </CardTitle>
              <CardDescription>
                Configuration du workflow de traitement et des processus d'alimentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Traitement automatique */}
              <div className="space-y-4">
                <h4 className="font-semibold">Traitement Automatique</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Approbation Automatique</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={workflowParams.autoApproval}
                        onCheckedChange={(checked) => handleParamChange('workflow', 'autoApproval', checked)}
                      />
                      <Label>{workflowParams.autoApproval ? 'Activée' : 'Désactivée'}</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Traitement par Lot</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={workflowParams.batchProcessing}
                        onCheckedChange={(checked) => handleParamChange('workflow', 'batchProcessing', checked)}
                      />
                      <Label>{workflowParams.batchProcessing ? 'Activé' : 'Désactivé'}</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paramètres de lot */}
              <div className="space-y-4">
                <h4 className="font-semibold">Paramètres de Traitement par Lot</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Taille Maximum du Lot</Label>
                    <Input 
                      type="number"
                      value={workflowParams.maxBatchSize}
                      onChange={(e) => handleParamChange('workflow', 'maxBatchSize', parseInt(e.target.value))}
                      min="1"
                      max="200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timeout d'Approbation (heures)</Label>
                    <Input 
                      type="number"
                      value={workflowParams.approvalTimeout}
                      onChange={(e) => handleParamChange('workflow', 'approvalTimeout', parseInt(e.target.value))}
                      min="1"
                      max="168"
                    />
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-4">
                <h4 className="font-semibold">Notifications</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={workflowParams.enableNotifications}
                      onCheckedChange={(checked) => handleParamChange('workflow', 'enableNotifications', checked)}
                    />
                    <Label>Activer les notifications</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet 3: Performance & Scalabilité */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Performance & Scalabilité
              </CardTitle>
              <CardDescription>
                Configuration des performances et de la scalabilité du système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Limites système */}
              <div className="space-y-4">
                <h4 className="font-semibold">Limites Système</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jobs Concurrents Maximum</Label>
                    <Input 
                      type="number"
                      value={performanceParams.maxConcurrentJobs}
                      onChange={(e) => handleParamChange('performance', 'maxConcurrentJobs', parseInt(e.target.value))}
                      min="1"
                      max="16"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Limite Mémoire (MB)</Label>
                    <Input 
                      type="number"
                      value={performanceParams.memoryLimit}
                      onChange={(e) => handleParamChange('performance', 'memoryLimit', parseInt(e.target.value))}
                      min="128"
                      max="4096"
                    />
                  </div>
                </div>
              </div>

              {/* Cache et optimisation */}
              <div className="space-y-4">
                <h4 className="font-semibold">Cache & Optimisation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Activer le Cache</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={performanceParams.enableCaching}
                        onCheckedChange={(checked) => handleParamChange('performance', 'enableCaching', checked)}
                      />
                      <Label>{performanceParams.enableCaching ? 'Activé' : 'Désactivé'}</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Taille du Cache</Label>
                    <Input 
                      type="number"
                      value={performanceParams.cacheSize}
                      onChange={(e) => handleParamChange('performance', 'cacheSize', parseInt(e.target.value))}
                      min="100"
                      max="10000"
                    />
                  </div>
                </div>
              </div>

              {/* Composant de performance existant */}
              <PerformanceScalabilitySection language={language} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet 4: Administration & Maintenance */}
        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Administration & Maintenance
              </CardTitle>
              <CardDescription>
                Gestion des utilisateurs, sécurité et maintenance du système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logs et monitoring */}
              <div className="space-y-4">
                <h4 className="font-semibold">Logs & Monitoring</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Activer les Logs</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={adminParams.enableLogging}
                        onCheckedChange={(checked) => handleParamChange('admin', 'enableLogging', checked)}
                      />
                      <Label>{adminParams.enableLogging ? 'Activés' : 'Désactivés'}</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Niveau de Log</Label>
                    <select 
                      value={adminParams.logLevel}
                      onChange={(e) => handleParamChange('admin', 'logLevel', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="debug">Debug</option>
                      <option value="info">Info</option>
                      <option value="warn">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sauvegarde et mises à jour */}
              <div className="space-y-4">
                <h4 className="font-semibold">Sauvegarde & Mises à Jour</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Activer la Sauvegarde</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={adminParams.enableBackup}
                        onCheckedChange={(checked) => handleParamChange('admin', 'enableBackup', checked)}
                      />
                      <Label>{adminParams.enableBackup ? 'Activée' : 'Désactivée'}</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Fréquence de Sauvegarde</Label>
                    <select 
                      value={adminParams.backupFrequency}
                      onChange={(e) => handleParamChange('admin', 'backupFrequency', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="hourly">Toutes les heures</option>
                      <option value="daily">Quotidienne</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="monthly">Mensuelle</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Composants d'administration existants */}
              <UserManagementSection language={language} />
              <SecuritySection language={language} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};