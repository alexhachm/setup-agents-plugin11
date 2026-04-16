import type { CodeMapping } from "@plugin11/shared";

/**
 * CodeBridge — bidirectional translation between notes and code.
 *
 * - Note -> Code: Generates/updates code from note content changes
 * - Code -> Note: Presents code changes as note updates
 * - On-save reverse mapping: Code edits in Code view map back to notes
 * - Conflict resolution between note and code changes
 */
export class CodeBridge {
  private mappings: Map<string, CodeMapping[]> = new Map();

  /** Register code mappings for a note */
  setMappings(noteId: string, mappings: CodeMapping[]): void {
    this.mappings.set(noteId, mappings);
  }

  /** Get all code mappings for a note */
  getMappings(noteId: string): CodeMapping[] {
    return this.mappings.get(noteId) || [];
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

  /**
   * Translate note content changes to code changes.
   * In a full implementation, this uses the AI engine to generate code.
   */
  async noteToCode(
    noteId: string,
    noteContent: string
  ): Promise<{ filePath: string; content: string }[]> {
    const mappings = this.getMappings(noteId);
    console.log(
      `[code-bridge] Translating note ${noteId} to code (${mappings.length} mappings)`
    );

    // Stub: In production, this invokes the AI coordinator
    return [];
  }

  /**
   * Translate code changes back to note updates.
   * Fired on-save when code is edited in Code view.
   */
  async codeToNote(
    filePath: string,
    codeContent: string
  ): Promise<{ noteId: string; suggestedUpdate: string }[]> {
    const noteIds = this.getNotesForFile(filePath);
    console.log(
      `[code-bridge] Reverse mapping ${filePath} to ${noteIds.length} notes`
    );

    // Stub: In production, this invokes the AI coordinator
    return [];
  }

  /** Clear all mappings */
  clear(): void {
    this.mappings.clear();
  }
}
