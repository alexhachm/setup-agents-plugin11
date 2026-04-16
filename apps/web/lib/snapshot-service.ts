/**
 * Snapshot Service
 *
 * Creates and manages note snapshots for version history.
 *
 * Snapshot triggers:
 * - "ai_change": Auto-snapshot before AI changes
 * - "timer": Auto-snapshot every 5 minutes if changes occurred
 * - "manual": User clicks save point
 *
 * Stores Yjs state vector as binary.
 * Generates description from recent changes.
 */

import type { SnapshotTrigger } from "@plugin11/shared";

export interface SnapshotData {
  id: string;
  noteId: string;
  trigger: SnapshotTrigger;
  description: string;
  createdById: string;
  createdAt: Date;
  yjsState: Uint8Array;
  metadata?: Record<string, unknown>;
}

export interface SnapshotCreateParams {
  noteId: string;
  trigger: SnapshotTrigger;
  description: string;
  createdById: string;
  yjsState: Uint8Array;
  metadata?: Record<string, unknown>;
}

const TIMER_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * SnapshotService manages creation and retrieval of note snapshots.
 */
export class SnapshotService {
  private timers = new Map<string, ReturnType<typeof setInterval>>();
  private dirtyNotes = new Set<string>();

  /**
   * Create a snapshot for a note.
   */
  async createSnapshot(params: SnapshotCreateParams): Promise<SnapshotData> {
    const snapshot: SnapshotData = {
      id: crypto.randomUUID(),
      noteId: params.noteId,
      trigger: params.trigger,
      description: params.description,
      createdById: params.createdById,
      createdAt: new Date(),
      yjsState: params.yjsState,
      metadata: params.metadata,
    };

    // Persist via API
    const response = await fetch("/api/snapshots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...snapshot,
        yjsState: Array.from(snapshot.yjsState),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create snapshot: ${response.status}`);
    }

    return snapshot;
  }

  /**
   * Create a snapshot before AI changes.
   */
  async snapshotBeforeAIChange(
    noteId: string,
    yjsState: Uint8Array,
    description?: string
  ): Promise<SnapshotData> {
    return this.createSnapshot({
      noteId,
      trigger: "ai_change",
      description: description || "Auto-saved before AI changes",
      createdById: "ai-engine",
      yjsState,
    });
  }

  /**
   * Create a manual snapshot.
   */
  async snapshotManual(
    noteId: string,
    yjsState: Uint8Array,
    createdById: string,
    description?: string
  ): Promise<SnapshotData> {
    return this.createSnapshot({
      noteId,
      trigger: "manual",
      description: description || "Manual save point",
      createdById,
      yjsState,
    });
  }

  /**
   * Mark a note as dirty (has changes since last snapshot).
   */
  markDirty(noteId: string): void {
    this.dirtyNotes.add(noteId);
  }

  /**
   * Start the timer-based auto-snapshot for a note.
   */
  startTimerSnapshot(
    noteId: string,
    getYjsState: () => Uint8Array,
    createdById: string
  ): void {
    if (this.timers.has(noteId)) return;

    const timer = setInterval(async () => {
      if (!this.dirtyNotes.has(noteId)) return;

      try {
        await this.createSnapshot({
          noteId,
          trigger: "timer",
          description: "Auto-saved (periodic)",
          createdById,
          yjsState: getYjsState(),
        });
        this.dirtyNotes.delete(noteId);
      } catch (err) {
        console.error(
          `[snapshot-service] Timer snapshot failed for ${noteId}:`,
          err
        );
      }
    }, TIMER_INTERVAL_MS);

    this.timers.set(noteId, timer);
  }

  /**
   * Stop the timer-based auto-snapshot for a note.
   */
  stopTimerSnapshot(noteId: string): void {
    const timer = this.timers.get(noteId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(noteId);
    }
  }

  /**
   * Stop all timers (cleanup on unmount).
   */
  destroy(): void {
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
    this.dirtyNotes.clear();
  }

  /**
   * Fetch snapshots for a note from the API.
   */
  async getSnapshots(noteId: string): Promise<SnapshotData[]> {
    const response = await fetch(`/api/snapshots?noteId=${noteId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch snapshots: ${response.status}`);
    }
    const data = await response.json();
    return (data.snapshots || []).map((s: SnapshotData & { yjsState: number[] }) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      yjsState: new Uint8Array(s.yjsState),
    }));
  }

  /**
   * Restore a note to a specific snapshot.
   */
  async restoreSnapshot(snapshotId: string): Promise<SnapshotData> {
    const response = await fetch(`/api/snapshots/${snapshotId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore" }),
    });
    if (!response.ok) {
      throw new Error(`Failed to restore snapshot: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Generate a description based on what changed.
   */
  static generateDescription(
    trigger: SnapshotTrigger,
    authorName: string,
    changedNoteCount?: number
  ): string {
    switch (trigger) {
      case "manual":
        return `${authorName} saved a checkpoint`;
      case "ai_change":
        return changedNoteCount && changedNoteCount > 1
          ? `AI Engine implemented ${changedNoteCount} changes`
          : `AI Engine made changes`;
      case "timer":
        return "Auto-saved (periodic)";
      case "auto":
        return `${authorName} edited`;
      default:
        return `${authorName} made changes`;
    }
  }
}
