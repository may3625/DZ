/**
 * Modal spécialisée pour les documents juridiques algériens
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Save, 
  CheckCircle, 
  XCircle, 
  Eye,
  Edit,
  Plus,
  Tag,
  Calendar,
  Building
} from 'lucide-react';
import { LegalModalConfig } from '../types';

interface LegalModalProps {
  config: LegalModalConfig;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ config, onClose }) => {
  const [document, setDocument] = useState(config.document || {
    title: '',
    numero: '',
    type: '',
    datePublication: '',
    source: '',
    content: '',
    keywords: [],
    references: [],
    status: 'draft'
  });
  
  const [rejectionReason, setRejectionReason] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newReference, setNewReference] = useState('');

  const documentTypes = [
    'Constitution',
    'Loi organique',
    'Loi',
    'Ordonnance',
    'Décret présidentiel',
    'Décret exécutif',
    'Arrêté ministériel',
    'Arrêté interministériel',
    'Instruction',
    'Circulaire',
    'Note de service'
  ];

  const institutions = [
    'Présidence de la République',
    'Chef du Gouvernement',
    'Assemblée Populaire Nationale',
    'Conseil de la Nation',
    'Conseil Constitutionnel',
    'Cour Suprême',
    'Conseil d\'État',
    'Ministère de la Justice',
    'Ministère de l\'Intérieur',
    'Autres ministères'
  ];

  const handleSave = () => {
    if (config.onSave) {
      config.onSave(document);
    }
    onClose();
  };

  const handleApprove = () => {
    if (config.onApprove) {
      config.onApprove({
        ...document,
        status: 'approved',
        approvedAt: new Date().toISOString()
      });
    }
    onClose();
  };

  const handleReject = () => {
    if (config.onReject && rejectionReason.trim()) {
      config.onReject(document, rejectionReason);
    }
    onClose();
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !document.keywords.includes(newKeyword.trim())) {
      setDocument(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setDocument(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const addReference = () => {
    if (newReference.trim() && !document.references.includes(newReference.trim())) {
      setDocument(prev => ({
        ...prev,
        references: [...prev.references, newReference.trim()]
      }));
      setNewReference('');
    }
  };

  const removeReference = (reference: string) => {
    setDocument(prev => ({
      ...prev,
      references: prev.references.filter(r => r !== reference)
    }));
  };

  const renderViewMode = () => (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Titre</label>
              <p className="text-sm text-muted-foreground">{document.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Numéro</label>
              <p className="text-sm text-muted-foreground">{document.numero}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <p className="text-sm text-muted-foreground">{document.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Date de publication</label>
              <p className="text-sm text-muted-foreground">
                {document.datePublication ? new Date(document.datePublication).toLocaleDateString('fr-FR') : '-'}
              </p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Source</label>
            <p className="text-sm text-muted-foreground">{document.source}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium">Statut</label>
            <Badge variant={document.status === 'approved' ? 'default' : 'secondary'}>
              {document.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contenu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
            {document.content || 'Aucun contenu disponible'}
          </div>
        </CardContent>
      </Card>

      {(document.keywords.length > 0 || document.references.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {document.keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mots-clés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {document.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {document.references.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Références</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {document.references.map((reference, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {reference}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );

  const renderEditMode = () => (
    <div className="p-6">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="metadata">Métadonnées</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Titre *</label>
              <Input
                value={document.title}
                onChange={(e) => setDocument(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre du document juridique"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Numéro *</label>
              <Input
                value={document.numero}
                onChange={(e) => setDocument(prev => ({ ...prev, numero: e.target.value }))}
                placeholder="Ex: 24-01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type *</label>
              <Select
                value={document.type}
                onValueChange={(value) => setDocument(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date de publication</label>
              <Input
                type="date"
                value={document.datePublication}
                onChange={(e) => setDocument(prev => ({ ...prev, datePublication: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Institution émettrice *</label>
            <Select
              value={document.source}
              onValueChange={(value) => setDocument(prev => ({ ...prev, source: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une institution" />
              </SelectTrigger>
              <SelectContent>
                {institutions.map((institution) => (
                  <SelectItem key={institution} value={institution}>
                    {institution}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Contenu du document</label>
            <Textarea
              value={document.content}
              onChange={(e) => setDocument(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Contenu intégral du texte juridique..."
              rows={20}
              className="font-mono text-sm"
            />
          </div>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="w-4 h-4" />
                Mots-clés
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Ajouter un mot-clé..."
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button onClick={addKeyword} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {document.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer">
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" />
                Références juridiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newReference}
                  onChange={(e) => setNewReference(e.target.value)}
                  placeholder="Ajouter une référence..."
                  onKeyPress={(e) => e.key === 'Enter' && addReference()}
                />
                <Button onClick={addReference} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {document.references.map((reference, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{reference}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeReference(reference)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderApprovalMode = () => (
    <div className="p-6 space-y-6">
      {renderViewMode()}
      
      <Card>
        <CardHeader>
          <CardTitle>Validation du document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Motif de rejet (optionnel)..."
            rows={3}
          />
          
          <div className="flex justify-end gap-3">
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="w-4 h-4 mr-2" />
              Rejeter
            </Button>
            <Button onClick={handleApprove}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approuver
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getContent = () => {
    switch (config.mode) {
      case 'view':
        return renderViewMode();
      case 'edit':
      case 'create':
        return renderEditMode();
      case 'approve':
        return renderApprovalMode();
      default:
        return renderViewMode();
    }
  };

  const getActions = () => {
    switch (config.mode) {
      case 'edit':
      case 'create':
        return (
          <div className="flex justify-end gap-3 p-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              {config.mode === 'create' ? 'Créer' : 'Enregistrer'}
            </Button>
          </div>
        );
      case 'approve':
        return null; // Actions intégrées dans le contenu
      default:
        return (
          <div className="flex justify-end gap-3 p-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-h-[90vh] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {getContent()}
      </div>
      {getActions()}
    </div>
  );
};