import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, BookOpen, Scale } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface LegalTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LegalTypeModal({ isOpen, onClose }: LegalTypeModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    hierarchy: '',
    isActive: true,
    requiresSignature: false,
    hasExpiration: false,
    expirationPeriod: '',
    publicationRequired: true,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouveau type de texte:', formData);
    toast({
      title: "Type de texte ajouté",
      description: `Le type "${formData.name}" a été ajouté avec succès.`,
    });
    onClose();
    setFormData({
      name: '',
      code: '',
      description: '',
      category: '',
      hierarchy: '',
      isActive: true,
      requiresSignature: false,
      hasExpiration: false,
      expirationPeriod: '',
      publicationRequired: true,
      notes: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ajouter un type de texte juridique
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom du type</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Loi, Décret, Arrêté"
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="Ex: LOI, DEC, ARR"
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
              placeholder="Description détaillée du type de texte"
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
                  <SelectItem value="constitutionnel">Constitutionnel</SelectItem>
                  <SelectItem value="legislatif">Législatif</SelectItem>
                  <SelectItem value="reglementaire">Réglementaire</SelectItem>
                  <SelectItem value="administratif">Administratif</SelectItem>
                  <SelectItem value="judiciaire">Judiciaire</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hierarchy">Hiérarchie</Label>
              <Select onValueChange={(value) => setFormData({...formData, hierarchy: value})}>
                <SelectTrigger id="hierarchy">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supreme">Suprême</SelectItem>
                  <SelectItem value="superior">Supérieur</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="inferior">Inférieur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expirationPeriod">Période d'expiration</Label>
              <Select onValueChange={(value) => setFormData({...formData, expirationPeriod: value})}>
                <SelectTrigger id="expirationPeriod">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  <SelectItem value="1year">1 an</SelectItem>
                  <SelectItem value="2years">2 ans</SelectItem>
                  <SelectItem value="5years">5 ans</SelectItem>
                  <SelectItem value="10years">10 ans</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked as boolean})}
                />
                <Label htmlFor="isActive">Actif</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresSignature"
                  checked={formData.requiresSignature}
                  onCheckedChange={(checked) => setFormData({...formData, requiresSignature: checked as boolean})}
                />
                <Label htmlFor="requiresSignature">Signature requise</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasExpiration"
                checked={formData.hasExpiration}
                onCheckedChange={(checked) => setFormData({...formData, hasExpiration: checked as boolean})}
              />
              <Label htmlFor="hasExpiration">A une date d'expiration</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="publicationRequired"
                checked={formData.publicationRequired}
                onCheckedChange={(checked) => setFormData({...formData, publicationRequired: checked as boolean})}
              />
              <Label htmlFor="publicationRequired">Publication obligatoire</Label>
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
              Ajouter le type
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}