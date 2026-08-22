import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { Toggle } from "../shared/Controls";
import { useSettingsStore } from "@/lib/settings/store";
import { Sparkles } from "lucide-react";

export function CustomInstructionsPage({ onBack }: { onBack: () => void }) {
  const { customInstructions, setCustomInstructions } = useSettingsStore();
  
  return (
    <SettingsLayout 
        title="Custom Instructions" 
        onBack={onBack}
        description="Give Ramaibot custom instructions on how it should respond to you."
    >
      <div className="px-2 space-y-6">
        <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Instructions</label>
                <span className="text-[10px] font-bold text-primary/60">{customInstructions.length} / 1500</span>
            </div>
            <textarea 
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Example: 'Be extremely concise', 'Write in Python by default', 'Always provide sources'..."
                className="w-full h-64 bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 text-sm resize-none focus:ring-1 focus:ring-primary/40 outline-none scrollbar-hide"
            />
        </div>

        <SettingsGroup>
            <SettingsRow 
                icon={<Sparkles className="w-4 h-4 text-amber-400" />}
                title="Enable for new chats"
                rightElement={<Toggle active={true} onToggle={() => {}} />}
            />
        </SettingsGroup>

        <div className="flex justify-end pt-4">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl text-sm font-bold shadow-xl press">
                Save Instructions
            </button>
        </div>
      </div>
    </SettingsLayout>
  );
}
