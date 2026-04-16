"use client";

import type { GranularityLevel, EditorView } from "@plugin11/shared";
import { GRANULARITY_LABELS } from "@plugin11/shared";

interface StatusBarProps {
  granularity: GranularityLevel;
  onGranularityChange: (level: GranularityLevel) => void;
  view: EditorView;
  onViewChange: (view: EditorView) => void;
}

const granularityLevels: GranularityLevel[] = ["beginner", "intermediate", "advanced"];

export function StatusBar({
  granularity,
  onGranularityChange,
  view,
  onViewChange,
}: StatusBarProps) {
  return (
    <footer className="flex h-7 items-center justify-between border-t border-border bg-card px-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        {/* AI connection status */}
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <span>AI: Connected</span>
        </div>

        {/* Granularity toggle */}
        <div className="flex items-center gap-1">
          <span className="mr-1">Granularity:</span>
          {granularityLevels.map((level) => (
            <button
              key={level}
              onClick={() => onGranularityChange(level)}
              className={`rounded px-1.5 py-0.5 transition-colors ${
                granularity === level
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-accent hover:text-foreground"
              }`}
            >
              {GRANULARITY_LABELS[level]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* View toggle */}
        <ViewToggle view={view} onViewChange={onViewChange} />

        {/* Save status */}
        <span>Saved</span>
      </div>
    </footer>
  );
}

function ViewToggle({
  view,
  onViewChange,
}: {
  view: EditorView;
  onViewChange: (view: EditorView) => void;
}) {
  const views: { id: EditorView; label: string }[] = [
    { id: "notes", label: "Notes" },
    { id: "code", label: "Code" },
    { id: "split", label: "Split" },
    { id: "preview", label: "Preview" },
  ];

  return (
    <div className="flex items-center gap-0.5 rounded bg-secondary p-0.5">
      {views.map((v) => (
        <button
          key={v.id}
          onClick={() => onViewChange(v.id)}
          className={`rounded px-2 py-0.5 text-xs transition-colors ${
            view === v.id
              ? "bg-background text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
