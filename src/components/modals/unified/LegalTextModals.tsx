import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Share2, 
  Star,
  Calendar,
  Globe,
  Tag,
  ExternalLink,
  MessageSquare,
  Highlighter,
  StickyNote,
  Link,
  Users,
  Mail,
  Copy,
  Eye,
  Shield
} from 'lucide-react';

interface LegalTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export function LegalTextConsultationModal({ isOpen, onClose, data }: LegalTextModalProps) {
  if (!data?.text) return null;

  const { text, content, metadata } = data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {text.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="content" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="metadata">Métadonnées</TabsTrigger>
            <TabsTrigger value="attachments">Annexes</TabsTrigger>
            <TabsTrigger value="related">Textes liés</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* Préambule */}
                <div>
                  <h4 className="font-semibold mb-2">Préambule</h4>
                  <div className="bg-muted/50 p-4 rounded-lg text-sm">
                    {content.preamble}
                  </div>
                </div>

                {/* Articles */}
                <div>
                  <h4 className="font-semibold mb-4">Articles</h4>
                  <div className="space-y-4">
                    {content.articles?.map((article: any, index: number) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <h5 className="font-medium text-primary mb-2">{article.number}</h5>
                        <p className="text-sm leading-relaxed">{article.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="metadata" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Journal Officiel</Label>
                    <p className="text-sm text-muted-foreground">{metadata.journal}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Numéro</Label>
                    <p className="text-sm text-muted-foreground">{metadata.number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date de publication</Label>
                    <p className="text-sm text-muted-foreground">{metadata.date}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Pages</Label>
                    <p className="text-sm text-muted-foreground">{metadata.pages}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Mots-clés</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {metadata.keywords?.map((keyword: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        <Tag className="w-3 h-3 mr-1" />
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="attachments" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-3 pr-4">
                {content.attachments?.map((attachment: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{attachment.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {attachment.type} • {attachment.size}
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

          <TabsContent value="related" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-3 pr-4">
                {metadata.relatedTexts?.map((relatedText: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{relatedText}</span>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4 mr-1" />
                      Consulter
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Star className="w-4 h-4 mr-1" />
              Favoris
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-1" />
              Annoter
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LegalTextShareModal({ isOpen, onClose, data }: LegalTextModalProps) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState('');
  const [shareSettings, setShareSettings] = useState(data?.shareOptions || {});

  if (!data?.text) return null;

  const addRecipient = () => {
    if (newRecipient && !recipients.includes(newRecipient)) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient('');
    }
  };

  const handleShare = () => {
    const event = new CustomEvent('show-toast', {
      detail: {
        type: 'success',
        title: 'Texte partagé',
        description: `Partagé avec ${recipients.length} destinataire(s)`
      }
    });
    window.dispatchEvent(event);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Partager: {data.text.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="recipients" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recipients">Destinataires</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="link">Lien public</TabsTrigger>
          </TabsList>

          <TabsContent value="recipients" className="space-y-4">
            <div>
              <Label>Ajouter des destinataires</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Email ou nom d'utilisateur"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                />
                <Button onClick={addRecipient}>Ajouter</Button>
              </div>
            </div>

            <div>
              <Label>Destinataires sélectionnés ({recipients.length})</Label>
              <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                {recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{recipient}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRecipients(recipients.filter((_, i) => i !== index))}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {data.shareHistory && (
              <div>
                <Label>Historique de partage</Label>
                <div className="space-y-2 mt-2">
                  {data.shareHistory.map((entry: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm p-2 border rounded">
                      <span>{entry.user}</span>
                      <span className="text-muted-foreground">{entry.action} • {entry.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div>
              <Label>Permissions accordées</Label>
              <div className="space-y-3 mt-2">
                {data.shareOptions?.permissions?.map((permission: string, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {permission === 'view' && <Eye className="w-4 h-4" />}
                      {permission === 'comment' && <MessageSquare className="w-4 h-4" />}
                      {permission === 'download' && <Download className="w-4 h-4" />}
                      <span className="text-sm">
                        {permission === 'view' ? 'Consulter' :
                         permission === 'comment' ? 'Commenter' :
                         permission === 'download' ? 'Télécharger' : permission}
                      </span>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Restrictions</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Filigrane sur le document</span>
                  <input type="checkbox" checked={data.shareOptions?.restrictions?.watermark} readOnly />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Désactiver l'impression</span>
                  <input type="checkbox" checked={data.shareOptions?.restrictions?.printDisabled} readOnly />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <div>
              <Label>Lien public</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={`https://dalil.dz/share/${data.text.id}`}
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-1" />
                  Copier
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Ce lien permet d'accéder au document sans connexion
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Activer le lien public</Label>
                <p className="text-sm text-muted-foreground">
                  Le document sera accessible via le lien ci-dessus
                </p>
              </div>
              <input type="checkbox" checked={data.shareOptions?.publicLink} readOnly />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TextAnnotationModal({ isOpen, onClose, data }: LegalTextModalProps) {
  const [newAnnotation, setNewAnnotation] = useState({
    content: '',
    type: 'note',
    articleRef: ''
  });

  if (!data?.text) return null;

  const { annotations, tools } = data;

  const addAnnotation = () => {
    if (newAnnotation.content.trim()) {
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          title: 'Annotation ajoutée',
          description: 'Votre annotation a été sauvegardée'
        }
      });
      window.dispatchEvent(event);
      setNewAnnotation({ content: '', type: 'note', articleRef: '' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-primary" />
            Annotations: {data.text.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Outils d'annotation */}
          <div className="w-1/4 border-r pr-4">
            <Label className="font-medium">Outils d'annotation</Label>
            <div className="space-y-2 mt-3">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Highlighter className="w-4 h-4 mr-2" />
                Surligner
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <StickyNote className="w-4 h-4 mr-2" />
                Note
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Commentaire
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Link className="w-4 h-4 mr-2" />
                Référence
              </Button>
            </div>
          </div>

          {/* Liste des annotations */}
          <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <Label className="font-medium">
                Annotations existantes ({annotations?.length || 0})
              </Label>
            </div>

            <ScrollArea className="h-[50vh]">
              <div className="space-y-3 pr-4">
                {annotations?.map((annotation: any) => (
                  <div key={annotation.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={annotation.type === 'warning' ? 'destructive' : 'secondary'}>
                          {annotation.type === 'note' ? 'Note' : 'Attention'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {annotation.articleRef}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {annotation.author} • {annotation.date}
                      </span>
                    </div>
                    <p className="text-sm">{annotation.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Nouvelle annotation */}
            <div className="mt-4 p-4 border-t">
              <Label className="font-medium">Nouvelle annotation</Label>
              <div className="space-y-3 mt-2">
                <Input
                  placeholder="Référence article (ex: Article 5)"
                  value={newAnnotation.articleRef}
                  onChange={(e) => setNewAnnotation(prev => ({ ...prev, articleRef: e.target.value }))}
                />
                <Textarea
                  placeholder="Contenu de l'annotation..."
                  value={newAnnotation.content}
                  onChange={(e) => setNewAnnotation(prev => ({ ...prev, content: e.target.value }))}
                  rows={3}
                />
                <div className="flex gap-2">
                  <select
                    value={newAnnotation.type}
                    onChange={(e) => setNewAnnotation(prev => ({ ...prev, type: e.target.value }))}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="note">Note</option>
                    <option value="warning">Attention</option>
                    <option value="comment">Commentaire</option>
                  </select>
                  <Button size="sm" onClick={addAnnotation}>
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exporter les annotations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TextComparisonModal({ isOpen, onClose, data }: LegalTextModalProps) {
  if (!data?.texts) return null;

  const { texts, comparisonTypes, results } = data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Comparaison de Textes Juridiques
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="differences" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="differences">Différences</TabsTrigger>
            <TabsTrigger value="similarities">Similitudes</TabsTrigger>
            <TabsTrigger value="impact">Analyse d'impact</TabsTrigger>
          </TabsList>

          <TabsContent value="differences" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <Badge variant="outline">Texte A</Badge>
                    <p className="text-sm mt-1">{typeof texts[0] === 'string' ? texts[0] : texts[0]?.title}</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline">Texte B</Badge>
                    <p className="text-sm mt-1">{typeof texts[1] === 'string' ? texts[1] : texts[1]?.title}</p>
                  </div>
                </div>

                {results?.differences?.map((diff: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        diff.type === 'addition' ? 'default' :
                        diff.type === 'modification' ? 'secondary' :
                        'destructive'
                      }>
                        {diff.type === 'addition' ? 'Ajout' :
                         diff.type === 'modification' ? 'Modification' :
                         'Suppression'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{diff.position}</span>
                    </div>
                    <p className="text-sm">{diff.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="similarities" className="flex-1 overflow-hidden">
            <div className="text-center py-8">
              <div className="text-6xl font-bold text-primary mb-4">
                {results?.similarities}%
              </div>
              <p className="text-lg text-muted-foreground">
                Taux de similitude entre les textes
              </p>
              <div className="mt-6 max-w-md mx-auto">
                <div className="bg-muted rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${results?.similarities}%` }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="impact" className="flex-1 overflow-hidden">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {results?.impactAnalysis?.high}
                </div>
                <p className="text-sm text-muted-foreground">Impact élevé</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {results?.impactAnalysis?.medium}
                </div>
                <p className="text-sm text-muted-foreground">Impact moyen</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {results?.impactAnalysis?.low}
                </div>
                <p className="text-sm text-muted-foreground">Impact faible</p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>L'analyse d'impact évalue les conséquences juridiques et pratiques des modifications identifiées entre les deux textes.</p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exporter le rapport
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}