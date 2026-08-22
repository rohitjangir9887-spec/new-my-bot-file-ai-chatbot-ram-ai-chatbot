import { useState, useEffect, useCallback, useRef } from 'react';

export type SpeechRecognitionStatus = 'idle' | 'listening' | 'transcribing' | 'error' | 'permission-denied' | 'unsupported';

export function useSpeechRecognition() {
  const [status, setStatus] = useState<SpeechRecognitionStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setStatus('unsupported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setStatus('listening');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        setTranscript(prev => prev + final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setStatus('permission-denied');
      } else {
        setStatus('error');
      }
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      // Don't set to idle if we just stopped it manually or it ended naturally
      // but we might want to restart if continuous is true?
      // Actually, we'll let the UI control start/stop
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && status !== 'listening') {
      setTranscript('');
      setInterimTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition', e);
      }
    }
  }, [status]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && status === 'listening') {
      recognitionRef.current.stop();
      setStatus('idle');
    }
  }, [status]);

  return {
    status,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript: () => {
      setTranscript('');
      setInterimTranscript('');
    }
  };
}
