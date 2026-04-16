import type { CodeMapping } from "@plugin11/shared";

/**
 * TranslatedConsole — intercepts build/test/error output and translates
 * it to plain language. Links errors to specific notes.
 * Pushes status updates to the awareness/chat panel.
 */
export class TranslatedConsole {
  private active = false;
  private listeners: ((message: ConsoleMessage) => void)[] = [];
  private noteMappings: Map<string, CodeMapping[]> = new Map();
  private _phase: BuildPhase = "idle";

  isActive(): boolean {
    return this.active;
  }

  getPhase(): BuildPhase {
    return this._phase;
  }

  start(): void {
    this.active = true;
    this.setPhase("ideating");
    console.log("[translated-console] Started");
  }

  stop(): void {
    this.active = false;
    this.setPhase("idle");
    console.log("[translated-console] Stopped");
  }

  /** Set the current build phase and emit a status message */
  setPhase(phase: BuildPhase): void {
    this._phase = phase;
    if (phase !== "idle") {
      this.emit({
        type: "info",
        raw: `[phase] ${phase}`,
        translated: PHASE_LABELS[phase],
        relatedNoteId: null,
        timestamp: new Date(),
      });
    }
  }

  /** Register note-to-file mappings for error linking */
  setNoteMappings(noteId: string, mappings: CodeMapping[]): void {
    this.noteMappings.set(noteId, mappings);
  }

  /** Register a listener for translated console messages */
  onMessage(listener: (message: ConsoleMessage) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /** Translate a raw build/test output line to a user-friendly message */
  translate(rawOutput: string, context?: TranslationContext): ConsoleMessage {
    const type = classifyOutputType(rawOutput);
    const translated = translateOutput(rawOutput, type);
    const relatedNoteId = context?.noteId || this.findRelatedNote(rawOutput);

    return {
      type,
      raw: rawOutput,
      translated,
      relatedNoteId,
      timestamp: new Date(),
    };
  }

  /**
   * Process raw build output: translate it and emit to listeners.
   * This is the main entry point for intercepting stdout/stderr.
   */
  processOutput(rawOutput: string, context?: TranslationContext): void {
    if (!this.active) return;

    const lines = rawOutput.split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      const message = this.translate(line, context);
      this.emit(message);
    }
  }

  /** Emit a translated message to all listeners */
  emit(message: ConsoleMessage): void {
    for (const listener of this.listeners) {
      listener(message);
    }
  }

  /** Find a related note by matching file paths in error output */
  private findRelatedNote(output: string): string | null {
    for (const [noteId, mappings] of this.noteMappings) {
      for (const mapping of mappings) {
        if (output.includes(mapping.filePath)) {
          return noteId;
        }
      }
    }
    return null;
  }
}

// ── Types ──

export interface ConsoleMessage {
  type: "info" | "warning" | "error" | "success";
  raw: string;
  translated: string;
  relatedNoteId: string | null;
  timestamp: Date;
}

export interface TranslationContext {
  noteId?: string;
  notebookId?: string;
  domain?: string;
}

export type BuildPhase = "idle" | "ideating" | "implementing" | "testing" | "done";

const PHASE_LABELS: Record<BuildPhase, string> = {
  idle: "",
  ideating: "Thinking about the approach...",
  implementing: "Writing code...",
  testing: "Running tests...",
  done: "All done!",
};

// ── Output Classification ──

const ERROR_PATTERNS = [
  /error/i,
  /ERR!/i,
  /FATAL/i,
  /failed/i,
  /TypeError/i,
  /ReferenceError/i,
  /SyntaxError/i,
  /Cannot find/i,
  /ENOENT/i,
  /EACCES/i,
  /segmentation fault/i,
  /panic/i,
  /exception/i,
];

const WARNING_PATTERNS = [
  /warning/i,
  /WARN/i,
  /deprecated/i,
  /experimental/i,
];

const SUCCESS_PATTERNS = [
  /success/i,
  /compiled successfully/i,
  /build complete/i,
  /passed/i,
  /done/i,
  /✓/,
  /✔/,
];

function classifyOutputType(raw: string): ConsoleMessage["type"] {
  for (const pattern of ERROR_PATTERNS) {
    if (pattern.test(raw)) return "error";
  }
  for (const pattern of WARNING_PATTERNS) {
    if (pattern.test(raw)) return "warning";
  }
  for (const pattern of SUCCESS_PATTERNS) {
    if (pattern.test(raw)) return "success";
  }
  return "info";
}

// ── Output Translation ──

const TRANSLATION_RULES: { pattern: RegExp; translate: (match: RegExpMatchArray) => string }[] = [
  {
    pattern: /Cannot find module '([^']+)'/,
    translate: (m) => `Missing dependency: ${m[1]}. It needs to be installed.`,
  },
  {
    pattern: /Module not found.*'([^']+)'/,
    translate: (m) => `Can't find the file or package "${m[1]}". Check that it exists and the path is correct.`,
  },
  {
    pattern: /TypeError: (.+) is not a function/,
    translate: (m) => `Tried to call "${m[1]}" as a function, but it isn't one. Check the import or variable.`,
  },
  {
    pattern: /ReferenceError: (.+) is not defined/,
    translate: (m) => `"${m[1]}" doesn't exist in this scope. It might need to be imported or declared.`,
  },
  {
    pattern: /SyntaxError: (.+)/,
    translate: (m) => `Syntax problem: ${m[1]}. There's a typo or missing character in the code.`,
  },
  {
    pattern: /ENOENT.*'([^']+)'/,
    translate: (m) => `File not found: ${m[1]}. The file might have been moved or deleted.`,
  },
  {
    pattern: /EACCES.*'([^']+)'/,
    translate: (m) => `Permission denied for ${m[1]}. The file or directory isn't accessible.`,
  },
  {
    pattern: /(\d+) passing/,
    translate: (m) => `${m[1]} tests passed.`,
  },
  {
    pattern: /(\d+) failing/,
    translate: (m) => `${m[1]} tests failed and need attention.`,
  },
  {
    pattern: /Compiled successfully/i,
    translate: () => "Build succeeded — no errors.",
  },
  {
    pattern: /at (.+):(\d+):(\d+)/,
    translate: (m) => `In file ${m[1]}, line ${m[2]}.`,
  },
  {
    pattern: /TS(\d+): (.+)/,
    translate: (m) => `TypeScript error ${m[1]}: ${m[2]}`,
  },
];

function translateOutput(raw: string, type: ConsoleMessage["type"]): string {
  for (const rule of TRANSLATION_RULES) {
    const match = raw.match(rule.pattern);
    if (match) {
      return rule.translate(match);
    }
  }

  // Fall back to light cleanup for readability
  if (type === "error") {
    return `Error: ${raw.replace(/^\s*(error|ERR!)\s*/i, "").trim()}`;
  }
  if (type === "warning") {
    return `Warning: ${raw.replace(/^\s*(warning|WARN)\s*/i, "").trim()}`;
  }

  return raw;
}
