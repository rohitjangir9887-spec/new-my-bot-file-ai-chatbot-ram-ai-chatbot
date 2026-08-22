import { useState, useCallback, useRef, useEffect } from 'react';
import { useSettingsStore } from '@/lib/settings/store';

export function useSpeechSynthesis() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { speechSpeed, selectedVoice } = useSettingsStore();

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (!text) return;

    // Stop current speech
    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechSpeed;
    
    if (selectedVoice) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setCurrentText(text);
  }, [speechSpeed, selectedVoice, stop]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setIsPlaying(true);
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isPlaying,
    currentText
  };
}
