import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { Code, Hash, Layers, Plus } from "lucide-react";

export function IntegrationsPage({ onBack }: { onBack: () => void }) {
  return (
    <SettingsLayout 
        title="Integrations" 
        onBack={onBack}
        description="Connect Ramaibot to your favorite tools."
    >
      <div className="px-2">
        <button className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-white/5 rounded-[2rem] hover:bg-white/5 transition-all text-sm font-bold text-muted-foreground">
            <Plus className="w-5 h-5" /> Connect New Integration
        </button>
      </div>

      <SettingsGroup title="Connected">
        <SettingsRow 
            icon={<Code className="w-4 h-4" />} 
            title="GitHub" 
            subtitle="Connected as @rohitjangir" 
            rightElement={<span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Active</span>}
        />
      </SettingsGroup>

      <SettingsGroup title="Available">
        <SettingsRow icon={<Hash className="w-4 h-4" />} title="Slack" comingSoon />
        <SettingsRow icon={<Layers className="w-4 h-4" />} title="Figma" comingSoon />

      </SettingsGroup>
    </SettingsLayout>
  );
}
