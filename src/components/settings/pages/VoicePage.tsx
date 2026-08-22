import React, { useState, useEffect } from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { Toggle } from "../shared/Controls";
import { VoiceVisual } from "../shared/AbstractVisuals";
import { useSettingsStore } from "@/lib/settings/store";
import { Play } from "lucide-react";

export function VoicePage({ onBack }: { onBack: () => void }) {
  const { 
    voiceEnabled, setVoiceEnabled, 
    autoPlayResponses, setAutoPlayResponses,
    speechSpeed, setSpeechSpeed,
    selectedVoice, setSelectedVoice
  } = useSettingsStore();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  const handlePreview = () => {
    const utterance = new SpeechSynthesisUtterance("Hello, I am Ramaibot. How can I help you today?");
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }
    utterance.rate = speechSpeed;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <SettingsLayout title="Voice" onBack={onBack}>
      <VoiceVisual />

      <SettingsGroup title="Speech Settings">
        <SettingsRow 
            title="Voice Input/Output" 
            subtitle="Enable voice interactions"
            rightElement={<Toggle active={voiceEnabled} onToggle={setVoiceEnabled} />}
        />
        <SettingsRow 
            title="Auto-play Responses" 
            subtitle="Speak responses automatically"
            rightElement={<Toggle active={autoPlayResponses} onToggle={setAutoPlayResponses} />}
        />
      </SettingsGroup>

      <SettingsGroup title="Speech Speed">
        <div className="p-5 space-y-4">
          <div className="flex justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rate</span>
            <span className="text-[10px] font-bold text-primary">{speechSpeed.toFixed(1)}x</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.1" 
            value={speechSpeed} 
            onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
            className="w-full accent-primary bg-white/5 rounded-full h-1.5 appearance-none cursor-pointer"
          />
        </div>
      </SettingsGroup>

      <SettingsGroup title="Voice Personality">
        <div className="p-4 space-y-4">
          <select 
            value={selectedVoice || ""}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-foreground focus:ring-1 focus:ring-primary/40 appearance-none outline-none"
          >
            <option value="" className="bg-[#0a0a0f]">Default System Voice</option>
            {voices.map(v => (
              <option key={v.name} value={v.name} className="bg-[#0a0a0f]">{v.name} ({v.lang})</option>
            ))}
          </select>

          <button 
            onClick={handlePreview}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <Play className="w-4 h-4" /> Preview Voice
          </button>
        </div>
      </SettingsGroup>
    </SettingsLayout>
  );
}
