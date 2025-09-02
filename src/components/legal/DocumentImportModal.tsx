import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DocumentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (files: ImportedFile[]) => void;
}

interface ImportedFile {
  file: File;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function DocumentImportModal({ isOpen, onClose, onImportSuccess }: DocumentImportModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState('');
  const [files, setFiles] = useState<ImportedFile[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const documentTypes = [
    { value: 'loi', label: 'Loi' },
    { value: 'decret', label: 'Décret' },
    { value: 'arrete', label: 'Arrêté' },
    { value: 'circulaire', label: 'Circulaire' },
    { value: 'ordonnance', label: 'Ordonnance' },
    { value: 'decision', label: 'Décision' },
    { value: 'instruction', label: 'Instruction' }
  ];

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (selectedFiles.length === 0) return;

    // Validation des types de fichiers
    const validTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const invalidFiles = selectedFiles.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return !validTypes.includes(extension);
    });

    if (invalidFiles.length > 0) {
      toast({
        title: "Types de fichiers non supportés",
        description: `Les fichiers suivants ne sont pas supportés: ${invalidFiles.map(f => f.name).join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Validation de la taille (max 10MB par fichier)
    const oversizedFiles = selectedFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Fichiers trop volumineux",
        description: `Les fichiers suivants dépassent la limite de 10MB: ${oversizedFiles.map(f => f.name).join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    const newFiles: ImportedFile[] = selectedFiles.map(file => ({
      file,
      type: documentType,
      progress: 0,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const simulateUpload = async (fileIndex: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        
        setFiles(prev => prev.map((file, i) => 
          i === fileIndex 
            ? { ...file, progress: Math.min(progress, 100), status: 'uploading' }
            : file
        ));

        if (progress >= 100) {
          clearInterval(interval);
          
          // Simulation d'une chance d'erreur (5%)
          if (Math.random() > 0.95) {
            setFiles(prev => prev.map((file, i) => 
              i === fileIndex 
                ? { ...file, status: 'error', error: 'Erreur lors du traitement du fichier' }
                : file
            ));
            reject(new Error('Upload failed'));
          } else {
            setFiles(prev => prev.map((file, i) => 
              i === fileIndex 
                ? { ...file, progress: 100, status: 'success' }
                : file
            ));
            resolve();
          }
        }
      }, 200);
    });
  };

  const handleImport = async () => {
    if (files.length === 0) {
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez sélectionner au moins un fichier à importer.",
        variant: "destructive"
      });
      return;
    }

    if (!documentType) {
      toast({
        title: "Type de document requis",
        description: "Veuillez sélectionner le type de document.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);

    try {
      // Upload des fichiers en parallèle
      const uploadPromises = files.map((_, index) => simulateUpload(index));
      await Promise.allSettled(uploadPromises);

      const successfulFiles = files.filter(file => file.status === 'success');
      const failedFiles = files.filter(file => file.status === 'error');

      if (successfulFiles.length > 0) {
        toast({
          title: "Importation réussie",
          description: `${successfulFiles.length} fichier(s) importé(s) avec succès.`
        });

        if (onImportSuccess) {
          onImportSuccess(successfulFiles);
        }
      }

      if (failedFiles.length > 0) {
        toast({
          title: "Erreurs d'importation",
          description: `${failedFiles.length} fichier(s) n'ont pas pu être importés.`,
          variant: "destructive"
        });
      }

      // Fermer la modal seulement si tous les fichiers ont été traités avec succès
      if (failedFiles.length === 0) {
        setTimeout(() => {
          handleClose();
        }, 1500);
      }

    } catch (error) {
      toast({
        title: "Erreur d'importation",
        description: "Une erreur est survenue lors de l'importation des fichiers.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      setFiles([]);
      setDocumentType('');
      onClose();
    }
  };

  const getStatusIcon = (status: ImportedFile['status']) => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ImportedFile['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'uploading':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Upload className="w-6 h-6 text-blue-600" />
            Importer des documents juridiques
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sélection du type de document */}
          <div className="space-y-2">
            <Label htmlFor="document-type" className="text-sm font-medium">
              Type de document *
            </Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type de document" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Zone de sélection de fichiers */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Sélectionner des fichiers *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="text-sm text-gray-600 mb-4">
                Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                Choisir des fichiers
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelection}
                className="hidden"
              />
              <div className="text-xs text-gray-500 mt-2">
                Formats supportés: PDF, DOC, DOCX, TXT (max 10MB par fichier)
              </div>
            </div>
          </div>

          {/* Liste des fichiers sélectionnés */}
          {files.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Fichiers sélectionnés ({files.length})
              </Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((fileItem, index) => (
                  <Card key={index} className={`transition-colors ${getStatusColor(fileItem.status)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getStatusIcon(fileItem.status)}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {fileItem.file.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(fileItem.file.size / (1024 * 1024)).toFixed(2)} MB
                              {fileItem.type && ` • ${documentTypes.find(t => t.value === fileItem.type)?.label}`}
                            </div>
                            {fileItem.error && (
                              <div className="text-xs text-red-600 mt-1">
                                {fileItem.error}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Barre de progression */}
                        {fileItem.status === 'uploading' && (
                          <div className="w-24 mx-3">
                            <Progress value={fileItem.progress} className="h-2" />
                          </div>
                        )}
                        
                        {/* Bouton de suppression */}
                        {!isImporting && fileItem.status !== 'uploading' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isImporting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleImport}
              disabled={isImporting || files.length === 0 || !documentType}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Importation en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importer ({files.length} fichier{files.length > 1 ? 's' : ''})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}