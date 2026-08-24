"use client";

import { motion } from "framer-motion";
import { Upload, FileSignature, CheckCircle2 } from "lucide-react";

export const HowItWorksSection = () => (
  <section className="relative py-24 sm:py-32" id="how-it-works">
    <div className="container mx-auto max-w-5xl px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          How it Works
        </h2>
        <p className="mt-4 text-surface-400 sm:text-lg">
          Three simple steps to provable content authenticity.
        </p>
      </motion.div>

      <div className="grid gap-8 sm:grid-cols-3">
        {[
          {
            step: 1,
            icon: Upload,
            title: "Upload Content",
            description:
              "Upload any AI-generated text, image, or code artifact. Drag & drop or browse.",
          },
          {
            step: 2,
            icon: FileSignature,
            title: "Generate Signature",
            description:
              "We compute a SHA-256 hash and sign it with Ed25519, embedding provenance metadata.",
          },
          {
            step: 3,
            icon: CheckCircle2,
            title: "Verify Anywhere",
            description:
              "Share the sidecar JSON. Anyone can verify the signature — no account needed.",
          },
        ].map((item, i) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="step-card"
          >
            <div className="step-number">{item.step}</div>
            <div className="mb-3 flex justify-center">
              <item.icon className="h-6 w-6 text-accent-500" />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-white">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-surface-400">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
