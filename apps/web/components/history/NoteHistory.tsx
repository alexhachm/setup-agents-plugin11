"use client";

import { useState, useMemo, useCallback } from "react";
import { NoteHistoryEntry, type NoteHistoryItem } from "./NoteHistoryEntry";
import { NoteDiffView } from "./NoteDiffView";
import { RestoreDialog } from "./RestoreDialog";

interface NoteHistoryProps {
  noteId: string;
  snapshots: NoteHistoryItem[];
  onRestore: (snapshotId: string) => Promise<void>;
  getSnapshotContent: (snapshotId: string) => Promise<string>;
  currentContent: string;
}

function groupByDay(items: NoteHistoryItem[]): Map<string, NoteHistoryItem[]> {
  const groups = new Map<string, NoteHistoryItem[]>();
  for (const item of items) {
    const key = new Date(item.createdAt).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }
  return groups;
}

export function NoteHistory({
  noteId,
  snapshots,
  onRestore,
  getSnapshotContent,
  currentContent,
}: NoteHistoryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<NoteHistoryItem | null>(
    null
  );
  const [diffContent, setDiffContent] = useState<{
    old: string;
    new: string;
  } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const grouped = useMemo(() => groupByDay(snapshots), [snapshots]);

  const handleSelect = useCallback(
    async (id: string) => {
      setSelectedId(id);

      // Load diff content
      try {
        const snapshotContent = await getSnapshotContent(id);
        setDiffContent({
          old: snapshotContent,
          new: currentContent,
        });
      } catch {
        setDiffContent(null);
      }
    },
    [getSnapshotContent, currentContent]
  );

  const handleRestore = useCallback(
    async () => {
      if (!restoreTarget) return;
      setIsRestoring(true);
      try {
        await onRestore(restoreTarget.id);
      } finally {
        setIsRestoring(false);
        setRestoreTarget(null);
      }
    },
    [restoreTarget, onRestore]
  );

  if (snapshots.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
        No history yet. Changes will appear here as you edit.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Note History
        </h3>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        {Array.from(grouped.entries()).map(([day, items]) => (
          <div key={day}>
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/50 px-3 py-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {day}
              </span>
            </div>
            {items.map((item) => (
              <NoteHistoryEntry
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                onSelect={handleSelect}
                onRestore={(id) => {
                  const target = snapshots.find((s) => s.id === id);
                  if (target) setRestoreTarget(target);
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Diff preview */}
      {diffContent && (
        <div className="border-t border-border p-3">
          <NoteDiffView
            oldContent={diffContent.old}
            newContent={diffContent.new}
            oldLabel="Selected version"
            newLabel="Current"
          />
        </div>
      )}

      {/* Restore dialog */}
      {restoreTarget && (
        <RestoreDialog
          snapshot={restoreTarget}
          onConfirm={handleRestore}
          onCancel={() => setRestoreTarget(null)}
        />
      )}
    </div>
  );
}
