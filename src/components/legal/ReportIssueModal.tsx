import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, FileText, Bug, Eye, HelpCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  relatedDocument?: {
    id: string;
    title: string;
    type: string;
  };
}

interface IssueReport {
  type: string;
  title: string;
  description: string;
  priority: string;
  contactEmail?: string;
  relatedUrl?: string;
}

export function ReportIssueModal({ isOpen, onClose, relatedDocument }: ReportIssueModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [report, setReport] = useState<IssueReport>({
    type: '',
    title: '',
    description: '',
    priority: 'medium',
    contactEmail: '',
    relatedUrl: window.location.href
  });

  const issueTypes = [
    { 
      value: 'error_text', 
      label: 'Erreur dans un texte juridique', 
      icon: FileText,
      description: 'Contenu incorrect, fautes de frappe, références erronées'
    },
    { 
      value: 'missing_text', 
      label: 'Texte manquant', 
      icon: HelpCircle,
      description: 'Document juridique non disponible dans la base'
    },
    { 
      value: 'display_issue', 
      label: 'Problème d\'affichage', 
      icon: Eye,
      description: 'Mise en forme, problème de lecture, images manquantes'
    },
    { 
      value: 'technical_bug', 
      label: 'Bug technique', 
      icon: Bug,
      description: 'Fonctionnalité qui ne marche pas, erreur système'
    },
    { 
      value: 'other', 
      label: 'Autre', 
      icon: AlertTriangle,
      description: 'Tout autre problème non listé ci-dessus'
    }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Faible', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'medium', label: 'Moyen', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { value: 'high', label: 'Élevé', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-50' }
  ];

  const handleInputChange = (field: keyof IssueReport, value: string) => {
    setReport(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!report.type) {
      toast({
        title: "Type de problème requis",
        description: "Veuillez sélectionner le type de problème.",
        variant: "destructive"
      });
      return;
    }

    if (!report.description.trim()) {
      toast({
        title: "Description requise",
        description: "Veuillez décrire le problème rencontré.",
        variant: "destructive"
      });
      return;
    }

    if (report.description.trim().length < 10) {
      toast({
        title: "Description trop courte",
        description: "Veuillez fournir une description plus détaillée (minimum 10 caractères).",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulation de l'envoi du rapport
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Construire l'objet du rapport complet
      const fullReport = {
        ...report,
        relatedDocument,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      console.log('Issue report submitted:', fullReport);

      // Ici, vous pourriez envoyer les données à votre API
      // await sendIssueReport(fullReport);

      toast({
        title: "Signalement envoyé avec succès",
        description: "Merci pour votre signalement. Notre équipe va examiner le problème dans les plus brefs délais."
      });

      // Reset du formulaire et fermeture
      setReport({
        type: '',
        title: '',
        description: '',
        priority: 'medium',
        contactEmail: '',
        relatedUrl: window.location.href
      });
      
      onClose();

    } catch (error) {
      toast({
        title: "Erreur lors de l'envoi",
        description: "Une erreur est survenue lors de l'envoi du signalement. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const selectedIssueType = issueTypes.find(type => type.value === report.type);
  const selectedPriority = priorityLevels.find(level => level.value === report.priority);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Signaler un problème
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Document associé */}
          {relatedDocument && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">Document associé</div>
                    <div className="text-sm text-blue-700">
                      {relatedDocument.title} ({relatedDocument.type})
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Type de problème */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Type de problème *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {issueTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = report.type === type.value;
                
                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected 
                        ? 'border-red-300 bg-red-50 ring-2 ring-red-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('type', type.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <IconComponent className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-red-600' : 'text-gray-500'}`} />
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${isSelected ? 'text-red-900' : 'text-gray-900'}`}>
                            {type.label}
                          </div>
                          <div className={`text-xs mt-1 ${isSelected ? 'text-red-700' : 'text-gray-600'}`}>
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Titre du problème */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Titre du problème (optionnel)
            </Label>
            <Input
              id="title"
              type="text"
              placeholder={selectedIssueType ? `Ex: Erreur dans ${selectedIssueType.label.toLowerCase()}...` : "Résumé en quelques mots"}
              value={report.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Description détaillée */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description détaillée *
            </Label>
            <Textarea
              id="description"
              placeholder="Décrivez le problème de manière détaillée. Plus votre description est précise, plus nous pourrons vous aider rapidement..."
              value={report.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={5}
              disabled={isSubmitting}
              className="resize-none"
            />
            <div className="text-xs text-gray-500">
              {report.description.length}/500 caractères minimum: 10
            </div>
          </div>

          {/* Priorité */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priorité</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {priorityLevels.map((level) => {
                const isSelected = report.priority === level.value;
                
                return (
                  <Button
                    key={level.value}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange('priority', level.value)}
                    disabled={isSubmitting}
                    className={isSelected ? `${level.bgColor} ${level.color} border-current` : ''}
                  >
                    {level.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Email de contact */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email de contact (optionnel)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="votre.email@exemple.com"
              value={report.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              disabled={isSubmitting}
            />
            <div className="text-xs text-gray-500">
              Laissez votre email si vous souhaitez être informé de la résolution du problème
            </div>
          </div>

          {/* Informations techniques */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">
                <div className="font-medium mb-2">Informations techniques automatiques :</div>
                <div className="space-y-1 text-xs">
                  <div>• URL: {window.location.href}</div>
                  <div>• Navigateur: {navigator.userAgent.split(' ').slice(-2).join(' ')}</div>
                  <div>• Date: {new Date().toLocaleString('fr-FR')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !report.type || !report.description.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer le signalement
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}