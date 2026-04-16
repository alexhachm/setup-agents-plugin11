// Y.Doc structure definitions matching the architecture spec

/** Room name for a note document */
export function noteRoomName(workspaceId: string, noteId: string): string {
  return `workspace:${workspaceId}:note:${noteId}`;
}

/** Room name for workspace metadata */
export function workspaceMetaRoomName(workspaceId: string): string {
  return `workspace:${workspaceId}:meta`;
}

/** Parse a room name to extract IDs */
export function parseRoomName(roomName: string): {
  type: "note" | "meta";
  workspaceId: string;
  noteId?: string;
} {
  const parts = roomName.split(":");
  if (parts.length === 4 && parts[2] === "note") {
    return { type: "note", workspaceId: parts[1], noteId: parts[3] };
  }
  if (parts.length === 3 && parts[2] === "meta") {
    return { type: "meta", workspaceId: parts[1] };
  }
  throw new Error(`Invalid room name: ${roomName}`);
}

// Y.Doc key constants for note documents
export const YJS_KEYS = {
  /** TipTap rich text content - xmlFragment */
  CONTENT: "default",
  /** Note metadata map (status, tags, granularity) */
  METADATA: "metadata",
  /** Code mappings map */
  CODE_MAPPINGS: "codeMappings",
  /** Pending AI suggestions array */
  BOT_TEXT: "botText",
  /** Snapshot references array */
  SNAPSHOTS: "snapshots",
  /** AI engine state for this note */
  AI_STATE: "aiState",
} as const;

// Y.Doc key constants for workspace metadata
export const YJS_META_KEYS = {
  /** Notebook list with ordering */
  NOTEBOOKS: "notebooks",
  /** Workspace settings including user granularity level */
  SETTINGS: "settings",
  /** Online presence map */
  PRESENCE: "presence",
} as const;

/** Prefix for per-notebook metadata map keys */
export function notebookMetaKey(notebookId: string): string {
  return `notebook:${notebookId}`;
}
