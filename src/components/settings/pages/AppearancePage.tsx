import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SegmentedControl } from "../shared/Controls";
import { useSettingsStore } from "@/lib/settings/store";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppearancePage({ onBack }: { onBack: () => void }) {
  const { theme, setTheme, accentColor, setAccentColor } = useSettingsStore();

  const themes = [
    { value: 'system', label: 'System', icon: <Laptop className="w-4 h-4" /> },
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  ];

  const accents = [
    { id: 'blue', color: 'bg-blue-500' },
    { id: 'violet', color: 'bg-violet-500' },
    { id: 'rose', color: 'bg-rose-500' },
    { id: 'emerald', color: 'bg-emerald-500' },
    { id: 'amber', color: 'bg-amber-500' },
  ];

  return (
    <SettingsLayout title="Appearance" onBack={onBack}>
      <SettingsGroup title="Theme">
        <div className="p-4">
            <SegmentedControl options={themes} value={theme} onChange={(v: any) => setTheme(v)} />
        </div>
      </SettingsGroup>

      <SettingsGroup title="Accent Color">
        <div className="p-6 flex justify-between gap-4">
          {accents.map(a => (
            <button
              key={a.id}
              onClick={() => setAccentColor(a.id as any)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all press shadow-lg",
                a.color,
                accentColor === a.id ? "ring-4 ring-white/20 scale-110" : "opacity-40 hover:opacity-100"
              )}
            >
              {accentColor === a.id && <Check className="w-5 h-5 text-white" />}
            </button>
          ))}
        </div>
      </SettingsGroup>
    </SettingsLayout>
  );
}
