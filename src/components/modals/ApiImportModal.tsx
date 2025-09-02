import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Settings, Key, Globe } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface ApiImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
}

export function ApiImportModal({ isOpen, onClose, context }: ApiImportModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    apiUrl: '',
    apiKey: '',
    method: 'GET',
    dataType: 'json',
    endpoint: '',
    headers: '',
    timeout: 30,
    retryOnError: true,
    validateData: true,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Import API:', formData);
    toast({
      title: "Import API configuré",
      description: "L'import via API a été configuré avec succès.",
    });
    onClose();
    setFormData({
      apiUrl: '',
      apiKey: '',
      method: 'GET',
      dataType: 'json',
      endpoint: '',
      headers: '',
      timeout: 30,
      retryOnError: true,
      validateData: true,
      description: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Import via API
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="apiUrl">URL de l'API</Label>
            <Input
              id="apiUrl"
              value={formData.apiUrl}
              onChange={(e) => setFormData({...formData, apiUrl: e.target.value})}
              placeholder="https://api.example.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="method">Méthode HTTP</Label>
              <Select onValueChange={(value) => setFormData({...formData, method: value})}>
                <SelectTrigger id="method">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dataType">Type de données</Label>
              <Select onValueChange={(value) => setFormData({...formData, dataType: value})}>
                <SelectTrigger id="dataType">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="text">Texte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="apiKey">Clé API</Label>
            <Input
              id="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
              placeholder="Votre clé API"
            />
          </div>

          <div>
            <Label htmlFor="endpoint">Endpoint</Label>
            <Input
              id="endpoint"
              value={formData.endpoint}
              onChange={(e) => setFormData({...formData, endpoint: e.target.value})}
              placeholder="/api/data"
            />
          </div>

          <div>
            <Label htmlFor="headers">Headers (JSON)</Label>
            <Textarea
              id="headers"
              value={formData.headers}
              onChange={(e) => setFormData({...formData, headers: e.target.value})}
              placeholder='{"Content-Type": "application/json"}'
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="timeout">Timeout (secondes)</Label>
            <Input
              id="timeout"
              type="number"
              value={formData.timeout}
              onChange={(e) => setFormData({...formData, timeout: parseInt(e.target.value)})}
              min="1"
              max="300"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="retryOnError"
                checked={formData.retryOnError}
                onCheckedChange={(checked) => setFormData({...formData, retryOnError: checked as boolean})}
              />
              <Label htmlFor="retryOnError">Réessayer en cas d'erreur</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="validateData"
                checked={formData.validateData}
                onCheckedChange={(checked) => setFormData({...formData, validateData: checked as boolean})}
              />
              <Label htmlFor="validateData">Valider les données</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Description de l'import"
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