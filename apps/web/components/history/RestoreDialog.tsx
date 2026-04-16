"use client";

import type { NoteHistoryItem } from "./NoteHistoryEntry";

interface RestoreDialogProps {
  snapshot: NoteHistoryItem;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RestoreDialog({
  snapshot,
  onConfirm,
  onCancel,
}: RestoreDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        <h3 className="text-lg font-semibold">Restore to this version?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          This will restore the note to the version from{" "}
          <strong>
            {new Date(snapshot.createdAt).toLocaleString()}
          </strong>
          .
        </p>
        <div className="mt-3 rounded-lg border border-border bg-secondary/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            {snapshot.description}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            By {snapshot.createdByName}
          </p>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          A snapshot of the current version will be saved automatically before
          restoring.
        </p>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  );
}
