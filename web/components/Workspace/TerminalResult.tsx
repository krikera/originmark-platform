interface TerminalResultProps {
  content_hash?: string;
  valid?: boolean;
  metadata?: {
    author?: string;
    model_used?: string;
    timestamp?: string;
    content_hash?: string;
  };
  signature?: string;
}

export const TerminalResult = ({
  content_hash,
  valid,
  metadata,
  signature,
}: TerminalResultProps) => {
  const displayHash = content_hash || metadata?.content_hash || "N/A";

  const statusLabel =
    valid === true
      ? "Ed25519 Verified"
      : valid === false
        ? "Verification Failed"
        : signature
          ? "Ed25519 Signed"
          : "Ed25519 Output";

  const statusColor =
    valid === true
      ? "text-primary"
      : valid === false
        ? "text-accent-tomato"
        : "text-ink-mute-2";

  return (
    <div className="code-block mt-3 relative overflow-hidden">
      {/* Terminal Chrome Header */}
      <div className="mb-2.5 flex items-center justify-between border-b border-white/10 pb-2 text-[11px] text-ink-mute-2 font-mono">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white/20 inline-block" />
          <span className="h-2 w-2 rounded-full bg-white/20 inline-block" />
          <span className="h-2 w-2 rounded-full bg-white/20 inline-block" />
          <span className="ml-1.5 uppercase tracking-widest text-primary-soft">crypto_out.log</span>
        </div>
        <span className={`text-[10px] font-medium ${statusColor}`}>{statusLabel}</span>
      </div>

      <div className="space-y-1.5 text-xs font-mono">
        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-3">
          <span className="text-ink-mute-2 shrink-0 select-none">&gt; HASH:</span>
          <span
            className={`break-all font-medium ${
              valid === false ? "text-accent-tomato" : "text-primary"
            }`}
          >
            {displayHash}
          </span>
        </div>

        {metadata?.author && (
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-3">
            <span className="text-ink-mute-2 shrink-0 select-none">&gt; AUTH:</span>
            <span className="text-on-dark">{metadata.author}</span>
          </div>
        )}

        {metadata?.model_used && (
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-3">
            <span className="text-ink-mute-2 shrink-0 select-none">&gt; MODL:</span>
            <span className="text-on-dark">{metadata.model_used}</span>
          </div>
        )}

        {metadata?.timestamp && (
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-3">
            <span className="text-ink-mute-2 shrink-0 select-none">&gt; TIME:</span>
            <span className="text-ink-faint">{metadata.timestamp}</span>
          </div>
        )}

        {signature && (
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-3 pt-1 border-t border-white/5">
            <span className="text-ink-mute-2 shrink-0 select-none">&gt; SIGN:</span>
            <span className="text-ink-faint break-all text-[11px]">
              {signature.slice(0, 64)}...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
