"use client";

import { cn } from "@/lib/utils";

export type FlagType = "warning" | "error" | "info" | "drift";

interface FlagTagProps {
  id: string;
  type: FlagType;
  text: string;
  noteId?: string;
  noteTitle?: string;
  onNavigate?: (noteId: string) => void;
  onDismiss?: (id: string) => void;
}

const FLAG_STYLES: Record<FlagType, { bg: string; border: string; icon: string; label: string }> = {
  warning: {
    bg: "bg-warning/5",
    border: "border-l-warning",
    icon: "text-warning",
    label: "Warning",
  },
  error: {
    bg: "bg-destructive/5",
    border: "border-l-destructive",
    icon: "text-destructive",
    label: "Error",
  },
  info: {
    bg: "bg-primary/5",
    border: "border-l-primary",
    icon: "text-primary",
    label: "Info",
  },
  drift: {
    bg: "bg-blue-500/5",
    border: "border-l-blue-500",
    icon: "text-blue-400",
    label: "Drift",
  },
};

const FLAG_ICONS: Record<FlagType, React.ReactNode> = {
  warning: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  error: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  drift: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
};

export function FlagTag({
  id,
  type,
  text,
  noteId,
  noteTitle,
  onNavigate,
  onDismiss,
}: FlagTagProps) {
  const style = FLAG_STYLES[type];

  return (
    <div
      className={cn(
        "group flex items-start gap-2 rounded border-l-2 px-3 py-2 text-xs transition-colors",
        style.bg,
        style.border
      )}
    >
      <span className={cn("mt-0.5 shrink-0", style.icon)}>
        {FLAG_ICONS[type]}
      </span>

      <div className="flex-1">
        <span className="font-medium">{text}</span>
        {noteId && noteTitle && (
          <button
            onClick={() => onNavigate?.(noteId)}
            className="ml-1.5 note-reference text-[10px]"
          >
            {noteTitle}
          </button>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={() => onDismiss(id)}
          className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
