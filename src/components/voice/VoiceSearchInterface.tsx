import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  MessageSquare, 
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useLocalTTS } from '@/hooks/useLocalTTS';

interface VoiceSearchInterfaceProps {
  onSearch: (query: string) => void;
  onVoiceCommand: (command: string) => void;
  apiKey?: string;
}

export function VoiceSearchInterface({ onSearch, onVoiceCommand, apiKey }: VoiceSearchInterfaceProps) {
  const [conversation, setConversation] = useState<Array<{
    type: 'user' | 'system';
    message: string;
    timestamp: Date;
  }>>([]);
  const [lastCommand, setLastCommand] = useState('');

  const {
    isListening,
    transcript,
    isSupported,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceRecognition({
    continuous: true,
    interimResults: true,
    language: 'fr-FR'
  });

const { speak, isPlaying, isLoading, error: ttsError } = useLocalTTS();

  // Define helper functions first
  const addToConversation = useCallback((type: 'user' | 'system', message: string) => {
    setConversation(prev => [...prev, {
      type,
      message,
      timestamp: new Date()
    }]);
  }, []);

  const handleVoiceSearch = useCallback((query: string) => {
    addToConversation('user', `Recherche: ${query}`);
    onSearch(query);
    
    speak({ 
      text: `Recherche en cours pour: ${query}. Je vais afficher les résultats.` 
    });
    
    addToConversation('system', `Recherche lancée pour: ${query}`);
  }, [onSearch, speak, addToConversation]);

  const handleNavigationCommand = useCallback((command: string) => {
    let destination = '';
    
    if (command.includes('recherche sauvegardée')) {
      destination = 'recherches sauvegardées';
    } else if (command.includes('historique')) {
      destination = 'historique';
    } else if (command.includes('profil')) {
      destination = 'profil';
    } else if (command.includes('aide')) {
      destination = 'aide';
    }
    
    if (destination) {
      addToConversation('user', `Navigation vers: ${destination}`);
      speak({ text: `Navigation vers ${destination}` });
      onVoiceCommand(`navigate_${destination.replace(' ', '_')}`);
      addToConversation('system', `Navigation vers ${destination} activée`);
    }
  }, [onVoiceCommand, speak, addToConversation]);

  const handleHelpCommand = useCallback(() => {
    const helpText = `
      Commandes disponibles:
      - Dire "rechercher" suivi de votre requête
      - Dire "aller à" suivi d'une section
      - Dire "stop" ou "arrêter" pour arrêter l'écoute
      - Dire "aide" pour cette aide
    `;
    
    addToConversation('system', helpText);
    speak({ text: helpText });
  }, [speak, addToConversation]);

  const handleStopCommand = useCallback(() => {
    if (isListening) {
      stopListening();
      addToConversation('system', 'Écoute arrêtée');
      speak({ text: 'Écoute arrêtée.' });
    }
  }, [isListening, stopListening, addToConversation, speak]);

  // Traitement des commandes vocales
  useEffect(() => {
    if (transcript && transcript !== lastCommand) {
      const command = transcript.toLowerCase().trim();
      
      // Commandes de recherche
      if (command.includes('recherche') || command.includes('chercher')) {
        const searchQuery = command
          .replace(/recherche|chercher|pour|sur|les?|des?|un|une/gi, '')
          .trim();
        if (searchQuery) {
          handleVoiceSearch(searchQuery);
        }
      }
      
      // Commandes de navigation
      else if (command.includes('aller') || command.includes('ouvrir') || command.includes('naviguer')) {
        handleNavigationCommand(command);
      }
      
      // Commandes d'aide
      else if (command.includes('aide') || command.includes('help')) {
        handleHelpCommand();
      }
      
      // Commande d'arrêt
      else if (command.includes('arrêter') || command.includes('stop')) {
        handleStopCommand();
      }

      setLastCommand(transcript);
    }
  }, [transcript, lastCommand, handleHelpCommand, handleNavigationCommand, handleStopCommand, handleVoiceSearch]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      addToConversation('system', 'Écoute arrêtée');
    } else {
      resetTranscript();
      startListening();
      addToConversation('system', 'Écoute activée - Parlez maintenant');
      speak({ text: 'Écoute activée. Que puis-je faire pour vous?' });
    }
  };

  const clearConversation = () => {
    setConversation([]);
  };

  return (
    <div className="space-y-4">
      {/* Interface de contrôle vocal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Interface vocale conversationnelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Statut et contrôles */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={isListening ? "default" : "outline"}
                  size="lg"
                  onClick={toggleListening}
                  disabled={!isSupported}
                  className={isListening ? "bg-red-600 hover:bg-red-700 animate-pulse" : ""}
                >
                  {isListening ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                  {isListening ? 'Arrêter l\'écoute' : 'Commencer l\'écoute'}
                </Button>
                
                {isListening && (
                  <Badge variant="outline" className="animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    En écoute...
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isPlaying && (
                  <Badge variant="outline">
                    <Volume2 className="w-3 h-3 mr-1" />
                    Lecture en cours
                  </Badge>
                )}
                
                {isLoading && (
                  <Badge variant="outline">
                    Traitement...
                  </Badge>
                )}
              </div>
            </div>

            {/* Transcript en temps réel */}
            {transcript && (
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Mic className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Transcription en cours:</span>
                </div>
                <p className="text-gray-900">{transcript}</p>
              </div>
            )}

            {/* Erreurs */}
            {(voiceError || ttsError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">Erreur:</span>
                </div>
                <p className="text-red-600 text-sm">{voiceError || ttsError}</p>
              </div>
            )}

            {/* Support info */}
            {!isSupported && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700">
                    La reconnaissance vocale n'est pas supportée par votre navigateur
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historique des interactions */}
      {conversation.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Conversation
              </CardTitle>
              <Button variant="outline" size="sm" onClick={clearConversation}>
                Effacer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {conversation.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    item.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      item.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{item.message}</p>
                    <p className={`text-xs mt-1 ${
                      item.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {item.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commandes disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Commandes vocales disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              "Recherche [terme]" - Lancer une recherche
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              "Aller à [section]" - Navigation
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              "Aide" - Afficher l'aide
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              "Arrêter" - Arrêter l'écoute
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}