"use client";

import { motion } from "framer-motion";
import { Zap, Lock, Globe, Boxes, Tags, Code2 } from "lucide-react";

export const FeaturesSection = () => (
  <section className="py-32 sm:py-40" id="features">
    <div className="container mx-auto max-w-6xl px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-20 text-center"
      >
        <h2 className="font-display text-3xl font-bold text-white sm:text-5xl">
          Why OriginMark?
        </h2>
        <p className="mt-6 text-surface-400 sm:text-lg max-w-2xl mx-auto">
          Built for the AI era. From individual creators to enterprise pipelines.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
        {[
          {
            icon: Zap,
            title: "Batch Processing",
            description:
              "Process hundreds of files at once with parallel Ed25519 signing and verification. Built from the ground up for high-throughput enterprise workloads.",
            className: "md:col-span-2 bg-gradient-to-br from-surface-800 to-surface-900 border-surface-700/50",
          },
          {
            icon: Lock,
            title: "Cryptographic Trust",
            description:
              "Industry-standard Ed25519 signatures that remain secure.",
            className: "md:col-span-1",
          },
          {
            icon: Globe,
            title: "Universal Verification",
            description:
              "Verify anywhere through the dashboard without accounts.",
            className: "md:col-span-1",
          },
          {
            icon: Boxes,
            title: "Open Standard",
            description:
              "C2PA-aligned metadata format. Interoperable seamlessly with the growing content provenance ecosystem.",
            className: "md:col-span-2 bg-gradient-to-bl from-accent-500/5 to-surface-900 border-accent-500/10",
          },
          {
            icon: Tags,
            title: "Metadata Tracking",
            description:
              "Embed author identity, AI model parameters, timestamp, and highly custom schema fields directly inside every signature.",
            className: "md:col-span-2 bg-gradient-to-tr from-surface-800 to-surface-900 border-surface-700/50",
          },
          {
            icon: Code2,
            title: "API-First",
            description:
              "RESTful FastAPI backend for rapid programmatic integrations.",
            className: "md:col-span-1",
          },
        ].map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`feature-card flex flex-col justify-between ${feature.className || ""}`}
          >
            <div>
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-500 ring-1 ring-inset ring-accent-500/20">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-base leading-relaxed text-surface-400">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
