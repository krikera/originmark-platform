"use client";

import { useRef, useState, DragEvent, ChangeEvent, MouseEvent } from "react";
import { CheckCircle2, FileText, X, Upload } from "lucide-react";
import { clsx } from "clsx";

interface VerifyFileCardProps {
  title: string;
  file: File | null;
  placeholder: string;
  accept?: string;
  onFileSelect?: (file: File) => void;
  onRemove?: () => void;
}

export const VerifyFileCard = ({
  title,
  file,
  placeholder,
  accept,
  onFileSelect,
  onRemove,
}: VerifyFileCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClick = () => {
    if (onFileSelect) {
      inputRef.current?.click();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && onFileSelect) {
      onFileSelect(selectedFile);
    }
    // Reset input value so re-selecting the same file name triggers onChange
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!onFileSelect) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!onFileSelect) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    if (!onFileSelect) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const handleRemoveClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        "group relative flex-1 rounded-sm border p-3.5 transition-all duration-150",
        onFileSelect && "cursor-pointer hover:border-ink-secondary",
        isDragOver
          ? "border-primary bg-primary/5 shadow-level-1 ring-1 ring-primary"
          : file
            ? "border-primary/40 bg-canvas-soft"
            : "border-hairline bg-canvas hover:bg-canvas-soft/40"
      )}
    >
      {onFileSelect && (
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-[11px] font-mono font-medium text-ink-mute uppercase tracking-wider">
          {title}
        </p>
        {onFileSelect && (
          <span className="text-[10px] font-mono text-ink-faint group-hover:text-ink-mute transition-colors">
            {file ? "Click to change" : "Click to browse"}
          </span>
        )}
      </div>

      {file ? (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 text-ink">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate text-xs font-mono font-medium" title={file.name}>
              {file.name}
            </span>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={handleRemoveClick}
              title="Remove file"
              aria-label={`Remove ${file.name}`}
              className="rounded-xs p-1 text-ink-mute hover:text-accent-tomato hover:bg-accent-tomato/10 transition-colors shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-ink-faint">
          <FileText className="h-4 w-4 text-ink-mute-2 shrink-0 group-hover:text-ink-mute transition-colors" />
          <p className="truncate text-xs">{placeholder}</p>
        </div>
      )}
    </div>
  );
};
