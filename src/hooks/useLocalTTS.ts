import { useState, useCallback, useEffect } from 'react';

interface TextToSpeechOptions {
  text: string;
  lang?: string;
  rate?: number; // 0.1 - 10
  pitch?: number; // 0 - 2
  voiceName?: string;
}

function pickVoice(text: string, voices: SpeechSynthesisVoice[], preferredLang?: string, voiceName?: string) {
  if (voiceName) {
    const v = voices.find(v => v.name === voiceName);
    if (v) return v;
  }
  const isArabic = /[\u0600-\u06FF]/.test(text);
  const targetLang = preferredLang || (isArabic ? 'ar' : 'fr');
  // Prefer exact lang match, then startsWith
  return (
    voices.find(v => v.lang.toLowerCase() === targetLang) ||
    voices.find(v => v.lang.toLowerCase().startsWith(targetLang)) ||
    voices[0]
  );
}

export function useLocalTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const loadVoices = useCallback(() => {
    const list = window.speechSynthesis?.getVoices?.() || [];
    setVoices(list);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setError('La synthèse vocale locale n\'est pas supportée par votre navigateur.');
      return;
    }
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
    };
  }, [loadVoices]);

  const speak = useCallback(async (options: TextToSpeechOptions) => {
    try {
      setError(null);
      setIsLoading(true);
      if (!('speechSynthesis' in window)) {
        throw new Error('Synthèse vocale non supportée');
      }

      // Stop any current speech
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(options.text);
      const selected = pickVoice(options.text, voices, options.lang, options.voiceName);
      if (selected) u.voice = selected;
      if (options.lang) u.lang = options.lang;
      u.rate = options.rate ?? 1;
      u.pitch = options.pitch ?? 1;

      u.onstart = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };
      u.onend = () => {
        setIsPlaying(false);
        setUtterance(null);
      };
      u.onerror = () => {
        setError('Erreur lors de la lecture audio locale');
        setIsLoading(false);
        setIsPlaying(false);
      };

      setUtterance(u);
      window.speechSynthesis.speak(u);
    } catch (e: any) {
      setError(e?.message || 'Erreur inconnue');
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [voices]);

  const stop = useCallback(() => {
    if (utterance) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setUtterance(null);
    }
  }, [utterance]);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    }
  }, []);

  return { speak, stop, pause, resume, isPlaying, isLoading, error };
}
