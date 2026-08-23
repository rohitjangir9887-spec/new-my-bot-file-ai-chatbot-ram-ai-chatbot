import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/settings')({ component: SettingsRedirect });

function SettingsRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    void navigate({ to: '/', hash: 'settings', replace: true });
  }, [navigate]);
  return <div className="flex h-[100dvh] items-center justify-center bg-[#0a0a0f] text-muted-foreground">Opening Settings…</div>;
}
