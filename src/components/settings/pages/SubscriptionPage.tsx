import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { Sparkles, Check, Zap } from "lucide-react";

export function SubscriptionPage({ onBack }: { onBack: () => void }) {
  return (
    <SettingsLayout title="Subscription" onBack={onBack}>
      <div className="relative w-full p-8 bg-gradient-to-br from-primary/20 via-violet-500/10 to-transparent rounded-[2.5rem] border border-primary/20 overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
            <Sparkles className="w-24 h-24 text-primary animate-pulse" />
        </div>
        
        <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary">
                Current Plan
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Ramaibot Pro</h2>
            <p className="text-sm text-muted-foreground/80 max-w-[240px]">
                Unlock the full potential of Ramaibot with advanced reasoning and vision capabilities.
            </p>
            
            <div className="flex items-baseline gap-1 mt-6">
                <span className="text-2xl font-bold">$20</span>
                <span className="text-sm text-muted-foreground">/ month</span>
            </div>
        </div>
      </div>

      <SettingsGroup title="Plan Benefits">
        {[
            "Access to GPT-4o & Claude 3.5 Sonnet",
            "Unlimited Web Search",
            "Advanced Image Generation",
            "Priority Support",
            "Early Access to Beta Features"
        ].map((benefit, i) => (
            <SettingsRow 
                key={i}
                icon={<Check className="w-4 h-4 text-emerald-400" />}
                title={benefit}
                disabled
            />
        ))}
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow 
            icon={<Zap className="w-4 h-4 text-amber-400" />}
            title="Manage Subscription" 
            comingSoon
        />
      </SettingsGroup>
    </SettingsLayout>
  );
}
