import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Calendar, 
  Building, 
  Eye,
  Download,
  Share2,
  Volume2
} from 'lucide-react';
import { TextToSpeechButton } from '../voice/TextToSpeechButton';

interface SearchResult {
  id: string;
  title: string;
  type: string;
  date: string;
  institution: string;
  summary: string;
  status: string;
  content?: string;
}

interface SearchResultsWithVoiceProps {
  results: SearchResult[];
  isLoading?: boolean;
  onViewDetail: (id: string) => void;
}

export function SearchResultsWithVoice({ 
  results, 
  isLoading = false, 
  onViewDetail 
}: SearchResultsWithVoiceProps) {
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'publié':
        return 'bg-green-100 text-green-800';
      case 'en vigueur':
        return 'bg-blue-100 text-blue-800';
      case 'abrogé':
        return 'bg-red-100 text-red-800';
      case 'modifié':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'loi':
        return '📜';
      case 'décret':
        return '📋';
      case 'arrêté':
        return '📝';
      case 'ordonnance':
        return '⚖️';
      default:
        return '📄';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun résultat trouvé
          </h3>
          <p className="text-gray-600">
            Essayez de modifier vos critères de recherche
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
        </h3>
        
        {/* Bouton pour lire le résumé de tous les résultats */}
        <TextToSpeechButton
          text={`${results.length} résultats trouvés. ${results.map((result, index) => 
            `Résultat ${index + 1}: ${result.title}. ${result.summary}`
          ).join(' ')}`}
          variant="outline"
          size="sm"
        >
          <span className="ml-1">Lire les résultats</span>
        </TextToSpeechButton>
      </div>

      {results.map((result) => (
        <Card key={result.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2 flex items-center gap-2">
                  <span>{getTypeIcon(result.type)}</span>
                  {result.title}
                </CardTitle>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {result.type}
                  </Badge>
                  <Badge className={`text-xs ${getStatusColor(result.status)}`}>
                    {result.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {result.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {result.institution}
                  </div>
                </div>
              </div>
              
              {/* Bouton de lecture audio pour ce résultat */}
              <TextToSpeechButton
                text={`${result.title}. ${result.summary}. Publié le ${result.date} par ${result.institution}.`}
                variant="ghost"
                size="sm"
                className="shrink-0"
              />
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-gray-700 mb-4 leading-relaxed">
              {result.summary}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetail(result.id)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Voir le détail
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    try {
                      const data = JSON.stringify(result, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${result.title.replace(/\s+/g, '_')}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    } catch (e) {
                      console.warn('Download failed', e);
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Télécharger
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    const shareData = {
                      title: result.title,
                      text: result.summary,
                      url: window.location.href
                    };
                    try {
                      if (navigator.share) {
                        await navigator.share(shareData);
                      } else {
                        await navigator.clipboard.writeText(`${shareData.title} - ${shareData.text}\n${shareData.url}`);
                        alert('Lien copié dans le presse-papiers');
                      }
                    } catch (e) {
                      console.warn('Share failed', e);
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Partager
                </Button>
              </div>
              
              {/* Lecture complète du contenu si disponible */}
              {result.content && (
                <TextToSpeechButton
                  text={result.content}
                  variant="outline"
                  size="sm"
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  Lire le texte complet
                </TextToSpeechButton>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}