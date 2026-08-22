import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { UserPlus, Heart, Shield } from "lucide-react";

export function TrustedContactPage({ onBack }: { onBack: () => void }) {
  return (
    <SettingsLayout 
        title="Trusted Contact" 
        onBack={onBack}
        description="A trusted contact is someone who can be notified in case of emergency or account security issues."
    >
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <Heart className="w-8 h-8 text-rose-400" />
        </div>
      </div>

      <SettingsGroup>
        <SettingsRow icon={<UserPlus className="w-4 h-4" />} title="Add Trusted Contact" comingSoon />
      </SettingsGroup>

      <SettingsGroup title="Privacy">
        <SettingsRow icon={<Shield className="w-4 h-4" />} title="Information Sharing" subtitle="None" disabled />
      </SettingsGroup>
    </SettingsLayout>
  );
}
