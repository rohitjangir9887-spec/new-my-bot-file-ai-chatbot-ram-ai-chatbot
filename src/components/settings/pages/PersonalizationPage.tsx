import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { Toggle, SegmentedControl } from "../shared/Controls";
import { useSettingsStore } from "@/lib/settings/store";
import { Brain, Sparkles } from "lucide-react";

export function PersonalizationPage({ onBack }: { onBack: () => void }) {
  const { personalizationEnabled, setPersonalizationEnabled } = useSettingsStore();

  return (
    <SettingsLayout 
        title="Intelligence" 
        onBack={onBack}
        description="Configure how Ramaibot processes information and responds to you."
    >
      <div className="relative w-full h-40 bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-3xl overflow-hidden flex items-center justify-center border border-white/5">
        <div className="relative flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 backdrop-blur-xl shadow-2xl">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Neural Engine Configured</div>
        </div>
      </div>

      <SettingsGroup title="Learning">
        <SettingsRow 
            icon={<Sparkles className="w-4 h-4 text-amber-400" />}
            title="Personalization" 
            subtitle="Allow Ramaibot to learn from your style."
            rightElement={<Toggle active={personalizationEnabled} onToggle={setPersonalizationEnabled} />}
        />
      </SettingsGroup>

      <SettingsGroup title="Response Style">
        <div className="p-5 space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2">Tone</label>
            <SegmentedControl 
                options={[
                    { value: 'professional', label: 'Pro' },
                    { value: 'casual', label: 'Casual' },
                    { value: 'creative', label: 'Creative' }
                ]} 
                value="professional"
                onChange={() => {}}
            />
        </div>
        <div className="p-5 space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2">Length</label>
            <SegmentedControl 
                options={[
                    { value: 'short', label: 'Short' },
                    { value: 'normal', label: 'Mid' },
                    { value: 'detailed', label: 'Long' }
                ]} 
                value="normal"
                onChange={() => {}}
            />
        </div>
      </SettingsGroup>

      <div className="px-4 py-2">
        <p className="text-[10px] text-muted-foreground/60 leading-relaxed uppercase tracking-widest font-bold">
            Personalization adjustments are applied to all new conversations.
        </p>
      </div>
    </SettingsLayout>
  );
}
