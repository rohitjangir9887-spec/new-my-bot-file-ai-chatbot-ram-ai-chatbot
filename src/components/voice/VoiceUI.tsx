import { useState } from "react";
import { Mic, X, Square, Play, AlertCircle } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { VoiceWaveform } from "./VoiceWaveform";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceUIProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptionComplete: (text: string) => void;
}

export function VoiceUI({ isOpen, onClose, onTranscriptionComplete }: VoiceUIProps) {
  const { 
    status, 
    transcript, 
    interimTranscript, 
    startListening, 
    stopListening 
  } = useSpeechRecognition();

  // Automatically start listening when opened
  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen, startListening, stopListening]);
  if (!isOpen) return null;

  const handleFinish = () => {
    onTranscriptionComplete(transcript + interimTranscript);
    onClose();
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return "Listening...";
      case 'transcribing': return "Processing...";
      case 'permission-denied': return "Microphone access denied";
      case 'unsupported': return "Voice not supported in this browser";
      case 'error': return "Speech recognition error";
      default: return "Ready";
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-2xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative flex flex-col items-center text-center max-w-lg w-full"
      >
        <div className="mb-12 relative">
          <div className="w-32 h-32 rounded-full glass-strong border border-white/10 flex items-center justify-center shadow-2xl relative z-10">
            {status === 'listening' ? (
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 bg-primary rounded-full shadow-[0_0_30px_rgba(var(--primary),0.5)]" 
              />
            ) : (
              <Mic className="w-12 h-12 text-primary" />
            )}
          </div>
          
          {status === 'listening' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none">
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping [animation-duration:2s]" />
              <div className="absolute inset-4 border-2 border-primary/10 rounded-full animate-ping [animation-duration:3s]" />
            </div>
          )}
        </div>
        
        <h2 className="text-3xl font-bold mb-4 tracking-tight">
          {getStatusText()}
        </h2>
        
        <div className="min-h-[80px] px-6 mb-8 text-lg text-foreground/80">
          {transcript || interimTranscript ? (
            <p className="line-clamp-3">
              {transcript}
              <span className="text-muted-foreground">{interimTranscript}</span>
            </p>
          ) : (
            <p className="text-muted-foreground">
              {status === 'permission-denied' 
                ? "Please enable microphone access in your browser settings." 
                : "Try saying something..."}
            </p>
          )}
        </div>
        
        <div className="mb-12">
          <VoiceWaveform isActive={status === 'listening'} />
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={onClose}
            className="w-16 h-16 rounded-full glass border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-muted-foreground"
            aria-label="Cancel"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button 
            onClick={status === 'listening' ? stopListening : startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl press transition-all ${
              status === 'listening' 
                ? "bg-primary text-primary-foreground shadow-primary/20" 
                : "glass border border-white/10 text-primary"
            }`}
            aria-label={status === 'listening' ? 'Stop listening' : 'Start listening'}
          >
            {status === 'listening' ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
          </button>
          
          <button 
            disabled={!transcript && !interimTranscript}
            onClick={handleFinish}
            className="w-16 h-16 rounded-full glass border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-emerald-500 disabled:opacity-30"
            aria-label="Send transcription"
          >
            <Play className="w-6 h-6 fill-current" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
import { useEffect } from "react";
