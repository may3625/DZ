import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Eye,
  Volume2,
  Copy,
  Star,
  Tag
} from 'lucide-react';

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  synonyms: string[];
  examples: string[];
  relatedTerms: string[];
  sources: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  usage: number;
  verified: boolean;
  audioAvailable: boolean;
  lastUpdated: string;
}

export function GlossarySection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const glossaryTerms: GlossaryTerm[] = [
    {
      id: '1',
      term: 'Acte authentique',
      definition: 'Document rédigé par un officier public (notaire, huissier) dans les formes légales, qui fait foi de son contenu et de sa date.',
      category: 'Droit civil',
      synonyms: ['Acte notarié', 'Acte officiel'],
      examples: ['Contrat de vente immobilière', 'Testament authentique', 'Acte de mariage'],
      relatedTerms: ['Acte sous seing privé', 'Notaire', 'Force probante'],
      sources: ['Code civil algérien - Article 324', 'Code du notariat'],
      difficulty: 'intermediate',
      usage: 1247,
      verified: true,
      audioAvailable: true,
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      term: 'Cassation',
      definition: 'Annulation d\'une décision de justice par la Cour suprême pour violation de la loi ou vice de procédure.',
      category: 'Procédure civile',
      synonyms: ['Annulation', 'Casse'],
      examples: ['Pourvoi en cassation', 'Arrêt de cassation', 'Renvoi après cassation'],
      relatedTerms: ['Cour suprême', 'Pourvoi', 'Renvoi'],
      sources: ['Code de procédure civile - Articles 350-365'],
      difficulty: 'advanced',
      usage: 892,
      verified: true,
      audioAvailable: true,
      lastUpdated: '2024-01-12'
    },
    {
      id: '3',
      term: 'Démembrement',
      definition: 'Division du droit de propriété entre différentes personnes, notamment entre usufruit et nue-propriété.',
      category: 'Droit des biens',
      synonyms: ['Division du droit de propriété'],
      examples: ['Usufruit', 'Nue-propriété', 'Droit d\'usage', 'Droit d\'habitation'],
      relatedTerms: ['Usufruit', 'Nue-propriété', 'Propriété', 'Servitude'],
      sources: ['Code civil algérien - Articles 674-711'],
      difficulty: 'intermediate',
      usage: 756,
      verified: true,
      audioAvailable: false,
      lastUpdated: '2024-01-10'
    },
    {
      id: '4',
      term: 'Force majeure',
      definition: 'Événement imprévisible, irrésistible et extérieur qui empêche l\'exécution d\'une obligation contractuelle.',
      category: 'Droit des obligations',
      synonyms: ['Cas fortuit', 'Événement insurmontable'],
      examples: ['Catastrophe naturelle', 'Guerre', 'Épidémie', 'Grève générale'],
      relatedTerms: ['Cas fortuit', 'Inexécution', 'Responsabilité', 'Exonération'],
      sources: ['Code civil algérien - Article 176'],
      difficulty: 'basic',
      usage: 1456,
      verified: true,
      audioAvailable: true,
      lastUpdated: '2024-01-14'
    },
    {
      id: '5',
      term: 'Hypothèque',
      definition: 'Sûreté réelle immobilière qui confère au créancier un droit de suite et un droit de préférence sur l\'immeuble grevé.',
      category: 'Droit des sûretés',
      synonyms: ['Garantie immobilière'],
      examples: ['Hypothèque conventionnelle', 'Hypothèque légale', 'Hypothèque judiciaire'],
      relatedTerms: ['Sûreté réelle', 'Créancier hypothécaire', 'Inscription', 'Mainlevée'],
      sources: ['Code civil algérien - Articles 882-947'],
      difficulty: 'intermediate',
      usage: 634,
      verified: true,
      audioAvailable: true,
      lastUpdated: '2024-01-08'
    },
    {
      id: '6',
      term: 'Jurisprudence',
      definition: 'Ensemble des décisions rendues par les tribunaux qui constituent une source du droit par l\'interprétation des textes.',
      category: 'Sources du droit',
      synonyms: ['Décisions judiciaires', 'Précédents'],
      examples: ['Arrêts de la Cour suprême', 'Jurisprudence constante', 'Revirement de jurisprudence'],
      relatedTerms: ['Précédent', 'Doctrine', 'Interprétation', 'Source du droit'],
      sources: ['Théorie générale du droit'],
      difficulty: 'basic',
      usage: 2103,
      verified: true,
      audioAvailable: true,
      lastUpdated: '2024-01-13'
    },
    {
      id: '7',
      term: 'Nullité',
      definition: 'Sanction frappant un acte juridique qui ne respecte pas les conditions de validité prévues par la loi.',
      category: 'Théorie générale des actes juridiques',
      synonyms: ['Invalidité', 'Annulation'],
      examples: ['Nullité absolue', 'Nullité relative', 'Nullité du mariage'],
      relatedTerms: ['Validité', 'Vice', 'Annulation', 'Caducité'],
      sources: ['Code civil algérien - Articles 97-103'],
      difficulty: 'intermediate',
      usage: 987,
      verified: true,
      audioAvailable: false,
      lastUpdated: '2024-01-11'
    },
    {
      id: '8',
      term: 'Prescription',
      definition: 'Mode d\'acquisition ou d\'extinction d\'un droit par l\'écoulement du temps dans les conditions fixées par la loi.',
      category: 'Théorie générale du droit',
      synonyms: ['Forclusion temporelle'],
      examples: ['Prescription acquisitive', 'Prescription extinctive', 'Prescription pénale'],
      relatedTerms: ['Délai', 'Interruption', 'Suspension', 'Forclusion'],
      sources: ['Code civil algérien - Articles 308-327'],
      difficulty: 'advanced',
      usage: 1567,
      verified: true,
      audioAvailable: true,
      lastUpdated: '2024-01-09'
    }
  ];

  // Filtrage des termes
  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.synonyms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || term.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || term.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Pagination
  const {
    currentData: paginatedTerms,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredTerms,
    itemsPerPage: 5
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-teal-100 text-teal-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ];
    const hash = category.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleCopyTerm = (term: string) => {
    navigator.clipboard.writeText(term);
  };

  const handlePlayAudio = (term: string) => {
    console.log(`Lecture audio: ${term}`);
  };

  // Catégories uniques
  const categories = [...new Set(glossaryTerms.map(term => term.category))];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Glossaire Juridique Général
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Dictionnaire des termes juridiques algériens avec définitions, exemples et références
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter un terme
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{glossaryTerms.length}</div>
            <div className="text-sm text-gray-600">Termes totaux</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {glossaryTerms.filter(t => t.verified).length}
            </div>
            <div className="text-sm text-gray-600">Termes vérifiés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
            <div className="text-sm text-gray-600">Catégories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {glossaryTerms.filter(t => t.audioAvailable).length}
            </div>
            <div className="text-sm text-gray-600">Audio disponible</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher un terme..."
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
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select 
              className="border rounded px-3 py-2"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="all">Tous niveaux</option>
              <option value="basic">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Plus de filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des termes */}
      <div className="space-y-4">
        {paginatedTerms.map((term) => (
          <Card key={term.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* En-tête du terme */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{term.term}</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCopyTerm(term.term)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {term.audioAvailable && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handlePlayAudio(term.term)}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getCategoryColor(term.category)}>
                        {term.category}
                      </Badge>
                      <Badge className={getDifficultyColor(term.difficulty)}>
                        {term.difficulty === 'basic' ? 'Débutant' :
                         term.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                      </Badge>
                      {term.verified && (
                        <Badge className="bg-green-100 text-green-800">
                          ✓ Vérifié
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                      <Star className="w-4 h-4" />
                      <span>{term.usage} utilisations</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Mis à jour: {new Date(term.lastUpdated).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>

                {/* Définition */}
                <div>
                  <p className="text-gray-700 leading-relaxed">{term.definition}</p>
                </div>

                {/* Synonymes */}
                {term.synonyms.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Synonymes :</h4>
                    <div className="flex flex-wrap gap-2">
                      {term.synonyms.map((synonym, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {synonym}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exemples */}
                {term.examples.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Exemples :</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {term.examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Termes liés */}
                {term.relatedTerms.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Termes liés :</h4>
                    <div className="flex flex-wrap gap-2">
                      {term.relatedTerms.map((relatedTerm, index) => (
                        <Button key={index} variant="ghost" size="sm" className="text-xs p-1 h-auto">
                          {relatedTerm}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sources */}
                {term.sources.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Sources :</h4>
                    <div className="text-sm text-blue-600">
                      {term.sources.map((source, index) => (
                        <div key={index} className="mb-1">
                          • {source}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Eye className="w-4 h-4" />
                    Voir détails
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Edit className="w-4 h-4" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Tag className="w-4 h-4" />
                    Ajouter tag
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

      {/* Catégories principales */}
      <Card>
        <CardHeader>
          <CardTitle>Catégories Principales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const categoryCount = glossaryTerms.filter(t => t.category === category).length;
              return (
                <div key={category} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="font-medium text-sm">{category}</div>
                  <div className="text-xs text-gray-500">{categoryCount} termes</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}