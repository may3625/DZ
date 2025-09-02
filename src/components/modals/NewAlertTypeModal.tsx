import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { toast } from '@/hooks/use-toast';

interface NewAlertTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (alertType: any) => Promise<void>;
}

export function NewAlertTypeModal({ isOpen, onClose, onSave }: NewAlertTypeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    severity: 'medium',
    category: 'general',
    enabled: true,
    autoResolve: false,
    escalationTime: '1h'
  });
  const [loading, setLoading] = useState(false);

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
        await onSave(formData);
      }
      toast({
        title: "Succès",
        description: "Le type d'alerte a été créé avec succès.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <Info className="h-4 w-4 text-blue-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Nouveau Type d'Alerte
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Alerte de conformité"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez le type d'alerte et ses conditions"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Sévérité</Label>
              <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
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
              <Label htmlFor="category">Catégorie</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Général</SelectItem>
                  <SelectItem value="security">Sécurité</SelectItem>
                  <SelectItem value="compliance">Conformité</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="escalationTime">Temps d'escalade</Label>
            <Select value={formData.escalationTime} onValueChange={(value) => setFormData(prev => ({ ...prev, escalationTime: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15m">15 minutes</SelectItem>
                <SelectItem value="30m">30 minutes</SelectItem>
                <SelectItem value="1h">1 heure</SelectItem>
                <SelectItem value="2h">2 heures</SelectItem>
                <SelectItem value="4h">4 heures</SelectItem>
                <SelectItem value="1d">1 jour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked as boolean }))}
              />
              <Label htmlFor="enabled">Activer ce type d'alerte</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoResolve"
                checked={formData.autoResolve}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoResolve: checked as boolean }))}
              />
              <Label htmlFor="autoResolve">Résolution automatique</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Création..." : "Créer le type d'alerte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}