"use client";

import type { SnapshotTrigger } from "@plugin11/shared";

export interface NoteHistoryItem {
  id: string;
  noteId: string;
  trigger: SnapshotTrigger;
  description: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
}

interface NoteHistoryEntryProps {
  item: NoteHistoryItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRestore: (id: string) => void;
}

function getTriggerIcon(trigger: SnapshotTrigger): string {
  switch (trigger) {
    case "manual":
      return "\u{1F4BE}";
    case "auto":
      return "\u{1F504}";
    case "ai_change":
      return "\u{1F916}";
    case "timer":
      return "\u23F0";
    default:
      return "\u{1F504}";
  }
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NoteHistoryEntry({
  item,
  isSelected,
  onSelect,
  onRestore,
}: NoteHistoryEntryProps) {
  return (
    <div
      className={`group flex items-start gap-3 border-b border-border/50 px-3 py-3 cursor-pointer transition-colors ${
        isSelected ? "bg-accent/50" : "hover:bg-accent/30"
      }`}
      onClick={() => onSelect(item.id)}
    >
      {/* Timeline dot */}
      <div className="relative mt-1 flex flex-col items-center">
        <span className="text-sm">{getTriggerIcon(item.trigger)}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatTime(item.createdAt)}
          </span>
          <span className="text-xs font-medium">
            {item.createdByName}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-foreground truncate">
          {item.description}
        </p>
      </div>

      {/* Actions */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRestore(item.id);
        }}
        className="shrink-0 rounded px-2 py-1 text-xs font-medium text-primary opacity-0 transition-opacity hover:bg-primary/10 group-hover:opacity-100"
      >
        Restore
      </button>
    </div>
  );
}
