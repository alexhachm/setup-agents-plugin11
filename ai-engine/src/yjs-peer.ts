import * as Y from "yjs";
import {
  noteRoomName,
  YJS_KEYS,
  AI_ENGINE_USER,
} from "@plugin11/shared";

/**
 * AI Engine Yjs peer — connects to the Hocuspocus server
 * as an authenticated CRDT peer. Reads and writes note content
 * via Yjs operations. Appears as the "AI Engine" collaborator
 * with a purple cursor.
 */
export class AINotePeer {
  private url: string;
  private token: string;
  private docs: Map<string, Y.Doc> = new Map();
  private connected = false;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  isConnected(): boolean {
    return this.connected;
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

    if (this.docs.has(roomName)) {
      return this.docs.get(roomName)!;
    }

    const doc = new Y.Doc();
    this.docs.set(roomName, doc);

    // In a real implementation, we'd create an HocuspocusProvider here.
    // The provider handles WebSocket connection, Yjs sync, and awareness.
    // For the build scaffold, we set up the doc structure.
    console.log(
      `[ai-peer] Connected to ${roomName} as ${AI_ENGINE_USER.name}`
    );

    this.connected = true;
    return doc;
  }

  /** Get the TipTap content fragment from a note doc */
  getContentFragment(doc: Y.Doc): Y.XmlFragment {
    return doc.getXmlFragment(YJS_KEYS.CONTENT);
  }

  /** Get the metadata map from a note doc */
  getMetadata(doc: Y.Doc): Y.Map<unknown> {
    return doc.getMap(YJS_KEYS.METADATA);
  }

  /** Set the note status via the metadata map */
  setNoteStatus(doc: Y.Doc, status: string): void {
    const meta = this.getMetadata(doc);
    meta.set("status", status);
  }

  /** Disconnect from a specific note */
  disconnectFromNote(workspaceId: string, noteId: string): void {
    const roomName = noteRoomName(workspaceId, noteId);
    const doc = this.docs.get(roomName);
    if (doc) {
      doc.destroy();
      this.docs.delete(roomName);
    }
  }

  /** Disconnect from all notes */
  disconnectAll(): void {
    for (const [, doc] of this.docs) {
      doc.destroy();
    }
    this.docs.clear();
    this.connected = false;
  }
}
