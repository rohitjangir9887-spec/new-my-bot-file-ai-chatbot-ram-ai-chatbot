import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { Info, Shield, FileText, Heart } from "lucide-react";

export function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <SettingsLayout title="About" onBack={onBack}>
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            <span className="text-4xl font-black text-white tracking-tighter italic">R</span>
        </div>
        
        <div className="text-center space-y-1">
            <h2 className="text-xl font-bold tracking-tight">Ramaibot Intelligence</h2>
            <p className="text-xs text-muted-foreground/60 font-bold uppercase tracking-widest">Version 2.4.0 (Build 822)</p>
        </div>
      </div>

      <SettingsGroup>
        <SettingsRow icon={<FileText className="w-4 h-4" />} title="Terms of Service" onClick={() => {}} />
        <SettingsRow icon={<Shield className="w-4 h-4" />} title="Privacy Policy" onClick={() => {}} />
        <SettingsRow icon={<Info className="w-4 h-4" />} title="Licenses & Credits" onClick={() => {}} />
      </SettingsGroup>

      <div className="text-center py-8 space-y-2 opacity-40">
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
            Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> in Jaipur
        </div>
        <p className="text-[9px] font-medium">&copy; 2026 Ramaibot AI. All rights reserved.</p>
      </div>
    </SettingsLayout>
  );
}
