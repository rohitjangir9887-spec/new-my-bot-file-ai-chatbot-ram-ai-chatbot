import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, Sparkles, ChevronRight, Mic, Globe } from "lucide-react";
import { useSettingsStore } from "@/lib/settings/store";

export function OnboardingOverlay() {
  const { hasCompletedOnboarding, setHasCompletedOnboarding } = useSettingsStore();
  const [step, setStep] = useState(0);

  if (hasCompletedOnboarding) return null;

  const steps = [
    {
      title: "Welcome to Ramaibot",
      desc: "Your premium AI companion for high-stakes intelligence and creative exploration.",
      icon: <div className="w-20 h-20 rounded-[32px] glass-strong flex items-center justify-center animate-orb-float shadow-2xl"><Zap className="w-10 h-10 text-primary" /></div>,
      color: "from-primary/20 to-accent/20"
    },
    {
      title: "Powerful Tools",
      desc: "From advanced web search and math calculation to file analysis and vision.",
      icon: <div className="flex gap-4"><Globe className="w-10 h-10 text-blue-400" /><Sparkles className="w-10 h-10 text-amber-400" /></div>,
      color: "from-blue-500/10 to-emerald-500/10"
    },
    {
      title: "Privacy First",
      desc: "Your conversations are encrypted and secure. Control your memory and data in settings.",
      icon: <Shield className="w-16 h-16 text-emerald-400" />,
      color: "from-emerald-500/10 to-teal-500/10"
    },
    {
      title: "Voice Experience",
      desc: "Speak naturally with Ramaibot. Enable voice output for a truly hands-free experience.",
      icon: <Mic className="w-16 h-16 text-violet-400" />,
      color: "from-violet-500/10 to-rose-500/10"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setHasCompletedOnboarding(true);
    }
  };

  return (
    <div data-qa="onboarding-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-3xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative max-w-md w-full glass-strong border-white/10 rounded-[40px] p-8 sm:p-10 shadow-2xl overflow-hidden flex flex-col items-center text-center"
        >
          {steps[step] && (
            <div className={`absolute inset-0 bg-gradient-to-br ${steps[step].color} opacity-50`} />
          )}

          
          <div className="relative z-10 mb-8 sm:mb-10">
            {steps[step]?.icon}
          </div>
          
          <h2 className="relative z-10 text-2xl sm:text-3xl font-black mb-4 tracking-tight leading-tight">
            {steps[step]?.title}
          </h2>
          
          <p className="relative z-10 text-sm sm:text-base text-muted-foreground mb-10 leading-relaxed font-medium">
            {steps[step]?.desc}
          </p>

          
          <div className="relative z-10 w-full flex flex-col gap-3">
            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 press hover:brightness-110 shadow-lg shadow-primary/20"
            >
              {step === steps.length - 1 ? "Start Chatting" : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setHasCompletedOnboarding(true)}
              data-qa="skip-onboarding"
              className="w-full py-4 rounded-2xl bg-white/5 text-muted-foreground text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
            >

              Skip
            </button>
          </div>

          <div className="relative z-10 flex gap-1.5 mt-8">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-primary" : "bg-white/20"}`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
