import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useLocalTTS } from '@/hooks/useLocalTTS';

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
  children?: React.ReactNode;
}

export function TextToSpeechButton({ 
  text, 
  className = '', 
  size = 'sm', 
  variant = 'outline',
  children 
}: TextToSpeechButtonProps) {
  const { speak, stop, isPlaying, isLoading } = useLocalTTS();

  const handleSpeak = async () => {
    if (isPlaying) {
      stop();
    } else {
      await speak({ text });
    }
  };

  const getButtonContent = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (isPlaying) return <VolumeX className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSpeak}
      disabled={isLoading}
      className={className}
      title={isPlaying ? 'Arrêter la lecture' : 'Lire le texte'}
    >
      {getButtonContent()}
      {children}
    </Button>
  );
}