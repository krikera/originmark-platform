import { CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

interface VerifyFileCardProps {
  title: string;
  file: File | null;
  placeholder: string;
}

export const VerifyFileCard = ({ title, file, placeholder }: VerifyFileCardProps) => (
  <div className={clsx(
    "flex-1 rounded-xl border p-4 transition-colors",
    file ? "border-accent-500/30 bg-accent-500/5" : "border-surface-700 bg-surface-900/50"
  )}>
    <p className="text-xs font-semibold text-surface-400 mb-1">{title}</p>
    {file ? (
      <div className="flex items-center gap-2 text-white">
        <CheckCircle2 className="h-4 w-4 text-accent-500" />
        <span className="truncate text-sm">{file.name}</span>
      </div>
    ) : (
      <p className="text-sm text-surface-500">{placeholder}</p>
    )}
  </div>
);
