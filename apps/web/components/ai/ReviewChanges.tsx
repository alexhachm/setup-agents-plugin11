"use client";

import { useState, useCallback } from "react";
import { ReviewChangeItem, type ReviewChangeItemData, type ChangeStatus } from "./ReviewChangeItem";
import { SyncedNoteViewer } from "./SyncedNoteViewer";
import { cn } from "@/lib/utils";

interface NoteContent {
  noteId: string;
  noteTitle: string;
  sections: {
    id: string;
    type: "text" | "bot-text" | "heading";
    content: string;
  }[];
}

interface ReviewChangesProps {
  notebookTitle: string;
  changes: ReviewChangeItemData[];
  noteContents: NoteContent[];
  onAcceptAll: () => void;
  onDismissAll: () => void;
  onAcceptNote: (noteId: string) => void;
  onDismissNote: (noteId: string) => void;
  onClose?: () => void;
}

export function ReviewChanges({
  notebookTitle,
  changes: initialChanges,
  noteContents,
  onAcceptAll,
  onDismissAll,
  onAcceptNote,
  onDismissNote,
  onClose,
}: ReviewChangesProps) {
  const [changes, setChanges] = useState<ReviewChangeItemData[]>(initialChanges);
  const [selectedNoteId, setSelectedNoteId] = useState<string>(
    initialChanges[0]?.noteId ?? ""
  );
  const [highlightedSectionId, setHighlightedSectionId] = useState<string | undefined>();

  const selectedContent = noteContents.find((nc) => nc.noteId === selectedNoteId);
  const pendingCount = changes.filter((c) => c.status === "pending").length;
  const acceptedCount = changes.filter((c) => c.status === "accepted").length;
  const dismissedCount = changes.filter((c) => c.status === "dismissed").length;

  const handleAccept = useCallback(
    (noteId: string) => {
      setChanges((prev) =>
        prev.map((c) =>
          c.noteId === noteId ? { ...c, status: "accepted" as ChangeStatus } : c
        )
      );
      onAcceptNote(noteId);
    },
    [onAcceptNote]
  );

  const handleDismiss = useCallback(
    (noteId: string) => {
      setChanges((prev) =>
        prev.map((c) =>
          c.noteId === noteId ? { ...c, status: "dismissed" as ChangeStatus } : c
        )
      );
      onDismissNote(noteId);
    },
    [onDismissNote]
  );

  const handleAcceptAll = () => {
    setChanges((prev) => prev.map((c) => ({ ...c, status: "accepted" as ChangeStatus })));
    onAcceptAll();
  };

  const handleDismissAll = () => {
    setChanges((prev) => prev.map((c) => ({ ...c, status: "dismissed" as ChangeStatus })));
    onDismissAll();
  };

  const handleSelect = (noteId: string) => {
    setSelectedNoteId(noteId);
    // Highlight the first bot-text section in the note
    const content = noteContents.find((nc) => nc.noteId === noteId);
    const firstBotText = content?.sections.find((s) => s.type === "bot-text");
    setHighlightedSectionId(firstBotText?.id);
  };

  const handleSectionVisible = (sectionId: string) => {
    // Find which note this section belongs to and sync the change list
    for (const nc of noteContents) {
      const found = nc.sections.find((s) => s.id === sectionId && s.type === "bot-text");
      if (found && nc.noteId !== selectedNoteId) {
        setSelectedNoteId(nc.noteId);
        break;
      }
    }
  };

  return (
    <div className="flex h-full flex-col border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold">
            Review: {notebookTitle}
          </h3>
          <div className="flex gap-2 text-[10px]">
            <span className="rounded-full bg-muted px-2 py-0.5">
              {pendingCount} pending
            </span>
            {acceptedCount > 0 && (
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-success">
                {acceptedCount} accepted
              </span>
            )}
            {dismissedCount > 0 && (
              <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-destructive">
                {dismissedCount} dismissed
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAcceptAll}
            disabled={pendingCount === 0}
            className="rounded-md bg-success/10 px-3 py-1 text-xs font-medium text-success hover:bg-success/20 disabled:opacity-50"
          >
            Accept All
          </button>
          <button
            onClick={handleDismissAll}
            disabled={pendingCount === 0}
            className="rounded-md bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 disabled:opacity-50"
          >
            Dismiss All
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Change list */}
        <div className="w-72 shrink-0 overflow-auto border-r border-border">
          {changes.map((change) => (
            <ReviewChangeItem
              key={change.noteId}
              item={change}
              selected={selectedNoteId === change.noteId}
              onSelect={() => handleSelect(change.noteId)}
              onAccept={() => handleAccept(change.noteId)}
              onDismiss={() => handleDismiss(change.noteId)}
            />
          ))}
        </div>

        {/* Right panel: Note viewer */}
        <div className="flex-1 overflow-hidden">
          {selectedContent ? (
            <SyncedNoteViewer
              noteTitle={selectedContent.noteTitle}
              sections={selectedContent.sections}
              highlightedSectionId={highlightedSectionId}
              onSectionVisible={handleSectionVisible}
            />
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
