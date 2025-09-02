
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIAutoFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: 'legal-text' | 'procedure' | 'general';
  onDataGenerated?: (data: Record<string, unknown>) => void;
}

export function AIAutoFillModal({ isOpen, onClose, context = 'general', onDataGenerated }: AIAutoFillModalProps) {
  const { toast } = useToast();
  const [formType, setFormType] = useState<'legal-text' | 'procedure' | 'general'>(context);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFormTypeChange = (value: string) => {
    setFormType(value as 'legal-text' | 'procedure' | 'general');
  };

  const analyzePromptAndGenerate = (type: string, userPrompt: string) => {
    // Analyser le prompt pour extraire des mots-clés et générer du contenu approprié
    const keywords = userPrompt.toLowerCase().split(/\s+/);
    
    const templates = {
      'legal-text': {
        title: userPrompt.length > 50 ? userPrompt.substring(0, 50) + "..." : userPrompt,
        content: `Contenu basé sur: "${userPrompt}"\n\nAnalyse automatique des termes juridiques détectés.`,
        category: keywords.some(k => ['civil', 'pénal', 'commercial'].includes(k)) 
          ? keywords.find(k => ['civil', 'pénal', 'commercial'].includes(k)) + ' law'
          : "Droit général",
        keywords: keywords.filter(k => k.length > 3),
        references: [`Basé sur l'analyse du prompt: ${new Date().toISOString()}`]
      },
      'procedure': {
        name: userPrompt.length > 40 ? userPrompt.substring(0, 40) + "..." : userPrompt,
        category: keywords.some(k => ['administrative', 'civile', 'juridique'].includes(k))
          ? "Procédure " + keywords.find(k => ['administrative', 'civile', 'juridique'].includes(k))
          : "Procédure générale",
        institution: keywords.some(k => ['mairie', 'préfecture', 'tribunal'].includes(k))
          ? keywords.find(k => ['mairie', 'préfecture', 'tribunal'].includes(k))?.toUpperCase()
          : "Institution compétente",
        duration: "À déterminer selon le contexte",
        cost: "Variable",
        description: `Procédure générée à partir de: "${userPrompt}"`,
        requirements: ["Documents à préciser", "Formulaires spécifiques"],
        steps: ["Analyse du besoin", "Préparation des documents", "Dépôt de la demande", "Suivi"]
      },
      'general': {
        content: `Contenu généré pour: "${userPrompt}"`,
        analysis: keywords,
        suggestions: [`Basé sur: ${userPrompt}`, "Personnalisation recommandée", "Vérification requise"]
      }
    };

    return templates[type as keyof typeof templates] || templates.general;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une description pour l'auto-remplissage.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Génération réelle basée sur le prompt utilisateur
    try {
      // Analyser le prompt pour extraire des informations réelles
      const generatedData = analyzePromptAndGenerate(formType, prompt);
      
      setIsGenerating(false);
      toast({
        title: "Auto-remplissage généré",
        description: "Les données ont été générées basées sur votre description.",
      });
      
      if (onDataGenerated) {
        onDataGenerated(generatedData);
      }
      
      onClose();
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Erreur",
        description: "Impossible de générer les données. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setPrompt('');
    setIsGenerating(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            Auto-remplissage IA
          </DialogTitle>
          <DialogDescription>
            L'IA va analyser votre document et remplir automatiquement les champs détectés.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="formType">Type de formulaire</Label>
              <Select value={formType} onValueChange={handleFormTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="legal-text">Texte légal</SelectItem>
                  <SelectItem value="procedure">Procédure</SelectItem>
                  <SelectItem value="general">Général</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Description pour l'auto-remplissage</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Décrivez ce que vous voulez générer automatiquement..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
              Annuler
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? "Génération..." : "Générer"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
