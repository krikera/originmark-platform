import OriginMarkLogo from "@/components/ui/OriginMarkLogo";
import { Github, ArrowUpRight } from "lucide-react";

interface FooterProps {
  onOpenWorkspace?: () => void;
}

export const Footer = ({ onOpenWorkspace }: FooterProps) => (
  <footer className="border-t border-hairline-cool bg-canvas py-16">
    <div className="mx-auto max-w-[1280px] px-6">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        {/* Brand Column */}
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2.5">
            <OriginMarkLogo size={20} className="text-ink" />
            <span className="font-sans text-base font-medium text-ink">OriginMark</span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
          </div>
          <p className="caption text-ink-mute max-w-sm leading-relaxed">
            Open-source cryptographic signatures for AI-generated artifacts.
            Establish verifiable provenance using Ed25519 and C2PA standards.
          </p>
        </div>

        {/* Product Column */}
        <div>
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-ink">
            Product
          </h4>
          <ul className="space-y-2 caption text-ink-mute">
            <li>
              <a href="#features" className="transition-colors hover:text-ink">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="transition-colors hover:text-ink">
                How It Works
              </a>
            </li>
            <li>
              <a
                href="#main-section"
                onClick={(e) => {
                  if (onOpenWorkspace) {
                    e.preventDefault();
                    onOpenWorkspace();
                  }
                }}
                className="transition-colors hover:text-ink cursor-pointer"
              >
                Workspace
              </a>
            </li>
          </ul>
        </div>

        {/* Developers Column */}
        <div>
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-ink">
            Developers
          </h4>
          <ul className="space-y-2 caption text-ink-mute">
            <li>
              <a
                href="https://github.com/krikera/originmark-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-ink"
              >
                <span>GitHub Repository</span>
                <ArrowUpRight className="h-3 w-3 text-ink-mute-2" />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/krikera/originmark-platform#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                Documentation
              </a>
            </li>
            <li>
              <a
                href="https://github.com/krikera/originmark-platform/blob/main/docs/DEVELOPER_GUIDE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                FastAPI Spec
              </a>
            </li>
          </ul>
        </div>

        {/* Standards & Legal Column */}
        <div>
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-ink">
            Standards
          </h4>
          <ul className="space-y-2 caption text-ink-mute">
            <li>
              <a
                href="https://c2pa.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-ink"
              >
                <span>C2PA Alignment</span>
                <ArrowUpRight className="h-3 w-3 text-ink-mute-2" />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/krikera/originmark-platform/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                MIT License
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-hairline-cool pt-6 sm:flex-row text-xs text-ink-mute">
        <p>© {new Date().getFullYear()} OriginMark. Engineered for open content verification.</p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/krikera/originmark-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
          >
            <Github className="h-3.5 w-3.5" />
            <span>Star on GitHub</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
);
