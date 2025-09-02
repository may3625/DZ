// Deprecated: ElevenLabs replaced by local TTS (Web Speech API)
import { useLocalTTS } from './useLocalTTS';

export function useElevenLabs(_config: any = {}) {
  // Ignore remote config, use local TTS to ensure offline capability
  return useLocalTTS();
}
