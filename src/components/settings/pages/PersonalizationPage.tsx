import React, { useEffect } from 'react';
import { SettingsLayout } from '../shared/SettingsLayout';
import { SettingsGroup } from '../shared/SettingsGroup';
import { SettingsRow } from '../shared/SettingsRow';
import { Toggle, SegmentedControl } from '../shared/Controls';
import { useSettingsStore } from '@/lib/settings/store';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, User } from 'lucide-react';
import { toast } from 'sonner';

export function PersonalizationPage({ onBack }: { onBack: () => void }) {
  const { personalizationEnabled, setPersonalizationEnabled, responseTone, setResponseTone, responseLength, setResponseLength } = useSettingsStore();

  useEffect(() => {
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await (supabase as any).from('profiles').select('personalization_enabled, response_tone, response_length').eq('id', session.user.id).maybeSingle();
      if (typeof data?.personalization_enabled === 'boolean') setPersonalizationEnabled(data.personalization_enabled);
      if (data?.response_tone === 'professional' || data?.response_tone === 'casual' || data?.response_tone === 'creative') setResponseTone(data.response_tone);
      if (data?.response_length === 'short' || data?.response_length === 'normal' || data?.response_length === 'detailed') setResponseLength(data.response_length);
    })();
  }, [setPersonalizationEnabled, setResponseLength, setResponseTone]);

  const save = async (patch: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await (supabase as any).from('profiles').update(patch).eq('id', session.user.id);
    if (error) toast.error('Intelligence preferences could not be saved.');
  };

  return (
    <SettingsLayout title="Intelligence" onBack={onBack} description="Configure how Ramaibot processes information and responds to you.">
      <SettingsGroup>
        <SettingsRow icon={<User className="w-4 h-4 text-primary" />} title="Personalization" subtitle="Use your saved preferences when responding." rightElement={<Toggle active={personalizationEnabled} onToggle={value => { setPersonalizationEnabled(value); void save({ personalization_enabled: value }); }} />} />
      </SettingsGroup>
      <SettingsGroup title="Response Style">
        <div className="p-5 space-y-4"><label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2">Tone</label><SegmentedControl value={responseTone} options={[{ value: 'professional', label: 'Pro' }, { value: 'casual', label: 'Casual' }, { value: 'creative', label: 'Creative' }]} onChange={value => { setResponseTone(value as any); void save({ response_tone: value }); }} /></div>
        <div className="p-5 space-y-4"><label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2">Length</label><SegmentedControl value={responseLength} options={[{ value: 'short', label: 'Short' }, { value: 'normal', label: 'Mid' }, { value: 'detailed', label: 'Long' }]} onChange={value => { setResponseLength(value as any); void save({ response_length: value }); }} /></div>
      </SettingsGroup>
      <div className="px-4 py-2"><p className="text-[10px] text-muted-foreground/60 leading-relaxed uppercase tracking-widest font-bold flex items-center gap-2"><Sparkles className="w-3 h-3" />Preferences are applied to new AI responses.</p></div>
    </SettingsLayout>
  );
}
