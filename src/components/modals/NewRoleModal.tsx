import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface NewRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (roleData: Record<string, unknown>) => void;
}

export function NewRoleModal({ isOpen, onClose, onSave }: NewRoleModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    color: 'blue'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouveau rôle:', formData);
    toast({
      title: "Rôle ajouté",
      description: `Le rôle "${formData.name}" a été ajouté avec succès.`,
    });
    onClose();
    setFormData({ name: '', description: '', permissions: [], color: 'blue' });
  };

  const permissions = [
    { id: 'read', label: 'Lecture' },
    { id: 'write', label: 'Écriture' },
    { id: 'delete', label: 'Suppression' },
    { id: 'admin', label: 'Administration' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Ajouter un nouveau rôle
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du rôle</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">Couleur</Label>
              <Select onValueChange={(value) => setFormData({...formData, color: value})}>
                <SelectTrigger id="color">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Bleu</SelectItem>
                  <SelectItem value="green">Vert</SelectItem>
                  <SelectItem value="red">Rouge</SelectItem>
                  <SelectItem value="purple">Violet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission.id}
                    checked={formData.permissions.includes(permission.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({...formData, permissions: [...formData.permissions, permission.id]});
                      } else {
                        setFormData({...formData, permissions: formData.permissions.filter(p => p !== permission.id)});
                      }
                    }}
                  />
                  <Label htmlFor={permission.id} className="text-sm">
                    {permission.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Ajouter le rôle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}