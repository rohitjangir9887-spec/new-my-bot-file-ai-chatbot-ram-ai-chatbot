import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SettingsView } from '@/components/settings/SettingsView';

export const Route = createFileRoute('/settings')({ component: SettingsRoute });

function SettingsRoute() {
  const navigate = useNavigate();
  return <SettingsView onClose={() => void navigate({ to: '/' })} />;
}
