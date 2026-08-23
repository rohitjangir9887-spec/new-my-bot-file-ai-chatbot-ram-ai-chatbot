import React, { useEffect, useState } from 'react';
import { SettingsLayout } from '../shared/SettingsLayout';
import { SettingsGroup } from '../shared/SettingsGroup';
import { SettingsRow } from '../shared/SettingsRow';
import { Toggle } from '../shared/Controls';
import { useSettingsStore } from '@/lib/settings/store';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function CustomInstructionsPage({ onBack }: { onBack: () => void }) {
  const { customInstructions, setCustomInstructions } = useSettingsStore();
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from('profiles').select('custom_instructions').eq('id', session.user.id).maybeSingle();
      if (typeof data?.custom_instructions === 'string') setCustomInstructions(data.custom_instructions);
    })();
  }, [setCustomInstructions]);

  const save = async () => {
    const normalized = customInstructions.trim().slice(0, 1500);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ custom_instructions: enabled ? normalized : '' }).eq('id', session.user.id);
    setSaving(false);
    if (error) toast.error('Instructions could not be saved.');
    else { setCustomInstructions(normalized); toast.success('Instructions saved'); }
  };

  return (
    <SettingsLayout title="Custom Instructions" onBack={onBack} description="Give Ramaibot custom instructions on how it should respond to you.">
      <div className="px-2 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2"><label htmlFor="custom-instructions" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Instructions</label><span className="text-[10px] font-bold text-primary/60">{customInstructions.length} / 1500</span></div>
          <textarea id="custom-instructions" value={customInstructions} maxLength={1500} onChange={e => setCustomInstructions(e.target.value)} placeholder="Example: Be concise and use Python by default." className="w-full h-64 bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 text-sm resize-none focus:ring-1 focus:ring-primary/40 outline-none scrollbar-hide" />
        </div>
        <SettingsGroup>
          <SettingsRow icon={<Sparkles className="w-4 h-4 text-amber-400" />} title="Enable for new chats" rightElement={<Toggle active={enabled} onToggle={setEnabled} />} />
        </SettingsGroup>
        <div className="flex justify-end pt-4"><button onClick={save} disabled={saving} className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl text-sm font-bold shadow-xl press disabled:opacity-50">{saving ? 'Saving…' : 'Save Instructions'}</button></div>
      </div>
    </SettingsLayout>
  );
}
