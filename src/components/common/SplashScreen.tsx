import { useState, useEffect } from "react";
import { RamaibotOrb } from "./RamaibotOrb";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Shorter splash for better UX, exit quickly once app shell is ready
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 500);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) return null;

  return (
    <div 
      data-qa="splash-screen"
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0f] transition-opacity duration-500 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative flex flex-col items-center">
        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-[2.5] animate-pulse" />
        <RamaibotOrb 
          size="lg" 
          className={isVisible ? "scale-100 rotate-0" : "scale-110 rotate-6"} 
        />
        <div className={`mt-8 flex flex-col items-center transition-all duration-500 delay-100 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">Ramaibot</span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40 mt-1">Intelligence</span>
        </div>
      </div>
    </div>
  );
}
