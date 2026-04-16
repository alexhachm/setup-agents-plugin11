"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ActivityEntry {
  id: string;
  timestamp: Date;
  status: "pending" | "running" | "done" | "error";
  description: string;
}

interface ActivityLogProps {
  entries: ActivityEntry[];
  defaultCollapsed?: boolean;
}

const STATUS_ICONS: Record<ActivityEntry["status"], React.ReactNode> = {
  pending: (
    <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground" />
  ),
  running: (
    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
  ),
  done: (
    <svg className="h-3 w-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="h-3 w-3 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

export function ActivityLog({ entries, defaultCollapsed = false }: ActivityLogProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (entries.length === 0) return null;

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <svg
          className={cn("h-3 w-3 transition-transform", !collapsed && "rotate-90")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Activity Log
        {entries.some((e) => e.status === "running") && (
          <span className="ml-auto inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        )}
      </button>

      {!collapsed && (
        <div className="max-h-40 overflow-auto px-3 pb-2">
          <div className="space-y-1">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-start gap-2 rounded px-2 py-1 text-xs",
                  entry.status === "running" && "bg-primary/5"
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {STATUS_ICONS[entry.status]}
                </span>
                <span
                  className={cn(
                    "flex-1",
                    entry.status === "done" && "text-muted-foreground",
                    entry.status === "error" && "text-destructive"
                  )}
                >
                  {entry.description}
                </span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {entry.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
