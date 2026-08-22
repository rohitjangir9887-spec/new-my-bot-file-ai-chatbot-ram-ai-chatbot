import { motion } from "framer-motion";

export function VoiceWaveform({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-end gap-1.5 h-16">
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ height: "20%" }}
          animate={isActive ? {
            height: ["20%", "80%", "30%", "100%", "20%"],
          } : { height: "20%" }}
          transition={isActive ? {
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          } : {}}
          className="w-1.5 bg-primary/40 rounded-full"
        />
      ))}
    </div>
  );
}
