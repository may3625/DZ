import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
  PlayCircle,
  HelpCircle,
  MessageSquare,
  Video,
  Lightbulb,
  Navigation
} from 'lucide-react';

interface ProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export function ProcedureConsultationModal({ isOpen, onClose, data }: ProcedureModalProps) {
  if (!data?.procedure) return null;

  const { procedure, content, relatedProcedures, legalBasis } = data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {procedure.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="steps">Étapes détaillées</TabsTrigger>
            <TabsTrigger value="requirements">Prérequis</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* Informations générales */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Catégorie</Label>
                    <p className="text-sm text-muted-foreground">{procedure.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Ministère de tutelle</Label>
                    <p className="text-sm text-muted-foreground">{procedure.ministry}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="text-sm text-muted-foreground">{procedure.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Dernière mise à jour</Label>
                    <p className="text-sm text-muted-foreground">{procedure.lastUpdate}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{content.description}</p>
                </div>

                {/* Objectif */}
                <div>
                  <h4 className="font-semibold mb-2">Objectif</h4>
                  <p className="text-sm text-muted-foreground">{content.objective}</p>
                </div>

                {/* Champ d'application */}
                <div>
                  <h4 className="font-semibold mb-2">Champ d'application</h4>
                  <p className="text-sm text-muted-foreground">{content.scope}</p>
                </div>

                {/* Base légale */}
                <div>
                  <h4 className="font-semibold mb-2">Base légale</h4>
                  <div className="space-y-2">
                    {legalBasis?.map((law: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{law}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="steps" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-6 pr-4">
                {content.steps?.map((step: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {step.number}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium mb-2">{step.title}</h5>
                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          {step.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{step.duration}</span>
                            </div>
                          )}
                          {step.cost && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>{step.cost}</span>
                            </div>
                          )}
                          {step.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{step.location}</span>
                            </div>
                          )}
                          {step.tracking && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>{step.tracking}</span>
                            </div>
                          )}
                        </div>

                        {step.documents && (
                          <div className="mt-3">
                            <Label className="text-xs font-medium">Documents requis :</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {step.documents.map((doc: string, docIndex: number) => (
                                <Badge key={docIndex} variant="secondary" className="text-xs">
                                  {doc}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {step.requirements && (
                          <div className="mt-3">
                            <Label className="text-xs font-medium">Conditions :</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {step.requirements.map((req: string, reqIndex: number) => (
                                <Badge key={reqIndex} variant="outline" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="requirements" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-6 pr-4">
                <div>
                  <h4 className="font-semibold mb-3">Conditions générales</h4>
                  <div className="space-y-2">
                    {content.requirements?.general?.map((req: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Documents obligatoires</h4>
                  <div className="space-y-2">
                    {content.requirements?.documents?.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Frais</h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{content.requirements?.fees}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="contacts" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-6 pr-4">
                <div>
                  <h4 className="font-semibold mb-3">Contacts utiles</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Numéro vert</div>
                        <div className="text-sm text-muted-foreground">{content.contacts?.hotline}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Mail className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-sm text-muted-foreground">{content.contacts?.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Globe className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Site web</div>
                        <div className="text-sm text-muted-foreground">{content.contacts?.website}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="font-medium">Adresse</div>
                        <div className="text-sm text-muted-foreground">{content.contacts?.address}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {relatedProcedures && (
                  <div>
                    <h4 className="font-semibold mb-3">Procédures liées</h4>
                    <div className="space-y-2">
                      {relatedProcedures.map((related: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{related}</span>
                          <Button size="sm" variant="ghost">
                            Consulter
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Guide PDF
            </Button>
            <Button variant="outline" size="sm">
              <PlayCircle className="w-4 h-4 mr-1" />
              Démarrer
            </Button>
          </div>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProcedureTrackingModal({ isOpen, onClose, data }: ProcedureModalProps) {
  if (!data?.procedure) return null;

  const { procedure, trackingInfo, timeline, notifications } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'current': return 'text-blue-600';
      case 'pending': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'current': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-gray-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            Suivi: {procedure.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de suivi */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Numéro de demande</div>
              <div className="font-bold text-primary">{trackingInfo.applicationNumber}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Statut actuel</div>
              <div className="font-bold text-blue-600">{trackingInfo.status}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Date de dépôt</div>
              <div className="font-bold">{trackingInfo.submissionDate}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Fin prévue</div>
              <div className="font-bold text-green-600">{trackingInfo.expectedCompletion}</div>
            </div>
          </div>

          {/* Barre de progression */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progression</span>
              <span className="text-sm text-muted-foreground">
                Étape {trackingInfo.currentStep} sur {trackingInfo.totalSteps}
              </span>
            </div>
            <Progress 
              value={(trackingInfo.currentStep / trackingInfo.totalSteps) * 100} 
              className="w-full"
            />
          </div>

          {/* Timeline */}
          <div>
            <h4 className="font-semibold mb-4">Chronologie de la procédure</h4>
            <div className="space-y-4">
              {timeline?.map((item: any, index: number) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className={`font-medium ${getStatusColor(item.status)}`}>
                          {item.title}
                        </h5>
                        <p className="text-sm text-muted-foreground">{item.note}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          {notifications && notifications.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4">Notifications</h4>
              <div className="space-y-3">
                {notifications.map((notification: any, index: number) => (
                  <Alert key={index} className={notification.resolved ? 'opacity-60' : ''}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex justify-between">
                      <span>{notification.message}</span>
                      <span className="text-xs text-muted-foreground">{notification.date}</span>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button>
            <MessageSquare className="w-4 h-4 mr-2" />
            Contacter le service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProcedureHelpModal({ isOpen, onClose, data }: ProcedureModalProps) {
  if (!data?.procedure) return null;

  const { procedure, faq, contacts, guides, tips } = data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Aide: {procedure.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="faq" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="tips">Conseils</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 pr-4">
                {faq?.map((item: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      {item.question}
                    </h5>
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="guides" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 pr-4">
                {guides?.map((guide: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {guide.type === 'PDF' ? 
                        <FileText className="w-6 h-6 text-red-600" /> :
                        <Video className="w-6 h-6 text-blue-600" />
                      }
                      <div>
                        <h5 className="font-medium">{guide.title}</h5>
                        <p className="text-sm text-muted-foreground">{guide.description}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {guide.type} • {guide.size || guide.duration}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="tips" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-3 pr-4">
                {tips?.map((tip: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="contact" className="flex-1 overflow-hidden">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Phone className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-medium">Téléphone</div>
                    <div className="text-sm text-muted-foreground">{contacts?.phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Mail className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-muted-foreground">{contacts?.email}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <MapPin className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <div className="font-medium">Adresse</div>
                  <div className="text-sm text-muted-foreground">{contacts?.address}</div>
                </div>
              </div>

              <div className="text-center pt-4">
                <Button className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Démarrer une conversation en ligne
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProcedureStartModal({ isOpen, onClose, data }: ProcedureModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});

  if (!data?.procedure) return null;

  const { procedure, wizard, estimatedCost, estimatedDuration, requirements } = data;

  const handleNext = () => {
    if (currentStep < wizard.totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const event = new CustomEvent('show-toast', {
      detail: {
        type: 'success',
        title: 'Demande soumise',
        description: 'Votre demande a été enregistrée avec succès'
      }
    });
    window.dispatchEvent(event);
    onClose();
  };

  const currentStepData = wizard.steps.find((step: any) => step.number === currentStep);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-primary" />
            Démarrer: {procedure.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Barre de progression */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                Étape {currentStep} sur {wizard.totalSteps}: {currentStepData?.title}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round((currentStep / wizard.totalSteps) * 100)}%
              </span>
            </div>
            <Progress value={(currentStep / wizard.totalSteps) * 100} className="w-full" />
          </div>

          {/* Informations de la procédure */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Coût estimé</div>
              <div className="font-bold text-green-600">{estimatedCost}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Durée estimée</div>
              <div className="font-bold text-blue-600">{estimatedDuration}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Étape actuelle</div>
              <div className="font-bold text-primary">{currentStep}/{wizard.totalSteps}</div>
            </div>
          </div>

          {/* Contenu de l'étape actuelle */}
          <div className="space-y-4">
            {currentStepData?.fields?.map((field: any, index: number) => (
              <div key={index}>
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                
                {field.type === 'text' && (
                  <Input
                    id={field.name}
                    type="text"
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    required={field.required}
                    className="mt-1"
                  />
                )}
                
                {field.type === 'number' && (
                  <Input
                    id={field.name}
                    type="number"
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    required={field.required}
                    className="mt-1"
                  />
                )}
                
                {field.type === 'select' && (
                  <select
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    required={field.required}
                    className="mt-1 w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="algerienne">Algérienne</option>
                    <option value="autre">Autre</option>
                  </select>
                )}
                
                {field.type === 'file' && (
                  <Input
                    id={field.name}
                    type="file"
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.files?.[0] }))}
                    required={field.required}
                    className="mt-1"
                  />
                )}
                
                {field.type === 'tel' && (
                  <Input
                    id={field.name}
                    type="tel"
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    required={field.required}
                    className="mt-1"
                  />
                )}
                
                {field.type === 'email' && (
                  <Input
                    id={field.name}
                    type="email"
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    required={field.required}
                    className="mt-1"
                  />
                )}
                
                {field.type === 'checkbox' && (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      id={field.name}
                      type="checkbox"
                      checked={formData[field.name] || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.checked }))}
                    />
                    <Label htmlFor={field.name} className="text-sm">
                      {field.label}
                    </Label>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Prérequis */}
          {currentStep === 1 && requirements && (
            <div>
              <h4 className="font-semibold mb-2">Conditions requises</h4>
              <div className="space-y-2">
                {requirements.map((req: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                Précédent
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            
            {currentStep < wizard.totalSteps ? (
              <Button onClick={handleNext}>
                Suivant
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <PlayCircle className="w-4 h-4 mr-2" />
                Soumettre la demande
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}