import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Scale, BookOpen, Gavel, Users } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface LegalDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LegalDomainModal({ isOpen, onClose }: LegalDomainModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    jurisdiction: '',
    isActive: true,
    requiresSpecialization: false,
    hasAppeals: true,
    maxAppeals: '',
    requiresLawyer: false,
    courtLevel: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouveau domaine juridique:', formData);
    toast({
      title: "Domaine juridique ajouté",
      description: `Le domaine "${formData.name}" a été ajouté avec succès.`,
    });
    onClose();
    setFormData({
      name: '',
      code: '',
      description: '',
      category: '',
      jurisdiction: '',
      isActive: true,
      requiresSpecialization: false,
      hasAppeals: true,
      maxAppeals: '',
      requiresLawyer: false,
      courtLevel: '',
      notes: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Ajouter un domaine juridique
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom du domaine</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Droit Civil, Droit Pénal"
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="Ex: CIV, PEN"
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
              placeholder="Description détaillée du domaine juridique"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civil">Droit Civil</SelectItem>
                  <SelectItem value="penal">Droit Pénal</SelectItem>
                  <SelectItem value="commercial">Droit Commercial</SelectItem>
                  <SelectItem value="administrative">Droit Administratif</SelectItem>
                  <SelectItem value="labor">Droit du Travail</SelectItem>
                  <SelectItem value="fiscal">Droit Fiscal</SelectItem>
                  <SelectItem value="international">Droit International</SelectItem>
                  <SelectItem value="family">Droit de la Famille</SelectItem>
                  <SelectItem value="constitutional">Droit Constitutionnel</SelectItem>
                  <SelectItem value="social">Droit Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="jurisdiction">Juridiction</Label>
              <Select onValueChange={(value) => setFormData({...formData, jurisdiction: value})}>
                <SelectTrigger id="jurisdiction">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civil">Civile</SelectItem>
                  <SelectItem value="penal">Pénale</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="commercial">Commerciale</SelectItem>
                  <SelectItem value="labor">Sociale</SelectItem>
                  <SelectItem value="constitutional">Constitutionnelle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="courtLevel">Niveau de tribunal</Label>
              <Select onValueChange={(value) => setFormData({...formData, courtLevel: value})}>
                <SelectTrigger id="courtLevel">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">Première instance</SelectItem>
                  <SelectItem value="appeal">Cour d'appel</SelectItem>
                  <SelectItem value="supreme">Cour suprême</SelectItem>
                  <SelectItem value="constitutional">Conseil constitutionnel</SelectItem>
                  <SelectItem value="administrative">Conseil d'État</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxAppeals">Nombre max d'appels</Label>
              <Input
                id="maxAppeals"
                type="number"
                value={formData.maxAppeals}
                onChange={(e) => setFormData({...formData, maxAppeals: e.target.value})}
                placeholder="2"
                min="0"
                max="5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked as boolean})}
              />
              <Label htmlFor="isActive">Domaine actif</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresSpecialization"
                checked={formData.requiresSpecialization}
                onCheckedChange={(checked) => setFormData({...formData, requiresSpecialization: checked as boolean})}
              />
              <Label htmlFor="requiresSpecialization">Spécialisation requise</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasAppeals"
                checked={formData.hasAppeals}
                onCheckedChange={(checked) => setFormData({...formData, hasAppeals: checked as boolean})}
              />
              <Label htmlFor="hasAppeals">Possibilité d'appel</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresLawyer"
                checked={formData.requiresLawyer}
                onCheckedChange={(checked) => setFormData({...formData, requiresLawyer: checked as boolean})}
              />
              <Label htmlFor="requiresLawyer">Avocat obligatoire</Label>
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
              Ajouter le domaine
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}