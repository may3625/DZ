import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Hash, Lock, Globe, Users } from "lucide-react";
import { toast } from '@/hooks/use-toast';

interface NewChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (channel: any) => Promise<void>;
}

export function NewChannelModal({ isOpen, onClose, onSave }: NewChannelModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public',
    category: 'general',
    autoArchive: true,
    slowMode: false,
    slowModeInterval: '5s'
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
        description: "Le canal a été créé avec succès.",
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

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'public': return <Globe className="h-4 w-4 text-green-500" />;
      case 'private': return <Lock className="h-4 w-4 text-orange-500" />;
      case 'announcement': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Nouveau Canal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: #général"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez l'objectif de ce canal"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Privé</SelectItem>
                  <SelectItem value="announcement">Annonces</SelectItem>
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
                  <SelectItem value="project">Projet</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="random">Divers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoArchive"
                checked={formData.autoArchive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoArchive: checked as boolean }))}
              />
              <Label htmlFor="autoArchive">Archivage automatique</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="slowMode"
                checked={formData.slowMode}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, slowMode: checked as boolean }))}
              />
              <Label htmlFor="slowMode">Mode lent</Label>
            </div>

            {formData.slowMode && (
              <div className="space-y-2">
                <Label htmlFor="slowModeInterval">Intervalle du mode lent</Label>
                <Select value={formData.slowModeInterval} onValueChange={(value) => setFormData(prev => ({ ...prev, slowModeInterval: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5s">5 secondes</SelectItem>
                    <SelectItem value="10s">10 secondes</SelectItem>
                    <SelectItem value="30s">30 secondes</SelectItem>
                    <SelectItem value="1m">1 minute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Création..." : "Créer le canal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}