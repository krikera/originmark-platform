"use client";

import { motion } from "framer-motion";
import { FileSignature, ArrowRight, Shield } from "lucide-react";
import { AnimatedShield } from "../AnimatedShield";
import { Mode } from "../../types";

interface HeroSectionProps {
  handleStart: (mode: Mode) => void;
}

export const HeroSection = ({ handleStart }: HeroSectionProps) => (
  <header className="relative bg-canvas pt-32 sm:pt-40 pb-20 lg:pb-28">
    <div className="mx-auto max-w-[1280px] px-6">
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center xl:gap-16">
        {/* Left Column: Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 text-left"
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2">
            <span className="pill-tag-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Open-Source Content Provenance</span>
            </span>
          </div>

          {/* Headline - 64px, weight 500, negative tracking -1.92px */}
          <h1 className="display-xxl text-ink mb-6 max-w-2xl text-balance">
            Prove the origin of <span className="underline decoration-primary decoration-4 underline-offset-4">AI content</span>
          </h1>

          {/* Subtitle - body-lg, 18px, weight 400, leading 1.55 */}
          <p className="body-lg text-ink-mute mb-8 max-w-xl text-balance">
            OriginMark adds a tamper-evident cryptographic signature to any AI-generated artifact.
            Sign content with Ed25519, export C2PA-aligned manifests, and verify authenticity in milliseconds.
          </p>

          {/* CTA Buttons - 6px radii, near-black on green */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => handleStart("sign")}
              className="button-primary-green"
            >
              <FileSignature className="h-4 w-4" />
              <span>Sign Content</span>
              <ArrowRight className="h-4 w-4 ml-0.5" />
            </button>

            <button
              onClick={() => handleStart("verify")}
              className="button-secondary-outline"
            >
              <Shield className="h-4 w-4 text-ink-mute" />
              <span>Verify Authenticity</span>
            </button>
          </div>

          {/* Technical Specs footnote */}
          <div className="mt-8 flex items-center gap-6 text-xs text-ink-mute-2">
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-ink font-medium">Ed25519</span> Signatures
            </span>
            <span className="h-1 w-1 rounded-full bg-hairline-strong" />
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-ink font-medium">SHA-256</span> Checksums
            </span>
            <span className="h-1 w-1 rounded-full bg-hairline-strong" />
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-ink font-medium">C2PA</span> JSON Export
            </span>
          </div>
        </motion.div>

        {/* Right Column: Composited Product UI Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-5 flex justify-center lg:justify-end"
        >
          <AnimatedShield />
        </motion.div>
      </div>
    </div>
  </header>
);
