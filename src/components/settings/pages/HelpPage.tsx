import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { LifeBuoy, Book, MessageCircle, ExternalLink } from "lucide-react";

export function HelpPage({ onBack }: { onBack: () => void }) {
  return (
    <SettingsLayout title="Help & Support" onBack={onBack}>
      <SettingsGroup title="Resources">
        <SettingsRow icon={<Book className="w-4 h-4 text-sky-400" />} title="Documentation" onClick={() => {}} />
        <SettingsRow icon={<LifeBuoy className="w-4 h-4 text-violet-400" />} title="Help Center" onClick={() => {}} />
        <SettingsRow icon={<MessageCircle className="w-4 h-4 text-emerald-400" />} title="Community Forum" onClick={() => {}} />
      </SettingsGroup>

      <SettingsGroup title="Quick Links">
        <SettingsRow title="API Reference" rightElement={<ExternalLink className="w-4 h-4 opacity-20" />} onClick={() => {}} />
        <SettingsRow title="System Status" subtitle="All systems operational" rightElement={<div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />} onClick={() => {}} />
      </SettingsGroup>
    </SettingsLayout>
  );
}
