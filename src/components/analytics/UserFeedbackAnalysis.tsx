import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePagination } from '@/hooks/usePagination';
import { StandardPagination } from '@/components/common/StandardPagination';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  TrendingUp, 
  Search, 
  Filter,
  Eye,
  User,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export function UserFeedbackAnalysis() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  const userFeedbacks = [
    {
      id: 1,
      user: 'Marie Dubois',
      procedure: 'Création d\'entreprise SARL',
      rating: 4,
      type: 'Positif',
      category: 'Procedure',
      comment: 'La procédure est bien détaillée mais certaines étapes pourraient être simplifiées.',
      timestamp: '2025-02-19 14:30',
      helpful: 12,
      status: 'Reviewed',
      tags: ['Clarté', 'Simplicité']
    },
    {
      id: 2,
      user: 'Ahmed Benali',
      procedure: 'Demande de permis de construire',
      rating: 2,
      type: 'Négatif',
      category: 'Procedure',
      comment: 'Beaucoup trop de documents requis, délais très longs. Interface peu intuitive.',
      timestamp: '2025-02-19 13:15',
      helpful: 8,
      status: 'Pending',
      tags: ['Complexité', 'Délais', 'Interface']
    },
    {
      id: 3,
      user: 'Sophie Martin',
      procedure: 'Code du Commerce - Article 12',
      rating: 5,
      type: 'Positif',
      category: 'Document',
      comment: 'Excellent! Très bien expliqué avec des exemples concrets.',
      timestamp: '2025-02-19 12:45',
      helpful: 15,
      status: 'Reviewed',
      tags: ['Qualité', 'Exemples']
    },
    {
      id: 4,
      user: 'Karim Hadj',
      procedure: 'Déclaration fiscale en ligne',
      rating: 3,
      type: 'Neutre',
      category: 'Service',
      comment: 'Correct mais pourrait être amélioré. Quelques bugs dans le formulaire.',
      timestamp: '2025-02-19 11:20',
      helpful: 6,
      status: 'In Progress',
      tags: ['Bugs', 'Amélioration']
    },
    {
      id: 5,
      user: 'Fatima Zohra',
      procedure: 'Recherche juridique avancée',
      rating: 4,
      type: 'Positif',
      category: 'Feature',
      comment: 'Fonction de recherche puissante, très utile pour mes analyses.',
      timestamp: '2025-02-19 10:30',
      helpful: 9,
      status: 'Reviewed',
      tags: ['Fonctionnalité', 'Utilité']
    },
    {
      id: 6,
      user: 'Omar Bensalem',
      procedure: 'Traduction automatique',
      rating: 1,
      type: 'Négatif',
      category: 'Feature',
      comment: 'Qualité de traduction très mauvaise, beaucoup d\'erreurs contextuelles.',
      timestamp: '2025-02-19 09:15',
      helpful: 14,
      status: 'Urgent',
      tags: ['Qualité', 'Traduction', 'Erreurs']
    },
    {
      id: 7,
      user: 'Rachid Amari',
      procedure: 'Interface mobile',
      rating: 4,
      type: 'Positif',
      category: 'Interface',
      comment: 'Bonne adaptation mobile, navigation fluide.',
      timestamp: '2025-02-19 08:45',
      helpful: 7,
      status: 'Reviewed',
      tags: ['Mobile', 'Navigation']
    },
    {
      id: 8,
      user: 'Leila Boudjema',
      procedure: 'Support client',
      rating: 5,
      type: 'Positif',
      category: 'Support',
      comment: 'Équipe très réactive et professionnelle. Problème résolu rapidement.',
      timestamp: '2025-02-19 08:00',
      helpful: 11,
      status: 'Reviewed',
      tags: ['Réactivité', 'Professionnalisme']
    }
  ];

  const filteredFeedbacks = userFeedbacks.filter(feedback => {
    const matchesSearch = feedback.procedure.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || feedback.type === typeFilter;
    const matchesRating = ratingFilter === 'all' || 
                         (ratingFilter === 'high' && feedback.rating >= 4) ||
                         (ratingFilter === 'medium' && feedback.rating === 3) ||
                         (ratingFilter === 'low' && feedback.rating <= 2);
    
    return matchesSearch && matchesType && matchesRating;
  });

  const {
    currentData: paginatedFeedbacks,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredFeedbacks,
    itemsPerPage: 5
  });

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Positif': return 'bg-green-100 text-green-800';
      case 'Négatif': return 'bg-red-100 text-red-800';
      case 'Neutre': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Reviewed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'In Progress': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'Urgent': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Procedure: 'bg-blue-100 text-blue-800',
      Document: 'bg-purple-100 text-purple-800',
      Service: 'bg-orange-100 text-orange-800',
      Feature: 'bg-indigo-100 text-indigo-800',
      Interface: 'bg-pink-100 text-pink-800',
      Support: 'bg-emerald-100 text-emerald-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const feedbackStats = {
    total: userFeedbacks.length,
    positive: userFeedbacks.filter(f => f.type === 'Positif').length,
    negative: userFeedbacks.filter(f => f.type === 'Négatif').length,
    neutral: userFeedbacks.filter(f => f.type === 'Neutre').length,
    averageRating: (userFeedbacks.reduce((acc, f) => acc + f.rating, 0) / userFeedbacks.length).toFixed(1)
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{feedbackStats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{feedbackStats.positive}</p>
              <p className="text-sm text-gray-600">Positifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{feedbackStats.negative}</p>
              <p className="text-sm text-gray-600">Négatifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{feedbackStats.neutral}</p>
              <p className="text-sm text-gray-600">Neutres</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{feedbackStats.averageRating}/5</p>
              <p className="text-sm text-gray-600">Note moyenne</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Feedback Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher dans les commentaires..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tous les types</option>
                <option value="Positif">Positifs</option>
                <option value="Négatif">Négatifs</option>
                <option value="Neutre">Neutres</option>
              </select>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Toutes les notes</option>
                <option value="high">4-5 étoiles</option>
                <option value="medium">3 étoiles</option>
                <option value="low">1-2 étoiles</option>
              </select>
            </div>
          </div>

          {/* Liste des feedbacks */}
          <div className="space-y-4">
            {paginatedFeedbacks.map((feedback) => (
              <div key={feedback.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{feedback.procedure}</h4>
                      <Badge className={getCategoryColor(feedback.category)}>
                        {feedback.category}
                      </Badge>
                      <Badge className={getTypeColor(feedback.type)}>
                        {feedback.type}
                      </Badge>
                      {getStatusIcon(feedback.status)}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">{getRatingStars(feedback.rating)}</div>
                      <span className="text-sm font-medium">({feedback.rating}/5)</span>
                    </div>
                    <p className="text-gray-700 mb-3">{feedback.comment}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {feedback.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {feedback.user}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {feedback.timestamp}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {feedback.helpful} utiles
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Détails
                    </Button>
                    <Button size="sm" variant="outline">
                      Répondre
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredFeedbacks.length > 0 && (
            <div className="mt-6">
              <StandardPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}