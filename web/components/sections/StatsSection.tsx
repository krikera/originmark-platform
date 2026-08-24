"use client";

import { motion } from "framer-motion";
import { Code2, Lock, Shield, Zap } from "lucide-react";

export const StatsSection = () => (
  <section className="border-y border-white/[0.06] bg-surface-950/50 backdrop-blur-sm">
    <div className="container mx-auto max-w-6xl px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 gap-6 sm:grid-cols-4"
      >
        {[
          { label: "Open Source", value: "100%", icon: Code2 },
          { label: "Encryption", value: "Ed25519", icon: Lock },
          { label: "Tamper Proof", value: "Always", icon: Shield },
          { label: "Verification", value: "Instant", icon: Zap },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent-500/10">
              <stat.icon className="h-5 w-5 text-accent-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{stat.value}</p>
              <p className="text-xs text-surface-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);
