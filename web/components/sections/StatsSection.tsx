"use client";

import { motion } from "framer-motion";
import { Code2, Lock, Shield, Zap } from "lucide-react";

export const StatsSection = () => (
  <section className="border-y border-hairline-cool bg-canvas-soft py-8">
    <div className="mx-auto max-w-[1280px] px-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 gap-6 sm:grid-cols-4"
      >
        {[
          { label: "Open Source", value: "MIT License", icon: Code2 },
          { label: "Cryptography", value: "Ed25519", icon: Lock },
          { label: "Content Integrity", value: "SHA-256", icon: Shield },
          { label: "Manifest Export", value: "C2PA v1.4", icon: Zap },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3.5"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm border border-hairline bg-canvas text-ink">
              <stat.icon className="h-4 w-4 text-ink-mute" />
            </div>
            <div>
              <p className="font-sans text-sm font-medium tracking-tight text-ink">
                {stat.value}
              </p>
              <p className="caption text-ink-mute">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);
