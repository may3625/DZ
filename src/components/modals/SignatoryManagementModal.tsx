import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UserCheck, Mail, Shield, Calendar } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface SignatoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignatoryManagementModal({ isOpen, onClose }: SignatoryManagementModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    department: '',
    signatureType: 'digital',
    autoApprove: false,
    notificationEmail: true,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouveau signataire:', formData);
    toast({
      title: "Signataire ajouté",
      description: `${formData.firstName} ${formData.lastName} a été ajouté comme signataire.`,
    });
    onClose();
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      department: '',
      signatureType: 'digital',
      autoApprove: false,
      notificationEmail: true,
      description: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Ajouter un signataire
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="director">Directeur</SelectItem>
                  <SelectItem value="ceo">PDG</SelectItem>
                  <SelectItem value="legal">Juridique</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Département</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="signatureType">Type de signature</Label>
            <Select onValueChange={(value) => setFormData({...formData, signatureType: value})}>
              <SelectTrigger id="signatureType">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="digital">Signature électronique</SelectItem>
                <SelectItem value="manual">Signature manuelle</SelectItem>
                <SelectItem value="certified">Signature certifiée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoApprove"
                checked={formData.autoApprove}
                onCheckedChange={(checked) => setFormData({...formData, autoApprove: checked as boolean})}
              />
              <Label htmlFor="autoApprove">Approbation automatique</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notificationEmail"
                checked={formData.notificationEmail}
                onCheckedChange={(checked) => setFormData({...formData, notificationEmail: checked as boolean})}
              />
              <Label htmlFor="notificationEmail">Notification par email</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Notes</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Informations supplémentaires"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Ajouter le signataire
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}