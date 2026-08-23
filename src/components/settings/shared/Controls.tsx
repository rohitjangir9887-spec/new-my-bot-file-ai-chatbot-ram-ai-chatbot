import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ToggleProps {
  active: boolean;
  onToggle: (val: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ active, onToggle, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle(!active)}
      disabled={disabled}
      aria-pressed={active}
      aria-label={active ? 'Enabled' : 'Disabled'}
      className={cn(
        "relative w-11 h-6 rounded-full transition-all duration-300 outline-none ring-offset-background focus:ring-2 focus:ring-primary/40",
        active ? "bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]" : "bg-white/10",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <motion.div
        animate={{ x: active ? 22 : 2 }}
        initial={false}
        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

interface SegmentedControlProps {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <div className="flex p-1 bg-white/5 rounded-2xl gap-1" role="group">
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all press",
            value === opt.value
              ? "bg-primary/20 text-primary border border-primary/20 shadow-xl"
              : "text-muted-foreground hover:bg-white/5"
          )}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
