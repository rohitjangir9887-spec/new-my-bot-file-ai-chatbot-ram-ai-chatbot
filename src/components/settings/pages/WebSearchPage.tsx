import React from 'react';
import { SettingsLayout } from '../shared/SettingsLayout';
import { SettingsGroup } from '../shared/SettingsGroup';
import { SettingsRow } from '../shared/SettingsRow';
import { Toggle } from '../shared/Controls';
import { useSettingsStore } from '@/lib/settings/store';
import { Globe, Shield, Search } from 'lucide-react';

export function WebSearchPage({ onBack }: { onBack: () => void }) {
  const { webSearchEnabled, setWebSearchEnabled, safeSearch, setSafeSearch } = useSettingsStore();
  return (
    <SettingsLayout title="Web Search" onBack={onBack}>
      <SettingsGroup>
        <SettingsRow icon={<Globe className="w-4 h-4 text-sky-400" />} title="Enable Web Search" subtitle="Allow Ramaibot to browse the web for answers." rightElement={<Toggle active={webSearchEnabled} onToggle={setWebSearchEnabled} />} />
      </SettingsGroup>
      <SettingsGroup title="Preferences">
        <SettingsRow icon={<Search className="w-4 h-4 text-primary" />} title="Search Provider" subtitle="Live Tavily search when configured" disabled />
        <SettingsRow icon={<Shield className="w-4 h-4 text-emerald-400" />} title="Safe Search" subtitle="Request safer search results" rightElement={<Toggle active={safeSearch} onToggle={setSafeSearch} />} />
      </SettingsGroup>
      <div className="px-4 py-2"><p className="text-[10px] text-muted-foreground/60 leading-relaxed uppercase tracking-widest font-bold">Live search is used only when enabled and configured.</p></div>
    </SettingsLayout>
  );
}
