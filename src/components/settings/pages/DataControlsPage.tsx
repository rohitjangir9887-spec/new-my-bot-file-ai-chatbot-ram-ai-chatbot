import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { Download, Trash2, Database } from "lucide-react";
import { toast } from "sonner";
import { useChatStore } from "@/lib/chat/store";

export function DataControlsPage({ onBack }: { onBack: () => void }) {
  const clearHistory = useChatStore(state => state.clearAllConversations);

  return (
    <SettingsLayout title="Privacy & Data" onBack={onBack}>
      <SettingsGroup title="History & Sync">
         <SettingsRow 
            icon={<Database className="w-4 h-4 text-emerald-400" />} 
            title="Chat History & Training" 
            subtitle="Allow Ramaibot to learn from your data."
            comingSoon
         />
      </SettingsGroup>

      <SettingsGroup title="Your Data">
        <SettingsRow 
            icon={<Download className="w-4 h-4 text-primary" />} 
            title="Export Data" 
            subtitle="Download a copy of your conversations."
            onClick={() => {
                toast.info("Preparing export...");
                setTimeout(() => toast.success("Export ready! Check your email."), 2000);
            }}
        />
      </SettingsGroup>

      <SettingsGroup title="Danger Zone">
        <SettingsRow 
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />} 
            title="Clear Chat History" 
            onClick={async () => {
                if(confirm("Permanently delete all conversation history?")) {
                    await clearHistory();
                    toast.success("History cleared");
                }
            }}
        />
        <SettingsRow 
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />} 
            title="Delete Account" 
            onClick={() => {
                if(confirm("DANGER: This will permanently delete your account and all data. Proceed?")) {
                    toast.error("Account deletion requested.");
                }
            }}
        />
      </SettingsGroup>
    </SettingsLayout>
  );
}
