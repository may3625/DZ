import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Brain, Filter, Target } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface SemanticSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchType?: string;
  title?: string;
}

export function SemanticSearchModal({ isOpen, onClose, searchType, title }: SemanticSearchModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    query: '',
    searchType: 'semantic',
    language: 'fr',
    maxResults: 50,
    similarity: 0.7,
    includeSynonyms: true,
    includeContext: true,
    filterByDate: false,
    filterByCategory: false,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Recherche sémantique:', formData);
    toast({
      title: "Recherche configurée",
      description: "La recherche sémantique a été configurée avec succès.",
    });
    onClose();
    setFormData({
      query: '',
      searchType: 'semantic',
      language: 'fr',
      maxResults: 50,
      similarity: 0.7,
      includeSynonyms: true,
      includeContext: true,
      filterByDate: false,
      filterByCategory: false,
      description: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche sémantique
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="query">Requête de recherche</Label>
            <Textarea
              id="query"
              value={formData.query}
              onChange={(e) => setFormData({...formData, query: e.target.value})}
              placeholder="Décrivez ce que vous recherchez..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="searchType">Type de recherche</Label>
              <Select onValueChange={(value) => setFormData({...formData, searchType: value})}>
                <SelectTrigger id="searchType">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semantic">Sémantique</SelectItem>
                  <SelectItem value="keyword">Mots-clés</SelectItem>
                  <SelectItem value="fuzzy">Floue</SelectItem>
                  <SelectItem value="exact">Exacte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="language">Langue</Label>
              <Select onValueChange={(value) => setFormData({...formData, language: value})}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">Anglais</SelectItem>
                  <SelectItem value="es">Espagnol</SelectItem>
                  <SelectItem value="de">Allemand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxResults">Nombre max de résultats</Label>
              <Input
                id="maxResults"
                type="number"
                value={formData.maxResults}
                onChange={(e) => setFormData({...formData, maxResults: parseInt(e.target.value)})}
                min="1"
                max="1000"
              />
            </div>
            <div>
              <Label htmlFor="similarity">Seuil de similarité</Label>
              <Input
                id="similarity"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={formData.similarity}
                onChange={(e) => setFormData({...formData, similarity: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeSynonyms"
                checked={formData.includeSynonyms}
                onCheckedChange={(checked) => setFormData({...formData, includeSynonyms: checked as boolean})}
              />
              <Label htmlFor="includeSynonyms">Inclure les synonymes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeContext"
                checked={formData.includeContext}
                onCheckedChange={(checked) => setFormData({...formData, includeContext: checked as boolean})}
              />
              <Label htmlFor="includeContext">Inclure le contexte</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filterByDate"
                checked={formData.filterByDate}
                onCheckedChange={(checked) => setFormData({...formData, filterByDate: checked as boolean})}
              />
              <Label htmlFor="filterByDate">Filtrer par date</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filterByCategory"
                checked={formData.filterByCategory}
                onCheckedChange={(checked) => setFormData({...formData, filterByCategory: checked as boolean})}
              />
              <Label htmlFor="filterByCategory">Filtrer par catégorie</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Notes</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Notes supplémentaires sur la recherche"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Lancer la recherche
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}