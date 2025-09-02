import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Filter, FileText, Clock, CheckCircle, XCircle, AlertTriangle, Pause, X, Palette, Type } from 'lucide-react';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';

interface DocumentStatus {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'legal' | 'procedure' | 'both';
  color: string;
  icon: string;
  count: number;
  isActive: boolean;
}

interface FormData {
  name: string;
  code: string;
  description: string;
  category: 'legal' | 'procedure' | 'both';
  color: string;
  icon: string;
}

interface FormErrors {
  name?: string;
  code?: string;
  description?: string;
}

export function DocumentStatusTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'legal' | 'procedure' | 'both'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<DocumentStatus | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    description: '',
    category: 'both',
    color: 'bg-green-100 text-green-800',
    icon: 'check-circle'
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [documentStatuses, setDocumentStatuses] = useState<DocumentStatus[]>([
    {
      id: '1',
      name: 'En vigueur',
      code: 'VIG',
      description: 'Le texte est actuellement en vigueur et applicable',
      category: 'both',
      color: 'bg-green-100 text-green-800',
      icon: 'check-circle',
      count: 1247,
      isActive: true
    },
    {
      id: '2',
      name: 'Suspendu',
      code: 'SUS',
      description: 'Le texte est temporairement suspendu',
      category: 'legal',
      color: 'bg-yellow-100 text-yellow-800',
      icon: 'pause',
      count: 23,
      isActive: true
    },
    {
      id: '3',
      name: 'Abrogé',
      code: 'ABR',
      description: 'Le texte a été abrogé et n\'est plus applicable',
      category: 'legal',
      color: 'bg-red-100 text-red-800',
      icon: 'x-circle',
      count: 156,
      isActive: true
    },
    {
      id: '4',
      name: 'Active',
      code: 'ACT',
      description: 'La procédure est active et peut être utilisée',
      category: 'procedure',
      color: 'bg-blue-100 text-blue-800',
      icon: 'check-circle',
      count: 89,
      isActive: true
    },
    {
      id: '5',
      name: 'Suspendue',
      code: 'SUSP',
      description: 'La procédure est temporairement suspendue',
      category: 'procedure',
      color: 'bg-orange-100 text-orange-800',
      icon: 'pause',
      count: 12,
      isActive: true
    },
    {
      id: '6',
      name: 'Modifiée',
      code: 'MOD',
      description: 'Le texte a été modifié, une nouvelle version est disponible',
      category: 'both',
      color: 'bg-purple-100 text-purple-800',
      icon: 'edit',
      count: 67,
      isActive: true
    },
    {
      id: '7',
      name: 'En attente',
      code: 'ATT',
      description: 'Le texte est en attente d\'entrée en vigueur',
      category: 'legal',
      color: 'bg-gray-100 text-gray-800',
      icon: 'clock',
      count: 34,
      isActive: true
    },
    {
      id: '8',
      name: 'Expirée',
      code: 'EXP',
      description: 'La procédure a expiré et n\'est plus valide',
      category: 'procedure',
      color: 'bg-red-100 text-red-800',
      icon: 'x-circle',
      count: 8,
      isActive: true
    },
    {
      id: '9',
      name: 'En révision',
      code: 'REV',
      description: 'Le texte est en cours de révision',
      category: 'both',
      color: 'bg-yellow-100 text-yellow-800',
      icon: 'edit',
      count: 45,
      isActive: true
    },
    {
      id: '10',
      name: 'Annulée',
      code: 'ANN',
      description: 'La procédure a été annulée',
      category: 'procedure',
      color: 'bg-red-100 text-red-800',
      icon: 'x-circle',
      count: 15,
      isActive: true
    },
    {
      id: '11',
      name: 'Projet',
      code: 'PRJ',
      description: 'Texte ou procédure en cours d\'élaboration, non encore adopté',
      category: 'both',
      color: 'bg-purple-100 text-purple-800',
      icon: 'clock',
      count: 28,
      isActive: true
    }
  ]);

  // Options pour les couleurs et icônes
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
    { value: 'check-circle', label: 'Vérifié', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'pause', label: 'Pause', icon: <Pause className="w-4 h-4" /> },
    { value: 'x-circle', label: 'Annulé', icon: <XCircle className="w-4 h-4" /> },
    { value: 'edit', label: 'Modifier', icon: <Edit className="w-4 h-4" /> },
    { value: 'clock', label: 'Horloge', icon: <Clock className="w-4 h-4" /> },
    { value: 'alert-triangle', label: 'Attention', icon: <AlertTriangle className="w-4 h-4" /> },
    { value: 'file-text', label: 'Document', icon: <FileText className="w-4 h-4" /> },
    { value: 'plus', label: 'Ajouter', icon: <Plus className="w-4 h-4" /> },
    { value: 'trash-2', label: 'Supprimer', icon: <Trash2 className="w-4 h-4" /> },
    { value: 'search', label: 'Rechercher', icon: <Search className="w-4 h-4" /> }
  ];

  // Filtrage des données
  const filteredStatuses = documentStatuses.filter(status => {
    const matchesSearch = status.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         status.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         status.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || status.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const {
    currentData: paginatedStatuses,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredStatuses,
    itemsPerPage: 5
  });

  // Fonction pour obtenir l'icône
  const getStatusIcon = (iconName: string) => {
    switch (iconName) {
      case 'check-circle':
        return <CheckCircle className="w-4 h-4" />;
      case 'pause':
        return <Pause className="w-4 h-4" />;
      case 'x-circle':
        return <XCircle className="w-4 h-4" />;
      case 'edit':
        return <Edit className="w-4 h-4" />;
      case 'clock':
        return <Clock className="w-4 h-4" />;
      case 'alert-triangle':
        return <AlertTriangle className="w-4 h-4" />;
      case 'file-text':
        return <FileText className="w-4 h-4" />;
      case 'plus':
        return <Plus className="w-4 h-4" />;
      case 'trash-2':
        return <Trash2 className="w-4 h-4" />;
      case 'search':
        return <Search className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Fonction pour obtenir le nom de la catégorie
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'legal':
        return 'Textes Juridiques';
      case 'procedure':
        return 'Procédures Administratives';
      case 'both':
        return 'Les Deux';
      default:
        return category;
    }
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.code.trim()) {
      errors.code = 'Le code est requis';
    } else if (formData.code.trim().length < 2) {
      errors.code = 'Le code doit contenir au moins 2 caractères';
    } else if (formData.code.trim().length > 10) {
      errors.code = 'Le code ne peut pas dépasser 10 caractères';
    } else if (!/^[A-Z0-9]+$/.test(formData.code.trim())) {
      errors.code = 'Le code doit contenir uniquement des lettres majuscules et des chiffres';
    }

    if (!formData.description.trim()) {
      errors.description = 'La description est requise';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'La description doit contenir au moins 10 caractères';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion des changements de formulaire
  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ modifié
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const newStatus: DocumentStatus = {
      id: editStatus ? editStatus.id : Date.now().toString(),
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      category: formData.category,
      color: formData.color,
      icon: formData.icon,
      count: editStatus ? editStatus.count : 0,
      isActive: true
    };

    if (editStatus) {
      setDocumentStatuses(prev => prev.map(status => 
        status.id === editStatus.id ? newStatus : status
      ));
    } else {
      setDocumentStatuses(prev => [...prev, newStatus]);
    }

    handleCloseModal();
  };

  // Gestion de la fermeture du modal
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditStatus(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      category: 'both',
      color: 'bg-green-100 text-green-800',
      icon: 'check-circle'
    });
    setFormErrors({});
  };

  // Gestion de l'ouverture du modal d'édition
  const handleEditClick = (status: DocumentStatus) => {
    setEditStatus(status);
    setFormData({
      name: status.name,
      code: status.code,
      description: status.description,
      category: status.category,
      color: status.color,
      icon: status.icon
    });
    setFormErrors({});
  };

  // Fonction pour supprimer un statut
  const handleDeleteStatus = (statusId: string) => {
    setDocumentStatuses(prev => prev.filter(status => status.id !== statusId));
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec recherche et filtres */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Barre de recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un statut..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filtres par catégorie */}
          <div className="flex gap-2">
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCategory('all')}
            >
              <Filter className="w-4 h-4 mr-1 inline" />
              Tous
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedCategory === 'legal' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCategory('legal')}
            >
              Textes Juridiques
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedCategory === 'procedure' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCategory('procedure')}
            >
              Procédures
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedCategory === 'both' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCategory('both')}
            >
              Les Deux
            </button>
          </div>
        </div>

        {/* Bouton d'ajout */}
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un Statut
        </button>
      </div>

      {/* Grille des statuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedStatuses.map((status) => (
          <div key={status.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.icon)}
                <div>
                  <h4 className="font-semibold text-gray-900">{status.name}</h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border">
                    {status.code}
                  </span>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                {getCategoryName(status.category)}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{status.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {status.count} documents
              </span>
              <div className="flex gap-2">
                <button 
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => handleEditClick(status)}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  onClick={() => handleDeleteStatus(status.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      {/* Statistiques */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">📊 Statistiques des Statuts</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{documentStatuses.filter(s => s.category === 'legal' || s.category === 'both').length}</div>
              <div className="text-sm text-gray-600">Textes Juridiques</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{documentStatuses.filter(s => s.category === 'procedure' || s.category === 'both').length}</div>
              <div className="text-sm text-gray-600">Procédures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{documentStatuses.filter(s => s.category === 'both').length}</div>
              <div className="text-sm text-gray-600">Communs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{documentStatuses.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'ajout/édition fonctionnel */}
      {(isAddModalOpen || editStatus !== null) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editStatus ? 'Modifier le Statut' : 'Ajouter un Nouveau Statut'}
              </h3>
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                onClick={handleCloseModal}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du statut *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: En vigueur"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.code ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: VIG (majuscules)"
                    value={formData.code}
                    onChange={(e) => handleFormChange('code', e.target.value.toUpperCase())}
                  />
                  {formErrors.code && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder="Description détaillée du statut..."
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.category}
                  onChange={(e) => handleFormChange('category', e.target.value as 'legal' | 'procedure' | 'both')}
                >
                  <option value="both">Les Deux (Textes Juridiques + Procédures)</option>
                  <option value="legal">Textes Juridiques uniquement</option>
                  <option value="procedure">Procédures Administratives uniquement</option>
                </select>
              </div>

              {/* Couleur et Icône */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Couleur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Palette className="w-4 h-4 inline mr-1" />
                    Couleur
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.color}
                    onChange={(e) => handleFormChange('color', e.target.value)}
                  >
                    {colorOptions.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Icône */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Type className="w-4 h-4 inline mr-1" />
                    Icône
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.icon}
                    onChange={(e) => handleFormChange('icon', e.target.value)}
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Aperçu */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Aperçu du statut</h4>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(formData.icon)}
                      <div>
                        <h5 className="font-semibold text-gray-900">
                          {formData.name || 'Nom du statut'}
                        </h5>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border">
                          {formData.code || 'CODE'}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${formData.color}`}>
                      {getCategoryName(formData.category)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {formData.description || 'Description du statut...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button 
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={handleCloseModal}
              >
                Annuler
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleSubmit}
              >
                {editStatus ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}