import React from "react";
import { ChevronLeft } from "lucide-react";

interface SettingsLayoutProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
  description?: string;
}

export function SettingsLayout({ title, onBack, children, description }: SettingsLayoutProps) {
  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0a0a0f]">
      <header className="flex items-center gap-4 px-4 py-4 sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-all active:scale-90" aria-label="Back to settings">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide pb-20">
        <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-8 animate-rise-in">
          {description && <p className="text-sm text-muted-foreground/80 leading-relaxed px-2">{description}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
