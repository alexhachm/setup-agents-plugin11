"use client";

import { cn } from "@/lib/utils";

export type ChangeStatus = "pending" | "accepted" | "dismissed";

export interface ReviewChangeItemData {
  noteId: string;
  noteTitle: string;
  notebookName: string;
  summary: string;
  botTextPreview: string;
  changeType: "added" | "modified" | "removed";
  status: ChangeStatus;
}

interface ReviewChangeItemProps {
  item: ReviewChangeItemData;
  selected: boolean;
  onSelect: () => void;
  onAccept: () => void;
  onDismiss: () => void;
}

const CHANGE_TYPE_ICON: Record<string, { symbol: string; color: string }> = {
  added: { symbol: "+", color: "text-success" },
  modified: { symbol: "~", color: "text-warning" },
  removed: { symbol: "-", color: "text-destructive" },
};

const STATUS_INDICATORS: Record<ChangeStatus, { label: string; style: string }> = {
  pending: { label: "Pending", style: "bg-muted text-muted-foreground" },
  accepted: { label: "Accepted", style: "bg-success/15 text-success" },
  dismissed: { label: "Dismissed", style: "bg-destructive/15 text-destructive" },
};

export function ReviewChangeItem({
  item,
  selected,
  onSelect,
  onAccept,
  onDismiss,
}: ReviewChangeItemProps) {
  const changeIcon = CHANGE_TYPE_ICON[item.changeType];
  const statusInfo = STATUS_INDICATORS[item.status];

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group flex w-full flex-col gap-1.5 border-b border-border px-3 py-2.5 text-left transition-colors",
        selected ? "bg-primary/10" : "hover:bg-accent",
        item.status === "accepted" && "opacity-60",
        item.status === "dismissed" && "opacity-40"
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2">
        <span className={cn("font-mono text-sm font-bold", changeIcon.color)}>
          {changeIcon.symbol}
        </span>
        <span className="flex-1 truncate text-xs font-medium">{item.noteTitle}</span>
        <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", statusInfo.style)}>
          {statusInfo.label}
        </span>
      </div>

      {/* Notebook name */}
      <span className="text-[10px] text-muted-foreground">{item.notebookName}</span>

      {/* Summary */}
      <span className="text-xs text-muted-foreground">{item.summary}</span>

      {/* Bot text preview */}
      <div className="mt-0.5 truncate rounded border-l-2 border-primary bg-bot-text-bg px-2 py-1 text-[10px] text-foreground/70">
        {item.botTextPreview}
      </div>

      {/* Actions (visible on hover for pending items) */}
      {item.status === "pending" && (
        <div className="flex gap-1.5 pt-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAccept();
            }}
            className="rounded bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success hover:bg-success/20"
          >
            Accept
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive hover:bg-destructive/20"
          >
            Dismiss
          </button>
        </div>
      )}
    </button>
  );
}
