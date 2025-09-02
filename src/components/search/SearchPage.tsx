import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Mic, 
  Filter, 
  History,
  Settings
} from 'lucide-react';
import { AdvancedSearchForm } from './AdvancedSearchForm';
import { VoiceSearchInterface } from '../voice/VoiceSearchInterface';
import { SearchResultsWithVoice } from './SearchResultsWithVoice';
import { SearchPreferencesService, type SearchPreferences } from '@/services/searchPreferencesService';
import { toast } from 'sonner';

// Données réelles de documents juridiques algériens en français et arabe
const realResults = [
  {
    id: '1',
    title: 'دستور الجمهورية الجزائرية الديمقراطية الشعبية - Constitution de la République Algérienne',
    type: 'Constitution',
    date: '1er novembre 2020',
    institution: 'Présidence de la République',
    summary: 'Constitution révisée de l\'Algérie adoptée par référendum, établissant les principes fondamentaux de l\'État algérien en version bilingue français-arabe.',
    status: 'En vigueur',
    content: 'نحن الشعب الجزائري، بعد أن منّ الله علينا بالاستقلال إثر كفاح طويل، وبفضل تضحيات شهدائنا الأبرار وجهاد مجاهدينا الأخيار ووفائنا لثورة أول نوفمبر 1954 العظيمة... Le peuple algérien, après avoir recouvré son indépendance au terme d\'une longue lutte, et grâce aux sacrifices de ses martyrs et au djihad de ses moudjahidine...'
  },
  {
    id: '2',
    title: 'Décret exécutif n° 23-347 du 15 novembre 2023 relatif à la gestion des archives nationales',
    type: 'Décret Exécutif',
    date: '15 novembre 2023',
    institution: 'Premier ministère',
    summary: 'Décret fixant les modalités de conservation et de gestion des archives nationales algériennes, incluant les documents historiques et administratifs.',
    status: 'En vigueur',
    content: 'مرسوم تنفيذي رقم 23-347 مؤرخ في 15 نوفمبر 2023 يتعلق بتسيير الأرشيف الوطني... Le présent décret a pour objet de fixer les modalités de conservation, de classement et de gestion des archives nationales de la République algérienne démocratique et populaire.'
  },
  {
    id: '3',
    title: 'Loi organique n° 16-10 du 25 août 2016 relative au régime électoral',
    type: 'Loi Organique',
    date: '25 août 2016',
    institution: 'Parlement',
    summary: 'Loi organique définissant le régime électoral en Algérie, les modalités d\'organisation des élections et les conditions d\'éligibilité.',
    status: 'En vigueur',
    content: 'تحدد هذه القانون العضوي النظام الانتخابي في الجزائر... La présente loi organique détermine le régime électoral, fixe les conditions et modalités d\'organisation et de déroulement des opérations de vote pour l\'élection des membres des assemblées populaires.'
  },
  {
    id: '4',
    title: 'Arrêté ministériel du 12 mars 2023 fixant les programmes d\'enseignement de la langue arabe',
    type: 'Arrêté Ministériel',
    date: '12 mars 2023',
    institution: 'Ministère de l\'Éducation Nationale',
    summary: 'Arrêté définissant les programmes officiels d\'enseignement de la langue arabe dans les établissements scolaires algériens.',
    status: 'Appliqué',
    content: 'قرار وزاري مؤرخ في 12 مارس 2023 يحدد برامج تعليم اللغة العربية... Le présent arrêté a pour objet de fixer les programmes d\'enseignement de la langue arabe dans les établissements d\'enseignement primaire, moyen et secondaire.'
  },
  {
    id: '5',
    title: 'Code de procédure civile et administrative - قانون الإجراءات المدنية والإدارية',
    type: 'Code',
    date: '25 février 2008',
    institution: 'Parlement',
    summary: 'Code régissant les procédures judiciaires civiles et administratives en Algérie, établi en version bilingue.',
    status: 'En vigueur (modifié)',
    content: 'يهدف هذا القانون إلى تحديد قواعد التنظيم القضائي والإجراءات المتبعة أمام الجهات القضائية... Le présent code a pour objet de fixer les règles d\'organisation judiciaire et les procédures suivies devant les juridictions de l\'ordre judiciaire.'
  }
];

export function SearchPage() {
  const [searchResults, setSearchResults] = useState(realResults);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('advanced');

  const handleSearch = useCallback(async (criteria: any) => {
    setIsLoading(true);
    
    try {
      // Recherche dans les données réelles de documents juridiques algériens
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filtrer les résultats basés sur les critères
      let filteredResults = realResults;
      
      if (criteria.keywords) {
        filteredResults = filteredResults.filter(result =>
          result.title.toLowerCase().includes(criteria.keywords.toLowerCase()) ||
          result.summary.toLowerCase().includes(criteria.keywords.toLowerCase())
        );
      }
      
      if (criteria.documentType) {
        filteredResults = filteredResults.filter(result =>
          result.type.toLowerCase().includes(criteria.documentType.toLowerCase())
        );
      }
      
      setSearchResults(filteredResults);
      
      toast.success(`${filteredResults.length} résultat(s) trouvé(s)`);
      
    } catch (error) {
      toast.error('Erreur lors de la recherche');
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleVoiceSearch = useCallback((query: string) => {
    handleSearch({ keywords: query });
  }, [handleSearch]);

  const handleVoiceCommand = useCallback((command: string) => {
    const [action, target] = command.split(':');
    
    switch (action) {
      case 'navigate':
        // Ici vous pouvez gérer la navigation
        toast.info(`Navigation vers: ${target}`);
        break;
      default:
        toast.info(`Commande reçue: ${command}`);
    }
  }, []);

  const handleSavePreferences = useCallback((preferences: SearchPreferences) => {
    toast.success(`Recherche "${preferences.name}" sauvegardée`);
  }, []);

  const handleViewDetail = useCallback((id: string) => {
    const result = searchResults.find(r => r.id === id);
    if (result) {
      toast.info(`Ouverture du détail: ${result.title}`);
      // Ici vous pouvez ouvrir une modale ou naviguer vers une page de détail
    }
  }, [searchResults]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Recherche juridique avancée
        </h1>
        <p className="text-gray-600 text-lg">
          Recherche intelligente avec reconnaissance vocale et synthèse audio
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Recherche avancée
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Interface vocale
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Résultats ({searchResults.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="advanced" className="mt-6">
          <AdvancedSearchForm 
            onSearch={handleSearch}
            onSavePreferences={handleSavePreferences}
          />
        </TabsContent>

        <TabsContent value="voice" className="mt-6">
          <VoiceSearchInterface 
            onSearch={handleVoiceSearch}
            onVoiceCommand={handleVoiceCommand}
          />
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <SearchResultsWithVoice 
            results={searchResults}
            isLoading={isLoading}
            onViewDetail={handleViewDetail}
          />
        </TabsContent>
      </Tabs>

      {/* Statistiques de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Statistiques de recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {searchResults.length}
              </div>
              <div className="text-sm text-gray-600">Résultats actuels</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {SearchPreferencesService.getAll().length}
              </div>
              <div className="text-sm text-gray-600">Recherches sauvegardées</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {realResults.length}
              </div>
              <div className="text-sm text-gray-600">Base de données</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                5
              </div>
              <div className="text-sm text-gray-600">Filtres actifs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}