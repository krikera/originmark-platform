import { LucideIcon } from "lucide-react";

interface WorkspaceInputProps {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const WorkspaceInput = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
}: WorkspaceInputProps) => (
  <div className="relative">
    <label className="mb-2 block text-sm font-medium text-surface-300">
      {label}
    </label>
    <div className="relative group">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/[0.06] bg-surface-950/50 px-4 py-3 pl-10 text-white placeholder-surface-500 backdrop-blur-xl shadow-inner-glow transition-all focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/50 group-hover:bg-surface-900/50"
        placeholder={placeholder}
      />
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500 transition-colors group-focus-within:text-accent-500" />
    </div>
  </div>
);
