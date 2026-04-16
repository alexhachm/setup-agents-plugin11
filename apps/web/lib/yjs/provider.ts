import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import { noteRoomName, YJS_KEYS } from "@plugin11/shared";

const COLLAB_URL = process.env.NEXT_PUBLIC_COLLAB_URL || "ws://localhost:1234";

/**
 * Create a Hocuspocus provider for a specific note document.
 * This connects the browser to the collaboration server via WebSocket.
 */
export function createNoteProvider(
  workspaceId: string,
  noteId: string,
  token: string,
  doc?: Y.Doc
): { provider: HocuspocusProvider; doc: Y.Doc } {
  const ydoc = doc || new Y.Doc();
  const roomName = noteRoomName(workspaceId, noteId);

  const provider = new HocuspocusProvider({
    url: COLLAB_URL,
    name: roomName,
    document: ydoc,
    token,
    connect: true,
  });

  return { provider, doc: ydoc };
}

/** Get the TipTap content fragment from a Y.Doc */
export function getContentFragment(doc: Y.Doc): Y.XmlFragment {
  return doc.getXmlFragment(YJS_KEYS.CONTENT);
}

/** Get the metadata map from a Y.Doc */
export function getMetadataMap(doc: Y.Doc): Y.Map<unknown> {
  return doc.getMap(YJS_KEYS.METADATA);
}
