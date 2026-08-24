"use client";

import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";
import { useEffect, useState } from "react";
const PARTICLE_CONFIG = [
  { top: 22.5, left: 50.2, yRange: -28, duration: 3.8 },
  { top: 27.6, left: 26.5, yRange: -22, duration: 4.2 },
  { top: 47.6, left: 64.7, yRange: -31, duration: 3.4 },
  { top: 24.5, left: 43.4, yRange: -19, duration: 4.8 },
  { top: 61.0, left: 58.6, yRange: -25, duration: 3.1 },
  { top: 30.3, left: 29.9, yRange: -33, duration: 4.5 },
];

export const AnimatedShield = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative mx-auto flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80 lg:h-96 lg:w-96">
      {/* Outer breathing ring */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full border border-accent-500/20"
      />
      {/* Middle ring */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute inset-8 rounded-full border border-accent-500/25"
      />
      {/* Inner glow ring */}
      <motion.div
        animate={{ scale: [1, 1.03, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute inset-16 rounded-full border border-accent-500/30 shadow-glow"
      />
      {/* Center shield icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-primary-700 shadow-glow-lg sm:h-32 sm:w-32"
      >
        <Fingerprint className="h-14 w-14 text-surface-950 sm:h-16 sm:w-16" />
      </motion.div>

      {/* Floating data particles: only rendered client-side to avoid hydration mismatch */}
      {mounted && PARTICLE_CONFIG.map((p, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-accent-500"
          style={{ top: `${p.top}%`, left: `${p.left}%` }}
          animate={{ y: [0, p.yRange, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
