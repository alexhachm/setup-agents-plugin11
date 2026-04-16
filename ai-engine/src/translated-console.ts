/**
 * TranslatedConsole — intercepts build/test/error output and translates
 * it to plain language. Links errors to specific notes.
 * Pushes status updates to the awareness/chat panel.
 */
export class TranslatedConsole {
  private active = false;
  private listeners: ((message: ConsoleMessage) => void)[] = [];

  isActive(): boolean {
    return this.active;
  }

  start(): void {
    this.active = true;
    console.log("[translated-console] Started");
  }

  stop(): void {
    this.active = false;
    console.log("[translated-console] Stopped");
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
    // Stub: In production, this uses pattern matching and AI to translate
    // technical output into plain language
    return {
      type: "info",
      raw: rawOutput,
      translated: rawOutput,
      relatedNoteId: context?.noteId || null,
      timestamp: new Date(),
    };
  }

  /** Emit a translated message to all listeners */
  emit(message: ConsoleMessage): void {
    for (const listener of this.listeners) {
      listener(message);
    }
  }
}

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
