import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Phone, Building, Calendar, Shield, Key } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: string;
  onSave?: (userData: Record<string, unknown>) => void;
}

export function UserManagementModal({ isOpen, onClose, action, onSave }: UserManagementModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    position: '',
    employeeId: '',
    hireDate: '',
    manager: '',
    status: 'active',
    accessLevel: 'standard',
    twoFactorAuth: false,
    sendWelcomeEmail: true,
    requirePasswordChange: false,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouvel utilisateur:', formData);
    toast({
      title: "Utilisateur ajouté",
      description: `${formData.firstName} ${formData.lastName} a été ajouté avec succès.`,
    });
    onClose();
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      position: '',
      employeeId: '',
      hireDate: '',
      manager: '',
      status: 'active',
      accessLevel: 'standard',
      twoFactorAuth: false,
      sendWelcomeEmail: true,
      requirePasswordChange: false,
      notes: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Ajouter un utilisateur
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

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+213 XX XX XX XX"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrator">Administrateur</SelectItem>
                  <SelectItem value="manager">Gestionnaire</SelectItem>
                  <SelectItem value="jurist">Juriste</SelectItem>
                  <SelectItem value="validator">Valideur</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="reader">Lecteur</SelectItem>
                  <SelectItem value="archivist">Archiviste</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="moderator">Modérateur</SelectItem>
                  <SelectItem value="analyst">Analyste</SelectItem>
                  <SelectItem value="auditor">Auditeur</SelectItem>
                  <SelectItem value="trainer">Formateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Département</Label>
              <Select onValueChange={(value) => setFormData({...formData, department: value})}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="justice">Justice</SelectItem>
                  <SelectItem value="interior">Intérieur</SelectItem>
                  <SelectItem value="finances">Finances</SelectItem>
                  <SelectItem value="health">Santé</SelectItem>
                  <SelectItem value="education">Éducation</SelectItem>
                  <SelectItem value="labor">Travail</SelectItem>
                  <SelectItem value="commerce">Commerce</SelectItem>
                  <SelectItem value="agriculture">Agriculture</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="environment">Environnement</SelectItem>
                  <SelectItem value="culture">Culture</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Poste</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                placeholder="Ex: Juriste Senior"
              />
            </div>
            <div>
              <Label htmlFor="employeeId">Numéro d'employé</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                placeholder="EMP-2024-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hireDate">Date d'embauche</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="manager">Responsable</Label>
              <Input
                id="manager"
                value={formData.manager}
                onChange={(e) => setFormData({...formData, manager: e.target.value})}
                placeholder="Nom du responsable"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="accessLevel">Niveau d'accès</Label>
              <Select onValueChange={(value) => setFormData({...formData, accessLevel: value})}>
                <SelectTrigger id="accessLevel">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Accès complet</SelectItem>
                  <SelectItem value="standard">Accès standard</SelectItem>
                  <SelectItem value="limited">Accès limité</SelectItem>
                  <SelectItem value="readonly">Lecture seule</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="twoFactorAuth"
                checked={formData.twoFactorAuth}
                onCheckedChange={(checked) => setFormData({...formData, twoFactorAuth: checked as boolean})}
              />
              <Label htmlFor="twoFactorAuth">Authentification à deux facteurs</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendWelcomeEmail"
                checked={formData.sendWelcomeEmail}
                onCheckedChange={(checked) => setFormData({...formData, sendWelcomeEmail: checked as boolean})}
              />
              <Label htmlFor="sendWelcomeEmail">Envoyer un email de bienvenue</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requirePasswordChange"
                checked={formData.requirePasswordChange}
                onCheckedChange={(checked) => setFormData({...formData, requirePasswordChange: checked as boolean})}
              />
              <Label htmlFor="requirePasswordChange">Changement de mot de passe obligatoire</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Notes supplémentaires sur l'utilisateur"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Ajouter l'utilisateur
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}