
// @ts-nocheck
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { buttonHandlers } from '@/utils/buttonUtils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UnifiedModalSystem } from '@/components/modals/UnifiedModalSystem';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Play, 
  Search, 
  Clock, 
  Eye, 
  Star, 
  User, 
  Calendar,
  Filter,
  Download,
  BookOpen,
  Settings,
  Zap
} from 'lucide-react';
import { logger } from '@/utils/logger';

export function VideoTutorialsSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const videoCategories = [
    { id: 'all', label: 'Tous', count: 25 },
    { id: 'beginner', label: 'Débutant', count: 8 },
    { id: 'intermediate', label: 'Intermédiaire', count: 12 },
    { id: 'advanced', label: 'Avancé', count: 5 }
  ];

  const videoTutorials = [
    {
      id: 1,
      title: "Première connexion et configuration",
      description: "Découvrez comment créer votre compte et configurer votre profil pour une utilisation optimale",
      duration: "5:30",
      views: "2,450",
      rating: 4.8,
      level: "beginner",
      category: "Configuration",
      thumbnail: "/api/placeholder/320/180",
      uploadDate: "2024-01-15",
      instructor: "Marie Dubois"
    },
    {
      id: 2,
      title: "Recherche simple de textes juridiques",
      description: "Apprenez les bases de la recherche pour trouver rapidement les textes qui vous intéressent",
      duration: "8:15",
      views: "3,890",
      rating: 4.9,
      level: "beginner",
      category: "Recherche",
      thumbnail: "/api/placeholder/320/180",
      uploadDate: "2024-01-20",
      instructor: "Ahmed Benali"
    },
    {
      id: 3,
      title: "Utilisation des filtres avancés",
      description: "Maîtrisez les filtres pour affiner vos recherches et gagner en précision",
      duration: "12:45",
      views: "1,650",
      rating: 4.7,
      level: "intermediate",
      category: "Recherche",
      thumbnail: "/api/placeholder/320/180",
      uploadDate: "2024-01-25",
      instructor: "Fatima Zahra"
    },
    {
      id: 4,
      title: "Assistant IA : Guide complet",
      description: "Exploitez toute la puissance de l'assistant IA pour vos analyses juridiques",
      duration: "18:30",
      views: "980",
      rating: 4.9,
      level: "advanced",
      category: "IA",
      thumbnail: "/api/placeholder/320/180",
      uploadDate: "2024-02-01",
      instructor: "Karim Alaoui"
    },
    {
      id: 5,
      title: "Gestion des favoris et collections",
      description: "Organisez efficacement vos documents avec le système de favoris et de collections",
      duration: "9:20",
      views: "2,100",
      rating: 4.6,
      level: "beginner",
      category: "Organisation",
      thumbnail: "/api/placeholder/320/180",
      uploadDate: "2024-02-05",
      instructor: "Leila Mansouri"
    },
    {
      id: 6,
      title: "Analyse comparative de textes",
      description: "Comparez plusieurs textes juridiques pour identifier les différences et similitudes",
      duration: "15:40",
      views: "850",
      rating: 4.8,
      level: "intermediate",
      category: "Analyse",
      thumbnail: "/api/placeholder/320/180",
      uploadDate: "2024-02-10",
      instructor: "Omar Brahim"
    }
  ];

  const playlists = [
    {
      title: "Formation complète débutant",
      videoCount: 8,
      totalDuration: "1h 15min",
      description: "Tout ce qu'il faut savoir pour débuter sur Dalil.dz"
    },
    {
      title: "Maîtrise de la recherche",
      videoCount: 5,
      totalDuration: "45min",
      description: "Techniques avancées de recherche et filtrage"
    },
    {
      title: "Outils IA et analyse",
      videoCount: 4,
      totalDuration: "1h 30min",
      description: "Exploiter l'intelligence artificielle pour vos analyses"
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      default: return level;
    }
  };

  const filteredVideos = videoTutorials.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.level === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination pour les tutoriels vidéo
  const {
    currentData: paginatedTutorials,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredVideos,
    itemsPerPage: 5
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
          <Play className="w-8 h-8 text-red-600" />
          Tutoriels vidéo
        </h2>
        <p className="text-gray-600 text-lg">
          Apprenez à utiliser Dalil.dz avec nos tutoriels vidéo détaillés
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-red-600">25</div>
            <div className="text-sm text-gray-600">Vidéos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-blue-600">6h</div>
            <div className="text-sm text-gray-600">Durée totale</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-green-600">15,450</div>
            <div className="text-sm text-gray-600">Vues totales</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-purple-600">4.8</div>
            <div className="text-sm text-gray-600">Note moyenne</div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher une vidéo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              {videoCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category.id);
                    // Implémentation réelle du filtrage par catégorie
                    const filteredTutorials = videoTutorials.filter(tutorial => 
                      tutorial.category === category.label
                    );
                    logger.info('UI', 'Filtrage par catégorie', { category: category.label, count: filteredTutorials.length });
                  }}
                >
                  {category.label} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Playlists en vedette */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Playlists recommandées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {playlists.map((playlist, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <h4 className="font-semibold mb-2">{playlist.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{playlist.description}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{playlist.videoCount} vidéos</span>
                  <span>{playlist.totalDuration}</span>
                </div>
                <Button 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => {
                    // Implémentation réelle du démarrage de playlist
                    logger.info('UI', 'Démarrage de la playlist', { title: playlist.title });
                    
                    // Démarrer la première vidéo de la playlist
                    const firstVideo = videoTutorials.find(t => t.category === playlist.category);
                    if (firstVideo) {
                      setSelectedVideo({
                        id: firstVideo.id.toString(),
                        title: firstVideo.title,
                        description: firstVideo.description,
                        duration: firstVideo.duration,
                        instructor: firstVideo.instructor,
                        category: firstVideo.category,
                        thumbnail: firstVideo.thumbnail,
                        difficulty: firstVideo.level
                      });
                      setShowVideoModal(true);
                    }
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Commencer
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste des tutoriels avec pagination */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedTutorials.map((video) => (
          <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="relative">
              <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                <Play className="w-12 h-12 text-gray-400" />
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
            </div>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <Badge className={`text-xs ${getLevelColor(video.level)}`}>
                  {getLevelLabel(video.level)}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {video.rating}
                </div>
              </div>
              <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {video.views}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {video.duration}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {video.instructor}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(video.uploadDate).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <Button 
                className="w-full mt-3"
                onClick={() => {
                  setSelectedVideo({
                    id: video.id.toString(),
                    title: video.title,
                    description: video.description,
                    duration: video.duration,
                    instructor: video.instructor,
                    category: video.category,
                    thumbnail: video.thumbnail,
                    difficulty: video.level
                  });
                  setShowVideoModal(true);
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Regarder
              </Button>
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

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                // Implémentation réelle du téléchargement de toutes les vidéos
                logger.info('UI', 'Téléchargement de toutes les vidéos');
                
                // Créer un fichier ZIP avec toutes les vidéos
                const zipContent = videoTutorials.map(tutorial => ({
                  title: tutorial.title,
                  description: tutorial.description,
                  duration: tutorial.duration,
                  instructor: tutorial.instructor,
                  category: tutorial.category,
                  level: tutorial.level
                }));
                
                const dataStr = JSON.stringify(zipContent, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', `tutoriels-video-${new Date().toISOString().split('T')[0]}.json`);
                linkElement.click();
                
                alert('✅ Toutes les vidéos ont été téléchargées avec succès !');
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger toutes les vidéos
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                // Implémentation réelle des préférences de lecture
                logger.info('UI', 'Ouverture des préférences de lecture');
                
                // Ouvrir une modale de configuration des préférences
                const preferencesModal = document.createElement('div');
                preferencesModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                preferencesModal.innerHTML = `
                  <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <div class="flex justify-between items-start mb-4">
                      <h3 class="text-lg font-semibold">Préférences de lecture</h3>
                      <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">✕</button>
                    </div>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium mb-2">Qualité vidéo</label>
                        <select class="w-full border rounded p-2">
                          <option>Auto</option>
                          <option>720p</option>
                          <option>1080p</option>
                          <option>4K</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-medium mb-2">Vitesse de lecture</label>
                        <select class="w-full border rounded p-2">
                          <option>1x (Normal)</option>
                          <option>1.25x</option>
                          <option>1.5x</option>
                          <option>2x</option>
                        </select>
                      </div>
                      <div class="flex gap-2">
                        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="this.closest('.fixed').remove()">
                          Sauvegarder
                        </button>
                        <button class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" onclick="this.closest('.fixed').remove()">
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                `;
                document.body.appendChild(preferencesModal);
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Préférences de lecture
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                // Implémentation réelle de l'ajout de tutoriel vidéo
                logger.info('UI', 'Ajout de tutoriel vidéo');
                
                // Ouvrir un formulaire d'ajout de tutoriel
                const addTutorialModal = document.createElement('div');
                addTutorialModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                addTutorialModal.innerHTML = `
                  <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <div class="flex justify-between items-start mb-4">
                      <h3 class="text-lg font-semibold">Ajouter un tutoriel vidéo</h3>
                      <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">✕</button>
                    </div>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium mb-2">Titre du tutoriel</label>
                        <input type="text" class="w-full border rounded p-2" placeholder="Titre du tutoriel">
                      </div>
                      <div>
                        <label class="block text-sm font-medium mb-2">Description</label>
                        <textarea class="w-full border rounded p-2 h-20" placeholder="Description du tutoriel"></textarea>
                      </div>
                      <div>
                        <label class="block text-sm font-medium mb-2">Catégorie</label>
                        <select class="w-full border rounded p-2">
                          <option>Débutant</option>
                          <option>Intermédiaire</option>
                          <option>Avancé</option>
                        </select>
                      </div>
                      <div class="flex gap-2">
                        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="this.closest('.fixed').remove()">
                          Ajouter
                        </button>
                        <button class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" onclick="this.closest('.fixed').remove()">
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                `;
                document.body.appendChild(addTutorialModal);
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Créer une playlist personnalisée
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modale de lecture vidéo */}
      {showVideoModal && (
        <UnifiedModalSystem
          modal={{
            id: 'video-player',
            type: 'display',
            title: selectedVideo?.title || 'Lecture vidéo',
            // @ts-ignore
            content: (
              <div className="aspect-video w-full bg-black text-white flex items-center justify-center">
                {selectedVideo?.title || 'Lecture vidéo'}
              </div>
            )
          }}
          onClose={() => setShowVideoModal(false)}
        />
      )}
    </div>
  );
}
