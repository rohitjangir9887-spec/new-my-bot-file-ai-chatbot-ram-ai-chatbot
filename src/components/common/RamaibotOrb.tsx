import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type OrbState = 'idle' | 'thinking' | 'streaming' | 'success' | 'error';

export function RamaibotOrb({ 
  size = 'md', 
  state = 'idle',
  className 
}: { 
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  state?: OrbState;
  className?: string;
}) {
  const sizeClasses = {
    xs: 'w-6 h-6 rounded-lg text-[10px]',
    sm: 'w-10 h-10 rounded-xl text-lg',
    md: 'w-16 h-16 rounded-[24px] text-3xl',
    lg: 'w-20 h-20 rounded-[28px] text-4xl',
    xl: 'w-28 h-28 rounded-[40px] text-5xl',
  };

  const stateConfig = {
    idle: {
      gradient: "from-primary/40 via-accent/40 to-violet-500/40",
      glow: "opacity-0",
      rotationSpeed: 20,
      scale: 1,
    },
    thinking: {
      gradient: "from-primary/60 via-violet-500/60 to-primary/60",
      glow: "opacity-40 bg-primary/40 blur-xl",
      rotationSpeed: 8,
      scale: 1.05,
    },
    streaming: {
      gradient: "from-primary/50 via-accent/50 to-emerald-500/50",
      glow: "opacity-30 bg-emerald-500/30 blur-lg",
      rotationSpeed: 12,
      scale: 1.02,
    },
    success: {
      gradient: "from-emerald-400/50 via-teal-500/50 to-emerald-600/50",
      glow: "opacity-50 bg-emerald-400/40 blur-2xl",
      rotationSpeed: 15,
      scale: 1.1,
    },
    error: {
      gradient: "from-red-400/50 via-rose-500/50 to-red-600/50",
      glow: "opacity-50 bg-red-400/40 blur-2xl",
      rotationSpeed: 15,
      scale: 1,
    }
  };

  const config = stateConfig[state];

  return (
    <motion.div 
      animate={{ 
        scale: config.scale,
        y: [0, -4, 0]
      }}
      transition={{ 
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 0.5 }
      }}
      className={cn(
        "relative glass flex items-center justify-center border-white/10 shadow-xl overflow-hidden ring-1 ring-white/5",
        sizeClasses[size],
        className
      )}
    >
      {/* 3D layered background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br animate-orb-pulse transition-colors duration-700",
        config.gradient
      )} />
      
      {/* Inner Glow Layers */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-700",
        config.glow
      )} />

      {/* Atmospheric Halo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_70%)]" />
      
      {/* Layered Translucent Spheres */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: config.rotationSpeed, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-40%] border-[1px] border-white/5 rounded-full opacity-20"
      />
      
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: config.rotationSpeed * 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-20%] border-[1px] border-white/10 rounded-full opacity-10"
      />
      
      {/* Light Refraction Effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,transparent_50%,rgba(0,0,0,0.05)_100%)] pointer-events-none" />
      <div className="absolute top-1 left-2 w-1/3 h-1/3 bg-white/10 blur-sm rounded-full pointer-events-none" />
      
      <span className="font-bold text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] tracking-tight select-none">R</span>
    </motion.div>
  );
}
