"use client";

type ProgressStep = "ideating" | "implementing" | "testing" | "done";

interface ImplementationProgressProps {
  currentStep?: ProgressStep;
  taskName?: string;
}

const STEPS: { id: ProgressStep; label: string }[] = [
  { id: "ideating", label: "Ideating" },
  { id: "implementing", label: "Implementing" },
  { id: "testing", label: "Testing" },
  { id: "done", label: "Done" },
];

/**
 * ImplementationProgress — loading block shown in the originating note
 * during AI implementation. Shows step-by-step status feed.
 */
export function ImplementationProgress({
  currentStep = "implementing",
  taskName = "Component",
}: ImplementationProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="mx-4 my-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        {currentStep !== "done" && (
          <svg className="h-4 w-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        <span className="text-sm font-medium">
          Implementing: {taskName}
        </span>
      </div>

      {/* Step progress */}
      <div className="mt-3 flex items-center gap-1">
        {STEPS.map((step, i) => {
          const isComplete = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={step.id} className="flex items-center">
              <span
                className={`text-xs ${
                  isComplete
                    ? "text-success"
                    : isCurrent
                      ? "font-medium text-primary"
                      : "text-muted-foreground"
                }`}
              >
                {isComplete ? "\u2713 " : ""}
                {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <span className="mx-2 text-xs text-muted-foreground">&rarr;</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        <button className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20">
          Follow mode
        </button>
        <button className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-accent">
          Continue editing
        </button>
      </div>
    </div>
  );
}
