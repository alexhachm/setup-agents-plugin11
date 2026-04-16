import { parseRoomName } from "@plugin11/shared";

interface ConnectionContext {
  documentName: string;
  user: { userId: string; name: string | null };
}

/**
 * Hocuspocus lifecycle hooks for connection management.
 */

export function onConnect(context: ConnectionContext): void {
  const room = parseRoomName(context.documentName);
  console.log(
    `[collab] User ${context.user.userId} connected to ${room.type} document` +
      (room.noteId ? ` (note: ${room.noteId})` : "")
  );
}

export function onChange(context: ConnectionContext): void {
  const room = parseRoomName(context.documentName);
  console.log(
    `[collab] Document changed: ${context.documentName} by ${context.user.userId}` +
      (room.noteId ? ` (note: ${room.noteId})` : "")
  );
}

export function onDisconnect(context: ConnectionContext): void {
  console.log(
    `[collab] User ${context.user.userId} disconnected from ${context.documentName}`
  );
}
