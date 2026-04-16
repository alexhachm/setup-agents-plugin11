"use client";

interface AffectedItem {
  id: string;
  title: string;
  changeDescription: string;
}

interface UndoConfirmationProps {
  targetTitle: string;
  snapshotDescription: string;
  affectedItems: AffectedItem[];
  onCancel: () => void;
  onUndo: () => void;
  onPlanWithAgent: () => void;
}

export function UndoConfirmation({
  targetTitle,
  snapshotDescription,
  affectedItems,
  onCancel,
  onUndo,
  onPlanWithAgent,
}: UndoConfirmationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
            <svg className="h-5 w-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold">Undo changes</h3>
            <p className="text-xs text-muted-foreground">
              Revert &ldquo;{targetTitle}&rdquo; to: {snapshotDescription}
            </p>
          </div>
        </div>

        {/* Dependency warnings */}
        {affectedItems.length > 0 && (
          <div className="mb-4 rounded-lg border border-border bg-secondary/50 p-3">
            <div className="mb-2 text-xs font-semibold">
              This may affect {affectedItems.length} related item{affectedItems.length > 1 ? "s" : ""}:
            </div>
            <div className="space-y-1.5">
              {affectedItems.map((item) => (
                <div key={item.id} className="flex items-start gap-2 text-xs">
                  <svg className="mt-0.5 h-3 w-3 shrink-0 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <span className="font-medium">{item.title}</span>
                    <span className="text-muted-foreground"> — {item.changeDescription}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={onPlanWithAgent}
            className="flex-1 rounded-lg bg-primary/15 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/25"
          >
            Plan with agent
          </button>
          <button
            onClick={onUndo}
            className="flex-1 rounded-lg bg-warning/15 px-3 py-2 text-xs font-medium text-warning hover:bg-warning/25"
          >
            Undo
          </button>
        </div>
      </div>
    </div>
  );
}
