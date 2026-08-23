import React, { useEffect, useState } from 'react';
import { SettingsLayout } from '../shared/SettingsLayout';
import { SettingsGroup } from '../shared/SettingsGroup';
import { SettingsRow } from '../shared/SettingsRow';
import { Check, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const limits = { free: { messages: 25, images: 3, tools: 10, files: 10 }, pro: { messages: 500, images: 100, tools: 500, files: 100 }, ultra: { messages: 5000, images: 1000, tools: 5000, files: 1000 } } as const;

export function SubscriptionPage({ onBack }: { onBack: () => void }) {
  const [plan, setPlan] = useState<'free' | 'pro' | 'ultra'>('free');
  useEffect(() => { void (async () => { const { data: { session } } = await supabase.auth.getSession(); if (!session) return; const db = supabase as any; const { data } = await db.from('profiles').select('plan').eq('id', session.user.id).maybeSingle(); if (data?.plan === 'pro' || data?.plan === 'ultra') setPlan(data.plan); })(); }, []);
  const currentLimits = limits[plan];
  return (
    <SettingsLayout title="Subscription" onBack={onBack} description="Your subscription tier and server-enforced usage limits.">
      <div className="relative w-full p-8 bg-gradient-to-br from-primary/20 via-violet-500/10 to-transparent rounded-[2.5rem] border border-primary/20 overflow-hidden"><div className="relative space-y-4"><div className="inline-flex px-3 py-1 bg-primary/20 rounded-full border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary">Current Plan</div><h2 className="text-3xl font-bold tracking-tight capitalize">Ramaibot {plan}</h2><p className="text-sm text-muted-foreground/80 max-w-[280px]">Limits are enforced on the server and cannot be bypassed from the browser.</p></div></div>
      <SettingsGroup title="Included limits">{[`${currentLimits.messages.toLocaleString()} messages / 24 hours`, `${currentLimits.images.toLocaleString()} images / 24 hours`, `${currentLimits.tools.toLocaleString()} tool calls / 24 hours`, `${currentLimits.files.toLocaleString()} stored files`].map(text => <SettingsRow key={text} icon={<Check className="w-4 h-4 text-emerald-400" />} title={text} disabled />)}</SettingsGroup>
      <SettingsGroup><SettingsRow icon={<Zap className="w-4 h-4 text-amber-400" />} title="Payment management" subtitle="A payment provider is not configured for this deployment." disabled /></SettingsGroup>
    </SettingsLayout>
  );
}
