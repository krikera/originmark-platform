"use client";

import { Check, ShieldCheck, FileCode, Terminal, Copy } from "lucide-react";
import { useState } from "react";

export const AnimatedShield = () => {
  const [copied, setCopied] = useState(false);

  const sidecarJson = JSON.stringify(
    {
      content_hash: "8f9b2d4ce137a",
      algorithm: "Ed25519",
      status: "VALID_AUTHENTIC",
      timestamp: "2026-09-19T11:30:00Z",
    },
    null,
    2
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sidecarJson);
    } catch {
      // Fallback for non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = sidecarJson;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full max-w-[480px]">
      {/* Background card with subtle offset */}
      <div className="absolute -inset-1.5 rounded-xl bg-hairline-cool/60 -rotate-1 pointer-events-none" />

      {/* Main Composited Product UI Container */}
      <div className="relative rounded-lg border border-hairline bg-canvas shadow-level-2 overflow-hidden">
        {/* Window Chrome Header */}
        <div className="flex items-center justify-between border-b border-hairline-cool bg-canvas-soft px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-hairline inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-hairline-cool inline-block" />
            <span className="ml-2 font-mono text-[11px] text-ink-mute tracking-tight">
              provenance_inspector.ts
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="pill-tag-green text-[11px] tracking-tight">
              <ShieldCheck className="h-3 w-3 inline mr-0.5" />
              Verified Authenticity
            </span>
          </div>
        </div>

        {/* Inner Content Panes */}
        <div className="p-4 space-y-3">
          {/* Artifact Card */}
          <div className="rounded-md border border-hairline bg-canvas-soft p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-hairline bg-canvas text-ink">
                <FileCode className="h-5 w-5 text-ink-mute" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink tracking-tight">
                  generative_blueprint.webp
                </p>
                <p className="text-xs text-ink-mute font-mono">
                  SHA-256: 8f9b2d4c...e137a
                </p>
              </div>
            </div>
            <span className="pill-tag-soft text-[11px]">
              2.4 MB
            </span>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-sm border border-hairline bg-canvas p-2.5">
              <span className="text-[10px] text-ink-mute uppercase tracking-wider block mb-0.5">Author Identity</span>
              <span className="font-medium text-ink">Elena Vance</span>
            </div>
            <div className="rounded-sm border border-hairline bg-canvas p-2.5">
              <span className="text-[10px] text-ink-mute uppercase tracking-wider block mb-0.5">Algorithm</span>
              <span className="font-mono text-ink">Ed25519</span>
            </div>
          </div>

          {/* Dark Developer Code / Terminal Pane */}
          <div className="rounded-sm border border-canvas-night bg-canvas-night p-3 text-on-dark font-mono text-[11px] leading-relaxed relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-canvas-night-soft pb-1.5 mb-2 text-[10px] text-ink-mute-2">
              <div className="flex items-center gap-1.5">
                <Terminal className="h-3 w-3 text-primary" />
                <span>originmark.verify.json</span>
              </div>
              <button
                onClick={handleCopy}
                className="text-ink-mute-2 hover:text-on-dark transition-colors flex items-center gap-1"
                title="Copy sidecar"
              >
                {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="text-[11px] leading-relaxed overflow-x-auto text-ink-faint">
              <code>
{`{
  `}<span className="text-on-dark">&quot;content_hash&quot;</span>{`: `}<span className="text-primary">&quot;8f9b2d4c...e137a&quot;</span>{`,
  `}<span className="text-on-dark">&quot;algorithm&quot;</span>{`: `}<span className="text-primary-soft">&quot;Ed25519&quot;</span>{`,
  `}<span className="text-on-dark">&quot;status&quot;</span>{`: `}<span className="text-primary font-semibold">&quot;VALID_AUTHENTIC&quot;</span>{`,
  `}<span className="text-on-dark">&quot;timestamp&quot;</span>{`: `}<span className="text-on-dark">&quot;2026-09-19T11:30:00Z&quot;</span>{`
}`}
              </code>
            </pre>
          </div>
        </div>

        {/* Footer status row */}
        <div className="border-t border-hairline-cool bg-canvas px-4 py-2 flex items-center justify-between text-[11px] text-ink-mute">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>Cryptographic signature verified</span>
          </span>
          <span className="font-mono text-[10px] text-ink-mute-2">Ed25519 Signature Check</span>
        </div>
      </div>
    </div>
  );
};
