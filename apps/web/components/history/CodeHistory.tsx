"use client";

import { useState } from "react";

export interface CodeHistoryEntry {
  id: string;
  gitCommitHash: string | null;
  triggeredBy: string;
  triggeredByName: string;
  description: string;
  createdAt: Date;
  fileSnapshots: {
    filePath: string;
    changeType: "added" | "modified" | "deleted";
  }[];
  linkedNoteId: string | null;
  linkedNoteTitle: string | null;
}

interface CodeHistoryProps {
  entries: CodeHistoryEntry[];
  onViewDiff: (entryId: string) => void;
  onRestore: (entryId: string) => void;
}

export function CodeHistory({
  entries,
  onViewDiff,
  onRestore,
}: CodeHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
        <div>
          <p>No code history yet.</p>
          <p className="mt-1 text-xs">
            Code changes will appear here when the AI engine generates or
            modifies code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Code History
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Git-style code changes linked to notes
        </p>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-auto">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="border-b border-border/50"
          >
            <button
              className="flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-accent/30 transition-colors"
              onClick={() =>
                setExpandedId(
                  expandedId === entry.id ? null : entry.id
                )
              }
            >
              {/* Commit icon */}
              <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-xs font-medium">
                    {entry.triggeredByName}
                  </span>
                </div>
                <p className="mt-0.5 text-sm">{entry.description}</p>
                {entry.gitCommitHash && (
                  <span className="mt-1 inline-block rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {entry.gitCommitHash.slice(0, 7)}
                  </span>
                )}
                {entry.linkedNoteTitle && (
                  <span className="mt-1 ml-2 inline-block text-xs text-primary">
                    {"\u{1F517}"} {entry.linkedNoteTitle}
                  </span>
                )}
              </div>

              <svg
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                  expandedId === entry.id ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Expanded file list */}
            {expandedId === entry.id && (
              <div className="border-t border-border/50 bg-background/50 px-3 py-2">
                <div className="space-y-1">
                  {entry.fileSnapshots.map((file) => (
                    <div
                      key={file.filePath}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className={`font-medium ${
                          file.changeType === "added"
                            ? "text-success"
                            : file.changeType === "deleted"
                              ? "text-destructive"
                              : "text-warning"
                        }`}
                      >
                        {file.changeType === "added"
                          ? "+"
                          : file.changeType === "deleted"
                            ? "-"
                            : "~"}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {file.filePath}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => onViewDiff(entry.id)}
                    className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    View Diff
                  </button>
                  <button
                    onClick={() => onRestore(entry.id)}
                    className="rounded px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                  >
                    Restore
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
