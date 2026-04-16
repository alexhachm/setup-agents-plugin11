"use client";

type HistoryView = "note" | "code";

interface CodeHistoryToggleProps {
  active: HistoryView;
  onChange: (view: HistoryView) => void;
}

export function CodeHistoryToggle({ active, onChange }: CodeHistoryToggleProps) {
  return (
    <div className="flex rounded-lg border border-border">
      <button
        onClick={() => onChange("note")}
        className={`px-3 py-1 text-xs font-medium transition-colors ${
          active === "note"
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Note History
      </button>
      <button
        onClick={() => onChange("code")}
        className={`px-3 py-1 text-xs font-medium transition-colors ${
          active === "code"
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Code History
      </button>
    </div>
  );
}
