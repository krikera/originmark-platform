import { motion } from "framer-motion";
import { Sparkles, FileSignature, ArrowRight, Shield, CheckCircle2 } from "lucide-react";
import { AnimatedShield } from "../AnimatedShield";
import { Mode } from "../../types";

interface HeroSectionProps {
  handleStart: (mode: Mode) => void;
}

export const HeroSection = ({ handleStart }: HeroSectionProps) => (
  <header className="relative overflow-hidden pt-28 sm:pt-36">
    {/* Accent glow behind hero */}
    <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/[0.07] blur-[120px]" />

    <div className="container mx-auto max-w-6xl px-6 pb-20 lg:pb-32">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center xl:gap-20">
        {/* Left Column: Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl text-center lg:text-left"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/[0.06] px-4 py-1.5 text-sm font-medium text-accent-400"
          >
            <Sparkles className="h-4 w-4" />
            <span>Open-Source Content Provenance</span>
          </motion.div>

          {/* Headline */}
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            Prove the Origin of <span className="gradient-text">AI Content</span>
          </h1>

          {/* Subtitle */}
          <p className="mb-10 max-w-xl mx-auto lg:mx-0 text-base leading-relaxed text-surface-300 sm:text-lg text-balance">
            OriginMark adds an immutable cryptographic seal to any AI-generated
            artifact. Sign it. Ship it. Let anyone verify it instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStart("sign")}
              className="btn-glow flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <FileSignature className="h-5 w-5" />
              Sign Content
              <ArrowRight className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStart("verify")}
              className="btn-outline flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <Shield className="h-5 w-5" />
              Verify Authenticity
            </motion.button>
          </div>
        </motion.div>

        {/* Right Column: Animated Shield */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex justify-center"
        >
          <AnimatedShield />
        </motion.div>
      </div>
    </div>

  </header>
);
