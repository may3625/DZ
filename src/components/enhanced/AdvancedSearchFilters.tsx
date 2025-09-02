/**
 * Filtres de recherche avancée pour Dalil.dz
 * Phase 2: Optimisation de la recherche avec filtres algériens
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  MapPin, 
  Building, 
  BookOpen,
  Scale,
  Clock,
  User,
  FileText,
  Tags,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';
import { logger } from '@/utils/logger';

// Données spécifiques à l'Algérie
const algerianWilayas = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
  'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Meniaa'
];

const algerianInstitutions = [
  'Présidence de la République',
  'Ministère de l\'Intérieur, des Collectivités locales et de l\'Aménagement du territoire',
  'Ministère de la Justice',
  'Ministère des Finances',
  'Ministère du Commerce et de la Promotion des exportations',
  'Ministère de l\'Éducation nationale',
  'Ministère de l\'Enseignement supérieur et de la Recherche scientifique',
  'Ministère de la Santé',
  'Ministère du Travail, de l\'Emploi et de la Sécurité sociale',
  'Ministère de l\'Agriculture et du Développement rural',
  'Ministère de l\'Industrie',
  'Ministère de l\'Énergie',
  'Ministère des Transports',
  'Ministère de l\'Habitat, de l\'Urbanisme et de la Ville',
  'Wilaya',
  'APC (Assemblée Populaire Communale)',
  'APW (Assemblée Populaire de Wilaya)',
  'CNRC (Centre National du Registre de Commerce)',
  'CNAS (Caisse Nationale des Assurances Sociales)',
  'CNRS (Centre National de Registre de Sécurité)',
  'Direction générale de la Sûreté nationale',
  'Gendarmerie nationale'
];

const legalCategories = [
  'Constitution',
  'Lois organiques',
  'Lois ordinaires',
  'Ordonnances',
  'Décrets présidentiels',
  'Décrets exécutifs',
  'Arrêtés ministériels',
  'Arrêtés interministériels',
  'Arrêtés de wilaya',
  'Décisions individuelles',
  'Circulaires',
  'Instructions',
  'Codes juridiques',
  'Traités internationaux',
  'Conventions',
  'Accords'
];

const procedureCategories = [
  'État civil',
  'Passeport et voyage',
  'Permis de conduire',
  'Carte d\'identité nationale',
  'Registre de commerce',
  'Déclarations fiscales',
  'Sécurité sociale',
  'Assurance maladie',
  'Urbanisme et construction',
  'Agriculture',
  'Industrie',
  'Commerce extérieur',
  'Douanes',
  'Justice',
  'Éducation',
  'Santé publique',
  'Transport',
  'Environnement',
  'Travail et emploi',
  'Immigration'
];

const juridicalFields = [
  'Droit constitutionnel',
  'Droit administratif',
  'Droit civil',
  'Droit pénal',
  'Droit commercial',
  'Droit du travail',
  'Droit fiscal',
  'Droit international',
  'Droit de la famille',
  'Droit immobilier',
  'Droit des affaires',
  'Droit bancaire',
  'Droit de l\'environnement',
  'Droit de la consommation',
  'Droit des assurances',
  'Droit de la propriété intellectuelle'
];

interface SearchFilters {
  query: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  wilayas: string[];
  institutions: string[];
  categories: string[];
  juridicalFields: string[];
  documentTypes: string[];
  status: string[];
  language: 'all' | 'fr' | 'ar';
  sortBy: 'relevance' | 'date' | 'alphabetical';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchFiltersProps {
  searchType: 'legal' | 'procedures' | 'mixed';
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  isLoading?: boolean;
}

export function AdvancedSearchFilters({ 
  searchType, 
  onFiltersChange, 
  onSearch, 
  initialFilters,
  isLoading = false 
}: AdvancedSearchFiltersProps) {
  const { t, isRTL } = useAlgerianI18n();
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    dateRange: { from: null, to: null },
    wilayas: [],
    institutions: [],
    categories: [],
    juridicalFields: [],
    documentTypes: [],
    status: [],
    language: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc',
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Calculer le nombre de filtres actifs
  useEffect(() => {
    let count = 0;
    if (filters.query.trim()) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.wilayas.length > 0) count++;
    if (filters.institutions.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.juridicalFields.length > 0) count++;
    if (filters.documentTypes.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.language !== 'all') count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange(newFilters);
    
    logger.info('Search', 'Filtres mis à jour', { 
      activeFilters: Object.keys(updates),
      filtersCount: activeFiltersCount
    }, 'AdvancedSearchFilters');
  }, [filters, onFiltersChange, activeFiltersCount]);

  const handleSearch = useCallback(() => {
    onSearch(filters);
    logger.info('Search', 'Recherche déclenchée', { 
      query: filters.query,
      filtersCount: activeFiltersCount,
      searchType
    }, 'AdvancedSearchFilters');
  }, [filters, onSearch, activeFiltersCount, searchType]);

  const clearFilters = useCallback(() => {
    const clearedFilters: SearchFilters = {
      query: '',
      dateRange: { from: null, to: null },
      wilayas: [],
      institutions: [],
      categories: [],
      juridicalFields: [],
      documentTypes: [],
      status: [],
      language: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc'
    };
    
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    
    logger.info('Search', 'Filtres réinitialisés', {}, 'AdvancedSearchFilters');
  }, [onFiltersChange]);

  const toggleArrayFilter = useCallback((array: string[], value: string, key: keyof SearchFilters) => {
    const newArray = array.includes(value) 
      ? array.filter(item => item !== value)
      : [...array, value];
    
    updateFilters({ [key]: newArray });
  }, [updateFilters]);

  const getRelevantCategories = () => {
    switch (searchType) {
      case 'legal':
        return legalCategories;
      case 'procedures':
        return procedureCategories;
      case 'mixed':
        return [...legalCategories, ...procedureCategories];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={filters.query}
                onChange={(e) => updateFilters({ query: e.target.value })}
                placeholder={`Rechercher ${searchType === 'legal' ? 'des textes juridiques' : searchType === 'procedures' ? 'des procédures' : 'dans la base'}...`}
                className="pl-10 pr-4"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isLoading}
              className="px-8"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Rechercher
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filtres actifs */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.query && (
                <Badge variant="secondary" className="gap-1">
                  <Search className="w-3 h-3" />
                  "{filters.query}"
                  <button onClick={() => updateFilters({ query: '' })}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.wilayas.map(wilaya => (
                <Badge key={wilaya} variant="secondary" className="gap-1">
                  <MapPin className="w-3 h-3" />
                  {wilaya}
                  <button onClick={() => toggleArrayFilter(filters.wilayas, wilaya, 'wilayas')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}

              {filters.institutions.map(institution => (
                <Badge key={institution} variant="secondary" className="gap-1">
                  <Building className="w-3 h-3" />
                  {institution.length > 30 ? `${institution.substring(0, 30)}...` : institution}
                  <button onClick={() => toggleArrayFilter(filters.institutions, institution, 'institutions')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}

              {filters.categories.map(category => (
                <Badge key={category} variant="secondary" className="gap-1">
                  <Tags className="w-3 h-3" />
                  {category}
                  <button onClick={() => toggleArrayFilter(filters.categories, category, 'categories')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                Tout effacer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtres avancés */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres avancés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Période */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Période de publication
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        {filters.dateRange.from ? (
                          format(filters.dateRange.from, "dd/MM/yyyy", { locale: fr })
                        ) : (
                          <span>Du...</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.from || undefined}
                        onSelect={(date) => updateFilters({ 
                          dateRange: { ...filters.dateRange, from: date || null }
                        })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        {filters.dateRange.to ? (
                          format(filters.dateRange.to, "dd/MM/yyyy", { locale: fr })
                        ) : (
                          <span>Au...</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.to || undefined}
                        onSelect={(date) => updateFilters({ 
                          dateRange: { ...filters.dateRange, to: date || null }
                        })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Wilayas */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Wilayas concernées
                </label>
                <Select 
                  value={undefined} 
                  onValueChange={(value) => toggleArrayFilter(filters.wilayas, value, 'wilayas')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`${filters.wilayas.length} sélectionnée(s)`} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {algerianWilayas.map((wilaya) => (
                      <SelectItem key={wilaya} value={wilaya}>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={filters.wilayas.includes(wilaya)}
                          />
                          {wilaya}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Institutions */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Institutions émettrices
                </label>
                <Select 
                  value={undefined} 
                  onValueChange={(value) => toggleArrayFilter(filters.institutions, value, 'institutions')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`${filters.institutions.length} sélectionnée(s)`} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {algerianInstitutions.map((institution) => (
                      <SelectItem key={institution} value={institution}>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={filters.institutions.includes(institution)}
                            disabled
                          />
                          <span className="truncate">{institution}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Catégories */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tags className="w-4 h-4" />
                  Catégories
                </label>
                <Select 
                  value={undefined} 
                  onValueChange={(value) => toggleArrayFilter(filters.categories, value, 'categories')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`${filters.categories.length} sélectionnée(s)`} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {getRelevantCategories().map((category) => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={filters.categories.includes(category)}
                            disabled
                          />
                          {category}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Domaines juridiques (pour les textes légaux) */}
              {(searchType === 'legal' || searchType === 'mixed') && (
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Domaines juridiques
                  </label>
                  <Select 
                    value={undefined} 
                    onValueChange={(value) => toggleArrayFilter(filters.juridicalFields, value, 'juridicalFields')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`${filters.juridicalFields.length} sélectionné(s)`} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {juridicalFields.map((field) => (
                        <SelectItem key={field} value={field}>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={filters.juridicalFields.includes(field)}
                              disabled
                            />
                            {field}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Langue */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Langue</label>
                <Select 
                  value={filters.language} 
                  onValueChange={(value) => updateFilters({ language: value as SearchFilters['language'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les langues</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tri */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Trier par</label>
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => updateFilters({ sortBy: value as SearchFilters['sortBy'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Pertinence</SelectItem>
                      <SelectItem value="date">Date de publication</SelectItem>
                      <SelectItem value="alphabetical">Ordre alphabétique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Ordre</label>
                  <Select 
                    value={filters.sortOrder} 
                    onValueChange={(value) => updateFilters({ sortOrder: value as SearchFilters['sortOrder'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Décroissant</SelectItem>
                      <SelectItem value="asc">Croissant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between border-t pt-4">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                disabled={activeFiltersCount === 0}
              >
                <X className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAdvanced(false)}>
                  Masquer les filtres
                </Button>
                <Button onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Appliquer et rechercher
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}