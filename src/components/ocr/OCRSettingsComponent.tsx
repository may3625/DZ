// @ts-nocheck
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { 
  Settings, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Sliders,
  Database,
  Shield,
  Zap,
  Globe,
  Users,
  Target,
  Layers,
  Grid3X3,
  Type,
  Table,
  Image,
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Download,
  Upload,
  FileText,
  Camera,
  Scan,
  FileImage,
  File,
  Search,
  X,
  Info,
  HelpCircle,
  GitBranch,
  Database as DatabaseIcon,
  GitBranch as GitBranchIcon
} from 'lucide-react';

interface OCRSettings {
  general: {
    defaultLanguage: string;
    confidenceThreshold: number;
    processingTimeout: number;
    maxFileSize: number;
    enableBatchProcessing: boolean;
    autoApprovalThreshold: number;
  };
  ocr: {
    tesseractMode: string;
    imagePreprocessing: boolean;
    dpiThreshold: number;
    noiseReduction: boolean;
    textOrientation: boolean;
  };
  ai: {
    entityDetectionEnabled: boolean;
    intelligentMappingEnabled: boolean;
    confidenceBoostEnabled: boolean;
    learningModeEnabled: boolean;
  };
  workflow: {
    autoAssignment: boolean;
    notificationEnabled: boolean;
    escalationTimeout: number;
    requireDoubleValidation: boolean;
  };
  security: {
    dataEncryption: boolean;
    auditLogging: boolean;
    accessControl: boolean;
    dataRetentionDays: number;
  };
  algorithm: {
    // Configuration de l'algorithme d'extraction selon l'annexe
    enableAlgerianAlgorithm: boolean;
    lineDetectionConfig: {
      minLineLength: number;
      maxLineGap: number;
      threshold: number;
      dilationKernel: number;
      erosionKernel: number;
    };
    borderRemovalConfig: {
      topLines: number;
      bottomLines: number;
      sideLines: number;
      tolerance: number;
    };
    tableDetectionConfig: {
      minTableWidth: number;
      minTableHeight: number;
      cellPadding: number;
      implicitRowThreshold: number;
    };
    regexProcessingConfig: {
      enableHijriDates: boolean;
      enableGregorianDates: boolean;
      enableArabicText: boolean;
      enableFrenchText: boolean;
      confidenceThreshold: number;
    };
    mappingConfig: {
      enableAlgerianNomenclature: boolean;
      enableIntelligentMapping: boolean;
      enableSuggestions: boolean;
      confidenceThreshold: number;
    };
    approvalConfig: {
      enableAutoApproval: boolean;
      enableBatchProcessing: boolean;
      enableLearningMode: boolean;
      escalationTimeout: number;
    };
  };
}

const OCRSettingsComponent: React.FC = () => {
  const [settings, setSettings] = useState<OCRSettings>({
    general: {
      defaultLanguage: 'mixed',
      confidenceThreshold: 85,
      processingTimeout: 30,
      maxFileSize: 50,
      enableBatchProcessing: true,
      autoApprovalThreshold: 95
    },
    ocr: {
      tesseractMode: 'PSM_AUTO',
      imagePreprocessing: true,
      dpiThreshold: 300,
      noiseReduction: true,
      textOrientation: true
    },
    ai: {
      entityDetectionEnabled: true,
      intelligentMappingEnabled: true,
      confidenceBoostEnabled: true,
      learningModeEnabled: false
    },
    workflow: {
      autoAssignment: true,
      notificationEnabled: true,
      escalationTimeout: 48,
      requireDoubleValidation: false
    },
    security: {
      dataEncryption: true,
      auditLogging: true,
      accessControl: true,
      dataRetentionDays: 365
    },
    algorithm: {
      enableAlgerianAlgorithm: true,
      lineDetectionConfig: {
        minLineLength: 50,
        maxLineGap: 5,
        threshold: 100,
        dilationKernel: 3,
        erosionKernel: 2
      },
      borderRemovalConfig: {
        topLines: 3,
        bottomLines: 2,
        sideLines: 2,
        tolerance: 10
      },
      tableDetectionConfig: {
        minTableWidth: 100,
        minTableHeight: 50,
        cellPadding: 5,
        implicitRowThreshold: 0.8
      },
      regexProcessingConfig: {
        enableHijriDates: true,
        enableGregorianDates: true,
        enableArabicText: true,
        enableFrenchText: true,
        confidenceThreshold: 0.8
      },
      mappingConfig: {
        enableAlgerianNomenclature: true,
        enableIntelligentMapping: true,
        enableSuggestions: true,
        confidenceThreshold: 0.7
      },
      approvalConfig: {
        enableAutoApproval: false,
        enableBatchProcessing: true,
        enableLearningMode: true,
        escalationTimeout: 48
      }
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('general');

  const updateSetting = (section: keyof OCRSettings, key: string, value: Record<string, unknown>) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const updateAlgorithmSetting = (subsection: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      algorithm: {
        ...prev.algorithm,
        [subsection]: {
          ...prev.algorithm[subsection as keyof typeof prev.algorithm],
          [key]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setHasChanges(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      general: {
        defaultLanguage: 'mixed',
        confidenceThreshold: 85,
        processingTimeout: 30,
        maxFileSize: 50,
        enableBatchProcessing: true,
        autoApprovalThreshold: 95
      },
      ocr: {
        tesseractMode: 'PSM_AUTO',
        imagePreprocessing: true,
        dpiThreshold: 300,
        noiseReduction: true,
        textOrientation: true
      },
      ai: {
        entityDetectionEnabled: true,
        intelligentMappingEnabled: true,
        confidenceBoostEnabled: true,
        learningModeEnabled: false
      },
      workflow: {
        autoAssignment: true,
        notificationEnabled: true,
        escalationTimeout: 48,
        requireDoubleValidation: false
      },
      security: {
        dataEncryption: true,
        auditLogging: true,
        accessControl: true,
        dataRetentionDays: 365
      },
      algorithm: {
        enableAlgerianAlgorithm: true,
        lineDetectionConfig: {
          minLineLength: 50,
          maxLineGap: 5,
          threshold: 100,
          dilationKernel: 3,
          erosionKernel: 2
        },
        borderRemovalConfig: {
          topLines: 3,
          bottomLines: 2,
          sideLines: 2,
          tolerance: 10
        },
        tableDetectionConfig: {
          minTableWidth: 100,
          minTableHeight: 50,
          cellPadding: 5,
          implicitRowThreshold: 0.8
        },
        regexProcessingConfig: {
          enableHijriDates: true,
          enableGregorianDates: true,
          enableArabicText: true,
          enableFrenchText: true,
          confidenceThreshold: 0.8
        },
        mappingConfig: {
          enableAlgerianNomenclature: true,
          enableIntelligentMapping: true,
          enableSuggestions: true,
          confidenceThreshold: 0.7
        },
        approvalConfig: {
          enableAutoApproval: false,
          enableBatchProcessing: true,
          enableLearningMode: true,
          escalationTimeout: 48
        }
      }
    });
    setHasChanges(true);
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return 'Sauvegarde...';
      case 'saved': return 'Sauvegardé !';
      case 'error': return 'Erreur !';
      default: return 'Sauvegarder';
    }
  };

  const getSaveButtonIcon = () => {
    switch (saveStatus) {
      case 'saving': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'saved': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Save className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Configuration OCR"
        description="Paramètres de l'OCR et de l'algorithme d'extraction algérien"
        icon={<Settings className="h-6 w-6" />}
      />

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            onClick={saveSettings}
            disabled={saveStatus === 'saving' || !hasChanges}
            className="flex items-center gap-2"
          >
            {getSaveButtonIcon()}
            {getSaveButtonText()}
          </Button>
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={saveStatus === 'saving'}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="ocr">OCR</TabsTrigger>
          <TabsTrigger value="ai">IA</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="algorithm">Algorithme d'Extraction</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Paramètres Généraux
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Langue par défaut</label>
                  <select
                    value={settings.general.defaultLanguage}
                    onChange={(e) => updateSetting('general', 'defaultLanguage', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="mixed">Mixte (AR/FR)</option>
                    <option value="ar">Arabe</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Seuil de confiance (%)</label>
                  <Input
                    type="number"
                    value={settings.general.confidenceThreshold}
                    onChange={(e) => updateSetting('general', 'confidenceThreshold', parseInt(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Timeout de traitement (s)</label>
                  <Input
                    type="number"
                    value={settings.general.processingTimeout}
                    onChange={(e) => updateSetting('general', 'processingTimeout', parseInt(e.target.value))}
                    min="10"
                    max="300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Taille max fichier (MB)</label>
                  <Input
                    type="number"
                    value={settings.general.maxFileSize}
                    onChange={(e) => updateSetting('general', 'maxFileSize', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ocr" className="space-y-4">
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Configuration OCR
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mode Tesseract</label>
                  <select
                    value={settings.ocr.tesseractMode}
                    onChange={(e) => updateSetting('ocr', 'tesseractMode', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="PSM_AUTO">Auto</option>
                    <option value="PSM_SINGLE_BLOCK">Bloc unique</option>
                    <option value="PSM_SINGLE_LINE">Ligne unique</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Seuil DPI</label>
                  <Input
                    type="number"
                    value={settings.ocr.dpiThreshold}
                    onChange={(e) => updateSetting('ocr', 'dpiThreshold', parseInt(e.target.value))}
                    min="72"
                    max="600"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.ocr.imagePreprocessing}
                    onChange={(e) => updateSetting('ocr', 'imagePreprocessing', e.target.checked)}
                  />
                  <span className="text-sm">Prétraitement d'image</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.ocr.noiseReduction}
                    onChange={(e) => updateSetting('ocr', 'noiseReduction', e.target.checked)}
                  />
                  <span className="text-sm">Réduction du bruit</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.ocr.textOrientation}
                    onChange={(e) => updateSetting('ocr', 'textOrientation', e.target.checked)}
                  />
                  <span className="text-sm">Détection d'orientation</span>
                </label>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Intelligence Artificielle
              </h3>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.ai.entityDetectionEnabled}
                    onChange={(e) => updateSetting('ai', 'entityDetectionEnabled', e.target.checked)}
                  />
                  <span className="text-sm">Détection d'entités</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.ai.intelligentMappingEnabled}
                    onChange={(e) => updateSetting('ai', 'intelligentMappingEnabled', e.target.checked)}
                  />
                  <span className="text-sm">Mapping intelligent</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.ai.confidenceBoostEnabled}
                    onChange={(e) => updateSetting('ai', 'confidenceBoostEnabled', e.target.checked)}
                  />
                  <span className="text-sm">Boost de confiance</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.ai.learningModeEnabled}
                    onChange={(e) => updateSetting('ai', 'learningModeEnabled', e.target.checked)}
                  />
                  <span className="text-sm">Mode apprentissage</span>
                </label>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Workflow d'Approbation
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Timeout d'escalade (h)</label>
                  <Input
                    type="number"
                    value={settings.workflow.escalationTimeout}
                    onChange={(e) => updateSetting('workflow', 'escalationTimeout', parseInt(e.target.value))}
                    min="1"
                    max="168"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.workflow.autoAssignment}
                    onChange={(e) => updateSetting('workflow', 'autoAssignment', e.target.checked)}
                  />
                  <span className="text-sm">Assignation automatique</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.workflow.notificationEnabled}
                    onChange={(e) => updateSetting('workflow', 'notificationEnabled', e.target.checked)}
                  />
                  <span className="text-sm">Notifications activées</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.workflow.requireDoubleValidation}
                    onChange={(e) => updateSetting('workflow', 'requireDoubleValidation', e.target.checked)}
                  />
                  <span className="text-sm">Validation double requise</span>
                </label>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rétention des données (jours)</label>
                  <Input
                    type="number"
                    value={settings.security.dataRetentionDays}
                    onChange={(e) => updateSetting('security', 'dataRetentionDays', parseInt(e.target.value))}
                    min="1"
                    max="3650"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.security.dataEncryption}
                    onChange={(e) => updateSetting('security', 'dataEncryption', e.target.checked)}
                  />
                  <span className="text-sm">Chiffrement des données</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.security.auditLogging}
                    onChange={(e) => updateSetting('security', 'auditLogging', e.target.checked)}
                  />
                  <span className="text-sm">Journal d'audit</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.security.accessControl}
                    onChange={(e) => updateSetting('security', 'accessControl', e.target.checked)}
                  />
                  <span className="text-sm">Contrôle d'accès</span>
                </label>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="algorithm" className="space-y-4">
          <Card>
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Algorithme d'Extraction Algérien
              </h3>
              
              {/* Activation de l'algorithme */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Activation de l'Algorithme
                </h4>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.algorithm.enableAlgerianAlgorithm}
                    onChange={(e) => updateAlgorithmSetting('enableAlgerianAlgorithm', '', e.target.checked)}
                  />
                  <span className="text-sm">Activer l'algorithme d'extraction algérien</span>
                </label>
              </div>

              {/* Configuration de détection des lignes */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Détection des Lignes
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Longueur min ligne</label>
                    <Input
                      type="number"
                      value={settings.algorithm.lineDetectionConfig.minLineLength}
                      onChange={(e) => updateAlgorithmSetting('lineDetectionConfig', 'minLineLength', parseInt(e.target.value))}
                      min="10"
                      max="200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Écart max ligne</label>
                    <Input
                      type="number"
                      value={settings.algorithm.lineDetectionConfig.maxLineGap}
                      onChange={(e) => updateAlgorithmSetting('lineDetectionConfig', 'maxLineGap', parseInt(e.target.value))}
                      min="1"
                      max="20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Seuil Hough</label>
                    <Input
                      type="number"
                      value={settings.algorithm.lineDetectionConfig.threshold}
                      onChange={(e) => updateAlgorithmSetting('lineDetectionConfig', 'threshold', parseInt(e.target.value))}
                      min="50"
                      max="200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Noyau dilatation</label>
                    <Input
                      type="number"
                      value={settings.algorithm.lineDetectionConfig.dilationKernel}
                      onChange={(e) => updateAlgorithmSetting('lineDetectionConfig', 'dilationKernel', parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
              </div>

              {/* Configuration de suppression des bordures */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Suppression des Bordures
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Lignes haut</label>
                    <Input
                      type="number"
                      value={settings.algorithm.borderRemovalConfig.topLines}
                      onChange={(e) => updateAlgorithmSetting('borderRemovalConfig', 'topLines', parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Lignes bas</label>
                    <Input
                      type="number"
                      value={settings.algorithm.borderRemovalConfig.bottomLines}
                      onChange={(e) => updateAlgorithmSetting('borderRemovalConfig', 'bottomLines', parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Lignes côtés</label>
                    <Input
                      type="number"
                      value={settings.algorithm.borderRemovalConfig.sideLines}
                      onChange={(e) => updateAlgorithmSetting('borderRemovalConfig', 'sideLines', parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tolérance (px)</label>
                    <Input
                      type="number"
                      value={settings.algorithm.borderRemovalConfig.tolerance}
                      onChange={(e) => updateAlgorithmSetting('borderRemovalConfig', 'tolerance', parseInt(e.target.value))}
                      min="1"
                      max="50"
                    />
                  </div>
                </div>
              </div>

              {/* Configuration de détection des tables */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  Détection des Tables
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Largeur min table</label>
                    <Input
                      type="number"
                      value={settings.algorithm.tableDetectionConfig.minTableWidth}
                      onChange={(e) => updateAlgorithmSetting('tableDetectionConfig', 'minTableWidth', parseInt(e.target.value))}
                      min="50"
                      max="500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hauteur min table</label>
                    <Input
                      type="number"
                      value={settings.algorithm.tableDetectionConfig.minTableHeight}
                      onChange={(e) => updateAlgorithmSetting('tableDetectionConfig', 'minTableHeight', parseInt(e.target.value))}
                      min="20"
                      max="300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Padding cellules</label>
                    <Input
                      type="number"
                      value={settings.algorithm.tableDetectionConfig.cellPadding}
                      onChange={(e) => updateAlgorithmSetting('tableDetectionConfig', 'cellPadding', parseInt(e.target.value))}
                      min="1"
                      max="20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Seuil lignes implicites</label>
                    <Input
                      type="number"
                      value={settings.algorithm.tableDetectionConfig.implicitRowThreshold}
                      onChange={(e) => updateAlgorithmSetting('tableDetectionConfig', 'implicitRowThreshold', parseFloat(e.target.value))}
                      min="0.1"
                      max="1.0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Configuration du traitement regex */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Traitement Regex
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Seuil confiance</label>
                    <Input
                      type="number"
                      value={settings.algorithm.regexProcessingConfig.confidenceThreshold}
                      onChange={(e) => updateAlgorithmSetting('regexProcessingConfig', 'confidenceThreshold', parseFloat(e.target.value))}
                      min="0.1"
                      max="1.0"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.algorithm.regexProcessingConfig.enableHijriDates}
                      onChange={(e) => updateAlgorithmSetting('regexProcessingConfig', 'enableHijriDates', e.target.checked)}
                    />
                    <span className="text-sm">Dates Hijri</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.algorithm.regexProcessingConfig.enableGregorianDates}
                      onChange={(e) => updateAlgorithmSetting('regexProcessingConfig', 'enableGregorianDates', e.target.checked)}
                    />
                    <span className="text-sm">Dates Grégoriennes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.algorithm.regexProcessingConfig.enableArabicText}
                      onChange={(e) => updateAlgorithmSetting('regexProcessingConfig', 'enableArabicText', e.target.checked)}
                    />
                    <span className="text-sm">Texte Arabe</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.algorithm.regexProcessingConfig.enableFrenchText}
                      onChange={(e) => updateAlgorithmSetting('regexProcessingConfig', 'enableFrenchText', e.target.checked)}
                    />
                    <span className="text-sm">Texte Français</span>
                  </label>
                </div>
              </div>

              {/* Configuration du mapping */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Mapping Intelligent
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Seuil confiance</label>
                    <Input
                      type="number"
                      value={settings.algorithm.mappingConfig.confidenceThreshold}
                      onChange={(e) => updateAlgorithmSetting('mappingConfig', 'confidenceThreshold', parseFloat(e.target.value))}
                      min="0.1"
                      max="1.0"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.algorithm.mappingConfig.enableAlgerianNomenclature}
                      onChange={(e) => updateAlgorithmSetting('mappingConfig', 'enableAlgerianNomenclature', e.target.checked)}
                    />
                    <span className="text-sm">Nomenclature algérienne</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.algorithm.mappingConfig.enableIntelligentMapping}
                      onChange={(e) => updateAlgorithmSetting('mappingConfig', 'enableIntelligentMapping', e.target.checked)}
                    />
                    <span className="text-sm">Mapping intelligent</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.algorithm.mappingConfig.enableSuggestions}
                      onChange={(e) => updateAlgorithmSetting('mappingConfig', 'enableSuggestions', e.target.checked)}
                    />
                    <span className="text-sm">Suggestions automatiques</span>
                  </label>
                </div>
              </div>

              {/* Configuration de l'approbation */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Workflow d'Approbation
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Timeout escalade (h)</label>
                    <Input
                      type="number"
                      value={settings.algorithm.approvalConfig.escalationTimeout}
                      onChange={(e) => updateAlgorithmSetting('approvalConfig', 'escalationTimeout', parseInt(e.target.value))}
                      min="1"
                      max="168"
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.algorithm.approvalConfig.enableAutoApproval}
                      onChange={(e) => updateAlgorithmSetting('approvalConfig', 'enableAutoApproval', e.target.checked)}
                    />
                    <span className="text-sm">Approbation automatique</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.algorithm.approvalConfig.enableBatchProcessing}
                      onChange={(e) => updateAlgorithmSetting('approvalConfig', 'enableBatchProcessing', e.target.checked)}
                    />
                    <span className="text-sm">Traitement par lot</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.algorithm.approvalConfig.enableLearningMode}
                      onChange={(e) => updateAlgorithmSetting('approvalConfig', 'enableLearningMode', e.target.checked)}
                    />
                    <span className="text-sm">Mode apprentissage</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OCRSettingsComponent;