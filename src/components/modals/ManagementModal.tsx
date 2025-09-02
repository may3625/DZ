import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Database, Shield, Activity } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManagementModal({ isOpen, onClose }: ManagementModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    systemName: '',
    maintenanceMode: false,
    backupFrequency: 'daily',
    logLevel: 'info',
    maxUsers: 100,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Configuration système:', formData);
    toast({
      title: "Configuration mise à jour",
      description: "Les paramètres système ont été modifiés avec succès.",
    });
    onClose();
    setFormData({
      systemName: '',
      maintenanceMode: false,
      backupFrequency: 'daily',
      logLevel: 'info',
      maxUsers: 100,
      description: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration du système
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="systemName">Nom du système</Label>
            <Input
              id="systemName"
              value={formData.systemName}
              onChange={(e) => setFormData({...formData, systemName: e.target.value})}
              placeholder="Nom de votre système"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="backupFrequency">Fréquence de sauvegarde</Label>
              <Select onValueChange={(value) => setFormData({...formData, backupFrequency: value})}>
                <SelectTrigger id="backupFrequency">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Toutes les heures</SelectItem>
                  <SelectItem value="daily">Quotidienne</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuelle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="logLevel">Niveau de log</Label>
              <Select onValueChange={(value) => setFormData({...formData, logLevel: value})}>
                <SelectTrigger id="logLevel">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxUsers">Nombre max d'utilisateurs</Label>
              <Input
                id="maxUsers"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData({...formData, maxUsers: parseInt(e.target.value)})}
                min="1"
                max="10000"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="maintenanceMode"
                checked={formData.maintenanceMode}
                onCheckedChange={(checked) => setFormData({...formData, maintenanceMode: checked as boolean})}
              />
              <Label htmlFor="maintenanceMode">Mode maintenance</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Description de la configuration"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Sauvegarder la configuration
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}