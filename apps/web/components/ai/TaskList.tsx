"use client";

interface TaskItem {
  id: string;
  text: string;
  type: "missing" | "question" | "flag";
  resolved: boolean;
}

const DEMO_TASKS: TaskItem[] = [
  { id: "1", text: "Define error handling for payment failures", type: "missing", resolved: false },
  { id: "2", text: "How should session expiry work?", type: "question", resolved: false },
];

const TYPE_ICONS: Record<string, string> = {
  missing: "\u{26A0}\u{FE0F}",
  question: "\u{2753}",
  flag: "\u{1F6A9}",
};

/**
 * TaskList — suggestion/missing items task list shown in the chat panel.
 * Shows items the AI has identified as gaps in the specification.
 */
export function TaskList() {
  const tasks = DEMO_TASKS;

  if (tasks.length === 0) return null;

  return (
    <div className="border-t border-border px-3 py-2">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Open Items
      </h3>
      <div className="space-y-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent"
          >
            <span>{TYPE_ICONS[task.type]}</span>
            <span className={task.resolved ? "text-muted-foreground line-through" : ""}>
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
