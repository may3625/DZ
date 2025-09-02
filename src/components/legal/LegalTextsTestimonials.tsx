import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { Star, Quote, ThumbsUp, MessageCircle, Calendar, User } from 'lucide-react';

const testimonials = [
  {
    id: '1',
    author: 'Maître Ahmed Benali',
    profession: 'Avocat au Barreau d\'Alger',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    date: '2024-01-15',
    textTitle: 'Code de procédure civile et administrative',
    textCategory: 'Procédure civile',
    content: 'Très utile pour mes dossiers de contentieux administratif. La clarté des articles et les références croisées facilitent grandement la recherche jurisprudentielle.',
    likes: 24,
    replies: 3,
    helpful: true
  },
  {
    id: '2',
    author: 'Dr. Fatima Zerhouni',
    profession: 'Professeure de droit - Université d\'Oran',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    date: '2024-01-12',
    textTitle: 'Loi relative à la protection des données personnelles',
    textCategory: 'Droit numérique',
    content: 'Excellente ressource pour mes cours sur le droit numérique. Mes étudiants apprécient particulièrement la structuration et les exemples pratiques.',
    likes: 18,
    replies: 7,
    helpful: true
  },
  {
    id: '3',
    author: 'Karim Haddi',
    profession: 'Juriste d\'entreprise',
    avatar: '/api/placeholder/40/40',
    rating: 4,
    date: '2024-01-10',
    textTitle: 'Code du commerce',
    textCategory: 'Droit commercial',
    content: 'Indispensable pour la conformité de notre entreprise. Les mises à jour régulières et les annotations pratiques sont très appréciées.',
    likes: 31,
    replies: 5,
    helpful: true
  },
  {
    id: '4',
    author: 'Amina Bouzid',
    profession: 'Notaire',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    date: '2024-01-08',
    textTitle: 'Code civil - Livre des obligations et contrats',
    textCategory: 'Droit civil',
    content: 'Interface intuitive et recherche efficace. M\'aide quotidiennement dans la rédaction d\'actes et la vérification de conformité.',
    likes: 22,
    replies: 2,
    helpful: true
  },
  {
    id: '5',
    author: 'Mohamed Slimani',
    profession: 'Magistrat',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    date: '2024-01-05',
    textTitle: 'Code pénal',
    textCategory: 'Droit pénal',
    content: 'Outil précieux pour la préparation des audiences. La fonction de recherche avancée et les références jurisprudentielles sont excellentes.',
    likes: 28,
    replies: 8,
    helpful: true
  },
  {
    id: '6',
    author: 'Leila Mansouri',
    profession: 'Avocate spécialisée en droit du travail',
    avatar: '/api/placeholder/40/40',
    rating: 4,
    date: '2024-01-03',
    textTitle: 'Code du travail',
    textCategory: 'Droit social',
    content: 'Très complet pour le droit social algérien. Les mises à jour législatives sont rapides et fiables.',
    likes: 19,
    replies: 4,
    helpful: true
  },
  {
    id: '7',
    author: 'Rachid Bouraoui',
    profession: 'Consultant juridique',
    avatar: '/api/placeholder/40/40',
    rating: 4,
    date: '2023-12-28',
    textTitle: 'Loi sur l\'investissement',
    textCategory: 'Droit des affaires',
    content: 'Ressource fiable pour mes clients investisseurs. La présentation claire des procédures facilite les conseils pratiques.',
    likes: 15,
    replies: 1,
    helpful: true
  },
  {
    id: '8',
    author: 'Nadia Khelifi',
    profession: 'Juriste en droit de l\'environnement',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    date: '2023-12-25',
    textTitle: 'Loi relative à la protection de l\'environnement',
    textCategory: 'Droit de l\'environnement',
    content: 'Documentation excellente pour le droit environnemental. Les textes d\'application sont bien référencés.',
    likes: 13,
    replies: 6,
    helpful: true
  },
  {
    id: '9',
    author: 'Omar Djelloul',
    profession: 'Avocat au Barreau de Constantine',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    date: '2023-12-22',
    textTitle: 'Code de la famille',
    textCategory: 'Droit de la famille',
    content: 'Interface claire et navigation intuitive. Parfait pour la consultation rapide pendant les audiences.',
    likes: 26,
    replies: 9,
    helpful: true
  },
  {
    id: '10',
    author: 'Yasmine Benamara',
    profession: 'Greffière en chef',
    avatar: '/api/placeholder/40/40',
    rating: 4,
    date: '2023-12-20',
    textTitle: 'Code de procédure pénale',
    textCategory: 'Procédure pénale',
    content: 'Très pratique pour la gestion quotidienne du greffe. Les références aux circulaires d\'application sont un plus.',
    likes: 17,
    replies: 3,
    helpful: true
  }
];

export function LegalTextsTestimonials() {
  const {
    currentData: paginatedTestimonials,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: testimonials,
    itemsPerPage: 5
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="w-5 h-5" />
            Témoignages récents - Textes juridiques
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Retours d'expérience des professionnels du droit sur l'utilisation des textes juridiques
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header du témoignage */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={testimonial.avatar} />
                          <AvatarFallback>
                            {testimonial.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{testimonial.author}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.profession}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>

                    {/* Texte juridique concerné */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium text-sm">{testimonial.textTitle}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {testimonial.textCategory}
                      </Badge>
                    </div>

                    {/* Contenu du témoignage */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      "{testimonial.content}"
                    </p>

                    {/* Footer du témoignage */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(testimonial.date).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {testimonial.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {testimonial.replies}
                        </div>
                      </div>
                      {testimonial.helpful && (
                        <Badge variant="outline" className="text-xs">
                          Utile
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
        </CardContent>
      </Card>
    </div>
  );
}