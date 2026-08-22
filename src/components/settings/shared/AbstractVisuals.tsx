import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain, Mic2, Shield, Lock, LayoutGrid, Database, Palette, Info } from "lucide-react";

export function MemoryVisual() {
  return (
    <div className="relative w-full h-40 bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-3xl overflow-hidden flex items-center justify-center border border-white/5">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)] animate-orb-pulse" />
      <div className="relative flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 backdrop-blur-xl shadow-2xl">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Neural Memory Active</div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex justify-between gap-1 opacity-20">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-primary/40 rounded-full" style={{ height: Math.random() * 8 + 2 }} />
        ))}
      </div>
    </div>
  );
}

export function VoiceVisual() {
  return (
    <div className="relative w-full h-40 bg-gradient-to-br from-violet-500/10 to-sky-500/10 rounded-3xl overflow-hidden flex items-center justify-center border border-white/5">
      <div className="flex items-end gap-1.5 h-12">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ height: [8, Math.random() * 40 + 8, 8] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              delay: i * 0.05,
              ease: "easeInOut"
            }}
            className="w-1.5 bg-primary/40 rounded-full"
          />
        ))}
      </div>
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <Mic2 className="w-4 h-4 text-primary/60" />
        <span className="text-[8px] font-bold uppercase tracking-widest text-primary/60">Voice Engine Status: Online</span>
      </div>
    </div>
  );
}

export function SecurityVisual() {
  return (
    <div className="relative w-full h-40 bg-gradient-to-br from-emerald-500/10 to-sky-500/10 rounded-3xl overflow-hidden flex items-center justify-center border border-white/5">
      <div className="relative w-20 h-20">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/20"
        />
        <div className="absolute inset-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center backdrop-blur-xl">
          <Shield className="w-8 h-8 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
        </div>
      </div>
    </div>
  );
}

export function StorageVisual({ used = 65 }: { used?: number }) {
  return (
    <div className="relative w-full h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl overflow-hidden flex flex-col items-center justify-center border border-white/5 px-8">
      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner mb-4">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${used}%` }}
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
        />
      </div>
      <div className="flex justify-between w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
        <span>{used}% Used</span>
        <span>50GB Cloud Sync</span>
      </div>
    </div>
  );
}
