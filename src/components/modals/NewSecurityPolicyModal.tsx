import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, Lock, Eye, Users, Settings, AlertTriangle,
  CheckCircle, XCircle, Plus, Save, X
} from "lucide-react";
import { toast } from '@/hooks/use-toast';

interface NewSecurityPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (policy: SecurityPolicy) => Promise<void>;
}

export interface SecurityPolicy {
  id?: string;
  name: string;
  description: string;
  type: 'access' | 'data' | 'network' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'draft';
  rules: SecurityRule[];
  scope: string[];
  effectiveDate: string;
  expiryDate?: string;
  createdBy: string;
  createdAt: string;
}

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: 'allow' | 'deny' | 'log' | 'alert';
  enabled: boolean;
}

export function NewSecurityPolicyModal({ isOpen, onClose, onSave }: NewSecurityPolicyModalProps) {
  const [formData, setFormData] = useState<Partial<SecurityPolicy>>({
    name: '',
    description: '',
    type: 'access',
    priority: 'medium',
    status: 'draft',
    rules: [],
    scope: [],
    effectiveDate: new Date().toISOString().split('T')[0],
    createdBy: 'current-user',
    createdAt: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (onSave) {
        await onSave(formData as SecurityPolicy);
      }
      toast({
        title: "Succès",
        description: "La politique de sécurité a été créée avec succès.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de la politique.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Nouvelle Politique de Sécurité
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="rules">Règles</TabsTrigger>
            <TabsTrigger value="scope">Portée</TabsTrigger>
            <TabsTrigger value="schedule">Planification</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la politique *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Politique d'accès aux documents sensibles"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type de politique</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="access">Contrôle d'accès</SelectItem>
                    <SelectItem value="data">Protection des données</SelectItem>
                    <SelectItem value="network">Sécurité réseau</SelectItem>
                    <SelectItem value="compliance">Conformité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez l'objectif et les conditions d'application de cette politique"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Règles de sécurité</h3>
              <Button onClick={() => alert('Ouverture du formulaire d\'ajout de règle')} size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter une règle
              </Button>
            </div>
            <p className="text-muted-foreground">Aucune règle configurée</p>
          </TabsContent>

          <TabsContent value="scope" className="space-y-4">
            <div className="space-y-2">
              <Label>Portée d'application</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Utilisateurs</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner les utilisateurs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les utilisateurs</SelectItem>
                      <SelectItem value="admins">Administrateurs uniquement</SelectItem>
                      <SelectItem value="custom">Utilisateurs spécifiques</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ressources</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner les ressources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les ressources</SelectItem>
                      <SelectItem value="documents">Documents uniquement</SelectItem>
                      <SelectItem value="procedures">Procédures uniquement</SelectItem>
                      <SelectItem value="custom">Ressources spécifiques</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Date d'effet *</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Date d'expiration</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Création..." : "Créer la politique"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}