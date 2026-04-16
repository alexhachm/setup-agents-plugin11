"use client";

interface DependentNote {
  id: string;
  title: string;
}

interface DeleteConfirmationProps {
  itemTitle: string;
  itemType: "note" | "notebook";
  hasImplementedCode: boolean;
  dependentNotes: DependentNote[];
  onCancel: () => void;
  onDelete: () => void;
  onEditInstead: () => void;
  onPlanWithAgent: () => void;
}

export function DeleteConfirmation({
  itemTitle,
  itemType,
  hasImplementedCode,
  dependentNotes,
  onCancel,
  onDelete,
  onEditInstead,
  onPlanWithAgent,
}: DeleteConfirmationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <svg className="h-5 w-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold">Confirm deletion</h3>
            <p className="text-xs text-muted-foreground">
              &ldquo;{itemTitle}&rdquo; {itemType}
            </p>
          </div>
        </div>

        {/* Warnings */}
        <div className="mb-4 space-y-2">
          {hasImplementedCode && (
            <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs">
              <div className="mb-1 flex items-center gap-1.5 font-semibold text-warning">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Has implemented code
              </div>
              <p className="text-muted-foreground">
                Deleting this {itemType} will mark the corresponding code for removal.
              </p>
            </div>
          )}

          {dependentNotes.length > 0 && (
            <div className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs">
              <div className="mb-1 font-semibold">
                Referenced by {dependentNotes.length} note{dependentNotes.length > 1 ? "s" : ""}:
              </div>
              <div className="flex flex-wrap gap-1">
                {dependentNotes.map((note) => (
                  <span key={note.id} className="note-reference text-[10px]">
                    {note.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={onEditInstead}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10"
          >
            Edit instead
          </button>
          {(hasImplementedCode || dependentNotes.length > 0) && (
            <button
              onClick={onPlanWithAgent}
              className="flex-1 rounded-lg bg-primary/15 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/25"
            >
              Plan with agent
            </button>
          )}
          <button
            onClick={onDelete}
            className="flex-1 rounded-lg bg-destructive px-3 py-2 text-xs font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
