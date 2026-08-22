import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { Toggle } from "../shared/Controls";
import { Laptop, Wifi, Shield } from "lucide-react";

export function RemoteControlPage({ onBack }: { onBack: () => void }) {
  return (
    <SettingsLayout 
        title="Remote Control" 
        onBack={onBack}
        description="Allow Ramaibot to interact with your devices or browse for you remotely."
    >
      <SettingsGroup title="Capabilities">
        <SettingsRow 
            icon={<Laptop className="w-4 h-4" />} 
            title="Device Interaction" 
            subtitle="Coming to Desktop App soon"
            comingSoon 
        />
        <SettingsRow 
            icon={<Wifi className="w-4 h-4" />} 
            title="Remote Browsing" 
            subtitle="Advanced tool for researchers"
            comingSoon
        />
      </SettingsGroup>

      <SettingsGroup title="Security">
        <SettingsRow 
            icon={<Shield className="w-4 h-4 text-emerald-400" />} 
            title="Require Confirmation" 
            rightElement={<Toggle active={true} onToggle={() => {}} />}
        />
      </SettingsGroup>
    </SettingsLayout>
  );
}
