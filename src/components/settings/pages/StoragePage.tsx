import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { StorageVisual } from "../shared/AbstractVisuals";
import { FileText, Image as ImageIcon, File, Trash2 } from "lucide-react";

export function StoragePage({ onBack }: { onBack: () => void }) {
  return (
    <SettingsLayout title="Storage" onBack={onBack}>
      <StorageVisual used={42} />

      <SettingsGroup title="Files by Type">
        <SettingsRow 
            icon={<ImageIcon className="w-4 h-4 text-sky-400" />} 
            title="Images" 
            subtitle="245 files • 1.2 GB" 
        />
        <SettingsRow 
            icon={<FileText className="w-4 h-4 text-emerald-400" />} 
            title="Documents" 
            subtitle="82 files • 450 MB" 
        />
        <SettingsRow 
            icon={<File className="w-4 h-4 text-amber-400" />} 
            title="Other" 
            subtitle="12 files • 85 MB" 
        />
      </SettingsGroup>

      <SettingsGroup title="Recent Files">
        {[
            { name: "Brand_Guide_2026.pdf", size: "12.4 MB", type: "pdf" },
            { name: "Hero_Section_V2.png", size: "4.2 MB", type: "image" }
        ].map((file, i) => (
            <SettingsRow 
                key={i}
                title={file.name}
                subtitle={file.size}
                rightElement={
                    <button className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                    </button>
                }
            />
        ))}
      </SettingsGroup>
    </SettingsLayout>
  );
}
