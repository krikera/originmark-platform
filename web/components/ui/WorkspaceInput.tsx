import { LucideIcon } from "lucide-react";

interface WorkspaceInputProps {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  id?: string;
}

export const WorkspaceInput = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  id,
}: WorkspaceInputProps) => {
  const inputId = id || `input-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

  return (
    <div className="relative">
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-input pl-10"
          placeholder={placeholder}
        />
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mute pointer-events-none" />
      </div>
    </div>
  );
};
