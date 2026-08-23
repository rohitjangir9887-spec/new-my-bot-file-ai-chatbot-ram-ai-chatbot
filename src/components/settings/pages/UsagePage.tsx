import React, { useEffect, useState } from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { BarChart3, MessageSquare, Zap, Database, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface UsageSummary {
  plan: 'free' | 'pro' | 'ultra';
  limits: { messages: number; images: number; tools: number; files: number };
  used: { messages: number; images: number; tools: number; files: number };
}

export function UsagePage({ onBack }: { onBack: () => void }) {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastReset] = useState(() => new Date(Date.now() - 24 * 60 * 60 * 1000));

  useEffect(() => {
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      try {
        const response = await fetch('/api/usage', { headers: { Authorization: `Bearer ${session.access_token}` }, cache: 'no-store' });
        const body = await response.json().catch(() => null);
        if (response.ok) setSummary(body);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = summary ? [
    { icon: <MessageSquare className="w-5 h-5 text-sky-400" />, label: 'Messages', val: summary.used.messages.toString(), limit: summary.limits.messages.toString(), percent: Math.min((summary.used.messages / summary.limits.messages) * 100, 100) },
    { icon: <Database className="w-5 h-5 text-emerald-400" />, label: 'Stored Files', val: summary.used.files.toString(), limit: summary.limits.files.toString(), percent: Math.min((summary.used.files / summary.limits.files) * 100, 100) },
    { icon: <Zap className="w-5 h-5 text-amber-400" />, label: 'Images', val: summary.used.images.toString(), limit: summary.limits.images.toString(), percent: Math.min((summary.used.images / summary.limits.images) * 100, 100) },
    { icon: <BarChart3 className="w-5 h-5 text-violet-400" />, label: 'Tool Calls', val: summary.used.tools.toString(), limit: summary.limits.tools.toString(), percent: Math.min((summary.used.tools / summary.limits.tools) * 100, 100) },
  ] : [];

  return (
    <SettingsLayout title="Usage Stats" onBack={onBack} description="Server-reported usage and limits for your current plan.">
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : summary ? <>
        <div className="inline-flex self-start px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary">{summary.plan} plan</div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {stats.map((stat) => <div key={stat.label} className="p-5 glass rounded-[2rem] border-white/5 space-y-3 shadow-xl relative overflow-hidden group"><div className="flex items-center"><div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">{stat.icon}</div></div><div><div className="text-2xl font-bold tracking-tight">{stat.val}</div><div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-0.5">{stat.label}</div></div><div className="space-y-1.5"><div className="w-full h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-primary/40 rounded-full transition-all" style={{ width: `${stat.percent}%` }} /></div><div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30"><span>Used</span><span>Limit: {stat.limit}</span></div></div></div>)}
        </div>
        <SettingsGroup title="Quota window">
          <SettingsRow icon={<Clock className="w-4 h-4 text-sky-400" />} title="Rolling 24 hours" subtitle={`Usage is measured server-side. Window started around ${format(lastReset, 'MMM d, yyyy h:mm a')}.`} disabled />
        </SettingsGroup>
      </> : <SettingsGroup><div className="p-6 text-sm text-muted-foreground">Usage information is currently unavailable. Try again later.</div></SettingsGroup>}
    </SettingsLayout>
  );
}
