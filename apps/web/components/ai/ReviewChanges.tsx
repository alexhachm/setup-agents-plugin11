"use client";

import { useState } from "react";

interface NoteChange {
  noteId: string;
  noteTitle: string;
  changes: {
    type: "added" | "modified" | "removed";
    description: string;
  }[];
}

interface ReviewChangesProps {
  notebookTitle: string;
  changes: NoteChange[];
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onAcceptNote: (noteId: string) => void;
  onRejectNote: (noteId: string) => void;
}

/**
 * ReviewChanges — multi-note review with synchronized scrolling.
 * Shows all changes made by the AI across multiple notes for review.
 */
export function ReviewChanges({
  notebookTitle,
  changes,
  onAcceptAll,
  onRejectAll,
  onAcceptNote,
  onRejectNote,
}: ReviewChangesProps) {
  const [selectedNote, setSelectedNote] = useState<string | null>(
    changes[0]?.noteId || null
  );

  const selectedChange = changes.find((c) => c.noteId === selectedNote);

  return (
    <div className="flex h-full flex-col border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold">
          Review: {notebookTitle} changes ({changes.length} notes)
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onAcceptAll}
            className="rounded-md bg-success/10 px-3 py-1 text-xs font-medium text-success hover:bg-success/20"
          >
            Accept all
          </button>
          <button
            onClick={onRejectAll}
            className="rounded-md bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/20"
          >
            Reject all
          </button>
        </div>
      </div>

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Change list */}
        <div className="w-64 overflow-auto border-r border-border">
          {changes.map((change) => (
            <button
              key={change.noteId}
              onClick={() => setSelectedNote(change.noteId)}
              className={`flex w-full flex-col gap-1 border-b border-border px-3 py-2 text-left text-xs transition-colors ${
                selectedNote === change.noteId
                  ? "bg-primary/10"
                  : "hover:bg-accent"
              }`}
            >
              <span className="font-medium">{change.noteTitle}</span>
              {change.changes.map((c, i) => (
                <span key={i} className="text-muted-foreground">
                  {c.type === "added" ? "+" : c.type === "modified" ? "~" : "-"}{" "}
                  {c.description}
                </span>
              ))}
            </button>
          ))}
        </div>

        {/* Right: Note viewer */}
        <div className="flex-1 overflow-auto p-4">
          {selectedChange ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium">{selectedChange.noteTitle}</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAcceptNote(selectedChange.noteId)}
                    className="rounded-md bg-success/10 px-2 py-1 text-xs text-success hover:bg-success/20"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onRejectNote(selectedChange.noteId)}
                    className="rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive hover:bg-destructive/20"
                  >
                    Reject
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {selectedChange.changes.map((c, i) => (
                  <div
                    key={i}
                    className={`rounded px-3 py-2 text-sm ${
                      c.type === "added"
                        ? "border-l-2 border-success bg-success/5"
                        : c.type === "modified"
                          ? "border-l-2 border-warning bg-warning/5"
                          : "border-l-2 border-destructive bg-destructive/5 line-through"
                    }`}
                  >
                    {c.description}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select a note to review changes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
