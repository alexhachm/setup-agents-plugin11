"use client";

import { cn } from "@/lib/utils";

interface ActiveAgent {
  id: string;
  spawnedBy: string;
  spawnedByColor: string;
  status: "idle" | "thinking" | "writing" | "implementing" | "testing";
  currentTask: string | null;
}

interface AgentPresenceProps {
  agents: ActiveAgent[];
}

const STATUS_LABELS: Record<ActiveAgent["status"], string> = {
  idle: "Idle",
  thinking: "Thinking...",
  writing: "Writing...",
  implementing: "Implementing...",
  testing: "Testing...",
};

export function AgentPresence({ agents }: AgentPresenceProps) {
  if (agents.length === 0) return null;

  return (
    <div className="space-y-1">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className="flex items-center gap-2 rounded px-2 py-1.5 text-xs"
        >
          {/* AI avatar with user color ring */}
          <div
            className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20"
            style={{ boxShadow: `0 0 0 2px ${agent.spawnedByColor}` }}
          >
            <svg className="h-3.5 w-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1.07A7.003 7.003 0 0113 22h-2a7.003 7.003 0 01-6.93-6H3a1 1 0 110-2h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zm-2 10a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>

            {/* Status indicator */}
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background",
                agent.status === "idle"
                  ? "bg-muted-foreground"
                  : "animate-pulse bg-primary"
              )}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">AI Agent</span>
              <span className="text-muted-foreground">
                ({agent.spawnedBy})
              </span>
            </div>
            <div className="truncate text-[10px] text-muted-foreground">
              {agent.status !== "idle" && agent.currentTask
                ? agent.currentTask
                : STATUS_LABELS[agent.status]}
            </div>
          </div>

          {/* Status badge */}
          <span
            className={cn(
              "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium",
              agent.status === "idle"
                ? "bg-muted text-muted-foreground"
                : "bg-primary/15 text-primary"
            )}
          >
            {STATUS_LABELS[agent.status]}
          </span>
        </div>
      ))}
    </div>
  );
}
