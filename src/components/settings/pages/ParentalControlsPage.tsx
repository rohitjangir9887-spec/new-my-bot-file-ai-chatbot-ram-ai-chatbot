import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { Toggle } from "../shared/Controls";
import { ShieldAlert, Eye, Lock } from "lucide-react";

export function ParentalControlsPage({ onBack }: { onBack: () => void }) {
  return (
    <SettingsLayout title="Parental Controls" onBack={onBack}>
      <SettingsGroup title="Protection">
        <SettingsRow icon={<ShieldAlert className="w-4 h-4 text-rose-400" />} title="Strict Content Filtering" rightElement={<Toggle active={false} onToggle={() => {}} />} />
        <SettingsRow icon={<Eye className="w-4 h-4 text-sky-400" />} title="Activity Monitoring" comingSoon />
      </SettingsGroup>

      <SettingsGroup title="Access">
        <SettingsRow icon={<Lock className="w-4 h-4 text-amber-400" />} title="Lock Controls" comingSoon />
      </SettingsGroup>
    </SettingsLayout>
  );
}
