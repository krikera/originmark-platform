"use client";

import { useState, useRef, useEffect } from "react";
import { Toaster } from "sonner";
import { AnimatePresence } from "framer-motion";

import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/sections/HeroSection";
import { StatsSection } from "../components/sections/StatsSection";
import { HowItWorksSection } from "../components/sections/HowItWorksSection";
import { FeaturesSection } from "../components/sections/FeaturesSection";
import { Footer } from "../components/Footer";
import { Workspace } from "../components/Workspace";
import { Mode } from "../types";

export default function Home() {
  const [mode, setMode] = useState<Mode>("sign");
  const [isMainVisible, setIsMainVisible] = useState(false);
  const mainSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isMainVisible && mainSectionRef.current) {
      setTimeout(() => {
        mainSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isMainVisible]);

  const handleStart = (selectedMode: Mode) => {
    setMode(selectedMode);
    if (!isMainVisible) {
      setIsMainVisible(true);
    } else if (mainSectionRef.current) {
      mainSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-canvas! text-ink! border-hairline! shadow-level-2! text-sm! rounded-sm!",
        }}
      />

      <Navbar onOpenWorkspace={() => handleStart("sign")} />

      <HeroSection handleStart={handleStart} />

      <StatsSection />

      <AnimatePresence>
        {isMainVisible && (
          <Workspace
            mode={mode}
            setMode={setMode}
            mainSectionRef={mainSectionRef}
          />
        )}
      </AnimatePresence>

      <HowItWorksSection />

      <FeaturesSection />

      <Footer onOpenWorkspace={() => handleStart("sign")} />
    </div>
  );
}