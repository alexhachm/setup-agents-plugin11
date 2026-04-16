"use client";

import { useState } from "react";

export interface GeneratedNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  crossReferences: string[];
}

export interface GeneratedNotebook {
  id: string;
  title: string;
  icon: string;
  notes: GeneratedNote[];
}

interface GuidedWalkthroughProps {
  notebooks: GeneratedNotebook[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function GuidedWalkthrough({
  notebooks,
  onConfirm,
  onCancel,
}: GuidedWalkthroughProps) {
  const [expandedNotebook, setExpandedNotebook] = useState<string | null>(
    notebooks[0]?.id ?? null
  );

  const totalNotes = notebooks.reduce((sum, nb) => sum + nb.notes.length, 0);
  const notesWithQuestions = notebooks.flatMap((nb) =>
    nb.notes.filter((n) => n.tags.includes("?open-question"))
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Summary header */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-lg font-semibold">Import Summary</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Generated {notebooks.length} notebook{notebooks.length !== 1 ? "s" : ""} with{" "}
          {totalNotes} note{totalNotes !== 1 ? "s" : ""}.
          {notesWithQuestions.length > 0 && (
            <span className="text-warning">
              {" "}
              {notesWithQuestions.length} item
              {notesWithQuestions.length !== 1 ? "s" : ""} need review.
            </span>
          )}
        </p>
      </div>

      {/* Notebook list */}
      <div className="flex flex-col gap-3">
        {notebooks.map((notebook) => (
          <div
            key={notebook.id}
            className="rounded-lg border border-border overflow-hidden"
          >
            {/* Notebook header */}
            <button
              onClick={() =>
                setExpandedNotebook(
                  expandedNotebook === notebook.id ? null : notebook.id
                )
              }
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors"
            >
              <span className="text-xl">{notebook.icon}</span>
              <div className="flex-1">
                <span className="text-sm font-medium">{notebook.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {notebook.notes.length} note
                  {notebook.notes.length !== 1 ? "s" : ""}
                </span>
              </div>
              <svg
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedNotebook === notebook.id ? "rotate-180" : ""
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

            {/* Notes list */}
            {expandedNotebook === notebook.id && (
              <div className="border-t border-border bg-background/50">
                {notebook.notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center gap-3 border-b border-border/50 px-6 py-2.5 last:border-b-0"
                  >
                    <span className="text-xs text-muted-foreground">
                      {"\u{1F4DD}"}
                    </span>
                    <span className="flex-1 text-sm">{note.title}</span>
                    {note.tags.includes("?open-question") && (
                      <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs text-warning">
                        Needs review
                      </span>
                    )}
                    {note.crossReferences.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {note.crossReferences.length} ref
                        {note.crossReferences.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Not sure about section */}
      {notesWithQuestions.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <h4 className="text-sm font-medium text-warning">
            Not sure about ({notesWithQuestions.length})
          </h4>
          <ul className="mt-2 space-y-1">
            {notesWithQuestions.map((note) => (
              <li key={note.id} className="text-xs text-muted-foreground">
                {"\u2022"} {note.title}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            You can rename or reorganize these after creation.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
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
          Looks good — create notebooks
        </button>
      </div>
    </div>
  );
}
