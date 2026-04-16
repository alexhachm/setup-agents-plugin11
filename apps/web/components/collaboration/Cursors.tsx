"use client";

import type { PresenceUser } from "@plugin11/shared";

interface CursorsProps {
  users: PresenceUser[];
}

/**
 * Collaborative cursors overlay — rendered by TipTap's CollaborationCursor
 * extension. This component provides the cursor label rendering.
 *
 * The actual cursor rendering is handled by the Yjs awareness protocol
 * and the CollaborationCursor extension. This component is used for
 * additional cursor-related UI (like a user list overlay).
 */
export function Cursors({ users }: CursorsProps) {
  if (users.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Cursor rendering is handled by TipTap's CollaborationCursor extension */}
      {/* This overlay can show additional cursor-related UI */}
    </div>
  );
}

/** Render function for CollaborationCursor extension */
export function renderCursorLabel(user: { name: string; color: string }) {
  const cursor = document.createElement("span");
  cursor.classList.add("collaboration-cursor__caret");
  cursor.setAttribute("style", `border-color: ${user.color}`);

  const label = document.createElement("span");
  label.classList.add("collaboration-cursor__label");
  label.setAttribute("style", `background-color: ${user.color}`);
  label.insertBefore(document.createTextNode(user.name), null);
  cursor.insertBefore(label, null);

  return cursor;
}
