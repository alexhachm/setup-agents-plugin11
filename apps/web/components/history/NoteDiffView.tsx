"use client";

import { useMemo, useState } from "react";
import DiffMatchPatch from "diff-match-patch";

interface NoteDiffViewProps {
  oldContent: string;
  newContent: string;
  oldLabel?: string;
  newLabel?: string;
}

type DiffMode = "inline" | "side-by-side";

export function NoteDiffView({
  oldContent,
  newContent,
  oldLabel = "Previous",
  newLabel = "Current",
}: NoteDiffViewProps) {
  const [mode, setMode] = useState<DiffMode>("inline");

  const diffs = useMemo(() => {
    const dmp = new DiffMatchPatch();
    const result = dmp.diff_main(oldContent, newContent);
    dmp.diff_cleanupSemantic(result);
    return result;
  }, [oldContent, newContent]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const [op, text] of diffs) {
      if (op === 1) added += text.length;
      if (op === -1) removed += text.length;
    }
    return { added, removed };
  }, [diffs]);

  return (
    <div className="flex flex-col gap-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="text-success">+{stats.added} added</span>
          <span className="text-destructive">-{stats.removed} removed</span>
        </div>
        <div className="flex rounded-lg border border-border">
          <button
            onClick={() => setMode("inline")}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              mode === "inline"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Inline
          </button>
          <button
            onClick={() => setMode("side-by-side")}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              mode === "side-by-side"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Side by Side
          </button>
        </div>
      </div>

      {/* Diff content */}
      {mode === "inline" ? (
        <InlineDiff diffs={diffs} />
      ) : (
        <SideBySideDiff
          oldContent={oldContent}
          newContent={newContent}
          oldLabel={oldLabel}
          newLabel={newLabel}
          diffs={diffs}
        />
      )}
    </div>
  );
}

function InlineDiff({ diffs }: { diffs: [number, string][] }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-auto max-h-96">
      <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
        {diffs.map(([op, text], idx) => {
          if (op === 0) {
            return <span key={idx}>{text}</span>;
          }
          if (op === -1) {
            return (
              <span
                key={idx}
                className="bg-destructive/20 text-destructive line-through"
              >
                {text}
              </span>
            );
          }
          // op === 1
          return (
            <span key={idx} className="bg-success/20 text-success">
              {text}
            </span>
          );
        })}
      </pre>
    </div>
  );
}

function SideBySideDiff({
  oldContent,
  newContent,
  oldLabel,
  newLabel,
  diffs,
}: {
  oldContent: string;
  newContent: string;
  oldLabel: string;
  newLabel: string;
  diffs: [number, string][];
}) {
  // Build left (old) and right (new) versions with highlights
  const leftParts: { text: string; type: "unchanged" | "removed" }[] = [];
  const rightParts: { text: string; type: "unchanged" | "added" }[] = [];

  for (const [op, text] of diffs) {
    if (op === 0) {
      leftParts.push({ text, type: "unchanged" });
      rightParts.push({ text, type: "unchanged" });
    } else if (op === -1) {
      leftParts.push({ text, type: "removed" });
    } else {
      rightParts.push({ text, type: "added" });
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col">
        <div className="rounded-t-lg border border-b-0 border-border bg-secondary px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {oldLabel}
          </span>
        </div>
        <div className="rounded-b-lg border border-border bg-card overflow-auto max-h-80">
          <pre className="p-3 text-xs font-mono whitespace-pre-wrap">
            {leftParts.map((part, idx) => (
              <span
                key={idx}
                className={
                  part.type === "removed"
                    ? "bg-destructive/20 text-destructive"
                    : ""
                }
              >
                {part.text}
              </span>
            ))}
          </pre>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="rounded-t-lg border border-b-0 border-border bg-secondary px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {newLabel}
          </span>
        </div>
        <div className="rounded-b-lg border border-border bg-card overflow-auto max-h-80">
          <pre className="p-3 text-xs font-mono whitespace-pre-wrap">
            {rightParts.map((part, idx) => (
              <span
                key={idx}
                className={
                  part.type === "added"
                    ? "bg-success/20 text-success"
                    : ""
                }
              >
                {part.text}
              </span>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}
