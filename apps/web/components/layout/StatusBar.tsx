"use client";

import type { GranularityLevel, EditorView } from "@plugin11/shared";
import { GranularitySelector } from "./GranularitySelector";

interface StatusBarProps {
  granularity: GranularityLevel;
  onGranularityChange: (level: GranularityLevel) => void;
  view: EditorView;
  onViewChange: (view: EditorView) => void;
}

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

        {/* Granularity selector */}
        <GranularitySelector
          value={granularity}
          onChange={onGranularityChange}
        />
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
