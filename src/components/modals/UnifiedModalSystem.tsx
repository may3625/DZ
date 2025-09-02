import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, Upload, FileText, Users, MessageSquare, Settings, 
  BarChart3, Filter, Star, BookOpen, Languages, Eye, Printer,
  Archive, Bell, Calendar, CheckCircle, XCircle, AlertCircle,
  Search, Brain, Bot, Database, Globe, Clock, Target, Zap,
  Play, Mic, Plus, Edit, Trash2, Share, Copy, ExternalLink
} from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { useAppStore } from '@/stores/appStore';

// Types pour le système de modales unifié
export interface ModalConfig {
  id: string;
  type: 'form' | 'viewer' | 'confirmation' | 'settings' | 'import' | 'export' | 'workflow' | 'display' | 'analytics' | 'search' | 'legal' | 'procedure' | 'approval' | 'ocr';
  title: string;
  [key: string]: any; // Allow additional properties
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  data?: any;
  actions?: ModalAction[];
  content?: React.ReactNode;
  onSave?: (data: any) => Promise<void> | void;
  onCancel?: () => void;
  onConfirm?: () => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  onExport?: (format: string) => Promise<void> | void;
  onImport?: (file: File) => Promise<void> | void;
}

export interface ModalAction {
  id: string;
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: React.ReactNode;
  onClick: () => Promise<void> | void;
  disabled?: boolean;
  loading?: boolean;
}

interface UnifiedModalSystemProps {
  modal: ModalConfig | null;
  onClose: () => void;
}

export function UnifiedModalSystem({ modal, onClose }: UnifiedModalSystemProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const store = useAppStore();

  useEffect(() => {
    if (modal?.data) {
      setFormData(modal.data);
    }
  }, [modal]);

  const handleSave = async () => {
    if (!modal?.onSave) return;
    
    setLoading(true);
    try {
      await modal.onSave(formData);
      toast({
        title: "Succès",
        description: "Les modifications ont été sauvegardées avec succès.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la sauvegarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!modal?.onConfirm) return;
    
    setLoading(true);
    try {
      await modal.onConfirm();
      toast({
        title: "Succès",
        description: "L'action a été effectuée avec succès.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'exécution.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!modal?.onDelete) return;
    
    setLoading(true);
    try {
      await modal.onDelete();
      toast({
        title: "Supprimé",
        description: "L'élément a été supprimé avec succès.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    if (!modal?.onExport) return;
    
    setLoading(true);
    try {
      await modal.onExport(format);
      toast({
        title: "Export réussi",
        description: `L'export au format ${format.toUpperCase()} a été effectué.`,
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Une erreur s'est produite lors de l'export.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!modal?.onImport || !event.target.files?.[0]) return;
    
    const file = event.target.files[0];
    setLoading(true);
    try {
      await modal.onImport(file);
      toast({
        title: "Import réussi",
        description: "Le fichier a été importé avec succès.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: "Une erreur s'est produite lors de l'import.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderFormContent = () => {
    if (!modal) return null;

    switch (modal.type) {
      case 'form':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Entrez le titre"
                />
              </div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select value={formData.category || ''} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="legal">Textes juridiques</SelectItem>
                    <SelectItem value="procedure">Procédures</SelectItem>
                    <SelectItem value="news">Actualités</SelectItem>
                    <SelectItem value="template">Modèles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Entrez la description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status || 'draft'} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="public"
                checked={formData.public || false}
                onCheckedChange={(checked) => setFormData({...formData, public: checked})}
              />
              <Label htmlFor="public">Rendre public</Label>
            </div>
          </div>
        );

      case 'viewer':
        return (
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-4 p-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {modal.data?.title || 'Document'}
                  </CardTitle>
                  <CardDescription>
                    {modal.data?.description || 'Aucune description disponible'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Date de création:</span>
                      <span className="text-sm font-medium">{modal.data?.createdAt || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Statut:</span>
                      <Badge variant={modal.data?.status === 'approved' ? 'default' : 'secondary'}>
                        {modal.data?.status || 'Brouillon'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Catégorie:</span>
                      <span className="text-sm font-medium">{modal.data?.category || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {modal.data?.content && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Contenu:</h4>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {modal.data.content}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        );

      case 'confirmation':
        return (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{modal.title}</h3>
              {modal.description && (
                <p className="text-sm text-gray-500 mt-2">{modal.description}</p>
              )}
            </div>
          </div>
        );

      case 'settings':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="language">Langue</Label>
                  <Select value={formData.language || 'fr'} onValueChange={(value) => setFormData({...formData, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="theme">Thème</Label>
                  <Select value={formData.theme || 'light'} onValueChange={(value) => setFormData({...formData, theme: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="auto">Automatique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Authentification à deux facteurs</Label>
                    <p className="text-sm text-gray-500">Sécurisez votre compte avec 2FA</p>
                  </div>
                  <Checkbox
                    checked={formData.twoFactor || false}
                    onCheckedChange={(checked) => setFormData({...formData, twoFactor: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications de connexion</Label>
                    <p className="text-sm text-gray-500">Recevoir des alertes de connexion</p>
                  </div>
                  <Checkbox
                    checked={formData.loginNotifications || false}
                    onCheckedChange={(checked) => setFormData({...formData, loginNotifications: checked})}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications par email</Label>
                    <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
                  </div>
                  <Checkbox
                    checked={formData.emailNotifications || false}
                    onCheckedChange={(checked) => setFormData({...formData, emailNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications push</Label>
                    <p className="text-sm text-gray-500">Recevoir les notifications push</p>
                  </div>
                  <Checkbox
                    checked={formData.pushNotifications || false}
                    onCheckedChange={(checked) => setFormData({...formData, pushNotifications: checked})}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        );

      case 'import':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500">Cliquez pour sélectionner un fichier</span>
                  <span className="text-gray-500"> ou glissez-déposez</span>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleImport}
                  accept=".json,.csv,.xlsx,.pdf"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Formats supportés: JSON, CSV, XLSX, PDF
              </p>
            </div>
          </div>
        );

      case 'export':
        return (
          <div className="space-y-4">
            <div>
              <Label>Format d'export</Label>
              <Select value={formData.format || 'pdf'} onValueChange={(value) => setFormData({...formData, format: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Période</Label>
              <RadioGroup value={formData.period || 'all'} onValueChange={(value) => setFormData({...formData, period: value})}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">Toutes les données</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="year" id="year" />
                  <Label htmlFor="year">Dernière année</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">Période personnalisée</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.period === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date de début</Label>
                  <Input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Date de fin</Label>
                  <Input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'workflow':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
                <div>
                  <Label className="text-sm font-medium">Soumission</Label>
                  <p className="text-xs text-gray-500">Document soumis pour approbation</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-yellow-600">2</span>
                </div>
                <div>
                  <Label className="text-sm font-medium">En révision</Label>
                  <p className="text-xs text-gray-500">En cours d'examen par les modérateurs</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-green-600">3</span>
                </div>
                <div>
                  <Label className="text-sm font-medium">Approuvé</Label>
                  <p className="text-xs text-gray-500">Document approuvé et publié</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Label>Commentaire</Label>
              <Textarea
                value={formData.comment || ''}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                placeholder="Ajoutez un commentaire (optionnel)"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return modal.content || null;
    }
  };

  const renderFooter = () => {
    if (!modal) return null;

    const defaultActions: ModalAction[] = [];

    switch (modal.type) {
      case 'form':
        defaultActions.push(
          {
            id: 'save',
            label: 'Sauvegarder',
            variant: 'default',
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: handleSave,
            loading
          },
          {
            id: 'cancel',
            label: 'Annuler',
            variant: 'outline',
            onClick: onClose
          }
        );
        break;

      case 'viewer':
        defaultActions.push(
          {
            id: 'download',
            label: 'Télécharger',
            variant: 'outline',
            icon: <Download className="h-4 w-4" />,
            onClick: () => handleExport('pdf')
          },
          {
            id: 'share',
            label: 'Partager',
            variant: 'outline',
            icon: <Share className="h-4 w-4" />,
            onClick: () => {}
          },
          {
            id: 'close',
            label: 'Fermer',
            variant: 'outline',
            onClick: onClose
          }
        );
        break;

      case 'confirmation':
        defaultActions.push(
          {
            id: 'confirm',
            label: 'Confirmer',
            variant: 'default',
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: handleConfirm,
            loading
          },
          {
            id: 'cancel',
            label: 'Annuler',
            variant: 'outline',
            onClick: onClose
          }
        );
        break;

      case 'settings':
        defaultActions.push(
          {
            id: 'save',
            label: 'Sauvegarder',
            variant: 'default',
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: handleSave,
            loading
          },
          {
            id: 'reset',
            label: 'Réinitialiser',
            variant: 'outline',
            onClick: () => setFormData({})
          },
          {
            id: 'cancel',
            label: 'Annuler',
            variant: 'outline',
            onClick: onClose
          }
        );
        break;

      case 'import':
        defaultActions.push(
          {
            id: 'import',
            label: 'Importer',
            variant: 'default',
            icon: <Upload className="h-4 w-4" />,
            onClick: () => {},
            disabled: true
          },
          {
            id: 'cancel',
            label: 'Annuler',
            variant: 'outline',
            onClick: onClose
          }
        );
        break;

      case 'export':
        defaultActions.push(
          {
            id: 'export',
            label: 'Exporter',
            variant: 'default',
            icon: <Download className="h-4 w-4" />,
            onClick: () => handleExport(formData.format || 'pdf'),
            loading
          },
          {
            id: 'cancel',
            label: 'Annuler',
            variant: 'outline',
            onClick: onClose
          }
        );
        break;

      case 'workflow':
        defaultActions.push(
          {
            id: 'approve',
            label: 'Approuver',
            variant: 'default',
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: handleConfirm,
            loading
          },
          {
            id: 'reject',
            label: 'Rejeter',
            variant: 'destructive',
            icon: <XCircle className="h-4 w-4" />,
            onClick: handleDelete,
            loading
          },
          {
            id: 'cancel',
            label: 'Annuler',
            variant: 'outline',
            onClick: onClose
          }
        );
        break;
    }

    const actions = modal.actions || defaultActions;

    return (
      <DialogFooter className="flex flex-col sm:flex-row gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || 'outline'}
            onClick={action.onClick}
            disabled={action.disabled || loading}
            className="w-full sm:w-auto"
          >
            {action.loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>Chargement...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {action.icon}
                <span>{action.label}</span>
              </div>
            )}
          </Button>
        ))}
      </DialogFooter>
    );
  };

  if (!modal) return null;

  const getModalSize = () => {
    switch (modal.size) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case 'full': return 'max-w-4xl';
      default: return 'max-w-lg';
    }
  };

  return (
    <Dialog open={!!modal} onOpenChange={() => !loading && onClose()}>
      <DialogContent className={getModalSize()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {modal.title}
          </DialogTitle>
          {modal.description && (
            <p className="text-sm text-gray-500">{modal.description}</p>
          )}
        </DialogHeader>
        
        <div className="py-4">
          {renderFormContent()}
        </div>
        
        {renderFooter()}
      </DialogContent>
    </Dialog>
  );
}

// Hook pour utiliser le système de modales unifié
export function useUnifiedModal() {
  const [currentModal, setCurrentModal] = useState<ModalConfig | null>(null);

  const openModal = useCallback((config: ModalConfig) => {
    setCurrentModal(config);
  }, []);

  const closeModal = useCallback(() => {
    setCurrentModal(null);
  }, []);

  const openFormModal = useCallback((title: string, data?: any, onSave?: (data: any) => Promise<void> | void) => {
    openModal({
      id: `form-${Date.now()}`,
      type: 'form',
      title,
      data,
      onSave
    });
  }, [openModal]);

  const openViewerModal = useCallback((title: string, data: any) => {
    openModal({
      id: `viewer-${Date.now()}`,
      type: 'viewer',
      title,
      data
    });
  }, [openModal]);

  const openConfirmationModal = useCallback((title: string, description: string, onConfirm?: () => Promise<void> | void) => {
    openModal({
      id: `confirmation-${Date.now()}`,
      type: 'confirmation',
      title,
      description,
      onConfirm
    });
  }, [openModal]);

  const openSettingsModal = useCallback((title: string, data?: any, onSave?: (data: any) => Promise<void> | void) => {
    openModal({
      id: `settings-${Date.now()}`,
      type: 'settings',
      title,
      data,
      onSave
    });
  }, [openModal]);

  const openImportModal = useCallback((title: string, onImport?: (file: File) => Promise<void> | void) => {
    openModal({
      id: `import-${Date.now()}`,
      type: 'import',
      title,
      onImport
    });
  }, [openModal]);

  const openExportModal = useCallback((title: string, onExport?: (format: string) => Promise<void> | void) => {
    openModal({
      id: `export-${Date.now()}`,
      type: 'export',
      title,
      onExport
    });
  }, [openModal]);

  const openWorkflowModal = useCallback((title: string, data?: any, onConfirm?: () => Promise<void> | void, onDelete?: () => Promise<void> | void) => {
    openModal({
      id: `workflow-${Date.now()}`,
      type: 'workflow',
      title,
      data,
      onConfirm,
      onDelete
    });
  }, [openModal]);

  return {
    currentModal,
    openModal,
    closeModal,
    openFormModal,
    openViewerModal,
    openConfirmationModal,
    openSettingsModal,
    openImportModal,
    openExportModal,
    openWorkflowModal
  };
}