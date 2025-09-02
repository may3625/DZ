import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, Database, Settings } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
  onImportComplete?: (results: Record<string, unknown>[]) => void;
}

export function BatchImportModal({ isOpen, onClose, context, onImportComplete }: BatchImportModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fileName: '',
    fileType: 'csv',
    delimiter: ',',
    encoding: 'utf-8',
    skipHeader: true,
    validateData: true,
    updateExisting: false,
    batchSize: 100,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Import par lot:', formData);
    toast({
      title: "Import par lot configuré",
      description: "L'import par lot a été configuré avec succès.",
    });
    onClose();
    setFormData({
      fileName: '',
      fileType: 'csv',
      delimiter: ',',
      encoding: 'utf-8',
      skipHeader: true,
      validateData: true,
      updateExisting: false,
      batchSize: 100,
      description: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import par lot
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fileName">Nom du fichier</Label>
            <Input
              id="fileName"
              value={formData.fileName}
              onChange={(e) => setFormData({...formData, fileName: e.target.value})}
              placeholder="data.csv"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fileType">Type de fichier</Label>
              <Select onValueChange={(value) => setFormData({...formData, fileType: value})}>
                <SelectTrigger id="fileType">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="encoding">Encodage</Label>
              <Select onValueChange={(value) => setFormData({...formData, encoding: value})}>
                <SelectTrigger id="encoding">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utf-8">UTF-8</SelectItem>
                  <SelectItem value="latin1">Latin-1</SelectItem>
                  <SelectItem value="windows-1252">Windows-1252</SelectItem>
                  <SelectItem value="iso-8859-1">ISO-8859-1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.fileType === 'csv' && (
            <div>
              <Label htmlFor="delimiter">Délimiteur</Label>
              <Select onValueChange={(value) => setFormData({...formData, delimiter: value})}>
                <SelectTrigger id="delimiter">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Virgule (,)</SelectItem>
                  <SelectItem value=";">Point-virgule (;)</SelectItem>
                  <SelectItem value="\t">Tabulation</SelectItem>
                  <SelectItem value="|">Pipe (|)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="batchSize">Taille du lot</Label>
            <Input
              id="batchSize"
              type="number"
              value={formData.batchSize}
              onChange={(e) => setFormData({...formData, batchSize: parseInt(e.target.value)})}
              min="1"
              max="10000"
              placeholder="100"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skipHeader"
                checked={formData.skipHeader}
                onCheckedChange={(checked) => setFormData({...formData, skipHeader: checked as boolean})}
              />
              <Label htmlFor="skipHeader">Ignorer l'en-tête</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="validateData"
                checked={formData.validateData}
                onCheckedChange={(checked) => setFormData({...formData, validateData: checked as boolean})}
              />
              <Label htmlFor="validateData">Valider les données</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="updateExisting"
                checked={formData.updateExisting}
                onCheckedChange={(checked) => setFormData({...formData, updateExisting: checked as boolean})}
              />
              <Label htmlFor="updateExisting">Mettre à jour les enregistrements existants</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Description de l'import par lot"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Configurer l'import
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}