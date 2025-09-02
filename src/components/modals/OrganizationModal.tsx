import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, MapPin, Phone, Mail, Globe } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrganizationModal({ isOpen, onClose }: OrganizationModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    type: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    isActive: true,
    isPublic: true,
    hasJurisdiction: false,
    jurisdictionArea: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouvelle organisation:', formData);
    toast({
      title: "Organisation ajoutée",
      description: `L'organisation "${formData.name}" a été ajoutée avec succès.`,
    });
    onClose();
    setFormData({
      name: '',
      code: '',
      description: '',
      type: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      website: '',
      isActive: true,
      isPublic: true,
      hasJurisdiction: false,
      jurisdictionArea: '',
      notes: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Ajouter une organisation
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom de l'organisation</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Ministère de la Justice"
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="Ex: MJUS"
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
              placeholder="Description de l'organisation"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type d'organisation</Label>
              <Select onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ministry">Ministère</SelectItem>
                  <SelectItem value="agency">Agence</SelectItem>
                  <SelectItem value="court">Tribunal</SelectItem>
                  <SelectItem value="council">Conseil</SelectItem>
                  <SelectItem value="authority">Autorité</SelectItem>
                  <SelectItem value="institute">Institut</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="commission">Commission</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="Ex: Alger"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Adresse complète"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+213 XX XX XX XX"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="contact@organisation.dz"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              placeholder="https://www.organisation.dz"
            />
          </div>

          <div>
            <Label htmlFor="jurisdictionArea">Zone de compétence</Label>
            <Input
              id="jurisdictionArea"
              value={formData.jurisdictionArea}
              onChange={(e) => setFormData({...formData, jurisdictionArea: e.target.value})}
              placeholder="Ex: Tout le territoire national"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked as boolean})}
              />
              <Label htmlFor="isActive">Organisation active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({...formData, isPublic: checked as boolean})}
              />
              <Label htmlFor="isPublic">Organisation publique</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasJurisdiction"
                checked={formData.hasJurisdiction}
                onCheckedChange={(checked) => setFormData({...formData, hasJurisdiction: checked as boolean})}
              />
              <Label htmlFor="hasJurisdiction">A une compétence territoriale</Label>
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
              Ajouter l'organisation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}