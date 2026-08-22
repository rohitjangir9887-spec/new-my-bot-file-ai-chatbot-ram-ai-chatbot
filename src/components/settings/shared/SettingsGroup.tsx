import React from "react";
import { cn } from "@/lib/utils";

interface SettingsGroupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsGroup({ title, children, className }: SettingsGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">
          {title}
        </h3>
      )}
      <div className="bg-white/[0.03] rounded-[2rem] border border-white/5 divide-y divide-white/5 overflow-hidden shadow-2xl">
        {children}
      </div>
    </div>
  );
}
