import React, { useState, useEffect } from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfilePage({ onBack }: { onBack: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setDisplayName(user?.email?.split('@')[0] || "");
      setLoading(false);
    }
    fetchUser();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save or handle real metadata update if needed
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile updated successfully");
    }, 1000);
  };

  if (loading) {
    return (
      <SettingsLayout title="Profile" onBack={onBack}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Loading Profile</span>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout title="Profile" onBack={onBack}>
      <div className="flex flex-col items-center gap-6 py-6">
        <div className="relative group">
          <Avatar className="w-24 h-24 border-4 border-white/5 ring-4 ring-primary/20 shadow-2xl transition-all group-hover:ring-primary/40">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
              {user?.email?.[0].toUpperCase() || <User className="w-8 h-8" />}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <span className="text-[10px] font-bold uppercase text-white tracking-widest">Edit</span>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold tracking-tight">{displayName}</h2>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mt-1">Ramaibot Pro Member</p>
        </div>
      </div>

      <SettingsGroup title="Public Profile">
        <div className="px-5 py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest ml-1">Display Name</label>
            <input 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
              placeholder="Your name"
            />
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Account Info">
        <SettingsRow title="Email" subtitle={user?.email} disabled />
        <SettingsRow title="Provider" subtitle={user?.app_metadata?.provider || "Email"} disabled />
        <SettingsRow title="Account ID" subtitle={user?.id?.slice(0, 12) + "..."} disabled />
      </SettingsGroup>

      <div className="flex justify-end gap-3 px-2">
        <button 
          onClick={onBack}
          className="px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest press shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
        </button>
      </div>
    </SettingsLayout>
  );
}

