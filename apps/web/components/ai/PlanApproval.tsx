"use client";

interface PlanStep {
  id: string;
  description: string;
  affectedNotes: string[];
  complexity: "simple" | "medium" | "complex";
}

interface PlanApprovalProps {
  title: string;
  steps: PlanStep[];
  estimatedMinutes: number;
  onApprove: () => void;
  onReject: () => void;
  onModify: () => void;
}

/**
 * PlanApproval — plan review + approve/reject component.
 * Shows the AI's implementation plan with time estimate before executing.
 */
export function PlanApproval({
  title,
  steps,
  estimatedMinutes,
  onApprove,
  onReject,
  onModify,
}: PlanApprovalProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        ~{estimatedMinutes} min &middot; {steps.length} steps
      </p>

      <div className="mt-3 space-y-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-start gap-2 text-xs">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-medium">
              {i + 1}
            </span>
            <div>
              <p>{step.description}</p>
              {step.affectedNotes.length > 0 && (
                <p className="mt-0.5 text-muted-foreground">
                  Notes: {step.affectedNotes.join(", ")}
                </p>
              )}
            </div>
            <span
              className={`ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] ${
                step.complexity === "simple"
                  ? "bg-success/10 text-success"
                  : step.complexity === "medium"
                    ? "bg-warning/10 text-warning"
                    : "bg-destructive/10 text-destructive"
              }`}
            >
              {step.complexity}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onApprove}
          className="flex-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Approve & Start
        </button>
        <button
          onClick={onModify}
          className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent"
        >
          Modify
        </button>
        <button
          onClick={onReject}
          className="rounded-md border border-border px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
