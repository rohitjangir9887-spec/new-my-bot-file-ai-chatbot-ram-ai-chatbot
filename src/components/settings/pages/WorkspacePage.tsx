import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { Users, Building, Plus } from "lucide-react";

export function WorkspacePage({ onBack }: { onBack: () => void }) {
  return (
    <SettingsLayout title="Workspace" onBack={onBack}>
      <SettingsGroup title="General">
        <SettingsRow icon={<Building className="w-4 h-4" />} title="Workspace Name" subtitle="Personal Workspace" />
        <SettingsRow icon={<Users className="w-4 h-4" />} title="Members" subtitle="Only you" />
      </SettingsGroup>

      <SettingsGroup title="Manage">
        <SettingsRow icon={<Plus className="w-4 h-4" />} title="Create Workspace" comingSoon />
      </SettingsGroup>
    </SettingsLayout>
  );
}
