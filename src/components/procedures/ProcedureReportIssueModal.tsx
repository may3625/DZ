import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, FileText, Bug, Eye, HelpCircle, Send, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface ProcedureReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  relatedProcedure?: {
    id: string | number;
    title: string;
    type?: string;
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

export function ProcedureReportIssueModal({ isOpen, onClose, relatedProcedure }: ProcedureReportIssueModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [report, setReport] = useState<IssueReport>({
    type: '',
    title: '',
    description: '',
    priority: 'medium',
    contactEmail: '',
    relatedUrl: typeof window !== 'undefined' ? window.location.href : ''
  });

  const issueTypes = [
    {
      value: 'error_procedure',
      label: 'Erreur dans une procédure',
      icon: ClipboardList,
      description: 'Contenu incorrect, étapes erronées, informations périmées'
    },
    {
      value: 'missing_procedure',
      label: 'Procédure manquante',
      icon: HelpCircle,
      description: 'Procédure administrative non disponible dans la base'
    },
    {
      value: 'display_issue',
      label: "Problème d'affichage",
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
    if (!report.type) {
      toast({ title: 'Type de problème requis', description: 'Veuillez sélectionner le type de problème.', variant: 'destructive' });
      return;
    }
    if (!report.description.trim()) {
      toast({ title: 'Description requise', description: 'Veuillez décrire le problème rencontré.', variant: 'destructive' });
      return;
    }
    if (report.description.trim().length < 10) {
      toast({ title: 'Description trop courte', description: 'Veuillez fournir une description plus détaillée (minimum 10 caractères).', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const fullReport = {
        ...report,
        relatedProcedure,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : ''
      };
      console.log('Procedure issue report submitted:', fullReport);
      toast({ title: 'Signalement envoyé avec succès', description: 'Merci pour votre signalement. Notre équipe va examiner le problème.' });
      setReport({ type: '', title: '', description: '', priority: 'medium', contactEmail: '', relatedUrl: typeof window !== 'undefined' ? window.location.href : '' });
      onClose();
    } catch (error) {
      toast({ title: "Erreur lors de l'envoi", description: "Une erreur est survenue lors de l'envoi du signalement.", variant: 'destructive' });
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
          {relatedProcedure && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">Procédure associée</div>
                    <div className="text-sm text-blue-700">
                      {relatedProcedure.title}{relatedProcedure.type ? ` (${relatedProcedure.type})` : ''}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <Label className="text-sm font-medium">Type de problème *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {issueTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = report.type === type.value;
                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-red-300 bg-red-50 ring-2 ring-red-200' : 'border-gray-200 hover:border-gray-300'}`}
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

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Titre du problème (optionnel)
            </Label>
            <Input
              id="title"
              type="text"
              placeholder={selectedIssueType ? `Ex: Erreur dans ${selectedIssueType.label.toLowerCase()}...` : 'Résumé en quelques mots'}
              value={report.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description détaillée *
            </Label>
            <Textarea
              id="description"
              placeholder="Décrivez le problème rencontré avec la procédure..."
              value={report.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isSubmitting}
              className="min-h-32"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priorité</Label>
              <Select value={report.priority} onValueChange={(v) => handleInputChange('priority', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la priorité" />
                </SelectTrigger>
                <SelectContent>
                  {priorityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-sm font-medium">
                Email de contact (optionnel)
              </Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="exemple@domaine.dz"
                value={report.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relatedUrl" className="text-sm font-medium">
              URL liée (optionnel)
            </Label>
            <Input
              id="relatedUrl"
              type="url"
              placeholder="https://..."
              value={report.relatedUrl}
              onChange={(e) => handleInputChange('relatedUrl', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}