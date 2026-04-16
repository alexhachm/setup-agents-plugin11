import * as fs from "fs";
import * as path from "path";
import type { CodeMapping, CodeMappingType } from "@plugin11/shared";

export interface DriftReport {
  noteId: string;
  filePath: string;
  driftType: "missing_file" | "content_mismatch" | "line_shift";
  detail: string;
}

export interface CodeChange {
  filePath: string;
  content: string;
  startLine?: number;
  endLine?: number;
}

export interface NoteUpdate {
  noteId: string;
  suggestedUpdate: string;
}

/**
 * CodeBridge — bidirectional translation between notes and code.
 *
 * - Note -> Code: Generates/updates code from note content changes
 * - Code -> Note: Presents code changes as note updates
 * - On-save reverse mapping: Code edits in Code view map back to notes
 * - Drift detection: compare note descriptions against actual code state
 */
export class CodeBridge {
  private mappings: Map<string, CodeMapping[]> = new Map();
  private projectDir: string;
  private fileHashes: Map<string, string> = new Map();

  constructor(projectDir?: string) {
    this.projectDir = projectDir || process.cwd();
  }

  /** Register code mappings for a note */
  setMappings(noteId: string, mappings: CodeMapping[]): void {
    this.mappings.set(noteId, mappings);
  }

  /** Get all code mappings for a note */
  getMappings(noteId: string): CodeMapping[] {
    return this.mappings.get(noteId) || [];
  }

  /** Add a single mapping */
  addMapping(
    noteId: string,
    filePath: string,
    mappingType: CodeMappingType,
    startLine?: number,
    endLine?: number
  ): void {
    const existing = this.getMappings(noteId);
    existing.push({
      noteId,
      filePath,
      startLine: startLine ?? null,
      endLine: endLine ?? null,
      mappingType,
    });
    this.mappings.set(noteId, existing);
  }

  /** Remove mappings for a note */
  removeMappings(noteId: string): void {
    this.mappings.delete(noteId);
  }

  /** Get all notes mapped to a specific file path */
  getNotesForFile(filePath: string): string[] {
    const noteIds: string[] = [];
    for (const [noteId, mappings] of this.mappings) {
      if (mappings.some((m) => m.filePath === filePath)) {
        noteIds.push(noteId);
      }
    }
    return noteIds;
  }

  /** Get all unique file paths mapped to any note */
  getAllMappedFiles(): string[] {
    const files = new Set<string>();
    for (const [, mappings] of this.mappings) {
      for (const m of mappings) {
        files.add(m.filePath);
      }
    }
    return Array.from(files);
  }

  /**
   * Translate note content changes to code changes.
   * Generates file contents based on note descriptions and existing mappings.
   */
  async noteToCode(
    noteId: string,
    noteContent: string
  ): Promise<CodeChange[]> {
    const mappings = this.getMappings(noteId);
    console.log(
      `[code-bridge] Translating note ${noteId} to code (${mappings.length} mappings)`
    );

    if (mappings.length === 0) {
      return [];
    }

    const changes: CodeChange[] = [];

    for (const mapping of mappings) {
      const absPath = path.resolve(this.projectDir, mapping.filePath);

      // Read the existing file if it exists
      let existingContent = "";
      try {
        if (fs.existsSync(absPath)) {
          existingContent = fs.readFileSync(absPath, "utf-8");
        }
      } catch {
        // File doesn't exist yet — that's fine
      }

      // For primary mappings, the note content describes what the file should contain.
      // The actual AI translation would happen here via the coordinator.
      // For now, we record the change request with the note content as context.
      changes.push({
        filePath: mapping.filePath,
        content: existingContent, // Placeholder — AI coordinator fills this
        startLine: mapping.startLine ?? undefined,
        endLine: mapping.endLine ?? undefined,
      });
    }

    return changes;
  }

  /**
   * Translate code changes back to note updates.
   * Fired on-save when code is edited in Code view.
   */
  async codeToNote(
    filePath: string,
    codeContent: string
  ): Promise<NoteUpdate[]> {
    const noteIds = this.getNotesForFile(filePath);
    console.log(
      `[code-bridge] Reverse mapping ${filePath} to ${noteIds.length} notes`
    );

    if (noteIds.length === 0) {
      return [];
    }

    const updates: NoteUpdate[] = [];

    for (const noteId of noteIds) {
      // The AI coordinator would generate a natural-language description
      // of what changed in the code. For now, we note the file was updated.
      updates.push({
        noteId,
        suggestedUpdate: `Code in ${filePath} was updated. Review note for consistency.`,
      });
    }

    return updates;
  }

  /**
   * Detect drift between notes and their mapped code files.
   * Compares stored hashes against current file state.
   */
  detectDrift(): DriftReport[] {
    const reports: DriftReport[] = [];

    for (const [noteId, mappings] of this.mappings) {
      for (const mapping of mappings) {
        const absPath = path.resolve(this.projectDir, mapping.filePath);

        // Check if file still exists
        if (!fs.existsSync(absPath)) {
          reports.push({
            noteId,
            filePath: mapping.filePath,
            driftType: "missing_file",
            detail: `File ${mapping.filePath} no longer exists`,
          });
          continue;
        }

        // Check content hash for changes
        try {
          const content = fs.readFileSync(absPath, "utf-8");
          const currentHash = this.simpleHash(content);
          const storedHash = this.fileHashes.get(mapping.filePath);

          if (storedHash && storedHash !== currentHash) {
            reports.push({
              noteId,
              filePath: mapping.filePath,
              driftType: "content_mismatch",
              detail: `File ${mapping.filePath} has changed since last sync`,
            });
          }

          // Update stored hash
          this.fileHashes.set(mapping.filePath, currentHash);
        } catch {
          // Can't read file — skip
        }

        // Check line range validity
        if (mapping.startLine !== null && mapping.endLine !== null) {
          try {
            const content = fs.readFileSync(absPath, "utf-8");
            const lineCount = content.split("\n").length;
            if (mapping.endLine > lineCount) {
              reports.push({
                noteId,
                filePath: mapping.filePath,
                driftType: "line_shift",
                detail: `Mapped lines ${mapping.startLine}-${mapping.endLine} exceed file length (${lineCount} lines)`,
              });
            }
          } catch {
            // Skip
          }
        }
      }
    }

    return reports;
  }

  /** Snapshot current file hashes for drift detection baseline */
  snapshotFileHashes(): void {
    for (const filePath of this.getAllMappedFiles()) {
      const absPath = path.resolve(this.projectDir, filePath);
      try {
        if (fs.existsSync(absPath)) {
          const content = fs.readFileSync(absPath, "utf-8");
          this.fileHashes.set(filePath, this.simpleHash(content));
        }
      } catch {
        // Skip unreadable files
      }
    }
  }

  /** Simple string hash for drift detection */
  private simpleHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return hash.toString(36);
  }

  /** Get all mappings as a flat array */
  getAllMappings(): CodeMapping[] {
    const all: CodeMapping[] = [];
    for (const [, mappings] of this.mappings) {
      all.push(...mappings);
    }
    return all;
  }

  /** Clear all mappings */
  clear(): void {
    this.mappings.clear();
    this.fileHashes.clear();
  }
}
