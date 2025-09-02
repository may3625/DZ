import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Languages, 
  Search, 
  BookOpen,
  Star,
  CheckCircle,
  AlertCircle,
  Volume2,
  Copy
} from 'lucide-react';

export function ContextualTranslations() {
  const [searchTerm, setSearchTerm] = useState('');

  const translations = [
    {
      id: 1,
      french: 'Code civil',
      arabic: 'القانون المدني',
      context: 'Droit civil',
      category: 'Codes juridiques',
      verified: true,
      usage: 1247,
      audioAvailable: true
    },
    {
      id: 2,
      french: 'Procédure administrative',
      arabic: 'الإجراء الإداري',
      context: 'Administration publique',
      category: 'Procédures',
      verified: true,
      usage: 892,
      audioAvailable: true
    },
    {
      id: 3,
      french: 'Permis de construire',
      arabic: 'رخصة البناء',
      context: 'Urbanisme',
      category: 'Autorisations',
      verified: true,
      usage: 756,
      audioAvailable: false
    },
    {
      id: 4,
      french: 'Contrat de travail',
      arabic: 'عقد العمل',
      context: 'Droit du travail',
      category: 'Contrats',
      verified: true,
      usage: 634,
      audioAvailable: true
    },
    {
      id: 5,
      french: 'Décret exécutif',
      arabic: 'مرسوم تنفيذي',
      context: 'Textes réglementaires',
      category: 'Décrets',
      verified: true,
      usage: 523,
      audioAvailable: true
    },
    {
      id: 6,
      french: 'Tribunal de première instance',
      arabic: 'المحكمة الابتدائية',
      context: 'Organisation judiciaire',
      category: 'Institutions',
      verified: false,
      usage: 445,
      audioAvailable: false
    },
    {
      id: 7,
      french: 'Acte authentique',
      arabic: 'العقد الرسمي',
      context: 'Actes juridiques',
      category: 'Documents',
      verified: true,
      usage: 389,
      audioAvailable: true
    },
    {
      id: 8,
      french: 'Recours gracieux',
      arabic: 'الطعن الودي',
      context: 'Voies de recours',
      category: 'Procédures',
      verified: false,
      usage: 312,
      audioAvailable: false
    },
    {
      id: 9,
      french: 'Assemblée Populaire Nationale',
      arabic: 'المجلس الشعبي الوطني',
      context: 'Institutions politiques',
      category: 'Institutions',
      verified: true,
      usage: 289,
      audioAvailable: true
    },
    {
      id: 10,
      french: 'Casier judiciaire',
      arabic: 'السجل العدلي',
      context: 'Justice pénale',
      category: 'Documents',
      verified: true,
      usage: 267,
      audioAvailable: true
    },
    {
      id: 11,
      french: 'Zone industrielle',
      arabic: 'المنطقة الصناعية',
      context: 'Aménagement du territoire',
      category: 'Urbanisme',
      verified: true,
      usage: 234,
      audioAvailable: false
    },
    {
      id: 12,
      french: 'Société à responsabilité limitée',
      arabic: 'شركة ذات مسؤولية محدودة',
      context: 'Droit des sociétés',
      category: 'Entreprises',
      verified: true,
      usage: 198,
      audioAvailable: true
    }
  ];

  // Filtrage par terme de recherche
  const filteredTranslations = translations.filter(
    translation =>
      translation.french.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.arabic.includes(searchTerm) ||
      translation.context.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination pour les traductions contextuelles
  const {
    currentData: paginatedTranslations,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: filteredTranslations,
    itemsPerPage: 5
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handlePlayAudio = (text: string) => {
    // Simulation de lecture audio
    console.log(`Lecture audio: ${text}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-emerald-600" />
            Traductions Contextuelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher une traduction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Liste des traductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedTranslations.map((translation) => (
              <Card key={translation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Français */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">🇫🇷 Français</div>
                        <div className="font-medium">{translation.french}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCopy(translation.french)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        {translation.audioAvailable && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handlePlayAudio(translation.french)}
                          >
                            <Volume2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Arabe */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">🇩🇿 العربية</div>
                        <div className="font-medium text-right" dir="rtl">{translation.arabic}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCopy(translation.arabic)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        {translation.audioAvailable && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handlePlayAudio(translation.arabic)}
                          >
                            <Volume2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Métadonnées */}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {translation.category}
                          </Badge>
                          {translation.verified ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="w-3 h-3" />
                          {translation.usage}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Contexte:</span> {translation.context}
                      </div>
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

          {/* Statistiques */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Statistiques du dictionnaire
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{translations.length}</div>
                <div className="text-gray-600">Traductions totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {translations.filter(t => t.verified).length}
                </div>
                <div className="text-gray-600">Vérifiées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {translations.filter(t => t.audioAvailable).length}
                </div>
                <div className="text-gray-600">Audio disponible</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">8</div>
                <div className="text-gray-600">Catégories</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}