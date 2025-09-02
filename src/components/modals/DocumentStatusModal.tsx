import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Save, Edit, Plus } from 'lucide-react';

interface DocumentStatus {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'legal' | 'procedure' | 'both';
  color: string;
  icon: string;
  isActive: boolean;
}

interface DocumentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: Omit<DocumentStatus, 'id' | 'count'>) => void;
  editStatus?: DocumentStatus | null;
}

const colorOptions = [
  { value: 'bg-green-100 text-green-800', label: 'Vert', preview: 'bg-green-100 text-green-800' },
  { value: 'bg-blue-100 text-blue-800', label: 'Bleu', preview: 'bg-blue-100 text-blue-800' },
  { value: 'bg-red-100 text-red-800', label: 'Rouge', preview: 'bg-red-100 text-red-800' },
  { value: 'bg-yellow-100 text-yellow-800', label: 'Jaune', preview: 'bg-yellow-100 text-yellow-800' },
  { value: 'bg-purple-100 text-purple-800', label: 'Violet', preview: 'bg-purple-100 text-purple-800' },
  { value: 'bg-orange-100 text-orange-800', label: 'Orange', preview: 'bg-orange-100 text-orange-800' },
  { value: 'bg-gray-100 text-gray-800', label: 'Gris', preview: 'bg-gray-100 text-gray-800' },
  { value: 'bg-pink-100 text-pink-800', label: 'Rose', preview: 'bg-pink-100 text-pink-800' },
  { value: 'bg-indigo-100 text-indigo-800', label: 'Indigo', preview: 'bg-indigo-100 text-indigo-800' },
  { value: 'bg-teal-100 text-teal-800', label: 'Teal', preview: 'bg-teal-100 text-teal-800' }
];

const iconOptions = [
  { value: 'check-circle', label: '✅ Vérifié' },
  { value: 'pause', label: '⏸️ Suspendu' },
  { value: 'x-circle', label: '❌ Annulé' },
  { value: 'edit', label: '✏️ Modifié' },
  { value: 'clock', label: '⏰ En attente' },
  { value: 'alert-triangle', label: '⚠️ Attention' },
  { value: 'file-text', label: '📄 Document' },
  { value: 'shield', label: '🛡️ Protégé' },
  { value: 'star', label: '⭐ Important' },
  { value: 'flag', label: '🚩 Signalé' }
];

export function DocumentStatusModal({ isOpen, onClose, onSave, editStatus }: DocumentStatusModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'both' as 'legal' | 'procedure' | 'both',
    color: 'bg-green-100 text-green-800',
    icon: 'check-circle',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser le formulaire avec les données d'édition
  useEffect(() => {
    if (editStatus) {
      setFormData({
        name: editStatus.name,
        code: editStatus.code,
        description: editStatus.description,
        category: editStatus.category,
        color: editStatus.color,
        icon: editStatus.icon,
        isActive: editStatus.isActive
      });
    } else {
      // Réinitialiser le formulaire pour un nouvel ajout
      setFormData({
        name: '',
        code: '',
        description: '',
        category: 'both',
        color: 'bg-green-100 text-green-800',
        icon: 'check-circle',
        isActive: true
      });
    }
    setErrors({});
  }, [editStatus, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du statut est requis';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Le code du statut est requis';
    } else if (formData.code.length < 2) {
      newErrors.code = 'Le code doit contenir au moins 2 caractères';
    } else if (formData.code.length > 10) {
      newErrors.code = 'Le code ne peut pas dépasser 10 caractères';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (formData.description.length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            {editStatus ? (
              <>
                <Edit className="w-5 h-5" />
                Modifier le Statut
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Ajouter un Nouveau Statut
              </>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">Nom du Statut *</label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: En vigueur, Suspendu, Abrogé..."
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="code" className="block text-sm font-medium">Code *</label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="Ex: VIG, SUS, ABR..."
                  maxLength={10}
                  className={errors.code ? 'border-red-500' : ''}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium">Description *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description détaillée du statut..."
                rows={3}
                className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium">Catégorie *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as 'legal' | 'procedure' | 'both')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="legal">Textes Juridiques</option>
                <option value="procedure">Procédures Administratives</option>
                <option value="both">Les Deux</option>
              </select>
            </div>

            {/* Couleur et Icône */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Couleur *</label>
                <div className="grid grid-cols-2 gap-2">
                  {colorOptions.map((color) => (
                    <Button
                      key={color.value}
                      type="button"
                      variant={formData.color === color.value ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => handleInputChange('color', color.value)}
                    >
                      <Badge className={`mr-2 ${color.preview}`}>
                        Test
                      </Badge>
                      {color.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Icône *</label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {iconOptions.map((icon) => (
                    <Button
                      key={icon.value}
                      type="button"
                      variant={formData.icon === icon.value ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => handleInputChange('icon', icon.value)}
                    >
                      <span className="mr-2">{icon.label.split(' ')[0]}</span>
                      {icon.label.split(' ').slice(1).join(' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Statut actif */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium">Statut actif</label>
            </div>

            {/* Aperçu */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Aperçu</label>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {iconOptions.find(icon => icon.value === formData.icon)?.label.split(' ')[0]}
                    </span>
                    <div>
                      <h4 className="font-semibold">{formData.name || 'Nom du statut'}</h4>
                      <Badge variant="outline" className="text-xs">
                        {formData.code || 'CODE'}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={formData.color}>
                    {formData.category === 'legal' ? 'Textes Juridiques' :
                     formData.category === 'procedure' ? 'Procédures' : 'Les Deux'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {formData.description || 'Description du statut...'}
                </p>
              </Card>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editStatus ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}