import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { Toggle } from "../shared/Controls";
import { MemoryVisual } from "../shared/AbstractVisuals";
import { useSettingsStore } from "@/lib/settings/store";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function MemoryPage({ onBack }: { onBack: () => void }) {
  const { memoryEnabled, setMemoryEnabled } = useSettingsStore();

  const mockMemories = [
    "You prefer concise responses for technical tasks.",
    "You are currently building a premium AI chatbot called Ramaibot.",
    "You live in Jaipur, India."
  ];

  return (
    <SettingsLayout 
        title="Memory" 
        onBack={onBack}
        description="Ramaibot learns from your conversations to improve its responses over time."
    >
      <MemoryVisual />

      <SettingsGroup>
        <SettingsRow 
            title="Enable Memory" 
            subtitle="Let Ramaibot remember things across chats."
            rightElement={<Toggle active={memoryEnabled} onToggle={setMemoryEnabled} />}
        />
      </SettingsGroup>

      <SettingsGroup title="What Ramaibot remembers">
        {mockMemories.map((m, i) => (
            <SettingsRow 
                key={i}
                title={m}
                rightElement={
                    <button className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                    </button>
                }
            />
        ))}
        {mockMemories.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground/60 italic">
                No memories saved yet.
            </div>
        )}
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow 
            variant="danger" 
            title="Clear All Memories" 
            onClick={() => {
                if(confirm("Are you sure you want to clear all memories? This cannot be undone.")) {
                    toast.success("All memories cleared");
                }
            }}
        />
      </SettingsGroup>
    </SettingsLayout>
  );
}
