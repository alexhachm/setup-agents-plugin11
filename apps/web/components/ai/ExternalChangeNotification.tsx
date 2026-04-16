"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ExternalChange } from "@/lib/external-change-detector";

interface ExternalChangeNotificationProps {
  changes: ExternalChange[];
  affectedNotes?: { noteId: string; noteTitle: string }[];
  onRescan: () => void;
  onIgnore: () => void;
  onViewChanges: () => void;
}

const CHANGE_TYPE_ICONS: Record<ExternalChange["type"], { icon: string; color: string }> = {
  file_modified: { icon: "~", color: "text-warning" },
  file_added: { icon: "+", color: "text-success" },
  file_deleted: { icon: "-", color: "text-destructive" },
  branch_switch: { icon: "B", color: "text-primary" },
  git_pull: { icon: "P", color: "text-blue-400" },
};

export function ExternalChangeNotification({
  changes,
  affectedNotes = [],
  onRescan,
  onIgnore,
  onViewChanges,
}: ExternalChangeNotificationProps) {
  const [rescanning, setRescanning] = useState(false);
  const [rescanResult, setRescanResult] = useState<{ noteId: string; noteTitle: string }[] | null>(null);

  const handleRescan = async () => {
    setRescanning(true);
    onRescan();
    // Simulate rescan delay
    setTimeout(() => {
      setRescanning(false);
      setRescanResult(affectedNotes);
    }, 2000);
  };

  const modified = changes.filter((c) => c.type === "file_modified").length;
  const added = changes.filter((c) => c.type === "file_added").length;
  const deleted = changes.filter((c) => c.type === "file_deleted").length;

  return (
    <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="text-xs font-semibold text-blue-400">External Changes Detected</span>
      </div>

      {/* Summary */}
      <div className="mb-2 flex gap-3 text-xs text-muted-foreground">
        {modified > 0 && <span className="text-warning">{modified} modified</span>}
        {added > 0 && <span className="text-success">{added} new</span>}
        {deleted > 0 && <span className="text-destructive">{deleted} deleted</span>}
      </div>

      {/* Change list */}
      <div className="mb-3 max-h-24 space-y-0.5 overflow-auto">
        {changes.map((change) => {
          const typeInfo = CHANGE_TYPE_ICONS[change.type];
          return (
            <div key={change.id} className="flex items-center gap-2 text-xs">
              <span className={cn("font-mono font-bold", typeInfo.color)}>
                {typeInfo.icon}
              </span>
              <span className="truncate text-muted-foreground">
                {change.filePath || change.description}
              </span>
            </div>
          );
        })}
      </div>

      {/* Rescan result */}
      {rescanResult && (
        <div className="mb-3 rounded border border-border bg-card p-2">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">
            Affected Notes:
          </span>
          <div className="mt-1 flex flex-wrap gap-1">
            {rescanResult.map((note) => (
              <span key={note.noteId} className="note-reference text-[10px]">
                {note.noteTitle}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleRescan}
          disabled={rescanning}
          className="flex-1 rounded bg-primary/15 px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/25 disabled:opacity-50"
        >
          {rescanning ? "Re-scanning..." : "Re-scan and update notes"}
        </button>
        <button
          onClick={onViewChanges}
          className="rounded border border-border px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent"
        >
          View
        </button>
        <button
          onClick={onIgnore}
          className="rounded px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent"
        >
          Ignore
        </button>
      </div>
    </div>
  );
}
