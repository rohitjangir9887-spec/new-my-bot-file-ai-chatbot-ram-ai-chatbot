import { Link, useLocation } from '@tanstack/react-router';
import { Bot, LayoutDashboard, MessageSquare, FolderOpen, Image, Brain, Settings, CreditCard, HelpCircle, ShieldCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';

const nav = [
  { to: '/', label: 'AI Chat', icon: MessageSquare },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderOpen },
  { to: '/images', label: 'Images', icon: Image },
  { to: '/explore-models', label: 'AI Models', icon: Brain },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/billing', label: 'Billing', icon: CreditCard },
  { to: '/help', label: 'Help Center', icon: HelpCircle },
];

export function ProfessionalPage({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#08090d] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full bg-violet-500/10 blur-3xl" />
      </div>
      <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-[#08090d]/80 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="lg:hidden rounded-xl p-2 hover:bg-white/10" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <Link to="/" className="flex items-center gap-2.5 font-bold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 border border-primary/20"><Bot className="h-5 w-5 text-primary" /></span><span>Ramaibot</span><span className="hidden sm:inline text-[10px] uppercase tracking-[.2em] text-white/30">Pro AI</span></Link>
        </div>
        <Link to="/" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10">Open Chat</Link>
      </header>
      <div className="mx-auto flex max-w-[1500px]">
        <aside className="hidden lg:block w-64 shrink-0 border-r border-white/10 min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-1 sticky top-20">
            {nav.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${location.pathname === to ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}><Icon className="h-4 w-4" />{label}</Link>)}
          </nav>
          <div className="mt-8 rounded-2xl border border-primary/15 bg-primary/5 p-4"><div className="text-xs font-semibold text-primary">Ramaibot Pro</div><p className="mt-1 text-xs text-white/40">Build, analyze and create with AI.</p></div>
        </aside>
        {open && <div className="fixed inset-0 z-50 lg:hidden bg-black/70" onClick={() => setOpen(false)}><aside className="h-full w-80 bg-[#0b0c11] border-r border-white/10 p-4" onClick={e => e.stopPropagation()}><div className="flex justify-between mb-6"><b>Ramaibot</b><button onClick={() => setOpen(false)}><X /></button></div>{nav.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/60 hover:bg-white/5"><Icon className="h-4 w-4" />{label}</Link>)}</aside></div>}
        <main className="relative flex-1 p-4 sm:p-6 lg:p-10">
          <div className="mx-auto max-w-6xl"><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-primary/70">Ramaibot workspace</p><h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1><p className="mt-2 text-white/45">{subtitle}</p></div>{children}</div>
        </main>
      </div>
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="text-xs text-white/40">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-emerald-400/70">{hint}</p></div>;
}
