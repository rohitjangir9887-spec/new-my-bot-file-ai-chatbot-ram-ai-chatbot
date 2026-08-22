import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { BarChart3, MessageSquare, Zap, Database, Clock } from "lucide-react";
import { useUsageStore } from "@/lib/usage/store";
import { format } from "date-fns";

export function UsagePage({ onBack }: { onBack: () => void }) {
  const { requestsToday, lastReset } = useUsageStore();
  
  const stats = [
    { 
      icon: <MessageSquare className="w-5 h-5 text-sky-400" />, 
      label: "Today's Requests", 
      val: requestsToday.toString(), 
      limit: "100",
      percent: Math.min((requestsToday / 100) * 100, 100),
      dataQa: "usage-requests-card"
    },
    { 
      icon: <Zap className="w-5 h-5 text-amber-400" />, 
      label: "AI Intensity", 
      val: requestsToday > 50 ? "High" : "Optimal", 
      limit: "Pro",
      percent: Math.min((requestsToday / 100) * 100, 100),
      dataQa: "usage-intensity-card"
    },

    { 
      icon: <Database className="w-5 h-5 text-emerald-400" />, 
      label: "Local Storage", 
      val: "1.2 MB", 
      limit: "10 MB",
      percent: 12
    },
    { 
      icon: <BarChart3 className="w-5 h-5 text-violet-400" />, 
      label: "Tool Efficiency", 
      val: "98%", 
      limit: "100%",
      percent: 98
    }
  ];

  return (
    <SettingsLayout 
      title="Usage Stats" 
      onBack={onBack}
      description="Track your AI interaction and resource consumption for the current period."
    >
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
            <div key={i} data-qa={stat.dataQa} className="p-5 glass rounded-[2rem] border-white/5 space-y-3 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform">
                        {stat.icon}
                    </div>
                </div>
                <div className="relative z-10">
                    <div className="text-2xl font-bold tracking-tight">{stat.val}</div>
                    <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-0.5">{stat.label}</div>
                </div>
                <div className="relative z-10 space-y-1.5">
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/40 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${stat.percent}%` }} 
                        />
                    </div>
                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30">
                        <span>Used</span>
                        <span>Limit: {stat.limit}</span>
                    </div>
                </div>
            </div>
        ))}
      </div>

      <SettingsGroup title="Session Info">
        <SettingsRow 
          icon={<Clock className="w-4 h-4 text-sky-400" />} 
          title="Last Reset" 
          subtitle={format(new Date(lastReset), 'MMM d, yyyy h:mm a')} 
          disabled 
        />
        <SettingsRow 
          icon={<BarChart3 className="w-4 h-4 text-emerald-400" />} 
          title="Daily Quota" 
          subtitle="100 requests per day (Pro)" 
          disabled 
        />
      </SettingsGroup>

      <div className="p-6 glass rounded-[2.5rem] border-white/5 bg-primary/5 text-center space-y-3">
        <h4 className="text-sm font-bold tracking-tight">Need more capacity?</h4>
        <p className="text-[11px] text-muted-foreground/70 leading-relaxed max-w-[240px] mx-auto">
          Upgrade to Enterprise for unlimited requests, higher token limits and priority infrastructure.
        </p>
        <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity">
          Learn More
        </button>
      </div>
    </SettingsLayout>
  );
}

