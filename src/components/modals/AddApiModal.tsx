import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Globe, Plus, Settings, Shield, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (apiData: ApiData) => void;
}

export interface ApiData {
  id: string;
  name: string;
  url: string;
  method: string;
  description: string;
  authType: string;
  apiKey?: string;
  sections: string[];
  isActive: boolean;
  category: string;
  refreshInterval: number;
  createdAt: string;
  lastSync?: string;
}

const availableSections = [
  { id: 'actualites', name: 'Actualités', description: 'Section des actualités juridiques' },
  { id: 'references', name: 'Références', description: 'Bibliothèque de références' },
  { id: 'tutoriels', name: 'Tutoriels', description: 'Section des tutoriels' },
  { id: 'ressources', name: 'Ressources', description: 'Ressources documentaires' },
  { id: 'jurisprudence', name: 'Jurisprudence', description: 'Décisions de justice' },
  { id: 'legislation', name: 'Législation', description: 'Textes législatifs' },
  { id: 'procedures', name: 'Procédures', description: 'Procédures administratives' },
  { id: 'formulaires', name: 'Formulaires', description: 'Formulaires officiels' }
];

const apiCategories = [
  'Actualités',
  'Ouvrages',
  'Articles',
  'Revues',
  'Journaux',
  'Vidéos',
  'Jurisprudence',
  'Législation',
  'Procédures',
  'Formulaires',
  'Autre'
];

export const AddApiModal: React.FC<AddApiModalProps> = ({ isOpen, onClose, onSave }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ApiData>>({
    name: '',
    url: '',
    method: 'GET',
    description: '',
    authType: 'none',
    apiKey: '',
    sections: [],
    isActive: true,
    category: 'Actualités',
    refreshInterval: 3600
  });

  const handleSectionToggle = (sectionId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections?.includes(sectionId)
        ? prev.sections.filter(id => id !== sectionId)
        : [...(prev.sections || []), sectionId]
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.url) {
      toast({ 
        title: 'Erreur de validation', 
        description: 'Le nom et l\'URL de l\'API sont requis',
        variant: 'destructive' 
      });
      return;
    }

    if (!formData.sections || formData.sections.length === 0) {
      toast({ 
        title: 'Erreur de validation', 
        description: 'Sélectionnez au moins une section',
        variant: 'destructive' 
      });
      return;
    }

    setIsLoading(true);
    try {
      const apiData: ApiData = {
        id: Date.now().toString(),
        name: formData.name!,
        url: formData.url!,
        method: formData.method!,
        description: formData.description!,
        authType: formData.authType!,
        apiKey: formData.apiKey,
        sections: formData.sections!,
        isActive: formData.isActive!,
        category: formData.category!,
        refreshInterval: formData.refreshInterval!,
        createdAt: new Date().toISOString()
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSave) {
        onSave(apiData);
      }
      
      toast({ 
        title: 'API ajoutée avec succès',
        description: `L'API "${apiData.name}" a été configurée pour ${apiData.sections.length} section(s)`
      });
      
      // Reset form
      setFormData({
        name: '',
        url: '',
        method: 'GET',
        description: '',
        authType: 'none',
        apiKey: '',
        sections: [],
        isActive: true,
        category: 'Actualités',
        refreshInterval: 3600
      });
      
      onClose();
    } catch (error) {
      toast({ 
        title: 'Erreur lors de l\'ajout de l\'API', 
        description: 'Veuillez réessayer',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedSectionsNames = () => {
    return formData.sections?.map(sectionId => 
      availableSections.find(s => s.id === sectionId)?.name
    ).filter(Boolean) || [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Ajouter une nouvelle API
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Informations de base
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'API *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: API Légifrance"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">URL de l'API *</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://api.example.com/v1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="method">Méthode HTTP</Label>
                <Select value={formData.method} onValueChange={(value) => setFormData({ ...formData, method: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {apiCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de l'API et de son utilisation"
                rows={3}
              />
            </div>
          </div>

          {/* Authentification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Authentification
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="authType">Type d'authentification</Label>
                <Select value={formData.authType} onValueChange={(value) => setFormData({ ...formData, authType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="api_key">Clé API</SelectItem>
                    <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="refreshInterval">Intervalle de rafraîchissement (secondes)</Label>
                <Select 
                  value={formData.refreshInterval?.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, refreshInterval: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="900">15 minutes</SelectItem>
                    <SelectItem value="1800">30 minutes</SelectItem>
                    <SelectItem value="3600">1 heure</SelectItem>
                    <SelectItem value="7200">2 heures</SelectItem>
                    <SelectItem value="86400">24 heures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {formData.authType === 'api_key' && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">Clé API</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="Entrez votre clé API"
                />
              </div>
            )}
          </div>

          {/* Sections autorisées */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Sections autorisées *
            </h3>
            
            <div className="text-sm text-muted-foreground mb-3">
              Sélectionnez les sections qui peuvent utiliser les données de cette API
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {availableSections.map((section) => (
                <div key={section.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={section.id}
                    checked={formData.sections?.includes(section.id)}
                    onCheckedChange={() => handleSectionToggle(section.id)}
                  />
                  <Label htmlFor={section.id} className="text-sm cursor-pointer">
                    <div className="font-medium">{section.name}</div>
                    <div className="text-xs text-muted-foreground">{section.description}</div>
                  </Label>
                </div>
              ))}
            </div>
            
            {formData.sections && formData.sections.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Sections sélectionnées :</span>
                {getSelectedSectionsNames().map((name, index) => (
                  <Badge key={index} variant="secondary">{name}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* État de l'API */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive" className="text-base font-medium">API active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              Une API inactive ne récupérera pas de données automatiquement
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Ajout en cours...' : 'Ajouter l\'API'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};