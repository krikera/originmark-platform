"use client";

import { useState } from "react";
import OriginMarkLogo from "@/components/ui/OriginMarkLogo";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
];

interface NavbarProps {
  onOpenWorkspace?: () => void;
}

export const Navbar = ({ onOpenWorkspace }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLaunchWorkspace = () => {
    if (onOpenWorkspace) {
      onOpenWorkspace();
    } else {
      const mainSection = document.getElementById("main-section");
      mainSection?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-hairline-cool bg-canvas/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3.5">
        {/* Brand */}
        <a href="#" className="flex items-center gap-2.5 group">
          <OriginMarkLogo
            size={24}
            className="text-ink transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex items-center">
            <span className="font-sans text-base font-medium tracking-tight text-ink">
              OriginMark
            </span>
            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary inline-block" />
          </div>
        </a>

        {/* Desktop Nav Center */}
        <div className="hidden items-center gap-7 text-sm font-normal text-ink-mute md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ink font-medium"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com/krikera/originmark-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-ink font-medium"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>

        {/* Desktop Right CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={handleLaunchWorkspace}
            className="button-primary-green text-xs tracking-tight"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="p-1 text-ink-mute hover:text-ink md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-hairline-cool bg-canvas px-6 py-4 shadow-level-2 md:hidden"
          >
            <div className="flex flex-col gap-4 text-sm font-medium text-ink-mute">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-ink"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://github.com/krikera/originmark-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-ink"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLaunchWorkspace();
                }}
                className="button-primary-green w-full mt-2"
              >
                Launch Workspace
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
