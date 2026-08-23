import React, { useEffect } from 'react';
import { SettingsLayout } from '../shared/SettingsLayout';
import { SettingsGroup } from '../shared/SettingsGroup';
import { SettingsRow } from '../shared/SettingsRow';
import { Toggle } from '../shared/Controls';
import { useSettingsStore } from '@/lib/settings/store';
import { supabase } from '@/integrations/supabase/client';
import { Globe, Shield, Search } from 'lucide-react';
import { toast } from 'sonner';

export function WebSearchPage({ onBack }: { onBack: () => void }) {
  const { webSearchEnabled, setWebSearchEnabled, safeSearch, setSafeSearch } = useSettingsStore();

  useEffect(() => {
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await (supabase as any).from('profiles').select('web_search_enabled, safe_search').eq('id', session.user.id).maybeSingle();
      if (typeof data?.web_search_enabled === 'boolean') setWebSearchEnabled(data.web_search_enabled);
      if (typeof data?.safe_search === 'boolean') setSafeSearch(data.safe_search);
    })();
  }, [setSafeSearch, setWebSearchEnabled]);

  const save = async (patch: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await (supabase as any).from('profiles').update(patch).eq('id', session.user.id);
    if (error) toast.error('Search preferences could not be saved.');
  };

  return (
    <SettingsLayout title="Web Search" onBack={onBack}>
      <SettingsGroup>
        <SettingsRow icon={<Globe className="w-4 h-4 text-sky-400" />} title="Enable Web Search" subtitle="Allow Ramaibot to browse the live web for answers." rightElement={<Toggle active={webSearchEnabled} onToggle={value => { setWebSearchEnabled(value); void save({ web_search_enabled: value }); }} />} />
      </SettingsGroup>
      <SettingsGroup title="Preferences">
        <SettingsRow icon={<Search className="w-4 h-4 text-primary" />} title="Search Provider" subtitle="Live Tavily search when configured" disabled />
        <SettingsRow icon={<Shield className="w-4 h-4 text-emerald-400" />} title="Safe Search" subtitle="Request safer search results" rightElement={<Toggle active={safeSearch} onToggle={value => { setSafeSearch(value); void save({ safe_search: value }); }} />} />
      </SettingsGroup>
      <div className="px-4 py-2"><p className="text-[10px] text-muted-foreground/60 leading-relaxed uppercase tracking-widest font-bold">Live search is used only when enabled and configured.</p></div>
    </SettingsLayout>
  );
}
