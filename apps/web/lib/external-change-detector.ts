/**
 * External Change Detector
 *
 * Watches for changes outside the Plugin 11 workspace — git pulls,
 * external edits, branch switches — and triggers re-ingestion.
 *
 * In dev mode: uses filesystem watching on .git/refs
 * In cloud mode: polls remote HEAD on interval
 */

export interface ExternalChange {
  id: string;
  type: "file_modified" | "file_added" | "file_deleted" | "branch_switch" | "git_pull";
  filePath?: string;
  description: string;
  detectedAt: Date;
}

export interface ChangeDetectionResult {
  changes: ExternalChange[];
  affectedNotes: { noteId: string; noteTitle: string }[];
  previousCommit: string;
  currentCommit: string;
}

type ChangeListener = (result: ChangeDetectionResult) => void;

export class ExternalChangeDetector {
  private listeners: Set<ChangeListener> = new Set();
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private lastKnownCommit: string | null = null;
  private watching = false;

  /**
   * Start watching for external changes.
   * In a real implementation, this would use chokidar/fs.watch on .git/refs
   * or poll the remote HEAD.
   */
  start(options: { mode: "dev" | "cloud"; pollIntervalMs?: number }) {
    if (this.watching) return;
    this.watching = true;

    const interval = options.pollIntervalMs ?? (options.mode === "dev" ? 5000 : 30000);

    this.pollInterval = setInterval(() => {
      this.checkForChanges();
    }, interval);
  }

  stop() {
    this.watching = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  onChangesDetected(listener: ChangeListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Check for changes. In production, this compares git commit hashes
   * and computes a diff. Here we provide the interface contract.
   */
  private async checkForChanges() {
    // Stub: In production, this would:
    // 1. Read current HEAD commit hash
    // 2. Compare with lastKnownCommit
    // 3. If different, compute diff
    // 4. Run through ImportPipeline scoped to changed files
    // 5. Notify listeners
  }

  /**
   * Manually trigger re-ingestion for detected changes.
   * Called from the ExternalChangeNotification component.
   */
  async triggerReIngestion(changes: ExternalChange[]): Promise<{
    affectedNotes: { noteId: string; noteTitle: string; changeType: string }[];
  }> {
    // Stub: In production, runs through the ImportPipeline
    // scoped to the changed files, updating affected notes.
    return {
      affectedNotes: [],
    };
  }

  private notifyListeners(result: ChangeDetectionResult) {
    this.listeners.forEach((listener) => listener(result));
  }
}

/**
 * Singleton detector instance for the workspace.
 */
let detectorInstance: ExternalChangeDetector | null = null;

export function getExternalChangeDetector(): ExternalChangeDetector {
  if (!detectorInstance) {
    detectorInstance = new ExternalChangeDetector();
  }
  return detectorInstance;
}

/**
 * Simulate external changes for demo/testing purposes.
 */
export function simulateExternalChanges(): ChangeDetectionResult {
  return {
    changes: [
      {
        id: "ec1",
        type: "file_modified",
        filePath: "src/auth/login.ts",
        description: "login.ts modified externally",
        detectedAt: new Date(),
      },
      {
        id: "ec2",
        type: "file_added",
        filePath: "src/auth/sso.ts",
        description: "New file: sso.ts",
        detectedAt: new Date(),
      },
      {
        id: "ec3",
        type: "file_deleted",
        filePath: "src/auth/legacy-auth.ts",
        description: "legacy-auth.ts removed",
        detectedAt: new Date(),
      },
    ],
    affectedNotes: [
      { noteId: "n1", noteTitle: "Login Flow" },
      { noteId: "n2", noteTitle: "SSO Integration" },
    ],
    previousCommit: "abc1234",
    currentCommit: "def5678",
  };
}
