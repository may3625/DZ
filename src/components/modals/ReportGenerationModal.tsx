import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, Download, BarChart3, Calendar
} from "lucide-react";
import { toast } from '@/hooks/use-toast';

import { ReportGenerationModalProps } from '@/types/modalInterfaces';

export function ReportGenerationModal({ isOpen, onClose, onGenerate }: ReportGenerationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'analytics',
    format: 'pdf'
  });
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
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
      if (onGenerate) {
        await onGenerate(formData);
      }
      toast({
        title: "Succès",
        description: "Le rapport a été généré avec succès.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la génération du rapport.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Génération de Rapport
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du rapport *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Rapport d'activité mensuel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type de rapport</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analytics">Analytique</SelectItem>
                  <SelectItem value="compliance">Conformité</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
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
              placeholder="Décrivez le contenu et l'objectif de ce rapport"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format de sortie</Label>
            <Select value={formData.format} onValueChange={(value) => setFormData(prev => ({ ...prev, format: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Génération..." : "Générer le rapport"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}