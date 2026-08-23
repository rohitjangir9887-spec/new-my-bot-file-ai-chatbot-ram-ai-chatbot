import React from 'react';
import { SettingsLayout } from '../shared/SettingsLayout';
import { SettingsGroup } from '../shared/SettingsGroup';
import { SettingsRow } from '../shared/SettingsRow';
import { Toggle, SegmentedControl } from '../shared/Controls';
import { useSettingsStore } from '@/lib/settings/store';
import { Sparkles, User } from 'lucide-react';

export function PersonalizationPage({ onBack }: { onBack: () => void }) {
  const { personalizationEnabled, setPersonalizationEnabled, responseTone, setResponseTone, responseLength, setResponseLength } = useSettingsStore();
  return (
    <SettingsLayout title="Intelligence" onBack={onBack} description="Configure how Ramaibot processes information and responds to you.">
      <SettingsGroup>
        <SettingsRow icon={<User className="w-4 h-4 text-primary" />} title="Personalization" subtitle="Use your saved preferences when responding." rightElement={<Toggle active={personalizationEnabled} onToggle={setPersonalizationEnabled} />} />
      </SettingsGroup>
      <SettingsGroup title="Response Style">
        <div className="p-5 space-y-4"><label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2">Tone</label><SegmentedControl value={responseTone} options={[{ value: 'professional', label: 'Pro' }, { value: 'casual', label: 'Casual' }, { value: 'creative', label: 'Creative' }]} onChange={value => setResponseTone(value as any)} /></div>
        <div className="p-5 space-y-4"><label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2">Length</label><SegmentedControl value={responseLength} options={[{ value: 'short', label: 'Short' }, { value: 'normal', label: 'Mid' }, { value: 'detailed', label: 'Long' }]} onChange={value => setResponseLength(value as any)} /></div>
      </SettingsGroup>
      <div className="px-4 py-2"><p className="text-[10px] text-muted-foreground/60 leading-relaxed uppercase tracking-widest font-bold flex items-center gap-2"><Sparkles className="w-3 h-3" />Preferences are applied to new AI responses.</p></div>
    </SettingsLayout>
  );
}
