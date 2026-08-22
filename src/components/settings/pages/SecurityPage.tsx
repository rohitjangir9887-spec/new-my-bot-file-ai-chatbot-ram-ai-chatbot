import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { SecurityVisual } from "../shared/AbstractVisuals";
import { Lock, LogOut, Laptop, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function SecurityPage({ onBack }: { onBack: () => void }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    window.location.reload();
  };

  return (
    <SettingsLayout title="Security" onBack={onBack}>
      <SecurityVisual />

      <SettingsGroup title="Authentication">
        <SettingsRow icon={<Lock className="w-4 h-4" />} title="Change Password" comingSoon />
        <SettingsRow icon={<Smartphone className="w-4 h-4" />} title="Two-Factor Auth" comingSoon />
      </SettingsGroup>

      <SettingsGroup title="Active Sessions">
        <SettingsRow 
            icon={<Laptop className="w-4 h-4" />} 
            title="MacBook Pro" 
            subtitle="Jaipur, India • Current Session" 
            rightElement={<span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Active</span>}
        />
        <SettingsRow 
            icon={<Smartphone className="w-4 h-4" />} 
            title="iPhone 15 Pro" 
            subtitle="Mumbai, India • 2 hours ago" 
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow 
            variant="danger"
            icon={<LogOut className="w-4 h-4" />} 
            title="Sign Out of All Devices" 
            onClick={() => confirm("Sign out of all devices?") && handleSignOut()}
        />
      </SettingsGroup>
    </SettingsLayout>
  );
}
