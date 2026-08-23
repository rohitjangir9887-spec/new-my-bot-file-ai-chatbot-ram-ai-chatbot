import { createFileRoute, Link } from '@tanstack/react-router';
import { ProfessionalPage, StatCard } from '@/components/professional/ProfessionalPage';
import { useChatStore } from '@/lib/chat/store';
import { chatModels } from '@/lib/chat/ai-provider.functions';

export const Route = createFileRoute('/dashboard')({ component: Dashboard });

function Dashboard() {
  const conversations = useChatStore((s) => s.conversations);
  const messageCount = conversations.reduce((n, c) => n + c.messages.length, 0);
  return (
    <ProfessionalPage title="Dashboard" subtitle="Your Ramaibot activity at a glance.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Messages" value={String(messageCount)} hint="Across your conversations" />
        <StatCard label="Projects" value="—" hint="Open Projects to manage work" />
        <StatCard label="AI Models" value={String(chatModels.length)} hint="Available in your workspace" />
        <StatCard label="Plan" value="Free" hint="Manage your subscription in Billing" />
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.035] p-6">
        <h2 className="text-lg font-semibold">Quick start</h2>
        <p className="mt-2 text-sm text-white/45">Chat with Ramaibot, upload files, explore models, or organize work into projects.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold" to="/">Start Chat</Link>
          <Link className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm" to="/projects">View Projects</Link>
          <Link className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm" to="/explore-models">Explore Models</Link>
        </div>
      </div>
    </ProfessionalPage>
  );
}
