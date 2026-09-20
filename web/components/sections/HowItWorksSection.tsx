"use client";

import { motion } from "framer-motion";
import { Upload, FileSignature, ShieldCheck, Code } from "lucide-react";
import { SectionHeader } from "../ui/SectionHeader";

export const HowItWorksSection = () => (
  <section className="relative py-24 sm:py-32 bg-canvas" id="how-it-works">
    <div className="mx-auto max-w-[1280px] px-6">
      <SectionHeader
        title="How it works"
        subtitle="Three simple steps to generate and verify tamper-evident cryptographic proof."
        className="mb-16 sm:mb-20"
      />

      <div className="grid gap-8 md:grid-cols-3">
        {[
          {
            step: "01",
            icon: Upload,
            title: "Upload Artifact",
            description:
              "Select or drop any AI-generated image, markdown text, or code artifact. OriginMark calculates the cryptographic SHA-256 hash of the content.",
            snippet: "sha256(artifact) -> 8f9b2d...",
          },
          {
            step: "02",
            icon: FileSignature,
            title: "Sign with Ed25519",
            description:
              "Generate an Ed25519 digital signature over the content hash. Author identity and model metadata are packaged alongside the signature in a portable JSON sidecar.",
            snippet: "ed25519.sign(hash, secretKey)",
          },
          {
            step: "03",
            icon: ShieldCheck,
            title: "Verify Anywhere",
            description:
              "Distribute the .originmark.json sidecar alongside your content. Anyone can independently verify authenticity without an account or central authority.",
            snippet: "ed25519.verify(hash, sig, pubKey)",
          },
        ].map((item, i) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="card-feature-light flex flex-col justify-between"
          >
            <div>
              {/* Header with step pill */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-hairline bg-canvas-soft text-ink">
                  <item.icon className="h-5 w-5 text-ink-mute" />
                </div>
                <span className="font-mono text-xs font-medium text-ink-mute bg-canvas-soft px-2.5 py-1 rounded-xs border border-hairline">
                  STEP {item.step}
                </span>
              </div>

              <h3 className="heading-lg text-ink mb-2">
                {item.title}
              </h3>

              <p className="body-md text-ink-mute mb-6 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Embedded technical code snippet */}
            <div className="code-block text-xs font-mono py-2.5 px-3 flex items-center justify-between text-ink-mute-2">
              <span className="text-on-dark/90 truncate">{item.snippet}</span>
              <Code className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
