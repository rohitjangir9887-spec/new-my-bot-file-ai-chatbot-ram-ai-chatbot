import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { 
  X, User, ChevronRight, Palette, Mic2, Bell, 
  Shield, Lock, Brain, Database, Info, LogOut,
  Sparkles, Mail, Phone, Globe, LayoutGrid, Zap, 
  CreditCard, Users, Eye, MessageSquare, LifeBuoy,
  Search, ShieldAlert, Heart, Building, Settings
} from "lucide-react";
import { useSettingsStore } from "@/lib/settings/store";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Shared Components
import { SettingsGroup } from "./shared/SettingsGroup";
import { SettingsRow } from "./shared/SettingsRow";

import { PersonalizationPage } from "./pages/PersonalizationPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AppearancePage } from "./pages/AppearancePage";
import { VoicePage } from "./pages/VoicePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { DataControlsPage } from "./pages/DataControlsPage";
import { SecurityPage } from "./pages/SecurityPage";
import { SafetyPage } from "./pages/SafetyPage";
import { MemoryPage } from "./pages/MemoryPage";
import { CustomInstructionsPage } from "./pages/CustomInstructionsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { StoragePage } from "./pages/StoragePage";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { AboutPage } from "./pages/AboutPage";
import { UsagePage } from "./pages/UsagePage";
import { HelpPage } from "./pages/HelpPage";
import { ReportBugPage } from "./pages/ReportBugPage";
import { IntegrationsPage } from "./pages/IntegrationsPage";
import { WebSearchPage } from "./pages/WebSearchPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { TrustedContactPage } from "./pages/TrustedContactPage";
import { ParentalControlsPage } from "./pages/ParentalControlsPage";
import { RemoteControlPage } from "./pages/RemoteControlPage";

export function SettingsView({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const search = useSearch({ from: '/' }) as any;
  const initialView = search.settingsPage || null;
  const [activeView, setActiveView] = useState<string | null>(initialView);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleBack = () => {
    if (activeView) {
      setActiveView(null);
      // Clean up URL if we were on a deep link
      navigate({ to: '/', search: { settings: true }, replace: true });
    } else {
      onClose();
    }
  };

  const handleNavigate = (view: string) => {
    setActiveView(view);
    // Optional: sync to URL for better history support
    navigate({ to: '/', search: { settings: true, settingsPage: view }, replace: true });
  };

  const renderContent = () => {
    const props = { onBack: handleBack };
    
    switch (activeView) {
      case 'Personalization': return <PersonalizationPage {...props} />;
      case 'Appearance': return <AppearancePage {...props} />;
      case 'Voice': return <VoicePage {...props} />;
      case 'Notifications': return <NotificationsPage {...props} />;
      case 'DataControls': return <DataControlsPage {...props} />;
      case 'Security': return <SecurityPage {...props} />;
      case 'Safety': return <SafetyPage {...props} />;
      case 'Memory': return <MemoryPage {...props} />;
      case 'CustomInstructions': return <CustomInstructionsPage {...props} />;
      case 'Projects': return <ProjectsPage {...props} />;
      case 'Storage': return <StoragePage {...props} />;
      case 'Subscription': return <SubscriptionPage {...props} />;
      case 'Usage': return <UsagePage {...props} />;
      case 'Integrations': return <IntegrationsPage {...props} />;
      case 'WebSearch': return <WebSearchPage {...props} />;
      case 'Workspace': return <WorkspacePage {...props} />;
      case 'TrustedContact': return <TrustedContactPage {...props} />;
      case 'ParentalControls': return <ParentalControlsPage {...props} />;
      case 'RemoteControl': return <RemoteControlPage {...props} />;
      case 'Help': return <HelpPage {...props} />;
      case 'ReportBug': return <ReportBugPage {...props} />;
      case 'About': return <AboutPage {...props} />;
      default: return null;
    }
  };

  if (isDesktop) {
    return (
      <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-xl flex items-center justify-center p-8 pointer-events-auto">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-5xl h-[80vh] bg-[#0a0a0f] rounded-[2.5rem] border border-white/5 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.8)] flex overflow-hidden"
        >
          {/* Desktop Sidebar */}
          <div className="w-[300px] border-r border-white/5 flex flex-col bg-white/[0.02]">
            <div className="p-8">
              <h2 className="text-2xl font-bold tracking-tight mb-6">Settings</h2>
              <div className="overflow-y-auto max-h-[calc(80vh-120px)] pr-2 scrollbar-hide space-y-6">
                <SettingsHomeContent onNavigate={handleNavigate} activeView={activeView} isDesktop />
              </div>
            </div>
            <div className="mt-auto p-8 border-t border-white/5">
              <SignOutButton onClose={onClose} />
            </div>
          </div>

          {/* Desktop Content */}
          <div className="flex-1 bg-[#0a0a0f] relative overflow-hidden">
            {activeView ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-4">
                  <Settings className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Select a setting</h3>
                <p className="text-sm text-muted-foreground/60 max-w-xs">
                  Choose a category from the sidebar to manage your account and app preferences.
                </p>
              </div>
            )}
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 transition-all active:scale-90 z-30"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Mobile View
  return (
    <div className="fixed inset-0 z-[1000] bg-[#0a0a0f] flex flex-col h-full w-full safe-top pb-safe pointer-events-auto overflow-hidden">
      <AnimatePresence mode="wait">
        {!activeView ? (
          <motion.div
            key="home"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="flex-1 overflow-y-auto scrollbar-hide"
          >
            <div className="max-w-xl mx-auto p-4 sm:p-6 pb-20">
              <div className="flex items-center gap-4 mb-8 sticky top-0 bg-[#0a0a0f]/80 backdrop-blur-xl py-4 z-10">
                <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-all active:scale-90">
                  <X className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold tracking-tight" data-qa="settings-title">Settings</h1>
              </div>
              
              <ProfileBanner onNavigate={() => setActiveView('Profile')} />
              
              <div className="space-y-8 mt-8">
                <SettingsHomeContent onNavigate={handleNavigate} activeView={activeView} />
                <SignOutButton onClose={onClose} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="subpage"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="flex-1"
          >
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileBanner({ onNavigate }: { onNavigate: () => void }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  return (
    <div 
      onClick={onNavigate}
      className="flex items-center gap-4 p-5 glass rounded-[2.5rem] border border-white/5 shadow-2xl press cursor-pointer"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-violet-500/20 flex items-center justify-center font-bold text-2xl text-primary border border-primary/20 shadow-inner">
        {user?.email?.[0].toUpperCase() || "R"}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-bold text-base truncate">{user?.email?.split('@')[0] || "Ramaibot User"}</h2>
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest truncate">{user?.email}</p>
        <div className="inline-flex items-center gap-1.5 mt-2 text-[9px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-[0.15em] border border-primary/10">
          Pro Plan <Sparkles className="w-3 h-3" />
        </div>
      </div>
      <ChevronRight className="w-5 h-5 opacity-20" />
    </div>
  );
}

function SettingsHomeContent({ onNavigate, activeView, isDesktop }: { onNavigate: (v: string) => void, activeView: string | null, isDesktop?: boolean }) {
  return (
    <>
      <SettingsGroup title="Account">
        <SettingsRow icon={<User className="w-4 h-4 text-sky-400" />} title="Profile" onClick={() => onNavigate('Profile')} data-qa="settings-row-profile" />
        <SettingsRow icon={<Building className="w-4 h-4 text-violet-400" />} title="Workspace" onClick={() => onNavigate('Workspace')} />
        <SettingsRow icon={<CreditCard className="w-4 h-4 text-emerald-400" />} title="Subscription" onClick={() => onNavigate('Subscription')} />
        <SettingsRow icon={<Mail className="w-4 h-4 text-amber-400" />} title="Email" subtitle="Manage account email" comingSoon />
        <SettingsRow icon={<Phone className="w-4 h-4 text-rose-400" />} title="Phone" subtitle="Add recovery number" comingSoon />
      </SettingsGroup>

      <SettingsGroup title="Personalization">
        <SettingsRow icon={<Brain className="w-4 h-4 text-primary" />} title="Intelligence" onClick={() => onNavigate('Personalization')} />
        <SettingsRow icon={<Database className="w-4 h-4 text-emerald-400" />} title="Memory" onClick={() => onNavigate('Memory')} />
        <SettingsRow icon={<Sparkles className="w-4 h-4 text-amber-400" />} title="Custom Instructions" onClick={() => onNavigate('CustomInstructions')} />
        <SettingsRow icon={<LayoutGrid className="w-4 h-4 text-violet-400" />} title="Projects" onClick={() => onNavigate('Projects')} />
      </SettingsGroup>

      <SettingsGroup title="Preferences">
        <SettingsRow icon={<Palette className="w-4 h-4 text-rose-400" />} title="Appearance" onClick={() => onNavigate('Appearance')} />
        <SettingsRow icon={<Zap className="w-4 h-4 text-amber-400" />} title="Accent Color" onClick={() => onNavigate('Appearance')} />
        <SettingsRow icon={<Globe className="w-4 h-4 text-sky-400" />} title="Language" onClick={() => onNavigate('Appearance')} />
        <SettingsRow icon={<Bell className="w-4 h-4 text-orange-400" />} title="Notifications" onClick={() => onNavigate('Notifications')} />
        <SettingsRow icon={<Mic2 className="w-4 h-4 text-violet-400" />} title="Voice" onClick={() => onNavigate('Voice')} />
      </SettingsGroup>

      <SettingsGroup title="Privacy & Security">
        <SettingsRow icon={<ShieldAlert className="w-4 h-4 text-rose-400" />} title="Safety" onClick={() => onNavigate('Safety')} />
        <SettingsRow icon={<Lock className="w-4 h-4 text-sky-400" />} title="Security & Login" onClick={() => onNavigate('Security')} />
        <SettingsRow icon={<Heart className="w-4 h-4 text-rose-400" />} title="Trusted Contact" onClick={() => onNavigate('TrustedContact')} />
        <SettingsRow icon={<Eye className="w-4 h-4 text-amber-400" />} title="Parental Controls" onClick={() => onNavigate('ParentalControls')} />
        <SettingsRow icon={<Shield className="w-4 h-4 text-emerald-400" />} title="Data Controls" onClick={() => onNavigate('DataControls')} />
      </SettingsGroup>

      <SettingsGroup title="Data & Storage">
        <SettingsRow icon={<Database className="w-4 h-4 text-amber-400" />} title="Storage" onClick={() => onNavigate('Storage')} />
        <SettingsRow icon={<LayoutGrid className="w-4 h-4 text-sky-400" />} title="Files" onClick={() => onNavigate('Storage')} />
        <SettingsRow icon={<Zap className="w-4 h-4 text-violet-400" />} title="Usage" onClick={() => onNavigate('Usage')} data-qa="settings-row-usage" />
      </SettingsGroup>

      <SettingsGroup title="Tools">
        <SettingsRow icon={<Search className="w-4 h-4 text-sky-400" />} title="Web Search" onClick={() => onNavigate('WebSearch')} />
        <SettingsRow icon={<LayoutGrid className="w-4 h-4 text-primary" />} title="Integrations" onClick={() => onNavigate('Integrations')} />
        <SettingsRow icon={<Smartphone className="w-4 h-4 text-emerald-400" />} title="Remote Control" onClick={() => onNavigate('RemoteControl')} />
      </SettingsGroup>

      <SettingsGroup title="Support">
        <SettingsRow icon={<MessageSquare className="w-4 h-4 text-sky-400" />} title="Help Center" onClick={() => onNavigate('Help')} />
        <SettingsRow icon={<LifeBuoy className="w-4 h-4 text-violet-400" />} title="Report a Bug" onClick={() => onNavigate('ReportBug')} />
        <SettingsRow icon={<Info className="w-4 h-4 text-muted-foreground" />} title="About" onClick={() => onNavigate('About')} />
      </SettingsGroup>
    </>
  );
}

function SignOutButton({ onClose }: { onClose: () => void }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    onClose();
    window.location.reload();
  };

  return (
    <button 
      onClick={handleSignOut}
      className="w-full flex items-center gap-4 p-4 hover:bg-rose-500/10 transition-colors press group rounded-[1.5rem]"
    >
      <div className="text-rose-500/60 group-hover:text-rose-500"><LogOut className="w-5 h-5" /></div>
      <span className="flex-1 text-left font-bold text-xs uppercase tracking-widest text-rose-400">Log Out</span>
    </button>
  );
}

// Minimal placeholder for Smartphone icon as it wasn't in the list
function Smartphone({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}
