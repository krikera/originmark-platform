"use client";

import { motion } from "framer-motion";
import { Zap, Lock, Globe, Tags, Code2, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "../ui/SectionHeader";

export const FeaturesSection = () => (
  <section className="border-t border-hairline-cool bg-canvas-soft py-24 sm:py-32" id="features">
    <div className="mx-auto max-w-[1280px] px-6">
      <SectionHeader
        title="Engineered for AI provenance"
        subtitle="Built for automated pipelines, creative platforms, and open content verification."
        className="mb-16 sm:mb-20"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: Batch Processing (light 2-span) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="card-feature-light md:col-span-2 flex flex-col justify-between"
        >
          <div>
            <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-sm border border-hairline bg-canvas-soft text-ink">
              <Zap className="h-5 w-5 text-ink" />
            </div>
            <h3 className="heading-lg text-ink mb-2">
              Batch Artifact Signing
            </h3>
            <p className="body-md text-ink-mute max-w-xl">
              Queue and sign multiple artifacts in a single workflow. Drop multiple images or text files into the web workspace or automate processing via the async FastAPI backend.
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-hairline flex items-center gap-4 text-xs font-mono text-ink-mute">
            <span className="text-ink font-medium">Async FastAPI Backend</span>
            <span className="h-1 w-1 rounded-full bg-hairline-strong" />
            <span>Bulk Sidecar Download</span>
          </div>
        </motion.div>

        {/* Card 2: Cryptographic Trust (light 1-span) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card-feature-light md:col-span-1 flex flex-col justify-between"
        >
          <div>
            <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-sm border border-hairline bg-canvas-soft text-ink">
              <Lock className="h-5 w-5 text-ink" />
            </div>
            <h3 className="heading-lg text-ink mb-2">
              Ed25519 Signatures
            </h3>
            <p className="body-md text-ink-mute">
              High-performance Edwards-curve digital signatures (via PyNaCl / libsodium) providing ~128-bit classical security and compact 64-byte signatures.
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-hairline text-xs font-mono text-ink-mute">
            <span>RFC 8032 Compliant</span>
          </div>
        </motion.div>

        {/* Card 3: Universal Verification (light 1-span) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="card-feature-light md:col-span-1 flex flex-col justify-between"
        >
          <div>
            <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-sm border border-hairline bg-canvas-soft text-ink">
              <Globe className="h-5 w-5 text-ink" />
            </div>
            <h3 className="heading-lg text-ink mb-2">
              Independent Verifiability
            </h3>
            <p className="body-md text-ink-mute">
              Verify artifacts directly in the web dashboard or against the self-hostable API without needing an account or API key. All cryptographic keys are included in the sidecar.
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-hairline text-xs font-mono text-ink-mute">
            <span>Open & Self-Hostable</span>
          </div>
        </motion.div>

        {/* Card 4: Developer Inverted Dark Card (card-feature-dark 2-span) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card-feature-dark md:col-span-2 flex flex-col justify-between"
        >
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 bg-canvas-night-soft text-on-dark">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <span className="pill-tag-green text-[11px]">
                RESTful FastAPI
              </span>
            </div>
            <h3 className="heading-lg text-on-dark mb-2">
              API-First Architecture & C2PA Export
            </h3>
            <p className="body-md text-ink-mute-2 max-w-xl mb-6">
              Export C2PA v1.4 JSON manifests for standardized provenance tracking. Automate signing and verification workflows with the FastAPI REST endpoints.
            </p>

            {/* Embedded Code Snippet */}
            <div className="rounded-sm bg-canvas-night-soft border border-white/10 p-3.5 font-mono text-xs text-ink-faint overflow-x-auto">
              <code>
                <span className="text-primary-soft">curl</span> -X POST http://localhost:8000/sign \<br />
                &nbsp;&nbsp;-F <span className="text-on-dark">&quot;file=@model_output.png&quot;</span> \<br />
                &nbsp;&nbsp;-F <span className="text-on-dark">&quot;author=Alice Freeman&quot;</span>
              </code>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-ink-mute-2">
            <span>FastAPI Backend + Ed25519 Cryptography</span>
            <a
              href="https://github.com/krikera/originmark-platform/blob/main/docs/DEVELOPER_GUIDE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-on-dark hover:text-primary transition-colors"
            >
              <span>Developer Guide</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </motion.div>

        {/* Card 5: Metadata Tracking (light 3-span or 1-span) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="card-feature-light md:col-span-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-hairline bg-canvas-soft text-ink">
              <Tags className="h-5 w-5 text-ink" />
            </div>
            <div>
              <h3 className="heading-lg text-ink mb-1">
                Provenance Metadata Tracking
              </h3>
              <p className="body-md text-ink-mute max-w-2xl">
                Bind creator identity, AI model name, timestamp, and signed content hashes into a structured, verifiable sidecar manifest.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="pill-tag-soft font-mono">author</span>
            <span className="pill-tag-soft font-mono">model_used</span>
            <span className="pill-tag-soft font-mono">timestamp</span>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);
