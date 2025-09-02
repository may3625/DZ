import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface NewPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (permissionData: Record<string, unknown>) => void;
}

export function NewPermissionModal({ isOpen, onClose, onSave }: NewPermissionModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    resource: '',
    action: '',
    enabled: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouvelle permission:', formData);
    toast({
      title: "Permission ajoutée",
      description: `La permission "${formData.name}" a été ajoutée avec succès.`,
    });
    onClose();
    setFormData({ name: '', description: '', resource: '', action: '', enabled: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Ajouter une nouvelle permission
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la permission</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="resource">Ressource</Label>
              <Select onValueChange={(value) => setFormData({...formData, resource: value})}>
                <SelectTrigger id="resource">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="documents">Documents</SelectItem>
                  <SelectItem value="users">Utilisateurs</SelectItem>
                  <SelectItem value="roles">Rôles</SelectItem>
                  <SelectItem value="settings">Paramètres</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="action">Action</Label>
              <Select onValueChange={(value) => setFormData({...formData, action: value})}>
                <SelectTrigger id="action">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Lecture</SelectItem>
                  <SelectItem value="write">Écriture</SelectItem>
                  <SelectItem value="delete">Suppression</SelectItem>
                  <SelectItem value="admin">Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({...formData, enabled: checked as boolean})}
            />
            <Label htmlFor="enabled">Activer cette permission</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Ajouter la permission
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}