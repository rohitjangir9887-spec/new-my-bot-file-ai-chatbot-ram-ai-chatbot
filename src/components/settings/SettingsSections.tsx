import { useState, useEffect } from "react";
import { 
  User, Bell, Palette, Lock, Database, Info, 
  Shield, Mic2, Brain, Check, ChevronRight, 
  Moon, Sun, Laptop, Trash2, Download 
} from "lucide-react";
import { useSettingsStore, Theme, AccentColor } from "@/lib/settings/store";
import { useChatStore } from "@/lib/chat/store";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function SettingsSections() {
  const [activeSection, setActiveSection] = useState('General');
  
  const sections = [
    { id: 'General', icon: <User className="w-4 h-4" /> },
    { id: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'Voice', icon: <Mic2 className="w-4 h-4" /> },
    { id: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'Privacy & Data', icon: <Shield className="w-4 h-4" /> },
    { id: 'Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'Personalization', icon: <Brain className="w-4 h-4" /> },
    { id: 'Memory', icon: <Database className="w-4 h-4" /> },
    { id: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-2 -mx-2 px-2 flex-shrink-0">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 whitespace-nowrap ${
              activeSection === s.id 
                ? "glass-strong border-primary/20 text-primary" 
                : "glass border-white/5 text-muted-foreground hover:bg-white/5"
            }`}
          >
            {s.icon}
            {s.id}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 pb-8"
        >
          {activeSection === 'General' && <GeneralSettings />}
          {activeSection === 'Appearance' && <AppearanceSettings />}
          {activeSection === 'Voice' && <VoiceSettings />}
          {activeSection === 'Notifications' && <NotificationSettings />}
          {activeSection === 'Privacy & Data' && <PrivacySettings />}
          {activeSection === 'Security' && <SecuritySettings />}
          {activeSection === 'Personalization' && <PersonalizationSettings />}
          {activeSection === 'Memory' && <MemorySettings />}
          {activeSection === 'About' && <AboutSettings />}
        </motion.div>
      </div>
    </div>
  );
}

function GeneralSettings() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass p-5 rounded-2xl border-white/5">
        <h4 className="text-sm font-bold mb-4 uppercase tracking-widest text-muted-foreground/60">Profile</h4>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
            {email[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="font-bold">{email || "User"}</div>
            <div className="text-xs text-muted-foreground">Ramaibot Professional Plan</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const { theme, setTheme, accentColor, setAccentColor } = useSettingsStore();
  
  const themes: { id: Theme; icon: any; label: string }[] = [
    { id: 'system', icon: <Laptop className="w-4 h-4" />, label: 'System' },
    { id: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
    { id: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Dark' },
  ];

  const accents: { id: AccentColor; color: string }[] = [
    { id: 'blue', color: 'bg-blue-500' },
    { id: 'violet', color: 'bg-violet-500' },
    { id: 'rose', color: 'bg-rose-500' },
    { id: 'emerald', color: 'bg-emerald-500' },
    { id: 'amber', color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-bold mb-4 uppercase tracking-widest text-muted-foreground/60">Theme</h4>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                theme === t.id 
                  ? "glass-strong border-primary/20 text-primary" 
                  : "glass border-white/5 text-muted-foreground hover:bg-white/5"
              }`}
            >
              {t.icon}
              <span className="text-[10px] font-bold uppercase">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold mb-4 uppercase tracking-widest text-muted-foreground/60">Accent Color</h4>
        <div className="flex gap-4">
          {accents.map(a => (
            <button
              key={a.id}
              onClick={() => {
                setAccentColor(a.id);
                toast.success(`Accent color changed to ${a.id}`);
              }}
              className={`w-10 h-10 rounded-full ${a.color} flex items-center justify-center transition-all ${
                accentColor === a.id ? "ring-4 ring-white/20 scale-110" : "opacity-40 hover:opacity-100"
              }`}
              aria-label={`Set accent color to ${a.id}`}
            >
              {accentColor === a.id && <Check className="w-5 h-5 text-white" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function VoiceSettings() {
  const { 
    voiceEnabled, setVoiceEnabled, 
    autoPlayResponses, setAutoPlayResponses,
    speechSpeed, setSpeechSpeed,
    selectedVoice, setSelectedVoice
  } = useSettingsStore();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  return (
    <div className="space-y-6">
      <ToggleItem 
        label="Voice Input/Output" 
        desc="Enable speech features" 
        active={voiceEnabled} 
        onToggle={setVoiceEnabled} 
      />
      <ToggleItem 
        label="Auto-play Responses" 
        desc="Read every AI message aloud" 
        active={autoPlayResponses} 
        onToggle={setAutoPlayResponses} 
      />
      
      <div>
        <div className="flex justify-between mb-3">
          <label className="text-sm font-bold uppercase tracking-wider">Speech Speed</label>
          <span className="text-xs font-bold text-primary">{speechSpeed.toFixed(1)}x</span>
        </div>
        <input 
          type="range" 
          min="0.5" 
          max="2" 
          step="0.1" 
          value={speechSpeed} 
          onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
          className="w-full accent-primary bg-white/5 rounded-lg h-1.5 appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="text-sm font-bold uppercase tracking-wider block mb-3">Selected Voice</label>
        <select 
          value={selectedVoice || ""}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full glass bg-background/50 border-white/5 rounded-xl p-3 text-sm text-foreground focus:ring-0"
        >
          <option value="">Default System Voice</option>
          {voices.map(v => (
            <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const { 
    notificationsEnabled, setNotificationsEnabled,
    taskCompletionNotifications, setTaskCompletionNotifications,
    accountNotifications, setAccountNotifications
  } = useSettingsStore();

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support notifications");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      toast.success("Notifications enabled");
    }
  };

  return (
    <div className="space-y-6">
      <ToggleItem 
        label="Enable Notifications" 
        desc="System wide alerts" 
        active={notificationsEnabled} 
        onToggle={(val) => val ? requestPermission() : setNotificationsEnabled(false)} 
      />
      <ToggleItem 
        label="Task Completion" 
        desc="When AI tools finish" 
        active={taskCompletionNotifications} 
        onToggle={setTaskCompletionNotifications} 
      />
      <ToggleItem 
        label="Account Alerts" 
        desc="Security and billing" 
        active={accountNotifications} 
        onToggle={setAccountNotifications} 
      />
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="space-y-6">
      <div className="glass-strong p-6 rounded-2xl border-white/5">
        <h4 className="text-sm font-bold mb-4 uppercase tracking-widest text-rose-400">Danger Zone</h4>
        <div className="space-y-3">
          <ActionButton 
            label="Clear all conversations" 
            icon={<Trash2 className="w-4 h-4" />} 
            onClick={async () => {
              if (confirm("Are you sure? This cannot be undone.")) {
                try {
                  await useChatStore.getState().clearAllConversations();
                  toast.success("All conversations cleared");
                } catch (e) {
                  toast.error("Failed to clear conversations");
                }
              }
            }}
            variant="danger"
          />
          <ActionButton 
            label="Export my data" 
            icon={<Download className="w-4 h-4" />} 
            onClick={async () => {
              toast.info("Preparing your data for download...");
              try {
                await useChatStore.getState().exportData();
                toast.success("Data exported successfully");
              } catch (e) {
                toast.error("Failed to export data");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="glass p-5 rounded-2xl border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Authentication</h4>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Secure</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Your session is protected by enterprise-grade encryption.</p>
        <button className="text-xs font-bold text-primary hover:underline">Manage Active Sessions</button>
      </div>
    </div>
  );
}

function PersonalizationSettings() {
  const { personalizationEnabled, setPersonalizationEnabled } = useSettingsStore();
  return (
    <div className="space-y-6">
      <ToggleItem 
        label="Personalize Ramaibot" 
        desc="AI learns from your preferences" 
        active={personalizationEnabled} 
        onToggle={setPersonalizationEnabled} 
      />
    </div>
  );
}

function MemorySettings() {
  const { memoryEnabled, setMemoryEnabled } = useSettingsStore();
  return (
    <div className="space-y-6">
      <ToggleItem 
        label="Long-term Memory" 
        desc="Ramaibot remembers facts across chats" 
        active={memoryEnabled} 
        onToggle={setMemoryEnabled} 
      />
    </div>
  );
}

function AboutSettings() {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl glass-strong flex items-center justify-center mx-auto shadow-xl">
        <div className="w-8 h-8 rounded-full bg-primary animate-pulse" />
      </div>
      <div>
        <h3 className="font-bold text-lg">Ramaibot</h3>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Version 2.0.0</p>
      </div>
      <p className="text-sm text-muted-foreground px-6 leading-relaxed">
        Premium AI Assistant built for elite productivity and conversational intelligence.
      </p>
    </div>
  );
}

// Helper Components
function ToggleItem({ label, desc, active, onToggle }: { label: string, desc: string, active: boolean, onToggle: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between group">
      <div>
        <div className="text-sm font-bold uppercase tracking-wider">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <button 
        onClick={() => onToggle(!active)}
        className={`w-12 h-6 rounded-full transition-all duration-300 relative ${active ? "bg-primary" : "bg-white/10"}`}
        aria-label={`Toggle ${label}`}
        aria-pressed={active}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${active ? "left-7" : "left-1"}`} />
      </button>
    </div>
  );
}

function ActionButton({ label, icon, onClick, variant = 'default' }: { label: string, icon: any, onClick: () => void, variant?: 'default' | 'danger' }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${
        variant === 'danger' 
          ? "bg-rose-500/5 border-rose-500/10 hover:bg-rose-500/10 text-rose-400" 
          : "bg-white/5 border-white/5 hover:bg-white/10 text-foreground"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 opacity-40" />
    </button>
  );
}
