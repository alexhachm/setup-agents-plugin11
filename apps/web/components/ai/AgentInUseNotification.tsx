"use client";

import { useState } from "react";

interface AgentInUseNotificationProps {
  currentUser: string;
  currentTask: string;
  estimatedMinutesRemaining?: number;
  spawnCost: number;
  onWait: () => void;
  onSpawnSecond: () => void;
  onDismiss: () => void;
}

export function AgentInUseNotification({
  currentUser,
  currentTask,
  estimatedMinutesRemaining,
  spawnCost,
  onWait,
  onSpawnSecond,
  onDismiss,
}: AgentInUseNotificationProps) {
  const [spawning, setSpawning] = useState(false);

  const handleSpawn = () => {
    setSpawning(true);
    onSpawnSecond();
  };

  return (
    <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <svg className="h-5 w-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="text-sm font-semibold text-warning">Agent in Use</span>
        <button
          onClick={onDismiss}
          className="ml-auto rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="mb-3 space-y-1 text-xs">
        <p className="text-foreground">
          AI Engine is currently working on:
        </p>
        <p className="font-medium text-foreground">
          &ldquo;{currentTask}&rdquo;
          <span className="ml-1 text-muted-foreground">({currentUser})</span>
        </p>
        {estimatedMinutesRemaining != null && (
          <p className="text-muted-foreground">
            Estimated time remaining: ~{estimatedMinutesRemaining} min
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onWait}
          className="flex-1 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-accent"
        >
          Wait for current task
        </button>
        <button
          onClick={handleSpawn}
          disabled={spawning}
          className="flex-1 rounded-md bg-primary/15 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/25 disabled:opacity-50"
        >
          {spawning ? "Spawning..." : `Spawn second agent (+${spawnCost} credits)`}
        </button>
      </div>
    </div>
  );
}
