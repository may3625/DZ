import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Search, BookOpen, Scale } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface LegalTextConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  text?: any;
}

export function LegalTextConsultationModal({ isOpen, onClose, text }: LegalTextConsultationModalProps) {
  if (!text) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {text.title || 'Consultation de texte juridique'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <span className="font-semibold text-gray-700">Type :</span> {text.type}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Statut :</span> {text.status}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Catégorie :</span> {text.category}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Autorité :</span> {text.authority}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Date de publication :</span> {text.publishDate}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Numéro JO :</span> {text.joNumber}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Description :</span>
            <div className="text-gray-800 mt-1">{text.description}</div>
          </div>
          {text.content && (
            <div>
              <span className="font-semibold text-gray-700">Contenu :</span>
              <div className="bg-gray-50 border rounded p-3 mt-1 max-h-96 overflow-auto whitespace-pre-line text-gray-900">
                {text.content}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}