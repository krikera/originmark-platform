import Image from "next/image";
import { Github, ArrowUpRight } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-white/[0.06] py-16">
    <div className="container mx-auto max-w-6xl px-6">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg">
              <Image src="/favi.png" alt="OriginMark" width={28} height={28} className="h-full w-full object-contain" />
            </div>
            <span className="font-display text-lg font-bold text-white">OriginMark</span>
          </div>
          <p className="text-sm leading-relaxed text-surface-500">
            Open-source cryptographic signatures for AI-generated content. Trust what you read.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-surface-400">
            Product
          </h4>
          <ul className="space-y-2.5 text-sm text-surface-500">
            <li><a href="#features" className="transition-colors hover:text-accent-500">Features</a></li>
            <li><a href="#how-it-works" className="transition-colors hover:text-accent-500">How it Works</a></li>
            <li><a href="#main-section" className="transition-colors hover:text-accent-500">Try it Now</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-surface-400">
            Resources
          </h4>
          <ul className="space-y-2.5 text-sm text-surface-500">
            <li>
              <a
                href="https://github.com/krikera/originmark-platform"
                target="_blank"
                className="inline-flex items-center gap-1 transition-colors hover:text-accent-500"
              >
                GitHub <ArrowUpRight className="h-3 w-3" />
              </a>
            </li>
            <li><a href="https://github.com/krikera/originmark-platform#readme" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent-500">Documentation</a></li>
            <li><a href="https://github.com/krikera/originmark-platform/blob/main/docs/DEVELOPER_GUIDE.md" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent-500">API Reference</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-surface-400">
            Legal
          </h4>
          <ul className="space-y-2.5 text-sm text-surface-500">
            <li><a href="https://github.com/krikera/originmark-platform/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent-500">License (MIT)</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
        <p className="text-sm text-surface-500">
          © {new Date().getFullYear()} OriginMark. Open source under MIT License.
        </p>
        <a
          href="https://github.com/krikera/originmark-platform"
          target="_blank"
          className="inline-flex items-center gap-2 text-sm text-surface-500 transition-colors hover:text-accent-500"
        >
          <Github className="h-4 w-4" />
          Star on GitHub
        </a>
      </div>
    </div>
  </footer>
);
