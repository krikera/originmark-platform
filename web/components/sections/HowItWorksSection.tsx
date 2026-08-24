"use client";

import { motion } from "framer-motion";
import { Upload, FileSignature, CheckCircle2 } from "lucide-react";
import { SectionHeader } from "../ui/SectionHeader";

export const HowItWorksSection = () => (
  <section className="relative py-32 sm:py-40 bg-surface-900/50" id="how-it-works">
    <div className="container mx-auto max-w-6xl px-6">
      <SectionHeader 
        title="How it Works"
        subtitle="Three simple steps to provable content authenticity."
        className="mb-24"
      />

      <div className="flex flex-col gap-24 lg:gap-32">
        {[
          {
            step: "01",
            icon: Upload,
            title: "Upload Content",
            description:
              "Upload any AI-generated text, image, or code artifact. Drag and drop or browse through our streamlined web interface.",
          },
          {
            step: "02",
            icon: FileSignature,
            title: "Generate Signature",
            description:
              "We compute a highly secure SHA-256 hash and sign it instantly with Ed25519, deeply embedding your provenance metadata.",
          },
          {
            step: "03",
            icon: CheckCircle2,
            title: "Verify Anywhere",
            description:
              "Share the sidecar JSON. Anyone can verify the cryptographic signature against the original file without an account.",
          },
        ].map((item, i) => {
          const isEven = i % 2 === 0;
          return (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className={`flex flex-col gap-12 lg:items-center ${
                isEven ? "lg:flex-row" : "lg:flex-row-reverse"
              }`}
            >
              {/* Text Side */}
              <div className="flex-1 lg:px-12">
                <div className="mb-6 text-accent-500 font-display font-bold text-xl tracking-widest">
                  {item.step}
                </div>
                <h3 className="mb-4 font-display text-3xl font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-lg leading-relaxed text-surface-300 max-w-md">
                  {item.description}
                </p>
              </div>
              
              {/* Visual Side */}
              <div className="flex-1">
                <div className="aspect-[4/3] rounded-3xl border border-surface-800 bg-surface-900/30 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative flex h-32 w-32 items-center justify-center rounded-full bg-surface-800/50 border border-surface-700/50 shadow-2xl backdrop-blur-xl"
                  >
                    <item.icon className="h-14 w-14 text-accent-400" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);
