import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FolderOpen, Clock, Users, FileText } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface ProcedureCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProcedureCategoryModal({ isOpen, onClose }: ProcedureCategoryModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    department: '',
    estimatedDuration: '',
    requiresApproval: false,
    isPublic: true,
    hasDeadline: false,
    deadlineDays: '',
    requiresDocuments: false,
    maxParticipants: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouvelle catégorie de procédure:', formData);
    toast({
      title: "Catégorie ajoutée",
      description: `La catégorie "${formData.name}" a été ajoutée avec succès.`,
    });
    onClose();
    setFormData({
      name: '',
      code: '',
      description: '',
      department: '',
      estimatedDuration: '',
      requiresApproval: false,
      isPublic: true,
      hasDeadline: false,
      deadlineDays: '',
      requiresDocuments: false,
      maxParticipants: '',
      notes: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Ajouter une catégorie de procédure
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom de la catégorie</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: État Civil, Urbanisme"
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="Ex: ETI, URB"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Description détaillée de la catégorie"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Département responsable</Label>
              <Select onValueChange={(value) => setFormData({...formData, department: value})}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interieur">Intérieur</SelectItem>
                  <SelectItem value="justice">Justice</SelectItem>
                  <SelectItem value="finances">Finances</SelectItem>
                  <SelectItem value="sante">Santé</SelectItem>
                  <SelectItem value="education">Éducation</SelectItem>
                  <SelectItem value="travail">Travail</SelectItem>
                  <SelectItem value="commerce">Commerce</SelectItem>
                  <SelectItem value="agriculture">Agriculture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estimatedDuration">Durée estimée</Label>
              <Select onValueChange={(value) => setFormData({...formData, estimatedDuration: value})}>
                <SelectTrigger id="estimatedDuration">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1day">1 jour</SelectItem>
                  <SelectItem value="3days">3 jours</SelectItem>
                  <SelectItem value="1week">1 semaine</SelectItem>
                  <SelectItem value="2weeks">2 semaines</SelectItem>
                  <SelectItem value="1month">1 mois</SelectItem>
                  <SelectItem value="3months">3 mois</SelectItem>
                  <SelectItem value="6months">6 mois</SelectItem>
                  <SelectItem value="1year">1 an</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deadlineDays">Délai en jours</Label>
              <Input
                id="deadlineDays"
                type="number"
                value={formData.deadlineDays}
                onChange={(e) => setFormData({...formData, deadlineDays: e.target.value})}
                placeholder="30"
                min="1"
                max="365"
              />
            </div>
            <div>
              <Label htmlFor="maxParticipants">Nombre max de participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                placeholder="10"
                min="1"
                max="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresApproval"
                checked={formData.requiresApproval}
                onCheckedChange={(checked) => setFormData({...formData, requiresApproval: checked as boolean})}
              />
              <Label htmlFor="requiresApproval">Approbation requise</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({...formData, isPublic: checked as boolean})}
              />
              <Label htmlFor="isPublic">Procédure publique</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasDeadline"
                checked={formData.hasDeadline}
                onCheckedChange={(checked) => setFormData({...formData, hasDeadline: checked as boolean})}
              />
              <Label htmlFor="hasDeadline">A un délai obligatoire</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresDocuments"
                checked={formData.requiresDocuments}
                onCheckedChange={(checked) => setFormData({...formData, requiresDocuments: checked as boolean})}
              />
              <Label htmlFor="requiresDocuments">Documents requis</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Notes supplémentaires"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Ajouter la catégorie
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}