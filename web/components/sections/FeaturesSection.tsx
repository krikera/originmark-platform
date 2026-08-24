"use client";

import { motion } from "framer-motion";
import { Zap, Lock, Globe, Boxes, Tags, Code2 } from "lucide-react";

export const FeaturesSection = () => (
  <section className="py-24 sm:py-32" id="features">
    <div className="container mx-auto max-w-6xl px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          Why OriginMark?
        </h2>
        <p className="mt-4 text-surface-400 sm:text-lg">
          Built for the AI era. From individual creators to enterprise pipelines.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[
          {
            icon: Zap,
            title: "Batch Processing",
            description:
              "Process hundreds of files at once with parallel Ed25519 signing and verification.",
          },
          {
            icon: Lock,
            title: "Cryptographic Trust",
            description:
              "Industry-standard Ed25519 signatures — immutable, verifiable offline, and future-proof.",
          },
          {
            icon: Globe,
            title: "Universal Verification",
            description:
              "Verify content anywhere through the web dashboard. No downloads, no accounts.",
          },
          {
            icon: Boxes,
            title: "Open Standard",
            description:
              "C2PA-aligned metadata format. Interoperable with the content provenance ecosystem.",
          },
          {
            icon: Tags,
            title: "Metadata Tracking",
            description:
              "Embed author identity, AI model, timestamp, and custom fields in every signature.",
          },
          {
            icon: Code2,
            title: "API-First",
            description:
              "RESTful FastAPI backend. Integrate programmatically into any pipeline in minutes.",
          },
        ].map((feature) => (
          <motion.div
            key={feature.title}
            whileHover={{ y: -4 }}
            className="feature-card"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/10 text-accent-500">
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-white">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-surface-400">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);
