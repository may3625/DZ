import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Save, 
  History, 
  Filter,
  Calendar,
  FileText,
  Building,
  X,
  Mic,
  MicOff
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { SearchPreferencesService, type SearchPreferences } from '@/services/searchPreferencesService';

interface AdvancedSearchFormProps {
  onSearch: (criteria: any) => void;
  onSavePreferences?: (preferences: SearchPreferences) => void;
}

export function AdvancedSearchForm({ onSearch, onSavePreferences }: AdvancedSearchFormProps) {
  const [searchCriteria, setSearchCriteria] = useState({
    keywords: '',
    exactPhrase: '',
    excludeWords: '',
    documentType: '',
    institution: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    fullTextSearch: '',
    includeArchived: false,
    officialOnly: true
  });

  const [savedPreferences, setSavedPreferences] = useState<SearchPreferences[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [preferenceName, setPreferenceName] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Debounce pour la recherche en temps réel
  const debouncedSearchCriteria = useDebounce(searchCriteria, 500);

  // Hook de reconnaissance vocale
  const {
    isListening,
    transcript,
    isSupported,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceRecognition({
    continuous: false,
    interimResults: true,
    language: 'fr-FR'
  });

  // Effet pour la recherche en temps réel
  useEffect(() => {
    if (debouncedSearchCriteria.keywords.length > 2) {
      onSearch(debouncedSearchCriteria);
    }
  }, [debouncedSearchCriteria, onSearch]);

  // Charger les préférences sauvegardées
  useEffect(() => {
    setSavedPreferences(SearchPreferencesService.getRecent(10));
  }, []);

  // Gestion de la reconnaissance vocale
  useEffect(() => {
    if (transcript && isVoiceActive) {
      setSearchCriteria(prev => ({
        ...prev,
        keywords: transcript
      }));
    }
  }, [transcript, isVoiceActive]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      setIsVoiceActive(false);
    } else {
      resetTranscript();
      startListening();
      setIsVoiceActive(true);
    }
  };

  const handleSearch = () => {
    onSearch(searchCriteria);
  };

  const handleSavePreferences = () => {
    if (!preferenceName.trim()) return;

    const preferences = SearchPreferencesService.save({
      name: preferenceName,
      searchTerm: searchCriteria.keywords,
      filters: {
        types: searchCriteria.documentType ? [searchCriteria.documentType] : [],
        statuses: [],
        institutions: searchCriteria.institution ? [searchCriteria.institution] : [],
        categories: searchCriteria.category ? [searchCriteria.category] : [],
        dateRange: searchCriteria.dateFrom && searchCriteria.dateTo ? {
          start: searchCriteria.dateFrom,
          end: searchCriteria.dateTo
        } : undefined
      },
      sortBy: {
        field: 'date',
        direction: 'desc'
      }
    });

    setSavedPreferences(SearchPreferencesService.getRecent(10));
    onSavePreferences?.(preferences);
    setShowSaveModal(false);
    setPreferenceName('');
  };

  const loadPreferences = (preferences: SearchPreferences) => {
    setSearchCriteria({
      keywords: preferences.searchTerm,
      exactPhrase: '',
      excludeWords: '',
      documentType: preferences.filters.types[0] || '',
      institution: preferences.filters.institutions[0] || '',
      category: preferences.filters.categories[0] || '',
      dateFrom: preferences.filters.dateRange?.start || '',
      dateTo: preferences.filters.dateRange?.end || '',
      fullTextSearch: '',
      includeArchived: false,
      officialOnly: true
    });
    SearchPreferencesService.markAsUsed(preferences.id);
  };

  const clearForm = () => {
    setSearchCriteria({
      keywords: '',
      exactPhrase: '',
      excludeWords: '',
      documentType: '',
      institution: '',
      category: '',
      dateFrom: '',
      dateTo: '',
      fullTextSearch: '',
      includeArchived: false,
      officialOnly: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Recherche principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Recherche avancée
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <Label htmlFor="keywords">Mots-clés</Label>
              <div className="flex gap-2">
                <Input
                  id="keywords"
                  value={searchCriteria.keywords}
                  onChange={(e) => setSearchCriteria(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="Rechercher par mots-clés..."
                  className="flex-1"
                />
                {isSupported && (
                  <Button
                    type="button"
                    variant={isListening ? "default" : "outline"}
                    size="sm"
                    onClick={handleVoiceToggle}
                    className={isListening ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
              </div>
              {voiceError && (
                <p className="text-sm text-red-600 mt-1">{voiceError}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exactPhrase">Expression exacte</Label>
                <Input
                  id="exactPhrase"
                  value={searchCriteria.exactPhrase}
                  onChange={(e) => setSearchCriteria(prev => ({ ...prev, exactPhrase: e.target.value }))}
                  placeholder="Expression entre guillemets"
                />
              </div>
              <div>
                <Label htmlFor="excludeWords">Exclure les mots</Label>
                <Input
                  id="excludeWords"
                  value={searchCriteria.excludeWords}
                  onChange={(e) => setSearchCriteria(prev => ({ ...prev, excludeWords: e.target.value }))}
                  placeholder="Mots à exclure"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Type de document</Label>
              <Select 
                value={searchCriteria.documentType} 
                onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, documentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loi">Loi</SelectItem>
                  <SelectItem value="decret">Décret</SelectItem>
                  <SelectItem value="arrete">Arrêté</SelectItem>
                  <SelectItem value="ordonnance">Ordonnance</SelectItem>
                  <SelectItem value="circulaire">Circulaire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Institution</Label>
              <Select 
                value={searchCriteria.institution} 
                onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, institution: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Institution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presidence">Présidence de la République</SelectItem>
                  <SelectItem value="premier-ministre">Premier ministère</SelectItem>
                  <SelectItem value="justice">Ministère de la Justice</SelectItem>
                  <SelectItem value="interieur">Ministère de l'Intérieur</SelectItem>
                  <SelectItem value="finances">Ministère des Finances</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Catégorie</Label>
              <Select 
                value={searchCriteria.category} 
                onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administratif">Droit administratif</SelectItem>
                  <SelectItem value="civil">Droit civil</SelectItem>
                  <SelectItem value="penal">Droit pénal</SelectItem>
                  <SelectItem value="commercial">Droit commercial</SelectItem>
                  <SelectItem value="social">Droit social</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateFrom">Date de début</Label>
              <Input
                id="dateFrom"
                type="date"
                value={searchCriteria.dateFrom}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Date de fin</Label>
              <Input
                id="dateTo"
                type="date"
                value={searchCriteria.dateTo}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeArchived"
                checked={searchCriteria.includeArchived}
                onCheckedChange={(checked) => 
                  setSearchCriteria(prev => ({ ...prev, includeArchived: !!checked }))
                }
              />
              <Label htmlFor="includeArchived">Inclure les documents archivés</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="officialOnly"
                checked={searchCriteria.officialOnly}
                onCheckedChange={(checked) => 
                  setSearchCriteria(prev => ({ ...prev, officialOnly: !!checked }))
                }
              />
              <Label htmlFor="officialOnly">Documents officiels uniquement</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recherche full-text */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recherche dans le contenu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="fullTextSearch">Recherche dans le texte intégral</Label>
            <Textarea
              id="fullTextSearch"
              value={searchCriteria.fullTextSearch}
              onChange={(e) => setSearchCriteria(prev => ({ ...prev, fullTextSearch: e.target.value }))}
              placeholder="Rechercher dans le contenu complet des documents"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Préférences sauvegardées */}
      {savedPreferences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Recherches récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedPreferences.map((pref) => (
                <Badge
                  key={pref.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => loadPreferences(pref)}
                >
                  {pref.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearForm}>
            <X className="w-4 h-4 mr-2" />
            Effacer
          </Button>
          <Button variant="outline" onClick={() => setShowSaveModal(true)}>
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
        <Button onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" />
          Rechercher
        </Button>
      </div>

      {/* Modal de sauvegarde */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Sauvegarder la recherche</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="preference-name">Nom de la recherche</Label>
                <Input
                  id="preference-name"
                  value={preferenceName}
                  onChange={(e) => setPreferenceName(e.target.value)}
                  placeholder="Ex: Lois sur l'environnement 2025"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSaveModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSavePreferences} disabled={!preferenceName.trim()}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}