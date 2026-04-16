/**
 * Global keyboard shortcuts for Plugin 11.
 *
 * Registers listeners on the document and dispatches to callbacks.
 * All shortcuts use Cmd (Mac) / Ctrl (non-Mac) as the modifier.
 */

export interface ShortcutDefinition {
  key: string;
  description: string;
  modifiers: {
    meta?: boolean;   // Cmd on Mac, Ctrl on Windows/Linux
    shift?: boolean;
    alt?: boolean;
  };
  action: string;     // action identifier, mapped to callback
}

export const SHORTCUTS: ShortcutDefinition[] = [
  { key: "k", modifiers: { meta: true }, action: "command-palette", description: "Open command palette" },
  { key: "/", modifiers: { meta: true }, action: "toggle-chat", description: "Toggle chat panel" },
  { key: "b", modifiers: { meta: true }, action: "toggle-sidebar", description: "Toggle sidebar" },
  { key: ".", modifiers: { meta: true }, action: "toggle-view", description: "Toggle view (Notes/Code/Split)" },
  { key: "s", modifiers: { meta: true }, action: "manual-snapshot", description: "Manual snapshot" },
  { key: "z", modifiers: { meta: true }, action: "undo", description: "Undo (note-level)" },
  { key: "z", modifiers: { meta: true, shift: true }, action: "redo", description: "Redo" },
  { key: "?", modifiers: { meta: true }, action: "show-shortcuts", description: "Show keyboard shortcuts" },
];

type ShortcutHandler = (action: string) => void;

const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

function matchesShortcut(e: KeyboardEvent, shortcut: ShortcutDefinition): boolean {
  const metaKey = isMac ? e.metaKey : e.ctrlKey;

  if (shortcut.modifiers.meta && !metaKey) return false;
  if (shortcut.modifiers.shift && !e.shiftKey) return false;
  if (!shortcut.modifiers.shift && e.shiftKey) return false;
  if (shortcut.modifiers.alt && !e.altKey) return false;
  if (!shortcut.modifiers.alt && e.altKey) return false;

  return e.key.toLowerCase() === shortcut.key.toLowerCase();
}

/**
 * Register global keyboard shortcuts.
 * Returns an unsubscribe function.
 */
export function registerShortcuts(handler: ShortcutHandler): () => void {
  const listener = (e: KeyboardEvent) => {
    // Don't capture when typing in inputs/textareas (unless it's a meta shortcut)
    const target = e.target as HTMLElement;
    const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

    for (const shortcut of SHORTCUTS) {
      if (matchesShortcut(e, shortcut)) {
        // Allow meta shortcuts even in inputs (like Cmd+K, Cmd+S)
        if (isInput && !shortcut.modifiers.meta) continue;

        e.preventDefault();
        handler(shortcut.action);
        return;
      }
    }
  };

  document.addEventListener("keydown", listener);
  return () => document.removeEventListener("keydown", listener);
}

/**
 * Get the display string for a shortcut (e.g., "Cmd+K" or "Ctrl+K").
 */
export function formatShortcut(shortcut: ShortcutDefinition): string {
  const parts: string[] = [];
  if (shortcut.modifiers.meta) parts.push(isMac ? "\u2318" : "Ctrl");
  if (shortcut.modifiers.shift) parts.push(isMac ? "\u21E7" : "Shift");
  if (shortcut.modifiers.alt) parts.push(isMac ? "\u2325" : "Alt");
  parts.push(shortcut.key.toUpperCase());
  return parts.join(isMac ? "" : "+");
}
