import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import {
  noteRoomName,
  YJS_KEYS,
  AI_ENGINE_USER,
} from "@plugin11/shared";
import type { NoteStatus, AIEngineStatus, BotTextSuggestion, AICorrection } from "@plugin11/shared";

export type AIStatus = "idle" | "thinking" | "writing";

interface NoteConnection {
  doc: Y.Doc;
  provider: HocuspocusProvider;
  unsubscribers: (() => void)[];
}

/**
 * AI Engine Yjs peer — connects to the Hocuspocus server
 * as an authenticated CRDT peer. Reads and writes note content
 * via Yjs operations. Appears as the "AI Engine" collaborator
 * with a purple cursor.
 */
export class AINotePeer {
  private url: string;
  private token: string;
  private connections: Map<string, NoteConnection> = new Map();
  private _connected = false;
  private _status: AIStatus = "idle";

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  isConnected(): boolean {
    return this._connected;
  }

  getStatus(): AIStatus {
    return this._status;
  }

  /**
   * Connect to a note document via the Hocuspocus server.
   * Returns the Y.Doc for reading/writing.
   */
  async connectToNote(
    workspaceId: string,
    noteId: string
  ): Promise<Y.Doc> {
    const roomName = noteRoomName(workspaceId, noteId);

    if (this.connections.has(roomName)) {
      return this.connections.get(roomName)!.doc;
    }

    const doc = new Y.Doc();

    const provider = new HocuspocusProvider({
      url: this.url,
      name: roomName,
      document: doc,
      token: this.token,
      connect: true,
      preserveConnection: true,
    });

    // Set awareness state — AI Engine as a purple collaborator
    this.setAwareness(provider, "idle");

    // Wait for sync
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timed out connecting to ${roomName}`));
      }, 10_000);

      provider.on("synced", () => {
        clearTimeout(timeout);
        resolve();
      });

      provider.on("authenticationFailed", () => {
        clearTimeout(timeout);
        reject(new Error(`Authentication failed for ${roomName}`));
      });
    });

    this.connections.set(roomName, { doc, provider, unsubscribers: [] });
    this._connected = true;

    console.log(
      `[ai-peer] Connected to ${roomName} as ${AI_ENGINE_USER.name}`
    );

    return doc;
  }

  /** Set awareness state for the AI Engine on a provider */
  private setAwareness(
    provider: HocuspocusProvider,
    status: AIStatus
  ): void {
    provider.setAwarenessField("user", {
      name: AI_ENGINE_USER.name,
      color: AI_ENGINE_USER.color,
      status,
    });
  }

  /** Update AI status across all connected providers */
  setStatus(status: AIStatus): void {
    this._status = status;
    for (const [, conn] of this.connections) {
      this.setAwareness(conn.provider, status);
    }
  }

  /** Get the TipTap content fragment from a note doc */
  getContentFragment(doc: Y.Doc): Y.XmlFragment {
    return doc.getXmlFragment(YJS_KEYS.CONTENT);
  }

  /** Get the metadata map from a note doc */
  getMetadata(doc: Y.Doc): Y.Map<unknown> {
    return doc.getMap(YJS_KEYS.METADATA);
  }

  /** Get the AI state map from a note doc */
  getAIState(doc: Y.Doc): Y.Map<unknown> {
    return doc.getMap(YJS_KEYS.AI_STATE);
  }

  /** Get the code mappings map from a note doc */
  getCodeMappings(doc: Y.Doc): Y.Map<unknown> {
    return doc.getMap(YJS_KEYS.CODE_MAPPINGS);
  }

  /** Get the bot text array from a note doc */
  getBotTextArray(doc: Y.Doc): Y.Array<unknown> {
    return doc.getArray(YJS_KEYS.BOT_TEXT);
  }

  /** Set the note status via the metadata map */
  setNoteStatus(doc: Y.Doc, status: NoteStatus): void {
    const meta = this.getMetadata(doc);
    meta.set("status", status);
  }

  /** Read the text content from the document's XML fragment */
  readContent(doc: Y.Doc): string {
    const fragment = this.getContentFragment(doc);
    return this.xmlFragmentToText(fragment);
  }

  /** Convert Y.XmlFragment to plain text */
  private xmlFragmentToText(fragment: Y.XmlFragment): string {
    const parts: string[] = [];
    for (let i = 0; i < fragment.length; i++) {
      const item = fragment.get(i);
      if (item instanceof Y.XmlText) {
        parts.push(item.toString());
      } else if (item instanceof Y.XmlElement) {
        parts.push(item.toString());
      }
    }
    return parts.join("\n");
  }

  /**
   * Write a bot text suggestion into the note.
   * Uses the BotText node type from editor-extensions.
   */
  writeBotText(doc: Y.Doc, suggestion: BotTextSuggestion): void {
    this.setStatus("writing");
    const botTextArray = this.getBotTextArray(doc);

    doc.transact(() => {
      botTextArray.push([
        {
          id: suggestion.id,
          noteId: suggestion.noteId,
          content: suggestion.content,
          position: suggestion.position,
          status: suggestion.status,
          createdAt: suggestion.createdAt.toISOString(),
        },
      ]);
    });

    this.setStatus("idle");
  }

  /**
   * Write a correction into the note's AI state.
   */
  writeCorrection(doc: Y.Doc, correction: AICorrection): void {
    this.setStatus("writing");
    const aiState = this.getAIState(doc);

    doc.transact(() => {
      const corrections = (aiState.get("corrections") as unknown[]) || [];
      aiState.set("corrections", [
        ...(corrections as object[]),
        {
          id: correction.id,
          noteId: correction.noteId,
          originalText: correction.originalText,
          correctedText: correction.correctedText,
          explanation: correction.explanation,
          sourceNoteId: correction.sourceNoteId,
          status: correction.status,
        },
      ]);
    });

    this.setStatus("idle");
  }

  /**
   * Write an AI annotation into the note's content.
   */
  writeAnnotation(
    doc: Y.Doc,
    annotation: { id: string; type: string; message: string; relatedNoteId?: string }
  ): void {
    this.setStatus("writing");
    const aiState = this.getAIState(doc);

    doc.transact(() => {
      const annotations = (aiState.get("annotations") as unknown[]) || [];
      aiState.set("annotations", [
        ...(annotations as object[]),
        annotation,
      ]);
    });

    this.setStatus("idle");
  }

  /**
   * Stream text into a note character by character for the "AI typing" effect.
   * Returns a promise that resolves when streaming is complete.
   */
  async streamText(
    doc: Y.Doc,
    text: string,
    delayMs = 30
  ): Promise<void> {
    this.setStatus("writing");
    const fragment = this.getContentFragment(doc);

    const textNode = new Y.XmlText();
    fragment.push([textNode]);

    for (let i = 0; i < text.length; i++) {
      textNode.insert(i, text[i]);
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    this.setStatus("idle");
  }

  /**
   * Subscribe to document changes. Fires the callback whenever
   * any user (including the AI) edits the note content.
   */
  onContentChange(
    doc: Y.Doc,
    callback: (event: Y.YXmlEvent, transaction: Y.Transaction) => void
  ): () => void {
    const fragment = this.getContentFragment(doc);
    fragment.observe(callback);
    return () => fragment.unobserve(callback);
  }

  /**
   * Subscribe to metadata changes (status, tags, etc.)
   */
  onMetadataChange(
    doc: Y.Doc,
    callback: (event: Y.YMapEvent<unknown>, transaction: Y.Transaction) => void
  ): () => void {
    const metadata = this.getMetadata(doc);
    metadata.observe(callback);
    return () => metadata.unobserve(callback);
  }

  /** Update the AI engine status in the note doc */
  setAIEngineState(doc: Y.Doc, state: AIEngineStatus): void {
    const aiState = this.getAIState(doc);
    doc.transact(() => {
      aiState.set("connected", state.connected);
      aiState.set("status", state.status);
      aiState.set("currentTask", state.currentTask);
      aiState.set("currentNoteId", state.currentNoteId);
    });
  }

  /** Disconnect from a specific note */
  disconnectFromNote(workspaceId: string, noteId: string): void {
    const roomName = noteRoomName(workspaceId, noteId);
    const conn = this.connections.get(roomName);
    if (conn) {
      for (const unsub of conn.unsubscribers) {
        unsub();
      }
      conn.provider.disconnect();
      conn.provider.destroy();
      conn.doc.destroy();
      this.connections.delete(roomName);
    }

    if (this.connections.size === 0) {
      this._connected = false;
    }
  }

  /** Disconnect from all notes */
  disconnectAll(): void {
    for (const [, conn] of this.connections) {
      for (const unsub of conn.unsubscribers) {
        unsub();
      }
      conn.provider.disconnect();
      conn.provider.destroy();
      conn.doc.destroy();
    }
    this.connections.clear();
    this._connected = false;
    this._status = "idle";
  }

  /** Get the number of active connections */
  connectionCount(): number {
    return this.connections.size;
  }

  /** Get all connected room names */
  connectedRooms(): string[] {
    return Array.from(this.connections.keys());
  }
}
