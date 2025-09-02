import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Search, 
  Calendar,
  User,
  TrendingUp,
  BarChart3,
  Eye
} from 'lucide-react';

interface FeedbackEntry {
  id: string;
  userName: string;
  userType: 'citoyen' | 'professionnel' | 'administration';
  procedure: string;
  rating: number;
  feedback: string;
  category: 'facilite' | 'clarte' | 'rapidite' | 'assistance' | 'autre';
  status: 'nouveau' | 'traite' | 'en_cours';
  date: string;
  helpful: number;
  notHelpful: number;
}

export function FeedbackSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRating, setFilterRating] = useState('all');

  const feedbacks: FeedbackEntry[] = [
    {
      id: '1',
      userName: 'Ahmed Benali',
      userType: 'citoyen',
      procedure: 'Demande de certificat de résidence',
      rating: 4,
      feedback: 'Procédure claire et bien expliquée. Les délais ont été respectés.',
      category: 'facilite',
      status: 'traite',
      date: '2024-01-15',
      helpful: 12,
      notHelpful: 1
    },
    {
      id: '2',
      userName: 'Fatima Cherif',
      userType: 'professionnel',
      procedure: 'Création d\'entreprise SARL',
      rating: 5,
      feedback: 'Excellent support, documentation complète. Très satisfaite du processus.',
      category: 'assistance',
      status: 'nouveau',
      date: '2024-01-14',
      helpful: 8,
      notHelpful: 0
    },
    {
      id: '3',
      userName: 'Karim Meziane',
      userType: 'citoyen',
      procedure: 'Renouvellement de passeport',
      rating: 2,
      feedback: 'Procédure trop complexe, manque d\'informations sur les délais.',
      category: 'clarte',
      status: 'en_cours',
      date: '2024-01-13',
      helpful: 5,
      notHelpful: 3
    },
    {
      id: '4',
      userName: 'Leila Mansouri',
      userType: 'administration',
      procedure: 'Procédure de visa touristique',
      rating: 3,
      feedback: 'Amélioration nécessaire au niveau de la rapidité de traitement.',
      category: 'rapidite',
      status: 'traite',
      date: '2024-01-12',
      helpful: 7,
      notHelpful: 2
    },
    {
      id: '5',
      userName: 'Yacine Brahim',
      userType: 'citoyen',
      procedure: 'Demande de permis de conduire',
      rating: 4,
      feedback: 'Bonne expérience globale, quelques points à améliorer sur l\'interface.',
      category: 'facilite',
      status: 'nouveau',
      date: '2024-01-11',
      helpful: 9,
      notHelpful: 1
    },
    {
      id: '6',
      userName: 'Salim Kaced',
      userType: 'professionnel',
      procedure: 'Déclaration fiscale entreprise',
      rating: 1,
      feedback: 'Très difficile à comprendre, besoin d\'assistance technique.',
      category: 'clarte',
      status: 'en_cours',
      date: '2024-01-10',
      helpful: 15,
      notHelpful: 0
    },
    {
      id: '7',
      userName: 'Amina Bouaziz',
      userType: 'citoyen',
      procedure: 'Demande d\'extrait de naissance',
      rating: 5,
      feedback: 'Parfait ! Rapide et efficace, rien à redire.',
      category: 'rapidite',
      status: 'traite',
      date: '2024-01-09',
      helpful: 11,
      notHelpful: 0
    },
    {
      id: '8',
      userName: 'Kamel Boudiaf',
      userType: 'administration',
      procedure: 'Procédure de marchés publics',
      rating: 3,
      feedback: 'Procédure correcte mais pourrait être simplifiée.',
      category: 'facilite',
      status: 'nouveau',
      date: '2024-01-08',
      helpful: 6,
      notHelpful: 2
    }
  ];

  // Filtrage des retours
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = feedback.procedure.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.feedback.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || feedback.category === filterCategory;
    const matchesRating = filterRating === 'all' || 
                         (filterRating === 'high' && feedback.rating >= 4) ||
                         (filterRating === 'medium' && feedback.rating === 3) ||
                         (filterRating === 'low' && feedback.rating <= 2);
    
    return matchesSearch && matchesCategory && matchesRating;
  });

  // Pagination
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
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'citoyen': return 'bg-blue-100 text-blue-800';
      case 'professionnel': return 'bg-green-100 text-green-800';
      case 'administration': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nouveau': return 'bg-red-100 text-red-800';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      case 'traite': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'facilite': return 'bg-blue-100 text-blue-800';
      case 'clarte': return 'bg-purple-100 text-purple-800';
      case 'rapidite': return 'bg-orange-100 text-orange-800';
      case 'assistance': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Statistiques
  const avgRating = feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length;
  const totalHelpful = feedbacks.reduce((acc, f) => acc + f.helpful, 0);
  const satisfactionRate = (feedbacks.filter(f => f.rating >= 4).length / feedbacks.length) * 100;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Feedback Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Analysez les retours des utilisateurs sur les procédures administratives
          </p>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{avgRating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Note moyenne</div>
            <div className="flex justify-center mt-1">
              {getRatingStars(Math.round(avgRating))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{satisfactionRate.toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Taux de satisfaction</div>
            <div className="text-xs text-green-600 mt-1">
              {feedbacks.filter(f => f.rating >= 4).length} utilisateurs satisfaits
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalHelpful}</div>
            <div className="text-sm text-gray-600">Votes utiles</div>
            <div className="text-xs text-blue-600 mt-1">
              Retours appréciés
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {feedbacks.filter(f => f.status === 'nouveau').length}
            </div>
            <div className="text-sm text-gray-600">Nouveaux retours</div>
            <div className="text-xs text-red-600 mt-1">
              À traiter
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher dans les retours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              className="border rounded px-3 py-2"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Toutes les catégories</option>
              <option value="facilite">Facilité d'usage</option>
              <option value="clarte">Clarté</option>
              <option value="rapidite">Rapidité</option>
              <option value="assistance">Assistance</option>
              <option value="autre">Autre</option>
            </select>
            <select 
              className="border rounded px-3 py-2"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">Toutes les notes</option>
              <option value="high">Satisfait (4-5 étoiles)</option>
              <option value="medium">Neutre (3 étoiles)</option>
              <option value="low">Insatisfait (1-2 étoiles)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des retours */}
      <Card>
        <CardHeader>
          <CardTitle>Retours des Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedFeedbacks.map((feedback) => (
              <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{feedback.userName}</span>
                        <Badge className={getUserTypeColor(feedback.userType)}>
                          {feedback.userType === 'citoyen' ? 'Citoyen' :
                           feedback.userType === 'professionnel' ? 'Professionnel' : 'Administration'}
                        </Badge>
                        <Badge className={getStatusColor(feedback.status)}>
                          {feedback.status === 'nouveau' ? 'Nouveau' :
                           feedback.status === 'en_cours' ? 'En cours' : 'Traité'}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-sm mb-2">{feedback.procedure}</h3>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {getRatingStars(feedback.rating)}
                        <span className="text-sm font-medium">({feedback.rating}/5)</span>
                        <Badge className={getCategoryColor(feedback.category)}>
                          {feedback.category === 'facilite' ? 'Facilité' :
                           feedback.category === 'clarte' ? 'Clarté' :
                           feedback.category === 'rapidite' ? 'Rapidité' :
                           feedback.category === 'assistance' ? 'Assistance' : 'Autre'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3 italic">
                        "{feedback.feedback}"
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(feedback.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">{feedback.helpful}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsDown className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">{feedback.notHelpful}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="w-4 h-4" />
                        Détails
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <MessageSquare className="w-4 h-4" />
                        Répondre
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
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
        </CardContent>
      </Card>

      {/* Graphique de tendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Évolution des Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = feedbacks.filter(f => f.rating === rating).length;
                const percentage = (count / feedbacks.length) * 100;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm">{rating}</span>
                      <Star className="w-3 h-3 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Répartition par Catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['facilite', 'clarte', 'rapidite', 'assistance', 'autre'].map((category) => {
                const count = feedbacks.filter(f => f.category === category).length;
                const percentage = (count / feedbacks.length) * 100;
                
                return (
                  <div key={category} className="flex items-center gap-3">
                    <div className="w-20 text-sm capitalize">
                      {category === 'facilite' ? 'Facilité' :
                       category === 'clarte' ? 'Clarté' :
                       category === 'rapidite' ? 'Rapidité' :
                       category === 'assistance' ? 'Assistance' : 'Autre'}
                    </div>
                    <div className="flex-1">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}