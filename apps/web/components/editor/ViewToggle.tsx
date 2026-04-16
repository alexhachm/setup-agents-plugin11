"use client";

import type { EditorView } from "@plugin11/shared";

type View = EditorView;

interface ViewToggleProps {
  view: View;
  onViewChange: (view: View) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  const views: { id: View; label: string }[] = [
    { id: "notes", label: "Notes" },
    { id: "code", label: "Code" },
    { id: "split", label: "Split" },
    { id: "preview", label: "Preview" },
  ];

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-secondary p-0.5">
      {views.map((v) => (
        <button
          key={v.id}
          onClick={() => onViewChange(v.id)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            view === v.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
