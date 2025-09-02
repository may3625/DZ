import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminUserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminUserManagementModal: React.FC<AdminUserManagementModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Gestion des utilisateurs</DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle>Administration des utilisateurs</CardTitle>
            <CardDescription>Interface de gestion des comptes utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Interface de gestion des utilisateurs en cours de développement.</p>
              <Button onClick={onClose}>Fermer</Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};