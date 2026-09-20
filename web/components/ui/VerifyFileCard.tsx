import { CheckCircle2, FileText } from "lucide-react";
import { clsx } from "clsx";

interface VerifyFileCardProps {
  title: string;
  file: File | null;
  placeholder: string;
}

export const VerifyFileCard = ({ title, file, placeholder }: VerifyFileCardProps) => (
  <div
    className={clsx(
      "flex-1 rounded-sm border p-3.5 transition-colors",
      file
        ? "border-primary/40 bg-canvas-soft"
        : "border-hairline bg-canvas"
    )}
  >
    <p className="text-[11px] font-mono font-medium text-ink-mute uppercase tracking-wider mb-1.5">
      {title}
    </p>
    {file ? (
      <div className="flex items-center gap-2 text-ink">
        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
        <span className="truncate text-xs font-mono font-medium">{file.name}</span>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-ink-faint">
        <FileText className="h-4 w-4 text-ink-mute-2 shrink-0" />
        <p className="text-xs">{placeholder}</p>
      </div>
    )}
  </div>
);
