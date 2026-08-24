

interface TerminalResultProps {
  content_hash: string;
  metadata?: {
    author?: string;
    model_used?: string;
    timestamp?: string;
  };
  signature?: string;
}

export const TerminalResult = ({ content_hash, metadata, signature }: TerminalResultProps) => (
  <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#0a0e14] p-4 font-mono text-sm shadow-inner-glow relative overflow-hidden group/terminal">
    {/* Terminal Header */}
    <div className="mb-3 flex items-center gap-2 border-b border-white/[0.06] pb-2 text-xs text-surface-500">
      <div className="h-2 w-2 rounded-full bg-red-500/50" />
      <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
      <div className="h-2 w-2 rounded-full bg-green-500/50" />
      <span className="ml-2 font-mono uppercase tracking-widest text-accent-500/50">crypto_out.log</span>
    </div>
    
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
        <span className="text-surface-500 shrink-0 select-none">{">"} HASH:</span>
        <span className="text-accent-300 break-all animate-typing-cursor border-r-2 border-accent-500 pr-1">
          {content_hash}
        </span>
      </div>
      
      {metadata?.author && (
        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
          <span className="text-surface-500 shrink-0 select-none">{">"} AUTH:</span>
          <span className="text-white">{metadata.author}</span>
        </div>
      )}
      
      {metadata?.model_used && (
        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
          <span className="text-surface-500 shrink-0 select-none">{">"} MODL:</span>
          <span className="text-white">{metadata.model_used}</span>
        </div>
      )}

      {signature && (
        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4 pt-2">
          <span className="text-surface-500 shrink-0 select-none">{">"} SIGN:</span>
          <span className="text-surface-300 break-all text-xs">
            {signature.slice(0, 64)}...
          </span>
        </div>
      )}
    </div>
  </div>
);
