
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Pagination } from "@/components/common/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { SectionHeader } from "@/components/common/SectionHeader";
import { 
  Zap, 
  Globe, 
  Database, 
  Cloud, 
  Shield, 
  FileText,
  Users,
  Building,
  Link,
  GitBranch,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  Lock,
  Key,
  Server,
  Webhook,
  Code,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import OCRSettingsComponent from '@/components/ocr/OCRSettingsComponent';
import { MonitoringComponent } from '@/components/monitoring/MonitoringComponent';
import { FixedAdvancedOCRConfigurationSection } from './FixedAdvancedOCRConfigurationSection';
import { AdvancedAlgerianOCRProcessor } from '@/components/ocr/AdvancedAlgerianOCRProcessor';
import { LegalDatabaseWorkflowComponent } from '@/components/ocr/LegalDatabaseWorkflowComponent';

interface IntegrationsInteroperabilitySectionProps {
  language?: string;
}

export function IntegrationsInteroperabilitySection({ language = "fr" }: IntegrationsInteroperabilitySectionProps) {
  // États pour l'OCR
  const [showOCRProcessor, setShowOCRProcessor] = useState(false);
  const [extractedFormData, setExtractedFormData] = useState<any>(null);

  // Handler pour le processeur OCR
  const handleFormDataExtracted = (data: { documentType: 'legal' | 'procedure', formData: Record<string, any> }) => {
    setExtractedFormData(data);
    setShowOCRProcessor(false);
    console.log('Données extraites:', data);
  };

  const activeIntegrations = [
    { name: "Système National d'Identité", status: "connected", type: "Government", uptime: "99.8%", requests: "1,245/day" },
    { name: "Base Nationale des Entreprises", status: "connected", type: "Business", uptime: "99.5%", requests: "892/day" },
    { name: "Registre du Commerce", status: "connected", type: "Commercial", uptime: "99.9%", requests: "2,156/day" },
    { name: "Système Judiciaire", status: "maintenance", type: "Judicial", uptime: "98.2%", requests: "456/day" },
    { name: "Archives Nationales", status: "connected", type: "Archives", uptime: "99.7%", requests: "678/day" },
    { name: "Système Fiscal", status: "connected", type: "Fiscal", uptime: "99.6%", requests: "3,456/day" },
    { name: "Base de Données Sociale", status: "connected", type: "Social", uptime: "99.4%", requests: "1,789/day" },
    { name: "Système de Santé", status: "maintenance", type: "Health", uptime: "97.8%", requests: "2,345/day" },
    { name: "Registre Foncier", status: "connected", type: "Property", uptime: "99.3%", requests: "567/day" },
    { name: "Système Éducatif", status: "connected", type: "Education", uptime: "99.1%", requests: "1,234/day" },
    { name: "Base de Données Douanière", status: "connected", type: "Customs", uptime: "99.5%", requests: "4,567/day" },
    { name: "Système de Transport", status: "maintenance", type: "Transport", uptime: "98.5%", requests: "890/day" }
  ];

  const apiEndpoints = [
    { endpoint: "/api/v1/legal-texts", method: "GET", status: "active", calls: "15,234", avgTime: "45ms" },
    { endpoint: "/api/v1/procedures", method: "POST", status: "active", calls: "8,567", avgTime: "67ms" },
    { endpoint: "/api/v1/search", method: "GET", status: "active", calls: "23,456", avgTime: "123ms" },
    { endpoint: "/api/v1/documents", method: "PUT", status: "active", calls: "4,123", avgTime: "89ms" },
    { endpoint: "/api/v1/users", method: "GET", status: "maintenance", calls: "2,789", avgTime: "156ms" },
    { endpoint: "/api/v1/notifications", method: "POST", status: "active", calls: "12,345", avgTime: "34ms" },
    { endpoint: "/api/v1/audit", method: "GET", status: "active", calls: "6,789", avgTime: "78ms" },
    { endpoint: "/api/v1/export", method: "POST", status: "active", calls: "3,456", avgTime: "234ms" },
    { endpoint: "/api/v1/import", method: "POST", status: "maintenance", calls: "1,234", avgTime: "456ms" },
    { endpoint: "/api/v1/backup", method: "GET", status: "active", calls: "567", avgTime: "890ms" },
    { endpoint: "/api/v1/restore", method: "POST", status: "active", calls: "123", avgTime: "1,234ms" },
    { endpoint: "/api/v1/health", method: "GET", status: "active", calls: "45,678", avgTime: "12ms" }
  ];

  const standardsCompliance = [
    { standard: "OpenAPI 3.0", compliance: 100, status: "compliant", description: "Spécification API REST" },
    { standard: "JSON-LD", compliance: 95, status: "compliant", description: "Données liées structurées" },
    { standard: "OAuth 2.0", compliance: 100, status: "compliant", description: "Authentification sécurisée" },
    { standard: "SAML 2.0", compliance: 85, status: "partial", description: "Single Sign-On" },
    { standard: "FHIR R4", compliance: 70, status: "partial", description: "Échange données santé" },
    { standard: "HL7", compliance: 60, status: "development", description: "Standards santé" },
    { standard: "ISO 27001", compliance: 90, status: "compliant", description: "Sécurité de l'information" },
    { standard: "GDPR", compliance: 95, status: "compliant", description: "Protection des données" },
    { standard: "WCAG 2.1", compliance: 88, status: "compliant", description: "Accessibilité web" },
    { standard: "XML Schema", compliance: 100, status: "compliant", description: "Validation XML" },
    { standard: "REST API", compliance: 100, status: "compliant", description: "Architecture REST" },
    { standard: "GraphQL", compliance: 75, status: "partial", description: "API GraphQL" }
  ];

  const dataFormats = [
    { format: "JSON", support: "Full", usage: "95%", icon: Code },
    { format: "XML", support: "Full", usage: "78%", icon: FileText },
    { format: "CSV", support: "Full", usage: "65%", icon: Database },
    { format: "PDF", support: "Read/Write", usage: "89%", icon: FileText },
    { format: "RDF", support: "Read", usage: "23%", icon: GitBranch },
    { format: "EDI", support: "Partial", usage: "12%", icon: ExternalLink },
    { format: "YAML", support: "Full", usage: "45%", icon: Code },
    { format: "Excel", support: "Read/Write", usage: "67%", icon: FileText },
    { format: "Parquet", support: "Read", usage: "34%", icon: Database },
    { format: "Avro", support: "Partial", usage: "18%", icon: Code },
    { format: "Protobuf", support: "Full", usage: "28%", icon: Code },
    { format: "GraphQL", support: "Full", usage: "56%", icon: Webhook },
    { format: "SOAP", support: "Partial", usage: "22%", icon: Server },
    { format: "OpenAPI", support: "Full", usage: "81%", icon: Code },
    { format: "Markdown", support: "Read/Write", usage: "39%", icon: FileText },
    { format: "GeoJSON", support: "Read", usage: "15%", icon: Globe }
  ];

  // Pagination pour les formats de données
  const {
    currentData: paginatedDataFormats,
    currentPage: dataFormatsCurrentPage,
    totalPages: dataFormatsTotalPages,
    itemsPerPage: dataFormatsItemsPerPage,
    totalItems: dataFormatsTotalItems,
    setCurrentPage: setDataFormatsCurrentPage,
    setItemsPerPage: setDataFormatsItemsPerPage
  } = usePagination({
    data: dataFormats,
    itemsPerPage: 5
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'maintenance':
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'development': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination pour les intégrations actives
  const {
    currentData: paginatedIntegrations,
    currentPage: integrationsCurrentPage,
    totalPages: integrationsTotalPages,
    itemsPerPage: integrationsItemsPerPage,
    totalItems: integrationsTotalItems,
    setCurrentPage: setIntegrationsCurrentPage,
    setItemsPerPage: setIntegrationsItemsPerPage
  } = usePagination({
    data: activeIntegrations,
    itemsPerPage: 5
  });

  // Pagination pour les endpoints API
  const {
    currentData: paginatedApiEndpoints,
    currentPage: apiEndpointsCurrentPage,
    totalPages: apiEndpointsTotalPages,
    itemsPerPage: apiEndpointsItemsPerPage,
    totalItems: apiEndpointsTotalItems,
    setCurrentPage: setApiEndpointsCurrentPage,
    setItemsPerPage: setApiEndpointsItemsPerPage
  } = usePagination({
    data: apiEndpoints,
    itemsPerPage: 5
  });

  // Pagination pour les standards de conformité
  const {
    currentData: paginatedStandards,
    currentPage: standardsCurrentPage,
    totalPages: standardsTotalPages,
    itemsPerPage: standardsItemsPerPage,
    totalItems: standardsTotalItems,
    setCurrentPage: setStandardsCurrentPage,
    setItemsPerPage: setStandardsItemsPerPage
  } = usePagination({
    data: standardsCompliance,
    itemsPerPage: 5
  });

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 90) return 'text-green-600';
    if (compliance >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="📡 Intégrations et Interopérabilité"
        description="Gestion des intégrations système, APIs, standards et configuration OCR"
        icon={Link}
        iconColor="text-blue-600"
      />
      
      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="integrations">Intégrations Actives</TabsTrigger>
          <TabsTrigger value="apis">APIs & Services</TabsTrigger>
          <TabsTrigger value="standards">Standards</TabsTrigger>
          <TabsTrigger value="formats">Formats de Données</TabsTrigger>
          <TabsTrigger value="ocr-config">⚙️ Configuration OCR</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedIntegrations.map((integration, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <Badge className={getStatusColor(integration.status)}>
                      {integration.status === 'connected' ? 'Connecté' :
                       integration.status === 'maintenance' ? 'Maintenance' : 'Erreur'}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{integration.name}</h4>
                  <Badge variant="outline" className="mb-3">{integration.type}</Badge>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disponibilité:</span>
                      <span className="font-medium">{integration.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Requêtes:</span>
                      <span className="font-medium">{integration.requests}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-1" />
                      Config
                    </Button>
                    <Button variant="outline" size="sm">
                      <Activity className="w-4 h-4 mr-1" />
                      Stats
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
          
          {/* Pagination pour les intégrations actives */}
          <Pagination
            currentPage={integrationsCurrentPage}
            totalPages={integrationsTotalPages}
            totalItems={integrationsTotalItems}
            itemsPerPage={integrationsItemsPerPage}
            onPageChange={setIntegrationsCurrentPage}
            onItemsPerPageChange={setIntegrationsItemsPerPage}
          />
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-600" />
                Points de Terminaison API
              </CardTitle>
              <CardDescription>
                Gestion et monitoring des APIs REST
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {paginatedApiEndpoints.map((api, index) => (
                  <div key={index} className="flex flex-col p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {api.method}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(api.status)}`}>
                          {api.status === 'active' ? 'Actif' : 'Maintenance'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="mb-4">
                      <code className="text-sm bg-white px-3 py-2 rounded border break-all font-mono block">
                        {api.endpoint}
                      </code>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-600 text-xs font-medium">Appels</span>
                        <span className="font-semibold text-lg">{api.calls}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-600 text-xs font-medium">Temps moyen</span>
                        <span className="font-semibold text-lg">{api.avgTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination pour les endpoints API */}
              <Pagination
                currentPage={apiEndpointsCurrentPage}
                totalPages={apiEndpointsTotalPages}
                totalItems={apiEndpointsTotalItems}
                itemsPerPage={apiEndpointsItemsPerPage}
                onPageChange={setApiEndpointsCurrentPage}
                onItemsPerPageChange={setApiEndpointsItemsPerPage}
              />
              <div className="flex gap-2 mt-6">
                <Button variant="outline">
                  <Code className="w-4 h-4 mr-2" />
                  Documentation API
                </Button>
                <Button variant="outline">
                  <Key className="w-4 h-4 mr-2" />
                  Gestion des clés
                </Button>
                <Button variant="outline">
                  <Webhook className="w-4 h-4 mr-2" />
                  Webhooks
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedStandards.map((standard, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">{standard.standard}</h4>
                    <Badge className={getStatusColor(standard.status)}>
                      {standard.status === 'compliant' ? 'Conforme' :
                       standard.status === 'partial' ? 'Partiel' : 'En développement'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{standard.description}</p>
                  <div className="flex items-center gap-3 mb-2">
                    <Progress value={standard.compliance} className="flex-1" />
                    <span className={`font-medium ${getComplianceColor(standard.compliance)}`}>
                      {standard.compliance}%
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-1" />
                      Documentation
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-1" />
                      Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination pour les standards de conformité */}
          <Pagination
            currentPage={standardsCurrentPage}
            totalPages={standardsTotalPages}
            totalItems={standardsTotalItems}
            itemsPerPage={standardsItemsPerPage}
            onPageChange={setStandardsCurrentPage}
            onItemsPerPageChange={setStandardsItemsPerPage}
          />
        </TabsContent>

        <TabsContent value="formats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedDataFormats.map((format, index) => {
              const Icon = format.icon;
              return (
                <Card key={index}>
                  <CardContent className="pt-6 text-center">
                    <Icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <h4 className="font-semibold text-gray-900 mb-2">{format.format}</h4>
                    <Badge variant="outline" className="mb-3">{format.support}</Badge>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Utilisation:</span>
                        <span className="font-medium">{format.usage}</span>
                      </div>
                      <Progress value={parseInt(format.usage)} className="h-2" />
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Settings className="w-4 h-4 mr-1" />
                      Configurer
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Pagination pour les formats de données */}
          <Pagination
            currentPage={dataFormatsCurrentPage}
            totalPages={dataFormatsTotalPages}
            totalItems={dataFormatsTotalItems}
            itemsPerPage={dataFormatsItemsPerPage}
            onPageChange={setDataFormatsCurrentPage}
            onItemsPerPageChange={setDataFormatsItemsPerPage}
          />
        </TabsContent>

        <TabsContent value="ocr-config" className="space-y-4">
          {/* Dashboard pour Configuration OCR */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Documents traités</p>
                  <p className="text-2xl font-bold">2,847</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taux de réussite</p>
                  <p className="text-2xl font-bold">94.8%</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Temps moyen</p>
                  <p className="text-2xl font-bold">2.4s</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Instances actives</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Configuration OCR
              </CardTitle>
              <CardDescription>
                Paramétrage des services d'extraction et de traitement OCR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">Général</TabsTrigger>
                  <TabsTrigger value="algorithm">Algorithme d'Extraction</TabsTrigger>
                  <TabsTrigger value="workflow">
                    <Database className="w-4 h-4 mr-2" />
                    Workflow d'Alimentation
                  </TabsTrigger>
                  <TabsTrigger value="advanced">Avancé</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <FixedAdvancedOCRConfigurationSection 
                    showOCRProcessor={showOCRProcessor}
                    onShowOCRProcessor={setShowOCRProcessor}
                    onFormDataExtracted={handleFormDataExtracted}
                  />
                </TabsContent>

                <TabsContent value="algorithm" className="space-y-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">🇩🇿 Algorithme d'Extraction - Documents Algériens</h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Configuration des paramètres de l'algorithme d'extraction selon l'annexe fournie.
                        Ces paramètres optimisent la détection des lignes, bordures et tables pour les journaux officiels algériens.
                      </p>
                    </div>

                    {/* Détection des lignes */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">🔍 Détection des Lignes</CardTitle>
                        <CardDescription>
                          Paramètres pour la détection des lignes horizontales et verticales
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Dilatation (itérations)
                            </label>
                            <input
                              type="number"
                              defaultValue="2"
                              min="1"
                              max="5"
                              className="w-full px-3 py-2 border rounded-md"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Élargit les lignes noires pour améliorer la détection
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Érosion (itérations)
                            </label>
                            <input
                              type="number"
                              defaultValue="1"
                              min="1"
                              max="5"
                              className="w-full px-3 py-2 border rounded-md"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Retrouve la taille originale des lignes
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Seuil Hough
                            </label>
                            <input
                              type="number"
                              defaultValue="100"
                              min="50"
                              max="200"
                              className="w-full px-3 py-2 border rounded-md"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Seuil de détection pour l'algorithme HoughLinesP
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Longueur minimale des lignes
                            </label>
                            <input
                              type="number"
                              defaultValue="50"
                              min="20"
                              max="200"
                              className="w-full px-3 py-2 border rounded-md"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Longueur minimale en pixels pour considérer une ligne
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bordures spécifiques */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">🗑️ Suppression des Bordures</CardTitle>
                        <CardDescription>
                          Configuration spécifique aux journaux officiels algériens
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Lignes en haut
                            </label>
                            <input
                              type="number"
                              defaultValue="3"
                              min="1"
                              max="5"
                              className="w-full px-3 py-2 border rounded-md"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Nombre de lignes horizontales en haut à supprimer
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Lignes en bas
                            </label>
                            <input
                              type="number"
                              defaultValue="2"
                              min="1"
                              max="5"
                              className="w-full px-3 py-2 border rounded-md"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Nombre de lignes horizontales en bas à supprimer
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Lignes sur les côtés
                            </label>
                            <input
                              type="number"
                              defaultValue="2"
                              min="1"
                              max="5"
                              className="w-full px-3 py-2 border rounded-md"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Nombre de lignes verticales de chaque côté à supprimer
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Zones de texte */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">📏 Détection des Zones de Texte</CardTitle>
                        <CardDescription>
                          Paramètres pour la détection des séparateurs de texte
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Marge d'erreur centrale (ε)
                          </label>
                          <input
                            type="number"
                            defaultValue="20"
                            min="10"
                            max="50"
                            className="w-full px-3 py-2 border rounded-md"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Marge en pixels pour détecter les lignes verticales centrales
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tables */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">📊 Détection des Tables</CardTitle>
                        <CardDescription>
                          Paramètres pour la détection et l'extraction des tables
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Largeur minimale des tables
                            </label>
                            <input
                              type="number"
                              defaultValue="100"
                              min="50"
                              max="500"
                              className="w-full px-3 py-2 border rounded-md"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Largeur minimale en pixels pour considérer une table
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Hauteur minimale des tables
                            </label>
                            <input
                              type="number"
                              defaultValue="50"
                              min="20"
                              max="300"
                              className="w-full px-3 py-2 border rounded-md"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Hauteur minimale en pixels pour considérer une table
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Padding des cellules
                            </label>
                            <input
                              type="number"
                              defaultValue="5"
                              min="1"
                              max="20"
                              className="w-full px-3 py-2 border rounded-md"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Espacement interne des cellules en pixels
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Sauvegarder la configuration
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Restaurer les valeurs par défaut
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">⚙️ Configuration Avancée</h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Paramètres avancés pour l'optimisation des performances et la qualité d'extraction.
                      </p>
                    </div>

                    {/* Performance */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">🚀 Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Traitement parallèle
                            </label>
                            <select className="w-full px-3 py-2 border rounded-md">
                              <option value="auto">Automatique</option>
                              <option value="1">1 thread</option>
                              <option value="2">2 threads</option>
                              <option value="4">4 threads</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Cache des résultats
                            </label>
                            <select className="w-full px-3 py-2 border rounded-md">
                              <option value="enabled">Activé</option>
                              <option value="disabled">Désactivé</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Qualité */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">🎯 Qualité d'Extraction</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Seuil de confiance minimum
                            </label>
                            <input
                              type="number"
                              defaultValue="70"
                              min="0"
                              max="100"
                              className="w-full px-3 py-2 border rounded-md"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Seuil en pourcentage pour accepter un résultat
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Validation croisée
                            </label>
                            <select className="w-full px-3 py-2 border rounded-md">
                              <option value="enabled">Activée</option>
                              <option value="disabled">Désactivée</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              Valide les résultats avec plusieurs méthodes
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Debug */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">🐛 Mode Debug</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="debug-mode" className="rounded" />
                          <label htmlFor="debug-mode" className="text-sm font-medium">
                            Activer le mode debug
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          Génère des logs détaillés et des visualisations intermédiaires pour le debugging
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="workflow" className="space-y-4">
                  <LegalDatabaseWorkflowComponent />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-gray-900 mb-1">99.7%</div>
                <div className="text-sm text-gray-600">Disponibilité</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-gray-900 mb-1">2.3M</div>
                <div className="text-sm text-gray-600">Requêtes/jour</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-gray-900 mb-1">78ms</div>
                <div className="text-sm text-gray-600">Latence moyenne</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-gray-900 mb-1">15</div>
                <div className="text-sm text-gray-600">Intégrations actives</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Monitoring en Temps Réel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MonitoringComponent />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
