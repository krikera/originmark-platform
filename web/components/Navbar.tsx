"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Menu } from "lucide-react";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.06] bg-surface-950/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
            <Image src="/favi.png" alt="OriginMark" width={32} height={32} className="h-full w-full object-contain" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            OriginMark
          </span>
        </div>
        <div className="hidden items-center gap-8 text-sm font-medium text-surface-300 md:flex">
          <a href="#features" className="transition-colors hover:text-accent-500">Features</a>
          <a href="#how-it-works" className="transition-colors hover:text-accent-500">How it Works</a>
          <a
            href="https://github.com/krikera/originmark-platform"
            target="_blank"
            className="flex items-center gap-1.5 transition-colors hover:text-accent-500"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
        <button 
          className="text-surface-400 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/[0.06] bg-surface-950 px-6 py-4 md:hidden"
          >
            <div className="flex flex-col gap-4 text-sm font-medium text-surface-300">
              <a href="#features" className="transition-colors hover:text-accent-500" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="transition-colors hover:text-accent-500" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
              <a
                href="https://github.com/krikera/originmark-platform"
                target="_blank"
                className="flex items-center gap-1.5 transition-colors hover:text-accent-500"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
