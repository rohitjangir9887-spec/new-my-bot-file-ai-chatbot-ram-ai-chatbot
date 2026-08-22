import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { Toggle } from "../shared/Controls";
import { Shield, EyeOff, Lock } from "lucide-react";

export function SafetyPage({ onBack }: { onBack: () => void }) {
  return (
    <SettingsLayout title="Safety & Content" onBack={onBack}>
      <SettingsGroup title="Content Moderation">
        <SettingsRow icon={<Shield className="w-4 h-4" />} title="Safe Search" rightElement={<Toggle active={true} onToggle={() => {}} />} />
        <SettingsRow icon={<EyeOff className="w-4 h-4" />} title="Blur Sensitive Media" rightElement={<Toggle active={true} onToggle={() => {}} />} />
      </SettingsGroup>

      <SettingsGroup title="Intelligence Safety">
        <SettingsRow icon={<Lock className="w-4 h-4" />} title="Safety Guardrails" subtitle="Standard (Protected)" disabled />
      </SettingsGroup>
    </SettingsLayout>
  );
}
