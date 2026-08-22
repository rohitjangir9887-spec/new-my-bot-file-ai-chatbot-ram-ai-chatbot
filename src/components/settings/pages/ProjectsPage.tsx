import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { Plus, LayoutGrid, MoreVertical } from "lucide-react";

export function ProjectsPage({ onBack }: { onBack: () => void }) {
  const projects = [
    { id: 1, name: "Marketing Strategy", desc: "Q4 marketing goals and assets", chats: 12 },
    { id: 2, name: "Codebase Audit", desc: "Technical debt and refactor plan", chats: 5 }
  ];

  return (
    <SettingsLayout 
        title="Projects" 
        onBack={onBack}
        description="Organize your conversations and files into specific projects."
    >
      <div className="px-2">
        <button className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-white/5 rounded-[2rem] hover:bg-white/5 transition-all group text-sm font-bold text-muted-foreground hover:text-foreground">
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Create New Project
        </button>
      </div>

      <SettingsGroup title="Your Projects">
        {projects.map(p => (
            <SettingsRow 
                key={p.id}
                icon={<LayoutGrid className="w-4 h-4 text-primary" />}
                title={p.name}
                subtitle={`${p.chats} conversations • ${p.desc}`}
                rightElement={
                    <button className="p-2 hover:bg-white/5 rounded-lg opacity-40 hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                }
            />
        ))}
        {projects.length === 0 && (
            <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-white/5 rounded-2xl mx-auto flex items-center justify-center">
                    <LayoutGrid className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground/60">No projects yet.</p>
            </div>
        )}
      </SettingsGroup>
    </SettingsLayout>
  );
}
