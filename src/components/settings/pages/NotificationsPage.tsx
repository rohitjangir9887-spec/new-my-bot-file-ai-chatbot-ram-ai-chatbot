import React from "react";
import { SettingsLayout } from "../shared/SettingsLayout";
import { SettingsGroup } from "../shared/SettingsGroup";
import { SettingsRow } from "../shared/SettingsRow";
import { Toggle } from "../shared/Controls";
import { useSettingsStore } from "@/lib/settings/store";

export function NotificationsPage({ onBack }: { onBack: () => void }) {
  const { 
    notificationsEnabled, setNotificationsEnabled,
    taskCompletionNotifications, setTaskCompletionNotifications,
    accountNotifications, setAccountNotifications
  } = useSettingsStore();

  return (
    <SettingsLayout title="Notifications" onBack={onBack}>
      <SettingsGroup title="App Notifications">
        <SettingsRow 
            title="System Notifications" 
            subtitle="Enable all app notifications"
            rightElement={<Toggle active={notificationsEnabled} onToggle={setNotificationsEnabled} />}
        />
        <SettingsRow 
            title="Task Completion" 
            subtitle="Notify when AI finishes long tasks"
            rightElement={<Toggle active={taskCompletionNotifications} onToggle={setTaskCompletionNotifications} />}
        />
        <SettingsRow 
            title="Account & Security" 
            subtitle="Important account updates"
            rightElement={<Toggle active={accountNotifications} onToggle={setAccountNotifications} />}
        />
      </SettingsGroup>

      <SettingsGroup title="Email Preferences">
        <SettingsRow title="Product Updates" rightElement={<Toggle active={false} onToggle={() => {}} />} />
        <SettingsRow title="Security Alerts" rightElement={<Toggle active={true} onToggle={() => {}} />} />
      </SettingsGroup>
    </SettingsLayout>
  );
}
